# SPEC-JELLY-001: Implementation Plan

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-JELLY-001 |
| 제목 | Core Physics + Interaction - 구현 계획 |
| 우선순위 | P0 (Critical) |
| 상태 | Planned |
| 생성일 | 2026-05-08 |
| 수정일 | 2026-05-08 |
| 버전 | 1.1.0 |

---

## 구현 접근법

### 디자인 소스 (Design-Driven)

**Google Stitch MCP 연동:**
- 프론트엔드 UI 구현은 Stitch 앱에서 작성된 디자인을 기반으로 진행
- Stitch MCP 서버를 통해 디자인 토큰, 컴포넌트 스펙, 레이아웃 정보를 가져옴
- Canvas 기반 물리 엔진(젤리, 구슬)은 PRD/DESIGN 명세 기반으로 직접 구현
- UI 컴포넌트(버튼, 입력창, 모달 등)는 Stitch 디자인에서 추출한 토큰 기반으로 구현
- `.mcp.json`에 Stitch MCP 설정 완료 (HTTP transport, API Key 인증)

**디자인-물리 분리 구조:**
- UI Layer: Stitch 디자인 → React 컴포넌트 (Tailwind CSS)
- Physics Layer: PRD/DESIGN 명세 → Canvas + Matter.js
- Bridge: Zustand store로 UI 상태와 물리 상태 동기화

### 기술 전략

**Matter.js Soft-body 접근법:**
- Composite 구조를 활용한 다중 Circle 바디 조합으로 Soft-body 구현
- 각 정점을 Circle Body로 생성 (radius 4-6px)
- 인접 정점 간 Constraint(Spring)로 유연성 확보
- 중심점에 Constraint로 고정하여 구조 유지

**Canvas 렌더링 전략:**
- Matter.js 기본 렌더러 대신 커스텀 Canvas 2D 렌더링 사용
- requestAnimationFrame 기반 렌더 루프
- 렌더링과 물리 업데이트를 동일 루프에서 처리
- 곡선 보간(Catmull-Rom)으로 부드러운 Soft-body 외곽선

**상태 관리 전략:**
- Zustand store에 젤리 상태머신 로직 통합
- 상태 전이 시 가드 조건 검증
- 상태 변경 시 애니메이션 트리거

### 아키텍처 결정

| 결정 사항 | 선택 | 대안 | 사유 |
|----------|------|------|------|
| 렌더링 | Canvas 2D API | WebGL, SVG | Matter.js와의 직접 연동, 충분한 성능 |
| Soft-body | Composite + Constraints | 외부 라이브러리 | Matter.js 네이티브 기능으로 충분 |
| 애니메이션 | Canvas + Framer Motion | CSS Animation | 물리 기반 애니메이션은 Canvas 필수 |
| 드래그 | Pointer Events | Mouse/Touch 개별 | 통합 API로 크로스 브라우저 대응 |
| 페이스 | Canvas 텍스트 렌더링 | SVG 오버레이 | 단일 렌더링 컨텍스트 유지 |

---

## 마일스톤

### Milestone 1: Physics Foundation (Priority High)

**목표:** Matter.js 엔진 초기화, Canvas 설정, 렌더링 루프 구축

**태스크:**
1. Matter.js 엔진 초기화 모듈 (lib/physics/engine.ts)
   - Engine, Runner, World 설정
   - 중력 설정 (scale 0.5)
   - 엔진 시작/중지/정리 lifecycle 관리
2. Canvas 설정 모듈
   - Canvas 크기 초기화 (viewport 기반)
   - devicePixelRatio 적용
   - resize 이벤트 핸들링
3. 렌더링 루프 모듈
   - requestAnimationFrame 기반 루프
   - delta time 계산
   - fps 모니터링 (REQ-UNW-001)
4. 물리 상수 정의 (lib/constants/physics.ts)
   - Elasticity, Damping, Friction, Gravity Scale
   - 자기장 반경, 구슬 크기 범위

**완료 기준:**
- Canvas가 렌더링되고 60fps로 빈 화면 갱신
- Matter.js 엔진이 초기화되고 정상적으로 업데이트
- resize 시 Canvas 크기 자동 조정
- 컴포넌트 언마운트 시 엔진 정리 (REQ-UNW-002)

