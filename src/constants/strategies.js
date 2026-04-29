export const STRATEGY_TABS = Object.freeze({
  PRICE: 'price',
  QUALITY: 'quality',
  OPERATIONS: 'operations',
  ADVANCE: 'advance',
});

export const STRATEGY_TAB_LABELS = Object.freeze({
  [STRATEGY_TABS.PRICE]: '\uD310\uB9E4',
  [STRATEGY_TABS.QUALITY]: '\uD488\uC9C8',
  [STRATEGY_TABS.OPERATIONS]: '\uC6B4\uC601',
  [STRATEGY_TABS.ADVANCE]: '\uB2E4\uC74C \uB2EC\uB85C',
});

export const PRICE_STRATEGY_IDS = Object.freeze({
  COST_1_3: 'cost-1-3',
  COST_2: 'cost-2',
  COST_3: 'cost-3',
  CUSTOM: 'custom',
});

export const PRICE_OPTIONS = Object.freeze([
  Object.freeze({
    id: PRICE_STRATEGY_IDS.COST_1_3,
    label: '\uC6D0\uAC00 \u00D7 1.3',
    multiplier: 1.3,
    tier: 'low',
  }),
  Object.freeze({
    id: PRICE_STRATEGY_IDS.COST_2,
    label: '\uC6D0\uAC00 \u00D7 2',
    multiplier: 2,
    tier: 'mid',
  }),
  Object.freeze({
    id: PRICE_STRATEGY_IDS.COST_3,
    label: '\uC6D0\uAC00 \u00D7 3',
    multiplier: 3,
    tier: 'high',
  }),
  Object.freeze({
    id: PRICE_STRATEGY_IDS.CUSTOM,
    label: '\uC9C1\uC811 \uC785\uB825',
    multiplier: null,
    tier: 'custom',
  }),
]);

export const SALES_CONTROL_IDS = Object.freeze({
  PRICE: 'price',
  QUANTITY: 'quantity',
});

export const SALES_QUANTITY_IDS = Object.freeze({
  CONSERVATIVE: 'conservative',
  STANDARD: 'standard',
  AGGRESSIVE: 'aggressive',
  CUSTOM: 'custom',
});

export const SALES_QUANTITY_OPTIONS = Object.freeze([
  Object.freeze({
    id: SALES_QUANTITY_IDS.CONSERVATIVE,
    label: '\uBCF4\uC218\uC801',
    ratio: 0.4,
  }),
  Object.freeze({
    id: SALES_QUANTITY_IDS.STANDARD,
    label: '\uD45C\uC900',
    ratio: 0.55,
  }),
  Object.freeze({
    id: SALES_QUANTITY_IDS.AGGRESSIVE,
    label: '\uACF5\uACA9\uC801',
    ratio: 0.72,
  }),
  Object.freeze({
    id: SALES_QUANTITY_IDS.CUSTOM,
    label: '\uC9C1\uC811 \uC785\uB825',
    ratio: null,
  }),
]);

export const QUALITY_STRATEGY_IDS = Object.freeze({
  BEST: 'best',
  BEST_0_8: 'best-0-8',
  BEST_0_5: 'best-0-5',
  BEST_0_3: 'best-0-3',
});

export const QUALITY_OPTIONS = Object.freeze([
  Object.freeze({
    id: QUALITY_STRATEGY_IDS.BEST,
    label: '\uCD5C\uACE0 \uD488\uC9C8',
    multiplier: 1,
    tier: 'high',
  }),
  Object.freeze({
    id: QUALITY_STRATEGY_IDS.BEST_0_8,
    label: '\uCD5C\uACE0 \uD488\uC9C8 \u00D7 0.8',
    multiplier: 0.8,
    tier: 'mid',
  }),
  Object.freeze({
    id: QUALITY_STRATEGY_IDS.BEST_0_5,
    label: '\uCD5C\uACE0 \uD488\uC9C8 \u00D7 0.5',
    multiplier: 0.5,
    tier: 'low',
  }),
  Object.freeze({
    id: QUALITY_STRATEGY_IDS.BEST_0_3,
    label: '\uCD5C\uACE0 \uD488\uC9C8 \u00D7 0.3',
    multiplier: 0.3,
    tier: 'very-low',
  }),
]);

export const OPERATION_STRATEGY_IDS = Object.freeze({
  FACTORY_UPGRADE: 'factory-upgrade',
  BANKING: 'banking',
  MARKETING: 'marketing',
});

