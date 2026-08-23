import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const ARTICLES_PATH = 'public/data/articles.json';
const PROTECTED_FILES = {
  'public/data/ehime_research_v2.json': '4bfe24bb4211358cdf936935ae451073fab048fe',
  'public/data/evidence_check_table.json': '082e5b20ef0b38cb872ea02bce710030a4e872d3',
  'public/data/sources.json': 'a1504a0dabfc44cb777c3db22d8d2a3d859f7979'
};

const EXPECTED_SOURCE_IDS = {
  uwajima_ushioni_cluster: ['SRC_UWAJIMA_CITY_2026', 'SRC_IYO_MINZOKU_0200004', 'SRC_IYO_MINZOKU_0200265'],
  matsuyama_tanuki_cluster: ['SRC_NDL_TANUKI_REFERENCE', 'SRC_MATSUYAMA_TANUKI_OFFICIAL'],
  iyo_basan_cluster: ['SRC_EHON_HYAKU_MONOGATARI_1841'],
  ishizuchi_tengu_cluster: ['SRC_ASHINAKA_116_TENGU', 'SRC_ISHIZUCHI_OFFICIAL'],
  dogo_myth_cluster: ['SRC_YOYOGUN_GORIGENSHU_1710', 'SRC_IYOKOKU_FUDOKI_DOGO', 'SRC_DOGO_OFFICIAL'],
  ishiteji_emon_saburo_cluster: ['SRC_EMON_SABURO_REFERENCE'],
  uwakai_sea_mystery_cluster: ['SRC_EHIME_PREF_FOLKLORE_1983', 'SRC_IYO_MINZOKU_0200237'],
  kihoku_oni_cluster: ['SRC_KIHOKU_ONI_LEGEND'],
  yosuzume: ['SRC_YOSUZUME_1100055'],
  nobiagari: ['SRC_NOBIAGARI_0200015', 'SRC_NOBIAGARI_0200232'],
  kane_no_kami_no_hi: ['SRC_SOGO_NIHON_MINZOKU_GOI_1955']
};

const WRITABLE_HEADINGS = {
  uwajima_ushioni_cluster: ['愛媛のどこに残る？', '怪物の牛鬼と、祭りの牛鬼'],
  matsuyama_tanuki_cluster: ['愛媛のどこに残る？', 'どんな物語？'],
  iyo_basan_cluster: ['どこに伝わる？', '1841年の本には何と書かれる？'],
  ishizuchi_tengu_cluster: ['愛媛のどこに残る？', '山麓ではどう語られた？'],
  dogo_myth_cluster: ['白鷺が湯を見つけた話', '少彦名命と玉の石'],
  ishiteji_emon_saburo_cluster: ['愛媛のどこに残る？', 'どんな物語？'],
  uwakai_sea_mystery_cluster: ['大洲・宇和島の『柄杓をくれ』', '日振島へ帰る船を止める火'],
  kihoku_oni_cluster: ['愛媛のどこに残る？', '鬼王段三郎は何をした？'],
  yosuzume: ['愛媛のどこに残る？', 'どんな怪異？'],
  nobiagari: ['旧下波村の伸上り', '城川町の伸上り'],
  kane_no_kami_no_hi: ['愛媛のどこに残る？', '大みそかに現れる火']
};

const RESEARCH_HEADINGS = {
  uwajima_ushioni_cluster: ['資料から分かること', 'まだ分からないこと'],
  matsuyama_tanuki_cluster: ['資料から分かること', 'まだ分からないこと'],
  iyo_basan_cluster: ['資料から分かること', 'まだ分からないこと'],
  ishizuchi_tengu_cluster: ['資料から分かること', 'まだ分からないこと'],
  dogo_myth_cluster: ['資料から分かること', 'ここで大切なこと'],
  ishiteji_emon_saburo_cluster: ['どこまで古く確認できる？', 'まだ分からないこと'],
  uwakai_sea_mystery_cluster: ['資料から分かること', 'まだ分からないこと'],
  kihoku_oni_cluster: ['資料から分かること', 'まだ分からないこと'],
  yosuzume: ['資料から分かること', 'ここで大切なこと'],
  nobiagari: ['資料から分かること', 'まだ調べられること'],
  kane_no_kami_no_hi: ['資料から分かること', 'まだ分からないこと']
};

