const RESEARCH_DATA_URL = 'public/data/yokai_research_pilot.json';
const RESEARCH_EXPANSION_URLS = [1, 2, 3, 4, 5].map(
  (batch) => `public/data/yokai_research_expansion_0${batch}.json`
);
const RESEARCH_STYLE_URL = 'css/research.css';

const BASE_ID_ALIASES = {
  yuki_onna: 'yuki-onna',
  zashiki_warashi: 'zashiki-warashi'
};

const EVIDENCE_LABELS = {
  A: '資料で確認',
  B: '研究機関の資料から確認',
  APP: '図鑑編集部の解説'
};

export function installResearchStyles() {
  if (document.querySelector('link[data-yokai-research-style]')) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = RESEARCH_STYLE_URL;
  link.dataset.yokaiResearchStyle = 'true';
  document.head.append(link);
}

export async function loadPilotResearch(url = RESEARCH_DATA_URL) {
  const basePayload = await fetchResearchPayload(url);
  const expansionResults = await Promise.allSettled(
    RESEARCH_EXPANSION_URLS.map((batchUrl) => fetchResearchPayload(batchUrl))
  );

  const payloads = [basePayload];
  expansionResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      payloads.push(result.value);
      return;
    }
    console.warn(`研究データ batch ${index + 1} の読み込みをスキップしました。`, result.reason);
  });

  return combineResearchPayloads(payloads);
}

export function mergePilotResearch(items, payload) {
  const sourceIndex = new Map(payload.sources.map((source) => [source.id, source]));
  const researchIndex = new Map(
    payload.items.map((item) => [toBaseCatalogId(item.id), item])
  );

  return items.map((item) => {
    const research = researchIndex.get(item.id);
    if (!research) {
      return item;
    }

    const resolvedSources = resolveSources(research.sourceIds, sourceIndex);
    const article = research.article || {};
    const detailedArticle = {
      title: article.title || item.detailedArticle?.title || item.name,
      subtitle: article.subtitle || item.detailedArticle?.subtitle || '',
      body: Array.isArray(article.body) ? article.body : item.detailedArticle?.body || [],
      sourceNote: article.sourceNote || '地域差・歴史・行動を、下記の出典・民俗記録にたどれる形で整理しています。',
      references: resolvedSources.map((source) => ({
        title: source.title,
        source: source.provider,
        url: source.url,
        note: [source.year, source.region, source.recordType].filter(Boolean).join(' / ')
      }))
    };

    const childDescription = research.editorial?.childDescription || item.childDescription;

    return {
      ...item,
      oneLine: research.editorial?.oneLine || item.oneLine,
      childDescription,
      description: childDescription,
      trivia: research.editorial?.trivia || item.trivia,
      detailedArticle,
      research: {
        ...research,
        baseCatalogId: item.id,
        sources: resolvedSources,
        evidenceLevels: payload.evidenceLevels || {},
        glossary: payload.glossary || {}
      }
    };
  });
}

export function enhanceDetailWithResearch(yokai) {
  if (!yokai?.research) {
    return;
  }

  const body = document.querySelector('#detail-content .detail-body');
  if (!body || body.querySelector('[data-research-overview]')) {
    return;
  }

  const research = yokai.research;
  const section = document.createElement('section');
  section.className = 'detail-section research-overview full-span';
  section.dataset.researchOverview = 'true';

  const headingRow = document.createElement('div');
  headingRow.className = 'research-heading-row';
  const heading = document.createElement('h3');
  heading.textContent = '地域と出典で読む';
  const badge = document.createElement('span');
  badge.className = 'research-pilot-badge';
  badge.textContent = '出典・記録リンク付き';
  headingRow.append(heading, badge);

  const lead = document.createElement('p');
  lead.className = 'research-lead';
  lead.textContent = research.historySummary;
  section.append(headingRow, lead);

  const quickFacts = document.createElement('div');
  quickFacts.className = 'research-quick-facts';
  if (research.aliases?.length) {
    quickFacts.append(createFact('別名・近い呼び名', research.aliases.join('・')));
  }
  quickFacts.append(createFact('地域記録', `${research.regionalVariants?.length || 0}件を掲載`));
  quickFacts.append(createFact('出典', `${research.sources.length}件の資料・記録へリンク`));
  section.append(quickFacts);

  const columns = document.createElement('div');
  columns.className = 'research-columns';
  columns.append(
    createClaimList(
      '何をする？',
      research.abilities,
      '資料で確認できる固有の行動は、まだ十分に確認できていません。',
      research.evidenceLevels
    ),
    createClaimList(
      '弱点・対処の伝承',
      research.countermeasures,
      'この資料群では、固有の対処法を確認できていません。',
      research.evidenceLevels
    )
  );
  section.append(columns);

  if (research.editorial?.interpretation) {
    section.append(createEditorialNote(research.editorial.interpretation, research.evidenceLevels));
  }

  if (research.regionalVariants?.length) {
    const regionHeading = document.createElement('h4');
    regionHeading.textContent = '地域によって、こんなに違う';
    const regionGrid = document.createElement('div');
    regionGrid.className = 'research-region-grid';
    research.regionalVariants.forEach((variant) => {
      const card = document.createElement('article');
      card.className = 'research-region-card';
      const title = document.createElement('h5');
      title.textContent = variant.region;
      const text = document.createElement('p');
      text.textContent = variant.summary;
      card.append(title, text);
      if (variant.localNames?.length) {
        const names = document.createElement('p');
        names.className = 'research-local-names';
        names.textContent = `呼び名：${variant.localNames.join('・')}`;
        card.append(names);
      }
      regionGrid.append(card);
    });
    section.append(regionHeading, regionGrid);
  }

  if (research.timeline?.length) {
    const timelineHeading = document.createElement('h4');
    timelineHeading.textContent = 'いつ、どんな記録が残った？';
    const timeline = document.createElement('ol');
    timeline.className = 'research-timeline';
    research.timeline.forEach((entry) => {
      const item = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = entry.label;
      const text = document.createElement('span');
      text.textContent = entry.summary;
      item.append(label, text);
      timeline.append(item);
    });
    section.append(timelineHeading, timeline);
  }

  appendGlossary(section, research);

  const sourceHeading = document.createElement('h4');
  sourceHeading.textContent = '出典・記録へたどる';
  const sourceList = document.createElement('ul');
  sourceList.className = 'research-source-list';
  research.sources.forEach((source) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noreferrer noopener';
    link.textContent = source.title;
    const meta = document.createElement('span');
    meta.textContent = [source.provider, source.year, source.region, source.recordType].filter(Boolean).join(' / ');
    item.append(link, meta);
    sourceList.append(item);
  });
  section.append(sourceHeading, sourceList);

  const note = document.createElement('p');
  note.className = 'research-evidence-note';
  note.textContent = research.evidenceNote;
  section.append(note);

  const detailedControls = body.querySelector('.detail-more-controls');
  if (detailedControls) {
    body.insertBefore(section, detailedControls);
  } else {
    body.append(section);
  }
}

