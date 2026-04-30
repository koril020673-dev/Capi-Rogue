// 진단 상태
export const DIAGNOSIS_STATES = Object.freeze({
  GROWTH: 'GROWTH',
  STABLE: 'STABLE',
  CAUTION: 'CAUTION',
  CRISIS: 'CRISIS',
});

/**
 * 게임 상태를 진단하여 현재 경영 상황을 판정
 * @param {object} gameState - 게임 상태
 * @returns {string} 진단 상태 (GROWTH, STABLE, CAUTION, CRISIS)
 */
export function getDiagnosis(gameState) {
  const { currentResult, currentSettlement, player, timeline } = gameState;

  if (!currentResult || !currentSettlement) {
    return DIAGNOSIS_STATES.STABLE;
  }

  const profit = currentResult.profit;
  const healthDelta = currentResult.healthDelta;
  const lastFloorProfit = timeline[timeline.length - 2]?.profit;

  // 점유율 계산 (현재 달)
  const playerDemand = currentSettlement.demandSplit?.find((p) => p.id === 'player')?.demand ?? 0;
  const totalDemand = currentSettlement.totalDemand ?? 1;
  const currentMarketShare = playerDemand / totalDemand;

  // 지난달 점유율 (비교용)
  const lastFloorData = timeline[timeline.length - 2];
  const lastMarketShare = lastFloorData?.marketShare ?? currentMarketShare;
  const marketShareDelta = currentMarketShare - lastMarketShare;

  // CRISIS: 순이익 적자 AND 체력 감소
  if (profit < 0 && healthDelta < 0) {
    return DIAGNOSIS_STATES.CRISIS;
  }

  // CAUTION: 순이익 감소 OR 점유율 하락
  if (lastFloorProfit !== undefined && profit < lastFloorProfit) {
    return DIAGNOSIS_STATES.CAUTION;
  }

  if (marketShareDelta < -0.02) {
    return DIAGNOSIS_STATES.CAUTION;
  }

  // STABLE: 순이익 유지 AND 점유율 변화 없음 (±2% 이내)
  if (lastFloorProfit !== undefined && profit <= lastFloorProfit && Math.abs(marketShareDelta) <= 0.02) {
    return DIAGNOSIS_STATES.STABLE;
  }

  // GROWTH: 순이익 증가 AND 점유율 상승
  if (lastFloorProfit !== undefined && profit > lastFloorProfit && marketShareDelta > 0.02) {
    return DIAGNOSIS_STATES.GROWTH;
  }

  // 첫 달이거나 비교 불가능한 경우
  if (lastFloorProfit === undefined) {
    if (profit > 0) {
      return DIAGNOSIS_STATES.GROWTH;
    }
    if (profit < 0) {
      return DIAGNOSIS_STATES.CAUTION;
    }
  }

  return DIAGNOSIS_STATES.STABLE;
}

/**
 * 현재 상태 진단 문구 풀
 */
export const DIAGNOSIS_MESSAGES = Object.freeze({
  GROWTH: [
    '시장을 장악하고 있습니다. 이 기세를 유지하세요.',
    '경쟁사를 압도하는 성과입니다.',
    '순이익과 점유율이 동시에 상승했습니다. 최고의 신호입니다.',
    '이대로라면 우리 회사가 시장 1위도 꿈꿀 수 있습니다.',
    '지속적인 성장세를 보이고 있습니다. 칭찬합니다.',
    '이번 달 성과는 지난달보다 한 단계 진전되었습니다.',
  ],
  STABLE: [
    '안정적인 운영 중입니다.',
    '현상 유지 중. 도약의 기회를 노리세요.',
    '변화 없이 제자리걸음이 계속되고 있습니다.',
    '평온한 시장 상황 속에서 버티고 있습니다.',
    '수익도, 손실도 없습니다. 이제 다음 단계를 고려할 시점입니다.',
    '현재 상태를 유지하되, 새로운 전략을 준비해야 합니다.',
  ],
  CAUTION: [
    '경쟁사에 점유율을 빼앗기고 있습니다. 전략 수정이 필요합니다.',
    '수익성이 떨어지고 있습니다. 원가를 점검하세요.',
    '적신호가 켜지기 시작했습니다. 긴급 회의가 필요합니다.',
    '경쟁사의 공격이 강해지고 있습니다. 방어 태세를 갖춰야 합니다.',
    '이 추세가 계속되면 위험합니다. 즉시 대책을 세우세요.',
    '순이익이 감소하고 있습니다. 비용 구조를 재검토하세요.',
  ],
  CRISIS: [
    '비상상황. 즉각적인 대응이 필요합니다.',
    '파산 위기입니다. 지금 당장 전략을 바꾸세요.',
    '생존이 위협받고 있습니다. 모든 수단을 동원해 난관을 극복하세요.',
    '돌파구가 없으면 끝입니다. 과감한 결정이 필요합니다.',
    '체력이 떨어지고 순손실이 발생했습니다. 회사가 위험합니다.',
    '더 이상 시간이 없습니다. 지금 행동하지 않으면 파산합니다.',
  ],
});

