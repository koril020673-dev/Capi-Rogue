import { useEffect, useMemo, useState } from 'react';
import GameSettings from '../components/menus/GameSettings';
import { ECONOMIC_PHASES } from '../constants/economy';
import {
  getAllSlots,
  loadGame,
  loadSaveSlotsFromLocalStorage,
} from '../logic/saveEngine';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import logoImage from '../assets/optimized/logo/logo_image.png';
import boomImage from '../assets/optimized/bg_phase_pack/bg_phase_boom.jpg';
import contractionImage from '../assets/optimized/bg_phase_pack/bg_phase_contraction.jpg';
import growthImage from '../assets/optimized/bg_phase_pack/bg_phase_growth.jpg';
import recessionImage from '../assets/optimized/bg_phase_pack/bg_phase_recession.jpg';
import stableImage from '../assets/optimized/bg_phase_pack/bg_phase_stable.jpg';
import '../styles/title.css';

const PHASE_BACKGROUNDS = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: boomImage,
  [ECONOMIC_PHASES.GROWTH]: growthImage,
  [ECONOMIC_PHASES.STABLE]: stableImage,
  [ECONOMIC_PHASES.CONTRACTION]: contractionImage,
  [ECONOMIC_PHASES.RECESSION]: recessionImage,
});

const TEXT = Object.freeze({
  version: 'v0.1.0',
  tagline: '시장을 지배하라',
  guest: '게스트 모드',
  continue: '계속하기',
  newGame: '새 게임',
  records: '플레이 기록',
  settings: '설정',
  loadSlots: '불러오기 슬롯',
  emptySlot: '빈 슬롯',
  noSave: '저장된 게임이 없습니다.',
  continueLoaded: '저장 데이터를 불러왔습니다.',
  loadFailed: '슬롯을 불러오지 못했습니다.',
  floor: '층',
  noSavedAt: '저장 시간 없음',
});

