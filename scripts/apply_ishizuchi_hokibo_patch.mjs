import fs from 'node:fs';
import crypto from 'node:crypto';

const DATE = '2026-08-25';
const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const writeJson = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const findBy = (items, key, value, label) => {
  const found = items.find((item) => item[key] === value);
  if (!found) throw new Error(`${label}: ${key}=${value} not found`);
  return found;
};
const replaceOnce = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error(`${label}: target text not found`);
  return text.replace(from, to);
};
const gitBlobSha = (path) => {
  const content = fs.readFileSync(path);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
};

const SOURCE_IDS = [
  'SRC_ISHIZUCHI_SHAHO_765_HOKIBO',
  'SRC_ASHINAKA_116_TENGU',
  'SRC_ISHIZUCHI_OFFICIAL',
  'SRC_JAC_ISHIZUCHI_HOKIBO',
  'SRC_TENGUKYO_MIYAKE_2023'
];

// 1. legends.json — keep the existing cluster ID and public title, but make Hokibo the core.
{
  const path = 'public/data/legends.json';
  const data = readJson(path);
  data.metadata.updatedAt = DATE;
  const legend = findBy(data.legends, 'id', 'ishizuchi_tengu_cluster', path);
  legend.areaTags = ['石鎚山', '天狗岳', '修験', '法起坊', '天狗経'];
  legend.evidenceLabel = '石鎚神社公式資料と山麓の民俗採集記録で確認';
  legend.shortDescription = '石鎚山には大天狗「石鎚山法起坊」の伝承があり、山麓には高い木に来る烏天狗や小さな火、白装束の人物の天狗譚も記録されています。';
  legend.childDescription = legend.shortDescription;
  legend.sourceIds = [...SOURCE_IDS];
  legend.missions = [
    '法起坊と烏天狗は、同じ「石鎚の天狗」でも資料の中でどう違って語られているか比べてみよう',
    '「天狗経」に山の名前と天狗の坊号が並ぶ理由を考えてみよう'
  ];
  legend.quiz = [{
    question: '石鎚山の大天狗として名が伝わるのはだれですか？',
    choices: ['法起坊', '刑部狸', '波山'],
    answer: '法起坊',
    explanation: '石鎚神社の社報は、石鎚山法起坊を石鎚山を住処とする大天狗とし、「天狗経」の48天狗に数えられると紹介しています。'
  }];
  legend.notes = '法起坊＝役小角は信仰上の伝承として記す。「日本八大天狗」は数え方に揺れがあるため断定しない。「天狗経」は修験道独自の経として扱い、成立年代を固定しない。山麓の烏天狗譚と法起坊信仰は別資料系統として併記する。';
  writeJson(path, data);
}

