import { useMemo } from 'react';
import StatusBar from '../components/StatusBar';
import { getAdvisorById } from '../logic/advisorEngine';
import { generateReport } from '../logic/reportEngine';
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';

const REPORT_MARKERS = Object.freeze({
  choice: '선택',
  event: '변수',
  down: '하락',
  up: '상승',
  suggestion: '제안',
});

const TEXT = Object.freeze({
  title: '월말 정산',
  finalProfit: '이번 달 최종 순이익',
  marketShare: '시장 점유율',
  totalDemand: '총 수요',
  plannedProduction: '생산량',
  unitsSold: '실제 판매',
  unsoldUnits: '재고 처분',
  revenue: '매출',
  productionCost: '생산비',
  disposalCost: '재고 비용',
  operationExpense: '운영비',
  debtService: '부채 비용',
  capitalChange: '자본 변화',
  healthChange: '경영 체력',
  momentum: '모멘텀',
  nextReward: '다음 보상',
  finalResult: '최종 결과 보기',
  clearConfirm: '클리어 확인',
  rewardSelect: '보상 선택으로',
  nextFloor: '다음 층으로',
  chooseNow: '지금 선택',
  floorsLater: '층 후',
  monthlyDecisionReport: '이번 달 결정 분석',
  graphs: '시장 그래프',
  shareGraph: '점유율',
  moneyGraph: '매출 / 순이익',
  revenueShort: '매출',
  profitShort: '순익',
});

const SHARE_COLORS = Object.freeze(['#00FF41', '#DC143C', '#FFD700', '#42A5FF', '#B06CFF']);

export default function SettlementScreen() {
  const gameState = useGameStore((state) => state);
  const continueFromResult = useGameStore((state) => state.continueFromResult);
  const { currentSettlement: settlement, currentResult: result } = gameState;
  const playerShare =
    settlement?.demandSplit.find((participant) => participant.id === 'player')?.marketShare ?? 0;
  const capitalChange = settlement ? settlement.capitalAfter - settlement.capitalBefore : 0;
  const advisor = getAdvisorById(gameState.selectedAdvisorId);
  const report = useMemo(
    () => generateReport(gameState, gameState.selectedAdvisorId),
    [gameState],
  );

  if (!settlement || !result) {
    return null;
  }

  return (
    <main className="cr2-settlement-screen cr2-settlement-screen--combined">
      <StatusBar />
      <section className="cr2-settlement-report-layout">
        <section className="cr2-ledger-panel cr2-ledger-panel--combined">
          <p className="cr2-kicker">MONTHLY SETTLEMENT</p>
          <h1>{TEXT.title}</h1>
          <div className={settlement.profit >= 0 ? 'cr2-ledger-highlight' : 'cr2-ledger-highlight cr2-ledger-highlight--loss'}>
            <span>{TEXT.finalProfit}</span>
            <strong>{formatWon(settlement.profit)}</strong>
          </div>

          <div className="cr2-ledger-grid cr2-ledger-grid--compact">
            <LedgerItem label={TEXT.marketShare} value={`${Math.round(playerShare * 100)}%`} />
            <LedgerItem label={TEXT.totalDemand} value={settlement.totalDemand.toLocaleString()} />
            <LedgerItem label={TEXT.plannedProduction} value={settlement.plannedProduction.toLocaleString()} />
            <LedgerItem label={TEXT.unitsSold} value={settlement.unitsSold.toLocaleString()} />
            <LedgerItem label={TEXT.unsoldUnits} value={settlement.unsoldUnits.toLocaleString()} danger={settlement.unsoldUnits > 0} />
            <LedgerItem label={TEXT.revenue} value={formatWon(settlement.revenue)} />
            <LedgerItem label={TEXT.productionCost} value={formatWon(settlement.productionCost)} danger />
            <LedgerItem label={TEXT.disposalCost} value={formatWon(settlement.disposalCost)} danger={settlement.disposalCost > 0} />
            <LedgerItem label={TEXT.operationExpense} value={formatWon(settlement.operationExpense)} danger={settlement.operationExpense > 0} />
            <LedgerItem label={TEXT.debtService} value={formatWon(settlement.debtService)} danger={settlement.debtService > 0} />
            <LedgerItem label={TEXT.capitalChange} value={formatWon(capitalChange)} danger={capitalChange < 0} />
          </div>

          <SettlementCharts settlement={settlement} timeline={gameState.timeline} floor={gameState.floor} />

          <div className="cr2-ledger-note-stack">
            <p className="cr2-ledger-note">{settlement.operationNote}</p>
            {settlement.internalOutcome ? (
              <p className="cr2-ledger-note">
                {settlement.internalOutcome.label}: {settlement.internalOutcome.description}
              </p>
            ) : null}
          </div>
        </section>

        <aside className="cr2-result-report-panel">
          <header className="cr2-settlement-result-head">
            <p className="cr2-kicker">FLOOR {gameState.floor} REPORT</p>
            <h2 className={result.profit >= 0 ? 'cr2-profit-text' : 'cr2-loss-text'}>
              {formatWon(result.profit)}
            </h2>
          </header>

          <div className="cr2-result-grid cr2-result-grid--compact">
            <LedgerItem label={TEXT.capitalChange} value={formatWon(result.capitalChange)} danger={result.capitalChange < 0} compact />
            <LedgerItem
              label={TEXT.healthChange}
              value={result.healthDelta > 0 ? `+${result.healthDelta}` : result.healthDelta}
              danger={result.healthDelta < 0}
              wide
            />
            <LedgerItem label={TEXT.momentum} value={result.momentumScore} danger={result.momentumScore < 0} compact />
            <LedgerItem label={TEXT.nextReward} value={getRewardStatus(gameState.floor)} compact />
          </div>

          <AdvisorReport report={report} advisor={advisor} advisorId={gameState.selectedAdvisorId} />

          <p className="cr2-hint-line">{result.hint}</p>
          <button className="cr2-primary-button cr2-primary-button--large cr2-settlement-next" type="button" onClick={continueFromResult}>
            {getNextStepLabel(result, gameState.floor)}
          </button>
        </aside>
      </section>
    </main>
  );
}

