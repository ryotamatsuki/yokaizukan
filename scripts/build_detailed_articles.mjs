import fs from 'node:fs';

const DATA_PATH = 'public/data/yokai.json';
const ARTICLE_PATH = 'yokai_detailed_articles.md';
const UPDATED_AT = '2026-05-24';

const COMMON_REFERENCES = [
  {
    title: '国立国会図書館「NDLイメージバンク 妖怪」',
    source: '国立国会図書館',
    url: 'https://www.ndl.go.jp/imagebank/yokai',
    note: '妖怪画・古典資料を調べる入口'
  },
  {
    title: '鳥山石燕の妖怪図鑑でみる妖怪の世界',
    source: '国立国会図書館',
    url: 'https://www.ndl.go.jp/imagebank/column/sekienyokai',
    note: '江戸時代の妖怪図鑑と図像の参考'
  },
  {
    title: 'Japan Search',
    source: 'Japan Search',
    url: 'https://jpsearch.go.jp/',
    note: '作品名・妖怪名で横断検索する入口'
  },
  {
    title: 'ColBase',
    source: '国立文化財機構',
    url: 'https://colbase.nich.go.jp/',
    note: '所蔵作品・文化財情報を調べる入口'
  }
];

const TSUKUMOGAMI_REFERENCE = {
  title: '付喪神絵巻',
  source: '国立国会図書館 NDLイメージバンク',
  url: 'https://www.ndl.go.jp/imagebank/theme/tsukumogami',
  note: '古道具が妖怪化する物語の参考'
};

const ARTICLE_TITLES = {
  gashadokuro: '巨大な骨が語る、戦乱と絵の迫力',
  'karasu-tengu': '鳥の姿を残す、山と空の天狗',
  'hitotsume-kozo': '一つの目が見せる、身近な怪異',
  'zashiki-warashi': '家の中に宿る、幸運と記憶',
  bakeneko: '猫へのまなざしが生んだ変化の妖怪',
  kitsunebi: '夜道にゆれる、狐と火の不思議',
  'bake-danuki': '化ける力と笑いを持つ里の妖怪',
  akaname: '掃除と暮らしの境目にいる妖怪',
  'azuki-arai': '音だけで近づく、川辺の小さな怪異',
  umibozu: '海の暗さと大きさを背負う影',
  ningyo: '海の向こうへの想像が生んだ存在',
  wanyudo: '車輪と炎が語る、道の戒め',
  kamaitachi: '風の速さに名を与えた妖怪',
  kodama: '木と山に宿る声を聞く',
  yamanba: '山の暮らしと怖さを映す女性像',
  oonyudo: '大きくなる姿が語る、夜道の不安',
  tsuchigumo: '土の底から現れる異界のもの',
  nue: '正体の分からなさが形を得た怪物',
  hitodama: '光と魂を結びつける夜の怪異',
  'tofu-kozo': '豆腐を運ぶ、江戸のかわいい妖怪',
  'hyakki-yagyo': '夜を行く妖怪たちの行列',
  mokumokuren: '古い家がこちらを見返すとき',
  nuppeppo: '形の定まらない不思議さ',
  shiro_uneri: '古い布が命を持つ付喪神',
  fumikuruma_yohi: '手紙と文箱に宿る思い',
  koto_furunushi: '古い琴が奏でる記憶',
  kaichigo: '貝から生まれる海辺の小さな妖怪',
  abura_sumashi: '山道でふり返らせる石の顔',
  sunekosuri: '足もとに寄り添う夜道の気配',
  sunakake_baba: '砂をまく音と道ばたの怪異',
  konaki_jiji: '泣き声と重さが語る山道の不安',
  betobeto_san: '後ろからついてくる足音',
  okuri_inu: '山道を見守る犬の妖怪',
  enenra: '煙の中に立ち上がる姿',
  ame_onna: '雨とともに現れる静かな妖怪',
  kamikiri: '髪と身だしなみにまつわる怪異',
  ittan_momen: '空を飛ぶ白い布の妖怪',
  ubume: '夜道と川辺に残る母の怪異',
  ushi_oni: '地域で姿を変える大きな怪物',
  hyosube: '河童に近く、少し違う水辺の妖怪',
  daidarabotchi: '山や湖を作るほど大きな存在'
};

const CATEGORY_THEMES = {
  '水辺': '水の恵みと危険',
  '山・森': '山や森への畏れ',
  '鬼・怪物': '異界の力と人間の不安',
  '付喪神': '道具に宿る記憶',
  '家・くらし': '暮らしの中の小さな怪異',
  '幽霊・怪異': '姿のはっきりしない不思議',
  '動物変化': '人と動物の近さ',
  '自然・天気': '天気や自然の力',
  '道・怪異': '旅や夜道の不安',
  '音・気配': '見えない気配への想像',
  '巨大妖怪': '土地の大きさと伝説'
};

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const items = Array.isArray(data) ? data : data.items;

if (!Array.isArray(items)) {
  throw new Error('public/data/yokai.json の items が配列ではありません。');
}

