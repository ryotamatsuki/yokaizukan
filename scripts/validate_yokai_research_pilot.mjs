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

const BASE_ID_ALIASES = {
  yuki_onna: 'yuki-onna',
  zashiki_warashi: 'zashiki-warashi'
};

const CLAIM_EVIDENCE_LEVELS = new Set(['A', 'B']);
const SOURCE_ROLES = new Set(['evidence', 'discovery']);
const SOURCE_TYPES = new Set([
  'folklore_record',
  'institutional_exhibit',
  'modern_translation',
  'primary_text',
  'historical_image'
]);
const COVERAGE_STATUSES = new Set(['documented', 'insufficient', 'not_applicable']);
const ALLOWED_SOURCE_HOSTS = new Set([
  'www.ndl.go.jp',
  'www.nichibun.ac.jp',
  'www.aozora.gr.jp'
]);
const COVERAGE_FIELDS = ['timeline', 'abilities', 'countermeasures', 'regionalVariants'];

const base = JSON.parse(fs.readFileSync(BASE_PATH, 'utf8'));
const pilot = JSON.parse(fs.readFileSync(PILOT_PATH, 'utf8'));
const errors = [];

const baseItems = Array.isArray(base.items) ? base.items : [];
const pilotItems = Array.isArray(pilot.items) ? pilot.items : [];
const sources = Array.isArray(pilot.sources) ? pilot.sources : [];
const glossary = pilot.glossary && typeof pilot.glossary === 'object' ? pilot.glossary : {};

const baseIds = new Set(baseItems.map((item) => item.id));
const pilotIds = pilotItems.map((item) => item.id);
const pilotIdSet = new Set(pilotIds);

assert(pilot.schemaVersion === 2, 'schemaVersion must be 2');
assert(pilotIds.length === EXPECTED_IDS.length, `pilot must contain exactly ${EXPECTED_IDS.length} items`);
assert(pilotIdSet.size === pilotIds.length, 'pilot item IDs must be unique');

for (const id of EXPECTED_IDS) {
  assert(pilotIdSet.has(id), `missing pilot item: ${id}`);
  const baseId = toBaseCatalogId(id);
  assert(baseIds.has(baseId), `pilot item does not resolve to base yokai.json: ${id} -> ${baseId}`);
}
for (const id of pilotIds) {
  assert(EXPECTED_IDS.includes(id), `unexpected pilot item: ${id}`);
}

const resolvedPilotBaseIds = pilotIds.map(toBaseCatalogId);
assert(new Set(resolvedPilotBaseIds).size === resolvedPilotBaseIds.length, 'pilot IDs must resolve to unique base catalog IDs');

const sourceIds = sources.map((source) => source.id);
const sourceIdSet = new Set(sourceIds);
const sourceIndex = new Map(sources.map((source) => [source.id, source]));
assert(sourceIdSet.size === sourceIds.length, 'source IDs must be unique');

for (const [term, definition] of Object.entries(glossary)) {
  assertText(term, 'glossary term');
  assertText(definition, `glossary.${term}`);
}

