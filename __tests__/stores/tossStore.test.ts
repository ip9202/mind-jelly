/**
 * tossStore 상태 관리 테스트
 * M4-T2: isWebView, userInfo, isBridgeReady, bridgeError + actions
 */

import { tossStore } from '@/stores/tossStore';

describe('tossStore', () => {
  // 각 테스트 전 store 초기화
  beforeEach(() => {
    tossStore.getState().reset();
  });

  describe('초기 상태', () => {
    it('기본값이 올바르게 설정되어 있다', () => {
      const state = tossStore.getState();

      expect(state.isWebView).toBe(false);
      expect(state.userInfo).toBeNull();
      expect(state.isBridgeReady).toBe(false);
      expect(state.bridgeError).toBeNull();
    });
  });

  describe('setWebView', () => {
    it('isWebView를 true로 설정한다', () => {
      tossStore.getState().setWebView(true);
      expect(tossStore.getState().isWebView).toBe(true);
    });

    it('isWebView를 false로 설정한다', () => {
      tossStore.getState().setWebView(true);
      tossStore.getState().setWebView(false);
      expect(tossStore.getState().isWebView).toBe(false);
    });
  });

  describe('setUserInfo', () => {
    it('사용자 정보를 설정한다', () => {
      const userInfo = { name: '홍길동', userId: 'user-123' };
      tossStore.getState().setUserInfo(userInfo);

      expect(tossStore.getState().userInfo).toEqual(userInfo);
    });

    it('사용자 정보를 null로 설정한다', () => {
      const userInfo = { name: '홍길동', userId: 'user-123' };
      tossStore.getState().setUserInfo(userInfo);
      tossStore.getState().setUserInfo(null);

      expect(tossStore.getState().userInfo).toBeNull();
    });
  });

  describe('setBridgeReady', () => {
    it('isBridgeReady를 true로 설정한다', () => {
      tossStore.getState().setBridgeReady(true);
      expect(tossStore.getState().isBridgeReady).toBe(true);
    });

    it('isBridgeReady를 false로 설정한다', () => {
      tossStore.getState().setBridgeReady(true);
      tossStore.getState().setBridgeReady(false);
      expect(tossStore.getState().isBridgeReady).toBe(false);
    });
  });

  describe('setBridgeError', () => {
    it('에러 메시지를 설정한다', () => {
      tossStore.getState().setBridgeError('Connection failed');
      expect(tossStore.getState().bridgeError).toBe('Connection failed');
    });

    it('에러를 null로 초기화한다', () => {
      tossStore.getState().setBridgeError('Error');
      tossStore.getState().setBridgeError(null);
      expect(tossStore.getState().bridgeError).toBeNull();
    });
  });

  describe('reset', () => {
    it('모든 상태를 초기값으로 되돌린다', () => {
      tossStore.getState().setWebView(true);
      tossStore.getState().setUserInfo({ name: '테스트', userId: '1' });
      tossStore.getState().setBridgeReady(true);
      tossStore.getState().setBridgeError('에러');

      tossStore.getState().reset();

      const state = tossStore.getState();
      expect(state.isWebView).toBe(false);
      expect(state.userInfo).toBeNull();
      expect(state.isBridgeReady).toBe(false);
      expect(state.bridgeError).toBeNull();
    });
  });
});