function SettlementCharts({ settlement, timeline, floor }) {
  const shareItems = buildShareItems(settlement.demandSplit);
  const moneyItems = buildMoneyItems(timeline, settlement, floor);

  return (
    <section className="cr2-settlement-charts" aria-label={TEXT.graphs}>
      <article className="cr2-share-chart-panel">
        <header>
          <span>{TEXT.shareGraph}</span>
          <strong>{Math.round((shareItems[0]?.share ?? 0) * 100)}%</strong>
        </header>
        <div className="cr2-share-chart-wrap">
          <div className="cr2-share-pie" style={{ '--cr2-share-pie': buildPieGradient(shareItems) }} />
          <div className="cr2-share-legend">
            {shareItems.map((item) => (
              <span key={item.id}>
                <i style={{ backgroundColor: item.color }} />
                {item.label} {Math.round(item.share * 100)}%
              </span>
            ))}
          </div>
        </div>
      </article>

      <article className="cr2-money-chart-panel">
        <header>
          <span>{TEXT.moneyGraph}</span>
          <strong>{moneyItems.at(-1)?.label ?? '-'}</strong>
        </header>
        <div className="cr2-money-chart">
          {moneyItems.map((item) => (
            <div className="cr2-money-bar-group" key={item.label}>
              <div className="cr2-money-bars">
                <span
                  className="cr2-money-bar cr2-money-bar--revenue"
                  style={{ height: `${item.revenueHeight}%` }}
                  title={`${TEXT.revenueShort} ${formatWon(item.revenue)}`}
                />
                <span
                  className={item.profit < 0 ? 'cr2-money-bar cr2-money-bar--profit cr2-money-bar--loss' : 'cr2-money-bar cr2-money-bar--profit'}
                  style={{ height: `${item.profitHeight}%` }}
                  title={`${TEXT.profitShort} ${formatWon(item.profit)}`}
                />
              </div>
              <small>{item.label}</small>
            </div>
          ))}
        </div>
        <div className="cr2-chart-key">
          <span><i className="cr2-key-revenue" />{TEXT.revenueShort}</span>
          <span><i className="cr2-key-profit" />{TEXT.profitShort}</span>
        </div>
      </article>
    </section>
  );
}

function buildShareItems(participants) {
  return participants
    .filter((participant) => participant.marketShare > 0)
    .map((participant, index) => Object.freeze({
      id: participant.id,
      label: participant.id === 'player' ? '내 회사' : participant.company ?? participant.name,
      share: participant.marketShare,
      color: SHARE_COLORS[index % SHARE_COLORS.length],
    }));
}

