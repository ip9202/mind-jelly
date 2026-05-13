---
id: BRIEF-INSIGHTS-REDESIGN
version: 1.0.0
created: 2026-05-13
updated: 2026-05-13
author: manager-spec
status: Active
related_spec: SPEC-UI-003
---

# BRIEF: Insights Tab Redesign - Professional Statistics Dashboard

## Goal

Transform the insights tab in `EmotionStatsBottomSheet` from a flat badge-and-text list into a structured, professional statistics dashboard that presents emotion analytics with clear visual hierarchy, while maintaining the Mind Jelly brand identity of warmth and healing.

**Current problem**: The insights tab displays top emotions as simple pill badges with medal emojis, streak as inline icon+text, and pattern change as a single trend line. The layout lacks visual weight, data emphasis, and structured hierarchy -- it reads as an afterthought rather than a purposeful analytics view.

**Desired outcome**: A dashboard-style layout where each data insight occupies its own visual card, statistics are reinforced with visual indicators (progress bars, rankings, micro-charts), and the overall composition feels intentional and polished -- like opening a personal wellness report.

---

## Audience

**Primary**: End users of Mind Jelly viewing their emotion analytics within the bottom sheet.

**User profile**: 20-40 year-old digital natives using the app for daily emotional wellness. They want to quickly understand their emotional patterns at a glance, without feeling overwhelmed by raw data. They value aesthetics and warmth over clinical precision.

**Usage context**: Users open the bottom sheet from the home screen, swipe to the "Insights" tab after reviewing weekly trends and donut charts. The insights tab is the "so what does this mean for me" moment -- it should feel like a caring summary, not a spreadsheet.

**Device**: Mobile-first (375px width primary). All layouts must work within the bottom sheet container (approximately 60-70% screen height).

---

## Brand Alignment

**Core philosophy**: "Stress melts into cuteness" -- the dashboard must feel warm and approachable, not clinical or data-heavy.

**Brand rules that govern this redesign**:

| Brand Principle | Application to Insights Dashboard |
|---|---|
| Warm, soft, emotionally comforting | Use pastel card backgrounds, rounded corners, gentle shadows -- never hard edges or stark white data tables |
| Playful and safe | Retain emotion-themed colors and friendly iconography; avoid grid lines, axes, or corporate chart patterns |
| Not corporate, not sterile | Section headers use Gamja Flower font; statistics use Dongle for numbers; avoid "report" or "analytics" terminology |
| Healing interaction | Data should feel encouraging, not judgmental. Trending down is framed as insight, not failure |

**Color constraints**:
- Card backgrounds: White (`#FFFFFF`) with optional emotion-tinted accent borders
- Stat numbers: Dongle font in emotion-specific colors from `EMOTION_TEXT_COLORS` palette
- Progress bars: Emotion-specific fill colors from `EMOTION_COLORS` palette
- Accent highlights: Pink (`#FF9ECD`) for interactive or highlighted elements

**Typography constraints**:
- Section titles: Dongle 24px (display font, for stat numbers and headings)
- Body text: Gowun Dodum 14-16px (descriptions, messages)
- Accent labels: Gamja Flower 12-14px (emotion names, streak text, badges)

**Spacing constraints**: Standard scale (xs=4px, sm=8px, md=16px, lg=24px). Cards use 16-20px internal padding. Sections separated by 16px gaps.

---

## Visual Hierarchy

The redesigned insights tab follows a 3-tier visual hierarchy:

### Tier 1: Top Emotions (Hero Section)

This is the primary visual anchor. Users should immediately see their dominant emotion pattern.

**Visual treatment**:
- Dedicated card taking full width
- Top 3 emotions displayed as ranked items with visual weight decreasing from 1st to 3rd
- Each emotion shows: emotion color indicator, emotion label, percentage, and a horizontal progress bar
- 1st place emotion is visually prominent (larger text, bolder color, wider bar)
- 2nd and 3rd places are subordinate but clearly readable

**Progress bar design**:
- Height: 6-8px
- Background track: Light gray (`#F0E0E8`)
- Fill: Emotion-specific color with rounded ends (border-radius: full)
- Width proportional to percentage value
- Optional: Small percentage label at bar end

