import { getGrade, getInterestRate, getLoanLimit } from './creditEngine';

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

export function takeLoan(loanType, gameState = {}, requestedPrincipal = null) {
  const creditScore = gameState.creditScore ?? 70;
  const grade = getGrade(creditScore);

  if (grade === 'D') {
    return Object.freeze({ success: false, error: '신용등급 D - 대출 불가합니다.' });
  }

  const loanTypeInfo = LOAN_TYPES.find((loan) => loan.id === loanType);

  if (!loanTypeInfo) {
    return Object.freeze({ success: false, error: '대출 종류 오류' });
  }

  const capital = gameState.player?.capital ?? gameState.capital ?? 0;
  const debt = gameState.player?.debt ?? gameState.debt ?? 0;
  const loanLimit = getLoanLimit(creditScore, capital);
  const requestedAmount = requestedPrincipal === null
    ? loanLimit
    : Math.max(0, Math.round(Number(requestedPrincipal) || 0));
  const principal = Math.min(loanLimit, requestedAmount);

  if (principal <= 0) {
    return Object.freeze({ success: false, error: '대출 한도가 없습니다.' });
  }

  const activeEffects = gameState.activeEffects ?? gameState.marketEffects ?? [];
  const advisorId = gameState.advisorId ?? gameState.selectedAdvisorId ?? null;
  const interestRate = getInterestRate(creditScore, activeEffects, advisorId);

  return Object.freeze({
    success: true,
    capitalIncrease: principal,
    newCapital: capital + principal,
    newLoan: Object.freeze({
      id: `loan_${Date.now()}`,
      type: loanTypeInfo.id,
      principal,
      interestRate,
      remainingTurns: loanTypeInfo.duration,
    }),
    newDebt: debt + principal,
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
  const maturedUnresolvedCount = loans.filter((loan) => (loan.remainingTurns ?? 0) <= 0).length;

  return Object.freeze({
    interestAmount: totalInterest,
    interestDue: totalInterest,
    isLate: overdue,
    overdue,
    interestPaid: !overdue,
    creditScoreDelta: (overdue ? -4 : 0) + (maturedUnresolvedCount > 0 ? -4 : 0),
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

export function tickLoanDurations(loans = []) {
  return tickLoans(loans);
}

export function getMaturedLoans(loans = []) {
  return Object.freeze(loans.filter((loan) => (loan.remainingTurns ?? 0) <= 0));
}

export function getUpcomingMaturityLoans(loans = []) {
  return Object.freeze(loans.filter((loan) => (loan.remainingTurns ?? 0) > 0 && (loan.remainingTurns ?? 0) <= 3));
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
  if (typeof gameState === 'string') {
    return repayLoanResult(gameState, loanId);
  }

  const loan = (gameState.loans ?? []).find((item) => item.id === loanId);

  if (!loan) {
    return gameState;
  }

  const capital = gameState.player?.capital ?? gameState.capital ?? 0;

  if (loan.principal > capital) {
    return gameState;
  }

  return Object.freeze({
    ...gameState,
    creditScore: Math.min(100, (gameState.creditScore ?? 70) + 5),
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
  if (typeof gameState === 'string') {
    return extendLoanResult(gameState, loanId);
  }

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

export function forceRepayMaturedLoans(gameState) {
  const matured = getMaturedLoans(gameState.loans ?? []);

  if (!matured.length) {
    return Object.freeze({ changed: false });
  }

  let capital = gameState.capital ?? gameState.player?.capital ?? 0;
  let debt = gameState.debt ?? gameState.player?.debt ?? 0;
  let creditDelta = 0;
  const remaining = [];

  (gameState.loans ?? []).forEach((loan) => {
    if ((loan.remainingTurns ?? 0) <= 0) {
      if (capital >= loan.principal) {
        capital -= loan.principal;
        debt -= loan.principal;
      } else {
        creditDelta -= 20;
        remaining.push(loan);
      }
    } else {
      remaining.push(loan);
    }
  });

  return Object.freeze({
    changed: true,
    newCapital: capital,
    newDebt: Math.max(0, debt),
    newLoans: Object.freeze(remaining),
    creditDelta,
  });
}

function repayLoanResult(loanId, gameState = {}) {
  const loan = (gameState.loans ?? []).find((item) => item.id === loanId);

  if (!loan) {
    return Object.freeze({ success: false, error: '대출을 찾을 수 없습니다.' });
  }

  const capital = gameState.capital ?? gameState.player?.capital ?? 0;

  if (capital < loan.principal) {
    return Object.freeze({ success: false, error: '자본이 부족합니다.' });
  }

  return Object.freeze({
    success: true,
    capitalDecrease: loan.principal,
    newCapital: capital - loan.principal,
    newLoans: Object.freeze((gameState.loans ?? []).filter((item) => item.id !== loanId)),
    newDebt: Math.max(0, (gameState.debt ?? gameState.player?.debt ?? 0) - loan.principal),
    loanRepaid: true,
  });
}

function extendLoanResult(loanId, gameState = {}) {
  const loan = (gameState.loans ?? []).find((item) => item.id === loanId);

  if (!loan) {
    return Object.freeze({ success: false, error: '대출을 찾을 수 없습니다.' });
  }

  const loanType = getLoanType(loan.type);
  const grade = getGrade(gameState.creditScore ?? 70);

  if (!canExtendLoan(grade, loanType.extensionGrade)) {
    return Object.freeze({
      success: false,
      error: `연장 조건 미충족 - ${loanType.extensionGrade}등급 이상 필요`,
    });
  }

  return Object.freeze({
    success: true,
    newLoans: Object.freeze((gameState.loans ?? []).map((item) =>
      item.id === loanId ? Object.freeze({ ...item, remainingTurns: loanType.duration }) : item,
    )),
  });
}

export function canExtendLoan(currentGrade, requiredGrade) {
  return (GRADE_ORDER[currentGrade] ?? 0) >= (GRADE_ORDER[requiredGrade] ?? 0);
}

export function getLoanTypeInfo(typeId) {
  return getLoanType(typeId);
}

function getLoanType(typeId) {
  return LOAN_TYPES.find((type) => type.id === typeId) ?? LOAN_TYPES[1];
}
