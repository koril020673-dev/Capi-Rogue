import { useMemo, useRef, useState } from 'react';
import { ko } from '../../constants/i18n/ko';

const TERMS = Object.freeze(
  Object.values(ko.dictionary).map((item) => Object.freeze([
    item.term,
    item.definition,
    item.game,
  ])),
);

export default function EconomyDictionary() {
  const [query, setQuery] = useState('');
  const listRef = useRef(null);
  const dragState = useRef({
    active: false,
    pointerId: null,
    startY: 0,
    scrollTop: 0,
  });
  const filteredTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return TERMS;
    }

    return TERMS.filter((term) => term.join(' ').toLowerCase().includes(normalizedQuery));
  }, [query]);

  function handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const list = listRef.current;

    if (!list) {
      return;
    }

    dragState.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      scrollTop: list.scrollTop,
    };
    list.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    const state = dragState.current;
    const list = listRef.current;

    if (!state.active || !list) {
      return;
    }

    event.preventDefault();
    list.scrollTop = state.scrollTop - (event.clientY - state.startY);
  }

  function stopDrag() {
    const list = listRef.current;

    if (dragState.current.active && list && dragState.current.pointerId !== null) {
      list.releasePointerCapture?.(dragState.current.pointerId);
    }

    dragState.current.active = false;
    dragState.current.pointerId = null;
  }

  return (
    <div className="cr2-pause-section cr2-pause-section--dictionary">
      <h2>경제 용어 사전</h2>
      <input
        className="cr2-pause-search"
        placeholder="검색"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div
        className="cr2-pause-term-list"
        ref={listRef}
        onPointerCancel={stopDrag}
        onPointerDown={handlePointerDown}
        onPointerLeave={stopDrag}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
      >
        {filteredTerms.map(([title, description, gameplay]) => (
          <article key={title}>
            <strong>{title}</strong>
            <p>{description}</p>
            <small>{gameplay}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
