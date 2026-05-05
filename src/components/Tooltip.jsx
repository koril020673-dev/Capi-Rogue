import { useEffect, useMemo, useRef, useState } from 'react';
import { TOOLTIPS } from '../constants/tutorialData';
import '../styles/tutorial.css';

export default function Tooltip({ as: Component = 'span', children = null, content = '', tooltipId = null }) {
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, placement: 'bottom' });
  const tooltip = useMemo(
    () => TOOLTIPS.find((item) => item.id === tooltipId) ?? null,
    [tooltipId],
  );
  const tooltipContent = content || tooltip?.content || '';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (buttonRef.current?.contains(event.target)) {
        return;
      }

      setOpen(false);
    }

    window.addEventListener('pointerdown', handlePointerDown);

    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 260;
    const tooltipHeight = 96;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const placeAbove = rect.bottom + tooltipHeight > viewportHeight - 8;
    const left = Math.min(
      Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2),
      viewportWidth - tooltipWidth - 8,
    );
    const top = placeAbove ? Math.max(8, rect.top - tooltipHeight - 10) : rect.bottom + 10;

    setPosition({
      left,
      top,
      placement: placeAbove ? 'top' : 'bottom',
    });
  }, [open]);

  return (
    <Component className="cr2-tooltip-wrap">
      {children}
      <span
        aria-expanded={open}
        aria-label="도움말"
        className="cr2-tooltip-button"
        ref={buttonRef}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        ?
      </span>
      {open && tooltipContent ? (
        <span
          className={`cr2-tooltip-box cr2-tooltip-box--${position.placement}`}
          role="tooltip"
          style={{ left: `${position.left}px`, top: `${position.top}px` }}
        >
          {tooltipContent}
        </span>
      ) : null}
    </Component>
  );
}
