import { ADVISOR_IDS } from '../constants/advisors';
import {
  CREDIT_ADVISOR_MODIFIERS,
  CREDIT_GRADE_ORDER,
  CREDIT_GRADES,
  CREDIT_RATE_EFFECTS,
  CREDIT_SCORE_CHANGES,
  CREDIT_SCORE_MAX,
  CREDIT_SCORE_MIN,
  CREDIT_SCORE_START,
} from '../constants/creditScore';
import { BANK_ACTION_IDS } from '../constants/strategies';

export function getGrade(score) {
  const safeScore = clampScore(score);

  return Object.values(CREDIT_GRADES).find(
    (grade) => safeScore >= grade.min && safeScore <= grade.max,
  )?.grade ?? 'D';
}

export function getLoanLimit(score, capital) {
  const grade = CREDIT_GRADES[getGrade(score)];

  return Math.max(0, Math.round(Math.max(0, capital) * grade.loanLimitCapitalMultiplier));
}

export function getInterestRate(score, activeEffects = [], advisorId = null) {
  const grade = CREDIT_GRADES[getGrade(score)];

  if (grade.grade === 'D') {
    return null;
  }

  const context = normalizeEffectsContext(activeEffects, advisorId);
  const eventDelta = context.effects.reduce((delta, effect) => {
    if (isRateHikeEffect(effect)) {
      return delta + CREDIT_RATE_EFFECTS.RATE_HIKE_DELTA;
    }

    if (isRateCutEffect(effect)) {
      return delta + CREDIT_RATE_EFFECTS.RATE_CUT_DELTA;
    }

    return delta;
  }, 0);
  const advisorDelta =
    context.advisorId === ADVISOR_IDS.GUARDIAN ? CREDIT_RATE_EFFECTS.GUARDIAN_DELTA : 0;

  return Math.max(0, roundRate(grade.annualInterestRate + eventDelta + advisorDelta));
}

export function updateScore(gameState = {}, settlementOrAdvisor = null, advisorId = null) {
  if (settlementOrAdvisor && typeof settlementOrAdvisor === 'object' && !Array.isArray(settlementOrAdvisor)) {
    return updateScoreFromSettlement(gameState, settlementOrAdvisor, advisorId);
  }

  const actualAdvisorId = settlementOrAdvisor ?? advisorId;
  const currentScore = clampScore(gameState.creditScore ?? CREDIT_SCORE_START);
  const rawReasons = getScoreReasons(gameState);
  const rawDelta = rawReasons.reduce((total, reason) => total + reason.delta, 0);
  const delta = applyAdvisorScoreModifier(rawDelta, actualAdvisorId);
  const newScore = clampScore(currentScore + delta);

  return Object.freeze({
    previousScore: currentScore,
    newScore,
    delta,
    newGrade: getGrade(newScore),
    gradeChange: checkGradeChange(currentScore, newScore),
    gradeChanged: getGrade(newScore) !== getGrade(currentScore),
    analystPreview: actualAdvisorId === ADVISOR_IDS.ANALYST,
    reasons: Object.freeze(rawReasons),
  });
}

function updateScoreFromSettlement(gameState = {}, settlementResult = {}, advisorId = null) {
  const currentScore = clampScore(gameState.creditScore ?? CREDIT_SCORE_START);
  let delta = 0;

  if (settlementResult.isProfit) {
    delta += 1;
  } else {
    delta -= 2;
  }

  if (settlementResult.interestPaid) delta += 2;
  if (settlementResult.loanRepaid) delta += 5;
  if ((gameState.stats?.profitStreak ?? 0) >= 3) delta += 1;
  if ((settlementResult.shareAfter ?? 0) >= 0.5) delta += 1;

  if ((gameState.capital ?? gameState.player?.capital ?? 0) < 0) delta -= 5;
  if (settlementResult.interestLate) delta -= 4;
  if (settlementResult.loanOverdue) delta -= 3;
  if ((gameState.bankruptcyTurns ?? 0) >= 3) delta -= 10;

  (gameState.activeEffects ?? gameState.marketEffects ?? []).forEach((effect) => {
    const effects = effect.effects ?? effect.effect ?? effect;
    delta += effects.creditScoreChange ?? 0;
  });

  delta = applyAdvisorScoreModifier(delta, advisorId);

  const newScore = clampScore(currentScore + delta);

  return Object.freeze({
    previousScore: currentScore,
    newScore,
    delta,
    newGrade: getGrade(newScore),
    gradeChange: checkGradeChange(currentScore, newScore),
    gradeChanged: getGrade(newScore) !== getGrade(currentScore),
    analystPreview: advisorId === ADVISOR_IDS.ANALYST,
    reasons: Object.freeze([]),
  });
}

