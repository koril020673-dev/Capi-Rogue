import { ADVISOR_IDS } from '../constants/advisors';
import { PRICE_STRATEGY_IDS } from '../constants/strategies';
import { getSelectedPrice } from './settlementEngine';

const GAMBLER_PROMPTS = Object.freeze([
  '이번엔 크게 가세요.',
  '한 번 더 걸어볼 만합니다.',
  '지금이 기회입니다. 망설이지 마세요.',
  '운이 따르고 있습니다. 밀어붙이세요.',
  '겁쟁이는 절대 못 얻습니다.',
]);

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

  return freezeReport({
    sections: [
      createSection('up', '점유율 변화', formatPercentPoint(shareDelta), shareDelta >= 0 ? 'positive' : 'negative', Math.min(100, Math.abs(shareDelta) * 500)),
      createSection('choice', '모멘텀 추세', momentumDelta >= 0 ? `+${momentumDelta}` : `${momentumDelta}`, momentumDelta >= 0 ? 'positive' : 'negative'),
      createSection('choice', '가격 경쟁력', `라이벌 평균 대비 ${priceGap >= 0 ? '+' : ''}${priceGap}%`, cheaperThanRivals ? 'positive' : 'negative'),
    ],
    suggestion: cheaperThanRivals ? '이 기세 유지하세요.' : '지금 더 낮출 수 있습니다.',
    warning: '',
  });
}

function buildGuardianReport(gameState) {
  const result = gameState.currentResult ?? {};
  const settlement = gameState.currentSettlement ?? {};
  const debt = gameState.player?.debt ?? settlement.playerAfterOperation?.debt ?? 0;
  const capital = Math.max(1, gameState.player?.capital ?? settlement.capitalAfter ?? 1);
  const debtRatio = debt / capital;
  const debtRisk = debtRatio >= 0.55 ? '위험' : debtRatio >= 0.28 ? '주의' : '안전';
  const healthReason = getHealthReason(result.healthDelta ?? 0, settlement);
  const risks = getGuardianRisks(gameState, debtRisk).slice(0, 3);

  return freezeReport({
    sections: [
      createSection('choice', '체력 변화 원인', healthReason, (result.healthDelta ?? 0) < 0 ? 'negative' : 'positive'),
      createSection('event', '부채 위험도', `${debtRisk} (${Math.round(debtRatio * 100)}%)`, debtRisk === '위험' ? 'negative' : debtRisk === '주의' ? 'warning' : 'positive'),
      ...risks.map((risk) => createSection('event', '다음 달 리스크', risk, 'warning')),
    ],
    suggestion: '방어선을 유지하고 현금 소모를 먼저 줄이세요.',
    warning: `지금 가장 위험한 것은 ${risks[0] ?? '현금 흐름'}입니다.`,
  });
}

function buildAnalystReport(gameState) {
  const { shareDelta, playerPrice, rivalAveragePrice } = getMarketContext(gameState);
  const causes = getAnalystCauses(gameState, playerPrice, rivalAveragePrice, shareDelta)
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 3);
  const topCause = causes[0];
  const targetPrice = Math.round((gameState.player?.unitCost ?? 18000) * 1.5);

  return freezeReport({
    sections: [
      ...causes.map((cause) =>
        createSection(cause.percent >= 0 ? 'up' : 'down', cause.label, formatPercentPoint(cause.percent), cause.percent >= 0 ? 'positive' : 'negative', Math.min(100, Math.abs(cause.percent) * 10)),
      ),
      createSection('event', '국면 전환 예고', getPhaseWarning(gameState), 'warning'),
      createSection('event', '라이벌 예상 전략', getRivalStrategyHint(gameState), 'warning'),
    ],
    suggestion: topCause?.label?.includes('판매가')
      ? `판매가를 원가 x 1.5 수준인 ${formatWon(targetPrice)} 근처로 낮추세요.`
      : `${topCause?.label ?? '가장 큰 변수'}부터 조정하세요.`,
    warning: topCause ? `가장 큰 원인은 ${topCause.label}입니다.` : '',
  });
}

