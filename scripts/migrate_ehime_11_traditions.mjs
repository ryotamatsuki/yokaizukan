import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const write = (path, data) => fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
const today = "2026-07-20";
const prompt = fs.readFileSync("codex_prompt_ehime_11_traditions.md", "utf8");

const specs = [
  ["uwajima_ushioni_cluster", "宇和島・南予の牛鬼", "festival_tradition"],
  ["matsuyama_tanuki_cluster", "松山騒動八百八狸", "literary_legend"],
  ["iyo_basan_cluster", "『絵本百物語』の伊予の怪鳥・波山", "early_modern_yokai_book"],
  ["ishizuchi_tengu_cluster", "石鎚山をすみかとする天狗", "folklore_collection"],
  ["dogo_myth_cluster", "道後温泉の白鷺と玉の石", "myth_or_local_text"],
  ["ishiteji_emon_saburo_cluster", "石手寺の衛門三郎", "temple_legend"],
  ["uwakai_sea_mystery_cluster", "宇和海と日振島の船幽霊", "folklore_collection"],
  ["kihoku_oni_cluster", "鬼王段三郎と鬼ヶ城", "temple_legend"],
  ["yosuzume", "南宇和の夜雀", "folklore_collection"],
  ["nobiagari", "北宇和の伸上り", "folklore_collection"],
  ["kane_no_kami_no_hi", "怒和島・大みそかの氏神の火", "calendar_custom"]
];
const allowed = new Set(specs.map(([id]) => id));
const sourceIds = {
  uwajima_ushioni_cluster: ["SRC_UWAJIMA_CITY_2026", "SRC_IYO_MINZOKU_0200004", "SRC_IYO_MINZOKU_0200265"],
  matsuyama_tanuki_cluster: ["SRC_NDL_TANUKI_REFERENCE", "SRC_MATSUYAMA_TANUKI_OFFICIAL"],
  iyo_basan_cluster: ["SRC_EHON_HYAKU_MONOGATARI_1841"],
  ishizuchi_tengu_cluster: ["SRC_ASHINAKA_116_TENGU", "SRC_ISHIZUCHI_OFFICIAL"],
  dogo_myth_cluster: ["SRC_YOYOGUN_GORIGENSHU_1710", "SRC_IYOKOKU_FUDOKI_DOGO", "SRC_DOGO_OFFICIAL"],
  ishiteji_emon_saburo_cluster: ["SRC_EMON_SABURO_REFERENCE"],
  uwakai_sea_mystery_cluster: ["SRC_EHIME_PREF_FOLKLORE_1983", "SRC_IYO_MINZOKU_0200237"],
  kihoku_oni_cluster: ["SRC_KIHOKU_ONI_LEGEND"],
  yosuzume: ["SRC_YOSUZUME_1100055"],
  nobiagari: ["SRC_NOBIAGARI_0200015", "SRC_NOBIAGARI_0200232"],
  kane_no_kami_no_hi: ["SRC_SOGO_NIHON_MINZOKU_GOI_1955"]
};
const locationIds = { yosuzume: "minamiuwa_ainan", nobiagari: "kitauwa_nanyo", kane_no_kami_no_hi: "nuwa_island" };

