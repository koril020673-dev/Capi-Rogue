export const CREDIT_SCORE_START = 70;
export const CREDIT_SCORE_MIN = 0;
export const CREDIT_SCORE_MAX = 100;

export const CREDIT_GRADES = Object.freeze({
  A: Object.freeze({
    grade: 'A',
    min: 80,
    max: 100,
    annualInterestRate: 0.045,
    loanLimitCapitalMultiplier: 3,
  }),
  B: Object.freeze({
    grade: 'B',
    min: 60,
    max: 79,
    annualInterestRate: 0.065,
    loanLimitCapitalMultiplier: 2,
  }),
  C: Object.freeze({
    grade: 'C',
    min: 40,
    max: 59,
    annualInterestRate: 0.09,
    loanLimitCapitalMultiplier: 1,
  }),
  D: Object.freeze({
    grade: 'D',
    min: 0,
    max: 39,
    annualInterestRate: null,
    loanLimitCapitalMultiplier: 0,
  }),
});

export const CREDIT_SCORE_CHANGES = Object.freeze({
  PROFIT: 1,
  INTEREST_PAID: 2,
  FULL_PRINCIPAL_REPAYMENT: 5,
  PROFIT_STREAK_3: 1,
  MARKET_SHARE_LEADER: 1,
  LOSS: -2,
  NEGATIVE_CAPITAL_TURN: -5,
  INTEREST_OVERDUE: -4,
  PRINCIPAL_UNPAID_STACK: -3,
  NEAR_BANKRUPTCY_3_NEGATIVE_TURNS: -10,
  RATE_HIKE_EVENT: -2,
  RIVAL_DUMPING_DAMAGE: -1,
});

export const CREDIT_ADVISOR_MODIFIERS = Object.freeze({
  guardianNegativeReduction: 1,
  analystPreviewTurns: 1,
  raiderPositiveBonus: 1,
  gamblerChangeMultiplier: 1.5,
});

export const CREDIT_RATE_EFFECTS = Object.freeze({
  RATE_HIKE_EVENT_ID: 'E01',
  RATE_CUT_EVENT_ID: 'E02',
  RATE_HIKE_DELTA: 0.015,
  RATE_CUT_DELTA: -0.01,
  GUARDIAN_DELTA: -0.01,
});

export const CREDIT_GRADE_ORDER = Object.freeze(['D', 'C', 'B', 'A']);
