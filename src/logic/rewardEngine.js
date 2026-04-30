import { REWARD_CARDS, REWARD_GRADES } from '../constants/rewards';

export function isRewardFloor(floor) {
  return floor > 0 && floor % 5 === 0;
}

export function getRewardGradeWeights(momentumScore, floor, advisorLuck = 0) {
  const bossBonus = floor % 20 === 0 ? 0.1 : 0;
  const tenFloorBonus = floor % 10 === 0 ? 0.05 : 0;
  const momentumBonus = Math.max(-0.08, Math.min(0.12, momentumScore * 0.025));
  const luck = advisorLuck + bossBonus + tenFloorBonus + momentumBonus;

  return Object.freeze({
    [REWARD_GRADES.NORMAL]: Math.max(0.25, 0.58 - luck),
    [REWARD_GRADES.RARE]: 0.28,
    [REWARD_GRADES.EPIC]: Math.max(0.08, 0.11 + luck * 0.65),
    [REWARD_GRADES.LEGEND]: Math.max(0.01, 0.03 + luck * 0.35),
  });
}

export function rollRewardGrade(weights, randomValue = Math.random()) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = 0;

  for (const [grade, weight] of entries) {
    cursor += weight / total;

    if (randomValue <= cursor) {
      return grade;
    }
  }

  return REWARD_GRADES.NORMAL;
}

export function generateRewardOptions({
  floor,
  momentumScore,
  advisorLuck = 0,
  randomValues = [Math.random(), Math.random(), Math.random()],
}) {
  const weights = getRewardGradeWeights(momentumScore, floor, advisorLuck);
  const selectedIds = new Set();

  return Object.freeze(
    randomValues.map((randomValue, index) => {
      const grade = rollRewardGrade(weights, randomValue);
      const pool = REWARD_CARDS.filter(
        (card) => card.grade === grade && !selectedIds.has(card.id),
      );
      const fallbackPool = REWARD_CARDS.filter((card) => !selectedIds.has(card.id));
      const source = pool.length > 0 ? pool : fallbackPool;
      const selected = source[Math.floor((randomValue + index * 0.19) * source.length) % source.length];
      selectedIds.add(selected.id);
      return selected;
    }),
  );
}

export function applyRewardToPlayer(player, reward) {
  const effect = reward.effect;

  if (effect.type === 'capital') {
    return Object.freeze({ player: Object.freeze({ ...player, capital: player.capital + effect.amount }) });
  }

  if (effect.type === 'health') {
    const maxHealth = player.maxHealth ?? 10;

    return Object.freeze({
      player: Object.freeze({ ...player, health: Math.min(maxHealth, player.health + effect.amount) }),
    });
  }

  if (effect.type === 'awareness') {
    return Object.freeze({
      player: Object.freeze({ ...player, awareness: Math.min(1.5, player.awareness + effect.amount) }),
    });
  }

  if (effect.type === 'unitCostMultiplier') {
    return Object.freeze({
      player: Object.freeze({ ...player, unitCost: Math.max(1, Math.round(player.unitCost * effect.multiplier)) }),
    });
  }

  if (effect.type === 'brand') {
    return Object.freeze({ player: Object.freeze({ ...player, brand: player.brand + effect.amount }) });
  }

  if (effect.type === 'qualityAndCost') {
    return Object.freeze({
      player: Object.freeze({
        ...player,
        maxQuality: player.maxQuality + effect.quality,
        unitCost: Math.max(1, Math.round(player.unitCost * effect.costMultiplier)),
      }),
    });
  }

  if (effect.type === 'unlockChampion') {
    return Object.freeze({
      player: Object.freeze({ ...player, maxQuality: player.maxQuality + effect.quality }),
      championUnlocked: true,
    });
  }

  if (effect.type === 'awarenessAndBrand') {
    return Object.freeze({
      player: Object.freeze({
        ...player,
        awareness: Math.min(1.5, player.awareness + effect.awareness),
        brand: player.brand + effect.brand,
      }),
    });
  }

  if (effect.type === 'healthAndDebt') {
    const maxHealth = player.maxHealth ?? 10;

    return Object.freeze({
      player: Object.freeze({
        ...player,
        health: Math.min(maxHealth, player.health + effect.health),
        debt: Math.max(0, player.debt - effect.debt),
      }),
    });
  }

  if (effect.type === 'temporaryDemandBoost') {
    return Object.freeze({
      player,
      marketEffect: Object.freeze({
        id: `reward-${reward.id}`,
        eventId: reward.id,
        title: reward.title,
        background: 'trend',
        effects: Object.freeze({ demandMultiplier: effect.multiplier }),
        duration: effect.duration,
      }),
    });
  }

  return Object.freeze({ player });
}