export function toBaseCatalogId(researchId) {
  return BASE_ID_ALIASES[researchId] || researchId;
}

async function fetchResearchPayload(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`${url} の読み込みに失敗しました。HTTP ${response.status}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload.items) || !Array.isArray(payload.sources)) {
    throw new Error(`${url} の形式が正しくありません。`);
  }
  return payload;
}

function combineResearchPayloads(payloads) {
  const base = payloads[0] || {};
  const sources = [];
  const items = [];
  const sourceIds = new Set();
  const itemIds = new Set();
  const glossary = {};

  for (const payload of payloads) {
    Object.assign(glossary, payload.glossary || {});
    for (const source of payload.sources || []) {
      if (sourceIds.has(source.id)) {
        console.warn(`重複する研究sourceIdをスキップしました: ${source.id}`);
        continue;
      }
      sourceIds.add(source.id);
      sources.push(source);
    }
    for (const item of payload.items || []) {
      if (itemIds.has(item.id)) {
        console.warn(`重複する研究item idをスキップしました: ${item.id}`);
        continue;
      }
      itemIds.add(item.id);
      items.push(item);
    }
  }

  return {
    ...base,
    sources,
    items,
    glossary
  };
}

function resolveSources(sourceIds = [], sourceIndex) {
  return [...new Set(sourceIds)]
    .map((id) => sourceIndex.get(id))
    .filter(Boolean);
}

function createFact(labelText, valueText) {
  const block = document.createElement('div');
  block.className = 'research-fact';
  const label = document.createElement('span');
  label.textContent = labelText;
  const value = document.createElement('strong');
  value.textContent = valueText;
  block.append(label, value);
  return block;
}

function createClaimList(titleText, claims = [], emptyText, evidenceLevels = {}) {
  const block = document.createElement('div');
  block.className = 'research-claim-block';
  const title = document.createElement('h4');
  title.textContent = titleText;
  block.append(title);

  if (!claims.length) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = emptyText;
    block.append(empty);
    return block;
  }

  const list = document.createElement('ul');
  claims.forEach((claim) => {
    const item = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = claim.name;
    const text = document.createElement('span');
    text.textContent = claim.description;
    const level = document.createElement('small');
    const label = EVIDENCE_LABELS[claim.evidenceLevel] || claim.evidenceLevel;
    level.textContent = label;
    const detail = evidenceLevels[claim.evidenceLevel];
    if (detail) {
      level.title = `${claim.evidenceLevel}: ${detail}`;
    }
    item.append(name, text, level);
    list.append(item);
  });
  block.append(list);
  return block;
}

function createEditorialNote(text, evidenceLevels = {}) {
  const note = document.createElement('aside');
  note.className = 'research-editorial-note';
  const heading = document.createElement('strong');
  heading.textContent = '図鑑編集部の読み方';
  const body = document.createElement('p');
  body.textContent = text;
  const label = document.createElement('small');
  label.textContent = EVIDENCE_LABELS.APP;
  if (evidenceLevels.APP) {
    label.title = `APP: ${evidenceLevels.APP}`;
  }
  note.append(heading, body, label);
  return note;
}

function appendGlossary(section, research) {
  const terms = Array.isArray(research.glossaryTerms) ? research.glossaryTerms : [];
  if (!terms.length) {
    return;
  }

  const entries = terms
    .map((term) => [term, research.glossary?.[term]])
    .filter(([, definition]) => Boolean(definition));
  if (!entries.length) {
    return;
  }

  const heading = document.createElement('h4');
  heading.textContent = 'むずかしいことば';
  const list = document.createElement('dl');
  list.className = 'research-glossary';
  entries.forEach(([term, definition]) => {
    const item = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = definition;
    item.append(dt, dd);
    list.append(item);
  });
  section.append(heading, list);
}
