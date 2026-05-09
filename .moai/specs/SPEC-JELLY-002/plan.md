---
id: SPEC-JELLY-002
version: 1.0.0
status: draft
created: 2026-05-09
updated: 2026-05-09
author: manager-spec
priority: P1
issue_number: 0
---

# SPEC-JELLY-002: Implementation Plan

## 개요

SPEC-JELLY-002의 구현 계획서. 5개 모듈을 4개 마일스톤으로 그룹화하여 순차적으로 구현한다. 각 마일스톤은 독립적으로 검증 가능하며, 선후 관계가 명확하다.

---

## 마일스톤 구조

```
M1 (High): AI 감정 분석 + 텍스트 입력 UI
    ↓ (분석 결과 필요)
M2 (High): 감정 기반 색상 전환
    ↓ (독립, 병렬 가능)
M3 (Medium): 다크 모드 테마
    ↓ (독립, 병렬 가능)
M4 (Medium): 토스 브릿지 연동
```

---

## Milestone 1: AI 감정 분석 + 텍스트 입력 UI (Priority High)

### 목표
하드코딩된 TestInput/EmotionInput을 실제 텍스트 입력 기반 AI 감정 분석으로 교체한다.

### 작업 분해

| Task ID | 작업 내용 | 수정 파일 | 신규 파일 | 의존 |
|---------|----------|-----------|-----------|------|
| M1-T1 | 감정 분석 타입 정의 | src/types/physics.ts | src/types/emotion.ts | 없음 |
| M1-T2 | Zod 스키마 정의 (API 응답 검증) | - | src/lib/ai/schemas.ts | M1-T1 |
| M1-T3 | 감정 분석 유틸리티 (서버 사이드) | - | src/lib/ai/analyzer.ts | M1-T2 |
| M1-T4 | API Route Handler (/api/analyze) | - | src/app/api/analyze/route.ts | M1-T3 |
| M1-T5 | jellyStore 확장 (감정 상태 추가) | src/stores/jellyStore.ts | - | M1-T1 |
| M1-T6 | EmotionInput 컴포넌트 재작성 | src/components/input/EmotionInput.tsx | - | M1-T5 |
| M1-T7 | TestInput 제거 (P0 잔여물) | src/components/input/TestInput.tsx | - | M1-T6 |
| M1-T8 | 홈 페이지 입력 컴포넌트 교체 | src/app/home/page.tsx | - | M1-T6 |
| M1-T9 | 단위 테스트 작성 | - | __tests__/lib/ai/analyzer.test.ts, __tests__/components/input/EmotionInput.test.tsx | M1-T6 |

### 기술 접근

- **API Route**: Next.js Route Handler 사용 (서버 사이드에서만 API 키 접근)
- **AI 호출**: fetch 기반, AbortController로 타임아웃 제어
- **상태 관리**: jellyStore에 isAnalyzing, analysisError, emotionHistory 필드 추가
- **UI**: 기존 EmotionInput 구조를 유지하되 버튼을 textarea로 교체

### 위험 요소

| 위험 | 영향 | 완화 전략 |
|------|------|----------|
| API 응답 지연 (>3초) | UX 저하 | 로딩 인디케이터 + 타임아웃 처리 |
| API 키 노출 | 보안 | 서버 사이드 Route Handler 사용 |
| API 호출 비용 | 운영 비용 | GPT-4o-mini 사용 (가장 저렴), Rate Limit 적용 |

---

## Milestone 2: 감정 기반 색상 전환 (Priority High)

