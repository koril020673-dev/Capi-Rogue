import { useEffect, useMemo, useState } from 'react';
import { getGrade } from '../logic/creditEngine';
import { canExtendLoan, getLoanTypeInfo } from '../logic/loanEngine';
import { useGameStore } from '../store/useGameStore';
import { formatWon } from '../utils/formatMoney';
import warningSfx from '../assets/sfx/sfx_nextfloor.wav';
import '../styles/loan.css';

const TEXT = Object.freeze({
  dueSoon: '만기',
  turnsLater: '턴 후',
  principal: '원금',
  arrived: '대출 만기 도래',
  repayNow: '지금 상환',
  extend: '연장하기',
  later: '나중에 처리',
  extendCondition: '연장 조건',
  currentGrade: '현재 등급',
  gradeShort: '신용등급 부족',
});

export default function LoanMaturityAlert() {
  const loans = useGameStore((state) => state.loans);
  const creditScore = useGameStore((state) => state.creditScore);
  const repayMaturedLoan = useGameStore((state) => state.repayMaturedLoan);
  const extendMaturedLoan = useGameStore((state) => state.extendMaturedLoan);
  const dismissLoanMaturityNotice = useGameStore((state) => state.dismissLoanMaturityNotice);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const urgentLoans = loans.filter((loan) => (loan.remainingTurns ?? 0) <= 3);
  const maturedLoans = loans.filter((loan) => (loan.remainingTurns ?? 0) <= 0);
  const currentGrade = getGrade(creditScore ?? 70);
  const warningAudio = useMemo(() => createAudio(warningSfx), []);

  useEffect(() => {
    if (urgentLoans.some((loan) => loan.remainingTurns === 1)) {
      playAudio(warningAudio);
    }
  }, [urgentLoans.map((loan) => `${loan.id}:${loan.remainingTurns}`).join('|'), warningAudio]);

  useEffect(() => {
    if (!maturedLoans.length) {
      setPopupDismissed(false);
    }
  }, [maturedLoans.length]);

  if (!urgentLoans.length) {
    return null;
  }

  return (
    <>
      <section className="cr2-loan-warning-list" aria-label="대출 만기 경고">
        {urgentLoans.map((loan) => {
          const type = getLoanTypeInfo(loan.type);
          const isFinalTurn = loan.remainingTurns === 1;
          const isMatured = loan.remainingTurns <= 0;

          return (
            <div className={isFinalTurn || isMatured ? 'cr2-loan-warning cr2-blink' : 'cr2-loan-warning'} key={loan.id}>
              <strong>[{type.name}]</strong>
              <span>{isMatured ? TEXT.arrived : `${TEXT.dueSoon} ${loan.remainingTurns}${TEXT.turnsLater}`}</span>
              <span>{TEXT.principal} {formatWon(loan.principal)}</span>
            </div>
          );
        })}
      </section>

      {maturedLoans.length && !popupDismissed ? (
        <section className="cr2-loan-modal-overlay" role="dialog" aria-modal="true" aria-label={TEXT.arrived}>
          <article className="cr2-loan-modal">
            <header>
              <h2>{TEXT.arrived}</h2>
            </header>
            {maturedLoans.map((loan) => {
              const type = getLoanTypeInfo(loan.type);
              const canExtend = canExtendLoan(currentGrade, type.extensionGrade);

              return (
                <div className="cr2-loan-matured-card" key={loan.id}>
                  <strong>[{type.name}] {TEXT.principal} {formatWon(loan.principal)}</strong>
                  <p>{TEXT.extendCondition}: {type.extensionGrade} 이상</p>
                  <p>{TEXT.currentGrade}: {currentGrade}</p>
                  <div className="cr2-loan-actions">
                    <button type="button" onClick={() => repayMaturedLoan(loan.id)}>
                      {TEXT.repayNow}
                    </button>
                    <button disabled={!canExtend} type="button" onClick={() => extendMaturedLoan(loan.id)}>
                      {canExtend ? TEXT.extend : TEXT.gradeShort}
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              className="cr2-loan-later-button"
              type="button"
              onClick={() => {
                setPopupDismissed(true);
                dismissLoanMaturityNotice();
              }}
            >
              {TEXT.later}
            </button>
          </article>
        </section>
      ) : null}
    </>
  );
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
