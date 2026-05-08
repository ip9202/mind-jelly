# SPEC-JELLY-001: Core Physics + Interaction

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-JELLY-001 |
| 제목 | Core Physics + Interaction |
| 우선순위 | P0 (Critical) |
| 상태 | Completed |
| 생성일 | 2026-05-08 |
| 수정일 | 2026-05-08 |
| 버전 | 1.1.0 |
| 담당자 | expert-frontend |
| 관련 SPEC | 없음 (최초 SPEC) |
| Lifecycle | spec-anchored |

## 개요

마음 젤리(Mind Jelly) 애플리케이션의 핵심 물리 엔진과 상호작용 시스템을 구현한다. Canvas 기반 Soft-body 젤리 캐릭터 "냠냠이", Matter.js 물리 엔진, 감정 구슬 시스템, 드래그 앤 드롭 인터랙션, 자기장 효과 및 충돌 감지 로직을 포함한다. P0 단계에서는 AI 감정 분석 대신 하드코딩된 테스트 입력을 사용하며, 토스 브릿지 연동은 제외한다.

## 환경 (Environment)

- **프레임워크**: React 18.3+ (Next.js 14.2+ App Router)
- **상태 관리**: Zustand 4.5+
- **물리 엔진**: Matter.js 0.19+
- **애니메이션**: Framer Motion 10.17+
- **렌더링**: Canvas API (2D Context)
- **입력 처리**: Pointer Events API
- **런타임**: 클라이언트 사이드 전용 (SSR 비활성화)
- **대상 환경**: 모바일 웹 (터치 우선), 데스크톱 (마우스 지원)

## 가정 (Assumptions)

