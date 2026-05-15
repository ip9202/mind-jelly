---
id: SPEC-SESSION-RECOVER-001
version: 1.0.0
status: implemented
created: 2026-05-15
updated: 2026-05-15
author: 강력쇠주먹
priority: P0
issue_number: null
---

# SPEC-SESSION-RECOVER-001: Toss 해시 기반 세션 복구

## HISTORY

- 2026-05-15: 초안 작성. 기기 변경 / localStorage 초기화 시 기존 데이터(다이어리, 스킨, 광고 노출) 손실 문제 해결을 위한 Toss `getAnonymousKey()` 해시 기반 역조회 세션 복구 메커니즘 정의.

---

## 1. Purpose (Why)

마음젤리는 토스 "앱인토스(Apps-in-Toss)" WebView 환경에서 동작하며, 사용자는 Supabase 익명 인증(localStorage에 저장된 UUID)으로 식별된다. 현재 구조에서는 사용자가 다음과 같은 상황을 겪을 때 **모든 기존 데이터(다이어리, 보유 스킨, 광고 노출 이력)가 영구적으로 단절**된다.

- 새로운 기기에서 토스 앱인토스로 마음젤리 진입
- 캐시/저장소 초기화 후 재진입
- 토스 앱 재설치 후 재진입

문제의 핵심은 다음과 같다.

1. `initSupabaseSession()`이 먼저 호출되어 localStorage에 세션이 없으면 무조건 새 UUID로 익명 가입을 시도한다.
2. 이후 `getAnonymousKey()`가 반환한 토스 계정 고정 해시(같은 사용자 = 같은 해시)는 이미 다른 Supabase UUID에 `users.toss_user_id UNIQUE`로 묶여 있어 `linkTossUser()`가 실패한다.
3. 결과적으로 같은 토스 사용자임에도 새 UUID에 빈 상태로 머무르고, 기존 UUID의 데이터는 고아가 된다.

`@apps-in-toss/web-framework`의 `getAnonymousKey()`는 토스 계정에 귀속된 안정적 해시를 반환하므로, 이를 **세션 식별의 1차 키**로 삼고 Supabase UUID를 종속시키면 기기 변경에도 데이터가 보존된다.

## 2. Scope

### 2.1 IN SCOPE

- Supabase Edge Function `recover-session` 신규 추가 (Admin API로 기존 사용자의 새 세션 발급)
- 클라이언트 부팅 순서 재정렬: `getAnonymousKey()` 우선 → 해시로 역조회 → 매칭 시 세션 복구 → 미매칭 시 신규 익명 가입
- `linkTossUser()`/`setUserIdentity()`의 멱등성 보강 (UNIQUE 충돌 방어, 중복 UPDATE 회피)

### 2.2 OUT OF SCOPE (Exclusions — What NOT to Build)

- `invite_code` UX 제거 (비-WebView 환경 fallback으로 유지)
- 다중 기기 실시간 동기화 (기기 변경 시 1회 복구만 지원)
- 서로 다른 UUID에 분산 저장된 사용자 데이터의 머지/병합
- 비-토스 환경(일반 웹 브라우저)에서의 해시 기반 복구
- 토스 계정 변경(다른 토스 사용자) 시 데이터 인계
- 기존 고아 데이터(`users.toss_user_id`가 비어 있는 레코드) 일괄 마이그레이션

## 3. Requirements (EARS)

### 3.1 Ubiquitous

- **REQ-SESSION-001**: The system **shall** treat `getAnonymousKey()` hash as the primary identifier for a Toss user across devices and storage states.
- **REQ-SESSION-002**: The system **shall** preserve `users.id` (Supabase UUID) as the immutable foreign-key target for all user-owned tables (`diary_entries`, `user_skins`, `ad_impressions`).
- **REQ-SESSION-003**: The system **shall** keep `users.toss_user_id` UNIQUE; one Toss hash maps to exactly one Supabase user row.

### 3.2 Event-Driven

