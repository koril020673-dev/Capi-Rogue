import { useMemo, useState } from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';
import { getEducationProgress } from '../logic/achievementEngine';
import { useGameStore } from '../store/useGameStore';
import '../styles/achievement.css';

const TABS = Object.freeze([
  Object.freeze({ id: 'all', label: '전체' }),
  Object.freeze({ id: 'economy', label: '경제교육' }),
  Object.freeze({ id: 'game', label: '게임' }),
]);

export default function AchievementScreen() {
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements ?? []);
  const newAchievements = useGameStore((state) => state.newAchievements ?? []);
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
  const latestAchievement = newAchievements
    .map((id) => ACHIEVEMENTS.find((achievement) => achievement.id === id))
    .find(Boolean);

  return (
    <section className="cr2-achievement-screen">
      <header className="cr2-achievement-head">
        <h2>업적</h2>
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
        <ProgressLine label="경제 교육 달성" value={progress.unlocked} total={progress.total} />
        <ProgressLine label="게임 달성" value={gameUnlocked} total={gameTotal} />
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
                <strong>{unlocked ? achievement.name : '미달성 업적'}</strong>
                <p>{unlocked ? achievement.description : achievement.name}</p>
                {achievement.educationLink ? <small>{achievement.educationLink}</small> : null}
              </div>
            </article>
          );
        })}
      </div>

      {latestAchievement ? (
        <aside className="cr2-achievement-toast">
          <span>업적 달성</span>
          <strong>{latestAchievement.name}</strong>
          <p>{latestAchievement.description}</p>
        </aside>
      ) : null}
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
