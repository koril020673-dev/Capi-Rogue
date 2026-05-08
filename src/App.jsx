import { useEffect, useState } from 'react';
import AudioController from './components/AudioController';
import BackgroundScene from './components/BackgroundScene';
import PauseMenu from './components/PauseMenu';
import Tutorial from './components/Tutorial';
import AdvisorSelectScreen from './screens/AdvisorSelectScreen';
import CharacterCreateScreen from './screens/CharacterCreateScreen';
import EventScreen from './screens/EventScreen';
import EndingScreen from './screens/EndingScreen';
import GameOverScreen from './screens/GameOverScreen';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';
import RecordScreen from './screens/RecordScreen';
import RewardScreen from './screens/RewardScreen';
import SettlementScreen from './screens/SettlementScreen';
import SlotSelectScreen from './screens/SlotSelectScreen';
import TitleScreen from './screens/TitleScreen';
import { SCREEN_IDS, useGameStore } from './store/useGameStore';
import { getAdvisorThemeColor } from './logic/advisorEngine';
import { getGameSettings } from './logic/audioEngine';
import { tryAutoLogin } from './logic/authEngine';
import { loadSettings } from './logic/settingsEngine';
import { installViewportGuard } from './logic/viewportGuard';

const BASE_WIDTH = 1080;
const BASE_HEIGHT = 720;

function updateScale() {
  const root = document.getElementById('root');

  if (!root) {
    return;
  }

  const scaleX = window.innerWidth / BASE_WIDTH;
  const scaleY = window.innerHeight / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (window.innerWidth - BASE_WIDTH * scale) / 2;
  const offsetY = (window.innerHeight - BASE_HEIGHT * scale) / 2;

  root.style.width = `${BASE_WIDTH}px`;
  root.style.height = `${BASE_HEIGHT}px`;
  root.style.transform = `scale(${scale})`;
  root.style.transformOrigin = 'top left';
  root.style.position = 'absolute';
  root.style.left = `${offsetX}px`;
  root.style.top = `${offsetY}px`;
}

export default function App() {
  const screen = useGameStore((state) => state.screen);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const isPaused = useGameStore((state) => state.isPaused);
  const setPaused = useGameStore((state) => state.setPaused);
  const incrementPlaytime = useGameStore((state) => state.incrementPlaytime);
  const setTutorialEnabled = useGameStore((state) => state.setTutorialEnabled);
  const setStoreSettings = useGameStore((state) => state.setSettings);
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen);
  const [settings, setSettings] = useState(() => getGameSettings());
  const themeColor = getAdvisorThemeColor(selectedAdvisorId);
  const pauseEnabled = isPauseEnabled(screen);

  useEffect(() => {
    return installViewportGuard();
  }, []);

  useEffect(() => {
    function handleOrientationChange() {
      window.setTimeout(updateScale, 100);
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    const initialSettings = loadSettings();

    setSettings(initialSettings);
    setStoreSettings(initialSettings);
    setTutorialEnabled(initialSettings.tutorialEnabled);

    tryAutoLogin().then((success) => {
      setCurrentScreen(success ? SCREEN_IDS.TITLE : SCREEN_IDS.LOGIN);
    });
  }, [setCurrentScreen, setStoreSettings, setTutorialEnabled]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== 'Escape' || !pauseEnabled) {
        return;
      }

      event.preventDefault();
      useGameStore.getState().togglePaused();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pauseEnabled]);

  useEffect(() => {
    if (!pauseEnabled || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => incrementPlaytime(1), 1000);

    return () => window.clearInterval(intervalId);
  }, [incrementPlaytime, isPaused, pauseEnabled]);

  useEffect(() => {
    function handleSettingsChange() {
      const nextSettings = getGameSettings();

      setSettings(nextSettings);
      setTutorialEnabled(nextSettings.tutorialEnabled);
    }

    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('cr2-settings-change', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('cr2-settings-change', handleSettingsChange);
    };
  }, [setTutorialEnabled]);

  useEffect(() => {
    setTutorialEnabled(settings.tutorialEnabled);
  }, [setTutorialEnabled, settings.tutorialEnabled]);

  return (
    <div
      className={[
        'cr2-app',
        `cr2-advisor-theme--${selectedAdvisorId}`,
        settings.backgroundEnabled ? '' : 'cr2-app--background-off',
        settings.screenShakeEnabled ? '' : 'cr2-app--no-shake',
      ].filter(Boolean).join(' ')}
      style={{ '--cr2-theme-color': themeColor, '--cr2-advisor': themeColor }}
    >
      {pauseEnabled ? (
        <button className="cr2-pause-mobile-button" type="button" onClick={() => setPaused(true)}>
          II
        </button>
      ) : null}
      <BackgroundScene screen={screen}>{renderScreen(screen)}</BackgroundScene>
      {pauseEnabled ? <PauseMenu /> : null}
      <Tutorial />
      <AudioController />
    </div>
  );
}

function isPauseEnabled(screen) {
  return [
    SCREEN_IDS.MAIN,
    SCREEN_IDS.EVENT,
    SCREEN_IDS.SETTLEMENT,
    SCREEN_IDS.RESULT,
    SCREEN_IDS.REWARD,
  ].includes(screen);
}

function renderScreen(screen) {
  if (screen === SCREEN_IDS.LOGIN) {
    return <LoginScreen />;
  }

  if (screen === SCREEN_IDS.TITLE) {
    return <TitleScreen />;
  }

  if (screen === SCREEN_IDS.RECORD) {
    return <RecordScreen />;
  }

  if (screen === SCREEN_IDS.CHARACTER_CREATE) {
    return <CharacterCreateScreen />;
  }

  if (screen === SCREEN_IDS.SLOT_SELECT) {
    return <SlotSelectScreen />;
  }

  if (screen === SCREEN_IDS.ADVISOR_SELECT) {
    return <AdvisorSelectScreen />;
  }

  if (screen === SCREEN_IDS.MAIN) {
    return <MainScreen />;
  }

  if (screen === SCREEN_IDS.EVENT) {
    return <EventScreen />;
  }

  if (screen === SCREEN_IDS.SETTLEMENT || screen === SCREEN_IDS.RESULT) {
    return <SettlementScreen />;
  }

  if (screen === SCREEN_IDS.REWARD) {
    return <RewardScreen />;
  }

  if (screen === SCREEN_IDS.ENDING) {
    return <EndingScreen />;
  }

  return <GameOverScreen />;
}
