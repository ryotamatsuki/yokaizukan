import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, data) => {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const childImage = (id) => `public/assets/ehime/generated/children/${id}.png`;

const parentUpdates = {
  uwajima_ushioni_cluster: {
    region: "南予",
    municipality: "宇和島市ほか",
    type: "妖怪・祭礼・海の怪異",
    traditionType: "お祭りに残っている",
    scaryLevel: 3,
    evidenceLevel: "B",
    locationId: "uwajima",
    courseIds: ["nanyo_ushioni_course"],
    childItemIds: ["uwajima_ushioni", "ushioni_matsuri", "ushioni_buchi", "warei_jinja_ushioni", "yamabushi_ushioni"],
    childItems: [
      {
        id: "uwajima_ushioni",
        name: "宇和島の牛鬼",
        kana: "うわじまのうしおに",
        shortDescription: "長い首と大きな頭を持つ、宇和島を代表する牛鬼です。",
        childDescription: "宇和島の牛鬼は、牛のような頭、鬼のような角、長い首を持つ迫力ある姿で知られます。祭りでは人が中に入り、首を動かしながら町を進みます。怖いだけでなく、地域の力強さを表す存在として受け止められています。",
        visualFeatures: ["牛のような頭", "鬼の角", "長い首", "祭礼の大きな胴体"],
        imagePath: childImage("uwajima_ushioni"),
        sourceIds: ["uwajima_ushioni_official"]
      },
      {
        id: "ushioni_matsuri",
        name: "うわじま牛鬼まつり",
        kana: "うわじまうしおにまつり",
        shortDescription: "牛鬼が町を練り歩く、宇和島の夏の祭りです。",
        childDescription: "うわじま牛鬼まつりでは、牛鬼の練り物が町に現れます。巨大な姿をみんなで動かすことで、妖怪の怖さは祭りの楽しさへ変わります。地域の人が受け継いできた、見て体験できる伝承です。",
        visualFeatures: ["町を進む牛鬼", "祭りの提灯", "にぎやかな人々", "夏の宇和島"],
        imagePath: childImage("ushioni_matsuri"),
        sourceIds: ["uwajima_ushioni_official"]
      },
      {
        id: "ushioni_buchi",
        name: "牛鬼淵",
        kana: "うしおにぶち",
        shortDescription: "深い淵や水辺の危険と結びつく牛鬼の伝承です。",
        childDescription: "牛鬼淵のような話では、深い水辺に牛鬼がいると語られます。淵は水の流れが読みにくく、昔の人にとって危険な場所でした。牛鬼は、その怖さを忘れないための名前として働いていたとも考えられます。",
        visualFeatures: ["深い川の淵", "岩場", "水面の影", "牛鬼の気配"],
        imagePath: childImage("ushioni_buchi"),
        sourceIds: ["ehime_memory_sea"]
      },
      {
        id: "warei_jinja_ushioni",
        name: "和霊神社と牛鬼",
        kana: "われいじんじゃとうしおに",
        shortDescription: "神社の祭礼と牛鬼の姿が重なる伝承です。",
        childDescription: "和霊神社周辺の祭礼では、牛鬼の姿が地域の祈りやにぎわいと結びついて見られます。妖怪が神社の場に現れることで、怖い存在は人々の暮らしを見守るような役割も帯びます。",
        visualFeatures: ["神社の鳥居", "祭りの牛鬼", "しめ縄", "やわらかな灯り"],
        imagePath: childImage("warei_jinja_ushioni"),
        sourceIds: ["uwajima_ushioni_official"]
      },
      {
        id: "yamabushi_ushioni",
        name: "山伏退治譚",
        kana: "やまぶしたいじたん",
        shortDescription: "山伏が牛鬼に向き合う、退治物語の型です。",
        childDescription: "牛鬼の話には、山伏や力のある人物が牛鬼を退治する型があります。これは残酷な場面を楽しむ話ではなく、人間の知恵や祈りが自然の脅威に向き合う物語として読めます。子ども向けには、対決よりも鎮める話として扱います。",
        visualFeatures: ["山伏の装束", "錫杖", "牛鬼", "山と水辺"],
        imagePath: childImage("yamabushi_ushioni"),
        sourceIds: ["ehime_memory_sea"]
      }
    ]
  },
  matsuyama_tanuki_cluster: {
    region: "中予",
    municipality: "松山市",
    type: "化け狸・城下町怪談",
    traditionType: "古い本にのっている",
    scaryLevel: 2,
    evidenceLevel: "B",
    locationId: "matsuyama_castle",
    courseIds: ["matsuyama_tanuki_course"],
    childItemIds: ["inugami_gyobu", "matsuyama_sodo_tanuki", "happyakuya_tanuki", "matsuyama_castle_tanuki", "tanuki_bayashi", "tanuki_bi"],
    childItems: [
      {
        id: "inugami_gyobu",
        name: "隠神刑部",
        kana: "いぬがみぎょうぶ",
        shortDescription: "松山の八百八狸を率いる大狸として語られる存在です。",
        childDescription: "隠神刑部は、松山の狸伝説で大親分のように語られる化け狸です。多くの狸をまとめる存在とされ、ただ人を化かすだけではない威厳を持っています。城下町の物語に深みを与える中心人物です。",
        visualFeatures: ["年老いた大狸", "扇", "城下町", "落ち着いた表情"],
        imagePath: childImage("inugami_gyobu"),
        sourceIds: ["inugami_gyobu_yokai_reference", "ndl_reference_tanuki"]
      },
      {
        id: "matsuyama_sodo_tanuki",
        name: "松山騒動八百八狸",
        kana: "まつやまそうどうはっぴゃくやだぬき",
        shortDescription: "城下町の騒動と狸たちが結びついた物語です。",
        childDescription: "松山騒動八百八狸は、城下町の出来事に狸の力を重ねて語る大きな物語です。歴史そのものというより、人のうわさ、政治の不安、狸の化ける力が混ざった読み物として広まりました。",
        visualFeatures: ["たくさんの狸", "松山城", "夜の町", "提灯"],
        imagePath: childImage("matsuyama_sodo_tanuki"),
        sourceIds: ["inugami_gyobu_yokai_reference", "ndl_reference_tanuki"]
      },
      {
        id: "happyakuya_tanuki",
        name: "八百八狸",
        kana: "はっぴゃくやだぬき",
        shortDescription: "数えきれないほど多くいると語られた松山の狸たちです。",
        childDescription: "八百八狸という数は、正確に数えた数というより、たくさんいることを表す言い方です。松山では、狸たちが音を鳴らしたり、火を見せたり、人を驚かせたりする話が豊かに語られてきました。",
        visualFeatures: ["狸の群れ", "丸い目", "夜の集まり", "にぎやかな気配"],
        imagePath: childImage("happyakuya_tanuki"),
        sourceIds: ["inugami_gyobu_yokai_reference", "ndl_reference_tanuki"]
      },
      {
        id: "matsuyama_castle_tanuki",
        name: "松山城の狸伝承",
        kana: "まつやまじょうのたぬきでんしょう",
        shortDescription: "松山城や城下町を舞台にした狸の伝承です。",
        childDescription: "松山城のまわりは、城下町のうわさや夜の気配が集まりやすい場所です。狸伝承をそこに置くと、石垣、堀、坂道が物語の舞台になります。動物の狸と町の歴史が重なるところが面白い点です。",
        visualFeatures: ["松山城", "石垣", "狸の影", "月明かり"],
        imagePath: childImage("matsuyama_castle_tanuki"),
        sourceIds: ["inugami_gyobu_yokai_reference"]
      },
      {
        id: "tanuki_bayashi",
        name: "狸囃子",
        kana: "たぬきばやし",
        shortDescription: "姿は見えないのに、太鼓や囃子が聞こえる音の怪異です。",
        childDescription: "狸囃子は、どこからともなく太鼓や祭りの音が聞こえるという怪異です。音だけが先に現れるため、聞いた人は姿の見えない狸を想像します。夜の静けさの中で、音が物語を作る例です。",
        visualFeatures: ["小さな太鼓", "音の波", "夜の草むら", "狸の気配"],
        imagePath: childImage("tanuki_bayashi"),
        sourceIds: ["inugami_gyobu_yokai_reference"]
      },
      {
        id: "tanuki_bi",
        name: "狸火",
        kana: "たぬきび",
        shortDescription: "夜道にふっと現れる、狸のしわざとされた不思議な火です。",
        childDescription: "狸火は、夜に見える小さな火や光を狸のしわざとして語る怪異です。遠くの灯り、湿った空気、目の錯覚が、不思議な火として受け止められたのかもしれません。怖さよりも、夜の道の不思議さが中心です。",
        visualFeatures: ["小さな火", "青や金の光", "夜道", "狸の影"],
        imagePath: childImage("tanuki_bi"),
        sourceIds: ["inugami_gyobu_yokai_reference"]
      }
    ]
  },
  iyo_basan_cluster: {
    region: "愛媛県全域",
    municipality: "伊予国・要確認",
    type: "怪鳥・音の怪異",
    traditionType: "古い本にのっている",
    scaryLevel: 3,
    evidenceLevel: "B",
    locationId: "iyo_general",
    courseIds: ["iyo_mystery_course"],
    childItemIds: ["basan", "basabasa", "inuhoo", "fire_breathing_bird"],
    childItems: [
      {
        id: "basan",
        name: "波山",
        kana: "ばさん",
        shortDescription: "伊予国にすむとされた、羽音と怪火の怪鳥です。",
        childDescription: "波山は、伊予国の竹藪にすむとされる怪鳥です。にわとりに似た姿で、ばさばさという羽音を立て、熱くない怪火を吐くと紹介されます。音と光から想像された妖怪として読むと分かりやすいです。",
        visualFeatures: ["鳥の姿", "大きな羽", "小さな怪火", "竹藪"],
        imagePath: childImage("basan"),
        sourceIds: ["basan_yokai_reference", "ndl_sekien_column"]
      },
      {
        id: "basabasa",
        name: "婆娑婆娑",
        kana: "ばさばさ",
        shortDescription: "羽ばたきの音から生まれたような、波山の別名的な気配です。",
        childDescription: "婆娑婆娑は、羽音そのものを妖怪名にしたような言い方です。夜の竹やぶで聞こえる音は、姿が見えないぶん想像を広げます。波山を音の妖怪として考えるときの大事な手がかりです。",
        visualFeatures: ["羽音", "舞う葉", "鳥の影", "竹林"],
        imagePath: childImage("basabasa"),
        sourceIds: ["basan_yokai_reference"]
      },
      {
        id: "inuhoo",
        name: "犬鳳凰",
        kana: "いぬほうおう",
        shortDescription: "波山と関係づけて語られることがある、名の不思議な怪鳥です。",
        childDescription: "犬鳳凰は、名前に犬と鳳凰が入る不思議な存在として扱われます。資料によって波山との関係は整理が必要ですが、怪鳥の姿が一つに決まらず変化してきたことを示す手がかりになります。",
        visualFeatures: ["鳥の体", "不思議な顔", "長い尾", "古い図鑑風"],
        imagePath: childImage("inuhoo"),
        sourceIds: ["basan_yokai_reference"]
      },
      {
        id: "fire_breathing_bird",
        name: "竹林にすむ火を吐く鳥",
        kana: "ちくりんにすむひをはくとり",
        shortDescription: "竹藪と青白い怪火で印象づけられる、波山の特徴です。",
        childDescription: "竹林にすむ火を吐く鳥という説明は、波山のイメージを一目で伝えます。ただし火は物を焼く炎というより、夜に見える怪しい光として考えると、子どもにも怖すぎずに伝わります。",
        visualFeatures: ["竹林", "鳥", "青白い火", "夜の空気"],
        imagePath: childImage("fire_breathing_bird"),
        sourceIds: ["basan_yokai_reference", "ndl_sekien_column"]
      }
    ]
  },
  ishizuchi_tengu_cluster: {
    region: "東予・山間部",
    municipality: "西条市・久万高原町ほか",
    type: "山岳妖怪・山神・修験",
    traditionType: "山に伝わる",
    scaryLevel: 3,
    evidenceLevel: "B",
    locationId: "ishizuchi",
    courseIds: ["ishizuchi_tengu_course"],
    childItemIds: ["ishizuchi_tengu", "tengudake_tengu", "ishizuchi_yamagami", "ishizuchi_shugen", "ishizuchi_kaika", "horagai_sound"],
    childItems: [
      {
        id: "ishizuchi_tengu",
        name: "石鎚山の天狗",
        kana: "いしづちさんのてんぐ",
        shortDescription: "険しい石鎚山の気配と結びつく山の天狗です。",
        childDescription: "石鎚山の天狗は、岩場、風、霧、修行者の姿から想像される山の存在です。天狗を山の危険と神聖さを知らせるものとして読むと、ただ怖い妖怪ではないことが分かります。",
        visualFeatures: ["赤い顔", "山伏装束", "羽団扇", "岩山"],
        imagePath: childImage("ishizuchi_tengu"),
        sourceIds: ["ishizuchi_official", "ishizuchi_teaching"]
      },
      {
        id: "tengudake_tengu",
        name: "天狗岳",
        kana: "てんぐだけ",
        shortDescription: "石鎚山の頂上部にある、天狗の名を持つ峰です。",
        childDescription: "天狗岳は、石鎚山の地名として確認できる大切な手がかりです。地名に天狗の名が残ることで、山の形や険しさが妖怪の想像と結びつきます。伝承を読むときは、実際の地形も一緒に見ると理解が深まります。",
        visualFeatures: ["岩の峰", "雲", "小さな天狗の影", "高い山"],
        imagePath: childImage("tengudake_tengu"),
        sourceIds: ["ishizuchi_official"]
      },
      {
        id: "ishizuchi_yamagami",
        name: "山神",
        kana: "やまがみ",
        shortDescription: "山を守る神聖な力として受け止められてきた存在です。",
        childDescription: "山神は、山そのものに宿る力を表す言葉です。石鎚山のような信仰の山では、自然を大切にし、むやみに恐れたり軽く見たりしない心が育ちました。妖怪と神の境目を考える入口になります。",
        visualFeatures: ["古木", "岩", "光", "山の社"],
        imagePath: childImage("ishizuchi_yamagami"),
        sourceIds: ["ishizuchi_teaching"]
      },
      {
        id: "ishizuchi_shugen",
        name: "修験",
        kana: "しゅげん",
        shortDescription: "山で修行する人々の姿が、天狗像とも重なります。",
        childDescription: "修験は、山を修行の場として歩く信仰のあり方です。山伏の装束や法具は、天狗の姿を考えるときにも重要です。人間の修行者の姿が、やがて山の不思議な存在の姿と重なって見えます。",
        visualFeatures: ["山伏", "錫杖", "法螺貝", "山道"],
        imagePath: childImage("ishizuchi_shugen"),
        sourceIds: ["ishizuchi_teaching"]
      },
      {
        id: "ishizuchi_kaika",
        name: "怪火",
        kana: "かいか",
        shortDescription: "山中で見える不思議な火や光の伝承です。",
        childDescription: "怪火は、夜の山や霧の中で見える不思議な光として語られます。遠くの灯り、湿った空気、山の暗さが重なると、光は特別な意味を持ちます。天狗や山神の気配として受け止められることもあります。",
        visualFeatures: ["小さな光", "霧", "岩場", "夜の山"],
        imagePath: childImage("ishizuchi_kaika"),
        sourceIds: ["nichibun_yokai_db"]
      },
      {
        id: "horagai_sound",
        name: "法螺貝の音",
        kana: "ほらがいのおと",
        shortDescription: "山に響く法螺貝の音を、ふしぎな気配として読む項目です。",
        childDescription: "法螺貝の音は、山伏や登拝の雰囲気を強く感じさせます。山に響く音は、姿が見えなくても人の心に残ります。音から天狗や修験の世界を想像できる、石鎚山らしい入口です。",
        visualFeatures: ["法螺貝", "音の波", "山道", "雲"],
        imagePath: childImage("horagai_sound"),
        sourceIds: ["ishizuchi_teaching"]
      }
    ]
  }
};

const moreParentUpdates = {
  dogo_myth_cluster: {
    region: "中予",
    municipality: "松山市",
    type: "温泉神話・霊泉伝説",
    traditionType: "神社・温泉に伝わる",
    scaryLevel: 1,
    evidenceLevel: "A",
    locationId: "dogo_onsen",
    courseIds: ["dogo_mystery_course"],
    childItemIds: ["dogo_shirasagi", "sukunahikona_toji", "okuninushi_dogo", "tama_no_ishi", "dogo_yugami"],
    childItems: [
      {
        id: "dogo_shirasagi",
        name: "白鷺伝説",
        kana: "しらさぎでんせつ",
        shortDescription: "白鷺が湯で傷をいやしたと伝わる道後温泉の発見譚です。",
        childDescription: "白鷺伝説では、足を痛めた白鷺が湯にひたり、元気になったと語られます。動物が自然の恵みを人に知らせる型の話です。道後温泉をやさしい癒やしの場所として印象づけます。",
        visualFeatures: ["白鷺", "湯けむり", "岩湯", "やさしい光"],
        imagePath: childImage("dogo_shirasagi"),
        sourceIds: ["dogo_official_history"]
      },
      {
        id: "sukunahikona_toji",
        name: "少彦名命",
        kana: "すくなひこなのみこと",
        shortDescription: "道後の湯で元気を取り戻したと伝わる小さな神さまです。",
        childDescription: "少彦名命は、大国主命とともに道後温泉の神話に登場します。病になった少彦名命が湯で回復したという話は、温泉の力を神話として伝えるものです。小さな神さまの物語として親しみやすく読めます。",
        visualFeatures: ["小さな神さま", "湯けむり", "石", "温かな表情"],
        imagePath: childImage("sukunahikona_toji"),
        sourceIds: ["dogo_official_history"]
      },
      {
        id: "okuninushi_dogo",
        name: "大国主命",
        kana: "おおくにぬしのみこと",
        shortDescription: "少彦名命を助ける神として、道後温泉の神話に登場します。",
        childDescription: "大国主命は、少彦名命とともに道後温泉の由来に関わる神として語られます。旅の途中で弱った仲間を助ける話として読むと、温泉が人をいたわる場所だと分かります。",
        visualFeatures: ["旅姿の神", "温泉", "支えるしぐさ", "穏やかな顔"],
        imagePath: childImage("okuninushi_dogo"),
        sourceIds: ["dogo_official_history"]
      },
      {
        id: "tama_no_ishi",
        name: "玉の石",
        kana: "たまのいし",
        shortDescription: "少彦名命の伝説と結びつく、道後温泉の石です。",
        childDescription: "玉の石は、少彦名命が元気になった話と結びつけて伝えられる石です。石そのものが物語を記憶しているように扱われます。場所に残る小さなものから大きな神話へつながる例です。",
        visualFeatures: ["丸い石", "湯けむり", "しめ縄", "静かな光"],
        imagePath: childImage("tama_no_ishi"),
        sourceIds: ["dogo_official_history"]
      },
      {
        id: "dogo_yugami",
        name: "湯神",
        kana: "ゆがみ",
        shortDescription: "温泉を守る神聖な力を、子ども向けに整理した項目です。",
        childDescription: "湯神は、温泉の湯を大切に守る神聖な力として読むことができます。道後温泉の神話では、湯はただの水ではなく、人や生きものを元気にする恵みとして語られます。",
        visualFeatures: ["湯けむり", "湯玉", "小さな社", "温かな水"],
        imagePath: childImage("dogo_yugami"),
        sourceIds: ["dogo_official_history"]
      }
    ]
  },
  ishiteji_emon_saburo_cluster: {
    region: "中予",
    municipality: "松山市",
    type: "弘法大師伝説・遍路伝承・再来譚",
    traditionType: "神社・お寺に伝わる",
    scaryLevel: 2,
    evidenceLevel: "B",
    locationId: "ishiteji",
    courseIds: ["dogo_mystery_course"],
    childItemIds: ["emon_saburo", "emon_saburo_rebirth", "kobodaishi_legend", "ishiteji_reiseki"],
    childItems: [
      {
        id: "emon_saburo",
        name: "衛門三郎",
        kana: "えもんさぶろう",
        shortDescription: "四国遍路の由来と結びつく、反省と旅の伝説的人物です。",
        childDescription: "衛門三郎は、弘法大師に冷たくした後で深く反省し、四国を巡ったとされる人物です。失敗に気づいて歩き直す物語として読むと、子どもにも意味が伝わりやすくなります。",
        visualFeatures: ["旅人", "遍路道", "杖", "反省の表情"],
        imagePath: childImage("emon_saburo"),
        sourceIds: ["ishiteji_jtb_reference", "matsuyama_culture_pdf"]
      },
      {
        id: "emon_saburo_rebirth",
        name: "再来譚",
        kana: "さいらいたん",
        shortDescription: "石を手にして生まれ変わったと語られる不思議な話です。",
        childDescription: "再来譚では、衛門三郎が石を手にした子として生まれ変わったと伝えられます。命や反省を直接的に怖く描くのではなく、もう一度やり直す物語として受け止めるとよいでしょう。",
        visualFeatures: ["小さな手", "石", "やわらかな光", "寺の気配"],
        imagePath: childImage("emon_saburo_rebirth"),
        sourceIds: ["ishiteji_jtb_reference", "matsuyama_culture_pdf"]
      },
      {
        id: "kobodaishi_legend",
        name: "弘法大師伝説",
        kana: "こうぼうだいしでんせつ",
        shortDescription: "弘法大師が旅人や地域の人々と出会う伝説群です。",
        childDescription: "弘法大師伝説は、四国各地の寺や道に残る大きな物語の集まりです。石手寺と衛門三郎の話も、その広い語りの中で読めます。旅、出会い、心の変化が大切なテーマです。",
        visualFeatures: ["旅の僧", "笠", "杖", "四国の道"],
        imagePath: childImage("kobodaishi_legend"),
        sourceIds: ["ishiteji_jtb_reference"]
      },
      {
        id: "ishiteji_reiseki",
        name: "石手寺の霊石",
        kana: "いしてじのれいせき",
        shortDescription: "石手寺の名と伝説をつなぐ、石にまつわる記憶です。",
        childDescription: "石手寺の霊石は、寺の名前と衛門三郎の再来譚をつなぐ手がかりとして語られます。石という小さなものが、寺の由来や巡礼の意味を伝える大切な印になります。",
        visualFeatures: ["石", "寺の門", "木造建築", "静かな光"],
        imagePath: childImage("ishiteji_reiseki"),
        sourceIds: ["ishiteji_jtb_reference", "matsuyama_culture_pdf"]
      }
    ]
  },
  uwakai_sea_mystery_cluster: {
    region: "南予・海辺",
    municipality: "宇和島市・愛南町ほか",
    type: "海の怪異・船幽霊・海坊主",
    traditionType: "海や川に伝わる",
    scaryLevel: 4,
    evidenceLevel: "C",
    locationId: "uwakai",
    courseIds: ["nanyo_ushioni_course"],
    childItemIds: ["uwakai_funayurei", "uwakai_umibozu", "hiburijima_kairei", "kushima_yobi", "toshima_kairei"],
    childItems: [
      {
        id: "uwakai_funayurei",
        name: "宇和海の船幽霊",
        kana: "うわかいのふなゆうれい",
        shortDescription: "夜の海で船に近づくと語られる、海の怪異です。",
        childDescription: "船幽霊は、海で命を落とした人の気配として語られることがあります。宇和海では、船に近づく声や水を求める話として読むことができます。海の危険を忘れないための伝承です。",
        visualFeatures: ["夜の船", "白い気配", "海面", "小さな柄杓"],
        imagePath: childImage("uwakai_funayurei"),
        sourceIds: ["ehime_memory_sea", "nichibun_yokai_db"]
      },
      {
        id: "uwakai_umibozu",
        name: "海坊主",
        kana: "うみぼうず",
        shortDescription: "海面から大きな影のように現れるとされる妖怪です。",
        childDescription: "海坊主は、海から大きな黒い影が現れるように語られる妖怪です。波、霧、夜の暗さが重なると、海は急に大きな生き物のように見えることがあります。子ども向けには、海への畏れを伝える存在として扱います。",
        visualFeatures: ["大きな丸い影", "波", "霧", "夜の海"],
        imagePath: childImage("uwakai_umibozu"),
        sourceIds: ["ehime_memory_sea", "nichibun_yokai_db"]
      },
      {
        id: "hiburijima_kairei",
        name: "日振島の海の怪異",
        kana: "ひぶりじまのうみのかいい",
        shortDescription: "日振島周辺の海の記憶を、怪火や船の気配として読む項目です。",
        childDescription: "日振島のような島では、海の天気や潮の流れが暮らしに深く関わります。夜の光や遠い声は、怪異として語られることがあります。初期版では、島の民俗を調べる入口として整理しています。",
        visualFeatures: ["島影", "小さな怪火", "漁船", "月夜"],
        imagePath: childImage("hiburijima_kairei"),
        sourceIds: ["ehime_memory_sea"]
      },
      {
        id: "kushima_yobi",
        name: "九島の海の怪異",
        kana: "くしまのうみのかいい",
        shortDescription: "宇和島湾の島まわりで想像される、海と夜の怪異です。",
        childDescription: "九島の海の怪異は、港、島影、夜の波音から生まれる不思議な気配として扱います。具体的な原典は追加確認が必要ですが、島の暮らしと海の危険を考えるための項目です。",
        visualFeatures: ["港", "島影", "青い光", "静かな波"],
        imagePath: childImage("kushima_yobi"),
        sourceIds: ["ehime_memory_sea"]
      },
      {
        id: "toshima_kairei",
        name: "戸島の海の怪異",
        kana: "としまのうみのかいい",
        shortDescription: "戸島周辺の海に重ねて読む、夜の気配の伝承項目です。",
        childDescription: "戸島の海の怪異は、漁の場、島の道、遠い灯りを手がかりに読む海の不思議です。海に生きる人々にとって、見えない流れや夜の音は大切な注意の合図でもありました。",
        visualFeatures: ["漁村", "遠い灯り", "小舟", "夜の海"],
        imagePath: childImage("toshima_kairei"),
        sourceIds: ["ehime_memory_sea"]
      }
    ]
  },
  setouchi_murakami_kaizoku_cluster: {
    region: "東予・島しょ部",
    municipality: "今治市ほか",
    type: "海賊伝承・海の怪異・城跡怪火",
    traditionType: "海や川に伝わる",
    scaryLevel: 3,
    evidenceLevel: "C",
    locationId: "noshima",
    courseIds: ["setouchi_mystery_ship_course"],
    childItemIds: ["murakami_kaizoku_ghost", "noshima_yobi", "kurushima_funayurei"],
    childItems: [
      {
        id: "murakami_kaizoku_ghost",
        name: "村上海賊の亡霊",
        kana: "むらかみかいぞくのぼうれい",
        shortDescription: "村上海賊の歴史に重ねて想像される、海の人影です。",
        childDescription: "村上海賊の亡霊は、実在した海の勢力の歴史に、夜の海の不思議な気配を重ねて読む項目です。歴史そのものと怪異は分けて考え、城跡や船影がなぜ物語を生みやすいのかを見ます。",
        visualFeatures: ["古い船", "海の人影", "島城", "月夜"],
        imagePath: childImage("murakami_kaizoku_ghost"),
        sourceIds: ["murakami_kaizoku_official", "nichibun_yokai_db"]
      },
      {
        id: "noshima_yobi",
        name: "能島城の夜火",
        kana: "のしまじょうのよび",
        shortDescription: "能島の城跡と夜の火を結びつけて読む怪異です。",
        childDescription: "能島城の夜火は、島の城跡や夜の海に見える光を、歴史の記憶と重ねて読む項目です。実際の出典確認は続ける必要がありますが、城跡が怪異の舞台になりやすい理由を考える入口になります。",
        visualFeatures: ["島の城跡", "小さな火", "潮流", "夜空"],
        imagePath: childImage("noshima_yobi"),
        sourceIds: ["murakami_kaizoku_official", "nichibun_yokai_db"]
      },
      {
        id: "kurushima_funayurei",
        name: "来島海峡の船幽霊",
        kana: "くるしまかいきょうのふなゆうれい",
        shortDescription: "潮の速い海峡に重ねて読む、船の怪異です。",
        childDescription: "来島海峡は潮の流れが速い場所として知られます。船幽霊の話を重ねると、海峡の危険や航海の緊張感が見えてきます。怪異は、海をよく知る人の注意の言葉としても読めます。",
        visualFeatures: ["海峡", "渦潮の気配", "白い船影", "月明かり"],
        imagePath: childImage("kurushima_funayurei"),
        sourceIds: ["murakami_kaizoku_official", "nichibun_yokai_db"]
      }
    ]
  },
  kihoku_oni_cluster: {
    region: "南予・山間部",
    municipality: "鬼北町・宇和島市周辺",
    type: "鬼・地名伝承・山の怪異",
    traditionType: "地名に残っている",
    scaryLevel: 3,
    evidenceLevel: "B",
    locationId: "kihoku",
    courseIds: ["nanyo_ushioni_course"],
    childItemIds: ["kihoku_oni", "onigajo_oni", "onio_maru", "yukihime"],
    childItems: [
      {
        id: "kihoku_oni",
        name: "鬼北の鬼",
        kana: "きほくのおに",
        shortDescription: "鬼の字を持つ町で、地域のシンボルとして親しまれる鬼です。",
        childDescription: "鬼北の鬼は、怖いだけの存在ではなく、町の名前や地域の魅力と結びついています。鬼の姿をまちづくりに生かすことで、古いイメージが新しい地域の顔になっています。",
        visualFeatures: ["鬼", "山あいの町", "角", "力強い表情"],
        imagePath: childImage("kihoku_oni"),
        sourceIds: ["kihoku_spot_official"]
      },
      {
        id: "onigajo_oni",
        name: "鬼ヶ城山の鬼",
        kana: "おにがじょうやまのおに",
        shortDescription: "鬼の名を持つ山に重ねて読む、山の鬼の伝承です。",
        childDescription: "鬼ヶ城山のような地名には、山の険しさや人が近づきにくい雰囲気が表れます。鬼を山の力として読むと、地名がただの名前ではなく、土地の記憶を持っていることが分かります。",
        visualFeatures: ["山の尾根", "鬼の影", "岩場", "雲"],
        imagePath: childImage("onigajo_oni"),
        sourceIds: ["kihoku_toumyoji_oni"]
      },
      {
        id: "onio_maru",
        name: "鬼王丸",
        kana: "おにおうまる",
        shortDescription: "鬼北町で見られる、迫力ある鬼のモニュメントです。",
        childDescription: "鬼王丸は、鬼北町の鬼のまちづくりを象徴する大きな鬼の像です。現代に作られた表現ですが、鬼の迫力を地域の個性として伝えます。古い伝承と現代の地域表現を比べる題材になります。",
        visualFeatures: ["赤い鬼", "大きな体", "像のような姿", "力強さ"],
        imagePath: childImage("onio_maru"),
        sourceIds: ["kihoku_spot_official"]
      },
      {
        id: "yukihime",
        name: "柚鬼媛",
        kana: "ゆきひめ",
        shortDescription: "鬼北の鬼イメージを広げる、柚子と結びつく鬼の姫です。",
        childDescription: "柚鬼媛は、鬼北町の鬼の表現をより親しみやすく広げる存在です。柚子の産地としての地域性とも結びつき、怖い鬼だけでなく、やさしく華やかな鬼の見せ方を伝えます。",
        visualFeatures: ["鬼の姫", "柚子", "小さな角", "明るい衣"],
        imagePath: childImage("yukihime"),
        sourceIds: ["kihoku_spot_official"]
      }
    ]
  },
  ehime_night_road_mysteries_cluster: {
    region: "愛媛県内各地",
    municipality: "要確認",
    type: "夜道の怪異・怪火・鳥の怪異",
    traditionType: "調査中",
    scaryLevel: 3,
    evidenceLevel: "C",
    locationId: "ehime_general",
    courseIds: ["night_road_mystery_course"],
    childItemIds: ["yosuzume", "nobiagari", "yukibaba", "kane_no_kami_no_hi"],
    childItems: [
      {
        id: "yosuzume",
        name: "夜雀",
        kana: "よすずめ",
        shortDescription: "夜道で聞こえる鳥の声や羽音として語られる怪異です。",
        childDescription: "夜雀は、暗い道で聞こえる鳥のような声や羽音の怪異です。姿が見えないぶん、人は音に名前をつけて不安を整理します。夜道を一人で歩かないという注意にもつながる話です。",
        visualFeatures: ["小さな鳥", "夜道", "羽音", "灯り"],
        imagePath: childImage("yosuzume"),
        sourceIds: ["nichibun_yokai_db"]
      },
      {
        id: "nobiagari",
        name: "伸上り",
        kana: "のびあがり",
        shortDescription: "見上げるほど大きくなる影のような夜道の怪異です。",
        childDescription: "伸上りは、見れば見るほど高く伸びるように感じられる怪異です。暗い道で影や木が大きく見える不安が、妖怪の姿になったものとして読めます。直接怖がらせるより、見え方の不思議として扱います。",
        visualFeatures: ["長い影", "夜道", "木立", "丸い目"],
        imagePath: childImage("nobiagari"),
        sourceIds: ["nichibun_yokai_db"]
      },
      {
        id: "yukibaba",
        name: "雪婆",
        kana: "ゆきばば",
        shortDescription: "寒い夜や雪の道に重ねて語られる老婆の怪異です。",
        childDescription: "雪婆は、雪や寒さと結びつく老婆の怪異として読むことができます。寒い夜の道では、風の音や白い景色が人の姿のように見えることがあります。怖さよりも、冬の厳しさを伝える存在です。",
        visualFeatures: ["雪", "老婆の姿", "白い衣", "冬の道"],
        imagePath: childImage("yukibaba"),
        sourceIds: ["nichibun_yokai_db"]
      },
      {
        id: "kane_no_kami_no_hi",
        name: "金の神の火",
        kana: "かねのかみのひ",
        shortDescription: "夜に見える金色の火として、調査中の怪火伝承です。",
        childDescription: "金の神の火は、夜道や社の近くに見える金色の怪火として整理している項目です。具体的な出典はさらに確認が必要ですが、光が神さまや土地の記憶と結びつく例として読むことができます。",
        visualFeatures: ["金色の火", "小さな社", "夜道", "静かな光"],
        imagePath: childImage("kane_no_kami_no_hi"),
        sourceIds: ["nichibun_yokai_db"]
      }
    ]
  }
};

Object.assign(parentUpdates, moreParentUpdates);

const legendsData = readJson("public/data/legends.json");
legendsData.legends = legendsData.legends.map((legend) => {
  const update = parentUpdates[legend.id] || (legend.id === "ehime_night_mystery_cluster" ? parentUpdates.ehime_night_road_mysteries_cluster : null);
  if (!update) return legend;
  return {
    ...legend,
    ...(legend.id === "ehime_night_mystery_cluster" ? { id: "ehime_night_road_mysteries_cluster" } : {}),
    ...update
  };
});
writeJson("public/data/legends.json", legendsData);

const articlesData = readJson("public/data/articles.json");
articlesData.articles = articlesData.articles.map((article) => (
  article.id === "ehime_night_mystery_cluster"
    ? { ...article, id: "ehime_night_road_mysteries_cluster" }
    : article
));
writeJson("public/data/articles.json", articlesData);

const evidenceData = readJson("public/data/evidence_check_table.json");
evidenceData.legendEvidence = evidenceData.legendEvidence.map((item) => (
  item.legendId === "ehime_night_mystery_cluster"
    ? { ...item, legendId: "ehime_night_road_mysteries_cluster" }
    : item
));
writeJson("public/data/evidence_check_table.json", evidenceData);

const locationsData = readJson("public/data/locations.json");
const locationIdMap = {
  matsuyama_castle_town: "matsuyama_castle",
  iyo_bamboo_grove: "iyo_general",
  dogo: "dogo_onsen",
  ehime_night_roads: "ehime_general"
};
locationsData.locations = locationsData.locations.map((location) => ({
  ...location,
  id: locationIdMap[location.id] || location.id
}));
writeJson("public/data/locations.json", locationsData);

const coursesData = readJson("public/data/courses.json");
coursesData.courses = [
  {
    id: "nanyo_ushioni_course",
    title: "南予の大きな妖怪コース",
    region: "南予",
    time: "1日",
    forKids: "牛鬼、宇和海、鬼北の鬼をつなぎ、南予の山と海の力を読みます。",
    summary: "宇和島の牛鬼、宇和海の怪異、鬼北の鬼をめぐる、南予らしい力強い伝承コースです。",
    legendIds: ["uwajima_ushioni_cluster", "uwakai_sea_mystery_cluster", "kihoku_oni_cluster"],
    stops: [
      { legendId: "uwajima_ushioni_cluster", title: "宇和島の牛鬼", note: "祭りに現れる牛鬼を読みます。" },
      { legendId: "uwakai_sea_mystery_cluster", title: "宇和海の海の怪異", note: "船幽霊や海坊主を読みます。" },
      { legendId: "kihoku_oni_cluster", title: "鬼北の鬼", note: "山の鬼と地名を読みます。" }
    ]
  },
  {
    id: "matsuyama_tanuki_course",
    title: "松山の狸と城下町コース",
    region: "中予",
    time: "半日",
    forKids: "城下町を舞台に、狸のユーモアと怪談を読みます。",
    summary: "松山の八百八狸と隠神刑部を中心に、城下町の物語をたどります。",
    legendIds: ["matsuyama_tanuki_cluster"],
    stops: [{ legendId: "matsuyama_tanuki_cluster", title: "松山の八百八狸", note: "狸伝説の広がりを読みます。" }]
  },
  {
    id: "iyo_mystery_course",
    title: "伊予の怪鳥と夜道コース",
    region: "愛媛県全域",
    time: "半日",
    forKids: "音や光から生まれる怪異を比べます。",
    summary: "波山と夜道の怪異をつなぎ、姿の見えにくいふしぎを読みます。",
    legendIds: ["iyo_basan_cluster", "ehime_night_road_mysteries_cluster"],
    stops: [
      { legendId: "iyo_basan_cluster", title: "伊予の怪鳥・波山", note: "羽音と怪火を読みます。" },
      { legendId: "ehime_night_road_mysteries_cluster", title: "愛媛の夜道の怪異", note: "音と影の怪異を読みます。" }
    ]
  },
  {
    id: "ishizuchi_tengu_course",
    title: "石鎚山と天狗の山コース",
    region: "東予・山間部",
    time: "1日以上",
    forKids: "実際の登山は大人と安全確認をしてから。図鑑では山の信仰を学びます。",
    summary: "石鎚山、天狗岳、修験、山神をつなぐ山岳伝承コースです。",
    legendIds: ["ishizuchi_tengu_cluster"],
    stops: [{ legendId: "ishizuchi_tengu_cluster", title: "石鎚山の天狗", note: "山と信仰の関係を読みます。" }]
  },
  {
    id: "dogo_mystery_course",
    title: "道後温泉と石手寺コース",
    region: "中予",
    time: "半日",
    forKids: "温泉神話と遍路伝承を、やさしい物語として読みます。",
    summary: "道後温泉の白鷺伝説と、石手寺の衛門三郎伝説をつなぐコースです。",
    legendIds: ["dogo_myth_cluster", "ishiteji_emon_saburo_cluster"],
    stops: [
      { legendId: "dogo_myth_cluster", title: "道後温泉の神話", note: "白鷺と神さまの話を読みます。" },
      { legendId: "ishiteji_emon_saburo_cluster", title: "石手寺と衛門三郎", note: "反省と巡礼の物語を読みます。" }
    ]
  },
  {
    id: "setouchi_mystery_ship_course",
    title: "瀬戸内の船と海の記憶コース",
    region: "東予・島しょ部",
    time: "1日",
    forKids: "村上海賊の歴史と海の怪異を分けて読みます。",
    summary: "能島、来島海峡、村上海賊の歴史に重なる海のふしぎを読むコースです。",
    legendIds: ["setouchi_murakami_kaizoku_cluster"],
    stops: [{ legendId: "setouchi_murakami_kaizoku_cluster", title: "村上海賊の海の怪異", note: "歴史と怪異を分けて考えます。" }]
  },
  {
    id: "night_road_mystery_course",
    title: "愛媛の夜道の怪異コース",
    region: "愛媛県内各地",
    time: "夜は読書で",
    forKids: "夜道を実際に歩くのではなく、図鑑で安全に読みます。",
    summary: "夜雀、伸上り、雪婆、怪火を通して、暗い道の不安と知恵を読みます。",
    legendIds: ["ehime_night_road_mysteries_cluster"],
    stops: [{ legendId: "ehime_night_road_mysteries_cluster", title: "夜道の怪異", note: "音、影、光のふしぎを読みます。" }]
  }
];
writeJson("public/data/courses.json", coursesData);

console.log("Updated Ehime child item data.");
