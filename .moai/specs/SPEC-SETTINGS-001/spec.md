---
id: SPEC-SETTINGS-001
version: 1.0.0
status: Planned
created: 2026-05-13
updated: 2026-05-13
author: manager-spec
priority: Medium
issue_number: ""
---

# SPEC-SETTINGS-001: Emotion State Persistence Setting

## HISTORY

| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2026-05-13 | 1.0.0 | manager-spec | Initial SPEC creation |

## 1. Overview

사용자가 젤리의 감정 상태 초기화 동작을 제어할 수 있는 설정을 추가한다. 현재 SPEC-JELLY-003에서 구현된 "매일 초기화" 동작 외에 "상태 유지" 옵션을 제공하여, 사용자가 오늘 다이어리를 작성하지 않았더라도 이전 감정 상태를 유지할 수 있도록 한다.

### Problem Statement

SPEC-JELLY-003에서 `checkDiaryAndReset()`은 오늘 작성한 다이어리가 없으면 항상 `lastEmotion`과 `emotionColor`를 기본값으로 초기화한다. 일부 사용자는 전날의 감정이 젤리에 계속 표시되기를 원하며, "상태 유지" 모드가 이 니즈를 충족한다.

### User Impact

- "매일 초기화" 모드: 매일 아침 젤리가 기본(평온) 상태로 시작 (현재 동작)
- "상태 유지" 모드: 사용자가 명시적으로 다이어리를 작성하기 전까지 이전 감정 상태가 젤리에 유지됨
- 설정은 Settings 페이지에서 간단한 토글로 제어

## 2. Scope

### In Scope

- `jellyStore`에 `persistEmotion: boolean` 필드 추가 (기본값: `false` = 매일 초기화)
- `checkDiaryAndReset()` 로직에 `persistEmotion` 설정 반영
- Settings 페이지에 감정 상태 지속성 설정 UI 추가
- localStorage persist 스키마 업데이트 (버전 증가)
- 기존 SPEC-JELLY-003 동작과의 하위 호환성 유지

### Out of Scope

- Supabase 서버 측 설정 동기화 (향후 SPEC에서 다룰 수 있음)
- 감정 히스토리(`emotionHistory`)의 지속성 설정 변경
- 다른 설정값(젤리 모양, 이름 등)의 지속성 변경
- 설정 변경 시점의 즉각적 감정 상태 변경 (다음 앱 시작 시에만 적용)

## 3. Assumptions

1. `persistEmotion` 설정은 localStorage에 저장되며 기기 간 동기화되지 않는다
2. 기본값은 `false`(매일 초기화)이므로 기존 사용자에게 영향이 없다
3. 설정 변경은 다음 `checkDiaryAndReset()` 호출 시점에 반영된다
4. 앱인토스 WebView 환경에서 localStorage가 정상 동작한다

## 4. Requirements

### REQ-PERSIST-001: Persist Emotion Setting Field [Ubiquitous]

The system **shall** store a `persistEmotion` boolean field within the persisted `jellyStore`. The default value **shall** be `false`, preserving the current SPEC-JELLY-003 daily reset behavior.

- Storage location: `persistEmotion` field in `jellyStore` persist partialize
- Type: `boolean`
- Default: `false` (daily reset mode)
- Persisted: Yes (Zustand persist middleware)

### REQ-PERSIST-002: Check Diary and Reset Logic Update [State-Driven]

**While** `persistEmotion` is `false`, the system **shall** execute the existing `checkDiaryAndReset()` logic from SPEC-JELLY-003 unchanged: when no diary exists for today, reset `lastEmotion` to `'joy'` and `emotionColor` to `JELLY_COLOR`.

**While** `persistEmotion` is `true`, the system **shall** preserve `lastEmotion` and `emotionColor` even when no diary exists for today. The `currentState` and `faceExpression` **shall** still reset to `'idle'` and `STATE_FACES.idle` respectively, as these are transient UI states.

### REQ-PERSIST-003: Settings UI Component [Event-Driven]

**When** the user navigates to the Settings page, the system **shall** display an "emotion persistence" setting item between the "젤리 모양" (Jelly Shape) section and the "정보" (Info) section.

The setting item **shall** display:
- Label: "감정 상태 유지"
- Description: "켜면 매일 초기화되지 않고 이전 감정이 유지돼요"
- Control: Toggle switch matching the existing glass-card design pattern
- State: Reflects the current `persistEmotion` value from `jellyStore`

### REQ-PERSIST-004: Toggle Action [Event-Driven]

**When** the user toggles the emotion persistence setting, the system **shall** update the `persistEmotion` field in `jellyStore` immediately. The new value **shall** be persisted to localStorage via Zustand persist middleware.

### REQ-PERSIST-005: Setting Persistence [State-Driven]

**While** the app is running or restarted, the system **shall** read the `persistEmotion` value from localStorage during Zustand rehydration and apply it during the next `checkDiaryAndReset()` call.

### REQ-PERSIST-006: Backward Compatibility [Unwanted Behavior]

**If** a user has no `persistEmotion` field in their localStorage (existing users upgrading), the system **shall not** crash or show unexpected behavior. The system **shall** default `persistEmotion` to `false`, maintaining identical behavior to pre-update versions.

### REQ-PERSIST-007: Reset Action in Persist Mode [State-Driven]

**While** `persistEmotion` is `true` and no diary exists for today, the system **shall** still reset the following transient fields:
- `currentState` to `'idle'`
- `faceExpression` to `STATE_FACES.idle`

This ensures the jelly always starts in an idle animation state, while preserving the emotional identity (color and emotion type).

## 5. Constraints

### Non-Functional

- Toggle state change must be reflected in localStorage within 100ms
- No network requests required for the setting toggle
- SSR-safe: no `window` or `localStorage` access during server rendering

### Technical

- Must use Zustand persist middleware (existing pattern)
- Must not break existing persist version migration chain
- Persist version increment required
- Must match existing settings page UI pattern (glass-card style, font-gowun)

### Compatibility

- Must work in Toss WebView (앱인토스) environment
- Must be backward compatible with existing SPEC-JELLY-003 implementation
- Must not affect existing users until they explicitly change the setting

## 6. Dependencies

- `jellyStore` (Zustand persist middleware, SPEC-JELLY-001)
- `checkDiaryAndReset()` function (SPEC-JELLY-003)
- `JELLY_COLOR` constant from `@/lib/constants/emotion`
- Settings page component at `src/app/settings/page.tsx`

## 7. Related SPECs

- SPEC-JELLY-001: Core jelly state machine and store architecture
- SPEC-JELLY-003: Daily jelly state initialization (direct dependency)
- SPEC-TOUCH-001: Jelly touch interaction (uses `currentState`)

## 8. Exclusions (What NOT to Build)

- Server-side setting sync via Supabase
- Per-day persistence history or analytics
- Auto-persistence based on usage patterns
- Multiple persistence modes beyond the binary toggle
- Setting import/export functionality
