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
