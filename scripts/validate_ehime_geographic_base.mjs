import fs from 'node:fs';
import assert from 'node:assert/strict';

const ANCHOR_PATH = 'public/data/ehime_municipality_anchors.json';
const GEOJSON_PATH = 'public/data/geo/ehime-municipalities.geojson';
const META_PATH = 'public/data/geo/ehime-municipalities.meta.json';
const HTML_PATH = 'ehime.html';
const DEBUG_JS_PATH = 'js/ehime-map-debug.js';
const DEBUG_CSS_PATH = 'css/ehime-map-debug.css';

const EXPECTED = new Map([
  ['38201', '松山市'], ['38202', '今治市'], ['38203', '宇和島市'], ['38204', '八幡浜市'],
  ['38205', '新居浜市'], ['38206', '西条市'], ['38207', '大洲市'], ['38210', '伊予市'],
  ['38213', '四国中央市'], ['38214', '西予市'], ['38215', '東温市'], ['38356', '上島町'],
  ['38386', '久万高原町'], ['38401', '松前町'], ['38402', '砥部町'], ['38422', '内子町'],
  ['38442', '伊方町'], ['38484', '松野町'], ['38488', '鬼北町'], ['38506', '愛南町']
]);

const anchors = JSON.parse(fs.readFileSync(ANCHOR_PATH, 'utf8'));
const geojson = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
const html = fs.readFileSync(HTML_PATH, 'utf8');
const debugJs = fs.readFileSync(DEBUG_JS_PATH, 'utf8');
const debugCss = fs.readFileSync(DEBUG_CSS_PATH, 'utf8');

assert.equal(anchors.schemaVersion, 2, 'geographic anchor schemaVersion must be 2');
assert.equal(anchors.anchorSource?.role, 'calibration_only', 'municipal hall anchors must remain calibration-only');
assert.equal(anchors.anchorSource?.facilityClass, '1', 'P05 main-office facility class must be 1');
assert.match(anchors.anchorSource?.dataset || '', /P05 2022/, 'official P05 2022 source must be documented');
assert.equal(anchors.boundarySource?.runtimePath, GEOJSON_PATH, 'runtime boundary path must point at the vendored N03 GeoJSON');
assert.match(anchors.boundarySource?.dataset || '', /N03 2026/, 'N03 2026 source must be documented');
assert.equal(meta.source?.dataset, '行政区域データ N03 2026年版', 'N03 metadata dataset must match');
assert.equal(meta.processing?.municipalityCount, 20, 'N03 metadata must contain 20 municipalities');
assert.equal(meta.hardGate?.pointInPolygon, 20, 'vendoring point-in-polygon gate must be 20/20');
assert.equal(meta.hardGate?.passed, true, 'vendoring hard gate must pass');
assert.equal(meta.geometry?.componentsPreserved, true, 'island/polygon components must be preserved by simplification');
assert.equal(meta.geometry?.rawPolygonComponentCount, meta.geometry?.simplifiedPolygonComponentCount, 'raw and simplified polygon component counts must match');
assert.ok(meta.processing?.selectedMetrics?.maxAreaErrorPercent <= meta.processing?.maxAllowedAreaErrorPercent, 'selected simplification must remain inside the area-error gate');

const municipalities = anchors.municipalities;
const features = geojson.features;
assert.ok(Array.isArray(municipalities), 'municipalities must be an array');
assert.ok(Array.isArray(features), 'GeoJSON features must be an array');
assert.equal(municipalities.length, 20, 'Ehime must have exactly 20 municipality calibration anchors');
assert.equal(features.length, 20, 'Ehime local N03 must have exactly 20 municipality geometries');

const officeByCode = new Map(municipalities.map((item) => [item.code, item]));
const featureByCode = new Map(features.map((feature) => [String(feature.properties?.code ?? ''), feature]));
assert.equal(officeByCode.size, 20, 'municipality codes must be unique in office anchors');
assert.equal(featureByCode.size, 20, 'municipality codes must be unique in N03 geometry');
assert.deepEqual([...officeByCode.keys()].sort(), [...EXPECTED.keys()].sort(), 'office code set must match Ehime 20 municipalities');
assert.deepEqual([...featureByCode.keys()].sort(), [...EXPECTED.keys()].sort(), 'N03 code set must match Ehime 20 municipalities');

let insideCount = 0;
for (const [code, expectedName] of EXPECTED) {
  const office = officeByCode.get(code);
  const feature = featureByCode.get(code);
  assert.equal(office?.name, expectedName, `${code}: office municipality name mismatch`);
  assert.equal(feature?.properties?.name, expectedName, `${code}: N03 municipality name mismatch`);
  assert.equal(office?.source, 'MLIT_P05_2022', `${expectedName}: office must be fixed from MLIT P05 2022`);
  assert.ok(typeof office.office === 'string' && office.office.length > 0, `${expectedName}: office name is required`);
  assert.ok(Number.isFinite(office.lat) && Number.isFinite(office.lng), `${expectedName}: office coordinates must be finite`);
  assert.ok(['Polygon', 'MultiPolygon'].includes(feature.geometry?.type), `${expectedName}: geometry must be Polygon/MultiPolygon`);
  assert.equal(pointInGeometry([office.lng, office.lat], feature.geometry), true, `${expectedName}: P05 main office must lie inside its N03 geometry`);
  insideCount += 1;
}
assert.equal(insideCount, 20, 'point-in-polygon hard gate must be 20/20');

assert.match(html, /css\/ehime-map-debug\.css/, 'ehime.html must load Phase A debug CSS');
assert.match(html, /js\/ehime-map-debug\.js/, 'ehime.html must load Phase A debug JS');
assert.match(debugJs, /mapDebug[^\n]*1/, 'debug renderer must support mapDebug=1');
assert.match(debugJs, /geoDebug[^\n]*1/, 'debug renderer must support geoDebug=1');
assert.match(debugJs, /public\/data\/geo\/ehime-municipalities\.geojson/, 'debug renderer must load the local N03 GeoJSON');
assert.doesNotMatch(debugJs, /geolonia\.github\.io|nlftp\.mlit\.go\.jp/, 'runtime debug renderer must not fetch external geographic boundaries');
assert.match(debugJs, /projectPoint/, 'polygon and marker projection must share projectPoint');
assert.match(debugJs, /preserveAspectRatio[^\n]*xMidYMid meet/, 'debug SVG must preserve aspect ratio');
assert.match(debugJs, /pointInFeatureCollection/, 'debug renderer must validate anchors against municipality polygons');
assert.match(debugJs, /anchorInside/, 'anchor polygon validation result must be exposed to the DOM');
assert.match(debugCss, /ehime-geo-debug/, 'debug stylesheet must contain geographic debug styles');

console.log(`OK: Ehime Phase A static contract validated (municipalities=20, P05 offices=20, point-in-polygon=${insideCount}/20, local N03 runtime source).`);

function pointInGeometry(point, geometry) {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  return false;
}

function pointInPolygon(point, polygon) {
  if (!polygon?.length || !pointInRing(point, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => pointInRing(point, hole));
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}
