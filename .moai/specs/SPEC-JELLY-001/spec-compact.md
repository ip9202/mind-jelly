# SPEC-JELLY-001 (Compact)

## Requirements Summary

### Ubiquitous (4)
- REQ-UBI-001: 60fps Canvas 렌더링 루프 (rAF + Matter.js Engine.update)
- REQ-UBI-002: 20-30 정점 Soft-body 젤리 유지 (Constraint + Spring)
- REQ-UBI-003: Zustand 단일 상태 소스 (jellyStore)
- REQ-UBI-004: Canvas 바운더리 유지 (Static wall bodies)

### Event-Driven (6)
- REQ-EVT-001: 구슬 드래그 (Pointer Events, kinematic/dynamic 전환)
- REQ-EVT-002: 자기장 활성화 (50px 반경, 거리 반비례 Force)
- REQ-EVT-003: 충돌 삼키기 (collisionActive, Body 제거, Eating 전이)
- REQ-EVT-004: 정화 완료 (구슬 0개 → Satisfied → 3초 후 Idle)
- REQ-EVT-005: 테스트 구슬 생성 (5-15개, 12/18/24px 랜덤, Pop-in 300ms)
- REQ-EVT-006: Canvas 터치 선택 (Point query, 20px 이내)

### State-Driven (6)
- REQ-STA-001: Idle - translateY(-12px) 3s, 눈 `• •`, 입 `o`
- REQ-STA-002: Anticipation - wobble, 입 `o` 확대
- REQ-STA-003: Eating - scale(1.2→0.9) 400ms, 눈 `u u`, 입 `o`
- REQ-STA-004: Satisfied - 눈 `^ ^`, 입 `-`, 3초 후 Idle
- REQ-STA-005: 자기장 인력 (Body.applyForce, 거리 반비례)
- REQ-STA-006: Gravity Scale 0.5 모든 동적 바디

### Unwanted Behavior (5)
- REQ-UNW-001: 30fps 미만 방지 (delta time, 정점 자동 조정)
- REQ-UNW-002: 메모리 누수 방지 (cleanup: Engine.clear, cancelAnimationFrame)
- REQ-UNW-003: Canvas 영역 이탈 방지 (Static 벽면, Restitution 0.3)
- REQ-UNW-004: 무효 상태 전이 방지 (전이 가드)
- REQ-UNW-005: 메인 스레드 블로킹 방지 (16ms 이내)

### Optional (2)
- REQ-OPT-001: 터치 ripple 효과 (200ms fade-out)
- REQ-OPT-002: 삼키기 파티클 (5-8개, 300ms)

## Acceptance Criteria (Key Scenarios)
- AC-001: 젤리 렌더링 (20-30 정점, #FFD1DC, blur 8px)
- AC-002: Soft-body 터치 변형 (드래그 시 정점 변위, 복원)
- AC-003: 상태 머신 Idle (부유 애니메이션, 표정)
- AC-004: 구슬 생성 (5-15개, 랜덤 크기, Pop-in)
- AC-005: 구슬 드래그 (Pointer Events, kinematic)
- AC-006: 자기장 효과 (50px, Force 적용)
- AC-007: 충돌 삼키기 (Body 제거, Eating 전이)
- AC-008: 정화 완료 (Satisfied → 3초 → Idle)
- AC-009: 무효 전이 차단 (가드 검증)
- AC-010: 메모리 정리 (언마운트 시 누수 없음)

## Files to Create
- src/lib/physics/engine.ts
- src/lib/physics/softBody.ts
- src/lib/physics/collisions.ts
- src/stores/jellyStore.ts
- src/components/jelly/PhysicsCanvas.tsx
- src/components/jelly/JellyRenderer.tsx
- src/components/jelly/JellyStateMachine.tsx
- src/components/beads/EmotionBead.tsx
- src/components/beads/BeadGroup.tsx
- src/components/input/TestInput.tsx
- src/hooks/usePhysics.ts
- src/hooks/useDrag.ts
- src/types/physics.ts

## Exclusions (NOT in P0)
- AI 감정 분석 (GPT-4o-mini) → P1
- 토스 브릿지 API → P1
- 감정 기반 색상 전환 → P1
- 배경 크로스페이드 → P1
- 파티클 고도화 → P2
- BGM → P2
- 다크 모드 완전 지원 → P1
- 텍스트 입력 UI → P1
- 공유 기능 → P1
- 접근성/다국어 → P2
