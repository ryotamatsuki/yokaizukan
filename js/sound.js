const SOUND_BASE = 'public/assets/sounds/';
const MUTE_KEY = 'yokaiEffectsMuted';

let audioContext;
let userActivated = false;
let muted = readMuted();

const audioCache = new Map();
const soundAvailability = new Map();

export async function unlockAudio() {
  userActivated = true;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    console.warn('AudioContext is not available. Sound effects cannot be synthesized on this browser.');
    return false;
  }

  audioContext ||= new AudioContext();
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (error) {
      console.warn('AudioContext resume failed. On iPad Safari, tap the sound button or yokai image again.', error);
      return false;
    }
  }

  return audioContext.state === 'running';
}

export function playSound(soundFile) {
  if (!soundFile || muted) {
    return;
  }

  unlockAudio().then((unlocked) => {
    if (!unlocked) {
      console.warn(`Audio is not unlocked; sound effect may be silent: ${soundFile}`);
    }
  });

  const availability = soundAvailability.get(soundFile);
  if (availability !== true) {
    playSynth(soundFile);
    ensureSoundAvailability(soundFile);
    return;
  }

  const audio = getAudio(soundFile);
  audio.currentTime = 0;
  audio.play().catch((error) => {
    soundAvailability.set(soundFile, false);
    console.warn(`Sound file could not be played, using synthesized fallback: ${soundFile}`, error);
    playSynth(soundFile);
  });
}

export function setMuted(value) {
  muted = Boolean(value);
  try {
    window.localStorage?.setItem(MUTE_KEY, muted ? 'true' : 'false');
  } catch {
    // localStorage may be unavailable in restrictive environments.
  }
  document.dispatchEvent(new CustomEvent('yokai-sound-muted-change', { detail: { muted } }));
}

