import { useGameStore } from '../store/useGameStore';

export default function BackgroundScene({ children }) {
  const phase = useGameStore((state) => state.phase);
  const marketEffects = useGameStore((state) => state.marketEffects);
  const floor = useGameStore((state) => state.floor);
  const activeEffect = marketEffects.find((effect) => effect.expiresOnFloor >= floor);
  const sceneClass = activeEffect?.background ?? phase;

  return (
    <div className={`cr2-bg-scene cr2-bg-scene--${sceneClass}`}>
      <div className="cr2-bg-grid" />
      <div className="cr2-bg-scanline" />
      <div className="cr2-shell">{children}</div>
    </div>
  );
}