export const OPERATION_OPTIONS = Object.freeze([
  Object.freeze({
    id: OPERATION_STRATEGY_IDS.FACTORY_UPGRADE,
    label: '\uACF5\uC7A5 \uAD00\uB9AC',
    effect: 'factory-upgrade',
  }),
  Object.freeze({
    id: OPERATION_STRATEGY_IDS.BANKING,
    label: '\uC740\uD589 \uC5C5\uBB34',
    effect: 'banking',
  }),
  Object.freeze({
    id: OPERATION_STRATEGY_IDS.MARKETING,
    label: '\uB9C8\uCF00\uD305',
    effect: 'marketing',
  }),
]);

export const STRATEGY_WARNING_IDS = Object.freeze({
  VOLUME: 'volume',
  PREMIUM: 'premium',
  NO_MARGIN: 'no-margin',
  BRAND_RISK: 'brand-risk',
  AWARENESS_FIRST: 'awareness-first',
});

export const STRATEGY_WARNING_LABELS = Object.freeze({
  [STRATEGY_WARNING_IDS.VOLUME]: '\uBC15\uB9AC\uB2E4\uB9E4 \uC804\uB7B5',
  [STRATEGY_WARNING_IDS.PREMIUM]: '\uD504\uB9AC\uBBF8\uC5C4 \uC804\uB7B5',
  [STRATEGY_WARNING_IDS.NO_MARGIN]:
    '\u26A0\uFE0F \uC218\uC775\uC131 \uC704\uD5D8 \u2014 \uB9C8\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4',
  [STRATEGY_WARNING_IDS.BRAND_RISK]:
    '\u26A0\uFE0F \uBE0C\uB79C\uB4DC \uB9AC\uC2A4\uD06C \u2014 \uACE0\uAC1D \uC774\uD0C8 \uAC00\uB2A5',
  [STRATEGY_WARNING_IDS.AWARENESS_FIRST]: '\uC778\uC9C0\uB3C4 \uC120\uC810 \uC804\uB7B5',
});

export const STRATEGY_WARNING_RULES = Object.freeze([
  Object.freeze({
    id: STRATEGY_WARNING_IDS.VOLUME,
    priceTier: 'low',
    qualityTier: ['low', 'very-low'],
  }),
  Object.freeze({
    id: STRATEGY_WARNING_IDS.PREMIUM,
    priceTier: 'high',
    qualityTier: 'high',
  }),
  Object.freeze({
    id: STRATEGY_WARNING_IDS.NO_MARGIN,
    priceTier: 'low',
    qualityTier: 'high',
  }),
  Object.freeze({
    id: STRATEGY_WARNING_IDS.BRAND_RISK,
    priceTier: 'high',
    qualityTier: ['low', 'very-low'],
  }),
  Object.freeze({
    id: STRATEGY_WARNING_IDS.AWARENESS_FIRST,
    priceTier: 'low',
    marketingTier: 'high',
  }),
]);

export const MARKETING_TIERS = Object.freeze({
  NONE: 'none',
  NORMAL: 'normal',
  HIGH: 'high',
});

export const FACTORY_UPGRADE_FOCUS = Object.freeze({
  NONE: 'none',
  QUALITY: 'quality',
  COST: 'cost',
});

export const BANK_ACTION_IDS = Object.freeze({
  NONE: 'none',
  BORROW: 'borrow',
  REPAY: 'repay',
});

export const DEFAULT_STRATEGY_SELECTION = Object.freeze({
  activeTab: STRATEGY_TABS.PRICE,
  salesControlId: SALES_CONTROL_IDS.PRICE,
  priceOptionId: PRICE_STRATEGY_IDS.COST_2,
  customPrice: 40000,
  salesQuantityOptionId: SALES_QUANTITY_IDS.STANDARD,
  customSalesQuantity: 550,
  qualityOptionId: QUALITY_STRATEGY_IDS.BEST_0_8,
  operationOptionId: OPERATION_STRATEGY_IDS.FACTORY_UPGRADE,
  factoryUpgradeFocus: FACTORY_UPGRADE_FOCUS.NONE,
  bankActionId: BANK_ACTION_IDS.NONE,
  bankBorrowAmount: 2000000,
  bankRepayAmount: 1000000,
  marketingSpend: 1500000,
  marketingTier: MARKETING_TIERS.NORMAL,
});