export function getMuted() {
  return muted;
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

export function preloadSounds(soundFiles = []) {
  soundFiles.filter(Boolean).forEach((soundFile) => {
    ensureSoundAvailability(soundFile);
    getAudio(soundFile).preload = 'auto';
  });
}

function getAudio(soundFile) {
  if (!audioCache.has(soundFile)) {
    const audio = new Audio(`${SOUND_BASE}${soundFile}`);
    audio.preload = 'none';
    audio.addEventListener('error', () => {
      soundAvailability.set(soundFile, false);
      console.warn(`Sound file unavailable: ${soundFile}`);
    }, { once: true });
    audio.addEventListener('canplaythrough', () => {
      soundAvailability.set(soundFile, true);
    }, { once: true });
    audioCache.set(soundFile, audio);
  }

  return audioCache.get(soundFile);
}

async function ensureSoundAvailability(soundFile) {
  if (!soundFile || soundAvailability.has(soundFile) || typeof fetch !== 'function') {
    return soundAvailability.get(soundFile);
  }

  try {
    const response = await fetch(`${SOUND_BASE}${soundFile}`, { method: 'HEAD', cache: 'force-cache' });
    soundAvailability.set(soundFile, response.ok);
    if (!response.ok) {
      console.warn(`Sound file is not placed; synthesized fallback will be used: ${soundFile} (${response.status})`);
    }
  } catch (error) {
    soundAvailability.set(soundFile, false);
    console.warn(`Sound file check failed; synthesized fallback will be used: ${soundFile}`, error);
  }

  return soundAvailability.get(soundFile);
}

async function playSynth(soundFile) {
  if (!userActivated || muted) {
    return;
  }

  const unlocked = await unlockAudio();
  if (!unlocked || !audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + getDuration(soundFile));
  master.connect(audioContext.destination);

  const pattern = getPattern(soundFile);
  pattern.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.08;
    const end = start + note.length;
    oscillator.type = note.type;
    oscillator.frequency.setValueAtTime(note.from, start);
    oscillator.frequency.exponentialRampToValueAtTime(note.to, end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(note.volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}

function getDuration(soundFile) {
  return soundFile.startsWith('special_') ? 0.72 : 0.38;
}

function getPattern(soundFile) {
  if (soundFile.includes('cat') || soundFile.includes('paw')) {
    return [
      { from: 620, to: 760, length: 0.14, volume: 0.18, type: 'triangle' },
      { from: 780, to: 560, length: 0.16, volume: 0.12, type: 'triangle' }
    ];
  }

  if (soundFile.includes('snow')) {
    return [
      { from: 880, to: 1320, length: 0.22, volume: 0.1, type: 'sine' },
      { from: 1320, to: 1760, length: 0.22, volume: 0.08, type: 'sine' }
    ];
  }

  if (soundFile.includes('bubble')) {
    return [
      { from: 720, to: 1040, length: 0.09, volume: 0.11, type: 'sine' },
      { from: 860, to: 1260, length: 0.1, volume: 0.09, type: 'sine' },
      { from: 980, to: 1460, length: 0.11, volume: 0.08, type: 'triangle' }
    ];
  }

  if (soundFile.includes('rain')) {
    return [
      { from: 760, to: 620, length: 0.08, volume: 0.08, type: 'triangle' },
      { from: 840, to: 680, length: 0.08, volume: 0.07, type: 'sine' },
      { from: 700, to: 560, length: 0.1, volume: 0.07, type: 'triangle' }
    ];
  }

  if (soundFile.includes('cloth') || soundFile.includes('white_wave')) {
    return [
      { from: 320, to: 560, length: 0.24, volume: 0.09, type: 'sine' },
      { from: 460, to: 300, length: 0.28, volume: 0.07, type: 'triangle' }
    ];
  }

  if (soundFile.includes('paper') || soundFile.includes('letter')) {
    return [
      { from: 620, to: 740, length: 0.07, volume: 0.08, type: 'triangle' },
      { from: 760, to: 620, length: 0.08, volume: 0.07, type: 'sine' },
      { from: 680, to: 860, length: 0.08, volume: 0.07, type: 'triangle' }
    ];
  }

  if (soundFile.includes('koto')) {
    return [
      { from: 520, to: 1040, length: 0.24, volume: 0.1, type: 'triangle' },
      { from: 780, to: 1320, length: 0.22, volume: 0.08, type: 'sine' }
    ];
  }

  if (soundFile.includes('tofu') || soundFile.includes('wobble')) {
    return [
      { from: 240, to: 340, length: 0.12, volume: 0.11, type: 'sine' },
      { from: 360, to: 260, length: 0.14, volume: 0.09, type: 'triangle' }
    ];
  }

  if (soundFile.includes('shell')) {
    return [
      { from: 760, to: 1120, length: 0.16, volume: 0.1, type: 'sine' },
      { from: 980, to: 1460, length: 0.16, volume: 0.08, type: 'triangle' }
    ];
  }

  if (soundFile.includes('eye') || soundFile.includes('flash')) {
    return [
      { from: 620, to: 920, length: 0.09, volume: 0.11, type: 'triangle' },
      { from: 980, to: 1460, length: 0.16, volume: 0.09, type: 'sine' }
    ];
  }

  if (soundFile.includes('mari') || soundFile.includes('lucky')) {
    return [
      { from: 420, to: 520, length: 0.08, volume: 0.1, type: 'triangle' },
      { from: 720, to: 1080, length: 0.18, volume: 0.08, type: 'sine' }
    ];
  }

  if (soundFile.includes('steam') || soundFile.includes('bath')) {
    return [
      { from: 380, to: 620, length: 0.24, volume: 0.08, type: 'sine' },
      { from: 520, to: 360, length: 0.26, volume: 0.06, type: 'triangle' }
    ];
  }

  if (soundFile.includes('shoji') || soundFile.includes('gaze')) {
    return [
      { from: 360, to: 520, length: 0.12, volume: 0.08, type: 'triangle' },
      { from: 540, to: 760, length: 0.14, volume: 0.07, type: 'sine' }
    ];
  }

  if (soundFile.includes('blob') || soundFile.includes('wobble')) {
    return [
      { from: 220, to: 330, length: 0.14, volume: 0.1, type: 'sine' },
      { from: 320, to: 210, length: 0.16, volume: 0.08, type: 'triangle' }
    ];
  }

  if (soundFile.includes('oil') || soundFile.includes('stone_marker')) {
    return [
      { from: 280, to: 180, length: 0.1, volume: 0.1, type: 'sine' },
      { from: 520, to: 780, length: 0.18, volume: 0.07, type: 'triangle' }
    ];
  }

  if (soundFile.includes('sand')) {
    return [
      { from: 520, to: 420, length: 0.08, volume: 0.08, type: 'triangle' },
      { from: 620, to: 460, length: 0.09, volume: 0.07, type: 'sine' },
      { from: 480, to: 360, length: 0.1, volume: 0.06, type: 'triangle' }
    ];
  }

  if (soundFile.includes('heavy') || soundFile.includes('thump')) {
    return [
      { from: 140, to: 70, length: 0.2, volume: 0.18, type: 'sine' },
      { from: 220, to: 120, length: 0.18, volume: 0.1, type: 'triangle' }
    ];
  }

  if (soundFile.includes('smoke')) {
    return [
      { from: 360, to: 540, length: 0.24, volume: 0.07, type: 'sine' },
      { from: 500, to: 320, length: 0.28, volume: 0.05, type: 'triangle' }
    ];
  }

  if (soundFile.includes('snip') || soundFile.includes('scissors') || soundFile.includes('hair_spark')) {
    return [
      { from: 880, to: 520, length: 0.06, volume: 0.11, type: 'triangle' },
      { from: 1160, to: 1500, length: 0.12, volume: 0.08, type: 'sine' }
    ];
  }

  if (soundFile.includes('water') || soundFile.includes('wave') || soundFile.includes('sea') || soundFile.includes('river')) {
    return [
      { from: 260, to: 420, length: 0.22, volume: 0.12, type: 'sine' },
      { from: 360, to: 240, length: 0.24, volume: 0.09, type: 'triangle' }
    ];
  }

  if (soundFile.includes('forest') || soundFile.includes('kodama') || soundFile.includes('leaf')) {
    return [
      { from: 520, to: 740, length: 0.18, volume: 0.09, type: 'sine' },
      { from: 680, to: 920, length: 0.2, volume: 0.08, type: 'triangle' }
    ];
  }

  if (soundFile.includes('puff') || soundFile.includes('transform')) {
    return [
      { from: 180, to: 420, length: 0.16, volume: 0.13, type: 'sine' },
      { from: 520, to: 760, length: 0.12, volume: 0.1, type: 'triangle' }
    ];
  }

  if (soundFile.includes('footstep') || soundFile.includes('step')) {
    return [
      { from: 220, to: 120, length: 0.08, volume: 0.12, type: 'sine' },
      { from: 280, to: 150, length: 0.08, volume: 0.1, type: 'triangle' },
      { from: 240, to: 130, length: 0.09, volume: 0.09, type: 'sine' }
    ];
  }

  if (soundFile.includes('shadow') || soundFile.includes('presence')) {
    return [
      { from: 260, to: 180, length: 0.28, volume: 0.07, type: 'sine' },
      { from: 380, to: 520, length: 0.18, volume: 0.05, type: 'triangle' }
    ];
  }

  if (soundFile.includes('mist')) {
    return [
      { from: 420, to: 620, length: 0.28, volume: 0.07, type: 'sine' },
      { from: 520, to: 390, length: 0.3, volume: 0.06, type: 'triangle' }
    ];
  }

  if (soundFile.includes('fire') || soundFile.includes('foxfire')) {
    return [
      { from: 520, to: 860, length: 0.2, volume: 0.12, type: 'sine' },
      { from: 780, to: 1180, length: 0.22, volume: 0.09, type: 'triangle' }
    ];
  }

  if (soundFile.includes('wind')) {
    return [
      { from: 220, to: 440, length: 0.32, volume: 0.09, type: 'sawtooth' },
      { from: 330, to: 260, length: 0.26, volume: 0.07, type: 'triangle' }
    ];
  }

  if (soundFile.includes('azuki') || soundFile.includes('grain')) {
    return [
      { from: 420, to: 520, length: 0.07, volume: 0.11, type: 'square' },
      { from: 500, to: 620, length: 0.07, volume: 0.1, type: 'triangle' },
      { from: 460, to: 560, length: 0.07, volume: 0.09, type: 'square' }
    ];
  }

  if (soundFile.includes('drum') || soundFile.includes('bump') || soundFile.includes('wall')) {
    return [
      { from: 160, to: 70, length: 0.18, volume: 0.2, type: 'sine' },
      { from: 130, to: 80, length: 0.2, volume: 0.12, type: 'triangle' }
    ];
  }

  if (soundFile.includes('rattle') || soundFile.includes('bone')) {
    return [
      { from: 420, to: 360, length: 0.08, volume: 0.12, type: 'square' },
      { from: 500, to: 430, length: 0.08, volume: 0.1, type: 'square' },
      { from: 380, to: 460, length: 0.08, volume: 0.1, type: 'square' }
    ];
  }

  if (soundFile.includes('stretch')) {
    return [
      { from: 260, to: 760, length: 0.34, volume: 0.11, type: 'sine' }
    ];
  }

  return [
    { from: 360, to: 520, length: 0.16, volume: 0.13, type: 'triangle' },
    { from: 520, to: 420, length: 0.14, volume: 0.09, type: 'triangle' }
  ];
}

function readMuted() {
  try {
    return window.localStorage?.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}
