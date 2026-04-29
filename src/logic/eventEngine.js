import { EXTERNAL_EVENTS } from '../constants/events/external';
import { CHOICE_TIERS, INTERNAL_EVENTS } from '../constants/events/internal';
import { RIVAL_EVENTS, RIVAL_EVENT_TIERS } from '../constants/events/rival';
import { getAdvisorById } from './advisorEngine';

const EXTERNAL_EVENT_CHANCE = 0.4;
const INTERNAL_EVENT_CHANCE = 0.6;
const RIVAL_EVENT_CHANCE = 0.3;
const CASH_RATIOS = Object.freeze({ SM: 0.05, MD: 0.15, LG: 0.3 });

export function rollExternalEvent(floor, randomValue = Math.random()) {
  if (randomValue >= EXTERNAL_EVENT_CHANCE) {
    return null;
  }

  const index = Math.floor((randomValue / EXTERNAL_EVENT_CHANCE) * EXTERNAL_EVENTS.length);
  return normalizeExternalEvent(EXTERNAL_EVENTS[index % EXTERNAL_EVENTS.length], floor);
}

export function rollRivalEvent(rivals, randomValue = Math.random()) {
  if (randomValue >= RIVAL_EVENT_CHANCE) {
    return null;
  }

  const activeRivals = rivals.filter((rival) => rival.active && !rival.bankrupt && !rival.respawning);

  if (!activeRivals.length) {
    return null;
  }

  const rival = activeRivals[Math.floor((randomValue / RIVAL_EVENT_CHANCE) * activeRivals.length) % activeRivals.length];
  const eligibleEvents = RIVAL_EVENTS.filter(
    (event) => normalizeRivalTier(rival.tier) >= RIVAL_EVENT_TIERS[event.minRivalTier],
  );

  if (!eligibleEvents.length) {
    return null;
  }

  const event = eligibleEvents[Math.floor(randomValue * 1000) % eligibleEvents.length];

  return Object.freeze({
    ...event,
    type: 'RIVAL',
    category: 'RIVAL',
    rivalId: rival.id,
    rivalName: rival.name,
    title: event.name,
    description: event.message(rival.name),
    message: event.message(rival.name),
    effects: Object.freeze(event.effect),
    duration: event.effect.duration,
    background: 'rival',
  });
}

export function rollInternalEvent(gameState, randomValue = Math.random()) {
  if (randomValue >= INTERNAL_EVENT_CHANCE) {
    return null;
  }

  const seed = Math.floor((gameState?.floor ?? 1) * 17 + randomValue * 1000);
  return INTERNAL_EVENTS[seed % INTERNAL_EVENTS.length];
}

export function resolveChoice(choice, gameState, advisorId, randomValue = Math.random()) {
  const outcomes = getChoiceOutcomes(choice, advisorId);
  let cursor = 0;

  for (const outcome of outcomes) {
    cursor += outcome.prob;

    if (randomValue <= cursor) {
      return buildChoiceResult(choice, outcome, gameState);
    }
  }

  return buildChoiceResult(choice, outcomes.at(-1), gameState);
}

export function applyExternalEffect(effect, gameState) {
  return Object.freeze({
    ...gameState,
    marketEffects: addEffectToActiveList(gameState.marketEffects ?? [], {
      id: `external-${Date.now()}`,
      eventId: effect.id ?? 'external',
      title: effect.name ?? effect.title ?? '외부 이벤트',
      background: effect.category?.toLowerCase?.() ?? 'market',
      effects: effect.effects ?? effect.effect ?? effect,
      duration: effect.duration ?? effect.effect?.duration ?? 1,
    }, gameState.floor ?? 1),
  });
}

export function applyRivalEvent(effect, rivalState) {
  return Object.freeze({
    ...rivalState,
    activeEffects: tickActiveEffects(rivalState).concat(
      Object.freeze({
        ...effect,
        duration: effect.duration ?? 1,
      }),
    ),
  });
}

export function tickActiveEffects(gameState) {
  return Object.freeze(
    (gameState.activeEffects ?? [])
      .map((effect) => Object.freeze({ ...effect, duration: effect.duration - 1 }))
      .filter((effect) => effect.duration > 0),
  );
}

export function selectExternalEvent({ floor, randomValue = Math.random() }) {
  return rollExternalEvent(floor, randomValue);
}

export function addExternalEventEffect(marketEffects, event, floor) {
  if (!event) {
    return marketEffects;
  }

  return addEffectToActiveList(expireMarketEffects(marketEffects, floor), event, floor);
}

export function expireMarketEffects(marketEffects, floor) {
  return Object.freeze(marketEffects.filter((effect) => effect.expiresOnFloor >= floor));
}

