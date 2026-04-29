import { ECONOMIC_PHASE_LABELS } from '../constants/economy';
import { getAdvisorById } from '../logic/advisorEngine';
import { getMomentumLabel } from '../logic/momentumEngine';
import { useGameStore } from '../store/useGameStore';

const TEXT = Object.freeze({
  floor: '\uC6D4\uCC28',
  phase: '\uACBD\uAE30',
  health: '\uCCB4\uB825',
  credit: '\uD06C\uB808\uB527',
  momentum: '\uD750\uB984',
  reward: '\uBCF4\uC0C1',
  advisor: '\uC790\uBB38\uAC00',
  thisMonth: '\uC774\uBC88 \uB2EC',
  monthsLater: '\uAC1C\uC6D4 \uD6C4',
  recover: '\uD68C\uBCF5',
  demand: '\uC218\uC694',
  freeze: '\uACAC\uC81C',
});

export default function StatusBar() {
  const floor = useGameStore((state) => state.floor);
  const phase = useGameStore((state) => state.phase);
  const player = useGameStore((state) => state.player);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const momentumHistory = useGameStore((state) => state.momentumHistory);
  const useCreditToken = useGameStore((state) => state.useCreditToken);
  const advisor = getAdvisorById(selectedAdvisorId);
  const maxHealth = player.maxHealth ?? 10;
  const nextRewardIn = floor % 5 === 0 ? 0 : 5 - (floor % 5);
  const hasCredit = player.creditTokens > 0;

  return (
    <header className="cr2-status-bar">
      <StatusBlock label={TEXT.floor} value={`${floor}/120`} />
      <StatusBlock label={TEXT.phase} value={ECONOMIC_PHASE_LABELS[phase]} />
      <div className="cr2-status-block cr2-status-block--wide">
        <span className="cr2-status-label">{TEXT.health}</span>
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
      <StatusBlock label={TEXT.credit} value={player.creditTokens} />
      <StatusBlock label={TEXT.momentum} value={getMomentumLabel(momentumHistory)} />
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
      <div className="cr2-credit-actions">
        <CreditButton
          disabled={!hasCredit}
          label={TEXT.recover}
          title={`${TEXT.credit} 1 -> ${TEXT.health} +2`}
          onClick={() => useCreditToken('recover-health')}
        />
        <CreditButton
          disabled={!hasCredit}
          label={TEXT.demand}
          title={`${TEXT.credit} 1 -> ${TEXT.demand} boost`}
          onClick={() => useCreditToken('demand-boost')}
        />
        <CreditButton
          disabled={!hasCredit}
          label={TEXT.freeze}
          title={`${TEXT.credit} 1 -> rival freeze`}
          onClick={() => useCreditToken('rival-freeze')}
        />
      </div>
    </header>
  );
}

function StatusBlock({ label, value }) {
  return (
    <div className="cr2-status-block">
      <span className="cr2-status-label">{label}</span>
      <strong className="cr2-status-value">{value}</strong>
    </div>
  );
}

function CreditButton({ disabled, label, title, onClick }) {
  return (
    <button
      aria-label={title}
      className="cr2-icon-button"
      disabled={disabled}
      title={title}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
