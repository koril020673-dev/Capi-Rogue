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
import {
  getAdvisorAttractionMultiplier,
  getAdvisorById,
  getAdvisorOrderCapMultiplier,
} from './advisorEngine';
import { applyFactoryUpgrade, calculateSelectedQuality } from './brandQualityEngine';
import { calculateTotalDemand } from './demandEngine';
import { getActiveMarketModifiers } from './eventEngine';
import { calculateDemandSplit } from './marketEngine';
import { getMomentumDemandModifier } from './momentumEngine';
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
    brand: player.brand,
    awareness: player.awareness * marketModifiers.awarenessMultiplier,
    efficiency: player.efficiency,
    resistance: player.resistance,
    unitCost: effectiveUnitCost,
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
  const demandSplit = calculateDemandSplit([playerParticipant, ...rivalParticipants], totalDemand);

  return Object.freeze({
    totalDemand,
    marketModifiers,
    participants: demandSplit,
    player: demandSplit.find((participant) => participant.id === 'player'),
    rivals: demandSplit.filter((participant) => participant.type === 'rival'),
  });
}

export function buildOperationalMarketPreview(state, randomValue = 0.5) {
  const operationResult = applyOperationBeforeSettlement(state.player, state.strategy);
  const preview = buildMarketPreview(
    Object.freeze({ ...state, player: operationResult.player }),
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

export function calculateSettlement(state, internalOutcome = null, randomValue = Math.random()) {
  const operationResult = applyOperationBeforeSettlement(state.player, state.strategy);
  const workingPlayer = operationResult.player;
  const preview = buildMarketPreview(
    Object.freeze({ ...state, player: workingPlayer }),
    randomValue,
  );
  const playerDemand = preview.player.demand;
  const plannedProduction = Math.floor(
    getPlannedProductionCount(state.strategy, preview.totalDemand) *
      getAdvisorOrderCapMultiplier(state.selectedAdvisorId),
  );
  const unitsSold = Math.min(plannedProduction, playerDemand);
  const unsoldUnits = Math.max(0, plannedProduction - unitsSold);
  const productionCost = plannedProduction * preview.player.unitCost;
  const revenue = unitsSold * preview.player.price;
  const debtService = Math.round((workingPlayer.debt * 0.012) * preview.marketModifiers.debtCostMultiplier);
  const disposalCost = Math.round(unsoldUnits * preview.player.unitCost * 0.18);
  const profit =
    revenue -
    productionCost -
    disposalCost -
    debtService -
    operationResult.expense;
  const capitalAfter = workingPlayer.capital + profit;
  const rivalWar = resolveRivalWar({
    rivals: state.rivals,
    floor: state.floor,
    phase: state.phase,
    playerProfit: profit,
    demandSplit: preview.participants,
  });

  return Object.freeze({
    totalDemand: preview.totalDemand,
    demandSplit: preview.participants,
    playerDemand,
    plannedProduction,
    unitsSold,
    unsoldUnits,
    revenue,
    productionCost,
    disposalCost,
    debtService,
    operationExpense: operationResult.expense,
    operationNote: operationResult.note,
    internalOutcome,
    profit,
    nextRivals: rivalWar.rivals,
    rivalResults: rivalWar.rivalResults,
    playerWarHealthDelta: rivalWar.playerWarHealthDelta,
    capitalBefore: state.player.capital,
    capitalAfter,
    playerAfterOperation: workingPlayer,
    marketModifiers: preview.marketModifiers,
  });
}

function applyOperationBeforeSettlement(player, strategy) {
  if (strategy.operationOptionId === OPERATION_STRATEGY_IDS.FACTORY_UPGRADE) {
    const focus = strategy.factoryUpgradeFocus ?? FACTORY_UPGRADE_FOCUS.NONE;

    if (focus === FACTORY_UPGRADE_FOCUS.NONE) {
      return Object.freeze({
        player,
        expense: 0,
        note: '\uACF5\uC7A5 \uC791\uC5C5 \uC5C6\uC74C',
      });
    }

    const upgrade = applyFactoryUpgrade(player, focus);

    return Object.freeze({
      player: upgrade.player,
      expense: upgrade.cost,
      note:
        focus === FACTORY_UPGRADE_FOCUS.QUALITY
          ? '\uD488\uC9C8 \uC911\uC2EC \uC124\uBE44 \uC5C5\uADF8\uB808\uC774\uB4DC'
          : '\uC6D0\uAC00 \uC911\uC2EC \uC124\uBE44 \uC5C5\uADF8\uB808\uC774\uB4DC',
    });
  }

  if (strategy.operationOptionId === OPERATION_STRATEGY_IDS.BANKING) {
    const bankActionId = strategy.bankActionId ?? BANK_ACTION_IDS.NONE;

    if (bankActionId === BANK_ACTION_IDS.BORROW) {
      const amount = Math.max(0, Number(strategy.bankBorrowAmount) || 2000000);

      return Object.freeze({
        player: Object.freeze({
          ...player,
          capital: player.capital + amount,
          debt: player.debt + amount,
        }),
        expense: 0,
        note: '\uC740\uD589 \uB300\uCD9C \uC2E4\uD589',
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
        expense: 0,
        note: '\uC740\uD589 \uB300\uCD9C \uC0C1\uD658',
      });
    }

    return Object.freeze({
      player,
      expense: 0,
      note: '\uC740\uD589 \uAC70\uB798 \uC5C6\uC74C',
    });
  }

  if (strategy.operationOptionId === OPERATION_STRATEGY_IDS.MARKETING) {
    const spend = Math.min(player.capital, Math.max(0, Number(strategy.marketingSpend) || 0));

    return Object.freeze({
      player: Object.freeze({
        ...player,
        awareness: Math.min(1.5, player.awareness + spend / 50000000),
      }),
      expense: spend,
      note: '\uB9C8\uCF00\uD305 \uC9D1\uD589',
    });
  }

  return Object.freeze({
    player,
    expense: 0,
    note: '\uC6B4\uC601 \uBCC0\uACBD \uC5C6\uC74C',
  });
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

export function getQualityCostMultiplier(strategy) {
  if (QUALITY_COST_MULTIPLIERS[strategy.qualityOptionId]) {
    return QUALITY_COST_MULTIPLIERS[strategy.qualityOptionId];
  }

  const selectedOption = QUALITY_OPTIONS.find((option) => option.id === strategy.qualityOptionId);
  const qualityMultiplier = selectedOption?.multiplier ?? 0.8;

  return Math.max(0.5, 0.45 + qualityMultiplier * 0.7);
}
