export const LITERARY_PHASE1_URL = 'public/data/yokai_literary_phase1.json';
export const LITERARY_PHASE2_URL = 'public/data/yokai_literary_phase2.json';

const ALLOWED_ARTICLE_FIELDS = new Set(['title', 'subtitle', 'body']);

export function mergeLiteraryOverlay(items = [], literaryData = null) {
  if (!literaryData || !Array.isArray(literaryData.items)) {
    return items;
  }

  const overlays = new Map(literaryData.items.map((item) => [item.id, item]));

  return items.map((item) => {
    const overlay = overlays.get(item.id);
    if (!overlay) {
      return item;
    }

    const articlePatch = sanitizeArticlePatch(overlay.detailedArticle);
    const childDescription = cleanText(overlay.childDescription) || item.childDescription;

    return {
      ...item,
      oneLine: cleanText(overlay.oneLine) || item.oneLine,
      childDescription,
      description: childDescription,
      detailedArticle: {
        ...item.detailedArticle,
        ...articlePatch
      }
    };
  });
}

function sanitizeArticlePatch(article) {
  if (!article || typeof article !== 'object') {
    return {};
  }

  const patch = {};
  for (const key of ALLOWED_ARTICLE_FIELDS) {
    if (!(key in article)) continue;
    if (key === 'body') {
      if (Array.isArray(article.body)) {
        patch.body = article.body.map(cleanText).filter(Boolean);
      }
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
