import { playSound } from './sound.js';

const MAX_TAP_ASSETS = 3;
const MAX_SPECIAL_ASSETS = 4;
let specialTimer;

export function playEnterEffect(yokai) {
  const profile = yokai?.animationProfile || {};
  applyStage(profile.stage);
  applyReducedMotionIfNeeded();

  const stage = getStage();
  const image = getImage();
  if (!stage || !image) {
    return;
  }

  stage.classList.remove('is-entering');
  image.classList.remove('yokai-enter-motion');
  requestAnimationFrame(() => {
    stage.dataset.enterEffect = profile.enterEffect || 'fadeIn';
    stage.classList.add('is-entering');
    image.classList.add('yokai-enter-motion', `motion-${profile.enterEffect || 'fadeIn'}`);
  });

  const firstAsset = profile.effectAssets?.[0];
  if (firstAsset) {
    spawnEffect(firstAsset, `effect-sprite enter-${profile.enterEffect || 'fadeIn'}`, {
      size: 'min(60vw, 320px)',
      duration: '980ms',
      delay: '80ms'
    });
  }
}

export function playTapEffect(yokai) {
  const profile = yokai?.animationProfile || {};
  clearEffects();
  applyStage(profile.stage);

  const image = getImage();
  if (image) {
    replayMotion(image, `motion-${profile.tapEffect || 'tap'}`, 780);
  }

  (profile.effectAssets || []).slice(0, MAX_TAP_ASSETS).forEach((src, index) => {
    spawnEffect(src, `effect-sprite tap-${profile.tapEffect || 'tap'}`, {
      size: index === 0 ? 'min(72vw, 390px)' : 'min(48vw, 260px)',
      x: `${50 + (index - 1) * 18}%`,
      y: `${50 + (index % 2) * 8}%`,
      delay: `${index * 90}ms`,
      duration: `${900 + index * 130}ms`,
      rotate: `${(index - 1) * 18}deg`
    });
  });

  createParticles(profile.stage || 'spark', 6);
  playSound(profile.sound);
}

export function playSpecialMove(yokai) {
  const special = yokai?.specialMove || {};
  const profile = yokai?.animationProfile || {};
  const button = document.querySelector('#specialMoveButton');
  const stage = getStage();
  const image = getImage();

  clearEffects();
  applyStage(profile.stage);
  window.clearTimeout(specialTimer);

  button?.classList.add('is-playing');
  stage?.classList.add('is-special');
  stage?.setAttribute('data-special-effect', special.effect || '');

  if (image) {
    replayMotion(image, `motion-${special.effect || 'special'}`, 1300);
  }

  (special.assets || []).slice(0, MAX_SPECIAL_ASSETS).forEach((src, index) => {
    spawnEffect(src, `effect-sprite special-${special.effect || 'special'}`, {
      size: index === 0 ? 'min(88vw, 520px)' : 'min(62vw, 360px)',
      x: `${50 + (index - 1.5) * 13}%`,
      y: `${48 + (index % 2) * 12}%`,
      delay: `${index * 120}ms`,
      duration: `${1250 + index * 160}ms`,
      rotate: `${(index - 1) * 22}deg`
    });
  });

  createParticles(profile.stage || 'spark', 12);
  playSound(special.sound);

  specialTimer = window.setTimeout(() => {
    button?.classList.remove('is-playing');
    stage?.classList.remove('is-special');
    stage?.removeAttribute('data-special-effect');
  }, prefersReducedMotion() ? 260 : 1650);
}

export function spawnEffect(src, className, options = {}) {
  const layer = getLayer();
  if (!layer || !src) {
    return null;
  }

  const image = document.createElement('img');
  image.src = src;
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  image.className = className;
  image.style.setProperty('--fx-size', options.size || 'min(75vw, 440px)');
  image.style.setProperty('--fx-x', options.x || '50%');
  image.style.setProperty('--fx-y', options.y || '50%');
  image.style.setProperty('--fx-delay', options.delay || '0ms');
  image.style.setProperty('--fx-duration', options.duration || '1000ms');
  image.style.setProperty('--fx-rotate', options.rotate || '0deg');

  image.addEventListener('animationend', () => image.remove(), { once: true });
  image.addEventListener('error', () => {
    image.remove();
    const fallback = document.createElement('span');
    fallback.className = `fallback-effect ${className.replaceAll(' ', '-')}`;
    fallback.setAttribute('aria-hidden', 'true');
    layer.append(fallback);
    window.setTimeout(() => fallback.remove(), 900);
  }, { once: true });

  layer.append(image);
  window.setTimeout(() => image.remove(), 2400);
  return image;
}

export function clearEffects() {
  const layer = getLayer();
  if (layer) {
    layer.querySelectorAll('.effect-sprite, .stage-particle, .fallback-effect').forEach((element) => element.remove());
  }

  const image = getImage();
  if (image) {
    [...image.classList].filter((className) => className.startsWith('motion-')).forEach((className) => image.classList.remove(className));
  }
}

export function createParticles(type, count) {
  const layer = getLayer();
  if (!layer) {
    return [];
  }

  const particles = [];
  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement('span');
    particle.className = `stage-particle particle-${type}`;
    particle.style.setProperty('--p-x', `${16 + ((index * 19) % 68)}%`);
    particle.style.setProperty('--p-y', `${18 + ((index * 29) % 58)}%`);
    particle.style.setProperty('--p-delay', `${index * 60}ms`);
    particle.style.setProperty('--p-size', `${8 + (index % 4) * 4}px`);
    particle.setAttribute('aria-hidden', 'true');
    layer.append(particle);
    window.setTimeout(() => particle.remove(), 1400);
    particles.push(particle);
  }
  return particles;
}

export function applyStage(stageName = '') {
  const stage = getStage();
  if (!stage) {
    return;
  }

  [...stage.classList]
    .filter((className) => className.startsWith('stage-'))
    .forEach((className) => stage.classList.remove(className));

  stage.classList.add(`stage-${stageName || 'paper'}`);
}

export function applyReducedMotionIfNeeded() {
  getStage()?.classList.toggle('is-reduced-motion', prefersReducedMotion());
}

function replayMotion(element, className, duration) {
  [...element.classList].filter((name) => name.startsWith('motion-')).forEach((name) => element.classList.remove(name));
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), prefersReducedMotion() ? 220 : duration);
}

function getStage() {
  return document.querySelector('#yokaiStage');
}

function getLayer() {
  return document.querySelector('#effectLayer');
}

function getImage() {
  return document.querySelector('#detailYokaiImage');
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
