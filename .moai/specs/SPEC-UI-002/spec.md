---
id: SPEC-UI-002
version: 1.0.0
status: Planned
created: 2026-05-12
updated: 2026-05-12
author: manager-spec
priority: High
issue_number: null
---

# SPEC-UI-002: 감정 통계 바텀시트 UX 개선

## HISTORY

- 2026-05-12: v1.0.0 초기 SPEC 작성. 홈 화면 감정 리포트 차트(WeeklyTrendChart, EmotionDonutChart)를 바텀시트 모달로 분리하여 모바일 세로 공간 최적화. 사용자 요구사항 기반 바텀시트 패턴 + 듀얼 CTA 레이아웃 정의.

---

## 1. 개요

마음 젤리 홈 화면의 감정 리포트 차트 영역을 인라인 렌더링에서 바텀시트 모달로 분리한다. WeeklyTrendChart와 EmotionDonutChart를 하단에서 슬라이드업되는 바텀시트 내부로 이동시키고, 기존 단일 CTA를 듀얼 CTA("감정 표현하기" + "감정 통계 보기")로 변경하여 한 화면 내 모든 주요 기능에 접근 가능하도록 개선한다.

### 배경

현재 `EmotionReportCard` 컴포넌트(`src/components/visualization/EmotionReportCard.tsx` 214-230행)는 WeeklyTrendChart와 EmotionDonutChart를 인라인 그리드로 렌더링한다. 모바일 화면에서 두 차트는 `grid-cols-1`에 의해 수직 스택으로 배치되어 상당한 세로 공간을 차지한다. 사용자 피드백에 따르면:

- 차트가 너무 길어 한 페이지에 모든 콘텐츠가 보이지 않음
- 스크롤이 매끄럽지 않음
- 차트 때문에 주요 인터랙션(감정 표현하기)이 화면 하단에 밀려 보이지 않음

SPEC-UI-001에서 구현한 3단계 시각적 계층(요약/시각화/인사이트) 중 1단계(요약)와 3단계(인사이트)는 인라인에 유지하고, 2단계(시각화)만 바텀시트로 분리한다.

### 브랜드 정체성

모든 UI 요소는 브랜드 철학 "스트레스는 귀여움으로 녹는다"를 준수한다. 바텀시트 인터랙션은 부드럽고 직관적이어야 하며, 감정 분석 용어 대신 힐링 용어를 사용한다.

---

## 2. 요구사항

### REQ-SHEET-001: 바텀시트 모달 컴포넌트

**The system shall** 감정 통계 차트를 표시하는 바텀시트 모달 컴포넌트를 제공한다.

- 바텀시트는 화면 하단에서 슬라이드업 방식으로 나타난다
- 바텀시트 내부에 WeeklyTrendChart와 EmotionDonutChart를 포함한다
- 바텀시트는 기존 `animate-slide-up` CSS 애니메이션 패턴을 따른다
- 바텀시트 배경은 `glass-card` 패턴(`bg-white/10 backdrop-blur-md border border-white/20`)을 따른다
- 바텀시트 상단에 드래그 핸들(가로 막대)을 표시하여 닫기 가능함을 시각적으로 안내한다

### REQ-SHEET-002: 바텀시트 열기/닫기 트리거

**When** 사용자가 "감정 통계 보기" CTA 버튼을 탭하면, **the system shall** 바텀시트를 열어 차트를 표시한다.

**When** 사용자가 다음 중 하나의 액션을 수행하면, **the system shall** 바텀시트를 닫는다:

- 바텀시트 외부(백드롭 영역)를 탭
- 바텀시트 상단 드래그 핸들을 아래로 스와이프
- ESC 키 입력(키보드 사용자)
- 바텀시트 내부 명시적 닫기 버튼(X 아이콘) 탭

### REQ-SHEET-003: 백드롭 오버레이

**While** 바텀시트가 열려 있는 동안, **the system shall** 반투명 백드롭 오버레이를 표시한다.

