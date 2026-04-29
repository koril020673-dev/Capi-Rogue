import { create } from 'zustand';
import { ECONOMIC_PHASES } from '../constants/economy';
import {
  BANK_ACTION_IDS,
  DEFAULT_STRATEGY_SELECTION,
  MARKETING_TIERS,
  OPERATION_STRATEGY_IDS,
  PRICE_OPTIONS,
  QUALITY_OPTIONS,
  STRATEGY_TABS,
} from '../constants/strategies';
import { ADVISORS } from '../constants/advisors';
import { applyAdvisorStartBonus, getAdvisorById } from '../logic/advisorEngine';
import { applyHealthDelta, calculateHealthDeltaFromProfit, getScheduledHealthRecovery, isGameOverHealth } from '../logic/healthEngine';
import { updateMomentumHistory, getMomentumScore } from '../logic/momentumEngine';
import { addExternalEventEffect, applyEffectBundleToPlayer, drawInternalEvent, expireMarketEffects, resolveInternalChoice, selectExternalEvent } from '../logic/eventEngine';
import { applyEconomicPhaseShift } from '../logic/econEngine';
import { calculateSettlement, buildOperationalMarketPreview } from '../logic/settlementEngine';
import { activateRivalsForFloor, createInitialRivals, processRivalRespawn } from '../logic/rivalEngine';
import { generateRewardOptions, applyRewardToPlayer, getRewardCreditGrant, isRewardFloor } from '../logic/rewardEngine';
import { spendCreditTokens, canSpendCreditTokens } from '../logic/creditEngine';
import { createSaveSnapshot, loadGameFromLocalStorage, saveGameToLocalStorage } from '../logic/saveEngine';

export const SCREEN_IDS = Object.freeze({
  LOGIN: 'login',
  TITLE: 'title',
  ADVISOR_SELECT: 'advisor-select',
  MAIN: 'main',
  EVENT: 'event',
  SETTLEMENT: 'settlement',
  RESULT: 'result',
  REWARD: 'reward',
  GAME_OVER: 'game-over',
});

const INITIAL_PLAYER = Object.freeze({
  companyName: '\uB0B4 \uD68C\uC0AC',
  capital: 35000000,
  debt: 3000000,
  health: 10,
  creditTokens: 0,
  unitCost: 20000,
  maxQuality: 10,
  brand: 6,
  awareness: 0.08,
  efficiency: 1,
  resistance: 0.09,
  factoryLevel: 1,
  qualityUpgradeStreak: 0,
  costUpgradeStreak: 0,
});

const INITIAL_LOGIN = Object.freeze({
  userId: '',
  password: '',
  error: '',
});

function createRunState(advisorId) {
  const advisorPlayer = applyAdvisorStartBonus(INITIAL_PLAYER, advisorId);

  return Object.freeze({
    screen: SCREEN_IDS.MAIN,
    session: Object.freeze({ mode: 'guest', userId: '' }),
    selectedAdvisorId: advisorId,
    floor: 1,
    phase: ECONOMIC_PHASES.STABLE,
    player: advisorPlayer,
    strategy: { ...DEFAULT_STRATEGY_SELECTION },
    rivals: createInitialRivals(),
    marketEffects: Object.freeze([]),
    currentExternalEvent: null,
    lastExternalEvent: null,
    currentInternalEvent: null,
    currentInternalOutcome: null,
    currentSettlement: null,
    currentResult: null,
    rewardOptions: Object.freeze([]),
    momentumHistory: Object.freeze([]),
    timeline: Object.freeze([]),
    championUnlocked: false,
    runOutcome: null,
  });
}

const baseState = Object.freeze({
  screen: SCREEN_IDS.LOGIN,
  login: INITIAL_LOGIN,
  session: Object.freeze({ mode: 'guest', userId: '' }),
  selectedAdvisorId: ADVISORS[0].id,
  unlockedAdvisorOrder: 1,
  legacyCards: Object.freeze([]),
  floor: 1,
  phase: ECONOMIC_PHASES.STABLE,
  player: INITIAL_PLAYER,
  strategy: { ...DEFAULT_STRATEGY_SELECTION },
  rivals: createInitialRivals(0.5),
  marketEffects: Object.freeze([]),
  currentExternalEvent: null,
  lastExternalEvent: null,
  currentInternalEvent: null,
  currentInternalOutcome: null,
  currentSettlement: null,
  currentResult: null,
  rewardOptions: Object.freeze([]),
  momentumHistory: Object.freeze([]),
  timeline: Object.freeze([]),
  championUnlocked: false,
  runOutcome: null,
});

