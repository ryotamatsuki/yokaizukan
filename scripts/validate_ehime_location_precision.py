#!/usr/bin/env python3
import json
import math
from pathlib import Path
from shapely.geometry import Point, shape

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))

legends = [x for x in load('public/data/legends.json')['legends'] if x.get('displayInList') is not False]
location_doc = load('public/data/locations.json')
locations = location_doc['locations']
ledger = load('public/data/ehime_location_evidence.json')['items']
geojson = load('public/data/geo/ehime-municipalities.geojson')
registered_sources = load('public/data/sources.json')['sources']
package = load('package.json')

assert len(legends) == 11, f'canonical legends must be 11, got {len(legends)}'
assert len(locations) == 11, f'locations must be 11, got {len(locations)}'
assert len(ledger) == 11, f'evidence ledger must be 11, got {len(ledger)}'

allowed_precision = {
    'exact', 'site', 'locality', 'municipality', 'regional',
    'broad_historical_area', 'marine', 'multiple_locations'
}
allowed_roles = {'exact', 'site_anchor', 'representative', 'multiple_site'}
municipality_names = {f['properties']['name'] for f in geojson['features']}
feature_by_name = {f['properties']['name']: shape(f['geometry']) for f in geojson['features']}
location_by_id = {x['id']: x for x in locations}
ledger_by_id = {x['legend_id']: x for x in ledger}
source_ids = {x['id'] for x in registered_sources}
assert len(location_by_id) == 11 and len(ledger_by_id) == 11, 'duplicate location/evidence keys'

def point_of(location):
    if isinstance(location.get('lat'), (int, float)) and isinstance(location.get('lng'), (int, float)):
        return location['lat'], location['lng'], location.get('coordinateRole')
    p = location.get('representativePoint') or {}
    return p.get('lat'), p.get('lng'), p.get('coordinateRole')

def valid_point(lat, lng):
    return isinstance(lat, (int, float)) and isinstance(lng, (int, float)) and math.isfinite(lat) and math.isfinite(lng) and -90 <= lat <= 90 and -180 <= lng <= 180

for legend in legends:
    lid = legend['id']
    assert legend['locationId'] in location_by_id, f'{lid}: missing location'
    location = location_by_id[legend['locationId']]
    evidence = ledger_by_id.get(lid)
    assert evidence, f'{lid}: missing Phase B evidence'
    precision = location.get('locationPrecision')
    assert precision in allowed_precision, f'{lid}: invalid precision {precision}'
    assert evidence.get('precision_class') == precision, f'{lid}: ledger/location precision mismatch'
    assert evidence.get('location_id') == location['id'], f'{lid}: ledger location mismatch'
    assert evidence.get('coordinate_role') == point_of(location)[2], f'{lid}: ledger/location coordinate role mismatch'
    assert evidence.get('evidence_summary'), f'{lid}: missing evidence summary'
    assert evidence.get('confidence') in {'high', 'medium', 'low'}, f'{lid}: invalid confidence'
    assert evidence.get('sources'), f'{lid}: no location sources'
    for src in evidence['sources']:
        url = str(src.get('url', ''))
        assert src.get('title') and url.startswith('https://'), f'{lid}: invalid source provenance'
        assert 'simsearch.cgi' not in url and 'ksearch.cgi' not in url, f'{lid}: discovery URL cannot be canonical evidence: {url}'

    for source_id in location.get('sourceIds', []):
        assert source_id in source_ids, f'{lid}: unregistered location source ID {source_id}'

    scope = location.get('geographicScope') or {}
    assert scope.get('type') == precision, f'{lid}: geographicScope.type mismatch'
    for municipality in scope.get('municipalities', []):
        assert municipality in municipality_names, f'{lid}: unknown municipality {municipality}'

    assert 'mapPosition' not in location, f'{lid}: legacy mapPosition must not be canonical Phase B data'
    lat, lng, role = point_of(location)
    assert valid_point(lat, lng), f'{lid}: missing/invalid geographic rendering point'
    assert role in allowed_roles, f'{lid}: invalid coordinate role {role}'

    if precision == 'site':
        assert role == 'site_anchor', f'{lid}: site must use site_anchor'
        municipalities = scope.get('municipalities', [])
        assert len(municipalities) == 1, f'{lid}: site must identify one municipality'
        assert feature_by_name[municipalities[0]].covers(Point(lng, lat)), f'{lid}: site anchor outside {municipalities[0]}'

    if precision in {'regional', 'broad_historical_area', 'marine', 'locality'} and role == 'representative':
        p = location.get('representativePoint') or {}
        assert p.get('cartographicOnly') is True, f'{lid}: non-site representative must be explicitly cartographicOnly'

    if precision == 'multiple_locations' and role == 'representative':
        p = location.get('representativePoint') or {}
        assert p.get('cartographicOnly') is True, f'{lid}: multiple-location representative must be explicitly cartographicOnly'

    if precision == 'marine':
        assert not any(geom.covers(Point(lng, lat)) for geom in feature_by_name.values()), f'{lid}: marine representative point is on municipal land'

    if precision == 'multiple_locations':
        assert len(scope.get('namedPlaces', [])) >= 2, f'{lid}: multiple_locations must name >=2 places'
        if location.get('locations'):
            for p in location['locations']:
                assert valid_point(p.get('lat'), p.get('lng')), f'{lid}: invalid multiple site point'
                assert p.get('coordinateRole') in {'site_anchor', 'multiple_site'}, f'{lid}: invalid multiple site role'

