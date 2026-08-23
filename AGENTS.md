# 1. アプリ全体共通ルール

- HTMLに妖怪説明・伝承説明を直書きしない。
- 本文・説明文はJSONまたはMarkdown原稿を正本として管理する。
- JSONの既存キー、ID、画像パス、親子関係、参照IDを壊さない。
- 伝承、古典資料、図像、現代的再解釈を混同しない。
- 出典で確認できない固有情報は断定しない。
- 「〜として整理できる」「〜と深く関わる存在」「昔の人々が〜を感じていた」などの定型表現を連発しない。
- 各項目ごとに、固有の地名、行動、姿、別名、伝承パターン、祭礼、資料上の扱いのいずれかを入れる。
- 子ども向けの読みやすさを保つが、特徴を薄めすぎない。
- 変更後は必ずJSON構文チェックを行う。
- 文章改善と参照ID修正は、できるだけ別タスク・別コミットに分ける。

# 2. こども妖怪図鑑専用ルール

対象ファイル：

- public/data/yokai.json
- public/data/yokai_research_pilot.json
- yokai_detailed_articles.md
- js/research.js
- scripts/build_detailed_articles.mjs
- scripts/enrich_tradition_history.mjs
- scripts/validate_yokai_research_pilot.mjs

編集方針：

- 全国的・一般的な妖怪図鑑として読める内容にする。
- 通常50体の detailedArticle の正本は原則として yokai_detailed_articles.md とする。
- ただし、原典・地域差パイロット対象10体（kappa、tengu、oni、yuki_onna、zashiki_warashi、nurikabe、ittan_momen、ushi_oni、umibozu、nekomata）は、パイロット期間中に限り `public/data/yokai_research_pilot.json` の `editorial`、`article`、`timeline`、`abilities`、`countermeasures`、`regionalVariants`、`sourceIds` を公開時の正本とする。`js/research.js` が既存データへ非破壊で重ねる。
- パイロット10体の本文を直す場合、`public/data/yokai.json` と `yokai_detailed_articles.md` に同じ修正を二重入力しない。パイロット終了時に正本統合を別タスクで行う。
- public/data/yokai.json の detailedArticle だけを手で直すと、同期スクリプト実行時に上書きされる可能性があるため注意する。
- `habitat` は「川・山・家・海」など出現環境、`regionalVariants` は「どの地域・資料でどう語られたか」とし、混同しない。
- `abilities` と `countermeasures` は伝承・資料で確認できる行動・対処だけを書く。`specialMove` と `animationProfile` はアプリ演出であり、研究データへ入れない。
- パイロット研究記述は必ず `sourceIds` で資料へ結び、資料にない有名設定を全国共通の事実として補わない。
- 確認度は A＝具体的な古典本文・図像または地域・掲載情報のある民俗記録、B＝国立・研究機関の展示・DB等で確認できるが原採集記録までは未確認、APP＝図鑑上の編集・要約、とする。根拠を超えて格上げしない。
- childDescription は80〜160字程度を目安に、姿・出る場所・性格・注意点を簡潔に入れる。地域差を伝えるため必要な場合は、読みやすさを損なわない範囲で超過を許容する。
- trivia はその妖怪固有の「へえ」と思える情報にする。
- oneLine は20〜45字程度で、その妖怪を一発で思い出せる特徴を入れる。
- detailedArticle は、民話での型、古典・説話・芸能、絵画での姿、地域差、現代イメージとの違いを必要に応じて入れる。
- ただし全記事を同じ段落構成にしない。
- 「民話での型では」「古典・芸能での展開では」「絵画での変化では」「現代図鑑での姿では」という見出し的表現を全件で機械的に繰り返さない。
- missions と quiz は、その妖怪の特徴を読んで理解できる内容にする。
- 汎用的なfallback生成文だけで済ませず、できるだけ妖怪ごとの固有情報や手書き記事を優先する。

# 3. 愛媛ふしぎ伝承図鑑専用ルール

対象ファイル：

- public/data/legends.json
- public/data/articles.json
- public/data/child_articles.json
- public/data/locations.json
- public/data/courses.json
- public/data/sources.json
- public/data/evidence_check_table.json
- js/ehime.js
- scripts/validate_ehime_11_traditions.mjs
- ehime_tradition_evidence_database.json

