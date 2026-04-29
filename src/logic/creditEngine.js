export function getCreditGrantForFloor(floor, randomValue = Math.random()) {
  if (floor > 0 && floor % 20 === 0) {
    return 5;
  }

  if (floor > 0 && floor % 10 === 0) {
    return randomValue < 0.5 ? 2 : 3;
  }

  if (floor > 0 && floor % 5 === 0) {
    return randomValue < 0.5 ? 1 : 2;
  }

  return 0;
}

export function canSpendCreditTokens(currentTokens, cost = 1) {
  return currentTokens >= cost;
}

export function spendCreditTokens(currentTokens, cost = 1) {
  return canSpendCreditTokens(currentTokens, cost) ? currentTokens - cost : currentTokens;
}
