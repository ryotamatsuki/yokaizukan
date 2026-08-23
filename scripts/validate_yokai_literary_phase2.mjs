import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const PHASE2_PATH = 'public/data/yokai_literary_phase2.json';
const PHASE1_PATH = 'public/data/yokai_literary_phase1.json';
const BASE_PATH = 'public/data/yokai.json';
const AUDIT_PATH = 'docs/yokai-literary-phase2-audit.json';
const APP_PATH = 'js/app.js';
const LITERARY_JS_PATH = 'js/literary.js';

const RESEARCH_PATHS = [
  'public/data/yokai_research_pilot.json',
  'public/data/yokai_research_common_sources.json',
  ...[1, 2, 3, 4, 5].map((n) => `public/data/yokai_research_expansion_0${n}.json`)
];

const BATCH_IDS = {
  A: ['azuki-arai', 'betobeto_san', 'kamikiri', 'kitsunebi'],
  B: ['hitotsume-kozo', 'konaki_jiji', 'ningyo'],
  C: ['bakeneko', 'tofu-kozo', 'daidarabotchi']
};

const TARGET_IDS = [
  'hitotsume-kozo', 'bakeneko', 'kitsunebi', 'azuki-arai', 'ningyo',
  'tofu-kozo', 'konaki_jiji', 'betobeto_san', 'kamikiri', 'daidarabotchi'
];

const PHASE1_IDS = [
  'kappa', 'tengu', 'oni', 'yuki-onna', 'zashiki-warashi',
  'nurikabe', 'ittan_momen', 'ushi_oni', 'umibozu', 'nekomata',
  'sunakake_baba', 'sunekosuri', 'abura_sumashi', 'okuri_inu', 'ubume'
];

const PROTECTED_FILES = {
  'public/data/yokai.json': 'cac55b075d88a50fb84a128f4181a1c5a4dab2a0',
  'public/data/yokai_research_pilot.json': '6b40bd6693de1b3826c50b22b644c88f52f3d9ce',
  'public/data/yokai_research_common_sources.json': '5d75551776babd047d1e14e5d552c7ea21d07dd4',
  'public/data/yokai_research_expansion_01.json': '12900f7ca973ebf039eba06df6731f22221aef1d',
  'public/data/yokai_research_expansion_02.json': 'faec80a92a7078dedcf45aecd808ee3596ff0573',
  'public/data/yokai_research_expansion_03.json': '42cddcf3aa2e0c5ac3e2e36196f247b036709e20',
  'public/data/yokai_research_expansion_04.json': '4cee42cc6dcb281320278c7c4ddb05ee87b53cba',
  'public/data/yokai_research_expansion_05.json': '9629f696ab629a810c35556d807e0da8510dee5c',
  'public/data/yokai_literary_phase1.json': 'c77ba23319ffd0d2fb502c7c8ae97db81a6633c4'
};

const FACT_ANCHORS = {
  'azuki-arai': ['丹原', '雨', '小豆', '音', '松山市伊台'],
  betobeto_san: ['ビタビタ', '先へおこし', '道をよけ', '足音'],
  kamikiri: ['本所', '便所', 'めまい', '根元', '姿'],
  kitsunebi: ['赤城山麓', '約20個', '一列', '点いた順', '王子', '作柄'],
  'hitotsume-kozo': ['12月8日', '笊', '籠', '門口', '目'],
  konaki_jiji: ['徳島', '山奥', '赤子', '爺', '重く', '離せ'],
  ningyo: ['石垣島', '津波', '海へ返', '若狭', '長寿'],
  bakeneko: ['群馬県大泉町', '原っぱ', '鉢巻', '歌', '踊', '石川'],
  'tofu-kozo': ['お盆', '持ち歩', '黄表紙', '1779', '江戸'],
  daidarabotchi: ['群馬県太田市', '赤城山', '利根川', '足跡', '池', '矢倉岳']
};

const LEAD_ANCHORS = {
  'azuki-arai': ['雨', '音'],
  betobeto_san: ['ビタビタ', '足音'],
  kamikiri: ['本所', 'めまい'],
  kitsunebi: ['赤城山麓', '約20個', '一列'],
  'hitotsume-kozo': ['12月8日', '一つ目小僧'],
  konaki_jiji: ['山奥', '赤子'],
  ningyo: ['石垣島', '津波'],
  bakeneko: ['原っぱ', '猫'],
  'tofu-kozo': ['豆腐', 'お盆'],
  daidarabotchi: ['群馬県太田市', '赤城山']
};

