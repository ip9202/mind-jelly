# 프로젝트 구조: 마음 젤리 (Mind Jelly)

## 아키텍처 패턴
마음 젤리는 Next.js 14+ App Router를 기반으로 한 현대적인 React 기반 아키텍처를 채택하고 있습니다. 이 아키텍처는 성능, 개발자 경험, 유지보수성을 극대화하도록 설계되었으며, 서버 컴포넌트와 클라이언트 컴포넌트의 명확한 분리를 통해 최적화된 렌더링 전략을 구현합니다. 전체적인 구조는 다음과 같은 핵심 원칙을 따릅니다:

- 컴포넌트 기반 아키텍처로 재사용성과 유지보수성 확보
- 상태 관리는 Zustand를 사용한 단일 소스 of truth 패턴
- 물리 엔진은 Matter.js를 통한 독립적인 시뮬레이션 계층
- API 계층은 Toss Bridge와 감정 분석 API와의 통합
- 접근성과 반응성을 위한 프로그레시브 웹 앱(PWA) 접근

## 디렉토리 구조
```
mind-jelly/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css        # 전역 스타일 및 CSS 변수
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   └── api/                # API 라우트 (클라이언트 사이드)
│   │       └── emotion/        # 감정 분석 API 핸들러
│   ├── components/             # React 컴포넌트
│   │   ├── jelly/              # 젤리 캐릭터 + 물리 엔진
│   │   │   ├── JellyCharacter.tsx   # 젤리 메인 캐릭터 컴포넌트
│   │   │   ├── PhysicsEngine.tsx    # Matter.js 엔진 래퍼
│   │   │   ├── JellyState.tsx       # 상태 머신 로직
│   │   │   └── JellyAnimation.tsx   # 애니메이션 컨트롤러
│   │   ├── beads/              # 감정 구슬 컴포넌트
│   │   │   ├── EmotionBead.tsx      # 개별 구슬 컴포넌트
│   │   │   ├── BeadGroup.tsx        # 구슬 그룹 관리
│   │   │   └── BeadPhysics.tsx     # 구슬 물리 상호작용
│   │   ├── input/              # 스트레스 텍스트 입력
│   │   │   ├── StressInput.tsx      # 텍스트 입력 컴포넌트
│   │   │   ├── InputArea.tsx       # 입력 영역 UI
│   │   │   └── CharacterPreview.tsx # 입력 시 캐릭터 미리보기
│   │   ├── shared/             # 공유 UI 컴포넌트
│   │   │   ├── Button.tsx          # 재사용 가능 버튼
│   │   │   ├── Modal.tsx           # 모달 컴포넌트
│   │   │   ├── LoadingSpinner.tsx  # 로딩 인디케이터
│   │   │   └── Toast.tsx           # 알림 컴포넌트
│   │   ├── ui/                 # shadcn/ui 기반 컴포넌트
│   │   │   ├── theme/              # 테마 설정
│   │   │   └── components/         # 기본 UI 컴포넌트
│   ├── hooks/                  # React 커스텀 훅
│   │   ├── useJellyState.ts    # 젤리 상태 관리 훅
│   │   ├── useEmotionAnalysis.ts # 감정 분석 훅
│   │   ├── usePhysics.ts       # 물리 엔진 훅
│   │   ├── useTossBridge.ts    # 토스 브릿지 훅
│   │   └── useLocalStorage.ts   # 로컬 저장소 훅
│   ├── stores/                 # Zustand 상태 관리
│   │   ├── jellyStore.ts       # 젤리 상태 저장소
│   │   ├── userStore.ts        # 사용자 정보 저장소
│   │   ├── settingsStore.ts    # 설정 저장소
│   │   └── analyticsStore.ts   # 분석 데이터 저장소
│   ├── lib/                    # 유틸리티 및 헬퍼
│   │   ├── edge/               # Edge Function 유틸리티
│   │   │   └── rateLimiter.ts  # Edge Function용 인메모리 rate limiter
│   │   ├── physics/            # Matter.js 엔진 설정
│   │   │   ├── engine.ts           # 물리 엔진 초기화
│   │   │   ├── constraints.ts      # 물리 제약 조건
│   │   │   └── collisions.ts       # 충돌 감지
│   │   ├── emotion/            # AI 감정 분석
│   │   │   ├── analyzer.ts         # 감정 분석 핵심 로직
│   │   │   ├── emotionTypes.ts     # 감정 타입 정의
│   │   │   └── emotionColors.ts    # 감정별 색상 정의
│   │   ├── toss/               # Toss Bridge API
│   │   │   ├── bridge.ts           # 브릿지 연동 로직
│   │   │   ├── auth.ts             # 인증 처리
│   │   │   └── share.ts            # 공유 기능
│   │   ├── utils/              # 일반 유틸리티
│   │   │   ├── debounce.ts         # 디바운스 함수
│   │   │   ├── validators.ts       # 입력 검증
│   │   │   └── formatters.ts       # 데이터 포맷터
│   │   └── constants/          # 상수 정의
│   │       ├── emotion.ts          # 감정 관련 상수
│   │       ├── physics.ts          # 물리 관련 상수
│   │       └── ui.ts               # UI 관련 상수
│   ├── styles/                 # 전역 스타일 + 디자인 토큰
│   │   ├── globals.css          # 전역 CSS 변수
│   │   ├── theme.css            # 테마 스타일
│   │   ├── animations.css       # 애니메이션 정의
│   │   └── components.css       # 컴포넌트별 스타일
│   ├── types/                  # TypeScript 타입 정의
│   │   ├── emotion.d.ts         # 감정 관련 타입
│   │   ├── jelly.d.ts          # 젤리 관련 타입
│   │   ├── physics.d.ts        # 물리 관련 타입
│   │   ├── toss.d.ts           # 토스 관련 타입
│   │   └── api.d.ts            # API 관련 타입
│   └── services/               # API 서비스 계층
│       ├── emotionService.ts   # 감정 분석 서비스
│       ├── analyticsService.ts # 분석 데이터 서비스
│       └── authService.ts      # 인증 서비스
├── public/                    # 정적 자산
│   ├── favicon.ico            # 파비콘
│   ├── icons/                 # 아이콘 파일
│   │   ├── jelly.svg          # 젤리 캐릭터 아이콘
│   │   ├── bead.svg           # 구슬 아이콘
│   │   └── share.svg          # 공유 아이콘
│   ├── images/                # 이미지 자산
│   │   ├── splash.png         # 스플래시 이미지
│   │   └── placeholder.png    # 플레이스홀더
│   └── fonts/                 # 폰트 파일
│       ├── toss-sans.woff2   # 토스 산스 폰트
│       └── nanum-round.woff2 # 나눔스퀘어라운드
├── .moai/                     # MoAI-ADK 구성
│   ├── specs/                 # 사양 문서
│   │   └── SPEC-MJ-001/      # 마음 젤리 사양
│   │       ├── spec.md        # 사양 문서
│   │       └── acceptance.md  # 인수 기준
│   ├── docs/                  # 문서
│   │   ├── product.md         # 제품 문서
│   │   ├── structure.md       # 구조 문서
│   │   ├── tech.md           # 기술 문서
│   │   └── api.md            # API 문서
│   ├── config/                # 설정 파일
│   │   ├── sections/          # 섹션별 설정
│   │   │   ├── user.yaml     # 사용자 설정
│   │   │   ├── language.yaml # 언어 설정
│   │   │   ├── quality.yaml  # 품질 설정
│   │   │   └── design.yaml   # 디자인 설정
│   │   └── harness.yaml      # 하네스 설정
│   ├── project/               # 프로젝트 관리
│   │   └── brand/             # 브랜드 컨텍스트
│   │       ├── brand-voice.md # 브랜드 목소리
│   │       ├── visual-identity.md # 시각적 정체성
│   │       └── target-audience.md # 타겟 사용자
│   └── state/                 # 상태 관리
│       └── checkpoints/       # 체크포인트
│           └── docs/          # 문서 체크포인트
├── .github/                   # GitHub 워크플로우
│   └── workflows/             # CI/CD 워크플로우
│       ├── ci.yml            # CI 워크플로우
│       └── deploy.yml        # 배포 워크플로우
├── docs/                      # 개발 문서
│   ├── api/                  # API 문서
│   ├── architecture/         # 아키텍처 문서
│   ├── deployment/           # 배포 문서
│   └── troubleshooting/      # 문제 해결 가이드
├── supabase/                  # Supabase 관련 파일
│   └── functions/            # Edge Functions
│       ├── toss-login/       # 토스 로그인 Edge Function
│       ├── toss-disconnect/  # 토스 계정 연결 해제 Edge Function
│       └── recover-session/  # 기기 변경 시 세션 자동 복구 Edge Function
├── __tests__/                 # 테스트 파일 (Jest)
│   ├── lib/
│   │   └── supabase/
│   │       └── auth-recover.test.ts  # initSupabaseSession 복구 경로 테스트
│   └── stores/
│       └── tossStore-idempotent.test.ts  # tossStore 멱등성 테스트
├── tests/                     # 테스트 파일
│   ├── components/           # 컴포넌트 테스트
│   ├── hooks/                # 훅 테스트
│   ├── services/             # 서비스 테스트
│   ├── integration/          # 통합 테스트
│   └── utils/                # 유틸리티 테스트
├── package.json              # 의존성 정의
├── next.config.js            # Next.js 설정
├── tailwind.config.js        # Tailwind CSS 설정
├── tsconfig.json             # TypeScript 설정
├── jest.config.js            # Jest 테스트 설정
└── .eslintrc.json            # ESLint 설정
```

