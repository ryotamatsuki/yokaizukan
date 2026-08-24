import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const BASE_PATH = 'public/data/yokai.json';
const CLOSURE_PATH = 'public/data/yokai_article_closure.json';
const P1_PATH = 'public/data/yokai_literary_phase1.json';
const P2_PATH = 'public/data/yokai_literary_phase2.json';
const P3_PATH = 'public/data/yokai_literary_phase3.json';
const PHASE2_AUDIT_PATH = 'docs/yokai-literary-phase2-audit.json';
const PHASE4_AUDIT_PATH = 'docs/yokai-research-deepening-phase4.json';
const EHIME_ARTICLES_PATH = 'public/data/articles.json';
const APP_PATH = 'js/app.js';
const LITERARY_PATH = 'js/literary.js';

const A_IDS = ['wanyudo', 'mokumokuren', 'kodama', 'yamanba'];
const B_IDS = ['gashadokuro', 'akaname'];
const C_IDS = ['karakasa-kozo', 'chochin-obake', 'nuppeppo', 'shiro_uneri', 'fumikuruma_yohi', 'kaichigo', 'enenra', 'ame_onna'];
const TARGET_IDS = [...A_IDS, ...B_IDS, ...C_IDS];

const PROTECTED = {
  'public/data/yokai.json': 'cac55b075d88a50fb84a128f4181a1c5a4dab2a0',
  'public/data/yokai_research_pilot.json': '6b40bd6693de1b3826c50b22b644c88f52f3d9ce',
  'public/data/yokai_research_common_sources.json': '5d75551776babd047d1e14e5d552c7ea21d07dd4',
  'public/data/yokai_research_expansion_01.json': '12900f7ca973ebf039eba06df6731f22221aef1d',
  'public/data/yokai_research_expansion_02.json': 'faec80a92a7078dedcf45aecd808ee3596ff0573',
  'public/data/yokai_research_expansion_03.json': '42cddcf3aa2e0c5ac3e2e36196f247b036709e20',
  'public/data/yokai_research_expansion_04.json': '4cee42cc6dcb281320278c7c4ddb05ee87b53cba',
  'public/data/yokai_research_expansion_05.json': '9629f696ab629a810c35556d807e0da8510dee5c',
  'public/data/yokai_research_deepening_phase4.json': '9497f5c892cfc30eb77ac5b21f763e810633d7b9',
  'public/data/yokai_literary_phase1.json': 'c77ba23319ffd0d2fb502c7c8ae97db81a6633c4',
  'public/data/yokai_literary_phase2.json': 'c21fbccbe7595b0bb39fcb09597823e6c28c3a02',
  'public/data/yokai_literary_phase3.json': '2b1e5d67f2ae2d2b514a68737d21f7cae62b933c',
  'public/data/articles.json': '8445534fc65aa815c733531a79778b11f6a78211',
  'public/data/legends.json': 'd753f6497416cb0c1fc976121b160736b09d1ff6',
  'public/data/ehime_research_v2.json': '4bfe24bb4211358cdf936935ae451073fab048fe'
};

// These are legacy positive assertions/symbolic conclusions. A closure article may
// mention the same noun while explicitly saying it is unverified, so avoid single-word bans.
const LEGACY_DANGER = {
  wanyudo: ['子どもをさらう', '仏教的な因果', '道具と移動の力が、人間の手を離れて走り出す'],
  mokumokuren: ['家そのものが怪異化', '古い家がこちらを見返すとき', '住まいにも時間が積もり'],
  gashadokuro: ['戦乱の死者への想像', '夜の野原で骨が鳴る', '忘れられた声が大きな姿'],
  akaname: ['掃除を促す生活の戒め', '汚れや湿気が怪異化', '毎日の手入れを忘れない'],
  'karakasa-kozo': ['古い傘が妖怪になった付喪神です', 'ものを大切にする生活倫理', '忘れられたものの反撃'],
  'chochin-obake': ['人間が作った光の不安', '四谷怪談のような上演文化', '古びた提灯が顔を持つ付喪神として語られる'],
  nuppeppo: ['墓地や廃寺に現れるといった説明も見られますが、それが古い絵の本文に直接書かれているとは限りません。'],
  shiro_uneri: ['物置で夜にうねる', '忘れられた布そのものが妖怪'],
  fumikuruma_yohi: ['言葉が妖怪の身体になる', '強い思いが妖怪化する'],
  kaichigo: ['海の広さを貝殻に宿す', '婚礼道具から生まれ'],
  enenra: ['見る人の心が形を作る', '囲炉裏・焚き火・湯気へ現れる'],
  ame_onna: ['雪女との対', '白・青の衣', '農作物と雨を待つ']
};

