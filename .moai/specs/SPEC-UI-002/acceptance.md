# SPEC-UI-002: Acceptance Criteria

## 인수 테스트 시나리오

---

### AC-001: 바텀시트 열기

**Given** 홈 페이지가 로드되고 uiState가 'idle' 상태이다
**When** 사용자가 "감정 통계 보기" 버튼을 탭한다
**Then** 바텀시트가 화면 하단에서 슬라이드업되어 나타난다
**And** 백드롭 오버레이(bg-black/40)가 페이드인된다
**And** 바텀시트 내부에 WeeklyTrendChart와 EmotionDonutChart가 렌더링된다
**And** 바텀시트 상단에 드래그 핸들이 표시된다

---

### AC-002: 백드롭 탭으로 바텀시트 닫기

**Given** 감정 통계 바텀시트가 열려 있다
**When** 사용자가 바텀시트 외부(백드롭 영역)를 탭한다
**Then** 바텀시트가 슬라이드다운 애니메이션과 함께 닫힌다
**And** 백드롭 오버레이가 페이드아웃된다
**And** 포커스가 "감정 통계 보기" 버튼으로 복원된다

---

### AC-003: 드래그 핸들 스와이프다운으로 닫기

**Given** 감정 통계 바텀시트가 열려 있다
**When** 사용자가 드래그 핸들을 아래 방향으로 스와이프한다 (최소 50px 이동)
**Then** 바텀시트가 슬라이드다운 애니메이션과 함께 닫힌다

---

### AC-004: ESC 키로 바텀시트 닫기

**Given** 감정 통계 바텀시트가 열려 있고 포커스가 바텀시트 내부에 있다
**When** 사용자가 ESC 키를 누른다
**Then** 바텀시트가 닫힌다
**And** 포커스가 "감정 통계 보기" 버튼으로 복원된다

---

### AC-005: 닫기 버튼으로 바텀시트 닫기

**Given** 감정 통계 바텀시트가 열려 있다
**When** 사용자가 바텀시트 상단 우측의 X 닫기 버튼을 탭한다
**Then** 바텀시트가 닫힌다

---

### AC-006: 듀얼 CTA 레이아웃

**Given** 홈 페이지가 로드되고 uiState가 'idle' 상태이다
**When** 화면 하단 CTA 영역을 확인한다
**Then** 두 개의 버튼이 나란히 표시된다
**And** 좌측 버튼에 "감정 표현하기" 텍스트와 edit_note 아이콘이 있다
**And** 우측 버튼에 "감정 통계 보기" 텍스트와 bar_chart 아이콘이 있다
**And** 두 버튼은 동일한 높이(h-14)를 가진다

---

### AC-007: CTA 버튼 상태 관리

**Given** 홈 페이지에서 uiState가 'report' 상태이다
**When** CTA 영역을 확인한다
**Then** 두 버튼 모두 비활성화(opacity-50, cursor-default) 상태이다

**Given** 홈 페이지에서 uiState가 'input' 상태이다
**When** CTA 영역을 확인한다
**Then** CTA 영역이 화면에 표시되지 않는다 (input 모드에서는 EmotionInput 바텀시트만 표시)

---

### AC-008: 인라인 차트 제거

**Given** 홈 페이지가 로드되고 uiState가 'idle' 상태이다
**When** EmotionReportCard 인라인 영역을 확인한다
**Then** WeeklyTrendChart가 인라인에 렌더링되지 않는다
**And** EmotionDonutChart가 인라인에 렌더링되지 않는다
**And** 요약 레이어(1단계)는 인라인에 표시된다
**And** 인사이트 레이어(3단계)는 인라인에 표시된다

---

### AC-009: 바텀시트 내 차트 인터랙션

**Given** 감정 통계 바텀시트가 열려 있고 감정 데이터가 존재한다
**When** 사용자가 EmotionDonutChart의 섹터를 클릭한다
**Then** EmotionDetailPanel이 바텀시트 위에 오버레이로 표시된다
**And** 패널의 z-index가 바텀시트보다 높다(z-50)

