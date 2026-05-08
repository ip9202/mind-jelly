# DESIGN: 마음 젤리 (Mind Jelly) - 디자인 상세 가이드

본 문서는 **마음 젤리**의 시각적 정체성, 디자인 시스템(Design Tokens), 그리고 인터랙션 원칙을 정의합니다. Google Stitch 및 Figma와의 협업, 그리고 개발 생산성을 높이기 위해 수치화된 사양을 제공합니다.

---

## 1. 디자인 철학 (Design Principles)
- **Softness (부드러움):** 모든 모서리는 둥글게 처리하며, 날카로운 선을 배제합니다.
- **Responsiveness (반응성):** 사용자의 감정 입력과 터치에 캐릭터가 유기적으로 반응합니다.
- **Playfulness (유희성):** 스트레스 해소 과정을 '간식을 먹는 행위'로 치환하여 즐거움을 제공합니다.

---

## 2. 디자인 토큰 (Design Tokens)

### 2.1 컬러 시스템 (Color System)
감정 분석 결과에 따라 배경과 젤리의 색상이 부드럽게 전환(Cross-fade)됩니다.

| Token Name | Hex Code | Description | Emotion |
| :--- | :--- | :--- | :--- |
| `color-bg-base` | `#FAF8F5` | 기본 배경색 (Off-white) | Neutral |
| `color-jelly-base` | `#FFD1DC` | 기본 젤리 (Pastel Pink) | Default |
| `color-jelly-anger` | `#FFB3A7` | 분노 테마 (Coral) | Anger |
| `color-jelly-sad` | `#AEC6CF` | 슬픔 테마 (Steel Blue) | Sadness |
| `color-jelly-tired` | `#E6E6FA` | 지침 테마 (Lavender) | Fatigue |
| `color-text-primary` | `#4E5968` | 메인 텍스트 (Toss Grey 700) | - |

### 2.2 타이포그래피 (Typography)
- **Primary Font:** Toss Product Sans (또는 나눔스퀘어라운드)
- **H1 (Header):** 24px / Bold / Line-height 1.4
- **Body:** 16px / Medium / Line-height 1.5
- **Caption:** 13px / Regular / Line-height 1.6

---

## 3. 캐릭터 명세: 냠냠이 (Jelly Specification)

### 3.1 비주얼 프로퍼티
- **Shape:** 유기적인 곡선을 가진 Soft-body (고정된 원형이 아님).
- **Filter:** - `backdrop-filter: blur(8px)`
  - `opacity: 0.85`
  - `box-shadow: inset -5px -5px 15px rgba(255, 255, 255, 0.4)` (내부 광택)
- **Face (SVG):**
  - 눈: `• •` (Default), `^ ^` (Happy), `u u` (Sleeping)
  - 입: `o` (Eating), `-` (Idle)

### 3.2 물리 엔진 설정 (Matter.js/Canvas)
- **Elasticity (탄성):** 0.7
- **Friction (마찰):** 0.1
- **Gravity Scale:** 0.5 (구슬이 천천히 떨어지는 느낌)

---

## 4. 컴포넌트 디자인 (UI Components)

### 4.1 스트레스 입력창 (Input Area)
- **Radius:** 24px
- **Background:** `rgba(255, 255, 255, 0.6)`
- **Border:** None (Focus 시 캐릭터 메인 컬러로 2px Glow 효과)
- **Shadow:** `0 4px 20px rgba(0, 0, 0, 0.05)`

### 4.2 감정 구슬 (Emotion Beads)
- **Size:** 12px, 18px, 24px (랜덤 생성)
- **Color:** 젤리의 현재 컬러보다 20% 더 높은 채도 적용.
- **Physics:** 삼키기 직전 캐릭터 중심으로 빨려 들어가는 Magnetic 필드(Radius 50px) 적용.

---

## 5. 모션 및 인터랙션 (Motion Tokens)

| Interaction | Target | Animation Property | Specs |
| :--- | :--- | :--- | :--- |
| **Idle** | Jelly | Floating (Y-axis) | `translateY(-12px)`, 3s, `ease-in-out`, infinite |
| **Feeding** | Jelly | Scale Up/Down | `scale(1.2)` -> `scale(0.9)`, 400ms, `back-out` |
| **Pop-in** | Beads | Scale In | `scale(0 -> 1)`, 300ms, `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| **Color Transition** | Background | Background-color | Duration 800ms, `linear` |

---

## 6. 앱인토스(App in Toss) 통합 가이드

### 6.1 네이티브 브릿지 활용
- **햅틱 피드백:** - 구슬 생성 시: `light`
  - 구슬 충돌/삼키기 시: `success`
- **공유 카드:** - 젤리 캐릭터 중심의 고해상도 PNG 렌더링.
  - "오늘 정화한 스트레스: 00g" 텍스트 포함.

### 6.2 다크모드 대응
- **Dark Mode:** 배경색 `#191F28`, 젤리 불투명도 `0.7`로 조정하여 발광(Glow) 효과 극대화.