- **REQ-SESSION-010**: **When** the app boots inside the Toss WebView and a Toss anonymous hash is obtainable, the system **shall** call the `recover-session` Edge Function with the hash before performing any new anonymous sign-in.
- **REQ-SESSION-011**: **When** `recover-session` returns `{ found: true, access_token, refresh_token }`, the client **shall** restore the session via `supabase.auth.setSession(...)` and proceed with the existing `users.id`.
- **REQ-SESSION-012**: **When** `recover-session` returns `{ found: false }`, the client **shall** execute the existing new-user flow (`signInAnonymously()` followed by `linkTossUser(newUserId, hash)`).
- **REQ-SESSION-013**: **When** `tossStore.setUserIdentity()` is invoked and the current user's `toss_user_id` is already equal to the incoming hash, the system **shall** skip the `linkTossUser()` UPDATE call.

### 3.3 State-Driven

- **REQ-SESSION-020**: **While** the runtime is not the Toss WebView (e.g., desktop browser preview) or `getAnonymousKey()` is unavailable, the system **shall** fall back to the legacy anonymous-auth-first flow without invoking `recover-session`.
- **REQ-SESSION-021**: **While** a `recover-session` request is in flight, the client **shall not** call `signInAnonymously()` to avoid creating orphan UUIDs on transient network failures.

### 3.4 Unwanted Behavior

- **REQ-SESSION-030**: **If** `linkTossUser()` encounters a `UNIQUE` constraint violation on `users.toss_user_id`, **then** the system **shall** log the event and complete the call without throwing to the UI layer.
- **REQ-SESSION-031**: **If** the `recover-session` Edge Function receives more than 5 requests for the same hash within 60 seconds, **then** it **shall** respond with HTTP 429 and **shall not** issue new tokens.
- **REQ-SESSION-032**: **If** the `recover-session` request arrives without a valid Supabase anon-key bearer in the `Authorization` header, **then** the function **shall** respond with HTTP 401 and **shall not** disclose whether the hash exists.

### 3.5 Optional

- **REQ-SESSION-040**: **Where** structured logging is enabled, the system **shall** emit a `session.recovered` event with `{ hash_prefix, user_id_prefix, latency_ms }` (no full hash, no full UUID) on successful recovery.

## 4. Acceptance Criteria

| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| AC-01 | 신규 사용자 (기존 데이터 없음) | localStorage 비어 있음, 해당 해시로 가입된 사용자 없음 | 앱 부팅 | `recover-session` → `{found:false}` → `signInAnonymously()` → `linkTossUser(newId, hash)` 성공, 새 `users` 행 생성 |
| AC-02 | 같은 기기 재진입 (정상) | localStorage에 세션 존재, `users.toss_user_id`에 해시 매핑됨 | 앱 부팅 | `recover-session` 호출 → `{found:true}` → 세션 복구, `setUserIdentity()`가 중복 `linkTossUser()` 호출하지 않음 |
| AC-03 | 새 기기 진입 (핵심 시나리오) | localStorage 비어 있음, 다른 UUID `aaaa-1111`에 해시 매핑됨, 다이어리 3개 보유 | 앱 부팅 | `recover-session` → `{found:true}`로 `aaaa-1111` 세션 발급 → `setSession()` 성공 → 다이어리 3개 그대로 조회됨, 새 UUID 생성 안 됨 |
| AC-04 | localStorage 초기화 후 재진입 | 기존 사용자가 브라우저 데이터 삭제 | 앱 부팅 | AC-03와 동일한 복구 경로로 기존 `users.id` 복원 |
| AC-05 | 해시 획득 실패 (비-WebView) | `getAnonymousKey()` 미지원 또는 예외 | 앱 부팅 | 기존 익명 인증 fallback 실행, `recover-session` 호출 안 됨 |
| AC-06 | UNIQUE 충돌 방어 | 동시 부팅 등으로 `linkTossUser()`가 이미 매핑된 해시에 재시도 | `linkTossUser()` 호출 | UI 에러 없이 silently 종료, 사용자 흐름 차단 없음 |
| AC-07 | Rate limit | 동일 해시로 1분 내 6회째 호출 | 6번째 요청 | HTTP 429 응답, 새 토큰 미발급 |
| AC-08 | 인증 누락 | `Authorization` 헤더 없이 호출 | `recover-session` 요청 | HTTP 401, 해시 존재 여부 비공개 |
| AC-09 | 데이터 무결성 | AC-03 직후 | 복구된 세션으로 `user_skins`, `ad_impressions` 조회 | RLS 정책 통과, 기존 행 모두 조회됨 |

