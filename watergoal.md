前提：
- 既存10体と、追加済み5体のアニメーション仕様を踏襲してください。
- ひっさつわざ時は special-effect-sprite を使い、エフェクトレイヤーが前面に出る既存方針を維持してください。
- 追加5体で発生した「素材はあるが、ひっさつボタン時に見えない」問題を再発させないでください。
- 画像生成スキルを使用して、必要な新規エフェクト画像を実際に生成してください。
- 単に effect_generation_prompts.json にプロンプトを書くのみで終わらせないでください。
- 今回のタスクでは、各対象妖怪について少なくとも1点以上の新規エフェクト画像を画像生成スキルで作成し、public/assets/effects/ 配下に実ファイルとして保存してください。画像生成せずに既存素材流用だけで完了することは禁止します。

対象6体：
- 人魚
- 海坊主
- 雨女
- ひょうすべ
- 木霊
- 山姥

対象ファイル：
- public/data/yokai.json
- public/data/effect_assets.json
- public/data/effect_generation_prompts.json
- public/assets/effects/
- css/style.css
- js/effects.js
- js/sound.js
- scripts/validate_data_integrity.mjs
- README_assets.md

基本方針：
- 各妖怪に animationProfile と specialMove を追加する。
- 既存10体・追加5体と同じJSON構造にする。
- 通常リアクションは画像タップ・「もういちど！」ボタンで動くようにする。
- ひっさつわざは「ひっさつわざ！」ボタンで、通常より大きく派手に表示する。
- 通常リアクション用素材は最大3枚。
- ひっさつわざ用素材は最大4枚。
- 新規画像素材は各妖怪1〜2点を目安にする。
- 透明背景WebPにする。
- 1枚あたり50〜150KB程度を目安にする。
- 怖すぎる、残酷、流血、攻撃的な表現は禁止。
- 子ども向けに、明るく楽しい図鑑演出として使える表現にする。
- 妖怪説明文、trivia、detailedArticle は変更しない。
- ID、generatedImagePath、articleId、sourceIds は変更しない。

6体の演出方針：

1. 人魚
- stage: water
- 通常リアクション：泡がぷくぷく浮かぶ
- ひっさつわざ：貝と波のきらめき
- 新規素材候補：
  - public/assets/effects/water/mermaid_bubbles.webp
  - public/assets/effects/water/shell_sparkle_wave.webp
- 既存素材流用：
  - water_drops
  - ripple
  - warm_light_orbs など
- 表現方針：
  - 海の神秘、泡、貝、やわらかい光を中心にする。
  - 人魚本体を追加生成しない。エフェクト素材のみ生成する。

2. 海坊主
- stage: water または night
- 通常リアクション：波がゆれる
- ひっさつわざ：海の影がむくり
- 新規素材候補：
  - public/assets/effects/water/dark_wave_shadow.webp
  - public/assets/effects/water/sea_shadow_rise.webp
- 既存素材流用：
  - water_spiral
  - big_splash
  - water_drops
- 表現方針：
  - 怖くしすぎず、黒い大きな波影として表現する。
  - 船を沈める、襲うなどの直接的な攻撃表現は避ける。

3. 雨女
- stage: rain または water
- 通常リアクション：雨つぶぽつぽつ
- ひっさつわざ：雨雲カーテン
- 新規素材候補：
  - public/assets/effects/water/soft_raindrops.webp
  - public/assets/effects/water/rain_cloud_curtain.webp
- 既存素材流用：
  - water_drops
  - cold_mist
  - warm_light_orbs
- 表現方針：
  - 暗すぎる雨ではなく、やわらかい雨粒と雲の演出にする。
  - 悲しい雰囲気に寄せすぎない。

4. ひょうすべ
- stage: water
- 通常リアクション：水辺でぴょこ
- ひっさつわざ：川べりジャンプ
- 新規素材候補：
  - public/assets/effects/water/river_hop_splash.webp
  - public/assets/effects/pop/water_jump_pop.webp
- 既存素材流用：
  - ripple
  - water_splash
  - jump_dust
  - pop_mark
- 表現方針：
  - 河童系と似すぎないよう、いたずらっぽい小さな水跳ねにする。
  - かわいく、軽快なジャンプ演出にする。

5. 木霊
- stage: mountain または forest
- 通常リアクション：葉がさわさわ
- ひっさつわざ：森のこだま光
- 新規素材候補：
  - public/assets/effects/wind/forest_leaves_soft.webp
  - public/assets/effects/glow/kodama_echo_light.webp
- 既存素材流用：
  - leaves
  - flying_leaves
  - warm_light_orbs
  - sparkle_trail
- 表現方針：
  - 森、葉、木漏れ日、小さな光を中心にする。
  - 幽霊っぽくしすぎず、森の精霊感を出す。

6. 山姥
- stage: mountain
- 通常リアクション：山霧ふわり
- ひっさつわざ：山道ミスト
- 新規素材候補：
  - public/assets/effects/snow/mountain_mist_soft.webp
  - public/assets/effects/wind/mountain_path_mist.webp