---

### AC-010: 바텀시트와 EmotionInput 충돌 방지

**Given** 감정 통계 바텀시트가 열려 있다
**When** 사용자가 "감정 표현하기" 버튼을 탭한다
**Then** 감정 통계 바텀시트가 먼저 닫힌다
**And** uiState가 'input'으로 전환되어 EmotionInput 바텀시트가 열린다

---

### AC-011: 접근성 속성

**Given** 감정 통계 바텀시트가 열려 있다
**When** 바텀시트 DOM 요소를 검사한다
**Then** 바텀시트 컨테이너에 `role="dialog"` 속성이 있다
**And** `aria-modal="true"` 속성이 있다
**And** `aria-label="감정 통계"` 속성이 있다
**And** 백드롭에 `aria-hidden="true"` 속성이 있다

---

### AC-012: 애니메이션 성능

**Given** 감정 통계 바텀시트 열기 애니메이션이 실행 중이다
**When** 애니메이션 프레임을 측정한다
**Then** 애니메이션이 60fps 이상으로 실행된다
**And** 열기 애니메이션이 300ms 이내에 완료된다

**Given** 감정 통계 바텀시트 닫기 애니메이션이 실행 중이다
**When** 애니메이션 프레임을 측정한다
**Then** 닫기 애니메이션이 250ms 이내에 완료된다

---

### AC-013: reduced-motion 대응

**Given** 사용자의 OS 설정이 `prefers-reduced-motion: reduce`이다
**When** 사용자가 "감정 통계 보기" 버튼을 탭한다
**Then** 바텀시트가 애니메이션 없이 즉시 표시된다

---

### AC-014: 빈 데이터 상태

**Given** 감정 데이터가 없다 (distribution이 빈 배열)
**When** 사용자가 "감정 통계 보기" 버튼을 탭한다
**Then** 바텀시트가 열린다
**And** 인라인의 "아직 기록된 감정이 없어요" 메시지가 인라인에 유지된다
**And** 바텀시트 내부에 빈 상태 메시지가 표시된다

---

## 에지 케이스

| 케이스 | 예상 동작 |
|--------|-----------|
| 빠른 연속 탭 (바텀시트 열기/닫기 반복) | 애니메이션 완료 후에만 상태 전환. 중간 상태 무시 |
| 바텀시트 열린 상태에서 브라우저 리사이즈 | 바텀시트가 새 뷰포트에 맞게 재조정 |
| 차트 동적 임포트 실패 | 로딩 스켈레톤 유지, 에러 메시지 미표시 (기존 동작 유지) |
| iOS Safari 백드롤 스크롤 | `overscroll-behavior: contain`으로 배경 스크롤 방지 |
| 바텀시트 열린 상태에서 젤리 터치 | 백드롭이 `pointer-events`를 차단하므로 젤리 터치 미발생 |

---

## 품질 게이트 (Definition of Done)

- [ ] 모든 AC 시나리오(AC-001 ~ AC-014) 통과
- [ ] EmotionStatsSheet 컴포넌트 단위 테스트 커버리지 85% 이상
- [ ] EmotionReportCard 수정 후 기존 테스트 전체 통과
- [ ] 홈 페이지 통합 테스트 통과
- [ ] LSP 에러 0건, 타입 에러 0건, 린트 에러 0건
- [ ] iOS Safari + Chrome Android에서 수동 테스트 통과
- [ ] 스크린 리더(VoiceOver/TalkBack)에서 바텀시트 상태 안내 확인
- [ ] `prefers-reduced-motion` 설정 시 애니메이션 비활성화 확인
- [ ] @MX 태그: 신규 공개 함수에 NOTE/ANCHOR 태그 추가
- [ ] SPEC-UI-001의 기존 기능(차트 렌더링, 인사이트, 개인화)이 회귀 없이 동작
