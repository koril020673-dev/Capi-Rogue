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
import {
  applyAdvisorStartBonus,
  getAdvisorById,
  getAdvisorHealthDelta,
} from '../logic/advisorEngine';
import {
  applyHealthDelta,
  calculateHealthDeltaFromProfit,
  checkStreakBonus,
  eventHealthRecovery,
  getScheduledHealthRecovery,
  isGameOverHealth,
  rewardHealthRecovery,
} from '../logic/healthEngine';
import { updateMomentumHistory, getMomentumScore } from '../logic/momentumEngine';
import { addExternalEventEffect, applyEffectBundleToPlayer, drawInternalEvent, expireMarketEffects, resolveInternalChoice, rollRivalEvent, selectExternalEvent } from '../logic/eventEngine';
import { applyEconomicPhaseShift, getForcedPhase } from '../logic/econEngine';
import { calculateSettlement, buildOperationalMarketPreview } from '../logic/settlementEngine';
import { rollCostReduction, rollQualityUpgrade } from '../logic/factoryEngine';
import { extendLoan, repayLoan, takeLoan } from '../logic/loanEngine';
import { activateRivalsForFloor, createInitialRivals, processRivalRespawn } from '../logic/rivalEngine';
import { generateRewardOptions, applyRewardToPlayer, isRewardFloor } from '../logic/rewardEngine';
import {
  createSaveSnapshot,
  loadGameFromLocalStorage,
  saveGame,
  saveGameSlotToLocalStorage,
  saveOnFloorEnter,
  saveGameToLocalStorage,
} from '../logic/saveEngine';
import { getGameSettings } from '../logic/audioEngine';

export const SCREEN_IDS = Object.freeze({
  LOGIN: 'login',
  TITLE: 'title',
  RECORD: 'record',
  CHARACTER_CREATE: 'character-create',
  SLOT_SELECT: 'slot-select',
  ADVISOR_SELECT: 'advisor-select',
  MAIN: 'main',
  EVENT: 'event',
  SETTLEMENT: 'settlement',
  RESULT: 'result',
  REWARD: 'reward',
  GAME_OVER: 'game-over',
  ENDING: 'ending',
});

