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

const TIER_STATS = Object.freeze({
  [RIVAL_TIERS.ENTRY]: Object.freeze({
    capital: 25000000,
    quality: 25,
    brand: 2,
    awareness: 0.02,
    maxHealth: 6,
  }),
  [RIVAL_TIERS.MID]: Object.freeze({
    capital: 30000000,
    quality: 55,
    brand: 25,
    awareness: 0.08,
    maxHealth: 8,
  }),
  [RIVAL_TIERS.SENIOR]: Object.freeze({
    capital: 35000000,
    quality: 70,
    brand: 45,
    awareness: 0.12,
    maxHealth: 10,
  }),
  [RIVAL_TIERS.CHAMPION]: Object.freeze({
    capital: 40000000,
    quality: 90,
    brand: 70,
    awareness: 0.2,
    maxHealth: 12,
  }),
});

// TODO: 밸런싱 필요. 현재 수치는 티어 스케일을 우선해 임시 배치.
export const RIVAL_PROFILES = Object.freeze({
  [RIVAL_TIERS.ENTRY]: Object.freeze([
    Object.freeze({
      id: 'junhyuk',
      name: '창업 3개월차 준혁',
      company: '준혁상회',
      gender: '남',
      tier: RIVAL_TIERS.ENTRY,
      floorUnlock: 3,
      sprite: '/assets/rivals/rival_entry_junhyuk.png',
      imageFile: 'rival_entry_junhyuk.png',
      stats: TIER_STATS[RIVAL_TIERS.ENTRY],
      strategy: Object.freeze({ priceMultiplier: 0.82, orderMultiplier: 0.78, marketingBudget: 150000 }),
    }),
    Object.freeze({
      id: 'sua',
      name: '알바 모아서 창업한 수아',
      company: 'SUA Works',
      gender: '여',
      tier: RIVAL_TIERS.ENTRY,
      floorUnlock: 3,
      sprite: '/assets/rivals/rival_entry_sua.png',
      imageFile: 'rival_entry_sua.png',
      stats: TIER_STATS[RIVAL_TIERS.ENTRY],
      strategy: Object.freeze({ priceMultiplier: 0.84, orderMultiplier: 0.82, marketingBudget: 180000 }),
    }),
  ]),
  [RIVAL_TIERS.MID]: Object.freeze([
    Object.freeze({
      id: 'sungjin',
      name: '대기업 퇴사한 성진',
      company: '성진인더스트리',
      gender: '남',
      tier: RIVAL_TIERS.MID,
      floorUnlock: 10,
      sprite: '/assets/rivals/rival_mid_sungjin.png',
      imageFile: 'rival_mid_sungjin.png',
      stats: TIER_STATS[RIVAL_TIERS.MID],
      strategy: Object.freeze({ priceMultiplier: 1.05, orderMultiplier: 0.94, marketingBudget: 500000 }),
    }),
    Object.freeze({
      id: 'jieun',
      name: '조용히 치고 올라오는 지은',
      company: 'JE Solutions',
      gender: '여',
      tier: RIVAL_TIERS.MID,
      floorUnlock: 10,
      sprite: '/assets/rivals/rival_mid_jieun.png',
      imageFile: 'rival_mid_jieun.png',
      stats: Object.freeze({ ...TIER_STATS[RIVAL_TIERS.MID], quality: 62, brand: 28 }),
      strategy: Object.freeze({ priceMultiplier: 1.18, orderMultiplier: 0.88, marketingBudget: 620000 }),
    }),
  ]),
  [RIVAL_TIERS.SENIOR]: Object.freeze([
    Object.freeze({
      id: 'junseo',
      name: '냉혈한 재벌 2세 준서',
      company: 'JUNSEO Group',
      gender: '남',
      tier: RIVAL_TIERS.SENIOR,
      floorUnlock: 30,
      sprite: '/assets/rivals/rival_senior_junseo.png',
      imageFile: 'rival_senior_junseo.png',
      stats: TIER_STATS[RIVAL_TIERS.SENIOR],
      strategy: Object.freeze({ priceMultiplier: 1.55, orderMultiplier: 0.94, marketingBudget: 1250000 }),
    }),
    Object.freeze({
      id: 'seoyeon',
      name: '엘리트 MBA 서연',
      company: 'Seo & Partners',
      gender: '여',
      tier: RIVAL_TIERS.SENIOR,
      floorUnlock: 30,
      sprite: '/assets/rivals/rival_senior_seoyeon.png',
      imageFile: 'rival_senior_seoyeon.png',
      stats: Object.freeze({ ...TIER_STATS[RIVAL_TIERS.SENIOR], quality: 76, brand: 52 }),
      strategy: Object.freeze({ priceMultiplier: 1.68, orderMultiplier: 0.9, marketingBudget: 1450000 }),
    }),
    Object.freeze({
      id: 'taejun',
      name: '베테랑 사냥꾼 태준',
      company: '태준홀딩스',
      gender: '남',
      tier: RIVAL_TIERS.SENIOR,
      floorUnlock: 30,
      sprite: '/assets/rivals/rival_senior_taejun.png',
      imageFile: 'rival_senior_taejun.png',
      stats: Object.freeze({ ...TIER_STATS[RIVAL_TIERS.SENIOR], quality: 66, brand: 42 }),
      strategy: Object.freeze({ priceMultiplier: 1.1, orderMultiplier: 1.26, marketingBudget: 1180000 }),
    }),
  ]),
  [RIVAL_TIERS.CHAMPION]: Object.freeze([
    Object.freeze({
      id: 'cheolmin',
      name: '시장의 지배자 철민',
      company: 'CHEOLMIN Corp',
      gender: '남',
      tier: RIVAL_TIERS.CHAMPION,
      floorUnlock: null,
      sprite: '/assets/rivals/rival_champion_cheolmin.png',
      imageFile: 'rival_champion_cheolmin.png',
      stats: TIER_STATS[RIVAL_TIERS.CHAMPION],
      strategy: Object.freeze({ priceMultiplier: 1.72, orderMultiplier: 1.22, marketingBudget: 2800000 }),
    }),
    Object.freeze({
      id: 'dogeon',
      name: '전설의 기업인 도건',
      company: '도건그룹',
      gender: '남',
      tier: RIVAL_TIERS.CHAMPION,
      floorUnlock: null,
      sprite: '/assets/rivals/rival_champion_dogeon.png',
      imageFile: 'rival_champion_dogeon.png',
      stats: Object.freeze({ ...TIER_STATS[RIVAL_TIERS.CHAMPION], quality: 86, brand: 76 }),
      strategy: Object.freeze({ priceMultiplier: 1.45, orderMultiplier: 1.38, marketingBudget: 2550000 }),
    }),
    Object.freeze({
      id: 'hyegyeong',
      name: '업계의 어머니 혜경',
      company: 'HK International',
      gender: '여',
      tier: RIVAL_TIERS.CHAMPION,
      floorUnlock: null,
      sprite: '/assets/rivals/rival_champion_hyegyeong.png',
      imageFile: 'rival_champion_hyegyeong.png',
      stats: Object.freeze({ ...TIER_STATS[RIVAL_TIERS.CHAMPION], quality: 88, brand: 84 }),
      strategy: Object.freeze({ priceMultiplier: 1.62, orderMultiplier: 1.12, marketingBudget: 3200000 }),
    }),
  ]),
});

