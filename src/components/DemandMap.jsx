export default function DemandMap({ totalDemand, participants }) {
  const player = participants.find((participant) => participant.id === 'player');
  const rivals = participants.filter((participant) => participant.type === 'rival');

  return (
    <section className="cr2-demand-map" aria-label="수요 지도">
      <div className="cr2-demand-core">
        <span className="cr2-demand-label">수요</span>
        <strong>{totalDemand.toLocaleString()}</strong>
      </div>
      <div className="cr2-demand-routes">
        {rivals.map((rival) => (
          <DemandNode key={rival.id} participant={rival} />
        ))}
        {player ? <DemandNode participant={player} isPlayer /> : null}
      </div>
    </section>
  );
}

function DemandNode({ participant, isPlayer = false }) {
  const sharePercent = Math.round(participant.marketShare * 100);
  const healthPercent = Math.max(0, Math.min(100, Math.round((participant.health ?? 1) * 100)));

  return (
    <article className={isPlayer ? 'cr2-demand-node cr2-demand-node--player' : 'cr2-demand-node'}>
      <div className={`cr2-demand-arrow ${getShareClass(participant.marketShare)}`} />
      <div className="cr2-demand-card">
        <span>{participant.slotLabel}</span>
        <strong>{participant.name}</strong>
        <small>{sharePercent}% / {participant.demand.toLocaleString()}</small>
        {!isPlayer ? (
          <div className="cr2-rival-health" title={`체력 ${healthPercent}%`}>
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
