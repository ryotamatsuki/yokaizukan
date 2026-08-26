import fs from 'node:fs';
import assert from 'node:assert/strict';

const ANCHOR_PATH = 'public/data/ehime_municipality_anchors.json';
const HTML_PATH = 'ehime.html';
const DEBUG_JS_PATH = 'js/ehime-map-debug.js';
const DEBUG_CSS_PATH = 'css/ehime-map-debug.css';

const EXPECTED_CODES = [
  '38201', '38202', '38203', '38204', '38205', '38206', '38207', '38210', '38213', '38214',
  '38215', '38356', '38386', '38401', '38402', '38422', '38442', '38484', '38488', '38506'
];

const EXPECTED_NAMES = [
  '松山市', '今治市', '宇和島市', '八幡浜市', '新居浜市', '西条市', '大洲市', '伊予市', '四国中央市', '西予市',
  '東温市', '上島町', '久万高原町', '松前町', '砥部町', '内子町', '伊方町', '松野町', '鬼北町', '愛南町'
];

const anchors = JSON.parse(fs.readFileSync(ANCHOR_PATH, 'utf8'));
const html = fs.readFileSync(HTML_PATH, 'utf8');
const debugJs = fs.readFileSync(DEBUG_JS_PATH, 'utf8');
const debugCss = fs.readFileSync(DEBUG_CSS_PATH, 'utf8');

assert.equal(anchors.schemaVersion, 1, 'geographic anchor schemaVersion must be 1');
assert.equal(anchors.anchorSource?.role, 'calibration_only', 'municipal hall anchors must remain calibration-only');
assert.match(anchors.anchorSource?.officialVerificationTarget || '', /P05/, 'official P05 verification target must be documented');
assert.match(anchors.boundarySource?.endpointTemplate || '', /\{municipalityCode\}/, 'boundary endpoint must be municipality-code parameterized');
assert.match(anchors.boundarySource?.note || '', /N03/, 'N03 production replacement plan must be documented');

const municipalities = anchors.municipalities;
assert.ok(Array.isArray(municipalities), 'municipalities must be an array');
assert.equal(municipalities.length, 20, 'Ehime must have exactly 20 municipality calibration anchors');

const codes = municipalities.map((item) => item.code);
const names = municipalities.map((item) => item.name);
assert.deepEqual([...codes].sort(), [...EXPECTED_CODES].sort(), 'municipality code set must match Ehime 20 municipalities');
assert.deepEqual([...names].sort(), [...EXPECTED_NAMES].sort(), 'municipality name set must match Ehime 20 municipalities');
assert.equal(new Set(codes).size, 20, 'municipality codes must be unique');
assert.equal(new Set(names).size, 20, 'municipality names must be unique');

municipalities.forEach((item) => {
  assert.match(item.code, /^38\d{3}$/, `${item.name}: code must be a five-digit Ehime municipality code`);
  assert.ok(typeof item.office === 'string' && item.office.length > 0, `${item.name}: office name is required`);
  assert.ok(Number.isFinite(item.lat), `${item.name}: latitude must be finite`);
  assert.ok(Number.isFinite(item.lng), `${item.name}: longitude must be finite`);
  assert.ok(item.lat >= 32.8 && item.lat <= 34.4, `${item.name}: latitude is outside the Ehime calibration envelope`);
  assert.ok(item.lng >= 132.0 && item.lng <= 133.8, `${item.name}: longitude is outside the Ehime calibration envelope`);
});

assert.match(html, /css\/ehime-map-debug\.css/, 'ehime.html must load Phase A debug CSS');
assert.match(html, /js\/ehime-map-debug\.js/, 'ehime.html must load Phase A debug JS');
assert.match(debugJs, /mapDebug[^\n]*1/, 'debug renderer must be gated by mapDebug=1');
assert.match(debugJs, /preserveAspectRatio[^\n]*xMidYMid meet/, 'debug SVG must preserve aspect ratio');
assert.match(debugJs, /pointInFeatureCollection/, 'debug renderer must validate anchors against municipality polygons');
assert.match(debugJs, /anchorInside/, 'anchor polygon validation result must be exposed to the DOM');
assert.match(debugCss, /ehime-geo-debug/, 'debug stylesheet must contain geographic debug styles');

console.log('OK: Ehime Phase A geographic base contract validated (20 municipalities, debug-only wiring, common SVG projection contract).');
