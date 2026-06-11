# こども妖怪図鑑ポータル

子ども向けの静的HTML図鑑ポータルです。トップページから、全国50体の「こども妖怪図鑑」と、愛媛県の妖怪・怪異・神話・祭礼を扱う「愛媛ふしぎ伝承図鑑」に入れます。どちらもJSONを正本として読み込み、HTMLに個別データを直書きしない構成です。

文章編集・データ編集時の恒久ルールは `AGENTS.md` に集約しています。本文、ID、画像パス、参照関係を変更する前に確認してください。

## ファイル構成

```txt
index.html              # 統合トップページ
yokai.html              # こども妖怪図鑑本編
ehime.html              # 愛媛ふしぎ伝承図鑑
about.html              # 図鑑の説明
sources.html            # 出典・参考資料
css/style.css           # 画面デザイン
css/ehime.css           # 統合トップ・愛媛版デザイン
js/app.js               # 初期化とイベント登録
js/dataLoader.js        # JSON読み込みと正規化
js/render.js            # カード・出典表示
js/filters.js           # 検索・絞込・並び替え
js/detail.js            # 詳細モーダル
js/opening.js           # 絵本を開くオープニング
js/ehime.js             # 愛媛版の描画・検索・詳細・手帳・クイズ
public/data/yokai.json  # 妖怪データ
public/data/generation_prompts.json # 生成プロンプト管理
public/data/legends.json # 愛媛版の伝承クラスター
public/data/articles.json # 愛媛版の詳しい記事
public/data/child_articles.json # 愛媛版の派生項目ごとの詳しい記事
public/data/locations.json # 愛媛版の場所データ
public/data/courses.json # 愛媛版の探検コース
public/data/sources.json # 愛媛版の出典データ
public/data/evidence_check_table.json # 愛媛版の確認度メモ
public/assets/yokai/generated/ # 生成イラスト
public/assets/opening/ # オープニング用の生成背景・ForgeCADレンダー
public/assets/ehime/generated/ # 愛媛版の生成イラスト
scripts/update_50_yokai_data.mjs # 50体版データ同期用の補助スクリプト
scripts/build_detailed_articles.mjs # もっと詳しく記事の同期用スクリプト
scripts/enrich_tradition_history.mjs # 伝承史4観点の増補スクリプト
scripts/remove_generic_article_filler.mjs # 汎用的な重複段落の削除スクリプト
scripts/forgecad/opening_storybook.forge.js # オープニング用3D絵本モデル
yokai_detailed_articles.md # 詳細記事の原稿
```

## ローカルでの起動方法

`fetch` でJSONを読むため、HTMLファイルの直接オープンではなく簡易サーバーで起動してください。

Windowsでは、ルートにある `start-yokai-zukan.bat` をダブルクリックすると、ローカルサーバーを起動してブラウザでポータルを開きます。終了するときは、起動した黒いウィンドウを閉じてください。

```bash
python -m http.server 8000
```

表示URL:

```txt
http://localhost:8000/
```

主なページ:

- `http://localhost:8000/` 統合トップページ
- `http://localhost:8000/yokai.html` こども妖怪図鑑
- `http://localhost:8000/ehime.html` 愛媛ふしぎ伝承図鑑

## GitHub Pagesで公開する方法

この図鑑は静的HTML / CSS / JavaScriptだけで動くため、GitHub Pagesにそのまま配置できます。`index.html` がリポジトリ直下にある状態で、GitHubのリポジトリ設定から Pages の公開元を `main` ブランチの `/(root)` にしてください。公開URLは通常、次の形式になります。

```txt
https://ryotamatsuki.github.io/yokaizukan/
```

公開時の注意点は次の通りです。

- `node_modules/` はアップロード不要です。`.gitignore` で除外しています。
- GitHub PagesのJekyll処理を避けるため、空の `.nojekyll` を置いています。
- 画像やJSONは相対パスで参照しているため、プロジェクトPagesの `/yokaizukan/` 配下でも動きます。
- GitHub Pagesは大文字小文字を区別するため、画像ファイル名を変更するときは `yokai.json` の `generatedImagePath` や愛媛版データの `imagePath` と完全に一致させてください。

