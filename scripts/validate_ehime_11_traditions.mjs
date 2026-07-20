import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const idsOf = (items) => items.map((item) => item.id).sort();
const readText = (path) => fs.readFileSync(path, "utf8");

const allowedIds = [
  "uwajima_ushioni_cluster",
  "matsuyama_tanuki_cluster",
  "iyo_basan_cluster",
  "ishizuchi_tengu_cluster",
  "dogo_myth_cluster",
  "ishiteji_emon_saburo_cluster",
  "uwakai_sea_mystery_cluster",
  "kihoku_oni_cluster",
  "yosuzume",
  "nobiagari",
  "kane_no_kami_no_hi"
];
const allowed = new Set(allowedIds);
const expectedEvidence = {
  uwajima_ushioni_cluster: ["A", "公式資料と南予の民俗資料で確認"],
  matsuyama_tanuki_cluster: ["A", "郷土資料と図書館調査で確認"],
  iyo_basan_cluster: ["A", "1841年の『絵本百物語』で確認"],
  ishizuchi_tengu_cluster: ["A", "石鎚山麓の民俗採集記録で確認"],
  dogo_myth_cluster: ["A", "古い地誌・風土記逸文・公式資料で確認"],
  ishiteji_emon_saburo_cluster: ["A", "石手寺刻板と図書館調査で確認"],
  uwakai_sea_mystery_cluster: ["A", "県史と南予の民俗資料で確認"],
  kihoku_oni_cluster: ["A", "等妙寺縁起を紹介する自治体資料で確認"],
  yosuzume: ["A", "南宇和郡の民俗採集記録で確認"],
  nobiagari: ["A", "南予の複数の民俗記録で確認"],
  kane_no_kami_no_hi: ["B", "民俗語彙集で確認・原資料は追加確認中"]
};
const expectedMeta = {
  yosuzume: {
    region: "南予",
    municipality: "愛南町周辺・旧南宇和郡",
    type: "鳥の怪異・夜道の怪異",
    traditionType: "地域で採集された",
    evidenceLevel: "A",
    locationId: "minamiuwa_ainan"
  },
  nobiagari: {
    region: "南予",
    municipality: "宇和島市下波・西予市城川町",
    type: "夜道の怪異",
    traditionType: "地域で採集された",
    evidenceLevel: "A",
    locationId: "kitauwa_nanyo"
  },
  kane_no_kami_no_hi: {
    region: "中予・島しょ部",
    municipality: "松山市怒和島",
    type: "年中行事・神の来訪・神の火",
    traditionType: "年中行事に伝わる",
    evidenceLevel: "B",
    locationId: "nuwa_island"
  }
};
const expectedQuizAnswers = {
  yosuzume: "山犬",
  nobiagari: "地面から一尺ほど上を蹴る",
  kane_no_kami_no_hi: "歳徳神が現れた知らせ"
};

const fixture = read("scripts/fixtures/ehime_11_articles.json");
const legendsData = read("public/data/legends.json");
const articlesData = read("public/data/articles.json");
const childArticles = read("public/data/child_articles.json");
const sourcesData = read("public/data/sources.json");
const locationsData = read("public/data/locations.json");
const coursesData = read("public/data/courses.json");
const evidenceData = read("public/data/evidence_check_table.json");
const legends = legendsData.legends;
const legendById = new Map(legends.map((item) => [item.id, item]));
const articleIds = new Set(articlesData.articles.map((item) => item.id));
const sourceIds = new Set(sourcesData.sources.map((item) => item.id));
const locationIds = new Set(locationsData.locations.map((item) => item.id));
const courseIds = new Set(coursesData.courses.map((item) => item.id));
const evidenceById = new Map(evidenceData.legendEvidence.map((item) => [item.legendId, item]));

assert.equal(legends.length, 11, "legends.jsonの全legend数は11件でなければなりません");
assert.equal(new Set(legends.map((item) => item.id)).size, 11, "legend IDが重複しています");
assert.deepEqual(idsOf(legends), [...allowed].sort(), "legend IDが11件の固定一覧と一致しません");
assert(legends.every((item) => item.displayInList === true), "全legendはdisplayInList:trueでなければなりません");
assert.equal(articlesData.articles.length, 11, "articleは11件でなければなりません");
assert.deepEqual(idsOf(articlesData.articles), [...allowed].sort(), "article IDが固定一覧と一致しません");
assert.deepEqual(idsOf(fixture.articles), [...allowed].sort(), "fixture IDが固定一覧と一致しません");
assert.equal(childArticles.articles.length, 0, "child articleは0件でなければなりません");
assert.equal(evidenceData.legendEvidence.length, 11, "evidenceは11件でなければなりません");
assert.deepEqual(evidenceData.legendEvidence.map((item) => item.legendId).sort(), [...allowed].sort(), "evidence IDが固定一覧と一致しません");
assert.deepEqual(articlesData.articles, fixture.articles, "確定本文がfixtureと完全一致しません");

