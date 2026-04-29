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
