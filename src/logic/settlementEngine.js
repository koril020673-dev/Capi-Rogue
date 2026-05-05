import {
  BANK_ACTION_IDS,
  FACTORY_UPGRADE_FOCUS,
  OPERATION_STRATEGY_IDS,
  PRICE_OPTIONS,
  PRICE_STRATEGY_IDS,
  QUALITY_STRATEGY_IDS,
  QUALITY_OPTIONS,
  SALES_QUANTITY_IDS,
  SALES_QUANTITY_OPTIONS,
} from '../constants/strategies';
import { applyAwarenessDecay, applyMarketingInvestment } from './awarenessEngine';
import {
  getAdvisorAttractionMultiplier,
  getAdvisorById,
  getAdvisorOrderCapMultiplier,
} from './advisorEngine';
import { calculateSelectedQuality } from './brandQualityEngine';
import { calculateTotalDemand } from './demandEngine';
import { getActiveMarketModifiers } from './eventEngine';
import { calculateDemandSplit } from './marketEngine';
import { getMomentumDemandModifier } from './momentumEngine';
import { checkLoanMaturity, processInterest, takeLoan, tickLoans } from './loanEngine';
import {
  COST_REDUCTION,
  QUALITY_UPGRADE,
  rollCostReduction,
  rollQualityUpgrade,
} from './factoryEngine';
import { buildRivalParticipants, resolveRivalWar } from './rivalEngine';

const QUALITY_COST_MULTIPLIERS = Object.freeze({
  [QUALITY_STRATEGY_IDS.BEST]: 1.25,
  [QUALITY_STRATEGY_IDS.BEST_0_8]: 1,
  [QUALITY_STRATEGY_IDS.BEST_0_5]: 0.78,
  [QUALITY_STRATEGY_IDS.BEST_0_3]: 0.62,
});

export function getSelectedPrice(strategy, unitCost) {
  const selectedOption = PRICE_OPTIONS.find((option) => option.id === strategy.priceOptionId);

  if (!selectedOption || selectedOption.id === PRICE_STRATEGY_IDS.CUSTOM) {
    return Math.max(1, Number(strategy.customPrice) || unitCost);
  }

  return Math.round(unitCost * selectedOption.multiplier);
}

export function getSelectedQuality(strategy, player) {
  const selectedOption = QUALITY_OPTIONS.find(
    (option) => option.id === strategy.qualityOptionId,
  );

  return calculateSelectedQuality(
    player.maxQuality,
    selectedOption?.multiplier ?? 0.8,
    0,
  );
}

export function buildPlayerParticipant(player, strategy, advisor, marketModifiers = {}) {
  const effectiveUnitCost = Math.max(
    1,
    Math.round(
      player.unitCost *
        marketModifiers.costMultiplier *
        getQualityCostMultiplier(strategy),
    ),
  );

  return Object.freeze({
    id: 'player',
    type: 'player',
    name: player.companyName,
    slotLabel: '\uB0B4 \uD68C\uC0AC',
    color: '#00FF41',
    price: getSelectedPrice(strategy, effectiveUnitCost),
    quality: getSelectedQuality(strategy, player) * marketModifiers.qualityMultiplier,
    brand: player.brand * (marketModifiers.brandMultiplier ?? 1),
    awareness: player.awareness * marketModifiers.awarenessMultiplier,
    efficiency: player.efficiency,
    resistance: player.resistance,
    capital: player.capital,
    unitCost: effectiveUnitCost,
    orderCap: player.orderCap,
    attractionMultiplier: getAdvisorAttractionMultiplier(advisor.id),
  });
}

export function buildMarketPreview(state, randomValue = 0.5) {
  const advisor = getAdvisorById(state.selectedAdvisorId);
  const marketModifiers = getActiveMarketModifiers(state.marketEffects, state.floor);
  const playerParticipant = buildPlayerParticipant(
    state.player,
    state.strategy,
    advisor,
    marketModifiers,
  );
  const rivalParticipants = buildRivalParticipants(
    state.rivals,
    state.floor,
    state.phase,
    marketModifiers,
  );
  const totalDemand = calculateTotalDemand({
    floor: state.floor,
    phase: state.phase,
    momentumModifier: getMomentumDemandModifier(state.momentumHistory),
    marketDemandModifier: marketModifiers.demandMultiplier,
    advisorDemandBonus: 0,
    randomValue,
  });
  const demandSplit = calculateDemandSplit(
    [playerParticipant, ...rivalParticipants],
    totalDemand,
    state.phase,
    marketModifiers.demandMultiplier,
  );

  return Object.freeze({
    totalDemand,
    marketModifiers,
    participants: demandSplit,
    player: demandSplit.find((participant) => participant.id === 'player'),
    rivals: demandSplit.filter((participant) => participant.type === 'rival'),
  });
}

