import { ADVISORS } from '../constants/advisors';
import { isAdvisorUnlocked } from '../logic/advisorEngine';
import { useGameStore } from '../store/useGameStore';

export default function AdvisorSelectScreen() {
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const unlockedAdvisorOrder = useGameStore((state) => state.unlockedAdvisorOrder);
  const selectAdvisor = useGameStore((state) => state.selectAdvisor);
  const startRun = useGameStore((state) => state.startRun);

  return (
    <main className="cr2-advisor-screen">
      <header className="cr2-screen-head">
        <p className="cr2-kicker">ADVISOR SELECT</p>
        <h1>자문가 선택</h1>
      </header>
      <section className="cr2-advisor-grid">
        {ADVISORS.map((advisor) => {
          const unlocked = isAdvisorUnlocked(advisor, unlockedAdvisorOrder);
          const active = advisor.id === selectedAdvisorId;

          return (
            <article
              className={[
                'cr2-advisor-card',
                active ? 'cr2-advisor-card--active' : '',
                unlocked ? '' : 'cr2-advisor-card--locked',
                `cr2-advisor-tone--${advisor.id}`,
              ].join(' ')}
              key={advisor.id}
            >
              <span className="cr2-panel-label">{advisor.name}</span>
              <h2>{advisor.label}</h2>
              <p>{advisor.unlock}</p>
              <dl className="cr2-stat-list">
                <div><dt>수요</dt><dd>+{Math.round(advisor.stats.demandBonus * 100)}%</dd></div>
                <div><dt>원가</dt><dd>{Math.round(advisor.stats.costMultiplier * 100)}%</dd></div>
                <div><dt>품질</dt><dd>+{advisor.stats.qualityBonus}</dd></div>
                <div><dt>보상운</dt><dd>+{Math.round(advisor.stats.rewardLuck * 100)}%</dd></div>
              </dl>
              <button
                className="cr2-secondary-button"
                disabled={!unlocked}
                type="button"
                onClick={() => selectAdvisor(advisor.id)}
              >
                {unlocked ? '\uC120\uD0DD' : '\uC7A0\uAE40'}
              </button>
            </article>
          );
        })}
      </section>
      <button className="cr2-primary-button cr2-fixed-action" type="button" onClick={() => startRun(selectedAdvisorId)}>
        이 자문가로 시작
      </button>
    </main>
  );
}
