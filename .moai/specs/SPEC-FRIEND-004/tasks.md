## Task Decomposition
SPEC: SPEC-FRIEND-004

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| T-001 | friendStore 생성 (Zustand) | REQ-F004-003 | - | src/stores/friendStore.ts, src/stores/__tests__/friendStore.test.ts | pending |
| T-002 | BottomNav 타입 확장 + 친구 탭 추가 | REQ-F004-001 | - | src/components/layout/BottomNav.tsx, src/components/layout/__tests__/BottomNav.test.tsx | pending |
| T-003 | NavMenu 친구 항목 활성화 | REQ-F004-002 | - | src/components/layout/NavMenu.tsx, src/components/layout/__tests__/NavMenu.test.tsx | pending |
| T-004 | 뱃지 UI 구현 | REQ-F004-003 | T-001, T-002 | src/components/layout/BottomNav.tsx, src/components/layout/__tests__/BottomNav.badge.test.tsx | pending |
| T-005 | Friends 페이지 통합 | REQ-F004-001, REQ-F004-003 | T-004 | src/app/friends/page.tsx, src/app/friends/__tests__/friends.nav.test.tsx | pending |
