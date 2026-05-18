# SPEC-FRIEND-001: 프로필 & 친구 발견

## 메타데이터

| 필드 | 값 |
|------|-----|
| ID | SPEC-FRIEND-001 |
| 모듈 | M1 - Profile & Friend Discovery |
| 우선순위 | High |
| 예상 파일 수 | 2-3 |
| 컨텍스트 | ~80K (204K 내 여유 충분) |

## 배경

친구 기능의 기반이 되는 사용자 식별과 발견 흐름. 닉네임은 welcome 페이지에서 이미 의무 설정됨. 초대코드는 DB에 자동 생성되지만 **확인/공유 UI가 없음**이 핵심 갭.

### 현재 상태

- `users` 테이블: `nickname` (UNIQUE, welcome에서 설정), `invite_code` (자동 생성 6자리)
- `welcome/page.tsx`: 닉네임 입력 (2자 이상, 중복 체크) — 완료
- `friends/page.tsx` SearchTab: 초대코드로 검색/추가 — 완료
- **누락**: 내 초대코드를 보고 공유할 UI 없음

## 요구사항

### REQ-F001-001: 내 초대코드 섹션

**EARS**: The system SHALL display the user's invite code at the top of the friends page with a copy button.

**인수 기준**:
- [ ] Friends 페이지 상단에 "내 초대코드: XXXXXX" 표시
- [ ] 코드 옆에 복사 버튼 (클립보드 아이콘)
- [ ] 복사 성공 시 "복사됨!" 토스트 메시지 (1.5초 후 사라짐)
- [ ] `navigator.clipboard.writeText()` 사용
- [ ] 초대코드가 없는 사용자 (엣지 케이스): `getMyProfile()`에서 자동 생성됨 (`auth.ts:112`)

### REQ-F001-002: 초대코드 공유 가이드

**EARS**: The system SHALL display a hint text below the invite code explaining how to share it.

**인수 기준**:
- [ ] "코드를 친구에게 알려주면 친구 추가가 가능해요" 안내 문구
- [ ] 첫 방문 시에만 배너 형태로 강조 표시

### REQ-F001-003: 친구 검색 검증

**EARS**: The system SHALL validate that existing friend search functionality works correctly with proper error handling.

**인수 기준**:
- [ ] 6자리 초대코드 입력 → 대문자 자동 변환
- [ ] 존재하지 않는 코드: "해당 초대코드의 친구를 찾을 수 없어요" 메시지
- [ ] 자기 자신: "본인은 추가할 수 없어요" 메시지
- [ ] 이미 친구: "이미 친구예요 ✓" 상태 표시
- [ ] 이미 요청됨: "요청 중..." 상태 표시
- [ ] 정상 추가: "친구 추가" 버튼 → 요청 전송 → "요청 중..." 전환

## 수정 대상 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `src/app/friends/page.tsx` | 수정 | SearchTab 상단에 내 초대코드 섹션 추가 |
| `src/lib/supabase/db.ts` | 확인 | `getMyProfile()`에서 invite_code 반환 확인 |

## 기술 접근

1. `FriendsPage` 컴포넌트에서 `getMyProfile(supabaseUserId)` 호출
2. 반환된 `invite_code`를 상단에 표시
3. 복사 버튼에 `navigator.clipboard.writeText()` 바인딩
4. 복사 성공/실패 상태 관리 (useState)

### UI 구조

```
┌─────────────────────────────┐
│ 내 초대코드                  │
│ ┌───────────┐ ┌──┐         │
│ │ AB12CD    │ │📋│ 복사    │
│ └───────────┘ └──┘         │
│ 코드를 친구에게 알려주세요   │
├─────────────────────────────┤
│ [찾기] [목록] [피드]        │ ← 기존 탭 바
├─────────────────────────────┤
│ (기존 SearchTab 내용)        │
└─────────────────────────────┘
```

## 의존성

- 선행: 없음 (독립 실행 가능)
- 후행: SPEC-FRIEND-002 (친구 발견 후 관리 필요)

## 위험 요소

| 위험 | 완화 |
|------|------|
| clipboard API 미지원 (구 WebView) | `document.execCommand('copy')` 폴백 |
| invite_code 미생성 사용자 | `auth.ts:112`에서 자동 생성됨 |
