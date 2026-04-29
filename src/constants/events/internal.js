export const CHOICE_TIERS = Object.freeze({
  SAFE: 'safe',
  NORMAL: 'normal',
  GAMBLE: 'gamble',
  ABSURD: 'absurd',
});

export const INTERNAL_EVENTS = Object.freeze([
  Object.freeze({
    id: 'factory-night',
    title: '\uC57C\uAC04 \uACF5\uC7A5 \uC81C\uC548',
    description: '\uBC18\uC7A5\uC774 \uD55C \uB2EC\uB9CC \uC57C\uAC04\uC870\uB97C \uB3CC\uB9AC\uC790\uACE0 \uD569\uB2C8\uB2E4.',
    choices: Object.freeze([
      Object.freeze({
        id: 'keep-day',
        tier: CHOICE_TIERS.SAFE,
        label: '\uC8FC\uAC04\uC870\uB9CC \uC720\uC9C0',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 1,
            label: '\uC548\uC815',
            description: '\uBB34\uB9AC\uD558\uC9C0 \uC54A\uC544 \uC190\uC2E4\uC744 \uD53C\uD569\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 400000 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'limited-night',
        tier: CHOICE_TIERS.NORMAL,
        label: '\uD575\uC2EC \uB77C\uC778\uB9CC \uC57C\uAC04 \uAC00\uB3D9',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.7,
            label: '\uC131\uACF5',
            description: '\uB0A9\uAE30\uB97C \uB9DE\uCD94\uACE0 \uC18C\uD3ED \uC774\uC775\uC744 \uC5BB\uC2B5\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 1400000, awareness: 0.01 }),
          }),
          Object.freeze({
            weight: 0.3,
            label: '\uD53C\uB85C',
            description: '\uBD88\uB7C9\uB960\uC774 \uC62C\uB77C \uBE0C\uB79C\uB4DC\uAC00 \uC190\uC0C1\uB429\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -930000, brand: -1 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'full-night',
        tier: CHOICE_TIERS.GAMBLE,
        label: '\uC804 \uB77C\uC778 \uC57C\uAC04 \uAC00\uB3D9',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.3,
            label: '\uB300\uBC15',
            description: '\uC7AC\uACE0 \uC5C6\uC774 \uC218\uC694\uB97C \uBC1B\uC544\uB0C5\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 3700000, awareness: 0.03 }),
          }),
          Object.freeze({
            weight: 0.7,
            label: '\uC190\uC2E4',
            description: '\uACFC\uB85C\uC640 \uBD88\uB7C9\uC774 \uD55C\uBC88\uC5D0 \uD130\uC9D1\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -2800000, health: -1, brand: -2 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'sleep-in-factory',
        tier: CHOICE_TIERS.ABSURD,
        label: '\uC0AC\uC7A5\uC774 \uACF5\uC7A5\uC5D0\uC11C \uC790\uBA74\uC11C \uC9C0\uD718',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.2,
            label: '\uC804\uC124',
            description: '\uD300\uC6CC\uD06C\uAC00 \uC0B4\uC544\uB098\uACE0 \uB0A9\uAE30\uAC00 \uAC1C\uC120\uB429\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 4700000, brand: 1, awareness: 0.04 }),
          }),
          Object.freeze({
            weight: 0.4,
            label: '\uBB34\uD6A8',
            description: '\uB2E4\uB4E4 \uC5B4\uC0C9\uD574\uD588\uC9C0\uB9CC \uD070 \uBB38\uC81C\uB294 \uC5C6\uC2B5\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 0 }),
          }),
          Object.freeze({
            weight: 0.4,
            label: '\uC2E4\uD328',
            description: '\uBC29\uBB38 \uD6C4\uAE30\uAC00 \uC774\uC0C1\uD55C \uBC29\uD5A5\uC73C\uB85C \uD37C\uC9D1\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -1400000, awareness: -0.02 }),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: 'influencer-call',
    title: '\uC778\uD50C\uB8E8\uC5B8\uC11C \uC804\uD654',
    description: '\uC720\uBA85 \uD06C\uB9AC\uC5D0\uC774\uD130\uAC00 \uD55C\uC815 \uACF5\uB3D9\uAD6C\uB9E4\uB97C \uC81C\uC548\uD569\uB2C8\uB2E4.',
    choices: Object.freeze([
      Object.freeze({
        id: 'decline',
        tier: CHOICE_TIERS.SAFE,
        label: '\uC815\uC911\uD788 \uAC70\uC808',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 1,
            label: '\uBCF4\uC874',
            description: '\uB9C8\uCF00\uD305\uBE44\uB97C \uC544\uB08D\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 500000 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'small-collab',
        tier: CHOICE_TIERS.NORMAL,
        label: '\uC18C\uADDC\uBAA8 \uACF5\uB3D9\uAD6C\uB9E4',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.7,
            label: '\uD765\uD589',
            description: '\uC778\uC9C0\uB3C4\uAC00 \uC0C1\uC2B9\uD569\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 870000, awareness: 0.06 }),
          }),
          Object.freeze({
            weight: 0.3,
            label: '\uBBF8\uC9C0\uADFC',
            description: '\uC218\uC218\uB8CC\uAC00 \uD6A8\uACFC\uBCF4\uB2E4 \uCEE4\uC84C\uC2B5\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -1170000, awareness: 0.01 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'exclusive-drop',
        tier: CHOICE_TIERS.GAMBLE,
        label: '\uB3C5\uC810 \uB4DC\uB86D',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.3,
            label: '\uC7AD\uD31F',
            description: '\uC774\uB984\uC774 \uD55C\uB2EC\uB0B4\uB0B4 \uD68C\uC790\uB429\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 4200000, awareness: 0.12, brand: 1 }),
          }),
          Object.freeze({
            weight: 0.7,
            label: '\uBC18\uD488',
            description: '\uAE30\uB300\uAC10\uB9CC \uD0A4\uC6B0\uACE0 \uC218\uC694\uB97C \uB193\uCE69\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -3000000, brand: -1 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'mascot-dance',
        tier: CHOICE_TIERS.ABSURD,
        label: '\uD68C\uC0AC \uB9C8\uC2A4\uCF54\uD2B8\uAC00 \uC0DD\uBC29\uC1A1\uC5D0\uC11C \uCDA4\uCD94\uAE30',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.2,
            label: '\uC2E0\uB4DC\uB86C',
            description: '\uB0A8\uB140\uB178\uC18C\uAC00 \uBAA8\uB450 \uB530\uB77C\uD569\uB2C8\uB2E4.',
            effects: Object.freeze({ awareness: 0.18, capital: 3000000 }),
          }),
          Object.freeze({
            weight: 0.4,
            label: '\uBB34\uB09C',
            description: '\uC9E7\uC740 \uC6C3\uC74C\uB9CC \uB0A8\uC2B5\uB2C8\uB2E4.',
            effects: Object.freeze({ awareness: 0.02 }),
          }),
          Object.freeze({
            weight: 0.4,
            label: '\uC5ED\uD6A8\uACFC',
            description: '\uB300\uD45C \uC81C\uD488\uBCF4\uB2E4 \uCDA4\uB9CC \uAE30\uC5B5\uB0A9\uB2C8\uB2E4.',
            effects: Object.freeze({ brand: -2, capital: -730000 }),
          }),
        ]),
      }),
    ]),
  }),
  Object.freeze({
    id: 'supplier-lunch',
    title: '\uACF5\uAE09\uC0AC \uC810\uC2EC',
    description: '\uD575\uC2EC \uBD80\uD488 \uACF5\uAE09\uC0AC\uAC00 \uAC00\uACA9 \uC870\uC815\uC744 \uC554\uC2DC\uD569\uB2C8\uB2E4.',
    choices: Object.freeze([
      Object.freeze({
        id: 'standard-contract',
        tier: CHOICE_TIERS.SAFE,
        label: '\uD45C\uC900 \uACC4\uC57D \uC720\uC9C0',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 1,
            label: '\uC548\uC815',
            description: '\uAD00\uACC4\uB294 \uBB34\uB09C\uD558\uACE0 \uC6D0\uAC00\uB294 \uC720\uC9C0\uB429\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 330000 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'volume-promise',
        tier: CHOICE_TIERS.NORMAL,
        label: '\uBB3C\uB7C9 \uBCF4\uC7A5\uC73C\uB85C \uB124\uACE0',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.7,
            label: '\uC778\uD558',
            description: '\uC6D0\uAC00\uAC00 \uB0AE\uC544\uC9D1\uB2C8\uB2E4.',
            effects: Object.freeze({ unitCostMultiplier: 0.97 }),
          }),
          Object.freeze({
            weight: 0.3,
            label: '\uACFC\uC57D\uC18D',
            description: '\uB0A9\uAE30 \uC555\uBC15\uC73C\uB85C \uD604\uAE08\uC774 \uBE60\uC838\uB098\uAC11\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -1400000 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'hardball',
        tier: CHOICE_TIERS.GAMBLE,
        label: '\uAC15\uD558\uAC8C \uBC00\uC5B4\uBD99\uC774\uAE30',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.3,
            label: '\uC131\uACF5',
            description: '\uACF5\uAE09\uC0AC\uAC00 \uB300\uD3ED \uC778\uD558\uB97C \uBC1B\uC544\uB4E4\uC785\uB2C8\uB2E4.',
            effects: Object.freeze({ unitCostMultiplier: 0.92, capital: 1000000 }),
          }),
          Object.freeze({
            weight: 0.7,
            label: '\uD30C\uC5F4',
            description: '\uAE34\uAE09 \uB300\uCCB4 \uC870\uB2EC\uB85C \uBE44\uC6A9\uC774 \uD3ED\uB4F1\uD569\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -3170000, health: -1 }),
          }),
        ]),
      }),
      Object.freeze({
        id: 'karaoke-contract',
        tier: CHOICE_TIERS.ABSURD,
        label: '\uACC4\uC57D\uC11C\uB97C \uB178\uB798\uBC29 \uC810\uC218\uB85C \uACB0\uC815',
        outcomes: Object.freeze([
          Object.freeze({
            weight: 0.2,
            label: '\uB9CC\uC810',
            description: '\uBD84\uC704\uAE30\uAC00 \uD480\uB824 \uC0C1\uC0DD \uACC4\uC57D\uC774 \uB429\uB2C8\uB2E4.',
            effects: Object.freeze({ unitCostMultiplier: 0.9, brand: 1 }),
          }),
          Object.freeze({
            weight: 0.4,
            label: '\uC560\uB9E4',
            description: '\uC5B4\uB5A4 \uC758\uBBF8\uC778\uC9C0 \uBAA8\uB450\uAC00 \uBAA8\uB985\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: 0 }),
          }),
          Object.freeze({
            weight: 0.4,
            label: '\uC2E4\uC218',
            description: '\uD68C\uC2DD\uBE44\uB9CC \uB0A8\uC558\uC2B5\uB2C8\uB2E4.',
            effects: Object.freeze({ capital: -1000000 }),
          }),
        ]),
      }),
    ]),
  }),
]);
