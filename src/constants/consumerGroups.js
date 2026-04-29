export const CONSUMER_GROUP_IDS = Object.freeze({
  VALUE_SEEKERS: 'valueSeekers',
  MAINSTREAM: 'mainstream',
  PREMIUM: 'premium',
  EXPERIMENTAL: 'experimental',
});

export const CONSUMER_GROUPS = Object.freeze({
  [CONSUMER_GROUP_IDS.VALUE_SEEKERS]: Object.freeze({
    id: CONSUMER_GROUP_IDS.VALUE_SEEKERS,
    label: '\uAC00\uC131\uBE44\uD30C',
    priceSensitivity: 1.25,
    qualitySensitivity: 0.82,
    awarenessSensitivity: 0.72,
  }),
  [CONSUMER_GROUP_IDS.MAINSTREAM]: Object.freeze({
    id: CONSUMER_GROUP_IDS.MAINSTREAM,
    label: '\uB300\uC911\uAD6C\uB9E4\uCE35',
    priceSensitivity: 1,
    qualitySensitivity: 1,
    awarenessSensitivity: 1,
  }),
  [CONSUMER_GROUP_IDS.PREMIUM]: Object.freeze({
    id: CONSUMER_GROUP_IDS.PREMIUM,
    label: '\uD504\uB9AC\uBBF8\uC5C4\uCE35',
    priceSensitivity: 0.72,
    qualitySensitivity: 1.36,
    awarenessSensitivity: 1.08,
  }),
  [CONSUMER_GROUP_IDS.EXPERIMENTAL]: Object.freeze({
    id: CONSUMER_GROUP_IDS.EXPERIMENTAL,
    label: '\uC2E0\uC81C\uD488\uD30C',
    priceSensitivity: 0.9,
    qualitySensitivity: 1.12,
    awarenessSensitivity: 1.42,
  }),
});
