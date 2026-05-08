import { getGrade } from './creditEngine';

export const RECORD_RESULT_TYPES = Object.freeze({
  CLEAR: 'CLEAR',
  BANKRUPT: 'BANKRUPT',
});

export const CLEAR_GRADE_COLORS = Object.freeze({
  S: '#FFD700',
  A: '#00FF41',
  B: '#00AA00',
  C: '#DC143C',
});

const LABELS = Object.freeze({
  playtime: '\uD50C\uB808\uC774\uD0C0\uC784',
  clearFloor: '\uB3C4\uB2EC \uCE35\uC218',
  advisor: '\uC5B4\uB4DC\uBC14\uC774\uC800',
  finalCapital: '\uCD5C\uC885 \uC790\uBCF8',
  creditGrade: '\uCD5C\uC885 \uC2E0\uC6A9\uB4F1\uAE09',
  finalHealth: '\uCD5C\uC885 \uCCB4\uB825',
  profitTurns: '\uCD1D \uD751\uC790 \uD134',
  lossTurns: '\uCD1D \uC801\uC790 \uD134',
  maxShare: '\uCD5C\uACE0 \uC810\uC720\uC728',
  bankruptcyCount: '\uD30C\uC0B0 \uC704\uAE30',
  externalEvents: '\uC678\uBD80 \uC774\uBCA4\uD2B8',
  eventSuccessRate: '\uC774\uBCA4\uD2B8 \uC131\uACF5\uB960',
  rivalDominated: '\uB77C\uC774\uBC8C \uC555\uB3C4',
  turn: '\uD134',
  count: '\uAC1C',
  won: '\uC6D0',
});

export function buildRunRecord(state = {}, resultType = RECORD_RESULT_TYPES.BANKRUPT) {
  const timeline = state.timeline ?? [];
  const player = state.player ?? {};
  const settlement = state.currentSettlement ?? {};
  const eventOutcomes = timeline.filter((turn) => turn.internalOutcome);
  const eventSuccesses = eventOutcomes.filter((turn) => turn.internalOutcome?.success);
  const profitTurns = timeline.filter((turn) => (turn.profit ?? 0) > 0).length;
  const lossTurns = timeline.filter((turn) => (turn.profit ?? 0) < 0).length;
  const maxShare = Math.max(0, ...timeline.map((turn) => turn.marketShare ?? 0));
  const finalCapital = player.capital ?? settlement.capitalAfter ?? 0;
  const creditScore = state.creditScore ?? 70;
  const clearGrade = resultType === RECORD_RESULT_TYPES.CLEAR
    ? getClearGrade(finalCapital, getGrade(creditScore), player.health ?? 0)
    : null;

  return Object.freeze({
    result_type: resultType,
    clear_grade: clearGrade,
    advisor_profile_id: state.selectedAdvisorId ?? state.selectedAdvisor?.id ?? null,
    playtime: state.playtime ?? state.playTimeSeconds ?? Math.max(0, timeline.length * 45),
    clear_floor: state.floor ?? 1,
    advisor_id: state.selectedAdvisorId ?? state.selectedAdvisor?.id ?? null,
    advisor_name: state.selectedAdvisor?.name ?? state.selectedAdvisorId ?? '-',
    final_capital: finalCapital,
    credit_grade: getGrade(creditScore),
    credit_score: creditScore,
    final_health: player.health ?? 0,
    max_health: player.maxHealth ?? 10,
    profit_turns: profitTurns,
    loss_turns: lossTurns,
    max_share: maxShare,
    bankruptcy_count: timeline.filter((turn) => (turn.capitalAfter ?? turn.capital ?? 0) < 0).length,
    external_events: timeline.filter((turn) => turn.eventTitle || turn.externalEvent).length,
    event_success_rate: eventOutcomes.length > 0 ? eventSuccesses.length / eventOutcomes.length : 0,
    rival_dominated: timeline.filter((turn) => (turn.marketShare ?? 0) >= 0.5).length,
    met_rivals: state.metRivals ?? [],
    timeline: timeline.slice(-12),
    created_at: new Date().toISOString(),
  });
}

