import analystImage from '../../assets/optimized/advisor_profile/advisor_analyst_profile.png';
import gamblerImage from '../../assets/optimized/advisor_profile/advisor_gambler_profile.png';
import guardianImage from '../../assets/optimized/advisor_profile/advisor_guardian_profile.png';
import raiderImage from '../../assets/optimized/advisor_profile/advisor_raider_profile.png';
import { getAdvisorById } from '../../logic/advisorEngine';
import { useGameStore } from '../../store/useGameStore';

const ADVISOR_IMAGES = Object.freeze({
  raider: raiderImage,
  guardian: guardianImage,
  analyst: analystImage,
  gambler: gamblerImage,
});

const ADVISOR_GUIDE = Object.freeze({
  raider: Object.freeze({
    buffs: Object.freeze([
      '\uB9E4\uB825\uB3C4\uAC00 7% \uC99D\uAC00\uD574 \uCD08\uBC18 \uC810\uC720\uC728\uC744 \uBE60\uB974\uAC8C \uAC00\uC838\uC635\uB2C8\uB2E4.',
      '\uD751\uC790 \uD750\uB984\uC774 \uC88B\uC744\uC218\uB85D \uBAA8\uBA58\uD140\uC774 \uBE60\uB974\uAC8C \uC62C\uB77C\uAC11\uB2C8\uB2E4.',
      '\uB77C\uC774\uBC8C \uD3C9\uADE0\uBCF4\uB2E4 \uC2FC \uAC00\uACA9\uC744 \uC720\uC9C0\uD558\uBA74 \uCD94\uAC00 \uC218\uC694\uB97C \uB04C\uC5B4\uC635\uB2C8\uB2E4.',
      '\uB3C4\uBC15\uD615 \uC774\uBCA4\uD2B8 \uC120\uD0DD\uC774 \uC131\uACF5\uD558\uBA74 \uCCB4\uB825\uC744 \uC18C\uD3ED \uD68C\uBCF5\uD569\uB2C8\uB2E4.',
      '3\uD134 \uC5F0\uC18D \uD751\uC790\uB97C \uB0B4\uBA74 \uCCB4\uB825\uC774 \uD68C\uBCF5\uB429\uB2C8\uB2E4.',
    ]),
    nerfs: Object.freeze([
      '\uCD5C\uB300 \uACBD\uC601 \uCCB4\uB825\uC774 8\uCE78\uC774\uB77C \uC190\uC2E4\uC774 \uBC18\uBCF5\uB418\uBA74 \uBE60\uB974\uAC8C \uBAB0\uB9BD\uB2C8\uB2E4.',
    ]),
    active: Object.freeze([
      '\uC800\uAC00 \uACF5\uACA9 \uC804\uB7B5\uC5D0 \uC801\uD569',
      '\uCCB4\uB825 \uC0C1\uD55C: 8',
    ]),
  }),
  guardian: Object.freeze({
    buffs: Object.freeze([
      '\uC801\uC790\uAC00 \uB098\uB3C4 \uCCB4\uB825 \uAC10\uC18C\uB97C \uD55C \uBC88 \uB354 \uBC84\uD2F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
      '\uB300\uCD9C \uC774\uC790 \uBD80\uB2F4\uC774 \uC904\uC5B4 \uD604\uAE08 \uD750\uB984\uC774 \uC548\uC815\uB429\uB2C8\uB2E4.',
      '\uC548\uC804\uD55C \uC774\uBCA4\uD2B8 \uC120\uD0DD\uC744 \uD558\uBA74 \uC77C\uC815 \uD655\uB960\uB85C \uCCB4\uB825\uC774 \uD68C\uBCF5\uB429\uB2C8\uB2E4.',
      '5\uD134 \uC5F0\uC18D \uD751\uC790\uB97C \uB0B4\uBA74 \uCCB4\uB825\uC774 \uD68C\uBCF5\uB429\uB2C8\uB2E4.',
    ]),
    nerfs: Object.freeze([
      '\uD55C \uBC88\uC5D0 \uD06C\uAC8C \uBC1C\uC8FC\uD558\uAE30 \uC5B4\uB824\uC6CC \uC131\uC7A5 \uC18D\uB3C4\uAC00 \uC904\uC5B4\uB4ED\uB2C8\uB2E4.',
      '\uBAA8\uBA58\uD140 \uC0C1\uC2B9\uC774 \uB2E4\uB978 \uC5B4\uB4DC\uBC14\uC774\uC800\uBCF4\uB2E4 \uB290\uB9BD\uB2C8\uB2E4.',
    ]),
    active: Object.freeze([
      '\uBC29\uC5B4\uC801 \uC6B4\uC601\uACFC \uBD80\uCC44 \uAD00\uB9AC\uC5D0 \uC801\uD569',
      '\uCCB4\uB825 \uC0C1\uD55C: 10',
    ]),
  }),
  analyst: Object.freeze({
    buffs: Object.freeze([
      '\uB77C\uC774\uBC8C \uC815\uBCF4\uB97C \uD55C \uAC00\uC9C0 \uB354 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
      '\uACBD\uAE30 \uAD6D\uBA74\uC774 \uBC14\uB00C\uAE30 \uC804\uC5D0 \uBBF8\uB9AC \uACBD\uACE0\uB97C \uBC1B\uC2B5\uB2C8\uB2E4.',
      '\uB77C\uC774\uBC8C \uC804\uB7B5 \uC608\uCE21\uC744 \uB9DE\uD788\uBA74 \uCCB4\uB825\uC774 \uD68C\uBCF5\uB429\uB2C8\uB2E4.',
      '4\uD134 \uC5F0\uC18D \uD751\uC790\uB97C \uB0B4\uBA74 \uCCB4\uB825\uC774 \uD68C\uBCF5\uB429\uB2C8\uB2E4.',
    ]),
    nerfs: Object.freeze([
      '\uC9C1\uC811\uC801\uC778 \uB9E4\uCD9C\uC774\uB098 \uCCB4\uB825 \uBCF4\uB108\uC2A4\uAC00 \uC801\uC5B4 \uCD08\uBC18 \uD3ED\uBC1C\uB825\uC740 \uB0AE\uC2B5\uB2C8\uB2E4.',
    ]),
    active: Object.freeze([
      '\uC218\uCE58 \uBD84\uC11D\uACFC \uB77C\uC774\uBC8C \uC608\uCE21\uC5D0 \uC801\uD569',
      '\uCCB4\uB825 \uC0C1\uD55C: 10',
    ]),
  }),
  gambler: Object.freeze({
    buffs: Object.freeze([
      '\uB3C4\uBC15\uD615 \uC120\uD0DD\uC9C0\uC758 \uC131\uACF5 \uD655\uB960\uC774 \uC62C\uB77C\uAC11\uB2C8\uB2E4.',
      '\uB9D0\uB3C4 \uC548 \uB418\uB294 \uC120\uD0DD\uC9C0\uC5D0\uC11C \uB300\uBC15\uC774 \uB0A0 \uD655\uB960\uC774 \uB192\uC2B5\uB2C8\uB2E4.',
      '\uC774\uBCA4\uD2B8 \uCE74\uB4DC\uAC00 \uB354 \uC790\uC8FC \uB4F1\uC7A5\uD574 \uD310\uC744 \uB4A4\uC9D1\uC744 \uAE30\uD68C\uAC00 \uB9CE\uC2B5\uB2C8\uB2E4.',
      '\uADF9\uB2E8\uC801\uC778 \uC774\uBCA4\uD2B8 \uC120\uD0DD\uC774 \uD06C\uAC8C \uC131\uACF5\uD558\uBA74 \uCCB4\uB825\uC774 \uB9CE\uC774 \uD68C\uBCF5\uB429\uB2C8\uB2E4.',
    ]),
    nerfs: Object.freeze([
      '\uC790\uB3D9 \uCCB4\uB825 \uD68C\uBCF5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
      '\uC678\uBD80 \uC774\uBCA4\uD2B8\uC758 \uC88B\uC740 \uD6A8\uACFC\uC640 \uB098\uC05C \uD6A8\uACFC\uB97C \uBAA8\uB450 \uB354 \uD06C\uAC8C \uBC1B\uC2B5\uB2C8\uB2E4.',
    ]),
    active: Object.freeze([
      '\uC774\uBCA4\uD2B8 \uC131\uACF5\uC73C\uB85C \uD55C \uBC88\uC5D0 \uD310\uC744 \uBC14\uAFB8\uB294 \uB370 \uC801\uD569',
      '\uCCB4\uB825 \uC0C1\uD55C: 10',
    ]),
  }),
});

