# Visual Identity

---

## Color Palette

primary: "#FFD1DC"
  # Soft Pink (젤리 핑크) - 메인 캐릭터 색상. CTA, 주요 강조, 네비게이션 활성 상태에 사용.

secondary: "#D1C4FF"
  # Lavender (라벤더) - 보조 색상. 배경 그라데이션, 보조 강조, 섹션 구분에 사용.

accent: "#FF9ECD"
  # Bright Pink (브라이트 핑크) - 주의 끌기, 버튼, 인터랙션 피드백에 사용.

neutral_scale:
  50: "#FFF8FA"   # Background primary
  100: "#FFF0F5"  # Background secondary
  200: "#FFE0EB"  # Hover states
  300: "#F0E0E8"  # Borders, dividers
  400: "#D4B8D9"  # Disabled states
  500: "#9B7D9E"  # Secondary text
  600: "#7A5F7D"  # Muted text
  700: "#5C4460"  # Body text
  800: "#4A3347"  # Primary text
  900: "#2D1B2E"  # Dark mode background
  950: "#1A0F1E"  # Dark mode surface

background: "#FFF8FA"
  # 따뜻한 핑크 틴트의 화이트. 차가운 순백이 아닌 포근한 느낌.

surface: "#FFFFFF"
  # 카드, 모달, 바텀시트 배경. 소프트 섀도우과 함께 사용.

## Emotion Colors (감정 색상)

emotion_joy: "#FFD93D"       # 기쁨 - 따뜻한 노란색
emotion_sadness: "#6BCB77"   # 슬픔 - 차분한 초록색
emotion_anger: "#FF6B6B"     # 분노 - 코랄 레드 (공격적이지 않은 따뜻한 빨강)
emotion_fear: "#4D96FF"      # 공포 - 시원한 파란색
emotion_disgust: "#A8E6CF"   # 혐오 - 연한 민트

## Typography (하이브리드 TDS 접근)

**전략**: Toss Design System의 Semantic Token 구조를 도입하되, 폰트는 프로젝트 브랜드 유지

### TDS Reference
- **Toss Product Sans**: Toss x Sandoll 협업 (2020.07~2021.03, 9개월)
- **TDS Typography**: font-size 13~30px, line-height 23~40px, weights 5종
- **문서**: https://tossmini-docs.toss.im/tds-react-native/foundation/typography/

### Project Fonts (브랜드 유지)

primary_font: "Dongle"
  # 동글 - 귀엽고 동그란 한국어 디스플레이 폰트. 페이지 타이틀, 섹션 헤더에 사용.
  # Google Fonts에서 제공.

secondary_font: "Gowun Dodum"
  # 고운 돋움 - 부드럽고 친근한 한국어 본문 폰트. 모든 UI 텍스트, 라벨, 설명에 사용.
  # Google Fonts에서 제공.

accent_font: "Gamja Flower"
  # 감자꽃 - 장난스러운 손글씨 스타일. 감정 라벨, 토스트 메시지, 장난스러운 UI 카피에 사용.
  # Google Fonts에서 제공.

latin_font: "Plus Jakarta Sans"
  # Toss Product Sans 대체. 라틴 문자, 숫자, 영문 UI에 사용.
  # 귀여운 브랜드 아이덴티티와 조화되는 둥글고 친근한 폰트.

font_source: "google-fonts"
  # 모든 폰트 Google Fonts에서 로드.

### Typography Variants (TDS 스타일 Semantic Tokens)

| Variant | Size | Line-Height | Weight | Use Case |
|---------|------|-------------|--------|----------|
| **display** | 64px | 1.0 | 700 | 가장 큰 제목 |
| **title1** | 30px | 1.33 | 700 | 대제목 (TDS largest) |
| **title2** | 24px | 1.4 | 700 | 중제목 (h1) |
| **title3** | 20px | 1.4 | 600 | 소제목 |
| **body1** | 16px | 1.5 | 500 | 본문 강조 |
| **body2** | 15px | 1.47 | 400 | 본문 기본 |
| **caption** | 13px | 1.46 | 400 | 캡션/주석 |

### Tailwind 클래스 사용

```tsx
// TDS 스타일 Semantic Typography
<h1 className="text-display font-primary">메인 제목</h1>
<h2 className="text-title1 font-secondary">섹션 제목</h2>
<p className="text-body1 font-tertiary">본문 텍스트</p>
<span className="text-caption font-accent">캡션</span>

// Legacy aliases (하위 호환)
<h1 className="text-h1">기존 h1 스타일</h1>
<p className="text-body-md">기존 본문 스타일</p>
```

### CSS Variables

```css
/* Font families */
--font-family-primary: "Plus Jakarta Sans", sans-serif;
--font-family-secondary: "Dongle", sans-serif;
--font-family-tertiary: "Gowun Dodum", sans-serif;
--font-family-accent: "Gamja Flower", cursive;

/* Typography variants */
--text-display-size: 64px;
--text-title1-size: 30px;
--text-title2-size: 24px;
--text-title3-size: 20px;
--text-body1-size: 16px;
--text-body2-size: 15px;
--text-caption-size: 13px;
```

## Logo

logo_file: "assets/jelly-small-icon.svg"
  # 간단한 젤리 캐릭터 실루엣. 둥근 몸체 + 귀여운 눈 2개.

logo_dark_file: "assets/jelly-small-icon-dark.svg"
  # 다크 모드용 - 밝은 핑크색(#FFD1DC) 젤리 실루엣.

logo_max_height: "36px"
  # 네비게이션 바에서의 최대 높이.

## Layout Preferences

hero_layout: "centered"
  # 모든 화면이 중앙 정렬. 젤리가 화면 중앙에 위치.

section_rhythm: "single-bg"
  # 단일 배경 그라데이션. 섹션 간 날카로운 구분 없이 자연스러운 흐름.

border_radius_style: "pill"
  # 최대한 둥글게. 모든 요소에 16px+ border-radius. 날카로운 모서리 금지.

## Dark Mode

dark_mode_support: "system"
  # 시스템 설정 따름 (prefers-color-scheme). 다크 모드에서 젤리 글로우 효과 강화.

## Visual Do's and Don'ts

dos:
  - "부드러운 파스텔 색상과 그라데이션"
  - "둥글고 유기적인 형태 (원, 타원, 물방울)"
  - "젤리 캐릭터와 감정 구슬의 귀여운 표정"
  - "포근하고 따뜻한 분위기의 배경 (구름, 별)"
  - "소프트 섀도우와 글로우 효과"
  - "여백이 넉넉한 여유로운 레이아웃"
  - "장난스럽고 발랄한 마이크로 인터랙션"
  - "핑크/라벤더/피치 따뜻한 색상 계열"
  - "손으로 그린 듯한 일러스트 스타일"

donts:
  - "날카로운 모서리와 직각 형태"
  - "차가운 파란색/회색 기업 색상"
  - "스톡 사진이나 사진 이미지 (일러스트만 사용)"
  - "과도한 텍스트나 정보 밀도"
  - "기하학적이고 딱딱한 패턴"
  - "Material Design 기본 아이콘 (커스텀 귀여운 아이콘 사용)"
  - "빨간색 에러/경고 (따뜻한 코랄 사용)"
  - "검은색 텍스트 (#000000 사용 금지, #4A3347 사용)"
  - "회색 배경 (#F5F5F5 등 차가운 회색 금지)"

---

_Last updated: 2026-05-08__
_Populated by: design guide creation_