## データ追加方法

`public/data/yokai.json` の `items` 配列に妖怪データを追加します。HTMLに妖怪名や説明文を直書きしないでください。

主な項目:

- `id`: 英数字スラッグ
- `name`: 妖怪名
- `kana`: 読み
- `category`: カテゴリ
- `oneLine`: ひとことで
- `childDescription`: 子ども向け説明
- `scaryLevel`: 1から5
- `scaryLabel`: 表示ラベル
- `habitat`: 出る場所の配列
- `visualFeatures`: 見た目の特徴の配列
- `generatedImagePath`: 生成イラストのパス
- `historicalImages`: むかしの絵の情報
- `textReferenceUrls`: 解説参考URL
- `missions`: 観察・調べものミッション
- `quiz`: 三択クイズ
- `detailedArticle`: 「もっと詳しく読む」用の記事本文と参考リンク

## もっと詳しく記事

詳細モーダルには「もっと詳しく読む」ボタンがあります。押すと、伝承、古典画、暮らしとの関係、現代イメージとの距離を整理した読み物記事と、原典確認の入口になる参考リンクを表示します。

記事原稿は `yokai_detailed_articles.md` にまとめています。`scripts/build_detailed_articles.mjs` を実行すると、Markdownに未記載の妖怪記事を補完し、`public/data/yokai.json` の `detailedArticle` に本文と参考リンクを同期します。

```bash
node scripts/build_detailed_articles.mjs
```

伝承史を「民話での型」「古典・芸能での展開」「絵画での変化」「現代図鑑での姿」の4観点でそろえる場合は、次を実行します。定型的な重複段落が残った場合は、続けて削除スクリプトを実行します。

```bash
node scripts/enrich_tradition_history.mjs
node scripts/remove_generic_article_filler.mjs
node scripts/build_detailed_articles.mjs
```

## 画像追加方法

生成イラストは `public/assets/yokai/generated/` に保存し、`generatedImagePath` に `public/assets/yokai/generated/example.png` の形式で指定します。画像が読めない場合は画面に「画像準備中」と表示されます。

追加20体分の画像生成プロンプトは `public/data/generation_prompts.json` にまとめています。画像を再生成する場合は、対象IDの `promptJa` / `promptEn` と `outputPath` を確認し、同じパスへPNGを保存してください。

## 愛媛ふしぎ伝承図鑑

`ehime.html` は、愛媛県の妖怪・怪異・神話・祭礼・霊地を10大クラスターとして整理した地域版です。`public/data/legends.json`、`articles.json`、`locations.json`、`courses.json`、`sources.json`、`evidence_check_table.json` を読み込みます。

初期実装の10大クラスター:

- 南予・宇和島の牛鬼
- 松山の八百八狸と隠神刑部
- 伊予の怪鳥・波山
- 石鎚山の天狗と山岳信仰
- 道後温泉の神話と白鷺伝説
- 石手寺と衛門三郎
- 宇和海の海の怪異
- 瀬戸内・村上海賊の海の怪異
- 鬼北の鬼と鬼ヶ城山
- 愛媛の夜道の怪異

愛媛版では、親項目を一覧・地図・コースに表示し、派生伝承は詳細画面の「関連する伝承」に格納しています。画像は `public/assets/ehime/generated/` に保存し、各クラスターの `imagePath` から参照します。出典リンクは `public/data/sources.json` に集約し、詳細画面と出典タブで確認できます。

親クラスターの下には、46件の派生項目を置いています。各派生項目には `id`、説明文、見た目の手がかり、出典ID、個別画像パスを持たせ、親クラスター詳細内の小カードからクリックして読めるようにしています。派生画像は、クラスターごとの生成パネル画像を新規生成し、`public/assets/ehime/generated/children/` に個別PNGとして切り出しています。元の生成パネルは `public/assets/ehime/generated/children/_sheets/` に残しています。

