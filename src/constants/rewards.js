export const REWARD_GRADES = Object.freeze({
  NORMAL: 'normal',
  RARE: 'rare',
  EPIC: 'epic',
  LEGEND: 'legend',
});

export const REWARD_GRADE_LABELS = Object.freeze({
  [REWARD_GRADES.NORMAL]: 'Normal',
  [REWARD_GRADES.RARE]: 'Rare',
  [REWARD_GRADES.EPIC]: 'Epic',
  [REWARD_GRADES.LEGEND]: 'Legend',
});

export const REWARD_CARDS = Object.freeze([
  Object.freeze({
    id: 'cash-buffer',
    grade: REWARD_GRADES.NORMAL,
    title: '\uD604\uAE08 \uC644\uCDA9\uC7AC',
    description: '\uC790\uBCF8 +230\uB9CC\uC6D0',
    effect: Object.freeze({ type: 'capital', amount: 2300000 }),
  }),
  Object.freeze({
    id: 'small-health-kit',
    grade: REWARD_GRADES.NORMAL,
    title: '\uAE34\uAE09 \uD68C\uBCF5',
    description: '\uACBD\uC601 \uCCB4\uB825 +1',
    effect: Object.freeze({ type: 'health', amount: 1 }),
  }),
  Object.freeze({
    id: 'local-buzz',
    grade: REWARD_GRADES.NORMAL,
    title: '\uC9C0\uC5ED \uC785\uC18C\uBB38',
    description: '\uC778\uC9C0\uB3C4 +0.04',
    effect: Object.freeze({ type: 'awareness', amount: 0.04 }),
  }),
  Object.freeze({
    id: 'lean-process',
    grade: REWARD_GRADES.RARE,
    title: '\uB0AD\uBE44 \uC81C\uAC70',
    description: '\uC6D0\uAC00 -5%',
    effect: Object.freeze({ type: 'unitCostMultiplier', multiplier: 0.95 }),
  }),
  Object.freeze({
    id: 'brand-story',
    grade: REWARD_GRADES.RARE,
    title: '\uBE0C\uB79C\uB4DC \uC2A4\uD1A0\uB9AC',
    description: '\uBE0C\uB79C\uB4DC +2',
    effect: Object.freeze({ type: 'brand', amount: 2 }),
  }),
  Object.freeze({
    id: 'credit-line',
    grade: REWARD_GRADES.RARE,
    title: '\uC2E0\uC6A9 \uD55C\uB3C4',
    description: '\uD06C\uB808\uB527 +2',
    effect: Object.freeze({ type: 'creditTokens', amount: 2 }),
  }),
  Object.freeze({
    id: 'precision-line',
    grade: REWARD_GRADES.EPIC,
    title: '\uC815\uBC00 \uC0DD\uC0B0\uB77C\uC778',
    description: '\uCD5C\uACE0 \uD488\uC9C8 +2, \uC6D0\uAC00 -3%',
    effect: Object.freeze({ type: 'qualityAndCost', quality: 2, costMultiplier: 0.97 }),
  }),
  Object.freeze({
    id: 'viral-month',
    grade: REWARD_GRADES.EPIC,
    title: '\uBC14\uC774\uB7F4 \uC6D4',
    description: '\uB2E4\uC74C 3\uAC1C\uC6D4 \uC218\uC694 +18%',
    effect: Object.freeze({ type: 'temporaryDemandBoost', multiplier: 1.18, duration: 3 }),
  }),
  Object.freeze({
    id: 'rd-gate',
    grade: REWARD_GRADES.EPIC,
    title: 'R&D \uAC8C\uC774\uD2B8',
    description: '\uCC54\uD53C\uC5B8 \uB77C\uC774\uBC8C \uB4F1\uC7A5, \uD488\uC9C8 +3',
    effect: Object.freeze({ type: 'unlockChampion', quality: 3 }),
  }),
  Object.freeze({
    id: 'terminal-monopoly',
    grade: REWARD_GRADES.LEGEND,
    title: '\uD130\uBBF8\uB110 \uB3C5\uC810\uAD8C',
    description: '\uC778\uC9C0\uB3C4 +0.12, \uBE0C\uB79C\uB4DC +4',
    effect: Object.freeze({ type: 'awarenessAndBrand', awareness: 0.12, brand: 4 }),
  }),
  Object.freeze({
    id: 'phoenix-ledger',
    grade: REWARD_GRADES.LEGEND,
    title: '\uD53C\uB2C9\uC2A4 \uC7A5\uBD80',
    description: '\uACBD\uC601 \uCCB4\uB825 +3, \uBE5A -300\uB9CC\uC6D0',
    effect: Object.freeze({ type: 'healthAndDebt', health: 3, debt: 3000000 }),
  }),
]);
