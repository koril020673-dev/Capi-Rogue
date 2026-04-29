import StatusBar from '../components/StatusBar';
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';

export default function ResultScreen() {
  const result = useGameStore((state) => state.currentResult);
  const floor = useGameStore((state) => state.floor);
  const continueFromResult = useGameStore((state) => state.continueFromResult);

  if (!result) {
    return null;
  }

  const nextStepLabel = getNextStepLabel(result, floor);

  return (
    <main className="cr2-result-screen">
      <StatusBar />
      <section className="cr2-result-panel">
        <p className="cr2-kicker">MONTH RESULT</p>
        <h1 className={result.profit >= 0 ? 'cr2-profit-text' : 'cr2-loss-text'}>
          {result.profit >= 0 ? '+' : ''}
          {formatWon(result.profit)}
        </h1>
        <p className="cr2-title-copy">
          {result.profit >= 0 ? '이번 달은 버텼습니다. 다음 선택지가 더 넓어집니다.' : '손실이 체력을 깎았습니다. 다음 달은 비용 구조를 조심하세요.'}
        </p>
        <div className="cr2-result-grid">
          <div><span>자본 변화</span><strong>{formatWon(result.capitalChange)}</strong></div>
          <div><span>체력 변화</span><strong>{result.healthDelta}</strong></div>
          <div><span>모멘텀</span><strong>{result.momentumScore}</strong></div>
          <div><span>다음 보상</span><strong>{getRewardStatus(floor)}</strong></div>
        </div>
        <p className="cr2-hint-line">{result.hint}</p>
        <button className="cr2-primary-button" type="button" onClick={continueFromResult}>
          {nextStepLabel}
        </button>
      </section>
    </main>
  );
}

function getNextStepLabel(result, floor) {
  if (result.gameOver) {
    return '런 결과 보기';
  }

  if (floor >= 120) {
    return '클리어 확인';
  }

  if (floor % 5 === 0) {
    return '보상 선택';
  }

  return '다음 달로';
}

function getRewardStatus(floor) {
  if (floor % 5 === 0) {
    return '지금 도달';
  }

  return `${5 - (floor % 5)}개월 후`;
}
