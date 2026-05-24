import fs from 'node:fs';

const ARTICLE_PATH = 'yokai_detailed_articles.md';
const DATA_PATH = 'public/data/yokai.json';

const closingParagraphs = {
  gashadokuro: 'がしゃどくろ / 巨大骸骨の怖さは、骨そのものよりも、忘れられた声が大きな姿を取るところにある。月明かりの中に立つ巨大な影は、昔話が人の記憶をどれほど大きく育てるかを示している。',
  'karasu-tengu': '烏天狗を読むと、山の上を吹く風や鳥の視線が、人間の世界を少し離れた場所から見ていることに気づく。翼を持つ天狗は、山を歩く者に、足もとだけでなく頭上の気配にも注意を向けさせる。',
  'hitotsume-kozo': '一つ目小僧は、大きな力で人を襲う妖怪ではなく、見られることの驚きを形にした存在である。たった一つの目があるだけで、いつもの道や家は、急にこちらを見返す場所へ変わる。',
  'zashiki-warashi': '座敷童子は、家の豊かさを金銀だけでなく、笑い声や人の出入り、長く続く暮らしとして考えさせる妖怪である。見えない子どもの気配は、家がただの建物ではなく、記憶を抱える場所であることを教えている。',
  bakeneko: '化け猫の面白さは、よく知っているはずの猫が、夜になると別の顔を持つところにある。人間のすぐそばにいる動物だからこそ、親しみと不安が重なり、妖怪として長く語られてきた。',
  kitsunebi: '狐火は、遠くの小さな光を見た人が、そこに案内と迷いの両方を感じたことから生まれる。夜道でゆれる灯りは、目的地を示すようでいて、いつの間にか別の世界へ誘うしるしにもなる。',
  'bake-danuki': '化け狸は、人をだますだけの妖怪ではなく、景色の見え方そのものをゆるめる存在である。村の近くにいる狸が、笑いといたずらを通して、人間の思い込みを少しずらしてみせる。',
  akaname: '垢嘗は、家の中の汚れや湿り気を、目に見える妖怪として引き受けている。怖がらせるためだけでなく、毎日の手入れを忘れないための、生活に近い妖怪である。',
  'azuki-arai': '小豆洗いは、姿を見せないまま音で人を立ち止まらせる。水辺の音に耳を澄ませると、自然の音と誰かの作業音の境目があいまいになり、そこに妖怪の居場所が生まれる。',
  umibozu: '海坊主は、海をただの背景ではなく、人間を包みこむ巨大な相手として感じさせる妖怪である。沖の暗さに立ち上がる影は、海と向き合って暮らしてきた人々の畏れを映している。',
  ningyo: '人魚は、海の底を知らない人間の想像から生まれた、境界の存在である。美しさ、長寿、不吉さが一つに重なることで、海は近くの浜辺でありながら、遠い異国のようにも見えてくる。',
  wanyudo: '輪入道は、動く道具が人間の手を離れたときの不安を背負っている。車輪の回転は便利さのしるしであると同時に、止められない力のしるしにもなる。',
  kamaitachi: '鎌鼬は、見えない風に名前を与えた妖怪である。何が起こったのか分からない一瞬を、風の中を走る小さなものとして想像することで、人は不思議な出来事を語れるようになった。',
  kodama: '木霊は、森を静かな資源としてではなく、声を返す相手として見る感覚から生まれている。木に宿るものを思うことは、森の時間が人間の時間よりずっと長いことを思い出すことでもある。',
  yamanba: '山姥は、山の恐ろしさだけでなく、山で生きる知恵や孤独も背負っている。村の外側にいる女性の姿を通して、山は人を拒む場所であり、同時に別の暮らしがある場所として立ち上がる。',
  oonyudo: '大入道は、夜の闇がものの大きさを変えてしまう感覚をよく表している。見上げるほど大きな姿は、外から来た怪物というより、人の不安が影の中でふくらんだ姿である。',
  tsuchigumo: '土蜘蛛は、地面の下や山の奥に、都の人々が理解しきれない力を見たことから生まれた存在である。蜘蛛の巣のように張りめぐらされた物語は、怪物退治の話だけでなく、中心と周縁の関係も映している。',
  nue: '鵺の魅力は、はっきりしないことにある。いくつもの動物の特徴を重ねた姿は、正体の分からない声や雲に、人間が形を与えようとした結果である。',
  hitodama: '人魂は、亡くなった人への思いを、夜の小さな光として見る想像から生まれる。怖さの奥には、消えてしまった命を何かの形で感じたいという、人間の静かな願いがある。',
  'tofu-kozo': '豆腐小僧は、江戸の町のゆとりや遊び心をよく伝える妖怪である。強い力を持たなくても、豆腐を運ぶ子どもの姿だけで、町角に小さな物語を生むことができる。',
  'hyakki-yagyo': '百鬼夜行は、一体の妖怪ではなく、夜という時間そのものが行列になる想像である。道具、人影、獣、古い話が一列に並ぶことで、町の夜は大きな絵巻へ変わる。',
  mokumokuren: '目目連は、家を見る側だった人間が、逆に家から見られる側へ回る瞬間を描いている。古い障子の目は、住まいにも時間が積もり、人の視線を受け返す力があることを思わせる。',
  nuppeppo: 'ぬっぺっぽうは、意味が分からないものを、分からないまま残しておく面白さを持つ。名前をつけにくい形だからこそ、夜道の奇妙さや町のすみの気配を受け止める器になっている。',
  shiro_uneri: '白うねりは、古い布がしまわれたまま忘れられることへの想像から生まれている。使われなくなったものが、ただ消えるのではなく、ふわりと動き出すところに付喪神のやさしい怖さがある。',
  fumikuruma_yohi: '文車妖妃は、紙に残された言葉が、時間を越えて人を動かすことを示している。手紙や本は静かなものだが、そこに込められた思いは、妖怪になるほど強く残ることがある。',
  koto_furunushi: '琴古主は、音が鳴り終わった後にも、楽器に記憶が残ると考える感覚から生まれる。古い琴を妖怪として見ることは、ものに宿る時間と、かつてそこにいた人の気配を聞くことでもある。',
  kaichigo: '貝児は、浜辺で拾える小さなものにも、海の広さが宿ることを教えている。貝殻の中に妖怪を思うと、波が運んできたもの一つひとつが、小さな物語の入口に見えてくる。',
  abura_sumashi: '油すましは、山道でふと耳にする古い話そのもののような妖怪である。石の顔をした静かな姿は、旅人に、道には人より長くそこにいるものがあると知らせている。',
  sunekosuri: 'すねこすりは、足もとにまとわりつく小さな違和感を、怖すぎない形で妖怪にした存在である。遠くの怪物よりも近い場所にいるからこそ、夜道の感覚をよく表している。',
  sunakake_baba: '砂かけ婆は、見えない相手に邪魔されたような体験を、老婆のしぐさとして語れるようにした妖怪である。砂が舞う一瞬に、道ばたの気配やいたずらの感覚が集まっている。',
  konaki_jiji: '子泣き爺は、山の中で聞こえる声に、人がどう応じるかを考えさせる妖怪である。助けたい気持ちと警戒する気持ちが重なるところに、この妖怪の重さがある。',
  betobeto_san: 'べとべとさんは、誰もいないはずの後ろを気にしてしまう心から生まれている。姿がないからこそ、足音だけで十分に妖怪になれることを示す、音と距離の怪異である。',
  okuri_inu: '送り犬は、山道を歩く人と一定の距離を保つ妖怪である。守るのか、試すのか、追うのかがはっきりしないところに、峠道の緊張がそのまま残っている。',
  enenra: '煙々羅は、形がほどけるものに人が顔や姿を見いだす感覚を表している。煙はつかめないからこそ、見る人の想像を受け取り、現れては消える妖怪になる。',
  ame_onna: '雨女は、雨の日の空気に人の感情を重ねた妖怪である。濡れた道や低い雲は、町を静かに変え、その中に立つ女性の姿を、天気そのもののように見せる。',
  kamikiri: '髪切りは、体に近いものが突然変えられる不安を映している。髪は身だしなみであり、記憶であり、個人のしるしでもあるため、小さな怪異が深い違和感へつながる。',
  ittan_momen: '一反木綿は、布と風だけで妖怪が生まれることをよく示している。軽く、白く、ひらひらと動く姿は、怖さよりも、ものが空を得たときの不思議さを伝えている。',
  ubume: 'うぶめ / 産女は、命の誕生と別れをめぐる昔の不安を、夜道の女性の姿に託した妖怪である。恐ろしさだけでなく、助けを求める声や残された思いを聞き取ることが大切である。',
  ushi_oni: '牛鬼は、一つの土地だけでは説明しきれない広がりを持つ妖怪である。海辺や山里ごとに姿を変えることで、その地域が感じてきた自然の力を、大きな怪物として語り続けている。',
  hyosube: 'ひょうすべは、河童に似ていながら、地域の水辺に残る別の手ざわりを持っている。水草や泥の匂い、夕方の川音に近いところで、この妖怪は河童とは違う表情を見せる。',
  daidarabotchi: 'だいだらぼっちは、妖怪を小さな怪異としてではなく、土地の形を説明する大きな物語として見せてくれる。山や湖を眺めることが、そのまま巨人の足あとを読むことにつながる。'
};

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const items = Array.isArray(data) ? data : data.items;
const itemById = new Map(items.map((item) => [item.id, item]));

