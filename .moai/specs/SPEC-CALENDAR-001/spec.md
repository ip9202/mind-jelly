---
id: SPEC-CALENDAR-001
version: 1.0.0
status: draft
created: 2026-05-11
priority: P2
author: moai
---

# SPEC-CALENDAR-001: 달력 감정 도트 색상 (Calendar Emotion Dots)

## 개요

캘린더 날짜의 단일 핑크 도트를 해당 날짜의 대표 감정 색상으로 변경. 시각적 풍부함으로 일기 작성 동기 부여.

## 요구사항 (EARS)

### REQ-CAL-001: 감정별 도트 색상
**When** 특정 날짜에 감정 기록이 존재할 때,
**the system shall** 해당 날짜의 대표 감정(최빈 감정)에 해당하는 EMOTION_COLORS 색상으로 도트를 표시한다.

### REQ-CAL-002: 대표 감정 계산
**The system shall** 동일 날짜에 여러 감정이 기록된 경우, 가장 많이 기록된 감정을 대표 감정으로 선택한다. 동률인 경우 가장 최근 감정을 선택한다.

### REQ-CAL-003: 데이터 없는 날
**When** 해당 날짜에 감정 기록이 없을 때,
**the system shall** 도트를 표시하지 않는다. (기존 동작 유지)

## 인수 기준

- [ ] 날짜별 대표 감정 Map 생성
- [ ] EMOTION_COLORS 색상으로 도트 inline style 적용
- [ ] 복수 감정 시 최빈 감정 → 최근 감정 우선
- [ ] 기록 없는 날은 도트 미표시 (기존 유지)
- [ ] 기존 캘린더 레이아웃/동작 변경 없음

## 기술 접근

### 수정 파일
1. **src/app/diary/page.tsx** — daysWithEntries Set → dayEmotionMap Map으로 변경, 도트 색상 적용

### 구현 디테일
- `daysWithEntries: Set<number>` → `dayEmotionMap: Map<number, EmotionType>`
- 최빈 감정 계산: entries.filter → 감정별 count → max → 동률 시 마지막 entry
- 도트: `<div style={{ backgroundColor: EMOTION_COLORS[emotion] }} />`
