以下をそのまま **Codex に貼り付ける実装指示書** として使ってください。
今回は、個別候補を乱立させず、**愛媛らしい10大クラスターを親項目として実装し、派生伝承を詳細画面内に格納する構成**にしています。

````text
# Codex実装指示書
# 愛媛ふしぎ伝承図鑑：10大クラスター版 実装指示

## 0. 目的

既存または新規の「愛媛ふしぎ伝承図鑑」Webアプリについて、愛媛らしさの強い10大クラスターを中心に実装してください。

本アプリは、愛媛県に伝わる妖怪・怪異・神話・祭礼・霊地・地名伝承を、地図・図鑑・探検コース・詳細記事・出典確認によって学べる静的Webアプリです。

重要なのは、100候補をすべて一覧カード化することではありません。
まずは、重複する伝承や関連素材を整理し、以下の10大クラスターを親項目として実装してください。

親項目は図鑑一覧・地図・探検コースに表示します。
派生候補は、親項目の詳細画面内に「関連する伝承」「祭り」「地域差」「昔の資料」などとして格納します。

## 1. 実装対象となる10大クラスター

以下の10件を、初期実装の中核としてください。

| No | 親項目 | 吸収する派生候補 |
| -: | - | - |
| 1 | 南予・宇和島の牛鬼 | 宇和島の牛鬼、うわじま牛鬼まつり、牛鬼淵、和霊神社と牛鬼、山伏退治譚 |
| 2 | 松山の八百八狸と隠神刑部 | 隠神刑部、松山騒動八百八狸、八百八狸、松山城の狸伝承、狸火、狸囃子 |
| 3 | 伊予の怪鳥・波山 | 波山、婆娑婆娑、犬鳳凰、竹林にすむ火を吐く鳥 |
| 4 | 石鎚山の天狗と山岳信仰 | 石鎚山の天狗、天狗岳、山神、修験、怪火、法螺貝の音 |
| 5 | 道後温泉の神話と白鷺伝説 | 白鷺伝説、少彦名命、大国主命、玉の石、湯神 |
| 6 | 石手寺と衛門三郎 | 衛門三郎、再来譚、弘法大師伝説、石手寺の霊石 |
| 7 | 宇和海の海の怪異 | 宇和海の船幽霊、海坊主、日振島・九島・戸島の海の怪異 |
| 8 | 瀬戸内・村上海賊の海の怪異 | 村上海賊の亡霊、能島城の夜火、来島海峡の船幽霊 |
| 9 | 鬼北の鬼と鬼ヶ城山 | 鬼北の鬼、鬼ヶ城山の鬼、鬼王丸、柚鬼媛 |
| 10 | 愛媛の夜道の怪異 | 夜雀、伸上り、雪婆、金の神の火 |

## 2. アプリの基本設計

本アプリは、以下の5つの体験を中心に構成してください。

1. 地図で探す
2. 図鑑で読む
3. コースでめぐる
4. 探検手帳に記録する
5. 出典で確かめる

アプリの基本ループは以下です。

トップ画面  
→ 今日の伝承・地図・探検コースから入口を選ぶ  
→ 伝承クラスターを発見する  
→ 子ども向け説明を読む  
→ もっと詳しく読む  
→ クイズ・ミッションに挑戦する  
→ 探検手帳に記録する  
→ 関連地域や別クラスターを探す

## 3. 技術方針

- 静的HTML / CSS / JavaScript / JSON で実装する
- サーバーサイド処理は使わない
- ビルド環境は使わない
- 外部ライブラリは原則使わない
- 地図は初期版では本格GISではなく、愛媛県の模式図または地域別マップでよい
- 後からLeaflet等に置き換えやすい構造にする
- HTMLに伝承データを直書きしない
- すべての伝承データは `public/data/legends.json` を正本とする
- 「もっと詳しく」本文は `public/data/articles.json` に分離する
- 出典・典拠情報は `public/data/sources.json` と `public/data/evidence_check_table.json` で管理する
- ユーザーの読了・発見・行ってみたい・メモ・クイズ履歴は localStorage に保存する
- localStorage が使えない場合でも、図鑑表示自体は壊れないようにする

## 4. 作成・更新するファイル構成

