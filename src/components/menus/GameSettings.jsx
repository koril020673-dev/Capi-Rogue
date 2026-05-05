import { useEffect, useMemo, useState } from 'react';
import { getGameSettings, saveGameSettings } from '../../logic/audioEngine';
import { useGameStore } from '../../store/useGameStore';

const TABS = Object.freeze([
  Object.freeze({ id: 'general', label: '일반' }),
  Object.freeze({ id: 'audio', label: '오디오' }),
  Object.freeze({ id: 'display', label: '디스플레이' }),
]);

export default function GameSettings({ onBack }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [selectedRow, setSelectedRow] = useState(0);
  const [settings, setLocalSettings] = useState(() => getGameSettings());
  const setTutorialEnabled = useGameStore((state) => state.setTutorialEnabled);
  const resetTutorials = useGameStore((state) => state.resetTutorials);
  const setStoreSettings = useGameStore((state) => state.setSettings);
  const rows = useMemo(() => getRows(activeTab), [activeTab]);

  useEffect(() => {
    saveGameSettings(settings);
    setStoreSettings(settings);
  }, [settings, setStoreSettings]);

  useEffect(() => {
    setSelectedRow(0);
  }, [activeTab]);

  function updateSetting(key, value) {
    setLocalSettings((current) => ({
      ...current,
      [key]: value,
    }));

    if (key === 'tutorialEnabled') {
      setTutorialEnabled(value);
    }
  }

  function activateRow(row) {
    if (row.type === 'toggle') {
      updateSetting(row.key, !settings[row.key]);
      return;
    }

    if (row.type === 'language') {
      updateSetting(row.key, settings[row.key] === 'ko' ? 'en' : 'ko');
      return;
    }

    if (row.type === 'resetTutorials') {
      resetTutorials();
    }
  }

  function stepVolume(key, direction) {
    updateSetting(key, clampVolume(settings[key] + direction * 10));
  }

  function handleRowKeyDown(event, row) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedRow((index) => Math.min(rows.length - 1, index + 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedRow((index) => Math.max(0, index - 1));
      return;
    }

    if (row.type === 'volume' && event.key === 'ArrowLeft') {
      event.preventDefault();
      stepVolume(row.key, -1);
      return;
    }

    if (row.type === 'volume' && event.key === 'ArrowRight') {
      event.preventDefault();
      stepVolume(row.key, 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateRow(row);
    }
  }

  return (
    <div className="cr2-settings-panel">
      <div className="cr2-settings-tabs" role="tablist" aria-label="게임 설정">
        {TABS.map((tab) => (
          <button
            className={tab.id === activeTab ? 'cr2-settings-tab cr2-settings-tab--active' : 'cr2-settings-tab'}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="cr2-settings-list">
        {rows.map((row, index) => (
          <article
            className={index === selectedRow ? 'cr2-settings-row cr2-settings-row--selected' : 'cr2-settings-row'}
            key={row.key}
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedRow(index);
              activateRow(row);
            }}
            onKeyDown={(event) => handleRowKeyDown(event, row)}
          >
            <span className="cr2-settings-name">{row.label}</span>
            <SettingValue row={row} settings={settings} onUpdate={updateSetting} />
          </article>
        ))}
      </section>

      {activeTab === 'display' ? (
        <p className="cr2-settings-note">배경화면을 끄면 성능이 향상됩니다.</p>
      ) : null}

      <button className="cr2-settings-back" type="button" onClick={onBack}>
        뒤로가기
      </button>
    </div>
  );
}

function SettingValue({ row, settings, onUpdate }) {
  if (row.type === 'language') {
    return <strong className="cr2-settings-current">{settings[row.key] === 'ko' ? '한국어' : 'English'}</strong>;
  }

  if (row.type === 'toggle') {
    return <strong className="cr2-settings-current">{settings[row.key] ? 'ON' : 'OFF'}</strong>;
  }

  if (row.type === 'resetTutorials') {
    return <strong className="cr2-settings-current">RESET</strong>;
  }

  if (row.type === 'volume') {
    const value = clampVolume(settings[row.key]);

    return (
      <div
        className="cr2-settings-slider"
        style={{ '--cr2-volume-percent': `${value}%` }}
        onClick={(event) => event.stopPropagation()}
      >
        <strong className="cr2-settings-slider-value">{formatVolume(value)}</strong>
        <input
          aria-label={row.label}
          max="100"
          min="0"
          step="1"
          type="range"
          value={value}
          onChange={(event) => onUpdate(row.key, clampVolume(event.target.value))}
        />
      </div>
    );
  }

  return null;
}

function getRows(tabId) {
  if (tabId === 'audio') {
    return [
      { key: 'masterVolume', label: '마스터 볼륨', type: 'volume' },
      { key: 'bgmVolume', label: 'BGM 볼륨', type: 'volume' },
      { key: 'sfxVolume', label: '효과음 볼륨', type: 'volume' },
      { key: 'bgmEnabled', label: 'BGM', type: 'toggle' },
      { key: 'sfxEnabled', label: '효과음', type: 'toggle' },
    ];
  }

  if (tabId === 'display') {
    return [
      { key: 'backgroundEnabled', label: '배경화면', type: 'toggle' },
      { key: 'screenShakeEnabled', label: '화면 흔들림 효과', type: 'toggle' },
    ];
  }

  return [
    { key: 'language', label: '언어', type: 'language' },
    { key: 'tutorialEnabled', label: '튜토리얼', type: 'toggle' },
    { key: 'resetTutorials', label: '튜토리얼 초기화', type: 'resetTutorials' },
    { key: 'autosaveNoticeEnabled', label: '자동저장 알림', type: 'toggle' },
    { key: 'economyTermHintsEnabled', label: '경제 용어 힌트', type: 'toggle' },
    { key: 'strategyWarningsEnabled', label: '전략 경고 메시지', type: 'toggle' },
  ];
}

function clampVolume(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function formatVolume(value) {
  return value === 0 ? '음소거' : `${value}`;
}
