import { ADVISORS } from '../constants/advisors';

export function getAdvisorById(advisorId) {
  return ADVISORS.find((advisor) => advisor.id === advisorId) ?? ADVISORS[0];
}

export function getUnlockedAdvisors(unlockedOrder) {
  return ADVISORS.filter((advisor) => advisor.order <= unlockedOrder);
}

export function isAdvisorUnlocked(advisor, unlockedOrder) {
  return advisor.order <= unlockedOrder;
}

export function getAdvisorThemeColor(advisorId) {
  return getAdvisorById(advisorId).themeColor;
}

export function applyAdvisorStartBonus(player, advisorId) {
  const advisor = getAdvisorById(advisorId);

  return Object.freeze({
    ...player,
    creditTokens: player.creditTokens + advisor.stats.creditBonus,
    maxQuality: player.maxQuality + advisor.stats.qualityBonus,
    unitCost: Math.max(1, Math.round(player.unitCost * advisor.stats.costMultiplier)),
  });
}
