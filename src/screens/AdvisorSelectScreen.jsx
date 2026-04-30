import { ADVISORS } from '../constants/advisors';
import { useGameStore } from '../store/useGameStore';
import analystImage from '../assets/optimized/advisor_fullbody/advisor_analyst_v2.png';
import gamblerImage from '../assets/optimized/advisor_fullbody/advisor_gambler_v2.png';
import guardianImage from '../assets/optimized/advisor_fullbody/advisor_guardian_v2.png';
import raiderImage from '../assets/optimized/advisor_fullbody/advisor_raider_v2.png';
import '../styles/advisor.css';

const ADVISOR_IMAGES = Object.freeze({
  analyst: analystImage,
  gambler: gamblerImage,
  guardian: guardianImage,
  raider: raiderImage,
});

const ADVISOR_DETAILS = Object.freeze({
  raider: Object.freeze({
    icon: 'R',
    summary: '\uACF5\uACA9 \uC131\uC7A5',
    buffs: Object.freeze([
      '\uB9E4\uB825\uB3C4 +7%',
      '\uBAA8\uBA58\uD140 \uC0C1\uC2B9\uC18D\uB3C4 \u00D7 1.5',
      '\uB77C\uC774\uBC8C\uBCF4\uB2E4 \uC800\uAC00\uBA74 \uB9E4\uB825\uB3C4 +5~10%',
    ]),
    nerfs: Object.freeze(['\uCD5C\uB300 \uCCB4\uB825 8']),
    difficulty: '\u2605\u2605\u2605\u2606',
  }),
  guardian: Object.freeze({
    icon: 'G',
    summary: '\uC704\uD5D8 \uBC29\uC5B4',
    buffs: Object.freeze([
      '\uCCB4\uB825 \uAC10\uC18C\uB7C9 -1',
      '\uB300\uCD9C \uC774\uC790 -10%',
      '\uC801\uC790 \uC2DC \uCCB4\uB825 \uAC10\uC18C \uD655\uB960 -20%',
    ]),
    nerfs: Object.freeze(['\uBC1C\uC8FC\uB7C9 \uC0C1\uD55C -10%', '\uBAA8\uBA58\uD140 \uC0C1\uC2B9\uC18D\uB3C4 \u00D7 0.8']),
    difficulty: '\u2605\u2606\u2606\u2606',
  }),
  analyst: Object.freeze({
    icon: 'A',
    summary: '\uC815\uBCF4 \uC6B0\uC704',
    buffs: Object.freeze([
      '\uB77C\uC774\uBC8C \uC815\uBCF4 \uCD94\uAC00 \uACF5\uAC1C',
      '\uBCF4\uC0C1 \uC2DC \uD06C\uB808\uB527 +1',
      '\uACBD\uAE30 \uAD6D\uBA74 \uC804\uD658 1\uD134 \uC804 \uC608\uACE0',
    ]),
    nerfs: Object.freeze(['\uC9C1\uC811 \uC218\uCE58 \uBC84\uD504 \uC5C6\uC74C', '\uCD08\uBC18 \uD06C\uB808\uB527 \uC218\uAE09 \uB290\uB9BC']),
    difficulty: '\u2605\u2605\u2606\u2606',
  }),
  gambler: Object.freeze({
    icon: '$',
    summary: '\uC774\uBCA4\uD2B8 \uD55C\uBC29',
    buffs: Object.freeze([
      '\uB3C4\uBC15\uC801 \uC120\uD0DD\uC9C0 30% \u2192 45%',
      '\uB9D0\uB3C4 \uC548 \uB418\uB294 \uC120\uD0DD\uC9C0 20% \u2192 35%',
      '\uC774\uBCA4\uD2B8 \uCE74\uB4DC 1\uD134\uC5D0 2\uC7A5 \uB4F1\uC7A5',
    ]),
    nerfs: Object.freeze(['\uC790\uB3D9 \uCCB4\uB825 \uD68C\uBCF5 \uC5C6\uC74C', '\uC678\uBD80 \uC774\uBCA4\uD2B8 \uD6A8\uACFC \u00D7 1.3']),
    difficulty: '\u2605\u2605\u2605\u2605',
  }),
});