派生項目にも「もっと詳しく読む」記事を追加しています。本文は `public/data/child_articles.json` に分離し、各派生項目の詳細画面でボタンを押したときだけ開く構造です。記事には、伝承の型、資料上の扱い、場所との関係、図鑑での再解釈、参考リンクを入れています。

新しい愛媛の伝承を追加する場合は、次の順に更新します。

1. `public/data/legends.json` に親項目または派生項目を追加する
2. 詳しい本文を `public/data/articles.json` に追加する
3. 場所が増える場合は `locations.json`、コースに入れる場合は `courses.json` を更新する
4. 参考資料を `sources.json` に追加し、`sourceIds` で伝承にひも付ける
5. 確認度や追加調査メモを `evidence_check_table.json` に記録する
6. 生成画像を `public/assets/ehime/generated/` に置き、`imagePath` を合わせる

派生項目を追加する場合は、親項目の `childItemIds` と `childItems` の両方に追加し、画像を `public/assets/ehime/generated/children/` に保存します。派生項目はトップの一覧には出さず、親クラスターの詳細からたどる構造にしています。

## オープニングアニメーション

`yokai.html` の冒頭に、絵本を開くような `opening-screen` を用意しています。閉じた本を開くと、生成した絵本表紙と見開き風景が現れ、ページから立体的な風景と妖怪たちが順番に飛び出します。外部ライブラリは使わず、CSS transform / animation と `js/opening.js` の class 切替で動かしています。

オープニングの立体感を出すため、次のアセットを使っています。

- `public/assets/opening/storybook_cover.png`: 生成画像による和風の閉じた本の表紙
- `public/assets/opening/storybook_scene.png`: 生成画像による絵本風の山・川・月のポップアップ背景
- `public/assets/opening/storybook_cad_depth.png`: ForgeCADモデルからレンダーした本と紙レイヤーの奥行き補助
- `scripts/forgecad/opening_storybook.forge.js`: 奥行き確認・再レンダー用のForgeCADモデル

ForgeCADレンダーを作り直す場合は、ForgeCAD CLIが使える状態で次を実行します。

```bash
node node_modules/forgecad/dist-cli/forgecad.js render 3d scripts/forgecad/opening_storybook.forge.js --output public/assets/opening/storybook_cad_depth.png --view hero --edges off --size 1200 --chrome-path "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
```

オープニングは、`yokai.html` を開いたときに毎回表示されます。「スキップ」ボタンはその場で図鑑へ進むためのもので、次回起動時まで自動スキップを持ち越しません。以前の版で使っていた `localStorage` の `openingSeen` は、起動時に削除されるようにしています。もう一度見たい場合は、こども妖怪図鑑内の「もう一度オープニングを見る」ボタンを押してください。

飛び出す妖怪は、`public/data/yokai.json` の画像パスから毎回ランダムに選ばれます。最初に飛び出す妖怪は「今日の妖怪」として日付から決まり、節分の時期は鬼が優先されます。背景は季節で変わり、夏は川辺、冬は雪景色、節分は鬼が似合う夜景、春秋は通常の山と川になります。ボタン操作時には、ページをめくるような短い効果音をWeb Audio APIで鳴らします。

オープニング画像を差し替える場合は、表紙なら `public/assets/opening/storybook_cover.png`、風景なら `public/assets/opening/storybook_scene.png` を同じファイル名で差し替えます。奥行き補助の見た目を変えたい場合は `scripts/forgecad/opening_storybook.forge.js` を調整し、`storybook_cad_depth.png` を再レンダーしてください。飛び出す妖怪画像を変える場合は、`public/assets/yokai/generated/` に画像を追加し、`public/data/yokai.json` の `generatedImagePath` を更新します。初期表示用の固定画像を変えたい場合は、`yokai.html` の `data-popup-yokai` 付き画像と、`js/opening.js` の `DEFAULT_POPUP_YOKAI` を同じパスにそろえます。

## 妖怪ごとの詳細アニメーション

