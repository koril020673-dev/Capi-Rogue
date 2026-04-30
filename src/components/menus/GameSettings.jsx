import { useEffect, useMemo, useState } from 'react';
import { getGameSettings, saveGameSettings } from '../../logic/audioEngine';

const TABS = Object.freeze([
  Object.freeze({ id: 'general', label: '일반' }),
  Object.freeze({ id: 'audio', label: '오디오' }),
  Object.freeze({ id: 'display', label: '디스플레이' }),
]);

const VOLUME_VALUES = Object.freeze([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

export default function GameSettings({ onBack }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [selectedRow, setSelectedRow] = useState(0);
  const [settings, setSettings] = useState(() => getGameSettings());
  const rows = useMemo(() => getRows(activeTab), [activeTab]);

  useEffect(() => {
    saveGameSettings(settings);
  }, [settings]);

  useEffect(() => {
    setSelectedRow(0);
  }, [activeTab]);

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function activateRow(row) {
    if (row.type === 'toggle') {
      updateSetting(row.key, !settings[row.key]);
    }

    if (row.type === 'language') {
      updateSetting(row.key, settings[row.key] === 'ko' ? 'en' : 'ko');
    }
  }

  function stepVolume(key, direction) {
    const currentIndex = Math.max(0, VOLUME_VALUES.indexOf(settings[key]));
    const nextIndex = Math.max(0, Math.min(VOLUME_VALUES.length - 1, currentIndex + direction));

    updateSetting(key, VOLUME_VALUES[nextIndex]);
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
            <SettingValue
              row={row}
              settings={settings}
              onStepVolume={stepVolume}
              onUpdate={updateSetting}
            />
          </article>
        ))}
      </section>

      {activeTab === 'display' ? (
        <p className="cr2-settings-note">배경화면을 끄면 성능이 향상됩니다</p>
      ) : null}

      <button className="cr2-settings-back" type="button" onClick={onBack}>
        뒤로가기
      </button>
    </div>
  );
}

function SettingValue({ row, settings, onStepVolume, onUpdate }) {
  if (row.type === 'language') {
    return <strong className="cr2-settings-current">{settings[row.key] === 'ko' ? '한국어' : 'English'}</strong>;
  }

  if (row.type === 'toggle') {
    return <strong className="cr2-settings-current">{settings[row.key] ? 'ON' : 'OFF'}</strong>;
  }

  if (row.type === 'volume') {
    return (
      <div className="cr2-settings-volume" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => onStepVolume(row.key, -1)}>◀</button>
        {VOLUME_VALUES.map((value) => (
          <button
            className={settings[row.key] === value ? 'cr2-settings-volume-option cr2-settings-volume-option--active' : 'cr2-settings-volume-option'}
            key={value}
            type="button"
            onClick={() => onUpdate(row.key, value)}
          >
            {formatVolume(value)}
          </button>
        ))}
        <button type="button" onClick={() => onStepVolume(row.key, 1)}>▶</button>
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
    { key: 'autosaveNoticeEnabled', label: '자동저장 알림', type: 'toggle' },
    { key: 'economyTermHintsEnabled', label: '경제 용어 힌트', type: 'toggle' },
    { key: 'strategyWarningsEnabled', label: '전략 경고 메시지', type: 'toggle' },
  ];
}

function formatVolume(value) {
  return value === 0 ? '음소거' : String(value);
}