const INITIAL_PLAYER = Object.freeze({
  companyName: '\uB0B4 \uD68C\uC0AC',
  capital: 35000000,
  debt: 3000000,
  health: 10,
  unitCost: 3000,
  baseUnitCost: 3000,
  costReduction: 0,
  orderCap: 1000,
  maxQuality: 8,
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

const INITIAL_PLAYER_PROFILE = Object.freeze({
  profileId: null,
  playerName: '',
  companyName: '',
  profileImage: null,
  fullImage: null,
});

function createRunState(advisorId, playerProfile = INITIAL_PLAYER_PROFILE) {
  const advisorPlayer = applyAdvisorStartBonus(INITIAL_PLAYER, advisorId);

  return Object.freeze({
    screen: SCREEN_IDS.MAIN,
    session: Object.freeze({ mode: 'guest', userId: '' }),
    selectedAdvisorId: advisorId,
    selectedAdvisor: getAdvisorById(advisorId),
    floor: 1,
    phase: ECONOMIC_PHASES.STABLE,
    player: Object.freeze({
      ...advisorPlayer,
      companyName: playerProfile.companyName ?? advisorPlayer.companyName,
    }),
    strategy: { ...DEFAULT_STRATEGY_SELECTION },
    hasClickedStrategyTab: false,
    rivals: createInitialRivals(),
    marketEffects: Object.freeze([]),
    currentExternalEvent: null,
    currentRivalEvent: null,
    lastExternalEvent: null,
    currentInternalEvent: null,
    currentInternalOutcome: null,
    currentSettlement: null,
    currentResult: null,
    rewardOptions: Object.freeze([]),
    momentumHistory: Object.freeze([]),
    timeline: Object.freeze([]),
    metRivals: Object.freeze([]),
    playtime: 0,
    championUnlocked: false,
    creditScore: 70,
    qualityUpgradeCount: 0,
    costReductionCount: 0,
    factoryFailStreak: 0,
    costReductionFailStreak: 0,
    factoryActionThisTurn: null,
    loans: Object.freeze([]),
    loanMaturityNotice: null,
    runOutcome: null,
  });
}

const baseState = Object.freeze({
  screen: SCREEN_IDS.LOGIN,
  loginForm: INITIAL_LOGIN,
  session: Object.freeze({ mode: 'guest', userId: '' }),
  playerId: null,
  currentSlot: 1,
  playerProfile: INITIAL_PLAYER_PROFILE,
  selectedAdvisorId: ADVISORS[0].id,
  selectedAdvisor: ADVISORS[0],
  unlockedAdvisorOrder: ADVISORS.length,
  legacyCards: Object.freeze([]),
  floor: 1,
  phase: ECONOMIC_PHASES.STABLE,
  player: INITIAL_PLAYER,
  strategy: { ...DEFAULT_STRATEGY_SELECTION },
  hasClickedStrategyTab: false,
  rivals: createInitialRivals(0.5),
  marketEffects: Object.freeze([]),
  currentExternalEvent: null,
  currentRivalEvent: null,
  lastExternalEvent: null,
  currentInternalEvent: null,
  currentInternalOutcome: null,
  currentSettlement: null,
  currentResult: null,
  rewardOptions: Object.freeze([]),
  momentumHistory: Object.freeze([]),
  timeline: Object.freeze([]),
  isPaused: false,
  metRivals: Object.freeze([]),
  playtime: 0,
  championUnlocked: false,
  creditScore: 70,
  qualityUpgradeCount: 0,
  costReductionCount: 0,
  factoryFailStreak: 0,
  costReductionFailStreak: 0,
  factoryActionThisTurn: null,
  loans: Object.freeze([]),
  loanMaturityNotice: null,
  completedTutorials: Object.freeze([]),
  isTutorialEnabled: true,
  settings: getGameSettings(),
  runOutcome: null,
});

export const useGameStore = create((set, get) => ({
  ...baseState,

  setLoginField(field, value) {
    set((state) => ({
      loginForm: Object.freeze({
        ...state.loginForm,
        [field]: value,
        error: '',
      }),
    }));
  },

  submitLogin() {
    const { userId, password } = get().loginForm;

    if (!userId.trim() || !password.trim()) {
      set((state) => ({
        loginForm: Object.freeze({
          ...state.loginForm,
          error: '\uD504\uB85C\uD544 \uC774\uB984\uACFC \uD655\uC778 \uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
        }),
      }));
      return;
    }

    const savedGame = loadGameFromLocalStorage();

    set({
      session: Object.freeze({ mode: 'account', userId: userId.trim() }),
      screen: SCREEN_IDS.TITLE,
      currentSlot: savedGame?.currentSlot ?? 1,
      playerProfile: Object.freeze(savedGame?.playerProfile ?? INITIAL_PLAYER_PROFILE),
      unlockedAdvisorOrder: Math.max(
        ADVISORS.length,
        savedGame?.unlockedAdvisorOrder ?? get().unlockedAdvisorOrder,
      ),
      legacyCards: Object.freeze(savedGame?.legacyCards ?? get().legacyCards),
    });
  },

  enterGuestMode() {
    set({
      session: Object.freeze({ mode: 'guest', userId: '' }),
      screen: SCREEN_IDS.TITLE,
      loginForm: INITIAL_LOGIN,
      playerId: null,
      currentSlot: 1,
    });
  },

  setPlayerId(id) {
    set({ playerId: id ?? null });
  },

  setAuthenticatedSession(user) {
    set({
      playerId: user?.id ?? null,
      session: Object.freeze({ mode: user?.id ? 'account' : 'guest', userId: user?.username ?? '' }),
      screen: user?.id ? SCREEN_IDS.TITLE : SCREEN_IDS.LOGIN,
    });
  },

  setCurrentScreen(screen) {
    set({ screen });
  },

  setCurrentSlot(slotNumber) {
    const parsedSlotNumber = Math.round(Number(slotNumber) || 1);

    set({ currentSlot: Math.max(1, Math.min(5, parsedSlotNumber)) });
  },

  setPaused(isPaused) {
    set({ isPaused: Boolean(isPaused) });
  },

  togglePaused() {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  addMetRival(rivalId) {
    if (!rivalId) {
      return;
    }

    set((state) => {
      if (state.metRivals.includes(rivalId)) {
        return {};
      }

      return { metRivals: Object.freeze([...state.metRivals, rivalId]) };
    });
  },

  incrementPlaytime(seconds = 1) {
    set((state) => ({
      playtime: state.isPaused ? state.playtime : state.playtime + Math.max(0, Number(seconds) || 0),
    }));
  },

  addCompletedTutorial(id) {
    if (!id) {
      return;
    }

    set((state) => {
      if (state.completedTutorials.includes(id)) {
        return {};
      }

      const completedTutorials = Object.freeze([...state.completedTutorials, id]);

      return { completedTutorials };
    });

    persistTutorialProgress(get);
  },

  completeAllTutorials(ids = []) {
    set((state) => {
      const completedTutorials = Object.freeze([...new Set([...state.completedTutorials, ...ids])]);

      return { completedTutorials };
    });

    persistTutorialProgress(get);
  },

  resetTutorials() {
    set({ completedTutorials: Object.freeze([]) });
    persistTutorialProgress(get);
  },

  setTutorialEnabled(isTutorialEnabled) {
    set({ isTutorialEnabled: Boolean(isTutorialEnabled) });
  },

  setSettings(settings) {
    set((state) => ({
      settings: Object.freeze({
        ...state.settings,
        ...settings,
      }),
    }));
  },

  attemptFactoryUpgrade(focus, tierIndex = 0) {
    const state = get();
    const player = state.player;
    const randomValue = Math.random();
    const isQuality = focus === 'quality';
    const upgrade = isQuality
      ? rollQualityUpgrade(player, state.factoryFailStreak ?? 0, state.qualityUpgradeCount ?? 0, randomValue)
      : rollCostReduction(player, state.costReductionFailStreak ?? 0, state.costReductionCount ?? 0, randomValue);
    const nextPlayer = Object.freeze({
      ...upgrade.player,
      capital: Math.max(0, player.capital - upgrade.cost),
    });
    const result = Object.freeze({
      type: isQuality ? 'quality' : 'cost',
      success: upgrade.success,
      cost: upgrade.cost,
      gain: upgrade.gain,
      beforeQuality: player.maxQuality ?? player.quality ?? 0,
      afterQuality: upgrade.player.maxQuality ?? upgrade.player.quality ?? 0,
      beforeCost: player.unitCost ?? 0,
      afterCost: upgrade.player.unitCost ?? player.unitCost ?? 0,
      successRate: upgrade.successRate,
      nextFailStreak: upgrade.nextFailStreak,
    });

    set((current) => ({
      player: nextPlayer,
      factoryFailStreak: isQuality ? upgrade.nextFailStreak : current.factoryFailStreak,
      costReductionFailStreak: isQuality ? current.costReductionFailStreak : upgrade.nextFailStreak,
      qualityUpgradeCount: isQuality ? upgrade.nextUpgradeCount : current.qualityUpgradeCount,
      costReductionCount: isQuality ? current.costReductionCount : upgrade.nextUpgradeCount,
      strategy: Object.freeze({
        ...current.strategy,
        factoryUpgradeFocus: 'none',
      }),
    }));

    return result;
  },

  setFactoryAction(action) {
    if (!action) {
      set({ factoryActionThisTurn: null });
      return;
    }

    set({
      factoryActionThisTurn: Object.freeze({
        type: action.type === 'cost' ? 'cost' : 'quality',
        tierIndex: Math.max(0, Math.round(Number(action.tierIndex) || 0)),
        result: action.result ?? null,
      }),
    });
  },

  clearFactoryAction() {
    set({ factoryActionThisTurn: null });
  },

  applyLoan(loanResult) {
    if (!loanResult?.success || !loanResult.newLoan) {
      return;
    }

    set((state) => ({
      player: Object.freeze({
        ...state.player,
        capital: loanResult.newCapital ?? state.player.capital + loanResult.capitalIncrease,
        debt: loanResult.newDebt ?? state.player.debt + loanResult.capitalIncrease,
      }),
      loans: Object.freeze([...state.loans, loanResult.newLoan]),
    }));
  },

  takeLoan(loanType, requestedPrincipal = null) {
    const result = takeLoan(loanType, get(), requestedPrincipal);

    if (result.success) {
      get().applyLoan(result);
    }

    return result;
  },

  repayMaturedLoan(loanId) {
    const nextState = repayLoan(get(), loanId);

    set({
      player: nextState.player,
      loans: nextState.loans,
      creditScore: nextState.creditScore ?? get().creditScore,
      loanMaturityNotice: nextState.loans.some((loan) => (loan.remainingTurns ?? 0) <= 0)
        ? Object.freeze({
            message: '대출 만기가 도래했습니다. 원금을 상환하거나 연장하세요.',
            loans: Object.freeze(nextState.loans.filter((loan) => (loan.remainingTurns ?? 0) <= 0)),
          })
        : null,
    });
  },

  extendMaturedLoan(loanId) {
    const nextState = extendLoan(get(), loanId);

    set({
      loans: nextState.loans,
      loanMaturityNotice: nextState.loans.some((loan) => (loan.remainingTurns ?? 0) <= 0)
        ? Object.freeze({
            message: '대출 만기가 도래했습니다. 원금을 상환하거나 연장하세요.',
            loans: Object.freeze(nextState.loans.filter((loan) => (loan.remainingTurns ?? 0) <= 0)),
          })
        : null,
    });
  },

  dismissLoanMaturityNotice() {
    set({ loanMaturityNotice: null });
  },

  async saveCurrentGame(slotNumberOverride) {
    const state = get();
    const parsedSlotNumber = Math.round(Number(slotNumberOverride ?? state.currentSlot) || 1);
    const slotNumber = Math.max(1, Math.min(5, parsedSlotNumber));
    const snapshot = createSaveSnapshot({
      ...state,
      currentSlot: slotNumber,
    });

    saveGameSlotToLocalStorage(slotNumber, snapshot);
    await saveGame(snapshot, slotNumber);
    set({ currentSlot: slotNumber });

    return snapshot;
  },

  async saveAndExit(slotNumber) {
    await get().saveCurrentGame(slotNumber);
    set({ isPaused: false, screen: SCREEN_IDS.TITLE });
  },

  logout() {
    set({
      ...baseState,
      loginForm: INITIAL_LOGIN,
      session: Object.freeze({ mode: 'guest', userId: '' }),
      playerId: null,
      currentSlot: 1,
      isPaused: false,
    });
  },

  setPlayerProfile(profile) {
    set({
      playerProfile: Object.freeze({
        profileId: profile.profileId,
        playerName: profile.playerName,
        companyName: profile.companyName,
        profileImage: profile.profileImage,
        fullImage: profile.fullImage,
      }),
    });
  },

  completeCharacterCreate(profile) {
    const playerProfile = Object.freeze({
      profileId: profile.profileId,
      playerName: profile.playerName,
      companyName: profile.companyName,
      profileImage: profile.profileImage,
      fullImage: profile.fullImage,
    });

    set((state) => ({
      playerProfile,
      player: Object.freeze({
        ...state.player,
        companyName: playerProfile.companyName,
      }),
      screen: SCREEN_IDS.ADVISOR_SELECT,
    }));

    // TODO: Supabase 저장 연동.
    // profiles 테이블에 user_id, profile_id, player_name, company_name, created_at 저장.
    if (get().session.mode !== 'guest') {
      saveGameToLocalStorage(
        createSaveSnapshot({
          ...get(),
          playerProfile,
        }),
      );
    }
  },

  goToAdvisorSelect() {
    set({ screen: SCREEN_IDS.ADVISOR_SELECT });
  },

  selectAdvisor(advisorId) {
    set({ selectedAdvisorId: advisorId, selectedAdvisor: getAdvisorById(advisorId) });
  },

  setAdvisor(advisor) {
    const selectedAdvisor = getAdvisorById(advisor?.id);

    set({
      selectedAdvisorId: selectedAdvisor.id,
      selectedAdvisor,
    });
  },

  startRun(advisorId = get().selectedAdvisorId) {
    const nextRunState = createRunState(advisorId, get().playerProfile);
    const preparedFloor = prepareFloor(nextRunState);

    set((state) => ({
      ...nextRunState,
      session: state.session,
      playerProfile: state.playerProfile,
      unlockedAdvisorOrder: state.unlockedAdvisorOrder,
      legacyCards: state.legacyCards,
      completedTutorials: state.completedTutorials,
      isTutorialEnabled: state.isTutorialEnabled,
      hasClickedStrategyTab: nextRunState.hasClickedStrategyTab,
      ...preparedFloor,
    }));
  },

  confirmExternalEvent() {
    set({ currentExternalEvent: null, currentRivalEvent: null });
  },

  setActiveTab(tabId) {
    set((state) => ({
      strategy: Object.freeze({
        ...state.strategy,
        activeTab: tabId,
      }),
      hasClickedStrategyTab: true,
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
        [field]: value === '' ? '' : value,
      }),
    }));
  },

  proceedAfterStrategy() {
    const internalEvent = drawInternalEvent({ randomValue: Math.random(), gameState: get() });

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

    const outcome = resolveInternalChoice(choice, Math.random(), state.selectedAdvisorId, state);
    const affectedPlayer = applyEffectBundleToPlayer(state.player, outcome.effects);
    const eventRecovery = eventHealthRecovery(choice.type ?? choice.tier, outcome, state.selectedAdvisorId, state) ?? 0;
    const recoveredPlayer = eventRecovery > 0
      ? Object.freeze({
          ...affectedPlayer,
          health: Math.min(affectedPlayer.maxHealth ?? 10, affectedPlayer.health + eventRecovery),
        })
      : affectedPlayer;

    set({
      player: recoveredPlayer,
      currentInternalOutcome: Object.freeze({
        choiceLabel: choice.label,
        tier: choice.type ?? choice.tier,
        ...outcome,
      }),
    });
  },

  confirmInternalEventOutcome() {
    const state = get();

    settleCurrentMonth(set, get, state.currentInternalOutcome);
  },

  showResult() {
    set({ screen: SCREEN_IDS.SETTLEMENT });
  },

  async continueFromResult() {
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
      const rewardOptions = generateRewardOptions({
        floor: state.floor,
        momentumScore: getMomentumScore(state.momentumHistory),
      });

      set({
        rewardOptions,
        screen: SCREEN_IDS.REWARD,
      });
      return;
    }

    advanceToNextFloor(set, get);
    await saveOnFloorEnter(get());
  },

  async chooseReward(rewardId) {
    const state = get();
    const reward = state.rewardOptions.find((item) => item.id === rewardId);

    if (!reward) {
      return;
    }

    const rewardResult = applyRewardToPlayer(state.player, reward);
    const gradeRecovery = rewardHealthRecovery(reward.grade);
    const maxHealth = rewardResult.player.maxHealth ?? 10;
    const playerAfterRecovery = gradeRecovery === 'FULL'
      ? Object.freeze({ ...rewardResult.player, health: maxHealth })
      : gradeRecovery
        ? Object.freeze({
            ...rewardResult.player,
            health: Math.min(maxHealth, rewardResult.player.health + gradeRecovery),
          })
        : rewardResult.player;
    const rewardEffect = rewardResult.marketEffect
      ? Object.freeze({
          ...rewardResult.marketEffect,
          expiresOnFloor: state.floor + rewardResult.marketEffect.duration,
        })
      : null;

    set({
      player: playerAfterRecovery,
      championUnlocked: state.championUnlocked || Boolean(rewardResult.championUnlocked),
      marketEffects: rewardEffect
        ? Object.freeze([...state.marketEffects, rewardEffect])
        : state.marketEffects,
      rewardOptions: Object.freeze([]),
    });

    advanceToNextFloor(set, get);
    await saveOnFloorEnter(get());
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
  const totalHealthDelta = getAdvisorHealthDelta(
    state.selectedAdvisorId,
    healthDelta + settlement.playerWarHealthDelta,
  );
  const nextMomentumHistory = updateMomentumHistory(state.momentumHistory, settlement.profit);
  const nextTimeline = Object.freeze([
    ...state.timeline,
    Object.freeze({
      floor: state.floor,
      phase: state.phase,
      price: settlement.demandSplit.find((item) => item.id === 'player')?.price ?? 0,
      quality: settlement.demandSplit.find((item) => item.id === 'player')?.quality ?? 0,
      revenue: settlement.revenue,
      profit: settlement.profit,
      marketShare: settlement.demandSplit.find((item) => item.id === 'player')?.marketShare ?? 0,
      unitsSold: settlement.unitsSold,
      healthAfter: 0,
      eventTitle: state.lastExternalEvent?.title ?? state.currentInternalEvent?.title ?? '',
    }),
  ].slice(-12));
  const streakRecovery = checkStreakBonus(
    Object.freeze({ ...state, timeline: nextTimeline, history: nextTimeline }),
    state.selectedAdvisorId,
  ) ?? 0;
  const nextHealth = applyHealthDelta(
    settlement.playerAfterOperation.health,
    totalHealthDelta + streakRecovery,
    settlement.playerAfterOperation.maxHealth ?? 10,
  );
  const result = Object.freeze({
    profit: settlement.profit,
    capitalChange: settlement.capitalAfter - settlement.capitalBefore,
    healthDelta: totalHealthDelta + streakRecovery,
    momentumScore: getMomentumScore(nextMomentumHistory),
    hint: getEconomicsHint(settlement),
    gameOver: isGameOverHealth(nextHealth),
  });
  const timelineEntry = Object.freeze({ ...nextTimeline.at(-1), healthAfter: nextHealth });

  set({
    player: Object.freeze({
      ...settlement.playerAfterOperation,
      capital: settlement.capitalAfter,
      health: nextHealth,
    }),
    rivals: settlement.nextRivals,
    loans: settlement.nextLoans,
    loanMaturityNotice: settlement.loanMaturity,
    creditScore: Math.max(0, Math.min(100, (state.creditScore ?? 70) + (settlement.creditScoreDelta ?? 0))),
    factoryFailStreak: settlement.factoryFailStreak ?? state.factoryFailStreak,
    costReductionFailStreak: settlement.costReductionFailStreak ?? state.costReductionFailStreak,
    qualityUpgradeCount: settlement.qualityUpgradeCount ?? state.qualityUpgradeCount,
    costReductionCount: settlement.costReductionCount ?? state.costReductionCount,
    factoryActionThisTurn: settlement.factoryResult
      ? Object.freeze({
          ...(state.factoryActionThisTurn ?? {}),
          result: settlement.factoryResult,
        })
      : state.factoryActionThisTurn,
    currentSettlement: settlement,
    currentResult: result,
    currentInternalEvent: null,
    momentumHistory: nextMomentumHistory,
    timeline: Object.freeze([...nextTimeline.slice(0, -1), timelineEntry]),
    screen: SCREEN_IDS.SETTLEMENT,
  });
}

function prepareFloor(state) {
  const freshEffects = expireMarketEffects(state.marketEffects, state.floor);
  const externalEvent = selectExternalEvent({ floor: state.floor, randomValue: Math.random() });
  const rivalEvent = rollRivalEvent(state.rivals, Math.random());
  const externalEffects = addExternalEventEffect(freshEffects, externalEvent, state.floor);
  const marketEffects = addExternalEventEffect(externalEffects, rivalEvent, state.floor);
  const forcedPhase = getForcedPhase(marketEffects);

  const metRivals = Object.freeze([
    ...new Set([
      ...(state.metRivals ?? []),
      ...state.rivals
        .filter((rival) => rival.active && !rival.defeated && !rival.bankrupt && !rival.respawning)
        .map((rival) => rival.profileId ?? rival.id),
    ]),
  ]);

  return Object.freeze({
    marketEffects,
    phase: forcedPhase ?? state.phase,
    currentExternalEvent: externalEvent,
    currentRivalEvent: rivalEvent,
    lastExternalEvent: externalEvent,
    currentInternalEvent: null,
    currentInternalOutcome: null,
    currentSettlement: null,
    currentResult: null,
    metRivals,
    screen: SCREEN_IDS.MAIN,
  });
}

function advanceToNextFloor(set, get) {
  const state = get();
  const nextFloor = state.floor + 1;
  const phaseShift = applyEconomicPhaseShift(
    state.phase,
    Math.random(),
    expireMarketEffects(state.marketEffects, nextFloor),
  );
  const respawnedRivals = processRivalRespawn(state.rivals);
  const latestShare = state.timeline.at(-1)?.marketShare ?? 0;
  const activatedRivals = activateRivalsForFloor(
    respawnedRivals,
    nextFloor,
    state.championUnlocked,
    latestShare,
  );
  const healthRecovery = getScheduledHealthRecovery(nextFloor, state.selectedAdvisorId);
  const recoveredPlayer = Object.freeze({
    ...state.player,
    health: Math.min(state.player.maxHealth ?? 10, state.player.health + healthRecovery),
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
    factoryActionThisTurn: null,
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
    screen: outcome === 'clear' ? SCREEN_IDS.ENDING : SCREEN_IDS.GAME_OVER,
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

function persistTutorialProgress(get) {
  const state = get();
  const snapshot = createSaveSnapshot(state);

  void saveGame(snapshot, state.currentSlot ?? 1);
}
