export const AWARENESS_DECAY_RATE = 0.02;
export const AWARENESS_INVEST_DIVISOR = 150000;

export function getMaxAwareness(brand = 0) {
  return Math.min(1, Math.max(0, brand) / 10);
}

export function applyAwarenessDecay(player) {
  return clampPlayerAwareness({
    ...player,
    awareness: (player.awareness ?? 0) - AWARENESS_DECAY_RATE,
  });
}

export function applyMarketingInvestment(player, investAmount = 0) {
  const currentAwareness = Math.max(0.01, player.awareness ?? 0);
  const awarenessGain = Math.max(0, investAmount) / (currentAwareness * AWARENESS_INVEST_DIVISOR) / 100;

  return clampPlayerAwareness({
    ...player,
    awareness: currentAwareness + awarenessGain,
  });
}

export function clampPlayerAwareness(player) {
  return Object.freeze({
    ...player,
    awareness: Math.min(getMaxAwareness(player.brand), Math.max(0, player.awareness ?? 0)),
  });
}
