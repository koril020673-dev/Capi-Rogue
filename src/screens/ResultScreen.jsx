import { useMemo, useState } from 'react';
import StatusBar from '../components/StatusBar';
import {
  DIAGNOSIS_COLORS,
  getDiagnosis,
  getRandomAdvice,
  getRandomDiagnosisMessage,
} from '../constants/diagnosis';
import { getAdvisorById } from '../logic/advisorEngine';
import { generateReport } from '../logic/reportEngine';
import { useGameStore } from '../store/useGameStore';

const CHART_COLORS = ['#00FF41', '#00AA00', '#36D1DC', '#FFB700'];
const VIEW_MODES = Object.freeze({
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
});

const TEXT = Object.freeze({
  marketShare: '\uC810\uC720\uC728',
  revenueProfit: '\uB9E4\uCD9C / \uC21C\uC774\uC775',
  monthly: '\uC6D4\uBCC4',
  quarterly: '\uBD84\uAE30\uBCC4',
  capitalChange: '\uC790\uBCF8 \uBCC0\uD654',
  healthChange: '\uCCB4\uB825 \uBCC0\uD654',
  momentum: '\uBAA8\uBA58\uD140',
  nextReward: '\uB2E4\uC74C \uBCF4\uC0C1',
  finalResult: '\uCD5C\uC885 \uACB0\uACFC \uBCF4\uAE30',
  clearConfirm: '\uD074\uB9AC\uC5B4 \uD655\uC778',
  rewardSelect: '\uBCF4\uC0C1 \uC120\uD0DD\uC73C\uB85C',
  nextFloor: '\uB2E4\uC74C \uCE35\uC73C\uB85C',
  chooseNow: '\uC9C0\uAE08 \uC120\uD0DD',
  floorsLater: '\uCE35 \uD6C4',
  myCompany: '\uB0B4 \uD68C\uC0AC',
  rival: '\uB77C\uC774\uBC8C',
  revenue: '\uB9E4\uCD9C',
  profitTrend: '\uC21C\uC774\uC775 + \uCD94\uC138',
  monthlyDecisionReport: '\uC774\uBC88 \uB2EC \uACB0\uC815 \uBD84\uC11D',
  pieAria: '\uC2DC\uC7A5 \uC810\uC720\uC728 \uC6D0\uD615 \uADF8\uB798\uD504',
  barAria: '\uB9E4\uCD9C \uC21C\uC774\uC775 \uB9C9\uB300 \uADF8\uB798\uD504',
  won: '\uC6D0',
  manWon: '\uB9CC\uC6D0',
  growth: '\uC131\uC7A5 \uC911',
  stable: '\uC548\uC815',
  caution: '\uC8FC\uC758',
  crisis: '\uBE44\uC0C1',
});

