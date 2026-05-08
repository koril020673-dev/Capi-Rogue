import { ACHIEVEMENTS } from '../constants/achievements';
import { supabase } from '../lib/supabase';
import { getGrade } from './creditEngine';

export function checkAchievements(gameState, settlementResult = {}) {
  const unlocked = gameState.unlockedAchievements ?? [];
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (unlocked.includes(achievement.id) || newlyUnlocked.includes(achievement.id)) {
      return;
    }

    if (checkCondition(achievement.condition, gameState, settlementResult, newlyUnlocked)) {
      newlyUnlocked.push(achievement.id);
    }
  });

  return newlyUnlocked;
}

function checkCondition(condition, gameState, settlementResult, newlyUnlocked) {
  const timeline = gameState.timeline ?? [];
  const profit = Number(settlementResult.profit ?? settlementResult.netProfit ?? gameState.currentResult?.profit ?? 0);
  const isProfit = Boolean(settlementResult.isProfit ?? profit > 0);
  const player = gameState.player ?? {};
  const shareAfter = Number(
    settlementResult.shareAfter ??
    settlementResult.demandSplit?.find?.((item) => item.id === 'player')?.marketShare ??
    timeline.at(-1)?.marketShare ??
    0,
  );
  const eventOutcome = gameState.currentInternalOutcome ?? settlementResult.internalOutcome ?? null;

  switch (condition.type) {
    case 'PROFIT_ONCE':
      return isProfit;
    case 'PROFIT_STREAK':
      return getProfitStreak(timeline, isProfit) >= condition.count;
    case 'PROFIT_STREAK_RECESSION':
      return gameState.phase === 'recession' && getProfitStreak(timeline, isProfit) >= condition.count;
    case 'PROFIT_IN_PHASE':
      return gameState.phase === condition.phase && isProfit;
    case 'SHARE_OVER':
      return shareAfter >= condition.value;
    case 'FACTORY_SUCCESS':
      return Boolean(settlementResult.factoryResult?.success);
    case 'COST_REDUCTION_OVER':
      return Number(player.costReduction ?? player.costReductionTotal ?? 0) >= condition.value;
    case 'QUALITY_OVER':
      return Number(player.maxQuality ?? player.quality ?? 0) >= condition.value;
    case 'AWARENESS_OVER':
      return Number(player.awareness ?? gameState.awareness ?? 0) >= condition.value;
    case 'CREDIT_GRADE':
      return getGrade(gameState.creditScore ?? 70) === condition.grade;
    case 'CREDIT_SCORE_MAX':
      return Number(gameState.creditScore ?? 0) >= 100;
    case 'HAS_LOAN':
      return (gameState.loans?.length ?? 0) > 0 || Number(player.debt ?? 0) > 0;
    case 'CAPITAL_OVER_DEBT':
      return Number(player.capital ?? 0) > Number(player.debt ?? 0);
    case 'CLEAR_DEBT_FREE':
      return gameState.runOutcome === 'clear' && Number(player.debt ?? 0) <= 0;
    case 'PHASE_EXPERIENCE':
      return new Set(timeline.map((item) => item.phase).filter(Boolean)).size >= condition.count;
    case 'EVENT_CHOICE':
      return Boolean(eventOutcome);
    case 'EVENT_SUCCESS_COUNT':
      return countSuccessfulEvents(timeline, eventOutcome) >= condition.count;
    case 'GAMBLE_SUCCESS':
      return Boolean(eventOutcome?.success && ['GAMBLE', 'ABSURD', 'gamble', 'absurd'].includes(eventOutcome.tier));
    case 'RIVAL_MET':
      return (gameState.metRivals?.length ?? 0) >= condition.count;
    case 'RIVAL_DOMINATED':
      return getRivalDominatedCount(gameState, shareAfter) >= condition.count;
    case 'NET_PROFIT_OVER':
      return profit >= condition.value;
    case 'CAPITAL_OVER':
      return Number(player.capital ?? 0) >= condition.value;
    case 'LOW_HEALTH_SURVIVE':
      return Number(player.health ?? 10) <= condition.value && !gameState.isGameOver;
    case 'BANKRUPTCY_RECOVER':
      return timeline.some((item) => Number(item.capitalAfter ?? item.capital ?? 0) < 0) && Number(player.capital ?? 0) > 0;
    case 'CLEAR_NO_BANKRUPTCY':
      return gameState.runOutcome === 'clear' && !timeline.some((item) => Number(item.capitalAfter ?? item.capital ?? 0) < 0);
    case 'ECONOMY_UNLOCK_COUNT':
      return countEconomyUnlocked(gameState.unlockedAchievements, newlyUnlocked) >= condition.count;
    case 'FLOOR_OVER':
      return Number(gameState.floor ?? 0) >= condition.value;
    case 'ADVISOR':
      return gameState.runOutcome === 'clear' && gameState.selectedAdvisorId === condition.advisorId;
    case 'GAME_OVER':
      return gameState.runOutcome === 'bankrupt' || Boolean(gameState.isGameOver);
    case 'CLEAR_GRADE':
      return gameState.runOutcome === 'clear' && gameState.clearGrade === condition.grade;
    case 'CLEAR_NO_LOSS':
      return gameState.runOutcome === 'clear' && !timeline.some((item) => Number(item.profit ?? 0) < 0);
    case 'ACHIEVEMENT_COUNT':
      return (gameState.unlockedAchievements?.length ?? 0) + newlyUnlocked.length >= condition.count;
    case 'TODO':
      // TODO: Add exact telemetry for this achievement condition when the related stat is stored.
      return false;
    default:
      return false;
  }
}

