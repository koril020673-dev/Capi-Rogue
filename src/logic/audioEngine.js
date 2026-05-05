export const SETTINGS_KEY = 'cr2_settings';
const LEGACY_SETTINGS_KEY = 'capirogue-settings-v1';

export const DEFAULT_SETTINGS = Object.freeze({
  language: 'ko',
  tutorialEnabled: true,
  autosaveNoticeEnabled: true,
  economyTermHintsEnabled: true,
  strategyWarningsEnabled: true,
  masterVolume: 50,
  bgmVolume: 100,
  sfxVolume: 100,
  bgmEnabled: true,
  sfxEnabled: true,
  backgroundEnabled: true,
  screenShakeEnabled: true,
  marketingLimitMode: 'ratio',
});

export function getGameSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const storedSettings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? 'null');

    if (storedSettings) {
      return normalizeSettings(storedSettings);
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
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
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

function normalizeSettings(settings = {}) {
  return Object.freeze({
    ...DEFAULT_SETTINGS,
    ...settings,
    masterVolume: normalizeVolume(settings.masterVolume ?? DEFAULT_SETTINGS.masterVolume),
    bgmVolume: normalizeVolume(settings.bgmVolume ?? DEFAULT_SETTINGS.bgmVolume),
    sfxVolume: normalizeVolume(settings.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
    language: settings.language === 'en' ? 'en' : 'ko',
    tutorialEnabled: settings.tutorialEnabled !== false,
    autosaveNoticeEnabled: settings.autosaveNoticeEnabled !== false,
    economyTermHintsEnabled: settings.economyTermHintsEnabled !== false,
    strategyWarningsEnabled: settings.strategyWarningsEnabled !== false,
    bgmEnabled: settings.bgmEnabled !== false,
    sfxEnabled: settings.sfxEnabled !== false,
    backgroundEnabled: settings.backgroundEnabled !== false,
    screenShakeEnabled: settings.screenShakeEnabled !== false,
    marketingLimitMode: settings.marketingLimitMode === 'fixed' ? 'fixed' : 'ratio',
  });
}

function normalizeVolume(value) {
  const number = Math.round((Number(value) || 0) / 10) * 10;

  return Math.max(0, Math.min(100, number));
}
