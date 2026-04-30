import { useMemo } from 'react';
import { getGrade } from '../logic/creditEngine';
import { loadRecordsFromLocalStorage } from '../logic/saveEngine';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';
import '../styles/record.css';

const TEXT = Object.freeze({
  title: '플레이 기록',
  empty: '아직 클리어 기록이 없습니다',
  back: '돌아가기',
  playTime: '플레이타임',
  clearFloor: '클리어 층수',
  advisor: '선택한 어드바이저',
  finalCapital: '최종 자본',
  finalCreditGrade: '최종 신용등급',
  profitTurns: '총 흑자 턴 수',
  lossTurns: '총 적자 턴 수',
  bestShare: '최고 점유율',
  crisisCount: '파산 위기 횟수',
  externalEvents: '겪은 외부 이벤트 수',
  eventSuccessRate: '이벤트 선택 성공률',
  rivalsDefeated: '라이벌 압도 횟수',
});

export default function RecordScreen() {
  const session = useGameStore((state) => state.session);
  const currentRecord = useGameStore((state) => buildCurrentRunRecord(state));
  const latestRecord = useMemo(() => {
    // TODO: Supabase records 테이블에서 session.userId 기준 최신 클리어 기록을 불러온다.
    const localRecords = loadRecordsFromLocalStorage();

    return localRecords.find((record) => record.userId === session.userId) ?? localRecords[0] ?? null;
  }, [session.userId]);
  const record = latestRecord ?? currentRecord;
  const hasRecord = Boolean(latestRecord ?? currentRecord?.hasProgress);

  return (
    <main className="cr2-record-screen">
      <section className="cr2-record-panel">
        <header className="cr2-record-head">
          <p className="cr2-kicker">PLAYER RECORD</p>
          <h1>{TEXT.title}</h1>
        </header>

        {hasRecord ? (
          <div className="cr2-record-grid">
            {buildRecordRows(record).map((item) => (
              <div className="cr2-record-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="cr2-record-empty">{TEXT.empty}</div>
        )}

        <button
          className="cr2-primary-button cr2-record-back"
          type="button"
          onClick={() => useGameStore.setState({ screen: SCREEN_IDS.TITLE })}
        >
          {TEXT.back}
        </button>
      </section>
    </main>
  );
}

function buildRecordRows(record) {
  return [
    { label: TEXT.playTime, value: formatPlayTime(record.playTimeSeconds) },
    { label: TEXT.clearFloor, value: `${record.clearFloor ?? 0}층` },
    { label: TEXT.advisor, value: record.advisorName ?? '-' },
    { label: TEXT.finalCapital, value: formatWon(record.finalCapital ?? 0) },
    { label: TEXT.finalCreditGrade, value: record.finalCreditGrade ?? 'B' },
    { label: TEXT.profitTurns, value: `${record.profitTurns ?? 0}턴` },
    { label: TEXT.lossTurns, value: `${record.lossTurns ?? 0}턴` },
    { label: TEXT.bestShare, value: `${Math.round((record.bestMarketShare ?? 0) * 100)}%` },
    { label: TEXT.crisisCount, value: `${record.bankruptcyCrisisCount ?? 0}회` },
    { label: TEXT.externalEvents, value: `${record.externalEventCount ?? 0}개` },
    { label: TEXT.eventSuccessRate, value: `${Math.round((record.eventChoiceSuccessRate ?? 0) * 100)}%` },
    { label: TEXT.rivalsDefeated, value: `${record.rivalsDefeated ?? 0}회` },
  ];
}

function buildCurrentRunRecord(state) {
  const timeline = state.timeline ?? [];
  const marketShares = timeline.map((turn) => turn.marketShare ?? 0);
  const eventOutcomes = timeline.filter((turn) => turn.internalOutcome);
  const eventSuccesses = eventOutcomes.filter((turn) => turn.internalOutcome?.success);
  const creditScore = state.creditScore ?? 70;

  return Object.freeze({
    hasProgress: timeline.length > 0,
    playTimeSeconds: state.playTimeSeconds ?? timeline.length * 45,
    clearFloor: Math.max(1, state.floor ?? 1),
    advisorName: state.selectedAdvisor?.name ?? '-',
    finalCapital: state.player?.capital ?? 0,
    finalCreditGrade: getGrade(creditScore),
    profitTurns: timeline.filter((turn) => (turn.profit ?? 0) > 0).length,
    lossTurns: timeline.filter((turn) => (turn.profit ?? 0) < 0).length,
    bestMarketShare: Math.max(0, ...marketShares),
    bankruptcyCrisisCount: timeline.filter((turn) => (turn.capitalAfter ?? turn.capital ?? 0) < 0).length,
    externalEventCount: timeline.filter((turn) => turn.externalEvent).length,
    eventChoiceSuccessRate: eventOutcomes.length > 0 ? eventSuccesses.length / eventOutcomes.length : 0,
    rivalsDefeated: timeline.filter((turn) => (turn.marketShare ?? 0) >= 0.5).length,
  });
}

function formatPlayTime(seconds = 0) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const restSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (minutes > 0) {
    return `${minutes}분 ${restSeconds}초`;
  }

  return `${restSeconds}초`;
}