編集方針：

- 愛媛県内の地域伝承アーカイブとして、地名・伝承地・祭礼・神社仏閣・山・海・島・集落との関係を重視する。
- 妖怪・怪異・神話・祭礼・霊地をすべて「妖怪」として単純化しない。
- 愛媛版は11の独立記事で構成する。
- 愛媛版では childItems、childItemIds、child_articles.json を表示機能に使用しない。
- 旧46派生項目の監査結果は ehime_tradition_evidence_database.json に保存する。
- articles.json の本文は scripts/fixtures/ehime_11_articles.json と完全一致させる。
- legends.json、articles.json、sources.json、locations.json、evidence_check_table.json の参照を一致させる。
- legends.json の evidenceLevel と evidence_check_table.json の level を一致させる。
- 記録情報は資料単位で表示し、記録者・資料名・刊行年・巻頁の対応を崩さない。
- 11件以外を一覧、地図、今日の伝承、コース、クイズ、手帳へ表示しない。
- 内部監査DBの verification_status 等を公開UIや evidence_check_table.json へ直接表示しない。
- 地域伝承を面白くするために、未確認の逸話や地名を創作しない。
- 説明文は、観光PR調ではなく、伝承・場所・資料を結びつける図鑑調にする。

# 4. 壊してはいけないもの

以下は原則として変更しない。変更する場合は理由を明記し、参照先をすべて確認する。

- id
- articleId
- locationId
- courseIds
- sourceIds
- generatedImagePath
- imagePath

# 5. 既知の注意事項

- こども妖怪図鑑では yokai_detailed_articles.md が50件揃っている。ただし、原典・地域差パイロット10体については `public/data/yokai_research_pilot.json` が公開時に上書きするため、パイロット中の本文改善は同JSONを編集する。
- パイロット研究JSONが読み込めない場合でも、`public/data/yokai.json` の基本50体図鑑は表示を継続する。
- 愛媛版の旧派生記事46件は掲載終了済み。`child_articles.json` と旧生成スクリプトから再生成しない。
- 2026-07-20以降、愛媛版は11の独立記事へ再編済み。旧46派生記事は表示・再生成せず、`child_articles.json` は互換用の空データとして維持する。
- `scripts/migrate_ehime_11_traditions.mjs` は移行完了済みの廃止スクリプトであり、現在のJSON生成には使用しない。

# 6. 検証ルール

変更後は少なくとも以下を実行すること。

- node --check scripts/build_detailed_articles.mjs
- node --check scripts/enrich_tradition_history.mjs
- node --check js/app.js
- node --check js/research.js
- node --check js/ehime.js
- node --check scripts/validate_yokai_research_pilot.mjs
- node scripts/validate_yokai_research_pilot.mjs
- node --check scripts/validate_ehime_11_traditions.mjs
- node scripts/validate_ehime_11_traditions.mjs
- npm run validate:data
- public/data/yokai.json を JSON.parse できること
- public/data/yokai_research_pilot.json を JSON.parse できること
- public/data/legends.json を JSON.parse できること
- public/data/articles.json を JSON.parse できること
- public/data/child_articles.json を JSON.parse できること
- public/data/locations.json を JSON.parse できること
- public/data/courses.json を JSON.parse できること
- public/data/sources.json を JSON.parse できること
- public/data/evidence_check_table.json を JSON.parse できること
- パイロットが固定10 IDと完全一致し、全 sourceIds が登録済み資料を指し、研究データへ specialMove / animationProfile が混入していないことを確認すること
- articleId、locationId、courseIds、sourceIds の参照整合性を確認すること
- 愛媛版のIDが固定11件と完全一致し、childItems と childItemIds が空であることを確認すること
- legends.json と evidence_check_table.json の確認度が一致することを確認すること
- generatedImagePath、imagePath の文字列が空でなく、愛媛版の画像ファイルが実在することを確認すること
- こども妖怪図鑑と愛媛ふしぎ伝承図鑑の両方をローカルサーバーで表示確認すること
- 全国版のパイロット10体で「地域と原典で読む」が表示され、原典リンク、地域差、能力・対処、時系列が読めること
- 全国版の「もっと詳しく読む」が動くこと
- 愛媛版では11の独立記事をすべて開け、旧派生項目が表示されないこと
