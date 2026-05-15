# SPEC-SYNC-001: 수용 기준 (Acceptance Criteria)

## 1. Given-When-Then 시나리오

### SCN-001: 젤리 모양 변경 → Supabase 즉시 반영 (REQ-SYNC-002, REQ-SYNC-004)
- **Given** 사용자가 로그인된 상태이고 현재 `jellyShape`가 `ppung`이다.
- **When** 사용자가 `mallang`으로 젤리 모양을 변경한다.
- **Then** 2초 이내에 Supabase `users.jelly_shape` 컬럼이 `mallang`으로 업데이트된다.
- **And** 로컬 Zustand 스토어는 즉시 `mallang`을 반영한다.
- **And** 새로고침 후 다시 진입해도 `mallang`이 유지된다.

### SCN-002: 신규 디바이스에서 invite_code로 데이터 복구 (REQ-SYNC-003)
- **Given** 사용자가 디바이스 A에서 5개 스킨 잠금해제, 광고 30회 시청 이력을 가지고 있고 `invite_code`가 `JLY-7K2X`이다.
- **And** 디바이스 B에서 앱을 처음 설치하여 익명 인증된 `new_user_id`를 발급받았다.
- **When** 사용자가 Welcome 화면에서 "기존 데이터 가져오기"를 선택하고 `JLY-7K2X`를 입력한다.
- **Then** 5초 이내에 마이그레이션이 완료되고 디바이스 B에서 5개 스킨과 광고 이력이 복구된다.
- **And** 디바이스 A의 구 `user_id` 레코드는 삭제되어 있다.
- **And** `diary_entries`의 `user_id` 컬럼은 모두 `new_user_id`로 갱신되어 있다.

### SCN-003: 잘못된 invite_code 입력 시 안전 거부 (REQ-SYNC-003)
- **Given** 사용자가 Welcome 화면에서 데이터 이전을 시도한다.
- **When** 존재하지 않는 코드 `INVALID-CODE`를 입력한다.
- **Then** "유효하지 않은 코드입니다" 에러 메시지가 표시된다.
- **And** 어떠한 DB row도 변경되지 않는다.

### SCN-004: Supabase 장애 시 오프라인 동작 (REQ-SYNC-008)
- **Given** 사용자가 이전 세션에서 정상적으로 데이터를 캐시했다.
- **When** 네트워크가 차단된 상태에서 앱을 다시 연다.
- **Then** 화면은 캐시된 마지막 상태(스킨, 젤리 모양 등)로 정상 렌더링된다.
- **And** 사용자에게 에러 다이얼로그가 표시되지 않는다.
- **And** 비차단형 토스트 또는 footer 인디케이터로 오프라인 상태가 안내된다.
- **And** 광고 표시 시도는 차단된다(`canShowInterstitial`이 false 반환).

### SCN-005: 보상형 광고 시청 → 스킨 잠금해제 일관성 (REQ-SYNC-005, REQ-SYNC-006)
- **Given** 사용자의 `rewarded_ad_count`가 9이고 다음 잠금해제 임계값이 10이다.
- **When** 보상형 광고 1회 시청을 완료한다.
- **Then** `user_skins.rewarded_ad_count`가 10으로 증가한다.
- **And** 새로운 스킨이 `user_skins.unlocked_skins` 배열에 추가된다.
- **And** `ad_impressions.rewarded_count`가 해당 날짜에 +1 된다.
- **And** 위 3개 변경은 트랜잭션 또는 atomic 연산으로 처리되어 부분 실패가 없다.

### SCN-006: 광고 빈도 일일 한도 적용 (REQ-SYNC-006)
- **Given** 오늘 `ad_impressions.interstitial_count`가 일일 최대값에 도달했다.
- **When** 사용자가 전면 광고 트리거 액션을 수행한다.
- **Then** `canShowInterstitial()`이 false를 반환한다.
- **And** Supabase 조회는 세션 캐시 hit으로 추가 네트워크 호출이 발생하지 않는다.

### SCN-007: 자정 통과 시 광고 캐시 무효화 (REQ-SYNC-006)
- **Given** 사용자가 23:55에 앱을 열어 오늘의 ad_impressions를 캐시했다.
- **When** 자정을 지나 00:05에 새 광고 트리거가 발생한다.
- **Then** 시스템은 캐시를 무효화하고 새 날짜의 `ad_impressions` 행을 fetch한다.

