const TEXT = Object.freeze({
  aria: '\uC218\uC694 \uC9C0\uB3C4',
  demand: '\uC218\uC694',
  concealed: '\uC815\uC0B0 \uD6C4 \uACF5\uAC1C',
  health: '\uCCB4\uB825',
});

export default function DemandMap({ totalDemand, participants, revealDemand = false }) {
  const player = participants.find((participant) => participant.id === 'player');
  const rivals = participants.filter((participant) => participant.type === 'rival');

  return (
    <section className="cr2-demand-map" aria-label={TEXT.aria}>
      <div className="cr2-demand-core">
        <span className="cr2-demand-label">{TEXT.demand}</span>
        <strong>{revealDemand ? totalDemand.toLocaleString() : '???'}</strong>
      </div>
      <div className="cr2-demand-routes">
        {rivals.map((rival) => (
          <DemandNode key={rival.id} participant={rival} revealDemand={revealDemand} />
        ))}
        {player ? <DemandNode participant={player} isPlayer revealDemand={revealDemand} /> : null}
      </div>
    </section>
  );
}

function DemandNode({ participant, isPlayer = false, revealDemand = false }) {
  const sharePercent = Math.round(participant.marketShare * 100);
  const healthPercent = Math.max(0, Math.min(100, Math.round((participant.health ?? 1) * 100)));
  const arrowClass = revealDemand ? getShareClass(participant.marketShare) : 'cr2-demand-arrow--md';

  return (
    <article className={isPlayer ? 'cr2-demand-node cr2-demand-node--player' : 'cr2-demand-node'}>
      <div className={`cr2-demand-arrow ${arrowClass}`} />
      <div className="cr2-demand-card">
        <span>{participant.slotLabel}</span>
        <strong>{participant.name}</strong>
        <small>{revealDemand ? `${sharePercent}% / ${participant.demand.toLocaleString()}` : TEXT.concealed}</small>
        {!isPlayer ? (
          <div className="cr2-rival-health" title={`${TEXT.health} ${healthPercent}%`}>
            <span
              className={healthPercent < 20 ? 'cr2-rival-health-fill cr2-rival-health-fill--critical' : 'cr2-rival-health-fill'}
              style={{ width: `${healthPercent}%`, backgroundColor: participant.color }}
            />
            <small>{participant.healthBadge} {healthPercent}%</small>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function getShareClass(share) {
  if (share >= 0.42) {
    return 'cr2-demand-arrow--xl';
  }

  if (share >= 0.28) {
    return 'cr2-demand-arrow--lg';
  }

  if (share >= 0.16) {
    return 'cr2-demand-arrow--md';
  }

  return 'cr2-demand-arrow--sm';
}
