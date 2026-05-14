# SPEC-AD-003: 보상형 광고 서비스 통합

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC-ID | SPEC-AD-003 |
| 상태 | IMPLEMENTED |
| 우선순위 | High |
| 선행 SPEC | SPEC-AD-001 (REQUIRED), SPEC-AD-002 (REQUIRED) |
| 영향 도메인 | Frontend (UI, State, Ad) |
| 개발 방법론 | TDD (RED-GREEN-REFACTOR) |

## 배경

SPEC-AD-002에서 정의한 보상형 광고 시스템의 라이브러리 컴포넌트(`jellySkins.ts`, `weeklyReport.ts`, `emotionKeywords.ts`, `rewardStore.ts`, `RewardedAdModal.tsx`)는 모두 구현되었으나, **실제 서비스 UI에 연결(wiring)되지 않았다.** 본 SPEC은 기존 라이브러리를 홈 페이지 report 화면에 통합하고, mock 데이터를 실제 라이브러리 호출로 교체하는 작업을 다룬다.

또한 2026-05-14에 10종 스킨의 동물 특징 SVG(`skinFeatures.ts`)가 추가되었고, `JellyRenderer`에 `skinId` prop이 연결된 상태이므로, 스킨 보상 시 젤리 외관 변경이 즉시 반영된다.

## 범위

### 포함
- report 화면에 보상형 광고 CTA 버튼 추가
- RewardedAdModal을 홈 페이지에 렌더링
- 보상 선택 시 실제 라이브러리 호출 (mock 교체)
- 보상형 광고 빈도 제어 구현
- 보상 지급 이력 기록
- 앱 시작 시 스킨 만료 체크

### 제외
- 새로운 보상 유형 추가 (기존 3종 유지)
- 10종 스킨 데이터/디자인 변경 (이미 완료)
- 전면형/배너 광고 로직 변경 (SPEC-AD-001 영역)

---

## 요구사항 (EARS)

### REQ-RWD-001: 보상 CTA 버튼 (Event-Driven)

**When** 사용자가 report 화면에 있고 **and** 보상형 광고 시청 가능할 때, **the system shall** "광고 보고 보상 받기" CTA 버튼을 표시한다. **When** 사용자가 버튼을 클릭하면, **the system shall** RewardedAdModal을 연다.

- 버튼 위치: report 화면 하단
- 버튼 비활성화 조건: 일일/세션 광고 한도 초과
- 버튼 미표시 조건: idle/input/restoring/beads 상태

### REQ-RWD-002: 광고 완주 보상 활성화 (Event-Driven)

**When** 보상형 광고 모달이 열리면, **the system shall** GoogleAdMob 보상형 광고를 로드하고 재생한다. **When** 사용자가 광고를 끝까지 시청하여 `userEarnedReward` 이벤트가 발생하면, **the system shall** 보상 선택 UI를 활성화한다. **If** 사용자가 광고를 중도에 닫으면, **the system shall** 보상 없이 모달을 닫는다.

- WebView 환경이 아닐 경우: 테스트용으로 즉시 보상 활성화 (기존 폴백 유지)
- 광고 로드 실패 시: 사용자에게 안내 후 모달 닫기 (보상 미지급)

### REQ-RWD-003: 스킨 보상 처리 (State-Driven)

**When** 사용자가 `jelly_skin` 보상을 선택하면, **the system shall** `jellySkins.unlockRandomSkin(tier)`를 호출하여 무작위 스킨을 해금한다. **The system shall** 해금된 스킨의 동물 특징 SVG가 즉시 젤리에 반영되도록 `activeSkin` 상태를 업데이트한다.

- 스킨 등급 결정: 보상형 광고 시청 횟수에 따라
  - 1~3회차: Rare (곰돌이, 고양이, 판다, 토끼, 여우)
  - 4~6회차: Epic (유니콘, 돌고래, 나비)
  - 7회차+: Legendary (드래곤, 피닉스)
- 이미 해금된 스킨은 제외하고 미해금 스킨 중 무작위 선택
- 해당 등급의 모든 스킨이 이미 해금된 경우: 하위 등급에서 재시도
- 해금된 스킨은 24시간 후 자동 만료
- 스킨 해금 애니메이션: 동물 특징 SVG를 포함한 해금 화면 표시

### REQ-RWD-004: 주간 리포트 보상 처리 (State-Driven)

**When** 사용자가 `weekly_report` 보상을 선택하면, **the system shall** `generateReport(emotionHistory)`를 호출하여 실제 감정 데이터 기반 주간 리포트를 생성한다.

- 데이터 소스: `jellyStore.emotionHistory` (localStorage 영속화된 감정 기록)
- 최소 데이터 요건: 3개 이상 감정 기록. 부족 시 "더 많은 기록이 필요해요" 안내
- 리포트 구성: 감정 분포, TOP3 감정, 추세, 시간대별/요일별 패턴

### REQ-RWD-005: 감정 키워드 보상 처리 (State-Driven)

**When** 사용자가 `emotion_keywords` 보상을 선택하면, **the system shall** `extractKeywords(text)`를 호출하여 최근 일기 텍스트에서 감정 키워드를 추출한다.

- 데이터 소스: 가장 최근 일기 텍스트
- 키워드가 0개인 경우: "감정을 더 자세히 적어주시면 키워드가 나타나요" 안내
- 최대 5개 키워드를 빈도순으로 표시

### REQ-RWD-006: 보상 이력 기록 (Ubiquitous)

**The system shall** 모든 보상 지급 시 다음을 수행한다:
1. `rewardStore.addReward({ type, claimedAt })` 호출하여 보상 이력 기록
2. `rewardStore.incrementRewardedAdCount()` 호출하여 광고 시청 횟수 증가
3. 보상 이력은 `localStorage(key: 'reward-storage')`에 영속화

