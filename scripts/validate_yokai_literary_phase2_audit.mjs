import fs from 'node:fs';
import assert from 'node:assert/strict';

const BASE_PATH = 'public/data/yokai.json';
const PHASE1_PATH = 'public/data/yokai_literary_phase1.json';
const AUDIT_PATH = 'docs/yokai-literary-phase2-audit.json';
const RESEARCH_PATHS = [
  'public/data/yokai_research_pilot.json',
  'public/data/yokai_research_common_sources.json',
  ...[1, 2, 3, 4, 5].map((n) => `public/data/yokai_research_expansion_0${n}.json`)
];

const SCORE_KEYS = [
  'evidenceStrength',
  'sceneStrength',
  'regionalValue',
  'childReadabilityPotential',
  'contaminationSafety'
];
const CLASSIFICATIONS = new Set(['A', 'B', 'C']);
const ROADMAP_LANES = new Set([
  'Phase 2 Literary',
  'Phase 3 Literary',
  'Research Deepening',
  'Hold / Insufficient'
]);
const BASE_ID_ALIASES = {
  yuki_onna: 'yuki-onna',
  zashiki_warashi: 'zashiki-warashi'
};

const base = readJson(BASE_PATH);
const phase1 = readJson(PHASE1_PATH);
const audit = readJson(AUDIT_PATH);
const researchPayloads = RESEARCH_PATHS.map(readJson);

const baseItems = Array.isArray(base.items) ? base.items : [];
const baseIds = baseItems.map((item) => item.id);
assert.equal(baseIds.length, 50, 'base catalog must contain exactly 50 items');
assert.equal(new Set(baseIds).size, 50, 'base catalog IDs must be unique');

const phase1Ids = phase1.targetIds || [];
assert.equal(phase1Ids.length, 15, 'Phase 1 must contain exactly 15 target IDs');
assert.equal(new Set(phase1Ids).size, 15, 'Phase 1 target IDs must be unique');
const resolvedPhase1Ids = phase1Ids.map(toBaseId);
resolvedPhase1Ids.forEach((id) => assert(baseIds.includes(id), `Phase 1 ID does not resolve to base catalog: ${id}`));
assert.equal(new Set(resolvedPhase1Ids).size, 15, 'Phase 1 IDs must resolve uniquely');

const phase1Set = new Set(resolvedPhase1Ids);
const remainingIds = baseIds.filter((id) => !phase1Set.has(id));
assert.equal(remainingIds.length, 35, 'base 50 - Phase 1 15 must equal 35 remaining items');

assert.equal(audit.schemaVersion, 1, 'audit schemaVersion must be 1');
assert.equal(audit.baseCount, 50, 'audit baseCount must be 50');
assert.equal(audit.phase1Count, 15, 'audit phase1Count must be 15');
assert.equal(audit.remainingCount, 35, 'audit remainingCount must be 35');
assert.deepEqual([...audit.phase1Ids].map(toBaseId).sort(), [...resolvedPhase1Ids].sort(), 'audit phase1Ids must mirror Phase 1 targetIds');

const auditItems = audit.items || [];
assert.equal(auditItems.length, 35, 'audit must contain exactly 35 items');
const auditIds = auditItems.map((item) => item.id);
assert.equal(new Set(auditIds).size, 35, 'audit IDs must be unique');
assert.deepEqual([...auditIds].sort(), [...remainingIds].sort(), 'audit IDs must equal base 50 minus Phase 1 15');
for (const id of auditIds) {
  assert(!phase1Set.has(id), `Phase 1 item leaked into Phase 2 audit: ${id}`);
}

const researchItems = new Map();
const researchSourceIds = new Set();
for (const payload of researchPayloads) {
  for (const source of payload.sources || []) researchSourceIds.add(source.id);
  for (const item of payload.items || []) {
    const id = toBaseId(item.id);
    assert(!researchItems.has(id), `duplicate resolved research item: ${id}`);
    researchItems.set(id, item);
  }
}
assert.equal(researchItems.size, 50, 'research layer must resolve to all 50 base items');

