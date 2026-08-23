import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const PHASE3_PATH = 'public/data/yokai_literary_phase3.json';
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
  A: ['rokurokubi', 'kamaitachi', 'hitodama', 'hyosube'],
  B: ['karasu-tengu', 'bake-danuki', 'oonyudo', 'tsuchigumo'],
  C: ['nue', 'hyakki-yagyo', 'koto_furunushi']
};

const TARGET_IDS = [
  'rokurokubi', 'karasu-tengu', 'bake-danuki', 'kamaitachi', 'oonyudo',
  'tsuchigumo', 'nue', 'hitodama', 'hyakki-yagyo', 'koto_furunushi', 'hyosube'
];

const PHASE1_IDS = [
  'kappa', 'tengu', 'oni', 'yuki-onna', 'zashiki-warashi',
  'nurikabe', 'ittan_momen', 'ushi_oni', 'umibozu', 'nekomata',
  'sunakake_baba', 'sunekosuri', 'abura_sumashi', 'okuri_inu', 'ubume'
];

const PHASE2_IDS = [
  'hitotsume-kozo', 'bakeneko', 'kitsunebi', 'azuki-arai', 'ningyo',
  'tofu-kozo', 'konaki_jiji', 'betobeto_san', 'kamikiri', 'daidarabotchi'
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
  'public/data/yokai_literary_phase1.json': 'c77ba23319ffd0d2fb502c7c8ae97db81a6633c4',
  'public/data/yokai_literary_phase2.json': 'c21fbccbe7595b0bb39fcb09597823e6c28c3a02'
};

const FACT_ANCHORS = {
  rokurokubi: ['大阪', '茨木', '夜', '娘', '首'],
  'karasu-tengu': ['石鎚山麓', '夜', '高い木', '烏天狗'],
  'bake-danuki': ['阿波', '神官', '狸', '山梨', '化け'],
  kamaitachi: ['宮城', '旋風', '切', '越後', '古い暦', '黒焼'],
  oonyudo: ['津久井', '川', '船', '舳先', '大入道', 'カワウソ'],
  tsuchigumo: ['源頼光', '蜘蛛', '人', '大分', '七つ', '塚'],
  nue: ['古典', '猿', '虎', '狸', '蛇', '源頼政', '愛媛'],
  hitodama: ['埼玉', '屋根', '青', '尾', '群馬'],
  'hyakki-yagyo': ['一体の妖怪では', '絵巻', '妖怪', '列', '江戸中期'],
  koto_furunushi: ['鳥山石燕', '箏', '龍', '切れた弦', '乱れ髪'],
  hyosube: ['佐賀', '河童', '潮見神社', '水難', '歌']
};

const LEAD_ANCHORS = {
  rokurokubi: ['大阪', '首'],
  'karasu-tengu': ['石鎚山麓', '高い木'],
  'bake-danuki': ['阿波', '神官'],
  kamaitachi: ['越後', '黒焼'],
  oonyudo: ['津久井', '船'],
  tsuchigumo: ['源頼光', '蜘蛛'],
  nue: ['古典', '鵺'],
  hitodama: ['埼玉', '青'],
  'hyakki-yagyo': ['絵巻', '列'],
  koto_furunushi: ['箏', '切れた弦'],
  hyosube: ['佐賀', '歌']
};

const MEMORY_FACT_ANCHORS = {
  rokurokubi: ['大阪', '茨木', '娘', '首'],
  'karasu-tengu': ['石鎚山麓', '夜', '高い木'],
  'bake-danuki': ['阿波', '神官', '狸'],
  kamaitachi: ['越後', '古い暦', '黒焼'],
  oonyudo: ['津久井', '船', '舳先', '大入道'],
  tsuchigumo: ['源頼光', '蜘蛛', '人に化け'],
  nue: ['古典', '猿', '虎', '狸', '蛇'],
  hitodama: ['埼玉', '屋根', '青', '尾'],
  'hyakki-yagyo': ['江戸中期', '絵巻', '妖怪', '列'],
  koto_furunushi: ['箏', '龍', '切れた弦', '乱れ髪'],
  hyosube: ['佐賀', '水難', '歌']
};