## 핵심 모듈 설명

### 1. 젤리 캐릭터 모듈 (components/jelly/)
**JellyCharacter.tsx**: 젤리 캐릭터의 주요 컴포넌트로, Soft-body 물리 시뮬레이션과 상호작용 로직을 관리합니다. Matter.js 엔진과 연동하여 20-30개의 정점으로 구성된 유연한 물리 모델을 구현하며, 사용자 상호작용에 따른 실시간 반응을 처리합니다.

**PhysicsEngine.tsx**: Matter.js 엔진을 래핑한 물리 시뮬레이션 엔진으로, 충돌 감지, 중력 설정, 물리 제약 조건 등의 물리 시스템을 관리합니다. 성능 최적화를 위해 requestAnimationFrame을 사용한 렌더링 루프를 구현합니다.

**JellyState.tsx**: 젤리의 상태 머신을 관리하는 모듈로, Idle → Anticipation → Eating → Satisfied의 4단계 상태 전이 로직을 처리합니다. 각 상태에 대한 애니메이션과 상호작용 규칙을 정의합니다.

**JellyAnimation.tsx**: 젤리의 애니메이션을 컨트롤하는 모듈로, 상태 변화에 따른 애니메이션 트랜지션을 관리합니다. CSS Transform과 물리 속성을 결합하여 부드러운 시각적 효과를 구현합니다.

