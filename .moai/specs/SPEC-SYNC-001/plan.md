# SPEC-SYNC-001: 구현 계획

## 1. 기술 접근법 개요

| 계층 | 현재 | 변경 후 |
|------|------|---------|
| 데이터 영속화 | localStorage(Zustand persist) | Supabase Postgres + localStorage read-through 캐시 |
| 식별자 | 익명 auth `user_id` (디바이스별) | 익명 auth `user_id` + `invite_code` 기반 이전 |
| 광고 빈도 게이트 | localStorage 카운터 | `ad_impressions` 테이블 + 세션 캐시 |
| 충돌 해결 | 없음(단일 디바이스 가정) | Supabase wins, 오프라인 큐는 메모리 only |

핵심 패턴: **하이드레이션(init) + 옵티미스틱 쓰기(change) + 폴백(error)**

## 2. DB 마이그레이션 SQL

신규 파일: `supabase/migrations/20260516000000_localstorage_to_supabase.sql`

```sql
-- 1) users 테이블 확장
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS jelly_shape TEXT,
  ADD COLUMN IF NOT EXISTS persist_emotion BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skin_expires_at TIMESTAMPTZ;

-- 2) user_skins 테이블
CREATE TABLE IF NOT EXISTS user_skins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  unlocked_skins TEXT[] NOT NULL DEFAULT '{}',
  active_skin TEXT,
  skin_enabled BOOLEAN NOT NULL DEFAULT false,
  rewarded_ad_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_skins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_skins_self_select" ON user_skins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_skins_self_upsert" ON user_skins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) ad_impressions 테이블
CREATE TABLE IF NOT EXISTS ad_impressions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ad_date DATE NOT NULL,
  interstitial_count INTEGER NOT NULL DEFAULT 0,
  rewarded_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, ad_date)
);

ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_impressions_self" ON ad_impressions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) 인덱스
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user_date
  ON ad_impressions(user_id, ad_date DESC);

-- 5) invite_code 인덱스 (기기 이전 lookup용)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_invite_code
  ON users(invite_code) WHERE invite_code IS NOT NULL;
```

신규 Edge Function: `supabase/functions/migrate-device/index.ts` (SECURITY DEFINER 권한 필요)
- 입력: `{ invite_code: string, new_user_id: string }`
- 동작: `users` 조회 → 관련 테이블의 `user_id` 일괄 UPDATE → 구 user 행 삭제
- 안전장치: 신규 user 생성 시각이 60초 이내면 reject

## 3. API 함수 시그니처 (src/lib/supabase/db.ts 추가)

```typescript
// User profile sync
export async function loadUserProfile(userId: string): Promise<{
  jellyShape: JellyShape | null;
  persistEmotion: boolean;
  skinExpiresAt: string | null;
} | null>;

export async function updateUserProfile(
  userId: string,
  patch: Partial<{ jellyShape: JellyShape; persistEmotion: boolean; skinExpiresAt: string | null }>
): Promise<void>;

// Skins
export async function loadUserSkins(userId: string): Promise<UserSkins | null>;
export async function upsertUserSkins(userId: string, patch: Partial<UserSkins>): Promise<void>;
export async function incrementRewardedAdAndUnlock(
  userId: string,
  newSkinId: string | null
): Promise<UserSkins>;

// Ad impressions
export async function loadTodayAdImpressions(userId: string, date: string): Promise<AdImpressions>;
export async function incrementAdImpression(
  userId: string,
  date: string,
  type: 'interstitial' | 'rewarded'
): Promise<AdImpressions>;

// Device migration
export async function migrateDeviceByInviteCode(
  inviteCode: string,
  newUserId: string
): Promise<{ success: boolean; error?: string }>;

// Data reset
export async function resetUserData(userId: string): Promise<void>;
```

## 4. Store 수정 계획

### jellyStore (src/stores/jellyStore.ts)
- `persist` whitelist 축소: `jellyShape`, `lastAccessDate`만 유지 (Supabase 폴백 캐시 용도)
- `persistEmotion` 변경 시 `updateUserProfile({ persistEmotion })` 호출 추가
- `setJellyShape` 변경 시 `updateUserProfile({ jellyShape })` 호출 추가
- `lastEmotion`, `emotionColor`는 selector로 `diary_entries`에서 derive

### rewardStore (src/stores/rewardStore.ts)
- `persist` 미들웨어 유지(오프라인 캐시), 단 모든 mutator에서 `upsertUserSkins` 동시 호출
- `rewardsHistory` 필드 deprecate (로컬에만 유지, Supabase 미동기화)
- 신규 셀렉터: `isSkinActiveNow(state)` — `skin_expires_at` 검증