// 2. articles.json — Hokibo first, then preserve the separately collected foothill tengu stories.
const NEW_ARTICLE = {
  id: 'ishizuchi_tengu_cluster',
  title: '石鎚山の大天狗・法起坊と山麓の天狗',
  lead: '霊峰石鎚山には、大天狗「石鎚山法起坊」の名が伝わります。一方、山麓には高い木に来る烏天狗や小さな火、白装束の人物の話も残り、石鎚の天狗伝承には複数の層があります。',
  sections: [
    {
      heading: '愛媛のどこに残る？',
      body: ['法起坊は石鎚山と結びつく大天狗として現在の石鎚信仰でも紹介されています。石鎚登山ロープウェイへ向かう表参道沿いの極楽寺には「石鎚山大天狗法起坊堂」があります。西条市の旧小松町・丹原町など山麓には、別に民俗採集された天狗の話も残ります。']
    },
    {
      heading: '山を守る大天狗・法起坊',
      body: [
        '石鎚神社の「石鎚社報」は、石鎚山法起坊を霊峰石鎚山を住処とする大天狗として紹介しています。極楽寺の法起坊堂も、法起坊を石鎚山の信仰と結びつく大天狗として伝えています。',
        '現在の信仰では、法起坊は単に人を驚かせる山の妖怪ではなく、霊山を守る高位の天狗として位置づけられています。'
      ]
    },
    {
      heading: '「天狗経」に残る「石鎚山法起坊」',
      body: [
        '石鎚神社は、法起坊を「天狗経」に名を連ねる48天狗の一つと紹介しています。「天狗経」では全国の霊山に結びつく大天狗の名が並び、その中に「石鎚山法起坊」の名が伝わります。',
        '宮家準「修験道の経・講式・和讃・唱言」では、「天狗経」は一般の大乗仏教の経とは章を分け、「修験道独自の経」の一つとして扱われています。この図鑑では成立年代を一つに断定せず、修験道系の祈りの文として紹介します。'
      ]
    },
    {
      heading: '山麓に残る烏天狗の話',
      body: [
        '一方、1969年の末広昌雄「伊予路の天狗噺」には、石鎚山を「天狗の巣」とする語り、高い木へ来る烏天狗、枝の間に見える小さな火が記録されています。',
        'また、人より早く石鎚山へ登ろうとした者が白装束の若い男に出会う話もあります。法起坊大天狗の信仰と、こうした山麓の口承は、同じ石鎚の天狗でも資料の系統を分けて読みます。'
      ]
    },
    {
      heading: '役行者との関係は「伝承」',
      body: [
        '石鎚神社は、法起坊を石鎚山を開いた役小角その人とも言われる、と紹介しています。日本山岳会の石鎚山表参道解説でも、極楽寺の伝承として法起坊を役の行者の天狗名と説明しています。',
        'ただし、これは役小角と法起坊が歴史上同一人物だったことを証明する記録ではありません。この図鑑では、石鎚信仰の中で伝えられる説として示します。'
      ]
    },
    {
      heading: '資料から分かること',
      body: ['石鎚神社の公式資料で法起坊大天狗と「天狗経」の48天狗という現在の説明を確認でき、宮家準の研究書では「天狗経」が「修験道独自の経」に分類されています。山麓の烏天狗・怪火・白装束の人物は、1969年の民俗採集記事という別資料から確認します。']
    },
    {
      heading: 'まだ分からないこと',
      body: ['法起坊信仰がいつ現在の形に成立したか、「天狗経」の各伝本で名称や配列がどう異なるかは、さらに原本調査が必要です。また、「日本八大天狗」の数え方には揺れがあるため、法起坊を八大天狗の一人と断定しません。役小角との同一視も伝承として扱います。']
    }
  ],
  sourceIds: [...SOURCE_IDS]
};

{
  const path = 'public/data/articles.json';
  const data = readJson(path);
  data.updatedAt = DATE;
  const index = data.articles.findIndex((item) => item.id === 'ishizuchi_tengu_cluster');
  if (index < 0) throw new Error(`${path}: ishizuchi_tengu_cluster not found`);
  data.articles[index] = NEW_ARTICLE;
  writeJson(path, data);

  const fixturePath = 'scripts/fixtures/ehime_11_articles.json';
  const fixture = readJson(fixturePath);
  const fixtureIndex = fixture.articles.findIndex((item) => item.id === 'ishizuchi_tengu_cluster');
  if (fixtureIndex < 0) throw new Error(`${fixturePath}: ishizuchi_tengu_cluster not found`);
  fixture.articles[fixtureIndex] = NEW_ARTICLE;
  writeJson(fixturePath, fixture);
}