const META_PATTERNS = [
  /分けて読/g,
  /資料から/g,
  /確認でき/g,
  /確認できない/g,
  /として扱/g,
  /とは書/g,
  /研究上/g
];

const data = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
const articles = data.articles;
assert(Array.isArray(articles), 'articles.json must contain articles[]');
assert.equal(articles.length, 11, 'Literary Editing Pass must keep exactly 11 Ehime articles');

const ids = articles.map((article) => article.id);
assert.equal(new Set(ids).size, 11, 'Ehime article ids must remain unique');
assert.deepEqual([...ids].sort(), Object.keys(EXPECTED_SOURCE_IDS).sort(), 'Ehime article set changed');

let metaTotal = 0;
for (const article of articles) {
  assert.equal(typeof article.lead, 'string', `${article.id}: lead must be a string`);
  assert(article.lead.trim().length > 0, `${article.id}: lead must not be empty`);
  assert(article.lead.length <= 130, `${article.id}: lead exceeds 130 characters (${article.lead.length})`);
  assert.deepEqual(article.sourceIds, EXPECTED_SOURCE_IDS[article.id], `${article.id}: sourceIds changed during literary editing`);

  const sectionIndex = new Map(article.sections.map((section) => [section.heading, section]));
  const writable = WRITABLE_HEADINGS[article.id] || [];
  const research = RESEARCH_HEADINGS[article.id] || [];

  assert(writable.length > 0, `${article.id}: no writable context/story/comparison headings configured`);
  for (const heading of writable) {
    const section = sectionIndex.get(heading);
    assert(section, `${article.id}: missing context/story/comparison section: ${heading}`);
    assert(Array.isArray(section.body) && section.body.length > 0, `${article.id}: ${heading} body must not be empty`);
    assert(section.body.every((paragraph) => typeof paragraph === 'string' && paragraph.trim()), `${article.id}: ${heading} contains an empty paragraph`);
  }

  for (const heading of research) {
    assert(sectionIndex.has(heading), `${article.id}: protected research_note heading changed or disappeared: ${heading}`);
  }

  const allResearchHeadings = new Set(Object.values(RESEARCH_HEADINGS).flat());
  for (const section of article.sections) {
    if (allResearchHeadings.has(section.heading) && !research.includes(section.heading)) {
      throw new Error(`${article.id}: research-style heading added outside its protected research_note contract: ${section.heading}`);
    }
  }

  const literaryText = [article.lead, ...writable.flatMap((heading) => sectionIndex.get(heading).body)].join('\n');
  let articleMetaCount = 0;
  for (const pattern of META_PATTERNS) {
    const matches = literaryText.match(pattern);
    articleMetaCount += matches?.length || 0;
  }
  assert(articleMetaCount <= 1, `${article.id}: editor/research meta-language is still too frequent in literary sections (${articleMetaCount})`);
  metaTotal += articleMetaCount;
}

assert(metaTotal <= 5, `Literary sections contain too much editor/research meta-language overall (${metaTotal})`);

for (const [filePath, expectedBlobSha] of Object.entries(PROTECTED_FILES)) {
  const actual = gitBlobSha(filePath);
  assert.equal(actual, expectedBlobSha, `${filePath} changed during Literary Editing Pass v1`);
}

console.log(`Ehime Literary Editing QA: 11 articles, lead limits, literary sections, sourceIds, research headings, protected research files OK; meta-language count=${metaTotal}`);

function gitBlobSha(filePath) {
  const content = fs.readFileSync(filePath);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
}
