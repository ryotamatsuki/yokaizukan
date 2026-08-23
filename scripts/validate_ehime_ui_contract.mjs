import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync('js/ehime.js', 'utf8');
const researchUi = fs.readFileSync('js/ehime-research-v2.js', 'utf8');

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
assert(researchUi.includes("heading === '確認メモ'"), 'duplicate evidence memo must be removed when research UI is present');

console.log('Ehime UI contract: app-state integration, all-path detail event, progressive disclosure, source links OK');