export function normalizeRecord(record = {}) {
  return Object.freeze({
    ...record,
    result_type: record.result_type ?? record.resultType ?? RECORD_RESULT_TYPES.CLEAR,
    clear_grade: record.clear_grade ?? record.clearGrade ?? null,
    advisor_profile_id: record.advisor_profile_id ?? record.advisorProfileId ?? record.advisor_id ?? null,
    playtime: record.playtime ?? record.playTimeSeconds ?? 0,
    clear_floor: record.clear_floor ?? record.clearFloor ?? 0,
    advisor_name: record.advisor_name ?? record.advisorName ?? record.advisor_id ?? '-',
    final_capital: record.final_capital ?? record.finalCapital ?? 0,
    credit_grade: record.credit_grade ?? record.finalCreditGrade ?? 'B',
    credit_score: record.credit_score ?? record.creditScore ?? null,
    final_health: record.final_health ?? record.finalHealth ?? 0,
    max_health: record.max_health ?? record.maxHealth ?? 10,
    profit_turns: record.profit_turns ?? record.profitTurns ?? 0,
    loss_turns: record.loss_turns ?? record.lossTurns ?? 0,
    max_share: record.max_share ?? record.bestMarketShare ?? 0,
    bankruptcy_count: record.bankruptcy_count ?? record.bankruptcyCrisisCount ?? 0,
    external_events: record.external_events ?? record.externalEventCount ?? 0,
    event_success_rate: record.event_success_rate ?? record.eventChoiceSuccessRate ?? 0,
    rival_dominated: record.rival_dominated ?? record.rivalsDefeated ?? 0,
    met_rivals: record.met_rivals ?? record.metRivals ?? [],
    timeline: record.timeline ?? [],
  });
}

export function getClearGrade(finalCapital, creditGrade, health) {
  if (finalCapital >= 50000000 && creditGrade === 'A' && health >= 6) {
    return 'S';
  }

  if (finalCapital >= 20000000 && ['A', 'B'].includes(creditGrade)) {
    return 'A';
  }

  if (finalCapital >= 5000000) {
    return 'B';
  }

  return 'C';
}

export function getRecordRows(record) {
  const normalized = normalizeRecord(record);
  const credit = normalized.credit_score === null
    ? normalized.credit_grade
    : `${normalized.credit_grade} (${normalized.credit_score})`;

  return Object.freeze([
    [LABELS.playtime, formatTime(normalized.playtime)],
    [LABELS.clearFloor, `${normalized.clear_floor}${LABELS.turn}`],
    [LABELS.advisor, normalized.advisor_name],
    [LABELS.finalCapital, formatNumberWon(normalized.final_capital)],
    [LABELS.creditGrade, credit],
    [LABELS.finalHealth, `${normalized.final_health} / ${normalized.max_health}`],
    [LABELS.profitTurns, `${normalized.profit_turns}${LABELS.turn}`],
    [LABELS.lossTurns, `${normalized.loss_turns}${LABELS.turn}`],
    [LABELS.maxShare, `${Math.round(normalized.max_share * 100)}%`],
    [LABELS.bankruptcyCount, `${normalized.bankruptcy_count}${LABELS.turn}`],
    [LABELS.externalEvents, `${normalized.external_events}${LABELS.count}`],
    [LABELS.eventSuccessRate, `${Math.round(normalized.event_success_rate * 100)}%`],
    [LABELS.rivalDominated, `${normalized.rival_dominated}${LABELS.count}`],
  ]);
}

export function getCriticalReview(timeline = []) {
  const worstProfit = [...timeline].sort((a, b) => (a.profit ?? 0) - (b.profit ?? 0))[0] ?? null;
  const worstHealth = [...timeline].sort(
    (a, b) => (a.healthAfter ?? 999) - (b.healthAfter ?? 999),
  )[0] ?? null;

  return Object.freeze({
    worstProfit,
    worstHealth,
    recent: timeline.slice(-5),
  });
}

export function formatTime(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function formatNumberWon(value = 0) {
  return `${Math.round(Number(value) || 0).toLocaleString()}${LABELS.won}`;
}
