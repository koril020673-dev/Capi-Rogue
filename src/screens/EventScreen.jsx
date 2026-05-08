import { useEffect } from 'react';
import Tooltip from '../components/Tooltip';
import { playBGM } from '../logic/audioEngine';
import { useGameStore } from '../store/useGameStore';

const TYPE_LABELS = Object.freeze({
  SAFE: '안전',
  NORMAL: '일반',
  GAMBLE: '도박',
  ABSURD: '광기',
});

const TYPE_TOOLTIPS = Object.freeze({
  SAFE: 'event_safe',
  NORMAL: 'event_normal',
  GAMBLE: 'event_gamble',
  ABSURD: 'event_absurd',
});

export default function EventScreen() {
  const event = useGameStore((state) => state.currentInternalEvent);
  const outcome = useGameStore((state) => state.currentInternalOutcome);
  const chooseInternalEventOption = useGameStore((state) => state.chooseInternalEventOption);
  const confirmInternalEventOutcome = useGameStore((state) => state.confirmInternalEventOutcome);

  useEffect(() => {
    playBGM('strategy');
  }, []);

  if (!event) {
    return null;
  }

  return (
    <main className="cr2-event-screen">
      <article className={`cr2-event-card cr2-event-card--${event.category.toLowerCase()}`}>
        <header className="cr2-event-card-head">
          <h1>{event.name}</h1>
          <span className={`cr2-event-category cr2-event-category--${event.category.toLowerCase()}`}>
            {event.category}
          </span>
          <p>{event.description}</p>
        </header>

        {outcome ? (
          <section className={outcome.success ? 'cr2-event-result cr2-event-result--good' : 'cr2-event-result cr2-event-result--bad'}>
            <strong>{outcome.label}</strong>
            <p>{outcome.description}</p>
            <button className="cr2-primary-button" type="button" onClick={confirmInternalEventOutcome}>
              정산 확인
            </button>
          </section>
        ) : (
          <div className="cr2-event-choice-list">
            {event.choices.map((choice, index) => {
              const typeClass = `cr2-choice-${choice.type.toLowerCase()}`;

              return (
                <button
                  className={`cr2-event-choice cr2-event-choice--${choice.type.toLowerCase()} ${typeClass}`}
                  key={choice.id}
                  type="button"
                  onClick={() => chooseInternalEventOption(choice.id)}
                >
                  <span>
                    {String.fromCharCode(65 + index)}. {choice.label}
                  </span>
                  <small>
                    <Tooltip tooltipId={TYPE_TOOLTIPS[choice.type]}>
                      {TYPE_LABELS[choice.type]} 선택지 · {getProbabilityHint(choice)}
                    </Tooltip>
                  </small>
                </button>
              );
            })}
          </div>
        )}
      </article>
    </main>
  );
}

function getProbabilityHint(choice) {
  if (!Array.isArray(choice.outcome)) {
    return '결과 확정';
  }

  const best = Math.round(Math.max(...choice.outcome.map((item) => item.prob)) * 100);

  return `주요 결과 ${best}%`;
}
