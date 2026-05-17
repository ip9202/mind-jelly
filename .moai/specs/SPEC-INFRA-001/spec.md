---
id: SPEC-INFRA-001
version: 1.0.0
status: planned
created: 2026-05-17
updated: 2026-05-17
author: 강력쇠주먹
priority: high
issue_number: null
---

# SPEC-INFRA-001: 개발용 Supabase 환경 분리

## HISTORY

- 2026-05-17: v1.0.0 초기 작성. 배경, 요구사항, 제약사항, 제외 항목 정의.

---

## 1. 배경 및 동기

### 1.1 현황

마음 젤리 v1.0.0은 앱인토스(토스 미니앱)에 배포된 프로덕션 서비스다. 현재 단일 Supabase 프로젝트(`qxeyphkpkcypfinqauaz.supabase.co`)를 프로덕션과 개발이 공유하고 있다.

모든 환경 변수가 `.env.local` 단일 파일에 집중되어 있으며, `.env.development`, `.env.production`, `.env.example` 파일이 존재하지 않는다.

### 1.2 문제

1. **실사용자 데이터 노출 위험**: 프로덕션 DB에 실사용자의 일기, 감정 데이터가 저장되어 있어, 개발 중 테스트 데이터 생성/삭제 시 실데이터 훼손 위험이 있다.
2. **친구 시스템 개발 불가**: SPEC-FRIEND-001~004 구현을 위해 friendships, diary_entries 조작이 필요하나, 프로덕션 DB에서 이 작업은 위험하다.
3. **환경 전환 불가**: `next dev`와 `next build`가 동일한 Supabase를 바라보고 있어, 개발/배포 환경 분리가 불가하다.

### 1.3 선택한 접근

새로운 Supabase 프로젝트를 생성(Supabase 무료 티어는 2개 프로젝트 허용)하고, Next.js 내장 환경 변수 로딩 메커니즘을 활용하여 `.env.development`와 `.env.production`으로 분리한다. `src/lib/supabase/client.ts` 코드 변경 없이 환경 분리가 가능하다.

---

## 2. 요구사항 (EARS 형식)

### REQ-INFRA-001: 환경 변수 파일 분리

**While** 개발자가 로컬 개발 환경에서 작업 중일 때, **the system shall** `.env.development` 파일에서 개발용 Supabase 자격 증명을 로드한다.

**While** 프로덕션 빌드가 실행 중일 때, **the system shall** `.env.production` 파일에서 프로덕션 Supabase 자격 증명을 로드한다.

**When** `.env.local` 파일이 존재할 때, **the system shall** 해당 파일의 값을 `.env.development` 및 `.env.production`보다 우선 적용하지 않는다 (Supabase 관련 변수에 한함).

### REQ-INFRA-002: 환경 변수 파일 구조

**The system shall** 다음 파일 구조를 유지한다:

| 파일 | 목적 | Git 추적 | 포함 내용 |
|------|------|----------|-----------|
| `.env.development` | 개발 환경 Supabase 자격 증명 | 아니오 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `.env.production` | 프로덕션 환경 Supabase 자격 증명 | 아니오 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `.env.local` | 공유 시크릿 (환경 무관) | 아니오 | `AIT_API_KEY` 만 |
| `.env.example` | 신규 개발자용 템플릿 | 예 | 모든 변수의 플레이스홀더 |

### REQ-INFRA-003: 기존 `.env.local` 정리

**When** 환경 분리 작업이 완료된 후, **the system shall** `.env.local`에서 Supabase 관련 변수가 제거되고 `AIT_API_KEY`만 남아 있어야 한다.

### REQ-INFRA-004: 스키마 동기화 스크립트

**When** 개발자가 `npm run db:sync`를 실행하면, **the system shall** 프로덕션 Supabase 스키마를 개발 Supabase 프로젝트로 복사한다.

**If** 동기화 대상 테이블에 기존 데이터가 존재하면, **then** the system shall 기존 데이터를 삭제하기 전에 확인 프롬프트를 표시한다.

