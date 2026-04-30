import { ADVISOR_IDS } from '../constants/advisors';
import { getSelectedPrice } from './settlementEngine';

const RAIDER_MESSAGES = Object.freeze({
  shareUp: Object.freeze([
    '시장을 먹고 있습니다. 지금이 기회입니다.',
    '점유율이 올랐습니다. 더 밀어붙이세요.',
    '좋은 흐름입니다. 가격을 더 낮춰 쐐기를 박으세요.',
  ]),
  shareDown: Object.freeze([
    '밀리고 있습니다. 가격을 점검하세요.',
    '라이벌에게 시장을 내주고 있습니다.',
    '지금 물러서면 더 힘들어집니다.',
  ]),
  priceLow: Object.freeze([
    '가격 경쟁력 있습니다. 이 기세를 유지하세요.',
    '라이벌보다 싸게 팔고 있습니다. 공격할 타이밍입니다.',
  ]),
  priceHigh: Object.freeze([
    '가격이 너무 높습니다. 점유율을 잃고 있어요.',
    '지금 당장 가격을 낮추세요.',
  ]),
  suggestion: Object.freeze([
    '판매가를 라이벌 평균보다 10% 이상 낮게 잡으세요.',
    '모멘텀이 좋을 때 발주량을 늘리세요.',
    '지금 공격하면 점유율을 가져올 수 있습니다.',
  ]),
});

const GUARDIAN_MESSAGES = Object.freeze({
  debtSafe: Object.freeze([
    '재무 상태 안정적입니다.',
    '현금 흐름이 건전합니다. 이 상태를 유지하세요.',
  ]),
  debtCaution: Object.freeze([
    '부채 비율이 올라가고 있습니다. 주의가 필요합니다.',
    '이자 부담이 커지고 있습니다. 대출 상환을 고려하세요.',
  ]),
  debtDanger: Object.freeze([
    '부채가 위험 수준입니다. 즉각 대응하세요.',
    '지금 가장 위험한 것은 부채입니다.',
    '신규 투자보다 현금 보전이 먼저입니다.',
  ]),
  healthDown: Object.freeze([
    '체력이 줄었습니다. 원인을 확인하세요.',
    '연속 적자가 체력을 갉아먹고 있습니다.',
  ]),
  risks: Object.freeze([
    '다음 달 이자 납부액을 확인하세요.',
    '미판매 재고가 원가를 늘리고 있습니다.',
    '라이벌 이벤트 효과가 아직 남아있습니다.',
    '원가 상승 이벤트가 진행 중입니다.',
    '적자가 지속되면 신용등급이 하락합니다.',
  ]),
  suggestion: Object.freeze([
    '발주량을 줄여 미판매 리스크를 낮추세요.',
    '마케팅 비용을 줄이고 현금을 확보하세요.',
    '대출 일부를 상환해 이자 부담을 줄이세요.',
  ]),
});

const ANALYST_MESSAGES = Object.freeze({
  shareUpReasons: Object.freeze([
    '판매가가 라이벌 평균보다 낮아 수요를 가져왔습니다. 기여도 {n}%',
    '브랜드 우위로 소비자를 확보했습니다. 기여도 {n}%',
    '경기 국면 호조로 전체 수요가 증가했습니다. 기여도 {n}%',
  ]),
  shareDownReasons: Object.freeze([
    '판매가가 라이벌 평균보다 높아 수요를 잃었습니다. 기여도 {n}%',
    '라이벌 마케팅 강화로 인지도 격차가 벌어졌습니다. 기여도 {n}%',
    '외부 이벤트로 전체 수요가 감소했습니다. 기여도 {n}%',
    '라이벌 브랜드가 내 브랜드보다 강해졌습니다. 기여도 {n}%',
  ]),
  phaseWarning: Object.freeze([
    '다음 달 위축 국면 진입 가능성이 높습니다.',
    '다음 달 성장 국면으로 전환될 수 있습니다.',
    '현재 국면이 유지될 가능성이 높습니다.',
  ]),
  rivalHint: Object.freeze([
    '{name}이 다음 달 가격 인하를 준비할 가능성이 있습니다.',
    '{name}이 마케팅 투자를 늘릴 것으로 예상됩니다.',
    '{name}의 전략 변화 징후가 없습니다.',
  ]),
  suggestion: Object.freeze([
    '판매가를 원가 x {n}배로 조정하면 점유율을 회복할 수 있습니다.',
    '마케팅 투자를 {n}원 늘리면 인지도 격차를 좁힐 수 있습니다.',
    '다음 달 위축 국면에 대비해 발주량을 줄이세요.',
  ]),
});

