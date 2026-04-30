import { useMemo, useState } from 'react';

const TERMS = Object.freeze([
  ['수요 / 공급', '사고 싶은 양과 시장에 풀리는 양입니다.', '총 수요와 발주량 차이가 재고와 판매량을 가릅니다.'],
  ['시장 점유율', '전체 시장에서 내 회사가 가져간 비율입니다.', '매력도, 가격, 품질, 브랜드가 점유율을 움직입니다.'],
  ['원가 / 판매가 / 마진', '만드는 비용, 파는 가격, 남는 차이입니다.', '판매가는 높아도 마진이 낮으면 순이익이 줄어듭니다.'],
  ['경기 국면', '호황, 성장, 안정, 위축, 불황의 시장 흐름입니다.', '국면마다 총 수요와 소비자 성향이 달라집니다.'],
  ['브랜드 가치', '소비자가 회사를 믿고 더 고르는 힘입니다.', '높을수록 같은 가격에서도 수요를 더 가져옵니다.'],
  ['신용등급', '대출 신뢰도를 나타내는 등급입니다.', '등급이 높으면 이자율과 대출한도가 좋아집니다.'],
  ['매출 / 순이익', '판 금액과 비용을 뺀 최종 결과입니다.', '흑자 턴은 체력과 신용에 긍정적으로 작용합니다.'],
  ['적자 / 흑자', '순이익이 음수인지 양수인지입니다.', '적자가 반복되면 경영 체력과 신용이 흔들립니다.'],
  ['대출 / 이자율', '빌린 돈과 그 비용입니다.', '부채 운용은 자본 방어와 리스크를 동시에 만듭니다.'],
  ['인플레이션', '전반적인 비용과 가격이 오르는 현상입니다.', '원가 상승 이벤트는 마진을 직접 압박합니다.'],
  ['기회비용', '한 선택 때문에 포기한 다른 선택의 가치입니다.', '품질, 마케팅, 원가절감 중 무엇을 포기할지 정해야 합니다.'],
]);

export default function EconomyDictionary() {
  const [query, setQuery] = useState('');
  const filteredTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return TERMS;
    }

    return TERMS.filter((term) => term.join(' ').toLowerCase().includes(normalizedQuery));
  }, [query]);

  return (
    <div className="cr2-pause-section">
      <h2>경제 용어 사전</h2>
      <input
        className="cr2-pause-search"
        placeholder="검색"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="cr2-pause-term-list">
        {filteredTerms.map(([title, description, gameplay]) => (
          <article key={title}>
            <strong>{title}</strong>
            <p>{description}</p>
            <small>{gameplay}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