/**
 * 다음 달 추천 문구 풀
 */
export const NEXT_MONTH_ADVICE = Object.freeze({
  GROWTH: [
    '점유율이 높을 때 가격을 올려 마진을 확보하세요.',
    '이 기세를 계속 유지하려면 품질 투자를 아끼지 마세요.',
    '마케팅 예산을 조금 더 줄여도 괜찮을 시점입니다.',
    '확보한 고객들을 유지하는 데 집중하세요.',
    '현재 우위를 바탕으로 더 공격적인 전략을 시도해볼 시간입니다.',
    '경쟁사가 반격해올 수 있으니, 지속적으로 투자하세요.',
  ],
  STABLE: [
    '마케팅 투자로 점유율 확대를 노려볼 시점입니다.',
    '현재 가격과 품질 수준이 최적점에 있습니다.',
    '조금 더 보수적으로 비용을 관리해 수익성을 높여보세요.',
    '경쟁사의 움직임을 더 적극적으로 감시하세요.',
    '다음 달을 위해 새로운 전략 옵션을 준비해 두세요.',
    '현재 안정을 바탕으로 한 발짝 앞으로 나아갈 준비를 하세요.',
  ],
  CAUTION: [
    '가격 경쟁력을 점검하세요. 라이벌 판매가와 비교해보세요.',
    '품질이 뒤떨어졌는지 확인하고, 필요하면 투자하세요.',
    '경쟁사의 마케팅 전략을 분석하고 대응해야 합니다.',
    '비용이 너무 높지 않은지 원가 구조를 재검토하세요.',
    '현재 추세를 반전시킬 획기적인 전략이 필요합니다.',
    '침체한 판매를 되살리려면 적극적인 프로모션을 고려하세요.',
  ],
  CRISIS: [
    '발주량을 줄이고 현금을 확보하세요.',
    '대출 상환을 미루고 체력 회복에 집중하세요.',
    '불필요한 모든 지출을 중단하세요.',
    '가격을 내리더라도 판매량을 확보해 현금 유동성을 유지하세요.',
    '긴급 자금 확보 방법을 모색하세요. 추가 대출도 고려하세요.',
    '다음 달부터 순이익이 양수로 돌아와야 합니다. 근본적인 구조 조정이 필요합니다.',
  ],
});

/**
 * 진단 상태에 따른 색상
 */
export const DIAGNOSIS_COLORS = Object.freeze({
  GROWTH: '#00FF41', // 형광 연두
  STABLE: '#00AA00', // 다크 그린
  CAUTION: '#FFB700', // 경고 주황
  CRISIS: '#DC143C', // 크림슨 레드
});

/**
 * 진단 상태에 따른 이모지
 */
export const DIAGNOSIS_EMOJIS = Object.freeze({
  GROWTH: 'GROWTH',
  STABLE: 'STABLE',
  CAUTION: 'CAUTION',
  CRISIS: 'CRISIS',
});

/**
 * 진단 상태에 해당하는 랜덤 메시지 반환
 * @param {string} status - 진단 상태
 * @returns {string} 메시지
 */
export function getRandomDiagnosisMessage(status) {
  const messages = DIAGNOSIS_MESSAGES[status] || DIAGNOSIS_MESSAGES.STABLE;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 진단 상태에 해당하는 랜덤 추천 문구 반환
 * @param {string} status - 진단 상태
 * @returns {string} 추천 문구
 */
export function getRandomAdvice(status) {
  const adviceList = NEXT_MONTH_ADVICE[status] || NEXT_MONTH_ADVICE.STABLE;
  return adviceList[Math.floor(Math.random() * adviceList.length)];
}