export default function ResultScreen() {
  const gameState = useGameStore((state) => state);
  const continueFromResult = useGameStore((state) => state.continueFromResult);
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTHLY);

  const { currentResult: result, currentSettlement: settlement, floor, timeline } = gameState;

  const diagnosis = useMemo(() => getDiagnosis(gameState), [gameState]);
  const diagnosisMessage = useMemo(() => getRandomDiagnosisMessage(diagnosis), [diagnosis]);
  const advice = useMemo(() => getRandomAdvice(diagnosis), [diagnosis]);
  const advisor = getAdvisorById(gameState.selectedAdvisorId);
  const report = useMemo(
    () => generateReport(gameState, gameState.selectedAdvisorId),
    [gameState],
  );

  if (!result) {
    return null;
  }

  const previousProfit = timeline[timeline.length - 2]?.profit ?? 0;
  const profitChangeRate = getChangeRate(result.profit, previousProfit);
  const marketShares = buildMarketShares(settlement);
  const monthlySeries = buildMonthlySeries(timeline, settlement);
  const chartSeries =
    viewMode === VIEW_MODES.MONTHLY ? monthlySeries : buildQuarterlySeries(monthlySeries);
  const trendUp = (chartSeries[chartSeries.length - 1]?.profit ?? 0) >= (chartSeries[0]?.profit ?? 0);

  return (
    <main className="cr2-result-screen">
      <StatusBar />
      <section className="cr2-result-panel cr2-result-panel--wide">
        <header className="cr2-result-header">
          <p className="cr2-kicker">FLOOR {floor} RESULT</p>
          <h1 className={result.profit >= 0 ? 'cr2-profit-text' : 'cr2-loss-text'}>
            {formatWon(result.profit)}
          </h1>
          <span className={profitChangeRate >= 0 ? 'cr2-result-delta--up' : 'cr2-result-delta--down'}>
            {profitChangeRate >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(profitChangeRate)}%
          </span>
        </header>

        <section
          className="cr2-diagnosis-banner"
          style={{ '--cr2-diagnosis-color': DIAGNOSIS_COLORS[diagnosis] ?? '#00AA00' }}
        >
          <strong>{getDiagnosisLabel(diagnosis)}</strong>
          <p>{diagnosisMessage}</p>
          <small>{advice}</small>
        </section>

        <section className="cr2-result-chart-grid">
          <ChartPanel title={TEXT.marketShare}>
            <MarketSharePie data={marketShares} />
          </ChartPanel>

          <ChartPanel
            title={TEXT.revenueProfit}
            action={
              <div className="cr2-segmented cr2-chart-toggle">
                <button
                  className={`cr2-segment ${viewMode === VIEW_MODES.MONTHLY ? 'cr2-segment--active' : ''}`}
                  type="button"
                  onClick={() => setViewMode(VIEW_MODES.MONTHLY)}
                >
                  {TEXT.monthly}
                </button>
                <button
                  className={`cr2-segment ${viewMode === VIEW_MODES.QUARTERLY ? 'cr2-segment--active' : ''}`}
                  type="button"
                  onClick={() => setViewMode(VIEW_MODES.QUARTERLY)}
                >
                  {TEXT.quarterly}
                </button>
              </div>
            }
          >
            <RevenueProfitBars data={chartSeries} trendUp={trendUp} />
          </ChartPanel>
        </section>

        <div className="cr2-result-grid">
          <ResultMetric label={TEXT.capitalChange} value={formatWon(result.capitalChange)} />
          <ResultMetric
            label={TEXT.healthChange}
            value={result.healthDelta > 0 ? `+${result.healthDelta}` : result.healthDelta}
          />
          <ResultMetric label={TEXT.momentum} value={result.momentumScore} />
          <ResultMetric label={TEXT.nextReward} value={getRewardStatus(floor)} />
        </div>

        <AdvisorReport report={report} advisor={advisor} advisorId={gameState.selectedAdvisorId} />

        <p className="cr2-hint-line">{result.hint}</p>
        <button className="cr2-primary-button cr2-primary-button--large" type="button" onClick={continueFromResult}>
          {getNextStepLabel(result, floor)}
        </button>
      </section>

      <style>{RESULT_SCREEN_CSS}</style>
    </main>
  );
}

