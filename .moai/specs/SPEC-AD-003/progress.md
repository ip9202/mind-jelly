## SPEC-AD-003 Progress

- Started: 2026-05-14
- Mode: Standard (TDD, Brownfield Enhancement)
- Domain: Frontend (UI, State, Ad)
- UltraThink: activated

### Current State Analysis

**Already Implemented:**
- jellySkins.ts: unlockRandomSkin(), getActiveSkin(), SKIN_THEMES exported
- weeklyReport.ts: generateReport() available
- emotionKeywords.ts: extractKeywords() available
- skinFeatures.ts: 10종 동물 SVG features
- JellyRenderer.tsx: skinId prop connected
- rewardStore.ts: addReward(), unlockSkin(), checkSkinExpiration(), incrementRewardedAdCount()
- RewardedAdModal.tsx: GoogleAdMob ad loading/showing logic

**Needs Implementation:**
- adFrequencyControl.ts: canShowRewardedAd() (not exists)
- rewardStore.ts: canShowRewardedAd stub → real implementation
- RewardedAdModal.tsx: mock data → real library calls
- home/page.tsx: CTA button + modal + callbacks + expiration check

### Phase 0.95: Standard Mode (5 files, 1 domain)
