import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RECORD_RESULT_TYPES,
  buildRunRecord,
  formatNumberWon,
  formatTime,
  getCriticalReview,
  getRecordRows,
} from '../logic/recordEngine';
import { stopBGM } from '../logic/audioEngine';
import { saveRecord } from '../logic/saveEngine';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import '../styles/gameOver.css';

const PAGE_COUNT = 3;

export default function GameOverScreen() {
  const state = useGameStore();
  const restartToTitle = useGameStore((store) => store.restartToTitle);
  const [page, setPage] = useState(0);
  const savedRef = useRef(false);
  const record = useMemo(
    () => buildRunRecord(state, RECORD_RESULT_TYPES.BANKRUPT),
    [state],
  );
  const review = useMemo(() => getCriticalReview(record.timeline), [record.timeline]);
  const reason = record.final_capital < 0
    ? '자본이 연속으로 음수 상태에 머물렀습니다.'
    : '경영 체력이 0이 됐습니다.';

  useEffect(() => {
    stopBGM();
  }, []);

  useEffect(() => {
    if (savedRef.current) {
      return;
    }

    savedRef.current = true;
    saveRecord(record);
  }, [record]);

  function startNewGame() {
    restartToTitle();
    useGameStore.setState({ screen: SCREEN_IDS.SLOT_SELECT });
  }

  return (
    <main className="cr2-gameover-screen">
      <section className="cr2-gameover-panel">
        <div className="cr2-page-body">
          {page === 0 ? <CausePage record={record} reason={reason} /> : null}
          {page === 1 ? <ReviewPage review={review} /> : null}
          {page === 2 ? (
            <StatsPage
              record={record}
              onTitle={restartToTitle}
              onNewGame={startNewGame}
            />
          ) : null}
        </div>
        <PageNav page={page} setPage={setPage} />
      </section>
    </main>
  );
}

function CausePage({ record, reason }) {
  return (
    <article className="cr2-run-page">
      <p className="cr2-kicker">BANKRUPT</p>
      <h1>GAME OVER</h1>
      <div className="cr2-run-summary">
        <strong>Floor {record.clear_floor}에서 파산</strong>
        <p>원인: {reason}</p>
      </div>
      <dl className="cr2-run-stat-list">
        <div>
          <dt>마지막 자본</dt>
          <dd className="cr2-negative">{formatNumberWon(record.final_capital)}</dd>
        </div>
        <div>
          <dt>최종 체력</dt>
          <dd>{record.final_health} / {record.max_health}</dd>
        </div>
        <div>
          <dt>최종 신용등급</dt>
          <dd>{record.credit_grade} ({record.credit_score}점)</dd>
        </div>
      </dl>
    </article>
  );
}

function ReviewPage({ review }) {
  return (
    <article className="cr2-run-page">
      <p className="cr2-kicker">REVIEW</p>
      <h1>결정 복기</h1>
      <div className="cr2-review-highlight">
        <strong>결정적 실수 턴</strong>
        <p>
          {review.worstProfit
            ? `Floor ${review.worstProfit.floor} - 순이익 ${formatNumberWon(review.worstProfit.profit)}`
            : '기록된 적자 턴이 없습니다.'}
        </p>
        <p>
          {review.worstHealth
            ? `Floor ${review.worstHealth.floor} - 체력 ${review.worstHealth.healthAfter}`
            : '체력 변화 기록이 없습니다.'}
        </p>
      </div>
      <div className="cr2-run-scroll">
        {review.recent.map((turn) => (
          <div className="cr2-review-row" key={`${turn.floor}-${turn.profit}`}>
            <strong>Floor {turn.floor}</strong>
            <span>순이익 {formatNumberWon(turn.profit)}</span>
            <small>{turn.eventTitle || '전략 정산 완료'}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function StatsPage({ record, onTitle, onNewGame }) {
  return (
    <article className="cr2-run-page">
      <p className="cr2-kicker">FINAL STATS</p>
      <h1>최종 통계</h1>
      <div className="cr2-run-scroll">
        <dl className="cr2-record-table">
          {getRecordRows(record).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="cr2-run-actions">
        <button className="cr2-secondary-button" type="button" onClick={onTitle}>
          타이틀로
        </button>
        <button className="cr2-primary-button" type="button" onClick={onNewGame}>
          새 게임
        </button>
      </div>
    </article>
  );
}

function PageNav({ page, setPage }) {
  return (
    <footer className="cr2-run-nav">
      <button
        className="cr2-secondary-button"
        disabled={page === 0}
        type="button"
        onClick={() => setPage((current) => Math.max(0, current - 1))}
      >
        이전
      </button>
      <span>{Array.from({ length: PAGE_COUNT }, (_, index) => (index === page ? '●' : '○')).join(' ')}</span>
      <button
        className="cr2-secondary-button"
        disabled={page === PAGE_COUNT - 1}
        type="button"
        onClick={() => setPage((current) => Math.min(PAGE_COUNT - 1, current + 1))}
      >
        다음
      </button>
    </footer>
  );
}
