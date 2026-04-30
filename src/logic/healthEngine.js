export const MAX_HEALTH = 10;
const RAIDER_MAX_HEALTH = 8;
const FULL_RECOVERY = 'FULL';

const REWARD_HEALTH_RECOVERY = Object.freeze({
  normal: 1,
  rare: 2,
  epic: 3,
  legend: FULL_RECOVERY,
});

const STREAK_BONUS_RULES = Object.freeze({
  raider: Object.freeze({ turns: 3, amount: 1 }),
  guardian: Object.freeze({ turns: 5, amount: 1 }),
  analyst: Object.freeze({ turns: 4, amount: 1 }),
  gambler: null,
});

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

export function rewardHealthRecovery(grade) {
  const recovery = REWARD_HEALTH_RECOVERY[String(grade).toLowerCase()];

  if (!recovery) {
    return null;
  }

  return recovery;
}

export function eventHealthRecovery(choiceType, result, advisorId, gameState = {}) {
  const normalizedChoiceType = String(choiceType ?? result?.tier ?? '').toUpperCase();
  const success = Boolean(result?.success);
  const jackpot = Boolean(result?.jackpot ?? result?.isJackpot ?? result?.outcome === 'JACKPOT');

  if (advisorId === 'raider' && normalizedChoiceType === 'GAMBLE' && success) {
    return 1;
  }

  if (advisorId === 'guardian' && normalizedChoiceType === 'SAFE' && Math.random() < 0.3) {
    return 1;
  }

  // TODO: rivalPredictionCorrect 플래그는 rivalEngine에서 설정.
  if (advisorId === 'analyst' && gameState.rivalPredictionCorrect === true) {
    return 1;
  }

  if (advisorId === 'gambler' && normalizedChoiceType === 'ABSURD' && (success || jackpot)) {
    return 2;
  }

  return null;
}

export function checkStreakBonus(gameState, advisorId) {
  const rule = STREAK_BONUS_RULES[advisorId];

  if (!rule) {
    return null;
  }

  const history = gameState.history ?? gameState.timeline ?? [];
  const recentTurns = history.slice(-rule.turns);

  if (recentTurns.length < rule.turns) {
    return null;
  }

  const hasProfitStreak = recentTurns.every((turn) => (turn.netProfit ?? turn.profit ?? 0) > 0);

  return hasProfitStreak ? rule.amount : null;
}

export function autoHealthRecovery(floor, advisorId) {
  if (advisorId === 'gambler') {
    return null;
  }

  return floor > 0 && floor % 10 === 0 ? 1 : null;
}

export function getMaxHealth(advisorId) {
  return advisorId === 'raider' ? RAIDER_MAX_HEALTH : MAX_HEALTH;
}

export function getScheduledHealthRecovery(floor, advisorId = null) {
  return autoHealthRecovery(floor, advisorId) ?? 0;
}

export function applyHealthDelta(health, delta, maxHealth = MAX_HEALTH) {
  return clampHealth(health + delta, maxHealth);
}

export function isGameOverHealth(health) {
  return health <= 0;
}
