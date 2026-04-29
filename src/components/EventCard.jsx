import { useGameStore } from '../store/useGameStore';

export default function EventCard({ event }) {
  const chooseInternalEventOption = useGameStore((state) => state.chooseInternalEventOption);
  const useCreditToken = useGameStore((state) => state.useCreditToken);
  const creditTokens = useGameStore((state) => state.player.creditTokens);

  return (
    <article className="cr2-event-card">
      <div className="cr2-event-card-head">
        <span className="cr2-panel-label">돌발 상황</span>
        <h1>{event.title}</h1>
        <p>{event.description}</p>
      </div>
      <div className="cr2-event-choice-list">
        {event.choices.map((choice) => (
          <button
            className={`cr2-event-choice cr2-event-choice--${choice.tier}`}
            key={choice.id}
            type="button"
            onClick={() => chooseInternalEventOption(choice.id)}
          >
            <span>{choice.tier.toUpperCase()}</span>
            <strong>{choice.label}</strong>
          </button>
        ))}
      </div>
      <button
        className="cr2-secondary-button"
        disabled={creditTokens <= 0}
        type="button"
        onClick={() => useCreditToken('card-reroll')}
      >
        카드 교체
      </button>
    </article>
  );
}