function buildPieGradient(items) {
  let cursor = 0;
  const segments = items.map((item) => {
    const start = cursor;
    cursor += item.share * 100;
    return `${item.color} ${start}% ${cursor}%`;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

function buildMoneyItems(timeline, settlement, floor) {
  const source = [
    ...(timeline ?? []),
    Object.freeze({
      floor,
      revenue: settlement.revenue,
      profit: settlement.profit,
    }),
  ];
  const deduped = source.reduce((items, item) => {
    const previousIndex = items.findIndex((entry) => entry.floor === item.floor);

    if (previousIndex >= 0) {
      items[previousIndex] = item;
      return items;
    }

    items.push(item);
    return items;
  }, []).slice(-6);
  const maxValue = Math.max(
    1,
    ...deduped.flatMap((item) => [
      Math.abs(Number(item.revenue) || 0),
      Math.abs(Number(item.profit) || 0),
    ]),
  );

  return deduped.map((item) => {
    const revenue = Number(item.revenue) || 0;
    const profit = Number(item.profit) || 0;

    return Object.freeze({
      label: `${item.floor ?? '-'}F`,
      revenue,
      profit,
      revenueHeight: Math.max(8, Math.round((Math.abs(revenue) / maxValue) * 100)),
      profitHeight: Math.max(8, Math.round((Math.abs(profit) / maxValue) * 100)),
    });
  });
}

function LedgerItem({ label, value, danger = false, wide = false, compact = false }) {
  const className = [
    'cr2-ledger-item',
    danger ? 'cr2-ledger-item--danger' : '',
    wide ? 'cr2-ledger-item--wide' : '',
    compact ? 'cr2-ledger-item--compact' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AdvisorReport({ report, advisor, advisorId }) {
  const isAnalyst = advisorId === 'analyst';
  const isGambler = advisorId === 'gambler';

  return (
    <section
      className={`cr2-advisor-report cr2-advisor-report--compact ${isAnalyst ? 'cr2-advisor-report--analyst' : ''} ${isGambler ? 'cr2-advisor-report--gambler' : ''}`}
      style={{ '--cr2-advisor-report-color': advisor.themeColor }}
    >
      <div className="cr2-advisor-report-head">
        <span>{advisor.name}</span>
        <h2>{TEXT.monthlyDecisionReport}</h2>
      </div>
      <div className="cr2-advisor-report-list">
        {report.sections.map((section, index) => (
          <ReportSection
            key={`${section.id}-${index}`}
            section={section}
            showPercentBar={isAnalyst && typeof section.percent === 'number'}
            large={isGambler && index === 0}
          />
        ))}
      </div>
      {report.suggestion ? (
        <div className="cr2-advisor-report-suggestion">
          <span>{REPORT_MARKERS.suggestion}</span>
          <strong>{report.suggestion}</strong>
        </div>
      ) : null}
      {report.warning ? (
        <div className="cr2-advisor-report-warning">
          <span>{REPORT_MARKERS.event}</span>
          <strong>{report.warning}</strong>
        </div>
      ) : null}
    </section>
  );
}

function ReportSection({ section, showPercentBar, large }) {
  const percent = Math.max(0, Math.min(100, Number(section.percent) || 0));

  return (
    <article className={`cr2-report-row cr2-report-row--${section.tone} ${large ? 'cr2-report-row--large' : ''}`}>
      <span className="cr2-report-icon">{REPORT_MARKERS[section.kind] ?? REPORT_MARKERS.choice}</span>
      <div>
        <strong>{section.title}</strong>
        <p>{section.text}</p>
        {showPercentBar ? (
          <span className="cr2-report-percent-bar">
            <i style={{ width: `${percent}%` }} />
          </span>
        ) : null}
      </div>
    </article>
  );
}

function getNextStepLabel(result, floor) {
  if (result.gameOver) {
    return TEXT.finalResult;
  }

  if (floor >= 120) {
    return TEXT.clearConfirm;
  }

  if (floor % 5 === 0) {
    return TEXT.rewardSelect;
  }

  return TEXT.nextFloor;
}

function getRewardStatus(floor) {
  if (floor % 5 === 0) {
    return TEXT.chooseNow;
  }

  return `${5 - (floor % 5)}${TEXT.floorsLater}`;
}
