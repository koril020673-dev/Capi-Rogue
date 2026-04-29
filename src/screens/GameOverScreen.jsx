import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';

export default function GameOverScreen() {
  const runOutcome = useGameStore((state) => state.runOutcome);
  const floor = useGameStore((state) => state.floor);
  const timeline = useGameStore((state) => state.timeline);
  const restartToTitle = useGameStore((state) => state.restartToTitle);
  const legacyCards = useGameStore((state) => state.legacyCards);
  const bestProfit = timeline.reduce((best, item) => Math.max(best, item.profit), Number.NEGATIVE_INFINITY);

  return (
    <main className="cr2-gameover-screen">
      <section className="cr2-gameover-panel">
        <p className="cr2-kicker">{runOutcome === 'clear' ? 'CLEAR' : 'BANKRUPTCY'}</p>
        <h1>{runOutcome === 'clear' ? '\uC644\uC8FC \uC131\uACF5' : '\uACBD\uC601 \uCCB4\uB825 \uC18C\uC9C4'}</h1>
        <p className="cr2-title-copy">
          {runOutcome === 'clear'
            ? '\uB2E4\uC74C \uB7F0\uC5D0\uC11C \uD638\uD669 \uD655\uB960\uC774 \uC99D\uAC00\uD569\uB2C8\uB2E4.'
            : '\uB2E4\uC74C \uB7F0\uC5D0\uC11C \uC790\uBCF8 \uBCF4\uB108\uC2A4 \uB808\uAC70\uC2DC\uAC00 \uC313\uC785\uB2C8\uB2E4.'}
        </p>
        <div className="cr2-result-grid">
          <div><span>최고 도달</span><strong>{floor}/120개월</strong></div>
          <div><span>최고 월손익</span><strong>{Number.isFinite(bestProfit) ? formatWon(bestProfit) : '기록 없음'}</strong></div>
          <div><span>최근 기록</span><strong>{timeline.length}개월</strong></div>
          <div><span>레거시</span><strong>{legacyCards.length}</strong></div>
        </div>
        <div className="cr2-timeline">
          {timeline.map((item) => (
            <div className="cr2-timeline-row" key={`${item.floor}-${item.profit}`}>
              <span>{item.floor}개월</span>
              <strong>{formatWon(item.profit)}</strong>
              <small>체력 {item.healthAfter}</small>
            </div>
          ))}
        </div>
        <p className="cr2-legacy-line">LEGACY {legacyCards.length}</p>
        <button className="cr2-primary-button" type="button" onClick={restartToTitle}>
          타이틀로
        </button>
      </section>
    </main>
  );
}
