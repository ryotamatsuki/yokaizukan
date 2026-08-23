import fs from 'node:fs';

const BASE_PATH = 'public/data/yokai.json';
const PILOT_PATH = 'public/data/yokai_research_pilot.json';
const COMMON_PATH = 'public/data/yokai_research_common_sources.json';
const EXPANSION_FILES = [1, 2, 3, 4, 5].map((n) => `public/data/yokai_research_expansion_0${n}.json`);
const EXPECTED_BATCHES = [
  ['rokurokubi','karakasa-kozo','chochin-obake','gashadokuro','karasu-tengu','hitotsume-kozo','bakeneko','kitsunebi'],
  ['bake-danuki','akaname','azuki-arai','ningyo','wanyudo','kamaitachi','kodama','yamanba'],
  ['oonyudo','tsuchigumo','nue','hitodama','tofu-kozo','hyakki-yagyo','mokumokuren','nuppeppo'],
  ['shiro_uneri','fumikuruma_yohi','koto_furunushi','kaichigo','abura_sumashi','sunekosuri','sunakake_baba','konaki_jiji'],
  ['betobeto_san','okuri_inu','enenra','ame_onna','kamikiri','ubume','hyosube','daidarabotchi']
];

const BASE_ID_ALIASES = { yuki_onna: 'yuki-onna', zashiki_warashi: 'zashiki-warashi' };
const CLAIM_EVIDENCE_LEVELS = new Set(['A', 'B']);
const SOURCE_ROLES = new Set(['evidence', 'discovery']);
const SOURCE_TYPES = new Set(['folklore_record','institutional_exhibit','modern_translation','primary_text','historical_image']);
const COVERAGE_STATUSES = new Set(['documented', 'insufficient', 'not_applicable']);
const ALLOWED_SOURCE_HOSTS = new Set(['www.ndl.go.jp','www.nichibun.ac.jp','www.aozora.gr.jp']);
const COVERAGE_FIELDS = ['timeline','abilities','countermeasures','regionalVariants'];

const base = readJson(BASE_PATH);
const pilot = readJson(PILOT_PATH);
const common = readJson(COMMON_PATH);
const expansions = EXPANSION_FILES.map(readJson);
const errors = [];

const baseItems = Array.isArray(base.items) ? base.items : [];
const baseIds = new Set(baseItems.map((item) => item.id));
const pilotItems = Array.isArray(pilot.items) ? pilot.items : [];
const expansionItems = expansions.flatMap((payload) => Array.isArray(payload.items) ? payload.items : []);
const allItems = [...pilotItems, ...expansionItems];
const pilotSources = Array.isArray(pilot.sources) ? pilot.sources : [];
const commonSources = Array.isArray(common.sources) ? common.sources : [];
const expansionSources = expansions.flatMap((payload) => Array.isArray(payload.sources) ? payload.sources : []);
const allSourceDefinitions = [...pilotSources, ...commonSources, ...expansionSources];
const glossary = Object.assign({}, pilot.glossary || {}, common.glossary || {}, ...expansions.map((payload) => payload.glossary || {}));

assert(common.schemaVersion === 2, 'common sources: schemaVersion must be 2');
assert(Array.isArray(common.items) && common.items.length === 0, 'common sources must have items: []');

const pilotSourceIds = new Set(pilotSources.map((source) => source.id));
const commonSourceIds = new Set(commonSources.map((source) => source.id));
const commonSourceIndex = new Map(commonSources.map((source) => [source.id, source]));
assert(commonSourceIds.size === commonSources.length, 'common source IDs must be unique');

