import StatusBar from '../components/StatusBar';
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';

export default function SettlementScreen() {
  const settlement = useGameStore((state) => state.currentSettlement);
  const showResult = useGameStore((state) => state.showResult);
  const playerShare =
    settlement?.demandSplit.find((participant) => participant.id === 'player')?.marketShare ?? 0;
  const capitalChange = settlement ? settlement.capitalAfter - settlement.capitalBefore : 0;

  if (!settlement) {
    return null;
  }

  return (
    <main className="cr2-settlement-screen">
      <StatusBar />
      <section className="cr2-ledger-panel">
        <p className="cr2-kicker">MONTHLY SETTLEMENT</p>
        <h1>월말 정산</h1>
        <div className={settlement.profit >= 0 ? 'cr2-ledger-highlight' : 'cr2-ledger-highlight cr2-ledger-highlight--loss'}>
          <span>이번 달 최종 손익</span>
          <strong>{formatWon(settlement.profit)}</strong>
        </div>
        <div className="cr2-ledger-grid">
          <LedgerItem label="시장점유율" value={`${Math.round(playerShare * 100)}%`} />
          <LedgerItem label="총 수요" value={settlement.totalDemand.toLocaleString()} />
          <LedgerItem label="생산량" value={settlement.plannedProduction.toLocaleString()} />
          <LedgerItem label="실제 판매" value={settlement.unitsSold.toLocaleString()} />
          <LedgerItem label="재고 처분" value={settlement.unsoldUnits.toLocaleString()} />
          <LedgerItem label="매출" value={formatWon(settlement.revenue)} />
          <LedgerItem label="생산비" value={formatWon(settlement.productionCost)} />
          <LedgerItem label="재고 비용" value={formatWon(settlement.disposalCost)} />
          <LedgerItem label="운영비" value={formatWon(settlement.operationExpense)} />
          <LedgerItem label="부채비용" value={formatWon(settlement.debtService)} />
          <LedgerItem label="자본 변화" value={formatWon(capitalChange)} danger={capitalChange < 0} />
        </div>
        <p className="cr2-ledger-note">{settlement.operationNote}</p>
        {settlement.internalOutcome ? (
          <p className="cr2-ledger-note">
            {settlement.internalOutcome.label}: {settlement.internalOutcome.description}
          </p>
        ) : null}
        <button className="cr2-primary-button" type="button" onClick={showResult}>
          결과 확인
        </button>
      </section>
    </main>
  );
}

function LedgerItem({ label, value, danger = false }) {
  return (
    <div className={danger ? 'cr2-ledger-item cr2-ledger-item--danger' : 'cr2-ledger-item'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
