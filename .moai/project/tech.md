# 기술 스택: 마음 젤리 (Mind Jelly)

## 개요
마음 젤리는 현대적인 웹 기술 스택을 기반으로 한 고성능 웹 애플리케이션으로, React 18+와 Next.js 14+를 핵심 프레임워크로 사용합니다. 물리 시뮬레이션을 위한 Matter.js, 상태 관리를 위한 Zustand, 애니메이션을 위한 Framer Motion 등의 최신 기술을 결합하여 사용자에게 매끄럽고 반응성 높은 경험을 제공합니다. 전체 아키텍처는 성능, 확장성, 유지보수성을 고려하여 설계되었으며, Toss 생태계와의 원활한 통합을 위해 최적화된 API 계층을 구현합니다.

## 프론트엔드
| 역할 | 기술 | 버전 | 목적 |
|------|------|------|------|
| Framework | Next.js (App Router) | 14.2+ | React 기반 전체 프레임워크로 서버 사이드 렌더링과 정적 사이트 생성 지원 |
| UI Library | React | 18.3+ | 컴포넌트 기반 UI 개발 라이브러리 |
| State Management | Zustand | 4.5+ | 경량 상태 관리 라이브러리로 React 컴포넌트 간 상태 공간 최소화 |
| Animation | Framer Motion | 10.17+ | 웹 애니메이션을 위한 React 전용 라이브러리로 물리적 효과 구현 |
| Physics Engine | Matter.js | 0.19+ | 2D 물리 엔진으로 Soft-body 시뮬레이션 및 충돌 감지 |
| Styling | Tailwind CSS | 3.4+ | 유틸리티 퍼스트 CSS 프레임워크로 빠른 스타일링 지원 |
| CSS Variables | CSS Custom Properties | - | 동적 테마 관리와 접근성을 위한 CSS 변수 |
| Icons | Lucide React | 0.328+ | 현대적 아이콘 라이브러리로 일관된 디자인 시스템 |
| Form Handling | React Hook Form | 7.49+ | 성능 최적화된 폼 처리와 유효성 검사 |
| HTTP Client | Axios | 1.6+ | Promise 기반 HTTP 클라이언트로 API 통신 |
| TypeScript | TypeScript | 5.3+ | 정적 타입 검증으로 코드 안정성과 개발자 경험 향상 |
| Build Tool | Vite | 5.1+ | 빠른 개발 서버와 최적화된 빌드 프로세스 |

## 백엔드 서비스
| 서비스 | 기술 | 버전 | 목적 |
|--------|------|------|------|
| Emotion Analysis | OpenAI GPT-4o-mini | - | 텍스트 기반 감정 분석 AI 서비스 |
| Toss Bridge Integration | Toss Bridge API | - | 토스 생태계 연동을 위한 인증 및 공유 기능 |
| Analytics Tracking | Google Analytics 4 | - | 사용자 행동 추적 및 분석 데이터 수집 |
| Crash Reporting | Sentry | 7.92+ | 실시간 오류 추적 및 모니터링 |
| Performance Monitoring | Vercel Analytics | - | 애플리케이션 성능 모니터링 |
| A/B Testing | Vercel Flags | - | 기능별 A/B 테스트 지원 |

## 개발 환경 요구사항
### 시스템 요구사항
- **운영체제**: macOS 12+, Windows 10+, Ubuntu 20.04+
- **메모리**: 최소 8GB RAM, 권장 16GB RAM
- **저장공간**: 최소 4GB 여유 공간
- **네트워크**: 안정적인 인터넷 연결

### 개발 도구
- **Node.js**: 20.11.0 이상 (LTS 버전 권장)
- **npm**: 10.2.3 이상 또는 yarn 1.22.19+ 또는 pnpm 8.15.0+
- **Git**: 2.39.0 이상
- **VS Code**: 1.85.0 이상 (권장 확장 프로그램 포함)
- **Chrome DevTools**: 최신 버전