const MEMORY_FACT_ANCHORS = {
  'azuki-arai': ['雨', '小豆', '音'],
  betobeto_san: ['ビタビタ', '先へおこし'],
  kamikiri: ['髪', '根元', '切'],
  kitsunebi: ['赤城山麓', '約20個', '一列'],
  'hitotsume-kozo': ['一つ目小僧', '目', '籠'],
  konaki_jiji: ['赤子', '爺', '重く'],
  ningyo: ['石垣島', '津波'],
  bakeneko: ['猫', '鉢巻', '歌', '踊'],
  'tofu-kozo': ['豆腐', 'お盆', '持ち歩', '黄表紙'],
  daidarabotchi: ['群馬県太田市', '足跡', '池']
};

const FINAL_MEMORY_HOOKS = {
  'hitotsume-kozo': '一つ目小僧に、目だらけの籠を見せる',
  bakeneko: '猫たちが鉢巻をして集まり、歌って踊る',
  kitsunebi: '赤城山麓に、約20個の火が一列に並ぶ',
  'azuki-arai': '雨の晩、人のいない水辺から小豆を研ぐ音がする',
  ningyo: '石垣の人魚は、津波が来ることを知らせる',
  'tofu-kozo': '豆腐の盆を持った子ども妖怪が、江戸の本の中を歩く',
  konaki_jiji: '赤子の声で泣く爺を抱くと、急に重くなる',
  betobeto_san: '後ろのビタビタ足音に「先へおこし」と道を譲る',
  kamikiri: '気づかないうちに、髪が根元から切られている',
  daidarabotchi: '群馬県太田市では、デッタラボッチの足跡が池になった'
};

const FORBIDDEN_MODERN_PATTERNS = {
  'azuki-arai': [/人取って食おうか/, /川へ落と/],
  betobeto_san: [/丸い姿/, /丸い妖怪/, /笑顔/],
  kamikiri: [/蟹/, /カニ/, /虫のよう/, /鎌で/, /爪で/],
  kitsunebi: [/口から火/, /狐が火を吐/, /狐の能力/],
  'hitotsume-kozo': [/無害な妖怪/, /かわいい小僧/],
  konaki_jiji: [/石になる/, /力を授/, /耐えると/],
  ningyo: [/美しい女性/, /人魚姫/, /マーメイド/, /歌声/],
  bakeneko: [/二本尾/, /尾が二本/, /巨大化/, /人語/, /行灯油/],
  'tofu-kozo': [/村で昔から/, /地域伝承の怪物/],
  daidarabotchi: [/全国共通/, /どこでも同じ/]
};

const META_PATTERNS = [
  /資料から分か/g, /確認でき/g, /確認できない/g, /研究上/g,
  /として扱/g, /とは書か/g, /分けて読/g, /原典では/g, /資料では/g
];

const data = readJson(PHASE2_PATH);
const phase1 = readJson(PHASE1_PATH);
const base = readJson(BASE_PATH);
const audit = readJson(AUDIT_PATH);
const researchPayloads = RESEARCH_PATHS.map(readJson);

const baseItems = Array.isArray(base.items) ? base.items : [];
const baseIds = baseItems.map((item) => item.id);
assert.equal(baseIds.length, 50, 'Base national catalog must remain exactly 50 items');
assert.equal(new Set(baseIds).size, 50, 'Base national catalog IDs must remain unique');

assert.deepEqual([...phase1.targetIds].sort(), [...PHASE1_IDS].sort(), 'Phase 1 target set changed');
assert.equal(phase1.items.length, 15, 'Phase 1 overlay must remain complete at 15 items');
assert.equal(phase1.status, 'complete', 'Phase 1 overlay status must remain complete');

assert.equal(data.schemaVersion, 1, 'Phase 2 literary overlay schemaVersion must be 1');
assert.deepEqual([...data.targetIds].sort(), [...TARGET_IDS].sort(), 'Phase 2 targetIds must remain the audited 10');
assert.equal(new Set(data.targetIds).size, 10, 'Phase 2 targetIds must be 10 unique IDs');
for (const id of TARGET_IDS) assert(baseIds.includes(id), `${id}: Phase 2 target missing from base 50`);
for (const id of TARGET_IDS) assert(!PHASE1_IDS.includes(id), `${id}: Phase 1/Phase 2 overlap is forbidden`);
assert.equal(baseIds.filter((id) => !PHASE1_IDS.includes(id) && !TARGET_IDS.includes(id)).length, 25, 'Exactly 25 base items must remain outside both literary overlays');

