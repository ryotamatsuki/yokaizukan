export function renderFilterOptions(elements, items, scaryOptions) {
  const { categorySelect, scarySelect } = elements;
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'ja'));

  categorySelect.replaceChildren(createOption('', 'すべて'));
  categories.forEach((category) => {
    categorySelect.append(createOption(category, category));
  });

  scarySelect.replaceChildren(createOption('', 'すべて'));
  scaryOptions.forEach(({ level, label }) => {
    scarySelect.append(createOption(String(level), `${level}：${label}`));
  });
}

export function renderCards(items, container, onOpenDetail) {
  container.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = '条件に合う妖怪が見つかりませんでした。';
    container.append(empty);
    return;
  }

  items.forEach((yokai) => {
    container.append(createYokaiCard(yokai, onOpenDetail));
  });
}

export function renderCount(target, visibleCount, totalCount) {
  target.textContent = `${visibleCount} / ${totalCount} 体を表示中`;
}

export function renderStatus(target, message, type = 'info') {
  target.textContent = message;
  target.dataset.type = type;
  target.hidden = !message;
}

export function renderSourcesPage(target, items = [], fallbackSources = []) {
  target.replaceChildren();
  const sources = collectSources(items, fallbackSources);

  if (sources.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '表示できる参考情報はまだありません。';
    target.append(empty);
    return;
  }

  sources.forEach((source) => {
    const article = document.createElement('article');
    article.className = 'reference-card';

    const title = document.createElement(source.url ? 'a' : 'span');
    title.className = 'reference-title';
    title.textContent = source.title || source.source || source.url;
    if (source.url) {
      title.href = source.url;
      title.target = '_blank';
      title.rel = 'noreferrer';
    }

    const meta = document.createElement('p');
    meta.className = 'reference-meta';
    meta.textContent = [source.source, source.note].filter(Boolean).join(' / ');

    article.append(title, meta);
    target.append(article);
  });
}

export function createScaryBadge(yokai) {
  const badge = document.createElement('span');
  badge.className = `scary-badge scary-${yokai.scaryLevel}`;
  badge.textContent = yokai.scaryLabel;
  return badge;
}

export function createScaryStars(yokai) {
  const wrapper = document.createElement('span');
  wrapper.className = 'scary-stars';
  wrapper.setAttribute('aria-label', `こわさレベル ${yokai.scaryLevel}、${yokai.scaryLabel}`);

  for (let index = 1; index <= 5; index += 1) {
    const star = document.createElement('span');
    star.className = index <= yokai.scaryLevel ? 'star is-filled' : 'star';
    star.textContent = '★';
    wrapper.append(star);
  }

  return wrapper;
}

export function createImageFrame(yokai, className = '') {
  const frame = document.createElement('figure');
  frame.className = `image-frame ${className}`.trim();

  const placeholder = document.createElement('div');
  placeholder.className = 'image-placeholder';
  placeholder.textContent = '画像準備中';
  placeholder.hidden = Boolean(yokai.generatedImagePath);

  if (yokai.generatedImagePath) {
    const image = document.createElement('img');
    image.src = yokai.generatedImagePath;
    image.alt = `${yokai.name}の子ども向け再解釈イラスト`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.remove();
      placeholder.hidden = false;
    }, { once: true });
    frame.append(image);
  }

  frame.append(placeholder);
  return frame;
}

function createYokaiCard(yokai, onOpenDetail) {
  const card = document.createElement('article');
  card.className = 'yokai-card';
  card.tabIndex = 0;
  card.dataset.yokaiId = yokai.id || '';

  const imageFrame = createImageFrame(yokai, 'card-image');

  const body = document.createElement('div');
  body.className = 'card-body';

  const category = document.createElement('span');
  category.className = 'category-tag';
  category.textContent = yokai.category;

  const title = document.createElement('h3');
  title.textContent = yokai.name;

  const kana = document.createElement('p');
  kana.className = 'kana';
  kana.textContent = yokai.kana;

  const oneLine = document.createElement('p');
  oneLine.className = 'one-line';
  oneLine.textContent = yokai.oneLine;

  const rating = document.createElement('div');
  rating.className = 'card-rating';
  const ratingLabel = document.createElement('span');
  ratingLabel.textContent = 'こわさレベル';
  rating.append(ratingLabel, createScaryStars(yokai));

  const button = document.createElement('button');
  button.className = 'button';
  button.type = 'button';
  button.textContent = 'くわしく見る';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onOpenDetail(yokai);
  });

  body.append(title, kana, category, oneLine, rating, button);
  card.append(imageFrame, body);

  card.addEventListener('click', () => onOpenDetail(yokai));
  card.addEventListener('keydown', (event) => {
    if (event.target !== card) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenDetail(yokai);
    }
  });

  return card;
}

function createOption(value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
}

function collectSources(items, fallbackSources) {
  const seen = new Set();
  const sources = [];

  [
    ...fallbackSources,
    ...items.flatMap((item) => [
      ...(item.textReferenceUrls || []),
      ...(item.detailedArticle?.references || [])
    ])
  ].forEach((source) => {
    const normalized = normalizeSource(source);
    const key = normalized.url || `${normalized.title}-${normalized.source}`;
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    sources.push(normalized);
  });

  return sources;
}

function normalizeSource(source) {
  if (typeof source === 'string') {
    return { title: source, source: '', url: source, note: '' };
  }
  return {
    title: source.title || source.name || source.source || '',
    source: source.source || source.provider || source.name || '',
    url: source.url || source.sourcePageUrl || source.href || '',
    note: source.note || source.description || ''
  };
}
