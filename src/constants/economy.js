export const ECONOMIC_PHASES = Object.freeze({
  BOOM: 'boom',
  GROWTH: 'growth',
  STABLE: 'stable',
  CONTRACTION: 'contraction',
  RECESSION: 'recession',
});

export const ECONOMIC_PHASE_ORDER = Object.freeze([
  ECONOMIC_PHASES.BOOM,
  ECONOMIC_PHASES.GROWTH,
  ECONOMIC_PHASES.STABLE,
  ECONOMIC_PHASES.CONTRACTION,
  ECONOMIC_PHASES.RECESSION,
]);

export const ECONOMIC_PHASE_LABELS = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: '\uD638\uD669',
  [ECONOMIC_PHASES.GROWTH]: '\uC131\uC7A5',
  [ECONOMIC_PHASES.STABLE]: '\uC548\uC815',
  [ECONOMIC_PHASES.CONTRACTION]: '\uC704\uCD95',
  [ECONOMIC_PHASES.RECESSION]: '\uBD88\uD669',
});

export const ECONOMIC_PHASE_DEMAND_MULTIPLIERS = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: 1.4,
  [ECONOMIC_PHASES.GROWTH]: 1.2,
  [ECONOMIC_PHASES.STABLE]: 1,
  [ECONOMIC_PHASES.CONTRACTION]: 0.8,
  [ECONOMIC_PHASES.RECESSION]: 0.6,
});

export const ECONOMIC_PHASE_TRANSITIONS = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: Object.freeze({
    [ECONOMIC_PHASES.BOOM]: 0.4,
    [ECONOMIC_PHASES.GROWTH]: 0.6,
    [ECONOMIC_PHASES.STABLE]: 0,
    [ECONOMIC_PHASES.CONTRACTION]: 0,
    [ECONOMIC_PHASES.RECESSION]: 0,
  }),
  [ECONOMIC_PHASES.GROWTH]: Object.freeze({
    [ECONOMIC_PHASES.BOOM]: 0.2,
    [ECONOMIC_PHASES.GROWTH]: 0.4,
    [ECONOMIC_PHASES.STABLE]: 0.4,
    [ECONOMIC_PHASES.CONTRACTION]: 0,
    [ECONOMIC_PHASES.RECESSION]: 0,
  }),
  [ECONOMIC_PHASES.STABLE]: Object.freeze({
    [ECONOMIC_PHASES.BOOM]: 0,
    [ECONOMIC_PHASES.GROWTH]: 0.3,
    [ECONOMIC_PHASES.STABLE]: 0.4,
    [ECONOMIC_PHASES.CONTRACTION]: 0.3,
    [ECONOMIC_PHASES.RECESSION]: 0,
  }),
  [ECONOMIC_PHASES.CONTRACTION]: Object.freeze({
    [ECONOMIC_PHASES.BOOM]: 0,
    [ECONOMIC_PHASES.GROWTH]: 0,
    [ECONOMIC_PHASES.STABLE]: 0.4,
    [ECONOMIC_PHASES.CONTRACTION]: 0.4,
    [ECONOMIC_PHASES.RECESSION]: 0.2,
  }),
  [ECONOMIC_PHASES.RECESSION]: Object.freeze({
    [ECONOMIC_PHASES.BOOM]: 0,
    [ECONOMIC_PHASES.GROWTH]: 0,
    [ECONOMIC_PHASES.STABLE]: 0,
    [ECONOMIC_PHASES.CONTRACTION]: 0.6,
    [ECONOMIC_PHASES.RECESSION]: 0.4,
  }),
});

export const ECONOMIC_PHASE_CONSUMER_RATIOS = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: Object.freeze({
    quality: 0.3,
    brand: 0.3,
    price: 0.2,
    general: 0.2,
  }),
  [ECONOMIC_PHASES.GROWTH]: Object.freeze({
    quality: 0.25,
    brand: 0.25,
    price: 0.25,
    general: 0.25,
  }),
  [ECONOMIC_PHASES.STABLE]: Object.freeze({
    quality: 0.2,
    brand: 0.2,
    price: 0.3,
    general: 0.3,
  }),
  [ECONOMIC_PHASES.CONTRACTION]: Object.freeze({
    quality: 0.15,
    brand: 0.15,
    price: 0.4,
    general: 0.3,
  }),
  [ECONOMIC_PHASES.RECESSION]: Object.freeze({
    quality: 0.1,
    brand: 0.1,
    price: 0.5,
    general: 0.3,
  }),
});

export const ECO_PHASES = Object.freeze(
  Object.fromEntries(
    ECONOMIC_PHASE_ORDER.map((phase) => [
      phase,
      Object.freeze({
        demandMultiplier: ECONOMIC_PHASE_DEMAND_MULTIPLIERS[phase],
        consumerRatio: ECONOMIC_PHASE_CONSUMER_RATIOS[phase],
      }),
    ]),
  ),
);

export const MARKOV_MATRIX = ECONOMIC_PHASE_TRANSITIONS;

export const FIXED_EVENT_FLOORS = Object.freeze([10, 20, 30, 45, 60, 80, 100]);

export const BASE_MONTHLY_DEMAND = 1000;

export const DEMAND_RANDOM_RANGE = Object.freeze({
  min: 0.9,
  max: 1.1,
});

export const FLOOR_TIER_DEMAND_MULTIPLIERS = Object.freeze([
  Object.freeze({ minFloor: 1, multiplier: 1 }),
  Object.freeze({ minFloor: 10, multiplier: 1.18 }),
  Object.freeze({ minFloor: 30, multiplier: 1.45 }),
  Object.freeze({ minFloor: 60, multiplier: 1.75 }),
  Object.freeze({ minFloor: 90, multiplier: 2.05 }),
  Object.freeze({ minFloor: 120, multiplier: 2.4 }),
]);
