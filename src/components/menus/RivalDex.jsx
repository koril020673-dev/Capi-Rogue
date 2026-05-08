import { RIVAL_LIST, RIVAL_TIER_LABELS, RIVAL_TIERS } from '../../constants/rivals';
import { useGameStore } from '../../store/useGameStore';
import cheolminImage from '../../assets/rival_image/rival_champion_cheolmin.png';
import dogeonImage from '../../assets/rival_image/rival_champion_dogeon.png';
import hyegyeongImage from '../../assets/rival_image/rival_champion_hyegyeong.png';
import junhyukImage from '../../assets/rival_image/rival_entry_junhyuk.png';
import suaImage from '../../assets/rival_image/rival_entry_sua.png';
import jieunImage from '../../assets/rival_image/rival_mid_jieun.png';
import sungjinImage from '../../assets/rival_image/rival_mid_sungjin.png';
import junseoImage from '../../assets/rival_image/rival_senior_junseo.png';
import seoyeonImage from '../../assets/rival_image/rival_senior_seoyeon.png';
import taejunImage from '../../assets/rival_image/rival_senior_taejun.png';

const RIVAL_IMAGES = Object.freeze({
  rival_champion_cheolmin: cheolminImage,
  rival_champion_dogeon: dogeonImage,
  rival_champion_hyegyeong: hyegyeongImage,
  rival_entry_junhyuk: junhyukImage,
  rival_entry_sua: suaImage,
  rival_mid_jieun: jieunImage,
  rival_mid_sungjin: sungjinImage,
  rival_senior_junseo: junseoImage,
  rival_senior_seoyeon: seoyeonImage,
  rival_senior_taejun: taejunImage,
});

const RIVAL_DISPLAY = Object.freeze({
  junhyuk: Object.freeze({ name: '\uCC3D\uC5C5 3\uAC1C\uC6D4\uCC28 \uC900\uD601', company: '\uC900\uD601\uC0C1\uD68C' }),
  sua: Object.freeze({ name: '\uC54C\uBC14 \uBAA8\uC544\uC11C \uCC3D\uC5C5\uD55C \uC218\uC544', company: 'SUA Works' }),
  sungjin: Object.freeze({ name: '\uB300\uAE30\uC5C5 \uD1F4\uC0AC\uD55C \uC131\uC9C4', company: '\uC131\uC9C4\uC778\uB354\uC2A4\uD2B8\uB9AC' }),
  jieun: Object.freeze({ name: '\uC870\uC6A9\uD788 \uCE58\uACE0 \uC62C\uB77C\uC624\uB294 \uC9C0\uC740', company: 'JE Solutions' }),
  junseo: Object.freeze({ name: '\uB0C9\uD608\uD55C \uC7AC\uBC8C 2\uC138 \uC900\uC11C', company: 'JUNSEO Group' }),
  seoyeon: Object.freeze({ name: '\uC5D8\uB9AC\uD2B8 MBA \uC11C\uC5F0', company: 'Seo & Partners' }),
  taejun: Object.freeze({ name: '\uBCA0\uD14C\uB791 \uC0AC\uB0E5\uAFBC \uD0DC\uC900', company: '\uD0DC\uC900\uD640\uB529\uC2A4' }),
  cheolmin: Object.freeze({ name: '\uC2DC\uC7A5\uC758 \uC9C0\uBC30\uC790 \uCCA0\uBBFC', company: 'CHEOLMIN Corp' }),
  dogeon: Object.freeze({ name: '\uC804\uC124\uC758 \uAE30\uC5C5\uC778 \uB3C4\uAC74', company: '\uB3C4\uAC74\uADF8\uB8F9' }),
  hyegyeong: Object.freeze({ name: '\uC5C5\uACC4\uC758 \uC5B4\uBA38\uB2C8 \uD61C\uACBD', company: 'HK International' }),
});

const TIER_ORDER = Object.freeze([
  RIVAL_TIERS.ENTRY,
  RIVAL_TIERS.MID,
  RIVAL_TIERS.SENIOR,
  RIVAL_TIERS.CHAMPION,
]);

const TEXT = Object.freeze({
  title: '\uB77C\uC774\uBC8C \uB3C4\uAC10',
  progress: '\uB77C\uC774\uBC8C \uB3C4\uAC10',
  unknown: '???',
  quality: '\uD488\uC9C8',
  brand: '\uBE0C\uB79C\uB4DC',
  awareness: '\uC778\uC9C0\uB3C4',
});

export default function RivalDex() {
  const metRivals = useGameStore((state) => state.metRivals ?? []);
  const metSet = new Set(metRivals);
  const sortedRivals = [...RIVAL_LIST].sort((a, b) => {
    const tierDiff = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);

    if (tierDiff !== 0) {
      return tierDiff;
    }

    return Number(isMet(b, metSet)) - Number(isMet(a, metSet));
  });
  const metCount = sortedRivals.filter((rival) => isMet(rival, metSet)).length;

  return (
    <div className="cr2-pause-section">
      <header className="cr2-rival-dex-head">
        <h2>{TEXT.title}</h2>
        <strong>{TEXT.progress}: {metCount} / {sortedRivals.length}</strong>
      </header>
      <div className="cr2-rival-dex-grid">
        {sortedRivals.map((rival) => {
          const met = isMet(rival, metSet);
          const imageKey = rival.imageFile?.replace('.png', '');
          const display = RIVAL_DISPLAY[rival.id] ?? rival;

          return (
            <article className={met ? 'cr2-rival-dex-card' : 'cr2-rival-dex-card cr2-rival-dex-card--unknown'} key={rival.id}>
              <div className="cr2-rival-dex-image">
                <img alt="" src={RIVAL_IMAGES[imageKey]} />
              </div>
              <div>
                <strong>{met ? display.name : TEXT.unknown}</strong>
                <span>{met ? display.company : TEXT.unknown}</span>
                <small>{RIVAL_TIER_LABELS[rival.tier]}</small>
              </div>
              <dl>
                <dt>{TEXT.quality}</dt>
                <dd>{met ? rival.stats.quality : '?'}</dd>
                <dt>{TEXT.brand}</dt>
                <dd>{met ? rival.stats.brand : '?'}</dd>
                <dt>{TEXT.awareness}</dt>
                <dd>{met ? `${Math.round(rival.stats.awareness * 100)}%` : '?'}</dd>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function isMet(rival, metSet) {
  return metSet.has(rival.id) || metSet.has(rival.profileId);
}