export const useGameStore = create((set, get) => ({
  ...baseState,

  setLoginField(field, value) {
    set((state) => ({
      login: Object.freeze({
        ...state.login,
        [field]: value,
        error: '',
      }),
    }));
  },

  login() {
    const { userId, password } = get().login;

    if (!userId.trim() || !password.trim()) {
      set((state) => ({
        login: Object.freeze({
          ...state.login,
          error: '\uD504\uB85C\uD544 \uC774\uB984\uACFC \uD655\uC778 \uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
        }),
      }));
      return;
    }

    const savedGame = loadGameFromLocalStorage();

    set({
      session: Object.freeze({ mode: 'account', userId: userId.trim() }),
      screen: SCREEN_IDS.TITLE,
      unlockedAdvisorOrder: savedGame?.unlockedAdvisorOrder ?? get().unlockedAdvisorOrder,
      legacyCards: Object.freeze(savedGame?.legacyCards ?? get().legacyCards),
    });
  },

  enterGuestMode() {
    set({
      session: Object.freeze({ mode: 'guest', userId: '' }),
      screen: SCREEN_IDS.TITLE,
      login: INITIAL_LOGIN,
    });
  },

  goToAdvisorSelect() {
    set({ screen: SCREEN_IDS.ADVISOR_SELECT });
  },

  selectAdvisor(advisorId) {
    set({ selectedAdvisorId: advisorId });
  },

  startRun(advisorId = get().selectedAdvisorId) {
    const nextRunState = createRunState(advisorId);
    const preparedFloor = prepareFloor(nextRunState);

    set((state) => ({
      ...nextRunState,
      session: state.session,
      unlockedAdvisorOrder: state.unlockedAdvisorOrder,
      legacyCards: state.legacyCards,
      ...preparedFloor,
    }));
  },

  confirmExternalEvent() {
    set({ screen: SCREEN_IDS.MAIN, currentExternalEvent: null });
  },

  setActiveTab(tabId) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        activeTab: tabId,
      }),
    }));
  },

  selectPriceOption(priceOptionId) {
    const selectedOption = PRICE_OPTIONS.find((option) => option.id === priceOptionId);

    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        priceOptionId,
        activeTab: STRATEGY_TABS.PRICE,
        marketingTier:
          selectedOption?.tier === 'low' ? MARKETING_TIERS.HIGH : state.strategy.marketingTier,
      }),
    }));
  },

  setSalesControl(salesControlId) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        salesControlId,
        activeTab: STRATEGY_TABS.PRICE,
      }),
    }));
  },

  setCustomPrice(customPrice) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        customPrice: Number(customPrice),
      }),
    }));
  },

  selectSalesQuantityOption(salesQuantityOptionId) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        salesQuantityOptionId,
        activeTab: STRATEGY_TABS.PRICE,
      }),
    }));
  },

  setCustomSalesQuantity(customSalesQuantity) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        customSalesQuantity: Number(customSalesQuantity),
      }),
    }));
  },

  selectQualityOption(qualityOptionId) {
    const selectedOption = QUALITY_OPTIONS.find((option) => option.id === qualityOptionId);

    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        qualityOptionId,
        marketingTier:
          selectedOption?.tier === 'high' && state.strategy.marketingTier === MARKETING_TIERS.NONE
            ? MARKETING_TIERS.NORMAL
            : state.strategy.marketingTier,
      }),
    }));
  },

  selectOperationOption(operationOptionId) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        operationOptionId,
        activeTab: STRATEGY_TABS.OPERATIONS,
        bankActionId:
          operationOptionId === OPERATION_STRATEGY_IDS.BANKING
            ? state.strategy.bankActionId
            : BANK_ACTION_IDS.NONE,
      }),
    }));
  },

  setFactoryUpgradeFocus(factoryUpgradeFocus) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        factoryUpgradeFocus,
        operationOptionId: OPERATION_STRATEGY_IDS.FACTORY_UPGRADE,
        bankActionId: BANK_ACTION_IDS.NONE,
      }),
    }));
  },

  setBankAction(bankActionId) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        bankActionId,
        operationOptionId: OPERATION_STRATEGY_IDS.BANKING,
        factoryUpgradeFocus: state.strategy.factoryUpgradeFocus,
      }),
    }));
  },

  setOperationAmount(field, value) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        [field]: Number(value),
      }),
    }));
  },

  proceedAfterStrategy() {
    const internalEvent = drawInternalEvent({ randomValue: Math.random() });

    if (internalEvent) {
      set({
        currentInternalEvent: internalEvent,
        currentInternalOutcome: null,
        screen: SCREEN_IDS.EVENT,
      });
      return;
    }

    settleCurrentMonth(set, get, null);
  },

  chooseInternalEventOption(choiceId) {
    const state = get();
    const choice = state.currentInternalEvent?.choices.find((item) => item.id === choiceId);

    if (!choice) {
      return;
    }

    const outcome = resolveInternalChoice(choice, Math.random());
    const affectedPlayer = applyEffectBundleToPlayer(state.player, outcome.effects);

    set({
      player: affectedPlayer,
      currentInternalOutcome: Object.freeze({
        choiceLabel: choice.label,
        tier: choice.tier,
        ...outcome,
      }),
    });

    settleCurrentMonth(set, get, outcome);
  },

  showResult() {
    set({ screen: SCREEN_IDS.RESULT });
  },

  continueFromResult() {
    const state = get();

    if (state.currentResult?.gameOver) {
      finishRun(set, get, 'bankrupt');
      return;
    }

    if (state.floor >= 120) {
      finishRun(set, get, 'clear');
      return;
    }

    if (isRewardFloor(state.floor)) {
      const advisor = getAdvisorById(state.selectedAdvisorId);
      const rewardOptions = generateRewardOptions({
        floor: state.floor,
        momentumScore: getMomentumScore(state.momentumHistory),
        advisorLuck: advisor.stats.rewardLuck,
      });

      set({
        rewardOptions,
        screen: SCREEN_IDS.REWARD,
      });
      return;
    }

    advanceToNextFloor(set, get);
  },

  chooseReward(rewardId) {
    const state = get();
    const reward = state.rewardOptions.find((item) => item.id === rewardId);

    if (!reward) {
      return;
    }

    const rewardResult = applyRewardToPlayer(state.player, reward);
    const creditGrant = getRewardCreditGrant(state.floor);
    const rewardEffect = rewardResult.marketEffect
      ? Object.freeze({
          ...rewardResult.marketEffect,
          expiresOnFloor: state.floor + rewardResult.marketEffect.duration,
        })
      : null;

    set({
      player: Object.freeze({
        ...rewardResult.player,
        creditTokens: rewardResult.player.creditTokens + creditGrant,
      }),
      championUnlocked: state.championUnlocked || Boolean(rewardResult.championUnlocked),
      marketEffects: rewardEffect
        ? Object.freeze([...state.marketEffects, rewardEffect])
        : state.marketEffects,
      rewardOptions: Object.freeze([]),
    });

    advanceToNextFloor(set, get);
  },

  useCreditToken(effectId) {
    const state = get();

    if (!canSpendCreditTokens(state.player.creditTokens, 1)) {
      return;
    }

    if (effectId === 'recover-health') {
      set({
        player: Object.freeze({
          ...state.player,
          creditTokens: spendCreditTokens(state.player.creditTokens, 1),
          health: Math.min(10, state.player.health + 2),
        }),
      });
      return;
    }

    if (effectId === 'demand-boost') {
      set({
        player: Object.freeze({
          ...state.player,
          creditTokens: spendCreditTokens(state.player.creditTokens, 1),
        }),
        marketEffects: Object.freeze([
          ...state.marketEffects,
          Object.freeze({
            id: `credit-demand-${state.floor}`,
            eventId: 'credit-demand',
            title: '\uD06C\uB808\uB527 \uC218\uC694 \uBD80\uC2A4\uD2B8',
            background: 'trend',
            effects: Object.freeze({ demandMultiplier: 1.12 }),
            expiresOnFloor: state.floor + 2,
          }),
        ]),
      });
      return;
    }

    if (effectId === 'rival-freeze') {
      set({
        player: Object.freeze({
          ...state.player,
          creditTokens: spendCreditTokens(state.player.creditTokens, 1),
        }),
        marketEffects: Object.freeze([
          ...state.marketEffects,
          Object.freeze({
            id: `credit-freeze-${state.floor}`,
            eventId: 'credit-freeze',
            title: '\uB77C\uC774\uBC8C \uC815\uCCB4',
            background: 'inspection',
            effects: Object.freeze({ rivalEfficiencyMultiplier: 0.82 }),
            expiresOnFloor: state.floor + 1,
          }),
        ]),
      });
      return;
    }

    if (effectId === 'card-reroll' && state.currentInternalEvent) {
      const nextEvent = drawInternalEvent({ randomValue: Math.random(), chance: 1 });

      set({
        player: Object.freeze({
          ...state.player,
          creditTokens: spendCreditTokens(state.player.creditTokens, 1),
        }),
        currentInternalEvent: nextEvent,
      });
    }
  },

  restartToTitle() {
    set((state) => ({
      ...baseState,
      session: state.session,
      unlockedAdvisorOrder: state.unlockedAdvisorOrder,
      legacyCards: state.legacyCards,
      screen: SCREEN_IDS.TITLE,
    }));
  },
}));

