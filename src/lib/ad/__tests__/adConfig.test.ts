/**
 * AppIntos AdMob Configuration Tests
 *
 * SPEC: SPEC-AD-001 (REQ-AD-001)
 * AppIntos GoogleAdMob SDK 설정 상수 검증
 */

import { describe, it, expect } from '@jest/globals';
import {
  BANNER_AD_GROUP_ID,
  INTERSTITIAL_AD_GROUP_ID,
  REWARDED_AD_GROUP_ID,
  INTERSTITIAL_CONFIG,
  BANNER_CONFIG,
} from '../adConfig';

describe('adConfig', () => {
  describe('광고 그룹 ID', () => {
    it('배너 광고 그룹 ID가 정의되어야 합니다', () => {
      expect(BANNER_AD_GROUP_ID).toBeDefined();
      expect(typeof BANNER_AD_GROUP_ID).toBe('string');
    });

    it('전면형 광고 그룹 ID가 정의되어야 합니다', () => {
      expect(INTERSTITIAL_AD_GROUP_ID).toBeDefined();
      expect(typeof INTERSTITIAL_AD_GROUP_ID).toBe('string');
    });

    it('보상형 광고 그룹 ID가 정의되어야 합니다', () => {
      expect(REWARDED_AD_GROUP_ID).toBeDefined();
      expect(typeof REWARDED_AD_GROUP_ID).toBe('string');
    });
  });

  describe('INTERSTITIAL_CONFIG', () => {
    it('전면형 광고 설정이 올바른 구조를 가져야 합니다', () => {
      expect(INTERSTITIAL_CONFIG).toBeDefined();
      expect(INTERSTITIAL_CONFIG.skipDelay).toBeDefined();
    });

    it('전면형 광고 스킵 지연시간은 5000ms여야 합니다', () => {
      expect(INTERSTITIAL_CONFIG.skipDelay).toBe(5000);
    });

    it('INTERSTITIAL_CONFIG는 불변 객체여야 합니다', () => {
      expect(Object.isFrozen(INTERSTITIAL_CONFIG)).toBe(true);
    });
  });

  describe('BANNER_CONFIG', () => {
    it('배너 광고 설정이 올바른 구조를 가져야 합니다', () => {
      expect(BANNER_CONFIG).toBeDefined();
      expect(BANNER_CONFIG.size).toBeDefined();
    });

    it('배너 광고 사이즈는 320x50이어야 합니다', () => {
      expect(BANNER_CONFIG.size.width).toBe(320);
      expect(BANNER_CONFIG.size.height).toBe(50);
    });

    it('BANNER_CONFIG는 불변 객체여야 합니다', () => {
      expect(Object.isFrozen(BANNER_CONFIG)).toBe(true);
    });
  });
});
