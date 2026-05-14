---
id: SPEC-SETTINGS-002
version: 1.0.0
status: Planned
created: 2026-05-14
updated: 2026-05-14
author: MoAI Orchestrator
priority: High
issue_number: ""
---

# SPEC-SETTINGS-002: Data Reset Feature

## HISTORY

| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2026-05-14 | 1.0.0 | MoAI Orchestrator | Initial SPEC creation |

## 1. Overview

설정 페이지의 "데이터 초기화" 버튼에 실제 초기화 로직을 연결한다. 사용자가 모든 로컬 데이터를 삭제하고 앱을 초기 상태로 되돌릴 수 있도록 한다.

### Problem Statement

설정 페이지의 "데이터 초기화" 버튼은 UI만 존재하고 클릭 핸들러가 없다. 사용자는 앱을 완전 초기화할 방법이 없다.

### User Impact

- "데이터 초기화" 탭 시 확인 다이얼로그 표시
- 확인 시 모든 localStorage 데이터 삭제
- Zustand store 상태 초기화
- Supabase 일기 데이터 삭제 (사용자 확인 후)
- 초기화 완료 후 앱 자동 새로고침

## 2. Scope

### In Scope

- "데이터 초기화" 버튼에 클릭 핸들러 연결
- 확인 다이얼로그 (1단계: 로컬 데이터 초기화 확인)
- localStorage 전체 삭제 (앱 관련 키만)
- Zustand store 초기화 (jellyStore, rewardStore, diaryStore)
- Supabase 일기 데이터 삭제
- 초기화 완료 후 페이지 새로고침

### Out of Scope

- 사용자 계정 삭제 (Supabase Auth)
- 친구 관계 삭제
- 닉네임/초대코드 초기화
- 선택적 데이터 초기화 (개별 항목 선택)
- 서버 측 설정 동기화

## 3. Assumptions

1. 데이터 초기화는 되돌릴 수 없는 파괴적 작업이므로 충분한 경고가 필요하다
2. 일기 데이터는 서버(Supabase)에도 저장되므로 별도 확인이 필요하다
3. 초기화 후 앱은 온보딩 또는 초기 화면으로 돌아간다
4. 앱인토스 WebView 환경에서 localStorage 삭제가 정상 동작한다

## 4. Requirements

### REQ-RESET-001: Data Reset Button Handler [Event-Driven]

**When** the user taps the "데이터 초기화" button in Settings page, the system **shall** display a confirmation dialog before proceeding.

The button **shall**:
- Be located at `src/app/settings/page.tsx` line 290-293
- Trigger a confirmation dialog on click
- Maintain existing red text styling (text-error class)

### REQ-RESET-002: Confirmation Dialog [Event-Driven]

**When** the data reset button is tapped, the system **shall** display a modal dialog with:

- Title: "데이터 초기화"
- Message: "모든 데이터가 삭제됩니다. 일기, 감정 기록, 보상 등 모든 정보가 복구할 수 없게 됩니다."
- Confirm button: "초기화" (red, destructive style)
- Cancel button: "취소"
- Supabase userId가 있을 경우 추가 확인: "서버에 저장된 일기도 함께 삭제됩니다."

### REQ-RESET-003: LocalStorage Clear [State-Driven]

**While** the user confirms the data reset, the system **shall** remove the following localStorage keys:

- `jelly-storage`
- `reward-storage`
- `ad_frequency_history`
- `mind-jelly-theme`

The system **shall NOT** remove non-app localStorage keys.

### REQ-RESET-004: Zustand Store Reset [State-Driven]

**While** the data reset is in progress, the system **shall** reset all Zustand stores:

- `jellyStore`: Call `jellyStore.setState()` with initial values (currentState: 'idle', jellyName: '', jellyShape: 'ppung', lastEmotion: 'joy', emotionColor: JELLY_COLOR, emotionHistory: [], persistEmotion: false)
- `rewardStore`: Call `rewardStore.reset()` (existing method)
- `diaryStore`: Call `diaryStore.setState()` with { entries: [], supabaseUserId: null, isLoading: false }

### REQ-RESET-005: Supabase Diary Deletion [Event-Driven]

**When** the user confirms data reset AND `diaryStore.supabaseUserId` exists, the system **shall** delete all diary entries for the user from Supabase:

- Use `supabase.from('diary_entries').delete().eq('user_id', userId)`
- Handle errors gracefully (log error but proceed with local reset)
- This operation happens after local storage clear

### REQ-RESET-006: App Restart [Event-Driven]

**When** all data reset operations complete, the system **shall** reload the application using `window.location.reload()` or `router.push('/')` to ensure a clean state.

### REQ-RESET-007: Error Handling [Unwanted Behavior]

**If** any step of the data reset fails (Supabase deletion error, localStorage access error), the system **shall not** partially reset. The system **shall**:

- Log the error to console
- Show a toast or alert: "초기화 중 오류가 발생했습니다. 다시 시도해주세요."
- NOT reload the page on failure
- Still attempt to clear localStorage and reset stores even if Supabase fails

## 5. Acceptance Criteria

1. 설정 페이지 "데이터 초기화" 버튼 클릭 시 확인 다이얼로그 표시
2. 취소 시 아무 동작 없음
3. 확인 시 localStorage 키 4개 삭제
4. 확인 시 jellyStore, rewardStore, diaryStore 초기 상태로 리셋
5. Supabase 사용자 ID 존재 시 diary_entries 전체 삭제
6. 초기화 완료 후 페이지 새로고침
7. 오류 발생 시 사용자에게 알림 (부분 초기화 방지)

## 6. Technical Approach

### Implementation Location

- Primary file: `src/app/settings/page.tsx` (add click handler + dialog)
- No new files needed (use inline dialog or existing UI components)

### Dialog Implementation

Use a simple React state-based modal dialog (no external dependency):

```tsx
const [showResetDialog, setShowResetDialog] = useState(false);
const [isResetting, setIsResetting] = useState(false);
```

### Reset Logic

Single async function `handleDataReset()`:

1. Set loading state
2. Get supabaseUserId from diaryStore
3. Clear localStorage keys
4. Reset Zustand stores
5. Delete Supabase diary entries (if userId exists)
6. Reload page

### Files to Modify

1. `src/app/settings/page.tsx` - Add dialog + handler (~50 lines)

## 7. Constraints

### Non-Functional

- Dialog must appear within 100ms of button click
- Reset operation must complete within 3 seconds
- No external dialog library dependency

### Technical

- Must work in Toss WebView (앱인토스) environment
- Must handle missing localStorage gracefully (SSR-safe)
- Dialog must match existing glass-card design pattern

## 8. Dependencies

- `jellyStore` (Zustand store)
- `rewardStore` (Zustand store, existing `reset()` method)
- `diaryStore` (Zustand store)
- `supabase` client from `@/lib/supabase/client`
- `JELLY_COLOR` constant from `@/lib/constants/emotion`

## 9. Related SPECs

- SPEC-SETTINGS-001: Emotion persistence setting (sibling SPEC in settings domain)
- SPEC-JELLY-001: Core jelly store architecture
- SPEC-DIARY-001: Diary data model

## 10. Exclusions (What NOT to Build)

- User account deletion
- Friend relationship deletion
- Selective/partial data reset
- Data export before reset
- Undo functionality
- Reset animation or progress bar
