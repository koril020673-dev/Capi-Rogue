import { ADVISORS } from '../constants/advisors';

export function getAdvisorById(advisorId) {
  return ADVISORS.find((advisor) => advisor.id === advisorId) ?? ADVISORS[0];
}

export function getAdvisorByStyle(diagnosisStyle) {
  return ADVISORS.find((advisor) => advisor.diagnosisStyle === diagnosisStyle) ?? ADVISORS[0];
}

export function getUnlockedAdvisors() {
  return ADVISORS;
}

export function isAdvisorUnlocked() {
  return true;
}

export function getAdvisorThemeColor(advisorId) {
  return getAdvisorById(advisorId).themeColor;
}

export function getAdvisorDisplayName(advisorId) {
  const advisor = getAdvisorById(advisorId);

  return `${advisor.name} / ${advisor.style}`;
}

export function getAdvisorAttractionMultiplier(advisorId) {
  const advisor = getAdvisorById(advisorId);

  return 1 + (advisor.passive.attractionBonus ?? 0);
}

export function getAdvisorMaxHealth(advisorId) {
  const advisor = getAdvisorById(advisorId);

  return advisor.passive.maxHealth ?? 10;
}

export function getAdvisorHealthDelta(advisorId, healthDelta) {
  const advisor = getAdvisorById(advisorId);
  const reduction = advisor.passive.healthDecreaseReduction ?? 0;

  if (healthDelta >= 0 || reduction <= 0) {
    return healthDelta;
  }

  return Math.min(0, healthDelta + reduction);
}

export function getAdvisorOrderCapMultiplier(advisorId) {
  const advisor = getAdvisorById(advisorId);

  return advisor.passive.orderCapMultiplier ?? 1;
}

export function getAdvisorRewardCreditBonus(advisorId) {
  const advisor = getAdvisorById(advisorId);

  return advisor.passive.extraCreditPerReward ?? 0;
}

export function hasCreditOnlyHealthRecovery(advisorId) {
  return Boolean(getAdvisorById(advisorId).passive.healthRecoveryOnlyByCredit);
}

export function applyAdvisorStartBonus(player, advisorId) {
  const maxHealth = getAdvisorMaxHealth(advisorId);

  return Object.freeze({
    ...player,
    maxHealth,
    health: Math.min(player.health, maxHealth),
  });
}
