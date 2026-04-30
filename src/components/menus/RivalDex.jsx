import { RIVAL_LIST, RIVAL_TIER_LABELS } from '../../constants/rivals';
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

export default function RivalDex() {
  const metRivals = useGameStore((state) => state.metRivals);
  const metSet = new Set(metRivals);

  return (
    <div className="cr2-pause-section">
      <h2>라이벌 도감</h2>
      <div className="cr2-rival-dex-grid">
        {RIVAL_LIST.map((rival) => {
          const met = metSet.has(rival.id);
          const imageKey = rival.imageFile?.replace('.png', '');

          return (
            <article className={met ? 'cr2-rival-dex-card' : 'cr2-rival-dex-card cr2-rival-dex-card--unknown'} key={rival.id}>
              <div className="cr2-rival-dex-image">
                {met ? <img alt="" src={RIVAL_IMAGES[imageKey]} /> : <span>?</span>}
              </div>
              <div>
                <strong>{met ? rival.name : '???'}</strong>
                <span>{met ? rival.company : '???'}</span>
                <small>{RIVAL_TIER_LABELS[rival.tier]}</small>
              </div>
              <dl>
                <dt>품질</dt>
                <dd>{met ? rival.stats.quality : '?'}</dd>
                <dt>브랜드</dt>
                <dd>{met ? rival.stats.brand : '?'}</dd>
                <dt>인지도</dt>
                <dd>{met ? `${Math.round(rival.stats.awareness * 100)}%` : '?'}</dd>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
