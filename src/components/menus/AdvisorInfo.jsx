import { getAdvisorById } from '../../logic/advisorEngine';
import { useGameStore } from '../../store/useGameStore';

const PASSIVE_LABELS = Object.freeze({
  attractionBonus: '매력도 보너스',
  momentumGrowthMultiplier: '모멘텀 상승속도',
  lowPriceAttractionBonusMin: '저가 매력도 최소 보너스',
  lowPriceAttractionBonusMax: '저가 매력도 최대 보너스',
  maxHealth: '최대 체력',
  healthDecreaseReduction: '체력 감소 완화',
  loanInterestMultiplier: '대출 이자 보정',
  deficitHealthLossChanceReduction: '적자 체력 감소 확률 완화',
  orderCapMultiplier: '발주량 상한',
  revealExtraRivalInfo: '라이벌 정보 추가 공개',
  phaseWarningTurns: '경기 전환 예고',
  gamblingOddsBonus: '도박 선택지 확률 보너스',
  absurdOddsBonus: '말도 안 되는 선택지 대박 보너스',
  extraEventCardsPerTurn: '추가 이벤트 카드',
  externalEventEffectMultiplier: '외부 이벤트 효과',
  autoRecovery: '자동회복',
});

const NERF_KEYS = new Set([
  'maxHealth',
  'orderCapMultiplier',
  'directStatBonus',
  'externalEventEffectMultiplier',
]);

export default function AdvisorInfo() {
  const advisorId = useGameStore((state) => state.selectedAdvisorId);
  const advisor = getAdvisorById(advisorId);
  const entries = Object.entries(advisor.passive ?? {});
  const buffs = entries.filter(([key, value]) => !NERF_KEYS.has(key) && value !== false && value !== null);
  const nerfs = entries.filter(([key]) => NERF_KEYS.has(key));

  return (
    <div className="cr2-pause-section">
      <h2>어드바이저 정보</h2>
      <div className="cr2-pause-advisor-card" style={{ '--cr2-advisor-color': advisor.themeColor }}>
        <strong>{advisor.name}</strong>
        <span>{advisor.style}</span>
        <p>{advisor.description}</p>
      </div>
      <PassiveList title="버프" tone="good" items={buffs} />
      <PassiveList title="너프" tone="bad" items={nerfs} />
    </div>
  );
}

function PassiveList({ title, tone, items }) {
  return (
    <section className={`cr2-pause-passive-list cr2-pause-passive-list--${tone}`}>
      <h3>{title}</h3>
      {items.length ? (
        items.map(([key, value]) => (
          <p key={key}>
            <span>{PASSIVE_LABELS[key] ?? key}</span>
            <strong>{formatValue(value)}</strong>
          </p>
        ))
      ) : (
        <p>없음</p>
      )}
    </section>
  );
}

function formatValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'ON' : 'OFF';
  }

  if (typeof value === 'object' && value) {
    return Object.entries(value).map(([key, item]) => `${key}:${item}`).join(' ');
  }

  return String(value);
}
