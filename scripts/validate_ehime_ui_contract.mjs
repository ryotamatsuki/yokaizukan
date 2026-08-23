import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync('js/ehime.js', 'utf8');
const researchUi = fs.readFileSync('js/ehime-research-v2.js', 'utf8');
const articles = JSON.parse(fs.readFileSync('public/data/articles.json', 'utf8')).articles || [];

assert(app.includes('research: "public/data/ehime_research_v2.json"'), 'ehime.js must load Ehime Research v2 through the app state');
assert(app.includes('research: []'), 'Ehime app state must reserve research items');
assert(app.includes('loadOptionalJson(DATA_PATHS.research)'), 'Ehime Research v2 must remain an optional layer');
assert(app.includes('state.research = normalizeArray(researchData?.items)'), 'loaded Ehime Research v2 items must be stored in app state');
assert(app.includes('const research = state.research.find((item) => item.id === id) || null'), 'openDetail must resolve research by legend id from app state');
assert(app.includes('new CustomEvent("ehime:detail-opened"'), 'openDetail must publish the formal detail-opened event');
assert(app.includes('sources: state.sources'), 'detail-opened event must pass the existing source state');

assert(researchUi.includes("document.addEventListener('ehime:detail-opened'"), 'research UI must subscribe to the formal detail-opened event');
assert(!researchUi.includes('fetch('), 'research UI must not independently fetch data');
assert(researchUi.includes("document.createElement('details')"), 'research UI must use progressive disclosure');
assert(researchUi.includes('資料でもっと調べる'), 'public research label must be child-friendly');
assert(!researchUi.includes('Research v2</span>'), 'internal schema name must not be shown as a public badge');
assert(researchUi.includes('資料を見る'), 'structured claims and records must link directly to sources');
assert(researchUi.includes('ARTICLE_SECTION_ROLES'), 'article duplication control must use semantic section roles');
assert(researchUi.includes("roleByHeading[heading] === 'research_note'"), 'research_note role must drive article dedupe');
assert(!researchUi.includes('RESEARCH_ONLY_HEADINGS'), 'global heading-name deletion contract must be removed');
assert(researchUi.includes("heading === '確認メモ'"), 'legacy evidence memo must still be removed when research UI is present');

const articleIds = articles.map((article) => article.id);
for (const articleId of articleIds) {
  assert(researchUi.includes(`${articleId}: {`), `${articleId}: semantic role registry missing`);
}

const requiredResearchHeadings = new Map([
  ['uwajima_ushioni_cluster', ['資料から分かること', 'まだ分からないこと']],
  ['matsuyama_tanuki_cluster', ['資料から分かること', 'まだ分からないこと']],
  ['iyo_basan_cluster', ['資料から分かること', 'まだ分からないこと']],
  ['ishizuchi_tengu_cluster', ['資料から分かること', 'まだ分からないこと']],
  ['dogo_myth_cluster', ['資料から分かること', 'ここで大切なこと']],
  ['ishiteji_emon_saburo_cluster', ['どこまで古く確認できる？', 'まだ分からないこと']],
  ['uwakai_sea_mystery_cluster', ['資料から分かること', 'まだ分からないこと']],
  ['kihoku_oni_cluster', ['資料から分かること', 'まだ分からないこと']],
  ['yosuzume', ['資料から分かること', 'ここで大切なこと']],
  ['nobiagari', ['資料から分かること', 'まだ調べられること']],
  ['kane_no_kami_no_hi', ['資料から分かること', 'まだ分からないこと']]
]);

for (const article of articles) {
  const headings = new Set((article.sections || []).map((section) => section.heading));
  for (const heading of requiredResearchHeadings.get(article.id) || []) {
    assert(headings.has(heading), `${article.id}: expected research-note heading missing from article JSON: ${heading}`);
    const roleEntry = `'${heading}': 'research_note'`;
    assert(researchUi.includes(roleEntry), `${article.id}: ${heading} must be classified as research_note`);
  }
}

console.log('Ehime UI contract: app-state integration, semantic section roles, all-path detail event, progressive disclosure, source links OK');
