import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const fixture = read("scripts/fixtures/ehime_11_articles.json");
const legendsData = read("public/data/legends.json");
const articlesData = read("public/data/articles.json");
const childArticles = read("public/data/child_articles.json");
const sourcesData = read("public/data/sources.json");
const locationsData = read("public/data/locations.json");
const coursesData = read("public/data/courses.json");
const evidenceData = read("public/data/evidence_check_table.json");

const legends = legendsData.legends.filter((item) => item.displayInList !== false);
const allowed = new Set(fixture.articles.map((item) => item.id));
const articleIds = new Set(articlesData.articles.map((item) => item.id));
const sourceIds = new Set(sourcesData.sources.map((item) => item.id));
const locationIds = new Set(locationsData.locations.map((item) => item.id));

assert.equal(legends.length, 11, "表示対象legendは11件でなければなりません");
assert.equal(articlesData.articles.length, 11, "articleは11件でなければなりません");
assert.equal(childArticles.articles.length, 0, "child articleは0件でなければなりません");
assert.equal(evidenceData.legendEvidence.length, 11, "evidenceは11件でなければなりません");
assert.deepEqual(articlesData.articles, fixture.articles, "確定本文がfixtureと完全一致しません");

for (const legend of legends) {
  assert(allowed.has(legend.id), `未許可legend: ${legend.id}`);
  assert.equal(legend.articleId, legend.id, `${legend.id}: articleIdは自身のIDと一致必須`);
  assert(articleIds.has(legend.articleId), `${legend.id}: articleが存在しません`);
  assert(locationIds.has(legend.locationId), `${legend.id}: locationが存在しません`);
  assert.equal(legend.isCluster, true, `${legend.id}: isCluster`);
  assert.deepEqual(legend.childItems, [], `${legend.id}: childItems`);
  assert.deepEqual(legend.childItemIds, [], `${legend.id}: childItemIds`);
  assert(legend.imagePath && typeof legend.imagePath === "string", `${legend.id}: imagePath`);
  for (const id of legend.sourceIds || []) assert(sourceIds.has(id), `${legend.id}: source ${id}`);
}
for (const article of articlesData.articles) assert(allowed.has(article.id), `未許可article: ${article.id}`);
for (const course of coursesData.courses) {
  for (const id of course.legendIds || []) assert(allowed.has(id), `${course.id}: 削除済みID ${id}`);
  for (const stop of course.stops || []) assert(allowed.has(stop.legendId), `${course.id}: 削除済みstop ${stop.legendId}`);
}
for (const id of ["setouchi_murakami_kaizoku_cluster", "ehime_night_road_mysteries_cluster"])
  assert(!legends.some((legend) => legend.id === id), `削除対象が表示されます: ${id}`);

console.log("愛媛版11伝承: 本文完全一致・件数・参照整合 OK");
