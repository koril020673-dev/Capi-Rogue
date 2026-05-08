import mainBgm from '../assets/bgm/bg_music_main.wav';
import tensionBgm from '../assets/bgm/bg_music_tension.wav';
import boomBgm from '../assets/bgm/boom_bgm.wav';
import businessDecisionBgm from '../assets/bgm/business_decision_bgm.wav';
import contractionBgm from '../assets/bgm/contraction_bgm.wav';
import growthBgm from '../assets/bgm/growth_bgm.wav';
import recessionBgm from '../assets/bgm/recession_bgm.wav';
import stableBgm from '../assets/bgm/stable_bgm.wav';
import clickSfx from '../assets/sfx/sfx_click.wav';
import nextFloorSfx from '../assets/sfx/sfx_nextfloor.wav';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  normalizeSettings,
  saveSettings,
} from './settingsEngine';

const LEGACY_SETTINGS_KEY = 'capirogue-settings-v1';

const BGM_FILES = Object.freeze({
  boom: boomBgm,
  growth: growthBgm,
  stable: stableBgm,
  contraction: contractionBgm,
  recession: recessionBgm,
  main: mainBgm,
  strategy: businessDecisionBgm,
  tension: tensionBgm,
});

const SFX_FILES = Object.freeze({
  click: clickSfx,
  event: nextFloorSfx,
  warning: nextFloorSfx,
  profit: nextFloorSfx,
  loss: nextFloorSfx,
  nextfloor: nextFloorSfx,
});

let currentBgm = null;
let currentBgmKey = null;
let bgmVolume = 1;
let sfxVolume = 1;
let bgmEnabled = true;
let sfxEnabled = true;
let pendingBgm = null;
let unlockListenersInstalled = false;

export function getGameSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    if (window.localStorage.getItem(SETTINGS_KEY)) {
      return loadSettings();
    }

    const legacySettings = JSON.parse(window.localStorage.getItem(LEGACY_SETTINGS_KEY) ?? 'null');

    return normalizeSettings(legacySettings ?? {});
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveGameSettings(settings) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    saveSettings(settings);
  } catch {
    return;
  }

  applyAudioSettings(settings);
  window.dispatchEvent(new CustomEvent('cr2-audio-settings-change'));
  window.dispatchEvent(new CustomEvent('cr2-settings-change'));
}

export function getAudioSettings() {
  return getGameSettings();
}

export function saveAudioSettings(settings) {
  saveGameSettings(settings);
}

export function playBGM(key, volume = 1) {
  if (typeof Audio === 'undefined' || !bgmEnabled) {
    return null;
  }

  ensureUnlockListeners();

  const src = BGM_FILES[key] ?? BGM_FILES.main;

  if (currentBgm && currentBgmKey === key) {
    currentBgm.volume = clamp01(volume) * bgmVolume;
    void currentBgm.play().catch(() => {
      pendingBgm = { key, volume };
    });
    return currentBgm;
  }

  stopBGM(true);
  currentBgm = new Audio(src);
  currentBgm.loop = true;
  currentBgm.volume = 0;
  currentBgmKey = key;
  pendingBgm = { key, volume };
  void currentBgm.play().then(() => {
    pendingBgm = null;
  }).catch(() => {});
  fadeAudio(currentBgm, clamp01(volume) * bgmVolume, 400);

  return currentBgm;
}

export function stopBGM(fadeOut = true) {
  if (!currentBgm) {
    return;
  }

  const bgm = currentBgm;
  currentBgm = null;
  currentBgmKey = null;

  if (fadeOut) {
    fadeAudio(bgm, 0, 300, () => {
      bgm.pause();
      bgm.currentTime = 0;
    });
    return;
  }

  bgm.pause();
  bgm.currentTime = 0;
}

export function setBGMVolume(volume) {
  bgmVolume = clamp01(volume);

  if (currentBgm) {
    currentBgm.volume = bgmVolume;
  }
}

export function playSFX(key, volume = 1) {
  if (typeof Audio === 'undefined' || !sfxEnabled) {
    return null;
  }

  const src = SFX_FILES[key];

  if (!src) {
    return null;
  }

  const audio = new Audio(src);
  audio.volume = clamp01(volume) * sfxVolume;
  void audio.play().catch(() => {});

  return audio;
}

export function setSFXVolume(volume) {
  sfxVolume = clamp01(volume);
}

export function applyAudioSettings(settings = getGameSettings()) {
  const master = clampVolumePercent(settings.masterVolume);

  bgmEnabled = settings.bgmEnabled ?? settings.bgmOn ?? true;
  sfxEnabled = settings.sfxEnabled ?? settings.sfxOn ?? true;
  setBGMVolume(master * clampVolumePercent(settings.bgmVolume));
  setSFXVolume(master * clampVolumePercent(settings.sfxVolume));

  if (!bgmEnabled) {
    stopBGM(true);
  }
}

export function onPhaseChange(newPhase) {
  return playBGM(newPhase);
}

function fadeAudio(audio, targetVolume, duration, onDone = null) {
  const startVolume = audio.volume;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    audio.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    onDone?.();
  }

  requestAnimationFrame(tick);
}

function clampVolumePercent(value) {
  return Math.max(0, Math.min(1, (Number(value) || 0) / 100));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function ensureUnlockListeners() {
  if (unlockListenersInstalled || typeof window === 'undefined') {
    return;
  }

  unlockListenersInstalled = true;

  function retryPendingBgm() {
    if (!pendingBgm) {
      return;
    }

    const { key, volume } = pendingBgm;
    pendingBgm = null;
    playBGM(key, volume);
  }

  window.addEventListener('pointerdown', retryPendingBgm);
  window.addEventListener('keydown', retryPendingBgm);
}
