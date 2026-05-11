---
id: SPEC-DIARY-001
version: 1.0.0
status: draft
created: 2026-05-11
priority: P3
author: moai
---

# SPEC-DIARY-001: 일기 상세 보기 (Diary Detail View)

## 개요

타임라인 카드 탭 시 바텀시트 모달로 전체 텍스트 + 감정 상세 정보를 표시. 과거 감정 회고로 리텐션 기여.

## 요구사항 (EARS)

### REQ-DIARY-001: 카드 기본 표시
**The system shall** 타임라인 카드의 텍스트를 최대 2줄까지 표시하고, 초과분은 말줄임(...) 처리한다. (line-clamp-2)

### REQ-DIARY-002: 카드 탭 → 모달
**When** 사용자가 타임라인 카드를 탭할 때,
**the system shall** 바텀시트 모달을 열어 전체 텍스트와 상세 정보를 표시한다.

### REQ-DIARY-003: 모달 상세 내용
**The system shall** 모달에 다음 정보를 표시한다:
- 전체 감정 텍스트 (줄바꿈 포함)
- 감정 라벨 + 아이콘
- 작성 시간
- 감정 신뢰도 (많이/어느정도/살짝)
- 감정 색상 도트

### REQ-DIARY-004: 모달 닫기
**The system shall** 바텀시트 핸들 드래그, 배경 탭, X 버튼으로 모달을 닫을 수 있다.

## 인수 기준

- [ ] 카드 텍스트 line-clamp-2 적용
- [ ] 카드 탭 시 바텀시트 모달 오픈
- [ ] 모달에 전체 텍스트 + 감정 라벨 + 시간 + 신뢰도 표시
- [ ] 배경 탭/핸들 드래그/X 버튼으로 모달 닫기
- [ ] 기존 공개/비공개 토글 버튼 동작 유지

## 기술 접근

### 수정 파일
1. **src/app/diary/page.tsx** — TimelineEntry 확장: line-clamp, 모달 상태, 바텀시트 UI

### 모달 디자인
- fixed bottom-0 left-0 w-full → slide-up 트랜지션
- 배경 오버레이 (bg-black/30)
- 내부: 감정 아이콘 + 라벨, 전체 텍스트, 시간, 신뢰도
- 하단 핸들바 (w-10 h-1 rounded-full bg-gray-300)
