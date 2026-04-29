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

export function calculateDemandSplit(participants, totalDemand) {
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
