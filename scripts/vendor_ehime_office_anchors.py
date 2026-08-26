#!/usr/bin/env python3
"""Vendor Ehime's 20 municipal main-office control points from MLIT P05 2022.

P05 is the latest MLIT National Land Numerical Information dataset for
municipal offices and public meeting facilities. Facility classification 1 is
the municipality main office (city/town/village hall). This script downloads
Ehime's P05 archive only during data maintenance, extracts exactly one main
headquarters point for each of the 20 current municipalities, and writes the
runtime-local calibration-anchor JSON used by Phase A.
"""

from __future__ import annotations

import hashlib
import io
import json
import sys
import urllib.request
import zipfile
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory

import shapefile

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "public/data/ehime_municipality_anchors.json"
SOURCE_URL = "https://nlftp.mlit.go.jp/ksj/gml/data/P05/P05-22/P05-22_38_GML.zip"
SOURCE_PAGE = "https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-P05-2022.html"
SOURCE_YEAR = 2022
SOURCE_REFERENCE_DATE = "2022-04"
PREFECTURE_CODE = "38"
MAIN_OFFICE_CLASS = "1"
MIN_ARCHIVE_BYTES = 50_000

EXPECTED = [
    ("38201", "松山市"),
    ("38202", "今治市"),
    ("38203", "宇和島市"),
    ("38204", "八幡浜市"),
    ("38205", "新居浜市"),
    ("38206", "西条市"),
    ("38207", "大洲市"),
    ("38210", "伊予市"),
    ("38213", "四国中央市"),
    ("38214", "西予市"),
    ("38215", "東温市"),
    ("38356", "上島町"),
    ("38386", "久万高原町"),
    ("38401", "松前町"),
    ("38402", "砥部町"),
    ("38422", "内子町"),
    ("38442", "伊方町"),
    ("38484", "松野町"),
    ("38488", "鬼北町"),
    ("38506", "愛南町"),
]


def download_archive() -> tuple[bytes, str]:
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "yokaizukan-geographic-base/1.0", "Accept": "application/zip,*/*;q=0.8"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        status = getattr(response, "status", 200)
        if status != 200:
            raise RuntimeError(f"P05 download returned HTTP {status}")
        payload = response.read()
    if len(payload) < MIN_ARCHIVE_BYTES:
        raise RuntimeError(f"P05 archive is unexpectedly small: {len(payload)} bytes")
    if not zipfile.is_zipfile(io.BytesIO(payload)):
        preview = payload[:120].decode("utf-8", errors="replace")
        raise RuntimeError(f"P05 response is not a ZIP archive; first bytes={preview!r}")
    return payload, hashlib.sha256(payload).hexdigest()


def normalize_code(value) -> str:
    text = str(value or "").strip()
    if text.endswith(".0"):
        text = text[:-2]
    return text.zfill(5)


def records_from_geojson(archive: zipfile.ZipFile, filename: str) -> list[dict]:
    raw = json.loads(archive.read(filename).decode("utf-8-sig"))
    records = []
    for feature in raw.get("features", []):
        props = feature.get("properties") or {}
        geometry = feature.get("geometry") or {}
        if geometry.get("type") != "Point":
            continue
        coordinates = geometry.get("coordinates") or []
        if len(coordinates) < 2:
            continue
        records.append({
            "code": normalize_code(props.get("P05_001")),
            "class": str(props.get("P05_002") or "").strip(),
            "office": str(props.get("P05_003") or "").strip(),
            "address": str(props.get("P05_004") or "").strip(),
            "lng": float(coordinates[0]),
            "lat": float(coordinates[1]),
        })
    return records


