---
id: SPEC-UI-001
version: 1.0.0
status: Planned
created: 2026-05-12
updated: 2026-05-12
author: manager-spec
priority: High
---

# SPEC-UI-001 구현 계획

## 구현 접근법

기존 `src/app/home/page.tsx`의 텍스트 전용 감정 리포트 카드(415-465행)를 데이터 시각화 중심의 인터랙티브 리포트로 확장한다. 점진적 개선 접근법으로 기존 기능을 보존하면서 새로운 시각화 요소를 추가한다.

### 핵심 원칙

1. **기존 패턴 보존**: `glass-card`, `EMOTION_COLORS`, `font-gamja` 등 기존 디자인 시스템을 그대로 활용
2. **점진적 로딩**: Recharts를 동적 import하여 초기 로딩 성능 보존
3. **데이터 없는 상태 우선**: 감정 데이터가 없을 때의 기본 UI를 먼저 설계
4. **브랜드 일관성**: 모든 시각 요소가 "스트레스는 귀여움으로 녹는다" 철학을 반영

---

## 마일스톤

### M1: 기반 인프라 구축 (Priority: High)

**목표**: Recharts 라이브러리 통합 및 차트 컴포넌트 기반 구조 생성

- Recharts 패키지 설치 및 설정
- `src/components/visualization/` 디렉토리 구조 생성
- 차트 공통 스타일 유틸리티 작성 (감정 색상 매핑, 글래스 카드 래퍼)
- 차트 데이터 훅 (`useEmotionChartData`) 작성
- 감정 데이터 타입 정의

**산출물**:
- `src/components/visualization/ChartContainer.tsx`
- `src/components/visualization/chartTheme.ts`
- `src/hooks/useEmotionChartData.ts`
- `src/types/emotion-chart.ts`

### M2: 주간 감정 트렌드 차트 (Priority: High)

**목표**: REQ-VIS-001 구현 - 최근 7일 감정 변화 라인 차트

- `WeeklyTrendChart` 컴포넌트 구현
- 9개 감정 컬러 시스템과 Recharts 연동
- 요일별 X축, 빈도수 Y축 설정
- 데이터 없는 요일의 점선 처리
- draw-in 애니메이션 구현
- `prefers-reduced-motion` 대응

**산출물**:
- `src/components/visualization/WeeklyTrendChart.tsx`
- `src/components/visualization/__tests__/WeeklyTrendChart.test.tsx`

### M3: 감정 분포 도넛 차트 (Priority: High)

**목표**: REQ-VIS-002 구현 - 감정 비율 도넛 차트

- `EmotionDistributionChart` 컴포넌트 구현
- 중앙 주 감정 아이콘 + 퍼센트 표시
- 섹터 클릭/터치 인터랙션
- 5% 미만 감정 "기타" 통합 로직
- 툴팁 컴포넌트 구현
- reveal 애니메이션 구현

**산출물**:
- `src/components/visualization/EmotionDistributionChart.tsx`
- `src/components/visualization/EmotionTooltip.tsx`
- `src/components/visualization/__tests__/EmotionDistributionChart.test.tsx`

### M4: 시각적 계층 및 레이아웃 (Priority: Medium)

**목표**: REQ-VIS-003, REQ-VIS-009 구현 - 3단계 계층 구조 레이아웃

- `EmotionReportCard` 통합 컴포넌트 구현
- 요약/시각화/인사이트 3단계 레이아웃
- 기존 `currentTheme.message` 및 `currentTheme.advice` 패턴 유지
- 모바일 세로 스택 / 태블릿 2열 반응형 레이아웃
- `max-w-md` 제약 유지
- 스켈레톤 로딩 상태 (SPEC-SKELETON-001 패턴 참고)

**산출물**:
- `src/components/visualization/EmotionReportCard.tsx`
- `src/components/visualization/EmotionReportSkeleton.tsx`

### M5: 인터랙티브 요소 및 애니메이션 (Priority: Medium)

**목표**: REQ-VIS-004, REQ-VIS-005 구현 - 인터랙티브 차트 요소

- 데이터 포인트 호버/터치 툴팁
- 도넛 차트 섹터 클릭 상세 패널
- 주간/월간 스와이프 전환
- 차트 애니메이션 시퀀스 (fade-in, draw-in, reveal)
- `prefers-reduced-motion` 전체 대응
- 키보드 네비게이션 지원

**산출물**:
- `src/components/visualization/EmotionDetailPanel.tsx`
- `src/components/visualization/ChartAnimations.ts`

### M6: 개인화 및 인사이트 (Priority: Low)

**목표**: REQ-VIS-006 구현 - 개인화된 감정 인사이트

