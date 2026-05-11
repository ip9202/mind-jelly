---
id: SPEC-AD-001
version: 1.0.0
status: completed
created: 2026-05-11
updated: 2026-05-11
author: MoAI
priority: medium
issue_number: 0
implementation_method: tdd
---

# SPEC-AD-001: AdMob 기반 인앱 광고 기본 통합

## HISTORY

- 2026-05-11: 초기 작성 (v1.0.0). 전략 문서 `.moai/project/monetization-ad-strategy.md` 기반으로 Week 1-2 범위 SPEC 생성.
- 2026-05-11: 구현 완료 (v1.0.0). TDD 방식론(RED-GREEN-REFACTOR) 적용, 테스트 46개 전체 통과, AdMob SDK 초기화/전면형광고/배너광고/빈도제어 구현 완료.

## 개요

마음 젤리 앱에 Google AdMob 광고를 통합하여 수익화 기반을 구축한다. 앱인토스 플랫폼 제약사항(AdMob 전용)을 준수하며, 감정 정화 흐름(입력 -> 분석 -> 구슬 삼키기)에 개입하지 않고 satisfied 상태 이후에만 광고를 노출한다.

전면형(Interstitial) 광고는 satisfied -> report 상태 전환 시점에, 배너 광고는 report 화면 하단에만 표시한다. 광고 빈도 제어기를 통해 신규 사용자 보호(첫 3세션 무광고) 및 세션당 광고 한도를 관리한다.

## 요구사항 (EARS)

### REQ-AD-001: AdMob SDK 초기화

**The system shall** 앱 시작 시 `@apps-in-toss/web-framework`의 AdMob API를 통해 Google AdMob SDK를 초기화한다.

**When** 앱이 로드될 때,
**the system shall** `granite.config.ts`에 정의된 AdMob 설정을 기반으로 SDK를 초기화하고, 개발 환경에서는 테스트 광고 ID를 사용한다.

**If** AdMob SDK 초기화에 실패하면,
**then** the system shall 에러를 로깅하고 광고 없이 앱이 정상 동작하도록 폴백 처리한다.

### REQ-AD-002: 전면형 광고 (Interstitial Ad)

**When** 홈 화면 상태머신이 `beads`에서 `satisfied`를 거쳐 `report`로 전환되기 직전,
**the system shall** 전면형 광고를 로드하고 표시한다.

**While** 전면형 광고가 표시 중일 때,
**the system shall** 5초 후 스킵 버튼을 노출하여 사용자가 광고를 닫을 수 있게 한다.

**When** 사용자가 광고를 닫거나 광고가 종료되면,
**the system shall** `report` 상태로 전환하여 결과 화면을 표시한다.

**If** 전면형 광고 로드에 실패하면,
**then** the system shall 광고 없이 즉시 `report` 상태로 전환한다.

### REQ-AD-003: 배너 광고 (Banner Ad)

**While** 홈 화면이 `report` 상태일 때,
**the system shall** 결과 화면 하단에 320x50 크기의 배너 광고를 표시한다.

**When** 홈 화면이 `report`에서 `idle`로 전환되면,
**the system shall** 배너 광고를 즉시 숨긴다.

**If** 배너 광고 로드에 실패하면,
**then** the system shall 빈 공간으로 처리하고 레이아웃에 영향을 주지 않는다.

### REQ-AD-004: 광고 빈도 제어 (Ad Frequency Controller)

**When** 광고 표시가 요청될 때,
**the system shall** AdFrequencyController를 통해 현재 사용자의 광고 노출 가능 여부를 확인한다.

**While** 사용자의 세션 카운트가 3회 미만일 때 (신규 사용자),
**the system shall** 모든 광고 표시를 차단한다.

**When** 일반 사용자(세션 3회 이상)가 세션 내에서 첫 번째 광고를 시청하면,
**the system shall** 해당 세션에서 추가 전면형 광고를 차단한다.

**When** 헤비 사용자(일일 5세션 이상)가 세션 내에서 두 번째 광고까지 시청하면,
**the system shall** 해당 세션에서 추가 광고를 차단한다.

**The system shall** 세션 카운트와 광고 시청 이력을 localStorage에 영속화하여 앱 재시작 후에도 유지한다.

### REQ-AD-005: 감정 입력 흐름 보호

**The system shall** 감정 입력(`idle` -> `input`), AI 분석(`input` -> `restoring`), 구슬 생성/삼키기(`restoring` -> `beads`) 상태에서는 어떠한 광고도 표시하지 않는다.

**If** 광고가 이미 표시 중일 때 사용자가 감정 입력을 시작하면,
**then** the system shall 광고를 즉시 닫고 입력 흐름으로 전환한다.

## 영향 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `granite.config.ts` | [MODIFY] | AdMob 초기화 설정 추가 |
| `src/app/home/page.tsx` | [MODIFY] | satisfied->report 전환 시 전면형 광고 트리거, report 화면에 배너 추가 |
| `src/lib/ad/adConfig.ts` | [NEW] | AdMob 설정 상수 (테스트/프로덕션 광고 ID) |
| `src/lib/ad/adInitializer.ts` | [NEW] | AdMob SDK 초기화 로직 |
| `src/lib/ad/adFrequencyControl.ts` | [NEW] | 광고 빈도 제어기 (localStorage 기반) |
| `src/components/ads/InterstitialAd.tsx` | [NEW] | 전면형 광고 컴포넌트 |
| `src/components/ads/BannerAd.tsx` | [NEW] | 배너 광고 컴포넌트 |

## Exclusions (What NOT to Build)

- 보상형(Rewarded) 광고 -- SPEC-AD-002에서 다룸
- A/B 테스트 인프라 -- 전략 문서의 장기 계획, 별도 SPEC 필요
- 광고 수익 대시보드/분석 도구
- 감정 기반 광고 타겟팅 (광고 카테고리 매칭)
- 광고 차단 결제/인앱 결제 시스템
- 서버 사이드 광고 빈도 관리 (localStorage 전용)
