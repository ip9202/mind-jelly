# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (SPEC-UI-003)
- 인사이트 탭 3-tier 대시보드 레이아웃
  - Hero 섹션: 주간 TOP 3 감정 인라인 카드 (스트릭 헤더 통합)
  - Achievement 섹션: 감정 스트릭 카드 (연속 기록 일수 표시)
  - Trend 섹션: 감정 트렌드 분석 (주간 패턴 변화 감지)
- 스트릭 카드 인라인 통합
  - 상위 감정 카드 헤더에 스트릭 정보 표시
  - 별도 섹션 제거로 화면 공간 최적화
  - 연속 일수에 따른 동적 아이콘 표시
- `EMOTION_TEXT_COLORS` 상수 추가
  - 감정별 어두운 음영(shade) 색상 매핑
  - 밝은 배경에서 가독성 확보 (SPEC-UI-003 개선)
- 감정 키워드 추출 기능
  - `emotion-insights.ts`에 키워드 추출 로직 추가
  - 텍스트 감정 분석 후 주요 키워드 5개 추출

### Changed (SPEC-UI-003)
- `EmotionStatsBottomSheet` 구조 재설계
  - 3단계 시각화(요약/시각화/인사이트)에서 3-tier 레이아웃으로 변경
  - 인사이트 탭에 스트릭 및 트렌드 분석 통합
  - 상단 감정 카드에 스트릭 헤더 인라인 통합
- 바텀시트 UI 일관성 개선
  - `EmotionStatsBottomSheet`와 `EmotionInput`에서 X 버튼 제거
  - 드래그 핸들 추가 (36px x 4px, 회색 배경)
  - 부드러운 드래그 팔로우 애니메이션 구현
  - 스와이프 제스처로 닫기 기능 유지
- `NavMenu` Friends 항목 숨김 처리
  - `@MX:TODO` 태그로 추후 복구 가능하도록 처리
  - 사용자 요청에 따른 일시적 메뉴 구성 변경

### Added (SPEC-UI-002)
- 감정 통계 바텀시트 모달 (`EmotionStatsBottomSheet` 컴포넌트)
  - WeeklyTrendChart와 EmotionDonutChart를 바텀시트 내부에 렌더링
  - 5가지 닫기 방법 지원 (백드롭 탭, 스와이프 다운, ESC 키, 드래그 핸들)
  - 부드러운 슬라이드 업/다운 애니메이션 (300ms/250ms)
  - WCAG 2.1 AA 접근성 준수 (포커스 트랩, aria-modal, 키보드 네비게이션)
  - 터치/마우스 제스처 지원 (드래그 핸들 스와이프)
  - `prefers-reduced-motion` 미디어 쿼리 지원
- 듀얼 CTA 레이아웃
  - "감정 표현하기" (기존 기능, 핑크 그라데이션)
  - "감정 통계 보기" (신규, 차트 아이콘 포함 투명 보더 버튼)
  - 모바일 화면에서 flex-1로 균등 분할
- EmotionInput 바텀시트와의 충돌 방지 로직
  - uiState가 'idle'일 때만 "감정 통계 보기" 버튼 활성화
  - 감정 입력 중에는 통계 바텀시트 열기 방지

### Changed (SPEC-UI-002)
- `EmotionReportCard` 컴포넌트 구조 변경
  - 인라인 차트 렌더링(2단계 시각화) 제거
  - 요약 레이어(1단계)와 인사이트 레이어(3단계)만 인라인 유지
  - 차트 데이터 로딩 훅(`useEmotionChartData`)은 유지하되 바텀시트로 props 전달
- 홈 화면(`src/app/home/page.tsx`) CTA 영역 수정
  - 단일 "감정 표현하기" 버튼 → 듀얼 CTA 레이아웃으로 변경
  - "감정 통계 보기" 버튼 클릭 시 바텀시트 오픈
