import { useEffect } from 'react';
import {
  BANK_ACTION_IDS,
  FACTORY_UPGRADE_FOCUS,
  OPERATION_OPTIONS,
  OPERATION_STRATEGY_IDS,
  PRICE_OPTIONS,
  PRICE_STRATEGY_IDS,
  QUALITY_OPTIONS,
  SALES_CONTROL_IDS,
  SALES_QUANTITY_IDS,
  SALES_QUANTITY_OPTIONS,
  STRATEGY_TABS,
} from '../constants/strategies';
import { BASE_SUCCESS_RATE, COST_REDUCTION, QUALITY_UPGRADE, getSuccessRate } from '../logic/factoryEngine';
import { getMarketingLimit, getMaxOrderAmount, getPlannedProductionCount, getQualityCostMultiplier } from '../logic/settlementEngine';
import { getAdvisorById } from '../logic/advisorEngine';
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';
import Tooltip from './Tooltip';

const REVEAL_DEMAND_FORECAST = false;

const TEXT = Object.freeze({
  sales: '\uD310\uB9E4',
  salesSub: '\uAC00\uACA9\uACFC \uD310\uB9E4 \uACC4\uD68D\uC744 \uC815\uD569\uB2C8\uB2E4. \uC2E4\uC81C \uACB0\uACFC\uB294 \uC815\uC0B0\uC5D0\uC11C \uACF5\uAC1C\uB429\uB2C8\uB2E4.',
  price: '\uAC00\uACA9',
  quantity: '\uD310\uB9E4 \uAC1C\uC218',
  quality: '\uD488\uC9C8',
  qualitySub: '\uD488\uC9C8\uC740 \uB9E4\uB825\uB3C4\uC640 \uC6D0\uAC00\uC5D0 \uD568\uAED8 \uC601\uD5A5\uC744 \uC90D\uB2C8\uB2E4.',
  operations: '\uC6B4\uC601',
  operationsSub: '\uC774\uBC88 \uB2EC\uC758 \uC124\uBE44 \uD22C\uC790, \uC740\uD589 \uAC70\uB798, \uB9C8\uCF00\uD305\uC744 \uC815\uD569\uB2C8\uB2E4.',
  skip: '\uAC74\uB108\uB6F0\uAE30',
  qualityUpgrade: '\uD488\uC9C8 \uAC15\uD654',
  costCut: '\uC6D0\uAC00 \uC808\uAC10',
  noTrade: '\uAC70\uB798 \uC5C6\uC74C',
  borrow: '\uB300\uCD9C \uBC1B\uAE30',
  repay: '\uB300\uCD9C \uAC1A\uAE30',
  marketingSpend: '\uB9C8\uCF00\uD305 \uD22C\uC790\uAE08',
  nextMonth: '\uB2E4\uC74C \uB2EC\uB85C',
  nextMonthSub: '\uC804\uB7B5\uC744 \uD655\uC815\uD558\uACE0 \uC774\uBCA4\uD2B8 \uB610\uB294 \uC815\uC0B0\uC73C\uB85C \uC9C4\uD589\uD569\uB2C8\uB2E4.',
  confirm: '\uC804\uB7B5 \uD655\uC815',
  expectedPrice: '\uC608\uC0C1 \uAC00\uACA9',
  expectedQuality: '\uC608\uC0C1 \uD488\uC9C8',
  expectedCost: '\uC608\uC0C1 \uC6D0\uAC00',
  expectedDebt: '\uC608\uC0C1 \uBD80\uCC44',
  expectedAwareness: '\uC608\uC0C1 \uC778\uC9C0\uB3C4',
  hiddenDemand: '\uC810\uC720\uC728\uACFC \uC218\uC694\uB294 \uC815\uC0B0 \uD6C4 \uACF5\uAC1C\uB429\uB2C8\uB2E4.',
  forecast: '\uC774\uBC88 \uB2EC \uC608\uC0C1',
  concealedForecast: '\uC810\uC720\uC728\uACFC \uC190\uC775\uC740 \uC815\uC0B0\uC5D0\uC11C \uACF5\uAC1C\uB429\uB2C8\uB2E4.',
  production: '\uC0DD\uC0B0',
  sold: '\uD310\uB9E4',
  revenue: '\uB9E4\uCD9C',
  cost: '\uBE44\uC6A9',
  fixedOutflow: '\uC608\uC815 \uC9C0\uCD9C',
  productionCost: '\uC0DD\uC0B0\uBE44',
  operationExpense: '\uC6B4\uC601\uBE44',
  debtService: '\uC774\uC790',
  capitalChange: '\uC608\uC0C1 \uC790\uBCF8 \uBCC0\uD654',
  selectedQuality: '\uC120\uD0DD \uD488\uC9C8',
  unitCost: '\uB2E8\uC704 \uC6D0\uAC00',
  costChange: '\uC6D0\uAC00 \uBCC0\uD654',
  noChange: '\uBCC0\uD654 \uC5C6\uC74C',
  rivalPrice: '\uAC00\uACA9',
  rivalQuality: '\uD488\uC9C8',
  rivalBrand: '\uBE0C\uB79C\uB4DC',
  rivalAwareness: '\uC778\uC9C0\uB3C4',
  maxOrder: '\uCD5C\uB300 \uBC1C\uC8FC \uAC00\uB2A5',
  capitalBased: '\uBCF4\uC720 \uC790\uBCF8 \uAE30\uC900',
  maxMarketing: '\uCD5C\uB300 \uB9C8\uCF00\uD305 \uD22C\uC790',
  costDataError: '\uC6D0\uAC00 \uB370\uC774\uD130 \uC624\uB958 - \uC124\uC815\uC744 \uD655\uC778\uD558\uC138\uC694.',
  marketingLimitTitle: '\uB9C8\uCF00\uD305 \uD22C\uC790 \uD55C\uB3C4',
  marketingLimitCurrent: '\uD604\uC7AC \uD55C\uB3C4',
  marketingLimitRatio: '\uC790\uBCF8 \uBE44\uC728\uD615',
  insufficientCapital: '\uBCF4\uC720 \uC790\uBCF8\uC774 \uBD80\uC871\uD569\uB2C8\uB2E4.',
  capitalShort: '\uC790\uBCF8 \uBD80\uC871',
  noDebt: '\uBD80\uCC44 \uC5C6\uC74C',
});

