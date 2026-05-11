---
id: SPEC-TOUCH-001
version: 1.0.0
status: draft
created: 2026-05-11
priority: P0
author: moai
---

# SPEC-TOUCH-001: 젤리 터치 반응 (Jelly Touch Reaction)

## 개요

홈 화면의 젤리를 터치/쓰다듬으면 표정 변화 + 바운스 애니메이션 + 하트 파티클이 발생하는 반려동물형 상호작용 기능. 토스 바이브코딩 챌린지 "귀여운게 최고야" 테마 핵심 차별화 요소.

## 요구사항 (EARS)

### REQ-TOUCH-001: 터치 감지
**When** 사용자가 젤리 바디 영역을 터치할 때,
**the system shall** 터치 이벤트를 감지하고 젤리 바디 근처(반경 circleRadius * 1.5 이내)인지 hit test를 수행한다.

### REQ-TOUCH-002: 표정 반응
**When** 터치가 감지되면,
**the system shall** 젤리 표정을 'happy'로 변경하고 2초 후 원래 표정으로 복귀한다. idle 상태에서만 반응하며, eating/satisfied 상태에서는 무시한다.

### REQ-TOUCH-003: 바운스 효과
**When** 터치가 감지되면,
**the system shall** 젤리 바디에 위쪽으로 가벼운 물리 임펄스를 가하여 통통 튀는 효과를 연출한다.

### REQ-TOUCH-004: 하트 파티클
**When** 터치가 감지되면,
**the system shall** 젤리 위치 주변에 3~5개의 하트 파티클을 생성하고 1초간 위로 날아가며 fade-out 애니메이션을 재생한다.

### REQ-TOUCH-005: 연속 터치 쿨다운
**The system shall** 1초 쿨다운을 적용하여 연속 터치를 방지한다.

## 인수 기준

- [ ] idle 상태에서 젤리 바디 영역 터치 시 happy 표정 표시
- [ ] happy 표정 2초 유지 후 원래 표정 복귀
- [ ] 터치 시 위쪽으로 바운스 물리 임펄스 발생
- [ ] 하트 파티클 3~5개 생성 + fade-out 애니메이션
- [ ] 1초 쿨다운 적용
- [ ] eating/satisfied 상태에서 터치 무시
- [ ] 기존 감정 분석 플로우에 영향 없음

## 기술 접근

### 수정 파일
1. **src/components/jelly/JellyRenderer.tsx** — pointer-events-none 제거, touch handler 추가
2. **src/stores/jellyStore.ts** — happy 상태/표정 추가, 터치 관련 상태 추가
3. **src/types/physics.ts** — JellyState 타입에 'happy' 추가
4. **src/app/home/page.tsx** — 터치 이벤트 핸들링, 하트 파티클 렌더링
5. **src/components/jelly/PhysicsCanvas.tsx** — 터치 좌표 → Matter.js 바디 hit test

### happy 표정 디자인
- 눈: ^ ^ (satisfied와 동일한 행복한 곡선)
- 입: 큰 미소 (U자 곡선, satisfied보다 더 넓음)
- 볼터치: 연한 핑크 원 2개 (선택적)

### 하트 파티클
- CSS 기반 (별도 Canvas 불필요)
- position: absolute, translateY + opacity 트랜지션
- 랜덤 x 오프셋 ±30px