// 3. sources.json — add explicit provenance for Hokibo and Tengu-kyo claims.
{
  const path = 'public/data/sources.json';
  const data = readJson(path);
  data.updatedAt = DATE;
  const additions = [
    {
      id: 'SRC_ISHIZUCHI_SHAHO_765_HOKIBO',
      title: '石鎚社報 第765号',
      organization: '石鎚神社',
      url: 'https://ishizuchisan.jp/ishizuchi_wp/wp-content/uploads/2023/11/7fc65113730ce1c8bb49b0598854c507.pdf',
      type: 'official_periodical_pdf',
      note: '石鎚山法起坊を霊峰石鎚山を住処とする大天狗とし、「天狗経」の48天狗、日本八大天狗の一人とも別格ともされること、役小角その人とも言われることを紹介する。',
      articleOrSection: '石鎚山法起坊・天狗経・八大天狗・役小角',
      authorOrEditor: null,
      informant: null,
      publicationYear: 2023,
      publicationDate: '2023-11-01',
      volumeIssue: '第765号',
      pages: '9',
      recordId: 'ISHIZUCHI-SHAHO-765',
      sourceQuality: 'official'
    },
    {
      id: 'SRC_JAC_ISHIZUCHI_HOKIBO',
      title: '石鎚山表参道',
      organization: '公益社団法人日本山岳会',
      url: 'https://kodo.jac1.or.jp/kodo120_detail/106_isiduti/',
      type: 'institutional_webpage',
      note: '石鎚山表参道沿いの極楽寺「石鎚山大天狗法起坊堂」を紹介し、法起坊大天狗を石鎚山開山の祖「役の行者」の天狗名とする現地伝承を記す。',
      articleOrSection: '石鎚山大天狗法起坊堂',
      authorOrEditor: null,
      informant: null,
      publicationYear: null,
      publicationDate: null,
      volumeIssue: null,
      pages: null,
      recordId: 'JAC-KODO120-106',
      sourceQuality: 'institutional'
    },
    {
      id: 'SRC_TENGUKYO_MIYAKE_2023',
      title: '修験道の経・講式・和讃・唱言',
      organization: '春秋社',
      url: 'https://ndlsearch.ndl.go.jp/books/R100000002-I033065211',
      type: 'scholarly_monograph',
      note: '宮家準の研究書。目次で「天狗経」を第二章「修験道独自の経」に収録し、修験道で用いられる経の中での位置づけを確認できる。',
      articleOrSection: '第二章 修験道独自の経 6 天狗経',
      authorOrEditor: '宮家準',
      informant: null,
      publicationYear: 2023,
      publicationDate: '2023-09',
      volumeIssue: null,
      pages: null,
      recordId: 'NDLBibID:033065211',
      sourceQuality: 'scholarly_monograph'
    }
  ];
  const existing = new Set(data.sources.map((item) => item.id));
  for (const source of additions) {
    if (existing.has(source.id)) {
      const index = data.sources.findIndex((item) => item.id === source.id);
      data.sources[index] = source;
    } else {
      data.sources.push(source);
    }
  }
  writeJson(path, data);
}

// 4. evidence audit — record what is supported and what remains intentionally unresolved.
{
  const path = 'public/data/evidence_check_table.json';
  const data = readJson(path);
  data.updatedAt = DATE;
  const evidence = findBy(data.legendEvidence, 'legendId', 'ishizuchi_tengu_cluster', path);
  evidence.checked = [
    '石鎚神社「石鎚社報」第765号で、石鎚山法起坊を石鎚山を住処とする大天狗とし、「天狗経」の48天狗に数えられるとする現在の公式説明を確認。',
    '日本山岳会の石鎚山表参道解説で、極楽寺の「石鎚山大天狗法起坊堂」と、法起坊を役の行者の天狗名とする現地伝承を確認。',
    '宮家準「修験道の経・講式・和讃・唱言」の目次で、「天狗経」が「修験道独自の経」に分類されていることを確認。',
    '末広昌雄「伊予路の天狗噺」で、旧小松町・丹原町など石鎚山麓の烏天狗・怪火・白装束の人物の天狗伝承を確認。',
    '石鎚神社公式資料で、天狗岳、山岳信仰、修験道の背景を確認。'
  ];
  evidence.needsFollowUp = [
    '「天狗経」の各伝本を原本画像で比較し、「石鎚山法起坊」の表記・配列差と成立・流布時期をさらに精査する。',
    '法起坊信仰がいつ現在の形に成立したかは、極楽寺・石鎚修験関係の近世以前の一次史料まで遡って確認する余地がある。',
    '「日本八大天狗」は数え方に揺れがあるため、法起坊を八大天狗の一人とは断定しない。',
    '民俗記事に記録された各集落の詳細な地点・話者は追加確認の余地がある。'
  ];
  writeJson(path, data);
}