function parseArticles() {
  const section = prompt.split("# 7. 11記事の確定本文")[1].split("# 8. 記事本文以外の文言")[0];
  return specs.map(([id]) => {
    const block = section.split(`## 7.${specs.findIndex((s) => s[0] === id) + 1} \`${id}\``)[1].split(/\n---\n|\n## 7\./)[0];
    const title = block.match(/### title\s+```text\s+([\s\S]*?)\s+```/)[1];
    const lead = block.match(/### lead\s+```text\s+([\s\S]*?)\s+```/)[1];
    const parts = block.split(/#### 見出し：/).slice(1);
    const sections = parts.map((part) => {
      const heading = part.split("\n")[0].trim();
      const body = [...part.matchAll(/```text\s+([\s\S]*?)\s+```/g)].map((m) => m[1]);
      return { heading, body };
    });
    return { id, title, lead, sections, sourceIds: sourceIds[id] };
  });
}

const articles = parseArticles();
fs.mkdirSync("scripts/fixtures", { recursive: true });
write("scripts/fixtures/ehime_11_articles.json", { articles });
write("public/data/articles.json", { updatedAt: today, articles });

const oldLegends = read("public/data/legends.json");
const parents = new Map(oldLegends.legends.map((item) => [item.id, item]));
const children = new Map(oldLegends.legends.flatMap((parent) => (parent.childItems || []).map((child) => [child.id, { parent, child }])));
const articleById = new Map(articles.map((article) => [article.id, article]));
const legends = specs.map(([id, title, traditionLayer]) => {
  const match = parents.get(id) || children.get(id)?.child;
  const parent = parents.get(id) || children.get(id)?.parent;
  const article = articleById.get(id);
  return {
    ...parent,
    ...(match || {}),
    id,
    name: title,
    isCluster: true,
    displayInList: true,
    shortDescription: article.lead,
    childDescription: article.lead,
    articleId: id,
    sourceIds: sourceIds[id],
    locationId: locationIds[id] || parent.locationId,
    courseIds: (parent.courseIds || []).filter((courseId) => courseId !== "night_road_mystery_course"),
    traditionLayer,
    childItems: [],
    childItemIds: [],
    legacyChildItemIds: (parent.childItemIds || []).filter((childId) => childId !== id)
  };
});
write("public/data/legends.json", {
  metadata: {
    ...oldLegends.metadata,
    title: "愛媛ふしぎ伝承図鑑",
    subtitle: "山・海・温泉・寺・島に残る11の物語",
    description: "愛媛県の特定の場所や資料と結びつきを確認できる、11の伝承・神話・祭礼・寺院縁起を紹介します。",
    sourceDescription: "この図鑑では、伝承が記録された場所、記録者や編者、資料名、刊行年をできる限り示しています。伝承が語る出来事を歴史的事実と断定するものではありません。",
    updatedAt: today
  },
  legends
});

write("public/data/child_articles.json", { updatedAt: today, articlePolicy: "愛媛版は11の独立記事へ再編済み。", articles: [] });

const evidenceDb = read("ehime_tradition_evidence_database.json");
const wantedSources = new Set(Object.values(sourceIds).flat());
const sources = evidenceDb.sources.filter((source) => wantedSources.has(source.source_id)).map((source) => ({
  id: source.source_id,
  title: source.title,
  organization: source.publishing_body,
  url: source.url,
  type: source.source_type,
  note: source.notes,
  articleOrSection: source.article_or_section,
  authorOrEditor: source.author_or_editor,
  informant: source.informant,
  publicationYear: source.publication_year,
  publicationDate: source.publication_date,
  volumeIssue: source.volume_issue,
  pages: source.pages,
  recordId: source.record_id,
  sourceQuality: source.source_quality
}));
write("public/data/sources.json", { updatedAt: today, sources });

const recordsByParent = new Map();
for (const record of evidenceDb.records) {
  const keys = [record.id, record.parent_cluster_id];
  for (const key of keys) if (key && allowed.has(key)) (recordsByParent.get(key) || recordsByParent.set(key, []).get(key)).push(record);
}
const legendEvidence = specs.map(([id]) => {
  const records = recordsByParent.get(id) || [];
  const grades = records.map((r) => r.evidence_grade).filter((g) => ["A", "B"].includes(g));
  const checked = [...new Set(records.flatMap((r) => [r.verification_status, r.evidence_summary]).filter(Boolean))];
  const needsFollowUp = [...new Set(records.map((r) => r.editorial_note).filter(Boolean))];
  return { legendId: id, level: grades.includes("A") ? "A" : "B", checked, needsFollowUp };
});
write("public/data/evidence_check_table.json", { updatedAt: today, legendEvidence, levels: read("public/data/evidence_check_table.json").levels });

const locationsData = read("public/data/locations.json");
locationsData.updatedAt = today;
locationsData.locations = locationsData.locations.filter((location) => !["noshima", "ehime_general"].includes(location.id));
locationsData.locations.push(
  { id: "minamiuwa_ainan", name: "南宇和・愛南町周辺", region: "南予", municipality: "愛南町周辺", summary: "夜雀が記録された旧南宇和郡の地域。", locationPrecision: "regional", mapPosition: { x: 20, y: 91 } },
  { id: "kitauwa_nanyo", name: "北宇和・南予", region: "南予", municipality: "宇和島市下波・西予市城川町", summary: "伸上りの複数の記録が残る地域。", locationPrecision: "regional", mapPosition: { x: 34, y: 73 } },
  { id: "nuwa_island", name: "怒和島", region: "中予・島しょ部", municipality: "松山市", summary: "大みそかの氏神の火が記録された島。", locationPrecision: "regional", mapPosition: { x: 39, y: 25 } }
);
write("public/data/locations.json", locationsData);

const coursesData = read("public/data/courses.json");
coursesData.updatedAt = today;
coursesData.courses = coursesData.courses.map((course) => ({
  ...course,
  legendIds: (course.legendIds || []).filter((id) => allowed.has(id)),
  stops: (course.stops || []).filter((stop) => allowed.has(stop.legendId))
})).filter((course) => course.legendIds.length);
write("public/data/courses.json", coursesData);
