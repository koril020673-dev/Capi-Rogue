import {
  BASE_MONTHLY_DEMAND,
  DEMAND_RANDOM_RANGE,
  FLOOR_TIER_DEMAND_MULTIPLIERS,
} from '../constants/economy';
import { getDemandMultiplierForPhase } from './econEngine';

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