### REQ-RWD-007: 보상형 광고 빈도 제어 (State-Driven)

**The system shall** 보상형 광고 시청 빈도를 제한한다:
- 일일 최대: 3회
- 세션당: 1회 (세션 = 앱 실행~종료)
- **When** 한도에 도달하면, **the system shall** CTA 버튼을 비활성화하고 "오늘은 더 이상 시청할 수 없어요" 안내

빈도 제어는 기존 `adFrequencyControl.ts`의 localStorage 기반 구조를 확장하여 구현한다.

### REQ-RWD-008: 스킨 만료 체크 (Ubiquitous)

**When** 앱이 시작되거나 홈 페이지가 로드될 때, **the system shall** `rewardStore.checkSkinExpiration()`을 호출하여 24시간이 경과한 활성 스킨을 자동 제거한다. **When** 만료된 스킨이 제거되면, **the system shall** 젤리 외관을 기본 상태로 복원한다.

---

## 인수 기준

1. **E2E 플로우**: report 화면 CTA 클릭 → 광고 완주(또는 폴백) → 보상 3종 중 선택 → 실제 보상 지급 → rewardStore 기록
2. **광고 중도 포기**: 광고 닫기 시 보상 미지급, 모달만 닫힘
3. **스킨 보상**: 랜덤 스킨 해금 → 동물 특징 SVG 즉시 반영 → 24h 타이머 시작
4. **주간 리포트**: 실제 감정 데이터 분석 결과 표시 (데이터 부족 시 안내)
5. **키워드**: 실제 일기 텍스트 기반 키워드 추출 (데이터 부족 시 안내)
6. **빈도 제어**: 일 3회, 세션당 1회, 초과 시 CTA 비활성화
7. **만료 체크**: 앱 재시작 시 만료 스킨 자동 제거, 젤리 기본 복원
8. **영속화**: 보상 이력 + 활성 스킨 + 해금 스킨 목록이 localStorage에 저장, 새로고침 후에도 유지

---

## 영향 파일

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/app/home/page.tsx` | MODIFY | CTA 버튼, RewardedAdModal 렌더링, 보상 처리 콜백, 만료 체크 |
| `src/components/ads/RewardedAdModal.tsx` | MODIFY | 실제 라이브러리 호출, mock 제거, 스킨 해금 화면 개선 |
| `src/lib/ad/adFrequencyControl.ts` | MODIFY | canShowRewardedAd() + rewardedAdCount 관리 추가 |
| `src/lib/ad/adConfig.ts` | MODIFY | 보상형 광고 설정 추가 |
| `src/stores/rewardStore.ts` | MODIFY | canShowRewardedAd 스텁을 실제 구현으로 교체 |

### 참조 파일 (수정 없음)

- `src/lib/rewards/jellySkins.ts` - unlockRandomSkin(), getActiveSkin(), SKIN_THEMES
- `src/lib/rewards/weeklyReport.ts` - generateReport()
- `src/lib/rewards/emotionKeywords.ts` - extractKeywords()
- `src/lib/constants/skinFeatures.ts` - 10종 동물 특징 SVG
- `src/components/jelly/JellyRenderer.tsx` - skinId prop (이미 연결됨)
- `src/stores/jellyStore.ts` - emotionHistory, diary 데이터

---

## 기술 접근법

### 1. Home Page 통합

`src/app/home/page.tsx`에:
- `showRewardedModal` 상태 추가
- `selectedReward` 상태 추가
- report 화면에 CTA 버튼 추가 (`uiState === 'report'` 조건)
- `<RewardedAdModal>` 컴포넌트 렌더링
- 보상 처리 콜백: `handleRewardSelect(rewardType)`
- 앱 시작 시 `checkSkinExpiration()` 호출

### 2. RewardedAdModal 개선

`src/components/ads/RewardedAdModal.tsx`에:
- `onSelectReward` → 실제 보상 처리 로직
- `WeeklyReportView`: `generateReport()` 호출
- `EmotionKeywordsView`: `extractKeywords()` 호출
- `JellySkinView`: `unlockRandomSkin()` 호출, 동물 특징 SVG 표시

### 3. 빈도 제어

`src/lib/ad/adFrequencyControl.ts`에:
- `canShowRewardedAd(): boolean` 추가
- localStorage에 `rewarded_ad_frequency` 키로 일일/세션 카운트 관리
- `recordRewardedAdShown()` 호출 시 카운트 증가

---

## 테스트 계획

### 단위 테스트

| 테스트 | 대상 | 설명 |
|--------|------|------|
| canShowRewardedAd 일일 한도 | adFrequencyControl | 일 3회 초과 시 false |
| canShowRewardedAd 세션 한도 | adFrequencyControl | 세션당 1회 초과 시 false |
| 보상 처리 콜백 | home page | 보상 유형별 올바른 함수 호출 |
| 스킨 해금 플로우 | jellySkins | tier별 올바른 스킨 해금 |
| 만료 체크 | rewardStore | 24h 경과 시 activeSkin null |

### 컴포넌트 테스트

| 테스트 | 대상 | 설명 |
|--------|------|------|
| CTA 버튼 렌더링 | home page | report 상태에서만 표시 |
| RewardedAdModal 플로우 | modal | 광고 완주 → 보상 선택 → 지급 |
| 스킨 해금 화면 | modal | 동물 특징 SVG 포함 해금 애니메이션 |

---

버전: 1.0.0
생성일: 2026-05-14
작성자: MoAI (manager-spec 대행)
