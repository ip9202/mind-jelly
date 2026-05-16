---
id: SPEC-PERF-001
version: "1.0.0"
status: draft
created: "2026-05-16"
updated: "2026-05-16"
author: MoAI
priority: High
issue_number: 0
---

# SPEC-PERF-001: 마음젤리 성능 최적화

## HISTORY
- 2026-05-16: 초기 SPEC 생성 (v1.0.0)

## Overview

마음젤리 서비스의 모바일 WebView(앱인토스) 환경에서 과도한 메모리/CPU 사용을 유발하는 로직을 개선하여 시스템 안정성과 배터리 효율을 높입니다.

## Requirements

### REQ-PERF-001: 일기 엔트리 로딩 제한 (HIGH)
**Type:** If [조건], then [시스템] shall [동작]

사용자가 일기를 조회할 때, 시스템은 최근 30개 항목만 로드해야 한다.

**Files:** `src/lib/supabase/db.ts` (getMyDiaryEntries)
**Acceptance Criteria:**
- Given: 사용자가 100개 이상의 일기를 보유한 상태에서
- When: 홈 화면에서 일기를 로드할 때
- Then: 최대 30개 항목만 로드되어야 한다

### REQ-PERF-002: 물리 엔진 idle 상태 rAF 정지 (HIGH)
**Type:** While [상태], the system shall [동작]

물리 엔진에 활성 비드(구슬)가 없는 동안, 시스템은 requestAnimationFrame 루프를 일시정지해야 한다.

**Files:** `src/app/home/usePhysicsInit.ts`
**Acceptance Criteria:**
- Given: 홈 화면에서 모든 구슬이 수집된 상태에서
- When: 비드가 화면에 없을 때
- Then: rAF 루프가 정지되어 CPU 사용량이 0에 가까워져야 한다
- And: 새 구슬이 추가되면 루프가 자동 재개되어야 한다

### REQ-PERF-003: JellyRenderer React.memo 적용 (MEDIUM)
**Type:** The system shall [동작]

JellyRenderer 컴포넌트는 props가 변경되지 않은 경우 리렌더링을 건너뛰어야 한다.

**Files:** `src/components/jelly/JellyRenderer.tsx`
**Acceptance Criteria:**
- Given: 부모 컴포넌트가 리렌더링될 때
- When: JellyRenderer의 props(bodies, face, emotionColor 등)가 동일한 경우
- Then: JellyRenderer는 리렌더링되지 않아야 한다

### REQ-PERF-004: BeadGroup 중복 allBodies 호출 제거 (MEDIUM)
**Type:** The system shall [동작]

BeadGroup 컴포넌트는 프레임당 Matter.Composite.allBodies()를 한 번만 호출해야 한다.

**Files:** `src/components/beads/BeadGroup.tsx`
**Acceptance Criteria:**
- Given: 비드 렌더링 사이클에서
- When: 물리 엔진 바디 목록이 필요할 때
- Then: allBodies()는 한 번만 호출되고 결과가 재사용되어야 한다

### REQ-PERF-005: 광고 노출 기록 재시도 로직 (MEDIUM)
**Type:** When [이벤트], the system shall [동작]

광고 노출 기록 RPC 호출이 실패할 때, 시스템은 최대 3회 재시도해야 한다.

**Files:** `src/lib/ad/adFrequencyControl.ts`
**Acceptance Criteria:**
- Given: 네트워크가 불안정한 상태에서
- When: incrementAdImpression 호출이 실패할 때
- Then: 1초 간격으로 최대 3회 재시도해야 한다

### REQ-PERF-006: Zustand 선택적 구독 패턴 (MEDIUM)
**Type:** The system shall [동작]

컴포넌트는 필요한 상태만 선택적으로 구독하여 불필요한 리렌더링을 방지해야 한다.

**Files:** `src/stores/jellyStore.ts`, 홈 페이지 컴포넌트들
**Acceptance Criteria:**
- Given: jellyStore에 여러 상태가 존재할 때
- When: 특정 상태만 구독하는 컴포넌트가 있을 때
- Then: 다른 상태 변경으로 인해 리렌더링되지 않아야 한다

### REQ-PERF-007: 렌더 경로 상수 추출 (LOW)
**Type:** The system shall [동작]

AMBIENT_BEADS와 같은 정적 배열은 컴포넌트 외부에 정의되어야 한다.

**Files:** `src/app/home/page.tsx`
**Acceptance Criteria:**
- Given: 홈 페이지 컴포넌트가 리렌더링될 때
- When: AMBIENT_BEADS 배열이 참조될 때
- Then: 새 객체가 생성되지 않고 기존 참조가 재사용되어야 한다

### REQ-PERF-008: Dynamic Import 로딩 스켈레톤 (LOW)
**Type:** When [이벤트], the system shall [동작]

지연 로딩되는 컴포넌트는 로딩 중 스켈레톤 UI를 표시해야 한다.

**Files:** `src/app/home/page.tsx`
**Acceptance Criteria:**
- Given: 초기 페이지 로드 시
- When: 동적 import 컴포넌트가 로딩 중일 때
- Then: 스켈레톤 UI가 표시되어야 한다

## Files to Modify

| File | REQ | Change Type |
|------|-----|-------------|
| src/lib/supabase/db.ts | REQ-PERF-001 | MODIFY |
| src/app/home/usePhysicsInit.ts | REQ-PERF-002 | MODIFY |
| src/components/jelly/JellyRenderer.tsx | REQ-PERF-003 | MODIFY |
| src/components/beads/BeadGroup.tsx | REQ-PERF-004 | MODIFY |
| src/lib/ad/adFrequencyControl.ts | REQ-PERF-005 | MODIFY |
| src/stores/jellyStore.ts | REQ-PERF-006 | MODIFY |
| src/app/home/page.tsx | REQ-PERF-007, REQ-PERF-008 | MODIFY |

## Exclusions

- React Native 전환 관련 작업 (별도 SPEC)
- Supabase 스키마 변경 (불필요)
- 새로운 기능 추가 (성능 개선만)
