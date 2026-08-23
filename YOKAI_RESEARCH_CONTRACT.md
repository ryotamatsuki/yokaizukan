# 全国50体 出典・地域差研究データ契約

この文書は、全国版50体の研究レイヤーを編集するときの正本・出典・QA契約を定める。

## 1. 正本

研究レイヤーは次の6ファイルを正本とする。

- `public/data/yokai_research_pilot.json` — 先行10体
- `public/data/yokai_research_expansion_01.json` — 追加8体
- `public/data/yokai_research_expansion_02.json` — 追加8体
- `public/data/yokai_research_expansion_03.json` — 追加8体
- `public/data/yokai_research_expansion_04.json` — 追加8体
- `public/data/yokai_research_expansion_05.json` — 追加8体

`js/research.js` が実行時に6ファイルを統合し、`public/data/yokai.json` の50体へ非破壊で上書きする。

研究本文を直すとき、同じ修正を `yokai.json` や `yokai_detailed_articles.md` へ二重入力しない。

## 2. 40体の固定バッチ

### Batch 1

- rokurokubi
- karakasa-kozo
- chochin-obake
- gashadokuro
- karasu-tengu
- hitotsume-kozo
- bakeneko
- kitsunebi

### Batch 2

- bake-danuki
- akaname
- azuki-arai
- ningyo
- wanyudo
- kamaitachi
- kodama
- yamanba

### Batch 3

- oonyudo
- tsuchigumo
- nue
- hitodama
- tofu-kozo
- hyakki-yagyo
- mokumokuren
- nuppeppo

### Batch 4

- shiro_uneri
- fumikuruma_yohi
- koto_furunushi
- kaichigo
- abura_sumashi
- sunekosuri
- sunakake_baba
- konaki_jiji

### Batch 5

- betobeto_san
- okuri_inu
- enenra
- ame_onna
- kamikiri
- ubume
- hyosube
- daidarabotchi

バッチ間でIDを移動しない。移動が必要な場合は validator の固定バッチ契約も同時に更新し、その理由をPRに記録する。

## 3. 資料不足は欠陥ではない

`timeline`、`abilities`、`countermeasures`、`regionalVariants` は件数をそろえない。

`coverage` は次の3値を使う。

- `documented`: 直接裏付けできる項目が1件以上ある
- `insufficient`: 現時点の採用資料では十分に確認できない
- `not_applicable`: その妖怪・表現に当該概念を適用しない

`documented` の場合だけ配列1件以上を必須とする。資料が弱い場合は空配列 + `insufficient` とし、件数を埋めるための推測を追加しない。

## 4. 出典契約

- 日文研 `simsearch.cgi` / `ksearch.cgi` は discovery 専用。公開根拠にしない。
- 日文研を evidence とする場合は、個別 `youkai_card.cgi?ID=...` を原則とする。
- `sourceRole: evidence` だけを item / claim / timeline / regionalVariants の根拠として参照する。
- `sourceType` で `folklore_record`、`institutional_exhibit`、`modern_translation`、`primary_text`、`historical_image` を区別する。
- 機関解説・現代語訳・後世の写本を「原典」と一括表示しない。UIでは「出典・記録」を使う。
- 現代で有名な姿・能力を、古いカードに記載がないのに逆輸入しない。

## 5. claim契約

`abilities` と `countermeasures` の `evidenceLevel` は A / B のみ。

- A: 個別資料で直接確認できる
- B: 研究機関・国立機関の解説等で確認できるが、原資料そのものではない
- APP: `editorial.interpretation` 等の編集解釈専用。abilities / countermeasures には使用禁止

## 6. sourceId完全性

各 item について、次のnested sourceIdsはすべてトップレベル `item.sourceIds` に含める。

- `timeline[*].sourceIds`
- `abilities[*].sourceIds`
- `countermeasures[*].sourceIds`
- `regionalVariants[*].sourceIds`

つまり `nested sourceIds ⊆ item.sourceIds` を必須とする。

これにより、本文claimで使った資料がUIの「出典・記録へたどる」一覧から漏れることを防ぐ。

## 7. glossary契約

`glossaryTerms` に指定できる語は、当該itemの実際の表示テキストに出現する語だけとする。

検査対象には次を含む。

- historySummary / evidenceNote
- editorial
- article
- timeline
- abilities / countermeasures
- regionalVariants / localNames

語注を出すためだけに本文へ専門語を追加しない。本文に不要なら `glossaryTerms` から削除する。

## 8. 完全被覆gate

`node scripts/validate_yokai_research_expansions.mjs` は5バッチがすべて populated になった時点で、次を必須とする。

- expansion item = 40体ちょうど
- pilot10 + expansion40 = base catalog 50体と同数
- base `yokai.json` の全IDが研究レイヤーで1回だけ被覆される
- research ID / resolved base ID / source ID に重複がない

## 9. 実行コマンド

```bash
node --check js/research.js
node --check scripts/validate_yokai_research_pilot.mjs
node --check scripts/validate_yokai_research_expansions.mjs
npm run validate:research
npm run validate:data
```

GitHub Actions `Validate catalog data` を最終gateとする。
