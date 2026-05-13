---
id: SPEC-JELLY-003
version: 1.0.0
status: Planned
---

# Acceptance Criteria: SPEC-JELLY-003

## Test Scenarios

### Scenario 1: Day Change Reset

**Given** the user last accessed the app on "2026-05-12"
**And** `lastAccessDate` is "2026-05-12" in persisted storage
**And** `lastEmotion` is "sadness"
**And** `emotionColor` is "#7EB8D8"
**And** `currentState` is "satisfied"
**When** the user opens the app on "2026-05-13"
**Then** `lastEmotion` **shall** be reset to "joy"
**And** `emotionColor` **shall** be reset to "#FFD1DC" (JELLY_COLOR)
**And** `currentState` **shall** be reset to "idle"
**And** `emotionHistory` **shall** be reset to an empty array
**And** `lastAccessDate` **shall** be updated to "2026-05-13"
**And** the jelly **shall** display the default joy emotion with default color

### Scenario 2: Same-Day Preservation

**Given** the user accessed the app earlier today ("2026-05-13")
**And** `lastAccessDate` is "2026-05-13"
**And** `lastEmotion` is "anger"
**And** `emotionColor` is "#F28B82"
**And** `currentState` is "idle"
**When** the user reopens the app on the same day ("2026-05-13")
**Then** `lastEmotion` **shall** remain "anger"
**And** `emotionColor` **shall** remain "#F28B82"
**And** `currentState` **shall** remain "idle"
**And** `emotionHistory` **shall** remain unchanged
**And** `lastAccessDate` **shall** remain "2026-05-13"

### Scenario 3: First Launch

**Given** the user has never opened the app before
**And** `lastAccessDate` is undefined or empty in localStorage
**And** all store values are at their initial defaults
**When** the user opens the app for the first time
**Then** `lastAccessDate` **shall** be set to the current date
**And** `lastEmotion` **shall** remain "joy" (default)
**And** `emotionColor` **shall** remain JELLY_COLOR (default)
**And** `currentState` **shall** remain "idle" (default)

### Scenario 4: User Preferences Preserved After Reset

**Given** the user last accessed the app on "2026-05-12"
**And** `jellyShape` is "mallang"
**And** `jellyName` is "myJelly"
**When** the user opens the app on "2026-05-13" (new day)
**Then** `jellyShape` **shall** remain "mallang"
**And** `jellyName` **shall** remain "myJelly"
**And** emotional state fields **shall** be reset to defaults (per Scenario 1)

### Scenario 5: Persist Version Migration

**Given** the user has persisted data at version 2 (no `lastAccessDate`)
**When** the app loads with the new version 3 persist schema
**Then** the migration **shall** preserve all existing data
**And** `lastAccessDate` **shall** be initialized to the current date
**And** no state reset **shall** occur during migration

### Scenario 6: SSR Safety

**Given** the HomePage component renders on the server
**When** the component hydrates on the client
**Then** the daily reset check **shall** only execute on the client
**And** no `window` or `localStorage` access **shall** occur during SSR
**And** no hydration mismatch **shall** occur

## Edge Cases

### EC-001: Midnight Boundary

**Given** the user has the app open at 23:59
**And** the date changes to the next day at 00:00
**When** the user navigates to HomePage after midnight
**Then** the daily reset **shall** trigger on the next HomePage mount
**Note**: The reset only triggers on HomePage mount, not during an active session.

### EC-002: Multi-Day Absence

**Given** the user last accessed the app on "2026-05-10"
**And** today is "2026-05-13" (3 days later)
**When** the user opens the app
**Then** the daily reset **shall** trigger (same as single day change)
**And** `lastAccessDate` **shall** be set to "2026-05-13"

### EC-003: Date String Mismatch Format

**Given** `lastAccessDate` is stored in an unexpected format
**When** the daily reset check runs
**Then** the system **shall** treat it as a date change and reset
**And** `lastAccessDate` **shall** be corrected to proper YYYY-MM-DD format

### EC-004: Active Emotion Flow During Day Change

**Given** the user is in the middle of an emotion flow (currentState is "eating")
**And** the date changes at midnight
**When** the user continues the flow without leaving HomePage
**Then** the daily reset **shall not** interrupt the active flow
**Note**: Reset only triggers on HomePage mount, not during active session.

## Quality Gate Criteria

### Tested
- [ ] Unit tests for `resetDailyState` action cover all 3 scenarios (day change, same day, first launch)
- [ ] Unit tests verify user preference preservation
- [ ] Unit tests verify persist migration from v2 to v3
- [ ] Test coverage for modified files >= 85%

### Readable
- [ ] `resetDailyState` action has clear JSDoc comment in Korean (per code_comments setting)
- [ ] Date comparison logic is self-documenting
- [ ] @MX:SPEC tags reference SPEC-JELLY-003

### Unified
- [ ] Code follows existing Zustand store patterns
- [ ] Consistent with SPEC-JELLY-001 and SPEC-JELLY-002 coding style

### Secured
- [ ] No sensitive data in `lastAccessDate` (just a date string)
- [ ] No XSS risk from date string handling

### Trackable
- [ ] All new code has @MX:SPEC tags referencing SPEC-JELLY-003
- [ ] Git commit references SPEC-JELLY-003

## Definition of Done

- [ ] All 6 acceptance scenarios pass
- [ ] All 4 edge cases handled correctly
- [ ] Unit tests written and passing (>= 85% coverage on modified files)
- [ ] No TypeScript errors
- [ ] No ESLint warnings on modified files
- [ ] Persist version migration tested
- [ ] Manual verification: open app, set emotion, change device date, reopen -> reset confirmed
- [ ] @MX tags added to all new/modified functions
