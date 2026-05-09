## Task Decomposition
SPEC: SPEC-JELLY-002

### M1: AI 감정 분석 + 텍스트 입력 UI (Priority High)

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| M1-T1 | 감정 분석 타입 정의 | REQ-AI-001 | - | src/types/emotion.ts (new) | pending |
| M1-T2 | Zod 스키마 정의 | REQ-AI-001 | M1-T1 | src/lib/ai/schemas.ts (new) | pending |
| M1-T3 | 감정 분석 유틸리티 | REQ-AI-001,003 | M1-T2 | src/lib/ai/analyzer.ts (new) | pending |
| M1-T4 | API Route Handler | REQ-AI-001,004 | M1-T3 | src/app/api/analyze/route.ts (new) | pending |
| M1-T5 | jellyStore 확장 | REQ-AI-002,005 | M1-T1 | src/stores/jellyStore.ts (mod) | pending |
| M1-T6 | EmotionInput 재작성 | REQ-INP-001~004 | M1-T5 | src/components/input/EmotionInput.tsx (mod) | pending |
| M1-T7 | TestInput 제거 | Cleanup | M1-T6 | src/components/input/TestInput.tsx (del) | pending |
| M1-T8 | 홈 페이지 교체 | REQ-INP-001 | M1-T6 | src/app/home/page.tsx (mod) | pending |
| M1-T9 | M1 단위 테스트 | All M1 REQs | M1-T6 | __tests__/lib/ai/*.test.ts, __tests__/components/input/EmotionInput.test.tsx (new) | pending |

### M2: 감정 기반 색상 전환 (Priority High)

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| M2-T1 | jellyStore emotionColor 추가 | REQ-COL-001,003 | M1 완료 | src/stores/jellyStore.ts (mod) | pending |
| M2-T2 | JellyRenderer 감정 색상 | REQ-COL-001 | M2-T1 | src/components/jelly/JellyRenderer.tsx (mod) | pending |
| M2-T3 | CSS transition 800ms | REQ-COL-002 | M2-T2 | src/components/jelly/JellyRenderer.tsx (mod) | pending |
| M2-T4 | 글로우 색상 동기화 | REQ-COL-001 | M2-T2 | src/components/jelly/JellyRenderer.tsx (mod) | pending |
| M2-T5 | M2 단위 테스트 | All M2 REQs | M2-T2 | __tests__/components/jelly/JellyRenderer.test.tsx (new) | pending |

### M3: 다크 모드 테마 (Priority Medium)

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| M3-T1 | themeStore 생성 | REQ-THM-001~003 | - | src/stores/themeStore.ts (new) | pending |
| M3-T2 | 다크 모드 CSS 팔레트 | REQ-THM-005 | - | src/app/globals.css (mod) | pending |
| M3-T3 | ThemeToggle 컴포넌트 | REQ-THM-001 | M3-T1 | src/components/ui/ThemeToggle.tsx (new) | pending |
| M3-T4 | 레이아웃 테마 적용 | REQ-THM-002,003 | M3-T1 | src/app/layout.tsx (mod) | pending |
| M3-T5 | BottomNav 다크 모드 | REQ-THM-005 | M3-T2 | src/components/layout/BottomNav.tsx (mod) | pending |
| M3-T6 | EmotionInput 다크 모드 | REQ-THM-005 | M3-T2 | src/components/input/EmotionInput.tsx (mod) | pending |
| M3-T7 | M3 단위 테스트 | All M3 REQs | M3-T3 | __tests__/stores/themeStore.test.ts, __tests__/components/ui/ThemeToggle.test.tsx (new) | pending |

### M4: 토스 브릿지 연동 (Priority Medium)

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| M4-T1 | Toss Bridge 타입 정의 | REQ-TOS-001,002 | - | src/types/toss.ts (new) | pending |
| M4-T2 | tossStore 생성 | REQ-TOS-001,002 | M4-T1 | src/stores/tossStore.ts (new) | pending |
| M4-T3 | Bridge 유틸리티 | REQ-TOS-001~003 | M4-T1 | src/lib/toss/bridge.ts (new) | pending |
| M4-T4 | 앱 초기화 Bridge 연결 | REQ-TOS-001 | M4-T3 | src/app/layout.tsx (mod) | pending |
| M4-T5 | WebView UI 분기 | REQ-TOS-003 | M4-T2 | src/app/home/page.tsx (mod) | pending |
| M4-T6 | Bridge 폴백 처리 | REQ-TOS-003 | M4-T3 | src/lib/toss/bridge.ts (mod) | pending |
| M4-T7 | M4 단위 테스트 | All M4 REQs | M4-T3 | __tests__/lib/toss/bridge.test.ts, __tests__/stores/tossStore.test.ts (new) | pending |
