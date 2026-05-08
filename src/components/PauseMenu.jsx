import { useMemo, useState } from 'react';
import {
  createSaveSnapshot,
  saveGameToLocalStorage,
} from '../logic/saveEngine';
import { useGameStore } from '../store/useGameStore';
import AchievementScreen from '../screens/AchievementScreen';
import AdvisorInfo from './menus/AdvisorInfo';
import EconomyDictionary from './menus/EconomyDictionary';
import GameSettings from './menus/GameSettings';
import PlayRecord from './menus/PlayRecord';
import RivalDex from './menus/RivalDex';

const MENU_ITEMS = Object.freeze([
  Object.freeze({ id: 'settings', label: '\uAC8C\uC784 \uC124\uC815' }),
  Object.freeze({ id: 'record', label: '\uD50C\uB808\uC774 \uAE30\uB85D' }),
  Object.freeze({ id: 'achievements', label: '\uC5C5\uC801' }),
  Object.freeze({ id: 'dictionary', label: '\uACBD\uC81C \uC6A9\uC5B4 \uC0AC\uC804' }),
  Object.freeze({ id: 'advisor', label: '\uC5B4\uB4DC\uBC14\uC774\uC800 \uC815\uBCF4' }),
  Object.freeze({ id: 'rivals', label: '\uB77C\uC774\uBC8C \uB3C4\uAC10' }),
]);

const CONTENT = Object.freeze({
  settings: GameSettings,
  record: PlayRecord,
  achievements: AchievementScreen,
  dictionary: EconomyDictionary,
  advisor: AdvisorInfo,
  rivals: RivalDex,
});

export default function PauseMenu() {
  const isPaused = useGameStore((state) => state.isPaused);
  const floor = useGameStore((state) => state.floor);
  const currentSlot = useGameStore((state) => state.currentSlot);
  const setPaused = useGameStore((state) => state.setPaused);
  const saveAndExit = useGameStore((state) => state.saveAndExit);
  const logout = useGameStore((state) => state.logout);
  const [activeMenuId, setActiveMenuId] = useState(MENU_ITEMS[0].id);
  const [isSaving, setSaving] = useState(false);
  const ActivePanel = useMemo(() => CONTENT[activeMenuId] ?? GameSettings, [activeMenuId]);

  if (!isPaused) {
    return null;
  }

  async function handleSaveAndExit() {
    setSaving(true);

    try {
      await saveAndExit(currentSlot);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    const snapshot = createSaveSnapshot(useGameStore.getState());

    saveGameToLocalStorage(snapshot);
    logout();
  }

  return (
    <aside className="cr2-pause-overlay" aria-modal="true" role="dialog">
      <section className="cr2-pause-shell">
        <nav className="cr2-pause-panel" aria-label="\uC77C\uC2DC\uC815\uC9C0 \uBA54\uB274">
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
            <button disabled={isSaving} type="button" onClick={handleSaveAndExit}>
              {isSaving ? '\uC800\uC7A5 \uC911...' : `\uC2AC\uB86F ${currentSlot}\uC5D0 \uC800\uC7A5 \uD6C4 \uB098\uAC00\uAE30`}
            </button>
            <button type="button" onClick={handleLogout}>\uB85C\uADF8\uC544\uC6C3</button>
          </div>
        </nav>

        <section className="cr2-pause-content">
          <ActivePanel onBack={() => setActiveMenuId('settings')} />
        </section>
      </section>
    </aside>
  );
}
