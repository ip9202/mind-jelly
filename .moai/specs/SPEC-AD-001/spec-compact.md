# SPEC-AD-001 (Compact)

## 요구사항 요약

| ID | 유형 | 요구사항 |
|----|------|----------|
| REQ-AD-001 | Ubiquitous + Event | AdMob SDK 초기화, 실패 시 폴백 |
| REQ-AD-002 | Event-Driven | satisfied->report 전환 시 전면형 광고, 5초 스킵 |
| REQ-AD-003 | State-Driven | report 상태에서만 320x50 배너 광고 |
| REQ-AD-004 | State-Driven | 신규 3세션 무광고, 일반 1회/세션, 헤비 2회/세션 |
| REQ-AD-005 | Unwanted | idle/input/restoring/beads 상태에서 광고 금지 |

## 인수 기준 요약

1. AdMob 초기화 실패해도 앱 정상 동작
2. 전면형 광고: 5초 스킵, 실패 시 즉시 report 전환
3. 배너: report 화면만, idle 전환 시 즉시 숨김
4. 빈도: sessionCount < 3 차단, 일반 1회, 헤비(5+/일) 2회, 일일 리셋
5. 감정 입력 중 광고 금지, 광고 중 입력 시 즉시 닫기
6. localStorage 기반 영속화, 손상 시 기본값 폴백

## 영향 파일

- `granite.config.ts` [MODIFY]
- `src/app/home/page.tsx` [MODIFY]
- `src/lib/ad/adConfig.ts` [NEW]
- `src/lib/ad/adInitializer.ts` [NEW]
- `src/lib/ad/adFrequencyControl.ts` [NEW]
- `src/components/ads/InterstitialAd.tsx` [NEW]
- `src/components/ads/BannerAd.tsx` [NEW]
