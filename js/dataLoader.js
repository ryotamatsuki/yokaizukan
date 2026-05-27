const DATA_URL = 'public/data/yokai.json';

export const DEFAULT_SCARY_LABELS = {
  1: 'かわいい',
  2: 'ちょっとふしぎ',
  3: '少しこわい',
  4: 'こわい',
  5: 'かなりこわい'
};

export async function loadYokaiData(url = DATA_URL) {
  let response;

  try {
    response = await fetch(url, { cache: 'no-cache' });
  } catch (error) {
    throw new Error(`妖怪データを読み込めませんでした。ローカルで見る場合は python -m http.server 8000 を使ってください。 (${error.message})`);
  }

  if (!response.ok) {
    throw new Error(`妖怪データの読み込みに失敗しました。HTTP ${response.status}`);
  }

  const rawData = await response.json();
  const rawItems = Array.isArray(rawData) ? rawData : rawData.items;

  if (!Array.isArray(rawItems)) {
    throw new Error('yokai.json の items が配列ではありません。');
  }

  const scaryLabels = {
    ...DEFAULT_SCARY_LABELS,
    ...(rawData.scaryScale?.labels || rawData.scareScale?.labels || {})
  };

  const items = rawItems.map((item, index) => normalizeYokai(item, index, scaryLabels));

  return {
    version: rawData.version || null,
    updatedAt: rawData.updatedAt || null,
    imageBasePath: rawData.imageBasePath || '',
    scaryScale: rawData.scaryScale || rawData.scareScale || { min: 1, max: 5, labels: scaryLabels },
    referenceSources: toArray(rawData.referenceSources).map(normalizeReference),
    items
  };
}

export async function loadOptionalJson(url) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

export function getScaryLabel(level, labels = DEFAULT_SCARY_LABELS) {
  const numericLevel = clampNumber(level, 1, 5, 1);
  return labels[numericLevel] || DEFAULT_SCARY_LABELS[numericLevel];
}

function normalizeYokai(item = {}, index, scaryLabels) {
  const scaryLevel = clampNumber(item.scaryLevel ?? item.scareLevel, 1, 5, 1);
  const kana = safeText(item.kana ?? item.nameKana);
  const childDescription = safeText(item.childDescription ?? item.description);
  const oneLine = safeText(item.oneLine) || makeOneLine(childDescription);
  const visualFeatures = toArray(item.visualFeatures ?? item.appearance).map(safeText).filter(Boolean);
  const habitat = toArray(item.habitat).map(safeText).filter(Boolean);
  const textReferenceUrls = toArray(item.textReferenceUrls ?? item.references).map(normalizeReference).filter((source) => source.title || source.url);
  const historicalImages = toArray(item.historicalImages).map(normalizeHistoricalImage);
  const detailedArticle = normalizeDetailedArticle(item.detailedArticle);

  return {
    id: safeText(item.id) || `yokai-${index + 1}`,
    name: safeText(item.name) || '名前未設定',
    kana,
    nameKana: kana,
    nameEn: safeText(item.nameEn),
    category: safeText(item.category) || '未分類',
    oneLine,
    childDescription,
    description: childDescription,
    scaryLevel,
    scareLevel: scaryLevel,
    scaryLabel: safeText(item.scaryLabel) || getScaryLabel(scaryLevel, scaryLabels),
    trivia: safeText(item.trivia) || '豆知識は準備中です。',
    habitat,
    visualFeatures,
    appearance: visualFeatures,
    generatedImagePath: normalizeImagePath(item.generatedImagePath ?? item.image),
    image: normalizeImagePath(item.generatedImagePath ?? item.image),
    historicalImages,
    textReferenceUrls,
    notes: safeText(item.notes),
    tags: toArray(item.tags).map(safeText).filter(Boolean),
    missions: toArray(item.missions).map(safeText).filter(Boolean),
    quiz: toArray(item.quiz).map(normalizeQuiz).filter((quiz) => quiz.question && quiz.choices.length > 0),
    detailedArticle,
    animationProfile: normalizeAnimationProfile(item.animationProfile),
    specialMove: normalizeSpecialMove(item.specialMove)
  };
}

function normalizeAnimationProfile(profile = {}) {
  return {
    stage: safeText(profile.stage),
    enterEffect: safeText(profile.enterEffect),
    tapEffect: safeText(profile.tapEffect),
    actionLabel: safeText(profile.actionLabel),
    sound: safeText(profile.sound),
    effectAssets: toArray(profile.effectAssets).map(normalizeImagePath).filter(Boolean)
  };
}

function normalizeSpecialMove(move = {}) {
  return {
    label: safeText(move.label),
    effect: safeText(move.effect),
    sound: safeText(move.sound),
    assets: toArray(move.assets).map(normalizeImagePath).filter(Boolean)
  };
}

function normalizeDetailedArticle(article = {}) {
  const body = toArray(article.body ?? article.paragraphs)
    .map(safeText)
    .filter(Boolean);
  const references = toArray(article.references ?? article.referenceUrls)
    .map(normalizeReference)
    .filter((source) => source.title || source.url);

  return {
    title: safeText(article.title),
    subtitle: safeText(article.subtitle),
    body,
    sourceNote: safeText(article.sourceNote),
    references
  };
}

function normalizeQuiz(quiz = {}) {
  return {
    question: safeText(quiz.question),
    choices: toArray(quiz.choices).map(safeText).filter(Boolean),
    answer: safeText(quiz.answer),
    explanation: safeText(quiz.explanation)
  };
}

function normalizeHistoricalImage(image = {}) {
  return {
    imagePath: normalizeImagePath(image.imagePath || image.url || image.src),
    artworkTitle: safeText(image.artworkTitle || image.title),
    artist: safeText(image.artist),
    source: safeText(image.source),
    sourcePageUrl: safeText(image.sourcePageUrl || image.pageUrl || image.url),
    licenseNote: safeText(image.licenseNote),
    attribution: safeText(image.attribution)
  };
}

function normalizeReference(source = {}) {
  if (typeof source === 'string') {
    return {
      title: source,
      source: '',
      url: source,
      note: ''
    };
  }

  return {
    title: safeText(source.title || source.name || source.source),
    source: safeText(source.source || source.provider || source.name),
    url: safeText(source.url || source.sourcePageUrl || source.href),
    note: safeText(source.note || source.description)
  };
}

function normalizeImagePath(path) {
  const cleanPath = safeText(path);
  if (!cleanPath) {
    return '';
  }
  if (cleanPath.startsWith('http') || cleanPath.startsWith('/') || cleanPath.startsWith('public/')) {
    return cleanPath;
  }
  if (cleanPath.startsWith('assets/')) {
    return `public/${cleanPath}`;
  }
  return cleanPath;
}

function makeOneLine(text) {
  const cleanText = safeText(text);
  if (!cleanText) {
    return 'ひとこと説明は準備中です。';
  }
  return cleanText.split('。')[0] + '。';
}

function safeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function clampNumber(value, min, max, fallback) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(numericValue)));
}
