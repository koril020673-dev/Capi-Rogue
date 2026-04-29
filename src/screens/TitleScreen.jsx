import { useGameStore } from '../store/useGameStore';

export default function TitleScreen() {
  const goToAdvisorSelect = useGameStore((state) => state.goToAdvisorSelect);
  const session = useGameStore((state) => state.session);
  const legacyCards = useGameStore((state) => state.legacyCards);

  return (
    <main className="cr2-title-screen">
      <section className="cr2-title-stack">
        <p className="cr2-kicker">ECONOMICS ROGUELIKE</p>
        <h1>CapiRogue2</h1>
        <p className="cr2-title-copy">
          120개월 동안 가격, 품질, 운영을 조율하며 회사를 생존시키세요.
        </p>
        <div className="cr2-title-meta">
          <span>{session.mode === 'guest' ? 'GUEST MODE' : session.userId}</span>
          <span>LEGACY {legacyCards.length}</span>
        </div>
        <button className="cr2-primary-button cr2-primary-button--large" type="button" onClick={goToAdvisorSelect}>
          런 시작
        </button>
      </section>
    </main>
  );
}
