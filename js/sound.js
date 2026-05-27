const SOUND_BASE = 'public/assets/sounds/';
const MUTE_KEY = 'yokaiEffectsMuted';

let audioContext;
let userActivated = false;
let muted = readMuted();

const audioCache = new Map();

export function playSound(soundFile) {
  if (!soundFile || muted) {
    return;
  }

  userActivated = true;
  const audio = getAudio(soundFile);

  audio.currentTime = 0;
  audio.play().catch((error) => {
    console.warn(`Sound file unavailable, using synthesized fallback: ${soundFile}`, error);
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
    getAudio(soundFile).preload = 'auto';
  });
}

function getAudio(soundFile) {
  if (!audioCache.has(soundFile)) {
    const audio = new Audio(`${SOUND_BASE}${soundFile}`);
    audio.preload = 'none';
    audio.addEventListener('error', () => {
      console.warn(`Sound file unavailable: ${soundFile}`);
    }, { once: true });
    audioCache.set(soundFile, audio);
  }

  return audioCache.get(soundFile);
}

function playSynth(soundFile) {
  if (!userActivated || muted) {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  audioContext ||= new AudioContext();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
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
  if (soundFile.includes('cat')) {
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

  if (soundFile.includes('wind')) {
    return [
      { from: 220, to: 440, length: 0.32, volume: 0.09, type: 'sawtooth' },
      { from: 330, to: 260, length: 0.26, volume: 0.07, type: 'triangle' }
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
