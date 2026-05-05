import { ECONOMIC_PHASE_LABELS } from '../constants/economy';
import { getAdvisorById } from '../logic/advisorEngine';
import { getMomentumLabel } from '../logic/momentumEngine';
import { useGameStore } from '../store/useGameStore';
import LoanMaturityAlert from './LoanMaturityAlert';
import Tooltip from './Tooltip';

const TEXT = Object.freeze({
  floor: '층수',
  phase: '경기',
  health: '경영 체력',
  momentum: '모멘텀',
  reward: '보상',
  advisor: '자문가',
  thisMonth: '이번 달',
  monthsLater: '개월 후',
});

export default function StatusBar() {
  const floor = useGameStore((state) => state.floor);
  const phase = useGameStore((state) => state.phase);
  const player = useGameStore((state) => state.player);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const momentumHistory = useGameStore((state) => state.momentumHistory);
  const advisor = getAdvisorById(selectedAdvisorId);
  const maxHealth = player.maxHealth ?? 10;
  const nextRewardIn = floor % 5 === 0 ? 0 : 5 - (floor % 5);

  return (
    <div className="cr2-status-shell">
      <header className="cr2-status-bar cr2-status-bar--simple">
        <StatusBlock label={TEXT.floor} value={`${floor}/120`} />
        <StatusBlock label={TEXT.phase} value={ECONOMIC_PHASE_LABELS[phase]} />
        <div className="cr2-status-block cr2-status-block--wide cr2-health-bar">
          <span className="cr2-status-label">
            <Tooltip tooltipId="health_bar">{TEXT.health}</Tooltip>
          </span>
          <div className="cr2-health-slots" aria-label={`${TEXT.health} ${player.health}`}>
            {Array.from({ length: maxHealth }, (_, index) => (
              <span
                className={
                  index < player.health ? 'cr2-health-slot cr2-health-slot--on' : 'cr2-health-slot'
                }
                key={index}
              />
            ))}
          </div>
        </div>
        <StatusBlock className="cr2-momentum" label={TEXT.momentum} tooltipId="momentum" value={getMomentumLabel(momentumHistory)} />
        <StatusBlock
          label={TEXT.reward}
          value={nextRewardIn === 0 ? TEXT.thisMonth : `${nextRewardIn}${TEXT.monthsLater}`}
        />
        <div className="cr2-status-block">
          <span className="cr2-status-label">{TEXT.advisor}</span>
          <strong className={`cr2-status-value cr2-advisor-tone--${advisor.id}`}>
            {advisor.name}
          </strong>
        </div>
      </header>
      <LoanMaturityAlert />
    </div>
  );
}

function StatusBlock({ className = '', label, tooltipId = null, value }) {
  return (
    <div className={['cr2-status-block', className].filter(Boolean).join(' ')}>
      <span className="cr2-status-label">
        {tooltipId ? <Tooltip tooltipId={tooltipId}>{label}</Tooltip> : label}
      </span>
      <strong className="cr2-status-value">{value}</strong>
    </div>
  );
}
