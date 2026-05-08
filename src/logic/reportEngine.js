import { ADVISOR_IDS } from '../constants/advisors';
import {
  ANALYST_MESSAGES,
  GAMBLER_MESSAGES,
  GUARDIAN_MESSAGES,
  RAIDER_MESSAGES,
} from '../constants/reportMessages';
import { getSelectedPrice } from './settlementEngine';

export function generateReport(gameState, settlementOrAdvisor = null, advisorId = null) {
  const settlementResult =
    settlementOrAdvisor && typeof settlementOrAdvisor === 'object'
      ? settlementOrAdvisor
      : buildSettlementResultFromState(gameState);
  const selectedAdvisorId =
    typeof settlementOrAdvisor === 'string'
      ? settlementOrAdvisor
      : advisorId ?? gameState.selectedAdvisor?.id ?? gameState.selectedAdvisorId;

  switch (selectedAdvisorId) {
    case ADVISOR_IDS.GUARDIAN:
    case 'guardian':
      return buildGuardianReport(gameState, settlementResult);
    case ADVISOR_IDS.ANALYST:
    case 'analyst':
      return buildAnalystReport(gameState, settlementResult);
    case ADVISOR_IDS.GAMBLER:
    case 'gambler':
      return buildGamblerReport(gameState, settlementResult);
    case ADVISOR_IDS.RAIDER:
    case 'raider':
    default:
      return buildRaiderReport(gameState, settlementResult);
  }
}

function buildRaiderReport(gameState, result) {
  const context = getMarketContext(gameState, result);
  const cheaperThanRivals = context.rivalAveragePrice <= 0 || context.playerPrice < context.rivalAveragePrice;
  const priceGap = context.rivalAveragePrice > 0
    ? Math.round(((context.playerPrice - context.rivalAveragePrice) / context.rivalAveragePrice) * 100)
    : 0;

  return freezeReport({
    sections: [
      createSection(
        context.shareDelta >= 0 ? 'up' : 'down',
        '점유율 변화',
        `${formatPercentPoint(context.shareDelta)}. ${pickStable(
          context.shareDelta >= 0 ? RAIDER_MESSAGES.shareUp : RAIDER_MESSAGES.shareDown,
          gameState.floor,
        )}`,
        context.shareDelta >= 0 ? 'positive' : 'negative',
        Math.min(100, Math.abs(context.shareDelta) * 500),
      ),
      createSection(
        'choice',
        '가격 경쟁력',
        `${cheaperThanRivals ? pickStable(RAIDER_MESSAGES.priceLow, gameState.floor) : pickStable(RAIDER_MESSAGES.priceHigh, gameState.floor)} 라이벌 평균 대비 ${priceGap >= 0 ? '+' : ''}${priceGap}%.`,
        cheaperThanRivals ? 'positive' : 'warning',
      ),
      createSection(
        context.momentum >= 0 ? 'up' : 'down',
        '모멘텀',
        `현재 모멘텀 ${context.momentum >= 0 ? '+' : ''}${context.momentum}`,
        context.momentum >= 0 ? 'positive' : 'negative',
      ),
    ],
    suggestion: cheaperThanRivals
      ? pickStable(RAIDER_MESSAGES.suggestion, gameState.floor + 1)
      : RAIDER_MESSAGES.suggestion[0],
    warning: '',
  });
}

