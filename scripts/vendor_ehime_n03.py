#!/usr/bin/env python3
"""Vendor and validate Ehime municipality boundaries from official MLIT N03 2026.

The official Ehime N03 archive is downloaded only at build time. The script
extracts the bundled GeoJSON, dissolves it to the 20 current municipalities,
simplifies in JGD2011 / Japan Plane Rectangular CS IV (EPSG:6672), validates
all municipality-office calibration anchors, and commits compact WGS84
GeoJSON plus reproducibility metadata. Runtime code must use the vendored
outputs and must never fetch external municipality boundaries.
"""

from __future__ import annotations

import hashlib
import json
import math
import sys
import urllib.request
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory

from pyproj import Transformer
from shapely.geometry import Point, mapping, shape
from shapely.ops import transform, unary_union

ROOT = Path(__file__).resolve().parents[1]
ANCHORS_PATH = ROOT / "public/data/ehime_municipality_anchors.json"
OUT_DIR = ROOT / "public/data/geo"
OUT_GEOJSON = OUT_DIR / "ehime-municipalities.geojson"
OUT_META = OUT_DIR / "ehime-municipalities.meta.json"
SOURCE_URL = "https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2026/N03-20260101_38_GML.zip"
SOURCE_GEOJSON_BASENAME = "N03-20260101_38"
TARGET_CRS = "EPSG:6672"
CANDIDATE_TOLERANCES_M = (25.0, 50.0, 75.0, 100.0)
MAX_AREA_ERROR_PERCENT = 0.10
MIN_ARCHIVE_BYTES = 1_000_000


def count_vertices(geometry) -> int:
    if geometry.geom_type == "Polygon":
        return len(geometry.exterior.coords) + sum(len(ring.coords) for ring in geometry.interiors)
    if geometry.geom_type == "MultiPolygon":
        return sum(count_vertices(part) for part in geometry.geoms)
    raise ValueError(f"Unsupported geometry type: {geometry.geom_type}")


def polygon_component_count(geometry) -> int:
    if geometry.geom_type == "Polygon":
        return 1
    if geometry.geom_type == "MultiPolygon":
        return len(geometry.geoms)
    raise ValueError(f"Unsupported geometry type: {geometry.geom_type}")


def download_source(destination: Path) -> tuple[str, int]:
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "yokaizukan-geographic-base/1.0", "Accept": "application/zip,*/*;q=0.8"},
    )
    with urllib.request.urlopen(request, timeout=120) as response, destination.open("wb") as out:
        status = getattr(response, "status", 200)
        if status != 200:
            raise RuntimeError(f"N03 download returned HTTP {status}")
        while chunk := response.read(1024 * 1024):
            out.write(chunk)

    payload = destination.read_bytes()
    if len(payload) < MIN_ARCHIVE_BYTES:
        raise RuntimeError(f"N03 archive is unexpectedly small: {len(payload)} bytes")
    if not zipfile.is_zipfile(destination):
        preview = payload[:120].decode("utf-8", errors="replace")
        raise RuntimeError(f"N03 response is not a ZIP archive; first bytes={preview!r}")
    return hashlib.sha256(payload).hexdigest(), len(payload)


def load_source_geojson(archive_path: Path) -> tuple[dict, int, str]:
    with zipfile.ZipFile(archive_path) as archive:
        candidates = [
            name for name in archive.namelist()
            if name.lower().endswith(".geojson") and Path(name).stem.startswith(SOURCE_GEOJSON_BASENAME)
        ]
        if not candidates:
            candidates = [name for name in archive.namelist() if name.lower().endswith(".geojson")]
        if len(candidates) != 1:
            raise RuntimeError(f"Expected one N03 GeoJSON in archive, found {candidates}")
        source_name = candidates[0]
        raw = archive.read(source_name)
    return json.loads(raw.decode("utf-8-sig")), len(raw), source_name


def load_anchors() -> tuple[dict, list[dict]]:
    payload = json.loads(ANCHORS_PATH.read_text(encoding="utf-8"))
    municipalities = payload.get("municipalities", [])
    if len(municipalities) != 20:
        raise RuntimeError(f"Expected 20 municipality anchors, got {len(municipalities)}")
    return payload, municipalities


