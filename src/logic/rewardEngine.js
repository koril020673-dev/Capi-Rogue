import { REWARD_CARDS, REWARD_GRADES } from '../constants/rewards';
import { getRewardGradeProbabilities } from './momentumEngine';
import { rewardHealthRecovery } from './healthEngine';

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
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  let cursor = 0;

  for (const [grade, weight] of entries) {
    cursor += weight / total;

    if (randomValue <= cursor) {
      return grade;
    }
  }

  return entries[0]?.[0] ?? REWARD_GRADES.NORMAL;
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
      const pool = REWARD_CARDS.filter((card) => card.grade === grade && !selectedIds.has(card.id));
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
  const probabilities = getRewardGradeProbabilities(momentum, momentumHistory);
  let cumulative = 0;

  for (const [grade, probability] of Object.entries(probabilities)) {
    cumulative += probability;

    if (randomValue < cumulative) {
      return grade;
    }
  }

  return 'NORMAL';
}

export function getRewardOptions(grade, gameState = {}) {
  const normalizedGrade = normalizeRewardGrade(grade);
  const optionsByGrade = {
    NORMAL: [
      createRewardOption('health_1', '체력 +1', '경영 체력을 1 회복합니다.', { type: 'HEALTH', amount: 1 }, 'health'),
      createRewardOption('cost_down', '다음 턴 원가 -10%', '다음 턴 원가가 10% 감소합니다.', { type: 'TEMP_COST_DOWN', amount: 0.1, duration: 1 }, 'nextTurnCost'),
      createRewardOption('awareness_up', '인지도 +15%', '시장 인지도가 15% 상승합니다.', { type: 'AWARENESS', amount: 15 }, 'awareness'),
    ],
    RARE: [
      createRewardOption('health_2', '체력 +2', '경영 체력을 2 회복합니다.', { type: 'HEALTH', amount: 2 }, 'health'),
      createRewardOption('brand_up', '브랜드 +2', '브랜드 가치가 2 상승합니다.', { type: 'BRAND', amount: 2 }, 'brand'),
      createRewardOption('credit_up', '신용점수 +10', '신용점수가 10점 상승합니다.', { type: 'CREDIT', amount: 10 }, 'creditScore'),
    ],
    EPIC: [
      createRewardOption('health_3', '체력 +3', '경영 체력을 3 회복합니다.', { type: 'HEALTH', amount: 3 }, 'health'),
      createRewardOption('quality_up', '품질 +10', '제품 품질이 10 상승합니다.', { type: 'QUALITY', amount: 10 }, 'quality'),
      createRewardOption('capital_up', '자본 +2,000,000원', '보유 자본이 200만원 증가합니다.', { type: 'CAPITAL', amount: 2000000 }, 'capital'),
    ],
    LEGEND: [
      createRewardOption('health_full', '체력 전체 회복', '경영 체력이 최대치로 회복됩니다.', { type: 'HEALTH_FULL' }, 'healthFull'),
      createRewardOption('quality_up_20', '품질 +20', '제품 품질이 20 상승합니다.', { type: 'QUALITY', amount: 20 }, 'quality'),
      createRewardOption('capital_up_big', '자본 +5,000,000원', '보유 자본이 500만원 증가합니다.', { type: 'CAPITAL', amount: 5000000 }, 'capital'),
    ],
  };

  return Object.freeze((optionsByGrade[normalizedGrade] ?? optionsByGrade.NORMAL).map((option) =>
    Object.freeze({
      ...option,
      grade: denormalizeRewardGrade(normalizedGrade, grade),
      effect: Object.freeze(option.effect),
    }),
  ));
}

export function applyReward(rewardEffect, gameState) {
  const selectedReward =
    typeof rewardEffect === 'string'
      ? getRewardOptions(gameState.rewardGrade ?? 'NORMAL', gameState).find((option) => (
          option.type === rewardEffect || option.id === rewardEffect
        ))
      : rewardEffect;
  const effect = normalizeRewardEffect(selectedReward?.effect ?? selectedReward);

  if (!effect) {
    return gameState;
  }

  const state = { ...gameState };

  switch (effect.type) {
    case 'HEALTH':
      state.health = Math.min((state.health ?? 0) + effect.amount, state.maxHealth ?? 10);
      break;
    case 'HEALTH_FULL':
      state.health = rewardHealthRecovery('LEGEND', state.maxHealth ?? 10);
      break;
    case 'QUALITY':
      state.quality = (state.quality ?? 0) + effect.amount;
      if (state.maxQuality !== undefined) state.maxQuality += effect.amount;
      break;
    case 'BRAND':
      state.brand = Math.min((state.brand ?? 0) + effect.amount, 10);
      break;
    case 'AWARENESS': {
      const currentAwareness = state.awareness ?? 0;
      const amount = effect.amount > 1 ? effect.amount : effect.amount * 100;
      const maxAwareness = Math.min(100, (state.brand ?? 0) * 10);
      state.awareness = Math.min(currentAwareness + amount, maxAwareness);
      break;
    }
    case 'CAPITAL':
      state.capital = (state.capital ?? 0) + effect.amount;
      break;
    case 'CREDIT':
      state.creditScore = Math.min((state.creditScore ?? 70) + effect.amount, 100);
      break;
    case 'TEMP_COST_DOWN':
      state.activeEffects = Object.freeze([
        ...(state.activeEffects ?? []),
        Object.freeze({
          type: 'COST_MULTIPLIER',
          costMultiplier: 1 - effect.amount,
          remainingTurns: effect.duration,
          duration: effect.duration,
        }),
      ]);
      break;
    case 'UNIT_COST_MULTIPLIER':
      state.unitCost = Math.max(1, Math.round((state.unitCost ?? state.cost ?? 1) * effect.multiplier));
      if (state.cost !== undefined) state.cost = Math.max(1, Math.round(state.cost * effect.multiplier));
      break;
    default:
      break;
  }

  return Object.freeze(state);
}

export function getClearGrade(gameState) {
  const capital = gameState.capital ?? gameState.player?.capital ?? 0;
  const creditScore = gameState.creditScore ?? 70;
  const health = gameState.health ?? gameState.player?.health ?? 0;
  const creditGrade = getCreditGrade(creditScore);

  if (capital >= 50000000 && creditGrade === 'A' && health >= 6) return 'S';
  if (capital >= 20000000 && ['A', 'B'].includes(creditGrade)) return 'A';
  if (capital >= 5000000) return 'B';
  if (capital > 0) return 'C';
  return 'C';
}

function createRewardOption(id, label, description, effect, legacyType) {
  return {
    id,
    type: legacyType,
    title: label,
    label,
    description,
    effect,
  };
}

function normalizeRewardGrade(grade) {
  return String(grade ?? 'NORMAL').toUpperCase();
}

function denormalizeRewardGrade(normalizedGrade, originalGrade) {
  const original = String(originalGrade ?? '');

  if (original && original === original.toLowerCase()) {
    return REWARD_GRADES[normalizedGrade] ?? original;
  }

  return normalizedGrade;
}

function normalizeRewardEffect(effect) {
  if (!effect) return null;

  const typeMap = {
    health: 'HEALTH',
    healthFull: 'HEALTH_FULL',
    capital: 'CAPITAL',
    quality: 'QUALITY',
    brand: 'BRAND',
    creditScore: 'CREDIT',
    awareness: 'AWARENESS',
    unitCostMultiplier: 'UNIT_COST_MULTIPLIER',
  };

  return {
    ...effect,
    type: typeMap[effect.type] ?? effect.type,
  };
}

function getCreditGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
