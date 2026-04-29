export const MAX_HEALTH = 10;

export function clampHealth(health, maxHealth = MAX_HEALTH) {
  return Math.min(Math.max(Math.round(health), 0), maxHealth);
}

export function calculateHealthDeltaFromProfit(profit, capitalBeforeSettlement) {
  if (profit >= 0) {
    return 0;
  }

  const lossPressure = Math.abs(profit) / Math.max(Math.abs(capitalBeforeSettlement), 1);

  if (lossPressure >= 0.25) {
    return -2;
  }

  return -1;
}

export function getScheduledHealthRecovery(floor) {
  return floor > 0 && floor % 10 === 0 ? 1 : 0;
}

export function applyHealthDelta(health, delta, maxHealth = MAX_HEALTH) {
  return clampHealth(health + delta, maxHealth);
}

export function isGameOverHealth(health) {
  return health <= 0;
}
