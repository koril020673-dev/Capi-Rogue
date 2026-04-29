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
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';

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
  const estimate = buildTurnEstimate(preview, strategy);

  if (strategy.activeTab === STRATEGY_TABS.PRICE) {
    return (
      <aside className="cr2-right-panel">
        <PanelTitle title="판매" subtitle="가격과 판매 계획을 정합니다. 실제 결과는 정산에서 공개됩니다." />
        <RivalInfoList rivals={preview.rivals} />
        <div className="cr2-segmented">
          <button
            className={strategy.salesControlId === SALES_CONTROL_IDS.PRICE ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
            type="button"
            onClick={() => setSalesControl(SALES_CONTROL_IDS.PRICE)}
          >
            가격
          </button>
          <button
            className={strategy.salesControlId === SALES_CONTROL_IDS.QUANTITY ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
            type="button"
            onClick={() => setSalesControl(SALES_CONTROL_IDS.QUANTITY)}
          >
            판매 개수
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
        <ForecastBox estimate={estimate} concealed />
      </aside>
    );
  }

  if (strategy.activeTab === STRATEGY_TABS.QUALITY) {
    return (
      <aside className="cr2-right-panel">
        <PanelTitle title="품질" subtitle="품질은 점유율과 원가에 함께 영향을 줍니다." />
        <RivalInfoList rivals={preview.rivals} />
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
        <ForecastBox estimate={estimate} />
      </aside>
    );
  }

  if (strategy.activeTab === STRATEGY_TABS.OPERATIONS) {
    return (
      <aside className="cr2-right-panel">
        <PanelTitle title="운영" subtitle="이번 달의 설비 투자, 은행 거래, 마케팅을 정합니다." />
        <div className="cr2-factory-readout">
          <span>예상 품질 {preview.player.quality.toFixed(1)}</span>
          <span>예상 원가 {formatWon(preview.player.unitCost)}</span>
          <span>예상 부채 {formatWon(preview.playerAfterOperation?.debt ?? 0)}</span>
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
              건너뛰기
            </button>
            <button
              className={strategy.factoryUpgradeFocus === FACTORY_UPGRADE_FOCUS.QUALITY ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
              type="button"
              onClick={() => setFactoryUpgradeFocus(FACTORY_UPGRADE_FOCUS.QUALITY)}
            >
              품질 강화
            </button>
            <button
              className={strategy.factoryUpgradeFocus === FACTORY_UPGRADE_FOCUS.COST ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
              type="button"
              onClick={() => setFactoryUpgradeFocus(FACTORY_UPGRADE_FOCUS.COST)}
            >
              원가 절감
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
                거래 없음
              </button>
              <button
                className={strategy.bankActionId === BANK_ACTION_IDS.BORROW ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
                type="button"
                onClick={() => setBankAction(BANK_ACTION_IDS.BORROW)}
              >
                대출 받기
              </button>
              <button
                className={strategy.bankActionId === BANK_ACTION_IDS.REPAY ? 'cr2-segment cr2-segment--active' : 'cr2-segment'}
                type="button"
                onClick={() => setBankAction(BANK_ACTION_IDS.REPAY)}
              >
                대출 갚기
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
            <span className="cr2-panel-label">마케팅 투자금</span>
            <input
              className="cr2-input"
              min="0"
              type="number"
              value={strategy.marketingSpend}
              onChange={(event) => setOperationAmount('marketingSpend', event.target.value)}
            />
            <span className="cr2-panel-label">
              예상 인지도 {Math.round((preview.playerAfterOperation?.awareness ?? 0) * 100)}%
            </span>
          </div>
        ) : null}
        <ForecastBox estimate={estimate} />
      </aside>
    );
  }

  return (
    <aside className="cr2-right-panel">
      <PanelTitle title="다음 달로" subtitle="전략을 확정하고 이벤트 또는 정산으로 진행합니다." />
      <div className="cr2-summary-list">
        <span>예상 가격: {formatWon(preview.player.price)}</span>
        <span>예상 품질: {preview.player.quality.toFixed(1)}</span>
        <span>예상 점유율: {Math.round(preview.player.marketShare * 100)}%</span>
        <span>예상 수요: {preview.player.demand.toLocaleString()}</span>
      </div>
      <ForecastBox estimate={estimate} expanded />
      <button className="cr2-primary-button" type="button" onClick={proceedAfterStrategy}>
        전략 확정
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
        <span className="cr2-panel-label">이번 달 예상</span>
        <div className="cr2-summary-list">
          <span>판매 개수와 손익은 정산에서 공개됩니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cr2-forecast-box">
      <span className="cr2-panel-label">이번 달 예상</span>
      <div className="cr2-summary-list">
        <span>생산 {estimate.plannedProduction.toLocaleString()}</span>
        <span>판매 {estimate.unitsSold.toLocaleString()}</span>
        {expanded ? (
          <>
            <span>매출 {formatWon(estimate.revenue)}</span>
            <span>비용 {formatWon(estimate.totalCost)}</span>
          </>
        ) : null}
        <strong className={estimate.capitalChange >= 0 ? 'cr2-profit-text' : 'cr2-loss-text'}>
          예상 자본 변화 {formatWon(estimate.capitalChange)}
        </strong>
      </div>
    </div>
  );
}

function RivalInfoList({ rivals }) {
  return (
    <div className="cr2-rival-metric-list">
      {rivals.map((rival) => (
        <div className="cr2-rival-info-card" key={rival.id}>
          <strong>{rival.name}</strong>
          <div>
            <span>가격</span>
            <b>{formatWon(rival.price)}</b>
          </div>
          <div>
            <span>퀄리티</span>
            <b>{rival.quality.toFixed(1)}</b>
          </div>
          <div>
            <span>브랜드</span>
            <b>{rival.brand.toFixed(1)}</b>
          </div>
          <div>
            <span>인지도</span>
            <b>{Math.round(rival.awareness * 100)}%</b>
          </div>
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
        <span>선택 품질</span>
        <strong>{preview.player.quality.toFixed(1)}</strong>
      </div>
      <div>
        <span>단위 원가</span>
        <strong>{formatWon(unitCost)}</strong>
      </div>
      <div>
        <span>원가 변화</span>
        <strong className={costDelta <= 0 ? 'cr2-profit-text' : 'cr2-loss-text'}>
          {costDelta === 0 ? '변화 없음' : `${costDelta > 0 ? '+' : ''}${formatWon(costDelta)}`}
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
