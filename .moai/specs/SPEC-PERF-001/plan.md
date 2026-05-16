# SPEC-PERF-001 Implementation Plan

## 구현 순서 (HIGH → LOW)

### Phase 1: HIGH 이슈 (REQ-PERF-001, REQ-PERF-002)

**Task 1.1: 일기 엔트리 로딩 제한** (db.ts)
- `.select('*')` → `.select('*').limit(30)` 추가
- 테스트: 30개 초과 데이터 로드 시 limit 동작 확인

**Task 1.2: rAF idle 정지** (usePhysicsInit.ts)
- 비드(구슬) 존재 여부 체크 로직 추가
- 비드 없을 때 rAF 루프 정지, 비드 추가 시 재개
- 테스트: idle 상태에서 rAF 정지 확인

### Phase 2: MEDIUM 이슈 (REQ-PERF-003 ~ REQ-PERF-006)

**Task 2.1: JellyRenderer React.memo** (JellyRenderer.tsx)
- React.memo 래핑 + 커스텀 비교 함수
- 테스트: props 동일 시 리렌더링 방지 확인

**Task 2.2: BeadGroup 중복 호출 제거** (BeadGroup.tsx)
- allBodies() 호출을 한 번으로 통합
- 테스트: 프레임당 호출 횟수 확인

**Task 2.3: 광고 기록 재시도** (adFrequencyControl.ts)
- 재시도 래퍼 함수 추가 (최대 3회, 지수 백오프)
- 테스트: 실패 시 재시도 동작 확인

**Task 2.4: Zustand 선택적 구독** (jellyStore.ts + 홈 컴포넌트)
- selector 패턴 적용
- 테스트: 구독한 상태만 리렌더링 트리거 확인

### Phase 3: LOW 이슈 (REQ-PERF-007, REQ-PERF-008)

**Task 3.1: 렌더 경로 상수 추출** (page.tsx)
- AMBIENT_BEADS를 컴포넌트 외부로 이동
- 테스트: 참조 동일성 확인

**Task 3.2: 로딩 스켈레톤** (page.tsx)
- dynamic import에 loading 컴포넌트 추가
- 테스트: 로딩 상태 UI 확인

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| limit(30)으로 인한 기존 기능 영향 | 홈 화면은 최근 일기만 표시, 스크롤 로딩은 별도 |
| rAF 정지로 인한 애니메이션 누락 | 비드 추가 시 즉시 재개 로직 보장 |
| React.memo 비교 함수 오버헤드 | shallow comparison으로 충분 |
| 재시도 로직 지연 | 최대 3회, 총 6초 이내 완료 |

## MX Tag Plan

- getMyDiaryEntries: @MX:NOTE (로딩 제한 정책)
- usePhysicsInit rAF: @MX:NOTE (idle 정지 로직)
- recordAdShown: @MX:NOTE (재시도 정책)