詳細モーダルを開いたときに、妖怪ごとの個性が伝わる短い演出を追加しています。実装は `css/style.css` と `js/detail.js` のみで、外部ライブラリは使っていません。`prefers-reduced-motion` が有効な環境では、アニメーション時間を極小にして動きを控えます。

`detail.js` の `effectMap` で `yokai.json` の `id` とエフェクトクラスを対応づけています。新しい妖怪を追加する場合は、`public/data/yokai.json` に `id` と画像を追加したうえで、`effectMap` に対応するエフェクトクラスを追加してください。詳細モーダルを閉じると、`animation-layer` の装飾要素と前回のエフェクトクラスは削除されます。

| 妖怪ID | エフェクト | 演出 |
|---|---|---|
| `kappa` | `effect-water` | 青い波紋 |
| `tengu` | `effect-leaves` | 葉っぱが落ちる |
| `oni` | `effect-shake` | 軽く揺れて登場 |
| `rokurokubi` | `effect-stretch` | 少し縦に伸びる |
| `nekomata` | `effect-tail` | しっぽ風の揺れ |
| `karakasa-kozo` | `effect-jump` | ぴょんと跳ねる |
| `chochin-obake` | `effect-glow` | やさしく光る |
| `yuki-onna` | `effect-snow` | 雪が降る |
| `nurikabe` | `effect-wall` | 壁が横から出る |
| `gashadokuro` | `effect-shadow` | 大きな影が浮かぶ |
| `karasu-tengu` | `effect-feathers` | 羽根が舞う |
| `hitotsume-kozo` | `effect-blink` | 目がぱちっと開く |
| `zashiki-warashi` | `effect-sparkle` | 光の粒 |
| `bakeneko` | `effect-tail` | 猫のしっぽ風の揺れ |
| `kitsunebi` | `effect-foxfire` | 青白い狐火 |
| `bake-danuki` | `effect-transform` | ぽんっと変身 |
| `akaname` | `effect-bath-steam` | 湯気 |
| `azuki-arai` | `effect-azuki` | 小豆の粒 |
| `umibozu` | `effect-wave-shadow` | 波の影 |
| `ningyo` | `effect-bubbles` | 泡 |
| `wanyudo` | `effect-wheel` | 車輪が一回転 |
| `kamaitachi` | `effect-wind-slash` | 風の線 |
| `kodama` | `effect-tree-sway` | 木の影が揺れる |
| `yamanba` | `effect-mountain-mist` | 山の霧 |
| `oonyudo` | `effect-grow` | 少し大きくなる |
| `tsuchigumo` | `effect-web` | 薄い蜘蛛の巣 |
| `nue` | `effect-thunder` | 小さな稲妻 |
| `hitodama` | `effect-floating-fire` | 火の玉が浮かぶ |
| `tofu-kozo` | `effect-wobble` | ふにゃっと揺れる |
| `hyakki-yagyo` | `effect-parade` | 小さな行列 |
| `mokumokuren` | `effect-eyes` | 小さな目が現れる |
| `nuppeppo` | `effect-soft-wobble` | やわらかく揺れる |
| `shiro_uneri` | `effect-cloth-wave` | 布が横に揺れる |
| `fumikuruma_yohi` | `effect-paper` | 紙片が舞う |
| `koto_furunushi` | `effect-music` | 音符が浮かぶ |
| `kaichigo` | `effect-shell` | 貝殻と泡 |
| `abura_sumashi` | `effect-lantern-dim` | ぼんやり光る |
| `sunekosuri` | `effect-footsteps` | 足あと |
| `sunakake_baba` | `effect-sand` | 砂粒が流れる |
| `konaki_jiji` | `effect-heavy-drop` | 少し沈んで戻る |
| `betobeto_san` | `effect-footsteps` | 足あと |
| `okuri_inu` | `effect-shadow-walk` | 影が横切る |
| `enenra` | `effect-smoke` | 煙が上がる |
| `ame_onna` | `effect-rain` | 雨粒 |
| `kamikiri` | `effect-scissors` | はさみの影 |
| `ittan_momen` | `effect-flying-cloth` | 白い布が横切る |
| `ubume` | `effect-mist` | 霧が流れる |
| `ushi_oni` | `effect-heavy-shadow` | 大きな影 |
| `hyosube` | `effect-water` | 青い波紋 |
| `daidarabotchi` | `effect-giant-step` | 大きな足あと |

