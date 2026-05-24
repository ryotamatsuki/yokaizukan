const LEGACY_STORAGE_KEY = 'openingSeen';
const OPENING_DURATION = 3900;
const REDUCED_DURATION = 420;

const DEFAULT_POPUP_YOKAI = [
  { id: 'kappa', name: '河童', path: 'public/assets/yokai/generated/kappa.png' },
  { id: 'tengu', name: '天狗', path: 'public/assets/yokai/generated/tengu.png' },
  { id: 'oni', name: '鬼', path: 'public/assets/yokai/generated/oni.png' },
  { id: 'karakasa-kozo', name: 'からかさ小僧', path: 'public/assets/yokai/generated/karakasa-kozo.png' },
  { id: 'chochin-obake', name: '提灯お化け', path: 'public/assets/yokai/generated/chochin-obake.png' }
];

export function setupOpening() {
  const elements = {
    screen: document.querySelector('#openingScreen'),
    storybook: document.querySelector('#storybook'),
    openButton: document.querySelector('#openBookButton'),
    skipButton: document.querySelector('#skipOpeningButton'),
    replayButton: document.querySelector('#replayOpeningButton'),
    popupImages: [...document.querySelectorAll('[data-popup-yokai]')],
    openingAssets: [...document.querySelectorAll('[data-opening-asset]')]
  };

  if (!elements.screen || !elements.storybook || !elements.openButton || !elements.skipButton) {
    return {
      setYokaiPool() {}
    };
  }

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const state = {
    pool: [...DEFAULT_POPUP_YOKAI],
    isPlaying: false,
    hideTimer: null
  };

  elements.popupImages.forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
    });
  });

  elements.openingAssets.forEach((image) => {
    image.addEventListener('error', () => {
      image.hidden = true;
    });
  });

  elements.openButton.addEventListener('click', () => {
    startOpening(elements, state, reduceMotion);
  });

  elements.skipButton.addEventListener('click', () => {
    hideOpening(elements, state, { instant: true });
  });

  elements.replayButton?.addEventListener('click', () => {
    showOpening(elements, state);
  });

  applySeasonClass(elements.screen);
  preparePopupYokai(elements, state);
  clearLegacyOpeningSkip();
  showInitialOpening(elements);

  return {
    setYokaiPool(items) {
      state.pool = normalizeYokaiPool(items);
      if (!state.isPlaying) {
        preparePopupYokai(elements, state);
      }
    }
  };
}

function startOpening(elements, state, reduceMotion) {
  if (state.isPlaying) {
    return;
  }

  state.isPlaying = true;
  elements.openButton.disabled = true;
  elements.screen.classList.add('is-opening');
  elements.storybook.classList.add('open');

  if (!reduceMotion) {
    playPageFlipSound();
  }

  const duration = reduceMotion ? REDUCED_DURATION : OPENING_DURATION;
  state.hideTimer = window.setTimeout(() => {
    hideOpening(elements, state, { instant: false });
  }, duration);
}

function showInitialOpening(elements) {
  elements.screen.hidden = false;
  document.body.classList.add('opening-active');
  window.setTimeout(() => elements.openButton.focus(), 0);
}

function showOpening(elements, state) {
  window.clearTimeout(state.hideTimer);
  state.isPlaying = false;
  elements.screen.hidden = false;
  elements.screen.classList.remove('is-dismissing');
  elements.screen.classList.remove('is-opening');
  elements.storybook.classList.remove('open');
  elements.openButton.disabled = false;
  document.body.classList.add('opening-active');
  applySeasonClass(elements.screen);
  preparePopupYokai(elements, state);

  // Restart CSS animations cleanly when the user replays the opening.
  void elements.storybook.offsetWidth;
  window.setTimeout(() => elements.openButton.focus(), 0);
}

function hideOpening(elements, state, { instant }) {
  window.clearTimeout(state.hideTimer);
  state.isPlaying = false;
  elements.openButton.disabled = false;

  const finish = () => {
    elements.screen.hidden = true;
    elements.screen.classList.remove('is-dismissing');
    elements.screen.classList.remove('is-opening');
    elements.storybook.classList.remove('open');
    document.body.classList.remove('opening-active');
  };

  if (instant) {
    finish();
    return;
  }

  elements.screen.classList.add('is-dismissing');
  window.setTimeout(finish, 280);
}

function normalizeYokaiPool(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [...DEFAULT_POPUP_YOKAI];
  }

  const normalized = items
    .filter((item) => item?.generatedImagePath)
    .map((item) => ({
      id: item.id || item.nameEn || item.name || item.generatedImagePath,
      name: item.name || '',
      path: item.generatedImagePath
    }));

  return normalized.length > 0 ? normalized : [...DEFAULT_POPUP_YOKAI];
}

function preparePopupYokai(elements, state) {
  const chosen = choosePopupYokai(state.pool, new Date(), elements.popupImages.length);

  elements.popupImages.forEach((image, index) => {
    const yokai = chosen[index] || DEFAULT_POPUP_YOKAI[index % DEFAULT_POPUP_YOKAI.length];
    image.classList.remove('is-missing');
    image.src = yokai.path;
    image.dataset.yokaiId = yokai.id;
    image.dataset.yokaiName = yokai.name;
  });
}

function choosePopupYokai(pool, date, count) {
  const candidates = pool.length > 0 ? [...pool] : [...DEFAULT_POPUP_YOKAI];
  const today = pickTodayYokai(candidates, date);
  const rest = shuffle(candidates.filter((item) => item.id !== today.id));
  return [today, ...rest].slice(0, count);
}

function pickTodayYokai(candidates, date) {
  const season = getSeason(date);

  if (season === 'setsubun') {
    const oni = candidates.find((item) => item.id === 'oni' || item.name === '鬼');
    if (oni) {
      return oni;
    }
  }

  const year = date.getFullYear();
  const start = new Date(year, 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return candidates[dayOfYear % candidates.length] || DEFAULT_POPUP_YOKAI[0];
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function applySeasonClass(screen) {
  screen.classList.remove('season-default', 'season-summer', 'season-winter', 'season-setsubun');
  screen.classList.add(`season-${getSeason(new Date())}`);
}

function getSeason(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month === 2 && day >= 1 && day <= 5) {
    return 'setsubun';
  }

  if (month === 12 || month === 1 || month === 2) {
    return 'winter';
  }

  if (month >= 6 && month <= 8) {
    return 'summer';
  }

  return 'default';
}

function playPageFlipSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }

    const context = new AudioContext();
    const duration = 0.28;
    const frameCount = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      const progress = index / frameCount;
      const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.35);
      channel[index] = (Math.random() * 2 - 1) * envelope * 0.22;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = 'highpass';
    filter.frequency.value = 520;
    gain.gain.value = 0.08;

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();
    source.onended = () => {
      context.close?.();
    };
  } catch (_error) {
    // Sound is decorative; failures should never block the encyclopedia.
  }
}

function clearLegacyOpeningSkip() {
  try {
    window.localStorage?.removeItem(LEGACY_STORAGE_KEY);
  } catch (_error) {
    // The opening still works when localStorage is blocked.
  }
}