const FINAL_MEMORY_HOOKS = {
  rokurokubi: '大阪・茨木の商家では、夜ごと娘の首が伸びる',
  'karasu-tengu': '石鎚山麓では、夜、高い木へ烏天狗が来る',
  'bake-danuki': '阿波では、神官に化けた狸を人間が逆にだます',
  kamaitachi: '越後では、鎌鼬の傷に古い暦の黒焼きを白湯で飲む',
  oonyudo: '津久井の川で、網打ちの船の舳先に大入道が現れる',
  tsuchigumo: '源頼光の説話では、蜘蛛が人に化けて惑わせる',
  nue: '鵺は、古典ごとに猿・虎または狸・蛇など姿の組み合わせが違う',
  hitodama: '埼玉では、死の前に屋根から青い尾を引く人魂が出る',
  'hyakki-yagyo': '江戸中期写本の絵巻で、多くの妖怪・異類が列をなす',
  koto_furunushi: '琴古主は、龍のような箏の胴と乱れ髪のような切れた弦で描かれる',
  hyosube: '佐賀では、ヒョウスベとの約束を忘れるなという水難除けの歌が伝わる'
};

const FORBIDDEN_MODERN_PATTERNS = {
  rokurokubi: [/首が抜け/, /首が飛/],
  'karasu-tengu': [/剣術/, /神通力/, /長い鼻/, /自由に飛/],
  'bake-danuki': [/腹鼓/, /徳利/, /陰嚢/, /八百八狸/],
  kamaitachi: [/三匹/, /一匹目/, /二匹目/, /三匹目/, /薬を塗/],
  oonyudo: [/何メートル/, /山より大き/],
  tsuchigumo: [/古代の一族が妖怪にな/, /土蜘蛛という民族/, /蜘蛛族/],
  nue: [/毒/, /雷/, /炎を吐/, /変身能力/, /飛行能力/],
  hitodama: [/正体は死者の魂/, /必ず死者の魂/],
  'hyakki-yagyo': [/百鬼夜行.{0,12}(能力|攻撃|弱点)/, /きっちり100体/],
  koto_furunushi: [/百年使/, /必ず妖怪/, /勝手に動/, /村で語ら/],
  hyosube: [/毛深/, /風呂好き/, /笑い声/]
};

const META_PATTERNS = [
  /資料から分か/g, /確認でき/g, /確認できない/g, /研究上/g,
  /として扱/g, /とは書か/g, /分けて読/g, /原典では/g, /資料では/g
];

const data = readJson(PHASE3_PATH);
const phase2 = readJson(PHASE2_PATH);
const phase1 = readJson(PHASE1_PATH);
const base = readJson(BASE_PATH);
const audit = readJson(AUDIT_PATH);
const researchPayloads = RESEARCH_PATHS.map(readJson);

const baseItems = Array.isArray(base.items) ? base.items : [];
const baseIds = baseItems.map((item) => item.id);
assert.equal(baseIds.length, 50, 'Base national catalog must remain exactly 50 items');
assert.equal(new Set(baseIds).size, 50, 'Base national catalog IDs must remain unique');

assert.deepEqual([...phase1.targetIds].sort(), [...PHASE1_IDS].sort(), 'Phase 1 target set changed');
assert.equal(phase1.items.length, 15, 'Phase 1 overlay must remain complete');
assert.equal(phase1.status, 'complete', 'Phase 1 overlay must remain complete');
assert.deepEqual([...phase2.targetIds].sort(), [...PHASE2_IDS].sort(), 'Phase 2 target set changed');
assert.equal(phase2.items.length, 10, 'Phase 2 overlay must remain complete');
assert.equal(phase2.status, 'complete', 'Phase 2 overlay must remain complete');

assert.equal(data.schemaVersion, 1, 'Phase 3 literary overlay schemaVersion must be 1');
assert.deepEqual([...data.targetIds].sort(), [...TARGET_IDS].sort(), 'Phase 3 targetIds changed');
assert.equal(new Set(data.targetIds).size, 11, 'Phase 3 targetIds must contain 11 unique IDs');
for (const id of TARGET_IDS) assert(baseIds.includes(id), `${id}: Phase 3 target missing from base 50`);
for (const id of TARGET_IDS) assert(!PHASE1_IDS.includes(id) && !PHASE2_IDS.includes(id), `${id}: Literary phase overlap is forbidden`);

const literaryIds = new Set([...PHASE1_IDS, ...PHASE2_IDS, ...TARGET_IDS]);
assert.equal(literaryIds.size, 36, 'Phase 1 + 2 + 3 literary target total must be 36');
assert.equal(baseIds.filter((id) => !literaryIds.has(id)).length, 14, 'Exactly 14 base items must remain outside literary overlays');

