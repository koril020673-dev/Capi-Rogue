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
  [ECONOMIC_PHASES.BOOM]: 1.35,
  [ECONOMIC_PHASES.GROWTH]: 1.15,
  [ECONOMIC_PHASES.STABLE]: 1,
  [ECONOMIC_PHASES.CONTRACTION]: 0.82,
  [ECONOMIC_PHASES.RECESSION]: 0.62,
});

export const ECONOMIC_PHASE_TRANSITIONS = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: Object.freeze({
    [ECONOMIC_PHASES.BOOM]: 0.62,
    [ECONOMIC_PHASES.GROWTH]: 0.38,
  }),
  [ECONOMIC_PHASES.GROWTH]: Object.freeze({
    [ECONOMIC_PHASES.BOOM]: 0.18,
    [ECONOMIC_PHASES.GROWTH]: 0.52,
    [ECONOMIC_PHASES.STABLE]: 0.3,
  }),
  [ECONOMIC_PHASES.STABLE]: Object.freeze({
    [ECONOMIC_PHASES.GROWTH]: 0.24,
    [ECONOMIC_PHASES.STABLE]: 0.52,
    [ECONOMIC_PHASES.CONTRACTION]: 0.24,
  }),
  [ECONOMIC_PHASES.CONTRACTION]: Object.freeze({
    [ECONOMIC_PHASES.STABLE]: 0.28,
    [ECONOMIC_PHASES.CONTRACTION]: 0.52,
    [ECONOMIC_PHASES.RECESSION]: 0.2,
  }),
  [ECONOMIC_PHASES.RECESSION]: Object.freeze({
    [ECONOMIC_PHASES.CONTRACTION]: 0.34,
    [ECONOMIC_PHASES.RECESSION]: 0.66,
  }),
});

export const ECONOMIC_PHASE_CONSUMER_RATIOS = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: Object.freeze({
    valueSeekers: 0.18,
    mainstream: 0.34,
    premium: 0.33,
    experimental: 0.15,
  }),
  [ECONOMIC_PHASES.GROWTH]: Object.freeze({
    valueSeekers: 0.24,
    mainstream: 0.38,
    premium: 0.26,
    experimental: 0.12,
  }),
  [ECONOMIC_PHASES.STABLE]: Object.freeze({
    valueSeekers: 0.34,
    mainstream: 0.4,
    premium: 0.18,
    experimental: 0.08,
  }),
  [ECONOMIC_PHASES.CONTRACTION]: Object.freeze({
    valueSeekers: 0.46,
    mainstream: 0.35,
    premium: 0.13,
    experimental: 0.06,
  }),
  [ECONOMIC_PHASES.RECESSION]: Object.freeze({
    valueSeekers: 0.58,
    mainstream: 0.29,
    premium: 0.08,
    experimental: 0.05,
  }),
});

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
