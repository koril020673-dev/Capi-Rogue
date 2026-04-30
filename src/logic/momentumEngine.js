export const MAX_MOMENTUM_HISTORY = 5;

export function updateMomentumHistory(history, profit) {
  return Object.freeze([...history, profit].slice(-MAX_MOMENTUM_HISTORY));
}

export function getMomentumScore(history) {
  return history.reduce((score, profit) => {
    if (profit > 0) {
      return score + 1;
    }

    if (profit < 0) {
      return score - 1;
    }

    return score;
  }, 0);
}

export function getMomentumLabel(history) {
  const score = getMomentumScore(history);

  if (score >= 3) {
    return '\uACE0\uC18D \uC131\uC7A5';
  }

  if (score >= 1) {
    return '\uC0C1\uC2B9\uC138';
  }

  if (score <= -3) {
    return '\uC704\uAE30';
  }

  if (score <= -1) {
    return '\uB454\uD654';
  }

  return '\uC911\uB9BD';
}

export function getMomentumDemandModifier(history) {
  const score = getMomentumScore(history);

  if (score >= 3) {
    return 1.12;
  }

  if (score >= 1) {
    return 1.05;
  }

  if (score <= -3) {
    return 0.88;
  }

  if (score <= -1) {
    return 0.95;
  }

  return 1;
}

export function updateMomentum(history, isProfit, advisorId = null) {
  const nextHistory = updateMomentumHistory(history, isProfit ? 1 : -1);
  const rawMomentum = getMomentumScore(nextHistory);
  const adjustedMomentum =
    advisorId === 'raider'
      ? Math.max(-5, Math.min(5, Math.round(rawMomentum * 1.5)))
      : advisorId === 'guardian'
        ? Math.max(-5, Math.min(5, Math.round(rawMomentum * 0.8)))
        : Math.max(-5, Math.min(5, rawMomentum));

  return Object.freeze({
    history: nextHistory,
    momentum: adjustedMomentum,
  });
}

export function getMomentumMultiplier(momentum) {
  if (momentum >= 5) {
    return 1.15;
  }

  if (momentum >= 3) {
    return 1.08;
  }

  if (momentum >= 1) {
    return 1.03;
  }

  if (momentum <= -5) {
    return 0.85;
  }

  if (momentum <= -3) {
    return 0.9;
  }

  if (momentum <= -1) {
    return 0.95;
  }

  return 1;
}

export function checkStreakBonus(history, advisorId) {
  const rules = {
    raider: 3,
    guardian: 5,
    analyst: 4,
  };
  const requiredTurns = rules[advisorId];

  if (!requiredTurns) {
    return null;
  }

  const recentTurns = history.slice(-requiredTurns);

  if (recentTurns.length < requiredTurns) {
    return null;
  }

  return recentTurns.every(Boolean) ? 1 : null;
}
