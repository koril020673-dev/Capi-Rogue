export const SETTINGS_KEY = 'cr2_settings';

export const DEFAULT_SETTINGS = Object.freeze({
  language: 'ko',
  tutorial: true,
  autoSaveAlert: true,
  economyHint: true,
  strategyWarning: true,
  masterVolume: 50,
  bgmVolume: 100,
  sfxVolume: 100,
  bgmOn: true,
  sfxOn: true,
  background: true,
  screenShake: true,
  marketingLimitMode: 'ratio',
  tutorialEnabled: true,
  autosaveNoticeEnabled: true,
  economyTermHintsEnabled: true,
  strategyWarningsEnabled: true,
  bgmEnabled: true,
  sfxEnabled: true,
  backgroundEnabled: true,
  screenShakeEnabled: true,
});

export function loadSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const saved = window.localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    return normalizeSettings(JSON.parse(saved));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
  } catch {
    console.error('설정 저장 실패');
  }
}

export function updateSetting(key, value) {
  const current = loadSettings();
  const updated = normalizeSettings({ ...current, [key]: value });

  saveSettings(updated);

  return updated;
}

export function resetSettings() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SETTINGS_KEY);
  }

  return DEFAULT_SETTINGS;
}

export function normalizeSettings(settings = {}) {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };
  const normalized = {
    ...merged,
    masterVolume: normalizeVolume(merged.masterVolume),
    bgmVolume: normalizeVolume(merged.bgmVolume),
    sfxVolume: normalizeVolume(merged.sfxVolume),
    language: merged.language === 'en' ? 'en' : 'ko',
    marketingLimitMode: merged.marketingLimitMode === 'fixed' ? 'fixed' : 'ratio',
  };

  normalized.tutorialEnabled = merged.tutorialEnabled ?? merged.tutorial ?? true;
  normalized.autosaveNoticeEnabled = merged.autosaveNoticeEnabled ?? merged.autoSaveAlert ?? true;
  normalized.economyTermHintsEnabled = merged.economyTermHintsEnabled ?? merged.economyHint ?? true;
  normalized.strategyWarningsEnabled = merged.strategyWarningsEnabled ?? merged.strategyWarning ?? true;
  normalized.bgmEnabled = merged.bgmEnabled ?? merged.bgmOn ?? true;
  normalized.sfxEnabled = merged.sfxEnabled ?? merged.sfxOn ?? true;
  normalized.backgroundEnabled = merged.backgroundEnabled ?? merged.background ?? true;
  normalized.screenShakeEnabled = merged.screenShakeEnabled ?? merged.screenShake ?? true;
  normalized.tutorial = normalized.tutorialEnabled;
  normalized.autoSaveAlert = normalized.autosaveNoticeEnabled;
  normalized.economyHint = normalized.economyTermHintsEnabled;
  normalized.strategyWarning = normalized.strategyWarningsEnabled;
  normalized.bgmOn = normalized.bgmEnabled;
  normalized.sfxOn = normalized.sfxEnabled;
  normalized.background = normalized.backgroundEnabled;
  normalized.screenShake = normalized.screenShakeEnabled;

  return Object.freeze(normalized);
}

function normalizeVolume(value) {
  const number = Math.round((Number(value) || 0) / 10) * 10;

  return Math.max(0, Math.min(100, number));
}
