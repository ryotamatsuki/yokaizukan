#!/usr/bin/env python3
"""CI hard gate for the committed Ehime Phase A geographic base."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from shapely.geometry import Point, shape

ROOT = Path(__file__).resolve().parents[1]
ANCHORS_PATH = ROOT / "public/data/ehime_municipality_anchors.json"
GEOJSON_PATH = ROOT / "public/data/geo/ehime-municipalities.geojson"
META_PATH = ROOT / "public/data/geo/ehime-municipalities.meta.json"

EXPECTED = {
    "38201": "松山市",
    "38202": "今治市",
    "38203": "宇和島市",
    "38204": "八幡浜市",
    "38205": "新居浜市",
    "38206": "西条市",
    "38207": "大洲市",
    "38210": "伊予市",
    "38213": "四国中央市",
    "38214": "西予市",
    "38215": "東温市",
    "38356": "上島町",
    "38386": "久万高原町",
    "38401": "松前町",
    "38402": "砥部町",
    "38422": "内子町",
    "38442": "伊方町",
    "38484": "松野町",
    "38488": "鬼北町",
    "38506": "愛南町",
}
ISLAND_MUNICIPALITIES = {"38201", "38202", "38203", "38356"}


def fail(message: str) -> None:
    raise AssertionError(message)


def component_count(geometry) -> int:
    if geometry.geom_type == "Polygon":
        return 1
    if geometry.geom_type == "MultiPolygon":
        return len(geometry.geoms)
    fail(f"unsupported geometry type: {geometry.geom_type}")
    return 0


def main() -> int:
    anchors = json.loads(ANCHORS_PATH.read_text(encoding="utf-8"))
    geojson = json.loads(GEOJSON_PATH.read_text(encoding="utf-8"))
    metadata = json.loads(META_PATH.read_text(encoding="utf-8"))

    municipalities = anchors.get("municipalities") or []
    features = geojson.get("features") or []
    if len(municipalities) != 20:
        fail(f"municipality office anchors must be 20, got {len(municipalities)}")
    if len(features) != 20:
        fail(f"municipality geometries must be 20, got {len(features)}")
    if anchors.get("anchorSource", {}).get("facilityClass") != "1":
        fail("office anchors must come from P05 facility class 1 (main office)")
    if "P05 2022" not in anchors.get("anchorSource", {}).get("dataset", ""):
        fail("office anchor source must document official P05 2022")
    if anchors.get("boundarySource", {}).get("runtimePath") != "public/data/geo/ehime-municipalities.geojson":
        fail("runtime boundary source must be the local N03 GeoJSON")

    feature_by_code = {}
    total_components = 0
    for feature in features:
        properties = feature.get("properties") or {}
        code = str(properties.get("code") or "")
        name = str(properties.get("name") or "")
        if code in feature_by_code:
            fail(f"duplicate municipality geometry code: {code}")
        if EXPECTED.get(code) != name:
            fail(f"unexpected municipality geometry: {code} {name}")
        geometry = shape(feature.get("geometry"))
        if geometry.geom_type not in {"Polygon", "MultiPolygon"}:
            fail(f"{code} {name}: geometry must be Polygon/MultiPolygon, got {geometry.geom_type}")
        if not geometry.is_valid:
            fail(f"{code} {name}: invalid geometry")
        components = component_count(geometry)
        if code in ISLAND_MUNICIPALITIES and components <= 1:
            fail(f"{code} {name}: island municipality must preserve multiple polygon components")
        total_components += components
        feature_by_code[code] = (name, geometry, components)

    if set(feature_by_code) != set(EXPECTED):
        fail("N03 municipality code set does not equal the current Ehime 20 municipalities")

    office_codes = set()
    inside = 0
    for office in municipalities:
        code = str(office.get("code") or "")
        name = str(office.get("name") or "")
        if code in office_codes:
            fail(f"duplicate office anchor code: {code}")
        office_codes.add(code)
        if EXPECTED.get(code) != name:
            fail(f"unexpected office anchor: {code} {name}")
        if office.get("source") != "MLIT_P05_2022":
            fail(f"{code} {name}: office anchor must be fixed from MLIT P05 2022")
        geometry_name, geometry, _ = feature_by_code[code]
        if geometry_name != name:
            fail(f"{code}: office/geometry municipality name mismatch")
        point = Point(float(office["lng"]), float(office["lat"]))
        if not geometry.covers(point):
            fail(f"{code} {name}: {office.get('office')} is outside its N03 municipality geometry")
        inside += 1

    if inside != 20:
        fail(f"point-in-polygon hard gate must be 20/20, got {inside}/20")

    hard_gate = metadata.get("hardGate") or {}
    geometry_meta = metadata.get("geometry") or {}
    if hard_gate.get("municipalities") != 20 or hard_gate.get("officeAnchors") != 20 or hard_gate.get("pointInPolygon") != 20 or hard_gate.get("passed") is not True:
        fail(f"vendoring metadata hard gate is not 20/20: {hard_gate}")
    if geometry_meta.get("componentsPreserved") is not True:
        fail("simplification metadata says polygon components were not preserved")
    if geometry_meta.get("rawPolygonComponentCount") != geometry_meta.get("simplifiedPolygonComponentCount"):
        fail("raw/simplified polygon component counts differ")
    if geometry_meta.get("simplifiedPolygonComponentCount") != total_components:
        fail("committed GeoJSON polygon component count does not match metadata")

    selected = metadata.get("processing", {}).get("selectedMetrics") or {}
    max_allowed = float(metadata.get("processing", {}).get("maxAllowedAreaErrorPercent", 0))
    if float(selected.get("maxAreaErrorPercent", 999)) > max_allowed:
        fail("selected simplification exceeds the documented maximum area error")
    if selected.get("anchorsInside") != 20 or selected.get("componentsPreserved") is not True:
        fail("selected simplification candidate did not preserve anchors/components")

    print(f"OK: Ehime geographic hard gate: municipalities=20, offices=20, point-in-polygon={inside}/20")
    print(f"OK: Polygon components preserved: {total_components} -> {total_components}")
    print(f"OK: Island MultiPolygon controls preserved: {', '.join(EXPECTED[code] for code in sorted(ISLAND_MUNICIPALITIES))}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise
