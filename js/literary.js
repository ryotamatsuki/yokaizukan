export const LITERARY_PHASE1_URL = 'public/data/yokai_literary_phase1.json';
export const LITERARY_PHASE2_URL = 'public/data/yokai_literary_phase2.json';
export const LITERARY_PHASE3_URL = 'public/data/yokai_literary_phase3.json';
export const ARTICLE_CLOSURE_URL = 'public/data/yokai_article_closure.json';

const ALLOWED_ARTICLE_FIELDS = new Set(['title', 'subtitle', 'body']);
const CLOSURE_TEXT_FIELDS = ['oneLine', 'childDescription', 'trivia'];
const CLOSURE_ARRAY_FIELDS = ['habitat', 'tags', 'quiz'];

export function mergeLiteraryOverlay(items = [], literaryData = null) {
  if (!literaryData || !Array.isArray(literaryData.items)) return items;
  const overlays = new Map(literaryData.items.map((item) => [item.id, item]));

  return items.map((item) => {
    const overlay = overlays.get(item.id);
    if (!overlay) return item;
    const articlePatch = sanitizeArticlePatch(overlay.detailedArticle);
    const childDescription = cleanText(overlay.childDescription) || item.childDescription;
    return {
      ...item,
      oneLine: cleanText(overlay.oneLine) || item.oneLine,
      childDescription,
      description: childDescription,
      detailedArticle: { ...item.detailedArticle, ...articlePatch }
    };
  });
}

export function mergeArticleClosureOverlay(items = [], closureData = null) {
  if (!closureData || !Array.isArray(closureData.items)) return items;
  const overlays = new Map(closureData.items.map((item) => [item.id, item]));

  return items.map((item) => {
    const overlay = overlays.get(item.id);
    if (!overlay) return item;

    const next = { ...item };
    for (const key of CLOSURE_TEXT_FIELDS) {
      const value = cleanText(overlay[key]);
      if (value) next[key] = value;
    }
    for (const key of CLOSURE_ARRAY_FIELDS) {
      if (Array.isArray(overlay[key])) next[key] = structuredClone(overlay[key]);
    }

    const childDescription = cleanText(overlay.childDescription);
    if (childDescription) next.description = childDescription;

    // Closure metadata is editorial/audit data, not a public explanatory note.
    next.notes = '';

    // Legacy base metadata can otherwise survive even when the article is replaced.
    // For closure targets, visual claims belong in the Research panel / article itself,
    // and reference links must come from current Research sourceIds only.
    next.visualFeatures = [];
    next.textReferenceUrls = [];

    const articlePatch = sanitizeArticlePatch(overlay.detailedArticle);
    const hasResearch = Boolean(item.research);
    const existingArticle = item.detailedArticle || {};
    next.detailedArticle = {
      ...existingArticle,
      ...articlePatch,
      sourceNote: hasResearch
        ? '出典リンクは現在のResearch sourceIdsから表示しています。詳しい確認範囲は「地域と出典で読む」を参照してください。'
        : '研究データを読み込めなかったため、出典リンクは現在表示していません。',
      references: hasResearch && Array.isArray(existingArticle.references)
        ? existingArticle.references
        : []
    };

    return next;
  });
}

function sanitizeArticlePatch(article) {
  if (!article || typeof article !== 'object') return {};
  const patch = {};
  for (const key of ALLOWED_ARTICLE_FIELDS) {
    if (!(key in article)) continue;
    if (key === 'body') {
      if (Array.isArray(article.body)) patch.body = article.body.map(cleanText).filter(Boolean);
      continue;
    }
    const value = cleanText(article[key]);
    if (value) patch[key] = value;
  }
  return patch;
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}
