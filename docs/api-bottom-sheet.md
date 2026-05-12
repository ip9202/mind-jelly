# 감정 통계 바텀시트 API 문서

## EmotionStatsBottomSheet 컴포넌트

감정 통계 차트(WeeklyTrendChart, EmotionDonutChart)를 표시하는 바텀시트 모달 컴포넌트입니다.

### Import

```typescript
import { EmotionStatsBottomSheet } from '@/components/visualization';
```

### Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `isOpen` | `boolean` | ✅ | 바텀시트 열림 상태 |
| `onClose` | `() => void` | ✅ | 바텀시트 닫기 핸들러 |
| `triggerRef` | `RefObject<HTMLButtonElement \| null>` | ✅ | 트리거 버튼 ref (포커스 복원용) |

### 사용 예시

```typescript
'use client';

import { useRef, useState } from 'react';
import { EmotionStatsBottomSheet } from '@/components/visualization';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        aria-label="감정 통계 보기"
      >
        감정 통계 보기
      </button>

      <EmotionStatsBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      />
    </>
  );
}
```

### 기능

#### 열기/닫기 메서드

바텀시트는 다음 5가지 방법으로 닫을 수 있습니다:

1. **백드롭 탭**: 바텀시트 외부 영역(반투명 오버레이)을 탭
2. **스와이프 다운**: 상단 드래그 핸들을 아래로 스와이프 (최소 50px)
3. **ESC 키**: 키보드 ESC 키 입력
4. **X 버튼**: 우측 상단 닫기 버튼 탭
5. **CTA 토글**: "감정 통계 보기" 버튼 다시 탭

#### 접근성 기능

- **포커스 트랩**: Tab 키가 바텀시트 내부에서만 순환
- **포커스 복원**: 닫을 때 트리거 버튼으로 포커스 반환
- **키보드 네비게이션**: ESC 키로 닫기 지원
- **ARIA 속성**: `role="dialog"`, `aria-modal="true"`, `aria-label="감정 통계"`
- **스크린 리더**: 백드롭에 `aria-hidden="true"` 적용

#### 애니메이션

- **열기**: 하단에서 위로 슬라이드업 (300ms, ease-out)
- **닫기**: 위에서 아래로 슬라이드다운 (250ms, ease-in)
- **백드롭**: 페이드인/페이드아웃
- **모션 감소**: `prefers-reduced-motion` 설정 시 애니메이션 비활성화

### 내부 컴포넌트

바텀시트 내부에는 다음 차트 컴포넌트들이 포함됩니다:

- **WeeklyTrendChart**: 주간 감정 트렌드 라인 차트
- **EmotionDonutChart**: 감정 분포 도넛 차트
- **EmotionDetailPanel**: 감정 상세 정보 슬라이드업 패널 (선택적)

### UI 제약사항

| 속성 | 값 |
|------|-----|
| 최대 높이 | 뷰포트의 85% |
| 최소 높이 | 뷰포트의 60% |
| 드래그 핸들 크기 | 36px x 4px |
| 드래그 핸들 색상 | `bg-gray-300` |
| 백드롭 투명도 | 40% (`bg-black/40`) |
| 백드롭 z-index | `z-40` |
| 바텀시트 z-index | `z-50` |

### EmotionInput 바텀시트와의 충돌 방지

```typescript
// 감정 입력 중에는 통계 바텀시트 열기 방지
if (uiState === 'idle') {
  // "감정 통계 보기" 버튼 활성화
} else {
  // 버튼 비활성화 (input, restoring, beads, report 상태)
}
```

## 듀얼 CTA 레이아웃

홈 화면의 듀얼 CTA 레이아웃은 다음과 같이 구성됩니다:

```typescript
<div className="flex gap-3">
  {/* 좌측: 감정 표현하기 */}
  <button className="flex-1 bg-gradient-to-r from-pink-300 to-pink-200 ...">
    감정 표현하기
  </button>

  {/* 우측: 감정 통계 보기 */}
  <button
    className="flex-1 bg-transparent border border-accent text-accent ..."
    onClick={() => setStatsOpen(true)}
    disabled={uiState !== 'idle'}
  >
    <BarChart3 className="w-5 h-5" />
    감정 통계 보기
  </button>
</div>
```

### CTA 버튼 스타일

