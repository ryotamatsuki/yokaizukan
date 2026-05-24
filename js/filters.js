const collator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' });

export const DEFAULT_FILTERS = {
  keyword: '',
  category: '',
  scary: '',
  sort: 'kana'
};

export function getCategories(items) {
  return [...new Set(items.map((item) => item.category).filter(Boolean))]
    .sort((a, b) => collator.compare(a, b));
}

export function getScaryOptions(items) {
  const byLevel = new Map();
  items.forEach((item) => {
    if (!byLevel.has(item.scaryLevel)) {
      byLevel.set(item.scaryLevel, item.scaryLabel);
    }
  });
  return [...byLevel.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([level, label]) => ({ level, label }));
}

export function applyFilters(items, filters = DEFAULT_FILTERS) {
  const keyword = normalize(filters.keyword);
  const category = filters.category || '';
  const scary = filters.scary ? Number(filters.scary) : null;

  const filtered = items.filter((item) => {
    const keywordMatch = !keyword || buildSearchText(item).includes(keyword);
    const categoryMatch = !category || item.category === category;
    const scaryMatch = !scary || item.scaryLevel === scary;
    return keywordMatch && categoryMatch && scaryMatch;
  });

  return sortYokai(filtered, filters.sort || DEFAULT_FILTERS.sort);
}

export function sortYokai(items, sortKey = DEFAULT_FILTERS.sort) {
  const sorted = [...items];

  if (sortKey === 'scary') {
    return sorted.sort((a, b) => (a.scaryLevel - b.scaryLevel) || compareKana(a, b));
  }

  if (sortKey === 'category') {
    return sorted.sort((a, b) => collator.compare(a.category, b.category) || compareKana(a, b));
  }

  return sorted.sort(compareKana);
}

export function readFilters(form) {
  const formData = new FormData(form);
  return {
    keyword: String(formData.get('keyword') || ''),
    category: String(formData.get('category') || ''),
    scary: String(formData.get('scary') || ''),
    sort: String(formData.get('sort') || DEFAULT_FILTERS.sort)
  };
}

export function resetFilterForm(form) {
  form.reset();
  const sortSelect = form.querySelector('[name="sort"]');
  if (sortSelect) {
    sortSelect.value = DEFAULT_FILTERS.sort;
  }
}

function compareKana(a, b) {
  return collator.compare(a.kana || a.name, b.kana || b.name);
}

function buildSearchText(item) {
  return normalize([
    item.name,
    item.kana,
    item.category,
    item.oneLine,
    item.childDescription,
    item.trivia,
    item.habitat.join(' '),
    item.detailedArticle?.title,
    item.detailedArticle?.subtitle,
    item.detailedArticle?.body?.join(' ')
  ].join(' '));
}

function normalize(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase('ja-JP').trim();
}