export async function saveAchievements(userId, achievementIds) {
  if (!userId || !supabase) {
    return null;
  }

  try {
    const { error } = await supabase
      .from('player_accounts')
      .update({ achievements: achievementIds })
      .eq('id', userId);

    if (error) {
      console.error('saveAchievements failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('saveAchievements failed:', error);
    return false;
  }
}

export function getEducationProgress(unlockedAchievements = []) {
  const educationAchievements = ACHIEVEMENTS.filter((achievement) => achievement.category === 'ECONOMY');
  const unlocked = educationAchievements.filter((achievement) => unlockedAchievements.includes(achievement.id));

  return Object.freeze({
    total: educationAchievements.length,
    unlocked: unlocked.length,
    percentage: educationAchievements.length
      ? Math.floor((unlocked.length / educationAchievements.length) * 100)
      : 0,
    byCategory: groupByEducationLink(educationAchievements, unlockedAchievements),
  });
}

export async function saveEducationProgress(userId, unlockedAchievements) {
  if (!userId || !supabase) {
    return null;
  }

  const progress = getEducationProgress(unlockedAchievements);

  try {
    const { error } = await supabase
      .from('player_accounts')
      .update({
        achievements: unlockedAchievements,
        education_progress: progress,
      })
      .eq('id', userId);

    if (error) {
      console.error('saveEducationProgress failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('saveEducationProgress failed:', error);
    return false;
  }
}

export async function saveStudentProgress(gameState) {
  if (gameState.userType !== 'student') {
    return null;
  }

  return saveEducationProgress(gameState.playerId, gameState.unlockedAchievements ?? []);
}

function getProfitStreak(timeline, currentIsProfit) {
  const results = [
    ...timeline.map((item) => Number(item.profit ?? 0) > 0),
    currentIsProfit,
  ];
  let streak = 0;

  for (let index = results.length - 1; index >= 0; index -= 1) {
    if (!results[index]) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function countSuccessfulEvents(timeline, eventOutcome) {
  const historical = timeline.filter((item) => item.eventSuccess).length;

  return historical + (eventOutcome?.success ? 1 : 0);
}

function getRivalDominatedCount(gameState, shareAfter) {
  const historical = gameState.timeline?.filter((item) => Number(item.marketShare ?? 0) >= 0.5).length ?? 0;

  return historical + (shareAfter >= 0.5 ? 1 : 0);
}

function countEconomyUnlocked(unlockedAchievements = [], newlyUnlocked = []) {
  const ids = new Set([...unlockedAchievements, ...newlyUnlocked]);

  return ACHIEVEMENTS.filter((achievement) => (
    achievement.category === 'ECONOMY' && ids.has(achievement.id)
  )).length;
}

function groupByEducationLink(educationAchievements, unlockedAchievements) {
  return educationAchievements.reduce((groups, achievement) => {
    const key = achievement.educationLink ?? '기타';
    const current = groups[key] ?? { total: 0, unlocked: 0 };

    return {
      ...groups,
      [key]: {
        total: current.total + 1,
        unlocked: current.unlocked + (unlockedAchievements.includes(achievement.id) ? 1 : 0),
      },
    };
  }, {});
}