### 필수 개발 환경 설정
```bash
# Node.js 버전 확인
node --version  # v20.11.0 이상

# npm 버전 확인
npm --version  # 10.2.3 이상

# Git 설치 확인
git --version  # 2.39.0 이상

# 프로젝트 클론
git clone <repository-url>
cd mind-jelly

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 필요한 API 키 추가

# 개발 서버 실행
npm run dev
```

## 빌드 및 실행
### 스크립트
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

### 개발 서버 실행
```bash
npm run dev
```
- 개발 서버는 http://localhost:3000 에서 실행
- 핫 리로딩 지원 및 실시간 변경 반영
- 개발 모드에서는 디버깅 정보와 경고 표시

### 프로덕션 빌드
```bash
npm run build
```
- 최적화된 프로덕션 빌드 생성
- 코드 스플리팅 및 자동 최적화 적용
- 정적 자산 최적화 및 캐싱 전략 구현

### 프로덕션 실행
```bash
npm start
```
- 프로덕션 환경에서 실행
- 성능 최적화 및 에러 핸들링 적용
- 로깅 모니터링 활성화

## 배포 환경
### 배포 플랫폼
- **주요 배포**: Vercel (권장)
- **알터너티브**: Netlify, AWS Amplify
- **모바일 배포**: Capacitor (향후 확장)

### Vercel 배포 설정
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs"
}
```

### 환경 변수 구성
```env
# OpenAI API 키
OPENAI_API_KEY=your_openai_api_key

# Google Analytics
GOOGLE_ANALYTICS_ID=your_ga_id

# Sentry
SENTRY_DSN=your_sentry_dsn

# Toss Bridge (배포 환경)
TOSS_BRIDGE_ID=your_toss_bridge_id
TOSS_BRIDGE_SECRET=your_toss_bridge_secret

# 개발 환경
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Vercel
        uses: vercel/action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 외부 API
### OpenAI GPT-4o-mini API
```typescript
// lib/emotion/analyzer.ts
const analyzeEmotion = async (text: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: '사용자의 텍스트를 분노, 슬픔, 지침, 불안, 허무 중 하나로 분류해주세요. JSON 형식으로 응답해주세요.'
      }, {
        role: 'user',
        content: text
      }],
      max_tokens: 100,
      temperature: 0.1
    })
  });
  
  return response.json();
};
```

### Toss Bridge API
```typescript
// lib/toss/bridge.ts
const shareToToss = async (content: string) => {
  const response = await fetch('https://api.toss.im/v1/share', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOSS_BRIDGE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'text',
      content,
      app: 'mind-jelly'
    })
  });
  
  return response.json();
};

const triggerHaptic = async (type: 'light' | 'success') => {
  // 토스 브릿지를 통한 햅틱 피드백 트리거
};
```

### Google Analytics 4
```typescript
// lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();
const trackEmotionCleansed = (emotion: string) => {
  logEvent(analytics, 'emotion_cleansed', {
    emotion_type: emotion,
    timestamp: new Date().toISOString()
  });
};
```

## 보안 고려사항
### 데이터 보호
- **개인정보 처리**: 사용자 텍스트 데이터는 분즉 즉시 파기되며 저장하지 않음
- **API 키 관리**: 환경 변수를 통한 API 키 관리, 절대로 코드에 하드코딩하지 않음
- **HTTPS 통신**: 모든 API 통신은 HTTPS를 통한 암호화된 연결 사용
- **CSP 설정**: Content Security Policy를 통한 XSS 공격 방지

### 입력 검증
```typescript
// lib/utils/validators.ts
const validateEmotionInput = (text: string): ValidationResult => {
  if (text.length === 0) {
    return { valid: false, error: '텍스트를 입력해주세요.' };
  }
  
  if (text.length > 100) {
    return { valid: false, error: '100자 이내로 입력해주세요.' };
  }
  
  if (containsProfanity(text)) {
    return { valid: false, error: '부적절한 단어가 포함되어 있습니다.' };
  }
  
  return { valid: true };
};
```

### 인증 및 권한 관리
```typescript
// lib/auth/authService.ts
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

const requireAuth = () => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('인증이 필요합니다.');
  }
  return user;
};
```