for (const source of sources) {
  assertText(source.id, 'source.id');
  assertText(source.title, `${source.id}.title`);
  assertText(source.provider, `${source.id}.provider`);
  assertText(source.url, `${source.id}.url`);
  assert(SOURCE_ROLES.has(source.sourceRole), `${source.id}.sourceRole is invalid: ${source.sourceRole}`);
  assert(SOURCE_TYPES.has(source.sourceType), `${source.id}.sourceType is invalid: ${source.sourceType}`);

  if (typeof source.url === 'string' && source.url) {
    try {
      const parsed = new URL(source.url);
      assert(parsed.protocol === 'https:', `${source.id}.url must use https`);
      assert(ALLOWED_SOURCE_HOSTS.has(parsed.hostname), `${source.id}.url uses unapproved source host: ${parsed.hostname}`);

      if (source.sourceRole === 'evidence' && parsed.hostname === 'www.nichibun.ac.jp') {
        assert(parsed.pathname.endsWith('/youkai_card.cgi'), `${source.id} uses Nichibun evidence but is not a direct youkai_card URL`);
        assert(Boolean(parsed.searchParams.get('ID')), `${source.id} direct Nichibun card must have an ID query parameter`);
      }
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
  assert(Array.isArray(item.timeline), `${prefix}.timeline must be an array`);
  assert(Array.isArray(item.abilities), `${prefix}.abilities must be an array`);
  assert(Array.isArray(item.countermeasures), `${prefix}.countermeasures must be an array`);
  assert(Array.isArray(item.regionalVariants), `${prefix}.regionalVariants must be an array`);
  assert(Array.isArray(item.sourceIds) && item.sourceIds.length >= 1, `${prefix}.sourceIds must contain at least 1 source`);
  assert(Array.isArray(item.article?.body) && item.article.body.length >= 4, `${prefix}.article.body must contain at least 4 paragraphs`);
  assertText(item.article?.title, `${prefix}.article.title`);
  assertText(item.article?.subtitle, `${prefix}.article.subtitle`);

  assert(item.specialMove === undefined, `${prefix} must not mix app-only specialMove into research data`);
  assert(item.animationProfile === undefined, `${prefix} must not mix animationProfile into research data`);

  validateCoverage(item, prefix);
  validateEvidenceSourceRefs(item.sourceIds, `${prefix}.sourceIds`);
  validateClaims(item.abilities, `${prefix}.abilities`);
  validateClaims(item.countermeasures, `${prefix}.countermeasures`);

  for (const [index, entry] of item.timeline.entries()) {
    assertText(entry.label, `${prefix}.timeline[${index}].label`);
    assertText(entry.summary, `${prefix}.timeline[${index}].summary`);
    validateEvidenceSourceRefs(entry.sourceIds, `${prefix}.timeline[${index}].sourceIds`);
  }

  for (const [index, variant] of item.regionalVariants.entries()) {
    assertText(variant.region, `${prefix}.regionalVariants[${index}].region`);
    assertText(variant.summary, `${prefix}.regionalVariants[${index}].summary`);
    validateEvidenceSourceRefs(variant.sourceIds, `${prefix}.regionalVariants[${index}].sourceIds`);
  }

  if (item.editorial?.interpretation !== undefined) {
    assertText(item.editorial.interpretation, `${prefix}.editorial.interpretation`);
  }

  if (item.glossaryTerms !== undefined) {
    assert(Array.isArray(item.glossaryTerms), `${prefix}.glossaryTerms must be an array`);
    if (Array.isArray(item.glossaryTerms)) {
      for (const term of item.glossaryTerms) {
        assert(Object.hasOwn(glossary, term), `${prefix}.glossaryTerms references missing glossary term: ${term}`);
      }
    }
  }
}

if (errors.length) {
  console.error('Yokai research pilot validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Yokai research pilot validation passed: ${pilotItems.length} items / ${sources.length} evidence sources.`);

function toBaseCatalogId(researchId) {
  return BASE_ID_ALIASES[researchId] || researchId;
}

function validateCoverage(item, prefix) {
  assert(item.coverage && typeof item.coverage === 'object', `${prefix}.coverage must be an object`);
  if (!item.coverage || typeof item.coverage !== 'object') {
    return;
  }

  for (const field of COVERAGE_FIELDS) {
    const status = item.coverage[field];
    const collection = item[field];
    assert(COVERAGE_STATUSES.has(status), `${prefix}.coverage.${field} is invalid: ${status}`);
    if (!Array.isArray(collection)) {
      continue;
    }
    if (status === 'documented') {
      assert(collection.length >= 1, `${prefix}.${field} must have at least 1 entry when coverage is documented`);
    }
    if (status === 'not_applicable') {
      assert(collection.length === 0, `${prefix}.${field} must be empty when coverage is not_applicable`);
    }
  }
}

function validateClaims(claims, path) {
  if (!Array.isArray(claims)) {
    return;
  }
  claims.forEach((claim, index) => {
    assertText(claim.name, `${path}[${index}].name`);
    assertText(claim.description, `${path}[${index}].description`);
    assert(CLAIM_EVIDENCE_LEVELS.has(claim.evidenceLevel), `${path}[${index}].evidenceLevel must be A or B: ${claim.evidenceLevel}`);
    validateEvidenceSourceRefs(claim.sourceIds, `${path}[${index}].sourceIds`);
  });
}

function validateEvidenceSourceRefs(refs, path) {
  assert(Array.isArray(refs) && refs.length >= 1, `${path} must contain at least 1 source ID`);
  if (!Array.isArray(refs)) {
    return;
  }
  refs.forEach((sourceId) => {
    assert(sourceIdSet.has(sourceId), `${path} references missing source: ${sourceId}`);
    const source = sourceIndex.get(sourceId);
    if (source) {
      assert(source.sourceRole === 'evidence', `${path} must not use discovery-only source as evidence: ${sourceId}`);
    }
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
