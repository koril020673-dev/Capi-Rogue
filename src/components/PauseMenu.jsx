import { useMemo, useState } from 'react';
import { createSaveSnapshot, saveGameToLocalStorage } from '../logic/saveEngine';
import { useGameStore } from '../store/useGameStore';
import AdvisorInfo from './menus/AdvisorInfo';
import EconomyDictionary from './menus/EconomyDictionary';
import GameSettings from './menus/GameSettings';
import PlayRecord from './menus/PlayRecord';
import RivalDex from './menus/RivalDex';

const MENU_ITEMS = Object.freeze([
  Object.freeze({ id: 'settings', label: '게임 설정' }),
  Object.freeze({ id: 'record', label: '플레이 기록' }),
  Object.freeze({ id: 'dictionary', label: '경제 용어 사전' }),
  Object.freeze({ id: 'advisor', label: '어드바이저 정보' }),
  Object.freeze({ id: 'rivals', label: '라이벌 도감' }),
]);

const CONTENT = Object.freeze({
  settings: GameSettings,
  record: PlayRecord,
  dictionary: EconomyDictionary,
  advisor: AdvisorInfo,
  rivals: RivalDex,
});

export default function PauseMenu() {
  const isPaused = useGameStore((state) => state.isPaused);
  const floor = useGameStore((state) => state.floor);
  const setPaused = useGameStore((state) => state.setPaused);
  const saveAndExit = useGameStore((state) => state.saveAndExit);
  const logout = useGameStore((state) => state.logout);
  const [activeMenuId, setActiveMenuId] = useState(MENU_ITEMS[0].id);
  const ActivePanel = useMemo(() => CONTENT[activeMenuId] ?? GameSettings, [activeMenuId]);

  if (!isPaused) {
    return null;
  }

  async function handleSaveAndExit() {
    await saveAndExit();
  }

  function handleLogout() {
    const snapshot = createSaveSnapshot(useGameStore.getState());

    saveGameToLocalStorage(snapshot);
    logout();
  }

  return (
    <aside className="cr2-pause-overlay" aria-modal="true" role="dialog">
      <section className="cr2-pause-shell">
        <nav className="cr2-pause-panel" aria-label="Pause menu">
          <div className="cr2-pause-head">
            <div>
              <strong>CapiRogue</strong>
              <span>Floor {floor}</span>
            </div>
            <button className="cr2-pause-close" type="button" onClick={() => setPaused(false)}>
              X
            </button>
          </div>

          <div className="cr2-pause-menu-list">
            {MENU_ITEMS.map((item) => (
              <button
                className={item.id === activeMenuId ? 'cr2-pause-menu-item cr2-pause-menu-item--active' : 'cr2-pause-menu-item'}
                key={item.id}
                type="button"
                onClick={() => setActiveMenuId(item.id)}
              >
                <span>{item.id === activeMenuId ? '>' : ''}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>

          <div className="cr2-pause-danger-list">
            <button type="button" onClick={handleSaveAndExit}>저장 후 나가기</button>
            <button type="button" onClick={handleLogout}>로그아웃</button>
          </div>
        </nav>

        <section className="cr2-pause-content">
          <ActivePanel onBack={() => setActiveMenuId('record')} />
        </section>
      </section>
    </aside>
  );
}