export function selectMarketPreview(state) {
  return buildOperationalMarketPreview(state, 0.5);
}

function settleCurrentMonth(set, get, internalOutcome) {
  const state = get();
  const settlement = calculateSettlement(state, internalOutcome, Math.random());
  const healthDelta = calculateHealthDeltaFromProfit(
    settlement.profit,
    settlement.capitalBefore,
  );
  const totalHealthDelta = healthDelta + settlement.playerWarHealthDelta;
  const nextHealth = applyHealthDelta(settlement.playerAfterOperation.health, totalHealthDelta);
  const nextMomentumHistory = updateMomentumHistory(state.momentumHistory, settlement.profit);
  const result = Object.freeze({
    profit: settlement.profit,
    capitalChange: settlement.capitalAfter - settlement.capitalBefore,
    healthDelta: totalHealthDelta,
    momentumScore: getMomentumScore(nextMomentumHistory),
    hint: getEconomicsHint(settlement),
    gameOver: isGameOverHealth(nextHealth),
  });
  const timelineEntry = Object.freeze({
    floor: state.floor,
    phase: state.phase,
    price: settlement.demandSplit.find((item) => item.id === 'player')?.price ?? 0,
    quality: settlement.demandSplit.find((item) => item.id === 'player')?.quality ?? 0,
    profit: settlement.profit,
    healthAfter: nextHealth,
    eventTitle: state.lastExternalEvent?.title ?? state.currentInternalEvent?.title ?? '',
  });

  set({
    player: Object.freeze({
      ...settlement.playerAfterOperation,
      capital: settlement.capitalAfter,
      health: nextHealth,
    }),
    rivals: settlement.nextRivals,
    currentSettlement: settlement,
    currentResult: result,
    currentInternalEvent: null,
    momentumHistory: nextMomentumHistory,
    timeline: Object.freeze([...state.timeline, timelineEntry].slice(-12)),
    screen: SCREEN_IDS.SETTLEMENT,
  });
}

