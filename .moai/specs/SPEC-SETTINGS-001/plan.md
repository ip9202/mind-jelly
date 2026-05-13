---
id: SPEC-SETTINGS-001
version: 1.0.0
status: Planned
created: 2026-05-13
updated: 2026-05-13
author: manager-spec
priority: Medium
---

# Implementation Plan: SPEC-SETTINGS-001

## Overview

Emotion state persistence 설정 기능 구현. 3개 파일 수정 예정.

## Milestones

### Milestone 1: Store Layer (Priority High)

**Scope**: `src/stores/jellyStore.ts`

- `JellyStoreState` 인터페이스에 `persistEmotion: boolean` 필드 추가
- `setPersistEmotion: (value: boolean) => void` 액션 추가
- 초기 상태에 `persistEmotion: false` 추가
- `persist` partialize에 `persistEmotion` 포함
- persist 버전 증가 (기존 버전 + 1)
- `checkDiaryAndReset()` 수정:
  - `persistEmotion === true`이고 `hasDiary === false`일 때 `lastEmotion`, `emotionColor` 보존
  - `currentState`, `faceExpression`은 항상 idle로 리셋 (REQ-PERSIST-007)
- Migration: 이전 버전 사용자의 경우 `persistEmotion` 필드가 없으면 `false`로 초기화

### Milestone 2: UI Layer (Priority High)

**Scope**: `src/app/settings/page.tsx`

- `EmotionPersistenceSection` 컴포넌트 생성
- `JellyShapeSection`과 "정보" 섹션 사이에 배치
- glass-card 디자인 패턴 적용:
  - 섹션 제목: "감정 설정" (font-gowun, text-xl, font-bold, text-primary)
  - 카드: glass-card rounded-lg, shadow, border-white/40
  - 항목: label + description + toggle switch
- Toggle: `jellyStore`의 `persistEmotion` 읽기, `setPersistEmotion` 호출
- 접근성: aria-label, aria-checked 속성 포함

### Milestone 3: Testing (Priority High)

**Scope**: `src/stores/__tests__/jellyStore.test.ts`

- `persistEmotion` 기본값이 `false`인지 확인
- `setPersistEmotion(true)` 호출 시 상태 변경 확인
- `persistEmotion === false` + `hasDiary === false`일 때 감정 초기화 확인 (기존 동작)
- `persistEmotion === true` + `hasDiary === false`일 때 감정 보존 확인
- `persistEmotion === true`일 때도 `currentState`는 idle로 리셋되는지 확인
- localStorage persist 마이그레이션 테스트

## Technical Approach

### Store Changes

```
jellyStore.ts:
  - Add persistEmotion: boolean to interface
  - Add setPersistEmotion action
  - Modify checkDiaryAndReset():
    if (!hasDiary) {
      if (persistEmotion) {
        // Preserve lastEmotion, emotionColor
        // Reset currentState, faceExpression only
      } else {
        // Existing full reset (SPEC-JELLY-003)
      }
    }
  - Update persist partialize to include persistEmotion
  - Increment persist version
```

### UI Component Structure

```
SettingsPage
  ProfileSection
  JellyShapeSection
  EmotionPersistenceSection  <-- NEW
    Section Title: "감정 설정"
    Glass Card:
      Row:
        Label: "감정 상태 유지"
        Description: "켜면 매일 초기화되지 않고 이전 감정이 유지돼요"
        Toggle: persistEmotion state
  About Section
  Decorative Element
```

### Persist Migration

When persist version increments, add migration to handle missing `persistEmotion`:

```typescript
if (persistedState.version < newVersion) {
  // Add default persistEmotion: false for existing users
}
```

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/stores/jellyStore.ts` | Modify | Add persistEmotion field, action, and update checkDiaryAndReset |
| `src/app/settings/page.tsx` | Modify | Add EmotionPersistenceSection between JellyShape and Info sections |
| `src/stores/__tests__/jellyStore.test.ts` | Modify/Add | Test persistEmotion behavior in checkDiaryAndReset |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Persist version conflict with existing migrations | Low | High | Test migration chain with existing persisted data |
| Toggle UI breaks on older WebView | Low | Medium | Use standard HTML input checkbox with CSS styling |
| Existing users lose state on upgrade | Low | High | Default `persistEmotion` to `false` in migration |
