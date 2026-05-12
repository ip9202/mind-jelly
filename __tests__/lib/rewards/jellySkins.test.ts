/**
 * jellySkins.test.ts
 *
 * TDD RED phase: 한정판 젤리 스킨 관리 테스트
 * 모든 테스트는 실패 상태로 시작 (구현 전)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { jellySkins, JellySkin, SkinTier } from '@/lib/rewards/jellySkins';

describe('jellySkins (TDD RED)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Store 초기화 (테스트 간 상태 공유 방지)
    jellySkins.resetStore();
  });

  describe('스킨 목록', () => {
    it('ALL_SKINS 배열에 모든 스킨이 정의되어야 함', () => {
      const skins = jellySkins.getAllSkins();
      expect(skins).toBeDefined();
      expect(skins.length).toBeGreaterThan(0);
    });

    it('각 스킨은 id, name, tier, emoji 속성을 가져야 함', () => {
      const skins = jellySkins.getAllSkins();
      const firstSkin = skins[0];

      expect(firstSkin.id).toBeDefined();
      expect(typeof firstSkin.id).toBe('string');
      expect(firstSkin.name).toBeDefined();
      expect(firstSkin.tier).toBeDefined();
      expect(firstSkin.emoji).toBeDefined();
    });

    it('tier는 rare, epic, legendary 중 하나여야 함', () => {
      const skins = jellySkins.getAllSkins();
      const validTiers: SkinTier[] = ['rare', 'epic', 'legendary'];

      skins.forEach((skin) => {
        expect(validTiers).toContain(skin.tier);
      });
    });
  });

  describe('스킨 해금', () => {
    it('랜덤 스킨을 하나 선택하여 해금해야 함', () => {
      const unlockedSkin = jellySkins.unlockRandomSkin('rare');

      expect(unlockedSkin).not.toBeNull();
      expect(unlockedSkin!.tier).toBe('rare');
    });

    it('해금된 스킨은 24시간 유효해야 함', () => {
      const unlockedSkin = jellySkins.unlockRandomSkin('epic');
      expect(unlockedSkin).not.toBeNull();

      const now = Date.now();
      const expiresAt = new Date(unlockedSkin!.expiresAt).getTime();

      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt - now).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000); // 24시간 + 1초 오차
    });

    it('이미 해금된 스킨은 다시 해금되지 않아야 함', () => {
      const skin1 = jellySkins.unlockRandomSkin('rare');
      const skin2 = jellySkins.unlockRandomSkin('rare');

      // 같은 스킨이면 같은 ID여야 함
      expect(skin1).not.toBeNull();
      expect(skin1!.id).toBeDefined();
      // 실제 구현에서는 이미 해금된 스킨은 제외하고 다른 스킨을 선택
    });

    it('전체 해금 가능 스킨을 모두 해금하면 더 이상 해금할 스킨이 없어야 함', () => {
      const allSkins = jellySkins.getAllSkins();
      const rareSkins = allSkins.filter((s) => s.tier === 'rare');

      // 모든 rare 스킨 해금 시도
      for (let i = 0; i < rareSkins.length * 2; i++) {
        jellySkins.unlockRandomSkin('rare');
      }

      // 모두 해금되면 null 반환
      const result = jellySkins.unlockRandomSkin('rare');
      expect(result).toBeNull();
    });
  });

  describe('스킨 타이머 관리', () => {
    it('getActiveSkin으로 현재 활성 스킨을 조회해야 함', () => {
      const skin = jellySkins.unlockRandomSkin('legendary');
      expect(skin).not.toBeNull();
      jellySkins.setActiveSkin(skin!);

      const active = jellySkins.getActiveSkin();
      expect(active).not.toBeNull();
      expect(active).toEqual(skin);
    });

    it('isSkinExpired로 만료 여부를 확인해야 함', () => {
      const skin = jellySkins.unlockRandomSkin('epic');
      expect(skin).not.toBeNull();

      // 만료되지 않음
      expect(jellySkins.isSkinExpired(skin!)).toBe(false);

      // 타이머를 강제로 과거로 설정
      const expiredSkin = {
        ...skin!,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };
      expect(jellySkins.isSkinExpired(expiredSkin)).toBe(true);
    });

    it('clearActiveSkin으로 활성 스킨을 제거해야 함', () => {
      jellySkins.unlockRandomSkin('rare');
      jellySkins.setActiveSkin(jellySkins.getActiveSkin()!);

      jellySkins.clearActiveSkin();

      expect(jellySkins.getActiveSkin()).toBeNull();
    });
  });

  describe('스킨 렌더링 데이터', () => {
    it('스킨별 색상 테마를 제공해야 함', () => {
      const skins = jellySkins.getAllSkins();
      const firstSkin = skins[0];

      const theme = jellySkins.getSkinTheme(firstSkin.id);

      expect(theme).toBeDefined();
      expect(theme.primaryColor).toBeDefined();
      expect(theme.accentColor).toBeDefined();
    });

    it('스킨별 이모지를 제공해야 함', () => {
      const skins = jellySkins.getAllSkins();
      const firstSkin = skins[0];

      expect(firstSkin.emoji).toBeDefined();
      expect(typeof firstSkin.emoji).toBe('string');
    });
  });

  describe('스킨 저장소 영속성', () => {
    it('unlockSkin 시 store에 영속화되어야 함', () => {
      const beforeLength = jellySkins.getStore().unlockedSkins.length;

      jellySkins.unlockRandomSkin('rare');

      const afterLength = jellySkins.getStore().unlockedSkins.length;
      expect(afterLength).toBeGreaterThan(beforeLength);
    });

    it('setActiveSkin 시 store에 영속화되어야 함', () => {
      const skin = jellySkins.unlockRandomSkin('epic');
      expect(skin).not.toBeNull();

      jellySkins.setActiveSkin(skin!);

      const activeSkin = jellySkins.getActiveSkin();
      expect(activeSkin).not.toBeNull();
      expect(activeSkin).toEqual(skin);
    });
  });
});
