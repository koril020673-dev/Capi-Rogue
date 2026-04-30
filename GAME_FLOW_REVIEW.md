# 게임 흐름 리뷰

업데이트: 2026-04-29

## 핵심 요약

현재 CapiRogue의 큰 흐름은 다음과 같다.

`로컬 프로필/게스트 시작 -> 타이틀 -> 조언자 선택 -> 시장 뉴스 확인 -> 전략 선택 -> 돌발 상황 또는 정산 -> 결과 -> 보상 또는 다음 달 -> 게임오버/클리어`

1차 수정으로 플레이어가 지금 무엇을 선택하고, 그 선택이 정산에 어떻게 이어지는지 더 잘 보이도록 정리했다. 아직 실제 실행 검증은 Node.js/npm 미설치 때문에 진행하지 못했다.

## 1. 반영 완료

### 한글 UI와 용어 정리

상태: 완료

- 주요 화면의 깨진 한글 문구를 자연스러운 문구로 정리했다.
- `floor`는 내부 변수명으로 유지하되, 사용자 화면에서는 `월차/개월` 중심으로 표시한다.
- 주요 용어는 자본, 부채, 브랜드, 인지도, 체력, 크레딧, 전략, 정산, 보상으로 맞췄다.

관련 파일:

- `src/screens/LoginScreen.jsx`
- `src/screens/TitleScreen.jsx`
- `src/screens/AdvisorSelectScreen.jsx`
- `src/screens/MainScreen.jsx`
- `src/screens/SettlementScreen.jsx`
- `src/screens/ResultScreen.jsx`
- `src/screens/RewardScreen.jsx`
- `src/screens/GameOverScreen.jsx`
- `src/components/StatusBar.jsx`
- `src/components/RightPanel.jsx`

### 외부 이벤트와 내부 이벤트 구분

상태: 1차 완료

- 외부 이벤트는 `시장 뉴스`로 표시한다.
- 내부 이벤트는 `돌발 상황`으로 표시한다.
- 외부 이벤트에는 지속 개월과 주요 효과를 보여준다.
- 내부 이벤트는 선택지를 고르면 정산으로 이어지는 흐름을 유지한다.

남은 검토:

- 현재는 같은 `EventScreen` 안에서 조건부 렌더링한다.
- 나중에 화면 구조가 커지면 `ExternalEventScreen`, `InternalEventScreen`으로 분리할 수 있다.

관련 파일:

- `src/screens/EventScreen.jsx`
- `src/components/EventCard.jsx`

### 전략 선택 흐름 개선

상태: 1차 완료

- 가격, 품질, 운영 탭마다 이번 달 예상치를 표시한다.
- 다음 달 탭에는 최종 전략 요약과 예상 매출/비용/자본 변화를 보여준다.
- 운영 선택이 실제 정산 전에 반영되도록 시장 미리보기 구조를 바꿨다.

현재 표시되는 정보:

- 예상 가격
- 예상 품질
- 예상 점유율
- 예상 수요
- 예상 생산량
- 예상 판매량
- 예상 매출
- 예상 비용
- 예상 자본 변화

남은 검토:

- 실제 정산값과 예측값의 차이가 플레이어에게 납득되는지 확인해야 한다.
- 랜덤 수요 변동 때문에 예측값과 정산값이 다를 수 있으므로, 필요하면 `예상` 문구를 더 분명히 해야 한다.

관련 파일:

- `src/components/RightPanel.jsx`
- `src/logic/settlementEngine.js`
- `src/store/useGameStore.js`

### 정산/결과 화면 역할 정리

상태: 1차 완료

정산 화면 역할:

- 이번 달 최종 손익
- 시장점유율
- 생산량
- 실제 판매량
- 재고 처분
- 매출
- 생산비
- 재고 비용
- 운영비
- 부채비용
- 자본 변화
- 운영 메모와 돌발 상황 결과

결과 화면 역할:

- 이번 달 핵심 판정
- 자본 변화
- 체력 변화
- 모멘텀
- 다음 보상까지 남은 기간
- 다음 행동 버튼

남은 검토:

- 정산 화면과 결과 화면을 계속 분리할지, 빠른 템포를 위해 합칠지 플레이 후 결정한다.

관련 파일:

- `src/screens/SettlementScreen.jsx`
- `src/screens/ResultScreen.jsx`

### 보상 흐름 개선

상태: 1차 완료

- 상태바와 결과 화면에 다음 보상까지 남은 개월을 표시한다.
- 보상 화면에 5개월마다 보상을 고른다는 설명을 추가했다.
- 보상 선택 후 다음 달 시장 뉴스 또는 전략 화면으로 이동한다는 흐름을 표시했다.

남은 검토:

- 5개월 보상 주기가 게임 템포에 맞는지 확인한다.
- 보상 카드의 등급과 효과가 충분히 체감되는지 확인한다.

관련 파일:

- `src/components/StatusBar.jsx`
- `src/screens/ResultScreen.jsx`
- `src/screens/RewardScreen.jsx`
- `src/logic/rewardEngine.js`

