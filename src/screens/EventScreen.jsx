import EventCard from '../components/EventCard';
import { SCREEN_IDS, useGameStore } from '../store/useGameStore';

export default function EventScreen() {
  const screen = useGameStore((state) => state.screen);
  const externalEvent = useGameStore((state) => state.currentExternalEvent);
  const internalEvent = useGameStore((state) => state.currentInternalEvent);
  const confirmExternalEvent = useGameStore((state) => state.confirmExternalEvent);

  if (screen === SCREEN_IDS.EVENT && internalEvent) {
    return (
      <main className="cr2-event-screen">
        <EventCard event={internalEvent} />
      </main>
    );
  }

  return (
    <main className="cr2-event-screen">
      <section className="cr2-external-popup">
        <span className="cr2-panel-label">시장 뉴스</span>
        <h1>{externalEvent?.title}</h1>
        <p>{externalEvent?.description}</p>
        {externalEvent ? (
          <div className="cr2-event-effect-list">
            <span>{externalEvent.duration}개월 동안 시장 조건에 반영됩니다.</span>
            {getExternalEffectLabels(externalEvent.effects).map((label) => (
              <strong key={label}>{label}</strong>
            ))}
          </div>
        ) : null}
        <button className="cr2-primary-button" type="button" onClick={confirmExternalEvent}>
          전략 선택으로
        </button>
      </section>
    </main>
  );
}

function getExternalEffectLabels(effects = {}) {
  const labels = [];

  if (effects.demandMultiplier && effects.demandMultiplier !== 1) {
    labels.push(`수요 ${formatMultiplier(effects.demandMultiplier)}`);
  }

  if (effects.costMultiplier && effects.costMultiplier !== 1) {
    labels.push(`원가 ${formatMultiplier(effects.costMultiplier)}`);
  }

  if (effects.qualityMultiplier && effects.qualityMultiplier !== 1) {
    labels.push(`품질 ${formatMultiplier(effects.qualityMultiplier)}`);
  }

  if (effects.debtCostMultiplier && effects.debtCostMultiplier !== 1) {
    labels.push(`부채비용 ${formatMultiplier(effects.debtCostMultiplier)}`);
  }

  if (effects.awarenessMultiplier && effects.awarenessMultiplier !== 1) {
    labels.push(`인지도 효과 ${formatMultiplier(effects.awarenessMultiplier)}`);
  }

  return labels;
}

function formatMultiplier(multiplier) {
  const percent = Math.round((multiplier - 1) * 100);
  return `${percent > 0 ? '+' : ''}${percent}%`;
}