동기화 대상 테이블: `users`, `diary_entries`, `friendships`, `user_skins`, `ad_impressions`

### REQ-INFRA-005: 시드 데이터

**When** 개발자가 `npm run db:seed`를 실행하면, **the system shall** 개발 Supabase 프로젝트에 테스트용 데이터를 생성한다.

시드 데이터는 다음을 포함해야 한다:
- 3명 이상의 테스트 사용자
- 테스트 사용자 간 친구 관계 (수락됨, 대기중 상태 포함)
- 테스트 사용자의 일기 엔트리
- 테스트 사용자의 스킨 데이터

### REQ-INFRA-006: Edge Functions 배포

**When** 개발자가 `npm run deploy:functions`를 실행하면, **the system shall** Edge Functions(`recover-session`, `toss-login`, `toss-disconnect`)을 개발 Supabase 프로젝트에 배포한다.

### REQ-INFRA-007: 환경 검증

**When** 애플리케이션이 시작될 때, **the system shall** `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바르게 설정되었는지 검증한다.

**If** 필수 환경 변수가 누락되면, **then** the system shall 명확한 에러 메시지와 함께 시작을 중단한다.

---

## 3. 제약사항

### 3.1 기술 제약

- **Next.js Static Export**: 이 프로젝트는 `output: 'export'` 설정으로 정적 빌드한다. `NEXT_PUBLIC_` 접두사 변수는 빌드 타임에 임베드된다. 런타임 환경 전환은 불가하다.
- **`.gitignore` 패턴**: 현재 `.env*` 패턴으로 모든 env 파일이 gitignore된다. `.env.example`은 git에 추적되어야 하므로 `.gitignore` 수정이 필요하다.
- **Supabase 무료 티어**: 최대 2개 프로젝트 생성 가능. 프로덕션 1개 + 개발 1개로 제한.
- **client.ts 변경 불가**: 환경 분리는 Next.js 내장 env 로딩으로 해결하며, `src/lib/supabase/client.ts`는 수정하지 않는다.

### 3.2 보안 제약

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 공개 키(anon key)이므로 git에 커밋되어도 안전하다. 단, 서비스 롤 키(service_role key)는 절대 env 파일에 포함하지 않는다.
- `.env.local`에는 `AIT_API_KEY`와 같은 시크릿만 유지한다.
- `.env.example`에는 실제 값 대신 플레이스홀더만 포함한다.

### 3.3 의존성

- 이 SPEC은 SPEC-FRIEND-001~004의 전제 조건이다 (친구 시스템 테스트에 개발 DB 필요).

---

## 4. 제외 항목 (What NOT to Build)

- **CI/CD 환경 분리**: GitHub Actions 등 CI/CD 파이프라인에서의 환경 분리는 이 SPEC의 범위 밖이다.
- **Supabase CLI 마이그레이션 관리**: `supabase/migrations/` 디렉토리 구조를 통한 마이그레이션 버전 관리는 도입하지 않는다. 스키마 동기화는 스크립트로 수행한다.
- **런타임 환경 전환**: 정적 빌드 특성상 런타임 환경 전환은 지원하지 않는다. 환경 전환은 빌드 단계에서만 가능하다.
- **프로덕션 데이터 마스킹**: 프로덕션 DB 데이터를 익명화하여 개발 환경으로 복사하는 기능은 포함하지 않는다.
- **자동 스키마 감시**: 프로덕션 스키마 변경을 감지하여 자동으로 개발 환경에 반영하는 기능은 포함하지 않는다.
- **Supabase 프로젝트 자동 생성**: 개발용 Supabase 프로젝트 생성은 수동으로 수행한다.

---

## 5. 관련 SPEC

| SPEC ID | 관계 | 설명 |
|---------|------|------|
| SPEC-FRIEND-001~004 | 선행 조건 | 친구 시스템 개발에 개발 DB 필요 |
| SPEC-SYNC-001 | 참고 | DB 스키마 및 API 구조 정의 |