**생성 파일:**
- `src/lib/physics/engine.ts`
- `src/lib/constants/physics.ts`
- `src/types/physics.d.ts`
- `src/hooks/usePhysics.ts`

---

### Milestone 2: Jelly Character Core (Priority High)

**목표:** Soft-body 젤리 캐릭터 렌더링, 페이스 표현, 시각 효과

**태스크:**
1. Soft-body 구조 생성
   - 20-30개 정점 Circle Body 생성
   - 인접 정점 간 Spring Constraint
   - 중심점 고정 Constraint
   - Catmull-Rom 곡선 보간으로 외곽선
2. 젤리 렌더링 (components/jelly/JellyRenderer.tsx)
   - Soft-body 외곽선 렌더링 (곡선 경로)
   - 배경색 #FFD1DC 적용
   - backdrop-filter blur(8px) 효과
   - opacity 0.85 적용
   - inset shadow 효과
3. 페이스 표현 시스템
   - 눈: `• •` / `^ ^` / `u u` (상태별)
   - 입: `o` / `-` (상태별)
   - 페이스 위치는 젤리 중심 기준
4. 호흡 애니메이션 (Idle 상태)
   - translateY(-12px) 3s ease-in-out infinite
   - Canvas에서 물리 offset으로 구현

**완료 기준:**
- 젤리 캐릭터가 Canvas에 렌더링됨
- Soft-body 물리로 눌리면 원래 형태로 복원
- 페이스 표식이 상태에 따라 표시됨
- blur, opacity, shadow 시각 효과 적용

**생성 파일:**
- `src/components/jelly/JellyCharacter.tsx`
- `src/components/jelly/JellyRenderer.tsx`
- `src/components/jelly/PhysicsEngine.tsx`
- `src/lib/physics/constraints.ts`
- `src/types/jelly.d.ts`

---

### Milestone 3: State Machine (Priority High)

**목표:** Zustand 기반 젤리 상태머신, 상태 전이 로직, 전이 가드

**태스크:**
1. Zustand jellyStore 생성 (stores/jellyStore.ts)
   - 상태: currentState, beadsRemaining, beadsTotal, position
   - Actions: transitionTo, setBeads, consumeBead
   - Devtools 미들웨어 적용
2. 상태 머신 로직
   - 전이 맵 정의 (TransitionMap)
   - 가드 조건 검증 (구슬 수, 시간)
   - 무효 전이 차단 (REQ-UNW-004)
3. 상태별 애니메이션 트리거
   - Idle: 호흡 애니메이션
   - Anticipation: wobble 애니메이션
   - Eating: scale 애니메이션
   - Satisfied: 바운스 애니메이션
4. useJellyState 훅 (hooks/useJellyState.ts)
   - 상태 구독
   - 전이 트리거 함수
   - 타이머 관리 (Satisfied -> Idle 3초)

**완료 기준:**
- Zustand store에 상태가 올바르게 저장됨
- 상태 전이가 정의된 규칙에 따라 발생
- 무효 전이가 차단되고 로그 출력
- Satisfied 3초 후 Idle 자동 복귀

**생성 파일:**
- `src/stores/jellyStore.ts`
- `src/hooks/useJellyState.ts`
- `src/components/jelly/JellyStateMachine.tsx`

---

### Milestone 4: Emotion Beads (Priority High)

**목표:** 감정 구슬 생성, 렌더링, 물리 바디, 그룹 관리

**태스크:**
1. 구슬 물리 바디 생성
   - Matter.js Circle Body (radius 6/9/12)
   - 랜덤 크기 (12/18/24px)
   - 초기 위치: Canvas 상단 랜덤 분포
2. 구슬 렌더링 (components/beads/EmotionBead.tsx)
   - Canvas 2D 원형 렌더링
   - 기본 색상 적용 (P0 단일 색상)
   - 그림자 효과
3. 구슬 그룹 관리 (components/beads/BeadGroup.tsx)
   - 5-15개 구슬 생성 로직
   - 생성 순서 관리 (ID 할당)
   - Pop-in 애니메이션: scale(0->1) 300ms
   - 삼켜진 구슬 제거
4. 감정 상수 정의 (lib/constants/emotion.ts)
   - 구슬 크기, 색상, 수량 범위

