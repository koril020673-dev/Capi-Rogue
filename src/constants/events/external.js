const RAW_EXTERNAL_EVENTS = Object.freeze([
  { id: 'E01', category: 'ECONOMY', name: '금리 인상', message: '중앙은행이 기준금리를 올렸다.', effect: { loanInterestMultiplier: 1.2, duration: 1 } },
  { id: 'E02', category: 'ECONOMY', name: '금리 인하', message: '경기 부양을 위해 금리를 내렸다.', effect: { loanInterestMultiplier: 0.8, duration: 2 } },
  { id: 'E03', category: 'ECONOMY', name: '환율 폭등', message: '원화 가치가 급락했다.', effect: { costMultiplier: 1.15, duration: 2 } },
  { id: 'E04', category: 'ECONOMY', name: '주식시장 폭락', message: '소비 심리가 얼어붙었다.', effect: { demandMultiplier: 0.8, duration: 1 } },
  { id: 'E05', category: 'ECONOMY', name: '소비 진작 정책', message: '정부가 소비쿠폰을 뿌렸다.', effect: { demandMultiplier: 1.15, duration: 1 } },
  { id: 'E06', category: 'SUPPLY', name: '유조선 침몰', message: '주요 항로에서 유조선이 침몰했다.', effect: { shippingCostMultiplier: 1.25, duration: 2 } },
  { id: 'E07', category: 'SUPPLY', name: '원자재 폭등', message: '글로벌 원자재 공급이 급감했다.', effect: { costMultiplier: 1.2, duration: 2 } },
  { id: 'E08', category: 'SUPPLY', name: '원자재 폭락', message: '산유국 증산으로 원가가 내렸다.', effect: { costMultiplier: 0.85, duration: 2 } },
  { id: 'E09', category: 'SUPPLY', name: '항만 파업', message: '물류가 전면 마비됐다.', effect: { orderCapMultiplier: 0.7, duration: 1 } },
  { id: 'E10', category: 'SUPPLY', name: '공급망 정상화', message: '글로벌 물류가 회복됐다.', effect: { costMultiplier: 0.9, shippingCostMultiplier: 0.9, duration: 1 } },
  { id: 'E11', category: 'CRISIS', name: '전쟁 발발', message: '주요 교역국에서 전쟁이 시작됐다.', effect: { costMultiplier: 1.3, demandMultiplier: 0.85, duration: 3 } },
  { id: 'E12', category: 'CRISIS', name: '전쟁 종식', message: '전쟁이 끝나고 교역이 재개됐다.', effect: { costMultiplier: 0.8, demandMultiplier: 1.1, duration: 2 } },
  { id: 'E13', category: 'CRISIS', name: '대규모 자연재해', message: '공장 지대에 재해가 발생했다.', effect: { orderCapMultiplier: 0.6, duration: 1 } },
  { id: 'E14', category: 'CRISIS', name: '전염병 확산', message: '소비 활동이 급감했다.', effect: { demandMultiplier: 0.75, duration: 2 } },
  { id: 'E15', category: 'CRISIS', name: '대규모 시위', message: '물류와 생산이 일부 차질을 빚었다.', effect: { costMultiplier: 1.1, orderCapMultiplier: 0.85, duration: 1 } },
  { id: 'E16', category: 'MARKET', name: '소비 트렌드 급변', message: '소비자 선호가 갑자기 바뀌었다.', effect: { brandMultiplier: 0.85, duration: 1 } },
  { id: 'E17', category: 'MARKET', name: '친환경 규제 강화', message: '생산 기준이 높아졌다.', effect: { costMultiplier: 1.15, duration: 2 } },
  { id: 'E18', category: 'MARKET', name: '세금 인하', message: '법인세가 내렸다.', effect: { netProfitMultiplier: 1.1, duration: 2 } },
  { id: 'E19', category: 'MARKET', name: '소비자 보호법 강화', message: '품질 기준이 올라갔다.', effect: { minQualityTierUp: 1, duration: 2 } },
  { id: 'E20', category: 'MARKET', name: '경기 회복 뉴스', message: '긍정적인 경제 지표가 발표됐다.', effect: { demandMultiplier: 1.2, duration: 1 } },
]);

export const EXTERNAL_EVENTS = Object.freeze(
  RAW_EXTERNAL_EVENTS.map((event) =>
    Object.freeze({
      ...event,
      title: event.name,
      description: event.message,
      duration: event.effect.duration,
      background: event.category.toLowerCase(),
      scheduledFloors: Object.freeze([]),
      chance: 0.02,
      effects: Object.freeze(normalizeExternalEffect(event.effect)),
      effect: Object.freeze(event.effect),
    }),
  ),
);

function normalizeExternalEffect(effect) {
  return {
    ...effect,
    debtCostMultiplier: effect.debtCostMultiplier ?? effect.loanInterestMultiplier,
    costMultiplier:
      (effect.costMultiplier ?? 1) *
      (effect.shippingCostMultiplier ?? 1),
  };
}
