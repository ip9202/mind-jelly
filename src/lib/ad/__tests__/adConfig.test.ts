/**
 * AdMob Configuration Tests
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 * TDD Phase: RED - Write failing tests first
 */

import { describe, it, expect } from '@jest/globals';
import { AD_IDS, ADMOB_CONFIG, TEST_AD_IDS } from '../adConfig';

describe('adConfig', () => {
  describe('AD_IDS', () => {
    it('개발 환경에서는 테스트 광고 ID를 사용해야 합니다', () => {
      // getAdIds() 함수가 process.env.NODE_ENV를 확인하지 않고
      // 항상 TEST_AD_IDS를 반환하므로 테스트 광고 ID가 반환됩니다
      expect(AD_IDS.interstitial).toBe(TEST_AD_IDS.interstitial);
      expect(AD_IDS.banner).toBe(TEST_AD_IDS.banner);
    });

    it('테스트 광고 ID는 Google 공식 테스트 ID여야 합니다', () => {
      expect(AD_IDS.interstitial).toBe('ca-app-pub-3940256099942544/1033173712');
      expect(AD_IDS.banner).toBe('ca-app-pub-3940256099942544/2934735716');
    });
  });

  describe('ADMOB_CONFIG', () => {
    it('전면형 광고 설정이 올바른 구조를 가져야 합니다', () => {
      expect(ADMOB_CONFIG.interstitial).toBeDefined();
      expect(ADMOB_CONFIG.interstitial.adUnitId).toBeDefined();
      expect(ADMOB_CONFIG.interstitial.skipDelay).toBeDefined();
    });

    it('전면형 광고 스킵 지연시간은 5000ms여야 합니다', () => {
      expect(ADMOB_CONFIG.interstitial.skipDelay).toBe(5000);
    });

    it('배너 광고 설정이 올바른 구조를 가져야 합니다', () => {
      expect(ADMOB_CONFIG.banner).toBeDefined();
      expect(ADMOB_CONFIG.banner.adUnitId).toBeDefined();
      expect(ADMOB_CONFIG.banner.size).toBeDefined();
    });

    it('배너 광고 사이즈는 320x50이어야 합니다', () => {
      expect(ADMOB_CONFIG.banner.size.width).toBe(320);
      expect(ADMOB_CONFIG.banner.size.height).toBe(50);
    });

    it('ADMOB_CONFIG는 불변 객체여야 합니다 (as const)', () => {
      // TypeScript readonly check - attempting to modify should fail at compile time
      // At runtime, we just verify the structure exists
      expect(Object.isFrozen(ADMOB_CONFIG)).toBe(true);
    });
  });
});
