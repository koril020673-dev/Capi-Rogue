import { useEffect, useMemo, useState } from 'react';
import { ECONOMIC_PHASES } from '../constants/economy';
import { loadGameFromLocalStorage } from '../logic/saveEngine';
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
  noSave: '저장된 게임이 없습니다.',
  continueTodo: 'TODO: Supabase 저장 데이터 로드. 현재는 로컬 프로필을 불러옵니다.',
  settingsTodo: 'TODO: 설정 모달 준비 중입니다.',
});

export default function TitleScreen() {
  const session = useGameStore((state) => state.session);
  const phase = useGameStore((state) => state.phase);
  const playerProfile = useGameStore((state) => state.playerProfile);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const savedGame = useMemo(() => loadGameFromLocalStorage(), []);
  const hasSavedGame = Boolean(savedGame?.playerProfile?.profileId || playerProfile.profileId);
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
    if (menuItems[selectedIndex]?.disabled) {
      setSelectedIndex(findNextEnabled(menuItems, selectedIndex, 1));
    }
  }, [menuItems, selectedIndex]);

  useEffect(() => {
    function handleKeyDown(event) {
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
  }, [menuItems, selectedIndex]);

  function activateMenu(item) {
    if (!item || item.disabled) {
      setNotice(TEXT.noSave);
      return;
    }

    if (item.id === 'continue') {
      const profile = savedGame?.playerProfile ?? playerProfile;

      useGameStore.setState({
        playerProfile: profile,
        screen: SCREEN_IDS.ADVISOR_SELECT,
      });
      setNotice(TEXT.continueTodo);
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
      setNotice(TEXT.settingsTodo);
    }
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
            <span>{index === selectedIndex ? '▶' : ''}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </nav>

      {notice ? <div className="cr2-title-notice">{notice}</div> : null}
    </main>
  );
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
