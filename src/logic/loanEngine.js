import { getGrade, getInterestRate } from './creditEngine';

export const LOAN_TYPES = Object.freeze([
  Object.freeze({ id: 'short', name: '단기 대출', duration: 10, extensionGrade: 'B' }),
  Object.freeze({ id: 'normal', name: '일반 대출', duration: 30, extensionGrade: 'B' }),
  Object.freeze({ id: 'long', name: '장기 대출', duration: 60, extensionGrade: 'A' }),
]);

const GRADE_ORDER = Object.freeze({ A: 4, B: 3, C: 2, D: 1 });

export function createLoan(typeId, principal, creditScore, activeEffects = [], id = null) {
  const type = getLoanType(typeId);

  return Object.freeze({
    id: id ?? `loan-${type.id}`,
    type: type.id,
    principal: Math.max(0, Math.round(Number(principal) || 0)),
    interestRate: getInterestRate(creditScore, activeEffects),
    remainingTurns: type.duration,
  });
}

export function processInterest(gameState) {
  const loans = gameState.loans ?? [];
  const totalInterest = loans.reduce(
    (sum, loan) => sum + Math.round((loan.principal * (loan.interestRate ?? 0.065)) / 12),
    0,
  );
  const capital = gameState.player?.capital ?? gameState.capital ?? 0;
  const nextCapital = capital - totalInterest;
  const overdue = totalInterest > capital;

  return Object.freeze({
    interestDue: totalInterest,
    overdue,
    creditScoreDelta: overdue ? -4 : 0,
    capitalAfter: nextCapital,
    player: Object.freeze({
      ...gameState.player,
      capital: nextCapital,
    }),
  });
}

export function tickLoans(loans = []) {
  return Object.freeze(
    loans.map((loan) =>
      Object.freeze({
        ...loan,
        remainingTurns: Math.max(0, (loan.remainingTurns ?? 0) - 1),
      }),
    ),
  );
}

export function checkLoanMaturity(gameState) {
  const maturedLoans = (gameState.loans ?? []).filter((loan) => (loan.remainingTurns ?? 0) <= 0);

  if (!maturedLoans.length) {
    return null;
  }

  return Object.freeze({
    message: '대출 만기가 도래했습니다. 원금을 상환하거나 연장하세요.',
    loans: Object.freeze(maturedLoans),
  });
}

export function repayLoan(gameState, loanId) {
  const loan = (gameState.loans ?? []).find((item) => item.id === loanId);

  if (!loan) {
    return gameState;
  }

  const capital = gameState.player?.capital ?? gameState.capital ?? 0;

  return Object.freeze({
    ...gameState,
    capital: gameState.player ? gameState.capital : capital - loan.principal,
    player: gameState.player
      ? Object.freeze({
          ...gameState.player,
          capital: capital - loan.principal,
        })
      : gameState.player,
    loans: Object.freeze((gameState.loans ?? []).filter((item) => item.id !== loanId)),
  });
}

export function extendLoan(gameState, loanId) {
  const creditGrade = getGrade(gameState.creditScore ?? 70);

  return Object.freeze({
    ...gameState,
    loans: Object.freeze(
      (gameState.loans ?? []).map((loan) => {
        if (loan.id !== loanId) {
          return loan;
        }

        const type = getLoanType(loan.type);
        const canExtend = canExtendLoan(creditGrade, type.extensionGrade);

        return Object.freeze({
          ...loan,
          remainingTurns: canExtend ? type.duration : loan.remainingTurns,
          extensionDenied: !canExtend,
        });
      }),
    ),
  });
}

export function canExtendLoan(currentGrade, requiredGrade) {
  return (GRADE_ORDER[currentGrade] ?? 0) >= (GRADE_ORDER[requiredGrade] ?? 0);
}

function getLoanType(typeId) {
  return LOAN_TYPES.find((type) => type.id === typeId) ?? LOAN_TYPES[1];
}
