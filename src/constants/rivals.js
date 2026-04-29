export const RIVAL_TIERS = Object.freeze({
  VALUE: 1,
  SPECIALIST: 2,
  ELITE: 3,
  CHAMPION: 4,
});

export const RIVAL_INITIAL_CAPITAL = Object.freeze({
  [RIVAL_TIERS.VALUE]: 25000000,
  [RIVAL_TIERS.SPECIALIST]: 30000000,
  [RIVAL_TIERS.ELITE]: 35000000,
  [RIVAL_TIERS.CHAMPION]: 40000000,
});

export const RIVAL_NAME_POOL = Object.freeze({
  [RIVAL_TIERS.VALUE]: Object.freeze([
    '반바지마트',
    '꼬마상회',
    '오성스토어',
    '미니플렉스',
    '소소마켓',
  ]),
  [RIVAL_TIERS.SPECIALIST]: Object.freeze([
    '트레이더스',
    '미드마트',
    '실력파상사',
    '중견브랜드',
    '스탠다드코',
  ]),
  [RIVAL_TIERS.ELITE]: Object.freeze([
    '천왕기업',
    '엘리트코퍼',
    '파워브랜드',
    '퀄리티킹',
    '마스터플렉스',
  ]),
  [RIVAL_TIERS.CHAMPION]: Object.freeze([
    '챔피언코퍼',
    '울티마그룹',
    '서버린마켓',
    '토탈브랜드',
    '에이스코퍼',
  ]),
});

export const RIVAL_FOCUSES = Object.freeze({
  VALUE: 'value',
  BRAND: 'brand',
  QUALITY: 'quality',
  DUAL: 'dual',
  ALL: 'all',
});

export const RIVAL_JOIN_FLOORS = Object.freeze({
  [RIVAL_TIERS.VALUE]: 1,
  [RIVAL_TIERS.SPECIALIST]: 10,
  [RIVAL_TIERS.ELITE]: 30,
  [RIVAL_TIERS.CHAMPION]: 60,
});
