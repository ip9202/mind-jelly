# Mind Jelly (마인드 젤리) - Design Guide

## Design Philosophy

**"Stress melts into cuteness"**

Mind Jelly is a healing interaction app where a cute jelly character eats emotion beads representing daily stress. The design must feel warm, soft, and emotionally comforting - like squeezing a plush toy or watching a pet sleep. Every pixel should whisper "it's okay."

**Keywords**: Healing, Soft, Cute, Warm, Playful, Safe, Dreamy

**Anti-keywords**: Corporate, Professional, Sharp, Cold, Minimal, Sterile, Business

---

## Color Palette

### Primary Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Jelly Body | Soft Pink | `#FFD1DC` | Main jelly character body color |
| Jelly Outline | Rose Blush | `#FFB6C1` | Jelly body stroke/outline |
| Background Start | Lavender Mist | `#F0E6FF` | Page background gradient start |
| Background End | Peach Cream | `#FFF0E6` | Page background gradient end |

### Emotion Bead Colors

| Emotion | Color | Hex | Description |
|---------|-------|-----|-------------|
| Joy (기쁨) | Sunny Yellow | `#FFD93D` | Warm golden glow |
| Sadness (슬픔) | Sage Green | `#6BCB77` | Calm forest green |
| Anger (분노) | Coral Red | `#FF6B6B` | Warm coral, not aggressive |
| Fear (공포) | Sky Blue | `#4D96FF` | Gentle ocean blue |
| Disgust (혐오) | Mint Cream | `#A8E6CF` | Soft pastel mint |

### Additional Bead Colors

| Color Name | Hex |
|------------|-----|
| Cotton Pink | `#FF9FF3` |
| Honey Orange | `#FECA57` |
| Cloud Blue | `#54A0FF` |

### UI Colors

| Role | Color | Hex |
|------|-------|-----|
| Background (Light) | `#FFF8FA` | Warm white with pink tint |
| Background (Dark) | `#2D1B2E` | Deep purple-brown |
| Card Background | `#FFFFFF` | White with soft shadow |
| Text Primary | `#4A3347` | Dark plum |
| Text Secondary | `#9B7D9E` | Muted mauve |
| Accent | `#FF9ECD` | Bright pink |
| Success | `#7ED6A8` | Soft green |
| Warning | `#FFCF70` | Warm yellow |
| Border | `#F0E0E8` | Light pink border |

### Gradients

```
Page Background: linear-gradient(135deg, #F0E6FF 0%, #FFF0E6 50%, #FFE6F0 100%)
Jelly Glow: radial-gradient(circle, rgba(255,209,220,0.6) 0%, transparent 70%)
Card: linear-gradient(180deg, #FFFFFF 0%, #FFF5F8 100%)
Button Primary: linear-gradient(135deg, #FF9ECD 0%, #FFB6C1 100%)
Button Hover: linear-gradient(135deg, #FF7AB8 0%, #FF9AAF 100%)
```

---

## Typography

### Primary Font: Gowun Dodum (고운 돋움)

- **Why**: Rounded, friendly Korean font that feels handwritten and warm
- **Google Fonts**: `@import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap');`
- **Usage**: All body text, labels, descriptions, UI elements

### Display Font: Dongle (동글)

- **Why**: Playful, bubbly Korean display font - literally means "round"
- **Google Fonts**: `@import url('https://fonts.googleapis.com/css2?family=Dongle&display=swap');`
- **Usage**: Page titles, hero text, jelly character name, section headers

### Accent Font: Gamja Flower (감자꽃)

- **Why**: Cute, slightly quirky handwriting-style Korean font
- **Google Fonts**: `@import url('https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap');`
- **Usage**: Emotion labels, toast messages, playful UI copy

### Fallback Stack

```css
font-family: 'Gowun Dodum', 'Dongle', 'Gamja Flower', -apple-system, sans-serif;
```

