export function calculateSelectedQuality(maxQuality, qualityMultiplier, advisorQualityBonus = 0) {
  return Math.max(1, (maxQuality + advisorQualityBonus) * qualityMultiplier);
}

export function getFactoryUpgradeCost(factoryLevel) {
  return 1700000 + factoryLevel * 600000;
}

export function applyFactoryUpgrade(player, focus) {
  const upgradeCost = getFactoryUpgradeCost(player.factoryLevel);
  const isQualityFocus = focus === 'quality';
  const qualityUpgradeStreak = isQualityFocus ? player.qualityUpgradeStreak + 1 : 0;
  const costUpgradeStreak = isQualityFocus ? 0 : player.costUpgradeStreak + 1;
  const repeatedQualityPenalty = Math.max(0, qualityUpgradeStreak - 2);

  return Object.freeze({
    player: Object.freeze({
      ...player,
      factoryLevel: player.factoryLevel + 1,
      maxQuality: isQualityFocus ? player.maxQuality + 1.2 : player.maxQuality + 0.2,
      unitCost: isQualityFocus
        ? player.unitCost
        : Math.max(1, Math.round(player.unitCost * 0.94)),
      brand: Math.max(0, player.brand - repeatedQualityPenalty),
      qualityUpgradeStreak,
      costUpgradeStreak,
    }),
    cost: upgradeCost,
    brandPenalty: repeatedQualityPenalty,
  });
}

export function applyBrandAndQualityBounds(player) {
  return Object.freeze({
    ...player,
    brand: Math.max(0, player.brand),
    maxQuality: Math.max(1, player.maxQuality),
    awareness: Math.min(Math.max(player.awareness, 0), 1.5),
    unitCost: Math.max(1, player.unitCost),
  });
}

export function applyQualityBrandPenalty(brand, upgradeCount) {
  const extraUpgrades = Math.max(0, upgradeCount - 1);

  return Math.max(0, brand - extraUpgrades * 0.5);
}

export function applyAwarenessDecay(awareness) {
  return Math.max(0, awareness - 2);
}

export function getMaxAwareness(brand) {
  return Math.min(100, Math.max(0, brand) * 10);
}

export function calcAwarenessGain(investAmount, currentAwareness) {
  const divisor = Math.max(1, currentAwareness) * 150000;

  return Math.max(0.5, investAmount / divisor);
}

export function updateAwareness(current, investAmount, brand) {
  const maxAwareness = getMaxAwareness(brand);
  const decayed = applyAwarenessDecay(current);
  const gained = investAmount > 0 ? calcAwarenessGain(investAmount, decayed) : 0;

  return Math.min(decayed + gained, maxAwareness);
}

export function updateBrand(brand, netProfit, qualityChange = 0) {
  let nextBrand = brand;

  if (netProfit > 0) {
    nextBrand += 0.1;
  }

  if (netProfit < 0) {
    nextBrand -= 0.2;
  }

  if (qualityChange < 0) {
    nextBrand += qualityChange * 0.3;
  }

  return Math.max(0, Math.min(10, nextBrand));
}

export function getMarketingLimit(capital, mode = 'ratio') {
  const safeCapital = Math.max(0, Number(capital) || 0);

  if (mode === 'fixed') {
    return Math.min(Math.floor(safeCapital * 0.2), 5000000);
  }

  return Math.floor(safeCapital * 0.3);
}
