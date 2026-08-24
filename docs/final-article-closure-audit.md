# Final Article Closure Audit

## Scope

- Start main: `e382833537a2ef1b62c60da43d6225111558bd97`
- Canonical repository: `ryotamatsuki/yokaizukan`
- National base: 50 items
- Completed Literary Phase 1–3: 36 items, read only
- Ehime articles: 11 items, read only
- Closure targets: 14 items

## Effective public display pipeline before this pass

The national UI loads data in this order:

1. `public/data/yokai.json` (base 50)
2. national Research merge (pilot/common/expansion/Phase 4 deepening)
3. Literary Phase 1
4. Literary Phase 2
5. Literary Phase 3

A successful Research load already replaces each Research item's `oneLine`, `childDescription`, `trivia`, `detailedArticle` and references with the Research layer. Therefore the legacy base `detailedArticle` is not normally the final public article.

Two closure risks nevertheless remained:

- When Research loading fails, the app deliberately continues with the base catalog, making legacy `yokai.json` article/references a possible fallback.
- Phase 4 Research Deepening updated claims/coverage for six items but intentionally did not rewrite older Research `article`/`editorial` prose. Four newly-A items therefore needed a reading-layer article aligned with the newer evidence.

The closure pass therefore adds one final 14-item public reading overlay after Research and Literary Phase 1–3. The overlay is also applied when Research fails. In that fallback case old base references are cleared rather than presented as if they supported the replacement article.

## Target audit

| Item | Class | Legacy/public-risk found | Closure action | Final grounding |
| --- | --- | --- | --- | --- |
| 輪入道 | A | Legacy text asserted child abduction, generic night-road folklore, Buddhist symbolism and runaway-tool symbolism. | Replace with four-paragraph Literary article. | Sekien `今昔画図続百鬼`: wheel hub with monk head, self-circling, soul-loss warning, `此所勝母の里` paper. |
| 目目連 | A | Legacy text treated the house as literally looking back and added symbolic readings about accumulated time and gaze. | Replace with direct image/text-centered article. | Sekien `今昔百鬼拾遺`: broken shoji with many eyes; go-player relation only as Sekien's conceit. |
| 木霊 | A | Risk of conflating Sekien `木魅`, regional `木霊抜き`, echo/`こだま`, and generic tree-spirit imagery. | Center one concrete Tokushima custom and explicitly separate the other source systems. | Tokushima old-tree `木霊抜き`; Sekien `木魅` kept separate. |
| 山姥 | A | Legacy/general accounts can combine Noh, publishing, cannibalism, assistance, motherhood and many tales into one personality. | Center only the Kumakogen New Year mochi tradition; other strands remain separate. | Ehime Prefectural History: New Year mochi assistance / `福餅`; other sources remain Research context/variants. |
| がしゃどくろ | B | Legacy article asserted war dead, abandoned bones, rattling at night, forgotten voices and direct Kuniyoshi origin. | Replace with short Research-safe article. | Kuniyoshi giant-skeleton image is direct; later `がしゃどくろ` naming is separate; 1966 first-use remains unverified. |
| 垢嘗 | B | Legacy article asserted bath-grime behavior as one identity and added cleaning moral / dirt-and-humidity origin. | Replace with short article separating two source records. | Sekien `垢嘗` image/name; 1686 `垢ねぶり` text; identity between them remains unproven. |
| からかさ小僧 | C | Legacy article fixed old umbrella→tsukumogami origin, one eye/one leg/tongue/jumping, revenge and life-ethics symbolism. | Reduce to three paragraphs. | Only general tsukumogami background is currently direct enough; individual historical formation remains insufficient. |
| 提灯お化け | C | Legacy article fixed old lantern→tsukumogami, mouth/tongue development, theatre lineage and symbolic light anxiety. | Reduce to three paragraphs. | General tsukumogami background only; individual lantern-yokai formation remains insufficient. |
| ぬっぺっぽう | C | Legacy/current popular descriptions risk fixing cemetery/temple appearances and body/behavior without individual text. | Reduce to three paragraphs. | Individual direct text/behavior remains insufficient. |
| 白うねり | C | Legacy/current descriptions risk fixing old cloth as a tsukumogami, storage-room behavior and forgotten-cloth symbolism. | Reduce to three paragraphs. | General tsukumogami background only; individual text remains insufficient. |
| 文車妖妃 | C | Legacy literary prose treated undelivered letters, love letters, secrets and emotion-becoming-body as historical explanation. | Reduce to three paragraphs. | General tsukumogami background; individual wording/formation remains insufficient. |
| 貝児 | C | Legacy prose risked shell-matching, wedding-tool origins and symbolic sea meanings. | Reduce to three paragraphs. | Individual direct wording and regional tradition remain insufficient. |
| 煙々羅 | C | Legacy prose risked generalizing smoke figures, pure-hearted viewers, hearths/bonfires/steam and psychological interpretation. | Reduce to three paragraphs. | Sekien-associated name/image background exists; individual wording is still insufficient in the adopted source set. |
| 雨女 | C | Legacy prose risked a uniform rain-bringing ability, agricultural meaning, Snow Woman pairing, clothes/umbrella canon. | Reduce to three paragraphs. | Sekien-associated name/image background exists; individual wording and abilities remain insufficient. |

## Short-field audit

The closure overlay also replaces `oneLine`, `childDescription`, `trivia`, `habitat`, `tags`, `notes`, and `quiz` for the 14 targets where the old base fields conflict with the current Research contract. This is intentionally narrow; unrelated catalog metadata is not rewritten.

## References contract

- With Research loaded, the closure article preserves references/sourceNote already resolved from the item's current Research `sourceIds`.
- Without Research, the closure article is still applied but legacy base references are cleared. The UI states that Research links could not be loaded.
- Closure data itself does not define `sourceIds`, evidence levels, coverage, abilities, countermeasures or regional variants.

## Read-only audit

The following remain byte-identical to start-main and are protected by the closure validator:

- Literary Phase 1 (15)
- Literary Phase 2 (10)
- Literary Phase 3 (11)
- Ehime `articles.json`, `legends.json`, `ehime_research_v2.json`
- base national `yokai.json`
- national Research source/claim files including Phase 4 Deepening

Article-production target after this pass: national 50/50 public articles + Ehime 11/11 articles, with the final 14 explicitly closed under current Research evidence rather than legacy prose length.
