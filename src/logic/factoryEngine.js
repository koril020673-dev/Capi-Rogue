export const INITIAL_QUALITY = 8;
export const INITIAL_COST = 3000;
export const INITIAL_ORDER_CAP = 1000;
export const MAX_COST_REDUCTION = 0.4;

export const QUALITY_UPGRADE = Object.freeze({
  cost: 500000,
  minGain: 8,
  maxGain: 15,
});

export const COST_REDUCTION = Object.freeze({
  cost: 500000,
  minGain: 0.05,
  maxGain: 0.08,
});

export const BASE_SUCCESS_RATE = 0.9;

export function getSuccessRate(baseRate = BASE_SUCCESS_RATE, totalUpgradeCount = 0, failStreak = 0) {
  const decayed = (Number(baseRate) || BASE_SUCCESS_RATE) - Math.max(0, totalUpgradeCount) * 0.05;
  const boosted = decayed + Math.max(0, failStreak) * 0.1;

  return Math.min(Math.max(boosted, 0.1), 0.95);
}

export function attemptQualityUpgrade(gameState = {}) {
  const quality = getStateQuality(gameState);
  const upgradeCount = Math.max(0, gameState.qualityUpgradeCount ?? 0);
  const failStreak = Math.max(0, gameState.factoryFailStreak ?? 0);
  const successRate = getSuccessRate(BASE_SUCCESS_RATE, upgradeCount, failStreak);
  const roll = Math.random();

  if (roll < successRate) {
    const gain = Math.floor(
      Math.random() * (QUALITY_UPGRADE.maxGain - QUALITY_UPGRADE.minGain + 1) +
        QUALITY_UPGRADE.minGain,
    );

    return Object.freeze({
      success: true,
      qualityGain: gain,
      newQuality: Math.min(quality + gain, 100),
      cost: QUALITY_UPGRADE.cost,
      successRate,
      newFailStreak: 0,
      newUpgradeCount: upgradeCount + 1,
    });
  }

  return Object.freeze({
    success: false,
    qualityGain: 0,
    newQuality: quality,
    cost: QUALITY_UPGRADE.cost,
    successRate,
    newFailStreak: failStreak + 1,
    newUpgradeCount: upgradeCount,
  });
}

export function attemptCostReduction(gameState = {}) {
  const costReductionTotal = getStateCostReduction(gameState);
  const upgradeCount = Math.max(0, gameState.costReductionCount ?? 0);
  const failStreak = Math.max(0, gameState.costReductionFailStreak ?? 0);
  const successRate = getSuccessRate(BASE_SUCCESS_RATE, upgradeCount, failStreak);
  const roll = Math.random();

  if (roll < successRate) {
    const gain = parseFloat(
      (
        Math.random() * (COST_REDUCTION.maxGain - COST_REDUCTION.minGain) +
        COST_REDUCTION.minGain
      ).toFixed(3),
    );
    const newReduction = Math.min(costReductionTotal + gain, MAX_COST_REDUCTION);

    return Object.freeze({
      success: true,
      reductionGain: gain,
      newCostReductionTotal: newReduction,
      cost: COST_REDUCTION.cost,
      successRate,
      newFailStreak: 0,
      newUpgradeCount: upgradeCount + 1,
    });
  }

  return Object.freeze({
    success: false,
    reductionGain: 0,
    newCostReductionTotal: costReductionTotal,
    cost: COST_REDUCTION.cost,
    successRate,
    newFailStreak: failStreak + 1,
    newUpgradeCount: upgradeCount,
  });
}

export function rollQualityUpgrade(player, failStreak = 0, qualityUpgradeCount = 0) {
  const result = attemptQualityUpgrade({
    quality: player.maxQuality ?? player.quality ?? INITIAL_QUALITY,
    factoryFailStreak: failStreak,
    qualityUpgradeCount,
  });

  return Object.freeze({
    success: result.success,
    successRate: result.successRate,
    cost: result.cost,
    gain: result.qualityGain,
    nextFailStreak: result.newFailStreak,
    nextUpgradeCount: result.newUpgradeCount,
    player: Object.freeze({
      ...player,
      maxQuality: Math.min(100, Math.max(INITIAL_QUALITY, result.newQuality)),
    }),
  });
}

export function rollCostReduction(player, failStreak = 0, costReductionCount = 0) {
  const baseUnitCost = player.baseUnitCost ?? INITIAL_COST;
  const result = attemptCostReduction({
    costReductionTotal: player.costReduction ?? 0,
    costReductionFailStreak: failStreak,
    costReductionCount,
  });

  return Object.freeze({
    success: result.success,
    successRate: result.successRate,
    cost: result.cost,
    gain: result.reductionGain,
    nextFailStreak: result.newFailStreak,
    nextUpgradeCount: result.newUpgradeCount,
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