- 백드롭 색상: `bg-black/40`
- 백드롭 탭 시 바텀시트가 닫힌다
- 바텀시트 열림/닫힘 시 백드롭이 페이드인/페이드아웃된다
- 백드롭은 `z-40` 레이어에 위치한다

### REQ-SHEET-004: 듀얼 CTA 레이아웃

**The system shall** 기존 단일 "감정 표현하기" 버튼을 듀얼 CTA 레이아웃으로 변경한다.

- 두 CTA 버튼이 나란히 배치된다 (flex row)
- 좌측: "감정 표현하기" (기존 기능, 핑크 그라데이션 유지)
- 우측: "감정 통계 보기" (신규, 차트/그래프 아이콘 포함)
- "감정 통계 보기" 버튼은 차트 아이콘(`bar_chart`)과 텍스트를 포함한다
- "감정 통계 보기" 버튼 스타일: 투명 배경 + 보더 (`bg-transparent border border-accent text-accent`)
- 두 버튼은 모바일 화면에서 적절한 비율로 분할된다 (각각 flex-1)
- uiState가 'report'일 때 두 버튼 모두 비활성화된다

### REQ-SHEET-005: 인라인 차트 제거

**When** 바텀시트가 구현되면, **the system shall** `EmotionReportCard` 컴포넌트에서 인라인 차트 렌더링(2단계 시각화 레이어)을 제거한다.

- EmotionReportCard는 요약 레이어(1단계)와 인사이트 레이어(3단계)만 인라인 렌더링한다
- 차트 데이터 로딩(`useEmotionChartData`)은 EmotionReportCard에 유지하되, 바텀시트로 props 전달
- 빈 데이터 상태 메시지("아직 기록된 감정이 없어요")는 EmotionReportCard 인라인에 유지

### REQ-SHEET-006: 바텀시트 내 차트 렌더링

**When** 바텀시트가 열리면, **the system shall** WeeklyTrendChart와 EmotionDonutChart를 바텀시트 내부에 렌더링한다.

- 차트는 바텀시트 내에서 수직 스택으로 배치된다
- 각 차트는 바텀시트 너비에 맞게 반응형으로 조정된다
- 도넛 차트의 섹터 클릭 인터랙션(`onEmotionSelect`)은 바텀시트 내에서도 동작한다
- EmotionDetailPanel은 바텀시트 위에 `z-50`으로 오버레이된다
- 차트 동적 임포트(REQ-VIS-010)는 바텀시트 컴포넌트에서도 유지된다

### REQ-SHEET-007: 슬라이드 애니메이션

**When** 바텀시트가 열리거나 닫히면, **the system shall** 부드러운 슬라이드 애니메이션을 적용한다.

- 열기: 하단에서 위로 슬라이드업 (300ms, ease-out)
- 닫기: 위에서 아래로 슬라이드다운 (250ms, ease-in)
- 기존 `animate-slide-up` CSS 클래스를 재사용하거나 확장한다
- 바텀시트는 `max-h-[85vh]`를 초과하지 않으며 내부 콘텐츠는 스크롤 가능하다
- `prefers-reduced-motion` 미디어 쿼리 설정 시 애니메이션 없이 즉시 표시/숨김한다

### REQ-SHEET-008: 접근성

**The system shall** 바텀시트에 다음 접근성 기능을 제공한다.

- 바텀시트에 `role="dialog"` 및 `aria-modal="true"` 속성을 적용한다
- 바텀시트에 `aria-label="감정 통계"` 라벨을 제공한다
- 바텀시트가 열릴 때 포커스를 바텀시트 내부 첫 번째 포커서블 요소로 이동한다
- 바텀시트가 닫힐 때 포커스를 트리거 버튼("감정 통계 보기")으로 복원한다
- Tab 키 순환(trap)이 바텀시트 내부로 제한된다
- 백드롭에 `aria-hidden="true"`를 적용한다

### REQ-SHEET-009: EmotionInput 바텀시트와의 충돌 방지

