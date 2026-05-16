# SPEC-PERF-001 Acceptance Criteria

## Scenario 1: 일기 로딩 제한
**Given:** 사용자가 50개의 일기를 보유하고 있다
**When:** getMyDiaryEntries()를 호출하면
**Then:** 최대 30개의 일기만 반환된다

## Scenario 2: rAF Idle 정지
**Given:** 홈 화면이 표시되고 구슬이 없는 상태이다
**When:** 5초간 대기한 후
**Then:** requestAnimationFrame 콜백이 호출되지 않는다

## Scenario 3: rAF 자동 재개
**Given:** rAF 루프가 정지된 상태이다
**When:** 새 구슬이 추가되면
**Then:** rAF 루프가 자동으로 재개된다

## Scenario 4: JellyRenderer 메모이제이션
**Given:** JellyRenderer가 렌더링된 상태이다
**When:** 동일한 props로 부모가 리렌더링되면
**Then:** JellyRenderer는 리렌더링되지 않는다

## Scenario 5: BeadGroup 단일 allBodies 호출
**Given:** BeadGroup이 렌더링 사이클을 실행 중이다
**When:** 프레임당 allBodies() 호출 횟수를 측정하면
**Then:** 정확히 1회만 호출된다

## Scenario 6: 광고 기록 재시도
**Given:** incrementAdImpression 호출이 실패한다
**When:** 재시도 로직이 실행되면
**Then:** 최대 3회 재시도 후에도 실패 시 에러가 로깅된다

## Edge Cases

- EC-1: 일기가 0개일 때 limit(30) 동작 정상
- EC-2: rAF 정지 후 컴포넌트 언마운트 시 메모리 누수 없음
- EC-3: React.memo 비교 함수에서 null/undefined props 처리
- EC-4: 광고 기록 재시도 중 앱 종료 시 데이터 무결성
