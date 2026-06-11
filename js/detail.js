import { createScaryStars } from './render.js';
import { clearEffects, playEnterEffect, playSpecialMove, playTapEffect } from './effects.js';
import { getMuted, toggleMuted, unlockAudio } from './sound.js';

let modal;
let dialog;
let content;
let previousFocus;
let currentEffectClass = '';

const effectMap = {
  kappa: 'effect-water',
  tengu: 'effect-leaves',
  oni: 'effect-shake',
  rokurokubi: 'effect-stretch',
  nekomata: 'effect-tail',
  'karakasa-kozo': 'effect-jump',
  karakasa_kozou: 'effect-jump',
  'chochin-obake': 'effect-glow',
  chochin_obake: 'effect-glow',
  'yuki-onna': 'effect-snow',
  yuki_onna: 'effect-snow',
  nurikabe: 'effect-wall',
  gashadokuro: 'effect-shadow',
  'karasu-tengu': 'effect-feathers',
  karasu_tengu: 'effect-feathers',
  'hitotsume-kozo': 'effect-blink',
  hitotsume_kozou: 'effect-blink',
  'zashiki-warashi': 'effect-sparkle',
  zashiki_warashi: 'effect-sparkle',
  bakeneko: 'effect-tail',
  kitsunebi: 'effect-foxfire',
  'bake-danuki': 'effect-transform',
  bake_danuki: 'effect-transform',
  akaname: 'effect-bath-steam',
  'azuki-arai': 'effect-azuki',
  azuki_arai: 'effect-azuki',
  umibozu: 'effect-wave-shadow',
  umi_bozu: 'effect-wave-shadow',
  ningyo: 'effect-bubbles',
  wanyudo: 'effect-wheel',
  kamaitachi: 'effect-wind-slash',
  kodama: 'effect-tree-sway',
  yamanba: 'effect-mountain-mist',
  oonyudo: 'effect-grow',
  tsuchigumo: 'effect-web',
  nue: 'effect-thunder',
  hitodama: 'effect-floating-fire',
  'tofu-kozo': 'effect-wobble',
  tofu_kozou: 'effect-wobble',
  'hyakki-yagyo': 'effect-parade',
  hyakki_yagyo: 'effect-parade',
  mokumokuren: 'effect-eyes',
  nuppeppo: 'effect-soft-wobble',
  shiro_uneri: 'effect-cloth-wave',
  fumikuruma_yohi: 'effect-paper',
  koto_furunushi: 'effect-music',
  kaichigo: 'effect-shell',
  abura_sumashi: 'effect-lantern-dim',
  sunekosuri: 'effect-footsteps',
  sunakake_baba: 'effect-sand',
  konaki_jiji: 'effect-heavy-drop',
  betobeto_san: 'effect-footsteps',
  okuri_inu: 'effect-shadow-walk',
  enenra: 'effect-smoke',
  ame_onna: 'effect-rain',
  kamikiri: 'effect-scissors',
  ittan_momen: 'effect-flying-cloth',
  ubume: 'effect-mist',
  ushi_oni: 'effect-heavy-shadow',
  hyosube: 'effect-water',
  daidarabotchi: 'effect-giant-step'
};

const particleConfig = {
  'effect-water': { count: 4, className: 'fx-ripple' },
  'effect-leaves': { count: 8, className: 'fx-leaf' },
  'effect-snow': { count: 16, className: 'fx-snow' },
  'effect-feathers': { count: 6, className: 'fx-feather' },
  'effect-sparkle': { count: 10, className: 'fx-spark' },
  'effect-foxfire': { count: 4, className: 'fx-fire' },
  'effect-bath-steam': { count: 5, className: 'fx-steam' },
  'effect-azuki': { count: 14, className: 'fx-azuki' },
  'effect-bubbles': { count: 10, className: 'fx-bubble' },
  'effect-wind-slash': { count: 4, className: 'fx-slash' },
  'effect-mountain-mist': { count: 5, className: 'fx-mist' },
  'effect-thunder': { count: 2, className: 'fx-bolt' },
  'effect-floating-fire': { count: 5, className: 'fx-fire' },
  'effect-transform': { count: 7, className: 'fx-puff' },
  'effect-parade': { count: 9, className: 'fx-parade' },
  'effect-eyes': { count: 7, className: 'fx-eye' },
  'effect-paper': { count: 8, className: 'fx-paper' },
  'effect-music': { count: 6, className: 'fx-note' },
  'effect-shell': { count: 7, className: 'fx-shell' },
  'effect-footsteps': { count: 6, className: 'fx-footstep' },
  'effect-sand': { count: 16, className: 'fx-sand' },
  'effect-smoke': { count: 7, className: 'fx-smoke' },
  'effect-rain': { count: 15, className: 'fx-rain' },
  'effect-scissors': { count: 3, className: 'fx-scissor' },
  'effect-mist': { count: 5, className: 'fx-mist' }
};