### SCN-008: 데이터 초기화 (REQ-SYNC-007)
- **Given** 사용자가 `/settings`에 진입했다.
- **When** "데이터 초기화"를 확인한다.
- **Then** Supabase에서 해당 user의 `user_skins`, `ad_impressions`, `diary_entries` 행이 삭제된다.
- **And** `users` 행의 `jelly_shape`, `persist_emotion`, `skin_expires_at`가 기본값으로 재설정된다.
- **And** localStorage가 클리어되고 새로운 익명 세션이 생성된다.
- **And** Supabase delete 실패 시 localStorage는 보존된다.

### SCN-009: 시간 만료 스킨 자동 비활성 (REQ-SYNC-005)
- **Given** `users.skin_expires_at`이 1시간 전 시각이고 `skin_enabled`가 true이다.
- **When** 앱이 초기화된다.
- **Then** UI는 스킨이 비활성 상태로 렌더링된다.
- **And** 다음 `upsertUserSkins` 호출 시 `skin_enabled`가 false로 정정된다.

### SCN-010: 60초 이내 신규 가입 invite_code 이전 차단 (REQ-SYNC-003)
- **Given** 사용자가 30초 전에 신규 가입했고 `invite_code`를 발급받았다.
- **When** 다른 디바이스에서 이 코드로 데이터 이전을 시도한다.
- **Then** "최근 생성된 계정은 이전할 수 없습니다" 에러로 거부된다.

## 2. Edge Cases

| 케이스 | 기대 동작 |
|--------|-----------|
| 동일 디바이스 두 탭에서 동시에 jellyShape 변경 | 마지막 쓰기가 승리(last-write-wins). Supabase가 양 변경을 순차 적용. 사용자 영향 없음 |
| 광고 시청 중 네트워크 끊김 | 보상은 옵티미스틱하게 로컬 반영, 큐에 추가, 복구 시 flush. 중복 카운트 방지를 위해 impression_id idempotency key 사용 |
| `users.invite_code`가 null인 레거시 계정 | 이전 시 명시적으로 invite_code 생성 후 진행. 또는 Settings에서 "코드 생성" 버튼 노출 |
| Supabase RLS 정책 거부 | 로그 + 사용자 에러 토스트 + 로컬 캐시 fallback |
| 익명 세션 만료 | 자동으로 새 세션 생성, BridgeInitializer가 재실행 |
| jelly_shape에 알 수 없는 값 (앱 다운그레이드) | 기본값 `ppung`으로 fallback, validator로 sanitize |

## 3. 품질 게이트

| 항목 | 기준 |
|------|------|
| 단위 테스트 커버리지 (db.ts 신규 함수) | 90% 이상 |
| Store 통합 테스트 (jellyStore/rewardStore/adFrequencyControl) | 85% 이상 |
| E2E 시나리오 통과 | SCN-001 ~ SCN-010 모두 pass |
| RLS 정책 검증 | 다른 user의 user_skins/ad_impressions 접근 시 거부 확인 |
| TRUST 5 | T(85%+), R(English comments + 한글 docstring), U(prettier/eslint), S(RLS + invite_code rate limit), T(Conventional commits) |
| LSP | 0 errors, 0 type errors |
| 회귀 | 기존 다이어리 작성/공유 기능 정상 동작 확인 |

## 4. Definition of Done

- [ ] Migration SQL이 dev/prod Supabase에 적용되었고 롤백 스크립트가 준비됨
- [ ] 신규 `user_skins`, `ad_impressions` 테이블에 RLS가 활성화됨
- [ ] `migrate-device` Edge Function이 배포되었고 60초 cooldown이 검증됨
- [ ] 모든 EARS 요구사항(REQ-SYNC-001 ~ 008)이 코드로 구현됨
- [ ] SCN-001 ~ SCN-010 acceptance 시나리오가 자동화 테스트로 통과
- [ ] BridgeInitializer 초기화 latency 증가가 300ms 이내로 측정됨
- [ ] 기존 사용자에 대한 M5 one-time backfill이 동작 검증됨
- [ ] Settings 화면에 invite_code 노출 및 복사 기능이 동작
- [ ] Welcome 화면에 기기 이전 UX가 동작
- [ ] `product.md`, `tech.md`에 신규 스키마 및 동기화 정책 반영
- [ ] 회귀 테스트: 다이어리, 친구 공유, 광고 SDK 통합 모두 정상
- [ ] Conventional commit으로 SPEC-SYNC-001 참조하여 커밋됨
