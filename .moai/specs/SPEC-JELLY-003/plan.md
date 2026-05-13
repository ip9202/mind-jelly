---
id: SPEC-JELLY-003
version: 1.0.0
status: Planned
---

# Implementation Plan: SPEC-JELLY-003

## Overview

젤리 상태의 일일 초기화 기능 구현. 날짜 변경 감지 후 감정 상태를 기본값으로 리셋.

## Milestones

### M1: Store Layer Changes (Priority: High)

jellyStore에 `lastAccessDate` 필드와 `resetDailyState` 액션 추가.

**Tasks:**
1. Add `lastAccessDate: string` to `JellyStoreState` interface
2. Add `resetDailyState()` action to store
3. Update `partialize` to include `lastAccessDate`
4. Increment persist version to 3 (add migration from v2)
5. Add `@MX:NOTE` tags for the new daily reset logic

**Files:**
- `src/stores/jellyStore.ts`

**Technical Approach:**

```typescript
// New interface field
lastAccessDate: string;

// New action
resetDailyState: () => void;

// Implementation
resetDailyState: () => {
  const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD in local TZ
  const { lastAccessDate } = get();

  if (lastAccessDate && lastAccessDate !== today) {
    // Date changed: reset emotional state
    set({
      lastEmotion: 'joy',
      emotionColor: JELLY_COLOR,
      currentState: 'idle',
      emotionHistory: [],
      faceExpression: STATE_FACES.idle,
      lastAccessDate: today,
    });
  } else if (!lastAccessDate) {
    // First launch: just record the date
    set({ lastAccessDate: today });
  }
  // Same date: do nothing (implicit)
};

// Updated partialize
partialize: (state) => ({
  lastEmotion: state.lastEmotion,
  emotionColor: state.emotionColor,
  currentState: state.currentState,
  jellyShape: state.jellyShape as JellyShape,
  lastAccessDate: state.lastAccessDate,  // NEW
}),
```

**Date Format Note:**
- `new Date().toLocaleDateString('sv-SE')` produces `YYYY-MM-DD` in the user's local timezone
- This is simpler and more correct than `new Date().toISOString().slice(0, 10)` which uses UTC
- Alternative: manual formatting with `getFullYear()`, `getMonth()`, `getDate()`

### M2: HomePage Integration (Priority: High)

HomePage 마운트 시 `resetDailyState` 호출.

**Tasks:**
1. Add `useEffect` at HomePage component mount to call `resetDailyState`
2. Ensure effect runs after Zustand rehydration
3. Update visual state initialization to account for daily reset

**Files:**
- `src/app/home/page.tsx`

**Technical Approach:**

The daily reset should run early in the HomePage lifecycle, before the visual state is initialized from the store. Two approaches:

**Option A: Reset in useEffect (recommended)**
- Add a `useEffect` with empty dependency array
- Call `jellyStore.getState().resetDailyState()`
- The `jellyVisualEmotion` useState initializer already reads from store, so if the reset runs before render, it picks up the reset value
- Risk: Zustand persist rehydration is async; the reset might run before rehydration completes

**Option B: Reset in useState initializer (safer)**
- Perform the date check inside the `jellyVisualEmotion` useState initializer
- This ensures the check runs at the right time relative to store state
- But it mixes concerns in the component

**Recommended: Option A with rehydration guard**
- Zustand persist fires an `onRehydrateStorage` callback
- Use a flag or check in the useEffect to ensure rehydration completed
- Alternatively, Zustand persist sets state synchronously from localStorage on first render (client-side), so the useEffect approach is safe

```typescript
// In HomePage component
useEffect(() => {
  jellyStore.getState().resetDailyState();
}, []);
```

This is safe because:
1. Zustand persist rehydrates synchronously from localStorage on the client
2. `useEffect` runs after the initial render, by which time rehydration is complete
3. The `useState` initializers for `jellyVisualEmotion` and `jellyVisualColor` run before `useEffect`, but they already read the pre-reset values

Wait - this means the visual state would show yesterday's emotion briefly before the reset. We need the reset to happen BEFORE the visual state initialization.

**Revised approach: Reset in store rehydration callback**

Use Zustand persist's `onRehydrateStorage` to perform the date check during rehydration itself:

```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'jelly-storage',
    version: 3,
    onRehydrateStorage: () => {
      return (state, error) => {
        if (error || !state) return;
        const today = new Date().toLocaleDateString('sv-SE');
        if (state.lastAccessDate && state.lastAccessDate !== today) {
          // Reset emotional state after rehydration
          state.lastEmotion = 'joy';
          state.emotionColor = JELLY_COLOR;
          state.currentState = 'idle';
          state.emotionHistory = [];
          state.faceExpression = STATE_FACES.idle;
        }
        state.lastAccessDate = today;
      };
    },
  }
)
```

**Problem with onRehydrateStorage**: It receives the state but mutation there may not trigger React re-renders properly.

**Best approach: Combine both**
1. Add `resetDailyState` action to the store
2. Call it from a `useEffect` in HomePage that runs immediately
3. Also trigger a re-render by updating `jellyVisualEmotion` state if needed

Actually, the simplest correct approach:
1. Add `resetDailyState()` to the store
2. Call it in the `jellyVisualEmotion` useState initializer (runs once, before render)
3. This guarantees the store is reset before any visual state reads it

```typescript
const [jellyVisualEmotion, setJellyVisualEmotion] = useState<EmotionType>(() => {
  // Perform daily reset before reading state
  jellyStore.getState().resetDailyState();
  const { lastEmotion } = jellyStore.getState();
  return lastEmotion || 'joy';
});
```

This is the cleanest approach because:
- It runs exactly once during component initialization
- It runs before the first render, so no visual flicker
- It's co-located with the state that depends on it
- It's a synchronous operation

### M3: Testing (Priority: High)

일일 초기화 로직에 대한 단위 테스트 작성.

**Tasks:**
1. Unit test for `resetDailyState` action
2. Test same-day scenario (no reset)
3. Test day-change scenario (full reset)
4. Test first-launch scenario (date set, no state change)
5. Test user preferences preserved after reset

**Files:**
- `src/stores/__tests__/jellyStore.dailyReset.test.ts`

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Zustand rehydration timing | Visual flicker if reset runs after render | Call reset in useState initializer |
| Timezone edge cases | Date boundary at midnight | Use local timezone consistently |
| persist version migration | Existing users lose state | Migration preserves existing data, only adds lastAccessDate |
| SSR hydration mismatch | Server and client render different | Reset only runs on client (useState initializer is client-only) |

## Technical Decisions

1. **Date format**: `YYYY-MM-DD` via `toLocaleDateString('sv-SE')` - local timezone, simple comparison
2. **Reset timing**: Inside `jellyVisualEmotion` useState initializer - before first render, no flicker
3. **Persist version**: Increment to v3 with backward-compatible migration
4. **No debouncing needed**: Date comparison is a simple string equality check