def dissolve_municipalities(source: dict, expected_codes: set[str]) -> dict[str, tuple[str, object]]:
    grouped: dict[str, list[object]] = defaultdict(list)
    names: dict[str, str] = {}
    for feature in source.get("features", []):
        props = feature.get("properties") or {}
        code = str(props.get("N03_007") or "")
        if code not in expected_codes:
            continue
        name = props.get("N03_004")
        if not name:
            raise RuntimeError(f"N03 feature {code} is missing N03_004 municipality name")
        names[code] = str(name)
        grouped[code].append(shape(feature["geometry"]))

    missing = sorted(expected_codes - grouped.keys())
    if missing:
        raise RuntimeError(f"N03 is missing municipality codes: {', '.join(missing)}")

    dissolved: dict[str, tuple[str, object]] = {}
    for code in sorted(expected_codes):
        geometry = unary_union(grouped[code])
        if geometry.geom_type not in {"Polygon", "MultiPolygon"}:
            raise RuntimeError(f"Unexpected dissolved geometry for {code}: {geometry.geom_type}")
        if not geometry.is_valid:
            geometry = geometry.buffer(0)
        if not geometry.is_valid:
            raise RuntimeError(f"Invalid dissolved geometry for {code}")
        dissolved[code] = (names[code], geometry)
    return dissolved


def select_simplification(dissolved: dict[str, tuple[str, object]], anchors: list[dict]):
    to_meters = Transformer.from_crs("EPSG:4326", TARGET_CRS, always_xy=True).transform
    to_wgs84 = Transformer.from_crs(TARGET_CRS, "EPSG:4326", always_xy=True).transform
    projected = {code: (name, transform(to_meters, geom)) for code, (name, geom) in dissolved.items()}
    anchor_by_code = {item["code"]: item for item in anchors}

    candidates: list[dict] = []
    selected = None
    for tolerance in CANDIDATE_TOLERANCES_M:
        simplified_projected = {}
        errors = []
        components_preserved = True
        anchors_inside = 0
        vertices = 0
        for code, (name, geom_m) in projected.items():
            simp_m = geom_m.simplify(tolerance, preserve_topology=True)
            if not simp_m.is_valid or polygon_component_count(simp_m) != polygon_component_count(geom_m):
                components_preserved = False
                break
            base_area = geom_m.area
            errors.append(abs(simp_m.area - base_area) / base_area * 100 if base_area else 0.0)
            anchor = anchor_by_code[code]
            anchor_point = transform(to_meters, Point(float(anchor["lng"]), float(anchor["lat"])))
            if simp_m.covers(anchor_point):
                anchors_inside += 1
            vertices += count_vertices(simp_m)
            simplified_projected[code] = (name, simp_m)

        record = {
            "toleranceMeters": tolerance,
            "vertexCount": vertices,
            "maxAreaErrorPercent": max(errors) if errors else math.inf,
            "meanAreaErrorPercent": sum(errors) / len(errors) if errors else math.inf,
            "componentsPreserved": components_preserved,
            "anchorsInside": anchors_inside,
        }
        candidates.append(record)
        if components_preserved and anchors_inside == 20 and record["maxAreaErrorPercent"] <= MAX_AREA_ERROR_PERCENT:
            selected = (tolerance, simplified_projected, record)

    if selected is None:
        raise RuntimeError(f"No simplification candidate passed hard gates: {candidates}")

    tolerance, simplified_projected, selected_record = selected
    simplified_wgs84 = {
        code: (name, transform(to_wgs84, geom_m))
        for code, (name, geom_m) in simplified_projected.items()
    }
    return tolerance, simplified_wgs84, projected, candidates, selected_record


def build_feature_collection(simplified: dict[str, tuple[str, object]], anchors: list[dict]) -> dict:
    anchor_names = {item["code"]: item["name"] for item in anchors}
    features = []
    for code in sorted(simplified):
        name, geometry = simplified[code]
        if name != anchor_names[code]:
            raise RuntimeError(f"Municipality name mismatch {code}: N03={name}, anchors={anchor_names[code]}")
        features.append({
            "type": "Feature",
            "properties": {"code": code, "name": name},
            "geometry": mapping(geometry),
        })
    return {"type": "FeatureCollection", "features": features}


