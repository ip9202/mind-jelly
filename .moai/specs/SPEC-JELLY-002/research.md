# Research: SPEC-JELLY-002 P1 단계

## 1. 현재 감정 시스템

### 감정 색상 매핑 (`src/lib/constants/emotion.ts`)
- 5개 감정 색상 정의: joy=#FFD93D, sadness=#6BCB77, anger=#FF6B6B, fear=#4D96FF, disgust=#A8E6CF
- 구슬 색상 팔레트: 8개 색상 (BEAD_COLORS)
- 젤리 기본 색상: #FFD1DC (항상 동일)
- **P1 필요**: 감정에 따른 젤리 색상 동적 전환

### 감정 입력 (`src/components/input/EmotionInput.tsx`)
- 5개 감정 버튼 (기쁨/슬픔/분노/공포/혐오)
- 버튼 클릭 시 Math.random()으로 5~15개 구슬 생성
- `jellyStore.incrementBeadCount()` + `setLastEmotion()` 호출
- **P1 필요**: 텍스트 입력 → AI 감정 분석 → 감정 자동 감지

### 테스트 입력 (`src/components/input/TestInput.tsx`)
- P0용 하드코딩 입력, EmotionInput으로 대체된 상태

## 2. 젤리 렌더러 (`src/components/jelly/JellyRenderer.tsx`)
- `<div>` 기반 렌더링 (Canvas 아님, CSS + inline style)
- 고정 색상 #FFD1DC, CSS box-shadow로 볼륨감
- 4개 표정: idle(○), eating(●), satisfied(∪), anticipation(●)
- **P1 필요**: 감정 기반 동적 색상, 부드러운 색상 전환 애니메이션

## 3. 상태 관리 (`src/stores/jellyStore.ts`)
- 상태 머신: idle → anticipation → eating → satisfied → idle
- 상태별 표정: STATE_FACES 맵
- lastEmotion: string (마지막 감정 타입)
- beadCount: number (현재 구슬 수)
- **P1 필요**: 감정 분석 결과 저장, 감정 히스토리, 젤리 색상 상태

## 4. 물리 엔진
- `engine.ts`: Matter.js 초기화
- `forces.ts`: 자기장 힘 적용
- `collisions.ts`: 구슬-젤리 충돌 감지, 상태 전이 트리거
- `home/page.tsx`: 전체 오케스트레이션 (60fps 렌더링 루프)

## 5. 페이지 구조
- `/` (page.tsx): 스플래시/랜딩
- `/home`: 메인 젤리 + 물리엔진 + 감정 입력
- `/diary`: 다이어리 (빈 페이지)
- `/onboarding`: 3단계 (welcome/howto/ready)
- `/settings`: 설정 (빈 페이지)
- `BottomNav.tsx`: 하단 네비게이션 (jelly/diary/settings)

## 6. 테마/스타일링
- Tailwind v4, darkMode: "class" 전략 설정됨
- Material Design 3 색상 시스템 (primary, surface, error 등)
- 젤리 감정 색상 정의: jelly-base, jelly-anger, jelly-sad, jelly-tired
- 폰트: Plus Jakarta Sans, Dongle, Gowun Dodum, Gamja Flower
- `globals.css`: 커스텀 CSS 변수, star-sparkle 애니메이션
- **P1 필요**: dark mode 토글, dark 색상 팔레트, 시스템 설정 연동

## 7. 토스 브릿지
- **코드베이스에 참조 없음** - 완전히 새로 구현 필요
- 메모리에 기록: 토스 앱인토스 WebView 환경에서 실행
- 필요 기능: 사용자 정보 읽기, 인증 토큰, 기기 정보

## 8. 타입 정의 (`src/types/physics.ts`)
- JellyState: 'idle' | 'anticipation' | 'eating' | 'satisfied'
- JellyFace: { eyes: string; mouth: string }
- **P1 필요**: EmotionResult, AnalysisResponse 등 신규 타입

## 9. 의존성 (package.json)
- Next.js 16.2.6, React 19.2, Zustand 5.0, Matter.js 0.20, Tailwind v4
- **P1 필요**: AI API 클라이언트 (openai/sdk 또는 fetch)

## 10. 테스트
- `__tests__/components/beads/BeadGroup.test.tsx`
- `__tests__/lib/constants/physics.test.ts`
- `__tests__/lib/physics/forces.test.ts`
- Jest + Testing Library 설정 완료

## 11. 주요 위험/제약
- AI API 호출 시 비용/지연 (GPT-4o-mini 사용)
- 토스 브릿지 API 문서 필요 (현재 없음)
- 물리엔진 렌더링 루프 내 색상 전환 시 성능 영향 가능
- 다크모드 전환 시 Canvas/SVG 색상 동기화

## 12. P1 기능별 영향 범위

| 기능 | 수정 파일 | 신규 파일 |
|------|-----------|-----------|
| AI 감정 분석 | EmotionInput, jellyStore | lib/ai/analyzer, types/emotion |
| 젤리 색상 전환 | JellyRenderer, jellyStore, emotion.ts | - |
| 텍스트 입력 UI | EmotionInput (재작성) | - |
| 토스 브릿지 | layout.tsx | lib/toss/bridge |
| 다크모드 | globals.css, tailwind.config, layout.tsx | components/ui/ThemeToggle |
