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
- yokai_detailed_articles.md
- scripts/build_detailed_articles.mjs
- scripts/enrich_tradition_history.mjs

編集方針：

- 全国的・一般的な妖怪図鑑として読める内容にする。
- detailedArticle の正本は原則として yokai_detailed_articles.md とする。
- public/data/yokai.json の detailedArticle だけを手で直すと、同期スクリプト実行時に上書きされる可能性があるため注意する。
- childDescription は80〜160字程度で、姿・出る場所・性格・注意点を簡潔に入れる。
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
- scripts/build_ehime_child_articles.mjs

編集方針：

- 愛媛県内の地域伝承アーカイブとして、地名・伝承地・祭礼・神社仏閣・山・海・島・集落との関係を重視する。
- 妖怪・怪異・神話・祭礼・霊地をすべて「妖怪」として単純化しない。
- 親クラスターと派生項目の関係を壊さない。
- childItemIds と childItems の対応を維持する。
- childItems.id と child_articles.json の対応を確認する。
- articleId は articles.json のIDと整合させる。
- sourceIds は sources.json のIDと整合させる。
- locationId は locations.json のIDと整合させる。
- courseIds は courses.json のIDと整合させる。
- 伝承の確認度や追加調査メモがある場合は evidence_check_table.json と矛盾させない。
- 愛媛版の親記事では、伝承群の全体像、地域的背景、場所との関係を説明する。
- 愛媛版の派生記事では、親クラスターよりも具体的な地名、話型、見た目、役割、資料上の扱いを書く。
- 派生記事で「単独の珍しい話として切り離すのではなく」「本当にいたかどうか」「物語の古さだけで価値を決めない」などの定型段落を全件に繰り返さない。
- 地域伝承を面白くするために、未確認の逸話や地名を創作しない。
- 説明文は、観光PR調ではなく、伝承・場所・資料を結びつける図鑑調にする。

# 4. 壊してはいけないもの

以下は原則として変更しない。変更する場合は理由を明記し、参照先をすべて確認する。

- id
- articleId
- locationId
- courseIds
- sourceIds
- childItemIds
- childItems.id
- parentId
- generatedImagePath
- imagePath

# 5. 既知の注意事項

- legends.json の夜道クラスター articleId に不整合がある。
- legends.json 側の articleId は "ehime_night_mystery_cluster" だが、articles.json 側の実IDは "ehime_night_road_mysteries_cluster"。
- この不整合は、AGENTS.md作成後に別タスクとして修正する。
- こども妖怪図鑑では yokai_detailed_articles.md が50件揃っているため、詳細記事改善はまずMarkdown原稿を編集する。
- 愛媛版では派生記事46件の定型化が大きな課題であり、child_articles.json と scripts/build_ehime_child_articles.mjs の両方を確認する。

# 6. 検証ルール

変更後は少なくとも以下を実行すること。

- node --check scripts/build_detailed_articles.mjs
- node --check scripts/enrich_tradition_history.mjs
- node --check js/ehime.js
- public/data/yokai.json を JSON.parse できること
- public/data/legends.json を JSON.parse できること
- public/data/articles.json を JSON.parse できること
- public/data/child_articles.json を JSON.parse できること
- public/data/locations.json を JSON.parse できること
- public/data/courses.json を JSON.parse できること
- public/data/sources.json を JSON.parse できること
- public/data/evidence_check_table.json を JSON.parse できること
- articleId、locationId、courseIds、sourceIds、parentId の参照整合性を確認すること
- childItemIds と childItems の一致を確認すること
- generatedImagePath、imagePath の文字列が空でないことを確認すること
- こども妖怪図鑑と愛媛ふしぎ伝承図鑑の両方をローカルサーバーで表示確認すること
- 「もっと詳しく読む」が両パートで動くこと
- 愛媛版では親クラスターから派生項目を開けること
