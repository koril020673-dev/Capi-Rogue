export const CHOICE_TIERS = Object.freeze({
  SAFE: 'SAFE',
  NORMAL: 'NORMAL',
  GAMBLE: 'GAMBLE',
  ABSURD: 'ABSURD',
});

export const INTERNAL_EVENTS = Object.freeze([
  e('I01', 'PRODUCTION', '설비 고장', '공장 설비가 갑자기 멈췄다.', [
    c('SAFE', '수리비 지불', { cash: '-SM' }),
    c('NORMAL', '임시 수리', [{ prob: 0.7, result: {} }, { prob: 0.3, result: { quality: -1 } }]),
    c('GAMBLE', '그냥 돌린다', [{ prob: 0.3, result: {} }, { prob: 0.7, result: { quality: -2 } }]),
  ]),
  e('I02', 'PRODUCTION', '불량품 대량 발생', '이번 달 생산품 30%가 불량이다.', [
    c('SAFE', '전량 폐기', { cash: '-SM' }),
    c('NORMAL', '일부만 폐기', [{ prob: 0.7, result: {} }, { prob: 0.3, result: { brand: -1 } }]),
    c('GAMBLE', '그냥 판다', [{ prob: 0.3, result: {} }, { prob: 0.7, result: { brand: -3 } }]),
  ]),
  e('I03', 'PRODUCTION', '신규 공급업체 등장', '더 싼 부품을 공급하겠다는 업체가 나타났다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '계약', { cost: -0.1, quality: -1 }),
    c('ABSURD', '전량 교체', [{ prob: 0.4, result: { cost: -0.2 } }, { prob: 0.4, result: { cost: -0.2, quality: -2 } }, { prob: 0.2, result: { cost: -0.2, quality: -2 } }]),
  ]),
  e('I04', 'PRODUCTION', '생산라인 효율화 제안', '컨설턴트가 공정 개선안을 들고 왔다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '도입', { cash: '-MD', cost: -0.1 }),
    c('GAMBLE', '전면 도입', [{ prob: 0.3, result: { cash: '-LG', cost: -0.2 } }, { prob: 0.7, result: { cash: '-LG', cost: -0.05 } }]),
  ]),
  e('I05', 'PRODUCTION', '원자재 사재기 기회', '원자재를 지금 대량 구매할 수 있다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '소량 구매', { cash: '-SM', nextTurnCost: -0.1 }),
    c('GAMBLE', '대량 구매', [{ prob: 0.3, result: { cash: '-LG', nextTurnCost: -0.2 } }, { prob: 0.7, result: { cash: '-LG' } }]),
  ]),
  e('I06', 'HR', '핵심 직원 이탈', '베테랑 직원이 경쟁사로 이직하겠다고 한다.', [
    c('SAFE', '연봉 인상', { cash: '-SM' }),
    c('NORMAL', '설득', [{ prob: 0.5, result: {} }, { prob: 0.5, result: { brand: -1 } }]),
    c('ABSURD', '보내준다', { brand: -2, momentum: -1 }),
  ]),
  e('I07', 'HR', '직원 집단 태업', '직원들이 처우 개선을 요구하며 태업 중이다.', [
    c('SAFE', '요구 수용', { cash: '-MD' }),
    c('NORMAL', '협상', [{ prob: 0.7, result: { cash: '-SM' } }, { prob: 0.3, result: { quality: -2 } }]),
    c('GAMBLE', '강경 대응', [{ prob: 0.3, result: {} }, { prob: 0.7, result: { quality: -2 } }]),
  ]),
  e('I08', 'HR', '스타 직원 영입 제안', '업계 유명인사가 합류 의사를 밝혔다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '영입', { cash: '-MD', brand: 2 }),
    c('ABSURD', '공동대표 제안', [{ prob: 0.2, result: { cash: '-LG', brand: 5 } }, { prob: 0.4, result: { cash: '-LG', brand: 2 } }, { prob: 0.4, result: { cash: '-LG' } }]),
  ]),
  e('I09', 'HR', '내부 비리 적발', '직원이 회사 자금을 횡령했다는 제보가 들어왔다.', [
    c('SAFE', '조용히 해결', { cash: '-SM' }),
    c('NORMAL', '감사 진행', [{ prob: 0.7, result: {} }, { prob: 0.3, result: { brand: -3 } }]),
    c('GAMBLE', '언론 공개', [{ prob: 0.3, result: { brand: 2 } }, { prob: 0.7, result: { brand: -4 } }]),
  ]),
  e('I10', 'HR', '신입 대규모 채용 기회', '취업 시즌에 좋은 인재들이 몰려왔다.', [
    c('SAFE', '소규모 채용', { cash: '-SM', productionEfficiency: 0.05 }),
    c('NORMAL', '대규모 채용', { cash: '-MD', productionEfficiency: 0.15 }),
    c('GAMBLE', '전원 채용', [{ prob: 0.3, result: { cash: '-LG', productionEfficiency: 0.25 } }, { prob: 0.7, result: { cash: '-LG', cost: 0.2 } }]),
  ]),
  e('I11', 'MARKETING', 'SNS 바이럴 기회', '제품이 SNS에서 화제가 될 기회가 생겼다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '소규모 집행', { cash: '-SM', awareness: 10 }),
    c('GAMBLE', '전면 베팅', [{ prob: 0.3, result: { cash: '-MD', awareness: 30 } }, { prob: 0.7, result: { cash: '-MD', awareness: 5 } }]),
  ]),
  e('I12', 'MARKETING', '악성 루머 확산', '근거 없는 제품 결함 루머가 퍼지고 있다.', [
    c('SAFE', '공식 해명', { cash: '-SM' }),
    c('NORMAL', '무시', [{ prob: 0.7, result: {} }, { prob: 0.3, result: { brand: -3 } }]),
    c('ABSURD', '역이용 마케팅', [{ prob: 0.2, result: { brand: 3 } }, { prob: 0.4, result: {} }, { prob: 0.4, result: { brand: -5 } }]),
  ]),
  e('I13', 'MARKETING', '유명인 자발적 홍보', '연예인이 제품을 자발적으로 홍보했다.', [
    c('SAFE', '그냥 둔다', { awareness: 5 }),
    c('NORMAL', '공식 협업', { cash: '-MD', awareness: 20 }),
    c('GAMBLE', '전속 계약', [{ prob: 0.3, result: { cash: '-LG', awareness: 40 } }, { prob: 0.7, result: { cash: '-LG', awareness: 10 } }]),
  ]),
  e('I14', 'MARKETING', '광고 캠페인 역효과', '집행한 광고가 소비자 반감을 샀다.', [
    c('SAFE', '즉시 철회', { cash: '-SM', brand: -1 }),
    c('NORMAL', '수정 집행', [{ prob: 0.7, result: { cash: '-MD' } }, { prob: 0.3, result: { cash: '-MD', brand: -2 } }]),
    c('GAMBLE', '강행', [{ prob: 0.3, result: { brand: 1 } }, { prob: 0.7, result: { brand: -4 } }]),
  ]),
  e('I15', 'MARKETING', '경쟁사 비방 광고 제안', '대행사가 라이벌 비방 광고를 제안했다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '간접 비교광고', { cash: '-SM', rivalBrand: -1 }),
    c('ABSURD', '직접 비방', [{ prob: 0.2, result: { cash: '-SM', rivalBrand: -3 } }, { prob: 0.4, result: { cash: '-SM' } }, { prob: 0.4, result: { cash: '-SM', brand: -3 } }]),
  ]),
  e('I16', 'FINANCE', '투자자 접촉', '외부 투자자가 자금 지원 의사를 밝혔다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '소규모 투자 수용', { cash: '+MD', equity: -0.1 }),
    c('GAMBLE', '대규모 투자 수용', [{ prob: 0.3, result: { cash: '+LG', equity: -0.2 } }, { prob: 0.7, result: { cash: '+SM', equity: -0.1 } }]),
  ]),
  e('I17', 'FINANCE', '창고에서 재고 발견', '오래된 창고에서 팔 수 있는 재고가 나왔다.', [
    c('SAFE', '정상가 판매', { cash: '+SM' }),
    c('NORMAL', '할인 판매', { cash: '+SM', brand: -1 }),
    c('ABSURD', '리패키징', [{ prob: 0.2, result: { cash: '+MD', brand: 1 } }, { prob: 0.4, result: { cash: '+SM' } }, { prob: 0.4, result: { cash: '-SM', brand: -3 } }]),
  ]),
  e('I18', 'FINANCE', '세무조사 통보', '세무서에서 조사 통보가 날아왔다.', [
    c('SAFE', '성실 응대', { cash: '-SM' }),
    c('NORMAL', '세무사 선임', [{ prob: 0.7, result: { cash: '-SM' } }, { prob: 0.3, result: { cash: '-MD' } }]),
    c('GAMBLE', '그냥 버틴다', [{ prob: 0.3, result: {} }, { prob: 0.7, result: { cash: '-LG' } }]),
  ]),
  e('I19', 'FINANCE', '단기 대출 기회', '낮은 금리로 단기 대출을 받을 수 있다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '소규모 대출', { cash: '+MD', interestBurden: 'LOW' }),
    c('GAMBLE', '최대한도 대출', [{ prob: 0.3, result: { cash: '+LG', interestBurden: 'LOW' } }, { prob: 0.7, result: { cash: '+LG', interestBurden: 'HIGH' } }]),
  ]),
  e('I20', 'FINANCE', '폐업 업체 인수 기회', '경쟁사가 폐업하며 설비를 싸게 판다.', [
    c('SAFE', '거절', {}),
    c('NORMAL', '일부 인수', { cash: '-MD', cost: -0.1 }),
    c('ABSURD', '전부 인수', [{ prob: 0.2, result: { cash: '-LG', cost: -0.25, quality: 1 } }, { prob: 0.4, result: { cash: '-LG', cost: -0.15 } }, { prob: 0.4, result: { cash: '-LG', cost: 0.1 } }]),
  ]),
]);

function e(id, category, name, description, choices) {
  return Object.freeze({
    id,
    category,
    name,
    title: name,
    description,
    choices: Object.freeze(choices),
  });
}

function c(type, label, outcome) {
  return Object.freeze({
    id: `${type.toLowerCase()}-${label.replace(/\s+/g, '-')}`,
    type,
    tier: type,
    label,
    outcome: Object.freeze(Array.isArray(outcome) ? outcome.map((item) => Object.freeze(item)) : outcome),
  });
}