1. P0 단계에서는 AI 감정 분석(GPT-4o-mini)을 사용하지 않고 하드코딩된 테스트 데이터로 대체한다.
2. 토스 브릿지 API 연동은 P1 단계에서 구현한다.
3. 젤리 캐릭터는 단일 색상(#FFD1DC)으로 렌더링하며 감정 기반 색상 전환은 P1에서 구현한다.
4. 다크 모드는 기본 지원만 포함하고 완전한 테마 전환은 P1에서 구현한다.
5. 텍스트 입력 UI 대신 "테스트 입력" 버튼으로 구슬을 생성한다.
6. 배경 크로스페이드, 파티클 효과, BGM은 P2에서 구현한다.
7. Canvas 크기는 뷰포트 기반으로 반응형 처리한다.

## 제약사항 (Constraints)

### 기술 제약
- Canvas 렌더링은 60fps 목표, 최소 30fps 보장
- Soft-body 정점 수: 20-30개 (성능과 품질의 균형)
- 동시 구슬 수: 최대 15개
- 물리 엔진 타임스텝: 16.67ms (60fps 기준)
- Canvas 해상도: devicePixelRatio 적용

### 물리 파라미터 제약
- 탄성계수 (Elasticity): 0.7
- 감쇠 (Damping): 0.3
- 마찰계수 (Friction): 0.1
- 중력 배율 (Gravity Scale): 0.5
- 자기장 반경: 50px
- 구슬 크기: 12px / 18px / 24px (랜덤)

### 성능 제약
- Matter.js 엔진 인스턴스는 단일 생성, 언마운트 시 반드시 정리
- requestAnimationFrame 기반 렌더링 루프
- 컴포넌트 언마운트 시 모든 애니메이션 프레임 해제
- 메모리 누수 방지를 위한 정리 로직 필수

---

## 요구사항 (Requirements)

### Ubiquitous Requirements (항상 만족)

#### REQ-UBI-001: 물리 엔진 렌더링 루프
시스템은 **항상** 활성 세션 중 Canvas에서 60fps 목표로 물리 시뮬레이션을 렌더링해야 한다.

- requestAnimationFrame 기반 렌더링 루프 운영
- Matter.js Engine.update()를 매 프레임 호출
- Canvas 2D Context를 통한 물리 바디 렌더링
- devicePixelRatio 적용으로 고해상도 디스플레이 지원

#### REQ-UBI-002: Soft-body 젤리 물리 유지
시스템은 **항상** 20-30개 정점으로 구성된 Soft-body 젤리 캐릭터의 물리 구조를 유지해야 한다.

- 젤리 중심점을 고정하는 Constraint 설정
- 정점 간 Spring Constraint로 유연성 구현
- Elasticity 0.7, Damping 0.3, Friction 0.1 적용
- 정점 수는 설정 가능하며 기본값 25개

#### REQ-UBI-003: Zustand 단일 상태 소스
시스템은 **항상** Zustand store를 젤리 상태의 단일 소스 오브 트루스(Single Source of Truth)로 사용해야 한다.

- jellyStore: 젤리 상태 (idle/anticipation/eating/satisfied), 위치, 애니메이션 파라미터
- 상태 변경 시 관련 컴포넌트만 리렌더링
- Devtools 미들웨어로 디버깅 지원

#### REQ-UBI-004: Canvas 바운더리 유지
시스템은 **항상** 모든 물리 바디가 Canvas 영역 내에 머물도록 경계를 유지해야 한다.

- Canvas 가장자리에 고정된 Static 바디 배치
- 바디가 경계를 벗어나면 위치 보정
- Wall friction 0.0으로 구슬이 벽에 달라붙지 않도록 설정

### Event-Driven Requirements (이벤트 구동)

#### REQ-EVT-001: 구슬 드래그 인터랙션
**WHEN** 사용자가 구슬을 터치/클릭하여 드래그하면, **THEN** 구슬이 포인터를 따라 이동하면서 물리 시뮬레이션이 적용된다.

- Pointer Events API (pointerdown, pointermove, pointerup) 사용
- 드래그 중 구슬은 kinematic 상태로 전환
- 드래그 해제 시 dynamic 상태로 복귀
- 터치와 마우스 입력 모두 지원

#### REQ-EVT-002: 구슬 릴리즈와 자기장 활성화
**WHEN** 사용자가 구슬을 젤리 캐릭터 근처(50px 반경)에서 릴리즈하면, **THEN** 자기장 효과가 활성화되어 구슬이 젤리 중심으로 끌려간다.

- 릴리즈 시점의 구슬 위치와 젤리 중심 간 거리 계산
- 50px 이내 진입 시 Magnetic Force 적용
- Force 크기는 거리에 반비례 (가까울수록 강함)
- 자기장 진입 시 젤리 상태를 Anticipation으로 전이

#### REQ-EVT-003: 구슬 삼키기 충돌 감지
**WHEN** 구슬이 젤리 캐릭터 바디와 충돌하면, **THEN** 삼키기(Swallow) 애니메이션이 트리거된다.

- Matter.js collisionActive 이벤트로 충돌 감지
- 충돌한 구슬을 물리 월드에서 제거
- 젤리 Eating 상태로 전이 (scale 1.2 -> 0.9, 400ms)
- 삼킨 구슬 카운트 증가

#### REQ-EVT-004: 정화 완료 상태 전이
**WHEN** 모든 구슬이 소비되면, **THEN** 젤리가 Satisfied 상태로 전이한다.

- 남은 구슬 수가 0이 되면 전이
- Satisfied 상태에서 눈 `^ ^`, 입 `-` 표정
- 젤리 부드러운 바운스 애니메이션
- 3초 후 Idle 상태로 자동 복귀

#### REQ-EVT-005: 테스트 입력 구슬 생성
**WHEN** 테스트 입력 버튼을 누르면, **THEN** 5-15개의 감정 구슬이 Canvas에 생성된다.

- 구슬 수는 5-15개 범위에서 랜덤 결정
- 구슬 크기는 12px/18px/24px 중 랜덤
- 구슬은 Canvas 상단 랜덤 위치에서 생성
- Pop-in 애니메이션: scale(0->1) 300ms
- 젤리를 Idle -> Anticipation 상태로 전이

#### REQ-EVT-006: 캔버스 터치 인터랙션
**WHEN** 사용자가 Canvas 영역을 터치/클릭하면, **THEN** 해당 위치에서 가장 가까운 구슬이 선택되어 드래그 모드로 진입한다.

- 터치 좌표를 Canvas 좌표계로 변환
- Point query로 가장 가까운 구슬 검색
- 20px 이내의 구슬만 선택 가능
- 멀티터치는 첫 번째 터치만 처리

### State-Driven Requirements (상태 구동)

#### REQ-STA-001: Idle 상태 동작
**IF** 젤리 상태가 Idle이면, **THEN** 호흡 애니메이션이 활성화된다.

- translateY(-12px) 3s ease-in-out infinite 애니메이션
- 눈 표정: `• •`
- 입 표정: `o`
- 구슬이 없는 정적인 상태

#### REQ-STA-002: Anticipation 상태 동작
**IF** 젤리 상태가 Anticipation이면, **THEN** 기대감 표현 애니메이션이 활성화된다.

- 눈 표정: `• •` (약간 확대)
- 가벼운 wobble 애니메이션
- 자기장 반경 내 구슬을 향해 약간 기울임
- 입 표정: `o` (약간 확대)

#### REQ-STA-003: Eating 상태 동작
**IF** 젤리 상태가 Eating이면, **THEN** 삼키기 애니메이션이 재생된다.

- scale(1.2 -> 0.9) 400ms ease-out 애니메이션
- 눈 표정: `u u` (즐거움)
- 입 표정: `o` (크게 벌림)
- 애니메이션 완료 후 Anticipation 또는 Satisfied로 전이
  - 남은 구슬이 있으면 Anticipation 복귀
  - 남은 구슬이 없으면 Satisfied 전이

#### REQ-STA-004: Satisfied 상태 동작
**IF** 젤리 상태가 Satisfied이면, **THEN** 만족감 표현 애니메이션이 활성화된다.

- 눈 표정: `^ ^`
- 입 표정: `-`
- 부드러운 바운스 애니메이션
- 3초 후 Idle 상태로 자동 전이

#### REQ-STA-005: 자기장 인력 적용
**IF** 구슬이 젤리 중심 50px 반경 내에 위치하면, **THEN** 젤리 중심 방향으로 인력이 적용된다.

- Force 방향: 구슬 -> 젤리 중심 단위 벡터
- Force 크기: 거리에 반비례 (최대값 제한)
- 인력은 매 프레임 Matter.js Body.applyForce()로 적용
- 구슬이 충돌할 때까지 인력 유지

#### REQ-STA-006: 중력 스케일 적용
**IF** 물리 엔진이 초기화되면, **THEN** 모든 동적 바디에 Gravity Scale 0.5가 적용된다.

- 젤리 바디: gravity scale 0.5 (천천히 떨어지는 느낌)
- 구슬 바디: gravity scale 0.5 (가벼운 부유감)
- Canvas 크기에 따라 중력 방향 항상 아래쪽 유지

### Unwanted Behavior Requirements (부정 행위 방지)

#### REQ-UNW-001: 프레임레이트 저하 방지
시스템은 물리 시뮬레이션이 **30fps 미만으로 떨어지지 않아야 한다**.

- delta time 측정으로 프레임 드롭 감지
- 과부하 시 구슬 물리 계산 생략 (우선순위 기반)
- 정점 수가 성능에 영향을 주면 최소값(20)으로 자동 조정
- performance.now() 기반 모니터링

#### REQ-UNW-002: 메모리 누수 방지
시스템은 컴포넌트 언마운트 시 Matter.js 엔진 인스턴스를 **누출시키지 않아야 한다**.

- useEffect cleanup에서 Engine.clear() 호출
- 모든 animationFrame 취소 (cancelAnimationFrame)
- 이벤트 리스너 제거 (pointer, resize)
- Runner.stop() 호출로 엔진 루프 중지

#### REQ-UNW-003: Canvas 영역 이탈 방지 및 강한 반사
시스템은 구슬이 **Canvas 영역을 벗어나지 않아야 한다**. 또한 벽면 충돌 시 강한 반발력을 제공하여 젤리가 튕겨져 나와 반대편에 떨어진 구슬에 도달할 수 있어야 한다.

- Canvas 경계에 Static 벽면 바디 배치
- 벽면 두께: 10px (구슬이 통과하지 못하게)
- 월드 경계 업데이트: resize 이벤트 시 재설정
- 벽면 Restitution: 0.8 (강한 반발력으로 젤리가 튕겨져 나옴)
- 목적: 반대편에 떨어진 구슬을 먹을 수 있는 충분한 반발력 확보

#### REQ-UNW-004: 무효 상태 전이 방지
시스템은 정의되지 않은 상태 전이를 **허용하지 않아야 한다**.

- 유효한 전이만 허용:
  - Idle -> Anticipation (구슬 생성 시)
  - Anticipation -> Eating (충돌 시)
  - Eating -> Anticipation (구슬 남은 경우)
  - Eating -> Satisfied (모든 구슬 소비)
  - Satisfied -> Idle (3초 타이머)
- 무효 전이 시도 시 로그 출력 및 상태 유지
- 상태 전이 시 가드 조건 검증

#### REQ-UNW-005: 메인 스레드 블로킹 방지
시스템은 물리 계산이 **메인 스레드를 블로킹하지 않아야 한다**.

- 단일 프레임 물리 계산은 16ms 이내 완료
- 과도한 계산 시 다음 프레임으로 분산
- setTimeout 대신 requestAnimationFrame 사용
- 동기식 무거운 계산 피하기

### Optional Requirements (선택 사항)

#### REQ-OPT-001: 터치 피드백 시각 효과
**가능하면** 구슬 드래그 시 터치 포인트에 ripple 효과를 제공한다.

- 터치 다운 시 반투명 원형 ripple
- 200ms fade-out 애니메이션
- 터치 해제 시 즉시 사라짐

#### REQ-OPT-002: 삼키기 파티클 효과
**가능하면** 구슬이 삼켜질 때 작은 파티클 버스트를 표시한다.

- 5-8개 작은 원형 파티클
- 구슬 색상과 동일한 색상
- 300ms 밖으로 퍼지며 사라짐
- P2에서 고도화 예정

---

## 명세 (Specifications)

### 아키텍처 구조

```
Canvas Layer
+-- PhysicsEngine (Matter.js Wrapper)
|   +-- Engine, Runner, World
|   +-- Collision Events
|   +-- Force Application
+-- JellyRenderer (Canvas 2D Drawing)
|   +-- Soft-body Vertices Drawing
|   +-- Face Expressions
|   +-- Visual Effects (blur, shadow)
+-- BeadRenderer (Canvas 2D Drawing)
|   +-- Circle Bead Drawing
|   +-- Color & Size
|   +-- Magnetic Field Visualization
+-- InteractionHandler (Pointer Events)
    +-- Drag & Drop
    +-- Touch Detection
    +-- Coordinate Mapping
```

### 상태 머신 다이어그램

```
    [구슬 생성]
        |
        v
  +-----------+    [충돌 감지 + 구슬 남음]    +-----------+
  |   Idle    | --------------------------> |Anticipation|
  +-----------+                              +-----------+
        ^                                         |
        |                                    [충돌 감지]
        |                                         v
  +-----------+    [3초 타이머]           +-----------+
  | Satisfied | <----------------------- |  Eating   |
  +-----------+    [모든 구슬 소비]       +-----------+
                   [충돌 감지 + 구슬 남음] --> Anticipation
```

### 타입 정의

```typescript
// 젤리 상태 타입
type JellyState = 'idle' | 'anticipation' | 'eating' | 'satisfied';

// 젤리 상태 머신 전이 맵
type TransitionMap = {
  idle: ['anticipation'];
  anticipation: ['eating'];
  eating: ['anticipation', 'satisfied'];
  satisfied: ['idle'];
};

// 물리 파라미터
interface PhysicsConfig {
  elasticity: 0.7;
  damping: 0.3;
  friction: 0.1;
  gravityScale: 0.5;
  magneticFieldRadius: 50;
}

// 감정 구슬
interface EmotionBead {
  id: string;
  body: Matter.Body;
  size: 12 | 18 | 24;
  color: string;
  createdAt: number;
}

// 젤리 페이스 표정
interface JellyFace {
  idle: { eyes: string; mouth: string };
  anticipation: { eyes: string; mouth: string };
  eating: { eyes: string; mouth: string };
  satisfied: { eyes: string; mouth: string };
}
```

### 추적 가능성 태그 (Traceability Tags)

| TAG | 요구사항 | 관련 파일 |
|-----|---------|----------|
| TAG-PHYSICS-ENGINE | REQ-UBI-001, REQ-UBI-002 | lib/physics/engine.ts |
| TAG-JELLY-STATE | REQ-STA-001~004, REQ-UNW-004 | stores/jellyStore.ts |
| TAG-BEAD-PHYSICS | REQ-UBI-004, REQ-EVT-001~004 | components/beads/ |
| TAG-MAGNETIC | REQ-EVT-002, REQ-STA-005 | lib/physics/collisions.ts |
| TAG-INTERACTION | REQ-EVT-001, REQ-EVT-006 | hooks/usePhysics.ts |
| TAG-PERFORMANCE | REQ-UNW-001, REQ-UNW-005 | lib/physics/engine.ts |
| TAG-MEMORY | REQ-UNW-002 | components/jelly/PhysicsEngine.tsx |
| TAG-VISUAL | REQ-UBI-002, REQ-STA-001~004 | components/jelly/JellyRenderer.tsx |

---

## 제외 범위 (Out of Scope)

다음 항목은 P0 범위에서 **제외**하며, 이후 단계에서 구현한다.

| 항목 | 대상 단계 | 사유 |
|------|----------|------|
| AI 감정 분석 (GPT-4o-mini) | P1 | 외부 API 의존성, P0에서는 stub 사용 |
| 토스 브릿지 API (haptic, share) | P1 | 플랫폼 의존성 |
| 감정 기반 색상 전환 | P1 | AI 분석 결과 필요 |
| 배경 크로스페이드 | P1 | 감정 분석 결과 필요 |
| 파티클 효과 (고도화) | P2 | 시각적 폴리싱 |
| BGM | P2 | 오디오 시스템 설계 필요 |
| 다크 모드 (완전 지원) | P1 | 기본 지원만 P0 포함 |
| 텍스트 입력 UI | P1 | P0에서는 테스트 버튼 사용 |
| 공유 기능 | P1 | 토스 브릿지 필요 |
| 접근성 (스크린 리더) | P2 | Canvas 한계, 대체 UI 필요 |
| 다국어 지원 | P2 | 한국어 우선 |

---

## HISTORY

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-05-08 | 1.0.0 | 최초 SPEC 생성 |
| 2026-05-08 | 1.1.0 | REQ-UNW-003: 벽면 Restitution 0.3 -> 0.8 변경. "강한 반발력으로 젤리가 튕겨져 나옴" 목적 추가. 반대편 구슬 도달 가능성 확보. |