// 5. research v2 — explicitly keep Hokibo faith and foothill folklore as separate evidence layers.
{
  const path = 'public/data/ehime_research_v2.json';
  const data = readJson(path);
  data.updatedAt = DATE;
  const item = findBy(data.items, 'id', 'ishizuchi_tengu_cluster', path);
  item.locality = {
    region: '東予・石鎚山麓',
    municipality: '西条市・石鎚山周辺',
    specificPlaces: ['石鎚山', '極楽寺・石鎚山大天狗法起坊堂', '旧小松町', '旧丹原町', '天狗岳']
  };
  item.childLead = '石鎚の天狗には、霊山を守る大天狗「石鎚山法起坊」の信仰と、山麓で採集された烏天狗・怪火・白装束の人物の話があります。二つを同じ資料の一つの物語にはせず、並べて読みます。';
  item.regionalRecords = [
    {
      place: '石鎚山・石鎚神社',
      summary: '2023年の「石鎚社報」で、法起坊を石鎚山を住処とする大天狗、「天狗経」の48天狗に数えられる存在として紹介する。',
      sourceIds: ['SRC_ISHIZUCHI_SHAHO_765_HOKIBO']
    },
    {
      place: '西条市・極楽寺',
      summary: '石鎚山表参道沿いに「石鎚山大天狗法起坊堂」があり、法起坊を役の行者の天狗名とする伝承が紹介される。',
      sourceIds: ['SRC_JAC_ISHIZUCHI_HOKIBO']
    },
    {
      place: '西条市小松町・丹原町周辺',
      summary: '石鎚山を天狗の巣とし、高い木の烏天狗、枝の間の小さな火、白装束の天狗などが記録される。',
      sourceIds: ['SRC_ASHINAKA_116_TENGU']
    },
    {
      place: '石鎚山',
      summary: '天狗岳という地名、山岳信仰と修験道の背景を公式資料で確認できる。',
      sourceIds: ['SRC_ISHIZUCHI_OFFICIAL']
    }
  ];
  item.claims = [
    {
      label: '法起坊は現在の石鎚信仰に明示される大天狗',
      text: '石鎚神社公式資料と表参道の施設解説から、法起坊大天狗が石鎚山と結びつく現在の信仰伝承として確認できる。',
      evidenceLevel: 'A',
      sourceIds: ['SRC_ISHIZUCHI_SHAHO_765_HOKIBO', 'SRC_JAC_ISHIZUCHI_HOKIBO']
    },
    {
      label: '「天狗経」は修験道独自の経として扱う',
      text: '石鎚神社は法起坊を「天狗経」の48天狗に数え、宮家準の研究書は「天狗経」を「修験道独自の経」に分類している。正統仏典と同列の経とは説明しない。',
      evidenceLevel: 'A',
      sourceIds: ['SRC_ISHIZUCHI_SHAHO_765_HOKIBO', 'SRC_TENGUKYO_MIYAKE_2023']
    },
    {
      label: '法起坊と山麓の烏天狗譚を分ける',
      text: '法起坊大天狗の信仰資料と、高木の烏天狗・怪火・白装束の人物を記す民俗採集記事は別の資料系統として併記する。',
      evidenceLevel: 'A',
      sourceIds: ['SRC_ISHIZUCHI_SHAHO_765_HOKIBO', 'SRC_ASHINAKA_116_TENGU']
    },
    {
      label: '役小角との同一視は伝承',
      text: '法起坊を役小角その人、または役の行者の天狗名とする説明は現在確認できるが、歴史上の同一人物であることの証明とは扱わない。',
      evidenceLevel: 'B',
      sourceIds: ['SRC_ISHIZUCHI_SHAHO_765_HOKIBO', 'SRC_JAC_ISHIZUCHI_HOKIBO']
    }
  ];
  item.sourceIds = [...SOURCE_IDS];
  writeJson(path, data);
}

