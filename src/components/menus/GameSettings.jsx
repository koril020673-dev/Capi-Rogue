import { useEffect, useState } from 'react';

const SETTINGS_KEY = 'capirogue-settings-v1';
const DEFAULT_SETTINGS = Object.freeze({
  bgmVolume: 70,
  sfxEnabled: true,
});

export default function GameSettings() {
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="cr2-pause-section">
      <h2>게임 설정</h2>
      <label className="cr2-pause-control">
        <span>BGM 음량</span>
        <input
          max="100"
          min="0"
          type="range"
          value={settings.bgmVolume}
          onChange={(event) => setSettings((current) => ({
            ...current,
            bgmVolume: Number(event.target.value),
          }))}
        />
        <strong>{settings.bgmVolume}</strong>
      </label>
      <label className="cr2-pause-toggle">
        <span>효과음</span>
        <input
          checked={settings.sfxEnabled}
          type="checkbox"
          onChange={(event) => setSettings((current) => ({
            ...current,
            sfxEnabled: event.target.checked,
          }))}
        />
      </label>
    </div>
  );
}

function loadSettings() {
  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? '{}'),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