const GAMBLER_MESSAGES = Object.freeze({
  success: Object.freeze([
    '성공했습니다. {prob}% 확률에서 해냈습니다.',
    '운이 따랐습니다. 더 크게 걸어볼 만합니다.',
    '이번 판은 이겼습니다.',
  ]),
  failure: Object.freeze([
    '실패했습니다. {prob}% 확률에서 걸렸습니다.',
    '운이 없었습니다. 다음 판에서 만회하세요.',
    '이번엔 틀렸지만 확률은 여전히 유리합니다.',
  ]),
  urge: Object.freeze([
    '이번엔 크게 가세요.',
    '한 번 더 걸어볼 만합니다.',
    '지금이 기회입니다. 망설이지 마세요.',
    '운이 따르고 있습니다. 밀어붙이세요.',
    '겁쟁이는 절대 못 얻습니다.',
    '확률은 당신 편입니다.',
  ]),
  idle: Object.freeze([
    '이번 달은 조용했습니다. 다음 달을 노리세요.',
    '기회가 없었습니다. 다음 판을 준비하세요.',
    '잠잠한 달이었습니다. 큰 판은 곧 옵니다.',
  ]),
  nextEventHint: Object.freeze({
    PRODUCTION: '다음 이벤트는 생산 관련일 가능성이 높습니다.',
    HR: '다음 이벤트는 인사 관련일 가능성이 높습니다.',
    MARKETING: '다음 이벤트는 마케팅 관련일 가능성이 높습니다.',
    FINANCE: '다음 이벤트는 재무 관련일 가능성이 높습니다.',
  }),
});

export function generateReport(gameState, advisorId) {
  if (advisorId === ADVISOR_IDS.GUARDIAN) {
    return buildGuardianReport(gameState);
  }

  if (advisorId === ADVISOR_IDS.ANALYST) {
    return buildAnalystReport(gameState);
  }

  if (advisorId === ADVISOR_IDS.GAMBLER) {
    return buildGamblerReport(gameState);
  }

  return buildRaiderReport(gameState);
}

function buildRaiderReport(gameState) {
  const { shareDelta, momentumDelta, playerPrice, rivalAveragePrice } = getMarketContext(gameState);
  const priceGap = rivalAveragePrice > 0
    ? Math.round(((playerPrice - rivalAveragePrice) / rivalAveragePrice) * 100)
    : 0;
  const cheaperThanRivals = playerPrice < rivalAveragePrice;
  const shareMessage = getRaiderShareMessage(shareDelta);
  const priceMessage = getRaiderPriceMessage(cheaperThanRivals, priceGap);

  return freezeReport({
    sections: [
      createSection('up', '점유율 변화', `${formatPercentPoint(shareDelta)}. ${shareMessage}`, shareDelta >= 0 ? 'positive' : 'negative', Math.min(100, Math.abs(shareDelta) * 500)),
      createSection('choice', '모멘텀 추세', momentumDelta >= 0 ? `+${momentumDelta}` : `${momentumDelta}`, momentumDelta >= 0 ? 'positive' : 'negative'),
      createSection('choice', '가격 경쟁력', `라이벌 평균 대비 ${priceGap >= 0 ? '+' : ''}${priceGap}%. ${priceMessage}`, cheaperThanRivals ? 'positive' : 'negative'),
    ],
    suggestion: getRaiderSuggestion({ shareDelta, momentumDelta, cheaperThanRivals }),
    warning: '',
  });
}

