import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  normalizeSettings,
  saveSettings,
} from './settingsEngine';

const LEGACY_SETTINGS_KEY = 'capirogue-settings-v1';

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

  window.dispatchEvent(new CustomEvent('cr2-audio-settings-change'));
  window.dispatchEvent(new CustomEvent('cr2-settings-change'));
}

export function getAudioSettings() {
  return getGameSettings();
}

export function saveAudioSettings(settings) {
  saveGameSettings(settings);
}
