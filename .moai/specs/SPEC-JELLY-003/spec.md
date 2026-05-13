---
id: SPEC-JELLY-003
version: 1.0.0
status: Planned
created: 2026-05-13
updated: 2026-05-13
author: manager-spec
priority: High
issue_number: ""
---

# SPEC-JELLY-003: Daily Jelly State Initialization

## HISTORY

| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2026-05-13 | 1.0.0 | manager-spec | Initial SPEC creation |

## 1. Overview

사용자가 새로운 날에 앱을 열었을 때, 전날의 감정 상태가 젤리에 표시되는 문제를 해결한다. 날짜가 변경되면 젤리의 감정 상태를 기본값으로 초기화하여, 매일 아침 새로운 시작을 경험할 수 있도록 한다.

### Problem Statement

현재 `jellyStore`는 Zustand persist 미들웨어를 통해 `lastEmotion`, `emotionColor`, `currentState`를 localStorage에 저장한다. 사용자가 다음 날 앱을 열면 전날의 감정 상태가 그대로 복원되어, 젤리가 기본 상태가 아닌 어제의 감정 상태로 표시된다.

### User Impact

- 사용자는 매일 아침 젤리가 기본(평온) 상태로 시작하기를 기대한다
- 전날의 부정적 감정 상태가 오늘까지 이어지는 것은 UX 관점에서 바람직하지 않다
- "아침 루틴" 사용 시나리오에서 새로운 시작의 느낌을 제공해야 한다

## 2. Scope

### In Scope

- 날짜 변경 감지 로직 (lastAccessDate 기반)
- 감정 상태 일일 초기화 (lastEmotion, emotionColor, currentState, emotionHistory)
- HomePage 마운트 시 초기화 트리거
- localStorage persist 스키마 업데이트

### Out of Scope

- beadCount 초기화 (사용자가 명시적으로 불필요함을 확인)
- jellyShape, jellyName 초기화 (사용자 설정이므로 영속 유지)
- Supabase 서버 측 날짜 초기화 (클라이언트 측 전용)
- 푸시 알림 기반 자정 초기화 (앱 시작 시에만 수행)

## 3. Assumptions

1. 사용자의 기기 시간이 신뢰할 수 있다 (서버 시간 검증 불필요)
2. 로컬 타임존 기준 날짜 비교로 충분하다
3. 앱은 항상 HomePage를 통해 시작된다
4. SSR 환경에서는 날짜 비교를 수행하지 않는다 (클라이언트 전용)

## 4. Requirements

### REQ-INIT-001: Last Access Date Storage [Ubiquitous]

The system **shall** store the last access date as a YYYY-MM-DD string in the user's local timezone within the persisted store.

- Storage location: `lastAccessDate` field in `jellyStore` persist partialize
- Format: ISO date string (e.g., "2026-05-13")
- Timezone: User's local timezone (not UTC)

### REQ-INIT-002: Daily State Reset [Event-Driven]

**When** the current date (local timezone) differs from `lastAccessDate`, the system **shall** reset the following state to their default values:

| State Field | Default Value | Source |
|-------------|---------------|--------|
| `lastEmotion` | `'joy'` | jellyStore initial state |
| `emotionColor` | `JELLY_COLOR` (`'#FFD1DC'`) | emotion.ts constant |
| `currentState` | `'idle'` | jellyStore initial state |
| `emotionHistory` | `[]` | jellyStore initial state |

### REQ-INIT-003: Same-Day Preservation [State-Driven]

**While** the current date matches `lastAccessDate`, the system **shall** preserve all emotional state without modification. The user's same-day emotional journey is maintained across app restarts.

### REQ-INIT-004: First Launch Handling [State-Driven]

**While** `lastAccessDate` is empty or undefined (first launch or data cleared), the system **shall** set `lastAccessDate` to the current date without modifying existing state. Default initial values already apply on first launch.

### REQ-INIT-005: Initialization Timing [Event-Driven]

**When** the HomePage component mounts on the client, the system **shall** perform the date comparison check. The check **shall** execute after Zustand persist rehydration completes to avoid overwriting persisted data.

### REQ-INIT-006: User Preference Preservation [Unwanted Behavior]

**If** a daily reset is triggered, the system **shall not** reset the following user preferences:

- `jellyShape` (사용자가 선택한 젤리 외형)
- `jellyName` (사용자가 설정한 젤리 이름)
- `touchCooldownAt` (터치 쿨다운은 자연 만료됨)
- `beadCount` (사용자가 명시적으로 불필요 확인)

### REQ-INIT-007: Last Access Date Update [Event-Driven]

**When** the daily initialization check completes (reset or no-reset), the system **shall** update `lastAccessDate` to the current date to prevent repeated resets within the same session.

## 5. Constraints

### Non-Functional

- Date comparison must complete within 5ms (simple string comparison)
- No network requests required for date comparison
- SSR-safe: no `window` or `localStorage` access during server rendering

### Technical

- Must use Zustand persist middleware (existing pattern)
- Must not break existing persist version migration chain
- persist version increment required (v2 -> v3)

### Compatibility

- Must work in Toss WebView environment
- Must handle timezone differences correctly (local date, not UTC)
- Must not interfere with existing emotion flow (idle -> anticipation -> eating -> satisfied)

## 6. Dependencies

- `jellyStore` (Zustand persist middleware)
- `JELLY_COLOR` constant from `@/lib/constants/emotion`
- `HomePage` component lifecycle

## 7. Related SPECs

- SPEC-JELLY-001: Core jelly state machine and store architecture
- SPEC-JELLY-002: Jelly visual enhancements
- SPEC-TOUCH-001: Jelly touch interaction (uses `currentState`)

## 8. Exclusions (What NOT to Build)

- Server-side daily reset via API or Supabase function
- Midnight push notification to trigger reset
- beadCount daily reset (explicitly excluded by user)
- Multi-day absence handling (e.g., "you've been gone for 3 days" message)
- Analytics tracking for daily reset events