const originalMarkdown = fs.existsSync(ARTICLE_PATH)
  ? fs.readFileSync(ARTICLE_PATH, 'utf8')
  : '# 子ども向け妖怪図鑑「もっと詳しく」記事原稿集\n';

const existingArticles = parseMarkdownArticles(originalMarkdown);
const markdownByName = new Map(existingArticles.map((article) => [article.title, article]));
const missingItems = items.filter((item) => !markdownByName.has(item.name));

if (missingItems.length > 0) {
  const additions = missingItems.map(generateMarkdownArticle).join('\n');
  const separator = originalMarkdown.trimEnd().endsWith('---') ? '\n\n' : '\n\n---\n\n';
  fs.writeFileSync(ARTICLE_PATH, `${originalMarkdown.trimEnd()}${separator}${additions}\n`, 'utf8');
}

const fullMarkdown = fs.readFileSync(ARTICLE_PATH, 'utf8');
const articles = parseMarkdownArticles(fullMarkdown);
const articleMap = new Map(articles.map((article) => [article.title, article]));

items.forEach((item) => {
  const article = articleMap.get(item.name) || makeGeneratedArticle(item);
  item.detailedArticle = {
    title: article.title,
    subtitle: article.subtitle || ARTICLE_TITLES[item.id] || `${item.name}を深く読む`,
    body: article.body.length > 0 ? article.body : makeArticleParagraphs(item),
    sourceNote: '伝承・古典画・妖怪図鑑類の記述をもとに、断定しすぎない読み物として整理しています。原典確認には下のリンクを入口として利用してください。',
    references: dedupeReferences([...(article.references || []), ...buildReferences(item)])
  };
});

if (!Array.isArray(data)) {
  data.version = Math.max(Number(data.version || 1), 4);
  data.updatedAt = UPDATED_AT;
  data.items = items;
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
} else {
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({
  total: items.length,
  markdownArticles: articles.length,
  generatedMarkdownArticles: missingItems.length,
  missingDetailedArticle: items.filter((item) => !item.detailedArticle).map((item) => item.id)
}, null, 2));

function parseMarkdownArticles(markdown) {
  const matches = [...markdown.matchAll(/^# (.+)$/gm)];
  const articles = [];

  for (let index = 0; index < matches.length; index += 1) {
    const title = matches[index][1].trim();
    if (title.includes('記事原稿集')) {
      continue;
    }

    const start = matches[index].index + matches[index][0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : markdown.length;
    const chunk = markdown.slice(start, end).trim();
    const article = parseArticleChunk(title, chunk);
    articles.push(article);
  }

  return articles;
}

function parseArticleChunk(title, chunk) {
  const lines = chunk
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '---');

  let subtitle = '';
  const paragraphLines = [];
  const references = [];
  let current = [];
  let inReferenceBlock = false;

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      const heading = line.replace(/^##\s+/, '').trim();
      if (!subtitle) {
        subtitle = heading;
      }
      inReferenceBlock = heading.includes('参考');
      flush();
      continue;
    }

    if (inReferenceBlock) {
      const reference = parseMarkdownReference(line);
      if (reference) {
        references.push(reference);
      }
      continue;
    }

    if (!line.trim()) {
      flush();
      continue;
    }

    current.push(line.trim());
  }

  flush();

  return {
    title,
    subtitle,
    body: paragraphLines,
    references
  };

  function flush() {
    if (current.length > 0) {
      paragraphLines.push(current.join(' '));
      current = [];
    }
  }
}

function parseMarkdownReference(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('- ')) {
    return null;
  }

  const markdownLink = trimmed.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)(?:\s+-\s+(.+))?$/);
  if (markdownLink) {
    const [, title, url, note = ''] = markdownLink;
    return {
      title,
      source: '',
      url,
      note
    };
  }

  return {
    title: trimmed.replace(/^-\s+/, ''),
    source: '',
    url: '',
    note: ''
  };
}

function generateMarkdownArticle(item) {
  const article = makeGeneratedArticle(item);
  const referenceLines = buildReferences(item)
    .map((reference) => `- [${reference.title}](${reference.url})${reference.note ? ` - ${reference.note}` : ''}`)
    .join('\n');

  return `# ${article.title}
## ${article.subtitle}

${article.body.join('\n\n')}

## 参考リンク
${referenceLines}

---`;
}

function makeGeneratedArticle(item) {
  return {
    title: item.name,
    subtitle: ARTICLE_TITLES[item.id] || `${item.category}から読む${item.name}`,
    body: makeArticleParagraphs(item)
  };
}

