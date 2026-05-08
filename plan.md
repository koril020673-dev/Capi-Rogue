# CapiRogue 수정 필요 항목

업데이트: 2026-05-05

## 우선순위 A: 바로 고쳐야 하는 부분

### 1. 깨진 한글 문자열 정리

증상:
- 일부 화면에서 `怨듭옣`, `?덉쭏`, `理쒕?`, `媛?` 같은 깨진 문자가 보임.
- 특히 공장 관리, 라이벌 도감, 라이벌 데이터 쪽에 많이 남아 있음.

영향 파일:
- `src/components/RightPanel.jsx`
- `src/constants/rivals.js`
- `src/components/menus/RivalDex.jsx`
- `src/components/FactoryUpgradeModal.jsx`

수정 방향:
- 화면에 직접 노출되는 문구는 모두 정상 한글로 교체.
- 가능하면 상단 `TEXT` 객체로 모아 관리.
- 라이벌 이름/회사명은 확정안 기준으로 다시 입력.

완료 기준:
- `rg -n "怨|理|媛|\\?덉|\\?꾩|\\?먭" src` 검색 시 화면 문구에서 남는 항목 없음.

### 2. 공장 관리 UI 문구 마무리

증상:
- 품질 최대치 제한은 제거됐지만, 공장 관리 카드 안의 문구 일부가 여전히 깨져 있음.
- 원가 절감 최대치 문구는 남아도 되지만, 품질 쪽에는 `100` 상한 표시가 없어야 함.

영향 파일:
- `src/components/RightPanel.jsx`
- `src/components/FactoryUpgradeModal.jsx`

수정 방향:
- 공장 관리 카드:
  - `현재 품질: N`
  - `현재 원가: N원/개`
  - `누적 원가 절감: N% / 40%`
  - `품질 강화`, `원가 절감`, `성공 확률`, `연속 실패 보정`
- 사용하지 않는 모달이면 제거하거나, 계속 둘 거면 단일 옵션 기준 문구로 완전히 맞춤.

완료 기준:
- 운영 탭에서 공장 관리 문구가 전부 정상 한글로 표시.
- 품질 강화 버튼이 품질 수치 때문에 비활성화되지 않음.

### 3. 기록 저장 중복/흐름 정리

증상:
- `GameOverScreen`은 진입 시 자동으로 `saveRecord()`를 호출함.
- `EndingScreen`은 3페이지에서 사용자가 `저장하기`를 눌러야 저장함.
- 파산 기록은 자동 저장, 클리어 기록은 수동 저장이라 정책이 섞여 있음.

영향 파일:
- `src/screens/GameOverScreen.jsx`
- `src/screens/EndingScreen.jsx`
- `src/logic/saveEngine.js`
- `src/components/menus/PlayRecord.jsx`

수정 방향:
- 정책을 하나로 통일.
- 추천: 파산/클리어 모두 마지막 페이지에서 저장 버튼을 제공하되, 이미 저장된 기록은 중복 저장 방지.
- 또는 둘 다 자동 저장하고 화면에는 `플레이 기록에 저장됐습니다`만 표시.

완료 기준:
- 같은 엔딩/파산 화면을 새로고침하거나 재진입해도 records에 중복 저장되지 않음.
- 플레이 기록 화면에서 최신 기록이 1개씩만 보임.

## 우선순위 B: 플레이 경험 개선

### 4. 플레이 기록 상세 화면 보강

현재 상태:
- 기록 슬롯 목록과 상세 페이지는 구현됨.
- 상세 3페이지 구조가 최소 기능 위주라, 클리어/파산별 정보 차이가 아직 약함.

영향 파일:
- `src/components/menus/PlayRecord.jsx`
- `src/styles/playRecord.css`
- `src/logic/recordEngine.js`

수정 방향:
- 클리어 기록:
  - 1페이지: 클리어 요약
  - 2페이지: 최종 통계
  - 3페이지: 만난 라이벌/주요 턴
- 파산 기록:
  - 1페이지: 사망 원인
  - 2페이지: 결정 복기
  - 3페이지: 최종 통계
- 슬롯 카드에 결과 타입별 색상 강화.

완료 기준:
- 타이틀 `플레이 기록`과 ESC 메뉴 `플레이 기록` 모두 같은 기록 데이터를 자연스럽게 보여줌.

### 5. Supabase records 스키마 확인

필요 컬럼:

```sql
alter table public.records
add column if not exists result_type text not null default 'CLEAR';

alter table public.records
add column if not exists clear_grade text;
```

