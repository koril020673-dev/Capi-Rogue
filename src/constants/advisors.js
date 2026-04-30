export const ADVISOR_IDS = Object.freeze({
  RAIDER: 'raider',
  GUARDIAN: 'guardian',
  ANALYST: 'analyst',
  GAMBLER: 'gambler',
});

export const ADVISORS = Object.freeze([
  Object.freeze({
    id: ADVISOR_IDS.RAIDER,
    name: 'The Raider',
    style: '\uACF5\uACA9\uD615',
    description: '\uB0AE\uC740 \uAC00\uACA9\uACFC \uBE60\uB978 \uBAA8\uBA58\uD140\uC73C\uB85C \uC2DC\uC7A5\uC744 \uACF5\uACA9\uC801\uC73C\uB85C \uC7A5\uC545\uD55C\uB2E4.',
    passive: Object.freeze({
      attractionBonus: 0.07,
      momentumGrowthMultiplier: 1.5,
      lowPriceAttractionBonusMin: 0.05,
      lowPriceAttractionBonusMax: 0.1,
      maxHealth: 8,
    }),
    diagnosisStyle: 'aggressive',
    themeColor: '#DC143C',
  }),
  Object.freeze({
    id: ADVISOR_IDS.GUARDIAN,
    name: 'The Guardian',
    style: '\uC548\uC815\uD615',
    description: '\uC190\uC2E4\uACFC \uBD80\uCC44 \uB9AC\uC2A4\uD06C\uB97C \uC904\uC774\uBA70 \uD68C\uC0AC\uAC00 \uBB34\uB108\uC9C0\uC9C0 \uC54A\uAC8C \uBC84\uD2F0\uB294 \uB370 \uD2B9\uD654\uB418\uC5B4 \uC788\uB2E4.',
    passive: Object.freeze({
      healthDecreaseReduction: 1,
      loanInterestMultiplier: 0.9,
      deficitHealthLossChanceReduction: 0.2,
      orderCapMultiplier: 0.9,
      momentumGrowthMultiplier: 0.8,
    }),
    diagnosisStyle: 'defensive',
    themeColor: '#00AA00',
  }),
  Object.freeze({
    id: ADVISOR_IDS.ANALYST,
    name: 'The Analyst',
    style: '\uBD84\uC11D\uD615',
    description: '\uC815\uBCF4 \uC6B0\uC704\uB85C \uC2F8\uC6B4\uB2E4. \uB77C\uC774\uBC8C \uC815\uBCF4\uAC00 \uCD94\uAC00 \uACF5\uAC1C\uB418\uACE0 \uD06C\uB808\uB527\uC774 \uB354 \uB4E4\uC5B4\uC628\uB2E4.',
    passive: Object.freeze({
      revealExtraRivalInfo: true,
      extraCreditPerReward: 1,
      phaseWarningTurns: 1,
      directStatBonus: 0,
      slowEarlyCreditGain: true,
    }),
    diagnosisStyle: 'analytical',
    themeColor: '#00FF41',
  }),
  Object.freeze({
    id: ADVISOR_IDS.GAMBLER,
    name: 'The Gambler',
    style: '\uB3C4\uBC15\uD615',
    description: '\uC774\uBCA4\uD2B8\uC5D0 \uBAA8\uB4E0 \uAC83\uC744 \uAC74\uB2E4. \uC704\uD5D8\uD55C \uC120\uD0DD\uC9C0\uAC00 \uB354 \uC790\uC8FC \uC624\uACE0 \uD55C\uBC29\uC774 \uCEE4\uC9C4\uB2E4.',
    passive: Object.freeze({
      gamblingOddsBonus: 0.15,
      absurdOddsBonus: 0.15,
      extraEventCardsPerTurn: 1,
      healthRecoveryOnlyByCredit: true,
      externalEventEffectMultiplier: 1.3,
    }),
    diagnosisStyle: 'gambler',
    themeColor: '#FFD700',
  }),
]);
