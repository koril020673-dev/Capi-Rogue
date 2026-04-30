import { useEffect, useState } from 'react';
import { getAudioSettings, saveAudioSettings } from '../../logic/audioEngine';

export default function GameSettings() {
  const [settings, setSettings] = useState(() => getAudioSettings());

  useEffect(() => {
    saveAudioSettings(settings);
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
