import BackgroundScene from './components/BackgroundScene';
import AdvisorSelectScreen from './screens/AdvisorSelectScreen';
import CharacterCreateScreen from './screens/CharacterCreateScreen';
import EventScreen from './screens/EventScreen';
import GameOverScreen from './screens/GameOverScreen';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';
import ResultScreen from './screens/ResultScreen';
import RewardScreen from './screens/RewardScreen';
import SettlementScreen from './screens/SettlementScreen';
import TitleScreen from './screens/TitleScreen';
import { SCREEN_IDS, useGameStore } from './store/useGameStore';
import { getAdvisorThemeColor } from './logic/advisorEngine';

export default function App() {
  const screen = useGameStore((state) => state.screen);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const themeColor = getAdvisorThemeColor(selectedAdvisorId);

  return (
    <div
      className={`cr2-app cr2-advisor-theme--${selectedAdvisorId}`}
      style={{ '--cr2-theme-color': themeColor, '--cr2-advisor': themeColor }}
    >
      <BackgroundScene>{renderScreen(screen)}</BackgroundScene>
    </div>
  );
}

function renderScreen(screen) {
  if (screen === SCREEN_IDS.LOGIN) {
    return <LoginScreen />;
  }

  if (screen === SCREEN_IDS.TITLE) {
    return <TitleScreen />;
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

  if (screen === SCREEN_IDS.SETTLEMENT) {
    return <SettlementScreen />;
  }

  if (screen === SCREEN_IDS.RESULT) {
    return <ResultScreen />;
  }

  if (screen === SCREEN_IDS.REWARD) {
    return <RewardScreen />;
  }

  return <GameOverScreen />;
}
