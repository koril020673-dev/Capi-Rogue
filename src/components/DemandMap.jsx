import analystImage from '../assets/advisor_image/advisor_analyst.png';
import gamblerImage from '../assets/advisor_image/advisor_gambler.png';
import guardianImage from '../assets/advisor_image/advisor_guardian.png';
import raiderImage from '../assets/advisor_image/advisor_raider.png';
import rivalCheolminImage from '../assets/rival_image/rival_champion_cheolmin.png';
import rivalDogeonImage from '../assets/rival_image/rival_champion_dogeon.png';
import rivalHyegyeongImage from '../assets/rival_image/rival_champion_hyegyeong.png';
import rivalJunhyukImage from '../assets/rival_image/rival_entry_junhyuk.png';
import rivalSuaImage from '../assets/rival_image/rival_entry_sua.png';
import rivalJieunImage from '../assets/rival_image/rival_mid_jieun.png';
import rivalSungjinImage from '../assets/rival_image/rival_mid_sungjin.png';
import rivalJunseoImage from '../assets/rival_image/rival_senior_junseo.png';
import rivalSeoyeonImage from '../assets/rival_image/rival_senior_seoyeon.png';
import rivalTaejunImage from '../assets/rival_image/rival_senior_taejun.png';
import { useGameStore } from '../store/useGameStore';

const ADVISOR_IMAGES = Object.freeze({
  analyst: analystImage,
  gambler: gamblerImage,
  guardian: guardianImage,
  raider: raiderImage,
});

const RIVAL_IMAGES = Object.freeze({
  'rival_champion_cheolmin.png': rivalCheolminImage,
  'rival_champion_dogeon.png': rivalDogeonImage,
  'rival_champion_hyegyeong.png': rivalHyegyeongImage,
  'rival_entry_junhyuk.png': rivalJunhyukImage,
  'rival_entry_sua.png': rivalSuaImage,
  'rival_mid_jieun.png': rivalJieunImage,
  'rival_mid_sungjin.png': rivalSungjinImage,
  'rival_senior_junseo.png': rivalJunseoImage,
  'rival_senior_seoyeon.png': rivalSeoyeonImage,
  'rival_senior_taejun.png': rivalTaejunImage,
});

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
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const playerProfile = useGameStore((state) => state.playerProfile);
  const sharePercent = Math.round(participant.marketShare * 100);
  const healthPercent = Math.max(0, Math.min(100, Math.round((participant.health ?? 1) * 100)));
  const arrowClass = revealDemand ? getShareClass(participant.marketShare) : 'cr2-demand-arrow--md';
  const rivalImage = !isPlayer ? RIVAL_IMAGES[participant.imageFile] : null;

  return (
    <article className={isPlayer ? 'cr2-demand-node cr2-demand-node--player' : 'cr2-demand-node'}>
      <div className={`cr2-demand-arrow ${arrowClass}`} />
      <div className="cr2-demand-card">
        {isPlayer ? (
          <div className="cr2-demand-player-row">
            <span className="cr2-demand-player-portrait">
              {playerProfile.profileImage ? <img src={playerProfile.profileImage} alt="" /> : null}
            </span>
            <div>
              <span>{participant.slotLabel}</span>
              <strong>{participant.name}</strong>
              {playerProfile.playerName ? <small>{playerProfile.playerName}</small> : null}
            </div>
            <span className="cr2-demand-advisor-portrait">
              <img src={ADVISOR_IMAGES[selectedAdvisorId]} alt="" />
            </span>
          </div>
        ) : (
          <div className="cr2-demand-rival-row">
            <span className="cr2-demand-rival-portrait">
              {rivalImage ? <img src={rivalImage} alt="" /> : null}
            </span>
            <div>
              <span>{participant.slotLabel}</span>
              <strong>{participant.name}</strong>
            </div>
          </div>
        )}
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
