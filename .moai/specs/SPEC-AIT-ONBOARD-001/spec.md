# SPEC-AIT-ONBOARD-001: 앱인토스 입점 온보딩

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC-ID | SPEC-AIT-ONBOARD-001 |
| 우선순위 | P0 (Critical) |
| 상태 | revised (무료 배포 경로 반영) |
| 담당 | 강력쇠주먹 (사용자) + MoAI (기술 지원) |
| 생성일 | 2026-05-10 |

---

## 1. 목적

Mind Jelly(마인드젤리) 감정 일기 서비스를 토스 앱인토스 플랫폼에 정식 입점하여, 3,000만 토스 유저에게 서비스를 제공한다.

## 2. 배경

- 현재 서비스는 Next.js 16 기반 WebView 앱으로, 로컬 개발 환경에서만 동작 중
- 앱인토스는 WebView 미니앱을 토스앱 내 App-in-App 형태로 제공하는 플랫폼
- **.ait 정적 패키지를 토스에서 무료 호스팅** → 개발자 서버 불필요, 비용 제로
- TDS(Toss Design System) 사용이 비게임 WebView 미니앱의 **검수 승인 필수 조건**
- 샌드박스 앱을 통해 승인 전 로컬 개발 서버 연결 및 실시간 테스트 가능

## 3. 현재 상태 분석

### 3.1 기술 스택 호환성

| 항목 | 현재 상태 | 앱인토스 요구사항 | 갭 |
|------|----------|-----------------|-----|
| 프레임워크 | Next.js 16 App Router | WebView (Vite 권장) | `output: 'export'` 정적 빌드로 해결 가능 |
| 빌드 | `next build` (SSR) | 번들러 빌드 → `.ait` 파일 | 정적 export 전환 필요 |
| 디자인 | Tailwind CSS + 커스텀 | TDS(Toss Design System) 필수 | **TDS 도입 필요** |
| 통신 | 서버 API 라우트 (`/api/analyze`) | 정적 호스팅 → 서버 없음 | **클라이언트 직접 API 호출로 전환** |
| 호스팅 | 로컬 개발 서버 | Toss 무료 호스팅 (.ait) | .ait 패키징 필요 |
| 패키지 | 없음 | `@apps-in-toss/web-framework` 필요 | 설치 필요 |

### 3.2 주요 리스크

1. **TDS 강제 적용**: 현재 커스텀 디자인 100% → TDS 컴포넌트로 교체 필요 (큰 작업)
2. **API 키 노출**: 서버 API 라우트 제거로 인해 Z.AI API 키가 클라이언트에 노출 → WebView 환경에서는 허용 가능
3. **CORS**: Z.AI API가 브라우저에서 직접 호출 시 CORS 허용 필요 → WebView에서는 완화될 수 있음

---

## 4. 마일스톤

### M1: 콘솔 등록 및 사전 준비 (사용자 액션)

| ID | 작업 | 담당 | 산출물 |
|----|------|------|--------|
| M1-1 | 토스 비즈니스 계정 가입 | 사용자 | 계정 |
| M1-2 | 앱인토스 콘솔에서 앱 등록 (appName, 카테고리, 설명) | 사용자 | appName 확정 |
| M1-3 | 앱 정보 입력 (아이콘, 기본 색상, 설명) | 사용자 | 앱 정보 승인 |
| M1-4 | 앱인토스 오픈 정책 확인 | 사용자 | 정책 준수 확인 |

**승인 소요**: 영업일 1~2일

**인수 기준**:
- 콘솔에 앱이 등록되어 있고 appName이 확정되어야 함
- 앱 정보가 승인되어야 함

### M2: 정적 빌드 전환 (MoAI 실행)

| ID | 작업 | 담당 | 산출물 |
|----|------|------|--------|
| M2-1 | `next.config.ts`에 `output: 'export'` 추가 | MoAI | 정적 빌드 설정 |
| M2-2 | `/api/analyze` 서버 라우트 → 클라이언트 직접 API 호출로 마이그레이션 | MoAI | 클라이언트 사이드 analyzer |
| M2-3 | 환경변수 `NEXT_PUBLIC_` prefix 적용 | MoAI | .env 업데이트 |
| M2-4 | `next build` 정적 빌드 테스트 | MoAI | 정적 빌드 성공 |
| M2-5 | `@apps-in-toss/web-framework` 패키지 설치 (appName 확정 후) | MoAI | package.json 업데이트 |

**인수 기준**:
- `next build`가 정적 파일로 정상 완료되어야 함
- API 라우트가 완전히 제거되고 클라이언트에서 Z.AI API를 직접 호출해야 함
- 감정 분석 플로우가 정상 동작해야 함

### M3: 샌드박스 환경 구축 (사용자 액션)

| ID | 작업 | 담당 | 산출물 |
|----|------|------|--------|
| M3-1 | iOS: Xcode + 시뮬레이터 환경 확인 | 사용자 | 시뮬레이터 준비 |
| M3-2 | iOS: 앱인토스 샌드박스 앱 다운로드 및 설치 (시뮬레이터에 드래그) | 사용자 | 샌드박스 앱 설치 |
| M3-3 | Android: Android Studio + 에뮬레이터 환경 확인 (선택) | 사용자 | 에뮬레이터 준비 |
| M3-4 | Android: 앱인토스 샌드박스 APK 다운로드 및 설치 (선택) | 사용자 | 샌드박스 앱 설치 |
| M3-5 | iOS 실기기: App Store에서 "앱인토스 샌드박스" 설치 (선택) | 사용자 | 실기기 테스트 준비 |