function makeArticleParagraphs(item) {
  const name = item.name;
  const category = item.category || '妖怪';
  const theme = CATEGORY_THEMES[category] || '人々の想像と暮らし';
  const habitat = toArray(item.habitat).join('、') || '人々の暮らしの近く';
  const features = toArray(item.visualFeatures).slice(0, 4).join('、') || item.oneLine || '特徴的な姿';
  const oneLine = item.oneLine || `${name}は昔から語られてきた妖怪です。`;
  const description = item.childDescription || oneLine;
  const trivia = item.trivia || '地域や資料によって、姿や性格が少しずつ違って語られることがあります。';
  const openingParagraph = makeFallbackOpeningParagraph(item, features);
  const placeParagraph = makeFallbackPlaceParagraph(item, habitat, theme);
  const closingParagraph = makeFallbackClosingParagraph(item);

  return [
    openingParagraph,
    `${name}を古典画や伝承の流れの中で見ると、${theme}と深く関わる存在として読むことができる。${description} こうした説明は、単に怖がらせるためだけではなく、昔の人々が自然や道具、夜道、家の中の気配をどのように感じていたかを伝える手がかりになる。`,
    placeParagraph,
    `図像としての${name}は、伝承そのものと、絵巻・浮世絵・近世の妖怪図鑑などの出版文化の中で形を与えられてきたイメージを分けて考える必要がある。絵に描かれると、名前だけだった怪異は、目、手足、道具、背景を持つ。そこから後の図鑑や児童向けの本で、より見分けやすい姿へ整えられていく。現代のイメージは、その長い変化の途中にある。`,
    closingParagraph
  ];
}

function makeFallbackOpeningParagraph(item, features) {
  const name = item.name;
  const category = item.category || '妖怪';
  return `${name}は、${category}として整理できるが、姿や意味は一通りではない。${features}という特徴を入口にすると、伝承の中で語られた気配と、絵に描かれることで強まった印象の両方を読み取ることができる。`;
}

function makeFallbackPlaceParagraph(item, habitat, theme) {
  const name = item.name;
  const category = item.category || '';

  if (category.includes('水') || category.includes('海')) {
    return `${name}の場面を考えるときは、${habitat}の水音、湿った空気、岸辺から先が見えにくくなる感覚が大切である。水は暮らしを助ける一方で、深さや流れを隠す。${name}は、その水辺に人が近づくときの期待と用心を、ひとつの姿にまとめた妖怪として読むことができる。`;
  }

  if (category.includes('山') || category.includes('森')) {
    return `${name}が現れる${habitat}は、村の明かりが遠のき、道や方角が分かりにくくなる場所である。山や森は食べ物や木をもたらす一方で、人を迷わせる力も持つ。${name}は、その場所に入るときの畏れや緊張を背負っている。`;
  }

  if (category.includes('付喪神') || category.includes('家') || category.includes('道具')) {
    return `${name}の舞台である${habitat}には、長く使われたものや、家の中に残る生活の気配がある。道具や部屋は黙っているように見えるが、古びるほど記憶を持つもののように感じられる。${name}は、身近なものがふと別の顔を見せる瞬間から生まれる妖怪である。`;
  }

  if (category.includes('動物')) {
    return `${name}が現れる${habitat}は、人間の暮らしと動物の行動範囲が重なる場所である。見慣れた動物でも、夜や暗がりでは別の力を持つように見える。${name}は、動物への親しみと警戒が同時に立ち上がる場面から生まれている。`;
  }

  return `${name}を理解するには、${habitat}という場面に立ってみることが大切である。そこでは、${theme}が人の感覚に強く働き、いつもの景色が少し違って見える。${name}は、場所に残る気配や不安を、分かりやすい妖怪の姿へ変えたものとして読むことができる。`;
}

function makeFallbackClosingParagraph(item) {
  const name = item.name;
  const category = item.category || '妖怪';
  return `${name}を読み終えると、${category}という分類だけでは収まりきらない、場所や暮らしの感覚が残る。妖怪は答えを一つに決めるためではなく、昔の人々が不思議な出来事を語り合うための形でもあった。`;
}

function buildReferences(item) {
  const references = [
    ...toArray(item.textReferenceUrls).map(normalizeReference),
    ...COMMON_REFERENCES
  ];

  if (item.category === '付喪神' || toArray(item.visualFeatures).some((feature) => /道具|布|傘|提灯|琴|手紙|文箱/.test(feature))) {
    references.push(TSUKUMOGAMI_REFERENCE);
  }

  references.push({
    title: `NDLサーチ「${item.name}」`,
    source: '国立国会図書館サーチ',
    url: `https://ndlsearch.ndl.go.jp/search?keyword=${encodeURIComponent(item.name)}`,
    note: '書誌・デジタル資料を妖怪名で探す入口'
  });

  return dedupeReferences(references)
    .filter((reference) => reference.title && reference.url)
    .slice(0, 8);
}

function normalizeReference(reference) {
  if (typeof reference === 'string') {
    return {
      title: reference,
      source: '',
      url: reference,
      note: ''
    };
  }

  return {
    title: reference.title || reference.name || reference.source || reference.url || '',
    source: reference.source || reference.provider || reference.name || '',
    url: reference.url || reference.sourcePageUrl || reference.href || '',
    note: reference.note || reference.description || ''
  };
}

function dedupeReferences(references) {
  const seen = new Set();
  return references.filter((reference) => {
    const key = reference.url || `${reference.title}-${reference.source}`;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}