### 크레딧 사용 흐름 개선

상태: 1차 완료

- 버튼명을 `회복`, `수요`, `견제`로 바꿨다.
- 크레딧이 없으면 상태바 버튼이 비활성화된다.
- 버튼에 `title`과 `aria-label`을 추가해 효과를 설명한다.
- 내부 이벤트 카드의 리롤 버튼은 `카드 교체`로 바꿨다.

남은 검토:

- 크레딧 효과가 플레이 중 충분히 강한지 확인한다.
- 크레딧 부족 상태를 텍스트로 더 직접 표시할지 결정한다.

관련 파일:

- `src/components/StatusBar.jsx`
- `src/components/EventCard.jsx`
- `src/store/useGameStore.js`

### 로그인/저장/레거시 흐름

상태: 부분 완료

반영 완료:

- 로그인 화면을 로컬 프로필 흐름으로 정리했다.
- 게스트 시작은 저장 없는 흐름으로 유지했다.
- 로컬 프로필 로그인 시 localStorage 저장 데이터를 불러오도록 연결했다.
- 계정 모드에서 런 종료 시 레거시 정보가 저장되는 구조를 유지했다.

남은 검토:

- 타이틀 화면에 `이어하기` 버튼이 필요한지 결정한다.
- 진행 중 런까지 저장할지, 레거시와 해금만 저장할지 결정한다.
- 실제 서버 인증이 없으므로 `확인 코드` 입력이 필요한지 재검토한다.

관련 파일:

- `src/screens/LoginScreen.jsx`
- `src/screens/TitleScreen.jsx`
- `src/store/useGameStore.js`
- `src/logic/saveEngine.js`

### 게임오버 이후 동기

상태: 부분 완료

반영 완료:

- 최고 도달 월차를 표시한다.
- 최고 월손익을 표시한다.
- 최근 기록 개월 수를 표시한다.
- 레거시 수를 표시한다.
- 타임라인의 `F` 표기를 `개월`로 바꿨다.

남은 검토:

- 새로 해금된 조언자를 별도로 표시할지 결정한다.
- 가장 큰 손실 원인과 다음 런 추천 전략을 추가할지 결정한다.

관련 파일:

- `src/screens/GameOverScreen.jsx`
- `src/store/useGameStore.js`

## 2. 남은 주요 리스크

### 실행 검증 미완료

상태: 최우선

현재 이 컴퓨터의 터미널에서 `npm` 명령어가 잡히지 않는다. 따라서 `npm run dev`와 `npm run build` 검증이 아직 되지 않았다.

필요 작업:

```powershell
node --version
npm --version
npm install
npm run dev
npm run build
```

### 예측값과 정산값 차이

상태: 확인 필요

전략 패널의 예측은 운영 선택을 반영하도록 개선했다. 다만 실제 정산은 랜덤 수요값을 사용하므로 플레이어가 예측과 결과 차이를 자연스럽게 받아들이는지 확인해야 한다.

확인할 파일:

- `src/components/RightPanel.jsx`
- `src/logic/settlementEngine.js`

### 저장 기능 범위

상태: 설계 필요

현재 저장은 레거시와 조언자 해금 중심이다. 진행 중 런을 저장하지 않으므로, 사용자가 `이어하기`를 기대하면 흐름이 부족할 수 있다.

확인할 파일:

- `src/logic/saveEngine.js`
- `src/store/useGameStore.js`
- `src/screens/TitleScreen.jsx`

### 모바일/좁은 화면 UI

상태: 확인 필요

상태바 정보가 늘어났고 오른쪽 전략 패널도 예측 정보가 추가되었다. 실제 화면에서 텍스트 겹침이나 과밀함을 확인해야 한다.

확인할 파일:

- `src/styles/global.css`
- `src/components/StatusBar.jsx`
- `src/components/RightPanel.jsx`

## 3. 다음 검증 순서

1. Node.js LTS 설치
2. `npm install`
3. `npm run dev`
4. 로컬 프로필 시작 확인
5. 게스트 시작 확인
6. 조언자 선택 후 1개월 진행
7. 시장 뉴스가 뜨는 경우와 안 뜨는 경우 확인
8. 돌발 상황이 뜨는 경우와 안 뜨는 경우 확인
9. 정산 화면 숫자 확인
10. 결과 화면 다음 버튼 확인
11. 5개월차 보상 화면 확인
12. 게임오버 화면 확인
13. `npm run build`

## 4. 다음에 우선 확인할 파일

1. `src/components/RightPanel.jsx`
2. `src/logic/settlementEngine.js`
3. `src/store/useGameStore.js`
4. `src/components/StatusBar.jsx`
5. `src/screens/SettlementScreen.jsx`
6. `src/screens/ResultScreen.jsx`
7. `src/screens/RewardScreen.jsx`
8. `src/screens/GameOverScreen.jsx`
9. `src/logic/saveEngine.js`
10. `src/styles/global.css`