function buildGamblerReport(gameState) {
  const outcome = gameState.currentSettlement?.internalOutcome;
  const tier = outcome?.tier ?? 'GAMBLE';
  const probability = getGamblerProbability(tier, gameState.selectedAdvisorId);
  const success = outcome?.success ?? (gameState.currentResult?.profit ?? 0) >= 0;
  const categoryHint = getNextEventCategoryHint(gameState);

  return freezeReport({
    sections: [
      createSection(
        'choice',
        '이번 턴 이벤트 선택',
        outcome ? `${outcome.choiceLabel ?? '선택지'}: ${outcome.description}` : '이번 턴에는 내부 이벤트 선택이 없었습니다.',
        success ? 'positive' : 'negative',
      ),
      createSection('choice', '확률 결과', `${Math.round(probability * 100)}% 확률에서 ${success ? '성공했습니다' : '실패했습니다'}.`, success ? 'positive' : 'negative', probability * 100),
      createSection('event', '다음 이벤트 힌트', categoryHint, 'warning'),
    ],
    suggestion: getRandomGamblerPrompt(gameState.floor ?? 1),
    warning: '',
  });
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
    return '순이익과 방어 보정으로 체력 손실이 발생하지 않았습니다.';
  }

  if ((settlement.playerWarHealthDelta ?? 0) < 0) {
    return '라이벌전 압박과 적자 영향으로 체력이 감소했습니다.';
  }

  if ((settlement.profit ?? 0) < 0) {
    return '순이익 적자로 체력이 감소했습니다.';
  }

  return '운영 리스크 누적으로 체력이 감소했습니다.';
}

function getGuardianRisks(gameState, debtRisk) {
  const settlement = gameState.currentSettlement ?? {};
  const risks = [];

  if (debtRisk !== '안전') {
    risks.push('부채 이자 부담');
  }

  if ((settlement.unsoldUnits ?? 0) > 0) {
    risks.push('미판매 재고 폐기 비용');
  }

  if ((settlement.marketModifiers?.costMultiplier ?? 1) > 1) {
    risks.push('원가 상승 이벤트');
  }

  if ((gameState.currentRivalEvent ?? gameState.lastExternalEvent)?.category === 'RIVAL') {
    risks.push('라이벌 이벤트 지속 효과');
  }

  if ((settlement.profit ?? 0) < 0) {
    risks.push('순이익 적자 지속');
  }

  return risks.length ? risks : ['다음 달 수요 변동'];
}

function getAnalystCauses(gameState, playerPrice, rivalAveragePrice, shareDelta) {
  const settlement = gameState.currentSettlement ?? {};
  const causes = [];
  const priceDiff = rivalAveragePrice > 0 ? ((rivalAveragePrice - playerPrice) / rivalAveragePrice) * 100 : 0;

  if (Math.abs(priceDiff) >= 2) {
    causes.push({ label: playerPrice > rivalAveragePrice ? '내 판매가 높음' : '내 판매가 낮음', percent: priceDiff / 2 });
  }

  if ((settlement.marketModifiers?.demandMultiplier ?? 1) !== 1) {
    causes.push({
      label: '외부 이벤트 수요 변화',
      percent: Math.round(((settlement.marketModifiers.demandMultiplier ?? 1) - 1) * 100),
    });
  }

  const rivalWithMarketing = settlement.demandSplit?.find((item) => item.type === 'rival' && (item.brand ?? 0) > (settlement.demandSplit?.find((p) => p.id === 'player')?.brand ?? 0));
  if (rivalWithMarketing) {
    causes.push({ label: '라이벌 마케팅 우위', percent: -4 });
  }

  causes.push({ label: shareDelta >= 0 ? '점유율 상승 흐름' : '점유율 하락 흐름', percent: Math.round(shareDelta * 100) });

  return causes.filter((cause) => Number.isFinite(cause.percent) && cause.percent !== 0);
}

function getPhaseWarning(gameState) {
  const timeline = gameState.timeline ?? [];
  const lastPhase = timeline.at(-1)?.phase;

  if (lastPhase && lastPhase !== gameState.phase) {
    return `${lastPhase}에서 ${gameState.phase} 국면으로 전환 조짐이 있습니다.`;
  }

  return '다음 1턴 안에 급격한 국면 전환 신호는 약합니다.';
}

function getRivalStrategyHint(gameState) {
  const rival = gameState.currentSettlement?.demandSplit?.find((item) => item.type === 'rival');

  if (!rival) {
    return '활성 라이벌이 적어 방어적 운영 가능성이 높습니다.';
  }

  if ((rival.price ?? 0) < (gameState.currentSettlement?.demandSplit?.find((item) => item.id === 'player')?.price ?? 0)) {
    return `${rival.name}은 가격 압박을 이어갈 가능성이 높습니다.`;
  }

  return `${rival.name}은 브랜드/품질 우위를 밀 가능성이 높습니다.`;
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
  const hints = ['PRODUCTION', 'HR', 'MARKETING', 'FINANCE'];

  return `${hints[floor % hints.length]} 계열 카드가 나올 흐름입니다.`;
}

function getRandomGamblerPrompt(seed) {
  return GAMBLER_PROMPTS[Math.abs(seed) % GAMBLER_PROMPTS.length];
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

function formatWon(value) {
  return `${Math.round(value).toLocaleString()}원`;
}