### 목표
고정 색상(#FFD1DC) 젤리를 감정 분석 결과에 따라 동적으로 색상이 변하도록 구현한다.

### 작업 분해

| Task ID | 작업 내용 | 수정 파일 | 신규 파일 | 의존 |
|---------|----------|-----------|-----------|------|
| M2-T1 | jellyStore에 emotionColor 상태 추가 | src/stores/jellyStore.ts | - | M1 완료 |
| M2-T2 | JellyRenderer 감정 색상 동적 적용 | src/components/jelly/JellyRenderer.tsx | - | M2-T1 |
| M2-T3 | CSS transition 속성 추가 | src/components/jelly/JellyRenderer.tsx | - | M2-T2 |
| M2-T4 | 글로우 효과 색상 동기화 | src/components/jelly/JellyRenderer.tsx | - | M2-T2 |
| M2-T5 | 단위 테스트 작성 | - | __tests__/components/jelly/JellyRenderer.test.tsx | M2-T2 |

### 기술 접근

- **색상 소스**: src/lib/constants/emotion.ts의 EMOTION_COLORS 맵 사용
- **렌더링**: JellyRenderer의 inline style에 transition: "background-color 800ms ease-in-out" 추가
- **상태 연동**: jellyStore.emotionColor를 JellyRenderer의 prop으로 전달
- **기본값**: 초기 상태는 JELLY_COLOR (#FFD1DC) 유지

### 위험 요소

| 위험 | 영향 | 완화 전략 |
|------|------|----------|
| transition 성능 | 60fps 저하 | GPU 가속 속성만 사용 (background-color는 GPU 가속) |
| 색상 깜빡임 | UX 저하 | CSS transition으로 부드러운 전환 보장 |
| rgba 변환 | 구현 복잡도 | hex→rgba 변환 유틸리티 작성 |

---

## Milestone 3: 다크 모드 테마 (Priority Medium)

### 목표
라이트/다크 모드 전환을 지원하고 시스템 설정을 감지하며, 선택을 영구 저장한다.

### 작업 분해

| Task ID | 작업 내용 | 수정 파일 | 신규 파일 | 의존 |
|---------|----------|-----------|-----------|------|
| M3-T1 | themeStore 생성 | - | src/stores/themeStore.ts | 없음 |
| M3-T2 | 다크 모드 CSS 팔레트 정의 | src/app/globals.css | - | 없음 |
| M3-T3 | ThemeToggle 컴포넌트 | - | src/components/ui/ThemeToggle.tsx | M3-T1 |
| M3-T4 | 레이아웃에 테마 적용 | src/app/layout.tsx | - | M3-T1 |
| M3-T5 | 하단 네비게이션 다크 모드 | src/components/layout/BottomNav.tsx | - | M3-T2 |
| M3-T6 | 입력 필드 다크 모드 | src/components/input/EmotionInput.tsx | - | M3-T2 |
| M3-T7 | 단위 테스트 작성 | - | __tests__/stores/themeStore.test.ts, __tests__/components/ui/ThemeToggle.test.tsx | M3-T3 |

### 기술 접근

- **전략**: Tailwind v4 darkMode "class" (이미 설정됨)
- **저장**: localStorage "mind-jelly-theme" 키
- **감지**: window.matchMedia + change 이벤트 리스너
- **적용**: html 요소에 dark 클래스 토글
- **Hydration**: 초기 로드 시 스크립트로 FOUC(Flash of Unstyled Content) 방지

### 위험 요소

| 위험 | 영향 | 완화 전략 |
|------|------|----------|
| FOUC (깜빡임) | UX 저하 | inline script로 초기 테마 적용 |
| Hydration 불일치 | React 에러 | useEffect로 클라이언트에서만 테마 적용 |
| 젤리 색상 가시성 | 다크 모드에서 젤리 안 보임 | 글로우 효과 밝기 증가 |

---

## Milestone 4: 토스 브릿지 연동 (Priority Medium)

### 목표
Toss AppInToS WebView 환경을 감지하고, 사용자 정보를 읽어와 앱에 반영한다.

### 작업 분해

| Task ID | 작업 내용 | 수정 파일 | 신규 파일 | 의존 |
|---------|----------|-----------|-----------|------|
| M4-T1 | Toss Bridge 타입 정의 | - | src/types/toss.ts | 없음 |
| M4-T2 | tossStore 생성 | - | src/stores/tossStore.ts | M4-T1 |
| M4-T3 | Bridge 유틸리티 (감지 + 통신) | - | src/lib/toss/bridge.ts | M4-T1 |
| M4-T4 | 앱 초기화 시 Bridge 연결 | src/app/layout.tsx | - | M4-T3 |
| M4-T5 | WebView 환경에 따른 UI 분기 | src/app/home/page.tsx | - | M4-T2 |
| M4-T6 | Bridge 폴백 처리 | src/lib/toss/bridge.ts | - | M4-T3 |
| M4-T7 | 단위 테스트 작성 | - | __tests__/lib/toss/bridge.test.ts, __tests__/stores/tossStore.test.ts | M4-T3 |

### 기술 접근

- **감지**: window.__TOSS_BRIDGE__ 존재 여부 + User-Agent 패턴 매칭
- **통신**: postMessage 기반 비동기 API
- **폴백**: Bridge 미지원 시 모든 기능 정상 동작 보장
- **테스트**: WebView 환경 Mock으로 테스트

### 위험 요소

| 위험 | 영향 | 완화 전략 |
|------|------|----------|
| Bridge API 문서 부재 | 구현 지연 | 기존 AppInToS SDK 레퍼런스 참조, 최소 기능 구현 |
| WebView 환경 테스트 어려움 | QA 한계 | Mock 기반 단위 테스트 + 실기기 수동 테스트 |
| Bridge 응답 지연 | 초기 로딩 지연 | 비동기 처리 + 타임아웃 + 캐싱 |

---

## 병렬 실행 가능 여부

| 마일스톤 | M1과 병렬 | M2와 병렬 | M3와 병렬 |
|-----------|-----------|-----------|-----------|
| M2 | 불가 (M1 결과 필요) | - | - |
| M3 | 가능 (독립) | 가능 (독립) | - |
| M4 | 가능 (독립) | 가능 (독립) | 가능 (독립) |

**권장 실행 순서**: M1 → M2 (순차) + M3, M4 (병렬)

---

## 파일 변경 영향 범위

### 수정 파일 (기존)

| 파일 | 마일스톤 | 변경 내용 |
|------|---------|----------|
| src/stores/jellyStore.ts | M1, M2 | 감정 상태, 색상 상태, 히스토리 필드 추가 |
| src/components/jelly/JellyRenderer.tsx | M2 | 감정 색상 동적 적용, CSS transition |
| src/components/input/EmotionInput.tsx | M1, M3 | textarea 기반 재작성, 다크 모드 대응 |
| src/app/home/page.tsx | M1, M4 | 입력 컴포넌트 교체, Bridge 분기 |
| src/app/layout.tsx | M3, M4 | 테마 초기화, Bridge 초기화 |
| src/app/globals.css | M3 | 다크 모드 CSS 팔레트 |
| src/components/layout/BottomNav.tsx | M3 | 다크 모드 대응 |

### 신규 파일

| 파일 | 마일스톤 | 용도 |
|------|---------|------|
| src/types/emotion.ts | M1 | 감정 분석 타입 정의 |
| src/lib/ai/schemas.ts | M1 | Zod 검증 스키마 |
| src/lib/ai/analyzer.ts | M1 | 감정 분석 유틸리티 |
| src/app/api/analyze/route.ts | M1 | API Route Handler |
| src/stores/themeStore.ts | M3 | 테마 상태 관리 |
| src/components/ui/ThemeToggle.tsx | M3 | 테마 토글 컴포넌트 |
| src/types/toss.ts | M4 | 토스 브릿지 타입 |
| src/stores/tossStore.ts | M4 | 토스 브릿지 상태 |
| src/lib/toss/bridge.ts | M4 | 토스 브릿지 유틸리티 |

---

## Definition of Done

- [ ] M1: 텍스트 입력 → AI 분석 → 구슬 생성 전체 플로우 동작
- [ ] M2: 감정에 따라 젤리 색상이 부드럽게 전환
- [ ] M3: 라이트/다크 전환, 시스템 감지, 영구 저장 모두 동작
- [ ] M4: 토스 WebView에서 사용자 정보 읽기 성공, 일반 웹에서 폴백 동작
- [ ] 전체: 60fps 물리 렌더링 유지 (색상/테마 전환 시에도)
- [ ] 전체: 단위 테스트 85%+ 커버리지
- [ ] 전체: TypeScript strict mode 에러 없음
- [ ] 전체: ESLint 에러 없음
