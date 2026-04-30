import { getAdvisorById } from '../../logic/advisorEngine';
import { useGameStore } from '../../store/useGameStore';

const ADVISOR_GUIDE = Object.freeze({
  raider: Object.freeze({
    buffs: Object.freeze([
      '제품 매력도가 높아져 초반 점유율을 빠르게 끌어올립니다.',
      '성과가 나면 모멘텀이 더 빨리 쌓입니다.',
      '라이벌보다 낮은 가격을 잡으면 추가 수요를 얻기 쉽습니다.',
      '위험한 이벤트 선택에 성공하면 체력을 조금 회복합니다.',
      '3개월 연속 흑자를 내면 체력을 회복합니다.',
    ]),
    nerfs: Object.freeze([
      '최대 경영 체력이 낮아 손실이 반복되면 빠르게 몰립니다.',
    ]),
  }),
  guardian: Object.freeze({
    buffs: Object.freeze([
      '손실이 나도 체력 감소를 더 잘 버팁니다.',
      '대출 이자 부담이 조금 줄어듭니다.',
      '안전한 이벤트 선택을 하면 일정 확률로 체력을 회복합니다.',
      '5개월 연속 흑자를 내면 체력을 회복합니다.',
    ]),
    nerfs: Object.freeze([
      '한 번에 크게 발주하기 어렵습니다.',
      '모멘텀이 다른 어드바이저보다 천천히 쌓입니다.',
    ]),
  }),
  analyst: Object.freeze({
    buffs: Object.freeze([
      '라이벌 정보를 더 많이 확인할 수 있습니다.',
      '경기 국면이 바뀌기 전에 미리 경고를 받습니다.',
      '라이벌 전략 예측이 맞으면 체력을 회복합니다.',
      '4개월 연속 흑자를 내면 체력을 회복합니다.',
    ]),
    nerfs: Object.freeze([
      '직접적인 매출이나 체력 보너스가 적어 초반 폭발력은 낮습니다.',
    ]),
  }),
  gambler: Object.freeze({
    buffs: Object.freeze([
      '위험한 선택지의 성공 확률이 올라갑니다.',
      '말도 안 되는 선택지에서 대박이 터질 확률이 높습니다.',
      '이벤트 카드가 더 자주 등장해 판을 뒤집을 기회가 많습니다.',
      '극단적인 이벤트 선택에 크게 성공하면 체력을 많이 회복합니다.',
    ]),
    nerfs: Object.freeze([
      '자동 체력 회복이 없습니다.',
      '외부 이벤트의 좋은 효과와 나쁜 효과를 모두 더 크게 받습니다.',
    ]),
  }),
});

export default function AdvisorInfo() {
  const advisorId = useGameStore((state) => state.selectedAdvisorId);
  const advisor = getAdvisorById(advisorId);
  const guide = ADVISOR_GUIDE[advisor.id] ?? { buffs: [], nerfs: [] };

  return (
    <div className="cr2-pause-section">
      <h2>어드바이저 정보</h2>
      <div className="cr2-pause-advisor-card" style={{ '--cr2-advisor-color': advisor.themeColor }}>
        <strong>{advisor.name}</strong>
        <span>{advisor.style}</span>
        <p>{advisor.description}</p>
      </div>
      <PassiveList title="강점" tone="good" items={guide.buffs} />
      <PassiveList title="주의점" tone="bad" items={guide.nerfs} />
    </div>
  );
}

function PassiveList({ title, tone, items }) {
  return (
    <section className={`cr2-pause-passive-list cr2-pause-passive-list--${tone}`}>
      <h3>{title}</h3>
      {items.length ? (
        items.map((item) => <p key={item}>{item}</p>)
      ) : (
        <p>없음</p>
      )}
    </section>
  );
}
