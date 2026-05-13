---
id: SPEC-UI-003
version: 1.0.0
status: Planned
created: 2026-05-13
updated: 2026-05-13
author: manager-spec
priority: Medium
issue_number: null
---

# SPEC-UI-003: 감정 리포트 간소화 및 인사이트 바텀시트 통합

## HISTORY

- 2026-05-13: v1.0.0 초기 SPEC 작성. 어노테이션 Round 1에서 EARS 형식 보완, 3-파일 구조 적용, 데이터 흐름 및 접근성 요구사항 추가.

---

## 1. Overview

### 1.1 Purpose

감정 리포트 카드(EmotionReportCard)의 복잡성을 줄여 핵심 감정 메시지에 집중하고, 제거되는 개인화 인사이트 정보를 바텀시트(EmotionStatsBottomSheet)의 새로운 탭으로 이동하여 정보 접근성을 유지한다.

### 1.2 Background

사용자 피드백: "감정 리포트에 너무 복잡한 게 많이 나와서 제대로 감정이 잘 안 느껴져"

현재 `EmotionReportCard`는 요약 + 개인화 인사이트(상위 감정, 스트릭, 패턴 변화) + 조언의 3단계 구조이다. 개인화 인사이트 섹션이 카드를 길게 만들어 한눈에 감정을 느끼기 어렵다. 이 정보를 바텀시트 인사이트 탭으로 이동시키면 카드는 간결해지고, 상세 분석은 탭 전환으로 접근 가능하다.

### 1.3 Brand Identity

브랜드 철학 "스트레스는 귀여움으로 녹는다"를 준수한다. 간소화된 카드는 감정을 직관적으로 전달하고, 인사이트 탭은 부드러운 전환과 감정별 색상으로 일관된 경험을 제공한다.

---

## 2. Requirements (EARS)

### 2.1 EmotionReportCard 간소화

#### REQ-UI-003-1: 카드 표시 요소 제한

**The system shall** 홈 화면의 감정 리포트 카드에 다음 요소만 표시한다:

- 감정 페이스 (EmotionFace)
- summary 메시지 (`currentInsight.summary`)
- 조언 메시지 (`currentInsight.advice`)

#### REQ-UI-003-2: 카드 요소 제거

**The system shall** 감정 리포트 카드에서 다음 요소를 제거한다:

- 상위 감정 순위 (`topEmotions`)
- 스트릭 (`streak`)
- 패턴 변화 (`patternChange`)

#### REQ-UI-003-3: 카드 높이 최적화

**When** 개인화 인사이트 섹션이 제거되면, **the system shall** 감정 리포트 카드의 높이를 최적화하여 홈 화면의 세로 공간을 확보한다.

- 불필요한 여백 제거
- 요약 레이어와 조언 레이어 사이 간격 축소

### 2.2 EmotionStatsBottomSheet 인사이트 탭

#### REQ-UI-003-4: 인사이트 탭 추가

**The system shall** 감정 통계 바텀시트에 "인사이트" 탭을 추가하여, 기존 "트렌드" 및 "도넛" 탭과 함께 3개의 탭 네비게이션을 제공한다.

#### REQ-UI-003-5: 인사이트 탭 내용

**When** 사용자가 인사이트 탭을 선택하면, **the system shall** 다음 정보를 표시한다:

- 상위 감정 순위 (1~3위, 감정별 라벨 + 백분율)
- 스트릭 (연속 일기 작성 일수)
- 패턴 변화 (감정 트렌드 방향 + 메시지)

#### REQ-UI-003-6: 인사이트 데이터 흐름

**The system shall** `useEmotionInsights` 훅을 `EmotionStatsBottomSheet`에서 직접 호출하여 `topEmotions`, `streak`, `patternChange` 데이터를 인사이트 탭에 제공한다.

#### REQ-UI-003-7: 인사이트 탭 빈 데이터

**When** 감정 데이터가 없을 때, **the system shall** 인사이트 탭에 빈 데이터 안내 메시지를 표시한다.

### 2.3 UI/UX 및 접근성

#### REQ-UI-003-8: 디자인 일관성

**The system shall** 인사이트 탭의 디자인을 기존 바텀시트 탭(트렌드, 도넛)과 일관되게 유지한다:

- 감정별 색상, 아이콘, 폰트 스타일 유지
- 기존 탭 버튼 스타일 적용

#### REQ-UI-003-9: 탭 접근성

**The system shall** 인사이트 탭에 대한 접근성을 보장한다:

- 탭 버튼에 `aria-pressed` 속성 적용
- 인사이트 콘텐츠에 적절한 `aria-label` 적용
- 탭 전환 시 포커스 관리

#### REQ-UI-003-10: 탭 전환 애니메이션

**When** 사용자가 탭을 전환하면, **the system shall** 기존 탭 전환 애니메이션 패턴을 따라 부드럽게 콘텐츠를 교체한다.

---

## 3. Related SPECs

- **SPEC-UI-002**: 바텀시트 모달 기반 구조 (이 SPEC의 기반이 되는 아키텍처)
- **SPEC-UI-001**: 3단계 시각적 계층 (요약/시각화/인사이트) 정의
- **SPEC-VIS-001**: 감정 분포 시각화 요구사항

---

## 4. Exclusions (What NOT to Build)

- 새로운 데이터 분석 로직이나 계산 추가하지 않음 (기존 `useEmotionInsights` 훅 재사용)
- 인사이트 탭 내 인터랙티브 차트나 드릴다운 기능 추가하지 않음 (표시 전용)
- 감정 리포트 카드의 완전한 재설계하지 않음 (간소화만 수행)
- 바텀시트 자체의 구조(백드롭, 드래그 핸들, 슬라이드 애니메이션) 변경하지 않음
- `useEmotionInsights` 훅의 로직 변경하지 않음
