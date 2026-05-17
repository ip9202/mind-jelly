---
spec: SPEC-INFRA-001
version: 1.0.0
status: planned
created: 2026-05-17
updated: 2026-05-17
---

# 인수 기준: SPEC-INFRA-001

## 1. 인수 테스트 시나리오 (Given-When-Then)

### 시나리오 1: 개발 환경에서 개발 Supabase 연결

**Given** `.env.development`에 개발용 Supabase URL과 anon key가 설정되어 있다
**And** `.env.local`에 Supabase 관련 변수가 존재하지 않는다
**When** `npm run dev`를 실행한다
**Then** 애플리케이션이 개발용 Supabase 프로젝트에 연결된다
**And** 콘솔에 프로덕션 Supabase URL이 아닌 개발용 URL이 표시된다

### 시나리오 2: 프로덕션 빌드에서 프로덕션 Supabase 연결

**Given** `.env.production`에 프로덕션 Supabase URL과 anon key가 설정되어 있다
**And** `.env.local`에 Supabase 관련 변수가 존재하지 않는다
**When** `npm run build`를 실행한다
**Then** 빌드된 정적 파일에 프로덕션 Supabase URL이 임베드된다

### 시나리오 3: 스키마 동기화

**Given** 프로덕션 Supabase에 `users`, `diary_entries`, `friendships`, `user_skins`, `ad_impressions` 테이블이 존재한다
**When** `npm run db:sync`를 실행한다
**Then** 개발 Supabase에 동일한 테이블 구조가 생성된다
**And** RLS(Row Level Security) 정책이 함께 복사된다

### 시나리오 4: 시드 데이터 생성

**Given** 개발 Supabase에 스키마가 동기화되어 있다
**When** `npm run db:seed`를 실행한다
**Then** 3명 이상의 테스트 사용자가 생성된다
**And** 테스트 사용자 간 친구 관계(수락됨, 대기중)가 생성된다
**And** 각 사용자에게 2-3개의 일기 엔트리가 생성된다

### 시나리오 5: `.env.example` 추적

**Given** `.gitignore`가 업데이트되었다
**When** `git status`를 실행한다
**Then** `.env.example` 파일이 추적 대상으로 표시된다
**And** `.env.local`, `.env.development`, `.env.production`은 추적 대상이 아니다

---

## 2. 엣지 케이스

### EC-1: `.env.local`에 Supabase 변수가 남아 있는 경우

**Given** `.env.local`에 여전히 Supabase 변수가 존재한다
**When** `npm run dev`를 실행한다
**Then** `.env.local`의 값이 우선 적용되어 프로덕션 DB에 연결된다
**Expected behavior**: 이것은 의도한 동작이 아니다. REQ-INFRA-003에 의해 `.env.local`에서 Supabase 변수가 제거되어야 한다.

### EC-2: `.env.development` 파일이 없는 경우

**Given** `.env.development` 파일이 존재하지 않는다
**When** `npm run dev`를 실행한다
**Then** Supabase 연결 실패 에러가 발생한다
**Expected behavior**: REQ-INFRA-007에 의해 명확한 에러 메시지가 표시되어야 한다.

### EC-3: `db:sync` 실행 중 프로덕션 DB 연결 실패

**Given** 프로덕션 Supabase에 네트워크 연결이 불가하다
**When** `npm run db:sync`를 실행한다
**Then** 스크립트가 명확한 에러 메시지를 출력하고 종료된다
**And** 개발 DB의 기존 데이터는 변경되지 않는다

### EC-4: 시드 데이터 중복 실행

**Given** 이미 시드 데이터가 존재하는 개발 DB에
**When** `npm run db:seed`를 다시 실행한다
**Then** `ON CONFLICT` 처리에 의해 에러 없이 처리되거나, 기존 데이터 삭제 후 재생성된다

---

## 3. 품질 게이트

### Definition of Done

- [ ] `.env.development` 파일이 존재하고 개발용 Supabase 자격 증명을 포함한다
- [ ] `.env.production` 파일이 존재하고 프로덕션 Supabase 자격 증명을 포함한다
- [ ] `.env.local`에 `AIT_API_KEY`만 존재한다 (Supabase 변수 제거됨)
- [ ] `.env.example` 파일이 git에 추적된다
- [ ] `.gitignore`가 `.env.local`, `.env.development`, `.env.production`을 명시적으로 제외한다
- [ ] `npm run dev`가 개발 Supabase에 연결된다
- [ ] `npm run build`가 프로덕션 Supabase 자격 증명을 임베드한다
- [ ] `npm run db:sync`가 스키마를 성공적으로 동기화한다
- [ ] `npm run db:seed`가 테스트 데이터를 생성한다
- [ ] `src/lib/supabase/client.ts`가 수정되지 않았다
- [ ] `scripts/db-sync.sh`가 존재하고 실행 가능하다
- [ ] `supabase/seed.sql`이 존재한다

### 검증 명령어

```bash
# 1. env 파일 구조 확인
ls -la .env.*

# 2. .env.local에 Supabase 변수 없음 확인
grep -c "SUPABASE" .env.local  # 0이어야 함

# 3. .env.example가 git 추적되는지 확인
git check-ignore .env.example  # 아무 출력 없어야 함

# 4. 개발 서버 실행 확인
npm run dev  # 개발 Supabase URL로 연결 확인

# 5. 프로덕션 빌드 확인
npm run build  # 프로덕션 Supabase URL 임베드 확인

# 6. 스키마 동기화
npm run db:sync

# 7. 시드 데이터
npm run db:seed
```