**완료 기준:**
- 테스트 버튼 클릭 시 5-15개 구슬 생성
- 구슬이 Canvas에 렌더링되고 중력 적용
- Pop-in 애니메이션 정상 동작
- 구슬이 Canvas 벽면에서 튕김

**생성 파일:**
- `src/components/beads/EmotionBead.tsx`
- `src/components/beads/BeadGroup.tsx`
- `src/components/beads/BeadPhysics.tsx`
- `src/lib/constants/emotion.ts`

---

### Milestone 5: Interaction System (Priority High)

**목표:** 드래그 앤 드롭, 자기장 효과, 충돌 감지, 삼키기 로직

**태스크:**
1. 포인터 이벤트 처리
   - Canvas에 pointerdown/move/up 리스너 등록
   - 터치 좌표 -> Canvas 좌표 변환
   - Point query로 구슬 선택 (20px 이내)
2. 드래그 앤 드롭 (REQ-EVT-001)
   - 선택된 구슬을 kinematic으로 전환
   - pointermove에서 Body.setPosition() 업데이트
   - pointerup에서 dynamic으로 복귀
3. 자기장 효과 (REQ-EVT-002, REQ-STA-005)
   - 매 프레임 구슬-젤리 거리 계산
   - 50px 이내 구슬에 Body.applyForce()
   - Force 크기 = baseForce * (1 - distance/50)
   - 자기장 시각화 (반투명 원)
4. 충돌 감지 및 삼키기 (REQ-EVT-003)
   - Events.on(engine, 'collisionActive') 리스너
   - 구슬-젤리 충돌 감지 (label 기반 필터링)
   - 충돌 시 구슬 제거, Eating 상태 전이
   - 삼킨 카운트 업데이트
5. 정화 완료 로직 (REQ-EVT-004)
   - 남은 구슬 0개 확인
   - Satisfied 상태 전이
   - 3초 타이머 후 Idle 복귀

**완료 기준:**
- 구슬을 터치하여 드래그 가능
- 구슬을 젤리 근처에서 놓으면 끌려감
- 자기장 시각화 표시
- 구슬-젤리 충돌 시 삼키기 동작
- 모든 구슬 소비 후 Satisfied 전이

**생성 파일:**
- `src/lib/physics/collisions.ts`
- `src/components/jelly/JellyCharacter.tsx` (업데이트: 이벤트 통합)
- `src/components/beads/BeadPhysics.tsx` (업데이트: 자기장)

---

### Milestone 6: Visual Polish (Priority Medium)

**목표:** 애니메이션 완성도, 시각 효과 고도화

**태스크:**
1. Eating 애니메이션 완성
   - scale(1.2 -> 0.9) 400ms ease-out
   - 눈 `u u` 표정 전환
   - 입 크게 벌림
2. Anticipation 시각 효과
   - 젤리 wobble (좌우 흔들림)
   - 구슬 방향으로 약간 기울임
3. Satisfied 애니메이션 완성
   - 부드러운 바운스
   - 눈 `^ ^` 표정
   - 입 `-` 표정
4. 구슬 Pop-in 애니메이션 완성
   - 순차적 생성 (50ms 간격)
   - scale(0 -> 1) 300ms spring 효과

**완료 기준:**
- 모든 상태 전이 애니메이션이 자연스럽게 동작
- Eating scale 애니메이션이 400ms 내 완료
- 구슬 Pop-in이 순차적으로 발생

**수정 파일:**
- `src/components/jelly/JellyRenderer.tsx` (업데이트)
- `src/components/beads/BeadGroup.tsx` (업데이트)
- `src/components/jelly/JellyAnimation.tsx` (업데이트)

---

### Milestone 7: Integration & Testing (Priority Medium)

**목표:** 전체 컴포넌트 통합, 테스트, 성능 검증

**태스크:**
1. 메인 페이지 통합 (app/page.tsx)
   - PhysicsEngine, JellyCharacter, BeadGroup 통합
   - 테스트 입력 버튼 배치
   - 레이아웃 구성
2. 성능 테스트
   - 15개 구슬 + 젤리 30fps 이상 확인
   - 메모리 누수 테스트 (mount/unmount 반복)
   - delta time 기반 프레임 드롭 감지