const auditItems = new Map((audit.items || []).map((item) => [item.id, item]));
assert.deepEqual([...audit.phase2RecommendedIds].sort(), [...TARGET_IDS].sort(), 'Phase 2 targets must match Audit recommended IDs');

const researchItems = new Map();
for (const payload of researchPayloads) {
  for (const item of payload.items || []) {
    const id = toBaseId(item.id);
    assert(!researchItems.has(id), `duplicate resolved research item: ${id}`);
    researchItems.set(id, item);
  }
}
assert.equal(researchItems.size, 50, 'Research layer must still resolve to all 50 base items');

for (const id of TARGET_IDS) {
  const auditItem = auditItems.get(id);
  const research = researchItems.get(id);
  assert(auditItem, `${id}: missing Phase 2 audit item`);
  assert(research, `${id}: missing Research item`);
  assert.equal(auditItem.classification, 'A', `${id}: Phase 2 target must remain Audit class A`);
  assert.equal(auditItem.phase2Recommended, true, `${id}: Phase 2 target must remain recommended`);
  assert(Array.isArray(auditItem.sceneAnchors) && auditItem.sceneAnchors.length >= 1, `${id}: A/recommended item requires at least one scene anchor`);
  assert(typeof auditItem.memoryHook === 'string' && auditItem.memoryHook.trim(), `${id}: Audit Memory Hook must remain non-empty`);
  assert(typeof FINAL_MEMORY_HOOKS[id] === 'string' && FINAL_MEMORY_HOOKS[id].trim(), `${id}: final Memory Hook is required`);

  const expectedCoverage = ['timeline', 'abilities', 'countermeasures', 'regionalVariants']
    .map((key) => `${key}=${research.coverage?.[key]}`)
    .join('; ');
  assert.equal(auditItem.coverageSummary, expectedCoverage, `${id}: Audit coverage drifted from Research`);
  assert.deepEqual([...auditItem.sourceIds].sort(), [...research.sourceIds].sort(), `${id}: Audit sourceIds drifted from Research`);

  const evidenceCounts = { A: 0, B: 0, APP: research.editorial?.interpretation ? 1 : 0 };
  for (const claim of [...(research.abilities || []), ...(research.countermeasures || [])]) {
    if (claim.evidenceLevel === 'A' || claim.evidenceLevel === 'B') evidenceCounts[claim.evidenceLevel] += 1;
  }
  assert.deepEqual(auditItem.evidenceLevels, evidenceCounts, `${id}: Audit A/B/APP counts drifted from Research`);
  assert.equal(evidenceCounts.APP, 0, `${id}: Phase 2 literary target unexpectedly contains APP interpretation`);
}

const batchOrder = ['A', 'B', 'C'];
const completed = data.completedBatches || [];
assert(Array.isArray(completed), 'completedBatches must be an array');
assert.deepEqual(completed, batchOrder.slice(0, completed.length), 'Phase 2 batches must complete in A -> B -> C order');
assert(completed.length <= 3, 'Unknown Phase 2 batch');

const expectedEditedIds = completed.flatMap((batch) => BATCH_IDS[batch]);
const items = data.items || [];
assert.equal(items.length, expectedEditedIds.length, 'Phase 2 item count does not match completed batches');
assert.equal(new Set(items.map((item) => item.id)).size, items.length, 'Phase 2 overlay IDs must be unique');
assert.deepEqual([...items.map((item) => item.id)].sort(), [...expectedEditedIds].sort(), 'Phase 2 overlay contains an out-of-batch or missing item');

if (data.status === 'complete') {
  assert.deepEqual(completed, batchOrder, 'Complete Phase 2 status requires all three batches');
  assert.equal(items.length, 10, 'Complete Phase 2 status requires all 10 items');
} else {
  assert.equal(data.status ?? 'in_progress', 'in_progress', 'Phase 2 status must be in_progress or complete');
}

