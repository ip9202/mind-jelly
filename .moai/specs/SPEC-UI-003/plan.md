# SPEC-UI-003 Implementation Plan

## Metadata

- **SPEC ID**: SPEC-UI-003
- **Version**: 1.0.0
- **Complexity**: 3/10
- **Development Mode**: TDD (Brownfield Enhancement)

---

## 1. Implementation Milestones

### Milestone 1: EmotionReportCard 간소화 (Priority: High)

**목표**: 개인화 인사이트 섹션 제거로 카드 간소화

**변경 사항**:
- `EmotionReportCard.tsx`에서 REQ-VIS-006 개인화 인사이트 섹션(L106-183) 제거
- `useEmotionInsights` 훅 import에서 `topEmotions`, `patternChange`, `streak` 제거
- 제거 후 카드 내 여백 최적화 (불필요한 `mb-4` 간격 축소)
- 빈 데이터 상태 유지 (hasData 체크 로직은 요약 레이어에서만 사용)

**검증**:
- 카드에 감정 페이스, summary, advice만 표시
- 기촌 카드 관련 테스트 업데이트
- 홈 화면에서 카드 높이 축소 확인

### Milestone 2: EmotionStatsBottomSheet 인사이트 탭 추가 (Priority: High)

**목표**: 바텀시트에 인사이트 탭 추가 및 개인화 인사이트 콘텐츠 이동

**변경 사항**:
- `EmotionStatsBottomSheet.tsx`의 `chartTab` 타입을 `'trend' | 'donut'`에서 `'trend' | 'donut' | 'insights'`로 확장
- `useEmotionInsights` 훅 import 추가
- 인사이트 탭 버튼 추가 (기존 트렌드/도넛 버튼과 동일한 스타일)
- 인사이트 탭 콘텐츠 컴포넌트 작성 (InsightsTab):
  - 상위 감정 순위 (기존 EmotionReportCard의 topEmotions 렌더링 로직 이동)
  - 스트릭 (기존 streak 렌더링 로직 이동)
  - 패턴 변화 (기존 patternChange 렌더링 로직 이동)
- 빈 데이터 상태 처리

**검증**:
- 3개 탭 전환 정상 동작
- 인사이트 탭에 기존 정보가 동일하게 표시
- 빈 데이터 시 안내 메시지 표시
- 접근성 속성(aria-pressed, aria-label) 적용

---

## 2. Technical Approach

### 2.1 Files to Modify

| File | Change | LOC (est.) |
|------|--------|------------|
| `src/components/visualization/EmotionReportCard.tsx` | 개인화 인사이트 섹션 제거, useEmotionInsights 호출 간소화 | ~80 LOC 감소 |
| `src/components/visualization/EmotionStatsBottomSheet.tsx` | 인사이트 탭 추가, useEmotionInsights import | ~80 LOC 증가 |
| `src/components/visualization/__tests__/EmotionReportCard.test.tsx` | 인사이트 관련 테스트 제거/수정 | ~30 LOC 변경 |
| `src/components/visualization/__tests__/EmotionStatsBottomSheet.test.tsx` | 인사이트 탭 테스트 추가 | ~50 LOC 증가 |

### 2.2 Component Structure

**Before (EmotionReportCard):**
```
EmotionReportCard
├── 요약 레이어 (EmotionFace + summary)
├── 개인화 인사이트 섹션 (topEmotions, streak, patternChange)  ← 제거
├── 빈 데이터 안내
└── 조언 레이어 (advice)
```

**After (EmotionReportCard):**
```
EmotionReportCard
├── 요약 레이어 (EmotionFace + summary)
├── 빈 데이터 안내
└── 조언 레이어 (advice)
```

**After (EmotionStatsBottomSheet):**
```
EmotionStatsBottomSheet
├── Tab Navigation (3개)
│   ├── 트렌드 탭 (WeeklyTrendChart)
│   ├── 도넛 탭 (EmotionDonutChart)
│   └── 인사이트 탭 (InsightsSection)  ← 신규
└── InsightsSection (인라인, 별도 컴포넌트 분리 불필요)
    ├── 상위 감정 순위
    ├── 스트릭
    └── 패턴 변화
```

### 2.3 Key Decisions

1. **InsightsSection을 별도 컴포넌트로 분리하지 않음**: 로직이 단순하고 BottomSheet 내부에 인라인으로 렌더링하는 것이 파일 수를 줄임
2. **useEmotionInsights를 BottomSheet에서 직접 호출**: prop drilling 없이 훅 재사용
3. **기존 렌더링 로직 그대로 이동**: 스타일, 아이콘, 색상은 EmotionReportCard에서 그대로 복사

### 2.4 Dependencies

- `useEmotionInsights` 훅 (기존, 변경 없음)
- `EMOTION_COLORS`, `EMOTION_THEME`, `UI_COLORS` 상수 (기존, 변경 없음)

---

## 3. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 카드에서 제거한 정보를 사용자가 바텀시트에서 찾지 못함 | Low | Medium | 인사이트 탭 아이콘 직관적 유지 |
| 탭이 3개로 늘어나 모바일에서 답답해 보임 | Low | Low | 기존 2개 탭과 동일한 flex-1 스타일 유지 |
| 기존 테스트 업데이트 누락 | Medium | Medium | TDD 사이클로 먼저 테스트 수정 |