for (const [index, payload] of expansions.entries()) {
  const batchNo = index + 1;
  assert(payload.schemaVersion === 2, `batch ${batchNo}: schemaVersion must be 2`);
  assert(payload.batch === batchNo, `batch ${batchNo}: batch field must be ${batchNo}`);
  const items = Array.isArray(payload.items) ? payload.items : [];
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const ids = items.map((item) => item.id);
  const expected = EXPECTED_BATCHES[index];
  const batchSourceIds = new Set(sources.map((source) => source.id));
  assert(batchSourceIds.size === sources.length, `batch ${batchNo}: source IDs must be unique within the batch`);

  ids.forEach((id) => assert(expected.includes(id), `batch ${batchNo}: unexpected item ${id}`));
  if (ids.length > 0) {
    assert(ids.length === expected.length, `batch ${batchNo}: once populated, batch must contain exactly ${expected.length} items`);
    expected.forEach((id) => assert(ids.includes(id), `batch ${batchNo}: missing item ${id}`));
  }

  for (const source of sources) {
    const commonSource = commonSourceIndex.get(source.id);
    if (commonSource) {
      assert(
        stableStringify(source) === stableStringify(commonSource),
        `batch ${batchNo}: common source mirror ${source.id} must exactly match ${COMMON_PATH}`
      );
    }
  }

  for (const item of items) {
    for (const sourceId of item.sourceIds || []) {
      assert(
        pilotSourceIds.has(sourceId) || commonSourceIds.has(sourceId) || batchSourceIds.has(sourceId),
        `batch ${batchNo}: ${item.id}.sourceIds references cross-batch source ${sourceId}; expansion items may use only pilot/common sources or sources from their own batch`
      );
    }
  }
}

const researchIds = allItems.map((item) => item.id);
assert(new Set(researchIds).size === researchIds.length, 'research item IDs must be unique across pilot and expansions');
for (const item of allItems) {
  const baseId = toBaseCatalogId(item.id);
  assert(baseIds.has(baseId), `research item does not resolve to base yokai.json: ${item.id} -> ${baseId}`);
}
const resolvedIds = researchIds.map(toBaseCatalogId);
assert(new Set(resolvedIds).size === resolvedIds.length, 'research IDs must resolve to unique base catalog IDs');

const sourceIndex = new Map();
for (const source of allSourceDefinitions) {
  const existing = sourceIndex.get(source.id);
  if (!existing) {
    sourceIndex.set(source.id, source);
    continue;
  }
  const commonSource = commonSourceIndex.get(source.id);
  assert(
    Boolean(commonSource) && stableStringify(source) === stableStringify(commonSource) && stableStringify(existing) === stableStringify(commonSource),
    `source ID ${source.id} is duplicated outside an identical common-source mirror`
  );
}
const sourceIdSet = new Set(sourceIndex.keys());
const allSources = [...sourceIndex.values()];

for (const [term, definition] of Object.entries(glossary)) {
  assertText(term, 'glossary term');
  assertText(definition, `glossary.${term}`);
}

for (const source of allSources) {
  validateSource(source);
}
for (const item of allItems) {
  validateItem(item);
}

const populatedBatches = expansions.filter((payload) => Array.isArray(payload.items) && payload.items.length > 0).length;
if (populatedBatches === EXPANSION_FILES.length) {
  assert(expansionItems.length === 40, `full expansion must contain 40 items, found ${expansionItems.length}`);
  assert(allItems.length === baseItems.length, `full research catalog must cover all ${baseItems.length} base items, found ${allItems.length}`);
  for (const baseId of baseIds) {
    assert(resolvedIds.includes(baseId), `full research catalog is missing base item: ${baseId}`);
  }
}

