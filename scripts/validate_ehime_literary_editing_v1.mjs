import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const ARTICLES_PATH = 'public/data/articles.json';
const PROTECTED_FILES = {
  'public/data/ehime_research_v2.json': '4bfe24bb4211358cdf936935ae451073fab048fe',
  'public/data/evidence_check_table.json': '082e5b20ef0b38cb872ea02bce710030a4e872d3',
  'public/data/sources.json': 'a1504a0dabfc44cb777c3db22d8d2a3d859f7979'
};

const EDITED_IDS = new Set([
  'uwajima_ushioni_cluster',
  'matsuyama_tanuki_cluster',
  'iyo_basan_cluster',
  'ishizuchi_tengu_cluster',
  'dogo_myth_cluster',
  'ishiteji_emon_saburo_cluster',
  'uwakai_sea_mystery_cluster',
  'kihoku_oni_cluster',
  'yosuzume',
  'nobiagari',
  'kane_no_kami_no_hi'
]);

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

const EXPECTED_RESEARCH_NOTES = {
  uwajima_ushioni_cluster: {
    '資料から分かること': ['吉田町の退治伝説は日文研の個別カード、南予の祭礼牛鬼は『伊予の民俗』、現在の祭りは宇和島市公式資料でそれぞれ確認できます。資料ごとに確認できる範囲が違います。'],
    'まだ分からないこと': ['祭礼の牛鬼がいつ成立し、どの地域から現在の形へ広がったのかは未確定です。『昔から南予の牛鬼はすべて同じ姿だった』とは書きません。']
  },
  matsuyama_tanuki_cluster: {
    '資料から分かること': ['愛媛県立図書館のレファレンス調査は、『愛媛県百科大事典』『久谷村史』『拾録味酒史』など複数の郷土資料を案内しています。現在の松山市資料からは、市内に残る刑部狸などの狸伝承を確認できます。'],
    'まだ分からないこと': ['八百八狸の各場面が、どの版でいつ加わったのかはさらに調査が必要です。また、現在よく使われる『隠神刑部』という表記と古い郷土資料の『刑部狸』は区別して扱います。']
  },
  iyo_basan_cluster: {
    '資料から分かること': ['桃山人の文章と竹原春泉斎の絵による天保12年（1841年）『絵本百物語』で、伊予と波山の結びつきを確認できます。これは地域で採集された民俗聞き書きとは資料の性格が違います。'],
    'まだ分からないこと': ['愛媛県内の具体的な市町村で、波山が口承として採集された記録は今回確認できていません。後世の妖怪図鑑の説明を地域伝承として逆輸入しません。']
  },
  ishizuchi_tengu_cluster: {
    '資料から分かること': ['民俗採集記録から確認できるのは、石鎚山を天狗の巣とする語り、高木の烏天狗、小さな火、白装束の人物などです。石鎚神社公式資料は、天狗岳や山岳信仰・修験道の歴史背景を確認する別の資料です。'],
    'まだ分からないこと': ['各話の詳細な採集地点や話者まで、すべてのケースで特定できているわけではありません。また、山岳信仰がそのまま天狗伝承の原因だったと単純化しません。']
  },
  dogo_myth_cluster: {
    '資料から分かること': ['白鷺伝説は近世の地誌、神々の説話は古代の風土記逸文という異なる資料系統です。道後温泉公式資料は、現在どのように二つの伝承が紹介されているかを確認するために使います。'],
    'ここで大切なこと': ['温泉の医学的効能を伝説で証明するものではありません。また、白鷺伝説と玉の石説話を一つの出来事の前後関係としてつなげません。']
  },
  ishiteji_emon_saburo_cluster: {
    'どこまで古く確認できる？': ['愛媛県立図書館のレファレンス調査では、衛門三郎伝説の初見として永禄10年（1567年）の石手寺刻板が挙げられています。これは『現在知られる全場面が1567年に完成していた』という意味ではありません。'],
    'まだ分からないこと': ['托鉢、子どもたちの死、逆打ち、再来、石手寺の寺名由来など、現在知られる各場面がいつ成立・追加されたかは個別に追う必要があります。歴史上の衛門三郎の実在を証明する資料としても扱いません。']
  },
  uwakai_sea_mystery_cluster: {
    '資料から分かること': ['柄杓を求める話と陰火の話は、別の資料・別の場所の記録です。海坊主や全国の船幽霊伝承まで同じ能力・対処法としてまとめません。'],
    'まだ分からないこと': ['『愛媛県史』に収録された日振島の話について、元の個別採集記録・話者までは今回確認できていません。海が危険だったからこの妖怪が生まれた、と原因まで推測で決めません。']
  },
  kihoku_oni_cluster: {
    '資料から分かること': ['鬼北町教育委員会の資料から、等妙寺縁起に基づく鬼王段三郎と周辺の伝説を確認できます。一方、現在の鬼王丸などのモニュメント・キャラクターは現代の地域発信です。'],
    'まだ分からないこと': ['今回参照しているのは等妙寺縁起を紹介する自治体資料で、縁起原文の該当巻・頁を直接精査した段階ではありません。そこは追加調査事項として残します。']
  },
  yosuzume: {
    '資料から分かること': ['和田正洲「伊予の怪異談」（1957年）で、南宇和郡の夜雀と山犬の関係を確認できます。現代のイラストの鳥の姿より、資料上は声・夜道・山犬との連続が重要です。'],
    'ここで大切なこと': ['全国の『夜雀』に同じ性質があると一般化しません。また、夜の鳥の鳴き声の正体を特定した話でもありません。南宇和でどう語られたかを示す記録です。']
  },
  nobiagari: {
    '資料から分かること': ['山口常助「北宇和郡下波村聞書」と橋村寿「怪談ばなし」という別資料から、南予に複数の伸上り記録があることを確認できます。対処法を『伸上りなら全国どこでも同じ』とはしません。'],
    'まだ調べられること': ['下波と城川の話型、出現場所、対処法をさらに細かく比較する余地があります。暗い木や影の見間違いだったという現代的説明も、資料にないため本文の結論にはしません。']
  },
  kane_no_kami_no_hi: {
    '資料から分かること': ['民俗学研究所編『綜合日本民俗語彙』（1955～1956年）に怒和島の記述が収録されていることは確認できます。現在の確認度はBで、項目の内容と愛媛との関係は確認できるものの、原資料まで遡れていません。'],
    'まだ分からないこと': ['語彙集が参照した原資料、採集者、採集年、掲載頁は未確認です。したがって、本文では『昔から怒和島で必ずこう行われてきた』と年代を断定しません。']
  }
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
assert.equal(EDITED_IDS.size, 11, 'Final Literary Editing QA must cover all 11 articles');

let metaTotal = 0;
for (const article of articles) {
  assert.equal(typeof article.lead, 'string', `${article.id}: lead must be a string`);
  assert(article.lead.trim().length > 0, `${article.id}: lead must not be empty`);
  assert(article.lead.length <= 130, `${article.id}: lead exceeds 130 characters (${article.lead.length})`);
  assert.deepEqual(article.sourceIds, EXPECTED_SOURCE_IDS[article.id], `${article.id}: sourceIds changed during literary editing`);

  const sectionIndex = new Map(article.sections.map((section) => [section.heading, section]));
  const writable = WRITABLE_HEADINGS[article.id] || [];
  const expectedResearch = EXPECTED_RESEARCH_NOTES[article.id] || {};

  assert(writable.length > 0, `${article.id}: no writable context/story/comparison headings configured`);
  for (const heading of writable) {
    const section = sectionIndex.get(heading);
    assert(section, `${article.id}: missing context/story/comparison section: ${heading}`);
    assert(Array.isArray(section.body) && section.body.length > 0, `${article.id}: ${heading} body must not be empty`);
    assert(section.body.every((paragraph) => typeof paragraph === 'string' && paragraph.trim()), `${article.id}: ${heading} contains an empty paragraph`);
  }

  for (const [heading, expectedBody] of Object.entries(expectedResearch)) {
    const section = sectionIndex.get(heading);
    assert(section, `${article.id}: protected research_note heading changed or disappeared: ${heading}`);
    assert.deepEqual(section.body, expectedBody, `${article.id}: protected research_note text changed: ${heading}`);
  }

  const allResearchHeadings = new Set(Object.values(EXPECTED_RESEARCH_NOTES).flatMap((notes) => Object.keys(notes)));
  for (const section of article.sections) {
    if (allResearchHeadings.has(section.heading) && !(section.heading in expectedResearch)) {
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

console.log(`Ehime Literary Editing QA: 11/11 articles, lead limits, literary sections, sourceIds, exact research_note preservation, protected research files OK; meta-language count=${metaTotal}`);

function gitBlobSha(filePath) {
  const content = fs.readFileSync(filePath);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
}
