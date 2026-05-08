import {
  BASE_MONTHLY_DEMAND,
  DEMAND_RANDOM_RANGE,
  ECO_PHASES,
  FLOOR_TIER_DEMAND_MULTIPLIERS,
} from '../constants/economy';
import { getDemandMultiplierForPhase } from './econEngine';

export const BASE_DEMAND = 10000;

export function getFloorTierDemandMultiplier(floor) {
  return FLOOR_TIER_DEMAND_MULTIPLIERS.reduce((activeMultiplier, tier) => {
    if (floor >= tier.minFloor) {
      return tier.multiplier;
    }

    return activeMultiplier;
  }, 1);
}

export function getDemandRandomMultiplier(randomValue = Math.random()) {
  const { min, max } = DEMAND_RANDOM_RANGE;
  return min + (max - min) * Math.min(Math.max(randomValue, 0), 1);
}

export function calculateTotalDemand({
  floor,
  phase,
  momentumModifier = 1,
  marketDemandModifier = 1,
  advisorDemandBonus = 0,
  randomValue = Math.random(),
}) {
  return Math.max(
    1,
    Math.round(
      BASE_MONTHLY_DEMAND *
        getDemandMultiplierForPhase(phase) *
        getFloorTierDemandMultiplier(floor) *
        getDemandRandomMultiplier(randomValue) *
        momentumModifier *
        marketDemandModifier *
        (1 + advisorDemandBonus),
    ),
  );
}

export function calcAttraction(playerState, group = 'general', econPhase = null, rivalRateOverride = null) {
  const quality = Math.max(0.1, playerState.quality ?? playerState.maxQuality ?? 1);
  const brand = Math.max(0, playerState.brand ?? 0);
  const awareness = normalizeAwareness(playerState.awareness ?? 0);
  const price = Math.max(1, playerState.price ?? playerState.selectedPrice ?? 1);
  const rivalRate = Math.min(
    Math.max(rivalRateOverride ?? playerState.rivalRate ?? playerState.marketResistance ?? 0, 0),
    0.92,
  );
  const phase = econPhase ?? playerState.phase ?? playerState.econPhase ?? 'stable';
  const demandMultiplier =
    playerState.demandMultiplier ?? ECO_PHASES[phase]?.demandMultiplier ?? getDemandMultiplierForPhase(phase);

  if (group === 'quality') {
    return Math.max((quality * 1.5) / price, 0.001);
  }

  if (group === 'brand') {
    return Math.max(brand * awareness * 1.3, 0.001);
  }

  if (group === 'price') {
    return Math.max((1 / price) * demandMultiplier * 2, 0.001);
  }

  return Math.max(((quality + brand) * (1 + awareness)) / (price * (1 - rivalRate)), 0.001);
}

export function calcShare(playerAttraction, allAttractions) {
  const weightedAttractions = allAttractions.map((attraction) => Math.max(0, attraction) ** 2);
  const total = weightedAttractions.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return 0;
  }

  return Math.max(0, playerAttraction) ** 2 / total;
}

export function calcGroupDemand(phase, group, share, momentumMultiplier = 1) {
  const phaseConfig = ECO_PHASES[phase] ?? ECO_PHASES.stable;
  const groupRatio = phaseConfig.consumerRatio[group] ?? 0;

  return BASE_DEMAND * phaseConfig.demandMultiplier * groupRatio * Math.max(0, share) * momentumMultiplier;
}

export function calcTotalDemand(gameState, randomOrAllAttractions = Math.random()) {
  if (Array.isArray(randomOrAllAttractions)) {
    return calcTotalDemandFromAttractions(gameState, randomOrAllAttractions);
  }

  const randomValue = randomOrAllAttractions;
  const phase = gameState.econPhase ?? gameState.phase ?? 'stable';
  const player = normalizeParticipant(gameState);
  const rivals = (gameState.rivals ?? []).map(normalizeParticipant);
  const participants = [player, ...rivals];
  const phaseConfig = ECO_PHASES[phase] ?? ECO_PHASES.stable;
  const randomMultiplier = getDemandRandomMultiplier(randomValue);
  const activeMultiplier = getActiveDemandMultiplier(gameState.activeEffects ?? gameState.marketEffects ?? []);

  const total = Object.keys(phaseConfig.consumerRatio).reduce((sum, group) => {
    const attractions = participants.map((participant) =>
      calcAttraction({ ...participant, phase, demandMultiplier: phaseConfig.demandMultiplier }, group),
    );
    const share = calcShare(attractions[0], attractions);

    return sum + calcGroupDemand(phase, group, share);
  }, 0);

  return Math.max(1, Math.round(total * randomMultiplier * activeMultiplier));
}

function calcTotalDemandFromAttractions(gameState, allAttractions) {
  const phase = gameState.econPhase ?? gameState.phase ?? 'stable';
  const playerAttraction = allAttractions.find((item) => item.id === 'player')?.value ?? 0.001;
  const share = calcShare(playerAttraction, allAttractions.map((item) => item.value));
  const momentumMultiplier = getPromptMomentumMultiplier(gameState.momentum ?? 0);
  const randomMultiplier = getDemandRandomMultiplier();
  const activeMultiplier = getActiveDemandMultiplier(gameState.activeEffects ?? gameState.marketEffects ?? []);
  const phaseConfig = ECO_PHASES[phase] ?? ECO_PHASES.stable;
  const totalDemand = Object.keys(phaseConfig.consumerRatio).reduce(
    (sum, group) => sum + calcGroupDemand(phase, group, share, momentumMultiplier),
    0,
  );

  return Object.freeze({
    totalDemand: Math.max(1, Math.floor(totalDemand * randomMultiplier * activeMultiplier)),
    share,
    playerAttraction,
  });
}

function normalizeParticipant(state) {
  return {
    quality: state.quality ?? state.maxQuality ?? 1,
    brand: state.brand ?? 0,
    awareness: state.awareness ?? 0,
    price: state.price ?? state.selectedPrice ?? state.currentStrategy?.price ?? state.strategy?.selectedPrice ?? 1,
    rivalRate: state.rivalRate ?? state.resistance ?? 0,
  };
}

function normalizeAwareness(awareness) {
  return awareness > 1 ? awareness / 100 : awareness;
}

function getActiveDemandMultiplier(activeEffects) {
  return activeEffects.reduce((multiplier, item) => {
    const effect = item.effects ?? item.effect ?? item;

    return multiplier * (effect.demandMultiplier ?? 1);
  }, 1);
}

function getPromptMomentumMultiplier(momentum) {
  if (momentum >= 5) return 1.15;
  if (momentum >= 3) return 1.08;
  if (momentum >= 1) return 1.03;
  if (momentum === 0) return 1;
  if (momentum >= -2) return 0.95;
  if (momentum >= -4) return 0.9;
  return 0.85;
}
