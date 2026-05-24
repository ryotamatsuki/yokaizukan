import fs from 'node:fs';

const DATA_PATH = 'public/data/yokai.json';
const PROMPTS_PATH = 'public/data/generation_prompts.json';
const UPDATED_AT = '2026-05-24';
const NEGATIVE_PROMPT = 'blood, gore, horror, realistic violence, sexy, modern anime character, copyrighted character';

const referenceUrls = [
  { title: '妖怪', source: 'NDLイメージバンク', url: 'https://www.ndl.go.jp/imagebank/yokai' },
  { title: '鳥山石燕の妖怪図鑑でみる妖怪の世界', source: 'NDLイメージバンク', url: 'https://www.ndl.go.jp/imagebank/column/sekienyokai' },
  { title: '付喪神絵巻', source: 'NDLイメージバンク', url: 'https://www.ndl.go.jp/imagebank/theme/tsukumogami' },
  { title: 'Japan Search', source: 'Japan Search', url: 'https://jpsearch.go.jp/' }
];

const additions = [
  {
    id: 'mokumokuren',
    name: '目目連',
    kana: 'もくもくれん',
    nameEn: 'Mokumokuren',
    category: '家・くらし',
    oneLine: '古い障子やふすまに、たくさんの目が現れる妖怪。',
    childDescription: '目目連は、古い家の障子やふすまに、たくさんの目が現れる妖怪といわれています。じっと見られているようで少しどきどきしますが、この図鑑では家の中を見守るふしぎな目として紹介します。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '昔の家では障子やふすまが身近でした。そこに目が出るという発想から、家の中の小さな不思議が妖怪になったのかもしれません。',
    habitat: ['古い家', '障子', 'ふすま'],
    visualFeatures: ['障子やふすまに目がたくさんある', '家の中にあらわれる', '体ははっきり見えない', '目がこちらを見ているように見える'],
    generatedImagePath: 'public/assets/yokai/generated/mokumokuren.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[1]],
    notes: '古い家の怪異として、目の数を多くしすぎず子ども向けに整理。',
    missions: ['家の中で妖怪になりそうな場所を考えてみよう', '目がたくさんある妖怪をほかにも探してみよう'],
    quiz: [{ question: '目目連は、どこに目が現れる妖怪といわれていますか？', choices: ['障子やふすま', '川の中', '山の頂上'], answer: '障子やふすま', explanation: '目目連は、古い家の障子やふすまにたくさんの目が現れる妖怪として知られています。' }],
    tags: ['目', '障子', '家', 'ふすま'],
    visualPrompt: ['古い障子にたくさんの目', '古い日本家屋', 'コミカルな視線', '怖すぎない'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。古い障子やふすまにたくさんの目が現れる目目連。目は好奇心のある表情で、古い家の中を見守るように描く。和紙水彩、墨線、シンプル背景、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Mokumokuren: many curious eyes appearing on old shoji and fusuma screens inside an old Japanese room. Gentle washi watercolor and sumi outlines, simple background, not scary.'
  },
  {
    id: 'nuppeppo',
    name: 'ぬっぺっぽう',
    kana: 'ぬっぺっぽう',
    nameEn: 'Nuppeppo',
    category: '幽霊・怪異',
    oneLine: 'やわらかなかたまりのような、奇妙で不思議な妖怪。',
    childDescription: 'ぬっぺっぽうは、夜道や人気の少ない場所に現れる、ふしぎなかたまりのような妖怪といわれています。形がはっきりしないところが特徴です。こわさよりも、何だろうと首をかしげる奇妙さを大切にしました。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: 'ぬっぺっぽうは、はっきりした道具や動物の姿ではなく、正体の分からないものへの不思議さから語られる妖怪です。',
    habitat: ['夜道', '古い町', '人気の少ない場所'],
    visualFeatures: ['丸くやわらかい形', '体の形がはっきりしない', '小さな目や口がある', 'ゆっくり歩くように見える'],
    generatedImagePath: 'public/assets/yokai/generated/nuppeppo.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[1]],
    notes: 'グロテスクさを避け、丸い不思議な姿として再解釈。',
    missions: ['形がはっきりしない妖怪を絵にしてみよう', '夜道に出そうな不思議な音を考えてみよう'],
    quiz: [{ question: 'ぬっぺっぽうは、どんな姿で語られることが多いですか？', choices: ['ふしぎなかたまり', '空飛ぶ布', '大きな車輪'], answer: 'ふしぎなかたまり', explanation: 'ぬっぺっぽうは、やわらかいかたまりのような奇妙な姿で語られる妖怪です。' }],
    tags: ['夜道', '怪異', 'かたまり', '不思議'],
    visualPrompt: ['やわらかいかたまり', '小さな目', '夜道', '奇妙だが親しみやすい'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。ぬっぺっぽうを丸くやわらかなかたまりの妖怪として描く。小さな目と口で奇妙だが親しみやすい表情。和紙水彩、墨線、夜道のシンプル背景、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Nuppeppo as a soft rounded lump-like yokai with tiny friendly eyes, on a quiet old night road. Washi watercolor, sumi outlines, simple background, odd but not scary.'
  },
  {
    id: 'shiro_uneri',
    name: '白うねり',
    kana: 'しろうねり',
    nameEn: 'Shiro-uneri',
    category: '付喪神',
    oneLine: '古い白い布が、うねうね動き出した付喪神。',
    childDescription: '白うねりは、古くなった白い布が妖怪になったものといわれます。ふわりとうねりながら、物置や古い家に現れることがあります。長く使われた道具や布に心が宿る、付喪神の考え方が分かる妖怪です。',
    scaryLevel: 2,
    scaryLabel: 'ちょっとふしぎ',
    trivia: '付喪神は、長く使われた道具に心が宿るという考えから生まれました。白うねりは、布が生き物のように動く想像から生まれた妖怪です。',
    habitat: ['古い家', '物置', '古い布のある場所'],
    visualFeatures: ['白い布の姿', 'うねうねと波打つ', '小さな顔がある', '空中をふわっと動く'],
    generatedImagePath: 'public/assets/yokai/generated/shiro_uneri.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[2], referenceUrls[0]],
    notes: '一反木綿と混同しすぎないよう、古布の付喪神として説明。',
    missions: ['古い道具が妖怪になる理由を考えてみよう', '布から生まれる妖怪をもう一体想像してみよう'],
    quiz: [{ question: '白うねりは、何が妖怪になったものといわれますか？', choices: ['古い白い布', '古い石', '古い貝'], answer: '古い白い布', explanation: '白うねりは、古くなった白い布が妖怪になった付喪神として知られています。' }],
    tags: ['付喪神', '布', '白', '物置'],
    visualPrompt: ['白い古布', 'うねる布', '付喪神', '物置'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。古い白い布がうねうね動く白うねり。小さな顔を付け、物置にふわっと現れる。和紙水彩、墨線、シンプル背景、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Shiro-uneri, an old white cloth tsukumogami waving like a soft ribbon with a small gentle face in an old storage room. Washi watercolor, sumi outlines, not scary.'
  },
  {
    id: 'fumikuruma_yohi',
    name: '文車妖妃',
    kana: 'ふみぐるまようひ',
    nameEn: 'Fumikuruma-yohi',
    category: '付喪神',
    oneLine: '古い手紙や文箱にまつわる、上品でふしぎな妖怪。',
    childDescription: '文車妖妃は、古い手紙や文箱にまつわる妖怪として語られます。昔は手紙が大切な気持ちを運ぶものでした。その思いが積もって、ふしぎな姿になったように考えると、少し切なくて美しい妖怪です。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '文車とは、手紙や文を入れて運ぶ道具のことです。本や手紙を大切にした時代の空気を感じられる妖怪です。',
    habitat: ['古い手紙', '本', '文箱のある場所'],
    visualFeatures: ['古い手紙や紙片をまとっている', '文箱と関係がある', '女性のような姿で描かれることがある', '紙がふわりと舞う'],
    generatedImagePath: 'public/assets/yokai/generated/fumikuruma_yohi.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[2], referenceUrls[1]],
    notes: '古い手紙の妖怪として、上品で怖すぎない雰囲気に調整。',
    missions: ['大切な手紙が妖怪になったらどんな姿か考えてみよう', '紙や本に関係する妖怪を図鑑から探してみよう'],
    quiz: [{ question: '文車妖妃は、何にまつわる妖怪ですか？', choices: ['古い手紙や文箱', '川の石', '山の木'], answer: '古い手紙や文箱', explanation: '文車妖妃は、古い手紙や文箱にまつわる妖怪として語られます。' }],
    tags: ['付喪神', '手紙', '文箱', '紙'],
    visualPrompt: ['古い手紙', '文箱', '紙片が舞う', '上品な怪異'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。古い手紙や文箱から現れる文車妖妃。紙片がふわっと舞い、上品でふしぎな姿。和紙水彩、墨線、古い書斎のシンプル背景、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Fumikuruma-yohi, a graceful spirit of old letters and a document box, paper slips floating softly. Washi watercolor, sumi outlines, simple old study, not scary.'
  },
  {
    id: 'koto_furunushi',
    name: '琴古主',
    kana: 'ことふるぬし',
    nameEn: 'Koto-furunushi',
    category: '付喪神',
    oneLine: '古い琴が妖怪になった、音楽好きの付喪神。',
    childDescription: '琴古主は、長く使われた琴が妖怪になった付喪神です。古い屋敷や楽器のある部屋に現れ、弦をふるわせるように音を出すといわれます。この図鑑では、音楽を奏でるやさしい妖怪として紹介します。',
    scaryLevel: 2,
    scaryLabel: 'ちょっとふしぎ',
    trivia: '琴は日本の伝統的な楽器です。大切に使われた楽器が妖怪になるという考えは、道具を大切にする気持ちにもつながります。',
    habitat: ['古い屋敷', '楽器のある部屋'],
    visualFeatures: ['琴の姿をしている', '弦が見える', '小さな顔がある', '音のような模様がただよう'],
    generatedImagePath: 'public/assets/yokai/generated/koto_furunushi.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[2], referenceUrls[0]],
    notes: '楽器の付喪神として、音符風の演出と相性がよい。',
    missions: ['楽器が妖怪になったらどんな音を出すか考えてみよう', '身の回りの古い道具を一つ選んで妖怪にしてみよう'],
    quiz: [{ question: '琴古主は、どんな道具が妖怪になったものですか？', choices: ['琴', '傘', '提灯'], answer: '琴', explanation: '琴古主は、古い琴が妖怪になった付喪神です。' }],
    tags: ['付喪神', '琴', '音楽', '楽器'],
    visualPrompt: ['古い琴', '弦', '音の妖怪', '古い屋敷'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。古い琴が妖怪になった琴古主。弦が見え、小さな顔と音のゆらぎがある。和紙水彩、墨線、古い畳の部屋、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Koto-furunushi, an old Japanese koto tsukumogami with expressive strings and a gentle face. Washi watercolor, sumi outlines, simple tatami music room, not scary.'
  },
  {
    id: 'kaichigo',
    name: '貝児',
    kana: 'かいちご',
    nameEn: 'Kaichigo',
    category: '水辺',
    oneLine: '貝の中から顔を出す、海辺の小さくかわいい妖怪。',
    childDescription: '貝児は、貝に関係する小さな妖怪として紹介します。浜辺の貝の中から、ひょっこり顔を出すような姿です。海坊主のように大きな海の妖怪とは違い、波打ちぎわで出会えそうなかわいい妖怪です。',
    scaryLevel: 1,
    scaryLabel: 'かわいい',
    trivia: '貝は昔から遊びや飾りにも使われました。小さな貝の中に命があるように感じる想像から、貝の妖怪を考えることができます。',
    habitat: ['海辺', '浜辺', '貝のある場所'],
    visualFeatures: ['貝の中から顔を出す', '小さな体', '海辺にいる', '丸くかわいい表情'],
    generatedImagePath: 'public/assets/yokai/generated/kaichigo.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '海辺の低こわさ妖怪として、人魚や海坊主と対比できるように追加。',
    missions: ['浜辺で妖怪になりそうなものを考えてみよう', '小さな水辺の妖怪を図鑑から探してみよう'],
    quiz: [{ question: '貝児は、どんな場所にいる妖怪として紹介していますか？', choices: ['海辺や浜辺', '雪山', '古い屋根裏'], answer: '海辺や浜辺', explanation: '貝児は、貝に関係する海辺の小さな妖怪として扱っています。' }],
    tags: ['海', '貝', '浜辺', 'かわいい'],
    visualPrompt: ['貝の中の小さな妖怪', '浜辺', 'かわいい', '泡'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。大きな貝から小さな貝児が顔を出す。浜辺、貝殻、小さな波を入れる。和紙水彩、墨線、明るくかわいい雰囲気。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Kaichigo, a tiny cute shell-child yokai peeking from a seashell on a beach. Washi watercolor, sumi outlines, simple seaside background, not scary.'
  },
  {
    id: 'abura_sumashi',
    name: '油すまし',
    kana: 'あぶらすまし',
    nameEn: 'Abura-sumashi',
    category: '道・怪異',
    oneLine: '石のような顔で山道に現れる、油にまつわる妖怪。',
    childDescription: '油すましは、石のような顔をした妖怪として語られます。山道や古い峠に現れるといわれ、油にまつわる話と結びついています。無口で不思議な表情が特徴で、道ばたでじっと立っていそうな妖怪です。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '昔は油が大切な明かりや暮らしの道具でした。油すましの話から、昔の人の暮らしを少し想像できます。',
    habitat: ['山道', '石の多い道', '古い峠'],
    visualFeatures: ['石のような丸い顔', '小さな体', '山道にいる', '油壺や灯りを思わせるものがある'],
    generatedImagePath: 'public/assets/yokai/generated/abura_sumashi.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '油と道の怪異として、顔の個性を中心に説明。',
    missions: ['山道に置いてありそうな古い道具を考えてみよう', '石のような顔の妖怪を描いてみよう'],
    quiz: [{ question: '油すましは、どんな顔で表現しましたか？', choices: ['石のような顔', '魚の顔', '鳥の顔'], answer: '石のような顔', explanation: '油すましは、石のような顔をした山道の妖怪として紹介しています。' }],
    tags: ['山道', '油', '石', '峠'],
    visualPrompt: ['石のような顔', '山道', '油壺', '古い峠'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。油すましを石のような顔と小さな体で描く。山道、石、油壺や小さな灯りを添える。和紙水彩、墨線、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Abura-sumashi, a small yokai with a stone-like face on a rocky mountain path, with an oil jar or small lamp. Washi watercolor, sumi outlines, not scary.'
  },
  {
    id: 'sunekosuri',
    name: 'すねこすり',
    kana: 'すねこすり',
    nameEn: 'Sunekosuri',
    category: '動物変化',
    oneLine: '夜道で足もとにすり寄る、小動物のような妖怪。',
    childDescription: 'すねこすりは、夜道を歩く人の足もとにすり寄る妖怪といわれています。ころんとした小動物のような姿で、こわいというより少し困ってしまう存在です。この図鑑では、足もとに寄ってくるかわいい妖怪として描いています。',
    scaryLevel: 1,
    scaryLabel: 'かわいい',
    trivia: '名前の通り、すねのあたりにこすりつく妖怪です。暗い道で足もとに何かが当たる感じを、妖怪として想像したのかもしれません。',
    habitat: ['夜道', '足もと', '暗い道'],
    visualFeatures: ['小動物のような姿', '低い位置にいる', 'ふわふわした体', '足もとにすり寄る'],
    generatedImagePath: 'public/assets/yokai/generated/sunekosuri.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '子ども向けの癒やし枠として、かわいらしさを中心に調整。',
    missions: ['足もとにいそうな小さな妖怪を考えてみよう', '動物に似た妖怪を図鑑から三体探してみよう'],
    quiz: [{ question: 'すねこすりは、どこにすり寄る妖怪といわれますか？', choices: ['足もと', '屋根の上', '海の底'], answer: '足もと', explanation: 'すねこすりは、夜道で人の足もとにすり寄る妖怪といわれます。' }],
    tags: ['動物', '足もと', '夜道', 'かわいい'],
    visualPrompt: ['小動物の妖怪', '足もと', '夜道', 'ふわふわ'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。すねこすりを小さくふわふわした動物のような妖怪として描く。足もとに寄り添い、夜道の雰囲気。和紙水彩、墨線、かわいい。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Sunekosuri, a tiny fluffy animal-like yokai rubbing against a traveler’s lower leg on a dim road. Washi watercolor, sumi outlines, cute and not scary.'
  },
  {
    id: 'sunakake_baba',
    name: '砂かけ婆',
    kana: 'すなかけばば',
    nameEn: 'Sunakake-baba',
    category: '家・くらし',
    oneLine: '道ばたで砂をさらっとかける、いたずら好きな老婆妖怪。',
    childDescription: '砂かけ婆は、道ばたや古い家の近くで砂をかける妖怪といわれています。こわい顔でおどかすよりも、いたずら好きなおばあさんのように考えると分かりやすい妖怪です。砂の動きが大きな特徴です。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '砂をかけるという動きは、急に目の前が見えにくくなる不思議なできごとを妖怪として語ったものとも考えられます。',
    habitat: ['道ばた', '古い家の近く'],
    visualFeatures: ['年を重ねた女性の姿', '砂を持っている', '道ばたに現れる', '砂粒が舞っている'],
    generatedImagePath: 'public/assets/yokai/generated/sunakake_baba.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '怖すぎない老婆妖怪として、砂の演出を特徴にする。',
    missions: ['砂や土に関係する妖怪を考えてみよう', 'いたずら好きな妖怪の特徴を書いてみよう'],
    quiz: [{ question: '砂かけ婆の特徴はどれですか？', choices: ['砂をかける', '琴を鳴らす', '雪を降らせる'], answer: '砂をかける', explanation: '砂かけ婆は、名前の通り砂をかける妖怪として語られます。' }],
    tags: ['砂', '老婆', '道', 'いたずら'],
    visualPrompt: ['砂をかける老婆妖怪', '道ばた', '砂粒', '怖すぎない'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。砂かけ婆を道ばたのいたずら好きなおばあさん妖怪として描く。手元から砂粒がさらっと舞う。和紙水彩、墨線、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Sunakake-baba, an elderly yokai gently tossing a small amount of sand by an old roadside. Washi watercolor, sumi outlines, playful and not too scary.'
  },
  {
    id: 'konaki_jiji',
    name: '子泣き爺',
    kana: 'こなきじじい',
    nameEn: 'Konaki-jiji',
    category: '山・森',
    oneLine: '山道で泣き声が聞こえる、不思議な小さなお爺さん妖怪。',
    childDescription: '子泣き爺は、山道や森の中で泣き声が聞こえる妖怪といわれています。赤ちゃんのように泣き、だんだん重くなるという話もあります。この図鑑では、山の不思議な声として、こわすぎない姿で紹介します。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '山では、風や動物の声が人の声のように聞こえることがあります。子泣き爺は、そんな山の音の不思議と結びついた妖怪かもしれません。',
    habitat: ['山道', '森の中'],
    visualFeatures: ['小さなお爺さんの姿', '泣き顔をしている', '山道にいる', '丸い体つき'],
    generatedImagePath: 'public/assets/yokai/generated/konaki_jiji.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '重さや泣き声を怖くしすぎず、山の怪異として表現。',
    missions: ['山で聞こえそうな不思議な音を考えてみよう', '森にいる妖怪を図鑑から探してみよう'],
    quiz: [{ question: '子泣き爺は、どんな場所に出るといわれますか？', choices: ['山道や森', '海の底', '町の屋根'], answer: '山道や森', explanation: '子泣き爺は、山道や森の中に現れる妖怪として語られます。' }],
    tags: ['山', '森', '泣き声', 'お爺さん'],
    visualPrompt: ['小さなお爺さん妖怪', '山道', '泣き声', '怖すぎない'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。子泣き爺を山道にいる小さなお爺さん妖怪として描く。少し泣き顔だがコミカルでやさしい。和紙水彩、墨線、森の背景。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Konaki-jiji, a small old-man yokai with a comical teary face on a mountain path. Washi watercolor, sumi outlines, gentle and not scary.'
  },
  {
    id: 'betobeto_san',
    name: 'べとべとさん',
    kana: 'べとべとさん',
    nameEn: 'Betobeto-san',
    category: '音・気配',
    oneLine: '夜道で後ろから足音がついてくる、気配の妖怪。',
    childDescription: 'べとべとさんは、夜道を歩いていると後ろから足音がついてくる妖怪といわれています。姿ははっきり見えず、音や気配で感じる妖怪です。振り返ると少しどきどきしますが、道をゆずると通りすぎるともいわれます。',
    scaryLevel: 2,
    scaryLabel: 'ちょっとふしぎ',
    trivia: '姿が見えない妖怪は、音や気配を想像する楽しさがあります。べとべとさんは、暗い道で聞こえる足音の不思議から生まれたのかもしれません。',
    habitat: ['夜道', '暗い道', '後ろから足音が聞こえる場所'],
    visualFeatures: ['姿ははっきりしない', '足あとが目印', '小さな影のように見える', '後ろからついてくる気配がある'],
    generatedImagePath: 'public/assets/yokai/generated/betobeto_san.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '姿より音と気配を中心にした妖怪として実装。',
    missions: ['足音だけで分かる妖怪を考えてみよう', '姿が見えにくい妖怪を図鑑から探してみよう'],
    quiz: [{ question: 'べとべとさんは、何で存在を感じる妖怪ですか？', choices: ['足音や気配', '甘い香り', '大きな波'], answer: '足音や気配', explanation: 'べとべとさんは、後ろからついてくる足音や気配の妖怪として語られます。' }],
    tags: ['音', '気配', '夜道', '足あと'],
    visualPrompt: ['足あと', '見えない妖怪', '夜道', '小さな影'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。べとべとさんを、夜道に続くかわいい足あとと小さな影の気配で表現する。和紙水彩、墨線、シンプル背景、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Betobeto-san as cute glowing footprints and a small soft shadow on a quiet night road. Washi watercolor, sumi outlines, mysterious but not scary.'
  },
  {
    id: 'okuri_inu',
    name: '送り犬',
    kana: 'おくりいぬ',
    nameEn: 'Okuri-inu',
    category: '動物変化',
    oneLine: '夜の山道で、人のあとを静かについてくる犬の妖怪。',
    childDescription: '送り犬は、夜道や山道で人についてくる犬の妖怪といわれています。少しこわい存在ですが、道を歩く人を見守るように語られることもあります。この図鑑では、静かな影を持つ山道の犬として紹介します。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '送り犬の話は地域によって少しずつ違います。山道を歩くときの緊張感や、後ろに何かいるような気配から生まれたのかもしれません。',
    habitat: ['山道', '峠道', '夜道'],
    visualFeatures: ['犬の姿をしている', '夜道で後ろからついてくる', '長い影がある', '静かな目をしている'],
    generatedImagePath: 'public/assets/yokai/generated/okuri_inu.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '動物妖怪として緊張感はあるが、攻撃的にしない。',
    missions: ['夜道で出会いそうな動物妖怪を考えてみよう', '犬や猫に似た妖怪を図鑑から探してみよう'],
    quiz: [{ question: '送り犬は、どんな道で人についてくるといわれますか？', choices: ['山道や夜道', '明るい教室', '海の底'], answer: '山道や夜道', explanation: '送り犬は、山道や夜道で人のあとをついてくる犬の妖怪として語られます。' }],
    tags: ['犬', '山道', '夜道', '影'],
    visualPrompt: ['犬の妖怪', '山道', '夜', '長い影'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。送り犬を夜の山道で静かについてくる犬の妖怪として描く。長い影とやさしい目。和紙水彩、墨線、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Okuri-inu, a quiet dog yokai following on a mountain road at night with a soft long shadow. Washi watercolor, sumi outlines, tense but not violent.'
  },
  {
    id: 'enenra',
    name: '煙々羅',
    kana: 'えんえんら',
    nameEn: 'Enenra',
    category: '幽霊・怪異',
    oneLine: 'ゆらゆらした煙の中に、ふわっと姿を見せる妖怪。',
    childDescription: '煙々羅は、煙の中に現れる妖怪といわれています。形ははっきりせず、ゆらゆらと流れる煙の中に顔や体が見えるようです。この図鑑では、たき火や古い家の煙から生まれる、ふしぎでやわらかな妖怪として描きます。',
    scaryLevel: 2,
    scaryLabel: 'ちょっとふしぎ',
    trivia: '煙は風で形を変えます。昔の人は、そのゆらぎの中に顔や生き物の姿を見つけ、妖怪として想像したのかもしれません。',
    habitat: ['煙のある場所', 'たき火', '古い家'],
    visualFeatures: ['煙のような体', '形がはっきりしない', '顔がうっすら見える', 'ゆらゆら動く'],
    generatedImagePath: 'public/assets/yokai/generated/enenra.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[1]],
    notes: '煙の粒子やゆらぎを使い、怖すぎない形にする。',
    missions: ['煙や雲の形から何が見えるか想像してみよう', '形が変わる妖怪を図鑑から探してみよう'],
    quiz: [{ question: '煙々羅は、何の中に現れる妖怪ですか？', choices: ['煙', '貝殻', '雪玉'], answer: '煙', explanation: '煙々羅は、煙の中にふわっと姿を見せる妖怪といわれています。' }],
    tags: ['煙', '火', '怪異', 'ゆらぎ'],
    visualPrompt: ['煙の妖怪', 'たき火', '半透明', 'ゆらゆら'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。煙々羅をたき火や囲炉裏の煙の中に現れる半透明の妖怪として描く。煙にやさしい顔が見える。和紙水彩、墨線、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Enenra, a translucent smoke yokai with a gentle face appearing above a safe hearth. Washi watercolor, sumi outlines, soft smoky forms, not scary.'
  },
  {
    id: 'ame_onna',
    name: '雨女',
    kana: 'あめおんな',
    nameEn: 'Ame-onna',
    category: '自然・天気',
    oneLine: '雨の日にしずかに現れる、天気にまつわる女性の妖怪。',
    childDescription: '雨女は、雨を連れてくるように語られる妖怪です。しとしと降る雨の日や、雲の多い道に現れるといわれます。雪女と同じように自然のふしぎと結びついた存在として、暗すぎないやさしい姿で紹介します。',
    scaryLevel: 2,
    scaryLabel: 'ちょっとふしぎ',
    trivia: '雨は作物や川にとって大切なものです。雨女の話には、雨をこわがる気持ちだけでなく、雨を待つ気持ちも入っているかもしれません。',
    habitat: ['雨の日', '雲の多い道', 'しめった場所'],
    visualFeatures: ['雨の中に立つ女性の姿', '傘や雨よけを持つことがある', 'しずかな雰囲気', '雲や雨粒がまわりにある'],
    generatedImagePath: 'public/assets/yokai/generated/ame_onna.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '雪女と対になる天気系妖怪として、悲しすぎない雰囲気にする。',
    missions: ['雨の日に出そうな妖怪を考えてみよう', '天気に関係する妖怪を図鑑から探してみよう'],
    quiz: [{ question: '雨女は、どんな天気と関係が深い妖怪ですか？', choices: ['雨', '晴れ', '砂あらし'], answer: '雨', explanation: '雨女は、雨の日や雨を連れてくる話と結びついた妖怪です。' }],
    tags: ['雨', '天気', '女性', '自然'],
    visualPrompt: ['雨の女性妖怪', '傘', '雨粒', 'しずか'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。雨女をしとしと雨の中に立つやさしい女性妖怪として描く。傘、雲、雨粒。和紙水彩、墨線、暗すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Ame-onna, a gentle rain woman in a pale kimono under soft rain with umbrella and clouds. Washi watercolor, sumi outlines, calm and not scary.'
  },
  {
    id: 'kamikiri',
    name: '髪切り',
    kana: 'かみきり',
    nameEn: 'Kamikiri',
    category: '家・くらし',
    oneLine: '夜に髪へ近づくといわれる、はさみの気配の妖怪。',
    childDescription: '髪切りは、夜に突然髪を切るといわれる妖怪です。直接こわい場面にはせず、この図鑑では、はさみの影や髪のゆらぎで不思議さを表します。昔の人が、身だしなみや夜の気配を妖怪として考えたのかもしれません。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '髪は昔から大切なものと考えられてきました。髪切りの話には、髪を大切にする気持ちや、夜の家の不思議さが表れているようです。',
    habitat: ['夜の家', '暗い部屋', '髪を結う場所'],
    visualFeatures: ['はさみのような形がある', '髪の影がゆれる', '夜の部屋に現れる', '小さくすばやい印象'],
    generatedImagePath: 'public/assets/yokai/generated/kamikiri.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[1]],
    notes: '直接的な恐怖表現は避け、はさみの影で軽い怪異として扱う。',
    missions: ['家の中の身近なものから妖怪を考えてみよう', 'すばやく動きそうな妖怪を図鑑から探してみよう'],
    quiz: [{ question: '髪切りは、何に関係する妖怪ですか？', choices: ['髪', '貝', '山の湖'], answer: '髪', explanation: '髪切りは、髪を切るという不思議な出来事に関係する妖怪です。' }],
    tags: ['髪', 'はさみ', '夜', '家'],
    visualPrompt: ['はさみの妖怪', '髪の影', '夜の部屋', '怖すぎない'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。髪切りを、はさみの影と髪のゆらぎで表す小さな妖怪として描く。夜の部屋、鏡、和紙水彩、墨線、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Kamikiri, a small mysterious yokai with safe stylized scissor motifs and floating hair ribbons in an old room. Washi watercolor, sumi outlines, no injury.'
  },
  {
    id: 'ittan_momen',
    name: '一反木綿',
    kana: 'いったんもめん',
    nameEn: 'Ittan-momen',
    category: '付喪神',
    oneLine: '白い木綿の布が、夜空をひらひら飛ぶ妖怪。',
    childDescription: '一反木綿は、白い布が空を飛ぶ妖怪としてよく知られています。風にのって、夜道や空をひらひら進む姿が特徴です。こわいというより、ふわっと空からやってくる分かりやすい付喪神として紹介します。',
    scaryLevel: 2,
    scaryLabel: 'ちょっとふしぎ',
    trivia: '一反は布の長さを表す言葉です。身近な布が生き物のように空を飛ぶ想像は、付喪神の楽しさをよく表しています。',
    habitat: ['空', '夜道', '風の強い場所'],
    visualFeatures: ['長い白い布の姿', '空を飛ぶ', 'ひらひら動く', '小さな顔があることもある'],
    generatedImagePath: 'public/assets/yokai/generated/ittan_momen.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[2], referenceUrls[0]],
    notes: '白うねりと区別し、空を飛ぶ布妖怪として説明。',
    missions: ['風にのって飛びそうなものを考えてみよう', '布から生まれる妖怪を想像してみよう'],
    quiz: [{ question: '一反木綿は、何が空を飛ぶ妖怪ですか？', choices: ['白い布', '大きな石', '赤い車輪'], answer: '白い布', explanation: '一反木綿は、白い木綿の布が空を飛ぶ妖怪として知られています。' }],
    tags: ['付喪神', '布', '空', '風'],
    visualPrompt: ['飛ぶ白い布', '夜空', '風', '付喪神'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。一反木綿を夜空をひらひら飛ぶ長い白い布の妖怪として描く。小さなやさしい顔、風の線。和紙水彩、墨線、明るく軽い。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Ittan-momen, a long white cotton cloth yokai flying like a friendly ribbon through the night sky. Washi watercolor, sumi outlines, light and not scary.'
  },
  {
    id: 'ubume',
    name: 'うぶめ / 産女',
    kana: 'うぶめ',
    nameEn: 'Ubume',
    category: '幽霊・怪異',
    oneLine: '雨の夜や川辺に現れる、霧の中のふしぎな女性の怪異。',
    childDescription: 'うぶめは、夜道や川辺に現れる女性の怪異として語られます。こわい話もありますが、この図鑑では霧の中にしずかに立つふしぎな姿として紹介します。暗く悲しすぎないよう、やわらかな雨と霧で表現します。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: 'うぶめの話は地域や時代によって語られ方が違います。ここでは、夜の雨や川辺の不思議さと結びつく妖怪として扱います。',
    habitat: ['夜道', '川辺', '雨の夜'],
    visualFeatures: ['女性の姿', '霧や雨の中にいる', '白っぽい着物を着ることがある', 'しずかで不思議な雰囲気'],
    generatedImagePath: 'public/assets/yokai/generated/ubume.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[1]],
    notes: '怖く悲しい表現に寄せすぎず、霧の怪異として再解釈。',
    missions: ['霧の中に現れそうな妖怪を考えてみよう', '雨や川辺に関係する妖怪を探してみよう'],
    quiz: [{ question: 'うぶめは、この図鑑ではどんな場所に現れる怪異として紹介していますか？', choices: ['雨の夜や川辺', '明るい砂浜', '火山の上'], answer: '雨の夜や川辺', explanation: 'うぶめは、夜道や川辺、雨の夜に現れる女性の怪異として紹介しています。' }],
    tags: ['雨', '霧', '川辺', '女性'],
    visualPrompt: ['霧の女性怪異', '川辺', '雨の夜', '怖すぎない'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。うぶめを雨の夜の川辺に立つ霧の中の女性の怪異として描く。やわらかな霧と雨、白い着物。和紙水彩、墨線、暗くしすぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Ubume, a mysterious woman in pale kimono standing gently in river mist on a rainy night path. Washi watercolor, sumi outlines, not tragic or scary.'
  },
  {
    id: 'ushi_oni',
    name: '牛鬼',
    kana: 'うしおに',
    nameEn: 'Ushi-oni',
    category: '鬼・怪物',
    oneLine: '牛のような頭や大きな体をもつ、地域色のある怪物妖怪。',
    childDescription: '牛鬼は、牛のような頭や大きな体をもつ怪物として語られます。地域によって姿が少しずつ違うため、ひとつの形に決めすぎないことが大切です。この図鑑では、海辺に立つ力強い妖怪として紹介します。',
    scaryLevel: 4,
    scaryLabel: 'こわい',
    trivia: '牛鬼は四国や西日本など、さまざまな地域の伝承に登場します。地域によって姿や話が変わるところも、妖怪のおもしろさです。',
    habitat: ['海辺', '川辺', '山', '地域の伝承地'],
    visualFeatures: ['牛のような頭', '角があることがある', '大きな体', '海辺や川辺と結びつくことがある'],
    generatedImagePath: 'public/assets/yokai/generated/ushi_oni.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '地域差があるため断定を避け、牛頭と大きな体を中心に表現。',
    missions: ['地域によって姿が変わる妖怪を調べてみよう', '強そうだけど怖すぎない怪物を描いてみよう'],
    quiz: [{ question: '牛鬼は、どんな特徴を持つ怪物として語られますか？', choices: ['牛のような頭や大きな体', '小さな貝の体', '白い布だけの体'], answer: '牛のような頭や大きな体', explanation: '牛鬼は、牛のような頭や大きな体をもつ怪物妖怪として語られます。' }],
    tags: ['牛', '鬼', '怪物', '地域伝承'],
    visualPrompt: ['牛の頭', '大きな怪物', '海辺', '地域妖怪'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。牛鬼を牛のような頭と大きな体の怪物妖怪として描く。海辺や岩場、力強いが怖すぎない目。和紙水彩、墨線。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Ushi-oni, a large regional monster with a bull-like head and sturdy body near a rocky shore. Washi watercolor, sumi outlines, powerful but not terrifying.'
  },
  {
    id: 'hyosube',
    name: 'ひょうすべ',
    kana: 'ひょうすべ',
    nameEn: 'Hyosube',
    category: '水辺',
    oneLine: '河童に近いとされる、水辺にすむ小さな妖怪。',
    childDescription: 'ひょうすべは、川や池などの水辺にすむ妖怪として語られます。河童に近い仲間のように扱われることもありますが、地域や話によって姿はさまざまです。この図鑑では、少し茶色っぽい表情豊かな水辺の妖怪として描きます。',
    scaryLevel: 2,
    scaryLabel: 'ちょっとふしぎ',
    trivia: '河童に似た水辺の妖怪は、各地にいろいろな名前で伝わっています。ひょうすべも、水辺への想像が生んだ妖怪のひとつです。',
    habitat: ['川', '池', '水辺'],
    visualFeatures: ['小さな水辺の妖怪', '河童に近い姿で語られることがある', '表情が豊か', '川や池のそばにいる'],
    generatedImagePath: 'public/assets/yokai/generated/hyosube.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '河童との差は画像の色味と表情で出し、説明では地域差を残す。',
    missions: ['河童とひょうすべの似ているところを探してみよう', '水辺にいる妖怪を図鑑から集めてみよう'],
    quiz: [{ question: 'ひょうすべは、どんな場所にすむ妖怪として扱いますか？', choices: ['川や池の水辺', '雪山の上', '古い琴の中'], answer: '川や池の水辺', explanation: 'ひょうすべは、河童に近い水辺の妖怪として紹介しています。' }],
    tags: ['水辺', '川', '池', '河童に近い'],
    visualPrompt: ['水辺の妖怪', '河童と違う表情', '川辺', '小さな体'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。ひょうすべを河童に近いが違う水辺の小さな妖怪として描く。茶色がかった体、表情豊か、川辺。和紙水彩、墨線、怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Hyosube, a small water-side yokai related to kappa but distinct, greenish-brown body and mischievous gentle face by a riverbank. Washi watercolor, sumi outlines.'
  },
  {
    id: 'daidarabotchi',
    name: 'だいだらぼっち',
    kana: 'だいだらぼっち',
    nameEn: 'Daidarabotchi',
    category: '巨大妖怪',
    oneLine: '山や湖を作ったともいわれる、ものすごく大きな巨人。',
    childDescription: 'だいだらぼっちは、山や湖を作ったとされることもある、とても大きな存在です。怖い怪物というより、土地の形にまつわる巨人の伝承として語られます。この図鑑では、山より大きく見えるやさしい巨人として紹介します。',
    scaryLevel: 3,
    scaryLabel: '少しこわい',
    trivia: '大きな足あとが池になった、山を動かしたなど、土地の形を説明する話と結びつくことがあります。地図を見る楽しみにもつながる妖怪です。',
    habitat: ['山', '湖', '広い野原'],
    visualFeatures: ['山より大きく見える', '巨人の姿', '大きな足あとがある', '山や湖と結びつく'],
    generatedImagePath: 'public/assets/yokai/generated/daidarabotchi.png',
    historicalImages: [],
    textReferenceUrls: [referenceUrls[0], referenceUrls[3]],
    notes: '怖い怪物ではなく、地形伝承の巨人として表現。',
    missions: ['大きな妖怪が作れそうな地形を考えてみよう', '山や湖にまつわる伝説を調べてみよう'],
    quiz: [{ question: 'だいだらぼっちは、何にまつわる大きな存在として語られますか？', choices: ['山や湖などの地形', '小さな貝殻', '古い手紙'], answer: '山や湖などの地形', explanation: 'だいだらぼっちは、山や湖を作ったというような地形の伝承と結びつく巨人です。' }],
    tags: ['巨大', '巨人', '山', '湖'],
    visualPrompt: ['巨大な巨人', '山と湖', '足あと', 'やさしい表情'],
    promptJa: '子ども向け妖怪図鑑の正方形イラスト。だいだらぼっちを山や湖より大きい巨人として描く。大きな足あと、広い野原、やさしい表情。和紙水彩、墨線、迫力はあるが怖すぎない。',
    promptEn: 'Square children’s yokai encyclopedia illustration of Daidarabotchi, an enormous gentle giant behind mountains and a lake with a huge footprint in a field. Washi watercolor, sumi outlines, awe-inspiring but friendly.'
  }
];

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
data.version = 3;
data.updatedAt = UPDATED_AT;

const existingIds = new Set(data.items.map((item) => item.id));
const mergedItems = data.items.map((item) => item);
additions.forEach((addition) => {
  const { visualPrompt, promptJa, promptEn, ...item } = addition;
  const existingIndex = mergedItems.findIndex((current) => current.id === item.id);
  if (existingIndex >= 0) {
    mergedItems[existingIndex] = { ...mergedItems[existingIndex], ...item };
  } else {
    mergedItems.push(item);
    existingIds.add(item.id);
  }
});
mergedItems.forEach((item) => {
  if (!Array.isArray(item.missions) || item.missions.length === 0) {
    item.missions = [
      `${item.name}が出そうな場所を図鑑の説明から探してみよう`,
      `${item.name}と似ている妖怪をほかに一体見つけてみよう`
    ];
  }

  if (!Array.isArray(item.quiz) || item.quiz.length === 0) {
    const habitat = Array.isArray(item.habitat) && item.habitat.length > 0 ? item.habitat[0] : 'ふしぎな場所';
    item.quiz = [
      {
        question: `${item.name}は、どんな妖怪として紹介されていますか？`,
        choices: [item.category, '未来のロボット', '外国のお城'],
        answer: item.category,
        explanation: `${item.name}は、この図鑑では「${item.category}」として紹介しています。出る場所の例は「${habitat}」です。`
      }
    ];
  }
});
data.items = mergedItems;
fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

let promptData = { version: 1, updatedAt: UPDATED_AT, prompts: [] };
if (fs.existsSync(PROMPTS_PATH)) {
  const raw = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));
  if (Array.isArray(raw)) {
    promptData.prompts = raw;
  } else {
    promptData = { version: raw.version || 1, updatedAt: UPDATED_AT, prompts: raw.prompts || raw.items || [] };
  }
}

const promptMap = new Map(promptData.prompts.map((prompt) => [prompt.id, prompt]));
additions.forEach((addition) => {
  promptMap.set(addition.id, {
    id: addition.id,
    name: addition.name,
    visualFeatures: addition.visualPrompt,
    promptJa: addition.promptJa,
    promptEn: addition.promptEn,
    negativePrompt: NEGATIVE_PROMPT,
    outputPath: addition.generatedImagePath,
    status: 'generated'
  });
});

promptData.version = 1;
promptData.updatedAt = UPDATED_AT;
promptData.prompts = [...promptMap.values()].sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(PROMPTS_PATH, `${JSON.stringify(promptData, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  yokaiCount: data.items.length,
  promptCount: promptData.prompts.length,
  added: additions.map((item) => item.id)
}, null, 2));
