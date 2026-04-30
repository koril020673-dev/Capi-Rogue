import { useMemo, useState } from 'react';
import {
  createSaveSnapshot,
  getAllSlots,
  loadSaveSlotsFromLocalStorage,
  saveGameToLocalStorage,
} from '../logic/saveEngine';
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
  const playerId = useGameStore((state) => state.playerId);
  const currentSlot = useGameStore((state) => state.currentSlot);
  const setPaused = useGameStore((state) => state.setPaused);
  const saveAndExit = useGameStore((state) => state.saveAndExit);
  const logout = useGameStore((state) => state.logout);
  const [activeMenuId, setActiveMenuId] = useState(MENU_ITEMS[0].id);
  const [isSlotPickerOpen, setSlotPickerOpen] = useState(false);
  const [saveSlots, setSaveSlots] = useState(() => normalizeLocalSlots(loadSaveSlotsFromLocalStorage()));
  const ActivePanel = useMemo(() => CONTENT[activeMenuId] ?? GameSettings, [activeMenuId]);

  if (!isPaused) {
    return null;
  }

  async function openSaveSlotPicker() {
    setSaveSlots(await loadSlots(playerId));
    setSlotPickerOpen(true);
  }

  async function handleSaveAndExit(slotNumber) {
    await saveAndExit(slotNumber);
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
            <button type="button" onClick={openSaveSlotPicker}>저장 후 나가기</button>
            <button type="button" onClick={handleLogout}>로그아웃</button>
          </div>
        </nav>

        <section className="cr2-pause-content">
          <ActivePanel onBack={() => setActiveMenuId('record')} />
        </section>
        {isSlotPickerOpen ? (
          <section className="cr2-save-slot-picker" role="dialog" aria-modal="true" aria-label="저장 슬롯 선택">
            <header>
              <h2>저장 슬롯 선택</h2>
              <button type="button" onClick={() => setSlotPickerOpen(false)}>X</button>
            </header>
            <div className="cr2-save-slot-list">
              {saveSlots.map((slot) => (
                <button
                  className={slot.slotNumber === currentSlot ? 'cr2-save-slot-card cr2-save-slot-card--current' : 'cr2-save-slot-card'}
                  key={slot.slotNumber}
                  type="button"
                  onClick={() => handleSaveAndExit(slot.slotNumber)}
                >
                  <SlotPortrait snapshot={slot.snapshot} />
                  <span>SLOT {slot.slotNumber}</span>
                  {slot.snapshot ? (
                    <div>
                      <strong>{getSlotTitle(slot.snapshot)}</strong>
                      <small>{getSlotMeta(slot.snapshot, slot.updatedAt)}</small>
                    </div>
                  ) : (
                    <div>
                      <strong>빈 슬롯</strong>
                      <small>여기에 저장</small>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </aside>
  );
}

async function loadSlots(playerId) {
  if (playerId) {
    const remoteSlots = await getAllSlots();

    if (remoteSlots) {
      return remoteSlots.map((slot) => Object.freeze({
        slotNumber: slot.slotNumber,
        snapshot: slot.data,
        updatedAt: slot.updatedAt,
      }));
    }
  }

  return normalizeLocalSlots(loadSaveSlotsFromLocalStorage());
}

function normalizeLocalSlots(slots) {
  return slots.map((slot) => Object.freeze({
    slotNumber: slot.id,
    snapshot: slot.snapshot,
    updatedAt: slot.snapshot?.savedAt ?? null,
  }));
}

function SlotPortrait({ snapshot }) {
  const image = snapshot?.playerProfile?.profileImage ?? snapshot?.playerProfile?.fullImage;

  if (!image) {
    return <span className="cr2-save-slot-portrait cr2-save-slot-portrait--empty" />;
  }

  return (
    <span className="cr2-save-slot-portrait">
      <img src={image} alt="" decoding="async" loading="lazy" />
    </span>
  );
}

function getSlotTitle(snapshot) {
  const companyName = snapshot.playerProfile?.companyName || snapshot.player?.companyName || '내 회사';
  const advisorName = snapshot.selectedAdvisor?.name ?? snapshot.selectedAdvisorId ?? '-';

  return `${companyName} / ${advisorName}`;
}

function getSlotMeta(snapshot, updatedAt) {
  const floorText = snapshot.floor ? `${snapshot.floor}층` : '-';
  const capitalText = Number.isFinite(snapshot.player?.capital)
    ? `${Math.round(snapshot.player.capital / 10000).toLocaleString()}만`
    : '-';
  const savedAt = updatedAt || snapshot.savedAt;
  const savedAtText = savedAt ? new Date(savedAt).toLocaleString('ko-KR') : '저장 시간 없음';

  return `${floorText} / ${capitalText} / ${savedAtText}`;
}
