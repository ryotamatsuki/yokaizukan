import fs from 'node:fs';

const DATA_FILES = {
  yokai: 'public/data/yokai.json',
  effectAssets: 'public/data/effect_assets.json',
  legends: 'public/data/legends.json',
  articles: 'public/data/articles.json',
  childArticles: 'public/data/child_articles.json',
  locations: 'public/data/locations.json',
  courses: 'public/data/courses.json',
  sources: 'public/data/sources.json',
  evidence: 'public/data/evidence_check_table.json'
};
const STYLE_FILE = 'css/style.css';
const EFFECT_ASSET_WARNING_BYTES = 150 * 1024;
const EFFECT_ASSET_REVIEW_BYTES = 250 * 1024;

const errors = [];
const warnings = [];

const data = Object.fromEntries(
  Object.entries(DATA_FILES).map(([key, filePath]) => [key, readJson(filePath)])
);
const styleCss = readText(STYLE_FILE);

if (errors.length === 0) {
  validateYokai(data.yokai, styleCss, data.effectAssets);
  validateEhime(data);
}

if (errors.length > 0) {
  console.error('Data integrity check failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('Data integrity warnings:');
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

console.log('Data integrity check passed.');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    addError(filePath, '(file)', `invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    addError(filePath, '(file)', `cannot read file: ${error.message}`);
    return '';
  }
}

function validateYokai(yokaiData, cssText, effectAssetsData) {
  const filePath = DATA_FILES.yokai;
  const items = yokaiData?.items;

  if (!Array.isArray(items)) {
    addError(filePath, '(root)', 'items must be an array');
    return;
  }

  checkUniqueIds(filePath, 'items', items);
  validateYokaiSoundReferences(items);
  const effectUsageByPath = validateYokaiEffectReferences(items, cssText);
  validateEffectAssetsMetadata(effectAssetsData, effectUsageByPath);

  for (const item of items) {
    const itemId = getId(item);
    for (const field of ['id', 'name', 'oneLine', 'childDescription', 'generatedImagePath']) {
      if (!isNonEmptyString(item?.[field])) {
        addError(filePath, itemId, `missing or empty ${field}`);
      }
    }

    if (item?.detailedArticle !== undefined) {
      const article = item.detailedArticle;
      if (!isPlainObject(article)) {
        addError(filePath, itemId, 'detailedArticle must be an object when present');
        continue;
      }
      if (!isNonEmptyString(article.title)) {
        addError(filePath, itemId, 'detailedArticle.title is missing or empty');
      }
      if (!Array.isArray(article.body) || article.body.length === 0) {
        addError(filePath, itemId, 'detailedArticle.body must be a non-empty array');
      }
    }
  }
}

function validateYokaiSoundReferences(items) {
  const soundReferences = [];

  for (const item of items) {
    const itemId = getId(item);
    for (const [owner, soundFile] of [
      ['animationProfile.sound', item?.animationProfile?.sound],
      ['specialMove.sound', item?.specialMove?.sound]
    ]) {
      if (soundFile === undefined || soundFile === null || soundFile === '') {
        continue;
      }
      if (!isNonEmptyString(soundFile)) {
        addError(DATA_FILES.yokai, itemId, `${owner} must be a non-empty string when present`);
        continue;
      }
      soundReferences.push({ itemId, owner, soundFile });
    }
  }

  if (soundReferences.length === 0) {
    addWarning('yokai sounds: no animationProfile.sound or specialMove.sound references found');
    return;
  }

  addWarning(`yokai sound references (${soundReferences.length}): ${soundReferences.map((ref) => `${ref.itemId} ${ref.owner}=${ref.soundFile}`).join('; ')}`);

  for (const ref of soundReferences) {
    const soundPath = `public/assets/sounds/${ref.soundFile}`;
    if (!fs.existsSync(soundPath)) {
      addWarning(`${DATA_FILES.yokai} [${ref.itemId}]: ${ref.owner} references missing optional sound file: ${soundPath}`);
    }
  }
}

function validateYokaiEffectReferences(items, cssText) {
  const effectUsageByPath = new Map();

  for (const item of items) {
    const itemId = getId(item);
    const tapAssets = getArrayFromValue(item?.animationProfile?.effectAssets, DATA_FILES.yokai, itemId, 'animationProfile.effectAssets');
    const specialAssets = getArrayFromValue(item?.specialMove?.assets, DATA_FILES.yokai, itemId, 'specialMove.assets');

    checkEffectCssClass(itemId, 'animationProfile.tapEffect', item?.animationProfile?.tapEffect, 'tap', cssText);
    checkEffectCssClass(itemId, 'specialMove.effect', item?.specialMove?.effect, 'special', cssText);

    if (tapAssets.length > 3) {
      addError(DATA_FILES.yokai, itemId, 'animationProfile.effectAssets must contain at most 3 assets');
    }
    if (specialAssets.length > 4) {
      addError(DATA_FILES.yokai, itemId, 'specialMove.assets must contain at most 4 assets');
    }

    for (const assetPath of tapAssets) {
      checkYokaiEffectAssetPath(itemId, 'animationProfile.effectAssets', assetPath);
      registerEffectAssetUsage(effectUsageByPath, assetPath, itemId);
    }
    for (const assetPath of specialAssets) {
      checkYokaiEffectAssetPath(itemId, 'specialMove.assets', assetPath);
      registerEffectAssetUsage(effectUsageByPath, assetPath, itemId);
    }
  }

  return effectUsageByPath;
}

function checkYokaiEffectAssetPath(itemId, fieldName, assetPath) {
  if (!isNonEmptyString(assetPath)) {
    addError(DATA_FILES.yokai, itemId, `${fieldName} contains an empty asset path`);
    return;
  }
  if (!assetPath.startsWith('public/assets/effects/')) {
    addError(DATA_FILES.yokai, itemId, `${fieldName} must reference public/assets/effects/: ${assetPath}`);
    return;
  }
  if (!fs.existsSync(assetPath)) {
    addError(DATA_FILES.yokai, itemId, `${fieldName} references missing effect asset: ${assetPath}`);
    return;
  }
  if (fs.statSync(assetPath).size === 0) {
    addError(DATA_FILES.yokai, itemId, `${fieldName} references empty effect asset: ${assetPath}`);
  }
}

function checkEffectCssClass(itemId, fieldName, effectName, classPrefix, cssText) {
  if (effectName === undefined || effectName === null || effectName === '') {
    return;
  }
  if (!isNonEmptyString(effectName)) {
    addError(DATA_FILES.yokai, itemId, `${fieldName} must be a non-empty string when present`);
    return;
  }

  const className = `${classPrefix}-${effectName}`;
  if (!cssHasClass(cssText, className)) {
    addError(DATA_FILES.yokai, itemId, `${fieldName} references missing CSS class .${className} in ${STYLE_FILE}`);
  }
}

function cssHasClass(cssText, className) {
  const classPattern = new RegExp(`\\.${escapeRegExp(className)}(?=[\\s,{.#:>\\[]|$)`);
  return classPattern.test(cssText);
}

function registerEffectAssetUsage(effectUsageByPath, assetPath, itemId) {
  if (!isNonEmptyString(assetPath)) {
    return;
  }
  if (!effectUsageByPath.has(assetPath)) {
    effectUsageByPath.set(assetPath, new Set());
  }
  effectUsageByPath.get(assetPath).add(itemId);
}

function validateEffectAssetsMetadata(effectAssetsData, effectUsageByPath) {
  const filePath = DATA_FILES.effectAssets;

  if (!Array.isArray(effectAssetsData)) {
    addError(filePath, '(root)', 'effect_assets.json must be an array');
    return;
  }

  checkUniqueIds(filePath, '(root)', effectAssetsData);

  const metadataByPath = new Map();
  for (const asset of effectAssetsData) {
    const assetId = getId(asset);

    if (!isNonEmptyString(asset?.path)) {
      addError(filePath, assetId, 'path is missing or empty');
      continue;
    }
    if (!asset.path.startsWith('public/assets/effects/')) {
      addError(filePath, assetId, `path must reference public/assets/effects/: ${asset.path}`);
      continue;
    }
    if (!fs.existsSync(asset.path)) {
      addError(filePath, assetId, `path references missing effect asset: ${asset.path}`);
    } else {
      const assetSize = fs.statSync(asset.path).size;
      if (assetSize === 0) {
        addError(filePath, assetId, `path references empty effect asset: ${asset.path}`);
      } else if (asset.path.endsWith('.webp') && assetSize > EFFECT_ASSET_REVIEW_BYTES) {
        addWarning(`${filePath} [${assetId}]: WebP effect asset is over 250KB and should be reviewed: ${asset.path} (${formatBytes(assetSize)})`);
      } else if (asset.path.endsWith('.webp') && assetSize > EFFECT_ASSET_WARNING_BYTES) {
        addWarning(`${filePath} [${assetId}]: WebP effect asset is over 150KB: ${asset.path} (${formatBytes(assetSize)})`);
      }
    }
    if (metadataByPath.has(asset.path)) {
      addWarning(`${filePath} [${assetId}]: duplicate metadata path also used by ${metadataByPath.get(asset.path).id}: ${asset.path}`);
    } else {
      metadataByPath.set(asset.path, asset);
    }

    if (!Array.isArray(asset?.usedBy)) {
      addError(filePath, assetId, 'usedBy must be an array');
      continue;
    }
    for (const yokaiId of asset.usedBy) {
      if (!isNonEmptyString(yokaiId)) {
        addError(filePath, assetId, 'usedBy contains an empty yokai id');
      }
    }
  }

  for (const [assetPath, yokaiIds] of effectUsageByPath) {
    const metadata = metadataByPath.get(assetPath);
    if (!metadata) {
      addWarning(`${DATA_FILES.yokai}: effect asset is not registered in ${filePath}: ${assetPath}`);
      continue;
    }

    const usedBy = new Set(metadata.usedBy || []);
    const actualYokaiIds = [...yokaiIds].sort();
    const missingFromMetadata = actualYokaiIds.filter((id) => !usedBy.has(id));
    const extraInMetadata = [...usedBy].filter((id) => !yokaiIds.has(id)).sort();

    if (missingFromMetadata.length > 0) {
      addWarning(`${filePath} [${metadata.id}]: usedBy is missing yokai.json references: ${missingFromMetadata.join(', ')}`);
    }
    if (extraInMetadata.length > 0) {
      addWarning(`${filePath} [${metadata.id}]: usedBy includes ids not currently referencing this path in yokai.json: ${extraInMetadata.join(', ')}`);
    }
  }

  for (const asset of effectAssetsData) {
    if (!isNonEmptyString(asset?.path) || !Array.isArray(asset?.usedBy)) {
      continue;
    }

    const yokaiIds = effectUsageByPath.get(asset.path) || new Set();
    const unreferencedUsedBy = asset.usedBy.filter((id) => isNonEmptyString(id) && !yokaiIds.has(id)).sort();

    if (unreferencedUsedBy.length > 0) {
      addWarning(`${filePath} [${getId(asset)}]: usedBy ids do not reference this asset from yokai.json animationProfile.effectAssets or specialMove.assets: ${unreferencedUsedBy.join(', ')}`);
    }
  }
}

function validateEhime(allData) {
  const legends = getArray(allData.legends, 'legends', DATA_FILES.legends);
  const articles = getArray(allData.articles, 'articles', DATA_FILES.articles);
  const childArticles = getArray(allData.childArticles, 'articles', DATA_FILES.childArticles);
  const locations = getArray(allData.locations, 'locations', DATA_FILES.locations);
  const courses = getArray(allData.courses, 'courses', DATA_FILES.courses);
  const sources = getArray(allData.sources, 'sources', DATA_FILES.sources);
  const evidence = getArray(allData.evidence, 'legendEvidence', DATA_FILES.evidence);

  const legendIds = checkUniqueIds(DATA_FILES.legends, 'legends', legends);
  const articleIds = checkUniqueIds(DATA_FILES.articles, 'articles', articles);
  const childArticleIds = checkUniqueIds(DATA_FILES.childArticles, 'articles', childArticles);
  const locationIds = checkUniqueIds(DATA_FILES.locations, 'locations', locations);
  const courseIds = checkUniqueIds(DATA_FILES.courses, 'courses', courses);
  const sourceIds = checkUniqueIds(DATA_FILES.sources, 'sources', sources);

  const childParentById = new Map();

  for (const legend of legends) {
    const legendId = getId(legend);

    if (!isNonEmptyString(legend?.imagePath)) {
      addError(DATA_FILES.legends, legendId, 'imagePath is missing or empty');
    }

    if (!isNonEmptyString(legend?.articleId)) {
      addError(DATA_FILES.legends, legendId, 'articleId is missing or empty');
    } else if (!articleIds.has(legend.articleId)) {
      addError(DATA_FILES.legends, legendId, `articleId does not exist in articles.json: ${legend.articleId}`);
    }

    if (legend?.locationId !== undefined && !locationIds.has(legend.locationId)) {
      addError(DATA_FILES.legends, legendId, `locationId does not exist in locations.json: ${legend.locationId}`);
    }

    checkIdArray(DATA_FILES.legends, legendId, 'courseIds', legend.courseIds, courseIds, 'courses.json');
    checkIdArray(DATA_FILES.legends, legendId, 'sourceIds', legend.sourceIds, sourceIds, 'sources.json');

    const childItems = getArrayFromValue(legend.childItems, DATA_FILES.legends, legendId, 'childItems');
    const childItemIds = getArrayFromValue(legend.childItemIds, DATA_FILES.legends, legendId, 'childItemIds');
    const actualChildIds = childItems.map((child) => child?.id);

    if (!arraysMatch(childItemIds, actualChildIds)) {
      addError(DATA_FILES.legends, legendId, 'childItemIds must match childItems ids in the same order');
    }

    for (const child of childItems) {
      const childId = getId(child);

      if (!isNonEmptyString(child?.id)) {
        addError(DATA_FILES.legends, legendId, 'childItems entry is missing id');
        continue;
      }

      if (childParentById.has(child.id)) {
        addError(DATA_FILES.legends, child.id, `duplicate childItems.id also found under ${childParentById.get(child.id)}`);
      } else {
        childParentById.set(child.id, legendId);
      }

      if (child.parentId !== undefined && child.parentId !== legendId) {
        addError(DATA_FILES.legends, child.id, `parentId must match parent cluster id: ${legendId}`);
      }

      if (!isNonEmptyString(child.imagePath)) {
        addError(DATA_FILES.legends, child.id, 'imagePath is missing or empty');
      }

      const childArticleId = child.childArticleId || child.articleId || child.id;
      if (!childArticleIds.has(childArticleId)) {
        addError(DATA_FILES.legends, child.id, `child article does not exist in child_articles.json: ${childArticleId}`);
      }

      checkIdArray(DATA_FILES.legends, childId, 'sourceIds', child.sourceIds, sourceIds, 'sources.json');
    }
  }

  for (const article of articles) {
    const articleId = getId(article);
    checkIdArray(DATA_FILES.articles, articleId, 'sourceIds', article.sourceIds, sourceIds, 'sources.json');
  }

  for (const childArticle of childArticles) {
    const articleId = getId(childArticle);
    const parentId = childArticle?.parentId;

    if (!isNonEmptyString(parentId)) {
      addError(DATA_FILES.childArticles, articleId, 'parentId is missing or empty');
    } else if (!legendIds.has(parentId)) {
      addError(DATA_FILES.childArticles, articleId, `parentId does not exist in legends.json: ${parentId}`);
    }

    const expectedParentId = childParentById.get(childArticle.id);
    if (expectedParentId === undefined) {
      addError(DATA_FILES.childArticles, articleId, 'article id does not match any childItems.id');
    } else if (parentId !== expectedParentId) {
      addError(DATA_FILES.childArticles, articleId, `parentId must match childItems parent: ${expectedParentId}`);
    }

    checkIdArray(DATA_FILES.childArticles, articleId, 'sourceIds', childArticle.sourceIds, sourceIds, 'sources.json');
  }

  for (const course of courses) {
    const courseId = getId(course);
    checkIdArray(DATA_FILES.courses, courseId, 'legendIds', course.legendIds, legendIds, 'legends.json');
    for (const stop of getArrayFromValue(course?.stops, DATA_FILES.courses, courseId, 'stops')) {
      if (stop?.legendId !== undefined && !legendIds.has(stop.legendId)) {
        addError(DATA_FILES.courses, courseId, `stops.legendId does not exist in legends.json: ${stop.legendId}`);
      }
    }
  }

  for (const evidenceItem of evidence) {
    const legendId = evidenceItem?.legendId;
    if (!isNonEmptyString(legendId)) {
      addError(DATA_FILES.evidence, '(evidence item)', 'legendId is missing or empty');
    } else if (!legendIds.has(legendId)) {
      addError(DATA_FILES.evidence, legendId, 'legendId does not exist in legends.json');
    }
  }
}

function getArray(dataObject, key, filePath) {
  const value = dataObject?.[key];
  if (!Array.isArray(value)) {
    addError(filePath, '(root)', `${key} must be an array`);
    return [];
  }
  return value;
}

function getArrayFromValue(value, filePath, ownerId, fieldName) {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    addError(filePath, ownerId, `${fieldName} must be an array`);
    return [];
  }
  return value;
}

function checkUniqueIds(filePath, label, records) {
  const seen = new Set();
  for (const record of records) {
    const id = record?.id;
    if (!isNonEmptyString(id)) {
      addError(filePath, label, 'record is missing id');
      continue;
    }
    if (seen.has(id)) {
      addError(filePath, id, 'duplicate id');
    }
    seen.add(id);
  }
  return seen;
}

function checkIdArray(filePath, ownerId, fieldName, value, targetIds, targetLabel) {
  if (value === undefined) {
    return;
  }
  if (!Array.isArray(value)) {
    addError(filePath, ownerId, `${fieldName} must be an array`);
    return;
  }
  for (const id of value) {
    if (!targetIds.has(id)) {
      addError(filePath, ownerId, `${fieldName} contains missing id in ${targetLabel}: ${id}`);
    }
  }
}

function arraysMatch(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getId(record) {
  return isNonEmptyString(record?.id) ? record.id : '(missing id)';
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addError(filePath, id, message) {
  errors.push(`${filePath} [${id}]: ${message}`);
}

function addWarning(message) {
  warnings.push(message);
}
