---
id: SPEC-INFRA-001
version: 1.0.0
compact: true
---

# SPEC-INFRA-001 (Compact): 개발용 Supabase 환경 분리

## 목표

프로덕션 Supabase와 개발 Supabase를 분리하여, 실사용자 데이터 위험 없이 친구 시스템(SPEC-FRIEND-001~004)을 개발할 수 있는 환경을 구축한다.

## 핵심 요구사항

| ID | 요구사항 | 우선순위 |
|----|---------|---------|
| REQ-001 | `.env.development`에 개발 Supabase 자격 증명 | High |
| REQ-002 | `.env.production`에 프로덕션 Supabase 자격 증명 | High |
| REQ-003 | `.env.local`에서 Supabase 변수 제거, `AIT_API_KEY`만 유지 | High |
| REQ-004 | `.env.example` 템플릿 파일 생성 및 git 추적 | High |
| REQ-005 | `.gitignore` 수정: `.env.example` 추적 허용 | High |
| REQ-006 | `npm run db:sync` 스키마 동기화 스크립트 | High |
| REQ-007 | `npm run db:seed` 시드 데이터 (사용자 3+, 친구관계, 일기) | High |
| REQ-008 | `npm run deploy:functions` Edge Functions 배포 | Medium |
| REQ-009 | 환경 변수 누락 시 명확한 에러 메시지 | Medium |

## 제약사항

- `src/lib/supabase/client.ts` 수정하지 않음
- Next.js `output: 'export'` → 빌드 타임에 env 임베드
- Supabase 무료 티어: 프로젝트 2개 한도
- `.env.local`이 `.env.development`/`.env.production`보다 우선순위 높음 → 반드시 Supabase 변수 제거

## 파일 변경

### 생성
- `.env.production` — 프로덕션 Supabase 자격 증명
- `.env.development` — 개발 Supabase 자격 증명
- `.env.example` — 템플릿 (git 추적)
- `supabase/seed.sql` — 시드 데이터
- `scripts/db-sync.sh` — 스키마 동기화

### 수정
- `.env.local` — Supabase 변수 제거
- `.gitignore` — `.env*` → 개별 파일 지정
- `package.json` — `db:sync`, `db:seed`, `deploy:functions` 스크립트 추가

### 변경 없음
- `src/lib/supabase/client.ts`

## 마일스톤 순서

```
M1 (수동: Supabase 프로젝트 생성) → M2 + M6 (병렬: env 파일 + gitignore) → M3 (db:sync) → M4 (db:seed) → M5 (deploy:functions)
```

## 인수 기준 핵심

1. `npm run dev` → 개발 Supabase 연결 (프로덕션 URL 아님)
2. `npm run build` → 프로덕션 Supabase 자격 증명 임베드
3. `npm run db:sync` → 스키마 복사 성공
4. `npm run db:seed` → 테스트 데이터 3+ 사용자 생성
5. `.env.example`이 git에 추적됨
6. `client.ts` 변경 없음
