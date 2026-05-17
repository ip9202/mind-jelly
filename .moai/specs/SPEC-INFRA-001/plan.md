---
spec: SPEC-INFRA-001
version: 1.0.0
status: planned
created: 2026-05-17
updated: 2026-05-17
---

# 구현 계획: SPEC-INFRA-001

## 1. 마일스톤

### M1: Supabase 개발 프로젝트 생성 (수동, Priority: High)

작업 내용:
- Supabase 대시보드에서 새 프로젝트 생성
- 프로젝트명: `mind-jelly-dev` (또는 유사한 이름)
- 지역: 프로덕션과 동일 지역 선택
- 데이터베이스 비밀번호 설정 및 안전한 곳에 보관

산출물:
- 개발용 Supabase 프로젝트 URL 및 anon key

### M2: 환경 변수 파일 분리 (Priority: High)

작업 내용:
1. `.env.production` 파일 생성 — 기존 `.env.local`에서 프로덕션 Supabase 자격 증명 이관
2. `.env.development` 파일 생성 — M1에서 생성한 개발 Supabase 자격 증명 입력
3. `.env.local` 수정 — Supabase 변수 제거, `AIT_API_KEY`만 유지
4. `.env.example` 파일 생성 — 모든 변수의 플레이스홀더 포함
5. `.gitignore` 수정 — `.env*` 패턴을 세분화하여 `.env.example`은 추적 허용

위험 요소:
- `.env.local` 수정 시 기존 Supabase 자격 증명 분실 가능 → 작업 전 백업 필수
- `.gitignore` 변경 후 의도치 않은 env 파일 커밋 가능 → `git status` 확인 필수

### M3: 스키마 동기화 스크립트 (Priority: High)

작업 내용:
1. `scripts/db-sync.sh` 생성
   - 프로덕션 Supabase에서 스키마 추출 (`pg_dump --schema-only` 또는 Supabase CLI)
   - 개발 Supabase에 스키마 적용
   - 기존 데이터 삭제 경고 표시
2. `package.json`에 `db:sync` 스크립트 추가

의존성: M1, M2 완료 후 실행 가능

### M4: 시드 데이터 스크립트 (Priority: High)

작업 내용:
1. `supabase/seed.sql` 생성
   - 3명 테스트 사용자 (고정 UUID 사용)
   - 친구 관계: 수락됨 1쌍, 대기중 1쌍
   - 일기 엔트리: 사용자별 2-3개
   - 스킨 데이터: 기본 스킨 활성화
2. `package.json`에 `db:seed` 스크립트 추가

의존성: M3 완료 후 실행 가능

### M5: Edge Functions 배포 스크립트 (Priority: Medium)

작업 내용:
1. `package.json`에 `deploy:functions` 스크립트 추가
   - `supabase/functions/recover-session`
   - `supabase/functions/toss-login`
   - `supabase/functions/toss-disconnect`
2. 배포 대상을 개발 프로젝트로 지정하는 방법 문서화

의존성: M1 완료 후 실행 가능

### M6: 환경 검증 및 `.gitignore` 수정 (Priority: High)

작업 내용:
1. `.gitignore` 수정:
   - 기존 `.env*` 패턴 제거
   - `.env.local`, `.env.development`, `.env.production` 개별 추가
   - `.env.example`은 추적 허용 (제외 항목에 추가하지 않음)
2. 애플리케이션 시작 시 환경 변수 검증 로직 확인 (기존 코드에서 이미 처리되는지 확인)

의존성: M2와 병렬 진행 가능

---

## 2. 기술 접근 방식

### 환경 변수 로딩 순서 (Next.js 표준)

```
next dev 실행 시:
  .env.development.local (최고 우선순위)
  .env.local
  .env.development
  .env

next build 실행 시:
  .env.production.local (최고 우선순위)
  .env.local
  .env.production
  .env
```

**핵심**: `.env.local`이 `.env.development`/`.env.production`보다 우선순위가 높다. 따라서 `.env.local`에서 Supabase 변수를 제거하는 것이 필수적이다.

### `.gitignore` 변경 전략

현재:
```
.env*
```

변경 후:
```
.env.local
.env.development
.env.production
```

`.env.example`은 `.gitignore`에 포함되지 않아 git 추적이 가능해진다.

---

## 3. 위험 평가

| 위험 | 확률 | 영향 | 완화 방안 |
|------|------|------|-----------|
| `.env.local` 수정 중 프로덕션 자격 증명 분실 | 중 | 높음 | 작업 전 파일 백업 |
| `.gitignore` 변경 후 실수로 env 파일 커밋 | 낮 | 높음 | `git status` 검증 단계 포함 |
| 스키마 동기화 실패 | 중 | 중 | `pg_dump` 실패 시 에러 메시지 출력 |
| Supabase 무료 티어 한도 초과 | 낮 | 높음 | 2개 프로젝트(프로덕션+개발)로 제한 |
| 시드 데이터와 프로덕션 스키마 불일치 | 중 | 중 | `db:sync` → `db:seed` 순서로 실행 강제 |

---

## 4. 구현 순서

```
M1 (수동) → M2 + M6 (병렬) → M3 → M4 → M5
```

M1은 수동으로 Supabase 대시보드에서 프로젝트를 생성하는 작업이므로 먼저 수행해야 한다. M2와 M6은 서로 독립적이므로 병렬 진행 가능하다. M3는 M1, M2가 완료된 후 실행 가능하고, M4는 M3 이후에 실행한다.
