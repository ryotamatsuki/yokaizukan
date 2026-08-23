import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const data = read('public/data/ehime_research_v2.json');
const legends = read('public/data/legends.json').legends;
const locations = read('public/data/locations.json').locations;
const sources = read('public/data/sources.json').sources;
const evidence = read('public/data/evidence_check_table.json').legendEvidence;

const legendIds = new Set(legends.map((item) => item.id));
const sourceIds = new Set(sources.map((item) => item.id));
const sourceById = new Map(sources.map((item) => [item.id, item]));
const evidenceById = new Map(evidence.map((item) => [item.legendId, item]));
const locationById = new Map(locations.map((item) => [item.id, item]));
const legendById = new Map(legends.map((item) => [item.id, item]));
const statuses = new Set(['documented', 'insufficient', 'not_applicable']);
const traditionTypes = new Set([
  'festival_tradition',
  'literary_legend',
  'early_modern_yokai_book',
  'folklore_collection',
  'myth_or_local_text',
  'temple_legend',
  'calendar_custom'
]);
const items = data.items || [];

assert.equal(data.schemaVersion, 2, 'Ehime Research schemaVersion must be 2');
assert.equal(items.length, 11, 'Ehime Research v2 must contain exactly 11 items');
assert.equal(new Set(items.map((item) => item.id)).size, 11, 'Ehime Research v2 item IDs must be unique');
assert.deepEqual(items.map((item) => item.id).sort(), [...legendIds].sort(), 'Ehime Research v2 must cover the same 11 legends');

for (const item of items) {
  const legend = legendById.get(item.id);
  assert(legend, `${item.id}: unknown legend`);
  assert(!Object.hasOwn(item, 'needsFollowUp'), `${item.id}: needsFollowUp must not be duplicated in Research v2; evidence_check_table.json is the single source of truth`);
  assert(traditionTypes.has(item.traditionType), `${item.id}: invalid traditionType`);
  assert.equal(item.traditionType, legend.traditionLayer, `${item.id}: traditionType must match legend.traditionLayer`);

  assert(item.locality && typeof item.locality === 'object', `${item.id}: locality is required`);
  assert(typeof item.locality.region === 'string' && item.locality.region.trim(), `${item.id}: locality.region is required`);
  assert(typeof item.locality.municipality === 'string' && item.locality.municipality.trim(), `${item.id}: locality.municipality is required`);
  assert(Array.isArray(item.locality.specificPlaces), `${item.id}: locality.specificPlaces must be an array`);
  assert(typeof item.childLead === 'string' && item.childLead.trim(), `${item.id}: childLead is required`);
  assert(item.coverage && typeof item.coverage === 'object', `${item.id}: coverage is required`);
  for (const key of ['history', 'regionalRecords', 'claims']) {
    assert(statuses.has(item.coverage[key]), `${item.id}: invalid coverage.${key}`);
  }
  assert(Array.isArray(item.regionalRecords), `${item.id}: regionalRecords must be an array`);
  assert(Array.isArray(item.claims), `${item.id}: claims must be an array`);
  assert(Array.isArray(item.sourceIds) && item.sourceIds.length >= 1, `${item.id}: sourceIds required`);

  if (item.coverage.regionalRecords === 'documented') assert(item.regionalRecords.length >= 1, `${item.id}: documented regionalRecords requires entries`);
  if (item.coverage.regionalRecords === 'not_applicable') assert.equal(item.regionalRecords.length, 0, `${item.id}: not_applicable regionalRecords must be empty`);
  if (item.coverage.claims === 'documented') assert(item.claims.length >= 1, `${item.id}: documented claims requires entries`);

  const topSources = new Set(item.sourceIds);
  for (const sourceId of item.sourceIds) {
    assert(sourceIds.has(sourceId), `${item.id}: unknown source ${sourceId}`);
    const source = sourceById.get(sourceId);
    assert(typeof source?.url === 'string' && source.url.trim(), `${item.id}: source ${sourceId} requires a URL for direct navigation`);
  }

  for (const [index, record] of item.regionalRecords.entries()) {
    assert(typeof record.place === 'string' && record.place.trim(), `${item.id}.regionalRecords[${index}]: place required`);
    assert(typeof record.summary === 'string' && record.summary.trim(), `${item.id}.regionalRecords[${index}]: summary required`);
    assert(Array.isArray(record.sourceIds) && record.sourceIds.length >= 1, `${item.id}.regionalRecords[${index}]: sourceIds required`);
    for (const sourceId of record.sourceIds) {
      assert(sourceIds.has(sourceId), `${item.id}.regionalRecords[${index}]: unknown source ${sourceId}`);
      assert(topSources.has(sourceId), `${item.id}.regionalRecords[${index}]: nested source ${sourceId} missing from item.sourceIds`);
    }
  }

  for (const [index, claim] of item.claims.entries()) {
    assert(typeof claim.label === 'string' && claim.label.trim(), `${item.id}.claims[${index}]: label required`);
    assert(typeof claim.text === 'string' && claim.text.trim(), `${item.id}.claims[${index}]: text required`);
    assert(['A', 'B'].includes(claim.evidenceLevel), `${item.id}.claims[${index}]: evidenceLevel must be A/B`);
    assert(Array.isArray(claim.sourceIds) && claim.sourceIds.length >= 1, `${item.id}.claims[${index}]: sourceIds required`);
    for (const sourceId of claim.sourceIds) {
      assert(sourceIds.has(sourceId), `${item.id}.claims[${index}]: unknown source ${sourceId}`);
      assert(topSources.has(sourceId), `${item.id}.claims[${index}]: nested source ${sourceId} missing from item.sourceIds`);
    }
  }

  const audit = evidenceById.get(item.id);
  assert(audit, `${item.id}: evidence audit missing`);
  assert(Array.isArray(audit.needsFollowUp), `${item.id}: evidence audit needsFollowUp must be an array`);

  for (const sourceId of item.sourceIds) {
    assert((legend.sourceIds || []).includes(sourceId), `${item.id}: Research v2 source ${sourceId} is not declared by legend.sourceIds`);
  }

  const location = locationById.get(legend.locationId);
  assert(location, `${item.id}: location ${legend.locationId} missing`);
}

const sea = items.find((item) => item.id === 'uwakai_sea_mystery_cluster');
assert.equal(sea.locality.region, '南予', 'uwakai_sea_mystery_cluster: broad region must not label inland Ozu as 宇和海');
assert(sea.locality.municipality.includes('大洲市'), 'uwakai_sea_mystery_cluster: Ozu must remain explicit in locality');

const kihoku = items.find((item) => item.id === 'kihoku_oni_cluster');
assert.equal(kihoku.locality.municipality, '鬼北町・松野町', 'kihoku_oni_cluster: municipality must match current geography');
assert(kihoku.locality.specificPlaces.some((place) => place.includes('古鬼ヶ城山')), 'kihoku_oni_cluster: 古鬼ヶ城山 must be explicitly located');

console.log('Ehime Research v2: 11-item coverage, single-source follow-up, tradition type, locality, source links, nested source contract OK');
