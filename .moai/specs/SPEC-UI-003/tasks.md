# SPEC-UI-003 Task Decomposition

## Metadata

- **SPEC ID**: SPEC-UI-003
- **Development Mode**: TDD (Brownfield Enhancement)
- **Total Tasks**: 5
- **Estimated LOC Change**: +130 / -110 (net ~20 increase)

---

## Dependency Graph

```
T-001 (RED: Card Tests Update)
  └── T-002 (GREEN: Card Simplification)
        └── T-005 (REFACTOR)

T-003 (RED: Insights Tab Tests)
  └── T-004 (GREEN: Insights Tab Implementation)
        └── T-005 (REFACTOR)
```

Two independent TDD cycles converge at REFACTOR:
- Cycle A (T-001 → T-002): Card simplification
- Cycle B (T-003 → T-004): Insights tab addition

---

## T-001: RED - EmotionReportCard 테스트 업데이트

**Phase**: TDD RED (Brownfield Enhancement)
**REQ Mapping**: REQ-UI-003-1, REQ-UI-003-2
**AC Mapping**: AC-001, AC-002, AC-003
**Dependencies**: None
**Priority**: High

### Description

기존 `EmotionReportCard.test.tsx`에서 개인화 인사이트(topEmotions, streak, patternChange) 렌더링 관련 테스트를 업데이트한다. 간소화 후에는 해당 요소가 렌더링되지 않아야 하므로, 기존 "렌더링 확인" 테스트를 "렌더링되지 않음" 테스트로 변경한다.

### Target Files

- `src/components/visualization/__tests__/EmotionReportCard.test.tsx` (수정)

### Acceptance Criteria

- [ ] topEmotions 렌더링 테스트가 "표시되지 않음"으로 변경됨
- [ ] streak 렌더링 테스트가 "표시되지 않음"으로 변경됨
- [ ] patternChange 렌더링 테스트가 "표시되지 않음"으로 변경됨
- [ ] 감정 페이스, summary, advice 렌더링 테스트는 유지됨
- [ ] 빈 데이터 상태 테스트 유지됨
- [ ] 테스트 실행 시 FAIL (아직 컴포넌트 변경 전)

### Verification

```bash
npx vitest run src/components/visualization/__tests__/EmotionReportCard.test.tsx
# Expected: FAIL (테스트가 먼저 실패해야 RED 상태)
```

---

## T-002: GREEN - EmotionReportCard 간소화

**Phase**: TDD GREEN
**REQ Mapping**: REQ-UI-003-1, REQ-UI-003-2, REQ-UI-003-3
**AC Mapping**: AC-001, AC-002, AC-003, AC-011
**Dependencies**: T-001
**Priority**: High

### Description

`EmotionReportCard.tsx`에서 개인화 인사이트 섹션(L106-183)을 제거한다. useEmotionInsights 훅 호출에서 topEmotions, streak, patternChange를 제거하고, 불필요한 여백을 축소하여 카드 높이를 최적화한다.

### Target Files

- `src/components/visualization/EmotionReportCard.tsx` (수정, ~80 LOC 감소 예상)

### Implementation Steps

1. `useEmotionInsights` 훅 import에서 `topEmotions`, `streak`, `patternChange` 제거
2. 개인화 인사이트 섹션 (topEmotions 순위, 스트릭, 패턴 변화) JSX 제거
3. 요약 레이어와 조언 레이어 사이 불필요한 `mb-4` 간격 축소
4. `hasData` 체크 로직을 summary 레이어에서만 사용하도록 정리

### Acceptance Criteria

- [ ] 카드에 EmotionFace, summary, advice만 표시됨
- [ ] topEmotions, streak, patternChange 섹션이 렌더링되지 않음
- [ ] 빈 데이터 시 기본 페이스와 안내 메시지 표시됨
- [ ] 카드 높이가 기존 대비 축소됨
- [ ] T-001 테스트가 모두 PASS 함

### Verification

```bash
npx vitest run src/components/visualization/__tests__/EmotionReportCard.test.tsx
# Expected: PASS
```

---

## T-003: RED - EmotionStatsBottomSheet 인사이트 탭 테스트 추가

**Phase**: TDD RED (Brownfield Enhancement)
**REQ Mapping**: REQ-UI-003-4, REQ-UI-003-5, REQ-UI-003-7, REQ-UI-003-9
**AC Mapping**: AC-004, AC-005, AC-006, AC-007, AC-013
**Dependencies**: None (T-001/T-002와 독립)
**Priority**: High

### Description

`EmotionStatsBottomSheet.test.tsx`에 인사이트 탭 관련 테스트를 추가한다. 탭 존재 확인, 탭 전환, 인사이트 콘텐츠 렌더링, 빈 데이터 상태, 접근성 속성을 검증하는 테스트를 작성한다.

### Target Files

- `src/components/visualization/__tests__/EmotionStatsBottomSheet.test.tsx` (수정, ~50 LOC 증가 예상)

### Test Cases to Add