export function getActiveMarketModifiers(marketEffects, floor) {
  return expireMarketEffects(marketEffects, floor).reduce(
    (modifiers, effect) => {
      const effects = effect.effects ?? {};

      return Object.freeze({
        demandMultiplier: modifiers.demandMultiplier * (effects.demandMultiplier ?? 1),
        costMultiplier: modifiers.costMultiplier * (effects.costMultiplier ?? 1),
        qualityMultiplier: modifiers.qualityMultiplier * (effects.qualityMultiplier ?? 1),
        awarenessMultiplier: modifiers.awarenessMultiplier * (effects.awarenessMultiplier ?? 1),
        rivalEfficiencyMultiplier:
          modifiers.rivalEfficiencyMultiplier * (effects.rivalEfficiencyMultiplier ?? 1),
        debtCostMultiplier:
          modifiers.debtCostMultiplier *
          (effects.debtCostMultiplier ?? effects.loanInterestMultiplier ?? 1),
        valueDemandMultiplier:
          modifiers.valueDemandMultiplier * (effects.valueDemandMultiplier ?? 1),
        qualityDemandMultiplier:
          modifiers.qualityDemandMultiplier * (effects.qualityDemandMultiplier ?? 1),
        orderCapMultiplier: modifiers.orderCapMultiplier * (effects.orderCapMultiplier ?? 1),
        brandMultiplier: modifiers.brandMultiplier * (effects.brandMultiplier ?? 1),
        netProfitMultiplier: modifiers.netProfitMultiplier * (effects.netProfitMultiplier ?? 1),
        playerDemandPenalty: modifiers.playerDemandPenalty + (effects.playerDemandPenalty ?? 0),
      });
    },
    Object.freeze({
      demandMultiplier: 1,
      costMultiplier: 1,
      qualityMultiplier: 1,
      awarenessMultiplier: 1,
      rivalEfficiencyMultiplier: 1,
      debtCostMultiplier: 1,
      valueDemandMultiplier: 1,
      qualityDemandMultiplier: 1,
      orderCapMultiplier: 1,
      brandMultiplier: 1,
      netProfitMultiplier: 1,
      playerDemandPenalty: 0,
    }),
  );
}

export function drawInternalEvent({ randomValue = Math.random(), chance = INTERNAL_EVENT_CHANCE, gameState = null }) {
  if (randomValue > chance) {
    return null;
  }

  return rollInternalEvent(gameState, randomValue / Math.max(chance, 0.000001));
}

export function resolveInternalChoice(choice, randomValue = Math.random(), advisorId = null, gameState = null) {
  return resolveChoice(choice, gameState, advisorId, randomValue);
}

export function applyEffectBundleToPlayer(player, effects = {}) {
  const maxHealth = player.maxHealth ?? 10;

  return Object.freeze({
    ...player,
    capital: player.capital + (effects.capital ?? 0),
    health: Math.min(maxHealth, Math.max(0, player.health + (effects.health ?? 0))),
    brand: Math.max(0, player.brand + (effects.brand ?? 0)),
    awareness: Math.min(1.5, Math.max(0, player.awareness + (effects.awareness ?? 0))),
    efficiency: Math.max(0.1, player.efficiency + (effects.efficiency ?? 0)),
    maxQuality: Math.max(1, player.maxQuality + (effects.maxQuality ?? 0)),
    unitCost: effects.unitCostMultiplier
      ? Math.max(1, Math.round(player.unitCost * effects.unitCostMultiplier))
      : player.unitCost,
  });
}

function addEffectToActiveList(marketEffects, event, floor) {
  const duration = event.duration ?? event.effect?.duration ?? event.effects?.duration ?? 1;

  return Object.freeze([
    ...expireMarketEffects(marketEffects, floor),
    Object.freeze({
      id: `${event.id}-${floor}`,
      eventId: event.id,
      title: event.title ?? event.name,
      category: event.category,
      message: event.message ?? event.description,
      background: event.background ?? event.category?.toLowerCase?.() ?? 'market',
      effects: Object.freeze(event.effects ?? normalizeExternalEffect(event.effect ?? {})),
      expiresOnFloor: floor + duration - 1,
    }),
  ]);
}

function normalizeExternalEvent(event, floor) {
  return Object.freeze({
    ...event,
    title: event.title ?? event.name,
    description: event.description ?? event.message,
    duration: event.duration ?? event.effect?.duration ?? 1,
    background: event.background ?? event.category?.toLowerCase?.() ?? 'market',
    scheduledFloors: event.scheduledFloors ?? Object.freeze([]),
    effects: Object.freeze(event.effects ?? normalizeExternalEffect(event.effect ?? {})),
    floor,
  });
}

function normalizeExternalEffect(effect) {
  return {
    ...effect,
    debtCostMultiplier: effect.debtCostMultiplier ?? effect.loanInterestMultiplier,
    costMultiplier:
      (effect.costMultiplier ?? 1) *
      (effect.shippingCostMultiplier ?? 1),
  };
}

