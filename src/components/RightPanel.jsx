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
import { getPlannedProductionCount } from '../logic/settlementEngine';
import { getAdvisorById } from '../logic/advisorEngine';
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';

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
  concealedForecast: '\uD310\uB9E4 \uAC1C\uC218\uC640 \uC190\uC775\uC740 \uC815\uC0B0\uC5D0\uC11C \uACF5\uAC1C\uB429\uB2C8\uB2E4.',
  production: '\uC0DD\uC0B0',
  sold: '\uD310\uB9E4',
  revenue: '\uB9E4\uCD9C',
  cost: '\uBE44\uC6A9',
  capitalChange: '\uC608\uC0C1 \uC790\uBCF8 \uBCC0\uD654',
  selectedQuality: '\uC120\uD0DD \uD488\uC9C8',
  unitCost: '\uB2E8\uC704 \uC6D0\uAC00',
  costChange: '\uC6D0\uAC00 \uBCC0\uD654',
  noChange: '\uBCC0\uD654 \uC5C6\uC74C',
  rivalPrice: '\uAC00\uACA9',
  rivalQuality: '\uD488\uC9C8',
  rivalBrand: '\uBE0C\uB79C\uB4DC',
  rivalAwareness: '\uC778\uC9C0\uB3C4',
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
  const setBankAction = useGameStore((state) => state.setBankAction);
  const setOperationAmount = useGameStore((state) => state.setOperationAmount);
  const proceedAfterStrategy = useGameStore((state) => state.proceedAfterStrategy);
  const selectedAdvisorId = useGameStore((state) => state.selectedAdvisorId);
  const selectedAdvisor = getAdvisorById(selectedAdvisorId);
  const revealExtraRivalInfo = Boolean(selectedAdvisor.passive.revealExtraRivalInfo);
  const estimate = buildTurnEstimate(preview, strategy);

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
          <input
            className="cr2-input"
            min="0"
            type="number"
            value={strategy.customSalesQuantity}
            onChange={(event) => setCustomSalesQuantity(event.target.value)}
          />
        ) : null}
        <ForecastBox estimate={estimate} concealed={!REVEAL_DEMAND_FORECAST} />
      </aside>
    );
  }

  if (strategy.activeTab === STRATEGY_TABS.QUALITY) {
    return (
      <aside className="cr2-right-panel">
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
              {option.label}
            </button>
          ))}
        </div>
        <QualityCostReadout preview={preview} />
        <ForecastBox estimate={estimate} concealed={!REVEAL_DEMAND_FORECAST} />
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
          <div className="cr2-segmented cr2-segmented--three">
            <button
              className={strategy.factoryUpgradeFocus === FACTORY_UPGRADE_FOCUS.NONE ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
              type="button"
              onClick={() => setFactoryUpgradeFocus(FACTORY_UPGRADE_FOCUS.NONE)}
            >
              {TEXT.skip}
            </button>
            <button
              className={strategy.factoryUpgradeFocus === FACTORY_UPGRADE_FOCUS.QUALITY ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
              type="button"
              onClick={() => setFactoryUpgradeFocus(FACTORY_UPGRADE_FOCUS.QUALITY)}
            >
              {TEXT.qualityUpgrade}
            </button>
            <button
              className={strategy.factoryUpgradeFocus === FACTORY_UPGRADE_FOCUS.COST ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
              type="button"
              onClick={() => setFactoryUpgradeFocus(FACTORY_UPGRADE_FOCUS.COST)}
            >
              {TEXT.costCut}
            </button>
          </div>
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
                type="button"
                onClick={() => setBankAction(BANK_ACTION_IDS.REPAY)}
              >
                {TEXT.repay}
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
              <input
                className="cr2-input"
                min="0"
                type="number"
                value={strategy.bankRepayAmount}
                onChange={(event) => setOperationAmount('bankRepayAmount', event.target.value)}
              />
            ) : null}
          </>
        ) : null}
        {strategy.operationOptionId === OPERATION_STRATEGY_IDS.MARKETING ? (
          <div className="cr2-choice-grid">
            <span className="cr2-panel-label">{TEXT.marketingSpend}</span>
            <input
              className="cr2-input"
              min="0"
              type="number"
              value={strategy.marketingSpend}
              onChange={(event) => setOperationAmount('marketingSpend', event.target.value)}
            />
            <span className="cr2-panel-label">
              {TEXT.expectedAwareness} {Math.round((preview.playerAfterOperation?.awareness ?? 0) * 100)}%
            </span>
          </div>
        ) : null}
        <ForecastBox estimate={estimate} concealed={!REVEAL_DEMAND_FORECAST} />
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
    return (
      <div className="cr2-forecast-box">
        <span className="cr2-panel-label">{TEXT.forecast}</span>
        <div className="cr2-summary-list">
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
