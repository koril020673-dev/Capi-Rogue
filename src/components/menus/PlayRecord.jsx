import { getGrade } from '../../logic/creditEngine';
import { getMomentumScore } from '../../logic/momentumEngine';
import { useGameStore } from '../../store/useGameStore';
import { formatWon } from '../../utils/formatMoney';

export default function PlayRecord() {
  const state = useGameStore();
  const timeline = state.timeline ?? [];
  const positiveTurns = timeline.filter((turn) => (turn.profit ?? 0) > 0).length;
  const negativeTurns = timeline.filter((turn) => (turn.profit ?? 0) < 0).length;
  const highestShare = Math.max(
    0,
    ...(state.currentSettlement?.demandSplit ?? [])
      .filter((item) => item.id === 'player')
      .map((item) => item.marketShare ?? 0),
  );
  const externalEventCount = timeline.filter((turn) => turn.eventTitle).length +
    (state.lastExternalEvent ? 1 : 0);
  const eventSuccessRate = state.currentInternalOutcome
    ? state.currentInternalOutcome.success === false ? '0%' : '100%'
    : '-';

  const items = [
    ['현재 층수', `${state.floor}/120`],
    ['현재 자본', formatWon(state.player.capital)],
    ['현재 신용등급', `${getGrade(state.creditScore ?? 70)} / ${state.creditScore ?? 70}`],
    ['현재 체력', `${state.player.health}/${state.player.maxHealth ?? 10}`],
    ['현재 모멘텀', getMomentumScore(state.momentumHistory)],
    ['총 흑자 턴 수', positiveTurns],
    ['총 적자 턴 수', negativeTurns],
    ['최고 점유율', `${Math.round(highestShare * 100)}%`],
    ['겪은 외부 이벤트 수', externalEventCount],
    ['이벤트 선택 성공률', eventSuccessRate],
    ['플레이타임', formatTime(state.playtime)],
  ];

  return (
    <div className="cr2-pause-section">
      <h2>플레이 기록</h2>
      <dl className="cr2-pause-stat-grid">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
