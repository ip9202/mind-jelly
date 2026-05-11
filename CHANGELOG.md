# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (SPEC-AD-001)
- AdMob SDK 초기화 기능 추가 (`src/lib/ad/adInitializer.ts`)
- 전면형 광고(Interstitial Ad) 컴포넌트 추가 (`src/components/ads/InterstitialAd.tsx`)
  - satisfied -> report 상태 전환 시점에 광고 자동 표시
  - 5초 후 스킵 버튼 노출 기능
  - 광고 로드 실패 시 폴백 처리
- 배너 광고(Banner Ad) 컴포넌트 추가 (`src/components/ads/BannerAd.tsx`)
  - report 화면 하단에 320x50 크기 배너 표시
  - report -> idle 전환 시 자동 숨김
  - 광고 로드 실패 시 빈 공간으로 처리
- 광고 빈도 제어 기능 추가 (`src/lib/ad/adFrequencyControl.ts`)
  - 신규 사용자 보호: 첫 3세션 무광고
  - 세션당 전면형 광고 1회 제한 (일반 사용자)
  - 헤비 사용자(일일 5세션 이상) 2회 제한
  - localStorage 기반 세션 카운트 영속화
- AdMob 설정 상수 추가 (`src/lib/ad/adConfig.ts`)
  - 테스트 광고 ID (개발 환경)
  - 프로덕션 광고 ID (배포 환경)

### Changed (SPEC-AD-001)
- 홈 화면 (`src/app/home/page.tsx`)
  - satisfied -> report 전환 로직에 전면형 광고 통합
  - report 화면에 배너 광고 컴포넌트 추가
- 일기 화면 (`src/app/diary/page.tsx`)
  - 광고 ref 접근 패턴 개선

### Testing (SPEC-AD-001)
- TDD 방식론(RED-GREEN-REFACTOR) 적용
- 테스트 커버리지: 46개 테스트 전체 통과
  - AdConfig 테스트: 9개
  - AdFrequencyController 테스트: 15개
  - InterstitialAd 컴포넌트 테스트: 11개
  - BannerAd 컴포넌트 테스트: 11개

### Technical Notes (SPEC-AD-001)
- 앱인토스(@apps-in-toss/web-framework) AdMob API 활용
- 감정 입력 흐름(idle -> input -> restoring -> beads)에서 광고 노출 방지
- AdMob SDK 초기화 실패 시 graceful degradation

🗿 MoAI <email@mo.ai.kr>