let metaTotal = 0;
for (const item of items) {
  assert(TARGET_IDS.includes(item.id), `${item.id}: outside Phase 2 target set`);
  assert.deepEqual(Object.keys(item).sort(), ['childDescription', 'detailedArticle', 'id', 'oneLine'].sort(), `${item.id}: Phase 2 overlay may only change reading-layer fields`);
  assert(typeof item.oneLine === 'string' && item.oneLine.trim(), `${item.id}: oneLine is required`);
  assert(item.oneLine.length <= 150, `${item.id}: oneLine exceeds 150 characters`);
  assert(typeof item.childDescription === 'string' && item.childDescription.trim(), `${item.id}: childDescription is required`);
  assert(item.childDescription.length <= 300, `${item.id}: childDescription is too long`);

  const article = item.detailedArticle;
  assert(article && typeof article === 'object', `${item.id}: detailedArticle is required`);
  assert.deepEqual(Object.keys(article).sort(), ['body', 'subtitle', 'title'].sort(), `${item.id}: detailedArticle may only replace title/subtitle/body`);
  assert(typeof article.title === 'string' && article.title.trim(), `${item.id}: article title is required`);
  assert(typeof article.subtitle === 'string' && article.subtitle.trim(), `${item.id}: article subtitle is required`);
  assert(Array.isArray(article.body) && article.body.length >= 3 && article.body.length <= 6, `${item.id}: article body must contain 3-6 paragraphs`);
  assert(article.body.every((paragraph) => typeof paragraph === 'string' && paragraph.trim()), `${item.id}: article contains an empty paragraph`);

  const prose = [item.oneLine, item.childDescription, ...article.body].join('\n');
  const lead = article.body.slice(0, 1).join('\n');
  assert((LEAD_ANCHORS[item.id] || []).some((anchor) => lead.includes(anchor)), `${item.id}: opening paragraph lacks a source-grounded sound/light/motion/place/event anchor`);

  for (const anchor of FACT_ANCHORS[item.id] || []) {
    assert(prose.includes(anchor), `${item.id}: expected Research-derived fact anchor is missing: ${anchor}`);
  }
  for (const anchor of MEMORY_FACT_ANCHORS[item.id] || []) {
    assert(prose.includes(anchor), `${item.id}: final Memory Hook is not traceable in literary prose: ${anchor}`);
  }
  for (const pattern of FORBIDDEN_MODERN_PATTERNS[item.id] || []) {
    assert(!pattern.test(prose), `${item.id}: unsourced modern-standard imagery leaked into literary prose (${pattern})`);
  }

  let metaCount = 0;
  for (const pattern of META_PATTERNS) metaCount += prose.match(pattern)?.length || 0;
  assert(metaCount <= 1, `${item.id}: research/editor meta-language is too frequent (${metaCount})`);
  metaTotal += metaCount;
}
assert(metaTotal <= items.length, `Phase 2 literary prose contains too much research/editor meta-language (${metaTotal})`);

for (const [filePath, expectedBlobSha] of Object.entries(PROTECTED_FILES)) {
  assert.equal(gitBlobSha(filePath), expectedBlobSha, `${filePath} changed during Phase 2 Literary Editing`);
}

const appSource = fs.readFileSync(APP_PATH, 'utf8');
const literarySource = fs.readFileSync(LITERARY_JS_PATH, 'utf8');
assert(literarySource.includes("LITERARY_PHASE1_URL = 'public/data/yokai_literary_phase1.json'"), 'Phase 1 literary URL export missing');
assert(literarySource.includes("LITERARY_PHASE2_URL = 'public/data/yokai_literary_phase2.json'"), 'Phase 2 literary URL export missing');
assert(appSource.includes('const phase1Items = mergeLiteraryOverlay(researchedItems, literaryPhase1);'), 'Runtime must apply Phase 1 after Research');
assert(appSource.includes('state.allItems = mergeLiteraryOverlay(phase1Items, literaryPhase2);'), 'Runtime must apply Phase 2 after Phase 1');

console.log(`National Yokai Phase 2 Literary QA: ${items.length}/10 edited; batches=${completed.join(',') || 'none'}; base=50; Phase1=15 protected; outside=25; Research/base/Phase1 hashes protected; meta-language=${metaTotal}`);

function toBaseId(id) {
  const aliases = { yuki_onna: 'yuki-onna', zashiki_warashi: 'zashiki-warashi' };
  return aliases[id] || id;
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function gitBlobSha(filePath) {
  const content = fs.readFileSync(filePath);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
}