- 既存素材流用：
  - cold_mist
  - flying_leaves
  - wind_swirl
- 表現方針：
  - 怖い老婆の演出ではなく、山の霧・気配・不思議さを中心にする。
  - 追いかける、襲う、食べるなどの表現は禁止。

実装ルール：

1. yokai.json
- 対象6体に animationProfile と specialMove を追加する。
- stage / enterEffect / tapEffect / actionLabel / sound / effectAssets を設定する。
- specialMove は label / effect / sound / assets を設定する。
- tapEffect と specialMove.effect はCSSクラス名に使われるため、既存と衝突しないcamelCaseにする。
- 例：
  - ningyoBubbleFloat
  - ningyoShellSparkle
  - umibozuWaveShadow
  - umibozuSeaShadowRise
  - ameonnaRainDrop
  - ameonnaRainCurtain
  - hyosubeRiverHop
  - hyosubeWaterJump
  - kodamaLeafWhisper
  - kodamaEchoLight
  - yamanbaMountainMist
  - yamanbaMistPath

2. css/style.css
- 追加した tapEffect に対応する .tap-* クラスを必ず追加する。
- 追加した specialMove.effect に対応する .special-* クラスを必ず追加する。
- それぞれ animation-name を割り当てる。
- 必要な @keyframes を追加する。
- special系は special-effect-sprite と組み合わせて、ひっさつ時に前面でしっかり見えるようにする。
- 既存10体、追加5体のCSSを壊さない。

3. js/effects.js
- 原則として既存ロジックを維持する。
- 必要な場合のみ、stageやspecialの汎用レイアウトを微調整する。
- special-effect-sprite を削除しない。
- is-special の前面化仕様を維持する。
- specialTimer がアニメーション終了前に短く切れないようにする。

4. js/sound.js
- 既存の合成音fallback方針を維持する。
- 必要であれば、rain / wave / bubble / forest / mist などの音パターンを追加してよい。
- 実MP3が未配置でも画面が止まらず、合成音が鳴る設計にする。

5. effect_assets.json
- 新規生成したWebP素材を登録する。
- path、category、usedBy、usedFor、fallbackClass、status を既存形式に合わせる。
- 既存素材を流用した場合、必要に応じて usedBy に対象妖怪を追加する。
- 既存素材の削除はしない。

6. effect_generation_prompts.json
- 新規生成素材のプロンプトを登録する。
- 再生成できるよう、透明背景、WebP、子ども向け、非攻撃的、軽量エフェクト素材であることを明記する。

7. validate_data_integrity.mjs
- 既存チェックを壊さない。
- animationProfile.tapEffect に対応する .tap-* が css/style.css に存在することを確認する。
- specialMove.effect に対応する .special-* が css/style.css に存在することを確認する。
- effectAssets / specialMove.assets の画像パスが実在することを確認する。
- effect_assets.json の path が実在することを確認する。

禁止事項：
- 妖怪本文の改善はしない。
- detailedArticle は変更しない。
- 既存10体と追加5体の animationProfile / specialMove を不用意に変更しない。
- 既存画像を削除しない。
- 存在しない画像パスを yokai.json に追加しない。
- 画像生成スキルが使えない場合は、実装したふりをせず、その旨を報告する。
- 残酷、流血、攻撃、恐怖を強める演出は禁止。
- effect_generation_prompts.json へのプロンプト登録だけで、新規画像ファイルを生成・保存しないまま完了することは禁止します。

検証：
- npm run validate:data
- node --check js/effects.js
- node --check js/detail.js
- node --check js/sound.js
- PC Chromeで対象6体を確認
  - 詳細画面を開いたときにenterエフェクトが見える
  - 画像タップで通常リアクションが動く
  - 「もういちど！」で通常リアクションが動く
  - 「ひっさつわざ！」でspecialMove.assetsの生成WebP素材が前面にしっかり見える
  - おと：オンで音が鳴る
  - おと：オフで音が鳴らない
- 既存10体を確認
  - 鬼、河童、雪女、がしゃどくろで既存のひっさつ演出が崩れていない
- 追加済み5体を確認
  - 烏天狗、狐火、小豆洗い、鎌鼬で、ひっさつアセットが引き続き見える
- iPhone/iPad Safariで少なくとも以下を確認
  - 人魚
  - 海坊主
  - 雨女
  - 木霊
  - 消音モード解除後に音が鳴る
  - 画面が重くなりすぎない
- prefers-reduced-motion: reduce で画面が破綻しないこと

出力：
- 変更したファイル一覧
- 新規生成したエフェクト画像一覧
- 各画像の保存先
- 6体それぞれの animationProfile / specialMove 概要
- 追加した .tap-* / .special-* クラス一覧
- 追加した @keyframes 一覧
- 既存素材を流用したもの
- 新規素材を追加したもの
- 検証結果
- git diff --stat