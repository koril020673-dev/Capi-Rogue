import { useMemo, useState } from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';
import { getEducationProgress } from '../logic/achievementEngine';
import { useGameStore } from '../store/useGameStore';
import '../styles/achievement.css';

const TABS = Object.freeze([
  Object.freeze({ id: 'all', label: '\uC804\uCCB4' }),
  Object.freeze({ id: 'economy', label: '\uACBD\uC81C\uAD50\uC721' }),
  Object.freeze({ id: 'game', label: '\uAC8C\uC784' }),
]);

const TEXT = Object.freeze({
  title: '\uC5C5\uC801',
  economyProgress: '\uACBD\uC81C \uAD50\uC721 \uB2EC\uC131',
  gameProgress: '\uAC8C\uC784 \uB2EC\uC131',
  locked: '\uBBF8\uB2EC\uC131 \uC5C5\uC801',
});

export default function AchievementScreen() {
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements ?? []);
  const [tab, setTab] = useState('all');
  const progress = useMemo(() => getEducationProgress(unlockedAchievements), [unlockedAchievements]);
  const gameTotal = ACHIEVEMENTS.filter((achievement) => achievement.category === 'GAME').length;
  const gameUnlocked = ACHIEVEMENTS.filter((achievement) => (
    achievement.category === 'GAME' && unlockedAchievements.includes(achievement.id)
  )).length;
  const achievements = ACHIEVEMENTS.filter((achievement) => {
    if (tab === 'economy') {
      return achievement.category === 'ECONOMY';
    }

    if (tab === 'game') {
      return achievement.category === 'GAME';
    }

    return true;
  });

  return (
    <section className="cr2-achievement-screen">
      <header className="cr2-achievement-head">
        <h2>{TEXT.title}</h2>
        <div className="cr2-achievement-tabs">
          {TABS.map((item) => (
            <button
              className={tab === item.id ? 'cr2-achievement-tab cr2-achievement-tab--active' : 'cr2-achievement-tab'}
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="cr2-achievement-summary">
        <ProgressLine label={TEXT.economyProgress} value={progress.unlocked} total={progress.total} />
        <ProgressLine label={TEXT.gameProgress} value={gameUnlocked} total={gameTotal} />
      </div>

      <div className="cr2-achievement-list">
        {achievements.map((achievement) => {
          const unlocked = unlockedAchievements.includes(achievement.id);

          return (
            <article
              className={unlocked ? 'cr2-achievement-card cr2-achievement-card--unlocked' : 'cr2-achievement-card'}
              key={achievement.id}
            >
              <span className={`cr2-achievement-badge cr2-achievement-badge--${achievement.grade ?? 'game'}`}>
                {getBadgeLabel(achievement)}
              </span>
              <div>
                <strong>{unlocked ? achievement.name : TEXT.locked}</strong>
                <p>{unlocked ? achievement.description : achievement.name}</p>
                {achievement.educationLink ? <small>{achievement.educationLink}</small> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgressLine({ label, value, total }) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="cr2-achievement-progress-row">
      <span>{label}</span>
      <strong>{value} / {total} ({percent}%)</strong>
      <i>
        <b style={{ width: `${percent}%` }} />
      </i>
    </div>
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
