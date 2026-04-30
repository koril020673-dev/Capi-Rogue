import { getMomentumLabel } from '../logic/momentumEngine';
import { useGameStore } from '../store/useGameStore';

const TEXT = Object.freeze({
  health: '경영 체력',
  momentum: '흐름',
});

export default function StatusBar() {
  const player = useGameStore((state) => state.player);
  const momentumHistory = useGameStore((state) => state.momentumHistory);
  const maxHealth = player.maxHealth ?? 10;

  return (
    <header className="cr2-status-bar cr2-status-bar--simple">
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
      <StatusBlock label={TEXT.momentum} value={getMomentumLabel(momentumHistory)} />
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
