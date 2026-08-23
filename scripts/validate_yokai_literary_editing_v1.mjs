import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const LITERARY_PATH = 'public/data/yokai_literary_phase1.json';

const BATCH_IDS = {
  A: ['nurikabe', 'ittan_momen', 'sunakake_baba', 'sunekosuri', 'abura_sumashi'],
  B: ['kappa', 'tengu', 'yuki-onna', 'zashiki-warashi', 'okuri_inu'],
  C: ['oni', 'ushi_oni', 'umibozu', 'nekomata', 'ubume']
};

const TARGET_IDS = [
  'kappa',
  'tengu',
  'oni',
  'yuki-onna',
  'zashiki-warashi',
  'nurikabe',
  'ittan_momen',
  'ushi_oni',
  'umibozu',
  'nekomata',
  'sunakake_baba',
  'sunekosuri',
  'abura_sumashi',
  'okuri_inu',
  'ubume'
];

const PROTECTED_FILES = {
  'public/data/yokai.json': 'cac55b075d88a50fb84a128f4181a1c5a4dab2a0',
  'public/data/yokai_research_pilot.json': '6b40bd6693de1b3826c50b22b644c88f52f3d9ce',
  'public/data/yokai_research_expansion_01.json': '12900f7ca973ebf039eba06df6731f22221aef1d',
  'public/data/yokai_research_expansion_02.json': 'faec80a92a7078dedcf45aecd808ee3596ff0573',
  'public/data/yokai_research_expansion_03.json': '42cddcf3aa2e0c5ac3e2e36196f247b036709e20',
  'public/data/yokai_research_expansion_04.json': '4cee42cc6dcb281320278c7c4ddb05ee87b53cba',
  'public/data/yokai_research_expansion_05.json': '9629f696ab629a810c35556d807e0da8510dee5c'
};

const FACT_ANCHORS = {
  nurikabe: ['夜道', '壁', '棒', '遠賀', '壱岐'],
  ittan_momen: ['鹿児島', '夜', 'ひらひら', '1938', '1956'],
  sunakake_baba: ['奈良', '砂', '姿', '1938'],
  sunekosuri: ['岡山', '雨', '犬', '足'],
  abura_sumashi: ['天草', '山道', '油瓶', '1938'],
  kappa: ['九州', '水', '相撲', '山童', '佐賀'],
  tengu: ['石鎚', '高い木', '小さな火', '篠山', '翼'],
  'yuki-onna': ['越後', '大雪', '宗祇', '作並', '声を出さず'],
  'zashiki-warashi': ['岩泉', '床下', '五戸', '家'],
  okuri_inu: ['山梨', '転ぶ', '宮城', 'まず一服', '握り飯']
};

const FORBIDDEN_MODERN_PATTERNS = {
  nurikabe: [/手足のある壁/],
  ittan_momen: [/首に巻/],
  sunekosuri: [/猫の姿/, /丸い体/, /かわいらしい性格/],
  abura_sumashi: [/石のような頭/],
  kappa: [/きゅうり/, /甲羅/, /頭の皿/, /おじぎ/],
  tengu: [/剣術/, /神通力/, /長い鼻/, /鼻の高/],
  'yuki-onna': [/美しい女性/, /美人/],
  'zashiki-warashi': [/ラッキー/, /かわいい子ども/, /可愛い子ども/],
  okuri_inu: [/守護神/]
};

const META_PATTERNS = [
  /資料から分か/g,
  /確認でき/g,
  /確認できない/g,
  /研究上/g,
  /として扱/g,
  /とは書か/g,
  /分けて読/g,
  /原典では/g,
  /資料では/g
];

const data = JSON.parse(fs.readFileSync(LITERARY_PATH, 'utf8'));
assert.equal(data.schemaVersion, 1, 'Literary overlay schemaVersion must be 1');
assert.deepEqual([...data.targetIds].sort(), [...TARGET_IDS].sort(), 'Phase 1 targetIds changed');
assert.equal(new Set(data.targetIds).size, 15, 'Phase 1 targetIds must contain 15 unique ids');