const base = readJson(BASE_PATH);
const closure = readJson(CLOSURE_PATH);
const p1 = readJson(P1_PATH);
const p2 = readJson(P2_PATH);
const p3 = readJson(P3_PATH);
const phase2Audit = readJson(PHASE2_AUDIT_PATH);
const phase4Audit = readJson(PHASE4_AUDIT_PATH);
const ehimeArticles = readJson(EHIME_ARTICLES_PATH);

const baseIds = (base.items || []).map((item) => item.id);
assert.equal(baseIds.length, 50, 'National base must remain exactly 50 items');
assert.equal(new Set(baseIds).size, 50, 'National base IDs must remain unique');

assert.equal(closure.schemaVersion, 1, 'Closure schemaVersion must be 1');
assert.equal(closure.status, 'complete', 'Closure must be marked complete');
assert.deepEqual([...closure.targetIds].sort(), [...TARGET_IDS].sort(), 'Closure targets must be exactly the audited 14');
assert.equal(new Set(closure.targetIds).size, 14, 'Closure target IDs must be unique');
assert.deepEqual([...closure.groups.A].sort(), [...A_IDS].sort(), 'Closure A group changed');
assert.deepEqual([...closure.groups.B].sort(), [...B_IDS].sort(), 'Closure B group changed');
assert.deepEqual([...closure.groups.C].sort(), [...C_IDS].sort(), 'Closure C group changed');

const p1Ids = p1.targetIds || [];
const p2Ids = p2.targetIds || [];
const p3Ids = p3.targetIds || [];
const allArticleIds = [...p1Ids, ...p2Ids, ...p3Ids, ...closure.targetIds];
assert.equal(p1Ids.length, 15, 'Phase 1 must remain 15');
assert.equal(p2Ids.length, 10, 'Phase 2 must remain 10');
assert.equal(p3Ids.length, 11, 'Phase 3 must remain 11');
assert.equal(allArticleIds.length, 50, '15 + 10 + 11 + 14 must equal 50');
assert.equal(new Set(allArticleIds).size, 50, 'Article production target sets must be disjoint');
assert.deepEqual([...new Set(allArticleIds)].sort(), [...baseIds].sort(), 'All national base IDs must have a final reading-layer article');
assert.equal((ehimeArticles.articles || []).length, 11, 'Ehime article catalog must remain 11');

const phase4Index = new Map((phase4Audit.items || []).map((item) => [item.id, item]));
for (const id of A_IDS) {
  const row = phase4Index.get(id);
  assert(row, `${id}: Phase 4 audit missing`);
  assert.equal(row.afterClassification, 'A', `${id}: closure A item must remain Phase 4 class A`);
  assert.equal(row.literaryReady, true, `${id}: closure A item must remain literaryReady`);
}
for (const id of B_IDS) {
  const row = phase4Index.get(id);
  assert(row, `${id}: Phase 4 audit missing`);
  assert.equal(row.afterClassification, 'B', `${id}: closure B item must remain Phase 4 class B`);
  assert.equal(row.literaryReady, false, `${id}: closure B item must remain Research Continue`);
}
const phase2Index = new Map((phase2Audit.items || []).map((item) => [item.id, item]));
for (const id of C_IDS) assert.equal(phase2Index.get(id)?.classification, 'C', `${id}: closure C item must remain Audit class C`);