export default function TitleScreen() {
  const session = useGameStore((state) => state.session);
  const phase = useGameStore((state) => state.phase);
  const playerProfile = useGameStore((state) => state.playerProfile);
  const playerId = useGameStore((state) => state.playerId);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);
  const [saveSlots, setSaveSlots] = useState(() => normalizeLocalSlots(loadSaveSlotsFromLocalStorage()));
  const hasSavedGame = saveSlots.some((slot) => slot.snapshot);
  const menuItems = useMemo(
    () => [
      { id: 'continue', label: TEXT.continue, disabled: !hasSavedGame },
      { id: 'new-game', label: TEXT.newGame },
      { id: 'records', label: TEXT.records },
      { id: 'settings', label: TEXT.settings },
    ],
    [hasSavedGame],
  );
  const accountName = session.mode === 'guest' ? TEXT.guest : session.userId;
  const background = PHASE_BACKGROUNDS[phase] ?? PHASE_BACKGROUNDS[ECONOMIC_PHASES.STABLE];

  useEffect(() => {
    refreshSlots();
  }, [playerId]);

  useEffect(() => {
    if (menuItems[selectedIndex]?.disabled) {
      setSelectedIndex(findNextEnabled(menuItems, selectedIndex, 1));
    }
  }, [menuItems, selectedIndex]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (settingsOpen || slotOpen) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((index) => findNextEnabled(menuItems, index, 1));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((index) => findNextEnabled(menuItems, index, -1));
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        activateMenu(menuItems[selectedIndex]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuItems, selectedIndex, settingsOpen, slotOpen]);

  async function refreshSlots() {
    const remoteSlots = await getAllSlots();

    if (remoteSlots) {
      setSaveSlots(normalizeRemoteSlots(remoteSlots));
      return;
    }

    setSaveSlots(normalizeLocalSlots(loadSaveSlotsFromLocalStorage()));
  }

  async function activateMenu(item) {
    if (!item || item.disabled) {
      setNotice(TEXT.noSave);
      return;
    }

    if (item.id === 'continue') {
      await refreshSlots();
      setNotice('');
      setSlotOpen(true);
      return;
    }

    if (item.id === 'new-game') {
      useGameStore.setState({ screen: SCREEN_IDS.CHARACTER_CREATE });
      return;
    }

    if (item.id === 'records') {
      useGameStore.setState({ screen: SCREEN_IDS.RECORD });
      return;
    }

    if (item.id === 'settings') {
      setNotice('');
      setSettingsOpen(true);
    }
  }

  async function loadSlot(slot) {
    const savedGame = playerId
      ? await loadGame(slot.slotNumber)
      : slot.snapshot;

    if (!savedGame) {
      setNotice(TEXT.loadFailed);
      return;
    }

    const profile = savedGame.playerProfile ?? playerProfile;

    if (savedGame.floor && savedGame.player) {
      useGameStore.setState((state) => ({
        ...savedGame,
        session: state.session,
        playerId: state.playerId,
        currentSlot: slot.slotNumber,
        playerProfile: profile,
        isPaused: false,
        screen: savedGame.screen === SCREEN_IDS.REWARD ? SCREEN_IDS.REWARD : SCREEN_IDS.MAIN,
      }));
    } else {
      useGameStore.setState({
        currentSlot: slot.slotNumber,
        playerProfile: profile,
        screen: SCREEN_IDS.ADVISOR_SELECT,
      });
    }

    setSlotOpen(false);
    setNotice(TEXT.continueLoaded);
  }

  return (
    <main className="cr2-title-screen cr2-title-screen--new">
      <div className="cr2-title-backdrop" style={{ '--cr2-title-bg': `url(${background})` }} />
      <div className="cr2-title-account">{accountName}</div>

      <section className="cr2-title-logo-stack" aria-label="CapiRogue">
        <img src={logoImage} alt="CapiRogue" decoding="async" />
        <span>{TEXT.version}</span>
        <p>{TEXT.tagline}</p>
      </section>

      <nav className="cr2-title-menu-box" aria-label="Title menu">
        {menuItems.map((item, index) => (
          <button
            className={[
              'cr2-title-menu-item',
              index === selectedIndex ? 'cr2-title-menu-item--selected' : '',
              item.disabled ? 'cr2-title-menu-item--disabled' : '',
            ].filter(Boolean).join(' ')}
            disabled={item.disabled}
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedIndex(index);
              activateMenu(item);
            }}
          >
            <span>{index === selectedIndex ? '>' : ''}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </nav>

      {notice ? <div className="cr2-title-notice">{notice}</div> : null}
      {slotOpen ? (
        <section className="cr2-title-slot-modal" role="dialog" aria-modal="true" aria-label={TEXT.loadSlots}>
          <header>
            <h2>{TEXT.loadSlots}</h2>
            <button type="button" onClick={() => setSlotOpen(false)}>X</button>
          </header>
          <div className="cr2-title-save-slot-list">
            {saveSlots.map((slot) => (
              <button
                className={slot.snapshot ? 'cr2-title-save-slot' : 'cr2-title-save-slot cr2-title-save-slot--empty'}
                disabled={!slot.snapshot}
                key={slot.slotNumber}
                type="button"
                onClick={() => loadSlot(slot)}
              >
                <SlotPortrait snapshot={slot.snapshot} />
                <SlotSummary
                  slotNumber={slot.slotNumber}
                  snapshot={slot.snapshot}
                  updatedAt={slot.updatedAt}
                />
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {settingsOpen ? (
        <section className="cr2-title-settings-modal" role="dialog" aria-modal="true" aria-label={TEXT.settings}>
          <GameSettings onBack={() => setSettingsOpen(false)} />
        </section>
      ) : null}
    </main>
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

function findNextEnabled(items, currentIndex, direction) {
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (currentIndex + offset * direction + items.length) % items.length;

    if (!items[index].disabled) {
      return index;
    }
  }

  return currentIndex;
}

function getSlotTitle(snapshot) {
  const companyName = snapshot.playerProfile?.companyName || snapshot.player?.companyName || '내 회사';

  return companyName;
}

function SlotPortrait({ snapshot }) {
  const image = snapshot?.playerProfile?.profileImage ?? snapshot?.playerProfile?.fullImage;

  if (!image) {
    return <span className="cr2-title-save-slot-portrait cr2-title-save-slot-portrait--empty" />;
  }

  return (
    <span className="cr2-title-save-slot-portrait">
      <img src={image} alt="" decoding="async" loading="lazy" />
    </span>
  );
}

function SlotSummary({ slotNumber, snapshot, updatedAt }) {
  if (!snapshot) {
    return (
      <div className="cr2-title-slot-summary cr2-title-slot-summary--empty">
        <div className="cr2-title-slot-title">
          <span>SLOT {slotNumber}</span>
          <strong>{TEXT.emptySlot}</strong>
          <small>저장된 진행 정보가 없습니다.</small>
        </div>
        <dl className="cr2-title-slot-table">
          <div>
            <dt>상태</dt>
            <dd>비어 있음</dd>
          </div>
          <div>
            <dt>불러오기</dt>
            <dd>불가</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="cr2-title-slot-summary">
      <div className="cr2-title-slot-title">
        <span>SLOT {slotNumber}</span>
        <strong>{getSlotTitle(snapshot)}</strong>
        <small>CEO {getPlayerName(snapshot)}</small>
      </div>
      <dl className="cr2-title-slot-table">
        {getSlotRows(snapshot, updatedAt).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function getPlayerName(snapshot) {
  return snapshot.playerProfile?.playerName || snapshot.player?.playerName || '-';
}

function getSlotRows(snapshot, updatedAt) {
  const advisorName = snapshot.selectedAdvisor?.name ?? snapshot.selectedAdvisorId ?? '-';
  const floor = snapshot.floor ? `${snapshot.floor}${TEXT.floor}` : '-';
  const capital = Number.isFinite(snapshot.player?.capital)
    ? `${Math.round(snapshot.player.capital / 10000).toLocaleString()}만`
    : '-';
  const savedAt = updatedAt || snapshot.savedAt;
  const savedAtText = savedAt ? formatSavedAt(savedAt) : TEXT.noSavedAt;

  return [
    ['층수', floor],
    ['자본', capital],
    ['자문가', advisorName],
    ['저장일', savedAtText],
  ];
}

function formatSavedAt(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return TEXT.noSavedAt;
  }

  return date.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
