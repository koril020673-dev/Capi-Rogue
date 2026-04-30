const SETTINGS_KEY = 'capirogue-settings-v1';
const DEFAULT_SETTINGS = Object.freeze({
  bgmVolume: 70,
  sfxEnabled: true,
});

export function getAudioSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? '{}'),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAudioSettings(settings) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    ...DEFAULT_SETTINGS,
    ...settings,
  }));
  window.dispatchEvent(new CustomEvent('cr2-audio-settings-change'));
}
