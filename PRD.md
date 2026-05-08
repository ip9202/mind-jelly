# PRD: 마음 젤리 (Mind Jelly)
> 앱인토스(App in Toss) 입점용 개발 명세서 v2.0  
> 상태: Draft | 최종 수정일: 2025-05

---

## 1. 프로젝트 개요

### 1.1 목적
사용자가 일상의 스트레스를 텍스트로 입력하면, AI가 감정을 분석하고 말랑한 젤리 캐릭터 **"냠냠이"** 가 이를 구슬로 변환하여 삼키는 인터랙션을 통해 감정 정화 경험을 제공하는 Toss 미니앱.

### 1.2 핵심 가치
- **감정 정화:** 스트레스를 '먹히는 행위'로 치환하여 카타르시스 제공
- **Privacy First:** 입력 텍스트는 분석 후 즉시 파기, 서버 원문 저장 없음
- **토스 생태계 통합:** Toss Bridge API를 통한 네이티브 경험 (햅틱, 공유)

### 1.3 핵심 지표 (KPI)
| 지표 | 설명 |
|:---|:---|
| Feed Count | 일일 감정 정화 횟수 (구슬 삼키기) |
| Share CTR | 토스 내 결과 공유하기 클릭률 |

---

## 2. 앱인토스 통합 규격

### 2.1 플랫폼 환경
| 구분 | 상세 |
|:---|:---|
| 런타임 | Toss Webview 최적화 |
| 인증 | Toss OAuth / Bridge Silent Login |
| 디자인 | TDS 준수 + 커스텀 말랑 인터랙션 혼용 |

### 2.2 Toss Bridge API 연동

```javascript
// 햅틱 피드백
TossBridge.vibrate('light')    // 구슬 생성 시
TossBridge.vibrate('success')  // 구슬 삼키기 시

// 공유 시트
TossBridge.showShareSheet()    // 결과 이미지 공유
```

### 2.3 네이티브 UI 설정
- **헤더:** Title `마음 젤리` / Right Button `설정·도움말`
- **Safe Area:** 토스 네이티브 바텀 시트 및 헤더 영역 `padding-top/bottom` 처리

---

## 3. 기능 명세

### 3.1 젤리 상태 머신

```
Idle (부유) → Anticipation (입 벌림) → Eating (삼킴) → Satisfied (포만감)
```

| 상태 | 트리거 | 표정 |
|:---|:---|:---|
| Idle | 기본 상태 | `• •` / `-` |
| Anticipation | 구슬이 근접 (50px 이내) | `• •` / `o` |
| Eating | 구슬 충돌 판정 | `^ ^` / `o` |
| Satisfied | 삼키기 완료 후 2s | `u u` / `-` |

### 3.2 Soft-body 물리 엔진

- **정점(Vertex):** 20~30개로 구성된 Soft Body
- **드래그:** `PointerEvent` 기반 정점 변위 계산

| 물리 파라미터 | 값 |
|:---|:---|
| Elasticity (탄성) | 0.7 |
| Damping (감쇠) | 0.3 |
| Friction (마찰) | 0.1 |
| Gravity Scale | 0.5 |

### 3.3 텍스트 → 감정 구슬 변환

1. 사용자가 텍스트 입력 완료 (최대 100자)
2. 글자 수에 비례하여 **5~15개** 감정 구슬 생성
3. 구슬은 `Matter.js` Circle 바디로 화면 하단 무작위 생성
4. 구슬 크기: `12px / 18px / 24px` 랜덤 할당
5. 젤리 중심 반경 **50px** 이내 진입 시 Magnetic 필드 활성화 → 빨려 들어가는 효과

### 3.4 AI 감정 분석 (Serverless)

**API Flow:**
```
사용자 텍스트 → GPT-4o-mini → { 감정 카테고리, 위로 메시지, 추천 컬러 }
```

**감정 분류:**

| 감정 | 젤리 컬러 | Hex |
|:---|:---|:---|
| 분노 | Coral | `#FFB3A7` |
| 슬픔 | Steel Blue | `#AEC6CF` |
| 지침 | Lavender | `#E6E6FA` |
| 불안 | (기본 + 동적 할당) | - |
| 허무 | (기본 + 동적 할당) | - |
| Default | Pastel Pink | `#FFD1DC` |