### Tier 2: Streak (Achievement Card)

A compact, encouraging card that celebrates consistency.

**Visual treatment**:
- Half-width card (or full-width on narrow viewports)
- Large streak number in Dongle font as the hero element
- Fire/flame icon with warm orange-red accent
- Descriptive subtitle in Gamja Flower ("N일 연속 작성 중!")
- Optional: Small calendar dots or mini sparkline showing recent activity

### Tier 3: Pattern Change (Trend Indicator)

A contextual insight card showing how emotions are shifting.

**Visual treatment**:
- Half-width card paired with streak (side-by-side on wider viewports)
- Trend direction indicator (up arrow or down arrow) in appropriate color
- Emotion label with trend description
- Subtle background tint matching the trending emotion color
- Message text in Gowun Dodum

---

## Layout Structure

### Mobile Layout (375px, primary)

```
+-----------------------------------+
|  [ Insights Tab Content ]         |
|                                   |
|  +-----------------------------+  |
|  | TOP EMOTIONS                |  |
|  |                             |  |
|  |  1. [===Emotion===]  45%   |  |
|  |     ████████████░░░░        |  |
|  |                             |  |
|  |  2. [==Emotion==]   30%    |  |
|  |     ██████████░░░░░░        |  |
|  |                             |  |
|  |  3. [=Emotion=]     15%    |  |
|  |     ██████░░░░░░░░░         |  |
|  +-----------------------------+  |
|                                   |
|  +----------------+ +----------+  |
|  | STREAK         | | PATTERN  |  |
|  |                | |          |  |
|  |     7          | | emotion  |  |
|  |  일 연속!      | | trending |  |
|  |  [flame icon]  | | [arrow]  |  |
|  +----------------+ +----------+  |
|                                   |
+-----------------------------------+
```

### Component Structure

The layout comprises three distinct visual sections:

**Section A - Top Emotions Card** (full width):
- Section header with trophy/star icon + "가장 많이 느낀 감정" label
- Ranked emotion list (max 3 items)
- Each item: color dot + emotion name + percentage + progress bar
- Items stack vertically with 12px gap between them

**Section B - Stats Row** (full width, internal 2-column grid):
- Left cell: Streak stat
- Right cell: Pattern change stat
- Both cells share equal width with 12px gap
- Each cell has its own card styling

**Empty state**: When no data is available, display a centered message with a sleeping jelly illustration and encouraging text in Gamja Flower font.

---

## Component Suggestions

### 1. Emotion Rank Item

A row component for each ranked emotion within the Top Emotions card.

**Elements**:
- Rank number badge (1, 2, 3) using emotion color background
- Emotion name label in Gamja Flower font
- Percentage value in Dongle font (larger for 1st place)
- Horizontal progress bar with emotion-color fill

**Visual weight distribution**:
- 1st place: Rank badge slightly larger, percentage text 20-24px, progress bar 8px height
- 2nd place: Standard badge, percentage text 16-18px, progress bar 6px height
- 3rd place: Standard badge, percentage text 14-16px, progress bar 6px height

### 2. Stat Card (Streak)

A compact stat card with a single hero number.

**Elements**:
- Icon (flame/fire for streak) with warm color
- Hero number in Dongle font, 28-36px
- Descriptive text in Gamja Flower, 12-14px
- Optional: Mini activity dots (last 7 days)

### 3. Stat Card (Pattern Change)

A compact stat card with trend direction.

**Elements**:
- Trend arrow icon (up or down)
- Emotion name in Gamja Flower
- Trend message in Gowun Dodum, 12-13px
- Subtle emotion-color tint on card background (10-15% opacity)

### 4. Progress Bar

A reusable horizontal progress indicator.

**Properties**:
- Fill color: Emotion-specific
- Track color: `#F0E0E8`
- Height: 6-8px
- Border radius: full (pill shape)
- Animation: Smooth width transition on tab switch (300ms ease-out)

### 5. Empty State

A friendly placeholder when no insights data exists.

**Elements**:
- Sleeping jelly illustration or icon
- Message: "아직 감정 기록이 없어요" in Gamja Flower
- Subtitle: "일기를 쓰면 인사이트가 보여요!" in Gowun Dodum

---

## Data Visualization Elements

