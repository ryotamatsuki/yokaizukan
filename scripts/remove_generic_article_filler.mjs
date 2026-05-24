import fs from 'node:fs';

const ARTICLE_PATH = 'yokai_detailed_articles.md';
const DATA_PATH = 'public/data/yokai.json';

let markdown = fs.readFileSync(ARTICLE_PATH, 'utf8');

const fillerPatterns = [
  /\n\n[^。\n]+の伝承を眺めると、妖怪は単なる怖い存在ではなく、暮らしや自然を考えるための語り方だったことが分かる。特徴的な姿の奥には、人々がその場所やものに向けたまなざしが残っている。\n\n/g,
  /\n\n[^。\n]+の図像は、伝承で語られた性格を目に見える形へ置き換える試みである。絵巻や浮世絵、近世の妖怪図鑑では、名前だけでは伝わりにくい気配が、表情、姿勢、背景によって読み取れるようになった。\n\n/g
];

let removed = 0;
for (const pattern of fillerPatterns) {
  markdown = markdown.replace(pattern, (match) => {
    removed += 1;
    return '\n\n';
  });
}

fs.writeFileSync(ARTICLE_PATH, `${markdown.trimEnd()}\n`, 'utf8');

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const items = Array.isArray(data) ? data : data.items;
const articles = parseMarkdownArticles(markdown);
const articleByName = new Map(articles.map((article) => [article.title, article]));

items.forEach((item) => {
  const article = articleByName.get(item.name);
  if (!article || !item.detailedArticle) {
    return;
  }
  item.detailedArticle.body = article.body;
});

if (Array.isArray(data)) {
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
} else {
  data.items = items;
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({
  removed,
  remainingTraditionFiller: count(/の伝承を眺めると、妖怪は単なる怖い存在ではなく/g, markdown),
  remainingImageFiller: count(/の図像は、伝承で語られた性格を目に見える形へ置き換える試みである/g, markdown)
}, null, 2));

function parseMarkdownArticles(source) {
  const matches = [...source.matchAll(/^# (.+)$/gm)];
  const articles = [];
  for (let index = 0; index < matches.length; index += 1) {
    const title = matches[index][1].trim();
    if (title.includes('記事原稿集')) {
      continue;
    }

    const start = matches[index].index;
    const end = index + 1 < matches.length ? matches[index + 1].index : source.length;
    const chunk = source.slice(start, end);
    const bodyPart = chunk.includes('\n## 参考リンク') ? chunk.slice(0, chunk.indexOf('\n## 参考リンク')) : chunk;
    const lines = bodyPart.split(/\r?\n/);
    const body = [];
    let current = [];

    lines.forEach((line) => {
      if (/^#\s+/.test(line) || /^##\s+/.test(line) || line.trim() === '---') {
        flush();
        return;
      }
      if (!line.trim()) {
        flush();
        return;
      }
      current.push(line.trim());
    });

    flush();
    articles.push({ title, body });

    function flush() {
      if (current.length > 0) {
        body.push(current.join(' '));
        current = [];
      }
    }
  }
  return articles;
}

function count(pattern, source) {
  return (source.match(pattern) || []).length;
}
