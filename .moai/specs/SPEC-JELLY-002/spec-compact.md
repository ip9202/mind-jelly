---
id: SPEC-JELLY-002
version: 1.0.0
status: draft
created: 2026-05-09
updated: 2026-05-09
author: manager-spec
priority: P1
issue_number: 0
---

# SPEC-JELLY-002: Compact Requirements Reference

## 요구사항 요약

### MOD-AI: AI 감정 분석

| ID | 유형 | 요구사항 |
|----|------|---------|
| REQ-AI-001 | Event-Driven | WHEN 텍스트 제출 → GPT-4o-mini API 호출로 감정 분석 |
| REQ-AI-002 | State-Driven | WHILE 분석 중 → 로딩 인디케이터 + 중복 요청 방지 |
| REQ-AI-003 | Unwanted | IF API 실패/타임아웃 → 에러 메시지 + 재시도 옵션 |
| REQ-AI-004 | Ubiquitous | 항상 API 키 환경 변수 관리, 서버 사이드 Route Handler |
| REQ-AI-005 | Event-Driven | WHEN 분석 완료 → jellyStore 저장 + 구슬 5-15개 생성 |

### MOD-COLOR: 감정 기반 색상 전환

| ID | 유형 | 요구사항 |
|----|------|---------|
| REQ-COL-001 | Event-Driven | WHEN 감정 결과 저장 → 젤리 색상을 감정 색상으로 전환 |
| REQ-COL-002 | State-Driven | WHILE 전환 중 → CSS transition 800ms ease-in-out |
| REQ-COL-003 | Ubiquitous | 항상 EMOTION_COLORS 매핑 사용, 분석 전 기본 #FFD1DC |
| REQ-COL-004 | Unwanted | 색상 전환이 60fps 렌더링에 영향 주지 않음 |

### MOD-INPUT: 텍스트 입력 UI

| ID | 유형 | 요구사항 |
|----|------|---------|
| REQ-INP-001 | Event-Driven | WHEN 텍스트 제출 → 유효성 검사 + AI 분석 시작 |
| REQ-INP-002 | State-Driven | WHILE 입력 중 → 글자 수 카운터 + 상태 표시 |
| REQ-INP-003 | Unwanted | 빈 텍스트/공백만 있는 입력 제출 차단 |
| REQ-INP-004 | Event-Driven | WHEN 분석 완료 → 감정 한글명 + 색상 시각 피드백 |

### MOD-TOSS: 토스 브릿지 연동

| ID | 유형 | 요구사항 |
|----|------|---------|
| REQ-TOS-001 | Event-Driven | WHEN 앱 초기화 → Toss WebView 환경 감지 |
| REQ-TOS-002 | State-Driven | WHILE Bridge 연결 → 사용자 정보 비동기 읽기 |
| REQ-TOS-003 | Unwanted | IF Bridge 실패 → 일반 웹 모드 폴백 (핵심 기능 유지) |
| REQ-TOS-004 | Optional | 가능하면 기기 다크모드/화면 크기 정보 읽기 |

### MOD-THEME: 다크 모드 테마

| ID | 유형 | 요구사항 |
|----|------|---------|
| REQ-THM-001 | Event-Driven | WHEN 토글 클릭 → 라이트/다크 전환 (Tailwind class) |
| REQ-THM-002 | State-Driven | WHILE 시스템 테마 미선택 → OS 다크모드 설정 따름 |
| REQ-THM-003 | Ubiquitous | 항상 테마 선택 localStorage 영구 저장 |
| REQ-THM-004 | Unwanted | 테마 전환이 requestAnimationFrame 루프 중단시키지 않음 |
| REQ-THM-005 | Ubiquitous | 다크 모드 시 대비 색상 팔레트 적용 (젤리 가시성 확보) |

---

## 핵심 제약

| 항목 | 값 |
|------|-----|
| AI 모델 | GPT-4o-mini (비용 최적화) |
| API 호출 제한 | 60회/시간/사용자 |
| 텍스트 최대 길이 | 500자 |
| 감정 타입 | joy, sadness, anger, fear, disgust (5종) |
| 색상 전환 시간 | 800ms (CSS transition) |
| 테마 전환 시간 | 300ms (CSS transition) |
| Bridge 타임아웃 | 5초 |
| API 타임아웃 | 10초 |
| 성능 목표 | 60fps 유지 (모든 전환 시) |

---

## 제외 범위 (P2)

- 배경 크로스페이드
- 파티클 효과 고도화
- BGM / 사운드
- 공유 기능
- 접근성 (스크린 리더)
- 다국어 지원
- 감정 분석 히스토리 UI
- 오프라인 모드
- 다중 감정 혼합

---

## 선행 의존

| SPEC | 상태 |
|------|------|
| SPEC-JELLY-001 | Completed |
