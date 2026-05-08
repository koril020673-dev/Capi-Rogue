function economyAchievement(id, grade, name, description, condition, educationLink) {
  return Object.freeze({
    id,
    category: 'ECONOMY',
    grade,
    name,
    description,
    icon: `/assets/achievements/achievement_${id.split('_')[0]}.png`,
    condition: Object.freeze(condition),
    educationLink,
  });
}

function gameAchievement(id, name, description, condition) {
  return Object.freeze({
    id,
    category: 'GAME',
    grade: null,
    name,
    description,
    icon: `/assets/achievements/achievement_${id}.png`,
    condition: Object.freeze(condition),
    educationLink: null,
  });
}

export const ACHIEVEMENTS = Object.freeze([
  economyAchievement('profit_bronze', 'BRONZE', '첫 흑자', '1턴 흑자 달성', { type: 'PROFIT_ONCE' }, '수요와 공급'),
  economyAchievement('profit_silver', 'SILVER', '흑자 경영인', '10턴 연속 흑자', { type: 'PROFIT_STREAK', count: 10 }, '수요와 공급'),
  economyAchievement('profit_gold', 'GOLD', '수요 지배자', '불황 국면에서 5턴 연속 흑자', { type: 'PROFIT_STREAK_RECESSION', count: 5 }, '수요와 공급'),

  economyAchievement('price_bronze', 'BRONZE', '가격 실험', '원가보다 너무 낮지 않은 판매가로 흑자 달성', { type: 'PROFIT_ONCE' }, '가격 탄력성'),
  economyAchievement('price_silver', 'SILVER', '탄력성 이해', '점유율 30% 이상 달성', { type: 'SHARE_OVER', value: 0.3 }, '가격 탄력성'),
  economyAchievement('price_gold', 'GOLD', '가격 설계자', '점유율 50% 이상 달성', { type: 'SHARE_OVER', value: 0.5 }, '가격 탄력성'),

  economyAchievement('factory_bronze', 'BRONZE', '첫 공장 작업', '공장 작업 1회 성공', { type: 'FACTORY_SUCCESS' }, '생산원가'),
  economyAchievement('factory_silver', 'SILVER', '효율 개선', '원가 절감 누적 15% 이상', { type: 'COST_REDUCTION_OVER', value: 0.15 }, '생산원가'),
  economyAchievement('factory_gold', 'GOLD', '원가 장인', '원가 절감 누적 40% 달성', { type: 'COST_REDUCTION_OVER', value: 0.4 }, '생산원가'),

  economyAchievement('quality_bronze', 'BRONZE', '품질 개선', '품질 20 이상 달성', { type: 'QUALITY_OVER', value: 20 }, '제품차별화'),
  economyAchievement('quality_silver', 'SILVER', '차별화 성공', '품질 50 이상 달성', { type: 'QUALITY_OVER', value: 50 }, '제품차별화'),
  economyAchievement('quality_gold', 'GOLD', '최고급 전략', '품질 80 이상 달성', { type: 'QUALITY_OVER', value: 80 }, '제품차별화'),

  economyAchievement('marketing_bronze', 'BRONZE', '첫 광고', '인지도 20% 이상 달성', { type: 'AWARENESS_OVER', value: 0.2 }, '마케팅효과'),
  economyAchievement('marketing_silver', 'SILVER', '인지도 확보', '인지도 50% 이상 달성', { type: 'AWARENESS_OVER', value: 0.5 }, '마케팅효과'),
  economyAchievement('marketing_gold', 'GOLD', '시장에 각인', '인지도 90% 이상 달성', { type: 'AWARENESS_OVER', value: 0.9 }, '마케팅효과'),

  economyAchievement('credit_bronze', 'BRONZE', '신용 회복', '신용등급 B 달성', { type: 'CREDIT_GRADE', grade: 'B' }, '금융신용'),
  economyAchievement('credit_silver', 'SILVER', '우량 신용', '신용등급 A 달성', { type: 'CREDIT_GRADE', grade: 'A' }, '금융신용'),
  economyAchievement('credit_gold', 'GOLD', '완벽한 신용', '신용점수 100점 달성', { type: 'CREDIT_SCORE_MAX' }, '금융신용'),

  economyAchievement('debt_bronze', 'BRONZE', '자금 조달', '대출 보유', { type: 'HAS_LOAN' }, '부채관리'),
  economyAchievement('debt_silver', 'SILVER', '부채 통제', '부채보다 자본이 많은 상태 유지', { type: 'CAPITAL_OVER_DEBT' }, '부채관리'),
  economyAchievement('debt_gold', 'GOLD', '무차입 경영', '클리어 시 부채 0원', { type: 'CLEAR_DEBT_FREE' }, '부채관리'),

  economyAchievement('cycle_bronze', 'BRONZE', '경기 관찰자', '서로 다른 경기 국면 3개 경험', { type: 'PHASE_EXPERIENCE', count: 3 }, '경기순환'),
  economyAchievement('cycle_silver', 'SILVER', '순환 이해', '서로 다른 경기 국면 5개 경험', { type: 'PHASE_EXPERIENCE', count: 5 }, '경기순환'),
  economyAchievement('cycle_gold', 'GOLD', '호황 포착', '호황에서 흑자 달성', { type: 'PROFIT_IN_PHASE', phase: 'boom' }, '경기순환'),

  economyAchievement('recession_bronze', 'BRONZE', '위축 대응', '위축 국면에서 흑자 달성', { type: 'PROFIT_IN_PHASE', phase: 'contraction' }, '경기대응'),
  economyAchievement('recession_silver', 'SILVER', '불황 생존', '불황 국면에서 흑자 달성', { type: 'PROFIT_IN_PHASE', phase: 'recession' }, '경기대응'),
  economyAchievement('recession_gold', 'GOLD', '불황 지배', '불황 국면에서 5턴 연속 흑자', { type: 'PROFIT_STREAK_RECESSION', count: 5 }, '경기대응'),

  economyAchievement('consumer_bronze', 'BRONZE', '소비자 확보', '점유율 25% 이상 달성', { type: 'SHARE_OVER', value: 0.25 }, '소비자행동'),
  economyAchievement('consumer_silver', 'SILVER', '주류 선택', '점유율 40% 이상 달성', { type: 'SHARE_OVER', value: 0.4 }, '소비자행동'),
  economyAchievement('consumer_gold', 'GOLD', '소비자 장악', '점유율 60% 이상 달성', { type: 'SHARE_OVER', value: 0.6 }, '소비자행동'),

  economyAchievement('opportunity_bronze', 'BRONZE', '선택의 대가', '이벤트 선택 1회 완료', { type: 'EVENT_CHOICE' }, '기회비용'),
  economyAchievement('opportunity_silver', 'SILVER', '위험 계산', '이벤트 성공 3회', { type: 'EVENT_SUCCESS_COUNT', count: 3 }, '기회비용'),
  economyAchievement('opportunity_gold', 'GOLD', '대담한 선택', '도박형 이벤트 성공', { type: 'GAMBLE_SUCCESS' }, '기회비용'),

  economyAchievement('competition_bronze', 'BRONZE', '첫 경쟁', '라이벌 1명 조우', { type: 'RIVAL_MET', count: 1 }, '시장경쟁'),
  economyAchievement('competition_silver', 'SILVER', '경쟁 우위', '라이벌 압도 3회', { type: 'RIVAL_DOMINATED', count: 3 }, '시장경쟁'),
  economyAchievement('competition_gold', 'GOLD', '시장 압주', '라이벌 압도 10회', { type: 'RIVAL_DOMINATED', count: 10 }, '시장경쟁'),

  economyAchievement('profit_manage_bronze', 'BRONZE', '손익 파악', '순이익 100만원 이상', { type: 'NET_PROFIT_OVER', value: 1000000 }, '손익관리'),
  economyAchievement('profit_manage_silver', 'SILVER', '수익 구조', '자본 1천만원 이상', { type: 'CAPITAL_OVER', value: 10000000 }, '손익관리'),
  economyAchievement('profit_manage_gold', 'GOLD', '강한 현금흐름', '자본 5천만원 이상', { type: 'CAPITAL_OVER', value: 50000000 }, '손익관리'),

  economyAchievement('risk_bronze', 'BRONZE', '위험 감지', '체력 3 이하에서 생존', { type: 'LOW_HEALTH_SURVIVE', value: 3 }, '리스크관리'),
  economyAchievement('risk_silver', 'SILVER', '위기 회복', '음수 자본에서 회복', { type: 'BANKRUPTCY_RECOVER' }, '리스크관리'),
  economyAchievement('risk_gold', 'GOLD', '안전 경영', '파산 위기 없이 클리어', { type: 'CLEAR_NO_BANKRUPTCY' }, '리스크관리'),

  economyAchievement('education_bronze', 'BRONZE', '경제 입문', '경제 업적 15개 달성', { type: 'ECONOMY_UNLOCK_COUNT', count: 15 }, '종합경제'),
  economyAchievement('education_silver', 'SILVER', '경제 이해', '경제 업적 30개 달성', { type: 'ECONOMY_UNLOCK_COUNT', count: 30 }, '종합경제'),
  economyAchievement('education_gold', 'GOLD', '경제 마스터', '경제 업적 45개 달성', { type: 'ECONOMY_UNLOCK_COUNT', count: 45 }, '종합경제'),

  gameAchievement('game_start', '첫 창업', '게임 시작', { type: 'FLOOR_OVER', value: 1 }),
  gameAchievement('game_raider', '레이더 클리어', 'The Raider로 클리어', { type: 'ADVISOR', advisorId: 'raider' }),
  gameAchievement('game_guardian', '가디언 클리어', 'The Guardian으로 클리어', { type: 'ADVISOR', advisorId: 'guardian' }),
  gameAchievement('game_analyst', '애널리스트 클리어', 'The Analyst로 클리어', { type: 'ADVISOR', advisorId: 'analyst' }),
  gameAchievement('game_gambler', '갬블러 클리어', 'The Gambler로 클리어', { type: 'ADVISOR', advisorId: 'gambler' }),
  gameAchievement('game_over', '실패의 기록', '게임 오버 경험', { type: 'GAME_OVER' }),
  gameAchievement('game_phoenix', '오기', '체력 2 이하에서 10층 이상 생존', { type: 'LOW_HEALTH_SURVIVE', value: 2 }),
  gameAchievement('game_king', '시장 왕', '점유율 70% 이상', { type: 'SHARE_OVER', value: 0.7 }),
  gameAchievement('game_legend', '전설의 기업', 'S등급 클리어', { type: 'CLEAR_GRADE', grade: 'S' }),
  gameAchievement('game_rival', '라이벌 사냥꾼', '라이벌 10명 조우', { type: 'RIVAL_MET', count: 10 }),
  gameAchievement('game_allin', '올인', '자본 30% 이상 마케팅 투자', { type: 'TODO' }),
  gameAchievement('game_speed', '스피드런', '짧은 플레이타임으로 클리어', { type: 'TODO' }),
  gameAchievement('game_retry', '다시 시작', '새 게임 3회 이상', { type: 'TODO' }),
  gameAchievement('game_perfect', '완전 경영', '적자 없이 클리어', { type: 'CLEAR_NO_LOSS' }),
  gameAchievement('game_collector', '수집가', '전체 업적 수집', { type: 'ACHIEVEMENT_COUNT', count: 60 }),
]);
