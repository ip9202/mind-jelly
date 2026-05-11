# SPEC-AD-001: 인수 기준

## Given/When/Then 시나리오

### REQ-AD-001: AdMob SDK 초기화

**시나리오 1: 정상 초기화**
- **Given** 앱이 앱인토스 WebView 환경에서 로드됨
- **When** 앱 시작 시 AdMob 초기화가 실행됨
- **Then** AdMob SDK가 초기화되고 개발 환경에서는 테스트 광고 ID가 사용됨

**시나리오 2: 초기화 실패 폴백**
- **Given** 네트워크 오류 또는 SDK 미설치 상태
- **When** AdMob 초기화가 실패함
- **Then** 콘솔에 에러가 로깅되고 앱이 광고 없이 정상 동작함

### REQ-AD-002: 전면형 광고

**시나리오 1: 정상 광고 표시**
- **Given** 사용자가 3회 이상 세션을 완료한 일반 사용자
- **And** 홈 화면이 `beads` 상태이고 젤리가 `satisfied` 상태에 도달함
- **When** SATISFIED_DISPLAY_MS 이후 상태 전환이 트리거됨
- **Then** 전면형 광고가 로드되어 표시됨
- **And** 5초 후 스킵 버튼이 노출됨
- **When** 사용자가 광고를 닫음
- **Then** 홈 화면이 `report` 상태로 전환됨

**시나리오 2: 광고 로드 실패**
- **Given** 광고 네트워크 장애 상황
- **When** 전면형 광고 로드가 실패함
- **Then** 광고 없이 즉시 `report` 상태로 전환됨

**시나리오 3: 신규 사용자 광고 미표시**
- **Given** 사용자의 세션 카운트가 2회인 신규 사용자
- **When** satisfied 상태 이후 광고 표시가 요청됨
- **Then** 광고가 표시되지 않고 즉시 `report` 상태로 전환됨

### REQ-AD-003: 배너 광고

**시나리오 1: report 화면 배너 표시**
- **Given** 전면형 광고가 완료되어 `report` 상태에 진입함
- **When** report 화면이 렌더링됨
- **Then** 화면 하단에 320x50 배너 광고가 표시됨

**시나리오 2: idle 전환 시 배너 숨김**
- **Given** report 화면에 배너 광고가 표시 중임
- **When** report 자동 복귀로 `idle` 상태로 전환됨
- **Then** 배너 광고가 즉시 숨겨짐

### REQ-AD-004: 광고 빈도 제어

**시나리오 1: 신규 사용자 보호**
- **Given** localStorage에 sessionCount=1로 저장됨
- **When** `shouldShowAd()`가 호출됨
- **Then** `false`를 반환하여 광고가 차단됨

**시나리오 2: 일반 사용자 세션당 1회**
- **Given** localStorage에 sessionCount=5, currentSessionAdsShown=1로 저장됨
- **When** `shouldShowAd()`가 호출됨
- **Then** `false`를 반환하여 추가 광고가 차단됨

**시나리오 3: 헤비 사용자 세션당 2회**
- **Given** localStorage에 todaySessionCount=6, currentSessionAdsShown=1로 저장됨
- **When** `shouldShowAd()`가 호출됨
- **Then** `true`를 반환하여 두 번째 광고가 허용됨

**시나리오 4: 일일 리셋**
- **Given** localStorage에 lastSessionDate="2026-05-10"으로 저장됨
- **And** 현재 날짜가 "2026-05-11"임
- **When** 세션이 시작됨
- **Then** todaySessionCount와 todayAdsShown이 0으로 리셋됨

### REQ-AD-005: 감정 입력 흐름 보호

**시나리오 1: 입력 상태 광고 금지**
- **Given** 홈 화면이 `input` 상태임
- **When** 어떤 광고 표시 조건이 충족되더라도
- **Then** 광고가 표시되지 않음

**시나리오 2: 광고 중 입력 시작**
- **Given** 전면형 광고가 표시 중임
- **When** 사용자가 광고 뒤에서 감정 입력을 트리거함
- **Then** 광고가 즉시 닫히고 입력 흐름으로 전환됨

## 엣지 케이스

1. **앱 백그라운드 전환**: 광고 표시 중 앱이 백그라운드로 전환되면, 재활성화 시 광고 상태를 복원하거나 닫고 report로 전환
2. **빠른 상태 전환**: beads -> satisfied -> report가 빠르게 연속 발생할 때 광고 로드가 완료되지 않은 경우 즉시 report로 전환
3. **localStorage 가득참**: 저장 실패 시 기본값(신규 사용자 취급)으로 폴백
4. **광고 로드 타임아웃**: 10초 내 광고 로드 실패 시 자동 스킵
5. **동시 광고 요청**: 여러 조건에서 동시에 광고가 요청되더라도 한 번만 표시

## 품질 기준

| 항목 | 기준 |
|------|------|
| 광고로 인한 상태머신 지연 | 0ms (광고 실패 시), 최대 30초 (정상 광고 시청) |
| 광고 없이 앱 동작 | 모든 기능 정상 (광고는 부가 기능) |
| localStorage 읽기/쓰기 | 동기식, 5ms 이하 |
| 배너 광고 레이아웃 | report 화면 기존 요소에 영향 없음 |
| 감정 입력 플로우 | 광고로 인한 중단 없음 |

## Definition of Done

- [ ] AdMob SDK 초기화 성공/실패 시나리오 통과
- [ ] 전면형 광고 표시 -> 스킵 -> report 전환 시나리오 통과
- [ ] 배너 광고 report 화면 표시/숨김 시나리오 통과
- [ ] 광고 빈도 제어 4개 시나리오 통과
- [ ] 감정 입력 흐름 보호 2개 시나리오 통과
- [ ] 엣지 케이스 5개 처리 확인
- [ ] 기존 감정 분석 플로우 회귀 테스트 통과
- [ ] `shouldShowAd()`에 `@MX:ANCHOR` 태그 추가