function buildGuardianReport(gameState) {
  const result = gameState.currentResult ?? {};
  const settlement = gameState.currentSettlement ?? {};
  const debt = getDebt(gameState, settlement);
  const capital = Math.max(1, gameState.player?.capital ?? settlement.capitalAfter ?? 1);
  const debtRatio = debt / capital;
  const debtRisk = debtRatio >= 0.55 ? '위험' : debtRatio >= 0.28 ? '주의' : '안전';
  const healthReason = getHealthReason(result.healthDelta ?? 0, settlement);
  const risks = getGuardianRisks(gameState, debtRisk).slice(0, 3);

  return freezeReport({
    sections: [
      createSection('choice', '체력 변화 원인', healthReason, (result.healthDelta ?? 0) < 0 ? 'negative' : 'positive'),
      createSection('event', '부채 위험도', `${getDebtMessage(debtRisk)} (${Math.round(debtRatio * 100)}%)`, debtRisk === '위험' ? 'negative' : debtRisk === '주의' ? 'warning' : 'positive'),
      ...risks.map((risk) => createSection('event', '다음 달 리스크', risk, 'warning')),
    ],
    suggestion: getGuardianSuggestion(risks),
    warning: `지금 가장 위험한 것은 ${risks[0] ?? '현금 흐름'}입니다.`,
  });
}

function buildAnalystReport(gameState) {
  const { shareDelta, playerPrice, rivalAveragePrice } = getMarketContext(gameState);
  const causes = getAnalystCauses(gameState, playerPrice, rivalAveragePrice, shareDelta)
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 3);
  const topCause = causes[0];
  const targetPriceMultiplier = 1.5;
  const marketingSuggestion = 500000;

  return freezeReport({
    sections: [
      ...causes.map((cause) =>
        createSection(
          cause.percent >= 0 ? 'up' : 'down',
          cause.label,
          getAnalystReasonText(cause),
          cause.percent >= 0 ? 'positive' : 'negative',
          Math.min(100, Math.abs(cause.percent) * 10),
        ),
      ),
      createSection('event', '국면 전환 예고', getPhaseWarning(gameState), 'warning'),
      createSection('event', '라이벌 예상 전략', getRivalStrategyHint(gameState), 'warning'),
    ],
    suggestion: getAnalystSuggestion(topCause, {
      priceMultiplier: targetPriceMultiplier,
      marketingAmount: marketingSuggestion,
    }),
    warning: topCause ? `가장 큰 원인은 ${topCause.label}입니다.` : '',
  });
}

function buildGamblerReport(gameState) {
  const outcome = gameState.currentSettlement?.internalOutcome;
  const hasEventChoice = hasGamblerEventChoice(gameState, outcome);
  const categoryHint = getNextEventCategoryHint(gameState);

  if (!hasEventChoice) {
    return freezeReport({
      sections: [
        createSection('event', '다음 이벤트 힌트', categoryHint, 'warning'),
      ],
      suggestion: getGamblerIdleSuggestion(gameState),
      warning: '',
    });
  }

  const tier = outcome?.tier ?? 'GAMBLE';
  const probability = getGamblerProbability(tier, gameState.selectedAdvisorId);
  const probabilityPercent = Math.round(probability * 100);
  const success = outcome?.success ?? (gameState.currentResult?.profit ?? 0) >= 0;
  const resultText = getGamblerResultText(success, probabilityPercent);

  return freezeReport({
    sections: [
      createSection(
        'choice',
        '이번 이벤트 선택',
        outcome ? `${outcome.choiceLabel ?? '선택지'}: ${outcome.description}` : '이번 달에는 내부 이벤트 선택이 없었습니다.',
        success ? 'positive' : 'negative',
      ),
      createSection('choice', '확률 결과', resultText, success ? 'positive' : 'negative', probabilityPercent),
      createSection('event', '다음 이벤트 힌트', categoryHint, 'warning'),
    ],
    suggestion: getGamblerSuggestion(success, probabilityPercent),
    warning: '',
  });
}

