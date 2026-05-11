/**
 * SPEC-TOUCH-001: 터치 hit-test 로직 테스트
 *
 * REQ-TOUCH-001: 젤리 바디 근처 hit test
 * REQ-TOUCH-005: 1초 쿨다운, eating/satisfied 상태에서 무시
 */

import { isTouchOnJelly, shouldHandleTouch } from '@/lib/utils/touchHandler';

describe('SPEC-TOUCH-001: 터치 hit-test', () => {
  describe('isTouchOnJelly', () => {
    const jellyPos = { x: 400, y: 240 };
    const jellyRadius = 60;

    it('젤리 중심 클릭 시 true를 반환해야 한다', () => {
      expect(isTouchOnJelly(400, 240, jellyPos, jellyRadius)).toBe(true);
    });

    it('젤리 바디 안쪽 클릭 시 true를 반환해야 한다', () => {
      // 반경의 절반 거리
      expect(isTouchOnJelly(430, 240, jellyPos, jellyRadius)).toBe(true);
      expect(isTouchOnJelly(400, 270, jellyPos, jellyRadius)).toBe(true);
    });

    it('젤리 바디 경계 근처 클릭 시 true를 반환해야 한다', () => {
      // 반경 * 1.5 = 90 거리
      expect(isTouchOnJelly(490, 240, jellyPos, jellyRadius)).toBe(true);
    });

    it('젤리 바디 밖 클릭 시 false를 반환해야 한다', () => {
      // 반경 * 1.5 초과
      expect(isTouchOnJelly(500, 240, jellyPos, jellyRadius)).toBe(false);
      expect(isTouchOnJelly(300, 240, jellyPos, jellyRadius)).toBe(false);
    });

    it('대각선 거리도 정확히 계산해야 한다', () => {
      // 거리 = sqrt(60^2 + 60^2) = ~84.85, 반경*1.5=90 이내
      expect(isTouchOnJelly(460, 300, jellyPos, jellyRadius)).toBe(true);
      // 거리 = sqrt(70^2 + 70^2) = ~98.99, 반경*1.5=90 초과
      expect(isTouchOnJelly(470, 310, jellyPos, jellyRadius)).toBe(false);
    });
  });

  describe('shouldHandleTouch', () => {
    it('idle + 쿨다운 없음 + hit 시 true를 반환해야 한다', () => {
      expect(shouldHandleTouch({
        currentState: 'idle',
        canTouch: true,
        isOnJelly: true,
      })).toBe(true);
    });

    it('eating 상태에서는 false를 반환해야 한다', () => {
      expect(shouldHandleTouch({
        currentState: 'eating',
        canTouch: true,
        isOnJelly: true,
      })).toBe(false);
    });

    it('satisfied 상태에서는 false를 반환해야 한다', () => {
      expect(shouldHandleTouch({
        currentState: 'satisfied',
        canTouch: true,
        isOnJelly: true,
      })).toBe(false);
    });

    it('anticipation 상태에서는 false를 반환해야 한다', () => {
      expect(shouldHandleTouch({
        currentState: 'anticipation',
        canTouch: true,
        isOnJelly: true,
      })).toBe(false);
    });

    it('쿨다운 중에는 false를 반환해야 한다', () => {
      expect(shouldHandleTouch({
        currentState: 'idle',
        canTouch: false,
        isOnJelly: true,
      })).toBe(false);
    });

    it('젤리 바디 밖 클릭 시 false를 반환해야 한다', () => {
      expect(shouldHandleTouch({
        currentState: 'idle',
        canTouch: true,
        isOnJelly: false,
      })).toBe(false);
    });
  });
});