export function checkGradeChange(prevScore, newScore) {
  const prevIndex = CREDIT_GRADE_ORDER.indexOf(getGrade(prevScore));
  const nextIndex = CREDIT_GRADE_ORDER.indexOf(getGrade(newScore));

  if (nextIndex > prevIndex) {
    return 'UP';
  }

  if (nextIndex < prevIndex) {
    return 'DOWN';
  }

  return null;
}

function getScoreReasons(gameState) {
  const settlement = gameState.currentSettlement ?? {};
  const result = gameState.currentResult ?? {};
  const profit = result.profit ?? settlement.profit ?? 0;
  const capitalAfter = settlement.capitalAfter ?? gameState.player?.capital ?? 0;
  const playerParticipant = settlement.demandSplit?.find((participant) => participant.id === 'player');
  const marketLeaderShare = Math.max(
    0,
    ...(settlement.demandSplit ?? []).map((participant) => participant.marketShare ?? 0),
  );
  const reasons = [];

  if (profit > 0) {
    reasons.push(createReason('PROFIT'));
  } else if (profit < 0) {
    reasons.push(createReason('LOSS'));
  }

  if (isInterestPaid(gameState, settlement)) {
    reasons.push(createReason('INTEREST_PAID'));
  }

  if (isPrincipalFullyRepaid(gameState, settlement)) {
    reasons.push(createReason('FULL_PRINCIPAL_REPAYMENT'));
  }

  if (hasProfitStreak(gameState, profit, 3)) {
    reasons.push(createReason('PROFIT_STREAK_3'));
  }

  if ((playerParticipant?.marketShare ?? 0) > 0 && playerParticipant.marketShare >= marketLeaderShare) {
    reasons.push(createReason('MARKET_SHARE_LEADER'));
  }

  if (capitalAfter < 0) {
    reasons.push(createReason('NEGATIVE_CAPITAL_TURN'));
  }

  if (gameState.interestOverdue === true || settlement.interestOverdue === true) {
    reasons.push(createReason('INTEREST_OVERDUE'));
  }

  if (
    gameState.principalUnpaid === true ||
    settlement.principalUnpaid === true ||
    (gameState.unpaidPrincipalTurns ?? 0) > 0
  ) {
    reasons.push(createReason('PRINCIPAL_UNPAID_STACK'));
  }

  if (hasNegativeCapitalStreak(gameState, capitalAfter, 3)) {
    reasons.push(createReason('NEAR_BANKRUPTCY_3_NEGATIVE_TURNS'));
  }

  if (hasRateHikeEvent(gameState)) {
    reasons.push(createReason('RATE_HIKE_EVENT'));
  }

  if (hasRivalDumpingDamage(gameState)) {
    reasons.push(createReason('RIVAL_DUMPING_DAMAGE'));
  }

  return reasons;
}

function applyAdvisorScoreModifier(delta, advisorId) {
  if (delta > 0 && advisorId === ADVISOR_IDS.RAIDER) {
    return delta + CREDIT_ADVISOR_MODIFIERS.raiderPositiveBonus;
  }

  if (delta < 0 && advisorId === ADVISOR_IDS.GUARDIAN) {
    return Math.min(0, delta + CREDIT_ADVISOR_MODIFIERS.guardianNegativeReduction);
  }

  if (delta !== 0 && advisorId === ADVISOR_IDS.GAMBLER) {
    return delta > 0
      ? Math.ceil(delta * CREDIT_ADVISOR_MODIFIERS.gamblerChangeMultiplier)
      : Math.floor(delta * CREDIT_ADVISOR_MODIFIERS.gamblerChangeMultiplier);
  }

  return delta;
}