export function setupDetailModal() {
  modal = document.querySelector('#detail-modal');
  dialog = modal?.querySelector('.modal-dialog');
  content = document.querySelector('#detail-content');

  if (!modal || !dialog || !content) {
    return;
  }

  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-detail]')) {
      closeDetail();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hidden) {
      closeDetail();
    }
  });
}

export function openDetail(yokai) {
  if (!modal || !dialog || !content) {
    return;
  }

  previousFocus = document.activeElement;
  resetDetailAnimation();
  content.replaceChildren(createDetailContent(yokai));
  modal.hidden = false;
  document.body.classList.add('modal-open');
  dialog.focus();
  requestAnimationFrame(() => playEnterEffect(yokai));
}

export function closeDetail() {
  if (!modal) {
    return;
  }

  modal.hidden = true;
  document.body.classList.remove('modal-open');
  clearEffects();
  resetDetailAnimation();

  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
}

function createDetailContent(yokai) {
  const wrapper = document.createElement('div');
  wrapper.className = 'detail-page';

  const header = document.createElement('header');
  header.className = 'detail-header';

  const titleBlock = document.createElement('div');
  titleBlock.className = 'detail-title-block';

  const title = document.createElement('h2');
  title.id = 'detail-title';
  title.textContent = `${yokai.name}（${yokai.kana}）`;

  const category = document.createElement('span');
  category.className = 'category-tag';
  category.textContent = yokai.category;

  titleBlock.append(title, category);

  const rating = document.createElement('div');
  rating.className = 'detail-rating';
  const ratingTitle = document.createElement('p');
  ratingTitle.textContent = 'こわさレベル';
  const ratingLabel = document.createElement('p');
  ratingLabel.className = 'rating-label';
  ratingLabel.textContent = yokai.scaryLabel;
  rating.append(ratingTitle, createScaryStars(yokai), ratingLabel);

  header.append(titleBlock, rating);

  const media = document.createElement('div');
  media.className = 'detail-media';

  const effectClass = getEffectClass(yokai);
  const effectStage = createYokaiStage(yokai, effectClass);
  currentEffectClass = effectClass;
  media.append(effectStage);

  const generatedNote = document.createElement('p');
  generatedNote.className = 'generated-note';
  generatedNote.textContent = 'このイラストは、昔の妖怪画を参考にして、子ども向けに見やすく描いた再解釈イラストです。';

  const body = document.createElement('div');
  body.className = 'detail-body';

  const oneLine = createSection('ひとことで', yokai.oneLine);
  const description = createSection('どんな妖怪？', yokai.childDescription);
  const habitat = createListSection('どこに出る？', yokai.habitat);
  const trivia = createSection('豆知識', yokai.trivia);
  const features = createListSection('見た目の特徴', yokai.visualFeatures);
  const historical = createHistoricalSection(yokai.historicalImages);
  const references = createReferenceSection(yokai.textReferenceUrls);
  const detailedArticle = createDetailedArticleBlocks(yokai);

  body.append(oneLine, description, habitat, trivia, features, historical, references, generatedNote, detailedArticle.controls, detailedArticle.article);

  if (yokai.notes) {
    body.append(createSection('補足', yokai.notes));
  }

  wrapper.append(header, media, body);
  if (effectClass) {
    wrapper.classList.add(effectClass);
  }
  return wrapper;
}

