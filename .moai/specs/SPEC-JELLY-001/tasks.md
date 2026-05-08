## Task Decomposition
SPEC: SPEC-JELLY-001

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| T-001 | 물리 상수 및 타입 정의 | REQ-UBI-002, REQ-STA-006 | - | src/lib/constants/physics.ts, src/types/physics.ts | pending |
| T-002 | 감정/구슬 상수 정의 | REQ-EVT-005 | T-001 | src/lib/constants/emotion.ts | pending |
| T-003 | Zustand 상태머신 | REQ-STA-001~004, REQ-UNW-004 | T-001 | src/stores/jellyStore.ts | pending |
| T-004 | 엔진 Lifecycle 래퍼 | REQ-UBI-001, REQ-UNW-002 | T-001 | src/lib/physics/engine.ts | pending |
| T-005 | 페이스 표현 매핑 | REQ-STA-001~004 | T-003 | (jellyStore 또는 별도 모듈) | pending |
| T-006 | 자기장 힘 계산 (순수 함수) | REQ-EVT-002, REQ-STA-005 | T-001 | src/lib/physics/forces.ts | pending |
| T-007 | 구슬 생성 로직 | REQ-EVT-005 | T-002 | src/lib/physics/beadFactory.ts | pending |
| T-008 | Canvas 경계 벽 | REQ-UBI-004, REQ-UNW-003 | T-004 | src/lib/physics/engine.ts (확장) | pending |
| T-009 | Soft-body 구조 생성 | REQ-UBI-002 | T-004 | src/lib/physics/softBody.ts | pending |
| T-010 | PhysicsCanvas 컴포넌트 | REQ-UBI-001 | T-004 | src/components/jelly/PhysicsCanvas.tsx | pending |
| T-011 | usePhysics 훅 | REQ-UBI-001, REQ-UNW-002 | T-004, T-010 | src/hooks/usePhysics.ts | pending |
| T-012 | 구슬 물리 바디 | REQ-EVT-005 | T-004, T-007 | src/lib/physics/beadBody.ts | pending |
| T-013 | 충돌 감지 설정 | REQ-EVT-003 | T-004 | src/lib/physics/collisions.ts | pending |
| T-014 | JellyRenderer | REQ-UBI-002, AC-001, AC-002 | T-009, T-011 | src/components/jelly/JellyRenderer.tsx | pending |
| T-015 | BeadGroup 컴포넌트 | REQ-EVT-005 | T-011, T-012 | src/components/beads/BeadGroup.tsx | pending |
| T-016 | TestInput 컴포넌트 | REQ-EVT-005 | T-015 | src/components/input/TestInput.tsx | pending |
| T-017 | 자기장 힘 적용 | REQ-STA-005 | T-006, T-009, T-012 | src/lib/physics/forces.ts (확장) | pending |
| T-018 | useDrag 훅 | REQ-EVT-001, REQ-EVT-006 | T-011 | src/hooks/useDrag.ts | pending |
| T-019 | 전체 통합 | All ACs | T-017, T-018 | src/app/page.tsx | pending |
| T-020 | 시각 폴리싱 | REQ-STA-001~004 | T-019 | 다수 파일 업데이트 | pending |
| T-021 | 성능 가드 | REQ-UNW-001, REQ-UNW-005 | T-019 | src/lib/physics/fpsGuard.ts | pending |

## TAG Chain
TAG-FOUNDATION (T-001, T-002) → TAG-STATE-MACHINE (T-003, T-005) / TAG-PHYSICS-ENGINE (T-004, T-008, T-010, T-011) → TAG-SOFT-BODY (T-009, T-014) / TAG-BEAD-SYSTEM (T-007, T-012, T-015, T-016) → TAG-INTERACTION (T-006, T-013, T-017, T-018) → TAG-INTEGRATION (T-019, T-020, T-021)

## Critical Path
T-001 → T-004 → T-009 → T-011 → T-014 → T-019
