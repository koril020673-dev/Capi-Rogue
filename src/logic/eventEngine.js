import { EXTERNAL_EVENTS } from '../constants/events/external';
import { CHOICE_TIERS } from '../constants/events/internal';
import { INTERNAL_EVENTS } from '../constants/events/internal';
import { getAdvisorById } from './advisorEngine';

export function selectExternalEvent({ floor, randomValue = Math.random() }) {
  const scheduledEvent = EXTERNAL_EVENTS.find((event) => event.scheduledFloors.includes(floor));

  if (scheduledEvent) {
    return scheduledEvent;
  }

  const chancePool = EXTERNAL_EVENTS.filter((event) => !event.scheduledFloors.includes(floor));
  const totalChance = chancePool.reduce((sum, event) => sum + event.chance, 0);
  let cursor = 0;

  for (const event of chancePool) {
    cursor += event.chance / Math.max(totalChance, 1);

    if (randomValue < totalChance && randomValue / Math.max(totalChance, 0.000001) <= cursor) {
      return event;
    }
  }

  return null;
}

export function addExternalEventEffect(marketEffects, event, floor) {
  if (!event) {
    return marketEffects;
  }

  return Object.freeze([
    ...expireMarketEffects(marketEffects, floor),
    Object.freeze({
      id: `${event.id}-${floor}`,
      eventId: event.id,
      title: event.title,
      background: event.background,
      effects: event.effects,
      expiresOnFloor: floor + event.duration - 1,
    }),
  ]);
}

export function expireMarketEffects(marketEffects, floor) {
  return Object.freeze(marketEffects.filter((effect) => effect.expiresOnFloor >= floor));
}

export function getActiveMarketModifiers(marketEffects, floor) {
  return expireMarketEffects(marketEffects, floor).reduce(
    (modifiers, effect) =>
      Object.freeze({
        demandMultiplier:
          modifiers.demandMultiplier * (effect.effects.demandMultiplier ?? 1),
        costMultiplier: modifiers.costMultiplier * (effect.effects.costMultiplier ?? 1),
        qualityMultiplier:
          modifiers.qualityMultiplier * (effect.effects.qualityMultiplier ?? 1),
        awarenessMultiplier:
          modifiers.awarenessMultiplier * (effect.effects.awarenessMultiplier ?? 1),
        rivalEfficiencyMultiplier:
          modifiers.rivalEfficiencyMultiplier *
          (effect.effects.rivalEfficiencyMultiplier ?? 1),
        debtCostMultiplier:
          modifiers.debtCostMultiplier * (effect.effects.debtCostMultiplier ?? 1),
        valueDemandMultiplier:
          modifiers.valueDemandMultiplier * (effect.effects.valueDemandMultiplier ?? 1),
        qualityDemandMultiplier:
          modifiers.qualityDemandMultiplier *
          (effect.effects.qualityDemandMultiplier ?? 1),
      }),
    Object.freeze({
      demandMultiplier: 1,
      costMultiplier: 1,
      qualityMultiplier: 1,
      awarenessMultiplier: 1,
      rivalEfficiencyMultiplier: 1,
      debtCostMultiplier: 1,
      valueDemandMultiplier: 1,
      qualityDemandMultiplier: 1,
    }),
  );
}

export function drawInternalEvent({ randomValue = Math.random(), chance = 0.62 }) {
  if (randomValue > chance) {
    return null;
  }

  const cardIndex = Math.floor(randomValue * 1000) % INTERNAL_EVENTS.length;
  return INTERNAL_EVENTS[cardIndex];
}

export function resolveInternalChoice(choice, randomValue = Math.random(), advisorId = null) {
  const outcomes = getAdjustedOutcomes(choice, advisorId);
  let cursor = 0;

  for (const outcome of outcomes) {
    cursor += outcome.weight;

    if (randomValue <= cursor) {
      return outcome;
    }
  }

  return outcomes.at(-1);
}

export function applyEffectBundleToPlayer(player, effects = {}) {
  const maxHealth = player.maxHealth ?? 10;

  return Object.freeze({
    ...player,
    capital: player.capital + (effects.capital ?? 0),
    health: Math.min(maxHealth, Math.max(0, player.health + (effects.health ?? 0))),
    brand: Math.max(0, player.brand + (effects.brand ?? 0)),
    awareness: Math.min(1.5, Math.max(0, player.awareness + (effects.awareness ?? 0))),
    unitCost: effects.unitCostMultiplier
      ? Math.max(1, Math.round(player.unitCost * effects.unitCostMultiplier))
      : player.unitCost,
  });
}

function getAdjustedOutcomes(choice, advisorId) {
  const advisor = advisorId ? getAdvisorById(advisorId) : null;
  const bonus =
    choice.tier === CHOICE_TIERS.GAMBLE
      ? advisor?.passive.gamblingOddsBonus ?? 0
      : choice.tier === CHOICE_TIERS.ABSURD
        ? advisor?.passive.absurdOddsBonus ?? 0
        : 0;

  if (!bonus || choice.outcomes.length < 2) {
    return choice.outcomes;
  }

  const [bestOutcome, ...rest] = choice.outcomes;
  const restWeight = rest.reduce((sum, outcome) => sum + outcome.weight, 0);
  const bestWeight = Math.min(0.95, bestOutcome.weight + bonus);
  const remainingWeight = Math.max(0.05, 1 - bestWeight);

  return Object.freeze([
    Object.freeze({ ...bestOutcome, weight: bestWeight }),
    ...rest.map((outcome) =>
      Object.freeze({
        ...outcome,
        weight: restWeight > 0 ? (outcome.weight / restWeight) * remainingWeight : remainingWeight / rest.length,
      }),
    ),
  ]);
}