function ResultMetric({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChartPanel({ title, action, children }) {
  return (
    <article className="cr2-chart-panel">
      <div className="cr2-chart-panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </article>
  );
}

function AdvisorReport({ report, advisor, advisorId }) {
  const isAnalyst = advisorId === 'analyst';
  const isGambler = advisorId === 'gambler';

  return (
    <section
      className={`cr2-advisor-report ${isAnalyst ? 'cr2-advisor-report--analyst' : ''} ${isGambler ? 'cr2-advisor-report--gambler' : ''}`}
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
          <span>{REPORT_ICONS.suggestion}</span>
          <strong>{report.suggestion}</strong>
        </div>
      ) : null}
      {report.warning ? (
        <div className="cr2-advisor-report-warning">
          <span>{REPORT_ICONS.event}</span>
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
      <span className="cr2-report-icon">{REPORT_ICONS[section.kind] ?? REPORT_ICONS.choice}</span>
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

function MarketSharePie({ data }) {
  const radius = 74;
  const center = 88;
  const circumference = 2 * Math.PI * radius;
  const normalizedData = normalizeShares(data);
  let offset = 0;

  return (
    <div className="cr2-pie-layout">
      <svg className="cr2-pie-chart" viewBox="0 0 176 176" role="img" aria-label={TEXT.pieAria}>
        <circle
          className="cr2-pie-track"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(0, 170, 0, 0.18)"
          strokeWidth="24"
        />
        {normalizedData.map((item) => {
          const dash = Math.max(0, item.share) * circumference;
          const segment = (
            <circle
              key={item.id}
              className="cr2-pie-segment"
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="24"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return segment;
        })}
        <text className="cr2-pie-core-text" x={center} y={center - 4}>
          SHARE
        </text>
        <text className="cr2-pie-core-value" x={center} y={center + 18}>
          {Math.round((normalizedData[0]?.share ?? 0) * 100)}%
        </text>
      </svg>
      <div className="cr2-pie-legend">
        {normalizedData.map((item) => (
          <span key={item.id}>
            <i style={{ background: item.color }} />
            {item.name} {Math.round(item.share * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}

const REPORT_ICONS = Object.freeze({
  choice: '✅',
  event: '⚠️',
  down: '📉',
  up: '📈',
  suggestion: '💡',
});

function RevenueProfitBars({ data, trendUp }) {
  const width = 640;
  const height = 260;
  const padding = { top: 24, right: 24, bottom: 42, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.revenue, Math.abs(item.profit)]));
  const groupWidth = chartWidth / Math.max(1, data.length);
  const barWidth = Math.min(28, groupWidth * 0.28);
  const trendPoints = data.map((item, index) => {
    const x = padding.left + groupWidth * index + groupWidth / 2;
    const normalized = Math.max(0, item.profit) / maxValue;
    const y = padding.top + chartHeight - normalized * chartHeight;
    return { x, y };
  });
  const trendColor = trendUp ? '#00FF41' : '#DC143C';

  return (
    <svg className="cr2-bar-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={TEXT.barAria}>
      <rect x="0" y="0" width={width} height={height} fill="rgba(0, 0, 0, 0.34)" />
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1={padding.left}
          y1={padding.top + chartHeight * ratio}
          x2={width - padding.right}
          y2={padding.top + chartHeight * ratio}
          stroke="rgba(0, 170, 0, 0.18)"
          strokeWidth="1"
        />
      ))}
      <line className="cr2-chart-axis" x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#00AA00" strokeWidth="2" />
      <line className="cr2-chart-axis" x1={padding.left} y1={padding.top + chartHeight} x2={width - padding.right} y2={padding.top + chartHeight} stroke="#00AA00" strokeWidth="2" />
      {data.map((item, index) => {
        const baseX = padding.left + groupWidth * index + groupWidth / 2;
        const revenueHeight = getVisibleBarHeight(item.revenue, maxValue, chartHeight);
        const profitHeight = getVisibleBarHeight(Math.max(0, item.profit), maxValue, chartHeight);
        const negativeProfit = item.profit < 0;

        return (
          <g key={`${item.label}-${index}`}>
            <rect
              className="cr2-bar-revenue"
              x={baseX - barWidth - 3}
              y={padding.top + chartHeight - revenueHeight}
              width={barWidth}
              height={revenueHeight}
              fill="#00AA00"
            />
            <rect
              className={negativeProfit ? 'cr2-bar-profit cr2-bar-profit--loss' : 'cr2-bar-profit'}
              x={baseX + 3}
              y={negativeProfit ? padding.top + chartHeight - 2 : padding.top + chartHeight - profitHeight}
              width={barWidth}
              height={negativeProfit ? 8 : profitHeight}
              fill={negativeProfit ? '#DC143C' : '#00FF41'}
            />
            <text className="cr2-chart-label" x={baseX} y={height - 14}>
              {item.label}
            </text>
          </g>
        );
      })}
      <polyline
        className={trendUp ? 'cr2-trend-line cr2-trend-line--up' : 'cr2-trend-line cr2-trend-line--down'}
        points={trendPoints.map((point) => `${point.x},${point.y}`).join(' ')}
        stroke={trendColor}
        strokeWidth="3"
        fill="none"
      />
      {trendPoints.map((point, index) => (
        <circle key={`trend-${index}`} cx={point.x} cy={point.y} r="4" fill={trendColor} />
      ))}
      <g className="cr2-chart-legend">
        <text x={padding.left} y={16}>{TEXT.revenue}</text>
        <text x={padding.left + 72} y={16}>{TEXT.profitTrend}</text>
      </g>
    </svg>
  );
}

function buildMarketShares(settlement) {
  const participants = settlement?.demandSplit?.length
    ? settlement.demandSplit
    : [{ id: 'player', name: TEXT.myCompany, marketShare: 1, demand: 1 }];
  const totalDemand = participants.reduce((sum, item) => sum + (item.demand ?? 0), 0) || 1;

  return participants.slice(0, 4).map((item, index) => ({
    id: item.id ?? `participant-${index}`,
    name: item.id === 'player' ? TEXT.myCompany : item.name ?? `${TEXT.rival} ${index}`,
    share: item.marketShare ?? (item.demand ?? 0) / totalDemand,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
  }));
}

function normalizeShares(data) {
  const totalShare = data.reduce((sum, item) => sum + Math.max(0, item.share), 0);

  if (totalShare <= 0) {
    return [{ id: 'empty', name: TEXT.myCompany, share: 1, color: CHART_COLORS[0] }];
  }

  return data.map((item) => ({
    ...item,
    share: Math.max(0, item.share) / totalShare,
  }));
}

function getVisibleBarHeight(value, maxValue, chartHeight) {
  if (value <= 0) {
    return 0;
  }

  return Math.max(6, (value / maxValue) * chartHeight);
}

function buildMonthlySeries(timeline, settlement) {
  const rows = timeline.slice(-6).map((item) => ({
    label: `${item.floor}F`,
    profit: item.profit ?? 0,
    revenue: Math.max(item.profit ?? 0, 0),
  }));

  if (rows.length > 0 && settlement) {
    rows[rows.length - 1] = {
      ...rows[rows.length - 1],
      revenue: settlement.revenue ?? rows[rows.length - 1].revenue,
      profit: settlement.profit ?? rows[rows.length - 1].profit,
    };
  }

  return rows.length ? rows : [{ label: '1F', revenue: settlement?.revenue ?? 0, profit: settlement?.profit ?? 0 }];
}

function buildQuarterlySeries(monthlySeries) {
  const padded = [...monthlySeries];

  while (padded.length < 12) {
    padded.unshift({ label: '-', revenue: 0, profit: 0 });
  }

  return [0, 1, 2, 3].map((quarter) => {
    const chunk = padded.slice(quarter * 3, quarter * 3 + 3);
    return {
      label: `Q${quarter + 1}`,
      revenue: chunk.reduce((sum, item) => sum + item.revenue, 0),
      profit: chunk.reduce((sum, item) => sum + item.profit, 0),
    };
  });
}

function getChangeRate(current, previous) {
  if (!previous) {
    return current >= 0 ? 100 : -100;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function getDiagnosisLabel(status) {
  const labels = {
    GROWTH: TEXT.growth,
    STABLE: TEXT.stable,
    CAUTION: TEXT.caution,
    CRISIS: TEXT.crisis,
  };

  return labels[status] ?? labels.STABLE;
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

function formatWon(value) {
  const amount = Math.round(Number(value) || 0);
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  const absolute = Math.abs(amount);

  if (absolute >= 10000) {
    return `${sign}${Math.round(absolute / 10000).toLocaleString()}${TEXT.manWon}`;
  }

  return `${sign}${absolute.toLocaleString()}${TEXT.won}`;
}

const RESULT_SCREEN_CSS = `
.cr2-result-screen {
  display: block;
}

.cr2-result-panel--wide {
  width: min(1040px, 100%);
  margin: 0 auto;
}

.cr2-result-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 18px;
  align-items: end;
}

.cr2-result-header h1 {
  margin-bottom: 4px;
}

.cr2-result-delta--up,
.cr2-result-delta--down {
  align-self: center;
  font-size: 13px;
  line-height: 1.6;
}

.cr2-result-delta--up {
  color: #00FF41;
}

.cr2-result-delta--down {
  color: #DC143C;
}

.cr2-diagnosis-banner {
  display: grid;
  gap: 10px;
  border: 2px solid var(--cr2-diagnosis-color);
  border-radius: 6px;
  margin: 20px 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.64);
  box-shadow: inset 0 0 0 2px rgba(0, 255, 65, 0.06);
}

.cr2-diagnosis-banner strong {
  color: var(--cr2-diagnosis-color);
  font-size: 16px;
  line-height: 1.5;
}

.cr2-diagnosis-banner p,
.cr2-diagnosis-banner small {
  margin: 0;
  font-size: 10px;
  line-height: 1.8;
  word-break: keep-all;
}

.cr2-diagnosis-banner small {
  color: var(--cr2-muted);
}

.cr2-result-chart-grid {
  display: grid;
  grid-template-columns: minmax(240px, 0.82fr) minmax(0, 1.18fr);
  gap: 16px;
  margin: 18px 0;
}

.cr2-chart-panel {
  display: grid;
  gap: 12px;
  min-width: 0;
  min-height: 300px;
  border: 1px solid rgba(0, 170, 0, 0.58);
  border-radius: 6px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.5);
}

.cr2-chart-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cr2-chart-panel h2 {
  margin: 0;
  color: #00FF41;
  font-size: 13px;
  line-height: 1.5;
}

.cr2-chart-toggle {
  width: min(220px, 100%);
}

.cr2-chart-toggle .cr2-segment {
  min-height: 34px;
  padding: 7px 8px;
  font-size: 9px;
}

.cr2-pie-layout {
  display: grid;
  grid-template-columns: minmax(150px, 176px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.cr2-pie-chart {
  width: 100%;
  max-width: 176px;
  min-height: 176px;
  aspect-ratio: 1;
}

.cr2-pie-track,
.cr2-pie-segment {
  fill: none;
  stroke-width: 24;
}

.cr2-pie-track {
  stroke: rgba(0, 170, 0, 0.16);
}

.cr2-pie-segment {
  transform: rotate(-90deg);
  transform-origin: 88px 88px;
}

.cr2-pie-core-text,
.cr2-pie-core-value,
.cr2-chart-label,
.cr2-chart-legend {
  fill: #00AA00;
  font-family: 'Press Start 2P', monospace;
  text-anchor: middle;
}

.cr2-pie-core-text {
  font-size: 8px;
}

.cr2-pie-core-value {
  fill: #00FF41;
  font-size: 14px;
}

.cr2-pie-legend {
  display: grid;
  gap: 9px;
  min-width: 0;
}

.cr2-pie-legend span {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 9px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.cr2-pie-legend i {
  flex: 0 0 10px;
  width: 10px;
  height: 10px;
}

.cr2-bar-chart {
  width: 100%;
  min-height: 260px;
  display: block;
  border: 1px solid rgba(0, 170, 0, 0.18);
}

.cr2-chart-axis {
  stroke: rgba(0, 170, 0, 0.72);
  stroke-width: 2;
}

.cr2-bar-revenue {
  fill: #00AA00;
}

.cr2-bar-profit {
  fill: #00FF41;
}

.cr2-bar-profit--loss {
  fill: #DC143C;
}

.cr2-chart-label {
  font-size: 8px;
}

.cr2-trend-line {
  fill: none;
  stroke-width: 3;
}

.cr2-trend-line--up {
  stroke: #00FF41;
}

.cr2-trend-line--down {
  stroke: #DC143C;
}

.cr2-chart-legend {
  font-size: 8px;
  text-anchor: start;
}

.cr2-advisor-report {
  display: grid;
  gap: 14px;
  border: 2px solid var(--cr2-advisor-report-color);
  border-radius: 6px;
  margin: 18px 0;
  padding: 16px;
  background: #0A0A0A;
  box-shadow: inset 0 0 0 2px rgba(0, 255, 65, 0.04);
}

.cr2-advisor-report-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.cr2-advisor-report-head span {
  color: var(--cr2-advisor-report-color);
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  line-height: 1.6;
}

.cr2-advisor-report-head h2 {
  margin: 0;
  color: #00FF41;
  font-size: 15px;
  line-height: 1.5;
}

.cr2-advisor-report-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.cr2-report-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  border: 1px solid rgba(0, 170, 0, 0.5);
  border-radius: 6px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.42);
}

.cr2-report-icon {
  font-size: 18px;
  line-height: 1.4;
}

.cr2-report-row strong,
.cr2-report-row p {
  margin: 0;
  line-height: 1.7;
  word-break: keep-all;
}

.cr2-report-row strong {
  color: var(--cr2-advisor-report-color);
  font-size: 11px;
}

.cr2-report-row p {
  color: var(--cr2-text);
  font-size: 10px;
}

.cr2-report-row--positive p {
  color: #00FF41;
}

.cr2-report-row--negative p {
  color: #DC143C;
}

.cr2-report-row--warning p {
  color: #FFD700;
}

.cr2-report-row--large {
  grid-column: 1 / -1;
}

.cr2-report-row--large p {
  font-size: 14px;
}

.cr2-report-percent-bar {
  display: block;
  height: 8px;
  border: 1px solid rgba(0, 170, 0, 0.58);
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.72);
}

.cr2-report-percent-bar i {
  display: block;
  height: 100%;
  background: var(--cr2-advisor-report-color);
}

.cr2-advisor-report-suggestion,
.cr2-advisor-report-warning {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  border-top: 1px solid rgba(0, 170, 0, 0.38);
  padding-top: 12px;
  font-size: 11px;
  line-height: 1.8;
}

.cr2-advisor-report-suggestion strong {
  color: #00FF41;
}

.cr2-advisor-report-warning strong {
  color: #DC143C;
}

@media (max-width: 860px) {
  .cr2-result-chart-grid,
  .cr2-pie-layout,
  .cr2-advisor-report-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .cr2-result-header {
    grid-template-columns: 1fr;
  }

  .cr2-chart-panel-head {
    align-items: stretch;
    flex-direction: column;
  }
}
`;