### 2. 감정 구슬 모듈 (components/beads/)
**EmotionBead.tsx**: 개별 감정 구슬 컴포넌트로, Matter.js Circle 바디를 기반으로 합니다. 구슬의 크기(12px/18px/24px 랜덤), 색상(감정별 고유 색상), 물리 속성을 관리하며, 젤리와의 상호작용 로직을 포함합니다.

**BeadGroup.tsx**: 여러 구슬을 그룹으로 관리하는 컴포넌트로, 구슬의 생성, 분포, 상호작용을 조율합니다. 자기장 효과(50px 반경)를 구현하여 구슬들이 자연스럽게 움직이도록 합니다.

**BeadPhysics.tsx**: 구슬들의 물리 상호작용을 처리하는 모듈로, 구슬 간의 충돌, 중력, 마창 등의 물리 법칙을 적용합니다. 성능 최적화를 위해 물리 계산을 일괄 처리합니다.

### 3. 상태 관리 모듈 (stores/)
**jellyStore.ts**: 젤리 상태를 관리하는 Zustand 저장소로, 현재 상태, 위치, 속성 등을 중앙 집중식으로 관리합니다. 상태 변화 알림을 통한 반응적 UI 업데이트를 지원합니다.

**userStore.ts**: 사용자 정보와 일일 통계를 관리하는 저장소로, 사용자 ID, 감정 정화 횟수, 마지막 감정 데이터 등을 저장합니다. Toss 인증 정보와 연동됩니다.