### Type Scale

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Page Title | Dongle | 32px | 400 | 1.2 |
| Section Title | Dongle | 24px | 400 | 1.3 |
| Body Text | Gowun Dodum | 16px | 400 | 1.6 |
| Emotion Label | Gamja Flower | 14px | 400 | 1.4 |
| Button Text | Gowun Dodum | 15px | 700 | 1.4 |
| Toast/Alert | Gamja Flower | 14px | 400 | 1.4 |
| Small Caption | Gowun Dodum | 12px | 400 | 1.5 |

---

## Spacing and Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight element spacing |
| sm | 8px | Inner padding, icon gaps |
| md | 16px | Standard padding, card gaps |
| lg | 24px | Section spacing |
| xl | 32px | Page section gaps |
| 2xl | 48px | Hero section spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small buttons, tags |
| md | 16px | Cards, inputs |
| lg | 24px | Large cards, modals |
| xl | 32px | Bottom sheets, overlays |
| full | 9999px | Circular elements, pills |

### Shadow Styles

```css
shadow-soft: 0 4px 20px rgba(74, 51, 71, 0.08);
shadow-card: 0 8px 30px rgba(74, 51, 71, 0.12);
shadow-jelly: 0 0 40px rgba(255, 209, 220, 0.5);
shadow-bead: 0 2px 10px rgba(0, 0, 0, 0.1);
shadow-button: 0 4px 15px rgba(255, 158, 205, 0.3);
```

---

## Pages and Screens

### Screen 1: Splash / Intro Screen

**Purpose**: First impression, brand mood setting

**Layout**:
- Full screen with animated gradient background (lavender to peach)
- Center: Large jelly character bouncing gently (idle animation)
- Below jelly: App name "마인드 젤리" in Dongle font (large, warm)
- Below title: Tagline "오늘 하루, 젤리에게 맡겨요" in Gamja Flower
- Bottom: "시작하기" button with soft pink gradient
- Floating particles: Tiny pastel hearts and stars drifting slowly

**Animation**:
- Jelly breathes (scale 0.95 → 1.05, 3s ease-in-out loop)
- Stars twinkle (opacity 0.3 → 1.0, random intervals)
- Gradient slowly shifts hue (20s cycle)

**Images needed**:
- Jelly character idle pose (large, centered)
- Floating heart particles (5-6 variants)
- Star particles (3-4 variants)
- Background gradient texture (subtle noise overlay)

---

### Screen 2: Main Canvas (Home)

**Purpose**: Core interaction - jelly eating emotion beads

**Layout**:
- Full viewport canvas area (800x600, responsive)
- Background: Soft gradient with subtle cloud patterns
- Center: Jelly character (soft-body physics, 25 vertices)
- Scattered: Emotion beads (colorful circles with face icons)
- Top bar: Minimal - app logo (small jelly icon) on left, settings icon on right
- Bottom: Emotion input area

**Top Bar Design**:
- Height: 56px
- Background: Semi-transparent white (rgba(255,255,255,0.8))
- Backdrop blur: 12px (frosted glass effect)
- Left: Small jelly icon + "마인드 젤리" text
- Right: Settings gear icon (rounded, soft)

**Emotion Input Area** (Bottom Sheet):
- Height: 80px when collapsed, 320px when expanded
- Background: White with soft shadow on top edge
- Contains: Emotion bead selection buttons (5 emotions in a row)
- Each button: Colored circle with emotion face + label below
- "내 감정 기록하기" header in Gamja Flower font
- Selected emotion gets soft glow effect