function hasGamblerEventChoice(gameState, outcome) {
  if (!outcome) {
    return false;
  }

  if (Object.hasOwn(gameState, 'lastEventChoice') && gameState.lastEventChoice === null) {
    return false;
  }

  return Boolean(outcome.choiceLabel || outcome.description || outcome.tier);
}

function getRaiderShareMessage(shareDelta) {
  if (shareDelta >= 0.04) {
    return RAIDER_MESSAGES.shareUp[0];
  }

  if (shareDelta >= 0) {
    return RAIDER_MESSAGES.shareUp[1];
  }

  if (shareDelta <= -0.04) {
    return RAIDER_MESSAGES.shareDown[1];
  }

  return RAIDER_MESSAGES.shareDown[0];
}

function getRaiderPriceMessage(cheaperThanRivals, priceGap) {
  if (cheaperThanRivals) {
    return priceGap <= -10 ? RAIDER_MESSAGES.priceLow[1] : RAIDER_MESSAGES.priceLow[0];
  }

  return priceGap >= 10 ? RAIDER_MESSAGES.priceHigh[0] : RAIDER_MESSAGES.priceHigh[1];
}

function getRaiderSuggestion({ shareDelta, momentumDelta, cheaperThanRivals }) {
  if (!cheaperThanRivals) {
    return RAIDER_MESSAGES.suggestion[0];
  }

  if (momentumDelta > 0 || shareDelta > 0) {
    return RAIDER_MESSAGES.suggestion[1];
  }

  return RAIDER_MESSAGES.suggestion[2];
}

function getGuardianSuggestion(risks) {
  if (risks.some((risk) => risk.includes('재고'))) {
    return GUARDIAN_MESSAGES.suggestion[0];
  }

  if (risks.some((risk) => risk.includes('이자') || risk.includes('부채'))) {
    return GUARDIAN_MESSAGES.suggestion[2];
  }

  return GUARDIAN_MESSAGES.suggestion[1];
}

function getAnalystSuggestion(topCause, { priceMultiplier, marketingAmount }) {
  if (topCause?.label?.includes('판매가')) {
    return fillTemplate(ANALYST_MESSAGES.suggestion[0], { n: priceMultiplier });
  }

  if (topCause?.label?.includes('마케팅') || topCause?.label?.includes('인지도')) {
    return fillTemplate(ANALYST_MESSAGES.suggestion[1], { n: marketingAmount.toLocaleString() });
  }

  return ANALYST_MESSAGES.suggestion[2];
}

function getGamblerResultText(success, probabilityPercent) {
  const message = success
    ? probabilityPercent <= 35
      ? GAMBLER_MESSAGES.success[0]
      : GAMBLER_MESSAGES.success[1]
    : probabilityPercent <= 35
      ? GAMBLER_MESSAGES.failure[0]
      : GAMBLER_MESSAGES.failure[1];

  return fillTemplate(message, { prob: probabilityPercent });
}

function getGamblerSuggestion(success, probabilityPercent) {
  if (success && probabilityPercent <= 35) {
    return GAMBLER_MESSAGES.urge[3];
  }

  if (success) {
    return GAMBLER_MESSAGES.urge[1];
  }

  if (probabilityPercent >= 45) {
    return GAMBLER_MESSAGES.urge[5];
  }

  return GAMBLER_MESSAGES.urge[0];
}

function getGamblerIdleSuggestion(gameState) {
  const floor = Math.max(0, gameState.floor ?? 0);

  return GAMBLER_MESSAGES.idle[floor % GAMBLER_MESSAGES.idle.length];
}

function getMarketContext(gameState) {
  const settlement = gameState.currentSettlement ?? {};
  const participants = settlement.demandSplit ?? [];
  const player = participants.find((item) => item.id === 'player') ?? {};
  const rivals = participants.filter((item) => item.type === 'rival');
  const previous = gameState.timeline?.at(-2);
  const currentShare = player.marketShare ?? 0;
  const previousShare = previous?.marketShare ?? previous?.share ?? currentShare;
  const currentMomentum = gameState.currentResult?.momentumScore ?? 0;
  const previousMomentum = getPreviousMomentum(gameState);
  const playerPrice = player.price ?? getSelectedPrice(gameState.strategy ?? {}, gameState.player?.unitCost ?? 1);
  const rivalAveragePrice = average(rivals.map((rival) => rival.price).filter(Boolean)) || playerPrice;

  return {
    shareDelta: currentShare - previousShare,
    momentumDelta: currentMomentum - previousMomentum,
    playerPrice,
    rivalAveragePrice,
  };
}

