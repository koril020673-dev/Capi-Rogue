import {
  ECONOMIC_PHASE_CONSUMER_RATIOS,
  ECONOMIC_PHASES,
} from '../constants/economy';
import { getDemandMultiplierForPhase } from './econEngine';

export function calculateAttraction(participant) {
  const quality = Math.max(0.1, participant.quality);
  const brand = Math.max(0, participant.brand);
  const efficiency = Math.max(0.1, participant.efficiency);
  const awareness = Math.max(-0.95, participant.awareness);
  const price = Math.max(1, participant.price);
  const resistance = Math.min(Math.max(participant.resistance, 0), 0.92);
  const scopePower = participant.strategy?.scopePower ?? 1;
  const attractionMultiplier = participant.attractionMultiplier ?? 1;

  return (
    (((quality + brand) * efficiency * (1 + awareness)) / (price * (1 - resistance))) *
    scopePower *
    attractionMultiplier
  );
}

export function calculateMarketShares(participants) {
  const attractions = participants.map((participant) => {
    const attraction = calculateAttraction(participant);
    return Object.freeze({
      id: participant.id,
      attraction,
      weightedAttraction: attraction ** 2,
    });
  });
  const totalWeightedAttraction = attractions.reduce(
    (sum, item) => sum + item.weightedAttraction,
    0,
  );

  if (totalWeightedAttraction <= 0) {
    const equalShare = 1 / Math.max(participants.length, 1);
    return participants.map((participant) =>
      Object.freeze({
        id: participant.id,
        share: equalShare,
        attraction: 0,
      }),
    );
  }

  return attractions.map((item) =>
    Object.freeze({
      id: item.id,
      share: item.weightedAttraction / totalWeightedAttraction,
      attraction: item.attraction,
    }),
  );
}

export function calculateDemandSplit(
  participants,
  totalDemand,
  phase = ECONOMIC_PHASES.STABLE,
  demandMultiplier = getDemandMultiplierForPhase(phase),
) {
  return calculateConsumerGroupDemandSplit(participants, totalDemand, phase, demandMultiplier);
}

export function calculateConsumerGroupDemandSplit(
  participants,
  totalDemand,
  phase = ECONOMIC_PHASES.STABLE,
  demandMultiplier = getDemandMultiplierForPhase(phase),
) {
  const ratios =
    ECONOMIC_PHASE_CONSUMER_RATIOS[phase] ??
    ECONOMIC_PHASE_CONSUMER_RATIOS[ECONOMIC_PHASES.STABLE];
  const groupShares = Object.entries(ratios).map(([group, ratio]) =>
    Object.freeze({
      group,
      ratio,
      demand: totalDemand * ratio,
      attractions: calculateGroupShares(participants, group, demandMultiplier),
    }),
  );
  const demandById = new Map(participants.map((participant) => [participant.id, 0]));
  const attractionById = new Map(participants.map((participant) => [participant.id, 0]));

  groupShares.forEach((group) => {
    group.attractions.forEach((item) => {
      demandById.set(item.id, (demandById.get(item.id) ?? 0) + group.demand * item.share);
      attractionById.set(item.id, (attractionById.get(item.id) ?? 0) + item.attraction * group.ratio);
    });
  });

  return participants.map((participant) => {
    const demand = Math.round(demandById.get(participant.id) ?? 0);

    return Object.freeze({
      ...participant,
      attraction: attractionById.get(participant.id) ?? 0,
      marketShare: totalDemand > 0 ? demand / totalDemand : 0,
      demand,
    });
  });
}

export function calculateLegacyDemandSplit(participants, totalDemand) {
  const shares = calculateMarketShares(participants);

  return participants.map((participant) => {
    const shareInfo = shares.find((share) => share.id === participant.id);

    return Object.freeze({
      ...participant,
      attraction: shareInfo?.attraction ?? 0,
      marketShare: shareInfo?.share ?? 0,
      demand: Math.round(totalDemand * (shareInfo?.share ?? 0)),
    });
  });
}

function calculateGroupShares(participants, group, demandMultiplier) {
  const attractions = participants.map((participant) => {
    const attraction = calculateConsumerGroupAttraction(participant, group, demandMultiplier);

    return Object.freeze({
      id: participant.id,
      attraction,
      weightedAttraction: attraction ** 2,
    });
  });
  const total = attractions.reduce((sum, item) => sum + item.weightedAttraction, 0);

  if (total <= 0) {
    const share = 1 / Math.max(participants.length, 1);

    return attractions.map((item) => Object.freeze({ ...item, share }));
  }

  return attractions.map((item) =>
    Object.freeze({
      ...item,
      share: item.weightedAttraction / total,
    }),
  );
}

function calculateConsumerGroupAttraction(participant, group, demandMultiplier) {
  const quality = Math.max(0.1, participant.quality);
  const brand = Math.max(0, participant.brand);
  const awareness = Math.max(0, participant.awareness);
  const price = Math.max(1, participant.price);
  const resistance = Math.min(Math.max(participant.resistance, 0), 0.92);
  const scopePower = participant.strategy?.scopePower ?? 1;
  const attractionMultiplier = participant.attractionMultiplier ?? 1;
  const base = {
    quality: (quality * 1.5) / price,
    brand: brand * awareness * 1.3,
    price: (1 / price) * demandMultiplier * 2,
    general: ((quality + brand) * (1 + awareness)) / (price * (1 - resistance)),
  }[group] ?? calculateAttraction(participant);

  return base * scopePower * attractionMultiplier;
}