let markdown = fs.readFileSync(ARTICLE_PATH, 'utf8');
let refined = 0;

for (const [id, closing] of Object.entries(closingParagraphs)) {
  const item = itemById.get(id);
  if (!item) {
    continue;
  }

  const heading = `# ${item.name}\n`;
  const start = markdown.indexOf(heading);
  if (start < 0) {
    continue;
  }

  const nextStart = markdown.indexOf('\n# ', start + heading.length);
  const end = nextStart >= 0 ? nextStart : markdown.length;
  const section = markdown.slice(start, end);
  const parsed = parseArticleSection(section);
  if (parsed.body.length < 5) {
    continue;
  }

  const placeParagraph = parsed.body[2];
  const body = [
    makeOpeningParagraph(item),
    makeContextParagraph(item),
    placeParagraph,
    makeImageParagraph(item),
    closing
  ];

  const nextSection = [
    `# ${item.name}`,
    `## ${parsed.subtitle}`,
    '',
    body.join('\n\n'),
    '',
    parsed.referenceBlock || makeReferenceBlock(item),
    parsed.hasSeparator ? '---' : ''
  ].filter((part) => part !== '').join('\n');

  markdown = `${markdown.slice(0, start)}${nextSection}${markdown.slice(end)}`;
  refined += 1;
}

