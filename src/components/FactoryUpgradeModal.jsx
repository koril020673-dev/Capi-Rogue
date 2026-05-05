import { useMemo, useState } from 'react';
import { FACTORY_UPGRADE_FOCUS } from '../constants/strategies';
import { COST_REDUCTION_TIERS, QUALITY_UPGRADE_TIERS, getActualSuccessRate } from '../logic/factoryEngine';
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';
import successSfx from '../assets/sfx/sfx_click.wav';
import failSfx from '../assets/sfx/sfx_nextfloor.wav';
import '../styles/factory.css';

const TEXT = Object.freeze({
  title: '공장 업그레이드',
  qualityTitle: '품질 강화',
  costTitle: '원가 절감',
  currentQuality: '현재 품질',
  currentCost: '현재 원가',
  investment: '투자금액',
  successRate: '성공 확률',
  expectedGain: '예상 상승',
  expectedCut: '예상 절감',
  attempt: '업그레이드 시도',
  cancel: '취소',
  confirm: '확인',
  success: '업그레이드 성공',
  fail: '업그레이드 실패',
  costCharged: '비용 차감',
  nextBonus: '다음 시도 성공 확률 +10%',
});

export default function FactoryUpgradeModal({ focus, tierIndex = 0, onClose }) {
  const player = useGameStore((state) => state.player);
  const factoryFailStreak = useGameStore((state) => state.factoryFailStreak);
  const costReductionFailStreak = useGameStore((state) => state.costReductionFailStreak);
  const attemptFactoryUpgrade = useGameStore((state) => state.attemptFactoryUpgrade);
  const [result, setResult] = useState(null);
  const isQuality = focus === FACTORY_UPGRADE_FOCUS.QUALITY;
  const tier = isQuality
    ? QUALITY_UPGRADE_TIERS[tierIndex] ?? QUALITY_UPGRADE_TIERS[0]
    : COST_REDUCTION_TIERS[tierIndex] ?? COST_REDUCTION_TIERS[0];
  const failStreak = isQuality ? factoryFailStreak : costReductionFailStreak;
  const successRate = getActualSuccessRate(tier.baseSuccessRate, failStreak);
  const modalClass = [
    'cr2-factory-modal',
    result?.success ? 'cr2-factory-modal--success' : '',
    result && !result.success ? 'cr2-factory-modal--fail cr2-shake' : '',
  ].filter(Boolean).join(' ');
  const title = isQuality ? TEXT.qualityTitle : TEXT.costTitle;
  const audio = useMemo(
    () => ({
      success: createAudio(successSfx),
      fail: createAudio(failSfx),
    }),
    [],
  );

  function attempt() {
    const nextResult = attemptFactoryUpgrade(focus, tierIndex);

    setResult(nextResult);
    playAudio(nextResult.success ? audio.success : audio.fail);
  }

  return (
    <section className="cr2-factory-overlay" role="dialog" aria-modal="true" aria-label={TEXT.title}>
      <article className={modalClass}>
        {!result ? (
          <>
            <header>
              <h2>{title}</h2>
            </header>
            <div className="cr2-factory-readout-list">
              <FactoryRow
                label={isQuality ? TEXT.currentQuality : TEXT.currentCost}
                value={isQuality ? Math.round(player.maxQuality ?? player.quality ?? 0) : `${formatWon(player.unitCost)}/개`}
              />
              <FactoryRow label={TEXT.investment} value={formatWon(tier.cost)} />
              <FactoryRow label={TEXT.successRate} value={formatRateChange(tier.baseSuccessRate, successRate, failStreak)} />
              <FactoryRow
                label={isQuality ? TEXT.expectedGain : TEXT.expectedCut}
                value={isQuality ? `+${tier.minGain} ~ +${tier.maxGain}` : `-${Math.round(tier.minGain * 100)}% ~ -${Math.round(tier.maxGain * 100)}%`}
              />
            </div>
            <footer>
              <button type="button" onClick={attempt}>{TEXT.attempt}</button>
              <button type="button" onClick={onClose}>{TEXT.cancel}</button>
            </footer>
          </>
        ) : (
          <>
            <header>
              <h2>{result.success ? TEXT.success : TEXT.fail}</h2>
            </header>
            <div className="cr2-factory-result">
              {result.success && result.type === 'quality' ? (
                <strong>
                  품질 {Math.round(result.beforeQuality)} → <span className="cr2-factory-up">{Math.round(result.afterQuality)}</span>
                  {' '}(+{Math.round(result.afterQuality - result.beforeQuality)})
                </strong>
              ) : null}
              {result.success && result.type === 'cost' ? (
                <strong>
                  원가 {formatWon(result.beforeCost)} → <span className="cr2-factory-up">{formatWon(result.afterCost)}</span>
                </strong>
              ) : null}
              {!result.success ? (
                <>
                  <strong className="cr2-factory-down">{TEXT.costCharged} {formatWon(result.cost)}</strong>
                  <span>{TEXT.nextBonus}</span>
                </>
              ) : null}
            </div>
            <footer>
              <button type="button" onClick={onClose}>{TEXT.confirm}</button>
            </footer>
          </>
        )}
      </article>
    </section>
  );
}

function FactoryRow({ label, value }) {
  return (
    <div className="cr2-factory-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatRateChange(baseRate, currentRate, failStreak) {
  const basePercent = Math.round(baseRate * 100);
  const currentPercent = Math.round(currentRate * 100);

  if (failStreak <= 0 || basePercent === currentPercent) {
    return `${basePercent}%`;
  }

  return `${basePercent}% → 현재 ${currentPercent}%`;
}

function createAudio(src) {
  if (typeof Audio === 'undefined') {
    return null;
  }

  const audio = new Audio(src);
  audio.preload = 'auto';

  return audio;
}

function playAudio(audio) {
  if (!audio) {
    return;
  }

  audio.currentTime = 0;
  void audio.play().catch(() => {});
}
