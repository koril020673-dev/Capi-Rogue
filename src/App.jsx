import { useEffect, useState } from 'react';
import AudioController from './components/AudioController';
import BackgroundScene from './components/BackgroundScene';
import PauseMenu from './components/PauseMenu';
import Tutorial from './components/Tutorial';
import AdvisorSelectScreen from './screens/AdvisorSelectScreen';
import CharacterCreateScreen from './screens/CharacterCreateScreen';
import EventScreen from './screens/EventScreen';
import GameOverScreen from './screens/GameOverScreen';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';
import RecordScreen from './screens/RecordScreen';
import RewardScreen from './screens/RewardScreen';
import SettlementScreen from './screens/SettlementScreen';
import TitleScreen from './screens/TitleScreen';
import { SCREEN_IDS, useGameStore } from './store/useGameStore';
import { getAdvisorThemeColor } from './logic/advisorEngine';
import { getGameSettings } from './logic/audioEngine';
import { installViewportGuard } from './logic/viewportGuard';

export default function App() {
  const screen = useGameStore((state) => state.screen);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const isPaused = useGameStore((state) => state.isPaused);
  const setPaused = useGameStore((state) => state.setPaused);
  const incrementPlaytime = useGameStore((state) => state.incrementPlaytime);
  const setTutorialEnabled = useGameStore((state) => state.setTutorialEnabled);
  const [settings, setSettings] = useState(() => getGameSettings());
  const themeColor = getAdvisorThemeColor(selectedAdvisorId);
  const pauseEnabled = isPauseEnabled(screen);

  useEffect(() => {
    return installViewportGuard();
  }, []);

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

  return <GameOverScreen />;
}
