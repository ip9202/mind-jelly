# SPEC-FRIEND-004: 네비게이션 통합

## 메타데이터

| 필드 | 값 |
|------|-----|
| ID | SPEC-FRIEND-004 |
| 모듈 | M4 - Navigation Integration |
| 우선순위 | Medium |
| 예상 파일 수 | 2-3 |
| 컨텍스트 | ~60K (204K 내 여유 충분) |

## 배경

모든 친구 기능이 준비된 후 최종적으로 네비게이션을 활성화하는 통합 작업. 가장 작은 SPEC이지만 **모든 선행 SPEC이 완료된 후에만** 실행해야 함.

### 현재 상태

- `NavMenu.tsx:20`: Friends 메뉴 항목 주석 처리됨
- `BottomNav.tsx`: 3개 탭 (젤리/기록/설정), Friends 없음
- `friends/page.tsx`: `/friends` 라우트는 존재하지만 네비게이션에서 접근 불가

## 요구사항

### REQ-F004-001: BottomNav 친구 탭 추가

**EARS**: The system SHALL add a Friends tab to the bottom navigation between History and Settings.

**인수 기준**:
- [ ] BottomNav에 4번째 탭 "친구" 추가 (icon: group)
- [ ] 탭 순서: 젤리 / 기록 / 친구 / 설정
- [ ] `/friends` 경로로 라우팅
- [ ] 활성 탭 스타일링 기존 탭과 동일
- [ ] 친구 탭 활성 시 `activeTab` 상태 `'friends'` 설정

### REQ-F004-002: NavMenu 친구 항목 활성화

**EARS**: The system SHALL enable the Friends menu item in the hamburger navigation menu.

**인수 기준**:
- [ ] 주석 처리된 Friends 항목 활성화
- [ ] 아이콘: `group` (Material Symbols)
- [ ] 라벨: "친구" (또는 "Friends")
- [ ] href: `/friends`
- [ ] `@MX:TODO` 태그 제거

### REQ-F004-003: 받은 친구 요청 뱃지

**EARS**: The system SHALL display a badge count on the Friends tab when there are pending friend requests.

**인수 기준**:
- [ ] BottomNav 친구 탭에 받은 요청 수 뱃지 (빨간 점 또는 숫자)
- [ ] 받은 요청이 0개면 뱃지 숨김
- [ ] 뱃지 데이터: `getPendingFriendRequests()` 카운트
- [ ] 친구 페이지 진입 후 뱃지 초기화 (읽음 처리)

## 수정 대상 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `src/components/layout/BottomNav.tsx` | 수정 | 친구 탭 추가 + 뱃지 |
| `src/components/layout/NavMenu.tsx` | 수정 | Friends 항목 주석 해제 |
| `src/app/friends/page.tsx` | 수정 | BottomNav에 activeTab 전달 |

## 기술 접근

### BottomNav 수정

```typescript
const tabs = [
  { id: 'jelly', label: '젤리', icon: 'bubble_chart', href: '/home' },
  { id: 'history', label: '기록', icon: 'auto_stories', href: '/diary' },
  { id: 'friends', label: '친구', icon: 'group', href: '/friends' },  // 추가
  { id: 'garden', label: '설정', icon: 'tune', href: '/settings' },
];
```

### 뱃지 구현

- `diaryStore` 또는 별도 스토어에 `pendingFriendCount` 상태 추가
- BottomNav에서 카운트 조회하여 뱃지 렌더링
- 주기적 폴링 또는 친구 페이지 진입 시 갱신

## 의존성

- 선행: SPEC-FRIEND-001, SPEC-FRIEND-002, SPEC-FRIEND-003 (모두 완료 후 실행)
- 후행: 없음 (최종 통합)

## 위험 요소

| 위험 | 완화 |
|------|------|
| 4개 탭으로 모바일 공간 협소 | 아이콘 + 라벨 크기 조정 또는 아이콘만 표시 |
| 뱃지 폴링 성능 | 친구 페이지 진입/나갈 때만 갱신 |
| 기존 탭 activeTab 타입 확장 | `'friends'` 추가만으로 해결 |
