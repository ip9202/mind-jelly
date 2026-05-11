# Task Decomposition
SPEC: SPEC-AD-001
Created: 2026-05-11
Status: pending

## Task Overview

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| T-001 | AdMob 설정 상수 정의 | REQ-AD-001 | - | src/lib/ad/adConfig.ts | pending |
| T-002 | AdMob SDK 초기화 로직 구현 | REQ-AD-001 | T-001 | src/lib/ad/adInitializer.ts, granite.config.ts | pending |
| T-003 | 광고 빈도 제어기 구현 | REQ-AD-004 | T-001 | src/lib/ad/adFrequencyControl.ts | pending |
| T-004 | 전면형 광고 컴포넌트 | REQ-AD-002 | T-002, T-003 | src/components/ads/InterstitialAd.tsx | pending |
| T-005 | 배너 광고 컴포넌트 | REQ-AD-003 | T-002, T-003 | src/components/ads/BannerAd.tsx | pending |
| T-006 | 상태머신 전면형 광고 트리거 연동 | REQ-AD-002, REQ-AD-005 | T-004 | src/app/home/page.tsx | pending |
| T-007 | 배너 광고 표시/숨김 연동 | REQ-AD-003, REQ-AD-005 | T-005 | src/app/home/page.tsx | pending |
| T-008 | 감정 입력 흐름 광고 차단 | REQ-AD-005 | T-006, T-007 | src/app/home/page.tsx | pending |

## Task Details

### T-001: AdMob 설정 상수 정의
**Requirement**: REQ-AD-001 (AdMob SDK 초기화)
**Dependencies**: 없음
**Files**:
- `src/lib/ad/adConfig.ts` (NEW)

**Description**:
AdMob 테스트 및 프로덕션 광고 ID 상수를 정의하고 환경별 설정을 관리한다.

**Acceptance Criteria**:
- 테스트 광고 ID (전면형, 배너) 상수 정의
- 프로덕션 광고 ID 상수 정의 (플레이스홀더)
- AdMob 앱 ID 상수 정의
- 개발/프로덕션 환경 분기 로직

---

### T-002: AdMob SDK 초기화 로직 구현
**Requirement**: REQ-AD-001 (AdMob SDK 초기화)
**Dependencies**: T-001
**Files**:
- `src/lib/ad/adInitializer.ts` (NEW)
- `granite.config.ts` (MODIFY)

**Description**:
앱 시작 시 AdMob SDK를 초기화하고 초기화 실패 시 폴백 처리를 구현한다.

**Acceptance Criteria**:
- 앱 로드 시 AdMob SDK 초기화 함수 호출
- granite.config.ts에 AdMob 설정 추가
- 초기화 실패 시 에러 로깅 및 폴백 처리
- 비동기 초기화 완료 대기 로직

---

### T-003: 광고 빈도 제어기 구현
**Requirement**: REQ-AD-004 (광고 빈도 제어)
**Dependencies**: T-001
**Files**:
- `src/lib/ad/adFrequencyControl.ts` (NEW)

**Description**:
localStorage 기반 광고 빈도 제어기를 구현하여 신규 사용자 보호 및 세션당 광고 한도를 관리한다.

**Acceptance Criteria**:
- 세션 카운트 추적 (localStorage 영속화)
- 신규 사용자 보호 (첫 3세션 무광고)
- 일반 사용자: 세션당 전면형 1회 제한
- 헤비 사용자(일일 5세션+): 세션당 전면형 2회 제한
- 광고 시청 이력 추적 및 영속화

---

### T-004: 전면형 광고 컴포넌트
**Requirement**: REQ-AD-002 (전면형 광고)
**Dependencies**: T-002, T-003
**Files**:
- `src/components/ads/InterstitialAd.tsx` (NEW)

**Description**:
전면형 광고를 로드하고 표시하며 5초 후 스킵 버튼을 노출하는 React 컴포넌트를 구현한다.

**Acceptance Criteria**:
- 전면형 광고 로드 함수
- 광고 표시 및 닫기 콜백 처리
- 5초 후 스킵 버튼 노출
- 광고 로드 실패 시 폴백 (즉시 닫기 콜백)
- @apps-in-toss/web-framework AdMob API 연동

---

### T-005: 배너 광고 컴포넌트
**Requirement**: REQ-AD-003 (배너 광고)
**Dependencies**: T-002, T-003
**Files**:
- `src/components/ads/BannerAd.tsx` (NEW)

**Description**:
결과 화면 하단에 320x50 배너 광고를 표시하는 React 컴포넌트를 구현한다.

**Acceptance Criteria**:
- 배너 광고 로드 및 표시
- 320x50 크기 고정 레이아웃
- 광고 로드 실패 시 빈 공간 처리
- show/hide prop에 따른 표시/숨김 제어

---

### T-006: 상태머신 전면형 광고 트리거 연동
**Requirement**: REQ-AD-002, REQ-AD-005
**Dependencies**: T-004
**Files**:
- `src/app/home/page.tsx` (MODIFY)

**Description**:
홈 화면 상태머신이 satisfied -> report로 전환될 때 전면형 광고를 트리거한다.

**Acceptance Criteria**:
- satisfied 상태 진입 시 AdFrequencyController 체크
- 광고 가능하면 InterstitialAd 컴포넌트 마운트
- 광고 종료/스킵 시 report 상태로 전환
- 감정 입력 흐름(idle/input/restoring/beads)에서는 광고 트리거 차단
- 광고 불가능하면 즉시 report 상태로 전환

---

### T-007: 배너 광고 표시/숨김 연동
**Requirement**: REQ-AD-003, REQ-AD-005
**Dependencies**: T-005
**Files**:
- `src/app/home/page.tsx` (MODIFY)

**Description**:
report 화면 하단에 배너 광고를 표시하고 상태 전환 시 숨긴다.

**Acceptance Criteria**:
- report 상태 시 BannerAd 컴포넌트 표시
- report -> idle 전환 시 배너 즉시 숨김
- 감정 입력 흐름에서는 배너 표시 차단

---

### T-008: 감정 입력 흐름 광고 차단
**Requirement**: REQ-AD-005 (감정 입력 흐름 보호)
**Dependencies**: T-006, T-007
**Files**:
- `src/app/home/page.tsx` (MODIFY)

**Description**:
감정 입력, AI 분석, 구슬 생성/삼키기 상태에서 모든 광고를 차단하고 진행 중 광고를 닫는다.

**Acceptance Criteria**:
- idle/input/restoring/beads 상태에서는 광고 불가능 플래그 설정
- 광고 표시 중 감정 입력 시작 시 광고 즉시 닫기
- 상태 전환 로직에 광고 차단 조건 추가

---

## Implementation Order

TDD 사이클 순서:
1. T-001: 상수 정의 (기반)
2. T-002: SDK 초기화 (기반)
3. T-003: 빈도 제어기 (기반)
4. T-004: 전면형 컴포넌트 (UI)
5. T-005: 배너 컴포넌트 (UI)
6. T-006: 전면형 연동 (통합)
7. T-007: 배너 연동 (통합)
8. T-008: 흐름 보호 (통합)

각 태스크는 독립적인 TDD 사이클로 완료 가능하며, 하나의 PR로 통합 커밋 예정.
