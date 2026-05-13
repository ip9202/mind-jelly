---
id: SPEC-SETTINGS-001
version: 1.0.0
status: Planned
created: 2026-05-13
updated: 2026-05-13
author: manager-spec
priority: Medium
---

# Acceptance Criteria: SPEC-SETTINGS-001

## Acceptance Criteria

### AC-001: Persist Emotion Default Value

**Given** a fresh install of the app with no localStorage data
**When** the app initializes and Zustand store hydrates
**Then** `persistEmotion` shall be `false` in `jellyStore`

### AC-002: Daily Reset Behavior Preserved (persistEmotion = false)

**Given** `persistEmotion` is `false` (default)
**And** the user has no diary entry for today
**When** `checkDiaryAndReset()` executes on app init
**Then** `lastEmotion` shall be reset to `'joy'`
**And** `emotionColor` shall be reset to `JELLY_COLOR` (`'#FFD1DC'`)
**And** `currentState` shall be reset to `'idle'`
**And** `faceExpression` shall be reset to `STATE_FACES.idle`

### AC-003: Emotion Preservation When Enabled (persistEmotion = true)

**Given** `persistEmotion` is `true`
**And** the user's `lastEmotion` is `'sadness'`
**And** the user's `emotionColor` is `'#6B9BD2'`
**And** the user has no diary entry for today
**When** `checkDiaryAndReset()` executes on app init
**Then** `lastEmotion` shall remain `'sadness'`
**And** `emotionColor` shall remain `'#6B9BD2'`
**And** `currentState` shall still be reset to `'idle'`
**And** `faceExpression` shall still be reset to `STATE_FACES.idle`

### AC-004: Diary Exists Behavior Unchanged

**Given** `persistEmotion` is `true` or `false`
**And** the user has a diary entry for today
**When** `checkDiaryAndReset()` executes on app init
**Then** `lastEmotion` shall be preserved (existing behavior)
**And** `emotionColor` shall be preserved (existing behavior)
**And** `currentState` shall be reset to `'idle'` (existing behavior)

### AC-005: Settings Page Displays Toggle

**Given** the user navigates to the Settings page
**When** the page renders
**Then** an "emotion persistence" section shall appear between "젤리 모양" and "정보" sections
**And** the section shall contain a label "감정 상태 유지"
**And** the section shall contain a description explaining the toggle behavior
**And** the toggle shall reflect the current `persistEmotion` value

### AC-006: Toggle Changes Persist Emotion Value

**Given** the user is on the Settings page
**And** `persistEmotion` is currently `false`
**When** the user taps the toggle to enable emotion persistence
**Then** `persistEmotion` in `jellyStore` shall update to `true`
**And** the value shall be persisted to localStorage
**And** the toggle visual state shall reflect the new value

### AC-007: Backward Compatibility

**Given** an existing user has localStorage data without `persistEmotion` field
**When** the app initializes with the updated store version
**Then** the store shall initialize `persistEmotion` to `false`
**And** no errors or crashes shall occur
**And** the jelly behavior shall be identical to pre-update versions

### AC-008: Toggle Persists Across Sessions

**Given** the user enables emotion persistence (`persistEmotion = true`)
**And** the user closes and reopens the app
**When** the app initializes and store hydrates from localStorage
**Then** `persistEmotion` shall be `true`
**And** the Settings page toggle shall show the enabled state

## Edge Cases

### EC-001: Rapid Toggle Switching

**Given** the user rapidly toggles the setting multiple times
**When** the final toggle state settles
**Then** `persistEmotion` shall match the final toggle position
**And** no intermediate states shall be persisted incorrectly

### EC-002: Supabase Query Failure During Reset

**Given** `persistEmotion` is `true`
**And** the `hasTodayDiary()` Supabase query fails (network error)
**When** `checkDiaryAndReset()` catches the error
**Then** the existing emotion state shall be preserved (current fallback behavior)
**And** `lastAccessDate` shall still be updated

### EC-003: First Launch With New Version

**Given** a user installs the app for the first time with the new version
**When** `checkDiaryAndReset()` runs with no previous state
**Then** `persistEmotion` shall default to `false`
**And** the jelly shall display with default emotion (`'joy'`, `JELLY_COLOR`)

## Quality Gate Criteria

### Tested

- [ ] Unit tests for `persistEmotion` default value
- [ ] Unit tests for `checkDiaryAndReset()` with both `persistEmotion` states
- [ ] Unit tests for `setPersistEmotion()` action
- [ ] Component test for toggle UI rendering
- [ ] Persist migration test for backward compatibility

### Readable

- [ ] Korean code comments per language.yaml `code_comments: ko`
- [ ] @MX:SPEC tag referencing SPEC-SETTINGS-001 on modified functions
- [ ] Clear component naming: `EmotionPersistenceSection`

### Unified

- [ ] glass-card design pattern matches existing settings items
- [ ] font-gowun used consistently
- [ ] Toggle switch styling consistent with app theme

### Secured

- [ ] No sensitive data in `persistEmotion` field (boolean only)
- [ ] SSR-safe: no window/localStorage access during server rendering
- [ ] Zustand persist middleware handles storage safely

### Trackable

- [ ] Git commit references SPEC-SETTINGS-001
- [ ] @MX:NOTE tags on `checkDiaryAndReset()` modification points
- [ ] CHANGELOG entry for the new setting

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] All edge case scenarios handled
- [ ] Unit tests pass with >= 85% coverage on modified files
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Backward compatible with existing users
- [ ] Settings page renders correctly in Toss WebView
- [ ] `persistEmotion` persists across app restarts