def records_from_shapefile(archive: zipfile.ZipFile, shp_name: str) -> list[dict]:
    stem = str(Path(shp_name).with_suffix(""))
    with TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for suffix in (".shp", ".shx", ".dbf"):
            member = next((name for name in archive.namelist() if str(Path(name).with_suffix("")) == stem and name.lower().endswith(suffix)), None)
            if member is None:
                raise RuntimeError(f"P05 shapefile is missing {suffix}")
            target = tmp_path / Path(member).name
            target.write_bytes(archive.read(member))
        reader = shapefile.Reader(str(tmp_path / Path(shp_name).name), encoding="cp932", encodingErrors="replace")
        fields = [field[0] for field in reader.fields[1:]]
        records = []
        for shape_record in reader.iterShapeRecords():
            props = dict(zip(fields, shape_record.record))
            if not shape_record.shape.points:
                continue
            lng, lat = shape_record.shape.points[0][:2]
            records.append({
                "code": normalize_code(props.get("P05_001")),
                "class": str(props.get("P05_002") or "").strip(),
                "office": str(props.get("P05_003") or "").strip(),
                "address": str(props.get("P05_004") or "").strip(),
                "lng": float(lng),
                "lat": float(lat),
            })
        return records


def load_records(payload: bytes) -> tuple[list[dict], str]:
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        geojsons = [name for name in archive.namelist() if name.lower().endswith((".geojson", ".json"))]
        if geojsons:
            preferred = next((name for name in geojsons if "P05-22_38" in Path(name).stem), geojsons[0])
            return records_from_geojson(archive, preferred), preferred
        shapefiles = [name for name in archive.namelist() if name.lower().endswith(".shp")]
        if not shapefiles:
            raise RuntimeError(f"P05 archive contains neither GeoJSON nor shapefile: {archive.namelist()}")
        preferred = next((name for name in shapefiles if "P05-22_38" in Path(name).stem), shapefiles[0])
        return records_from_shapefile(archive, preferred), preferred


def main() -> int:
    payload, archive_sha = download_archive()
    records, source_file = load_records(payload)
    expected_names = dict(EXPECTED)
    main_records: dict[str, list[dict]] = {code: [] for code, _ in EXPECTED}

    for record in records:
        code = record["code"]
        if code in main_records and record["class"] == MAIN_OFFICE_CLASS:
            main_records[code].append(record)

    problems = {code: len(items) for code, items in main_records.items() if len(items) != 1}
    if problems:
        raise RuntimeError(f"Expected exactly one P05 class=1 main office per municipality: {problems}")

    municipalities = []
    for code, name in EXPECTED:
        record = main_records[code][0]
        municipalities.append({
            "code": code,
            "name": name,
            "office": record["office"] or f"{name}役所・役場",
            "lat": round(record["lat"], 7),
            "lng": round(record["lng"], 7),
            "address": record["address"],
            "source": "MLIT_P05_2022",
        })

    output = {
        "schemaVersion": 2,
        "updatedAt": str(date.today()),
        "purpose": "愛媛県20市町の地理描画を校正するための役所・役場本庁アンカー。伝承地点の代替座標としては使用しない。",
        "boundarySource": {
            "provider": "国土交通省 国土数値情報",
            "dataset": "行政区域データ N03 2026年版",
            "runtimePath": "public/data/geo/ehime-municipalities.geojson",
            "note": "ブラウザ実行時はリポジトリ固定済みのN03 GeoJSONのみを使用し、外部境界APIへアクセスしない。",
        },
        "anchorSource": {
            "provider": "国土交通省 国土数値情報",
            "dataset": "市町村役場等及び公的集会施設 P05 2022年版",
            "referenceDate": SOURCE_REFERENCE_DATE,
            "facilityClass": MAIN_OFFICE_CLASS,
            "facilityClassMeaning": "本庁（市役所、区役所、町役場、村役場）",
            "sourcePage": SOURCE_PAGE,
            "sourceArchive": SOURCE_URL,
            "sourceArchiveSha256": archive_sha,
            "sourceArchiveBytes": len(payload),
            "sourceFile": source_file,
            "license": "CC BY 4.0",
            "role": "calibration_only",
            "note": "P05の最新公表版（2022年4月基準）から施設分類1を抽出した固定アンカー。公開用の妖怪・伝承座標とは分離する。",
        },
        "municipalities": municipalities,
    }

    if len(municipalities) != 20 or len({item["code"] for item in municipalities}) != 20:
        raise RuntimeError("P05 anchor hard gate failed: municipality count/uniqueness")

    OUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"P05 main-office anchors: {len(municipalities)}/20")
    print(f"archive sha256: {archive_sha}")
    print(f"source member: {source_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