def validate_final(collection: dict, anchors: list[dict]) -> int:
    by_code = {feature["properties"]["code"]: shape(feature["geometry"]) for feature in collection["features"]}
    inside = 0
    for anchor in anchors:
        geometry = by_code.get(anchor["code"])
        if geometry is None:
            raise RuntimeError(f"Missing final municipality {anchor['code']}")
        if not geometry.covers(Point(float(anchor["lng"]), float(anchor["lat"]))):
            raise RuntimeError(f"Office anchor is outside final municipality: {anchor['code']} {anchor['name']}")
        inside += 1
    return inside


def main() -> int:
    _, anchors = load_anchors()
    expected_codes = {item["code"] for item in anchors}

    with TemporaryDirectory() as tmp:
        archive_path = Path(tmp) / "N03-20260101_38_GML.zip"
        archive_sha, archive_bytes = download_source(archive_path)
        source, source_geojson_bytes, source_geojson_name = load_source_geojson(archive_path)

    dissolved = dissolve_municipalities(source, expected_codes)
    raw_vertices = sum(count_vertices(geom) for _, geom in dissolved.values())
    raw_components = sum(polygon_component_count(geom) for _, geom in dissolved.values())

    tolerance, simplified, projected, candidates, selected_record = select_simplification(dissolved, anchors)
    collection = build_feature_collection(simplified, anchors)
    inside = validate_final(collection, anchors)
    simplified_vertices = sum(count_vertices(geom) for _, geom in simplified.values())
    simplified_components = sum(polygon_component_count(geom) for _, geom in simplified.values())

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    geojson_text = json.dumps(collection, ensure_ascii=False, separators=(",", ":")) + "\n"
    OUT_GEOJSON.write_text(geojson_text, encoding="utf-8")

    metadata = {
        "schemaVersion": 1,
        "generatedAt": str(date.today()),
        "source": {
            "provider": "国土交通省 国土数値情報",
            "dataset": "行政区域データ N03 2026年版",
            "referenceDate": "2026-01-01",
            "prefecture": "愛媛県",
            "prefectureCode": "38",
            "url": SOURCE_URL,
            "archiveSha256": archive_sha,
            "archiveBytes": archive_bytes,
            "sourceGeoJson": source_geojson_name,
            "sourceGeoJsonBytes": source_geojson_bytes,
        },
        "processing": {
            "municipalityCount": len(collection["features"]),
            "dissolveKey": "N03_007",
            "municipalityNameKey": "N03_004",
            "simplificationCrs": TARGET_CRS,
            "simplificationMethod": "Shapely simplify(preserve_topology=True) after municipality dissolve",
            "candidateTolerancesMeters": list(CANDIDATE_TOLERANCES_M),
            "selectedToleranceMeters": tolerance,
            "maxAllowedAreaErrorPercent": MAX_AREA_ERROR_PERCENT,
            "candidateMetrics": candidates,
            "selectedMetrics": selected_record,
        },
        "geometry": {
            "rawDissolvedVertexCount": raw_vertices,
            "simplifiedVertexCount": simplified_vertices,
            "vertexReductionPercent": round((1 - simplified_vertices / raw_vertices) * 100, 6) if raw_vertices else 0,
            "rawPolygonComponentCount": raw_components,
            "simplifiedPolygonComponentCount": simplified_components,
            "componentsPreserved": raw_components == simplified_components,
            "outputGeoJsonBytes": len(geojson_text.encode("utf-8")),
        },
        "hardGate": {
            "municipalities": len(collection["features"]),
            "officeAnchors": len(anchors),
            "pointInPolygon": inside,
            "passed": len(collection["features"]) == 20 and len(anchors) == 20 and inside == 20 and raw_components == simplified_components,
        },
        "notes": [
            "役所・役場アンカーは地図校正専用で、伝承地点の代替座標ではない。",
            "GeoJSONは実行時外部取得を避けるためリポジトリへ固定する。",
            "公式配布ZIPのSHA-256は生成時に計算してmetadataへ固定する。",
        ],
    }
    OUT_META.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if not metadata["hardGate"]["passed"]:
        raise RuntimeError(f"Geographic hard gate failed: {metadata['hardGate']}")

    print(json.dumps(metadata["hardGate"], ensure_ascii=False))
    print(f"archive sha256: {archive_sha}")
    print(f"selected tolerance: {tolerance} m")
    print(f"vertices: {raw_vertices} -> {simplified_vertices}")
    print(f"output: {OUT_GEOJSON} ({metadata['geometry']['outputGeoJsonBytes']} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
