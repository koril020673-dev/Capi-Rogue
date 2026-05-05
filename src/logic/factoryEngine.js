export const INITIAL_QUALITY = 8;
export const INITIAL_COST = 3000;
export const INITIAL_ORDER_CAP = 1000;
export const MAX_COST_REDUCTION = 0.4;

export const QUALITY_UPGRADE_TIERS = Object.freeze([
  Object.freeze({ cost: 200000, minGain: 3, maxGain: 8, baseSuccessRate: 0.9 }),
  Object.freeze({ cost: 500000, minGain: 8, maxGain: 15, baseSuccessRate: 0.75 }),
  Object.freeze({ cost: 1000000, minGain: 13, maxGain: 25, baseSuccessRate: 0.6 }),
  Object.freeze({ cost: 3000000, minGain: 25, maxGain: 40, baseSuccessRate: 0.4 }),
]);

export const COST_REDUCTION_TIERS = Object.freeze([
  Object.freeze({ cost: 300000, minGain: 0.03, maxGain: 0.05, baseSuccessRate: 0.9 }),
  Object.freeze({ cost: 700000, minGain: 0.05, maxGain: 0.08, baseSuccessRate: 0.75 }),
  Object.freeze({ cost: 1500000, minGain: 0.07, maxGain: 0.1, baseSuccessRate: 0.6 }),
  Object.freeze({ cost: 3500000, minGain: 0.08, maxGain: 0.12, baseSuccessRate: 0.4 }),
]);

export function getActualSuccessRate(baseSuccessRate, failStreak = 0) {
  const boosted = (Number(baseSuccessRate) || 0) + Math.max(0, failStreak) * 0.1;

  return Math.min(boosted, 0.95);
}

export function getFactoryFailBonus(failStreak = 0) {
  return Math.max(0, getActualSuccessRate(0, failStreak));
}

export function attemptQualityUpgrade(tierIndex = 0, gameState = {}) {
  const tier = QUALITY_UPGRADE_TIERS[tierIndex] ?? QUALITY_UPGRADE_TIERS[0];
  const quality = getStateQuality(gameState);
  const failStreak = Math.max(0, gameState.factoryFailStreak ?? 0);
  const successRate = getActualSuccessRate(tier.baseSuccessRate, failStreak);
  const roll = Math.random();

  if (roll < successRate) {
    const gain = Math.floor(Math.random() * (tier.maxGain - tier.minGain + 1) + tier.minGain);

    return Object.freeze({
      success: true,
      qualityGain: gain,
      newQuality: Math.min(quality + gain, 100),
      cost: tier.cost,
      successRate,
      newFailStreak: 0,
    });
  }

  return Object.freeze({
    success: false,
    qualityGain: 0,
    newQuality: quality,
    cost: tier.cost,
    successRate,
    newFailStreak: failStreak + 1,
  });
}

export function attemptCostReduction(tierIndex = 0, gameState = {}) {
  const tier = COST_REDUCTION_TIERS[tierIndex] ?? COST_REDUCTION_TIERS[0];
  const costReductionTotal = getStateCostReduction(gameState);
  const failStreak = Math.max(0, gameState.costReductionFailStreak ?? 0);
  const successRate = getActualSuccessRate(tier.baseSuccessRate, failStreak);
  const roll = Math.random();

  if (roll < successRate) {
    const gain = parseFloat((Math.random() * (tier.maxGain - tier.minGain) + tier.minGain).toFixed(3));
    const newReduction = Math.min(costReductionTotal + gain, MAX_COST_REDUCTION);

    return Object.freeze({
      success: true,
      reductionGain: gain,
      newCostReductionTotal: newReduction,
      cost: tier.cost,
      successRate,
      newFailStreak: 0,
    });
  }

  return Object.freeze({
    success: false,
    reductionGain: 0,
    newCostReductionTotal: costReductionTotal,
    cost: tier.cost,
    successRate,
    newFailStreak: failStreak + 1,
  });
}

export function rollQualityUpgrade(player, tierIndex = 0, failStreak = 0) {
  const result = attemptQualityUpgrade(tierIndex, {
    quality: player.maxQuality ?? player.quality ?? INITIAL_QUALITY,
    factoryFailStreak: failStreak,
  });

  return Object.freeze({
    success: result.success,
    successRate: result.successRate,
    cost: result.cost,
    gain: result.qualityGain,
    nextFailStreak: result.newFailStreak,
    player: Object.freeze({
      ...player,
      maxQuality: Math.min(100, Math.max(INITIAL_QUALITY, result.newQuality)),
    }),
  });
}

export function rollCostReduction(player, tierIndex = 0, failStreak = 0) {
  const baseUnitCost = player.baseUnitCost ?? INITIAL_COST;
  const result = attemptCostReduction(tierIndex, {
    costReductionTotal: player.costReduction ?? 0,
    costReductionFailStreak: failStreak,
  });

  return Object.freeze({
    success: result.success,
    successRate: result.successRate,
    cost: result.cost,
    gain: result.reductionGain,
    nextFailStreak: result.newFailStreak,
    player: Object.freeze({
      ...player,
      baseUnitCost,
      costReduction: result.newCostReductionTotal,
      unitCost: Math.max(1, Math.round(baseUnitCost * (1 - result.newCostReductionTotal))),
    }),
  });
}

function getStateQuality(gameState) {
  return Math.max(
    INITIAL_QUALITY,
    Number(gameState.quality ?? gameState.player?.maxQuality ?? gameState.player?.quality ?? INITIAL_QUALITY) || INITIAL_QUALITY,
  );
}

function getStateCostReduction(gameState) {
  return Math.max(
    0,
    Number(gameState.costReductionTotal ?? gameState.player?.costReduction ?? 0) || 0,
  );
}
