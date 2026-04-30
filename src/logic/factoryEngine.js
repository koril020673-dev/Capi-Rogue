export const INITIAL_QUALITY = 8;
export const INITIAL_COST = 3000;
export const INITIAL_ORDER_CAP = 1000;
export const MAX_COST_REDUCTION = 0.3;

export const QUALITY_UPGRADE_TIERS = Object.freeze([
  Object.freeze({ cost: 500000, minGain: 3, maxGain: 8, baseRate: 0.72 }),
  Object.freeze({ cost: 1000000, minGain: 8, maxGain: 15, baseRate: 0.64 }),
  Object.freeze({ cost: 2000000, minGain: 13, maxGain: 25, baseRate: 0.56 }),
  Object.freeze({ cost: 5000000, minGain: 25, maxGain: 40, baseRate: 0.45 }),
]);

export const COST_REDUCTION_TIERS = Object.freeze([
  Object.freeze({ cost: 1000000, minGain: 0.03, maxGain: 0.05, baseRate: 0.72 }),
  Object.freeze({ cost: 2000000, minGain: 0.05, maxGain: 0.08, baseRate: 0.64 }),
  Object.freeze({ cost: 3500000, minGain: 0.07, maxGain: 0.1, baseRate: 0.56 }),
  Object.freeze({ cost: 5000000, minGain: 0.08, maxGain: 0.12, baseRate: 0.45 }),
]);

export function getFactoryFailBonus(failStreak = 0) {
  return Math.min(0.4, Math.max(0, failStreak) * 0.1);
}

export function rollQualityUpgrade(player, tierIndex = 0, failStreak = 0, randomValue = Math.random()) {
  const tier = QUALITY_UPGRADE_TIERS[tierIndex] ?? QUALITY_UPGRADE_TIERS[0];
  const successRate = Math.min(0.95, tier.baseRate + getFactoryFailBonus(failStreak));
  const success = randomValue < successRate;
  const gain = success ? getRangeValue(tier.minGain, tier.maxGain, randomValue) : 0;

  return Object.freeze({
    success,
    successRate,
    cost: tier.cost,
    gain,
    nextFailStreak: success ? 0 : Math.min(4, failStreak + 1),
    player: Object.freeze({
      ...player,
      maxQuality: Math.min(100, Math.max(INITIAL_QUALITY, (player.maxQuality ?? INITIAL_QUALITY) + gain)),
    }),
  });
}

export function rollCostReduction(player, tierIndex = 0, failStreak = 0, randomValue = Math.random()) {
  const tier = COST_REDUCTION_TIERS[tierIndex] ?? COST_REDUCTION_TIERS[0];
  const successRate = Math.min(0.95, tier.baseRate + getFactoryFailBonus(failStreak));
  const success = randomValue < successRate;
  const gain = success ? getRangeValue(tier.minGain, tier.maxGain, randomValue) : 0;
  const currentReduction = Math.max(0, player.costReduction ?? 0);
  const nextReduction = Math.min(MAX_COST_REDUCTION, currentReduction + gain);
  const baseUnitCost = player.baseUnitCost ?? INITIAL_COST;

  return Object.freeze({
    success,
    successRate,
    cost: tier.cost,
    gain,
    nextFailStreak: success ? 0 : Math.min(4, failStreak + 1),
    player: Object.freeze({
      ...player,
      baseUnitCost,
      costReduction: nextReduction,
      unitCost: Math.max(1, Math.round(baseUnitCost * (1 - nextReduction))),
    }),
  });
}

function getRangeValue(min, max, randomValue) {
  const normalized = Math.min(1, Math.max(0, randomValue));

  return min + (max - min) * normalized;
}