### 4.1 Definition of Done

- 9개 AC 시나리오 모두 통과 (E2E 또는 통합 테스트)
- `recover-session` Edge Function 배포 및 Supabase Dashboard에서 호출 로그 확인
- 동일 토스 사용자로 두 기기 시뮬레이션 시 단일 `users.id` 유지 검증
- README 또는 `.moai/docs/` 내 운영 메모에 복구 흐름 다이어그램 추가
- `users.toss_user_id` UNIQUE 제약은 그대로 유지 (변경 금지)

## 5. Technical Approach

### 5.1 전체 부팅 시퀀스 (변경 후)

```
BridgeInitializer.tsx
  ├─ 1. getUserIdentity() → { anonymousKey: hash, deviceId }    [WebView only]
  ├─ 2. (hash 있음) recover-session({ toss_hash: hash })
  │      ├─ found: true  → supabase.auth.setSession({access, refresh}) → user_id 확보
  │      └─ found: false → initSupabaseSession() (signInAnonymously) → linkTossUser(newId, hash)
  ├─ 3. (hash 없음) initSupabaseSession() (기존 fallback 그대로)
  └─ 4. tossStore.setUserIdentity(identity) — 멱등 가드 적용
```

### 5.2 Edge Function `recover-session`

- 위치: `supabase/functions/recover-session/index.ts`
- 입력: `POST { toss_hash: string }`, 헤더 `Authorization: Bearer <ANON_KEY>`
- 핵심 로직:
  1. anon-key 검증 (없으면 401, 해시 존재 여부 비공개)
  2. 메모리/KV 기반 rate limit (per-hash, 5 req / 60s)
  3. `SELECT id FROM users WHERE toss_user_id = $1` (service_role 클라이언트)
  4. 미존재 → `{ found: false }` (200)
  5. 존재 → Supabase Admin API로 해당 `user.id`에 대한 신규 세션 발급
     - 토큰 발급은 `auth.admin.generateLink` 또는 동등한 admin 메서드로 access/refresh token 산출
  6. 응답: `{ found: true, access_token, refresh_token }`
- 보안:
  - `SERVICE_ROLE_KEY`는 Edge Function 환경변수로만 보관
  - 응답에 사용자 식별자(UUID) 직접 노출 금지 (토큰만 반환)
  - 실패/성공 모두 일관된 응답 시간 유지(타이밍 공격 완화) — 선택적

### 5.3 클라이언트 변경

- `src/lib/supabase/auth.ts`
  - `initSupabaseSession(options?: { tossHash?: string })` 시그니처 확장
  - tossHash가 주어지면 `recover-session` 시도 → 성공 시 `setSession` → 기존 user_id 반환
  - 실패 또는 미매칭 시 기존 `signInAnonymously()` 경로
  - `linkTossUser()`: 23505 (unique_violation) 감지 시 swallow + 구조화 로그
- `src/lib/toss/bridge.ts`
  - 변경 최소. `getUserIdentity()`가 BridgeInitializer에서 더 일찍 호출됨에 따른 race-condition 점검만
- `src/components/bridge/BridgeInitializer.tsx`
  - 신규 순서: `getUserIdentity()` → `initSupabaseSession({ tossHash })` → `tossStore.setUserIdentity()`
  - WebView 미지원/예외 시 try-catch로 기존 흐름 fallback
- `src/stores/tossStore.ts`
  - `setUserIdentity()`에서 현재 user의 `toss_user_id`와 동일하면 `linkTossUser` skip
  - 다를 때만 호출하고, 실패는 위 swallow 정책에 위임

### 5.4 데이터베이스