function normalizeRivalTier(tier) {
  if (typeof tier === 'number') {
    return tier;
  }

  return {
    ENTRY: 1,
    VALUE: 1,
    MID: 2,
    SPECIALIST: 2,
    SENIOR: 3,
    ELITE: 3,
    CHAMPION: 4,
  }[String(tier).toUpperCase()] ?? 1;
}

function getChoiceOutcomes(choice, advisorId) {
  const rawOutcome = choice.outcome ?? choice.outcomes ?? {};
  const baseOutcomes = Array.isArray(rawOutcome)
    ? rawOutcome.map((item) => Object.freeze({ prob: item.prob ?? item.weight ?? 1, result: item.result ?? item.effects ?? {} }))
    : [Object.freeze({ prob: 1, result: rawOutcome })];
  const total = baseOutcomes.reduce((sum, outcome) => sum + outcome.prob, 0) || 1;
  const normalized = baseOutcomes.map((outcome) =>
    Object.freeze({ ...outcome, prob: outcome.prob / total }),
  );
  const advisor = advisorId ? getAdvisorById(advisorId) : null;
  const choiceType = choice.type ?? choice.tier;
  const bonus =
    choiceType === CHOICE_TIERS.GAMBLE
      ? advisor?.passive.gamblingOddsBonus ?? 0
      : choiceType === CHOICE_TIERS.ABSURD
        ? advisor?.passive.absurdOddsBonus ?? 0
        : 0;

  if (!bonus || normalized.length < 2) {
    return normalized;
  }

  const [bestOutcome, ...rest] = normalized;
  const restTotal = rest.reduce((sum, outcome) => sum + outcome.prob, 0);
  const bestProb = Math.min(0.95, bestOutcome.prob + bonus);
  const remaining = Math.max(0.05, 1 - bestProb);

  return Object.freeze([
    Object.freeze({ ...bestOutcome, prob: bestProb }),
    ...rest.map((outcome) =>
      Object.freeze({
        ...outcome,
        prob: restTotal > 0 ? (outcome.prob / restTotal) * remaining : remaining / rest.length,
      }),
    ),
  ]);
}

function buildChoiceResult(choice, outcome, gameState) {
  const effects = convertOutcomeToEffects(outcome.result, gameState);
  const positiveScore = Object.values(effects).reduce((sum, value) => sum + (Number(value) > 0 ? 1 : 0), 0);
  const negativeScore = Object.values(effects).reduce((sum, value) => sum + (Number(value) < 0 ? 1 : 0), 0);
  const label = positiveScore >= negativeScore ? '성공' : '실패';

  return Object.freeze({
    label,
    description: describeOutcome(effects),
    effects,
    rawResult: Object.freeze(outcome.result),
    choiceLabel: choice.label,
    tier: choice.type ?? choice.tier,
    success: positiveScore >= negativeScore,
  });
}

function convertOutcomeToEffects(result = {}, gameState = null) {
  const capital = convertCash(result.cash, gameState?.player?.capital ?? 35000000);

  return Object.freeze({
    capital,
    brand: result.brand ?? 0,
    maxQuality: result.quality ?? 0,
    awareness: normalizeAwareness(result.awareness ?? 0),
    efficiency: result.productionEfficiency ?? 0,
    unitCostMultiplier: result.cost ? Math.max(0.1, 1 + result.cost) : undefined,
    health: result.health ?? 0,
  });
}

function convertCash(cash, capital) {
  if (!cash) {
    return 0;
  }

  const sign = String(cash).startsWith('-') ? -1 : 1;
  const size = String(cash).replace(/[+-]/g, '');

  return Math.round(capital * (CASH_RATIOS[size] ?? 0) * sign);
}

function normalizeAwareness(value) {
  if (!value) {
    return 0;
  }

  return Math.abs(value) > 1 ? value / 100 : value;
}

function describeOutcome(effects) {
  const labels = [];

  if (effects.capital) labels.push(`현금 ${formatSigned(effects.capital)}`);
  if (effects.brand) labels.push(`브랜드 ${formatSigned(effects.brand)}`);
  if (effects.maxQuality) labels.push(`품질 ${formatSigned(effects.maxQuality)}`);
  if (effects.awareness) labels.push(`인지도 ${formatSigned(Math.round(effects.awareness * 100))}%`);
  if (effects.efficiency) labels.push(`효율 ${formatSigned(Math.round(effects.efficiency * 100))}%`);
  if (effects.unitCostMultiplier) {
    labels.push(`원가 ${formatSigned(Math.round((effects.unitCostMultiplier - 1) * 100))}%`);
  }
  if (effects.health) labels.push(`체력 ${formatSigned(effects.health)}`);

  return labels.length ? labels.join(' / ') : '큰 변화 없음';
}

function formatSigned(value) {
  return `${value > 0 ? '+' : ''}${value.toLocaleString()}`;
}
