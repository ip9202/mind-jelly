# SPEC-UI-002: Implementation Plan

## 개요

홈 화면 감정 리포트 차트를 인라인에서 바텀시트 모달로 분리하고, 듀얼 CTA 레이아웃을 도입하는 구현 계획.

---

## 마일스톤

### Milestone 1: EmotionStatsSheet 컴포넌트 생성 (Priority High)

신규 바텀시트 모달 컴포넌트를 생성한다.

**대상 파일**:
- `src/components/visualization/EmotionStatsSheet.tsx` (신규)

**작업 내용**:
- 바텀시트 모달 컴포넌트 구현
- 백드롭 오버레이 포함
- 슬라이드 업/다운 애니메이션 적용
- 드래그 핸들 UI
- ESC 키 및 백드롭 탭 닫기 처리
- 접근성 속성 (role, aria-modal, aria-label, focus trap)
- `prefers-reduced-motion` 대응

**의존성**: 없음

### Milestone 2: EmotionReportCard에서 차트 분리 (Priority High)

기존 EmotionReportCard에서 2단계 시각화 레이어를 제거한다.

**대상 파일**:
- `src/components/visualization/EmotionReportCard.tsx` (수정)

**작업 내용**:
- 인라인 차트 렌더링(WeeklyTrendChart, EmotionDonutChart) 제거
- EmotionReportCard props에 `onViewStats` 콜백 추가 (바텀시트 열기 트리거)
- 차트 관련 state(`selectedEmotion`)를 EmotionStatsSheet로 이동 또는 공유
- 요약 레이어(1단계)와 인사이트 레이어(3단계)는 유지
- 빈 데이터 상태 메시지 유지

**의존성**: Milestone 1 (EmotionStatsSheet 인터페이스 필요)

### Milestone 3: 홈 페이지 듀얼 CTA + 바텀시트 통합 (Priority High)

홈 페이지에 듀얼 CTA 레이아웃과 바텀시트를 통합한다.

**대상 파일**:
- `src/app/home/page.tsx` (수정)

**작업 내용**:
- `showStatsSheet` 상태 추가 (boolean)
- 기존 단일 CTA를 듀얼 CTA 레이아웃으로 변경
  - 좌측: "감정 표현하기" (기존)
  - 우측: "감정 통계 보기" (신규)
- EmotionStatsSheet 컴포넌트 동적 임포트 및 렌더링
- uiState에 따른 버튼 활성화/비활성화 로직
- 바텀시트 열린 상태에서 "감정 표현하기" 클릭 시 바텀시트 닫기 처리
- EmotionInput 바텀시트와의 충돌 방지 로직

**의존성**: Milestone 1, Milestone 2

### Milestone 4: 테스트 작성 (Priority High)

모든 신규 및 변경 컴포넌트에 대한 테스트를 작성한다.

**대상 파일**:
- `src/components/visualization/__tests__/EmotionStatsSheet.test.tsx` (신규)
- `src/components/visualization/__tests__/EmotionReportCard.test.tsx` (수정)
- `src/app/home/__tests__/page.test.tsx` (수정, 기존 테스트 있는 경우)

**작업 내용**:
- EmotionStatsSheet 렌더링 테스트
- 바텀시트 열기/닫기 인터랙션 테스트
- 백드롭 탭 닫기 테스트
- ESC 키 닫기 테스트
- 듀얼 CTA 버튼 가시성 및 활성화 상태 테스트
- 접근성 속성 테스트 (aria-modal, role, aria-label)
- EmotionReportCard에서 차트 미렌더링 확인 테스트
- uiState별 버튼 활성화/비활성화 테스트

**의존성**: Milestone 3

---

## 기술 접근법

### 컴포넌트 구조

```
HomePage
├── EmotionReportCard (inline - 요약 + 인사이트만)
├── Dual CTA Buttons
│   ├── "감정 표현하기" (기존)
│   └── "감정 통계 보기" (신규)
└── EmotionStatsSheet (바텀시트 모달)
    ├── Backdrop (bg-black/40)
    ├── Drag Handle
    ├── WeeklyTrendChart
    ├── EmotionDonutChart
    └── EmotionDetailPanel (z-50 overlay)
```

### 상태 관리

```
HomePage 컴포넌트:
├── uiState: 'idle' | 'input' | 'restoring' | 'beads' | 'report' (기존)
└── showStatsSheet: boolean (신규)
    ├── true: 바텀시트 열림, 백드롭 표시
    └── false: 바텀시트 닫힘
```

### EmotionStatsSheet Props 인터페이스

```typescript
interface EmotionStatsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmotion: EmotionType | null;
  onEmotionSelect: (emotion: EmotionType | null) => void;
}
```

### 애니메이션 전략

- 기존 `animate-slide-up` CSS 클래스 재사용
- 닫기 애니메이션을 위한 `animate-slide-down` 클래스 추가 (또는 transform/transition 조합)
- `prefers-reduced-motion` 대응을 위해 Tailwind `motion-reduce:transition-none motion-reduce:animate-none` 활용
- 백드롭 페이드인/아웃: `transition-opacity duration-300`

### 바텀시트 패턴 참고

기존 EmotionInput 바텀시트 패턴 (home/page.tsx 468-477행):
- `fixed` 포지셔닝
- `animate-slide-up` CSS 클래스
- `z-40` 레이어
- `max-w-md` 제약

EmotionStatsSheet는 동일한 패턴을 따르되:
- 차트 포함으로 인해 더 큰 높이 필요 (`max-h-[85vh]`)
- 백드롭 오버레이 추가 필요
- 드래그 핸들 추가 필요

---

## 위험 요소

| 위험 | 영향 | 완화 전략 |
|------|------|-----------|
| 바텀시트와 EmotionInput 바텀시트 z-index 충돌 | 두 모달이 동시에 표시될 수 있음 | uiState 기반 조건부 렌더링으로 상호 배타적 보장 |
| Recharts 동적 임포트 지연으로 바텀시트 내 빈 공간 발생 | 사용자 경험 저하 | 로딩 스켈레톤 표시 (기존 loading 컴포넌트 재사용) |
| iOS Safari 백드롭 스크롤 버블링 | 바텀시트 배경이 스크롤될 수 있음 | `overscroll-behavior: contain` 적용 |
| 도넛 차트 섹터 클릭 + EmotionDetailPanel z-index | 바텀시트 내부에서 패널이 가려질 수 있음 | EmotionDetailPanel을 바텀시트 위 `z-50`으로 오버레이 |
| 키보드 트랩 구현 복잡도 | 접근성 기준 미달 | 간단한 Tab 순환 제한 로직으로 구현 (외부 라이브러리 도입 불필요) |

---

## 범위 외 (Exclusions)

- 기간 필터링 UI (7일/30일/전체)
- 중간 높이 스냅 포인트
- 바텀시트 내 추가 차트 타입
- 데스크톱 전용 모달 변형
- 새로운 Zustand store 생성
