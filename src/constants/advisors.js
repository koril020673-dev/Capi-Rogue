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
    description: '\uC2DC\uC7A5\uC744 \uBE60\uB974\uAC8C \uC7A5\uC545\uD55C\uB2E4. \uCCB4\uB825\uC774 \uC57D\uD55C \uB300\uC2E0 \uB9E4\uB825\uB3C4\uAC00 \uB192\uB2E4.',
    passive: Object.freeze({
      attractionBonus: 0.07,
      maxHealth: 8,
    }),
    diagnosisStyle: '\uACF5\uACA9\uC801',
    themeColor: '#DC143C',
  }),
  Object.freeze({
    id: ADVISOR_IDS.GUARDIAN,
    name: 'The Guardian',
    style: '\uC548\uC815\uD615',
    description: '\uC190\uC2E4\uC744 \uB9C9\uB294 \uB370 \uD2B9\uD654\uB418\uC5B4 \uC788\uB2E4. \uC131\uC7A5\uC740 \uB290\uB9AC\uC9C0\uB9CC \uBB34\uB108\uC9C0\uC9C0 \uC54A\uB294\uB2E4.',
    passive: Object.freeze({
      healthDecreaseReduction: 1,
      orderCapMultiplier: 0.9,
    }),
    diagnosisStyle: '\uC548\uC815\uC801',
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
    }),
    diagnosisStyle: '\uBD84\uC11D\uC801',
    themeColor: '#00FF41',
  }),
  Object.freeze({
    id: ADVISOR_IDS.GAMBLER,
    name: 'The Gambler',
    style: '\uB3C4\uBC15\uD615',
    description: '\uC774\uBCA4\uD2B8\uC5D0 \uBAA8\uB4E0 \uAC83\uC744 \uAC74\uB2E4. \uD06C\uB808\uB527\uC73C\uB85C\uB9CC \uCCB4\uB825\uC744 \uD68C\uBCF5\uD560 \uC218 \uC788\uB2E4.',
    passive: Object.freeze({
      gamblingOddsBonus: 0.15,
      absurdOddsBonus: 0.15,
      healthRecoveryOnlyByCredit: true,
    }),
    diagnosisStyle: '\uB3C4\uBC15\uC801',
    themeColor: '#FFD700',
  }),
]);
