## SPEC-SYNC-001 Progress

- Started: 2026-05-15
- Phase 0.9 complete: TypeScript project detected → moai-lang-typescript
- Phase 0.95 complete: Full Pipeline mode selected (files ≥ 15, domains ≥ 3)
- Phase 1 complete: manager-strategy 실행 계획 수립 완료
- Phase 1.5 complete: tasks.md 생성 완료

## 범위 결정 (2026-05-15)

- M8/M9 제외: invite_code 기반 기기 이전 UX는 토스 로그인 통합 후 별도 SPEC으로 진행
- 구현 범위: M1~M7

## 완료된 마일스톤 (2026-05-15 세션)

### M1: DB 스키마 마이그레이션 ✅
### M2: DB 함수 레이어 ✅
### M3: Sync 유틸리티 ✅
- 19개 테스트 통과 (100% 커버리지)
- src/lib/supabase/sync.ts (96줄)
- 오프라인 메모리 큐, online/offline 이벤트 리스너

### M4: jellyStore Supabase write-through ✅
- 52개 테스트 통과
- setJellyShape, setPersistEmotion write-through
- hydrateFromSupabase() 액션 추가
- persist whitelist 변경 (lastEmotion, emotionColor 제거)

### M5: rewardStore Supabase write-through ✅
- 27개 테스트 통과 (94.64%+ 커버리지)
- unlockSkin → incrementRewardedAdAndUnlock RPC
- toggleSkinEnabled, setActiveSkin write-through
- hydrateFromSupabase() 액션 추가

### M6: 광고 빈도 세션 캐시 + Supabase ✅
- 24개 테스트 통과 (100% 커버리지)
- 세션 메모리 캐시 Map 도입
- localStorage 제거, Supabase 연동
- canShowRewardedAd 실제 한도 적용

### M7: BridgeInitializer 병렬 하이드레이션 ✅
- 28개 테스트 통과 (BridgeInitializer 17 + Settings 11)
- Promise.all 병렬 하이드레이션
- 실패 시 localStorage 폴백
- Settings resetUserData() 연동
- 파일: supabase/migrations/20260516000000_localstorage_to_supabase.sql
- users 테이블 확장: jelly_shape, persist_emotion, skin_expires_at
- user_skins 테이블 신규 생성 + RLS
- ad_impressions 테이블 신규 생성 + RLS
- RPC: increment_rewarded_and_unlock, reset_user_data

### M2: DB 함수 레이어 ✅
- 파일 수정: src/lib/supabase/db.ts (8개 함수 추가)
- 파일 생성: __tests__/lib/supabase/db-sync.test.ts (14/14 통과)
- 함수: loadUserProfile, updateUserProfile, loadUserSkins, upsertUserSkins,
        incrementRewardedAdAndUnlock, loadTodayAdImpressions, incrementAdImpression, resetUserData
- 타입: UserProfile, UserSkins, AdImpressions

## 다음 세션에서 할 일

### M3: Sync 유틸리티 (src/lib/supabase/sync.ts 신규)
- 오프라인 메모리 큐: enqueueWrite, flushQueue, isOnline
- online/offline 이벤트 리스너
- 테스트: __tests__/lib/supabase/sync.test.ts

### M4: jellyStore 마이그레이션 (src/stores/jellyStore.ts)
- setJellyShape → updateUserProfile({ jellyShape }) write-through 추가
- setPersistEmotion → updateUserProfile({ persistEmotion }) write-through 추가
- hydrateFromSupabase() 액션 추가
- persist whitelist 변경: lastEmotion, emotionColor 제거 (lastAccessDate, jellyShape 유지 - 폴백 캐시)
- 테스트 확장: __tests__/stores/jellyStore.test.ts

### M5: rewardStore 마이그레이션 (src/stores/rewardStore.ts)
- unlockSkin → incrementRewardedAdAndUnlock RPC로 변경
- toggleSkinEnabled, setActiveSkin → upsertUserSkins write-through 추가
- hydrateFromSupabase() 액션 추가
- 테스트: __tests__/stores/rewardStore.test.ts

### M6: 광고 빈도 제어 마이그레이션 (src/lib/ad/adFrequencyControl.ts)
- 세션 메모리 캐시 Map 도입 (adImpressionsCache)
- initAdImpressionCache(userId, date) 신규 함수
- canShowInterstitial() → 캐시 기반 동기 (한도 없음 유지: return true)
- canShowRewardedAd() → DAILY_REWARDED_LIMIT=3, SESSION_REWARDED_LIMIT=1 실제 적용
- recordAdShown() → incrementAdImpression 호출 + 캐시 업데이트
- recordRewardedAdShown() → incrementAdImpression 호출 + 캐시 업데이트
- localStorage 코드 제거
- 테스트: __tests__/lib/ad/adFrequencyControl.test.ts

### M7: BridgeInitializer 병렬 하이드레이션 (src/components/bridge/BridgeInitializer.tsx)
- initSupabaseSession 이후 Promise.all([
    loadUserProfile → jellyStore.hydrateFromSupabase(),
    loadUserSkins → rewardStore.hydrateFromSupabase(),
    initAdImpressionCache(userId, today)
  ]) 추가
- 실패 시 localStorage 캐시 폴백
- Settings 데이터 초기화 → resetUserData() 연동 (src/app/settings/page.tsx)

## 기존 코드 상태 (참고)

현재 git 미커밋 수정 파일들 (이전 세션 작업):
- src/app/globals.css, home/page.tsx, settings/page.tsx
- src/components/ads/*, bridge/BridgeInitializer.tsx
- src/lib/ad/adConfig.ts, adFrequencyControl.ts, adInitializer.ts
- src/lib/supabase/db.ts (M2에서 추가)
- src/stores/jellyStore.ts
- __tests__/stores/jellyStore.test.ts
- .moai/config/sections/llm.yaml

adFrequencyControl.ts TypeScript 경고:
- Line 177: DAILY_REWARDED_LIMIT declared but never read → M6에서 해결
- Line 179: SESSION_REWARDED_LIMIT declared but never read → M6에서 해결
