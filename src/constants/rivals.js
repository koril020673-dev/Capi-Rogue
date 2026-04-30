export const RIVAL_TIERS = Object.freeze({
  ENTRY: 1,
  VALUE: 1,
  MID: 2,
  SPECIALIST: 2,
  SENIOR: 3,
  ELITE: 3,
  CHAMPION: 4,
});

export const RIVAL_TIER_LABELS = Object.freeze({
  [RIVAL_TIERS.ENTRY]: 'Entry',
  [RIVAL_TIERS.MID]: 'Mid',
  [RIVAL_TIERS.SENIOR]: 'Senior',
  [RIVAL_TIERS.CHAMPION]: 'Champion',
});

export const RIVAL_INITIAL_CAPITAL = Object.freeze({
  [RIVAL_TIERS.ENTRY]: 25000000,
  [RIVAL_TIERS.MID]: 30000000,
  [RIVAL_TIERS.SENIOR]: 35000000,
  [RIVAL_TIERS.CHAMPION]: 40000000,
});

export const RIVAL_PROFILES = Object.freeze({
  [RIVAL_TIERS.ENTRY]: Object.freeze([
    Object.freeze({
      id: 'junhyuk',
      name: '창업 3개월차 문준혁',
      gender: '남',
      imageFile: 'rival_entry_junhyuk.png',
    }),
    Object.freeze({
      id: 'sua',
      name: '알바비 모아서 창업한 박수아',
      gender: '여',
      imageFile: 'rival_entry_sua.png',
    }),
  ]),
  [RIVAL_TIERS.MID]: Object.freeze([
    Object.freeze({
      id: 'sungjin',
      name: '대기업 퇴사하고 창업한 최성진',
      gender: '남',
      imageFile: 'rival_mid_sungjin.png',
    }),
    Object.freeze({
      id: 'jieun',
      name: '침착한 상승세 이지은',
      gender: '여',
      imageFile: 'rival_mid_jieun.png',
    }),
  ]),
  [RIVAL_TIERS.SENIOR]: Object.freeze([
    Object.freeze({
      id: 'junseo',
      name: '재벌 2세 광준서',
      gender: '남',
      imageFile: 'rival_senior_junseo.png',
    }),
    Object.freeze({
      id: 'seoyeon',
      name: '엘리트 MBA 최서연',
      gender: '여',
      imageFile: 'rival_senior_seoyeon.png',
    }),
    Object.freeze({
      id: 'taejun',
      name: '베테랑 사기꾼 고태준',
      gender: '남',
      imageFile: 'rival_senior_taejun.png',
    }),
  ]),
  [RIVAL_TIERS.CHAMPION]: Object.freeze([
    Object.freeze({
      id: 'cheolmin',
      name: '시장의 지배자 김철민',
      gender: '남',
      imageFile: 'rival_champion_cheolmin.png',
    }),
    Object.freeze({
      id: 'dogeon',
      name: '전설의 기업인 곽도건',
      gender: '남',
      imageFile: 'rival_champion_dogeon.png',
    }),
    Object.freeze({
      id: 'hyegyeong',
      name: '업계의 어머니 계혜경',
      gender: '여',
      imageFile: 'rival_champion_hyegyeong.png',
    }),
  ]),
});

export const RIVAL_NAME_POOL = Object.freeze({
  [RIVAL_TIERS.ENTRY]: Object.freeze(RIVAL_PROFILES[RIVAL_TIERS.ENTRY].map((profile) => profile.name)),
  [RIVAL_TIERS.MID]: Object.freeze(RIVAL_PROFILES[RIVAL_TIERS.MID].map((profile) => profile.name)),
  [RIVAL_TIERS.SENIOR]: Object.freeze(RIVAL_PROFILES[RIVAL_TIERS.SENIOR].map((profile) => profile.name)),
  [RIVAL_TIERS.CHAMPION]: Object.freeze(RIVAL_PROFILES[RIVAL_TIERS.CHAMPION].map((profile) => profile.name)),
});

export const RIVAL_FOCUSES = Object.freeze({
  VALUE: 'value',
  BRAND: 'brand',
  QUALITY: 'quality',
  DUAL: 'dual',
  ALL: 'all',
});

export const RIVAL_JOIN_FLOORS = Object.freeze({
  [RIVAL_TIERS.ENTRY]: 1,
  [RIVAL_TIERS.MID]: 10,
  [RIVAL_TIERS.SENIOR]: 30,
  [RIVAL_TIERS.CHAMPION]: 60,
});