function buildGuardianReport(gameState, result) {
  const debt = getDebt(gameState);
  const capital = Math.max(1, getCapital(gameState, result));
  const debtRatio = debt / capital;
  const debtStatus = debtRatio >= 0.7 ? '위험' : debtRatio >= 0.3 ? '주의' : '안전';
  const debtMessage = debtStatus === '위험'
    ? pickStable(GUARDIAN_MESSAGES.debtDanger, gameState.floor)
    : debtStatus === '주의'
      ? pickStable(GUARDIAN_MESSAGES.debtCaution, gameState.floor)
      : pickStable(GUARDIAN_MESSAGES.debtSafe, gameState.floor);
  const healthChange = (result.healthAfter ?? gameState.player?.health ?? gameState.health ?? 0) -
    (gameState.player?.health ?? gameState.health ?? 0);
  const risks = collectRisks(gameState, result, debtStatus).slice(0, 3);

  return freezeReport({
    sections: [
      createSection(
        healthChange < 0 ? 'down' : 'choice',
        '체력 변화',
        healthChange < 0
          ? pickStable(GUARDIAN_MESSAGES.healthDown, gameState.floor)
          : '이번 달 체력 손실은 확인되지 않았습니다.',
        healthChange < 0 ? 'negative' : 'positive',
      ),
      createSection(
        debtStatus === '안전' ? 'choice' : 'event',
        '부채 위험도',
        `${debtStatus}. ${debtMessage} 부채 비율 ${Math.round(debtRatio * 100)}%.`,
        debtStatus === '안전' ? 'positive' : debtStatus === '주의' ? 'warning' : 'negative',
      ),
      ...risks.map((risk, index) =>
        createSection('event', `다음 달 리스크 ${index + 1}`, risk, 'warning'),
      ),
    ],
    suggestion: risks.some((risk) => risk.includes('대출') || risk.includes('이자'))
      ? GUARDIAN_MESSAGES.suggestion[2]
      : risks.some((risk) => risk.includes('재고') || risk.includes('발주'))
        ? GUARDIAN_MESSAGES.suggestion[0]
        : GUARDIAN_MESSAGES.suggestion[1],
    warning: risks.length ? `지금 가장 위험한 것은 ${risks[0]}` : '',
  });
}

function buildAnalystReport(gameState, result) {
  const context = getMarketContext(gameState, result);
  const causes = analyzeShareChangeCauses(gameState, result, context).slice(0, 3);
  const phaseHint = gameState.nextPhaseHint?.message ?? getPhaseWarning(gameState);
  const rivalHint = generateRivalHint(gameState);

  return freezeReport({
    sections: [
      ...causes.map((cause) =>
        createSection(
          cause.positive ? 'up' : 'down',
          cause.title,
          cause.text,
          cause.positive ? 'positive' : 'negative',
          cause.contribution,
        ),
      ),
      createSection('event', '국면 전환 예고', phaseHint, 'warning'),
      createSection('event', '라이벌 예상 전략', rivalHint, 'warning'),
    ],
    suggestion: generateAnalystSuggestion(gameState, causes[0]),
    warning: causes[0] ? `가장 큰 원인은 ${causes[0].title}입니다.` : '',
  });
}

function buildGamblerReport(gameState, result) {
  const outcome = gameState.currentSettlement?.internalOutcome ?? gameState.lastEventChoice ?? null;
  const hasEvent = Boolean(outcome);
  const category = result.nextEventCategory ?? gameState.currentInternalEvent?.category ?? 'PRODUCTION';

  if (!hasEvent) {
    return freezeReport({
      sections: [
        createSection('event', '다음 이벤트 힌트', GAMBLER_MESSAGES.nextEventHint[category] ?? GAMBLER_MESSAGES.nextEventHint.PRODUCTION, 'warning'),
      ],
      suggestion: pickStable(GAMBLER_MESSAGES.noEvent, gameState.floor),
      warning: '',
    });
  }

  const success = Boolean(outcome.success ?? result.eventSuccess);
  const probability = Math.round(Number(result.eventProb ?? getEventProbability(outcome, gameState)) * 100);
  const resultText = fillTemplate(
    pickStable(success ? GAMBLER_MESSAGES.success : GAMBLER_MESSAGES.failure, gameState.floor),
    { prob: probability },
  );

  return freezeReport({
    sections: [
      createSection(
        'choice',
        '이벤트 선택 결과',
        resultText,
        success ? 'positive' : 'negative',
        probability,
      ),
      createSection('event', '다음 이벤트 힌트', GAMBLER_MESSAGES.nextEventHint[category] ?? GAMBLER_MESSAGES.nextEventHint.PRODUCTION, 'warning'),
    ],
    suggestion: pickStable(GAMBLER_MESSAGES.urge, gameState.floor),
    warning: '',
  });
}