# Specific hard gates from the evidence audit.
assert location_by_id['ishizuchi']['representativePoint']['lat'] == 33.767778
assert location_by_id['ishizuchi']['representativePoint']['lng'] == 133.115
assert location_by_id['iyo_general']['locationPrecision'] == 'broad_historical_area'
assert location_by_id['uwakai']['locationPrecision'] == 'marine'
assert location_by_id['minamiuwa_ainan']['locationPrecision'] == 'regional'
assert location_by_id['nuwa_island']['locationPrecision'] == 'locality'
assert location_by_id['matsuyama_castle']['locationPrecision'] == 'multiple_locations'

# Production marker positioning must itself use the local Phase A N03-derived projection.
production = (ROOT / 'js/ehime.js').read_text(encoding='utf-8')
for token in [
    'geojson: "public/data/geo/ehime-municipalities.geojson"',
    'const projection = createProjection(state.geojson, MAP_VIEWBOX)',
    'marker.dataset.locationPrecision = location.locationPrecision',
    'marker.dataset.projectionSource = "local-n03-2026"',
    'markerLayer.dataset.projection = "phase-a-common"',
    'map.dataset.legendGeographyPhase = "B"'
]:
    assert token in production, f'production Phase B projection contract missing: {token}'
for legacy_token in ['const MAP_BOUNDS =', 'location?.mapPosition', 'projectMapPosition(']:
    assert legacy_token not in production, f'legacy geographic positioning remains in production path: {legacy_token}'

# Debug must retain the Phase A municipality/office + Phase B legend overlay.
debug_runtime = (ROOT / 'js/ehime-map-debug.js').read_text(encoding='utf-8')
for token in [
    "GEOJSON_PATH = 'public/data/geo/ehime-municipalities.geojson'",
    'ehime-hall-anchor',
    'ehime-legend-geo-anchor',
    'pointInFeatureCollection'
]:
    assert token in debug_runtime, f'geoDebug Phase B contract missing: {token}'

# The new desktop/smartphone Phase B regression must actually run under the repository test scripts.
phase_b_spec = 'tests/e2e/ehime-location-precision.spec.mjs'
assert phase_b_spec in package.get('scripts', {}).get('test:e2e:ehime', ''), 'Phase B spec missing from test:e2e:ehime'
assert phase_b_spec in package.get('scripts', {}).get('test:e2e', ''), 'Phase B spec missing from full test:e2e'

print('Ehime Phase B legend geography hard gate OK: 11/11 precision + evidence + registered provenance + production local-N03 projection + regression wiring')