- 스키마 변경 없음 (마이그레이션 `20260516000000`에서 이미 `toss_user_id UNIQUE`, `invite_code` 적용됨)
- `invite_code`는 비-WebView fallback 용도로 유지

### 5.5 보안 / 프라이버시 고려

- 해시 로그 출력 시 prefix(앞 8자리) + 길이만 기록
- 발급된 access/refresh 토큰은 HTTPS 응답 본문으로만 전달 (쿠키 금지)
- `recover-session` 실패 응답은 본문 차별화 최소화 (401 vs 200{found:false} 외 추가 정보 없음)

## 6. Milestones (Priority-Ordered)

### M1 — Edge Function `recover-session` (Priority: P0)

- `supabase/functions/recover-session/index.ts` 신규 작성
- service_role 클라이언트로 `users` 역조회 및 Admin API 세션 발급
- anon-key 인증, per-hash rate limit, 통일된 에러 응답
- 단위 테스트 또는 로컬 supabase functions serve로 호출 검증

### M2 — 클라이언트 부팅 순서 재정렬 (Priority: P0, depends on M1)

- `BridgeInitializer.tsx` 시퀀스 변경
- `initSupabaseSession` 시그니처 확장 및 `recover-session` 호출 통합
- WebView 미지원 / 해시 미획득 시 기존 경로 fallback
- AC-01 ~ AC-05, AC-09 시나리오 통과

### M3 — `linkTossUser` / `setUserIdentity` 멱등성 보강 (Priority: P1, depends on M2)

- UNIQUE 충돌(23505) 안전 처리
- 동일 hash 재할당 시 redundant UPDATE 제거
- AC-02, AC-06 시나리오 통과

## 7. Dependencies

- **외부**:
  - `@apps-in-toss/web-framework` ≥ 2.5.0 (`getAnonymousKey()` 안정 버전)
  - Supabase JS Client (auth.admin API 지원 버전)
  - Supabase CLI / Edge Functions 런타임 (Deno)
- **내부**:
  - 마이그레이션 `20260516000000` (users.toss_user_id UNIQUE, invite_code 컬럼) — 이미 적용됨
  - SPEC-SYNC-001 (localStorage → Supabase 마이그레이션) — 완료 전제
  - 기존 Edge Functions (`toss-login`, `toss-disconnect`)와 동일한 배포 파이프라인 사용
- **환경 변수**:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Edge Function)

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Admin API로 임의 사용자 세션 발급이 가능해짐 | Med | Critical | service_role 키는 Edge Function 환경변수로만, anon-key 인증 + rate limit + 해시 노출 최소화 |
| `getAnonymousKey()` 실패/지연으로 부팅 블로킹 | Med | High | timeout(예: 1.5s) 및 catch 시 즉시 fallback 경로 진입 |
| `recover-session` 네트워크 실패 시 새 익명 가입으로 폭주 | Low | High | REQ-SESSION-021: 진행 중에는 signInAnonymously 보류, 명시적 실패 응답 수신 후 분기 |
| 토스 계정 자체 변경 시 잘못된 데이터 노출 | Low | High | OUT OF SCOPE 명시, 추후 별도 SPEC에서 다룸 |
| 토큰 응답 본문 노출 (XSS 등) | Low | Critical | 기존 Supabase 세션과 동일한 저장 메커니즘 사용, 추가 노출 경로 없음 |

## 9. Open Questions

- Q1. Admin API의 정확한 메서드 선택: `auth.admin.generateLink` 결과로 얻은 토큰을 직접 setSession에 사용 가능한지 vs 별도 `signInWithIdToken` 류가 필요한지 (M1 구현 시 Supabase 현행 API로 확정)
- Q2. Rate limit 저장소: 단일 Edge Function 인스턴스 메모리로 충분한지, Supabase KV/테이블 기반이 필요한지 (P1 후속 보강 가능)

---

**[NOTE]** 본 SPEC은 WHAT/WHY 중심이며, 구체 함수 시그니처 및 Admin API 호출 코드 형태는 Run 단계에서 확정한다. Section 5는 Technical Approach(접근 방향) 수준이며 구현 강제 사항이 아니다.