export function buildOperationalMarketPreview(state, randomValue = 0.5) {
  const strategy = constrainStrategyByCapital(state, state.strategy);
  const operationResult = applyOperationBeforeSettlement(state, strategy, randomValue, false);
  const preview = buildMarketPreview(
    Object.freeze({ ...state, player: operationResult.player, strategy }),
    randomValue,
  );

  return Object.freeze({
    ...preview,
    operationExpense: operationResult.expense,
    operationCapitalChange: operationResult.player.capital - state.player.capital,
    operationNote: operationResult.note,
    playerAfterOperation: operationResult.player,
  });
}

export function getMarketingLimit(capital) {
  const safeCapital = Math.max(0, Number(capital) || 0);

  return Math.floor(safeCapital * 0.3);
}

export function calculateSettlement(state, internalOutcome = null, randomValue = Math.random()) {
  const strategy = constrainStrategyByCapital(state, state.strategy);
  const operationResult = applyOperationBeforeSettlement(state, strategy, randomValue, true);
  const interestResult = processInterest(Object.freeze({
    ...state,
    player: operationResult.player,
    loans: operationResult.loans ?? state.loans ?? [],
  }));
  const workingPlayer = operationResult.player;
  const preview = buildMarketPreview(
    Object.freeze({ ...state, player: workingPlayer, strategy }),
    randomValue,
  );
  const playerDemand = Math.round(
    preview.player.demand *
      Math.max(0, 1 - (preview.marketModifiers.playerDemandPenalty ?? 0)),
  );
  const effectiveOrderCap = Math.floor(
    (workingPlayer.orderCap ?? 1000) *
      getAdvisorOrderCapMultiplier(state.selectedAdvisorId) *
      preview.marketModifiers.orderCapMultiplier,
  );
  const plannedProduction = Math.floor(getPlannedProductionCount(strategy, preview.totalDemand));
  const maxAffordableProduction = getMaxOrderAmount(
    state.player.capital,
    preview.player.unitCost ?? workingPlayer.unitCost,
    effectiveOrderCap,
  );
  const validPlannedProduction = Math.min(plannedProduction, maxAffordableProduction);
  const unitsSold = Math.min(validPlannedProduction, playerDemand);
  const unsoldUnits = Math.max(0, validPlannedProduction - unitsSold);
  const productionCost = validPlannedProduction * preview.player.unitCost;
  const revenue = unitsSold * preview.player.price;
  const debtService = Math.round((workingPlayer.debt * 0.012) * preview.marketModifiers.debtCostMultiplier) +
    interestResult.interestDue;
  const disposalCost = Math.round(unsoldUnits * preview.player.unitCost * 0.18);
  const rawProfit =
    revenue -
    productionCost -
    disposalCost -
    debtService -
    operationResult.expense;
  const profit = Math.round(rawProfit * preview.marketModifiers.netProfitMultiplier);
  const capitalAfter = workingPlayer.capital + profit;
  const rivalWar = resolveRivalWar({
    rivals: state.rivals,
    floor: state.floor,
    phase: state.phase,
    playerProfit: profit,
    demandSplit: preview.participants,
  });
  const nextLoans = tickLoans(operationResult.loans ?? state.loans ?? []);

  return Object.freeze({
    totalDemand: preview.totalDemand,
    demandSplit: preview.participants,
    playerDemand,
    plannedProduction: validPlannedProduction,
    unitsSold,
    unsoldUnits,
    revenue,
    productionCost,
    disposalCost,
    debtService,
    operationExpense: operationResult.expense,
    operationNote: operationResult.note,
    factoryResult: operationResult.factoryResult ?? null,
    internalOutcome,
    profit,
    nextRivals: rivalWar.rivals,
    rivalResults: rivalWar.rivalResults,
    playerWarHealthDelta: rivalWar.playerWarHealthDelta,
    capitalBefore: state.player.capital,
    capitalAfter,
    playerAfterOperation: workingPlayer,
    nextLoans,
    loanMaturity: checkLoanMaturity(Object.freeze({ ...state, loans: nextLoans })),
    interestOverdue: interestResult.overdue,
    creditScoreDelta: interestResult.creditScoreDelta,
    factoryFailStreak: operationResult.factoryFailStreak,
    costReductionFailStreak: operationResult.costReductionFailStreak,
    qualityUpgradeCount: operationResult.qualityUpgradeCount,
    costReductionCount: operationResult.costReductionCount,
    marketModifiers: preview.marketModifiers,
  });
}