- 바텀시트 드래그 핸들 애니메이션 개선
  - 드래그 중 실시간 transform 추적 (dragOffset 상태)
  - 부드러운 드래그 팔로우 구현 (스프링 물리 시뮬레이션)
  - 터치 시작/이동/종료 이벤트 핸들링 개선

### Removed (SPEC-UI-002)
- `EmotionReportCard` 인라인 차트 그리드 렌더링 코드 제거
  - WeeklyTrendChart와 EmotionDonutChart의 인라인 표시 제거
  - 바텀시트 내부로만 렌더링되도록 변경
- 바텀시트 X 버튼 제거 (SPEC-UI-003 UI 일관성 개선)
  - `EmotionStatsBottomSheet`와 `EmotionInput`에서 X 닫기 버튼 제거
  - 드래그 핸들과 스와이프 제스처로 닫기 기능 유지

### Testing (SPEC-UI-003)
- TDD 방식론(RED-GREEN-REFACTOR) 적용
- 테스트 커버리지: 245개 테스트 전체 통과
  - 바텀시트 드래그 애니메이션 테스트 추가
  - 스트릭 카드 인라인 통합 테스트
  - EMOTION_TEXT_COLORS 상수 테스트
  - 접근성: 드래그 핸더 터치 타겟 크기 준수

### Testing (SPEC-UI-002)
- TDD 방식론(RED-GREEN-REFACTOR) 적용
- 테스트 커버리지: 33개 테스트 전체 통과
  - EmotionStatsBottomSheet: 21개 새로운 테스트
  - EmotionReportCard 변경사항: 8개 새로운 테스트
  - 기존 테스트 업데이트: 5개
- EmotionStatsBottomSheet 컴포넌트 커버리지: 96%
- 접근성 테스트: ARIA 속성, 포커스 관리, 키보드 네비게이션 검증

### Technical Notes (SPEC-UI-003)
- 바텀시트 최대 높이: 뷰포트의 85%
- 바텀시트 최소 높이: 뷰포트의 60%
- 드래그 핸들: 36px x 4px, 색상 `bg-gray-300`
- 백드롭 투명도: 40% (`bg-black/40`)
- Recharts 동적 임포트 유지 (`ssr: false`)
- 바텀시트 닫혀 있을 때 차트 컴포넌트 렌더링 안 함 (조건부 렌더링)
- 애니메이션 60fps 유지 (CSS transform 기반)
- 이모지 사용 ("📊") 대신 Lucide React 아이콘 사용 (`BarChart3`)
- 스트릭 데이터 연속성 검증 로직 추가
- 감정 키워드 추출 알고리즘: 빈도수 기반 상위 5개 선택

### Technical Notes (SPEC-UI-002)
- 드래그 애니메이션: 스프링 물리 시뮬레이션 (damping, stiffness)
- 스와이프 감지: 50px 임계값 (SWIPE_THRESHOLD_PX)
- 터치 이벤트 핸들링: touchstart, touchmove, touchend
- 애니메이션 프레임: requestAnimationFrame 사용 (60fps 보장)

### Added (SPEC-UI-001)
- 감정 리포트 시각화 기능
  - 주간 감정 트렌드 차트 (`WeeklyTrendChart` 컴포넌트)
  - 감정 분포 도넛 차트 (`EmotionDonutChart` 컴포넌트)
  - 3단계 시각적 계층 구조 (요약/시각화/인사이트)
  - 인터랙티브 차트 요소 (호버, 터치, 툴팁)
  - 차트 진입 애니메이션 시스템 (`ChartAnimations`)
  - 개인화된 감정 인사이트 (`useEmotionInsights` 훅)
  - WCAG 2.1 AA 접근성 준수
  - 반응형 디자인 (모바일/태블릿 지원)
  - 스켈레톤 로딩 상태 (`EmotionReportSkeleton`)