**If** 감정 입력 바텀시트(uiState === 'input')가 활성화된 상태에서, **then** 감정 통계 바텀시트는 열리지 않는다.

- uiState가 'idle'일 때만 "감정 통계 보기" 버튼이 활성화된다
- uiState가 'input', 'restoring', 'beads', 'report'일 때는 버튼이 비활성화된다
- 감정 통계 바텀시트가 열린 상태에서 "감정 표현하기"를 누르면 통계 바텀시트가 먼저 닫히고 input 상태로 전환된다

---

## 3. 제약사항

### 기술 제약

- Recharts 라이브러리는 `window` 객체가 필요하므로 바텀시트 컴포넌트도 `ssr: false` 동적 임포트를 유지해야 한다
- 기존 EmotionInput 바텀시트 패턴(`fixed`, `animate-slide-up`)과 일관성 있게 구현한다
- Zustand store 기반 상태 관리를 유지한다 (새 전역 store 추가 불필요, 컴포넌트 내 useState로 충분)
- Tailwind CSS 유틸리티 클래스만 사용한다 (인라인 스타일 최소화)

### 성능 제약

- 바텀시트 내 차트는 이미 동적 임포트되어 있으므로 추가 최적화 불필요
- 바텀시트 열기/닫기 전환 시 60fps 유지 (CSS transform 기반 애니메이션)
- 바텀시트가 닫혀 있을 때 차트 컴포넌트는 렌더링되지 않는다 (조건부 렌더링)

### UI 제약

- 바텀시트 최대 높이: 뷰포트의 85%
- 바텀시트 최소 높이: 뷰포트의 60%
- 드래그 핸들 너비: 36px, 높이: 4px, 색상: `bg-gray-300`
- 백드롭 투명도: 40% (`bg-black/40`)

---

## 4. 비기능 요구사항

### 성능

- 바텀시트 열기 애니메이션: 300ms 이내 완료
- 바텀시트 닫기 애니메이션: 250ms 이내 완료
- 첫 차트 렌더링: 바텀시트 열림 후 500ms 이내 (동적 임포트 로딩 스피너 표시)

### 호환성

- iOS Safari, Chrome Android에서 터치 제스처 정상 동작
- 키보드 접근성: ESC, Tab 트랩 정상 동작
- 스크린 리더: 바텀시트 열림/닫힘 상태 안내

---

## 5. 관련 SPEC

| SPEC ID | 관계 | 설명 |
|---------|------|------|
| SPEC-UI-001 | 선행 | 감정 리포트 시각화 기반 구조. 본 SPEC은 UI-001의 인라인 차트를 바텀시트로 분리 |
| SPEC-TOUCH-001 | 참고 | 젤리 터치 반응 패턴. 바텀시트와 터치 이벤트 충돌 방지 참고 |
| SPEC-DIARY-001 | 참고 | 일기 상세 바텀시트 패턴 참고 가능 |

---

## 6. Exclusions (What NOT to Build)

- **새로운 차트 타입 추가**: 본 SPEC은 기존 WeeklyTrendChart와 EmotionDonutChart의 위치 변경만 다룬다. 새 차트 타입(예: 히트맵, 레이더 차트)은 포함하지 않는다.
- **데스크톱 전용 모달/다이얼로그**: 데스크톱 환경에서는 현재 그리드 레이아웃 유지. 본 SPEC은 모바일 UX에 집중한다.
- **바텀시트 내 데이터 필터링**: 기간 선택(7일/30일/전체) 기능은 포함하지 않는다. 향후 SPEC에서 다룬다.
- **바텀시트 드래그 리사이징**: 중간 높이 스냅 포인트나 자유 드래그 리사이징은 포함하지 않는다. 열기/닫기 두 상태만 지원한다.
- **차트 데이터 훅 변경**: `useEmotionChartData`, `useEmotionInsights` 훅의 로직은 변경하지 않는다.
- **서버 상태 관리 도입**: 바텀시트 상태 관리를 위해 새 Zustand store를 생성하지 않는다. React local state로 충분하다.