### adFrequencyControl (src/lib/ad/adFrequencyControl.ts)
- localStorage 기반 카운터 제거
- 세션 메모리 캐시 `adImpressionsCache: Map<dateString, AdImpressions>` 도입
- `recordInterstitialShown()` → `incrementAdImpression(userId, today, 'interstitial')`
- `canShowInterstitial()` → 캐시 hit 시 즉시, miss 시 Supabase fetch
- 자정 통과 감지: `lastCheckDate !== today` 시 캐시 invalidate

## 5. BridgeInitializer 변경 (src/components/bridge/BridgeInitializer.tsx)

현재 흐름:
```
mount → ensureAnonymousUser() → setup ad SDK → ready
```

신규 흐름:
```
mount
  → ensureAnonymousUser()
  → Promise.all([
       loadUserProfile(userId) → hydrate jellyStore
       loadUserSkins(userId) → hydrate rewardStore
       loadTodayAdImpressions(userId, today) → seed ad cache
     ])
  → setup ad SDK
  → ready
```

- 모든 fetch는 timeout 1.5s; 실패 시 localStorage 캐시로 폴백 후 백그라운드 재시도
- 첫 렌더에서 캐시 상태를 그대로 노출(스플래시 깜빡임 방지)

## 6. Welcome 화면 변경

신규 컴포넌트 `src/components/welcome/DeviceMigrationPrompt.tsx`:
- "처음 사용하세요?" / "기존 데이터 가져오기" 2-way 선택
- 기존 데이터 선택 시 `invite_code` 입력 모달 → `migrateDeviceByInviteCode` 호출
- 성공 시 페이지 reload하여 새로운 user 컨텍스트 로드
- 60초 이내 신규 가입 reject 메시지 처리

## 7. Settings 화면 변경 (src/app/settings/page.tsx)
- 사용자의 `invite_code`를 prominent하게 표시 + 복사 버튼 + "기기 변경 시 이 코드로 데이터 가져올 수 있어요" 안내
- "데이터 초기화" 동작을 `resetUserData(userId)` + localStorage 클리어 + 새 익명 세션 생성으로 변경

## 8. 마일스톤 (Priority 기반, 시간 추정 없음)

### M1: DB 스키마 (P0)
- migration SQL 작성 및 dev 환경 적용
- RLS 정책 검증 (Supabase 대시보드 + 로컬 SQL 테스트)
- `migrate-device` Edge Function 배포

### M2: API 레이어 (P0)
- `src/lib/supabase/db.ts`에 신규 함수 8종 구현
- 각 함수에 단위 테스트 추가 (mocking Supabase client)

### M3: Store 통합 (P0)
- jellyStore / rewardStore / adFrequencyControl 수정
- BridgeInitializer에 하이드레이션 로직 추가
- 오프라인 fallback 테스트

### M4: 기기 이전 UX (P1)
- Welcome 화면에 DeviceMigrationPrompt 추가
- Settings 화면에 invite_code 노출
- 통합 E2E 테스트(2개 디바이스 시뮬레이션)

### M5: 광고 빈도 컷오버 (P1)
- 신규 사용자: 처음부터 Supabase 사용
- 기존 사용자: 첫 init 시 localStorage 값을 Supabase에 1회 seed (one-time backfill)
- 1주일 관찰 후 localStorage 카운터 코드 제거

### M6: 데이터 초기화 + 정리 (P2)
- `resetUserData` 동작 검증
- 사용하지 않는 localStorage 키 제거
- 문서 업데이트 (`product.md`, `tech.md`)

## 9. 위험 및 완화

| 위험 | 영향 | 완화 |
|------|------|------|
| RLS 정책으로 `diary_entries` user_id 일괄 UPDATE 차단 | 기기 이전 실패 | Edge Function(SECURITY DEFINER)로 우회 |
| Supabase fetch 지연으로 광고 표시 늦어짐 | UX 저하 | 세션 메모리 캐시 + 1.5s timeout |
| `invite_code` 충돌/추측 공격 | 무단 데이터 탈취 | 60초 cooldown + rate limit + 향후 토스 로그인 결합 검토 |
| 기존 사용자 localStorage 데이터 손실 | 첫 마이그레이션 시 스킨 사라짐 | M5 one-time backfill로 lift |
| 오프라인 큐 메모리 손실(새로고침) | 마지막 변경 누락 | Supabase 기준으로 다음 init에서 자동 동기화. 사용자에 영향 없음 |
