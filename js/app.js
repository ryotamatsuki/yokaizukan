import { loadOptionalJson, loadYokaiData } from './dataLoader.js';
import { applyFilters, getScaryOptions, readFilters, resetFilterForm } from './filters.js';
import { renderCards, renderCount, renderFilterOptions, renderStatus } from './render.js';
import { openDetail as openBaseDetail, setupDetailModal } from './detail.js';
import { setupOpening } from './opening.js';
import { LITERARY_PHASE1_URL, LITERARY_PHASE2_URL, mergeLiteraryOverlay } from './literary.js';
import {
  enhanceDetailWithResearch,
  installResearchStyles,
  loadPilotResearch,
  mergePilotResearch
} from './research.js';

const elements = {
  form: document.querySelector('#filter-form'),
  keywordInput: document.querySelector('#keyword-input'),
  categorySelect: document.querySelector('#category-select'),
  scarySelect: document.querySelector('#scary-select'),
  sortSelect: document.querySelector('#sort-select'),
  resetButton: document.querySelector('#reset-button'),
  grid: document.querySelector('#yokai-grid'),
  count: document.querySelector('#results-count'),
  status: document.querySelector('#status-message')
};

const state = {
  allItems: [],
  visibleItems: []
};

const opening = setupOpening();
installResearchStyles();

init();

async function init() {
  setupDetailModal();
  bindEvents();
  renderStatus(elements.status, '妖怪データを読み込んでいます。');

  try {
    const data = await loadYokaiData();
    const [literaryPhase1, literaryPhase2] = await Promise.all([
      loadOptionalJson(LITERARY_PHASE1_URL),
      loadOptionalJson(LITERARY_PHASE2_URL)
    ]);
    const research = await loadPilotResearch().catch((error) => {
      console.warn('原典・地域差データを読み込めなかったため、基本図鑑だけで続行します。', error);
      return { items: [], sources: [], evidenceLevels: {} };
    });

    const researchedItems = mergePilotResearch(data.items, research);
    const phase1Items = mergeLiteraryOverlay(researchedItems, literaryPhase1);
    state.allItems = mergeLiteraryOverlay(phase1Items, literaryPhase2);
    opening.setYokaiPool(state.allItems);
    renderFilterOptions(
      { categorySelect: elements.categorySelect, scarySelect: elements.scarySelect },
      state.allItems,
      getScaryOptions(state.allItems)
    );
    renderStatus(elements.status, '');
    updateView();
  } catch (error) {
    renderStatus(elements.status, error.message, 'error');
    elements.count.textContent = '読み込みに失敗しました。';
  }
}

function bindEvents() {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateView();
  });

  elements.form.addEventListener('input', (event) => {
    if (event.target.matches('input, select')) {
      updateView();
    }
  });

  elements.form.addEventListener('change', updateView);

  elements.form.addEventListener('reset', () => {
    window.setTimeout(() => {
      resetFilterForm(elements.form);
      updateView();
      elements.keywordInput.focus();
    }, 0);
  });
}

function updateView() {
  const filters = readFilters(elements.form);
  state.visibleItems = applyFilters(state.allItems, filters);
  renderCards(state.visibleItems, elements.grid, openDetail);
  renderCount(elements.count, state.visibleItems.length, state.allItems.length);
}

function openDetail(yokai) {
  openBaseDetail(yokai);
  enhanceDetailWithResearch(yokai);
}
