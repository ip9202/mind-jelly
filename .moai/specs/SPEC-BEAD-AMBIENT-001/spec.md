---
id: SPEC-BEAD-AMBIENT-001
version: 1.0.0
status: draft
created: 2026-05-11
priority: P2
author: moai
---

# SPEC-BEAD-AMBIENT-001: 홈 배경 감정 구슬 (Ambient Emotion Beads)

## 개요

홈 배경에 하드코딩된 4개 CSS 구슬을 제거하고,
지원하는 감정 타입(9개) 수만큼 각 감정 색상 + EmotionFace 표정을 가진 구슬로 교체한다.

## 요구사항 (EARS)

### REQ-AMB-001: 구슬 수 = 감정 타입 수
**The system shall** 배경에 감정 타입 9개(joy/sadness/anger/fear/disgust/surprise/love/gratitude/hope)에 대응하는 구슬 9개를 표시한다.

### REQ-AMB-002: 감정별 색상
**The system shall** 각 구슬의 배경색을 EMOTION_COLORS[emotion] 값으로 설정한다.

### REQ-AMB-003: 감정 표정 표시
**The system shall** 각 구슬 내부에 EmotionFace 컴포넌트(size=18)로 해당 감정의 표정을 표시한다.

### REQ-AMB-004: 화면 전체 분산 배치
**The system shall** 9개 구슬을 화면에 고르게 분산 배치하되, 젤리 중앙 영역을 비워둔다.

### REQ-AMB-005: jelly-float 애니메이션
**The system shall** 각 구슬에 jelly-float 애니메이션을 적용하되 서로 다른 delay(0~4s)로 유기적으로 움직이게 한다.

## 인수 기준

- [ ] 배경 구슬 9개 표시 (하드코딩 4개 제거)
- [ ] 각 구슬 색상 = 감정별 EMOTION_COLORS
- [ ] 각 구슬 내 EmotionFace 표정 표시
- [ ] 구슬 크기 다양 (w-8~w-12, 감정별 고정)
- [ ] 화면 전체에 고르게 분산, 젤리 영역 방해 없음
- [ ] jelly-float 애니메이션 + 서로 다른 delay
- [ ] 기존 idle/input/beads 모든 uiState에서 보임

## 기술 접근

### 수정 파일
1. **src/app/home/page.tsx** — "Emotion Beads Canvas" 섹션 교체

### 구슬 레이아웃 (9개 위치 고정)

```
[joy]    [sadness]    [surprise]    ← 상단
         (공백-젤리)
[fear]           [love]             ← 중간
         (공백-젤리)
[disgust] [anger]  [gratitude]  [hope]  ← 하단
```

위치 정의 (top/left % 기준, 9개):
```ts
const AMBIENT_BEAD_POSITIONS: Record<EmotionType, { top: string; left: string; size: number; delay: string }> = {
  joy:        { top: '18%',  left: '8%',   size: 48, delay: '0s'   },
  sadness:    { top: '12%',  left: '55%',  size: 40, delay: '1.2s' },
  anger:      { top: '65%',  left: '72%',  size: 44, delay: '2.5s' },
  fear:       { top: '42%',  left: '5%',   size: 36, delay: '0.8s' },
  disgust:    { top: '72%',  left: '15%',  size: 40, delay: '3s'   },
  surprise:   { top: '8%',   left: '78%',  size: 44, delay: '1.8s' },
  love:       { top: '38%',  left: '82%',  size: 48, delay: '0.4s' },
  gratitude:  { top: '78%',  left: '55%',  size: 36, delay: '2s'   },
  hope:       { top: '78%',  left: '85%',  size: 40, delay: '1.5s' },
};
```

### 구슬 스타일 공식

```tsx
const EMOTION_TYPES: EmotionType[] = [
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope'
];

// 배경 구슬 렌더링
{EMOTION_TYPES.map((emotion) => {
  const pos = AMBIENT_BEAD_POSITIONS[emotion];
  const color = EMOTION_COLORS[emotion];
  return (
    <div
      key={emotion}
      className="absolute rounded-full flex items-center justify-center jelly-float
                 pointer-events-none shadow-sm border-2 border-white/40"
      style={{
        top: pos.top, left: pos.left,
        width: pos.size, height: pos.size,
        backgroundColor: color + 'CC',  // 80% opacity
        animationDelay: pos.delay,
      }}
    >
      <EmotionFace emotion={emotion} size={pos.size * 0.45} />
    </div>
  );
})}
```

### 주의사항
- `EmotionFace`는 이미 동적 import 가능 → 구슬이 배경이므로 SSR hydration 전에는 숨김 처리 (mounted 체크)
- 기존 `{/* Emotion Beads Canvas */}` 섹션 전체 교체