**settingsStore.ts**: 앱 설정을 관리하는 저장소로, 햅틱 활성화, 테마 색상, 접근성 설정 등을 관리합니다. 로컬 저장소와 동기화됩니다.

### 4. 유틸리티 모듈 (lib/)
**physics/engine.ts**: Matter.js 엔진의 초기화 설정을 담당하는 모듈로, 엔진 생성, 월드 설정, 렌더러 구성 등의 기능을 제공합니다. 성능 최적화를 위한 설정을 포함합니다.

**emotion/analyzer.ts**: GPT-4o-mini를 통한 감정 분석 로직을 처리하는 모듈로, 텍스트 입력을 감정으로 분석하고 구슬 변환 로직을 수행합니다. API 호출 최적화와 오류 처리를 포함합니다.

**toss/bridge.ts**: 토스 브릿지 연동을 담당하는 모듈로, 인증, 공유, 햅틱 기능을 처리합니다. 토스 API와의 통신 레이어를 제공합니다.

### 5. 훅 모듈 (hooks/)
**useJellyState.ts**: 젤리 상태 관리를 위한 커스텀 훅으로, 상태 전이 애니메이션과 상호작용 로직을 캡슐화합니다. 상태 관리 로직과 컴포넌트 분리를 지원합니다.

**useEmotionAnalysis.ts**: 감정 분석 API 호출을 위한 훅으로, API 상태 관리, 로딩 상태, 오류 처리 등을 캡슐화합니다. 분석 결과 캐싱과 재시도 로직을 포함합니다.

## 진입점
### 1. 애플리케이션 진입점
- **src/app/layout.tsx**: Next.js 앱의 루트 레이아웃으로, 글로벌 스타일, 폰트, 메타데이터를 설정합니다.
- **src/app/page.tsx**: 메인 페이지로, 젤리 캐릭터, 입력 영역, 상태 관리를 초기화합니다.

### 2. 개발 진입점
- **src/main.ts**: 개발 환경에서의 진입점 (개발 중)
- **src/index.ts**: 프로덕션 환경에서의 진입점 (개발 중)

### 3. 빌드 진입점
- **next.config.js**: Next.js 빌드 설정으로, 코드 스플리팅, 최적화, 플러그인 설정을 정의합니다.
- **tailwind.config.js**: Tailwind CSS 설정으로, 커스텀 테마, 플러그인, 설정을 정의합니다.

## 상태 관리 패턴
- **단일 소스 of truth**: Zustand stores를 통해 모든 상태를 중앙 집중식으로 관리
- **상태 계층화**: 글로벌 상태(사용자 설정), 로컬 상태(젤리 상태), 캐시 상태(API 결과)로 분리
- **반응적 업데이트**: 상태 변화 시 자동으로 관련 UI 업데이트
- **지속성**: 중요한 상태는 로컬 저장소에 영구 저장

## 컴포넌트 설계 패턴
- **컨테이너/프레젠테이션 분리**: 비즈니스 로직과 렌더링 로직 분리
- **컴포지션 패턴**: 작은 컴포넌트를 조합하여 큰 컴포넌트 구성
- **커스텀 훅**: 로직 재사용을 위한 커스텀 훅 추상화
- **제어 컴포넌트**: 상태 제어를 위한 제어된 컴포넌트 패턴

## 성능 최적화 전략
- **코드 스플리팅**: Next.js 동적 임포트를 통한 코드 분할
- **이미지 최적화**: Next.js Image 컴포넌트를 통한 이미지 최적화
- **메모이제이션**: React.memo, useMemo, useCallback을 통한 불필요한 렌더링 방지
- **지연 로딩**: 컴포넌트와 리소스의 지연 로딩 구현
- **물리 엔진 최적화**: Matter.js 엔진의 성능 최적화 설정

## 접근성 지원
- **스크린 리더 호환**: ARIA 레이블과 역할을 통한 스크린 리더 지원
- **키보드 네비게이션**: 전체적인 키보드 네비게이션 지원
- **색상 대비**: WCAG 2.1 표준을 만족하는 색상 대비 비율
- **반응형 디자인**: 다양한 화면 크기와 장치 지원