function createYokaiStage(yokai, effectClass) {
  const profile = yokai.animationProfile || {};
  const specialMove = yokai.specialMove || {};
  const stageName = profile.stage || 'paper';

  const stage = document.createElement('div');
  stage.id = 'yokaiStage';
  stage.className = ['yokai-stage', 'detail-effect-stage', `stage-${stageName}`, effectClass].filter(Boolean).join(' ');
  stage.dataset.yokaiId = yokai.id || '';

  const background = document.createElement('div');
  background.id = 'stageBackground';
  background.className = 'stage-background';

  const effectLayer = document.createElement('div');
  effectLayer.id = 'effectLayer';
  effectLayer.className = ['effect-layer', 'animation-layer', effectClass].filter(Boolean).join(' ');
  effectLayer.setAttribute('aria-hidden', 'true');
  populateAnimationLayer(effectLayer, effectClass);

  const imageButton = document.createElement('button');
  imageButton.id = 'yokaiImageButton';
  imageButton.className = 'yokai-image-button';
  imageButton.type = 'button';
  imageButton.setAttribute('aria-label', `${yokai.name}をうごかす`);
  const hasInteractiveEffects = Boolean(
    profile.tapEffect ||
    profile.effectAssets?.length ||
    specialMove.effect ||
    specialMove.assets?.length
  );

  const placeholder = document.createElement('span');
  placeholder.className = 'image-placeholder stage-placeholder';
  placeholder.textContent = '画像準備中';
  placeholder.hidden = Boolean(yokai.generatedImagePath);

  if (yokai.generatedImagePath) {
    const image = document.createElement('img');
    image.id = 'detailYokaiImage';
    image.className = 'detail-yokai-image';
    image.src = yokai.generatedImagePath;
    image.alt = `${yokai.name}の子ども向け再解釈イラスト`;
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.remove();
      placeholder.hidden = false;
    }, { once: true });
    imageButton.append(image);
  }

  imageButton.append(placeholder);
  if (hasInteractiveEffects) {
    imageButton.addEventListener('click', () => {
      unlockAudio();
      playTapEffect(yokai);
    });
  }

  const actionRow = document.createElement('div');
  actionRow.className = 'yokai-action-row';

  const actionButton = document.createElement('button');
  actionButton.id = 'yokaiActionButton';
  actionButton.className = 'yokai-action-button';
  actionButton.type = 'button';
  actionButton.textContent = profile.actionLabel || 'もういちど！';
  actionButton.addEventListener('click', () => {
    unlockAudio();
    playTapEffect(yokai);
  });

  const specialButton = document.createElement('button');
  specialButton.id = 'specialMoveButton';
  specialButton.className = 'special-move-button';
  specialButton.type = 'button';
  specialButton.textContent = specialMove.label || 'ひっさつわざ！';
  specialButton.addEventListener('click', () => {
    unlockAudio();
    playSpecialMove(yokai);
  });

  const muteButton = document.createElement('button');
  muteButton.id = 'soundMuteButton';
  muteButton.className = 'mute-sound-button';
  muteButton.type = 'button';
  updateMuteButton(muteButton);
  muteButton.addEventListener('click', () => {
    toggleMuted();
    updateMuteButton(muteButton);
    unlockAudio();
  });

  actionRow.append(actionButton, specialButton, muteButton);
  stage.append(background, effectLayer, imageButton);
  if (hasInteractiveEffects) {
    stage.append(actionRow);
  }
  return stage;
}

function updateMuteButton(button) {
  const muted = getMuted();
  button.textContent = muted ? '\u304a\u3068\uff1a\u30aa\u30d5' : '\u304a\u3068\uff1a\u30aa\u30f3';
  button.setAttribute('aria-pressed', String(muted));
  button.setAttribute(
    'aria-label',
    muted
      ? '\u73fe\u5728\u306f\u97f3\u304c\u30aa\u30d5\u3067\u3059\u3002\u62bc\u3059\u3068\u97f3\u3092\u30aa\u30f3\u306b\u3057\u307e\u3059'
      : '\u73fe\u5728\u306f\u97f3\u304c\u30aa\u30f3\u3067\u3059\u3002\u62bc\u3059\u3068\u97f3\u3092\u30aa\u30d5\u306b\u3057\u307e\u3059'
  );
}