function getPreviousMomentum(gameState) {
  const history = gameState.momentumHistory ?? [];
  const previous = history.slice(0, -1);

  return previous.reduce((score, profit) => score + (profit > 0 ? 1 : profit < 0 ? -1 : 0), 0);
}

function getHealthReason(healthDelta, settlement) {
  if (healthDelta >= 0) {
    return '체력 손실은 없었습니다. 현재 운영 방어선이 유지되고 있습니다.';
  }

  if ((settlement.playerWarHealthDelta ?? 0) < 0) {
    return GUARDIAN_MESSAGES.healthDown[0];
  }

  if ((settlement.profit ?? 0) < 0) {
    return '이번 달 적자가 체력 감소로 이어졌습니다.';
  }

  return '운영 리스크 누적으로 체력이 감소했습니다.';
}

function getDebt(gameState, settlement) {
  const loanDebt = (gameState.loans ?? settlement.nextLoans ?? []).reduce(
    (sum, loan) => sum + (loan.principal ?? 0),
    0,
  );

  return loanDebt || gameState.player?.debt || settlement.playerAfterOperation?.debt || 0;
}

function getDebtMessage(debtRisk) {
  if (debtRisk === '위험') {
    return GUARDIAN_MESSAGES.debtDanger[0];
  }

  if (debtRisk === '주의') {
    return GUARDIAN_MESSAGES.debtCaution[0];
  }

  return GUARDIAN_MESSAGES.debtSafe[0];
}

function getGuardianRisks(gameState, debtRisk) {
  const settlement = gameState.currentSettlement ?? {};
  const risks = [];

  if (debtRisk !== '안전') {
    risks.push(GUARDIAN_MESSAGES.risks[0]);
  }

  if ((settlement.unsoldUnits ?? 0) > 0) {
    risks.push(GUARDIAN_MESSAGES.risks[1]);
  }

  if ((settlement.marketModifiers?.costMultiplier ?? 1) > 1) {
    risks.push(GUARDIAN_MESSAGES.risks[3]);
  }

  if ((gameState.currentRivalEvent ?? gameState.lastExternalEvent)?.category === 'RIVAL') {
    risks.push(GUARDIAN_MESSAGES.risks[2]);
  }

  if ((settlement.profit ?? 0) < 0) {
    risks.push(GUARDIAN_MESSAGES.risks[4]);
  }

  return risks.length ? risks : ['다음 달 수요 변동을 확인하세요.'];
}

function getAnalystCauses(gameState, playerPrice, rivalAveragePrice, shareDelta) {
  const settlement = gameState.currentSettlement ?? {};
  const causes = [];
  const priceDiff = rivalAveragePrice > 0 ? ((rivalAveragePrice - playerPrice) / rivalAveragePrice) * 100 : 0;

  if (Math.abs(priceDiff) >= 2) {
    causes.push({
      label: playerPrice > rivalAveragePrice ? '판매가 높음' : '판매가 낮음',
      percent: priceDiff / 2,
      reasonType: playerPrice > rivalAveragePrice ? 'priceHigh' : 'priceLow',
    });
  }

  if ((settlement.marketModifiers?.demandMultiplier ?? 1) !== 1) {
    const percent = Math.round(((settlement.marketModifiers.demandMultiplier ?? 1) - 1) * 100);

    causes.push({
      label: percent >= 0 ? '경기 국면 호조' : '외부 이벤트 수요 감소',
      percent,
      reasonType: percent >= 0 ? 'phaseGood' : 'externalDown',
    });
  }

  const player = settlement.demandSplit?.find((item) => item.id === 'player');
  const rivalWithMarketing = settlement.demandSplit?.find(
    (item) => item.type === 'rival' && (item.brand ?? 0) > (player?.brand ?? 0),
  );

  if (rivalWithMarketing) {
    causes.push({ label: '라이벌 마케팅 우위', percent: -4, reasonType: 'rivalMarketing' });
  }

  causes.push({
    label: shareDelta >= 0 ? '점유율 상승 흐름' : '점유율 하락 흐름',
    percent: Math.round(shareDelta * 100),
    reasonType: shareDelta >= 0 ? 'shareUp' : 'shareDown',
  });

  return causes.filter((cause) => Number.isFinite(cause.percent) && cause.percent !== 0);
}

