import { useMemo } from 'react';
import DemandMap from '../components/DemandMap';
import RightPanel from '../components/RightPanel';
import StatusBar from '../components/StatusBar';
import StrategyWarning from '../components/StrategyWarning';
import TabBar from '../components/TabBar';
import { ECONOMIC_PHASE_LABELS } from '../constants/economy';
import { selectMarketPreview, useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';

export default function MainScreen() {
  const gameState = useGameStore();
  const preview = useMemo(() => selectMarketPreview(gameState), [gameState]);
  const phase = useGameStore((state) => state.phase);
  const player = useGameStore((state) => state.player);
  const marketEffects = useGameStore((state) => state.marketEffects);
  const floor = useGameStore((state) => state.floor);
  const expectedDebt = preview.playerAfterOperation?.debt ?? player.debt;
  const expectedInterest = Math.round((expectedDebt * 0.012) * preview.marketModifiers.debtCostMultiplier);

  return (
    <main className="cr2-main-screen">
      <StatusBar />
      <section className="cr2-battle-layout">
        <div className="cr2-left-panel">
          <div className="cr2-phase-strip">
            <span>{ECONOMIC_PHASE_LABELS[phase]}</span>
            {marketEffects
              .filter((effect) => effect.expiresOnFloor >= floor)
              .map((effect) => <strong key={effect.id}>{effect.title}</strong>)}
          </div>
          <DemandMap totalDemand={preview.totalDemand} participants={preview.participants} />
          <div className="cr2-bottom-info">
            <StrategyWarning />
            <div className="cr2-company-summary">
              <SummaryItem label="자본" value={formatWon(player.capital)} />
              <SummaryItem label="부채" value={formatWon(expectedDebt)} />
              <SummaryItem label="월 이자" value={formatWon(expectedInterest)} />
              <SummaryItem label="품질" value={preview.player.quality.toFixed(1)} />
              <SummaryItem label="브랜드" value={player.brand.toFixed(1)} />
              <SummaryItem label="인지도" value={`${Math.round(preview.player.awareness * 100)}%`} />
            </div>
          </div>
          <TabBar />
        </div>
        <RightPanel preview={preview} />
      </section>
    </main>
  );
}

function SummaryItem({ label, value }) {
  return (
    <span>
      <b>{label}</b>
      <strong>{value}</strong>
    </span>
  );
}