const completed = data.completedBatches;
assert(Array.isArray(completed) && completed.length > 0, 'completedBatches must contain at least Batch A');
const batchOrder = ['A', 'B', 'C'];
assert.deepEqual(completed, batchOrder.slice(0, completed.length), 'Batches must be completed in A -> B -> C order');
assert(completed.length <= 3, 'Unknown completed batch');

const expectedEditedIds = completed.flatMap((batch) => BATCH_IDS[batch]);
const items = data.items;
assert(Array.isArray(items), 'Literary overlay items must be an array');
assert.equal(items.length, expectedEditedIds.length, 'Literary overlay item count does not match completed batches');
assert.equal(new Set(items.map((item) => item.id)).size, items.length, 'Literary overlay ids must be unique');
assert.deepEqual([...items.map((item) => item.id)].sort(), [...expectedEditedIds].sort(), 'Literary overlay contains an out-of-batch or missing id');

if (data.status === 'complete') {
  assert.deepEqual(completed, batchOrder, 'Complete status requires all three batches');
  assert.equal(items.length, 15, 'Complete status requires all 15 literary items');
} else {
  assert.equal(data.status ?? 'in_progress', 'in_progress', 'status must be in_progress or complete');
}

let metaTotal = 0;
for (const item of items) {
  assert(TARGET_IDS.includes(item.id), `${item.id}: outside Phase 1 target set`);
  assert.deepEqual(
    Object.keys(item).sort(),
    ['childDescription', 'detailedArticle', 'id', 'oneLine'].sort(),
    `${item.id}: literary overlay may only change reading-layer fields`
  );
  assert(typeof item.oneLine === 'string' && item.oneLine.trim(), `${item.id}: oneLine is required`);
  assert(item.oneLine.length <= 140, `${item.id}: oneLine exceeds 140 characters`);
  assert(typeof item.childDescription === 'string' && item.childDescription.trim(), `${item.id}: childDescription is required`);
  assert(item.childDescription.length <= 260, `${item.id}: childDescription is too long`);

  const article = item.detailedArticle;
  assert(article && typeof article === 'object', `${item.id}: detailedArticle is required`);
  assert.deepEqual(Object.keys(article).sort(), ['body', 'subtitle', 'title'].sort(), `${item.id}: detailedArticle may only replace title/subtitle/body`);
  assert(typeof article.title === 'string' && article.title.trim(), `${item.id}: article title is required`);
  assert(typeof article.subtitle === 'string' && article.subtitle.trim(), `${item.id}: article subtitle is required`);
  assert(Array.isArray(article.body) && article.body.length >= 3, `${item.id}: article body must have at least 3 paragraphs`);
  assert(article.body.length <= 6, `${item.id}: article body should stay short`);
  assert(article.body.every((paragraph) => typeof paragraph === 'string' && paragraph.trim()), `${item.id}: article has an empty paragraph`);

  const prose = [item.oneLine, item.childDescription, ...article.body].join('\n');
  let metaCount = 0;
  for (const pattern of META_PATTERNS) {
    metaCount += prose.match(pattern)?.length || 0;
  }
  assert(metaCount <= 1, `${item.id}: research/editor meta-language is too frequent (${metaCount})`);
  metaTotal += metaCount;

  for (const anchor of FACT_ANCHORS[item.id] || []) {
    assert(prose.includes(anchor), `${item.id}: expected source-grounded anchor is missing: ${anchor}`);
  }
  for (const pattern of FORBIDDEN_MODERN_PATTERNS[item.id] || []) {
    assert(!pattern.test(prose), `${item.id}: unsourced modern-standard imagery leaked into literary prose (${pattern})`);
  }
}

assert(metaTotal <= items.length, `Literary prose contains too much research/editor meta-language (${metaTotal})`);

for (const [filePath, expectedBlobSha] of Object.entries(PROTECTED_FILES)) {
  assert.equal(gitBlobSha(filePath), expectedBlobSha, `${filePath} changed during National Literary Editing Pass v1`);
}

console.log(`National Yokai Literary Editing QA: ${items.length}/15 edited items; batches=${completed.join(',')}; protected base/research files unchanged; meta-language count=${metaTotal}`);

function gitBlobSha(filePath) {
  const content = fs.readFileSync(filePath);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
}
