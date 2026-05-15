## Task Decomposition
SPEC: SPEC-SYNC-001
Updated: 2026-05-15

**범위 결정**: M8/M9(기기 이전 UX) 제외. M1~M7만 구현.

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| T-001 | DB 스키마 마이그레이션 SQL | REQ-SYNC-001 | - | supabase/migrations/20260516000000_localstorage_to_supabase.sql | pending |
| T-002 | DB 함수: loadUserProfile, updateUserProfile | REQ-SYNC-002, 004 | T-001 | src/lib/supabase/db.ts, __tests__/lib/supabase/db-sync.test.ts | pending |
| T-003 | DB 함수: loadUserSkins, upsertUserSkins, incrementRewardedAdAndUnlock | REQ-SYNC-005 | T-001 | src/lib/supabase/db.ts, __tests__/lib/supabase/db-sync.test.ts | pending |
| T-004 | DB 함수: loadTodayAdImpressions, incrementAdImpression | REQ-SYNC-006 | T-001 | src/lib/supabase/db.ts, __tests__/lib/supabase/db-sync.test.ts | pending |
| T-005 | DB 함수: resetUserData | REQ-SYNC-007 | T-001 | src/lib/supabase/db.ts, __tests__/lib/supabase/db-sync.test.ts | pending |
| T-006 | Sync 유틸리티 (오프라인 큐) | REQ-SYNC-008 | T-002 | src/lib/supabase/sync.ts, __tests__/lib/supabase/sync.test.ts | ✅ |
| T-007 | jellyStore Supabase write-through | REQ-SYNC-002, 004 | T-002, T-006 | src/stores/jellyStore.ts, __tests__/stores/jellyStore.test.ts | ✅ |
| T-008 | rewardStore Supabase write-through | REQ-SYNC-005 | T-003, T-006 | src/stores/rewardStore.ts, __tests__/stores/rewardStore.test.ts | ✅ |
| T-009 | 광고 빈도 세션 캐시 + Supabase 마이그레이션 | REQ-SYNC-006 | T-004, T-006 | src/lib/ad/adFrequencyControl.ts, __tests__/lib/ad/adFrequencyControl.test.ts | ✅ |
| T-010 | BridgeInitializer 병렬 하이드레이션 | REQ-SYNC-002 | T-007, T-008, T-009 | src/components/bridge/BridgeInitializer.tsx | ✅ |
| T-011 | Settings 데이터 초기화 → resetUserData 연동 | REQ-SYNC-007 | T-005, T-010 | src/app/settings/page.tsx | ✅ |
