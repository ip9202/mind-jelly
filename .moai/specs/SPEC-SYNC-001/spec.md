---
id: SPEC-SYNC-001
version: 1.0.0
status: implemented
created: 2026-05-15
updated: 2026-05-15
author: 강력쇠주먹
priority: P0
issue_number: null
---

# SPEC-SYNC-001: localStorage → Supabase 데이터 동기화 마이그레이션

## HISTORY

- 2026-05-15 (v1.0.0): 최초 작성. localStorage 기반 로컬 상태(jellyStore, rewardStore, 광고 빈도)를 Supabase로 마이그레이션하고, 초대코드 기반 기기 이전(device migration) 경로를 신설.

---

## 1. 목적 (Why)

마음젤리(Mind Jelly) 앱은 현재 사용자의 핵심 데이터(젤리 모양, 잠금해제 스킨, 광고 시청 이력 등)를 **localStorage**에만 저장한다. 앱인토스 WebView 환경에서 다음 문제가 발생한다.

1. **기기 변경 시 데이터 손실**: 익명 인증(Anonymous Auth)이 기기별로 다른 `user_id`를 발급 → 새 폰으로 바꾸면 모든 스킨/설정 소실
2. **WebView 캐시 초기화 시 손실**: 토스 앱 데이터 삭제, OS 업데이트로 localStorage 초기화 가능
3. **광고 빈도 제어 우회 가능**: 사용자가 localStorage를 지우면 일일 광고 한도가 리셋되어 정책 위반 위험
4. **다이어리는 안전, 보상은 위험**: 다이어리 글(`diary_entries`)은 이미 Supabase에 있어 안전하지만, 사용자가 시간을 들여 쌓은 **스킨/광고 보상은 휘발성**

## 2. 범위 (What)

### IN SCOPE
- `jelly-storage`(jellyStore)와 `reward-storage`(rewardStore)의 핵심 필드 Supabase 이관
- `ad_frequency_history`, `rewarded_ad_frequency`의 Supabase 이관
- 초대코드 기반 기기 이전(device migration) UX 및 백엔드 로직
- Supabase = Single Source of Truth, localStorage = read-through 캐시 패턴 도입
- 오프라인 복원력(Supabase 장애 시 캐시된 상태 표시)
- 데이터 초기화 시 Supabase + localStorage 동시 클리어

### Exclusions (What NOT to Build) [HARD]
- **토스 로그인 기반 사용자 식별**: 이미 토스 로그인 연동 UI는 제거됨(refactor f5caa14). 본 SPEC은 익명 인증 + 초대코드 모델만 다룬다.
- **다이어리(`diary_entries`) 마이그레이션**: 이미 Supabase에 저장 중이므로 제외
- **친구/공유(`friendships`, `is_shared`) 동작 변경**: 본 SPEC은 개인 데이터에만 집중
- **실시간 동기화(Realtime subscription)**: 본 SPEC은 read-on-init + write-on-change 패턴만 지원. 멀티 디바이스 동시 사용은 다음 SPEC으로 미룬다.
- **백그라운드 sync queue 영속화**: 오프라인 큐는 메모리 only. 페이지 새로고침 시 큐 손실은 허용한다(데이터 자체는 다음 init에서 Supabase 기준으로 복구되므로).
- **자동 데이터 머지 충돌 해결 UI**: 충돌 시 항상 Supabase wins. 사용자 선택 UI는 만들지 않는다.

## 3. 요구사항 (EARS)

### REQ-SYNC-001: Supabase 스키마 확장
- The system **shall** extend the `users` table with the following nullable columns: `jelly_shape TEXT`, `persist_emotion BOOLEAN DEFAULT false`, `skin_expires_at TIMESTAMPTZ`.
- The system **shall** create a `user_skins` table with columns `user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE`, `unlocked_skins TEXT[] DEFAULT '{}'`, `active_skin TEXT`, `skin_enabled BOOLEAN DEFAULT false`, `rewarded_ad_count INTEGER DEFAULT 0`, `updated_at TIMESTAMPTZ DEFAULT now()`.
- The system **shall** create an `ad_impressions` table with columns `user_id UUID REFERENCES users(id) ON DELETE CASCADE`, `ad_date DATE NOT NULL`, `interstitial_count INTEGER DEFAULT 0`, `rewarded_count INTEGER DEFAULT 0`, with `UNIQUE(user_id, ad_date)`.
- The system **shall** enable Row Level Security (RLS) on `user_skins` and `ad_impressions` with policies restricting access to `auth.uid() = user_id`.

### REQ-SYNC-002: 단일 진실 공급원 (Single Source of Truth)
- The system **shall** treat Supabase as the authoritative source for all migrated fields.
- **When** the app initializes via `BridgeInitializer`, the system **shall** load `jelly_shape`, `persist_emotion`, `user_skins` row, and today's `ad_impressions` row from Supabase before rendering interactive UI.
- **When** a user setting changes (jellyShape, persistEmotion, activeSkin, skinEnabled), the system **shall** persist the change to Supabase within 2 seconds and update the local Zustand store synchronously.
- **If** Supabase write fails, **then** the system **shall** retain the optimistic local update, log the error to the in-memory sync queue, and retry on next successful network call.
- **Where** both Supabase and localStorage contain values for the same field, the system **shall** prefer the Supabase value (Supabase wins on conflict).