function getAnalystReasonText(cause) {
  const n = Math.abs(Math.round(cause.percent));

  if (cause.percent >= 0) {
    if (cause.reasonType === 'priceLow') {
      return fillTemplate(ANALYST_MESSAGES.shareUpReasons[0], { n });
    }

    if (cause.reasonType === 'phaseGood') {
      return fillTemplate(ANALYST_MESSAGES.shareUpReasons[2], { n });
    }

    return fillTemplate(ANALYST_MESSAGES.shareUpReasons[1], { n });
  }

  if (cause.reasonType === 'priceHigh') {
    return fillTemplate(ANALYST_MESSAGES.shareDownReasons[0], { n });
  }

  if (cause.reasonType === 'rivalMarketing') {
    return fillTemplate(ANALYST_MESSAGES.shareDownReasons[1], { n });
  }

  if (cause.reasonType === 'externalDown') {
    return fillTemplate(ANALYST_MESSAGES.shareDownReasons[2], { n });
  }

  return fillTemplate(ANALYST_MESSAGES.shareDownReasons[3], { n });
}

function getPhaseWarning(gameState) {
  const phase = gameState.phase ?? 'stable';

  if (phase === 'contraction' || phase === 'recession') {
    return ANALYST_MESSAGES.phaseWarning[0];
  }

  if (phase === 'growth' || phase === 'boom') {
    return ANALYST_MESSAGES.phaseWarning[1];
  }

  return ANALYST_MESSAGES.phaseWarning[2];
}

function getRivalStrategyHint(gameState) {
  const rival = gameState.currentSettlement?.demandSplit?.find((item) => item.type === 'rival');

  if (!rival) {
    return '활성 라이벌이 적어 방어적 운영 가능성이 높습니다.';
  }

  const player = gameState.currentSettlement?.demandSplit?.find((item) => item.id === 'player');
  const template = (rival.price ?? 0) < (player?.price ?? 0)
    ? ANALYST_MESSAGES.rivalHint[0]
    : (rival.brand ?? 0) > (player?.brand ?? 0)
      ? ANALYST_MESSAGES.rivalHint[1]
      : ANALYST_MESSAGES.rivalHint[2];

  return fillTemplate(template, { name: rival.name ?? '라이벌' });
}

function getGamblerProbability(tier, advisorId) {
  const upperTier = String(tier).toUpperCase();
  const bonus = advisorId === ADVISOR_IDS.GAMBLER ? 0.15 : 0;

  if (upperTier === 'ABSURD') {
    return Math.min(0.95, 0.2 + bonus);
  }

  if (upperTier === 'GAMBLE') {
    return Math.min(0.95, 0.3 + bonus);
  }

  if (upperTier === 'NORMAL') {
    return 0.7;
  }

  return 1;
}

function getNextEventCategoryHint(gameState) {
  const floor = gameState.floor ?? 1;
  const categories = ['PRODUCTION', 'HR', 'MARKETING', 'FINANCE'];
  const category = categories[floor % categories.length];

  return GAMBLER_MESSAGES.nextEventHint[category];
}

function createSection(kind, title, text, tone = 'neutral', percent = null) {
  return Object.freeze({
    id: `${kind}-${title}`,
    kind,
    title,
    text,
    tone,
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
  const points = Math.round(value * 100);

  return `${points >= 0 ? '+' : ''}${points}%p`;
}