function buildSettlementResultFromState(gameState) {
  const settlement = gameState.currentSettlement ?? {};
  const player = settlement.demandSplit?.find?.((item) => item.id === 'player');

  return Object.freeze({
    shareAfter: player?.marketShare ?? gameState.playerShareHistory?.at?.(-1) ?? 0,
    healthAfter: gameState.player?.health ?? gameState.health,
    netProfit: settlement.profit ?? gameState.currentResult?.profit ?? 0,
    interestAmount: settlement.debtService ?? 0,
    interestLate: settlement.interestOverdue ?? false,
  });
}

function getMarketContext(gameState, result) {
  const settlement = gameState.currentSettlement ?? {};
  const participants = settlement.demandSplit ?? [];
  const player = participants.find((item) => item.id === 'player') ?? {};
  const rivals = participants.filter((item) => item.type === 'rival');
  const previousShare = gameState.playerShareHistory?.at?.(-2) ??
    gameState.timeline?.at?.(-2)?.marketShare ??
    player.marketShare ??
    0;
  const currentShare = result.shareAfter ?? player.marketShare ?? 0;
  const playerPrice = player.price ?? gameState.currentStrategy?.price ??
    getSelectedPrice(gameState.strategy ?? {}, gameState.player?.unitCost ?? gameState.cost ?? 1);
  const rivalAveragePrice = average(
    rivals.map((rival) => rival.price).filter(Boolean),
  ) || calcAvgRivalPrice(gameState) || playerPrice;

  return Object.freeze({
    shareDelta: currentShare - previousShare,
    momentum: gameState.momentum ?? gameState.currentResult?.momentumScore ?? 0,
    playerPrice,
    rivalAveragePrice,
  });
}

function calcAvgRivalPrice(gameState) {
  const rivals = gameState.rivals ?? [];

  if (!rivals.length) {
    return 0;
  }

  return average(rivals.map((rival) => {
    const quality = rival.stats?.quality ?? rival.qualityScore ?? 1;
    const multiplier = rival.strategy?.priceMultiplier ?? rival.strategyPreset?.priceMultiplier ?? 1.5;

    return quality * multiplier * 1000;
  }));
}

function collectRisks(gameState, result, debtStatus) {
  const risks = [];

  if (debtStatus !== '안전') risks.push(GUARDIAN_MESSAGES.risks[0]);
  if ((gameState.loans ?? []).some((loan) => (loan.remainingTurns ?? 99) <= 3)) risks.push('대출 만기가 임박했습니다.');
  if ((gameState.currentSettlement?.unsoldUnits ?? 0) > 0) risks.push(GUARDIAN_MESSAGES.risks[1]);
  if ((gameState.activeEffects ?? gameState.marketEffects ?? []).some((effect) => {
    const effects = effect.effects ?? effect.effect ?? effect;
    return (effects.costMultiplier ?? 1) > 1;
  })) {
    risks.push(GUARDIAN_MESSAGES.risks[3]);
  }
  if ((result.netProfit ?? 0) < 0) risks.push(GUARDIAN_MESSAGES.risks[4]);

  return risks.length ? risks : ['다음 달 수요 변화를 확인하세요.'];
}

