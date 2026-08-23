# 全国妖怪図鑑 Literary Editing Pass v1 — Phase 3 Grounding Review

開始 main: `d5794b926d9da3387e13617207498158bd3bcc2a`（PR #8 squash merge後）

Phase 3では、同じ妖怪名の下に古典文学・出版図像・民俗採集・土地伝承が混在するため、文学本文を書く前に「どの資料系統を中心にするか」を固定する。Research JSONは変更しない。

## 1. ろくろ首 (`rokurokubi`)
- 中心資料: `rokuro-osaka-0550079`
- 資料種別: 1933年・大阪府茨木市の民俗記録カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=insufficient / regionalVariants=insufficient
- scene anchor: 大阪・茨木の商家で、夫婦が夜ごと娘の首が伸びるのを見る。祈っても変わらず、一家は土地を離れる。
- 使用禁止: 首が抜けて飛ぶ型、全国共通の弱点・対処。
- Memory Hook: **大阪・茨木の商家では、夜ごと娘の首が伸びる**
- 主なリスク: 「首が伸びる型」と「首が抜ける型」を一場面へ合成すること。

## 2. 烏天狗 (`karasu-tengu`)
- 中心資料: `tengu-ishizuchi-0030258`
- 資料種別: 石鎚山麓の個別民俗記録カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=insufficient / regionalVariants=documented
- scene anchor: 石鎚山麓で、夜になると高い木へ烏天狗が来る。
- 使用禁止: 天狗一般の飛行・剣術・神通力・長い鼻。
- Memory Hook: **石鎚山麓では、夜、高い木へ烏天狗が来る**
- 主なリスク: Phase 1の「天狗」一般記事と重複し、烏天狗を全国共通設定へ戻すこと。

## 3. 化け狸 (`bake-danuki`)
- 中心資料: `tanuki-awa-2220012`、比較資料 `tanuki-yamanashi-1550035`
- 資料種別: 徳島・山梨の個別民俗記録カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=insufficient / regionalVariants=documented
- scene anchor: 阿波では狸が神官へ化け、人間が逆に狸をだます。山梨では狐と狸の化け方・評価を区別する。
- 使用禁止: 腹鼓、徳利、巨大な陰嚢、八百八狸の物語設定。
- Memory Hook: **阿波では、神官に化けた狸を人間が逆にだます**
- 主なリスク: 二地域の性格づけを一匹の狸の性格へ合成すること。

## 4. 鎌鼬 (`kamaitachi`)
- 中心資料: `kamaitachi-miyagi-C0411095`、`kamaitachi-echigo-5390004`
- 資料種別: 宮城県史収録伝承カード＋越後の歴史随筆収録カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=documented / regionalVariants=documented
- scene anchor: 宮城では旋風に乗る魔獣等が切り傷を作ると説明され、越後では太刀傷のような傷に古い暦の黒焼きを白湯で飲む対処が語られる。
- 使用禁止: 三匹一組、転ばせる役・切る役・薬を塗る役という現代定番構成。
- Memory Hook: **越後では、鎌鼬の傷に古い暦の黒焼きを白湯で飲む**
- 主なリスク: 伝承上の説明と現代の自然科学的説明を混同すること。

## 5. 大入道 (`oonyudo`)
- 中心資料: `oonyudo-kanagawa-2210025`
- 資料種別: 1955年・神奈川県津久井の民俗記録カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=insufficient / regionalVariants=insufficient
- scene anchor: 川で網打ちに出た船の舳先へ大入道が現れる。話者はカワウソが化けたものだろうと説明する。
- 使用禁止: 大入道を一種類の巨大坊主に固定すること、資料にない大きさの数値化。
- Memory Hook: **津久井の川で、網打ちの船の舳先に大入道が現れる**
- 主なリスク: 「大入道」という見え方と「カワウソ」という土地の説明を全国共通の正体にすること。

## 6. 土蜘蛛 (`tsuchigumo`)
- 中心資料: `tsuchigumo-raiko-3090003`、比較資料 `tsuchigumo-oita-0640142`
- 資料種別: 頼光説話を伝える歴史随筆収録カード＋大分県竹田市の地域伝承カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=insufficient / regionalVariants=documented
- scene anchor: 頼光説話では蜘蛛が人へ化けて源頼光を惑わせる。大分では七つの塚を景行天皇に滅ぼされた「土蜘蛛」の墓とする。
- 使用禁止: 歴史上「土蜘蛛」と呼ばれた人々と巨大蜘蛛妖怪を同一の生き物・集団として断定すること。
- Memory Hook: **源頼光の説話では、蜘蛛が人に化けて惑わせる**
- 主なリスク: 古い他者表象としての語義と後世の怪物像を一つの妖怪生態へまとめること。

