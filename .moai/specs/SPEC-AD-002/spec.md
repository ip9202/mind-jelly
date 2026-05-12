---
id: SPEC-AD-002
version: 1.0.0
status: implemented
created: 2026-05-11
updated: 2026-05-12
author: MoAI
priority: medium
issue_number: 0
---

# SPEC-AD-002: 보상형 광고 및 사용자 보상 시스템

## HISTORY

- 2026-05-11: 초기 작성 (v1.0.0). 전략 문서 `.moai/project/monetization-ad-strategy.md` Week 3-4 범위. 선행 SPEC: SPEC-AD-001.

## 개요

마음 젤리 앱에 보상형(Rewarded) 광고를 도입하여 사용자에게 부가 가치를 제공한다. 사용자가 30초 광고를 끝까지 시청하면 세 가지 보상 중 하나를 받을 수 있다: (A) 주간 감정 패턴 리포트, (B) 오늘의 감정 키워드, (C) 한정판 젤리 스킨.

report 화면에 "더 자세한 분석 보기" CTA 버튼을 추가하고, 버튼 클릭 시 보상형 광고 모달을 표시한다. 광고 완주 시 보상 지급 로직이 실행된다. SPEC-AD-001의 AdMob SDK 초기화와 빈도 제어기를 기반으로 동작한다.

## 요구사항 (EARS)

### REQ-AD-006: 보상형 광고 모달

**When** 홈 화면이 `report` 상태일 때,
**the system shall** 결과 카드 하단에 "더 자세한 분석 보기" CTA 버튼을 표시한다.

**When** 사용자가 CTA 버튼을 클릭하면,
**the system shall** 보상 유형 선택 모달을 표시하고, 선택된 보상에 해당하는 30초 보상형 광고를 재생한다.

**While** 보상형 광고가 재생 중일 때,
**the system shall** 사용자가 광고를 중간에 닫지 못하도록 강제하고, 광고를 끝까지 시청해야만 보상이 지급된다.

**If** 보상형 광고 로드에 실패하면,
**then** the system shall 모달에 "잠시 후 다시 시도해주세요" 메시지를 표시한다.

**If** 사용자가 광고를 중간에 종료하면,
**then** the system shall 보상을 지급하지 않고 모달을 닫는다.

### REQ-AD-007: 보상 A - 주간 감정 패턴 리포트

**When** 사용자가 보상형 광고를 완주하고 보상 A를 선택하면,
**the system shall** 지난 7일간의 감정 데이터를 분석하여 주간 리포트를 생성한다.

**The system shall** 리포트에 다음 정보를 포함한다:
- 감정 분포 원 그래프 (9개 감정별 비율)
- 가장 자주 나타난 감정 TOP 3
- 감정 변화 추세선 (7일)
- 요일별/시간대별 감정 패턴

**When** 주간 리포트가 생성되면,
**the system shall** 모달 내에서 스크롤 가능한 리포트 뷰를 표시한다.

**If** 7일간 감정 데이터가 부족(3회 미만)하면,
**then the system shall** "데이터가 더 모이면 더 정확한 리포트를 받을 수 있어요" 안내 문구를 표시한다.

### REQ-AD-008: 보상 B - 오늘의 감정 키워드

**When** 사용자가 보상형 광고를 완주하고 보상 B를 선택하면,
**the system shall** 오늘 입력한 감정 텍스트에서 핵심 키워드 5개를 추출한다.

**The system shall** 키워드에 다음 정보를 포함한다:
- 키워드 텍스트 (명사/형용사 중심)
- 각 키워드의 빈도수
- 감정과의 연관어 추천

**When** 키워드 분석이 완료되면,
**the system shall** 모달 내에서 키워드 카드 리스트를 표시한다.

### REQ-AD-009: 보상 C - 한정판 젤리 스킨

**When** 사용자가 보상형 광고를 완주하고 보상 C를 선택하면,
**the system shall** 한정판 젤리 스킨 중 하나를 무작위로 해금한다.

**The system shall** 해금된 스킨에 24시간 타이머를 설정하고, 타이머 만료 후 스킨이 자동으로 비활성화된다.

**When** 스킨이 해금되면,
**the system shall** 홈 화면 젤리를 해당 스킨으로 즉시 교체하고, 스킨 이름과 남은 시간을 표시한다.

**While** 한정판 스킨이 활성화된 상태에서,
**the system shall** 젤리 기본 디자인 대신 스킨 테마(곰돌이, 고양이, 판다 등)를 렌더링한다.

**If** 이미 활성화된 스킨이 있는 상태에서 새 스킨을 해금하면,
**then** the system shall 새 스킨으로 교체하고 타이머를 24시간으로 리셋한다.

### REQ-AD-010: 보상 상태 관리

**The system shall** 보상 이력을 Zustand 스토어와 localStorage에 영속화한다.

**When** 앱이 시작될 때,
**the system shall** localStorage에서 보상 상태를 복원하여 활성 스킨 타이머를 재개한다.

**If** 앱 재시작 시 활성 스킨의 타이머가 만료되었으면,
**then** the system shall 스킨을 비활성화하고 기본 젤리로 복원한다.

**The system shall** 보상형 광고 역시 SPEC-AD-001의 빈도 제어기에 의해 관리되나, 전면형 광고와 별도의 카운터를 사용한다.

## 영향 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `src/app/home/page.tsx` | [MODIFY] | report 화면에 보상 CTA 버튼 추가 |
| `src/components/ads/RewardedAdModal.tsx` | [NEW] | 보상형 광고 모달 (광고 재생 + 보상 선택 + 결과 표시) |
| `src/lib/rewards/weeklyReport.ts` | [NEW] | 주간 감정 패턴 리포트 생성 로직 |
| `src/lib/rewards/emotionKeywords.ts` | [NEW] | 감정 키워드 추출 로직 |
| `src/lib/rewards/jellySkins.ts` | [NEW] | 한정판 스킨 관리 (해금, 타이머, 목록) |
| `src/stores/rewardStore.ts` | [NEW] | 보상 상태 Zustand 스토어 |
| `src/components/rewards/WeeklyReportView.tsx` | [NEW] | 주간 리포트 뷰 컴포넌트 |
| `src/components/rewards/KeywordCardList.tsx` | [NEW] | 키워드 카드 리스트 컴포넌트 |
| `src/components/rewards/SkinUnlockAnimation.tsx` | [NEW] | 스킨 해금 애니메이션 컴포넌트 |
| `src/components/jelly/JellyRenderer.tsx` | [MODIFY] | 한정판 스킨 렌더링 지원 |

## 선행 SPEC

- **SPEC-AD-001**: AdMob SDK 초기화, 광고 빈도 제어기 (REQUIRED)

## Exclusions (What NOT to Build)

- 결제 기반 스킨 구매 (별도 SPEC 필요)
- 스킨 컬렉션 갤러리 UI
- 주간 리포트 PDF/이미지 내보내기
- 키워드 클라우드 시각화
- 소셜 공유 기능 (리포트/키워드 공유)
- 서버 사이드 보상 검증
- 스킨 거래/선물 기능