export const RIVAL_LIST = Object.freeze(Object.values(RIVAL_PROFILES).flat());

export const RIVAL_INITIAL_CAPITAL = Object.freeze({
  [RIVAL_TIERS.ENTRY]: TIER_STATS[RIVAL_TIERS.ENTRY].capital,
  [RIVAL_TIERS.MID]: TIER_STATS[RIVAL_TIERS.MID].capital,
  [RIVAL_TIERS.SENIOR]: TIER_STATS[RIVAL_TIERS.SENIOR].capital,
  [RIVAL_TIERS.CHAMPION]: TIER_STATS[RIVAL_TIERS.CHAMPION].capital,
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
  [RIVAL_TIERS.ENTRY]: 3,
  [RIVAL_TIERS.MID]: 10,
  [RIVAL_TIERS.SENIOR]: 30,
  [RIVAL_TIERS.CHAMPION]: null,
});

export function getActiveRivals(floor, isRndUnlocked = false) {
  return Object.freeze(
    RIVAL_LIST.filter((rival) =>
      rival.floorUnlock === null
        ? isRndUnlocked
        : rival.floorUnlock <= floor,
    ),
  );
}

export function getRandomRivalByTier(tier) {
  const pool = RIVAL_PROFILES[tier] ?? [];

  if (!pool.length) {
    return null;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