const auditItems = new Map((audit.items || []).map((item) => [item.id, item]));
const researchItems = new Map();
const sourceIds = new Set();
for (const payload of researchPayloads) {
  for (const source of payload.sources || []) sourceIds.add(source.id);
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
  assert.equal(auditItem.classification, 'A', `${id}: Phase 3 target must remain Audit class A`);
  assert.equal(auditItem.roadmapLane, 'Phase 3 Literary', `${id}: Audit roadmap lane must remain Phase 3 Literary`);
  assert(Array.isArray(auditItem.sceneAnchors) && auditItem.sceneAnchors.length >= 1, `${id}: Phase 3 target requires a scene anchor`);
  assert(typeof FINAL_MEMORY_HOOKS[id] === 'string' && FINAL_MEMORY_HOOKS[id].trim(), `${id}: final Memory Hook is required`);
  for (const sourceId of research.sourceIds || []) assert(sourceIds.has(sourceId), `${id}: Research sourceId does not exist: ${sourceId}`);

  const interpretation = research.editorial?.interpretation;
  if (typeof interpretation === 'string' && interpretation.trim()) {
    assert(!FINAL_MEMORY_HOOKS[id].includes(interpretation.trim()), `${id}: APP interpretation leaked into Memory Hook`);
  }
}

const hyakki = researchItems.get('hyakki-yagyo');
assert.equal(hyakki.coverage?.abilities, 'not_applicable', '百鬼夜行 abilities must stay not_applicable');
assert.equal(hyakki.coverage?.countermeasures, 'not_applicable', '百鬼夜行 countermeasures must stay not_applicable');
assert.equal((hyakki.abilities || []).length, 0, '百鬼夜行 must not gain abilities');
assert.equal((hyakki.countermeasures || []).length, 0, '百鬼夜行 must not gain countermeasures');

const koto = researchItems.get('koto_furunushi');
assert.equal(koto.coverage?.countermeasures, 'not_applicable', '琴古主 countermeasures must stay not_applicable');
assert((koto.abilities || []).some((claim) => claim.evidenceLevel === 'B'), '琴古主 must retain its B-level individual source claim');

const batchOrder = ['A', 'B', 'C'];
const completed = data.completedBatches || [];
assert(Array.isArray(completed), 'completedBatches must be an array');
assert.deepEqual(completed, batchOrder.slice(0, completed.length), 'Phase 3 batches must complete in A -> B -> C order');
assert(completed.length <= 3, 'Unknown Phase 3 batch');

const expectedEditedIds = completed.flatMap((batch) => BATCH_IDS[batch]);
const items = data.items || [];
assert.equal(items.length, expectedEditedIds.length, 'Phase 3 item count does not match completed batches');
assert.equal(new Set(items.map((item) => item.id)).size, items.length, 'Phase 3 overlay IDs must be unique');
assert.deepEqual([...items.map((item) => item.id)].sort(), [...expectedEditedIds].sort(), 'Phase 3 overlay contains an out-of-batch or missing item');

if (data.status === 'complete') {
  assert.deepEqual(completed, batchOrder, 'Complete Phase 3 status requires all three batches');
  assert.equal(items.length, 11, 'Complete Phase 3 status requires all 11 items');
} else {
  assert.equal(data.status ?? 'in_progress', 'in_progress', 'Phase 3 status must be in_progress or complete');
}

let metaTotal = 0;
for (const item of items) {
  assert(TARGET_IDS.includes(item.id), `${item.id}: outside Phase 3 target set`);
  assert.deepEqual(Object.keys(item).sort(), ['childDescription', 'detailedArticle', 'id', 'oneLine'].sort(), `${item.id}: overlay may only change reading-layer fields`);
  assert(typeof item.oneLine === 'string' && item.oneLine.trim(), `${item.id}: oneLine is required`);
  assert(item.oneLine.length <= 140, `${item.id}: oneLine exceeds 140 characters`);
  assert(typeof item.childDescription === 'string' && item.childDescription.trim(), `${item.id}: childDescription is required`);
  assert(item.childDescription.length <= 280, `${item.id}: childDescription is too long`);

  const article = item.detailedArticle;
  assert(article && typeof article === 'object', `${item.id}: detailedArticle is required`);
  assert.deepEqual(Object.keys(article).sort(), ['body', 'subtitle', 'title'].sort(), `${item.id}: detailedArticle may only replace title/subtitle/body`);
  assert(typeof article.title === 'string' && article.title.trim(), `${item.id}: article title is required`);
  assert(typeof article.subtitle === 'string' && article.subtitle.trim(), `${item.id}: article subtitle is required`);
  assert(Array.isArray(article.body) && article.body.length >= 3 && article.body.length <= 6, `${item.id}: article body must contain 3-6 paragraphs`);
  assert(article.body.every((paragraph) => typeof paragraph === 'string' && paragraph.trim()), `${item.id}: article has an empty paragraph`);

  const prose = [item.oneLine, item.childDescription, ...article.body].join('\n');
  const lead = [item.oneLine, item.childDescription].join('\n');
  let metaCount = 0;
  for (const pattern of META_PATTERNS) metaCount += prose.match(pattern)?.length || 0;
  assert(metaCount <= 1, `${item.id}: research/editor meta-language is too frequent (${metaCount})`);
  metaTotal += metaCount;

  for (const anchor of FACT_ANCHORS[item.id] || []) assert(prose.includes(anchor), `${item.id}: expected source-grounded anchor missing: ${anchor}`);
  for (const anchor of LEAD_ANCHORS[item.id] || []) assert(lead.includes(anchor), `${item.id}: lead misses concrete anchor: ${anchor}`);
  for (const anchor of MEMORY_FACT_ANCHORS[item.id] || []) assert(prose.includes(anchor), `${item.id}: Memory Hook anchor missing: ${anchor}`);
  for (const pattern of FORBIDDEN_MODERN_PATTERNS[item.id] || []) assert(!pattern.test(prose), `${item.id}: unsourced/fixed modern imagery leaked into prose (${pattern})`);

  const interpretation = researchItems.get(item.id)?.editorial?.interpretation;
  if (typeof interpretation === 'string' && interpretation.trim().length >= 12) {
    assert(!prose.includes(interpretation.trim()), `${item.id}: APP interpretation copied into literary prose`);
  }
}

