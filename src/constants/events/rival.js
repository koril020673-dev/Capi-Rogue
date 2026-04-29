export const RIVAL_EVENT_TIERS = Object.freeze({
  ENTRY: 1,
  MID: 2,
  SENIOR: 3,
  CHAMPION: 4,
});

export const RIVAL_EVENTS = Object.freeze([
  Object.freeze({
    id: 'R01',
    name: '가격 전쟁 선포',
    minRivalTier: 'ENTRY',
    message: (rivalName) => `${rivalName}이 판매가를 20% 인하했다.`,
    effect: Object.freeze({ rivalPriceMultiplier: 0.8, rivalShareBonus: 0.1, playerDemandPenalty: 0.08, duration: 1 }),
  }),
  Object.freeze({
    id: 'R02',
    name: '공격적 마케팅',
    minRivalTier: 'ENTRY',
    message: (rivalName) => `${rivalName}이 대규모 광고를 집행했다.`,
    effect: Object.freeze({ rivalAwarenessBonus: 20, duration: 1 }),
  }),
  Object.freeze({
    id: 'R03',
    name: '품질 업그레이드',
    minRivalTier: 'MID',
    message: (rivalName) => `${rivalName}이 생산라인을 개선했다.`,
    effect: Object.freeze({ rivalQualityTierUp: 1, duration: 1 }),
  }),
  Object.freeze({
    id: 'R04',
    name: '신제품 출시',
    minRivalTier: 'MID',
    message: (rivalName) => `${rivalName}이 신제품을 출시했다.`,
    effect: Object.freeze({ rivalDemandBonus: 0.15, duration: 2 }),
  }),
  Object.freeze({
    id: 'R05',
    name: '덤핑',
    minRivalTier: 'MID',
    message: (rivalName) => `${rivalName}이 원가 이하로 팔기 시작했다.`,
    effect: Object.freeze({ rivalShareBonus: 0.15, rivalHealthPenalty: 1, duration: 1 }),
  }),
  Object.freeze({
    id: 'R06',
    name: '브랜드 콜라보',
    minRivalTier: 'SENIOR',
    message: (rivalName) => `${rivalName}이 유명 브랜드와 협업했다.`,
    effect: Object.freeze({ rivalBrandBonus: 3, rivalAwarenessBonus: 15, duration: 1 }),
  }),
  Object.freeze({
    id: 'R07',
    name: '공장 증설',
    minRivalTier: 'SENIOR',
    message: (rivalName) => `${rivalName}이 생산량을 대폭 늘렸다.`,
    effect: Object.freeze({ rivalOrderCapMultiplier: 1.3, duration: 2 }),
  }),
  Object.freeze({
    id: 'R08',
    name: '특허 공세',
    minRivalTier: 'SENIOR',
    message: (rivalName) => `${rivalName}이 특허를 내세워 압박한다.`,
    effect: Object.freeze({ playerQualityChoiceLock: 1, duration: 1 }),
  }),
  Object.freeze({
    id: 'R09',
    name: '인재 스카우트',
    minRivalTier: 'CHAMPION',
    message: (rivalName) => `${rivalName}이 업계 핵심 인재를 영입했다.`,
    effect: Object.freeze({ rivalAttractionBonus: 0.1, duration: 3 }),
  }),
  Object.freeze({
    id: 'R10',
    name: '시장 독점 시도',
    minRivalTier: 'CHAMPION',
    message: (rivalName) => `${rivalName}이 유통망을 장악하려 한다.`,
    effect: Object.freeze({ playerAwarenessGrowthMultiplier: 0.7, duration: 2 }),
  }),
]);