fs.writeFileSync(ARTICLE_PATH, `${markdown.trimEnd()}\n`, 'utf8');

const articles = parseMarkdownArticles(markdown);
const articleByName = new Map(articles.map((article) => [article.title, article]));

items.forEach((item) => {
  const article = articleByName.get(item.name);
  if (!article || !item.detailedArticle) {
    return;
  }
  item.detailedArticle.title = article.title;
  item.detailedArticle.subtitle = article.subtitle;
  item.detailedArticle.body = article.body;
});

if (Array.isArray(data)) {
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
} else {
  data.items = items;
  data.updatedAt = '2026-05-24';
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const repeatedOpening = countOccurrences(markdown, '子ども向けの図鑑では分かりやすい姿に整理しているが、妖怪はもともと一つの決まった姿だけを持っていたわけではない。');
const repeatedClosing = countOccurrences(markdown, 'を深く読むときは、「本当にいたかどうか」だけを考えるのではなく、なぜそのような妖怪が必要とされたのかを考えると面白い。');
const targetDesuMasu = Object.keys(closingParagraphs).filter((id) => {
  const item = itemById.get(id);
  const article = item?.detailedArticle?.body || [];
  return article.some((paragraph) => /です。|ます。|でした。|ました。/.test(paragraph));
});

console.log(JSON.stringify({
  refined,
  repeatedOpening,
  repeatedClosing,
  targetDesuMasu
}, null, 2));

function makeOpeningParagraph(item) {
  const name = item.name;
  const category = item.category || '妖怪';
  const features = toArray(item.visualFeatures).slice(0, 3).join('、') || '特徴的な姿';

  if (category.includes('水') || category.includes('海')) {
    return `${name}は、まず水辺や海の気配とともに思い浮かべたい妖怪である。${features}という特徴は、姿を見分けるためだけでなく、水の近くで人が感じてきた期待や不安を形にしている。`;
  }
  if (category.includes('山') || category.includes('森')) {
    return `${name}は、山や森の奥行きを背負って語られる妖怪である。${features}という特徴は、山道で出会う相手としての不思議さを強め、人の暮らす場所の外側に広がる世界を感じさせる。`;
  }
  if (category.includes('付喪神') || category.includes('道具')) {
    return `${name}は、ものが長く使われるうちに別の表情を持つという発想から読みたい妖怪である。${features}という見た目は、道具がただの道具で終わらず、記憶をまとって動き出す感覚を伝えている。`;
  }
  if (category.includes('家') || category.includes('くらし')) {
    return `${name}は、遠い異界よりも、家や暮らしのすぐそばに現れる妖怪である。${features}という特徴を手がかりにすると、日常の中にふと生まれる違和感が見えてくる。`;
  }
  if (category.includes('動物')) {
    return `${name}は、人間の近くにいる動物が、もう一つの顔を持つと考えられた妖怪である。${features}という特徴は、親しみのある動物が夜や物語の中で変化する面白さを示している。`;
  }
  return `${name}は、${category}として整理できるが、その姿は一つの説明だけでは収まりきらない。${features}という特徴を入口にすると、伝承や絵の中で重ねられてきた複数の意味が見えてくる。`;
}

function makeContextParagraph(item) {
  const name = item.name;
  const category = item.category || '妖怪';

  if (category.includes('火')) {
    return `${name}の伝承では、火や光が持つ二面性が重要になる。火は人を安心させるが、夜の中でゆれると正体の分からないしるしにもなる。そのあいまいさが、妖怪としての存在感を強めている。`;
  }
  if (category.includes('音') || category.includes('気配')) {
    return `${name}は、見える姿よりも、音や背後の気配によって立ち上がる。人は分からないものを目で確かめようとするが、確かめられないからこそ想像がふくらむ。この妖怪は、その不確かさを物語に変えている。`;
  }
  if (category.includes('巨大')) {
    return `${name}には、普通の人間の大きさでは測れないものへの畏れがある。大きな体や影は、自然、土地、過去の出来事を、ひと目で感じられる姿に変える。`;
  }
  if (category.includes('幽霊') || category.includes('怪異')) {
    return `${name}は、はっきりした怪物というより、境目に現れる気配として理解しやすい。人の世界とそうでない世界が重なる場面で、説明しきれない感覚が妖怪の姿を取る。`;
  }
  return `${name}の伝承を眺めると、妖怪は単なる怖い存在ではなく、暮らしや自然を考えるための語り方だったことが分かる。特徴的な姿の奥には、人々がその場所やものに向けたまなざしが残っている。`;
}

function makeImageParagraph(item) {
  const name = item.name;
  const category = item.category || '';

  if (category.includes('付喪神') || category.includes('道具')) {
    return `${name}を絵にするときは、道具らしさと妖怪らしさの釣り合いが大切になる。目や手足を付けすぎればただの人物に近づき、道具の形を残しすぎれば動きが弱くなる。その中間に、付喪神らしい面白さがある。`;
  }
  if (category.includes('動物')) {
    return `${name}の図像では、動物としての親しみやすさを残しながら、尾、目つき、姿勢などに異界の気配を加えることが多い。見慣れた動物が少しだけ違って見えるところに、動物変化の魅力がある。`;
  }
  if (category.includes('水') || category.includes('海')) {
    return `${name}の図像では、体の特徴だけでなく、水面、波、岸辺、湿った空気が重要な背景になる。妖怪の姿と水の表情を一緒に描くことで、その存在がどのような場所から生まれたかが伝わる。`;
  }
  if (category.includes('山') || category.includes('森')) {
    return `${name}の絵では、山伏風の装い、木々、霧、岩場など、山の記号が妖怪の性格を支える。姿だけを切り取るより、山の気配とともに見ることで、伝承の奥行きが増す。`;
  }
  return `${name}の図像は、伝承で語られた性格を目に見える形へ置き換える試みである。絵巻や浮世絵、近世の妖怪図鑑では、名前だけでは伝わりにくい気配が、表情、姿勢、背景によって読み取れるようになった。`;
}

function parseArticleSection(section) {
  const refIndex = section.indexOf('\n## 参考リンク');
  const beforeRefs = refIndex >= 0 ? section.slice(0, refIndex) : section;
  const afterRefs = refIndex >= 0 ? section.slice(refIndex).trim() : '';
  const hasSeparator = /---\s*$/.test(afterRefs);
  const referenceBlock = afterRefs.replace(/\n?---\s*$/, '').trim();
  const article = parseArticleChunk(beforeRefs);
  return {
    ...article,
    referenceBlock,
    hasSeparator
  };
}

function parseArticleChunk(chunk) {
  const lines = chunk
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '---');

  let title = '';
  let subtitle = '';
  const body = [];
  let current = [];

  for (const line of lines) {
    if (/^#\s+/.test(line)) {
      title = line.replace(/^#\s+/, '').trim();
      flush();
      continue;
    }
    if (/^##\s+/.test(line)) {
      if (!subtitle) {
        subtitle = line.replace(/^##\s+/, '').trim();
      }
      flush();
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    current.push(line.trim());
  }

  flush();
  return { title, subtitle, body };

  function flush() {
    if (current.length > 0) {
      body.push(current.join(' '));
      current = [];
    }
  }
}

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
    const parsed = parseArticleSection(source.slice(start, end));
    articles.push({ title, subtitle: parsed.subtitle, body: parsed.body });
  }
  return articles;
}

function makeReferenceBlock(item) {
  const references = item.detailedArticle?.references || [];
  const lines = references.map((reference) => `- [${reference.title}](${reference.url})${reference.note ? ` - ${reference.note}` : ''}`);
  return `## 参考リンク\n${lines.join('\n')}`;
}

function toArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function countOccurrences(source, needle) {
  return source.split(needle).length - 1;
}