**Jelly Character Design** (in-canvas):
- Body: Soft pink (#FFD1DC) with lighter highlight gradient
- Stroke: Rose blush (#FFB6C1), 2px
- Shadow: Subtle pink glow beneath jelly
- Face expressions per state:
  - **Idle**: Dot eyes (• •), small round mouth (o), slight smile curve
  - **Anticipation**: Wider eyes, open round mouth, slight bounce
  - **Eating**: Happy squint eyes (^ ^ or u u), wide open mouth
  - **Satisfied**: Closed happy eyes (^ ^), gentle smile curve, slight blush marks on cheeks

**Emotion Bead Design** (in-canvas):
- Size options: Small (24px), Medium (36px), Large (48px)
- Shape: Perfect circle with inner gradient (lighter center)
- Each has a tiny face matching the emotion
- Gentle float animation (bob up and down, 2s)
- Soft drop shadow
- Sparkle effect on spawn

**Canvas Background Elements**:
- Subtle floating clouds (very low opacity, slow drift)
- Tiny stars scattered (twinkle animation)
- Soft gradient overlay at edges (vignette effect)

**Images needed**:
- Cloud shapes (3-4 variants, very light, ~20% opacity)
- Small star sparkles
- Jelly character body with all 4 face states
- 5 emotion bead designs with faces
- Cheek blush marks for satisfied state

---

### Screen 3: Emotion Journal (감정 일기)

**Purpose**: View and reflect on recorded emotions over time

**Layout**:
- Top: "오늘의 감정 일기" title in Dongle font
- Below: Date picker (cute calendar with jelly decorations)
- Main area: Timeline of emotion beads consumed today
- Each entry: Bead color + emotion face + timestamp + optional note
- Bottom: Weekly emotion chart (simple bar chart with bead colors)

**Timeline Entry Design**:
- Card with soft shadow, rounded corners (16px)
- Left: Colored bead icon (small)
- Center: Emotion name + time stamp
- Right: Small note preview (if exists)
- Background: White with subtle left border in bead color

**Weekly Chart Design**:
- Horizontal bars for each day of the week
- Each bar composed of colored segments matching emotions
- Background: Very light grid lines
- Labels: Day names in Gowun Dodum
- No axes, no numbers - just visual color flow

**Images needed**:
- Calendar header decoration (small jelly peeking over top)
- Empty state illustration (jelly sleeping with Zzz)
- Weekly chart background pattern

---

### Screen 4: Settings Screen

**Purpose**: App configuration and preferences

**Layout**:
- Top: "설정" title with back arrow
- Sections with rounded card containers:
  1. Jelly Appearance (색상 테마)
  2. Sound Settings (소리 설정)
  3. Notifications (알림)
  4. About (정보)

**Jelly Appearance Section**:
- Color picker row: 6 preset jelly colors (circles)
  - Pink (#FFD1DC), Lavender (#D1C4FF), Mint (#B2F5EA)
  - Peach (#FFD8B8), Sky (#B8E0FF), Lemon (#FFF5B8)
- Preview: Small jelly icon next to color options, updates on selection

**Sound Section**:
- Toggle switches with rounded track (pink when on)
- Sound effect preview buttons (play icons)
- Volume slider with custom pink track

**Card Design**:
- White background with soft shadow
- 16px border radius
- 20px padding
- Section titles in Dongle font
- Items separated by very light pink dividers

**Images needed**:
- 6 jelly color preview icons
- Sound wave decoration
- Small jelly mascot in different poses for each section

---

### Screen 5: Onboarding Flow (3 Steps)

**Purpose**: First-time user guide

**Step 1 - Welcome**:
- Full screen illustration: Big jelly waving hello
- Text: "안녕! 나는 마인드 젤리야" (Dongle, large)
- Subtitle: "너의 감정을 먹고 커가는 젤리 친구" (Gowun Dodum)
- Background: Soft pastel gradient
- Bottom: "다음" button

**Step 2 - How It Works**:
- Illustration: Jelly with arrows pointing to emotion beads
- Step visualization:
  1. Emotion bead icon → "감정을 선택해"
  2. Arrow → "젤리가 먹을거야"
  3. Happy jelly → "기분이 나아질거야"
- Background: Same gradient, slightly different tint

**Step 3 - Ready**:
- Illustration: Jelly with party confetti
- Text: "준비 완료! 시작해볼까?"
- Name input field (cute placeholder: "젤리 이름 지어주기")
- Bottom: "시작!" button (large, pink gradient)

**Images needed**:
- Jelly waving illustration (Step 1)
- Jelly + beads diagram illustration (Step 2)
- Jelly party illustration (Step 3)
- Confetti particles
- Arrow decoration elements

---

## Component Design Specifications

### Buttons

**Primary Button**:
```
Background: linear-gradient(135deg, #FF9ECD, #FFB6C1)
Text Color: #FFFFFF
Font: Gowun Dodum, 15px, Bold
Border Radius: 16px
Padding: 14px 32px
Shadow: 0 4px 15px rgba(255,158,205,0.3)
Hover: Scale 1.02, shadow deepens
Active: Scale 0.98
```

**Secondary Button**:
```
Background: #FFFFFF
Text Color: #4A3347
Font: Gowun Dodum, 15px, Bold
Border: 2px solid #F0E0E8
Border Radius: 16px
Padding: 12px 28px
Hover: Border color → #FF9ECD, text → #FF9ECD
```

**Icon Button** (settings, close):
```
Background: transparent
Icon Color: #9B7D9E
Size: 44px touch target
Border Radius: 12px
Hover: Background → rgba(255,158,205,0.1), icon → #FF9ECD
```

### Cards

```
Background: #FFFFFF
Border Radius: 20px
Padding: 20px
Shadow: 0 8px 30px rgba(74,51,71,0.08)
Border: 1px solid rgba(255,209,220,0.3)
```

### Input Fields

```
Background: #FFF5F8
Border: 2px solid transparent
Border Radius: 14px
Padding: 14px 18px
Font: Gowun Dodum, 16px
Text Color: #4A3347
Focus Border: #FF9ECD
Placeholder: #C9A8CC
```

### Toggle Switch

```
Track Width: 52px, Height: 28px
Track Off: #F0E0E8
Track On: #FF9ECD
Thumb: White circle, 24px
Border Radius: full
Transition: 0.3s ease
```

### Toast / Alert Messages

```
Background: #FFFFFF with soft shadow
Border Left: 4px solid (emotion color)
Border Radius: 14px
Padding: 16px
Font: Gamja Flower, 14px
Icon: Matching emotion face
Animation: Slide in from top, fade out after 3s
```

### Bottom Sheet

```
Background: #FFFFFF
Top Corners Radius: 28px
Shadow: 0 -8px 30px rgba(74,51,71,0.15)
Handle: 40px wide, 4px height, #F0E0E8, rounded
Drag Indicator: Small pill shape at top center
```

### Navigation Bar

```
Background: rgba(255,255,255,0.85)
Backdrop Blur: 12px
Height: 56px
Border Bottom: 1px solid rgba(255,209,220,0.2)
```

---

## Animation Guidelines

### Motion Principles

1. **Soft and Bouncy**: All animations use ease-in-out or spring physics
2. **Playful**: Slight overshoot on interactive elements
3. **Breathing**: Idle elements have subtle scale oscillation
4. **Organic**: Physics-based, not linear keyframes

### Jelly Animations

| State | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Idle | Gentle breathing (scale 0.98-1.02) | 3s loop | ease-in-out |
| Anticipation | Slight lean toward bead, eyes widen | 0.5s | spring |
| Eating | Mouth opens, body squishes slightly | 0.8s | ease-out |
| Satisfied | Happy wiggle, blush appears | 1s | spring |

### Bead Animations

| Event | Animation | Duration |
|-------|-----------|----------|
| Spawn | Scale from 0 → 1 with sparkle | 0.4s |
| Float | Gentle bob (translateY ±3px) | 2s loop |
| Consumed | Scale 1 → 0 with particles | 0.3s |
| Hover | Scale 1.1, glow effect | 0.2s |

### UI Transitions

| Transition | Animation | Duration |
|------------|-----------|----------|
| Page Enter | Slide up + fade in | 0.4s |
| Page Exit | Slide down + fade out | 0.3s |
| Modal Open | Scale 0.9 → 1 + fade | 0.3s |
| Modal Close | Scale 1 → 0.95 + fade | 0.2s |
| Toast In | Slide down from top | 0.3s |
| Toast Out | Slide up + fade | 0.3s |

---

## Icon Design

### Style: Outlined Rounded with Soft Fill

- Stroke width: 2px
- Border radius: generous (4px minimum)
- Fill: Soft pastel when active, transparent when inactive
- Size: 24px standard, 20px inline, 32px prominent

### Required Icons

| Icon | Description | States |
|------|-------------|--------|
| Home | Small jelly silhouette | Default, Active |
| Journal | Book with bead on cover | Default, Active |
| Settings | Flower gear (not corporate gear) | Default, Active |
| Add Bead | Plus in circle (soft) | Default, Pressed |
| Close | Soft X with rounded ends | Default |
| Back | Rounded left arrow | Default |
| Play | Rounded triangle | Default |
| Sound On | Small note with hearts | Default |
| Sound Off | Note with soft line | Default |
| Notification | Bell with small bead | Default, Active |
| Calendar | Cute calendar with jelly face | Default |
| Heart | Soft heart outline | Default, Filled |
| Star | 5-point rounded star | Default, Filled |
| Refresh | Rounded circular arrows | Default |

---

## Image Assets Required

### Character Illustrations

| Asset | Description | Size | Format |
|-------|-------------|------|--------|
| jelly-idle | Jelly body in idle state (neutral happy face) | 400x400 | SVG |
| jelly-anticipation | Jelly leaning forward, excited eyes | 400x400 | SVG |
| jelly-eating | Jelly with wide open mouth, eating face | 400x400 | SVG |
| jelly-satisfied | Jelly with closed happy eyes, blush, smile | 400x400 | SVG |
| jelly-sleeping | Jelly sleeping with Zzz (for empty states) | 400x400 | SVG |
| jelly-waving | Jelly waving hello (onboarding) | 400x400 | SVG |
| jelly-party | Jelly with confetti (completion/celebration) | 400x400 | SVG |
| jelly-small-icon | Simplified jelly for nav bar and favicon | 48x48 | SVG |

### Emotion Bead Assets

| Asset | Description | Size | Format |
|-------|-------------|------|--------|
| bead-joy | Yellow bead with happy face | 96x96 | SVG |
| bead-sadness | Green bead with sad face | 96x96 | SVG |
| bead-anger | Coral bead with angry face | 96x96 | SVG |
| bead-fear | Blue bead with scared face | 96x96 | SVG |
| bead-disgust | Mint bead with yuck face | 96x96 | SVG |

### UI Decoration Assets

| Asset | Description | Size | Format |
|-------|-------------|------|--------|
| cloud-1 | Soft cloud shape variant 1 | 200x80 | SVG |
| cloud-2 | Soft cloud shape variant 2 | 160x60 | SVG |
| cloud-3 | Soft cloud shape variant 3 | 120x50 | SVG |
| star-sparkle | Small 4-point star sparkle | 24x24 | SVG |
| heart-particle | Tiny floating heart | 16x16 | SVG |
| confetti-1 | Confetti piece rectangle | 8x16 | SVG |
| confetti-2 | Confetti piece circle | 12x12 | SVG |
| confetti-3 | Confetti piece triangle | 12x12 | SVG |
| blush-marks | Cheek blush decoration | 60x20 | SVG |
| zzZ | Sleeping Z characters | 40x40 | SVG |
| arrow-cute | Rounded decorative arrow | 60x20 | SVG |

### Background Assets

| Asset | Description | Size | Format |
|-------|-------------|------|--------|
| bg-noise | Subtle noise texture overlay | 200x200 | PNG (tile) |
| bg-gradient-base | Main background gradient | 1920x1080 | CSS |
| cloud-layer | Slow-moving cloud decoration | 1920x400 | SVG |

---

## Page Layout Wireframes

### Mobile (375px width)

```
┌─────────────────────────┐
│  ○ 마인드 젤리      ⚙  │  ← Top Bar (56px)
├─────────────────────────┤
│                         │
│    ☁           ☁       │
│                         │
│         🟣              │  ← Jelly Canvas Area
│        (젤리)           │     (flexible height)
│                         │
│      ● ● ●             │  ← Emotion Beads
│                         │
├─────────────────────────┤
│  🟡 😊  🟢 😢  🔴 😠  │  ← Emotion Input
│  🔵 😨  🟢 🤢         │     (80px collapsed)
│─────────────────────────│
│  [ 내 감정 기록하기 ]   │  ← Expand button
└─────────────────────────┘
```

### Desktop (1200px+ width)

```
┌──────────────────────────────────────────────────┐
│  ○ 마인드 젤리                              ⚙    │
├──────────────────────────────────────────────────┤
│                                                  │
│     ☁                    ☁                      │
│                                                  │
│              🟣                                  │
│             (젤리)              ● ● ●           │
│                              ● ●                │
│              ● ● ●                              │
│                                                  │
├──────────────────────────────────────────────────┤
│    🟡 기쁨  🟢 슬픔  🔴 분노  🔵 공포  🟢 혐오  │
└──────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

| Breakpoint | Width | Canvas Size | Layout |
|------------|-------|-------------|--------|
| Mobile | < 640px | 100vw x 60vh | Full screen, stacked |
| Tablet | 640-1024px | 640x480 | Centered card |
| Desktop | > 1024px | 800x600 | Centered card with side padding |

---

## Dark Mode

### Color Adjustments

| Element | Light | Dark |
|---------|-------|------|
| Background | #FFF8FA → #FFF0E6 gradient | #1A0F1E → #2D1B2E gradient |
| Card BG | #FFFFFF | #3D2840 |
| Text Primary | #4A3347 | #F0E0E8 |
| Text Secondary | #9B7D9E | #B8A0BB |
| Border | #F0E0E8 | #4A3350 |
| Top Bar | rgba(255,255,255,0.85) | rgba(45,27,46,0.85) |
| Input BG | #FFF5F8 | #3D2840 |

### Jelly in Dark Mode
- Body glow becomes more prominent (increased shadow opacity)
- Face details remain dark (#333) for readability
- Bead colors brighten slightly for visibility

---

## Sound Design Notes (Visual Indicators)

While sounds are not visual, their UI indicators need design:

- Sound toggle: Uses bell/note icon with heart decoration
- Playing indicator: Small animated wave bars (3 bars, pink)
- Volume: Pink slider track with round thumb

---

## Design Tokens Summary (CSS Variables)

```css
:root {
  /* Colors */
  --color-jelly: #FFD1DC;
  --color-jelly-stroke: #FFB6C1;
  --color-accent: #FF9ECD;
  --color-bg-primary: #FFF8FA;
  --color-bg-secondary: #FFF5F8;
  --color-text-primary: #4A3347;
  --color-text-secondary: #9B7D9E;
  --color-border: #F0E0E8;
  --color-card: #FFFFFF;

  /* Emotion Colors */
  --color-joy: #FFD93D;
  --color-sadness: #6BCB77;
  --color-anger: #FF6B6B;
  --color-fear: #4D96FF;
  --color-disgust: #A8E6CF;

  /* Typography */
  --font-display: 'Dongle', sans-serif;
  --font-body: 'Gowun Dodum', sans-serif;
  --font-accent: 'Gamja Flower', sans-serif;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;

  /* Shadows */
  --shadow-soft: 0 4px 20px rgba(74,51,71,0.08);
  --shadow-card: 0 8px 30px rgba(74,51,71,0.12);
  --shadow-jelly: 0 0 40px rgba(255,209,220,0.5);
}
```

---

## Stitch Implementation Notes

When generating screens in Stitch:

1. **Font Import**: All three fonts (Dongle, Gowun Dodum, Gamja Flower) are available on Google Fonts
2. **Device Target**: Mobile-first design (375px width), responsive to desktop
3. **Color Mode**: Start with Light mode; Dark mode is a future enhancement
4. **Canvas Area**: The main interaction area should be represented as a placeholder with the jelly character illustration
5. **Bottom Sheet**: Use standard bottom sheet pattern with drag handle
6. **Navigation**: Bottom tab bar for mobile (Home, Journal, Settings), not top tabs
7. **Emotion Buttons**: Use large touch targets (minimum 48px) with generous spacing
8. **Icons**: Custom cute icons preferred over standard Material/SF icons

### Screen Priority for Stitch Generation

1. **Main Canvas (Home)** - Core experience, highest priority
2. **Splash / Intro** - Brand impression
3. **Onboarding Flow** - User conversion
4. **Emotion Journal** - Engagement retention
5. **Settings** - User preferences

---

Version: 1.0.0
Date: 2026-05-08
Target Tool: Google Stitch (Design Generation)
Project: Mind Jelly (마인드 젤리)