### Progress Bars (primary visualization)

Used for top emotions percentage display. Each emotion's percentage maps to bar width. The visual comparison between bars makes relative emotion frequency immediately apparent without requiring users to read numbers.

**Design rationale**: Progress bars are the simplest visualization that communicates proportional data. They work well at small sizes, require no chart library, and render instantly without dynamic imports.

### Rank Badges (ordinal visualization)

Numbered circles (1, 2, 3) with emotion-colored backgrounds. Provides instant recognition of ranking without relying on medal emojis, which can feel inconsistent across platforms.

**Design rationale**: Colored rank badges are more visually controlled than platform-dependent emoji rendering, and they can be precisely styled to match the emotion color palette.

### Stat Hero Numbers (single-metric visualization)

Large Dongle-font numbers for streak count. The typography itself becomes the visualization -- oversized numbers create visual impact without charts.

**Design rationale**: A single large number is the most effective way to communicate a count metric. No chart needed for a scalar value.

### Trend Arrows (directional visualization)

Up/down arrow icons with color coding for pattern change direction. Simple and universally understood.

**Design rationale**: Directional indicators are the lightest-weight visualization for trend data. Combined with color coding, they communicate pattern change instantly.

---

## Interaction and Animation

### Tab Switch Transition

**When** the user selects the insights tab, **the system shall** fade-in the dashboard content with a subtle upward slide (200ms, ease-out). This matches the existing tab transition pattern.

### Progress Bar Animation

**When** the insights tab becomes visible, **each progress bar shall** animate from 0% width to its target width with a staggered delay (100ms between each bar). This creates a sequential reveal effect.

### Card Hover/Press

**Where** cards exist on touch devices, **the system shall** apply a subtle scale-down (0.98) on press with 150ms transition, providing tactile feedback.

---

## Accessibility Requirements

### EARS Requirements

**The system shall** maintain WCAG 2.1 AA compliance for all dashboard elements:

- **When** progress bars display emotion percentages, **the system shall** include aria-label with the exact percentage and rank (e.g., "평온 45%, 1위")
- **The system shall** ensure all text meets 4.5:1 contrast ratio against card backgrounds
- **While** the insights tab is active, **the system shall** maintain focus management for keyboard and screen reader navigation
- **If** no data is available, **the system shall** communicate the empty state via aria-live region

---

## Exclusions (What NOT to Design)

- Interactive drill-down or expandable detail panels (display-only)
- Time range selector or date picker (fixed 7-day window from existing data)
- New data analysis logic or computed metrics (reuse existing `useEmotionInsights` hook output)
- Real-time updating animations (data refreshes on tab open, not continuously)
- Comparison views (week-over-week, before/after)
- Achievement badges or gamification elements beyond streak count
- Sound effects or haptic feedback for statistics display

---

## Acceptance Criteria

### Visual Quality

- [ ] Insights tab has clear 3-section structure (top emotions card, streak card, pattern card)
- [ ] Top emotions section uses progress bars for proportional comparison
- [ ] Streak section displays hero number with supporting text
- [ ] Pattern section shows trend direction with emotion context
- [ ] All cards use consistent border-radius (16-20px), padding (16-20px), and shadow

### Brand Consistency

- [ ] Typography uses existing font stack (Dongle for numbers, Gamja Flower for labels, Gowun Dodum for body)
- [ ] Colors use existing palette (EMOTION_COLORS, EMOTION_TEXT_COLORS, UI_COLORS)
- [ ] Overall feel is warm and healing, not clinical or data-heavy

### Functional Completeness

- [ ] All three data points (topEmotions, streak, patternChange) are displayed
- [ ] Empty state shown when no data available
- [ ] Responsive layout works at 375px width (primary viewport)

### Accessibility

- [ ] All statistics have appropriate aria-labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigable within the tab

---

## References

- SPEC-UI-003: Current SPEC defining the insights tab requirements
- SPEC-UI-002: Bottom sheet architecture
- Design Guide: `.moai/design/design-guide.md` (color palette, typography, spacing)
- Data Source: `useEmotionInsights` hook (topEmotions, streak, patternChange)

---

Version: 1.0.0
Date: 2026-05-13
Classification: Design Brief
Project: Mind Jelly