const TEXT = Object.freeze({
  title: '\uC5B4\uB4DC\uBC14\uC774\uC800 \uC815\uBCF4',
  buffs: '\uBC84\uD504',
  nerfs: '\uB108\uD504',
  active: '\uD604\uC7AC \uC801\uC6A9 \uC911\uC778 \uBCF4\uC815\uAC12',
  none: '\uC5C6\uC74C',
});

export default function AdvisorInfo() {
  const advisorId = useGameStore((state) => state.selectedAdvisorId);
  const advisor = getAdvisorById(advisorId);
  const guide = ADVISOR_GUIDE[advisor.id] ?? { buffs: [], nerfs: [], active: [] };
  const image = ADVISOR_IMAGES[advisor.id];

  return (
    <div className="cr2-pause-section">
      <h2>{TEXT.title}</h2>
      <div className="cr2-pause-advisor-card" style={{ '--cr2-advisor-color': advisor.themeColor }}>
        {image ? <img className="cr2-pause-advisor-image" alt="" src={image} /> : null}
        <div>
          <strong>{advisor.name}</strong>
          <span>{advisor.style}</span>
          <p>{advisor.description}</p>
        </div>
      </div>
      <PassiveList title={TEXT.buffs} tone="good" items={guide.buffs} marker="+" />
      <PassiveList title={TEXT.nerfs} tone="bad" items={guide.nerfs} marker="-" />
      <PassiveList title={TEXT.active} tone="gold" items={guide.active} marker="*" />
    </div>
  );
}

function PassiveList({ title, tone, items, marker }) {
  return (
    <section className={`cr2-pause-passive-list cr2-pause-passive-list--${tone}`}>
      <h3>{title}</h3>
      {items.length ? (
        items.map((item) => <p key={item}><span>{marker}</span> {item}</p>)
      ) : (
        <p>{TEXT.none}</p>
      )}
    </section>
  );
}
