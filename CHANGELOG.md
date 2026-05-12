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

### Added (SPEC-AD-002)
- 보상형 광고 모달 컴포넌트 추가 (`src/components/ads/RewardedAdModal.tsx`)
  - 30초 광고 시청 후 보상 지급 시스템
  - 보상 유형 선택 UI (주간 리포트 / 감정 키워드 / 한정판 스킨)
  - 광고 완주 검증 및 보상 지급 로직
  - 광고 로드 실패 시 에러 처리
- 주간 감정 패턴 리포트 기능 추가 (`src/lib/rewards/weeklyReport.ts`)
  - 7일간 감정 데이터 분석 및 리포트 생성
  - 감정 분포 원 그래프, TOP 3 감정, 요일별 패턴
  - 데이터 부족 시 안내 문구 표시
- 오늘의 감정 키워드 추출 기능 추가 (`src/lib/rewards/emotionKeywords.ts`)
  - 텍스트 형용소 분석 기반 키워드 추출
  - 한국어 조사/접미사/불용어 처리
  - 최대 5개 키워드 추출 및 빈도수 계산
- 한정판 젤리 스킨 시스템 추가 (`src/lib/rewards/jellySkins.ts`)
  - 10종 스킨(곰돌이/고양이/판다/토끼/여우/유니콘/돌고래/나비/용/불새) 해금 로직
  - 24시간 타이머 기반 한정 스킨 시스템
  - 스킨 만료 후 자동 비활성화
- 보상 상태 관리 스토어 추가 (`src/stores/rewardStore.ts`)
  - Zustand + localStorage 영속화
  - 보상 이력, 활성 스킨, 해금 스킨 목록 관리
  - 보상형 광고 카운터 (SPEC-AD-001 전면형 광고와 별도)
- 홈 화면에 보상 CTA 버튼 추가 (`src/app/home/page.tsx`)
  - report 화면에서 "더 자세한 분석 보기" 버튼 표시

### Changed (SPEC-AD-002)
- 젤리 렌더러에 한정판 스킨 테마 지원 추가 (`src/components/jelly/JellyRenderer.tsx`)

### Testing (SPEC-AD-002)
- TDD 방식론(RED-GREEN-REFACTOR) 적용
- 테스트 커버리지: 14개 테스트 전체 통과
  - emotionKeywords 테스트: 10개
  - jellySkins 테스트: 8개
  - weeklyReport 테스트: 7개
  - rewardStore 테스트: 5개
- rewards 도메인 커버리지: 97.81% statements, 77.55% branches

### Technical Notes (SPEC-AD-002)
- localStorage 기반 보상 상태 영속화
- SPEC-AD-001의 빈도 제어기와 독립적인 보상형 광고 카운터
- mecab-ko 형용소 분석 대신 간소화 버전 사용 (GREEN phase)

🗿 MoAI <email@mo.ai.kr>