| 버튼 | 배경 | 테두리 | 텍스트 색상 | 아이콘 |
|------|------|--------|-------------|-------|
| 감정 표현하기 | 핑크 그라데이션 | 없음 | 흰색 | 없음 |
| 감정 통계 보기 | 투명 | 보더 | 액센트 색상 | BarChart3 |

## EmotionReportCard 변경사항

SPEC-UI-002로 인해 `EmotionReportCard` 컴포넌트가 변경되었습니다:

### 제거된 기능

- ✗ 인라인 차트 렌더링 (2단계 시각화 레이어)
- ✗ WeeklyTrendChart와 EmotionDonutChart의 인라인 표시

### 유지된 기능

- ✓ 요약 레이어 (1단계): 오늘의 감정 요약
- ✓ 인사이트 레이어 (3단계): 감정 패턴 분석
- ✓ 차트 데이터 로딩 (`useEmotionChartData` 훅)
- ✓ 빈 데이터 상태 메시지

### 데이터 흐름

```
EmotionReportCard
  ├── useEmotionChartData() { distribution, weeklyData }
  │   └── 데이터를 바텀시트로 props 전달
  │
  ├── 요약 레이어 (1단계) ← 인라인 렌더링
  │   └── 오늘의 감정 요약
  │
  ├── 인사이트 레이어 (3단계) ← 인라인 렌더링
  │   └── 감정 패턴 분석
  │
  └── "감정 통계 보기" 버튼
      └── EmotionStatsBottomSheet 오픈
          ├── WeeklyTrendChart ← 바텀시트 내부
          └── EmotionDonutChart ← 바텀시트 내부
```

## 테스트 커버리지

### 테스트 파일

- `src/components/visualization/__tests__/EmotionStatsBottomSheet.test.tsx`
- `src/components/visualization/__tests__/EmotionReportCard.spec-ui-002.test.tsx`

### 커버리지

- **EmotionStatsBottomSheet**: 96%
- **EmotionReportCard (SPEC-UI-002 변경사항)**: 94%
- **전체 테스트**: 33개 테스트 통과

### 테스트 항목

1. **렌더링 테스트**: 바텀시트가 올바르게 렌더링되는지 확인
2. **열기/닫기 테스트**: 5가지 닫기 방법 모두 검증
3. **접근성 테스트**: ARIA 속성, 포커스 트랩, 포커스 복원
4. **터치 제스처 테스트**: 스와이프 다운 동작
5. **키보드 네비게이션 테스트**: ESC 키, Tab 키
6. **애니메이션 테스트**: 슬라이드 업/다운, 백드롭 페이드
7. **충돌 방지 테스트**: EmotionInput 바텀시트와의 상호작용

## 성능 최적화

### 코드 분할

```typescript
// Recharts 동적 임포트 (ssr: false)
const WeeklyTrendChart = dynamic(
  () => import('./WeeklyTrendChart').then((mod) => mod.WeeklyTrendChart),
  { ssr: false }
);

const EmotionDonutChart = dynamic(
  () => import('./EmotionDonutChart').then((mod) => mod.EmotionDonutChart),
  { ssr: false }
);
```

### 조건부 렌더링

```typescript
// 바텀시트가 닫혀 있을 때 차트 렌더링 안 함
{isOpen && (
  <WeeklyTrendChart data={weeklyData} />
)}
```

### 애니메이션 성능

- CSS `transform` 사용 (GPU 가속)
- 60fps 유지
- `will-change` 속성으로 브라우저 최적화

## 브라우저 호환성

| 브라우저 | 지원 여부 | 비고 |
|----------|----------|------|
| iOS Safari 12+ | ✅ | 터치 제스처 지원 |
| Chrome Android | ✅ | 터치 제스처 지원 |
| Chrome Desktop | ✅ | 키보드 네비게이션 지원 |
| Safari Desktop | ✅ | 키보드 네비게이션 지원 |
| Firefox | ✅ | 키보드 네비게이션 지원 |

## 관련 SPEC

| SPEC ID | 설명 |
|---------|------|
| SPEC-UI-002 | 감정 통계 바텀시트 UX 개선 |
| SPEC-UI-001 | 감정 리포트 시각화 기능 (선행) |
| SPEC-TOUCH-001 | 젤리 터치 반응 패턴 (참고) |
| SPEC-DIARY-001 | 일기 상세 바텀시트 패턴 (참고) |

## 변경 이력

| 버전 | 날짜 | 변경사항 |
|------|------|---------|
| 1.0.0 | 2026-05-12 | SPEC-UI-002 구현 완료 |
