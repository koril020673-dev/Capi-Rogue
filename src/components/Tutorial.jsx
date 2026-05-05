import { useEffect, useMemo, useState } from 'react';
import { TUTORIAL_POPUPS } from '../constants/tutorialData';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import '../styles/tutorial.css';

export default function Tutorial() {
  const screen = useGameStore((state) => state.screen);
  const hasClickedStrategyTab = useGameStore((state) => state.hasClickedStrategyTab);
  const currentExternalEvent = useGameStore((state) => state.currentExternalEvent);
  const currentRivalEvent = useGameStore((state) => state.currentRivalEvent);
  const currentInternalEvent = useGameStore((state) => state.currentInternalEvent);
  const currentSettlement = useGameStore((state) => state.currentSettlement);
  const rewardOptions = useGameStore((state) => state.rewardOptions);
  const completedTutorials = useGameStore((state) => state.completedTutorials);
  const isTutorialEnabled = useGameStore((state) => state.isTutorialEnabled);
  const addCompletedTutorial = useGameStore((state) => state.addCompletedTutorial);
  const completeAllTutorials = useGameStore((state) => state.completeAllTutorials);
  const [pageIndex, setPageIndex] = useState(0);
  const activePopup = useMemo(
    () =>
      isTutorialEnabled
        ? TUTORIAL_POPUPS.find(
            (popup) =>
              !completedTutorials.includes(popup.id) &&
              isTutorialTriggered(popup.trigger, {
                currentExternalEvent,
                currentInternalEvent,
                currentRivalEvent,
                currentSettlement,
                hasClickedStrategyTab,
                rewardOptions,
                screen,
              }),
          )
        : null,
    [
      completedTutorials,
      currentExternalEvent,
      currentInternalEvent,
      currentRivalEvent,
      currentSettlement,
      hasClickedStrategyTab,
      isTutorialEnabled,
      rewardOptions,
      screen,
    ],
  );

  useEffect(() => {
    setPageIndex(0);
  }, [activePopup?.id]);

  if (!activePopup) {
    return null;
  }

  const pages = activePopup.content ?? [];
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= pages.length - 1;

  function confirmCurrentTutorial() {
    addCompletedTutorial(activePopup.id);
  }

  function skipTutorials() {
    completeAllTutorials(TUTORIAL_POPUPS.map((popup) => popup.id));
  }

  return (
    <div className="cr2-tutorial-overlay" role="presentation">
      <section
        aria-label={activePopup.title}
        aria-modal="true"
        className="cr2-tutorial-popup"
        role="dialog"
      >
        <header className="cr2-tutorial-head">
          <h2>{activePopup.title}</h2>
        </header>

        <div className="cr2-tutorial-content">
          <p>{pages[pageIndex]}</p>
        </div>

        <div className="cr2-tutorial-dots" aria-label="튜토리얼 진행도">
          {pages.map((page, index) => (
            <span
              aria-hidden="true"
              className={index === pageIndex ? 'cr2-tutorial-dot cr2-tutorial-dot--active' : 'cr2-tutorial-dot'}
              key={`${activePopup.id}-${page}`}
            />
          ))}
        </div>

        <footer className="cr2-tutorial-actions">
          <button
            className="cr2-tutorial-button cr2-tutorial-button--secondary"
            disabled={isFirstPage}
            type="button"
            onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
          >
            이전
          </button>
          <button
            className="cr2-tutorial-button"
            type="button"
            onClick={() => {
              if (isLastPage) {
                confirmCurrentTutorial();
                return;
              }

              setPageIndex((index) => Math.min(pages.length - 1, index + 1));
            }}
          >
            {isLastPage ? '확인' : '다음'}
          </button>
          {activePopup.skippable ? (
            <button className="cr2-tutorial-skip" type="button" onClick={skipTutorials}>
              스킵
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

function isTutorialTriggered(trigger, state) {
  if (trigger === 'GAME_START') {
    return state.screen === SCREEN_IDS.MAIN;
  }

  if (trigger === 'FIRST_MAIN_SCREEN') {
    return state.screen === SCREEN_IDS.MAIN;
  }

  if (trigger === 'FIRST_TAB_CLICK') {
    return state.screen === SCREEN_IDS.MAIN && Boolean(state.hasClickedStrategyTab);
  }

  if (trigger === 'FIRST_EXTERNAL_EVENT') {
    return Boolean(state.currentExternalEvent || state.currentRivalEvent);
  }

  if (trigger === 'FIRST_INTERNAL_EVENT') {
    return state.screen === SCREEN_IDS.EVENT && Boolean(state.currentInternalEvent);
  }

  if (trigger === 'FIRST_SETTLEMENT') {
    return (
      (state.screen === SCREEN_IDS.SETTLEMENT || state.screen === SCREEN_IDS.RESULT) &&
      Boolean(state.currentSettlement)
    );
  }

  if (trigger === 'FIRST_REWARD') {
    return state.screen === SCREEN_IDS.REWARD && (state.rewardOptions?.length ?? 0) > 0;
  }

  return false;
}