- 감정 순위 계산 로직 (상위 3개)
- 감정 패턴 변화 감지 알고리즘
- 연속 정화 일수 스트릭 계산
- 개인화 메시지 템플릿 (브랜드 보이스 준수)
- 빈 데이터 상태의 격려 메시지

**산출물**:
- `src/hooks/useEmotionInsights.ts`
- `src/lib/emotion-insights.ts`

### M7: 홈 페이지 통합 및 최종 검증 (Priority: High)

**목표**: 모든 컴포넌트를 홈 페이지에 통합하고 최종 검증

- `page.tsx` 감정 리포트 영역 교체
- 기존 `uiState` 상태 머신과 통합
- `EMOTION_COLORS` 동적 색상 전환 유지
- 접근성 최종 검증 (WCAG 2.1 AA)
- 다크 모드 동작 확인
- 성능 측정 (번들 사이즈, 렌더링 시간)
- 토스 미니앱 WebView 테스트

**산출물**:
- 수정된 `src/app/home/page.tsx`
- `src/components/visualization/index.ts` (barrel export)

---

## 기술 접근법

### 차트 라이브러리 선택: Recharts

**선택 이유**:
- React 컴포넌트 기반으로 기존 코드베이스와 자연스러운 통합
- 선언적 API로 유지보수성 우수
- 번들 사이즈 합리적 (~45KB gzip)
- 커스텀 테마 및 애니메이션 지원
- TypeScript 타입 정의 제공

### 컴포넌트 아키텍처

```
EmotionReportCard (통합 컴포넌트)
  ├── EmotionReportSkeleton (로딩 상태)
  ├── 요약 레이어 (기존 currentTheme.message)
  ├── 시각화 레이어
  │   ├── ChartContainer (glass-card 래퍼)
  │   │   ├── WeeklyTrendChart (라인 차트)
  │   │   └── EmotionDistributionChart (도넛 차트)
  │   └── EmotionDetailPanel (상세 패널)
  └── 인사이트 레이어 (기존 currentTheme.advice)
```

### 데이터 흐름

```
useEmotionChartData 훅
  ├── 로컬 스토리지에서 감정 기록 로드
  ├── 7일/30일 단위 데이터 집계
  ├── 감정별 빈도수 및 비율 계산
  └── 캐싱 및 최적화
      ↓
EmotionReportCard
  ├── WeeklyTrendChart (주간 트렌드 데이터)
  ├── EmotionDistributionChart (분포 데이터)
  └── useEmotionInsights (개인화 인사이트)
```

### 성능 전략

- Recharts 컴포넌트 `next/dynamic`으로 지연 로딩
- `React.memo`로 차트 컴포넌트 메모이제이션
- 감정 데이터 변경 시에만 차트 재렌더링
- 애니메이션 `requestAnimationFrame` 기반 최적화

---

## 리스크 및 대응

### 리스크 1: Recharts 번들 사이즈

- **영향**: 초기 페이지 로딩 지연 가능성
- **대응**: `next/dynamic` 동적 import, 차트 컴포넌트가 뷰포트에 진입할 때만 로딩
- **완화 기준**: Lighthouse Performance 점수 85점 이상 유지

### 리스크 2: 토스 미니앱 WebView 호환성

- **영향**: 구버전 WebView에서 SVG/Canvas 렌더링 문제 가능성
- **대응**: Recharts SVG 렌더링 모드 우선 사용, Canvas 폴백 준비
- **완화 기준**: 주요 안드로이드/iOS WebView 환경에서 정상 렌더링

### 리스크 3: 감정 데이터 부재 상태

- **영향**: 신규 사용자에게 빈 차트 표시로 인한 부정적 경험
- **대응**: 빈 데이터 상태 전용 격려 메시지 + 가이드 UI
- **완화 기준**: 데이터 없는 상태에서도 시각적으로 완성된 UI

### 리스크 4: 기존 UI 회귀

- **영향**: 리포트 개선으로 인해 기존 동작(상태 머신, 색상 전환) 파손
- **대응**: 기존 `uiState` 흐름 보존, 시각적 회귀 테스트 추가
- **완화 기준**: 기존 acceptance 시나리오 100% 통과

---

## 의존성

### 외부 의존성

- `recharts` (^2.x): 차트 렌더링 라이브러리 (신규 추가)

### 내부 의존성

- `src/lib/constants/emotion.ts`: EMOTION_COLORS, EMOTION_UI 상수
- `src/app/globals.css`: 디자인 토큰, 애니메이션 정의
- `src/app/home/page.tsx`: 홈 페이지 메인 컴포넌트 (수정 대상)
- 기존 다이어리 페이지 차트 패턴: `src/app/diary/page.tsx` 378-441행

### 플랫폼 제약

- Toss 미니앱 WebView 환경
- Next.js App Router 클라이언트 컴포넌트
- React 19 호환성
