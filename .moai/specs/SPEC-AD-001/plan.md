# SPEC-AD-001: 구현 계획

## 종속성

- **프레임워크**: `@apps-in-toss/web-framework` (이미 설치됨, AdMob API 사용)
- **런타임**: Next.js 14+ Static Export (앱인토스 WebView 환경)
- **상태 관리**: localStorage (광고 빈도 제어), React State (광고 표시 상태)
- **기존 코드**: `src/app/home/page.tsx` 상태머신 (idle/input/restoring/beads/report)

## 태스크 분해 (종속성 순서)

### Task 1: AdMob 설정 상수 (adConfig.ts)

**우선순위**: High (후속 태스크의 기반)

- Google AdMob 테스트 광고 ID 정의 (Android/iOS)
- 프로덕션 광고 ID 플레이스홀더 (환경변수 기반)
- 광고 타임아웃 상수 (로드 타임아웃 10초, 스킵 대기 5초)
- 빈도 제어 상수 (신규 그레이스 3세션, 일반 한도 1회, 헤비 한도 2회, 헤비 기준 5세션/일)

### Task 2: 광고 빈도 제어기 (adFrequencyControl.ts)

**우선순위**: High (Task 1 선행)

- localStorage 래퍼: 세션 카운트 읽기/쓰기
- 세션당 광고 시청 카운트 관리
- 일일 세션 카운트로 헤비 사용자 판별
- `shouldShowAd()`: 종합 판별 함수
- `recordAdShown()`: 광고 시청 기록
- `incrementSessionCount()`: 세션 시작 시 호출

**@MX 타겟**:
- `shouldShowAd()` -- 여러 컴포넌트에서 호출 예상, `@MX:ANCHOR` 후보

### Task 3: AdMob SDK 초기화 (adInitializer.ts + granite.config.ts)

**우선순위**: High (Task 1 선행)

- `@apps-in-toss/web-framework` AdMob API 탐색 및 초기화 함수 구현
- `granite.config.ts`에 AdMob 플러그인 설정 추가
- 초기화 실패 시 graceful fallback (console.error + 플래그)

### Task 4: 전면형 광고 컴포넌트 (InterstitialAd.tsx)

**우선순위**: Medium (Task 2, 3 선행)

- AdMob interstitial ad 로드/표시/해제 래퍼
- 5초 스킵 버튼 타이머
- 광고 완료/실패/닫기 콜백 prop
- 로딩 상태 UI (선택적)

### Task 5: 배너 광고 컴포넌트 (BannerAd.tsx)

**우선순위**: Medium (Task 3 선행)

- 320x50 AdMob 배너 래퍼
- 표시/숨김 prop 제어
- 로드 실패 시 빈 영역 처리

### Task 6: 홈 페이지 통합 (page.tsx 수정)

**우선순위**: High (Task 2, 4, 5 선행)

- `beads` + `satisfied` 감지 effect에서 전면형 광고 트리거 삽입
- 광고 완료 후 `setUiState('report')` 호출
- `report` 상태 UI에 배너 컴포넌트 추가
- 앱 진입 시 세션 카운트 증가

## 기술 접근

### 광고 삽입 지점 (핵심)

기존 코드 (page.tsx ~line 209):
```
// satisfied 감지 후 SATISFIED_DISPLAY_MS 뒤 report 전환
const timer = setTimeout(() => {
  setUiState('report');
}, SATISFIED_DISPLAY_MS);
```

변경 후:
```
// satisfied 감지 후 SATISFIED_DISPLAY_MS 뒤 광고 가능 여부 확인
const timer = setTimeout(async () => {
  if (shouldShowAd()) {
    const adClosed = await showInterstitialAd();
    recordAdShown();
  }
  setUiState('report');
}, SATISFIED_DISPLAY_MS);
```

### 빈도 제어 localStorage 스키마

```typescript
interface AdFrequencyState {
  sessionCount: number;        // 전체 세션 수
  todaySessionCount: number;   // 오늘 세션 수
  todayAdsShown: number;       // 오늘 광고 시청 수
  currentSessionAdsShown: number; // 현재 세션 광고 시청 수
  lastSessionDate: string;     // YYYY-MM-DD (일일 리셋 기준)
}
```

### 상태 관리

- 광고 표시 상태는 React State로 관리 (InterstitialAd/BannerAd 내부)
- 빈도 제어 데이터는 localStorage에 영속화
- AdMob 초기화 상태는 모듈 레벨 변수로 관리

## 위험 분석

| 위험 | 확률 | 영향 | 대응 |
|------|------|------|------|
| 앱인토스 환경에서 AdMob API 미지원 | 중간 | 높음 | SDK API 사전 검증, 폴백 경로 필수 |
| 광고 로드 지연으로 UX 저하 | 높음 | 중간 | 비동기 로드, 타임아웃 10초, 실패 시 스킵 |
| localStorage 데이터 손상 | 낮음 | 낮음 | try-catch 래핑, 기본값 폴백 |
| 테스트 광고 ID가 샌드박스에서 동작하지 않음 | 중간 | 중간 | 실기기 테스트 필수, 개발 환경 광고 비활성화 옵션 |
| report 자동 복귀(4초)와 광고 시간 충돌 | 중간 | 높음 | 광고 표시 중 report 타이머 일시정지 |

## MX 태그 계획

| 함수/모듈 | 태그 | 이유 |
|-----------|------|------|
| `shouldShowAd()` | `@MX:ANCHOR` | 빈도 제어 핵심 함수, 여러 컴포넌트에서 호출 |
| `showInterstitialAd()` | `@MX:ANCHOR` | 전면형 광고 표시 진입점 |
| `initAdMob()` | `@MX:NOTE` | 초기화 로직, 실패 시 폴백 동작 설명 필요 |
| 홈 페이지 광고 삽입 지점 | `@MX:WARN` | 상태머신 타이밍 의존, 타이머 충돌 위험 |