**인수 기준**:
- 최소 한 개 환경(iOS 시뮬레이터 또는 Android)에 샌드박스 앱이 설치되어야 함

### M4: .ait 패키지 빌드 및 업로드 (MoAI + 사용자 협력)

| ID | 작업 | 담당 | 산출물 |
|----|------|------|--------|
| M4-1 | `granite.config.ts` 생성 및 설정 (appName 필요) | MoAI | granite.config.ts |
| M4-2 | 정적 빌드 → `.ait` 패키지 생성 | MoAI | .ait 파일 |
| M4-3 | `.ait` 파일을 콘솔에 업로드 | 사용자 | 업로드 완료 |
| M4-4 | 콘솔 QR 코드로 토스앱 테스트 | 사용자 | QR 테스트 통과 |

**인수 기준**:
- `.ait` 파일이 정상 생성되어야 함
- 콘솔 업로드 후 QR 테스트가 통과해야 함

### M5: TDS 준수 검토 및 적용 (MoAI 실행)

| ID | 작업 | 담당 | 산출물 |
|----|------|------|--------|
| M5-1 | TDS 패키지 설치 (`@toss/tds-mobile` 또는 `@toss-design-system/mobile`) | MoAI | 패키지 설치 |
| M5-2 | 현재 UI vs TDS 매핑 분석 | MoAI | 매핑 문서 |
| M5-3 | 필수 TDS 컴포넌트 적용 (TopAppBar, BottomSheet, Button 등) | MoAI | TDS 적용 코드 |
| M5-4 | TDS 미적용 영역에 대한 예외 요청 검토 | MoAI + 사용자 | 예외 항목 문서 |

**인수 기준**:
- TDS 필수 컴포넌트가 적용되어야 함
- 검수 기준을 충족하는 UI여야 함

### M6: (M4에 통합됨 — .ait 빌드는 M4에서 수행)

~M6 작업은 M4로 이관되었습니다. 정적 빌드 + .ait 패키징이 M4에서 한 번에 처리됩니다.~

### M7: 전체 기능 샌드박스 테스트 (사용자 액션)

| ID | 작업 | 담당 | 산출물 |
|----|------|------|--------|
| M7-1 | 감정 입력 플로우 테스트 (idle→input→restoring→beads→report) | 사용자 | 플로우 정상 동작 |
| M7-2 | 다이어리 페이지 테스트 (달력, 타임라인) | 사용자 | 다이어리 정상 동작 |
| M7-3 | 모바일 키보드/스크롤 동작 확인 | 사용자 | 모바일 UI 정상 |
| M7-4 | 물리엔진(젤리/구슬) 성능 확인 | 사용자 | 성능 허용 범위 |
| M7-5 | 감정 분석 API 동작 확인 (WebView 내 HTTP/HTTPS) | 사용자 | API 정상 동작 |

**인수 기준**:
- 모든 핵심 플로우가 샌드박스 WebView에서 정상 동작해야 함
- 성능 저하나 렌더링 이슈가 없어야 함

### M8: 출시 검토 요청 (사용자 액션)

| ID | 작업 | 담당 | 산출물 |
|----|------|------|--------|
| M8-1 | 출시 가이드 확인 | 사용자 | 가이드 준수 확인 |
| M8-2 | 검토 요청 제출 | 사용자 | 검토 요청 완료 |
| M8-3 | 검토 피드백 대응 | MoAI + 사용자 | 피드백 수정 |
| M8-4 | 출시 승인 | 사용자 | 서비스 오픈 |

**인수 기준**:
- 검토가 승인되고 서비스가 오픈되어야 함

---

## 5. 의존성

```
M1 (콘솔 등록) ← 사용자 액션
 ↓ M1과 병렬 가능
M2 (정적 빌드 전환) ← MoAI 즉시 실행 가능
 ↓
M3 (샌드박스 설치) ← M2와 병렬 가능
 ↓ M1 + M2 완료 후
M4 (.ait 빌드/업로드) ← appName 필요 (M1)
 ↓ M4 확인 후
M5 (TDS 적용)
 ↓ M5 완료 후
M7 (전체 테스트)
 ↓ M7 통과 후
M8 (출시 요청)

참고: M6은 M4에 통합됨
```

## 6. Risks

| 리스크 | 가능성 | 영향 | 대응 |
|--------|--------|------|------|
| Next.js가 앱인토스 WebView에서 SSR 오류 | 중간 | 높음 | `output: 'export'` 또는 Vite 마이그레이션 검토 |
| TDS 적용 작업량 과대 | 높음 | 높음 | 핵심 컴포넌트만 우선 적용, 예외 요청 검토 |
| 감정 분석 API HTTPS 미지원 | 낮음 | 높음 | API 라우트를 외부 서버로 분리 |
| 앱인토스 검수 기준 미충족 | 중간 | 높음 | M7에서 철저히 사전 검증 |

## 7. 참고 문서

- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [바이브 코딩 가이드](https://developers-apps-in-toss.toss.im/tutorials/ai-vibe-coding.html)
- [WebView 튜토리얼](https://developers-apps-in-toss.toss.im/tutorials/webview.html)
- [샌드박스 가이드](https://developers-apps-in-toss.toss.im/development/test/sandbox.html)
- [iOS 환경설정](https://developers-apps-in-toss.toss.im/development/client/ios.html)
- [Android 환경설정](https://developers-apps-in-toss.toss.im/development/client/android.html)
- [개발 서버 연결](https://developers-apps-in-toss.toss.im/development/local-server.html)
