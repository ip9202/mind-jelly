# SPEC-FRIEND-003: 감정 공유 & 피드

## 메타데이터

| 필드 | 값 |
|------|-----|
| ID | SPEC-FRIEND-003 |
| 모듈 | M3 - Emotion Sharing & Feed |
| 우선순위 | High |
| 예상 파일 수 | 3-5 |
| 컨텍스트 | ~120K (204K 내 여유 충분) |

## 배경

일기의 감정을 친구에게 공유하는 핵심 가치 기능. `diary_entries.is_shared` 필드는 존재하지만 **공유 토글 UI가 전혀 없음**이 핵심 갭. 친구 피드는 이미 구현되어 있어 공유만 활성화되면 자동 작동.

### 현재 상태

- `diary_entries` 테이블: `is_shared BOOLEAN DEFAULT false` — 스키마 완료
- `diary_entries` RLS: `diary_shared` 정책으로 `is_shared = true`인 항목 SELECT 가능 — 완료
- `friends/page.tsx` FeedTab: `getFriendsFeed()`로 공유 일기 표시 — 완료
- `db.ts`: `getFriendsFeed(friendIds)` — 완료
- **누락**: 일기 작성/조회 화면에 `is_shared` 토글 UI 없음

## 요구사항

### REQ-F003-001: 일기 공유 토글

**EARS**: The system SHALL provide a share toggle on each diary entry that allows the user to share or unshare their emotion with friends.

**인수 기준**:
- [ ] 일기 상세/작성 완료 화면에 "친구에게 공유" 토글 스위치
- [ ] 토글 ON: `diary_entries.is_shared = true` 업데이트
- [ ] 토글 OFF: `diary_entries.is_shared = false` 업데이트
- [ ] 친구가 없는 경우: 토글 비활성화 + "친구를 먼저 추가해주세요" 안내
- [ ] 공유 상태 변경 시 즉시 Supabase 업데이트 (낙관적 UI)
- [ ] 공유된 일기에 공유 아이콘 표시 (일기 목록에서)

### REQ-F003-002: 일기 목록 공유 상태 표시

**EARS**: The system SHALL visually indicate which diary entries are shared with friends in the diary list.

**인수 기준**:
- [ ] 공유된 일기에 공유 아이콘 (share/material icon) 표시
- [ ] 아이콘 색상: 공유됨 = primary, 비공유 = surface-variant
- [ ] 아이콘 클릭 시 공유 상태 토글

### REQ-F003-003: 친구 피드 검증

**EARS**: The system SHALL validate that the friends feed correctly displays shared diary entries from all accepted friends.

**인수 기준**:
- [ ] 친구의 공유 일기가 최신순으로 표시
- [ ] 각 피드 항목: 작성자 닉네임 + 아바타 + 감정 라벨 + 시간 + 일기 내용
- [ ] 공유 일기가 0개: "아직 공유된 감정이 없어요\n친구가 일기를 공유하면 여기에 나타나요"
- [ ] 친구가 0명: "먼저 친구를 추가해주세요" 안내
- [ ] 최대 50개까지 로드 (`getFriendsFeed` 기존 제한)

### REQ-F003-004: 공유 일기 개인정보 보호

**EARS**: The system SHALL ensure that only shared diary entries are visible to friends, and unshared entries remain private.

**인수 기준**:
- [ ] `is_shared = false`인 일기는 다른 사용자에게 절대 노출되지 않음
- [ ] RLS 정책 `diary_shared`가 정상 작동 확인
- [ ] 공유 해제 시 즉시 피드에서 사라짐 (Supabase 실시간 구독 또는 재조회)

## 수정 대상 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `src/app/diary/page.tsx` | 수정 | 일기 항목에 공유 아이콘 + 토글 추가 |
| `src/lib/supabase/db.ts` | 추가 | `toggleDiaryShare(entryId, isShared)` 함수 추가 |
| `src/app/friends/page.tsx` | 확인 | FeedTab 검증, 친구 0명 안내 추가 |

## 기술 접근

### Backend: toggleDiaryShare()

```typescript
// db.ts에 추가
export async function toggleDiaryShare(entryId: string, isShared: boolean) {
  const { error } = await supabase
    .from('diary_entries')
    .update({ is_shared: isShared })
    .eq('id', entryId);
  if (error) throw error;
}
```

### Frontend: 공유 토글 위치 고민

**옵션 A (권장)**: 일기 목록에서 각 항목에 공유 아이콘 배치
- 장점: 빠른 토글, 목록에서 공유 상태 한눈에 파악
- 단점: 목록 항목에 버튼 추가로 UI 복잡도 증가

**옵션 B**: 일기 상세 화면에 토글 배치
- 장점: 상세 페이지에서만 토글, UI 깔끔
- 단점: 공유하려면 상세 진입 필요

→ 현재 일기 목록 구조 (카드 형태)에 아이콘 추가가 자연스러우므로 옵션 A 선택.

### 공유 아이콘 UI

```
┌─────────────────────────────┐
│ 😊 행복                    📤│ ← 공유 아이콘
│ 오늘 정말 좋은 하루였다...   │
│ 2026.05.17                  │
└─────────────────────────────┘
```

## 의존성

- 선행: SPEC-FRIEND-002 (친구 관계가 성립되어야 공유 의미 있음)
- 후행: SPEC-FRIEND-004 (모든 기능 완료 후 네비게이션 오픈)

## 위험 요소

| 위험 | 완화 |
|------|------|
| 공유 토글 빈번한 DB 업데이트 | debounce 적용 또는 낙관적 UI |
| RLS 우회 가능성 | Supabase RLS 테스트 케이스 작성 |
| 피드 성능 (친구 다수 시) | 기존 50개 제한 + 인덱스로 충분 |
