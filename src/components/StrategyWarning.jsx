import {
  PRICE_OPTIONS,
  QUALITY_OPTIONS,
  STRATEGY_WARNING_LABELS,
  STRATEGY_WARNING_RULES,
} from '../constants/strategies';
import { useGameStore } from '../store/useGameStore';

export default function StrategyWarning() {
  const strategy = useGameStore((state) => state.strategy);
  const warningId = getStrategyWarningId(strategy);
  const label = warningId ? STRATEGY_WARNING_LABELS[warningId] : '\uC804\uB7B5 \uC548\uC815\uAD8C';
  const isRisk = warningId === 'no-margin' || warningId === 'brand-risk';

  return (
    <div className={isRisk ? 'cr2-strategy-warning cr2-strategy-warning--risk' : 'cr2-strategy-warning'}>
      <span className="cr2-panel-label">전략 진단</span>
      <strong>{label}</strong>
    </div>
  );
}

function getStrategyWarningId(strategy) {
  const priceTier = PRICE_OPTIONS.find((option) => option.id === strategy.priceOptionId)?.tier;
  const qualityTier = QUALITY_OPTIONS.find((option) => option.id === strategy.qualityOptionId)?.tier;

  return STRATEGY_WARNING_RULES.find((rule) => {
    const priceMatches = !rule.priceTier || rule.priceTier === priceTier;
    const qualityMatches =
      !rule.qualityTier ||
      (Array.isArray(rule.qualityTier)
        ? rule.qualityTier.includes(qualityTier)
        : rule.qualityTier === qualityTier);
    const marketingMatches = !rule.marketingTier || rule.marketingTier === strategy.marketingTier;

    return priceMatches && qualityMatches && marketingMatches;
  })?.id;
}