function createReason(key) {
  return Object.freeze({
    key,
    delta: CREDIT_SCORE_CHANGES[key],
  });
}

function isInterestPaid(gameState, settlement) {
  if (gameState.interestOverdue === true || settlement.interestOverdue === true) {
    return false;
  }

  return (settlement.debtService ?? 0) > 0 || gameState.interestPaid === true;
}

function isPrincipalFullyRepaid(gameState, settlement) {
  const debtAfter = settlement.playerAfterOperation?.debt ?? gameState.player?.debt;
  const explicitRepayment =
    gameState.principalFullyRepaid === true || settlement.principalFullyRepaid === true;
  const strategyRepayment =
    gameState.strategy?.bankActionId === BANK_ACTION_IDS.REPAY && debtAfter === 0;

  return explicitRepayment || strategyRepayment;
}

function hasProfitStreak(gameState, currentProfit, turns) {
  const previous = (gameState.history ?? gameState.timeline ?? [])
    .map((turn) => turn.netProfit ?? turn.profit ?? 0)
    .slice(-(turns - 1));
  const profits = [...previous, currentProfit].slice(-turns);

  return profits.length === turns && profits.every((profit) => profit > 0);
}

function hasNegativeCapitalStreak(gameState, currentCapital, turns) {
  const previous = (gameState.history ?? gameState.timeline ?? [])
    .map((turn) => turn.capitalAfter ?? turn.capital ?? 0)
    .slice(-(turns - 1));
  const capitals = [...previous, currentCapital].slice(-turns);

  return capitals.length === turns && capitals.every((capital) => capital < 0);
}

function hasRateHikeEvent(gameState) {
  return normalizeEffectsContext(gameState.marketEffects ?? []).effects.some(isRateHikeEffect) ||
    isRateHikeEffect(gameState.currentExternalEvent) ||
    isRateHikeEffect(gameState.lastExternalEvent);
}

function hasRivalDumpingDamage(gameState) {
  const event = gameState.currentRivalEvent ?? gameState.lastRivalEvent;
  const effect = event?.effect ?? event?.effects ?? {};

  return event?.id === 'R05' || event?.action === 'DUMPING' || effect.rivalHealthPenalty !== undefined;
}

function normalizeEffectsContext(activeEffects, advisorId = null) {
  if (Array.isArray(activeEffects)) {
    return Object.freeze({
      effects: activeEffects,
      advisorId,
    });
  }

  return Object.freeze({
    effects: activeEffects.effects ?? activeEffects.marketEffects ?? [],
    advisorId: advisorId ?? activeEffects.advisorId ?? activeEffects.advisor?.id ?? null,
  });
}

function isRateHikeEffect(effect) {
  const effects = effect?.effects ?? effect?.effect ?? {};

  return (
    effect?.id === CREDIT_RATE_EFFECTS.RATE_HIKE_EVENT_ID ||
    effect?.eventId === CREDIT_RATE_EFFECTS.RATE_HIKE_EVENT_ID ||
    effects.loanInterestMultiplier > 1 ||
    effects.debtCostMultiplier > 1
  );
}

function isRateCutEffect(effect) {
  const effects = effect?.effects ?? effect?.effect ?? {};

  return (
    effect?.id === CREDIT_RATE_EFFECTS.RATE_CUT_EVENT_ID ||
    effect?.eventId === CREDIT_RATE_EFFECTS.RATE_CUT_EVENT_ID ||
    (effects.loanInterestMultiplier > 0 && effects.loanInterestMultiplier < 1) ||
    (effects.debtCostMultiplier > 0 && effects.debtCostMultiplier < 1)
  );
}

function clampScore(score) {
  return Math.min(CREDIT_SCORE_MAX, Math.max(CREDIT_SCORE_MIN, Math.round(Number(score) || 0)));
}

function roundRate(rate) {
  return Math.round(rate * 10000) / 10000;
}
