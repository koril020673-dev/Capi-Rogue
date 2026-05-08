export const INITIAL_STATS = Object.freeze({
  playtime: 0,
  profitTurns: 0,
  lossTurns: 0,
  maxShare: 0,
  bankruptcyCount: 0,
  externalEventCount: 0,
  rivalEventCount: 0,
  eventSuccessCount: 0,
  eventTotalCount: 0,
  rivalDominated: 0,
  profitStreak: 0,
  shareFirstStreak: 0,
});

export const INITIAL_STRATEGY = Object.freeze({
  price: null,
  orderAmount: null,
  marketingBudget: 0,
  factoryAction: null,
  loanAction: null,
});

export const INITIAL_GAME_STATE = Object.freeze({
  floor: 1,
  isGameOver: false,
  isClear: false,
  clearGrade: null,
  bankruptcyTurns: 0,

  health: 10,
  maxHealth: 10,
  momentum: 0,
  momentumHistory: Object.freeze([]),

  capital: 5000000,
  debt: 0,
  loans: Object.freeze([]),
  creditScore: 70,

  quality: 8,
  cost: 3000,
  orderCap: 1000,
  costReductionTotal: 0,
  qualityUpgradeCount: 0,
  costReductionCount: 0,
  factoryFailStreak: 0,
  costReductionFailStreak: 0,

  brand: 2,
  awareness: 10,

  econPhase: 'stable',
  rivals: Object.freeze([]),
  metRivals: Object.freeze([]),
  playerShareHistory: Object.freeze([]),
  activeEffects: Object.freeze([]),
  currentExternalEvent: null,
  currentInternalEvent: null,

  factoryActionThisTurn: null,

  stats: INITIAL_STATS,

  unlockedAchievements: Object.freeze([]),
  newAchievements: Object.freeze([]),

  currentStrategy: INITIAL_STRATEGY,

  completedTutorials: Object.freeze([]),
});

export const INITIAL_STATE = INITIAL_GAME_STATE;

export function getAdvisorInitialState(advisorId) {
  if (advisorId === 'raider') {
    return Object.freeze({ maxHealth: 8, health: 8 });
  }

  if (['guardian', 'analyst', 'gambler'].includes(advisorId)) {
    return Object.freeze({ maxHealth: 10, health: 10 });
  }

  return Object.freeze({});
}

export function createInitialState(advisorId, playerProfile, slotNumber = 1) {
  return Object.freeze({
    ...INITIAL_GAME_STATE,
    ...getAdvisorInitialState(advisorId),
    stats: Object.freeze({ ...INITIAL_STATS }),
    currentStrategy: Object.freeze({ ...INITIAL_STRATEGY }),
    selectedAdvisor: advisorId,
    playerProfile,
    currentSlot: Math.max(1, Math.min(5, Number(slotNumber) || 1)),
  });
}