以下の構成を作成または更新してください。

```txt
project/
├─ index.html
├─ map.html
├─ encyclopedia.html
├─ courses.html
├─ notebook.html
├─ quiz.html
├─ sources.html
├─ about.html
├─ README.md
├─ css/
│  └─ style.css
├─ js/
│  ├─ app.js
│  ├─ dataLoader.js
│  ├─ render.js
│  ├─ map.js
│  ├─ detail.js
│  ├─ filters.js
│  ├─ courses.js
│  ├─ notebook.js
│  ├─ quiz.js
│  └─ sources.js
├─ public/
│  ├─ data/
│  │  ├─ legends.json
│  │  ├─ articles.json
│  │  ├─ locations.json
│  │  ├─ courses.json
│  │  ├─ sources.json
│  │  └─ evidence_check_table.json
│  └─ assets/
│     ├─ images/
│     │  ├─ generated/
│     │  ├─ historical/
│     │  ├─ places/
│     │  └─ placeholders/
│     └─ icons/
├─ scripts/
│  └─ validate_data.py
└─ docs/
   └─ design_notes.md
````

既存ファイルがある場合は、既存構成を壊さず、必要な範囲を更新してください。

## 5. データ設計

### 5.1 legends.json の基本思想

`legends.json` では、親項目と派生項目を分けて管理してください。

親項目は `isCluster: true` とします。
派生項目は `parentId` を持たせ、原則として一覧カードには出さず、親項目の詳細内に表示します。

### 5.2 親項目データ構造

親項目は以下の形式にしてください。

```json
{
  "id": "uwajima_ushioni_cluster",
  "name": "南予・宇和島の牛鬼",
  "kana": "なんよ・うわじまのうしおに",
  "isCluster": true,
  "region": "南予",
  "municipality": "宇和島市ほか",
  "areaTags": ["南予", "宇和島", "宇和海"],
  "type": "妖怪・祭礼・海の怪異",
  "subtypes": ["牛鬼", "祭礼", "海の怪物", "淵の怪異"],
  "traditionType": "お祭りに残っている",
  "evidenceLevel": "B",
  "evidenceLabel": "公的資料・郷土資料で確認予定",
  "scaryLevel": 3,
  "scaryLabel": "少しこわい",
  "shortDescription": "南予・宇和島に伝わる、牛のような頭を持つ迫力ある異形です。",
  "childDescription": "宇和島や南予には、牛鬼という大きな妖怪のような存在が伝わっています。今も祭りに登場し、地域の人々に親しまれています。",
  "locationId": "uwajima",
  "imagePath": "public/assets/images/generated/uwajima_ushioni_cluster.png",
  "placeholderIcon": "ushioni",
  "articleId": "uwajima_ushioni_cluster",
  "childItemIds": [
    "uwajima_ushioni",
    "ushioni_matsuri",
    "ushioni_buchi",
    "warei_jinja_ushioni",
    "yamabushi_ushioni"
  ],
  "sourceIds": [],
  "courseIds": ["nanyo_ushioni_course"],
  "quiz": [],
  "missions": [],
  "notes": "初期実装では出典候補を表示し、採用本文では断定しすぎない。"
}
```

### 5.3 派生項目データ構造

派生項目は以下の形式にしてください。

```json
{
  "id": "ushioni_matsuri",
  "parentId": "uwajima_ushioni_cluster",
  "name": "うわじま牛鬼まつりの牛鬼",
  "kana": "うわじまうしおにまつりのうしおに",
  "isCluster": false,
  "displayInList": false,
  "region": "南予",
  "municipality": "宇和島市",
  "type": "祭礼",
  "shortDescription": "現在も祭りに登場する牛鬼の姿です。",
  "childDescription": "宇和島の祭りでは、大きな牛鬼が町を練り歩きます。こわそうに見えますが、地域を元気にする大切な祭りの存在です。",
  "evidenceLevel": "B",
  "locationId": "uwajima",
  "sourceIds": [],
  "notes": ""
}
```

### 5.4 displayInList のルール

一覧画面には、原則として `isCluster: true` の親項目のみ表示してください。

派生項目は `displayInList: false` とし、親項目の詳細画面内で表示してください。

ただし、将来、独立表示したい派生項目があれば `displayInList: true` にすれば一覧に出せる設計にしてください。

## 6. 10大クラスターの具体データ

`legends.json` に、以下の親項目10件を必ず作成してください。

### 6.1 南予・宇和島の牛鬼

```txt
id: uwajima_ushioni_cluster
name: 南予・宇和島の牛鬼
kana: なんよ・うわじまのうしおに
region: 南予
municipality: 宇和島市ほか
type: 妖怪・祭礼・海の怪異
traditionType: お祭りに残っている
scaryLevel: 3
evidenceLevel: B
locationId: uwajima
courseIds: nanyo_ushioni_course
childItemIds:
- uwajima_ushioni
- ushioni_matsuri
- ushioni_buchi
- warei_jinja_ushioni
- yamabushi_ushioni
```

派生項目：

* 宇和島の牛鬼
* うわじま牛鬼まつり
* 牛鬼淵
* 和霊神社と牛鬼
* 山伏退治譚

### 6.2 松山の八百八狸と隠神刑部

```txt
id: matsuyama_tanuki_cluster
name: 松山の八百八狸と隠神刑部
kana: まつやまのはっぴゃくやだぬきといぬがみぎょうぶ
region: 中予
municipality: 松山市
type: 化け狸・城下町怪談
traditionType: 古い本にのっている
scaryLevel: 2
evidenceLevel: B
locationId: matsuyama_castle
courseIds: matsuyama_tanuki_course
childItemIds:
- inugami_gyobu
- matsuyama_sodo_tanuki
- happyakuya_tanuki
- matsuyama_castle_tanuki
- tanuki_bayashi
- tanuki_bi
```

派生項目：

* 隠神刑部
* 松山騒動八百八狸
* 八百八狸
* 松山城の狸伝承
* 狸火
* 狸囃子

### 6.3 伊予の怪鳥・波山

```txt
id: iyo_basan_cluster
name: 伊予の怪鳥・波山
kana: いよのかいちょう・ばさん
region: 愛媛県全域
municipality: 伊予国・要確認
type: 怪鳥・音の怪異
traditionType: 古い本にのっている
scaryLevel: 3
evidenceLevel: B
locationId: iyo_general
courseIds: iyo_mystery_course
childItemIds:
- basan
- basabasa
- inuhoo
- fire_breathing_bird
```

派生項目：

* 波山
* 婆娑婆娑
* 犬鳳凰
* 竹林にすむ火を吐く鳥

### 6.4 石鎚山の天狗と山岳信仰

```txt
id: ishizuchi_tengu_cluster
name: 石鎚山の天狗と山岳信仰
kana: いしづちさんのてんぐとさんがくしんこう
region: 東予・山間部
municipality: 西条市・久万高原町ほか
type: 山岳妖怪・山神・修験
traditionType: 山に伝わる
scaryLevel: 3
evidenceLevel: B
locationId: ishizuchi
courseIds: ishizuchi_tengu_course
childItemIds:
- ishizuchi_tengu
- tengudake_tengu
- ishizuchi_yamagami
- ishizuchi_shugen
- ishizuchi_kaika
- horagai_sound
```

派生項目：

* 石鎚山の天狗
* 天狗岳
* 山神
* 修験
* 怪火
* 法螺貝の音

### 6.5 道後温泉の神話と白鷺伝説

```txt
id: dogo_myth_cluster
name: 道後温泉の神話と白鷺伝説
kana: どうごおんせんのしんわとしらさぎでんせつ
region: 中予
municipality: 松山市
type: 温泉神話・霊泉伝説
traditionType: 神社・温泉に伝わる
scaryLevel: 1
evidenceLevel: A
locationId: dogo_onsen
courseIds: dogo_mystery_course
childItemIds:
- dogo_shirasagi
- sukunahikona_toji
- okuninushi_dogo
- tama_no_ishi
- dogo_yugami
```

派生項目：

* 白鷺伝説
* 少彦名命
* 大国主命
* 玉の石
* 湯神

### 6.6 石手寺と衛門三郎

```txt
id: ishiteji_emon_saburo_cluster
name: 石手寺と衛門三郎
kana: いしてじとえもんさぶろう
region: 中予
municipality: 松山市
type: 弘法大師伝説・遍路伝承・再来譚
traditionType: 神社・お寺に伝わる
scaryLevel: 2
evidenceLevel: B
locationId: ishiteji
courseIds: dogo_mystery_course
childItemIds:
- emon_saburo
- emon_saburo_rebirth
- kobodaishi_legend
- ishiteji_reiseki
```

派生項目：

* 衛門三郎
* 再来譚
* 弘法大師伝説
* 石手寺の霊石

### 6.7 宇和海の海の怪異

```txt
id: uwakai_sea_mystery_cluster
name: 宇和海の海の怪異
kana: うわかいのうみのかいい
region: 南予・海辺
municipality: 宇和島市・愛南町ほか
type: 海の怪異・船幽霊・海坊主
traditionType: 海や川に伝わる
scaryLevel: 4
evidenceLevel: C
locationId: uwakai
courseIds: nanyo_ushioni_course
childItemIds:
- uwakai_funayurei
- uwakai_umibozu
- hiburijima_kairei
- kushima_yobi
- toshima_kairei
```

派生項目：

* 宇和海の船幽霊
* 海坊主
* 日振島の海の怪異
* 九島の海の怪異
* 戸島の海の怪異

### 6.8 瀬戸内・村上海賊の海の怪異

```txt
id: setouchi_murakami_kaizoku_cluster
name: 瀬戸内・村上海賊の海の怪異
kana: せとうち・むらかみかいぞくのうみのかいい
region: 東予・島しょ部
municipality: 今治市ほか
type: 海賊伝承・海の怪異・城跡怪火
traditionType: 海や川に伝わる
scaryLevel: 3
evidenceLevel: C
locationId: noshima
courseIds: setouchi_mystery_ship_course
childItemIds:
- murakami_kaizoku_ghost
- noshima_yobi
- kurushima_funayurei
```

派生項目：

* 村上海賊の亡霊
* 能島城の夜火
* 来島海峡の船幽霊

### 6.9 鬼北の鬼と鬼ヶ城山

```txt
id: kihoku_oni_cluster
name: 鬼北の鬼と鬼ヶ城山
kana: きほくのおにとおにがじょうやま
region: 南予・山間部
municipality: 鬼北町・宇和島市周辺
type: 鬼・地名伝承・山の怪異
traditionType: 地名に残っている
scaryLevel: 3
evidenceLevel: B
locationId: kihoku
courseIds: nanyo_ushioni_course
childItemIds:
- kihoku_oni
- onigajo_oni
- onio_maru
- yukihime
```

派生項目：

* 鬼北の鬼
* 鬼ヶ城山の鬼
* 鬼王丸
* 柚鬼媛

### 6.10 愛媛の夜道の怪異

```txt
id: ehime_night_road_mysteries_cluster
name: 愛媛の夜道の怪異
kana: えひめのよみちのかいい
region: 愛媛県内各地
municipality: 要確認
type: 夜道の怪異・怪火・鳥の怪異
traditionType: 調査中
scaryLevel: 3
evidenceLevel: C
locationId: ehime_general
courseIds: night_road_mystery_course
childItemIds:
- yosuzume
- nobiagari
- yukibaba
- kane_no_kami_no_hi
```

派生項目：

* 夜雀
* 伸上り
* 雪婆
* 金の神の火

## 7. articles.json の要件

10大クラスターそれぞれについて、`articles.json` に記事データを用意してください。

初期実装では、各記事本文は800〜1200字程度の仮本文で構いません。
将来的には1,500〜2,500字程度に拡張します。

記事本文では、以下を含めてください。

* 現在よく知られる姿
* 地域との関係
* 派生伝承の整理
* 歴史・民俗的背景
* 象徴としての読み解き
* 現代との関係
* 出典確認が未完了の場合は断定しない表現

記事本文に、制作側コメントを入れないでください。

禁止表現例：

* 「図鑑ではこう見せるとよい」
* 「画像生成ではこの特徴を強調する」
* 「アプリ上ではこう表示する」

記事データ例：

```json
{
  "id": "uwajima_ushioni_cluster",
  "title": "南予・宇和島の牛鬼　祭りに生きる異形",
  "summary": "牛鬼は、南予・宇和島の祭礼や海の怪異と結びついた、愛媛を代表する伝承です。",
  "article": "南予・宇和島の牛鬼は、牛のような頭を持つ異形として知られる。現在では、宇和島の祭りに登場する巨大な牛鬼の姿がよく知られているが、その背後には、海や淵の怪異、退治譚、地域の祭礼文化が重なっている……",
  "keywords": ["牛鬼", "宇和島", "南予", "祭礼", "海の怪異"],
  "regions": ["南予", "宇和島市"],
  "historicalSources": [],
  "imageSources": [],
  "notes": "初期本文。出典確認後に加筆予定。"
}
```

## 8. locations.json の要件

10大クラスターに対応する代表地点を作成してください。

緯度経度が正確に分からない場合は、市町代表点で仮置きし、`isApproximate: true` を付けてください。

最低限、以下の locationId を作成してください。

```txt
uwajima
matsuyama_castle
iyo_general
ishizuchi
dogo_onsen
ishiteji
uwakai
noshima
kihoku
ehime_general
```

地点データ例：

```json
{
  "id": "uwajima",
  "name": "宇和島市",
  "region": "南予",
  "municipality": "宇和島市",
  "lat": 33.2232,
  "lng": 132.5606,
  "isApproximate": true,
  "description": "南予の中心都市。牛鬼や宇和海の伝承と関わる。",
  "legendIds": ["uwajima_ushioni_cluster"]
}
```

## 9. courses.json の要件

探検コースを最低6件作成してください。

### 9.1 南予うしおにコース

```json
{
  "id": "nanyo_ushioni_course",
  "title": "南予うしおにコース",
  "region": "南予",
  "description": "宇和島の牛鬼、鬼北の鬼、宇和海の怪異をめぐるコースです。",
  "legendIds": [
    "uwajima_ushioni_cluster",
    "kihoku_oni_cluster",
    "uwakai_sea_mystery_cluster"
  ],
  "estimatedTime": "15分",
  "difficulty": "やさしい"
}
```

### 9.2 松山たぬきコース

対象：

* 松山の八百八狸と隠神刑部
* 道後温泉の神話と白鷺伝説
* 石手寺と衛門三郎

### 9.3 石鎚てんぐコース

対象：

* 石鎚山の天狗と山岳信仰
* 西条・東予方面に将来追加される水神・山神候補

### 9.4 瀬戸内ふしぎ船コース

対象：

* 瀬戸内・村上海賊の海の怪異
* 来島海峡周辺の海の怪異

### 9.5 道後ふしぎ湯コース

対象：

* 道後温泉の神話と白鷺伝説
* 石手寺と衛門三郎
* 松山の八百八狸と隠神刑部

### 9.6 夜道の怪異コース

対象：

* 愛媛の夜道の怪異
* 伊予の怪鳥・波山

## 10. sources.json の要件

初期段階では、出典候補を整理する枠を作ってください。

少なくとも以下の出典候補を登録してください。

* 愛媛県生涯学習センター「えひめの記憶」
* 愛媛県史
* 市町村誌
* 宇和島市公式資料・観光資料
* 松山市公式資料・観光資料
* 道後温泉関連公式資料
* 石手寺関連資料
* 石鎚山関連資料
* 大山祇神社・村上海賊関連資料
* NDLデジタルコレクション
* 国立国会図書館サーチ
* 国際日本文化研究センター 怪異・妖怪伝承データベース
* Wikipediaは発見用インデックスとしてのみ扱う

注意：

Wikipediaは出典候補の発見には使ってよいが、原典として扱わないでください。
本文に採用する場合は、脚注にある民俗資料・県史・市町村誌などに遡って確認する前提にしてください。

## 11. evidence_check_table.json の要件

10大クラスターと派生項目について、典拠確認表を作成してください。

構造：

```json
{
  "candidateName": "南予・宇和島の牛鬼",
  "parentId": "uwajima_ushioni_cluster",
  "displayType": "親項目",
  "region": "南予",
  "municipality": "宇和島市ほか",
  "category": "妖怪・祭礼・海の怪異",
  "sourceCandidate": "宇和島市公式資料、愛媛県史、市町村誌、民話集等",
  "originalSourceStatus": "要原典確認",
  "visualizationEase": "高",
  "childSuitability": "高",
  "articlePriority": "A",
  "integrationPolicy": "親項目として表示。派生候補は詳細内に格納。",
  "notes": ""
}
```

表示区分は以下のいずれかにしてください。

* 親項目
* 派生項目
* 出典事例
* 保留

## 12. 画面実装

### 12.1 index.html

トップ画面には以下を表示してください。

* アプリタイトル
* サブタイトル
* 今日の伝承
* 愛媛ふしぎ地図プレビュー
* 探検コース
* メインメニュー

タイトル：

```txt
愛媛ふしぎ伝承図鑑
```

サブタイトル：

```txt
地図でめぐる、愛媛の妖怪・伝承・怪異
```

説明文：

```txt
愛媛県に伝わる妖怪、怪異、神話、祭り、ふしぎな場所を、地図と図鑑でめぐる郷土探検アプリです。
```

### 12.2 encyclopedia.html

図鑑一覧では、10大クラスターの親項目カードを表示してください。

各カードの表示項目：

* 画像またはプレースホルダー
* 名称
* かな
* 地域
* 市町
* 類型
* 伝承タイプ
* こわさ
* 典拠レベル
* 短い説明
* 関連する派生伝承の件数
* 詳しく見るボタン
* 探検手帳に追加ボタン

派生項目は一覧には出さないでください。

### 12.3 詳細モーダル

詳細では以下を表示してください。

* 親項目の基本情報
* 子ども向け説明
* 関連する派生伝承一覧
* 地図で見る
* もっと詳しく読む
* 出典を見る
* 探検手帳に追加
* クイズに挑戦

派生伝承一覧では、各派生項目の短い説明を表示してください。

### 12.4 map.html

初期版では、愛媛県の模式地図でよいです。

地域ボタン：

* 東予
* 中予
* 南予
* 島しょ部
* 山間部
* 海辺

地図上に10大クラスターを代表ピンとして表示してください。

ピンをクリックすると、簡易カードを表示し、詳細へ遷移できるようにしてください。

### 12.5 courses.html

探検コース一覧を表示してください。

各コースには以下を表示してください。

* コース名
* 地域
* 説明
* 含まれる親項目
* 進捗
* このコースを始めるボタン

### 12.6 notebook.html

探検手帳では、localStorage を使って以下を管理してください。

* 発見済み
* 読了済み
* 行ってみたい
* 自分のメモ
* クイズ正解履歴
* コース進捗

### 12.7 quiz.html

初期版では、10大クラスターに対して各1問以上の三択クイズを作成してください。

クイズが未設定の場合はスキップしてください。

### 12.8 sources.html

資料室では以下を表示してください。

* 出典候補一覧
* 典拠レベル説明
* 伝承タイプ説明
* 典拠確認表
* Wikipediaは原典ではなく発見用である旨

## 13. 伝承タイプと典拠レベル

### 13.1 伝承タイプ

以下のラベルを使ってください。

```txt
📜 古い本にのっている
🏮 お祭りに残っている
🗺 地名に残っている
⛩ 神社・お寺に伝わる
🌊 海や川に伝わる
⛰ 山に伝わる
🧭 調査中
```

### 13.2 典拠レベル

以下を表示してください。

```txt
A：県史・市町村誌・公的資料・郷土資料で確認済み
B：民話集・郷土資料・公的観光資料等で確認済み
C：二次資料で確認、原典照合中
D：候補段階
```

初期データでは、確実に確認済みでない限り、Aを乱用しないでください。
不確かなものはCまたはDにしてください。

## 14. デザイン方針

全体のデザインは、以下の方向にしてください。

* 和風
* 郷土資料館
* 探検地図
* 絵本
* 怖すぎない
* 子どもにも大人にも読みやすい

色：

* 背景：和紙風の生成り
* メインアクセント：みかん色
* サブアクセント：瀬戸内海の青
* 山系：石鎚の深緑
* 南予系：牛鬼を連想する赤・黒を控えめに

UI：

* 角丸カード
* 大きめの文字
* スマホで押しやすいボタン
* 地域タグ
* 伝承タイプタグ
* 典拠レベルバッジ
* こわさレベル表示
* 関連伝承チップ

## 15. 軽いアニメーション

詳細画面を開いたとき、類型に応じて軽い演出を入れてください。

* 牛鬼・鬼：軽い振動
* 狸：葉っぱや煙
* 怪鳥：羽が舞う
* 山岳信仰：霧
* 温泉：湯気
* 寺社：光の粒
* 海の怪異：波紋
* 夜道の怪異：足音や小さな光

ただし、怖すぎる演出、激しい点滅、強い揺れは避けてください。

必ず `prefers-reduced-motion` に対応してください。

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 16. validate_data.py

`scripts/validate_data.py` を作成してください。

検証項目：

* legends.json が存在する
* articles.json が存在する
* locations.json が存在する
* courses.json が存在する
* sources.json が存在する
* 親項目10件が存在する
* 親項目は `isCluster: true`
* 派生項目は `parentId` を持つ
* childItemIds が実在する
* id が重複していない
* name が空でない
* region が空でない
* evidenceLevel が A/B/C/D のいずれか
* scaryLevel が1〜5
* articleId がある場合、articles.json に対応IDがある
* locationId がある場合、locations.json に対応IDがある
* courseIds がある場合、courses.json に対応IDがある
* sourceIds がある場合、sources.json に対応IDがある
* displayInList が false の派生項目が一覧に出ない構造になっている
* 画像が存在しない場合は警告

実行コマンド：

```bash
python scripts/validate_data.py
```

## 17. README.md

README.md に以下を記載してください。

* プロジェクト概要
* 10大クラスター構成
* 親項目と派生項目の違い
* ファイル構成
* ローカル実行方法
* データ追加方法
* 親項目追加方法
* 派生項目追加方法
* 記事追加方法
* 出典追加方法
* 典拠レベルの意味
* 探検手帳の保存内容
* localStorage のリセット方法
* 今後の拡張方針

ローカル実行方法：

```bash
python -m http.server 8000
```

URL：

```txt
http://localhost:8000/
```

## 18. 受入条件

以下を満たせば完了です。

1. index.html が表示できる
2. 10大クラスターが legends.json に存在する
3. 各クラスターに派生項目が紐づいている
4. 図鑑一覧には親項目のみ表示される
5. 詳細画面で派生項目が表示される
6. 今日の伝承が表示される
7. 地図プレビューが表示される
8. map.html で10大クラスターの地域表示ができる
9. courses.html に探検コースが表示される
10. notebook.html で発見・読了・メモが保存できる
11. quiz.html で初期クイズが動く
12. sources.html に出典候補と典拠レベル説明がある
13. articles.json から「もっと詳しく」が表示される
14. 画像がない場合でもプレースホルダーが表示される
15. スマホ幅で表示が崩れない
16. validate_data.py が実行できる
17. README.md がある
18. Wikipediaを原典扱いしていない

## 19. 禁止事項

以下は禁止します。

* 派生項目を親項目と同列に大量表示して一覧を重複させること
* 伝承データをHTMLに直書きすること
* Wikipediaだけを原典として扱うこと
* 出典未確認情報を断定的に書くこと
* 近現代創作設定を古い伝承のように書くこと
* 子ども向けとして過度に怖い、残酷、流血を強調すること
* 外部ライブラリなしで動く構成を壊すこと
* ビルドしないと動かない構成にすること

## 20. 作業完了時の報告

作業完了後、以下を報告してください。

* 作成・更新したファイル一覧
* legends.json の親項目件数
* 派生項目件数
* 実装した10大クラスター一覧
* 実装した探検コース一覧
* 地図モードの実装状況
* 探検手帳の実装状況
* クイズの実装状況
* 出典・典拠レベル表示の実装状況
* validate_data.py の実行結果
* 未実装または保留にした点
* 人間が次に確認すべき点

```

この指示書では、**「10大クラスター＝一覧表示される主役」**、**「派生候補＝詳細内で読ませる素材」**に分けています。これにより、牛鬼・八百八狸のような重複を避けつつ、読み物としての厚みを確保できます。
```