- 새로운 컴포넌트 및 유틸리티
  - `EmotionReportCard`: 메인 감정 리포트 컨테이너
  - `EmotionDetailPanel`: 감정 상세 정보 슬라이드업 패널
  - `emotion-insights.ts`: 감정 데이터 분석 로직
  - `chartTheme.ts`: Recharts 테마 설정
  - `index.ts`: 컴포넌트 통합 내보내기

### Changed (SPEC-UI-001)
- 홈 화면 감정 리포트 영역 개선
  - 텍스트 전용 카드 → 인터랙티브 시각화 리포트
  - 9개 감정 컬러 시스템 시각화
  - 데이터 기반 인사이트 제공
- 상수 및 타입 시스템 확장
  - `emotion.ts`: 감정별 아이콘 매핑 추가
  - `emotion-chart.ts`: 새로운 차트 타입 정의

### Testing (SPEC-UI-001)
- TDD 방식론(RED-GREEN-REFACTOR) 적용
- 테스트 커버리지: 90개 테스트 전체 통과
  - visualization 컴포넌트: 56개
  - emotion-insights: 9개
  - lib 상수: 25개
- overall 커버리지: 85%+ 달성

### Technical Notes (SPEC-UI-001)
- Recharts 라이브러리 도입 (동적 import로 번들 크기 최적화)
- 클라이언트 사이드 데이터 캐싱 구현
- 60fps 애니메이션 프레임레이트 유지
- 번들 사이즈 증가량 50KB 이하 (gzip 기준)
- 초기 렌더링 지연 200ms 이하 달성
- `prefers-reduced-motion` 미디어 쿼리 지원
- 키보드 네비게이션 지원 (Tab 키 포커스)
- 터치 타겟 크기 44x44px 준수

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

## [1.3.0] - 2026-05-12

### Added (BRAND-UI-001)
- 브랜드 가이드 준수 UI 디자인 시스템 적용
  - visual-identity.md 정의: 색상, 타이포그래피, 폰트 패밀리
  - TDS 스타일 Semantic Typography Tokens 도입 (display, title1-3, body1-2, caption)
  - 하이브리드 폰트 시스템: Toss Design System 구조 + 프로젝트 브랜드 폰트 유지

### Changed (BRAND-UI-001)
- 홈 화면 CTA 버튼 디자인 (`src/app/home/page.tsx`)
  - 배경: 갈색 primary → 핑크 그라데이션 (#FF9ECD → #FFD1DC)
  - 폰트: Gowun Dodum → Gamja Flower (장난스러운 손글씓)
  - 호버 효과: 그림자 강화 + 살짝 떠오름 효과
- 감정 입력폼 textarea 폰트 크기 조정 (`src/components/input/EmotionInput.tsx`)
  - 텍스트 영역: 24px → 14px (상단 안내 문구와 동일)
  - 폰트: Gowun Dodum 추가, 행간 leading-relaxed 적용
- 감정 분석 버튼 리디자인 (`src/components/input/EmotionInput.tsx`)
  - 홈 화면 CTA와 동일한 핑크 그라데이션 + Gamja Flower 폰트
- 친구 페이지 헤더 폰트 통일 (`src/app/friends/page.tsx`)
  - 모든 섹션 헤더: 48px → 20px (text-5xl → text-xl)
  - 폰트: Dongle → Gowun Dodun, 굵기 bold 추가
- 설정 페이지 폰트 스타일 통일 (`src/app/settings/page.tsx`)
  - 섹션 헤더, 초대코드: 적절한 크기로 조정
  - 푸터 장식: Gamja Flower 폰트 적용
- 다이어리 페이지 헤더 폰트 통일 (`src/app/diary/page.tsx`)
  - 타임라인, 감정 흐름 헤더: Dongle → Gowun Dodum

### Fixed (BRAND-UI-001)
- 전체 페이지 헤더 폰트 크기 불일치 해소
- 사용성 개선: 너무 큰 헤더(48px)로 인한 가독성 문제 해결

🗿 MoAI <email@mo.ai.kr>