function applyOperationBeforeSettlement(state, strategy, randomValue = 0.5, processFactoryAction = false) {
  const player = applyAwarenessDecay(state.player);

  if (processFactoryAction && state.factoryActionThisTurn) {
    return applyReservedFactoryAction(state, player, randomValue);
  }

  if (strategy.operationOptionId === OPERATION_STRATEGY_IDS.FACTORY_UPGRADE) {
    return Object.freeze({
      player,
      loans: state.loans ?? [],
      expense: 0,
      note: state.factoryActionThisTurn ? '공장 작업 예약됨' : '\uACF5\uC7A5 \uC791\uC5C5 \uC5C6\uC74C',
      factoryFailStreak: state.factoryFailStreak ?? 0,
      costReductionFailStreak: state.costReductionFailStreak ?? 0,
      factoryResult: null,
    });
  }

  if (strategy.operationOptionId === OPERATION_STRATEGY_IDS.BANKING) {
    const bankActionId = strategy.bankActionId ?? BANK_ACTION_IDS.NONE;

    if (bankActionId === BANK_ACTION_IDS.BORROW) {
      const amount = Math.max(0, Number(strategy.bankBorrowAmount) || 2000000);
      const loanResult = takeLoan(
        strategy.loanTypeId ?? 'normal',
        Object.freeze({
          ...state,
          player,
          activeEffects: state.marketEffects ?? [],
        }),
        amount,
      );

      if (!loanResult.success) {
        return Object.freeze({
          player,
          loans: state.loans ?? [],
          expense: 0,
          note: loanResult.error ?? '\uB300\uCD9C \uC2E4\uD328',
          factoryFailStreak: state.factoryFailStreak ?? 0,
          costReductionFailStreak: state.costReductionFailStreak ?? 0,
        });
      }

      return Object.freeze({
        player: Object.freeze({
          ...player,
          capital: loanResult.newCapital,
          debt: loanResult.newDebt,
        }),
        loans: Object.freeze([
          ...(state.loans ?? []),
          loanResult.newLoan,
        ]),
        expense: 0,
        note: '\uC740\uD589 \uB300\uCD9C \uC2E4\uD589',
        factoryFailStreak: state.factoryFailStreak ?? 0,
        costReductionFailStreak: state.costReductionFailStreak ?? 0,
      });
    }

    if (bankActionId === BANK_ACTION_IDS.REPAY) {
      const payment = Math.min(
        player.debt,
        player.capital,
        Math.max(0, Number(strategy.bankRepayAmount) || 1000000),
      );

      return Object.freeze({
        player: Object.freeze({
          ...player,
          capital: player.capital - payment,
          debt: player.debt - payment,
        }),
        loans: state.loans ?? [],
        expense: 0,
        note: '\uC740\uD589 \uB300\uCD9C \uC0C1\uD658',
        factoryFailStreak: state.factoryFailStreak ?? 0,
        costReductionFailStreak: state.costReductionFailStreak ?? 0,
      });
    }

    return Object.freeze({
      player,
      loans: state.loans ?? [],
      expense: 0,
      note: '\uC740\uD589 \uAC70\uB798 \uC5C6\uC74C',
      factoryFailStreak: state.factoryFailStreak ?? 0,
      costReductionFailStreak: state.costReductionFailStreak ?? 0,
    });
  }

  if (strategy.operationOptionId === OPERATION_STRATEGY_IDS.MARKETING) {
    const marketingLimit = getMarketingLimit(player.capital);
    const spend = Math.min(
      marketingLimit,
      Math.max(0, Number(strategy.marketingSpend) || 0),
    );

    return Object.freeze({
      player: applyMarketingInvestment(player, spend),
      loans: state.loans ?? [],
      expense: spend,
      note: '\uB9C8\uCF00\uD305 \uC9D1\uD589',
      factoryFailStreak: state.factoryFailStreak ?? 0,
      costReductionFailStreak: state.costReductionFailStreak ?? 0,
    });
  }

  return Object.freeze({
    player,
    loans: state.loans ?? [],
    expense: 0,
    note: '\uC6B4\uC601 \uBCC0\uACBD \uC5C6\uC74C',
    factoryFailStreak: state.factoryFailStreak ?? 0,
    costReductionFailStreak: state.costReductionFailStreak ?? 0,
  });
}

