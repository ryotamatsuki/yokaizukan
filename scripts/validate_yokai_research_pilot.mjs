import fs from 'node:fs';

const BASE_PATH = 'public/data/yokai.json';
const PILOT_PATH = 'public/data/yokai_research_pilot.json';

const EXPECTED_IDS = [
  'kappa',
  'tengu',
  'oni',
  'yuki_onna',
  'zashiki_warashi',
  'nurikabe',
  'ittan_momen',
  'ushi_oni',
  'umibozu',
  'nekomata'
];

const ALLOWED_EVIDENCE_LEVELS = new Set(['A', 'B', 'APP']);
const ALLOWED_SOURCE_HOSTS = new Set([
  'www.ndl.go.jp',
  'www.nichibun.ac.jp',
  'www.aozora.gr.jp'
]);

const base = JSON.parse(fs.readFileSync(BASE_PATH, 'utf8'));
const pilot = JSON.parse(fs.readFileSync(PILOT_PATH, 'utf8'));
const errors = [];

const baseItems = Array.isArray(base.items) ? base.items : [];
const pilotItems = Array.isArray(pilot.items) ? pilot.items : [];
const sources = Array.isArray(pilot.sources) ? pilot.sources : [];

const baseIds = new Set(baseItems.map((item) => item.id));
const pilotIds = pilotItems.map((item) => item.id);
const pilotIdSet = new Set(pilotIds);

assert(pilot.schemaVersion === 1, 'schemaVersion must be 1');
assert(pilotIds.length === EXPECTED_IDS.length, `pilot must contain exactly ${EXPECTED_IDS.length} items`);
assert(pilotIdSet.size === pilotIds.length, 'pilot item IDs must be unique');

for (const id of EXPECTED_IDS) {
  assert(pilotIdSet.has(id), `missing pilot item: ${id}`);
  assert(baseIds.has(id), `pilot item does not exist in base yokai.json: ${id}`);
}
for (const id of pilotIds) {
  assert(EXPECTED_IDS.includes(id), `unexpected pilot item: ${id}`);
}

const sourceIds = sources.map((source) => source.id);
const sourceIdSet = new Set(sourceIds);
assert(sourceIdSet.size === sourceIds.length, 'source IDs must be unique');

for (const source of sources) {
  assertText(source.id, `source.id`);
  assertText(source.title, `${source.id}.title`);
  assertText(source.provider, `${source.id}.provider`);
  assertText(source.url, `${source.id}.url`);
  if (typeof source.url === 'string' && source.url) {
    try {
      const parsed = new URL(source.url);
      assert(parsed.protocol === 'https:', `${source.id}.url must use https`);
      assert(ALLOWED_SOURCE_HOSTS.has(parsed.hostname), `${source.id}.url uses unapproved source host: ${parsed.hostname}`);
    } catch {
      errors.push(`${source.id}.url is not a valid URL`);
    }
  }
}

for (const item of pilotItems) {
  const prefix = item.id || '(missing id)';
  assertText(item.historySummary, `${prefix}.historySummary`);
  assertText(item.evidenceNote, `${prefix}.evidenceNote`);
  assertText(item.editorial?.oneLine, `${prefix}.editorial.oneLine`);
  assertText(item.editorial?.childDescription, `${prefix}.editorial.childDescription`);
  assertText(item.editorial?.trivia, `${prefix}.editorial.trivia`);

  assert(Array.isArray(item.aliases) && item.aliases.length >= 1, `${prefix}.aliases must contain at least 1 value`);
  assert(Array.isArray(item.timeline) && item.timeline.length >= 2, `${prefix}.timeline must contain at least 2 entries`);
  assert(Array.isArray(item.abilities) && item.abilities.length >= 1, `${prefix}.abilities must contain at least 1 entry`);
  assert(Array.isArray(item.countermeasures), `${prefix}.countermeasures must be an array`);
  assert(Array.isArray(item.regionalVariants) && item.regionalVariants.length >= 2, `${prefix}.regionalVariants must contain at least 2 entries`);
  assert(Array.isArray(item.sourceIds) && item.sourceIds.length >= 1, `${prefix}.sourceIds must contain at least 1 source`);
  assert(Array.isArray(item.article?.body) && item.article.body.length >= 4, `${prefix}.article.body must contain at least 4 paragraphs`);
  assertText(item.article?.title, `${prefix}.article.title`);
  assertText(item.article?.subtitle, `${prefix}.article.subtitle`);

  assert(item.specialMove === undefined, `${prefix} must not mix app-only specialMove into research data`);
  assert(item.animationProfile === undefined, `${prefix} must not mix animationProfile into research data`);

  validateSourceRefs(item.sourceIds, `${prefix}.sourceIds`);
  validateClaims(item.abilities, `${prefix}.abilities`);
  validateClaims(item.countermeasures, `${prefix}.countermeasures`);

  for (const [index, entry] of item.timeline.entries()) {
    assertText(entry.label, `${prefix}.timeline[${index}].label`);
    assertText(entry.summary, `${prefix}.timeline[${index}].summary`);
    validateSourceRefs(entry.sourceIds, `${prefix}.timeline[${index}].sourceIds`);
  }

  for (const [index, variant] of item.regionalVariants.entries()) {
    assertText(variant.region, `${prefix}.regionalVariants[${index}].region`);
    assertText(variant.summary, `${prefix}.regionalVariants[${index}].summary`);
    validateSourceRefs(variant.sourceIds, `${prefix}.regionalVariants[${index}].sourceIds`);
  }
}

if (errors.length) {
  console.error('Yokai research pilot validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Yokai research pilot validation passed: ${pilotItems.length} items / ${sources.length} sources.`);

function validateClaims(claims, path) {
  if (!Array.isArray(claims)) {
    return;
  }
  claims.forEach((claim, index) => {
    assertText(claim.name, `${path}[${index}].name`);
    assertText(claim.description, `${path}[${index}].description`);
    assert(ALLOWED_EVIDENCE_LEVELS.has(claim.evidenceLevel), `${path}[${index}].evidenceLevel is invalid: ${claim.evidenceLevel}`);
    validateSourceRefs(claim.sourceIds, `${path}[${index}].sourceIds`);
  });
}

function validateSourceRefs(refs, path) {
  assert(Array.isArray(refs) && refs.length >= 1, `${path} must contain at least 1 source ID`);
  if (!Array.isArray(refs)) {
    return;
  }
  refs.forEach((sourceId) => {
    assert(sourceIdSet.has(sourceId), `${path} references missing source: ${sourceId}`);
  });
}

function assertText(value, path) {
  assert(typeof value === 'string' && value.trim().length > 0, `${path} must be a non-empty string`);
}

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}
