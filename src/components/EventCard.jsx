import { useGameStore } from '../store/useGameStore';

export default function EventCard({ event }) {
  const chooseInternalEventOption = useGameStore((state) => state.chooseInternalEventOption);

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
    </article>
  );
}
