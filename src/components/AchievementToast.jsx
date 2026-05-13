import { useEffect, useMemo, useState } from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';
import { playSFX } from '../logic/audioEngine';
import { useGameStore } from '../store/useGameStore';
import '../styles/achievementToast.css';

const TEXT = Object.freeze({
  title: '\uC5C5\uC801 \uB2EC\uC131!',
});

export default function AchievementToast() {
  const newAchievements = useGameStore((state) => state.newAchievements ?? []);
  const clearNewAchievements = useGameStore((state) => state.clearNewAchievements);
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const achievementMap = useMemo(
    () => new Map(ACHIEVEMENTS.map((achievement) => [achievement.id, achievement])),
    [],
  );

  useEffect(() => {
    if (!newAchievements.length) {
      return;
    }

    setQueue((items) => [
      ...items,
      ...newAchievements
        .map((id) => achievementMap.get(id))
        .filter(Boolean),
    ]);
    clearNewAchievements();
  }, [achievementMap, clearNewAchievements, newAchievements]);

  useEffect(() => {
    if (current || !queue.length) {
      return;
    }

    const [nextAchievement, ...rest] = queue;

    setCurrent(nextAchievement);
    setQueue(rest);
    setLeaving(false);
    playSFX('profit', 0.85);
  }, [current, queue]);

  useEffect(() => {
    if (!current) {
      return undefined;
    }

    const leaveTimer = window.setTimeout(() => setLeaving(true), 2700);
    const clearTimer = window.setTimeout(() => {
      setCurrent(null);
      setLeaving(false);
    }, 3000);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(clearTimer);
    };
  }, [current]);

  if (!current) {
    return null;
  }

  const dismissToast = () => {
    setQueue([]);
    setCurrent(null);
    setLeaving(false);
  };

  return (
    <aside className={leaving ? 'cr2-toast cr2-toast-leaving' : 'cr2-toast'} role="status">
      <button
        aria-label="업적 알림 닫기"
        className="cr2-toast-close"
        type="button"
        onClick={dismissToast}
      >
        X
      </button>
      <span>{TEXT.title}</span>
      <div className="cr2-toast-body">
        <i>{getBadgeLabel(current)}</i>
        <div>
          <strong>{current.name}</strong>
          <p>{current.description}</p>
        </div>
      </div>
    </aside>
  );
}

function getBadgeLabel(achievement) {
  if (achievement.category === 'GAME') {
    return 'GAME';
  }

  if (achievement.grade === 'BRONZE') {
    return 'BR';
  }

  if (achievement.grade === 'SILVER') {
    return 'SI';
  }

  return 'GO';
}