## 出典管理方法

解説に使った参考資料は `textReferenceUrls` に追加します。史料画像を表示する場合は、利用条件が確認できるものだけを `historicalImages` に追加してください。利用条件が不明な画像は追加しません。

## 50体版への拡張内容

30体版に、目目連、ぬっぺっぽう、白うねり、文車妖妃、琴古主、貝児、油すまし、すねこすり、砂かけ婆、子泣き爺、べとべとさん、送り犬、煙々羅、雨女、髪切り、一反木綿、うぶめ、牛鬼、ひょうすべ、だいだらぼっちの20体を追加し、合計50体に拡張しました。

新しい妖怪をさらに追加する場合は、`public/data/yokai.json` の `items` にデータを追加し、画像を `public/assets/yokai/generated/` に置きます。必要に応じて `public/data/generation_prompts.json`、`js/detail.js` の `effectMap`、`README_assets.md` と `public/assets/yokai/yokai_image_manifest.csv` も更新してください。詳しい記事を追加したら `yokai_detailed_articles.md` に見出しを作り、`node scripts/build_detailed_articles.mjs` で `detailedArticle` と参考リンクを同期します。カード一覧、検索、カテゴリ絞込、こわさ絞込、詳細表示はデータから自動反映されます。

## 注意事項

- サーバーサイド処理やビルド環境は使っていません。
- 外部CDNには依存していません。
- 生成イラストは古典資料の特徴を参考にした再解釈で、昔の絵そのものではありません。
- 子ども向けのため、過度に怖い表現、残酷表現、流血表現は避けます。
- `public/data/image_sources.json` が追加された場合は、必要に応じて出典ページや運用資料に反映できます。
## 画像生成エフェクト素材を使った詳細演出

既存10妖怪の詳細画面に、画像生成した透明背景WebP素材を重ねる「妖怪ステージ」を追加しました。妖怪画像をタップすると通常リアクションが出て、「ひっさつわざ！」ボタンでは妖怪ごとの大きめの演出が再生されます。

- エフェクト素材: `public/assets/effects/`
- 生成元シート: `public/assets/effects/_sheets/`
- プレビュー: `public/assets/effects/_preview/effect_sheet_contact.png`
- 素材管理: `public/data/effect_assets.json`
- 生成プロンプト管理: `public/data/effect_generation_prompts.json`
- 効果音置き場: `public/assets/sounds/`

音はユーザー操作後にだけ再生されます。画像タップ、もういちどボタン、ひっさつわざボタン、音ボタンでは `unlockAudio()` が `AudioContext` を初期化・resume します。実音声ファイルが未配置の場合でも画面は止まらず、`js/sound.js` のWeb Audioフォールバックで短い効果音を鳴らします。ミュート状態は `localStorage` に保存され、詳細画面の「おと：オン」「おと：オフ」ボタンで切り替えできます。

iPhone / iPad では、本体の消音モードがオンだとSafari上の効果音が聞こえない場合があります。効果音を確認するときは、消音モードを解除し、本体音量を上げてください。あわせて、アプリ内の「おと：オン / オフ」ボタンも確認してください。

新しい妖怪に同じ仕組みを追加する場合は、`public/data/yokai.json` の対象妖怪に `animationProfile` と `specialMove` を追加し、使用する素材を `public/assets/effects/` に配置します。その後、必要に応じて `public/data/effect_assets.json` と `public/data/effect_generation_prompts.json` に素材情報とプロンプトを追加してください。

`prefers-reduced-motion: reduce` に対応しており、動きを減らす設定の環境では強い動きの代わりに短い表示変化で反応します。