1. 인사이트 탭 버튼이 3개 탭 네비게이션에 존재하는지 확인
2. 인사이트 탭 선택 시 상위 감정 순위(topEmotions)가 렌더링되는지 확인
3. 인사이트 탭 선택 시 스트릭(streak)이 렌더링되는지 확인
4. 인사이트 탭 선택 시 패턴 변화(patternChange)가 렌더링되는지 확인
5. 빈 데이터 시 안내 메시지가 표시되는지 확인
6. 트렌드 → 도넛 → 인사이트 탭 전환 시 콘텐츠가 교체되는지 확인
7. 탭 버튼에 `aria-pressed` 속성이 적용되는지 확인

### Acceptance Criteria

- [ ] 7개 테스트 케이스가 추가됨
- [ ] 모든 새 테스트가 FAIL (아직 인사이트 탭 구현 전)
- [ ] 기존 트렌드/도넛 탭 테스트는 영향 없음

### Verification

```bash
npx vitest run src/components/visualization/__tests__/EmotionStatsBottomSheet.test.tsx
# Expected: 기존 테스트 PASS, 새 테스트 FAIL
```

---

## T-004: GREEN - EmotionStatsBottomSheet 인사이트 탭 구현

**Phase**: TDD GREEN
**REQ Mapping**: REQ-UI-003-4, REQ-UI-003-5, REQ-UI-003-6, REQ-UI-003-7, REQ-UI-003-8, REQ-UI-003-9, REQ-UI-003-10
**AC Mapping**: AC-004, AC-005, AC-006, AC-007, AC-012, AC-013
**Dependencies**: T-003
**Priority**: High

### Description

`EmotionStatsBottomSheet.tsx`에 인사이트 탭을 추가하고, `useEmotionInsights` 훅을 호출하여 topEmotions, streak, patternChange 데이터를 표시한다. 기존 트렌드/도넛 탭과 동일한 스타일과 접근성 속성을 적용한다.

### Target Files

- `src/components/visualization/EmotionStatsBottomSheet.tsx` (수정, ~80 LOC 증가 예상)

### Implementation Steps

1. `chartTab` 타입을 `'trend' | 'donut' | 'insights'`로 확장
2. `useEmotionInsights` 훅 import 및 호출 추가
3. 인사이트 탭 버튼 추가 (기존 탭과 동일한 flex-1 스타일)
4. InsightsSection 인라인 렌더링:
   - 상위 감정 순위 (1~3위, 감정 라벨 + 백분율)
   - 스트릭 (연속 일수)
   - 패턴 변화 (트렌드 메시지)
5. 빈 데이터 상태 처리
6. `aria-pressed` 속성 및 `aria-label` 적용

### Acceptance Criteria

- [ ] 3개 탭(트렌드, 도넛, 인사이트)이 표시됨
- [ ] 인사이트 탭에 topEmotions, streak, patternChange가 표시됨
- [ ] 빈 데이터 시 안내 메시지 표시됨
- [ ] 탭 전환 시 콘텐츠가 정상 교체됨
- [ ] 기존 탭 스타일과 일관됨
- [ ] 접근성 속성(aria-pressed, aria-label) 적용됨
- [ ] T-003 테스트가 모두 PASS 함

### Verification

```bash
npx vitest run src/components/visualization/__tests__/EmotionStatsBottomSheet.test.tsx
# Expected: PASS
```

---

## T-005: REFACTOR - 코드 정리 및 품질 검증

**Phase**: TDD REFACTOR
**REQ Mapping**: REQ-UI-003-1 ~ REQ-UI-003-10 (전체 검증)
**AC Mapping**: AC-008, AC-009, AC-010, AC-011, AC-012, AC-013
**Dependencies**: T-002, T-004
**Priority**: Medium

### Description

T-001~T-004 구현 결과를 리팩토링하고 품질 검증을 수행한다. 전체 테스트 스위트 통과, TypeScript 컴파일 에러 0건, ESLint 에러 0건을 확인한다.

### Target Files

- `src/components/visualization/EmotionReportCard.tsx` (리뷰)
- `src/components/visualization/EmotionStatsBottomSheet.tsx` (리뷰)
- `src/components/visualization/__tests__/EmotionReportCard.test.tsx` (리뷰)
- `src/components/visualization/__tests__/EmotionStatsBottomSheet.test.tsx` (리뷰)

### Refactoring Checklist

1. 중복 코드 제거 (카드에서 제거한 렌더링 로직이 바텀시트에 동일하게 복사되었는지 확인)
2. 변수명 일관성 검토
3. 불필요한 import 제거
4. 주석 정리 (code_comments: ko 설정 준수)
5. @MX 태그 추가 (필요 시)

### Acceptance Criteria

- [ ] 전체 테스트 통과 (`vitest run`)
- [ ] TypeScript 컴파일 에러 0건
- [ ] ESLint 에러 0건
- [ ] 불필요한 코드/import 제거됨
- [ ] 카드 높이 축소 확인 (시각적 검증)
- [ ] 인사이트 탭 디자인 일관성 확인

### Verification

```bash
npx vitest run
npx tsc --noEmit
npx eslint src/components/visualization/
```