3. 엣지 케이스 처리
   - 빠른 연속 터치
   - 구슬 생성 중 추가 생성
   - resize 중 인터랙션
   - 0개 구슬 상태에서 충돌
4. 접근성 기초
   - Canvas에 aria-label 부여
   - 키보드 접근성 기본 (tabindex)
   - reducedMotion 미디어 쿼리 존중

**완료 기준:**
- 전체 플로우가 테스트 버튼으로 동작
- 성능 기준 충족 (30fps 이상)
- 메모리 누수 없음
- 엣지 케이스에서 크래시 없음

**수정/생성 파일:**
- `src/app/page.tsx` (업데이트)
- `tests/components/JellyCharacter.test.tsx`
- `tests/hooks/usePhysics.test.ts`
- `tests/stores/jellyStore.test.ts`

---

## 위험 분석

### Risk 1: 모바일 Matter.js 성능 (위험도: Medium)

**문제:** 모바일 기기에서 20-30개 정점 Soft-body + 15개 구슬 물리 계산 시 성능 저하 가능

**영향:** 프레임 드롭으로 인한 사용자 경험 저하

**대응 방안:**
- 정점 수를 20개로 시작하여 성능 측정 후 조정
- 구슬 물리를 단순화 (회전 무시)
- 과부하 시 physics time step 조정
- requestIdleCallback으로 비핵심 계산 지연

### Risk 2: Soft-body 물리 안정성 (위험도: Medium)

**문제:** Soft-body 정점 간 Constraint가 불안정하여 구조 붕괴 가능

**영향:** 젤리 캐릭터 형태가 찌그러짐

**대응 방안:**
- Constraint stiffness와 damping 값을 점진적 조정
- 정점 간 최소/최대 거리 제약 추가
- 정기적으로 정점 위치 보정 로직 추가
- 데모에서 안정적인 파라미터 선 테스트

### Risk 3: Canvas 터치 이벤트 충돌 (위험도: Low)

**문제:** 모바일 브라우저에서 터치 이벤트와 스크롤/핀치줌 충돌

**영향:** 드래그 인터랙션이 의도치 않게 스크롤 유발

**대응 방안:**
- touch-action: none CSS 적용
- passive: false로 이벤트 등록
- preventDefault()로 기본 동작 차단
- e.stopPropagation()으로 이벤트 전파 방지

### Risk 4: 상태 전이 경쟁 조건 (위험도: Low)

**문제:** 다중 구슬이 동시에 충돌하여 상태 전이가 중복 발생 가능

**영향:** Eating 애니메이션이 여러 번 트리거되거나 상태 불일치

**대응 방안:**
- 상태 전이 시 lock 플래그 사용
- Eating 애니메이션 진행 중 추가 전이 큐잉
- Zustand 미들웨어로 전이 검증
- 구슬 충돌 이벤트에 디바운스 적용

### Risk 5: 메모리 관리 (위험도: Medium)

**문제:** Matter.js Body와 Constraint가 GC되지 않고 누적 가능

**영향:** 장시간 사용 시 메모리 사용량 증가

**대응 방안:**
- 삼켜진 구슬의 Body를 World에서 명시적 제거
- Composite.clear()로 Constraint 정리
- useEffect cleanup에서 전체 엔진 정리
- 정기적으로 World.bodies 길이 모니터링

---

## 종속성 그래프

```
Milestone 1 (Physics Foundation)
    |
    v
Milestone 2 (Jelly Character)  Milestone 4 (Emotion Beads)
    |                               |
    v                               v
Milestone 3 (State Machine)    Milestone 4 (완료)
    |                               |
    +-------------------------------+
    |
    v
Milestone 5 (Interaction System)
    |
    v
Milestone 6 (Visual Polish)
    |
    v
Milestone 7 (Integration & Testing)
```

- Milestone 2와 4는 Milestone 1에 종속 (물리 엔진 필요)
- Milestone 3과 4는 병렬 진행 가능
- Milestone 5는 2, 3, 4 모두 완료 후 진행
- Milestone 6과 7은 순차 진행

---

## 생성/수정 파일 목록

### 신규 생성 파일