**동적 UI:** 감정 분석 결과에 따라 배경 및 젤리 컬러 실시간 Cross-fade (Duration: 800ms)

---

## 4. 디자인 시스템

### 4.1 컬러 토큰

| Token | Hex | 설명 |
|:---|:---|:---|
| `color-bg-base` | `#FAF8F5` | 기본 배경 (Off-white) |
| `color-jelly-base` | `#FFD1DC` | 기본 젤리 (Pastel Pink) |
| `color-jelly-anger` | `#FFB3A7` | 분노 (Coral) |
| `color-jelly-sad` | `#AEC6CF` | 슬픔 (Steel Blue) |
| `color-jelly-tired` | `#E6E6FA` | 지침 (Lavender) |
| `color-text-primary` | `#4E5968` | 메인 텍스트 (Toss Grey 700) |

### 4.2 타이포그래피

| 구분 | Size | Weight | Line-height |
|:---|:---|:---|:---|
| H1 | 24px | Bold | 1.4 |
| Body | 16px | Medium | 1.5 |
| Caption | 13px | Regular | 1.6 |

- **Font:** Toss Product Sans (폴백: 나눔스퀘어라운드)

### 4.3 젤리 캐릭터 CSS 명세

```css
/* 기본 젤리 필터 */
backdrop-filter: blur(8px);
opacity: 0.85;
box-shadow: inset -5px -5px 15px rgba(255, 255, 255, 0.4);

/* 입력창 */
border-radius: 24px;
background: rgba(255, 255, 255, 0.6);
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
/* Focus: 캐릭터 메인 컬러 2px Glow */

/* 다크모드 */
background: #191F28;
opacity: 0.7; /* Glow 효과 극대화 */
```

### 4.4 모션 토큰

| 인터랙션 | 대상 | 애니메이션 | 스펙 |
|:---|:---|:---|:---|
| Idle | 젤리 | Y축 부유 | `translateY(-12px)`, 3s, `ease-in-out`, infinite |
| Feeding | 젤리 | Scale Up/Down | `scale(1.2)→scale(0.9)`, 400ms, `back-out` |
| Pop-in | 구슬 | Scale In | `scale(0→1)`, 300ms, `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Color Transition | 배경 | Background-color | 800ms, `linear` |

---

## 5. 기술 아키텍처

### 5.1 프론트엔드 스택

| 역할 | 기술 |
|:---|:---|
| Framework | React 18+ (Next.js App Router) |
| State | Zustand (젤리 포만감, 일일 통계) |
| UI 트랜지션 | Framer Motion |
| 물리 렌더링 | Canvas API |
| 물리 엔진 | Matter.js (구슬 드래그·충돌) |

### 5.2 데이터 스키마

```json
{
  "user_id": "string (masked)",
  "daily_stats": {
    "eaten_count": 0,
    "current_jelly_size": 1.0,
    "last_emotions": ["angry", "tired"]
  },
  "settings": {
    "haptic_enabled": true,
    "theme_color": "default"
  }
}
```

---

## 6. 개발 로드맵

| 영역 | 구현 내용 | 우선순위 |
|:---|:---|:---:|
| Core Physics | Canvas Soft-body 젤리 구현 및 터치 인터랙션 | **P0** |
| Interaction | 구슬 드래그·드롭 및 젤리 충돌 삼키기 로직 | **P0** |
| Toss Bridge | 웹뷰 환경 설정, 햅틱·공유 브릿지 연동 | P1 |
| AI Integration | 감정 분석 API 프롬프트 엔지니어링 및 위로 메시지 DB | P1 |
| Polishing | 파티클 효과, BGM, 젤리 표정 애니메이션 | P2 |

---

## 7. 예외 처리 및 보안

| 항목 | 처리 방식 |
|:---|:---|
| 데이터 보안 | 텍스트 분석 후 즉시 파기, 서버 원문 저장 없음 |
| 입력 제한 | 비속어 필터링 + 최대 100자 |
| 네트워크 오류 | AI 분석 실패 시 사전 정의된 위로 메시지 랜덤 출력 |
