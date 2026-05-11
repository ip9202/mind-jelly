---
id: SPEC-SKELETON-001
version: 1.0.0
status: draft
created: 2026-05-11
priority: P1
author: moai
---

# SPEC-SKELETON-001: 로딩 스켈레톤 UI (Loading Skeleton)

## 개요

홈 화면의 "로딩중..." 텍스트를 젤리 실루엣 스켈레톤으로 교체. 귀여운 로딩 UX로 긍정적 첫인상 제공.

## 요구사항 (EARS)

### REQ-SKEL-001: 스켈레톤 컴포넌트
**The system shall** 젤리 실루엣 SVG + shimmer/pulse 애니메이션을 포함한 JellySkeleton 컴포넌트를 제공한다.

### REQ-SKEL-002: PhysicsCanvas 로딩 적용
**When** PhysicsCanvas 동적 로딩 중일 때,
**the system shall** "로딩중..." 텍스트 대신 JellySkeleton 컴포넌트를 표시한다. (home/page.tsx:14)

### REQ-SKEL-003: SSR 마운트 대기 적용
**When** SSR hydration 전 mounted=false일 때,
**the system shall** JellySkeleton 컴포넌트를 표시한다. (home/page.tsx:202)

## 인수 기준

- [ ] JellySkeleton 컴포넌트 생성
- [ ] PhysicsCanvas loading prop에 적용
- [ ] SSR 대기 div에 적용
- [ ] shimmer/pulse 애니메이션 동작
- [ ] 기존 레이아웃 깨짐 없음

## 기술 접근

### 수정 파일
1. **src/components/jelly/JellySkeleton.tsx** (신규) — 젤리 실루엣 SVG + shimmer
2. **src/app/home/page.tsx** — 2곳 loading div 교체

### 스켈레톤 디자인
- 젤리 기본 모양(ppung)의 실루엣 SVG (rgba 색상)
- shimmer: 배경 그라디언트가 좌→우로 이동하는 CSS 애니메이션
- 크기: 120x120px, 화면 중앙 배치