function prepareFloor(state) {
  const freshEffects = expireMarketEffects(state.marketEffects, state.floor);
  const advisor = getAdvisorById(state.selectedAdvisorId);
  const externalEvent =
    Math.random() < advisor.stats.eventShieldChance
      ? null
      : selectExternalEvent({ floor: state.floor, randomValue: Math.random() });
  const marketEffects = addExternalEventEffect(freshEffects, externalEvent, state.floor);

  return Object.freeze({
    marketEffects,
    currentExternalEvent: externalEvent,
    lastExternalEvent: externalEvent,
    currentInternalEvent: null,
    currentInternalOutcome: null,
    currentSettlement: null,
    currentResult: null,
    screen: externalEvent ? SCREEN_IDS.EVENT : SCREEN_IDS.MAIN,
  });
}

function advanceToNextFloor(set, get) {
  const state = get();
  const nextFloor = state.floor + 1;
  const phaseShift = applyEconomicPhaseShift(state.phase, Math.random());
  const respawnedRivals = processRivalRespawn(state.rivals);
  const activatedRivals = activateRivalsForFloor(respawnedRivals, nextFloor);
  const healthRecovery = getScheduledHealthRecovery(nextFloor);
  const recoveredPlayer = Object.freeze({
    ...state.player,
    health: Math.min(10, state.player.health + healthRecovery),
  });
  const nextState = Object.freeze({
    ...state,
    floor: nextFloor,
    phase: phaseShift.nextPhase,
    player: recoveredPlayer,
    rivals: activatedRivals,
    strategy: Object.freeze({
      ...state.strategy,
      activeTab: STRATEGY_TABS.PRICE,
    }),
  });

  set({
    floor: nextFloor,
    phase: phaseShift.nextPhase,
    player: recoveredPlayer,
    rivals: activatedRivals,
    strategy: nextState.strategy,
    ...prepareFloor(nextState),
  });
}