function analyzeShareChangeCauses(gameState, result, context) {
  const causes = [];
  const priceDiffRatio = context.rivalAveragePrice > 0
    ? (context.playerPrice - context.rivalAveragePrice) / context.rivalAveragePrice
    : 0;
  const contribution = Math.max(3, Math.abs(Math.round((result.shareAfter ?? 0) * 20)));

  if (priceDiffRatio > 0.1) {
    causes.push({
      title: '판매가 높음',
      positive: false,
      contribution,
      text: fillTemplate(ANALYST_MESSAGES.shareDownReasons[0], { n: contribution }),
    });
  } else if (priceDiffRatio < -0.1) {
    causes.push({
      title: '판매가 낮음',
      positive: true,
      contribution,
      text: fillTemplate(ANALYST_MESSAGES.shareUpReasons[0], { n: contribution }),
    });
  }

  if ((gameState.activeEffects ?? gameState.marketEffects ?? []).some((effect) => {
    const effects = effect.effects ?? effect.effect ?? effect;
    return (effects.demandMultiplier ?? 1) < 1;
  })) {
    causes.push({
      title: '외부 이벤트',
      positive: false,
      contribution: 15,
      text: fillTemplate(ANALYST_MESSAGES.shareDownReasons[2], { n: 15 }),
    });
  }

  if (!causes.length) {
    causes.push({
      title: context.shareDelta >= 0 ? '운영 흐름 개선' : '경쟁 압박',
      positive: context.shareDelta >= 0,
      contribution: Math.max(1, Math.abs(Math.round(context.shareDelta * 100))),
      text: context.shareDelta >= 0
        ? fillTemplate(ANALYST_MESSAGES.shareUpReasons[1], { n: Math.max(1, Math.abs(Math.round(context.shareDelta * 100))) })
        : fillTemplate(ANALYST_MESSAGES.shareDownReasons[3], { n: Math.max(1, Math.abs(Math.round(context.shareDelta * 100))) }),
    });
  }

  return causes.sort((a, b) => b.contribution - a.contribution);
}

function getPhaseWarning(gameState) {
  const phase = gameState.econPhase ?? gameState.phase ?? 'stable';

  if (phase === 'contraction' || phase === 'recession') return ANALYST_MESSAGES.phaseWarning[0];
  if (phase === 'growth' || phase === 'boom') return ANALYST_MESSAGES.phaseWarning[1];
  return ANALYST_MESSAGES.phaseWarning[2];
}

function generateRivalHint(gameState) {
  const rival = gameState.currentSettlement?.demandSplit?.find?.((item) => item.type === 'rival') ??
    (gameState.rivals ?? [])[0];

  if (!rival) {
    return '현재 활성 라이벌 정보가 부족합니다.';
  }

  return fillTemplate(pickStable(ANALYST_MESSAGES.rivalHint, gameState.floor), {
    name: rival.name ?? '라이벌',
  });
}

function generateAnalystSuggestion(gameState, topCause) {
  if (topCause?.title?.includes('판매가')) {
    return fillTemplate(ANALYST_MESSAGES.suggestion[0], { n: 1.5 });
  }

  if (topCause?.title?.includes('외부')) {
    return ANALYST_MESSAGES.suggestion[2];
  }

  return ANALYST_MESSAGES.suggestion[1];
}

function getEventProbability(outcome, gameState) {
  const tier = String(outcome?.tier ?? outcome?.type ?? 'GAMBLE').toUpperCase();
  const bonus = (gameState.selectedAdvisorId ?? gameState.selectedAdvisor?.id) === 'gambler' ? 0.15 : 0;

  if (tier === 'ABSURD') return Math.min(0.95, 0.2 + bonus);
  if (tier === 'GAMBLE') return Math.min(0.95, 0.3 + bonus);
  if (tier === 'NORMAL') return 0.7;
  return 1;
}

function getDebt(gameState) {
  return (gameState.loans ?? []).reduce((sum, loan) => sum + (loan.principal ?? 0), 0) ||
    gameState.debt ||
    gameState.player?.debt ||
    0;
}

function getCapital(gameState, result) {
  return result.capitalAfter ?? gameState.capital ?? gameState.player?.capital ?? 0;
}

function createSection(kind, title, text, tone = 'neutral', percent = null) {
  return Object.freeze({
    id: `${kind}-${title}`,
    kind,
    title,
    text,
    tone,
    type: tone,
    icon: kind,
    percent,
  });
}

function freezeReport(report) {
  return Object.freeze({
    sections: Object.freeze(report.sections ?? []),
    suggestion: report.suggestion ?? '',
    warning: report.warning ?? '',
  });
}

function pickStable(items, seed = 0) {
  if (!items.length) {
    return '';
  }

  return items[Math.abs(Number(seed) || 0) % items.length];
}

function fillTemplate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercentPoint(value) {
  const points = Math.round(value * 1000) / 10;

  return `${points >= 0 ? '+' : ''}${points}%p`;
}
