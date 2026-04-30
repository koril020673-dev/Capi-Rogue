import { useMemo } from 'react';
import DemandMap from '../components/DemandMap';
import RightPanel from '../components/RightPanel';
import StatusBar from '../components/StatusBar';
import StrategyWarning from '../components/StrategyWarning';
import TabBar from '../components/TabBar';
import { ECONOMIC_PHASE_LABELS, ECONOMIC_PHASES } from '../constants/economy';
import { selectMarketPreview, useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';
import boomImage from '../assets/optimized/bg_phase_16bit_named_pack/bg_phase_boom.jpg';
import contractionImage from '../assets/optimized/bg_phase_16bit_named_pack/bg_phase_contraction.jpg';
import growthImage from '../assets/optimized/bg_phase_16bit_named_pack/bg_phase_growth.jpg';
import recessionImage from '../assets/optimized/bg_phase_16bit_named_pack/bg_phase_recession.jpg';
import stableImage from '../assets/optimized/bg_phase_16bit_named_pack/bg_phase_stable.jpg';

const PHASE_IMAGES = Object.freeze({
  [ECONOMIC_PHASES.BOOM]: boomImage,
  [ECONOMIC_PHASES.GROWTH]: growthImage,
  [ECONOMIC_PHASES.STABLE]: stableImage,
  [ECONOMIC_PHASES.CONTRACTION]: contractionImage,
  [ECONOMIC_PHASES.RECESSION]: recessionImage,
});

const TEXT = Object.freeze({
  capital: '\uC790\uBCF8',
  debt: '\uBD80\uCC44',
  interest: '\uC6D4 \uC774\uC790',
  quality: '\uD488\uC9C8',
  brand: '\uBE0C\uB79C\uB4DC',
  awareness: '\uC778\uC9C0\uB3C4',
});

export default function MainScreen() {
  const gameState = useGameStore();
  const preview = useMemo(() => selectMarketPreview(gameState), [gameState]);
  const phase = useGameStore((state) => state.phase);
  const player = useGameStore((state) => state.player);
  const marketEffects = useGameStore((state) => state.marketEffects);
  const currentExternalEvent = useGameStore((state) => state.currentExternalEvent);
  const currentRivalEvent = useGameStore((state) => state.currentRivalEvent);
  const confirmExternalEvent = useGameStore((state) => state.confirmExternalEvent);
  const floor = useGameStore((state) => state.floor);
  const expectedDebt = preview.playerAfterOperation?.debt ?? player.debt;
  const expectedInterest = Math.round((expectedDebt * 0.012) * preview.marketModifiers.debtCostMultiplier);

  return (
    <main className="cr2-main-screen">
      <StatusBar />
      <EventNoticeBanner
        events={[currentExternalEvent, currentRivalEvent].filter(Boolean)}
        onConfirm={confirmExternalEvent}
      />
      <section className="cr2-battle-layout">
        <div
          className={`cr2-left-panel cr2-left-panel--phase-${phase}`}
          style={{ '--cr2-phase-bg': `url(${PHASE_IMAGES[phase]})` }}
        >
          <div className="cr2-phase-strip">
            <span>{ECONOMIC_PHASE_LABELS[phase]}</span>
            {marketEffects
              .filter((effect) => effect.expiresOnFloor >= floor)
              .map((effect) => <strong key={effect.id}>{effect.title}</strong>)}
          </div>
          <DemandMap totalDemand={preview.totalDemand} participants={preview.participants} revealDemand={false} />
          <div className="cr2-bottom-info">
            <StrategyWarning />
            <div className="cr2-company-summary">
              <SummaryItem label={TEXT.capital} value={formatWon(player.capital)} />
              <SummaryItem label={TEXT.debt} value={formatWon(expectedDebt)} />
              <SummaryItem label={TEXT.interest} value={formatWon(expectedInterest)} />
              <SummaryItem label={TEXT.quality} value={preview.player.quality.toFixed(1)} />
              <SummaryItem label={TEXT.brand} value={player.brand.toFixed(1)} />
              <SummaryItem label={TEXT.awareness} value={`${Math.round(preview.player.awareness * 100)}%`} />
            </div>
          </div>
          <TabBar />
        </div>
        <RightPanel preview={preview} />
      </section>
    </main>
  );
}

function EventNoticeBanner({ events, onConfirm }) {
  if (!events.length) {
    return null;
  }

  return (
    <section className="cr2-event-banner">
      <div>
        <span className="cr2-panel-label">MARKET EVENT</span>
        {events.map((event) => (
          <p key={event.id}>
            <strong>{event.title ?? event.name}</strong>
            <span>{event.description ?? event.message}</span>
          </p>
        ))}
      </div>
      <button className="cr2-secondary-button" type="button" onClick={onConfirm}>
        확인
      </button>
    </section>
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