function applyReservedFactoryAction(state, player, randomValue) {
  const action = state.factoryActionThisTurn;
  const isQuality = action.type === 'quality';
  const upgrade = isQuality
    ? rollQualityUpgrade(player, state.factoryFailStreak ?? 0, state.qualityUpgradeCount ?? 0, randomValue)
    : rollCostReduction(player, state.costReductionFailStreak ?? 0, state.costReductionCount ?? 0, randomValue);
  const factoryResult = Object.freeze({
    type: isQuality ? 'quality' : 'cost',
    tierIndex: 0,
    success: upgrade.success,
    cost: upgrade.cost,
    gain: upgrade.gain,
    beforeQuality: player.maxQuality ?? player.quality ?? 0,
    afterQuality: upgrade.player.maxQuality ?? upgrade.player.quality ?? player.maxQuality ?? player.quality ?? 0,
    beforeCost: player.unitCost ?? 0,
    afterCost: upgrade.player.unitCost ?? player.unitCost ?? 0,
    beforeCostReduction: player.costReduction ?? 0,
    afterCostReduction: upgrade.player.costReduction ?? player.costReduction ?? 0,
    successRate: upgrade.successRate,
    nextFailStreak: upgrade.nextFailStreak,
    nextUpgradeCount: upgrade.nextUpgradeCount,
  });

  return Object.freeze({
    player: upgrade.player,
    loans: state.loans ?? [],
    expense: upgrade.cost,
    note: isQuality
      ? `품질 강화 ${upgrade.success ? '성공' : '실패'}`
      : `원가 절감 ${upgrade.success ? '성공' : '실패'}`,
    factoryFailStreak: isQuality ? upgrade.nextFailStreak : state.factoryFailStreak ?? 0,
    costReductionFailStreak: isQuality ? state.costReductionFailStreak ?? 0 : upgrade.nextFailStreak,
    qualityUpgradeCount: isQuality ? upgrade.nextUpgradeCount : state.qualityUpgradeCount ?? 0,
    costReductionCount: isQuality ? state.costReductionCount ?? 0 : upgrade.nextUpgradeCount,
    factoryResult,
  });
}

function constrainStrategyByCapital(state, strategy) {
  const capital = Math.max(0, state.player?.capital ?? 0);
  const maxMarketingSpend = getMarketingLimit(capital);
  const factoryFocus = strategy.factoryUpgradeFocus ?? FACTORY_UPGRADE_FOCUS.NONE;
  const factoryCost = getFactoryUpgradeCost(factoryFocus, strategy);
  const shouldSkipFactory =
    strategy.operationOptionId === OPERATION_STRATEGY_IDS.FACTORY_UPGRADE &&
    factoryFocus !== FACTORY_UPGRADE_FOCUS.NONE &&
    factoryCost > capital;

  return Object.freeze({
    ...strategy,
    customSalesQuantity: Math.min(
      Math.max(0, Number(strategy.customSalesQuantity) || 0),
      Math.floor(capital / Math.max(1, state.player?.unitCost ?? 1)),
    ),
    marketingSpend: Math.min(Math.max(0, Number(strategy.marketingSpend) || 0), maxMarketingSpend),
    bankRepayAmount: Math.min(Math.max(0, Number(strategy.bankRepayAmount) || 0), capital),
    factoryUpgradeFocus: shouldSkipFactory ? FACTORY_UPGRADE_FOCUS.NONE : factoryFocus,
  });
}

function getFactoryUpgradeCost(focus, strategy) {
  if (focus === FACTORY_UPGRADE_FOCUS.QUALITY) {
    return QUALITY_UPGRADE.cost;
  }

  if (focus === FACTORY_UPGRADE_FOCUS.COST) {
    return COST_REDUCTION.cost;
  }

  return 0;
}

export function getPlannedProductionCount(strategy, totalDemand) {
  if (strategy.salesQuantityOptionId === SALES_QUANTITY_IDS.CUSTOM) {
    return Math.max(0, Math.round(Number(strategy.customSalesQuantity) || 0));
  }

  const selectedOption = SALES_QUANTITY_OPTIONS.find(
    (option) => option.id === strategy.salesQuantityOptionId,
  );

  return Math.ceil(totalDemand * (selectedOption?.ratio ?? 0.55));
}

export function getMaxOrderAmount(capital, cost, orderCap) {
  let safeCost = Number(cost);
  let safeOrderCap = Number(orderCap);
  const safeCapital = Number(capital);

  if (!safeCost || safeCost <= 0) {
    console.warn('원가(cost)가 0 이하입니다. 기본값 3000 사용');
    safeCost = 3000;
  }

  if (!safeCapital || safeCapital <= 0) {
    return 0;
  }

  if (!safeOrderCap || safeOrderCap <= 0) {
    safeOrderCap = 1000;
  }

  const capitalBased = Math.floor(safeCapital / safeCost);
  const result = Math.min(capitalBased, safeOrderCap);

  if (safeCapital >= safeCost && result <= 0) {
    return 1;
  }

  return Math.max(result, 0);
}

export function getQualityCostMultiplier(strategy) {
  if (QUALITY_COST_MULTIPLIERS[strategy.qualityOptionId]) {
    return QUALITY_COST_MULTIPLIERS[strategy.qualityOptionId];
  }

  const selectedOption = QUALITY_OPTIONS.find((option) => option.id === strategy.qualityOptionId);
  const qualityMultiplier = selectedOption?.multiplier ?? 0.8;

  return Math.max(0.5, 0.45 + qualityMultiplier * 0.7);
}
