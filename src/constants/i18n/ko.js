export const ko = Object.freeze({
  dictionary: Object.freeze({
    marketing: Object.freeze({
      term: '마케팅',
      definition: '소비자에게 제품이나 서비스를 알리고 구매를 유도하는 활동입니다.',
      game: [
        '이 게임에서 마케팅 투자는 인지도(awareness)를 높입니다.',
        '인지도가 높을수록 같은 투자로 얻는 효과가 줄어듭니다.',
        '마케팅을 하지 않으면 인지도가 매 턴 -2% 자연 감소합니다.',
        '브랜드 가치가 낮으면 인지도 최대치도 제한됩니다.',
        '',
        '투자 한도 방식 (설정에서 변경 가능):',
        '1. 자본 비율형: 보유 자본 x 0.3',
        '2. 고정 상한형: MIN(자본 x 0.2, 5,000,000원)',
      ].join('\n'),
    }),
  }),
});

export default ko;
