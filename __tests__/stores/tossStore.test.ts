/**
 * tossStore 상태 관리 테스트
 * isWebView, userIdentity, tossLoginUser, isBridgeReady, bridgeError + actions
 */

import { tossStore } from '@/stores/tossStore';

describe('tossStore', () => {
  beforeEach(() => {
    tossStore.getState().reset();
  });

  describe('초기 상태', () => {
    it('기본값이 올바르게 설정되어 있다', () => {
      const state = tossStore.getState();
      expect(state.isWebView).toBe(false);
      expect(state.userIdentity).toBeNull();
      expect(state.tossLoginUser).toBeNull();
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

  describe('setUserIdentity', () => {
    it('사용자 식별 정보를 설정한다', () => {
      const identity = { anonymousKey: 'hash-abc', deviceId: 'dev-xyz' };
      tossStore.getState().setUserIdentity(identity);
      expect(tossStore.getState().userIdentity).toEqual(identity);
    });

    it('사용자 식별 정보를 null로 설정한다', () => {
      tossStore.getState().setUserIdentity({ anonymousKey: 'h', deviceId: 'd' });
      tossStore.getState().setUserIdentity(null);
      expect(tossStore.getState().userIdentity).toBeNull();
    });
  });

  describe('setTossLoginUser', () => {
    it('토스 로그인 사용자 정보를 설정한다', () => {
      const user = { name: '홍길동', email: 'hong@example.com' };
      tossStore.getState().setTossLoginUser(user);
      expect(tossStore.getState().tossLoginUser).toEqual(user);
    });

    it('토스 로그인 사용자 정보를 null로 설정한다', () => {
      tossStore.getState().setTossLoginUser({ name: '홍길동', email: 'hong@example.com' });
      tossStore.getState().setTossLoginUser(null);
      expect(tossStore.getState().tossLoginUser).toBeNull();
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
      tossStore.getState().setUserIdentity({ anonymousKey: 'h', deviceId: 'd' });
      tossStore.getState().setTossLoginUser({ name: '테스트', email: 'test@test.com' });
      tossStore.getState().setBridgeReady(true);
      tossStore.getState().setBridgeError('에러');

      tossStore.getState().reset();

      const state = tossStore.getState();
      expect(state.isWebView).toBe(false);
      expect(state.userIdentity).toBeNull();
      expect(state.tossLoginUser).toBeNull();
      expect(state.isBridgeReady).toBe(false);
      expect(state.bridgeError).toBeNull();
    });
  });
});
