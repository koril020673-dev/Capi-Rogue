import { ECONOMIC_PHASE_LABELS } from '../constants/economy';
import { getAdvisorById } from '../logic/advisorEngine';
import { getMomentumLabel } from '../logic/momentumEngine';
import { useGameStore } from '../store/useGameStore';

export default function StatusBar() {
  const floor = useGameStore((state) => state.floor);
  const phase = useGameStore((state) => state.phase);
  const player = useGameStore((state) => state.player);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const momentumHistory = useGameStore((state) => state.momentumHistory);
  const useCreditToken = useGameStore((state) => state.useCreditToken);
  const advisor = getAdvisorById(selectedAdvisorId);
  const nextRewardIn = floor % 5 === 0 ? 0 : 5 - (floor % 5);
  const hasCredit = player.creditTokens > 0;

  return (
    <header className="cr2-status-bar">
      <div className="cr2-status-block">
        <span className="cr2-status-label">월차</span>
        <strong className="cr2-status-value">{floor}/120개월</strong>
      </div>
      <div className="cr2-status-block">
        <span className="cr2-status-label">경기</span>
        <strong className="cr2-status-value">{ECONOMIC_PHASE_LABELS[phase]}</strong>
      </div>
      <div className="cr2-status-block cr2-status-block--wide">
        <span className="cr2-status-label">체력</span>
        <div className="cr2-health-slots" aria-label={`체력 ${player.health}`}>
          {Array.from({ length: 10 }, (_, index) => (
            <span
              className={
                index < player.health ? 'cr2-health-slot cr2-health-slot--on' : 'cr2-health-slot'
              }
              key={index}
            />
          ))}
        </div>
      </div>
      <div className="cr2-status-block">
        <span className="cr2-status-label">크레딧</span>
        <strong className="cr2-status-value">{player.creditTokens}</strong>
      </div>
      <div className="cr2-status-block">
        <span className="cr2-status-label">흐름</span>
        <strong className="cr2-status-value">{getMomentumLabel(momentumHistory)}</strong>
      </div>
      <div className="cr2-status-block">
        <span className="cr2-status-label">보상</span>
        <strong className="cr2-status-value">
          {nextRewardIn === 0 ? '이번 달' : `${nextRewardIn}개월 후`}
        </strong>
      </div>
      <div className="cr2-status-block">
        <span className="cr2-status-label">자문가</span>
        <strong className={`cr2-status-value cr2-advisor-tone--${advisor.id}`}>
          {advisor.label}
        </strong>
      </div>
      <div className="cr2-credit-actions">
        <button
          aria-label="크레딧 1개로 체력 회복"
          className="cr2-icon-button"
          disabled={!hasCredit}
          title="크레딧 1개로 체력 +2"
          type="button"
          onClick={() => useCreditToken('recover-health')}
        >
          회복
        </button>
        <button
          aria-label="크레딧 1개로 수요 증가"
          className="cr2-icon-button"
          disabled={!hasCredit}
          title="크레딧 1개로 2개월간 수요 증가"
          type="button"
          onClick={() => useCreditToken('demand-boost')}
        >
          수요
        </button>
        <button
          aria-label="크레딧 1개로 라이벌 견제"
          className="cr2-icon-button"
          disabled={!hasCredit}
          title="크레딧 1개로 이번 달 라이벌 효율 감소"
          type="button"
          onClick={() => useCreditToken('rival-freeze')}
        >
          견제
        </button>
      </div>
    </header>
  );
}
