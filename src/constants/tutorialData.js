export const TUTORIAL_POPUPS = Object.freeze([
  Object.freeze({
    id: 'intro',
    trigger: 'GAME_START',
    title: 'CapiRogue',
    content: Object.freeze([
      '120층을 버텨내면 클리어입니다.',
      '매 층은 한 달입니다. 전략을 세우고 정산을 통과하세요.',
      '경영 체력이 0이 되거나 자본이 위험 상태로 오래 유지되면 게임 오버입니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'mainscreen',
    trigger: 'FIRST_MAIN_SCREEN',
    title: '시장 화면',
    content: Object.freeze([
      '가운데 수요 버블에서 각 회사로 수요가 흘러갑니다.',
      '화살표가 굵을수록 그 회사가 수요를 많이 가져가고 있다는 뜻입니다.',
      '내 회사로 향하는 화살표를 굵게 만드는 것이 기본 목표입니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'tabs',
    trigger: 'FIRST_TAB_CLICK',
    title: '전략 탭',
    content: Object.freeze([
      '판매가 탭에서는 이번 달 판매가와 발주량을 정합니다.',
      '품질 탭에서는 상품 품질 방향을 확인합니다.',
      '운영 탭에서는 공장 작업, 마케팅, 대출을 관리합니다.',
      '다음달로 탭에서 선택을 확인한 뒤 정산을 시작합니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'external_event',
    trigger: 'FIRST_EXTERNAL_EVENT',
    title: '외부 이벤트',
    content: Object.freeze([
      '금리, 전쟁, 원자재 가격처럼 회사 밖의 변화가 발생할 수 있습니다.',
      '외부 이벤트는 선택할 수 없고 시장에 자동으로 반영됩니다.',
      '배경이나 상단 알림이 바뀌면 진행 중인 외부 변수를 확인하세요.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'internal_event',
    trigger: 'FIRST_INTERNAL_EVENT',
    title: '이벤트 카드',
    content: Object.freeze([
      '회사 내부에서 사건이 발생하면 선택지가 있는 이벤트 카드가 등장합니다.',
      '안전한 선택은 결과가 작지만 안정적이고, 도박적 선택은 크게 얻거나 잃을 수 있습니다.',
      '선택 결과는 이번 달 정산과 리포트에 반영됩니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'settlement',
    trigger: 'FIRST_SETTLEMENT',
    title: '정산 결과',
    content: Object.freeze([
      '정산 화면에서는 매출, 비용, 순이익, 점유율 변화를 확인합니다.',
      '경영 체력은 적자나 나쁜 이벤트로 줄어들 수 있습니다.',
      '모멘텀은 최근 흐름을 나타내며 보상 등급과 수요 보정에 영향을 줍니다.',
    ]),
    skippable: true,
  }),
  Object.freeze({
    id: 'reward',
    trigger: 'FIRST_REWARD',
    title: '보상 선택',
    content: Object.freeze([
      '일정 층마다 보상을 선택할 수 있습니다.',
      '모멘텀이 좋을수록 더 좋은 등급의 보상이 나올 가능성이 커집니다.',
      '체력 회복, 품질 강화, 자본 보강 같은 선택지로 다음 달을 준비하세요.',
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
    content: '최근 흐름을 나타내는 지표입니다. 높을수록 보상과 수요 보정에 유리합니다.',
  }),
  Object.freeze({
    id: 'credit_score',
    target: 'cr2-credit-score',
    content: '신용점수입니다. 대출 한도와 이자율에 영향을 줍니다.',
  }),
  Object.freeze({
    id: 'tab_price',
    target: 'cr2-tab-price',
    content: '판매가와 발주량을 설정합니다. 너무 높으면 수요를 잃고, 너무 낮으면 마진이 줄어듭니다.',
  }),
  Object.freeze({
    id: 'tab_quality',
    target: 'cr2-tab-quality',
    content: '제품 품질 방향을 확인합니다. 품질은 매력도와 브랜드에 영향을 줍니다.',
  }),
  Object.freeze({
    id: 'tab_operation',
    target: 'cr2-tab-operation',
    content: '공장 작업, 마케팅 투자, 대출 관리를 조정합니다.',
  }),
  Object.freeze({
    id: 'event_safe',
    target: 'cr2-choice-safe',
    content: '안전한 선택입니다. 결과가 작지만 예측하기 쉽습니다.',
  }),
  Object.freeze({
    id: 'event_normal',
    target: 'cr2-choice-normal',
    content: '일반 선택입니다. 위험과 보상이 중간 수준입니다.',
  }),
  Object.freeze({
    id: 'event_gamble',
    target: 'cr2-choice-gamble',
    content: '도박적 선택입니다. 성공하면 크지만 실패 위험도 큽니다.',
  }),
  Object.freeze({
    id: 'event_absurd',
    target: 'cr2-choice-absurd',
    content: '말도 안 되는 선택입니다. 대박과 손해 폭이 모두 큽니다.',
  }),
]);