// 6. Update validators whose freeze contracts intentionally protect the files changed above.
{
  const path = 'scripts/validate_ehime_11_traditions.mjs';
  let text = fs.readFileSync(path, 'utf8');
  text = replaceOnce(
    text,
    'ishizuchi_tengu_cluster: ["A", "石鎚山麓の民俗採集記録で確認"]',
    'ishizuchi_tengu_cluster: ["A", "石鎚神社公式資料と山麓の民俗採集記録で確認"]',
    path
  );
  fs.writeFileSync(path, text);
}

{
  const path = 'scripts/validate_ehime_literary_editing_v1.mjs';
  let text = fs.readFileSync(path, 'utf8');
  text = replaceOnce(
    text,
    "ishizuchi_tengu_cluster: ['SRC_ASHINAKA_116_TENGU', 'SRC_ISHIZUCHI_OFFICIAL']",
    "ishizuchi_tengu_cluster: ['SRC_ISHIZUCHI_SHAHO_765_HOKIBO', 'SRC_ASHINAKA_116_TENGU', 'SRC_ISHIZUCHI_OFFICIAL', 'SRC_JAC_ISHIZUCHI_HOKIBO', 'SRC_TENGUKYO_MIYAKE_2023']",
    path
  );
  text = replaceOnce(
    text,
    "ishizuchi_tengu_cluster: ['愛媛のどこに残る？', '山麓ではどう語られた？']",
    "ishizuchi_tengu_cluster: ['愛媛のどこに残る？', '山を守る大天狗・法起坊', '「天狗経」に残る「石鎚山法起坊」', '山麓に残る烏天狗の話', '役行者との関係は「伝承」']",
    path
  );
  const oldNotes = `  ishizuchi_tengu_cluster: {\n    '資料から分かること': ['民俗採集記録から確認できるのは、石鎚山を天狗の巣とする語り、高木の烏天狗、小さな火、白装束の人物などです。石鎚神社公式資料は、天狗岳や山岳信仰・修験道の歴史背景を確認する別の資料です。'],\n    'まだ分からないこと': ['各話の詳細な採集地点や話者まで、すべてのケースで特定できているわけではありません。また、山岳信仰がそのまま天狗伝承の原因だったと単純化しません。']\n  },`;
  const newNotes = `  ishizuchi_tengu_cluster: {\n    '資料から分かること': ['石鎚神社の公式資料で法起坊大天狗と「天狗経」の48天狗という現在の説明を確認でき、宮家準の研究書では「天狗経」が「修験道独自の経」に分類されています。山麓の烏天狗・怪火・白装束の人物は、1969年の民俗採集記事という別資料から確認します。'],\n    'まだ分からないこと': ['法起坊信仰がいつ現在の形に成立したか、「天狗経」の各伝本で名称や配列がどう異なるかは、さらに原本調査が必要です。また、「日本八大天狗」の数え方には揺れがあるため、法起坊を八大天狗の一人と断定しません。役小角との同一視も伝承として扱います。']\n  },`;
  text = replaceOnce(text, oldNotes, newNotes, path);

  const protectedHashes = {
    'public/data/ehime_research_v2.json': gitBlobSha('public/data/ehime_research_v2.json'),
    'public/data/evidence_check_table.json': gitBlobSha('public/data/evidence_check_table.json'),
    'public/data/sources.json': gitBlobSha('public/data/sources.json')
  };
  text = text.replace(
    /const PROTECTED_FILES = \{[\s\S]*?\n\};/,
    `const PROTECTED_FILES = {\n${Object.entries(protectedHashes).map(([file, sha]) => `  '${file}': '${sha}'`).join(',\n')}\n};`
  );
  fs.writeFileSync(path, text);
}

// Final sanity checks before the workflow commits anything.
for (const path of [
  'public/data/legends.json',
  'public/data/articles.json',
  'public/data/sources.json',
  'public/data/evidence_check_table.json',
  'public/data/ehime_research_v2.json',
  'scripts/fixtures/ehime_11_articles.json'
]) {
  JSON.parse(fs.readFileSync(path, 'utf8'));
}

console.log('Applied Ishizuchi Hokibo expansion: Hokibo core + separate foothill Karasu-tengu layer + Tengu-kyo caveats.');