### REQ-SYNC-003: 기기 이전 (Device Migration)
- **Where** a user's `users.invite_code` is known, the system **shall** allow a new device to inherit that user's data by re-pointing the new device's anonymous auth session to the source user record.
- **When** the user selects "기존 데이터 가져오기" on the Welcome screen and submits a valid `invite_code`, the system **shall** lookup the source `user_id` via `invite_code`, transfer ownership of related rows (`user_skins`, `ad_impressions`, `diary_entries`) to the new anonymous `user_id`, and delete the orphaned source `users` record within 5 seconds.
- **If** the submitted `invite_code` does not match any existing user, **then** the system **shall** display an error message and **shall not** mutate any database rows.
- **If** the source user record was created within the last 60 seconds, **then** the system **shall** reject the migration to prevent invite_code typo abuse on freshly created accounts.
- The system **shall** display the user's own `invite_code` prominently in `/settings` for future device migration use.

### REQ-SYNC-004: jellyStore 마이그레이션
- The system **shall** remove `lastEmotion` and `emotionColor` from `jelly-storage` persist whitelist (these are derived from `diary_entries` and recalculated on init).
- The system **shall** retain `lastAccessDate` in localStorage as device-local cache (used by daily-reset logic).
- The system **shall** migrate `jellyShape` and `persistEmotion` to Supabase `users` table columns.
- **When** the app loads, the system **shall** fetch `jelly_shape` and `persist_emotion` from Supabase and hydrate the Zustand store; **if** the fetch fails, **then** the system **shall** fall back to the localStorage cached value.

### REQ-SYNC-005: rewardStore 마이그레이션
- The system **shall** migrate all reward-related fields (`unlockedSkins`, `activeSkin`, `skinEnabled`, `rewardedAdCount`) to the `user_skins` Supabase table.
- The system **shall** control time-limited skin activation via `users.skin_expires_at`; **when** the current time is past `skin_expires_at`, the system **shall** treat `skinEnabled` as `false` regardless of the stored value.
- **When** a user unlocks a new skin via rewarded ad, the system **shall** atomically increment `user_skins.rewarded_ad_count`, append the new skin id to `unlocked_skins`, and update the local store.
- The system **shall not** retain `rewardsHistory` in Supabase (this is observability data; if needed, it can be reconstructed from `ad_impressions` + tier logic).

### REQ-SYNC-006: 광고 빈도 마이그레이션
- The system **shall** migrate `ad_frequency_history` and `rewarded_ad_frequency` to the `ad_impressions` Supabase table, keyed by `(user_id, ad_date)`.
- **When** an interstitial or rewarded ad is shown, the system **shall** upsert the corresponding `ad_impressions` row, incrementing `interstitial_count` or `rewarded_count` atomically.
- **When** the app checks `canShowInterstitial()` or `canShowRewardedAd()`, the system **shall** read today's `ad_impressions` row from a session-scoped in-memory cache; **if** the cache is empty, **then** the system **shall** fetch from Supabase and populate the cache.
- The system **shall** invalidate the in-memory cache when the device-local date changes (cross-midnight handling).
- **Where** Supabase `ad_impressions` is the authoritative source, the system **shall not** trust localStorage counters for ad gate decisions.

### REQ-SYNC-007: 데이터 초기화
- **When** the user triggers "데이터 초기화" in `/settings`, the system **shall** delete the user's rows in `user_skins`, `ad_impressions`, and `diary_entries`, reset `users.jelly_shape` to `null`, `users.persist_emotion` to `false`, and `users.skin_expires_at` to `null`, then clear all relevant `localStorage` keys.
- The system **shall** create a fresh anonymous auth session after data reset, generating a new `user_id`.
- **If** any Supabase delete operation fails during reset, **then** the system **shall** abort the reset, surface the error, and **shall not** clear localStorage (to preserve recovery state).

### REQ-SYNC-008: 오프라인 복원력
- **While** the device is offline or Supabase is unavailable, the system **shall** display the last-known cached state from localStorage without throwing a user-visible error.
- **When** writes occur during an offline window, the system **shall** queue them in memory and flush them on the next successful Supabase call.
- The system **shall** show a non-blocking indicator (toast or footer banner) when operating in degraded/offline mode.
- The system **shall not** allow ad-frequency-gated actions (showing interstitial/rewarded ads) while in offline mode, to prevent policy violations.

## 4. 비기능 요구사항

| 항목 | 목표 |
|------|------|
| 앱 초기 로드 latency 증가 | < 300ms (Supabase fetch 병렬화 후) |
| 설정 변경 → Supabase 반영 | < 2초 |
| 기기 이전 전체 소요 | < 5초 |
| Supabase 장애 시 동작 | 캐시된 상태로 정상 렌더링, 사용자 에러 없음 |
| RLS 정책 | 모든 신규 테이블에 `auth.uid() = user_id` 적용 |

## 5. 위험 및 가정

- **가정**: `users.invite_code`는 이미 unique 컬럼이며, 모든 신규 가입 시 자동 생성됨 (확인 필요)
- **위험**: 기기 이전 시 `diary_entries.user_id`를 일괄 UPDATE해야 함 → RLS 정책이 이를 허용하는지 별도 검증 필요. 필요 시 Edge Function(SECURITY DEFINER)으로 처리.
- **위험**: 광고 빈도가 Supabase 의존이 되면 네트워크 지연이 광고 표시 결정에 영향 → 세션 캐시로 mitigation
- **위험**: 기존 사용자의 localStorage 데이터를 자동으로 Supabase로 옮기는 일회성 마이그레이션은 본 SPEC에 포함 (Phase 5 참조)