| 파일 경로 | 마일스톤 | 설명 |
|----------|---------|------|
| src/lib/physics/engine.ts | M1 | Matter.js 엔진 초기화 및 lifecycle |
| src/lib/physics/constraints.ts | M2 | Soft-body Constraint 설정 |
| src/lib/physics/collisions.ts | M5 | 충돌 감지 및 자기장 로직 |
| src/lib/constants/physics.ts | M1 | 물리 상수 정의 |
| src/lib/constants/emotion.ts | M4 | 감정/구슬 상수 정의 |
| src/components/jelly/JellyCharacter.tsx | M2 | 젤리 메인 컴포넌트 |
| src/components/jelly/PhysicsEngine.tsx | M1 | 물리 엔진 래퍼 컴포넌트 |
| src/components/jelly/JellyStateMachine.tsx | M3 | 상태 머신 컴포넌트 |
| src/components/jelly/JellyRenderer.tsx | M2 | Canvas 렌더러 |
| src/components/beads/EmotionBead.tsx | M4 | 개별 구슬 렌더링 |
| src/components/beads/BeadGroup.tsx | M4 | 구슬 그룹 관리 |
| src/components/beads/BeadPhysics.tsx | M4 | 구슬 물리 로직 |
| src/stores/jellyStore.ts | M3 | Zustand 젤리 상태 저장소 |
| src/types/jelly.d.ts | M2 | 젤리 타입 정의 |
| src/types/physics.d.ts | M1 | 물리 타입 정의 |
| src/hooks/usePhysics.ts | M1 | 물리 엔진 훅 |
| src/hooks/useJellyState.ts | M3 | 젤리 상태 관리 훅 |

### 수정 파일

| 파일 경로 | 마일스톤 | 변경 사항 |
|----------|---------|----------|
| src/app/page.tsx | M7 | 메인 페이지에 컴포넌트 통합 |
| src/app/globals.css | M6 | Canvas 관련 전역 스타일 |

### v1.1.0 수정 파일 (벽 충돌 반사 개선)

| 파일 경로 | 변경 사항 |
|----------|----------|
| src/app/home/page.tsx (라인 121-125) | 벽면 Static 바디 Restitution 값 0.3 -> 0.8 변경 |
| src/lib/constants/physics.ts (라인 32) | WALL_RESTITUTION 상수 값 0.3 -> 0.8 변경 |
| src/lib/physics/engine.ts (라인 65, 77, 85, 92) | 벽면 생성 시 restitution 파라미터 업데이트 |

**영향 범위 분석:**

- **물리 파라미터 변경**: 벽면 Restitution을 0.3에서 0.8로 변경하면 모든 벽면 충돌(상/하/좌/우)에서 반사 속도가 크게 증가
- **사용자 경험 개선**: 젤리가 벽에 닿았을 때 강하게 튕겨져 나와 반대편에 떨어진 구슬을 먹을 수 있게 됨
- **기존 동작 영향**: 구슬도 동일한 벽면과 충돌하므로 구슬의 반사 속도도 증가함. 하지만 구슬은 튕기는 것이 자연스러운 동작이므로 부정적 영향은 없음
- **성능 영향**: Restitution 값 변경은 물리 계산량에 영향을 주지 않음
- **위험도**: 낮음. 단일 상수 값 변경이며, 물리 엔진의 안정성에 영향 없음

---

## 전문가 컨설테이션 권장

본 SPEC은 다음 영역의 전문가 컨설테이션을 권장한다.

### Frontend Expert (expert-frontend)
- **사유:** Canvas 렌더링, Soft-body 물리 시각화, 터치 인터랙션 등 프론트엔드 전문 기술이 핵심
- **검토 영역:** 렌더링 성능 최적화, Canvas 2D API 활용법, 모바일 터치 이벤트 처리
- **권장 시점:** Milestone 1 완료 후 아키텍처 리뷰

### Performance Expert (expert-performance)
- **사유:** 모바일 환경에서 30+ 물리 바디 실시간 렌더링 성능 최적화 필요
- **검토 영역:** requestAnimationFrame 최적화, Canvas 렌더링 성능, 메모리 관리
- **권장 시점:** Milestone 5 완료 후 성능 프로파일링

---

## HISTORY

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-05-08 | 1.0.0 | 최초 구현 계획 생성 |
| 2026-05-08 | 1.1.0 | REQ-UNW-003 벽면 Restitution 0.3 -> 0.8 변경에 따른 수정 파일 목록 및 영향 범위 추가 |