const actualClassCounts = { A: 0, B: 0, C: 0 };
const recommendedIds = [];
for (const item of auditItems) {
  assert(CLASSIFICATIONS.has(item.classification), `${item.id}: classification must be A, B, or C`);
  actualClassCounts[item.classification] += 1;

  assert(item.scores && typeof item.scores === 'object', `${item.id}: scores are required`);
  assert.deepEqual(Object.keys(item.scores).sort(), [...SCORE_KEYS].sort(), `${item.id}: score keys changed`);
  for (const key of SCORE_KEYS) {
    const value = item.scores[key];
    assert(Number.isInteger(value) && value >= 0 && value <= 2, `${item.id}.${key} must be an integer from 0 to 2`);
  }
  const scoreTotal = SCORE_KEYS.reduce((sum, key) => sum + item.scores[key], 0);
  assert.equal(item.totalScore, scoreTotal, `${item.id}: totalScore must equal the five score values`);
  assert(item.totalScore >= 0 && item.totalScore <= 10, `${item.id}: totalScore must be 0-10`);

  assert(ROADMAP_LANES.has(item.roadmapLane), `${item.id}: invalid roadmapLane`);
  if (item.phase2Recommended) {
    assert.equal(item.classification, 'A', `${item.id}: only A items may be Phase 2 recommended`);
    assert.equal(item.roadmapLane, 'Phase 2 Literary', `${item.id}: recommended item must be in Phase 2 Literary lane`);
    assert(typeof item.memoryHook === 'string' && item.memoryHook.trim(), `${item.id}: recommended item requires a Memory Hook`);
    recommendedIds.push(item.id);
  } else {
    assert(item.roadmapLane !== 'Phase 2 Literary', `${item.id}: non-recommended item cannot use Phase 2 Literary lane`);
  }
  if (item.classification === 'B') assert.equal(item.roadmapLane, 'Research Deepening', `${item.id}: B items must use Research Deepening lane`);
  if (item.classification === 'C') assert.equal(item.roadmapLane, 'Hold / Insufficient', `${item.id}: C items must use Hold / Insufficient lane`);

  assert(Array.isArray(item.sceneAnchors), `${item.id}: sceneAnchors must be an array`);
  assert(Array.isArray(item.sourceIds) && item.sourceIds.length >= 1, `${item.id}: sourceIds must contain at least one source`);
  assert(Array.isArray(item.risks), `${item.id}: risks must be an array`);
  assert(Array.isArray(item.researchGaps), `${item.id}: researchGaps must be an array`);
  for (const sourceId of item.sourceIds) {
    assert(researchSourceIds.has(sourceId), `${item.id}: audit references unknown research source ${sourceId}`);
  }

  const research = researchItems.get(item.id);
  assert(research, `${item.id}: missing research item`);
  const expectedCoverage = ['timeline', 'abilities', 'countermeasures', 'regionalVariants']
    .map((key) => `${key}=${research.coverage?.[key]}`)
    .join('; ');
  assert.equal(item.coverageSummary, expectedCoverage, `${item.id}: coverageSummary drifted from Research`);
  assert.deepEqual([...item.sourceIds].sort(), [...research.sourceIds].sort(), `${item.id}: audit sourceIds must mirror Research sourceIds exactly`);

  const evidenceCounts = { A: 0, B: 0, APP: research.editorial?.interpretation ? 1 : 0 };
  for (const claim of [...(research.abilities || []), ...(research.countermeasures || [])]) {
    if (claim.evidenceLevel === 'A' || claim.evidenceLevel === 'B') evidenceCounts[claim.evidenceLevel] += 1;
  }
  assert.deepEqual(item.evidenceLevels, evidenceCounts, `${item.id}: evidenceLevels drifted from Research`);
}

assert.deepEqual(audit.classificationCounts, actualClassCounts, 'classificationCounts must match audited items');
assert(recommendedIds.length >= 8 && recommendedIds.length <= 12, `Phase 2 recommended count must be 8-12, found ${recommendedIds.length}`);
assert.deepEqual([...audit.phase2RecommendedIds].sort(), [...recommendedIds].sort(), 'phase2RecommendedIds must mirror item flags');

console.log(`National Yokai Phase 2 Audit QA: base=50; phase1=15; remaining=35; A=${actualClassCounts.A}; B=${actualClassCounts.B}; C=${actualClassCounts.C}; Phase2 recommended=${recommendedIds.length}; Research source/coverage/evidence contracts unchanged.`);

function toBaseId(id) {
  return BASE_ID_ALIASES[id] || id;
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