const allowedItemKeys = ['childDescription', 'closureClass', 'detailedArticle', 'habitat', 'id', 'notes', 'oneLine', 'quiz', 'tags', 'trivia'].sort();
for (const item of closure.items || []) {
  assert.deepEqual(Object.keys(item).sort(), allowedItemKeys, `${item.id}: closure overlay has an unapproved field`);
  assert(TARGET_IDS.includes(item.id), `${item.id}: unexpected closure item`);
  assert.equal(item.closureClass, A_IDS.includes(item.id) ? 'A' : B_IDS.includes(item.id) ? 'B' : 'C', `${item.id}: closureClass mismatch`);
  assert(item.oneLine?.trim(), `${item.id}: oneLine required`);
  assert(item.childDescription?.trim(), `${item.id}: childDescription required`);
  assert(item.trivia?.trim(), `${item.id}: trivia required`);
  assert(Array.isArray(item.habitat), `${item.id}: habitat must be an array`);
  assert(Array.isArray(item.tags), `${item.id}: tags must be an array`);
  assert(item.notes?.trim(), `${item.id}: notes required`);
  assert(Array.isArray(item.quiz) && item.quiz.length >= 1, `${item.id}: at least one quiz required`);
  assert(item.detailedArticle?.title?.trim(), `${item.id}: article title required`);
  assert(item.detailedArticle?.subtitle?.trim(), `${item.id}: article subtitle required`);
  assert(Array.isArray(item.detailedArticle?.body), `${item.id}: article body required`);
  const paragraphs = item.detailedArticle.body;
  assert(paragraphs.length >= (item.closureClass === 'C' ? 2 : 3) && paragraphs.length <= 5, `${item.id}: article length must match evidence strength`);
  assert(paragraphs.every((p) => typeof p === 'string' && p.trim()), `${item.id}: empty article paragraph`);
  assert(!('sourceIds' in item) && !('coverage' in item) && !('abilities' in item) && !('countermeasures' in item), `${item.id}: closure must not alter Research contract`);

  const prose = [item.oneLine, item.childDescription, item.trivia, ...paragraphs].join('\n');
  for (const phrase of LEGACY_DANGER[item.id] || []) assert(!prose.includes(phrase), `${item.id}: legacy overclaim survived closure: ${phrase}`);
}
assert.equal((closure.items || []).length, 14, 'Closure must contain exactly 14 items');

for (const [path, expected] of Object.entries(PROTECTED)) {
  assert.equal(gitBlobSha(path), expected, `${path} changed during Final Article Closure`);
}

const literarySource = fs.readFileSync(LITERARY_PATH, 'utf8');
const appSource = fs.readFileSync(APP_PATH, 'utf8');
assert(literarySource.includes("ARTICLE_CLOSURE_URL = 'public/data/yokai_article_closure.json'"), 'Closure URL missing');
assert(literarySource.includes('export function mergeArticleClosureOverlay'), 'Closure merge function missing');
assert(literarySource.includes('next.visualFeatures = []'), 'Closure must clear legacy visualFeatures');
assert(literarySource.includes('next.textReferenceUrls = []'), 'Closure must clear legacy textReferenceUrls');
assert(literarySource.includes("references: hasResearch && Array.isArray(existingArticle.references)"), 'Research references must be preserved when available');
assert(literarySource.includes("references: hasResearch") && literarySource.includes(": []"), 'Legacy references must be cleared when Research is unavailable');
const p1Pos = appSource.indexOf('mergeLiteraryOverlay(researchedItems, literaryPhase1)');
const p2Pos = appSource.indexOf('mergeLiteraryOverlay(phase1Items, literaryPhase2)');
const p3Pos = appSource.indexOf('mergeLiteraryOverlay(phase2Items, literaryPhase3)');
const closurePos = appSource.indexOf('mergeArticleClosureOverlay(phase3Items, articleClosure)');
assert(p1Pos >= 0 && p2Pos > p1Pos && p3Pos > p2Pos && closurePos > p3Pos, 'Runtime order must be Research -> P1 -> P2 -> P3 -> Closure');

console.log('PASS Final Article Closure: national articles=50/50, Ehime articles=11/11, closure A=4 B=2 C=8, protected Research/Literary/Ehime unchanged');

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function gitBlobSha(path) {
  const content = fs.readFileSync(path);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
}