assert(metaTotal <= items.length, `Phase 3 prose contains too much research/editor meta-language (${metaTotal})`);

const itemMap = new Map(items.map((item) => [item.id, item]));
if (itemMap.has('hyakki-yagyo')) {
  const prose = literaryProse(itemMap.get('hyakki-yagyo'));
  assert(prose.includes('一体の妖怪では'), '百鬼夜行 must remain explicitly non-individual');
  assert(!/百鬼夜行.{0,15}(能力|弱点|攻撃)/.test(prose), '百鬼夜行 must not receive individual abilities/weaknesses');
}
if (itemMap.has('koto_furunushi')) {
  const prose = literaryProse(itemMap.get('koto_furunushi'));
  assert(prose.includes('鳥山石燕') && prose.includes('箏'), '琴古主 must remain tied to Sekien publication/iconography');
  assert(!/地域.{0,8}(伝承|口承)|村で/.test(prose), '琴古主 must not be converted into regional folklore');
}
if (itemMap.has('nue')) {
  const prose = literaryProse(itemMap.get('nue'));
  assert(prose.includes('古典') && prose.includes('違'), '鵺 must retain differences among classical descriptions');
}
if (itemMap.has('tsuchigumo')) {
  const prose = literaryProse(itemMap.get('tsuchigumo'));
  assert(prose.includes('源頼光') && prose.includes('大分'), '土蜘蛛 must keep monster tale and Oita land tradition distinct');
  assert(!/歴史上.{0,10}土蜘蛛.{0,10}(妖怪|蜘蛛にな)/.test(prose), '土蜘蛛 must not equate historical usage with monster biology');
}

for (const [filePath, expectedBlobSha] of Object.entries(PROTECTED_FILES)) {
  assert.equal(gitBlobSha(filePath), expectedBlobSha, `${filePath} changed during Phase 3 Literary Editing`);
}

const literaryModule = fs.readFileSync(LITERARY_JS_PATH, 'utf8');
const appSource = fs.readFileSync(APP_PATH, 'utf8');
assert(literaryModule.includes("LITERARY_PHASE3_URL = 'public/data/yokai_literary_phase3.json'"), 'Phase 3 URL missing from literary module');
assert(appSource.includes('LITERARY_PHASE3_URL'), 'app.js does not load Phase 3 overlay');
const p1Pos = appSource.indexOf('mergeLiteraryOverlay(researchedItems, literaryPhase1)');
const p2Pos = appSource.indexOf('mergeLiteraryOverlay(phase1Items, literaryPhase2)');
const p3Pos = appSource.indexOf('mergeLiteraryOverlay(phase2Items, literaryPhase3)');
assert(p1Pos >= 0 && p2Pos > p1Pos && p3Pos > p2Pos, 'runtime order must be Research -> Phase 1 -> Phase 2 -> Phase 3');

console.log(`National Yokai Literary Phase 3 QA: ${items.length}/11 edited; literary total=36/50; untouched=14; batches=${completed.join(',') || 'none'}; protected base/research/Phase1/Phase2 unchanged; meta-language=${metaTotal}`);

function literaryProse(item) {
  return [item.oneLine, item.childDescription, ...(item.detailedArticle?.body || [])].join('\n');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function gitBlobSha(filePath) {
  const content = fs.readFileSync(filePath);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
}

function toBaseId(id) {
  const aliases = { yuki_onna: 'yuki-onna', zashiki_warashi: 'zashiki-warashi' };
  return aliases[id] || id;
}