### 취약점 방지
- **XSS 방지**: React의 내부적 XSS 방지 메커니즘 사용
- **CSRF 방지**: CSRF 토큰 사용 및 CORS 설정
- **SQL 인젝션**: 데이터베이스 사용 시 매개변수화된 쿼리 사용
- **DDoS 방지**: API 호출 제한 및 rate limiting 구현

## 성능 최적화
### 코드 스플리팅
```typescript
// 동적 컴포넌트 로딩
const JellyCharacter = dynamic(() => import('./JellyCharacter'), {
  loading: () => <LoadingSpinner />,
  ssr: false // 물리 엔진은 클라이언트 사이드에서만 실행
});

const EmotionAnalysis = dynamic(() => import('./EmotionAnalysis'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### 이미지 최적화
```typescript
// Image 컴포넌트 사용
import Image from 'next/image';

<JellyImage
  src="/jelly-character.png"
  alt="젤리 캐릭터"
  width={200}
  height={200}
  priority // 중요한 이미지는 우선 로딩
/>
```

### 캐싱 전략
```typescript
// API 응답 캐싱
const emotionCache = new Map();

const getEmotionAnalysis = async (text: string) => {
  const cacheKey = text;
  
  if (emotionCache.has(cacheKey)) {
    return emotionCache.get(cacheKey);
  }
  
  const result = await analyzeEmotion(text);
  emotionCache.set(cacheKey, result);
  
  // 10분 후 캐시 삭제
  setTimeout(() => {
    emotionCache.delete(cacheKey);
  }, 10 * 60 * 1000);
  
  return result;
};
```

## 모니터링 및 로깅
### 성능 모니터링
```typescript
// lib/performance.ts
export const measurePerformance = (name: string, fn: () => Promise<any>) => {
  return async (...args: any[]) => {
    const start = performance.now();
    const result = await fn.apply(this, args);
    const end = performance.now();
    
    console.log(`${name}: ${end - start}ms`);
    return result;
  };
};
```

### 에러 로깅
```typescript
// lib/errorLogger.ts
export const logError = (error: Error, context?: any) => {
  console.error('Error occurred:', error);
  
  if (context) {
    console.error('Context:', context);
  }
  
  // Sentry에 에러 보고
  Sentry.captureException(error, {
    extra: context
  });
};
```

## 테스트 전략
### 단위 테스트
```typescript
// tests/components/JellyCharacter.test.tsx
import { render, screen } from '@testing-library/react';
import JellyCharacter from '@/components/jelly/JellyCharacter';

describe('JellyCharacter', () => {
  it('renders jelly character', () => {
    render(<JellyCharacter />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
```

### 통합 테스트
```typescript
// tests/integration/emotion-analysis.test.ts
describe('Emotion Analysis Integration', () => {
  it('analyzes emotion correctly', async () => {
    const result = await analyzeEmotion('오늘 하루 정말 힘들었어');
    expect(result).toHaveProperty('emotion');
    expect(['분노', '슬픔', '지침', '불안', '허무']).toContain(result.emotion);
  });
});
```

### E2E 테스트
```typescript
// tests/e2e/emotion-flow.spec.ts
describe('Emotion Flow E2E', () => {
  it('completes emotion cleansing flow', async () => {
    await page.goto('/');
    await page.fill('textarea', '오늘 하루 정말 힘들었어');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.jelly-character')).toHaveClass('eating');
    await expect(page.locator('.emotion-beads')).toHaveCount(5);
  });
});
```

## 개발 베스트 프랙티스
- **컴포넌트 분리**: 단일 책임 원칙에 따라 컴포넌트 분리
- **타입 안정성**: TypeScript를 통한 완전한 타입 검증
- **상태 관리**: Zustand를 통한 중앙 집중식 상태 관리
- **성능 최적화**: 불필요한 리렌더링 방지 및 코드 스플리팅
- **접근성**: WCAG 2.1 표준 준수 및 스크린 리더 지원
- **보안**: OWASP 표준 준수 및 입력 검증 강화
- **테스트**: 단위 테스트, 통합 테스트, E2E 테스트 커버리지 유지
- **문서화**: 컴포넌트 문서화 및 API 명세 유지