추가 검토:
- `timeline`, `met_rivals` 같은 배열/JSON 데이터를 저장할 컬럼이 있는지 확인 필요.
- 현재 `saveRecord(recordData)`는 `recordData`를 그대로 insert하므로 DB에 없는 컬럼이 있으면 저장 실패 가능.

영향 파일:
- `src/logic/saveEngine.js`
- Supabase `records` 테이블

완료 기준:
- Vercel 배포 환경에서 클리어/파산 기록 저장 성공.
- 저장 실패 시에도 사용자에게 원인 메시지 표시.

### 6. 대출/은행 업무 UX 확인

현재 상태:
- 대출 시 자본 증가 버그는 수정됨.
- 대출금 직접 입력 UI는 남아 있고, `takeLoan()`은 요청액을 대출 한도 이하로 제한함.

점검할 것:
- 대출 한도보다 큰 금액 입력 시 실제 대출액이 UI에 명확히 보이는지.
- D등급 대출 불가 메시지가 화면에 보이는지.
- 대출 상환 후 `capital`, `debt`, `loans` 목록이 동시에 자연스럽게 갱신되는지.

영향 파일:
- `src/components/RightPanel.jsx`
- `src/logic/loanEngine.js`
- `src/logic/settlementEngine.js`
- `src/store/useGameStore.js`

완료 기준:
- 은행 업무 선택 후 정산 결과에서 대출/상환 변화가 납득 가능하게 표시.

## 우선순위 C: 밸런스/구조 개선

### 7. 품질 상한 제거 이후 밸런스 재점검

현재 상태:
- 공장 품질 강화 상한 100은 제거됨.
- 보상 엔진에는 아직 품질 보상에서 100 상한이 남아 있음.

영향 파일:
- `src/logic/factoryEngine.js`
- `src/logic/rewardEngine.js`
- `src/logic/settlementEngine.js`
- `src/logic/marketEngine.js`

검토할 것:
- 품질이 100을 넘었을 때 수요 공식이 과하게 폭주하지 않는지.
- 보상으로 받는 품질 상승도 상한을 제거할지 정책 결정 필요.
- 라이벌 품질이 100 이하라면 후반 밸런스가 너무 쉬워질 수 있음.

완료 기준:
- 품질 100 초과 플레이가 가능하되, 가격/원가/마케팅 선택이 여전히 의미 있음.

### 8. 사용하지 않는 코드 정리

후보:
- `FactoryUpgradeModal.jsx`가 현재 실제 화면에서 쓰이는지 확인.
- `attemptFactoryUpgrade()` 즉시 실행 액션은 현재 예약형 공장 작업과 역할이 겹침.
- `qualityUpgradeStreak`는 브랜드 패널티용으로 남아 있으나 현재 흐름에서 의미가 약할 수 있음.

영향 파일:
- `src/components/FactoryUpgradeModal.jsx`
- `src/store/useGameStore.js`
- `src/logic/brandQualityEngine.js`

완료 기준:
- 실제 사용하지 않는 컴포넌트/액션 제거 또는 TODO 주석으로 명확히 격리.

### 9. 화면 크기/스크롤 정책 재확인

현재 상태:
- 게임 전체는 3:2 스테이지 비율로 고정하는 방향.
- 기록/엔딩/게임오버는 내부 페이지 내용에 스크롤을 허용하도록 설계됨.

검토할 것:
- 사용자가 예전에 “스크롤 절대 넣지마”라고 했던 화면은 메인/정산 계열이었음.
- 기록/도감/사전처럼 정보량이 많은 메뉴는 스크롤 허용이 맞는지 최종 확인 필요.

영향 파일:
- `src/styles/global.css`
- `src/styles/gameOver.css`
- `src/styles/ending.css`
- `src/styles/playRecord.css`
- `src/styles/record.css`

완료 기준:
- 메인 플레이 화면은 잘리지 않고 비율 유지.
- 정보성 메뉴는 화면 안에서만 자연스럽게 이동.

## 권장 작업 순서

1. 깨진 한글 문자열 전체 정리
2. 공장 관리 UI 정상 문구로 마무리
3. Supabase records 스키마와 저장 실패 여부 확인
4. 기록 저장 중복 방지 정책 통일
5. 플레이 기록 상세 화면 보강
6. 품질 상한 제거 이후 보상/수요 밸런스 점검
7. 사용하지 않는 공장 모달/액션 정리
8. 전체 빌드 및 Vercel 배포 확인

## 매번 확인할 명령

```powershell
npm run build
git status --short
```
