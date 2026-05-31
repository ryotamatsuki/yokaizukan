import fs from 'node:fs';

const DATA_FILES = {
  yokai: 'public/data/yokai.json',
  legends: 'public/data/legends.json',
  articles: 'public/data/articles.json',
  childArticles: 'public/data/child_articles.json',
  locations: 'public/data/locations.json',
  courses: 'public/data/courses.json',
  sources: 'public/data/sources.json',
  evidence: 'public/data/evidence_check_table.json'
};

const errors = [];

const data = Object.fromEntries(
  Object.entries(DATA_FILES).map(([key, filePath]) => [key, readJson(filePath)])
);

if (errors.length === 0) {
  validateYokai(data.yokai);
  validateEhime(data);
}

if (errors.length > 0) {
  console.error('Data integrity check failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
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

function validateYokai(yokaiData) {
  const filePath = DATA_FILES.yokai;
  const items = yokaiData?.items;

  if (!Array.isArray(items)) {
    addError(filePath, '(root)', 'items must be an array');
    return;
  }

  checkUniqueIds(filePath, 'items', items);

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