const TEXT = Object.freeze({
  title: '\uB2F9\uC2E0\uC758 \uC5B4\uB4DC\uBC14\uC774\uC800\uB97C \uC120\uD0DD\uD558\uC138\uC694',
  passive: '\uD328\uC2DC\uBE0C',
  buffs: '\uBC84\uD504',
  nerfs: '\uB108\uD504',
  difficulty: '\uB09C\uC774\uB3C4',
  start: '\uC774 \uC5B4\uB4DC\uBC14\uC774\uC800\uB85C \uC2DC\uC791',
});

export default function AdvisorSelectScreen() {
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const setAdvisor = useGameStore((state) => state.setAdvisor);
  const startRun = useGameStore((state) => state.startRun);
  const selectedAdvisor =
    ADVISORS.find((advisor) => advisor.id === selectedAdvisorId) ?? ADVISORS[0];
  const selectedDetails = ADVISOR_DETAILS[selectedAdvisor.id];

  function chooseAdvisor(advisor) {
    setAdvisor(advisor);
  }

  return (
    <main className="cr2-advisor-screen cr2-advisor-select">
      <section className="cr2-advisor-select-panel">
        <header className="cr2-advisor-select-head">
          <p className="cr2-kicker">ADVISOR SELECT</p>
          <h1>{TEXT.title}</h1>
        </header>

        <div className="cr2-advisor-select-layout">
          <section className="cr2-starter-grid">
            {ADVISORS.map((advisor) => {
              const details = ADVISOR_DETAILS[advisor.id];
              const selected = advisor.id === selectedAdvisor.id;

              return (
                <button
                  className={selected ? 'cr2-starter-card cr2-starter-card--selected' : 'cr2-starter-card'}
                  key={advisor.id}
                  style={{ '--cr2-card-color': advisor.themeColor }}
                  type="button"
                  onClick={() => chooseAdvisor(advisor)}
                >
                  <span className="cr2-starter-name">{advisor.name}</span>
                  <span className="cr2-starter-style">{advisor.style}</span>
                  <span className="cr2-starter-portrait">
                    <img src={ADVISOR_IMAGES[advisor.id]} alt="" decoding="async" loading="lazy" />
                  </span>
                  <span className="cr2-starter-summary">{details.summary}</span>
                </button>
              );
            })}
          </section>

          <aside className="cr2-advisor-side">
            <section
              className="cr2-advisor-detail"
              style={{ '--cr2-card-color': selectedAdvisor.themeColor }}
            >
              <div className="cr2-advisor-detail-portrait">
                <img src={ADVISOR_IMAGES[selectedAdvisor.id]} alt="" decoding="async" />
              </div>
              <div className="cr2-advisor-detail-title">
                <span>{selectedAdvisor.name}</span>
                <strong>{selectedAdvisor.style}</strong>
              </div>
              <p>{selectedAdvisor.description}</p>
              <div className="cr2-advisor-passive">
                <span>{TEXT.passive}</span>
                <strong>{selectedDetails.summary}</strong>
              </div>
              <DetailList title={TEXT.buffs} items={selectedDetails.buffs} type="buff" />
              <DetailList title={TEXT.nerfs} items={selectedDetails.nerfs} type="nerf" />
              <div className="cr2-advisor-difficulty">
                <span>{TEXT.difficulty}</span>
                <strong>{selectedDetails.difficulty}</strong>
              </div>
            </section>

            <button
              className="cr2-primary-button cr2-advisor-start"
              type="button"
              onClick={() => startRun(selectedAdvisor.id)}
            >
              {TEXT.start}
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DetailList({ title, items, type }) {
  return (
    <div className="cr2-advisor-detail-list">
      <span>{title}</span>
      <ul>
        {items.map((item) => (
          <li className={`cr2-advisor-detail-item cr2-advisor-detail-item--${type}`} key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
