import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const DATA = 'public/data/yokai_research_deepening_phase4.json';
const AUDIT = 'docs/yokai-research-deepening-phase4.json';
const TARGETS = ['gashadokuro', 'wanyudo', 'mokumokuren', 'akaname', 'kodama', 'yamanba'];
const EXPECTED_CLASS = { gashadokuro: ['B','B'], wanyudo: ['C','A'], mokumokuren: ['C','A'], akaname: ['B','B'], kodama: ['B','A'], yamanba: ['B','A'] };
const PROTECTED = {
  'public/data/yokai.json': 'cac55b075d88a50fb84a128f4181a1c5a4dab2a0',
  'public/data/yokai_research_pilot.json': '6b40bd6693de1b3826c50b22b644c88f52f3d9ce',
  'public/data/yokai_research_common_sources.json': '5d75551776babd047d1e14e5d552c7ea21d07dd4',
  'public/data/yokai_research_expansion_01.json': '12900f7ca973ebf039eba06df6731f22221aef1d',
  'public/data/yokai_research_expansion_02.json': 'faec80a92a7078dedcf45aecd808ee3596ff0573',
  'public/data/yokai_research_expansion_03.json': '42cddcf3aa2e0c5ac3e2e36196f247b036709e20',
  'public/data/yokai_research_expansion_04.json': '4cee42cc6dcb281320278c7c4ddb05ee87b53cba',
  'public/data/yokai_research_expansion_05.json': '9629f696ab629a810c35556d807e0da8510dee5c',
  'public/data/yokai_literary_phase1.json': 'c77ba23319ffd0d2fb502c7c8ae97db81a6633c4',
  'public/data/yokai_literary_phase2.json': 'c21fbccbe7595b0bb39fcb09597823e6c28c3a02',
  'public/data/yokai_literary_phase3.json': '2b1e5d67f2ae2d2b514a68737d21f7cae62b933c',
  'public/data/ehime_research_v2.json': '4bfe24bb4211358cdf936935ae451073fab048fe',
  'public/data/legends.json': 'd753f6497416cb0c1fc976121b160736b09d1ff6'
};

const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const audit = JSON.parse(fs.readFileSync(AUDIT, 'utf8'));
assert.equal(data.phase, 4);
assert.equal(data.overlayMode, 'research_deepening');
assert.deepEqual([...data.items.map(x => x.id)].sort(), [...TARGETS].sort(), 'Phase 4 target set must be exactly six');
assert.equal(new Set(data.items.map(x => x.id)).size, 6, 'Phase 4 item IDs must be unique');
assert.equal(new Set(data.sources.map(x => x.id)).size, data.sources.length, 'Phase 4 source IDs must be unique');

for (const [path, expected] of Object.entries(PROTECTED)) {
  const actual = gitBlobSha(fs.readFileSync(path));
  assert.equal(actual, expected, `${path} changed but is protected in Phase 4`);
}

const sourceIndex = new Map(data.sources.map(s => [s.id, s]));
for (const source of data.sources) {
  assert(['evidence','context','discovery'].includes(source.sourceRole), `${source.id}: invalid sourceRole`);
  assert(!/simsearch\.cgi|ksearch\.cgi/i.test(source.url), `${source.id}: search endpoint cannot be evidence`);
}

for (const item of data.items) {
  assert(item.historySummary?.trim(), `${item.id}: historySummary required`);
  assert(item.coverage && ['documented','insufficient','not_applicable'].includes(item.coverage.timeline), `${item.id}: coverage required`);
  assert(Array.isArray(item.sourceIds) && item.sourceIds.length, `${item.id}: sourceIds required`);
  for (const sid of item.sourceIds) assert(sourceIndex.has(sid), `${item.id}: missing source ${sid}`);
  for (const group of ['timeline','abilities','countermeasures','regionalVariants']) {
    for (const claim of item[group] || []) {
      assert(Array.isArray(claim.sourceIds) && claim.sourceIds.length, `${item.id}/${group}: sourceIds required`);
      for (const sid of claim.sourceIds) {
        const source = sourceIndex.get(sid);
        assert(source, `${item.id}/${group}: unknown source ${sid}`);
        if (group === 'abilities' || group === 'countermeasures') {
          assert(['A','B','APP'].includes(claim.evidenceLevel), `${item.id}/${group}: evidenceLevel required`);
          if (claim.evidenceLevel === 'A' || claim.evidenceLevel === 'B') assert.equal(source.sourceRole, 'evidence', `${item.id}/${group}: A/B claim must use evidence source`);
        }
      }
    }
  }
}

const auditIndex = new Map(audit.items.map(x => [x.id, x]));
assert.deepEqual([...auditIndex.keys()].sort(), [...TARGETS].sort(), 'Audit target set must be exactly six');
for (const id of TARGETS) {
  const row = auditIndex.get(id);
  const [before, after] = EXPECTED_CLASS[id];
  assert.equal(row.beforeClassification, before, `${id}: before classification mismatch`);
  assert.equal(row.afterClassification, after, `${id}: after classification mismatch`);
  assert(Array.isArray(row.sourcesAdded) && row.sourcesAdded.length, `${id}: sourcesAdded required`);
  assert(Array.isArray(row.sourcesRejected) && row.sourcesRejected.length, `${id}: rejected sources required`);
  for (const rejected of row.sourcesRejected) assert(rejected.reason?.trim(), `${id}: every rejected source needs a reason`);
  assert(Array.isArray(row.directEvidenceFindings) && row.directEvidenceFindings.length, `${id}: direct findings required`);
  assert(Array.isArray(row.remainingGaps) && row.remainingGaps.length, `${id}: remaining gaps required`);
  assert(Array.isArray(row.sceneAnchors) && row.sceneAnchors.length, `${id}: scene anchor required`);
  assert(row.memoryHookCandidate?.trim(), `${id}: memory hook candidate required`);
  assert(['high','medium','low'].includes(row.memoryHookConfidence), `${id}: invalid memory hook confidence`);
  assert(Array.isArray(row.supportingSourceIds) && row.supportingSourceIds.length, `${id}: supportingSourceIds required`);
  for (const sid of row.supportingSourceIds) assert(sourceIndex.has(sid), `${id}: memory hook source missing: ${sid}`);
  if (row.literaryReady) {
    assert.equal(row.memoryHookConfidence, 'high', `${id}: literaryReady requires high Memory Hook confidence`);
    assert(row.sceneAnchors.length > 0, `${id}: literaryReady requires scene anchor`);
    assert(['A','B'].includes(row.afterClassification), `${id}: literaryReady cannot be class C`);
  }
}

assert.equal(auditIndex.get('gashadokuro').literaryReady, false, 'gashadokuro must remain Research Continue while name first-use is unresolved');
assert.equal(auditIndex.get('akaname').literaryReady, false, 'akaname must not conflate 垢嘗 and 垢ねぶり');
assert.equal(auditIndex.get('wanyudo').literaryReady, true);
assert.equal(auditIndex.get('mokumokuren').literaryReady, true);
assert.equal(auditIndex.get('kodama').literaryReady, true);
assert.equal(auditIndex.get('yamanba').literaryReady, true);

const researchJs = fs.readFileSync('js/research.js', 'utf8');
assert(researchJs.includes('yokai_research_deepening_phase4.json'), 'runtime must load Phase 4 research overlay');
assert(researchJs.includes("payload.overlayMode === 'research_deepening'"), 'runtime must merge Research Deepening without replacing Literary data');

console.log('PASS Phase 4 Research Deepening: 6 targets, 4 Literary Ready, 2 Research Continue');

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}
