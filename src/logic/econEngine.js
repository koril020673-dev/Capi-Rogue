import {
  ECONOMIC_PHASE_DEMAND_MULTIPLIERS,
  ECONOMIC_PHASE_ORDER,
  ECONOMIC_PHASE_TRANSITIONS,
  ECONOMIC_PHASES,
} from '../constants/economy';

export function getEconomicPhaseIndex(phase) {
  return ECONOMIC_PHASE_ORDER.indexOf(phase);
}

export function isValidEconomicPhase(phase) {
  return getEconomicPhaseIndex(phase) !== -1;
}

export function getDemandMultiplierForPhase(phase) {
  return ECONOMIC_PHASE_DEMAND_MULTIPLIERS[phase] ?? 1;
}

export function getAdjacentEconomicPhases(phase) {
  const phaseIndex = getEconomicPhaseIndex(phase);

  if (phaseIndex === -1) {
    return Object.freeze([]);
  }

  return Object.freeze(
    ECONOMIC_PHASE_ORDER.filter((_, index) => Math.abs(index - phaseIndex) <= 1),
  );
}

export function canTransitionEconomicPhase(fromPhase, toPhase) {
  const fromIndex = getEconomicPhaseIndex(fromPhase);
  const toIndex = getEconomicPhaseIndex(toPhase);

  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }

  return Math.abs(fromIndex - toIndex) <= 1;
}

export function pickNextEconomicPhase(currentPhase, randomValue = Math.random()) {
  const transitions =
    ECONOMIC_PHASE_TRANSITIONS[currentPhase] ??
    ECONOMIC_PHASE_TRANSITIONS[ECONOMIC_PHASES.STABLE];

  const normalizedRandomValue = clamp(randomValue, 0, 0.999999);
  let cursor = 0;

  for (const [phase, probability] of Object.entries(transitions)) {
    cursor += probability;

    if (normalizedRandomValue < cursor) {
      return phase;
    }
  }

  return Object.keys(transitions).at(-1) ?? ECONOMIC_PHASES.STABLE;
}

export function applyEconomicPhaseShift(currentPhase, randomValue = Math.random()) {
  const nextPhase = pickNextEconomicPhase(currentPhase, randomValue);

  return Object.freeze({
    previousPhase: isValidEconomicPhase(currentPhase)
      ? currentPhase
      : ECONOMIC_PHASES.STABLE,
    nextPhase,
    changed: currentPhase !== nextPhase,
    demandMultiplier: getDemandMultiplierForPhase(nextPhase),
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