for (const legend of legends) {
  assert.equal(legend.articleId, legend.id, `${legend.id}: articleIdは自身のIDと一致必須`);
  assert(articleIds.has(legend.articleId), `${legend.id}: articleが存在しません`);
  assert(locationIds.has(legend.locationId), `${legend.id}: locationが存在しません`);
  assert.equal(legend.isCluster, true, `${legend.id}: isClusterはtrueでなければなりません`);
  assert.deepEqual(legend.childItems, [], `${legend.id}: childItemsは空配列でなければなりません`);
  assert.deepEqual(legend.childItemIds, [], `${legend.id}: childItemIdsは空配列でなければなりません`);
  assert.equal("legacyChildItemIds" in legend, false, `${legend.id}: legacyChildItemIdsを公開JSONに残してはいけません`);
  assert(legend.imagePath && fs.existsSync(legend.imagePath), `${legend.id}: imagePathのファイルが存在しません: ${legend.imagePath}`);
  for (const id of legend.sourceIds || []) assert(sourceIds.has(id), `${legend.id}: sourceが存在しません: ${id}`);
  for (const id of legend.courseIds || []) assert(courseIds.has(id), `${legend.id}: courseが存在しません: ${id}`);

  const evidence = evidenceById.get(legend.id);
  assert(evidence, `${legend.id}: evidenceが存在しません`);
  assert.equal(legend.evidenceLevel, evidence.level, `${legend.id}: legends.jsonとevidence_check_table.jsonの確認度が一致しません`);
  assert.equal(legend.evidenceLevel, expectedEvidence[legend.id][0], `${legend.id}: evidenceLevelが確定値と一致しません`);
  assert.equal(legend.evidenceLabel, expectedEvidence[legend.id][1], `${legend.id}: evidenceLabelが確定値と一致しません`);
}

assert.equal(legends.filter((item) => item.evidenceLevel === "A").length, 10, "A判定は10件でなければなりません");
assert.equal(legends.filter((item) => item.evidenceLevel === "B").length, 1, "B判定は1件でなければなりません");

for (const [id, meta] of Object.entries(expectedMeta)) {
  const legend = legendById.get(id);
  for (const [key, value] of Object.entries(meta)) {
    assert.deepEqual(legend[key], value, `${id}: ${key}が固定メタデータと一致しません`);
  }
}
for (const [id, answer] of Object.entries(expectedQuizAnswers)) {
  assert.equal(legendById.get(id).quiz?.[0]?.answer, answer, `${id}: クイズが自身の伝承を扱っていません`);
}
assert.notEqual(legendById.get("yosuzume").quiz[0].answer, "伸上り", "夜雀の正解に伸上りを設定してはいけません");
assert.notEqual(legendById.get("kane_no_kami_no_hi").quiz[0].answer, "伸上り", "氏神の火の正解に伸上りを設定してはいけません");

for (const course of coursesData.courses) {
  for (const id of course.legendIds || []) assert(allowed.has(id), `${course.id}: 削除済みIDが残っています: ${id}`);
  for (const stop of course.stops || []) {
    const legend = legendById.get(stop.legendId);
    assert(legend, `${course.id}: legendが存在しません: ${stop.legendId}`);
    assert.equal(stop.title, legend.name, `${course.id}: stop.titleがlegend.nameと一致しません`);
  }
}
assert.deepEqual(coursesData.courses.map((item) => item.id).sort(), [
  "dogo_mystery_course",
  "ishizuchi_tengu_course",
  "iyo_mystery_course",
  "matsuyama_tanuki_course",
  "nanyo_ushioni_course"
], "コースIDが最終5件と一致しません");

const publicDataPaths = [
  "public/data/legends.json",
  "public/data/courses.json",
  "public/data/locations.json",
  "public/data/evidence_check_table.json"
];
const forbiddenPublicTerms = [
  "海坊主",
  "鬼王丸",
  "柚鬼媛",
  "夜道の怪異クラスター",
  "初期版では夜道の怪異クラスターとして扱う",
  "民俗データベースで確認継続",
  "愛媛県内各地",
  "要確認"
];
for (const path of publicDataPaths) {
  const text = readText(path);
  for (const term of forbiddenPublicTerms) assert(!text.includes(term), `${path}: 公開禁止語が残っています: ${term}`);
}

for (const evidence of evidenceData.legendEvidence) {
  const text = JSON.stringify(evidence);
  for (const status of ["confirmed", "partial", "contextual", "unsupported"]) {
    assert(!text.includes(status), `${evidence.legendId}: 内部監査区分 ${status} が公開用データに残っています`);
  }
}

const ehimeJs = readText("js/ehime.js");
for (const obsolete of [
  "openChildDetail",
  "findChildItem",
  "findChildArticle",
  "data-open-child-detail",
  "state.childArticles",
  "relatedItemsHtml",
  "childArticleHtml"
]) assert(!ehimeJs.includes(obsolete), `js/ehime.jsに旧派生処理が残っています: ${obsolete}`);

const nuwaArticle = articlesData.articles.find((item) => item.id === "kane_no_kami_no_hi");
const nuwaText = JSON.stringify(nuwaArticle);
assert(!nuwaText.includes("1939年の愛媛県関係の民俗記録として"), "怒和島記事に旧1939年文言が残っています");
assert(nuwaText.includes("『綜合日本民俗語彙』（1955～1956年）"), "怒和島記事に登録出典の年代文言がありません");

console.log("愛媛版11伝承: 固定本文・メタデータ・確認度・クイズ・参照・画像・禁止語・旧JS検証 OK");
