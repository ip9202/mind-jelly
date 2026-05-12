# SPEC-AD-002 (Compact)

## 요구사항 요약

| ID | 유형 | 요구사항 |
|----|------|----------|
| REQ-AD-006 | Event-Driven | report 화면 CTA -> 보상 선택 -> 30초 보상형 광고 -> 보상 지급 |
| REQ-AD-007 | Event-Driven | 보상 A: 7일 감정 리포트 (분포/TOP3/추세/패턴) |
| REQ-AD-008 | Event-Driven | 보상 B: 감정 키워드 5개 추출 |
| REQ-AD-009 | Event-Driven + State | 보상 C: 한정판 스킨 해금, 24시간 타이머 |
| REQ-AD-010 | Ubiquitous | 보상 상태 Zustand+localStorage 영속화 |

## 인수 기준 요약

1. CTA 클릭 -> 보상 선택 -> 30초 광고 완주 -> 보상 지급 (완주 필수)
2. 광고 중도 포기 시 보상 미지급
3. 주간 리포트: 7일 분포/TOP3/추세/패턴, 데이터 부족 시 안내
4. 키워드: 5개 추출, 부족 시 감정명 파생
5. 스킨: 무작위 해금, 24시간 타이머, 교체 시 리셋, 만료 시 복원
6. 앱 재시작 시 만료 확인 + 스킨/보상 상태 복원
7. 모달 열림 시 report 자동 복귀 타이머 일시정지

## 선행 SPEC

- SPEC-AD-001 (REQUIRED)

## 영향 파일

- `src/app/home/page.tsx` [MODIFY]
- `src/components/ads/RewardedAdModal.tsx` [NEW]
- `src/lib/rewards/weeklyReport.ts` [NEW]
- `src/lib/rewards/emotionKeywords.ts` [NEW]
- `src/lib/rewards/jellySkins.ts` [NEW]
- `src/stores/rewardStore.ts` [NEW]
- `src/components/rewards/WeeklyReportView.tsx` [NEW]
- `src/components/rewards/KeywordCardList.tsx` [NEW]
- `src/components/rewards/SkinUnlockAnimation.tsx` [NEW]
- `src/components/jelly/JellyRenderer.tsx` [MODIFY]