if (errors.length) {
  console.error('Yokai research expansion validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Yokai research expansion validation passed: ${expansionItems.length}/40 expansion items, ${populatedBatches}/5 batches populated, cross-batch source dependencies forbidden.`);

function validateSource(source) {
  assertText(source.id, 'source.id');
  assertText(source.title, `${source.id}.title`);
  assertText(source.provider, `${source.id}.provider`);
  assertText(source.url, `${source.id}.url`);
  assert(SOURCE_ROLES.has(source.sourceRole), `${source.id}.sourceRole is invalid: ${source.sourceRole}`);
  assert(SOURCE_TYPES.has(source.sourceType), `${source.id}.sourceType is invalid: ${source.sourceType}`);
  if (typeof source.url !== 'string' || !source.url) return;
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

function validateItem(item) {
  const prefix = item.id || '(missing id)';
  assertText(item.historySummary, `${prefix}.historySummary`);
  assertText(item.evidenceNote, `${prefix}.evidenceNote`);
  assertText(item.editorial?.oneLine, `${prefix}.editorial.oneLine`);
  assertText(item.editorial?.childDescription, `${prefix}.editorial.childDescription`);
  assertText(item.editorial?.trivia, `${prefix}.editorial.trivia`);
  assert(Array.isArray(item.aliases) && item.aliases.length >= 1, `${prefix}.aliases must contain at least 1 value`);
  for (const field of COVERAGE_FIELDS) assert(Array.isArray(item[field]), `${prefix}.${field} must be an array`);
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
  if (item.editorial?.interpretation !== undefined) assertText(item.editorial.interpretation, `${prefix}.editorial.interpretation`);
  validateNestedSourceSubset(item, prefix);
  validateGlossaryTerms(item, prefix);
}

function validateCoverage(item, prefix) {
  assert(item.coverage && typeof item.coverage === 'object', `${prefix}.coverage must be an object`);
  if (!item.coverage || typeof item.coverage !== 'object') return;
  for (const field of COVERAGE_FIELDS) {
    const status = item.coverage[field];
    const collection = item[field];
    assert(COVERAGE_STATUSES.has(status), `${prefix}.coverage.${field} is invalid: ${status}`);
    if (!Array.isArray(collection)) continue;
    if (status === 'documented') assert(collection.length >= 1, `${prefix}.${field} must have at least 1 entry when coverage is documented`);
    if (status === 'not_applicable') assert(collection.length === 0, `${prefix}.${field} must be empty when coverage is not_applicable`);
  }
}

function validateClaims(claims, path) {
  if (!Array.isArray(claims)) return;
  claims.forEach((claim, index) => {
    assertText(claim.name, `${path}[${index}].name`);
    assertText(claim.description, `${path}[${index}].description`);
    assert(CLAIM_EVIDENCE_LEVELS.has(claim.evidenceLevel), `${path}[${index}].evidenceLevel must be A or B: ${claim.evidenceLevel}`);
    validateEvidenceSourceRefs(claim.sourceIds, `${path}[${index}].sourceIds`);
  });
}

function validateNestedSourceSubset(item, prefix) {
  const top = new Set(item.sourceIds || []);
  const nested = [];
  for (const field of COVERAGE_FIELDS) {
    for (const [index, entry] of (item[field] || []).entries()) {
      for (const sourceId of entry.sourceIds || []) nested.push({sourceId, path:`${field}[${index}].sourceIds`});
    }
  }
  for (const {sourceId, path} of nested) assert(top.has(sourceId), `${prefix}.${path} references ${sourceId}, but it is missing from ${prefix}.sourceIds`);
}

function validateGlossaryTerms(item, prefix) {
  if (item.glossaryTerms === undefined) return;
  assert(Array.isArray(item.glossaryTerms), `${prefix}.glossaryTerms must be an array`);
  if (!Array.isArray(item.glossaryTerms)) return;
  assert(new Set(item.glossaryTerms).size === item.glossaryTerms.length, `${prefix}.glossaryTerms must not contain duplicates`);
  const text = collectRenderedText(item);
  for (const term of item.glossaryTerms) {
    assert(Object.hasOwn(glossary, term), `${prefix}.glossaryTerms references missing glossary term: ${term}`);
    assert(text.includes(term), `${prefix}.glossaryTerms contains '${term}', but that term does not appear in rendered item text`);
  }
}

function collectRenderedText(item) {
  const values = [item.historySummary,item.evidenceNote,item.editorial?.oneLine,item.editorial?.childDescription,item.editorial?.trivia,item.editorial?.interpretation,item.article?.title,item.article?.subtitle,...(item.article?.body || [])];
  for (const entry of item.timeline || []) values.push(entry.label, entry.summary);
  for (const claim of [...(item.abilities || []), ...(item.countermeasures || [])]) values.push(claim.name, claim.description);
  for (const variant of item.regionalVariants || []) values.push(variant.region, variant.summary, ...(variant.localNames || []));
  return values.filter((value) => typeof value === 'string').join('\n');
}

function validateEvidenceSourceRefs(refs, path) {
  assert(Array.isArray(refs) && refs.length >= 1, `${path} must contain at least 1 source ID`);
  if (!Array.isArray(refs)) return;
  for (const sourceId of refs) {
    assert(sourceIdSet.has(sourceId), `${path} references missing source: ${sourceId}`);
    const source = sourceIndex.get(sourceId);
    if (source) assert(source.sourceRole === 'evidence', `${path} must not use discovery-only source as evidence: ${sourceId}`);
  }
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function toBaseCatalogId(id) { return BASE_ID_ALIASES[id] || id; }
function readJson(path) { return JSON.parse(fs.readFileSync(path, 'utf8')); }
function assertText(value, path) { assert(typeof value === 'string' && value.trim().length > 0, `${path} must be a non-empty string`); }
function assert(condition, message) { if (!condition) errors.push(message); }
