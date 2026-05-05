export const TUTORIAL_POPUPS = Object.freeze([
  Object.freeze({
    id: 'intro',
    trigger: 'GAME_START',
    title: 'CapiRogue',
    content: Object.freeze([
      '120층을 버텨내면 클리어입니다.',
      '매 층은 한 달입니다. 전략을 세우고 정산을 통과하세요.',
      '경영 체력이 0이 되거나 자본이 4턴 연속 음수면 게임 오버입니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'mainscreen',
    trigger: 'FIRST_MAIN_SCREEN',
    title: '시장 화면',
    content: Object.freeze([
      '가운데 수요 버블에서 화살표가 각 회사로 뻗어 나갑니다.',
      '화살표가 굵을수록 그 회사가 수요를 많이 가져가고 있는 겁니다.',
      '내 화살표를 굵게 만드는 게 목표입니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'tabs',
    trigger: 'FIRST_TAB_CLICK',
    title: '전략 탭',
    content: Object.freeze([
      '판매 탭: 이번 달 판매가와 발주량을 설정합니다.',
      '품질 탭: 공장 업그레이드로 품질을 높입니다.',
      '운영 탭: 대출 관리, 원가 절감, 마케팅을 조정합니다.',
      '다음 달로 탭: 전략 확정 후 정산을 시작합니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'external_event',
    trigger: 'FIRST_EXTERNAL_EVENT',
    title: '외부 이벤트',
    content: Object.freeze([
      '전쟁, 유가 폭등 같은 외부 상황이 발생했습니다.',
      '선택할 수 없습니다. 시장에 자동으로 반영됩니다.',
      '배경화면이 바뀌면 외부 이벤트가 진행 중이라는 뜻입니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'internal_event',
    trigger: 'FIRST_INTERNAL_EVENT',
    title: '이벤트 카드',
    content: Object.freeze([
      '회사 내부에서 사건이 발생했습니다.',
      '선택지마다 확률이 다릅니다.',
      '안전한 선택은 확실하지만 작은 결과, 도박적 선택은 크게 얻거나 잃습니다.',
      '말도 안 되는 선택지도 가끔 대박이 납니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'settlement',
    trigger: 'FIRST_SETTLEMENT',
    title: '정산 결과',
    content: Object.freeze([
      '경영 체력은 적자나 나쁜 이벤트로 줄어듭니다.',
      '모멘텀은 최근 5턴 흑자/적자 흐름입니다.',
      '모멘텀이 좋으면 보상 등급이 올라갑니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'reward',
    trigger: 'FIRST_REWARD',
    title: '보상 선택',
    content: Object.freeze([
      '5층, 10층, 20층마다 보상을 선택할 수 있습니다.',
      '모멘텀이 좋을수록 더 좋은 등급의 보상이 나옵니다.',
      'Normal / Rare / Epic / Legend 4단계입니다.',
    ]),
    skippable: true,
  }),
]);

export const TOOLTIPS = Object.freeze([
  Object.freeze({
    id: 'demand_bubble',
    target: 'cr2-demand-bubble',
    content: '전체 시장 수요입니다. 이 수요를 내 회사와 라이벌이 나눠 가집니다.',
  }),
  Object.freeze({
    id: 'health_bar',
    target: 'cr2-health-bar',
    content: '경영 체력입니다. 0이 되면 게임 오버입니다. 적자와 나쁜 이벤트로 줄어듭니다.',
  }),
  Object.freeze({
    id: 'momentum',
    target: 'cr2-momentum',
    content: '최근 5턴 흑자/적자 흐름입니다. 높을수록 보상 등급과 수요 보너스가 올라갑니다.',
  }),
  Object.freeze({
    id: 'credit_score',
    target: 'cr2-credit-score',
    content: '신용점수입니다. 대출 한도와 이자율에 영향을 줍니다. 적자를 내면 깎입니다.',
  }),
  Object.freeze({
    id: 'tab_price',
    target: 'cr2-tab-price',
    content: '판매가와 발주량을 설정합니다. 너무 높으면 수요를 잃고, 너무 낮으면 마진이 줄어듭니다.',
  }),
  Object.freeze({
    id: 'tab_quality',
    target: 'cr2-tab-quality',
    content: '공장을 업그레이드해 품질을 높입니다. 품질이 높을수록 매력도가 올라갑니다.',
  }),
  Object.freeze({
    id: 'tab_operation',
    target: 'cr2-tab-operation',
    content: '대출 관리, 원가 절감, 마케팅을 조정합니다. 이자 부담을 줄이고 수익성을 높이세요.',
  }),
  Object.freeze({
    id: 'event_safe',
    target: 'cr2-choice-safe',
    content: '안전한 선택입니다. 결과가 확실하지만 작습니다.',
  }),
  Object.freeze({
    id: 'event_normal',
    target: 'cr2-choice-normal',
    content: '일반 선택입니다. 보통 좋은 결과 확률이 높지만 손해도 있을 수 있습니다.',
  }),
  Object.freeze({
    id: 'event_gamble',
    target: 'cr2-choice-gamble',
    content: '도박적 선택입니다. 크게 얻거나 크게 잃을 수 있습니다.',
  }),
  Object.freeze({
    id: 'event_absurd',
    target: 'cr2-choice-absurd',
    content: '말도 안 되는 선택입니다. 대박 가능성이 있지만 실패 리스크가 큽니다.',
  }),
]);
