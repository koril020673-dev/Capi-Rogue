import { useEffect, useState } from 'react';
import {
  getAllSlots,
  loadSaveSlotsFromLocalStorage,
} from '../logic/saveEngine';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';
import femaleAProfile from '../assets/optimized/player/player_female_a_profile.png';
import femaleBProfile from '../assets/optimized/player/player_female_b_profile.png';
import maleAProfile from '../assets/optimized/player/player_male_a_profile.png';
import maleBProfile from '../assets/optimized/player/player_male_b_profile.png';
import '../styles/slotSelect.css';

const PLAYER_PROFILE_IMAGES = Object.freeze({
  female_a: femaleAProfile,
  female_b: femaleBProfile,
  male_a: maleAProfile,
  male_b: maleBProfile,
});

const TEXT = Object.freeze({
  title: '저장 슬롯을 선택하세요',
  back: '뒤로가기',
  empty: '비어있음',
  saved: '저장됨',
  overwriteTitle: '슬롯 덮어쓰기',
  overwriteMessage: '이 슬롯에 저장된 데이터가 있습니다. 덮어쓸까요?',
  confirm: '확인',
  cancel: '취소',
  floor: 'Floor',
  company: '회사',
  advisor: '어드바이저',
  capital: '자본',
  savedAt: '저장일시',
  noDate: '-',
});

export default function SlotSelectScreen() {
  const playerId = useGameStore((state) => state.playerId);
  const setCurrentSlot = useGameStore((state) => state.setCurrentSlot);
  const [slots, setSlots] = useState(() => normalizeLocalSlots(loadSaveSlotsFromLocalStorage()));
  const [pendingSlot, setPendingSlot] = useState(null);

  useEffect(() => {
    loadSlots();
  }, [playerId]);

  async function loadSlots() {
    const remoteSlots = await getAllSlots();

    if (remoteSlots) {
      setSlots(normalizeRemoteSlots(remoteSlots));
      return;
    }

    setSlots(normalizeLocalSlots(loadSaveSlotsFromLocalStorage()));
  }

  function selectSlot(slot) {
    if (slot.snapshot) {
      setPendingSlot(slot);
      return;
    }

    startWithSlot(slot.slotNumber);
  }

  function startWithSlot(slotNumber) {
    setCurrentSlot(slotNumber);
    useGameStore.setState({ screen: SCREEN_IDS.CHARACTER_CREATE });
  }

  return (
    <main className="cr2-slot-select-screen">
      <section className="cr2-slot-select-panel">
        <header className="cr2-slot-select-head">
          <h1>{TEXT.title}</h1>
        </header>

        <div className="cr2-slot-select-list">
          {slots.map((slot) => (
            <button
              className={slot.snapshot ? 'cr2-slot-card cr2-slot-card--saved' : 'cr2-slot-card cr2-slot-card--empty'}
              key={slot.slotNumber}
              type="button"
              onClick={() => selectSlot(slot)}
            >
              <span className="cr2-slot-card-index">SLOT {slot.slotNumber}</span>
              <SlotPortrait snapshot={slot.snapshot} />
              <SlotSummary snapshot={slot.snapshot} updatedAt={slot.updatedAt} />
            </button>
          ))}
        </div>

        <button
          className="cr2-slot-back-button"
          type="button"
          onClick={() => useGameStore.setState({ screen: SCREEN_IDS.TITLE })}
        >
          {TEXT.back}
        </button>
      </section>

      {pendingSlot ? (
        <section className="cr2-slot-confirm" role="dialog" aria-modal="true" aria-label={TEXT.overwriteTitle}>
          <div className="cr2-slot-confirm-box">
            <h2>{TEXT.overwriteTitle}</h2>
            <p>{TEXT.overwriteMessage}</p>
            <div>
              <button type="button" onClick={() => startWithSlot(pendingSlot.slotNumber)}>
                {TEXT.confirm}
              </button>
              <button type="button" onClick={() => setPendingSlot(null)}>
                {TEXT.cancel}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function SlotPortrait({ snapshot }) {
  const image =
    PLAYER_PROFILE_IMAGES[snapshot?.playerProfile?.profileId] ??
    snapshot?.playerProfile?.profileImage ??
    snapshot?.playerProfile?.fullImage;

  if (!image) {
    return <span className="cr2-slot-portrait cr2-slot-portrait--empty" />;
  }

  return (
    <span className="cr2-slot-portrait">
      <img src={image} alt="" decoding="async" loading="lazy" />
    </span>
  );
}

function SlotSummary({ snapshot, updatedAt }) {
  if (!snapshot) {
    return (
      <span className="cr2-slot-summary cr2-slot-summary--empty">
        <strong>{TEXT.empty}</strong>
        <small>새 게임을 이 슬롯에 저장합니다.</small>
      </span>
    );
  }

  return (
    <span className="cr2-slot-summary">
      <strong>{TEXT.floor} {snapshot.floor ?? 1} {TEXT.saved}</strong>
      <span>{TEXT.company}: {snapshot.playerProfile?.companyName || snapshot.player?.companyName || '-'}</span>
      <span>{TEXT.advisor}: {snapshot.selectedAdvisor?.name || snapshot.selectedAdvisorId || '-'}</span>
      <span>{TEXT.capital}: {formatWon(snapshot.player?.capital ?? 0)}</span>
      <small>{TEXT.savedAt}: {formatSavedAt(updatedAt || snapshot.savedAt)}</small>
    </span>
  );
}

function normalizeRemoteSlots(slots) {
  return slots.map((slot) => Object.freeze({
    slotNumber: slot.slotNumber,
    snapshot: slot.data,
    updatedAt: slot.updatedAt,
  }));
}

function normalizeLocalSlots(slots) {
  return slots.map((slot) => Object.freeze({
    slotNumber: slot.id,
    snapshot: slot.snapshot,
    updatedAt: slot.snapshot?.savedAt ?? null,
  }));
}

function formatSavedAt(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return TEXT.noDate;
  }

  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