function createDetailedArticleBlocks(yokai) {
  const article = yokai.detailedArticle || {};
  const articleId = `detailed-article-${yokai.id || 'yokai'}`;
  const hasBody = Array.isArray(article.body) && article.body.length > 0;

  const controls = document.createElement('section');
  controls.className = 'detail-section detail-more-controls full-span';

  const lead = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = 'もっと詳しく';
  const description = document.createElement('p');
  description.textContent = hasBody
    ? '伝承や昔の絵、暮らしとの関わりをもう少し深く読めます。'
    : '詳しい記事は準備中です。';
  lead.append(title, description);

  const button = document.createElement('button');
  button.className = 'button';
  button.type = 'button';
  button.textContent = 'もっと詳しく読む';
  button.disabled = !hasBody;
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', articleId);

  controls.append(lead, button);

  const articleSection = document.createElement('section');
  articleSection.id = articleId;
  articleSection.className = 'detail-section detailed-article full-span';
  articleSection.tabIndex = -1;
  articleSection.hidden = true;

  const heading = document.createElement('h3');
  heading.textContent = article.title || yokai.name;
  articleSection.append(heading);

  if (article.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'detailed-article-subtitle';
    subtitle.textContent = article.subtitle;
    articleSection.append(subtitle);
  }

  if (hasBody) {
    article.body.forEach((paragraph) => {
      const text = document.createElement('p');
      text.textContent = paragraph;
      articleSection.append(text);
    });
  } else {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '詳しい記事は準備中です。';
    articleSection.append(empty);
  }

  if (article.sourceNote) {
    const note = document.createElement('p');
    note.className = 'detailed-source-note';
    note.textContent = article.sourceNote;
    articleSection.append(note);
  }

  appendDetailedReferences(articleSection, article.references);

  button.addEventListener('click', () => {
    const nextExpanded = articleSection.hidden;
    articleSection.hidden = !nextExpanded;
    button.setAttribute('aria-expanded', String(nextExpanded));
    button.textContent = nextExpanded ? '詳しい記事を閉じる' : 'もっと詳しく読む';

    if (nextExpanded) {
      articleSection.focus({ preventScroll: true });
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      articleSection.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });

  return { controls, article: articleSection };
}

function appendDetailedReferences(section, references = []) {
  const normalizedReferences = Array.isArray(references) ? references.filter((reference) => reference.title || reference.url) : [];

  const title = document.createElement('h4');
  title.textContent = '参考にした記述・原典確認リンク';
  section.append(title);

  if (normalizedReferences.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '参考リンクは準備中です。';
    section.append(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'reference-list detailed-reference-list';

  normalizedReferences.forEach((reference) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = reference.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = reference.title || reference.url;
    item.append(link);

    const meta = [reference.source, reference.note].filter(Boolean).join(' / ');
    if (meta) {
      const metaText = document.createElement('span');
      metaText.className = 'reference-source';
      metaText.textContent = ` / ${meta}`;
      item.append(metaText);
    }

    list.append(item);
  });

  section.append(list);
}

function getEffectClass(yokai) {
  const rawId = yokai?.id || '';
  const normalizedId = rawId.replaceAll('-', '_');
  return effectMap[rawId] || effectMap[normalizedId] || '';
}

function populateAnimationLayer(layer, effectClass) {
  layer.replaceChildren();

  const config = particleConfig[effectClass];
  if (!config) {
    return;
  }

  for (let index = 0; index < config.count; index += 1) {
    const item = document.createElement('span');
    item.className = `fx ${config.className}`;
    item.style.setProperty('--i', index);
    item.style.setProperty('--x', `${10 + ((index * 17) % 78)}%`);
    item.style.setProperty('--y', `${12 + ((index * 23) % 72)}%`);
    item.style.setProperty('--delay', `${index * 0.13}s`);
    item.style.setProperty('--duration', `${1.7 + (index % 4) * 0.22}s`);
    item.style.setProperty('--size', `${0.55 + (index % 5) * 0.16}rem`);
    layer.append(item);
  }
}

function resetDetailAnimation() {
  currentEffectClass = '';

  if (!content) {
    return;
  }

  const layer = content.querySelector('#animationLayer, #effectLayer');
  if (layer) {
    layer.replaceChildren();
    layer.removeAttribute('class');
    layer.className = layer.id === 'effectLayer' ? 'effect-layer animation-layer' : 'animation-layer';
  }

  content.querySelectorAll('.detail-page, .detail-effect-stage, .animation-layer').forEach((element) => {
    [...element.classList]
      .filter((className) => className.startsWith('effect-'))
      .forEach((className) => element.classList.remove(className));
  });
}

function createSection(titleText, bodyText) {
  const section = document.createElement('section');
  section.className = 'detail-section';

  const title = document.createElement('h3');
  title.textContent = titleText;

  const body = document.createElement('p');
  body.textContent = bodyText || '準備中です。';

  section.append(title, body);
  return section;
}

function createListSection(titleText, values) {
  const section = document.createElement('section');
  section.className = 'detail-section';

  const title = document.createElement('h3');
  title.textContent = titleText;

  const list = document.createElement('ul');
  list.className = 'chip-list';
  const items = Array.isArray(values) ? values.filter(Boolean) : [];

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '準備中です。';
    section.append(title, empty);
    return section;
  }

  items.forEach((value) => {
    const item = document.createElement('li');
    item.textContent = value;
    list.append(item);
  });

  section.append(title, list);
  return section;
}

function createHistoricalSection(images) {
  const section = document.createElement('section');
  section.className = 'detail-section';

  const title = document.createElement('h3');
  title.textContent = 'むかしの絵';
  section.append(title);

  if (!Array.isArray(images) || images.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'historical-empty';
    empty.textContent = 'むかしの絵は準備中です。';
    section.append(empty);
    return section;
  }

  const list = document.createElement('div');
  list.className = 'historical-list';

  images.forEach((image) => {
    const item = document.createElement('article');
    item.className = 'historical-item';

    if (image.imagePath) {
      const figure = document.createElement('figure');
      figure.className = 'historical-thumb';
      const img = document.createElement('img');
      img.src = image.imagePath;
      img.alt = image.artworkTitle ? `${image.artworkTitle}の史料画像` : '史料画像';
      img.loading = 'lazy';
      figure.append(img);
      item.append(figure);
    }

    item.append(createMetaLine('作品名', image.artworkTitle));
    item.append(createMetaLine('作者', image.artist));
    item.append(createMetaLine('所蔵・出典', image.source));
    item.append(createMetaLink('出典ページ', image.sourcePageUrl));
    item.append(createMetaLine('利用条件', image.licenseNote));
    item.append(createMetaLine('表記', image.attribution));
    list.append(item);
  });

  section.append(list);
  return section;
}

function createReferenceSection(references) {
  const section = document.createElement('section');
  section.className = 'detail-section full-span';

  const title = document.createElement('h3');
  title.textContent = '出典・参考情報';
  section.append(title);

  if (!Array.isArray(references) || references.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '参考情報は準備中です。';
    section.append(empty);
    return section;
  }

  const list = document.createElement('ul');
  list.className = 'reference-list';

  references.forEach((reference) => {
    const item = document.createElement('li');
    if (reference.url) {
      const link = document.createElement('a');
      link.href = reference.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = reference.title || reference.source || reference.url;
      item.append(link);
    } else {
      item.textContent = reference.title || reference.source || '参考情報';
    }

    if (reference.source) {
      const source = document.createElement('span');
      source.className = 'reference-source';
      source.textContent = ` / ${reference.source}`;
      item.append(source);
    }

    list.append(item);
  });

  section.append(list);
  return section;
}

function createMetaLine(label, value) {
  const paragraph = document.createElement('p');
  paragraph.className = 'meta-line';
  paragraph.textContent = value ? `${label}: ${value}` : `${label}: 準備中`;
  return paragraph;
}

function createMetaLink(label, url) {
  const paragraph = document.createElement('p');
  paragraph.className = 'meta-line';
  if (!url) {
    paragraph.textContent = `${label}: 準備中`;
    return paragraph;
  }
  const prefix = document.createTextNode(`${label}: `);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = url;
  paragraph.append(prefix, link);
  return paragraph;
}