export default function RightPanel({ preview }) {
  const strategy = useGameStore((state) => state.strategy);
  const selectPriceOption = useGameStore((state) => state.selectPriceOption);
  const setSalesControl = useGameStore((state) => state.setSalesControl);
  const setCustomPrice = useGameStore((state) => state.setCustomPrice);
  const selectSalesQuantityOption = useGameStore((state) => state.selectSalesQuantityOption);
  const setCustomSalesQuantity = useGameStore((state) => state.setCustomSalesQuantity);
  const selectQualityOption = useGameStore((state) => state.selectQualityOption);
  const selectOperationOption = useGameStore((state) => state.selectOperationOption);
  const setFactoryUpgradeFocus = useGameStore((state) => state.setFactoryUpgradeFocus);
  const setFactoryAction = useGameStore((state) => state.setFactoryAction);
  const clearFactoryAction = useGameStore((state) => state.clearFactoryAction);
  const setBankAction = useGameStore((state) => state.setBankAction);
  const setOperationAmount = useGameStore((state) => state.setOperationAmount);
  const proceedAfterStrategy = useGameStore((state) => state.proceedAfterStrategy);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const playerState = useGameStore((state) => state.player);
  const factoryActionThisTurn = useGameStore((state) => state.factoryActionThisTurn);
  const selectedAdvisor = getAdvisorById(selectedAdvisorId);
  const revealExtraRivalInfo = Boolean(selectedAdvisor.passive.revealExtraRivalInfo);
  const estimate = buildTurnEstimate(preview, strategy);
  const currentCapital = Math.max(0, playerState.capital ?? 0);
  const currentDebt = Math.max(0, playerState.debt ?? 0);
  const factoryFailStreak = useGameStore((state) => state.factoryFailStreak);
  const costReductionFailStreak = useGameStore((state) => state.costReductionFailStreak);
  const qualityUpgradeCount = useGameStore((state) => state.qualityUpgradeCount ?? 0);
  const costReductionCount = useGameStore((state) => state.costReductionCount ?? 0);
  const maxOrderAmount = getMaxAffordableOrder(preview);
  const currentPlannedProduction = getPlannedProductionCount(strategy, preview.totalDemand);
  const isOrderOverCapital = currentPlannedProduction > maxOrderAmount;
  const maxMarketingSpend = getMarketingLimit(currentCapital);
  const isMarketingOverCapital = (Number(strategy.marketingSpend) || 0) > maxMarketingSpend;
  const isRepayOverCapital = (Number(strategy.bankRepayAmount) || 0) > currentCapital;
  const canRepayDebt = currentDebt > 0 && currentCapital > 0;
  const isMaxCostReduction = (playerState.costReduction ?? 0) >= 0.4;

  useEffect(() => {
    const currentMarketingSpend = Number(strategy.marketingSpend) || 0;

    if (currentMarketingSpend > maxMarketingSpend) {
      setOperationAmount('marketingSpend', maxMarketingSpend);
    }
  }, [maxMarketingSpend, setOperationAmount, strategy.marketingSpend]);

  if (strategy.activeTab === STRATEGY_TABS.PRICE) {
    return (
      <aside className="cr2-right-panel">
        <PanelTitle title={TEXT.sales} subtitle={TEXT.salesSub} />
        <RivalInfoList rivals={preview.rivals} revealExtraInfo={revealExtraRivalInfo} />
        <div className="cr2-segmented">
          <button
            className={strategy.salesControlId === SALES_CONTROL_IDS.PRICE ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
            type="button"
            onClick={() => setSalesControl(SALES_CONTROL_IDS.PRICE)}
          >
            {TEXT.price}
          </button>
          <button
            className={strategy.salesControlId === SALES_CONTROL_IDS.QUANTITY ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
            type="button"
            onClick={() => setSalesControl(SALES_CONTROL_IDS.QUANTITY)}
          >
            {TEXT.quantity}
          </button>
        </div>
        {strategy.salesControlId === SALES_CONTROL_IDS.PRICE ? (
          <div className="cr2-choice-grid">
            {PRICE_OPTIONS.map((option) => (
              <button
                className={option.id === strategy.priceOptionId ? 'cr2-choice-button cr2-choice-button--active' : 'cr2-choice-button'}
                key={option.id}
                type="button"
                onClick={() => selectPriceOption(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
        {strategy.salesControlId === SALES_CONTROL_IDS.PRICE &&
        strategy.priceOptionId === PRICE_STRATEGY_IDS.CUSTOM ? (
          <input
            className="cr2-input"
            min="1"
            type="number"
            value={strategy.customPrice}
            onChange={(event) => setCustomPrice(event.target.value)}
          />
        ) : null}
        {strategy.salesControlId === SALES_CONTROL_IDS.QUANTITY ? (
          <div className="cr2-choice-grid">
            {SALES_QUANTITY_OPTIONS.map((option) => (
              <button
                className={option.id === strategy.salesQuantityOptionId ? 'cr2-choice-button cr2-choice-button--active' : 'cr2-choice-button'}
                key={option.id}
                type="button"
                onClick={() => selectSalesQuantityOption(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
        {strategy.salesControlId === SALES_CONTROL_IDS.QUANTITY &&
        strategy.salesQuantityOptionId === SALES_QUANTITY_IDS.CUSTOM ? (
          <>
            <input
              className="cr2-input"
              max={maxOrderAmount}
              min="0"
              type="number"
              value={strategy.customSalesQuantity}
              onChange={(event) => {
                const nextValue = clampNumber(event.target.value, 0, maxOrderAmount);

                setCustomSalesQuantity(nextValue);
              }}
            />
            <span className="cr2-panel-label">
              {TEXT.maxOrder}: {maxOrderAmount.toLocaleString()}개 ({TEXT.capitalBased})
            </span>
            {maxOrderAmount === 0 && currentCapital > 0 ? <strong className="cr2-loss-text">{TEXT.costDataError}</strong> : null}
            {isOrderOverCapital ? <strong className="cr2-loss-text">{TEXT.insufficientCapital}</strong> : null}
          </>
        ) : null}
        {strategy.salesControlId === SALES_CONTROL_IDS.QUANTITY &&
        strategy.salesQuantityOptionId !== SALES_QUANTITY_IDS.CUSTOM ? (
          <>
            <span className="cr2-panel-label">
              {TEXT.maxOrder}: {maxOrderAmount.toLocaleString()}개 ({TEXT.capitalBased})
            </span>
            {maxOrderAmount === 0 && currentCapital > 0 ? <strong className="cr2-loss-text">{TEXT.costDataError}</strong> : null}
            {isOrderOverCapital ? <strong className="cr2-loss-text">{TEXT.insufficientCapital}</strong> : null}
          </>
        ) : null}
      </aside>
    );
  }

  if (strategy.activeTab === STRATEGY_TABS.QUALITY) {
    return (
      <aside className="cr2-right-panel cr2-right-panel--quality">
        <PanelTitle title={TEXT.quality} subtitle={TEXT.qualitySub} />
        <RivalInfoList rivals={preview.rivals} revealExtraInfo={revealExtraRivalInfo} />
        <div className="cr2-choice-grid">
          {QUALITY_OPTIONS.map((option) => (
            <button
              className={option.id === strategy.qualityOptionId ? 'cr2-choice-button cr2-choice-button--active' : 'cr2-choice-button'}
              key={option.id}
              type="button"
              onClick={() => selectQualityOption(option.id)}
            >
              <span>{option.label}</span>
              <small>{formatWon(getQualityOptionUnitCost(preview, strategy, option.id))}</small>
            </button>
          ))}
        </div>
        <QualityCostReadout preview={preview} />
      </aside>
    );
  }

  if (strategy.activeTab === STRATEGY_TABS.OPERATIONS) {
    return (
      <aside className="cr2-right-panel">
        <PanelTitle title={TEXT.operations} subtitle={TEXT.operationsSub} />
        <div className="cr2-factory-readout">
          <span>{TEXT.expectedQuality} {preview.player.quality.toFixed(1)}</span>
          <span>{TEXT.expectedCost} {formatWon(preview.player.unitCost)}</span>
          <span>{TEXT.expectedDebt} {formatWon(preview.playerAfterOperation?.debt ?? 0)}</span>
        </div>
        <div className="cr2-choice-grid">
          {OPERATION_OPTIONS.map((option) => (
            <button
              className={option.id === strategy.operationOptionId ? 'cr2-choice-button cr2-choice-button--active' : 'cr2-choice-button'}
              key={option.id}
              type="button"
              onClick={() => selectOperationOption(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {strategy.operationOptionId === OPERATION_STRATEGY_IDS.FACTORY_UPGRADE ? (
          factoryActionThisTurn ? (
            <FactoryActionReservation
              action={factoryActionThisTurn}
              onCancel={clearFactoryAction}
            />
          ) : (
            <FactoryUpgradePicker
              capital={currentCapital}
              costReduction={playerState.costReduction ?? 0}
              costReductionFailStreak={costReductionFailStreak}
              costReductionCount={costReductionCount}
              currentCost={playerState.unitCost ?? 0}
              currentQuality={playerState.maxQuality ?? playerState.quality ?? 0}
              factoryFailStreak={factoryFailStreak}
              isMaxCostReduction={isMaxCostReduction}
              qualityUpgradeCount={qualityUpgradeCount}
              onReserve={(type) => {
                setFactoryUpgradeFocus(FACTORY_UPGRADE_FOCUS.NONE);
                setFactoryAction({ type, tierIndex: 0, result: null });
              }}
              onSkip={() => setFactoryUpgradeFocus(FACTORY_UPGRADE_FOCUS.NONE)}
            />
          )
        ) : null}
        {strategy.operationOptionId === OPERATION_STRATEGY_IDS.BANKING ? (
          <>
            <div className="cr2-segmented cr2-segmented--three">
              <button
                className={strategy.bankActionId === BANK_ACTION_IDS.NONE ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
                type="button"
                onClick={() => setBankAction(BANK_ACTION_IDS.NONE)}
              >
                {TEXT.noTrade}
              </button>
              <button
                className={strategy.bankActionId === BANK_ACTION_IDS.BORROW ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
                type="button"
                onClick={() => setBankAction(BANK_ACTION_IDS.BORROW)}
              >
                {TEXT.borrow}
              </button>
              <button
                className={strategy.bankActionId === BANK_ACTION_IDS.REPAY ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
                disabled={!canRepayDebt}
                type="button"
                onClick={() => setBankAction(BANK_ACTION_IDS.REPAY)}
              >
                {canRepayDebt ? TEXT.repay : currentDebt <= 0 ? TEXT.noDebt : TEXT.capitalShort}
              </button>
            </div>
            {strategy.bankActionId === BANK_ACTION_IDS.BORROW ? (
              <input
                className="cr2-input"
                min="0"
                type="number"
                value={strategy.bankBorrowAmount}
                onChange={(event) => setOperationAmount('bankBorrowAmount', event.target.value)}
              />
            ) : null}
            {strategy.bankActionId === BANK_ACTION_IDS.REPAY ? (
              <>
                <input
                  className="cr2-input"
                  max={Math.min(currentCapital, currentDebt)}
                  min="0"
                  type="number"
                  value={strategy.bankRepayAmount}
                  onChange={(event) => {
                    const nextValue = clampNumber(event.target.value, 0, Math.min(currentCapital, currentDebt));

                    setOperationAmount('bankRepayAmount', nextValue);
                  }}
                />
                {isRepayOverCapital ? <strong className="cr2-loss-text">{TEXT.insufficientCapital}</strong> : null}
              </>
            ) : null}
          </>
        ) : null}
        {strategy.operationOptionId === OPERATION_STRATEGY_IDS.MARKETING ? (
          <div className="cr2-choice-grid">
            <span className="cr2-panel-label">{TEXT.marketingSpend}</span>
            <input
              className="cr2-input"
              max={maxMarketingSpend}
              min="0"
              type="number"
              value={strategy.marketingSpend}
              onBlur={(event) => {
                const nextValue = clampNumber(event.target.value, 0, maxMarketingSpend);

                setOperationAmount('marketingSpend', nextValue);
              }}
              onChange={(event) => setOperationAmount('marketingSpend', event.target.value)}
            />
            <span className="cr2-panel-label">
              {TEXT.maxMarketing}: {formatWon(maxMarketingSpend)} ({TEXT.capitalBased})
            </span>
            <MarketingLimitReadout
              capital={currentCapital}
              limit={maxMarketingSpend}
            />
            {isMarketingOverCapital ? <strong className="cr2-loss-text">{TEXT.insufficientCapital}</strong> : null}
            <span className="cr2-panel-label">
              {TEXT.expectedAwareness} {Math.round((preview.playerAfterOperation?.awareness ?? 0) * 100)}%
            </span>
          </div>
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="cr2-right-panel">
      <PanelTitle title={TEXT.nextMonth} subtitle={TEXT.nextMonthSub} />
      <div className="cr2-summary-list">
        <span>{TEXT.expectedPrice}: {formatWon(preview.player.price)}</span>
        <span>{TEXT.expectedQuality}: {preview.player.quality.toFixed(1)}</span>
        <span>{TEXT.hiddenDemand}</span>
      </div>
      <ForecastBox
        estimate={estimate}
        expanded={REVEAL_DEMAND_FORECAST}
        concealed={!REVEAL_DEMAND_FORECAST}
      />
      <button className="cr2-primary-button" type="button" onClick={proceedAfterStrategy}>
        {TEXT.confirm}
      </button>
    </aside>
  );
}

function PanelTitle({ title, subtitle }) {
  return (
    <div className="cr2-panel-title">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function ForecastBox({ estimate, expanded = false, concealed = false }) {
  if (concealed) {
    const fixedOutflow = estimate.productionCost + estimate.operationExpense + estimate.debtService;

    return (
      <div className="cr2-forecast-box">
        <span className="cr2-panel-label">{TEXT.forecast}</span>
        <div className="cr2-summary-list">
          <span>{TEXT.production} {estimate.plannedProduction.toLocaleString()}</span>
          <span>{TEXT.productionCost} {formatWon(estimate.productionCost)}</span>
          <span>{TEXT.operationExpense} {formatWon(estimate.operationExpense)}</span>
          <span>{TEXT.debtService} {formatWon(estimate.debtService)}</span>
          <strong className="cr2-loss-text">{TEXT.fixedOutflow} {formatWon(fixedOutflow)}</strong>
          <span>{TEXT.concealedForecast}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cr2-forecast-box">
      <span className="cr2-panel-label">{TEXT.forecast}</span>
      <div className="cr2-summary-list">
        <span>{TEXT.production} {estimate.plannedProduction.toLocaleString()}</span>
        <span>{TEXT.sold} {estimate.unitsSold.toLocaleString()}</span>
        {expanded ? (
          <>
            <span>{TEXT.revenue} {formatWon(estimate.revenue)}</span>
            <span>{TEXT.cost} {formatWon(estimate.totalCost)}</span>
          </>
        ) : null}
        <strong className={estimate.capitalChange >= 0 ? 'cr2-profit-text' : 'cr2-loss-text'}>
          {TEXT.capitalChange} {formatWon(estimate.capitalChange)}
        </strong>
      </div>
    </div>
  );
}

function RivalInfoList({ rivals, revealExtraInfo = false }) {
  return (
    <div className="cr2-rival-metric-list">
      {rivals.map((rival) => (
        <div className="cr2-rival-info-card" key={rival.id}>
          <strong>{rival.name}</strong>
          <div>
            <span>{TEXT.rivalPrice}</span>
            <b>{formatWon(rival.price)}</b>
          </div>
          <div>
            <span>{TEXT.rivalQuality}</span>
            <b>{rival.quality.toFixed(1)}</b>
          </div>
          {revealExtraInfo ? (
            <>
              <div>
                <span>{TEXT.rivalBrand}</span>
                <b>{rival.brand.toFixed(1)}</b>
              </div>
              <div>
                <span>{TEXT.rivalAwareness}</span>
                <b>{Math.round(rival.awareness * 100)}%</b>
              </div>
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function QualityCostReadout({ preview }) {
  const baseUnitCost = preview.playerAfterOperation?.unitCost ?? preview.player.unitCost;
  const unitCost = preview.player.unitCost;
  const costDelta = unitCost - baseUnitCost;

  return (
    <div className="cr2-quality-cost-readout">
      <div>
        <span>{TEXT.selectedQuality}</span>
        <strong>{preview.player.quality.toFixed(1)}</strong>
      </div>
      <div>
        <span>{TEXT.unitCost}</span>
        <strong>{formatWon(unitCost)}</strong>
      </div>
      <div>
        <span>{TEXT.costChange}</span>
        <strong className={costDelta <= 0 ? 'cr2-profit-text' : 'cr2-loss-text'}>
          {costDelta === 0 ? TEXT.noChange : `${costDelta > 0 ? '+' : ''}${formatWon(costDelta)}`}
        </strong>
      </div>
    </div>
  );
}

function MarketingLimitReadout({ capital, limit }) {
  const formula = `(${formatWon(capital)} x 0.3)`;
  const tooltipText = '보유 자본의 30%까지 마케팅에 투자할 수 있습니다. 자본이 많을수록 한도가 늘어납니다.';

  return (
    <div className="cr2-marketing-limit-card">
      <Tooltip content={tooltipText}>
        <span className="cr2-panel-label">{TEXT.marketingLimitTitle}</span>
      </Tooltip>
      <strong>{TEXT.marketingLimitRatio}</strong>
      <span>{TEXT.marketingLimitCurrent}: {formatWon(limit)}</span>
      <small>{formula}</small>
    </div>
  );
}

function FactoryUpgradePicker({
  capital,
  costReduction,
  costReductionCount,
  costReductionFailStreak,
  currentCost,
  currentQuality,
  factoryFailStreak,
  isMaxCostReduction,
  qualityUpgradeCount,
  onReserve,
  onSkip,
}) {
  const qualityRate = getSuccessRate(BASE_SUCCESS_RATE, qualityUpgradeCount, factoryFailStreak);
  const costRate = getSuccessRate(BASE_SUCCESS_RATE, costReductionCount, costReductionFailStreak);

  return (
    <div className="cr2-factory-upgrade-picker">
      <section className="cr2-factory-upgrade-section">
        <header>
          <strong>공장 관리</strong>
          <span>?? ??: {Math.round(currentQuality)}</span>
          <span>현재 원가: {formatWon(currentCost)}/개</span>
          <span>누적 원가 절감: {Math.round(costReduction * 100)}% / 40%</span>
        </header>
        <div className="cr2-factory-tier-grid cr2-factory-tier-grid--single">
          <FactorySingleButton
            disabled={QUALITY_UPGRADE.cost > capital}
            failStreak={factoryFailStreak}
            limitMessage={TEXT.capitalShort}
            option={QUALITY_UPGRADE}
            rate={qualityRate}
            title={TEXT.qualityUpgrade}
            type="quality"
            onReserve={onReserve}
          />
          <FactorySingleButton
            disabled={isMaxCostReduction || COST_REDUCTION.cost > capital}
            failStreak={costReductionFailStreak}
            limitMessage={isMaxCostReduction ? '최대 원가 절감 달성' : TEXT.capitalShort}
            option={COST_REDUCTION}
            rate={costRate}
            title={TEXT.costCut}
            type="cost"
            onReserve={onReserve}
          />
        </div>
      </section>
      <button className="cr2-factory-skip-button" type="button" onClick={onSkip}>
        {TEXT.skip}
      </button>
    </div>
  );
}

function FactoryActionReservation({ action, onCancel }) {
  const isQuality = action.type === 'quality';
  const option = isQuality ? QUALITY_UPGRADE : COST_REDUCTION;

  return (
    <section className="cr2-factory-reservation-card">
      <strong>이번 달 공장 작업 예약됨</strong>
      <span>{isQuality ? TEXT.qualityUpgrade : TEXT.costCut} · {formatWon(option.cost)}</span>
      <span>
        {isQuality
          ? `예상 상승: +${option.minGain} ~ +${option.maxGain}`
          : `예상 절감: -${Math.round(option.minGain * 100)}% ~ -${Math.round(option.maxGain * 100)}%`}
      </span>
      <button type="button" onClick={onCancel}>취소</button>
    </section>
  );
}

function FactorySingleButton({
  disabled,
  failStreak,
  limitMessage,
  option,
  onReserve,
  rate,
  title,
  type,
}) {
  const failBonus = failStreak * 10;

  return (
    <button
      className="cr2-factory-tier-button"
      disabled={disabled}
      type="button"
      onClick={() => onReserve(type)}
    >
      <strong>{title}</strong>
      <span>비용: {formatWon(option.cost)}</span>
      <span>
        {type === 'quality'
          ? `예상: +${option.minGain} ~ +${option.maxGain}`
          : `예상: -${Math.round(option.minGain * 100)}% ~ -${Math.round(option.maxGain * 100)}%`}
      </span>
      <span className={getRateClassName(rate)}>성공 확률: {Math.round(rate * 100)}%</span>
      {failStreak > 0 ? <small className="cr2-profit-text">연속 실패 {failStreak}회 +{failBonus}% 보정</small> : null}
      {rate >= 0.95 ? <small className="cr2-profit-text">최대 확률 도달</small> : null}
      {disabled ? <small className="cr2-loss-text">{limitMessage}</small> : null}
    </button>
  );
}

function getRateClassName(rate) {
  if (rate >= 0.7) {
    return 'cr2-rate-high';
  }

  if (rate >= 0.4) {
    return 'cr2-rate-mid';
  }

  return 'cr2-rate-low';
}

function buildTurnEstimate(preview, strategy) {
  const plannedProduction = getPlannedProductionCount(strategy, preview.totalDemand);
  const unitsSold = Math.min(plannedProduction, preview.player.demand);
  const unsoldUnits = Math.max(0, plannedProduction - unitsSold);
  const revenue = unitsSold * preview.player.price;
  const productionCost = plannedProduction * preview.player.unitCost;
  const disposalCost = Math.round(unsoldUnits * preview.player.unitCost * 0.18);
  const workingDebt = preview.playerAfterOperation?.debt ?? 0;
  const debtService = Math.round((workingDebt * 0.012) * preview.marketModifiers.debtCostMultiplier);
  const operationExpense = preview.operationExpense ?? 0;
  const operationCapitalChange = preview.operationCapitalChange ?? 0;
  const totalCost = productionCost + disposalCost + debtService + operationExpense;
  const profit = revenue - totalCost;

  return Object.freeze({
    totalDemand: preview.totalDemand,
    plannedProduction,
    unitsSold,
    unsoldUnits,
    revenue,
    productionCost,
    disposalCost,
    debtService,
    operationExpense,
    totalCost,
    profit,
    capitalChange: profit + operationCapitalChange,
  });
}

function getQualityOptionUnitCost(preview, strategy, qualityOptionId) {
  const currentQualityMultiplier = getQualityCostMultiplier(strategy);
  const marketCostMultiplier = preview.marketModifiers.costMultiplier ?? 1;
  const fallbackBaseCost = Math.max(
    1,
    Math.round(preview.player.unitCost / Math.max(0.1, currentQualityMultiplier * marketCostMultiplier)),
  );
  const baseUnitCost = preview.playerAfterOperation?.unitCost ?? fallbackBaseCost;
  const optionStrategy = Object.freeze({ ...strategy, qualityOptionId });

  return Math.max(
    1,
    Math.round(baseUnitCost * marketCostMultiplier * getQualityCostMultiplier(optionStrategy)),
  );
}

function getMaxAffordableOrder(preview) {
  const capital = preview.player.capital ?? 0;
  const unitCost = preview.player.unitCost ?? preview.playerAfterOperation?.unitCost ?? 3000;
  const orderCap = preview.player.orderCap ?? preview.playerAfterOperation?.orderCap ?? 1000;

  return getMaxOrderAmount(capital, unitCost, orderCap);
}

function clampNumber(value, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(Math.max(min, Math.round(number)), Math.max(min, max));
}
