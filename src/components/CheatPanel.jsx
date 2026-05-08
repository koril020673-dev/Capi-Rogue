import { useState } from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';
import { ECONOMIC_PHASES } from '../constants/economy';
import { useGameStore } from '../store/useGameStore';

const PHASES = Object.freeze([
  Object.freeze({ id: ECONOMIC_PHASES.BOOM, label: '\uD638\uD669' }),
  Object.freeze({ id: ECONOMIC_PHASES.GROWTH, label: '\uC131\uC7A5' }),
  Object.freeze({ id: ECONOMIC_PHASES.STABLE, label: '\uD3C9\uC2DC' }),
  Object.freeze({ id: ECONOMIC_PHASES.CONTRACTION, label: '\uC704\uCD95' }),
  Object.freeze({ id: ECONOMIC_PHASES.RECESSION, label: '\uBD88\uD669' }),
]);

const TEXT = Object.freeze({
  capital: '\uC790\uBCF8',
  health: '\uCCB4\uB825',
  credit: '\uC2E0\uC6A9',
  phase: '\uAD6D\uBA74',
  quality: '\uD488\uC9C8',
  achievements: '\uC5C5\uC801',
  full: '\uB9CC\uB545',
  all: '\uC804\uBD80 \uB2EC\uC131',
});

export default function CheatPanel() {
  const [open, setOpen] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  function updatePlayer(mutator) {
    useGameStore.setState((state) => ({
      player: Object.freeze(mutator(state.player)),
    }));
  }

  return (
    <aside className={open ? 'cr2-cheat-panel cr2-cheat-panel--open' : 'cr2-cheat-panel'}>
      <button className="cr2-cheat-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        DEV
      </button>
      {open ? (
        <section className="cr2-cheat-body">
          <h2>DEV PANEL</h2>
          <CheatRow label="Floor">
            <button type="button" onClick={() => useGameStore.setState((state) => ({ floor: Math.min(120, state.floor + 10) }))}>+10</button>
            <button type="button" onClick={() => useGameStore.setState((state) => ({ floor: Math.max(1, state.floor - 10) }))}>-10</button>
          </CheatRow>
          <CheatRow label={TEXT.capital}>
            <button type="button" onClick={() => updatePlayer((player) => ({ ...player, capital: player.capital + 1000000 }))}>+100\uB9CC</button>
            <button type="button" onClick={() => updatePlayer((player) => ({ ...player, capital: player.capital + 10000000 }))}>+1000\uB9CC</button>
          </CheatRow>
          <CheatRow label={TEXT.health}>
            <button type="button" onClick={() => updatePlayer((player) => ({ ...player, health: player.maxHealth ?? 10 }))}>{TEXT.full}</button>
          </CheatRow>
          <CheatRow label={TEXT.credit}>
            <button type="button" onClick={() => useGameStore.setState({ creditScore: 100 })}>100</button>
          </CheatRow>
          <CheatRow label={TEXT.phase}>
            {PHASES.map((phase) => (
              <button key={phase.id} type="button" onClick={() => useGameStore.setState({ phase: phase.id })}>
                {phase.label}
              </button>
            ))}
          </CheatRow>
          <CheatRow label={TEXT.quality}>
            <button type="button" onClick={() => updatePlayer((player) => ({ ...player, maxQuality: (player.maxQuality ?? 0) + 10 }))}>+10</button>
            <button type="button" onClick={() => updatePlayer((player) => ({ ...player, maxQuality: (player.maxQuality ?? 0) + 50 }))}>+50</button>
          </CheatRow>
          <CheatRow label={TEXT.achievements}>
            <button
              type="button"
              onClick={() => useGameStore.setState({
                unlockedAchievements: Object.freeze(ACHIEVEMENTS.map((achievement) => achievement.id)),
                newAchievements: Object.freeze([]),
              })}
            >
              {TEXT.all}
            </button>
          </CheatRow>
        </section>
      ) : null}
    </aside>
  );
}

function CheatRow({ label, children }) {
  return (
    <div className="cr2-cheat-row">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}
