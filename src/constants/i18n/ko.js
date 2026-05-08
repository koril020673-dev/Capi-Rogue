export const ko = Object.freeze({
  dictionary: Object.freeze({
    demand: Object.freeze({
      term: '수요',
      definition: '소비자가 특정 가격에서 구매하고자 하는 재화나 서비스의 양입니다.',
      game: '이 게임에서 수요는 매 턴 시장 전체가 살 수 있는 총량입니다. 경기 국면과 모멘텀에 따라 달라집니다.',
    }),
    supply: Object.freeze({
      term: '공급',
      definition: '생산자가 특정 가격에서 판매하고자 하는 재화나 서비스의 양입니다.',
      game: '이 게임에서 발주량이 공급에 해당합니다. 발주량이 수요보다 많으면 재고가 남고 원가 손실이 발생합니다.',
    }),
    totalDemand: Object.freeze({
      term: '총수요',
      definition: '한 시장에서 일정 기간 동안 구매될 수 있는 전체 수요입니다.',
      game: '수요 버블에 표시되는 값입니다. 내 회사와 라이벌이 이 총수요를 나누어 가져갑니다.',
    }),
    salesVolume: Object.freeze({
      term: '판매량',
      definition: '실제로 팔린 제품의 개수입니다.',
      game: '수요, 점유율, 발주량 중 가장 제한적인 값에 따라 결정됩니다.',
    }),
    orderAmount: Object.freeze({
      term: '발주량',
      definition: '이번 달 생산하거나 확보할 제품 수량입니다.',
      game: '발주량이 너무 적으면 판매 기회를 놓치고, 너무 많으면 재고 비용이 발생합니다.',
    }),
    inventory: Object.freeze({
      term: '재고',
      definition: '팔리지 않고 남은 제품입니다.',
      game: '재고는 원가를 이미 소모한 물량이므로 순이익을 깎습니다.',
    }),
    marketShare: Object.freeze({
      term: '시장 점유율',
      definition: '전체 시장에서 특정 기업이 차지하는 판매 비율입니다.',
      game: '매력도 공식으로 계산되며, 수요 화살표의 굵기로 시각화됩니다.',
    }),
    attraction: Object.freeze({
      term: '매력도',
      definition: '소비자가 한 회사를 선택하게 만드는 종합 점수입니다.',
      game: '가격, 품질, 브랜드, 인지도, 경기 국면이 함께 영향을 줍니다.',
    }),
    cost: Object.freeze({
      term: '원가',
      definition: '제품이나 서비스를 생산하는 데 드는 비용입니다.',
      game: '개당 원가 × 발주량 = 원가 총액입니다. 미판매 재고도 원가가 발생합니다.',
    }),
    price: Object.freeze({
      term: '판매가',
      definition: '소비자에게 판매하는 가격입니다.',
      game: '원가 대비 배율로 정합니다. 너무 높으면 점유율을 잃고 너무 낮으면 마진이 줄어듭니다.',
    }),
    margin: Object.freeze({
      term: '마진',
      definition: '판매가에서 원가를 뺀 이익입니다.',
      game: '(판매가 - 원가) × 실판매량이 기본 마진입니다.',
    }),
    fixedCost: Object.freeze({
      term: '고정비',
      definition: '판매량과 관계없이 매달 발생하는 비용입니다.',
      game: '매출이 낮은 달에는 고정비가 순이익을 크게 압박합니다.',
    }),
    variableCost: Object.freeze({
      term: '변동비',
      definition: '생산량이나 판매량에 따라 달라지는 비용입니다.',
      game: '원가와 발주량이 변동비의 핵심입니다.',
    }),
    operatingExpense: Object.freeze({
      term: '운영비',
      definition: '회사를 운영하기 위해 드는 일반 비용입니다.',
      game: '공장 작업, 마케팅, 대출 이자 등이 운영비 성격으로 순이익에 반영됩니다.',
    }),
    quality: Object.freeze({
      term: '품질',
      definition: '제품의 성능과 만족도를 나타내는 지표입니다.',
      game: '품질이 높을수록 고품질 소비층과 브랜드 평가에 유리합니다.',
    }),
    qualityUpgrade: Object.freeze({
      term: '품질 강화',
      definition: '투자를 통해 제품 품질을 높이는 활동입니다.',
      game: '성공하면 품질이 오르고, 실패해도 비용은 차감됩니다. 연속 실패 시 다음 성공 확률이 보정됩니다.',
    }),
    costReduction: Object.freeze({
      term: '원가 절감',
      definition: '생산 비용을 낮추기 위한 개선 활동입니다.',
      game: '누적 절감률이 오르면 개당 원가가 낮아져 장기 마진이 좋아집니다.',
    }),
    brand: Object.freeze({
      term: '브랜드 가치',
      definition: '소비자가 기업과 제품에 대해 느끼는 신뢰와 이미지의 가치입니다.',
      game: '브랜드는 인지도 최대치와 프리미엄 수요에 영향을 줍니다.',
    }),
    awareness: Object.freeze({
      term: '인지도',
      definition: '소비자가 회사를 알고 있는 정도입니다.',
      game: '마케팅 투자로 상승하며, 투자하지 않으면 매 턴 자연 감소합니다.',
    }),
    marketing: Object.freeze({
      term: '마케팅',
      definition: '소비자에게 제품이나 서비스를 알리고 구매를 유도하는 활동입니다.',
      game: '투자할수록 인지도가 상승합니다. 인지도가 높을수록 같은 투자로 얻는 효과는 줄어듭니다.',
    }),
    econPhase: Object.freeze({
      term: '경기 국면',
      definition: '경제 활동의 수준을 나타내는 단계입니다.',
      game: '호황, 성장, 평시, 위축, 불황 5단계입니다. 국면마다 수요 배율과 소비자 행동이 달라집니다.',
    }),
    boom: Object.freeze({
      term: '호황',
      definition: '소비와 투자가 강한 경기 국면입니다.',
      game: '전체 수요가 크고 품질, 브랜드 중심 전략이 강해집니다.',
    }),
    growth: Object.freeze({
      term: '성장',
      definition: '시장이 확장되는 경기 국면입니다.',
      game: '수요가 늘고 다양한 전략이 통할 수 있습니다.',
    }),
    stable: Object.freeze({
      term: '평시',
      definition: '수요 변화가 비교적 안정적인 경기 국면입니다.',
      game: '가격, 품질, 발주량의 균형이 중요합니다.',
    }),
    contraction: Object.freeze({
      term: '위축',
      definition: '소비가 줄고 가격 민감도가 커지는 국면입니다.',
      game: '무리한 발주와 고가 전략이 위험해집니다.',
    }),
    recession: Object.freeze({
      term: '불황',
      definition: '수요가 크게 줄어드는 위험 국면입니다.',
      game: '현금 방어, 비용 축소, 낮은 발주량이 중요합니다.',
    }),
    revenue: Object.freeze({
      term: '매출',
      definition: '기업이 영업 활동으로 벌어들인 총 금액입니다.',
      game: '실판매량 × 판매가입니다.',
    }),
    netProfit: Object.freeze({
      term: '순이익',
      definition: '매출에서 모든 비용을 뺀 최종 이익입니다.',
      game: '매출 - 원가총액 - 마케팅비용 - 이자 = 순이익입니다.',
    }),
    deficit: Object.freeze({
      term: '적자',
      definition: '지출이 수입보다 많아 손실이 발생한 상태입니다.',
      game: '순이익이 음수인 상태입니다. 체력이 감소하고 신용점수가 하락할 수 있습니다.',
    }),
    surplus: Object.freeze({
      term: '흑자',
      definition: '수입이 지출보다 많아 이익이 발생한 상태입니다.',
      game: '순이익이 양수인 상태입니다. 모멘텀이 상승하고 신용점수가 좋아질 수 있습니다.',
    }),
    capital: Object.freeze({
      term: '자본',
      definition: '현재 회사가 사용할 수 있는 자금입니다.',
      game: '자본이 부족하면 발주, 마케팅, 상환, 공장 작업 선택이 제한됩니다.',
    }),
    debt: Object.freeze({
      term: '부채',
      definition: '빌린 돈의 총액입니다.',
      game: '부채가 커질수록 이자 부담과 만기 리스크가 커집니다.',
    }),
    loan: Object.freeze({
      term: '대출',
      definition: '금융기관에서 일정 기간 동안 돈을 빌리는 것입니다.',
      game: '단기, 일반, 장기 대출이 있으며 신용등급에 따라 한도와 이자율이 달라집니다.',
    }),
    loanLimit: Object.freeze({
      term: '대출 한도',
      definition: '현재 조건에서 빌릴 수 있는 최대 금액입니다.',
      game: '신용등급과 자본에 따라 결정됩니다.',
    }),
    interestRate: Object.freeze({
      term: '이자율',
      definition: '빌린 돈에 대해 지불하는 비용의 비율입니다.',
      game: '신용등급과 금리 이벤트에 따라 달라집니다.',
    }),
    interestPayment: Object.freeze({
      term: '이자 납부',
      definition: '빌린 돈의 사용 대가를 정해진 시점에 내는 것입니다.',
      game: '연체되면 신용점수가 하락하고 다음 선택지가 줄어듭니다.',
    }),
    principalRepayment: Object.freeze({
      term: '원금 상환',
      definition: '빌린 돈 자체를 갚는 것입니다.',
      game: '상환하면 부채가 줄고 신용점수에 긍정적으로 작용합니다.',
    }),
    creditScore: Object.freeze({
      term: '신용점수',
      definition: '채무 이행 능력을 나타내는 0~100점 지표입니다.',
      game: '흑자, 상환, 연체, 적자 기록이 점수를 움직입니다.',
    }),
    credit: Object.freeze({
      term: '신용등급',
      definition: '신용점수를 A/B/C/D로 나눈 등급입니다.',
      game: '등급이 높을수록 대출 한도는 커지고 이자율은 낮아집니다.',
    }),
    health: Object.freeze({
      term: '경영 체력',
      definition: '회사가 위기를 버틸 수 있는 내구도입니다.',
      game: '0이 되면 게임 오버입니다. 적자와 나쁜 이벤트가 체력을 깎습니다.',
    }),
    momentum: Object.freeze({
      term: '모멘텀',
      definition: '최근 성과가 만든 상승 또는 하락 흐름입니다.',
      game: '최근 흑자/적자 흐름으로 결정되며 보상과 수요 보정에 영향을 줍니다.',
    }),
    reward: Object.freeze({
      term: '보상',
      definition: '특정 층을 넘긴 뒤 선택하는 성장 카드입니다.',
      game: '체력 회복, 품질 상승, 자본 보강 등 다음 층 준비에 도움을 줍니다.',
    }),
    advisor: Object.freeze({
      term: '어드바이저',
      definition: '플레이 스타일을 바꾸는 조력자입니다.',
      game: '각 어드바이저는 강점과 약점이 달라 같은 전략도 다르게 작동합니다.',
    }),
    rival: Object.freeze({
      term: '라이벌',
      definition: '같은 수요를 두고 경쟁하는 다른 회사입니다.',
      game: '라이벌의 가격, 품질, 브랜드, 마케팅이 내 점유율을 흔듭니다.',
    }),
    rivalEvent: Object.freeze({
      term: '라이벌 이벤트',
      definition: '라이벌이 가격 인하, 마케팅 강화 같은 행동을 하는 사건입니다.',
      game: '다음 달 시장 경쟁 조건에 반영됩니다.',
    }),
    externalEvent: Object.freeze({
      term: '외부 이벤트',
      definition: '금리, 환율, 전쟁, 규제처럼 회사 밖에서 오는 변화입니다.',
      game: '수요, 원가, 이자, 발주 상한 등에 영향을 줍니다.',
    }),
    internalEvent: Object.freeze({
      term: '내부 이벤트',
      definition: '회사 내부에서 벌어지는 선택형 사건입니다.',
      game: '선택 결과에 따라 자본, 브랜드, 품질, 체력이 바뀔 수 있습니다.',
    }),
    safeChoice: Object.freeze({
      term: '안전 선택',
      definition: '리스크가 낮은 이벤트 선택입니다.',
      game: '보상은 작지만 결과를 예측하기 쉽습니다.',
    }),
    gambleChoice: Object.freeze({
      term: '도박 선택',
      definition: '성공과 실패 차이가 큰 이벤트 선택입니다.',
      game: '성공하면 크게 얻지만 실패하면 손실도 큽니다.',
    }),
    absurdChoice: Object.freeze({
      term: '말도 안 되는 선택',
      definition: '가장 극단적인 이벤트 선택입니다.',
      game: '대박 가능성과 큰 손해 가능성이 함께 있습니다.',
    }),
    consumerSegment: Object.freeze({
      term: '소비층',
      definition: '비슷한 구매 성향을 가진 소비자 집단입니다.',
      game: '가격형, 품질형, 브랜드형, 일반형 소비층이 경기 국면에 따라 다르게 반응합니다.',
    }),
    priceCompetition: Object.freeze({
      term: '가격 경쟁',
      definition: '더 낮은 가격으로 점유율을 빼앗는 전략입니다.',
      game: '단기 점유율에는 좋지만 마진과 체력을 압박할 수 있습니다.',
    }),
    dumping: Object.freeze({
      term: '덤핑',
      definition: '원가 이하 또는 매우 낮은 가격으로 판매하는 전략입니다.',
      game: '점유율은 빠르게 얻지만 장기적으로 자본과 체력에 큰 부담이 됩니다.',
    }),
    equipmentInvestment: Object.freeze({
      term: '설비 투자',
      definition: '생산 능력이나 효율을 높이기 위한 투자입니다.',
      game: '즉시 비용이 들지만 장기 비용 구조를 개선할 수 있습니다.',
    }),
    productivity: Object.freeze({
      term: '생산 효율',
      definition: '같은 비용으로 얼마나 효과적으로 생산하는지를 뜻합니다.',
      game: '효율이 높을수록 원가와 발주 부담이 줄어듭니다.',
    }),
    opportunityCost: Object.freeze({
      term: '기회비용',
      definition: '어떤 선택을 했을 때 포기한 다른 선택의 가치입니다.',
      game: '이벤트 카드에서 안전한 선택을 고르면 도박적 선택의 기대이익을 포기하는 것입니다.',
    }),
    inflation: Object.freeze({
      term: '인플레이션',
      definition: '물가가 지속적으로 오르는 현상입니다.',
      game: '원자재 폭등 등 외부 이벤트로 원가가 상승하는 형태로 반영됩니다.',
    }),
    exchangeRate: Object.freeze({
      term: '환율',
      definition: '서로 다른 나라 돈의 교환 비율입니다.',
      game: '환율 폭등은 수입 원자재 원가를 올릴 수 있습니다.',
    }),
    interest: Object.freeze({
      term: '금리',
      definition: '돈을 빌리는 비용의 기준입니다.',
      game: '금리 인상은 이자와 신용 부담을 키웁니다.',
    }),
    regulation: Object.freeze({
      term: '규제',
      definition: '정부가 시장에 요구하는 기준입니다.',
      game: '품질 기준 강화나 친환경 규제는 원가를 올릴 수 있습니다.',
    }),
  }),
});