function finishRun(set, get, outcome) {
  const state = get();
  const legacyCard =
    outcome === 'bankrupt'
      ? Object.freeze({
          id: `legacy-bankrupt-${Date.now()}`,
          type: 'capitalBonus',
          title: '\uBD80\uB3C4\uC758 \uAD50\uD6C8',
          amount: 1300000,
        })
      : Object.freeze({
          id: `legacy-clear-${Date.now()}`,
          type: 'boomProbability',
          title: '\uD074\uB9AC\uC5B4 \uAE30\uB85D',
          amount: 0.04,
        });
  const unlockedAdvisorOrder = Math.min(
    ADVISORS.length,
    Math.max(state.unlockedAdvisorOrder, getUnlockedOrderFromFloor(state.floor, outcome)),
  );
  const nextLegacyCards =
    state.session.mode === 'guest'
      ? state.legacyCards
      : Object.freeze([...state.legacyCards, legacyCard]);

  set({
    runOutcome: outcome,
    unlockedAdvisorOrder,
    legacyCards: nextLegacyCards,
    screen: SCREEN_IDS.GAME_OVER,
  });

  if (state.session.mode !== 'guest') {
    saveGameToLocalStorage(
      createSaveSnapshot({
        ...state,
        unlockedAdvisorOrder,
        legacyCards: nextLegacyCards,
      }),
    );
  }
}

function getUnlockedOrderFromFloor(floor, outcome) {
  if (outcome === 'clear') {
    return ADVISORS.length;
  }

  if (floor >= 100) {
    return 9;
  }

  if (floor >= 80) {
    return 8;
  }

  if (floor >= 60) {
    return 7;
  }

  if (floor >= 40) {
    return 6;
  }

  if (floor >= 30) {
    return 5;
  }

  if (floor >= 20) {
    return 4;
  }

  if (floor >= 10) {
    return 3;
  }

  if (floor >= 5) {
    return 2;
  }

  return 1;
}

function getEconomicsHint(settlement) {
  const playerShare =
    settlement.demandSplit.find((participant) => participant.id === 'player')?.marketShare ?? 0;

  if (settlement.unsoldUnits > settlement.unitsSold * 0.25) {
    return '\uC218\uC694\uBCF4\uB2E4 \uB9CE\uC774 \uB9CC\uB4E4\uBA74 \uC7AC\uACE0 \uCC98\uBD84\uBE44\uAC00 \uB9C8\uC9C4\uC744 \uAE4E\uC544\uBA39\uC2B5\uB2C8\uB2E4.';
  }

  if (playerShare < 0.18) {
    return '\uC2DC\uC7A5\uC810\uC720\uC728\uC740 \uC0C1\uB300\uC801 \uB9E4\uB825\uB3C4\uC758 \uC81C\uACF1\uC73C\uB85C \uBE60\uB974\uAC8C \uBC8C\uC5B4\uC9D1\uB2C8\uB2E4.';
  }

  if (settlement.profit > 0) {
    return '\uAC00\uACA9\uACFC \uD488\uC9C8\uC774 \uB9DE\uC544\uB5A8\uC5B4\uC9C8 \uB54C \uB9E4\uCD9C\uBCF4\uB2E4 \uB9C8\uC9C4\uC774 \uBA3C\uC800 \uC0B4\uC544\uB0A9\uB2C8\uB2E4.';
  }

  return '\uC190\uC2E4\uC740 \uD604\uAE08\uBFD0 \uC544\uB2C8\uB77C \uC2E0\uB8B0\uC640 \uC120\uD0DD\uC9C0\uB97C \uC904\uC785\uB2C8\uB2E4.';
}
