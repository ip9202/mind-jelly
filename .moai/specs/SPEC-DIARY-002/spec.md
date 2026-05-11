---
id: SPEC-DIARY-002
version: 1.0.0
status: draft
created: 2026-05-11
priority: P3
author: moai
---

# SPEC-DIARY-002: 일기 항목 삭제 (Diary Entry Delete)

## 개요

타임라인 카드를 왼쪽으로 스와이프하면 삭제 버튼이 노출되고, 탭 후 확인 다이얼로그를 통해 항목을 삭제한다.

**서비스 철학**: 이 서비스는 그 순간의 감정을 보존하는 것이 목적이므로 **수정 기능은 없음**. 실수로 입력된 항목 제거를 위한 최소한의 삭제 기능만 제공.

## 요구사항 (EARS)

### REQ-DEL-001: 스와이프로 삭제 버튼 노출
**When** 사용자가 타임라인 카드를 왼쪽으로 60px 이상 스와이프할 때,
**the system shall** 카드를 translateX로 밀어 오른쪽에 빨간 삭제 버튼을 노출한다.

### REQ-DEL-002: 스와이프 취소
**When** 사용자가 카드를 오른쪽으로 다시 스와이프하거나 다른 곳을 탭할 때,
**the system shall** 카드를 원래 위치(translateX: 0)로 복원한다.

### REQ-DEL-003: 확인 다이얼로그
**When** 사용자가 삭제 버튼을 탭할 때,
**the system shall** "이 감정 기록을 삭제할까요?" 확인 다이얼로그를 표시하고 삭제/취소 버튼을 제공한다.

### REQ-DEL-004: 항목 삭제
**When** 사용자가 확인 다이얼로그에서 삭제를 탭할 때,
**the system shall** `diaryStore.deleteEntry(id)`를 호출하여 로컬 + Supabase에서 항목을 제거한다.

### REQ-DEL-005: 수직/수평 제스처 충돌 방지
**The system shall** 수평 스와이프(|deltaX| > |deltaY|)일 때만 삭제 제스처로 인식하고, 수직 스크롤과 충돌하지 않는다.

### REQ-DEL-006: 수정 기능 없음
**The system shall** 텍스트 수정 기능을 제공하지 않는다. 감정 기록은 작성 시점의 감정을 보존한다.

## 인수 기준

- [ ] 왼쪽 스와이프 60px 이상 → 빨간 삭제 버튼 노출
- [ ] 오른쪽 스와이프 또는 외부 탭 → 카드 원위치 복원
- [ ] 삭제 버튼 탭 → "이 감정 기록을 삭제할까요?" 다이얼로그 표시
- [ ] 다이얼로그 삭제 → 항목 즉시 제거 (낙관적 업데이트)
- [ ] 다이얼로그 취소 → 카드 원위치, 항목 유지
- [ ] 수직 스크롤과 제스처 충돌 없음
- [ ] 모달 오픈 중 스와이프 무시 (modalOpen 시 스와이프 비활성)

## 기술 접근

### 기존 인프라 활용

- `diaryStore.deleteEntry(id)`: **이미 구현됨** (store + Supabase 연동)
- `touchStartY` ref: 이미 `TimelineEntry`에 존재 (수직 드래그용)
- 추가 state: `swipeOffset: number`, `showDeleteConfirm: boolean`
- 추가 ref: `touchStartX: useRef<number | null>`

### 수정 파일

1. **src/app/diary/page.tsx** — `TimelineEntry` 컴포넌트에 스와이프 + 삭제 확인 UI 추가

### UI 설계

```
┌──────────────────────────────────┬──────────┐
│  [감정아이콘] 텍스트 (2줄 clamp) │  [삭제]  │
│              작성 시간           │  (빨강)  │
└──────────────────────────────────┴──────────┘
                     ↑ 스와이프 시 카드가 80px 왼쪽으로 이동
```

- 삭제 버튼: `w-20 bg-red-500 text-white` absolute right
- 카드 container: `overflow-hidden` relative
- 카드: `transition-transform duration-200`, `transform: translateX(swipeOffset)`
- 확인 다이얼로그: 기존 바텀시트 패턴 재사용 (fixed overlay + 하단 시트)

### 제스처 로직

```
onTouchStart: startX = e.touches[0].clientX, startY = e.touches[0].clientY
onTouchMove:
  deltaX = currentX - startX, deltaY = currentY - startY
  if abs(deltaX) > abs(deltaY):  // 수평 제스처
    if deltaX < 0: swipeOffset = max(deltaX, -80)  // 왼쪽으로 최대 80px
    if deltaX > 0 && swipeOffset < 0: swipeOffset = min(0, swipeOffset + deltaX)
onTouchEnd:
  if swipeOffset < -40: swipeOffset = -80  // snap to open
  else: swipeOffset = 0  // snap to close
```