## 7. 鵺 (`nue`)
- 中心資料: `nue-classic-3270009`、比較資料 `nue-ehime-1231910`
- 資料種別: 『平家物語』『源平盛衰記』を参照する古典参照カード＋1930年愛媛の地域伝承カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=documented / regionalVariants=documented
- scene anchor: 古典では猿・虎または狸・蛇など複数動物の特徴が語られるが、組み合わせは一つではない。愛媛では源頼政の鵺退治が伝承される。
- 使用禁止: 一種類の標準生物として姿を固定すること、現代作品の毒・雷・炎・飛行等の能力追加。
- Memory Hook: **鵺は、古典ごとに猿・虎または狸・蛇など姿の組み合わせが違う**
- 主なリスク: 古典間の差を消し、現代の標準イラストを「原典の正解」にすること。

## 8. 人魂 (`hitodama`)
- 中心資料: `hitodama-saitama-C1130033`、比較資料 `hitodama-gunma-C1040120`
- 資料種別: 埼玉県史・群馬県史収録の個別伝承カード / sourceRole=evidence
- coverage: timeline=documented / abilities=documented / countermeasures=insufficient / regionalVariants=documented
- scene anchor: 埼玉では死の前に家の屋根から青い尾を引く人魂が出る。群馬では色・形・飛び方が多様に記録される。
- 使用禁止: 物理的正体の断定、「すべて死者の魂そのもの」という一般化。
- Memory Hook: **埼玉では、死の前に屋根から青い尾を引く人魂が出る**
- 主なリスク: 地域ごとの色・動きを一つの火の玉デザインへ固定すること。

## 9. 百鬼夜行 (`hyakki-yagyo`)
- 中心資料: `ndl-hyakki-emaki-leaflet`
- 資料種別: 国立国会図書館の機関展示資料・江戸中期写本紹介 / sourceRole=evidence
- coverage: timeline=documented / abilities=not_applicable / countermeasures=not_applicable / regionalVariants=insufficient
- scene anchor: NDL所蔵『百鬼夜行絵巻』では、多くの妖怪・異類が列をなし、冒頭詞書と男二人の導入部を持つ一本として紹介される。
- 使用禁止: 百鬼夜行を一体の妖怪として能力・攻撃・弱点を与えること、「百鬼」を厳密な100体と数えること。
- Memory Hook: **江戸中期写本の絵巻で、多くの妖怪・異類が列をなす**
- 主なリスク: 集合的な絵巻・物語モチーフを個体妖怪へ変換すること。

## 10. 琴古主 (`koto_furunushi`)
- 中心資料: `ndl-koto-furunushi`
- 資料種別: 国立国会図書館の個別機関解説・鳥山石燕『百鬼徒然袋』の図像／詞書紹介 / sourceRole=evidence
- coverage: timeline=documented / abilities=documented(B) / countermeasures=not_applicable / regionalVariants=insufficient
- scene anchor: 龍のような箏の胴、大きな目、乱れ髪のような切れた弦。詞書は、昔の箏の音を知る人が少なくなった恨みを知らせるため現れたのではないかと描く。
- 使用禁止: 「百年使った道具は必ず妖怪になる」という一般法則、地域口承の生態への変換。
- Memory Hook: **琴古主は、龍のような箏の胴と乱れ髪のような切れた弦で描かれる**
- 主なリスク: 付喪神一般論を琴古主個別の行動・能力へ足すこと。

## 11. ヒョウスベ (`hyosube`)
- 中心資料: `hyosube-saga-0640061-002`、`hyosube-saga-0640061-003`
- 資料種別: 1914年『郷土研究』由来の佐賀個別民俗記録カード / sourceRole=evidence
- coverage: timeline=documented / abilities=insufficient / countermeasures=documented / regionalVariants=documented
- scene anchor: 佐賀で河童の由来・呼称とヒョウスベが重なり、潮見神社の神職家に水難除けの歌が伝わる。
- 使用禁止: 毛深い姿、風呂好き、笑い声など後世の定番像。
- Memory Hook: **佐賀では、ヒョウスベとの約束を忘れるなという水難除けの歌が伝わる**
- 主なリスク: 「河童の単なる別名」とも「河童とは完全に別種」とも固定しすぎること。

## Batch plan

- Batch A: ろくろ首 / 鎌鼬 / 人魂 / ヒョウスベ
- Batch B: 烏天狗 / 化け狸 / 大入道 / 土蜘蛛
- Batch C: 鵺 / 百鬼夜行 / 琴古主

各Batchで `編集 → Grounding照合 → diff確認 → Literary QA → CI` を完了してから次へ進む。