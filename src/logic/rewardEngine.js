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

export function getRewardGrade(momentum, momentumHistory = [], randomValue = Math.random()) {
  const isFiveTurnProfit = momentumHistory.slice(-5).length >= 5 && momentumHistory.slice(-5).every(Boolean);
  const weights = isFiveTurnProfit
    ? { normal: 0.15, rare: 0.35, epic: 0.35, legend: 0.15 }
    : momentum > 0
      ? { normal: 0.3, rare: 0.4, epic: 0.22, legend: 0.08 }
      : momentum < 0
        ? { normal: 0.7, rare: 0.25, epic: 0.04, legend: 0.01 }
        : { normal: 0.5, rare: 0.35, epic: 0.12, legend: 0.03 };

  return rollRewardGrade(weights, randomValue);
}

export function getRewardOptions(grade) {
  const optionsByGrade = {
    [REWARD_GRADES.NORMAL]: [
      { type: 'health', label: '체력 +1', effect: { type: 'health', amount: 1 } },
      { type: 'nextTurnCost', label: '다음턴 원가 -10%', effect: { type: 'unitCostMultiplier', multiplier: 0.9 } },
      { type: 'awareness', label: '인지도 +15', effect: { type: 'awareness', amount: 0.15 } },
    ],
    [REWARD_GRADES.RARE]: [
      { type: 'health', label: '체력 +2', effect: { type: 'health', amount: 2 } },
      { type: 'brand', label: '브랜드 +2', effect: { type: 'brand', amount: 2 } },
      { type: 'creditScore', label: '신용점수 +10', effect: { type: 'creditScore', amount: 10 } },
    ],
    [REWARD_GRADES.EPIC]: [
      { type: 'health', label: '체력 +3', effect: { type: 'health', amount: 3 } },
      { type: 'quality', label: '품질 +10', effect: { type: 'quality', amount: 10 } },
      { type: 'capital', label: '자본 +200만', effect: { type: 'capital', amount: 2000000 } },
    ],
    [REWARD_GRADES.LEGEND]: [
      { type: 'healthFull', label: '체력 전체 회복', effect: { type: 'healthFull' } },
      { type: 'quality', label: '품질 +20', effect: { type: 'quality', amount: 20 } },
      { type: 'capital', label: '자본 +500만', effect: { type: 'capital', amount: 5000000 } },
    ],
  };

  return Object.freeze((optionsByGrade[grade] ?? optionsByGrade[REWARD_GRADES.NORMAL]).map(Object.freeze));
}

export function applyReward(rewardType, gameState) {
  const reward =
    typeof rewardType === 'string'
      ? getRewardOptions(gameState.rewardGrade ?? REWARD_GRADES.NORMAL).find((option) => option.type === rewardType)
      : rewardType;
  const effect = reward?.effect ?? reward;

  if (!effect) {
    return gameState;
  }

  if (effect.type === 'healthFull') {
    return Object.freeze({ ...gameState, health: gameState.maxHealth ?? 10 });
  }

  if (effect.type === 'health') {
    return Object.freeze({
      ...gameState,
      health: Math.min(gameState.maxHealth ?? 10, (gameState.health ?? 0) + effect.amount),
    });
  }

  if (effect.type === 'capital') {
    return Object.freeze({ ...gameState, capital: (gameState.capital ?? 0) + effect.amount });
  }

  if (effect.type === 'quality') {
    return Object.freeze({ ...gameState, quality: Math.min(100, (gameState.quality ?? 0) + effect.amount) });
  }

  if (effect.type === 'brand') {
    return Object.freeze({ ...gameState, brand: (gameState.brand ?? 0) + effect.amount });
  }

  if (effect.type === 'creditScore') {
    return Object.freeze({
      ...gameState,
      creditScore: Math.min(100, (gameState.creditScore ?? 70) + effect.amount),
    });
  }

  if (effect.type === 'awareness') {
    return Object.freeze({ ...gameState, awareness: Math.min(1.5, (gameState.awareness ?? 0) + effect.amount) });
  }

  if (effect.type === 'unitCostMultiplier') {
    return Object.freeze({
      ...gameState,
      unitCost: Math.max(1, Math.round((gameState.unitCost ?? gameState.cost ?? 1) * effect.multiplier)),
    });
  }

  return gameState;
}
