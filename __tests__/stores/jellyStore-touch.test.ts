/**
 * SPEC-TOUCH-001: 젤리 터치 반응 스토어 테스트
 *
 * REQ-TOUCH-001: idle 상태에서 젤리 바디 터치 시 happy 표정
 * REQ-TOUCH-002: happy 표정 2초 유지 후 idle 복귀
 * REQ-TOUCH-004: 1초 쿨다운 (이내 터치 무시)
 * REQ-TOUCH-005: eating/satisfied 상태에서 터치 무시
 */

import { jellyStore } from '@/stores/jellyStore';

describe('SPEC-TOUCH-001: 젤리 터치 반응', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // 스토어 초기화
    jellyStore.setState({
      currentState: 'idle',
      faceExpression: { eyes: '• •', mouth: 'o' },
      touchCooldownAt: 0,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('AC-1: idle → happy 전이', () => {
    it('idle 상태에서 happy로 전이할 수 있어야 한다', () => {
      const { transitionState } = jellyStore.getState();
      const success = transitionState('happy');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('happy');
    });

    it('happy 전이 시 표정이 happy 표정으로 변경되어야 한다', () => {
      const { transitionState } = jellyStore.getState();
      transitionState('happy');

      const face = jellyStore.getState().faceExpression;
      expect(face.eyes).toBe('^ ^');
      expect(face.mouth).toBe('U');
    });
  });

  describe('AC-2: happy 표정 2초 유지 후 idle 복귀', () => {
    it('triggerHappy가 2초 후 idle로 자동 복귀해야 한다', () => {
      const { triggerHappy } = jellyStore.getState();
      triggerHappy();

      expect(jellyStore.getState().currentState).toBe('happy');

      // 1.9초 후에는 여전히 happy
      jest.advanceTimersByTime(1900);
      expect(jellyStore.getState().currentState).toBe('happy');

      // 2.1초 후에는 idle로 복귀
      jest.advanceTimersByTime(200);
      expect(jellyStore.getState().currentState).toBe('idle');
    });
  });

  describe('AC-5: 1초 쿨다운', () => {
    it('쿨다운이 없으면 canTouch가 true를 반환해야 한다', () => {
      jellyStore.setState({ touchCooldownAt: 0 });
      const { canTouch } = jellyStore.getState();
      expect(canTouch()).toBe(true);
    });

    it('쿨다운 직후에는 canTouch가 false를 반환해야 한다', () => {
      const { triggerHappy } = jellyStore.getState();
      triggerHappy();

      // triggerHappy 후 바로 canTouch 확인
      const { canTouch } = jellyStore.getState();
      expect(canTouch()).toBe(false);
    });

    it('1초 후에는 canTouch가 다시 true를 반환해야 한다', () => {
      const { triggerHappy } = jellyStore.getState();
      triggerHappy();

      jest.advanceTimersByTime(1000);

      const { canTouch } = jellyStore.getState();
      expect(canTouch()).toBe(true);
    });
  });

  describe('AC-6: eating/satisfied 상태에서 터치 무시', () => {
    it('eating 상태에서는 happy로 전이할 수 없어야 한다', () => {
      jellyStore.setState({ currentState: 'eating' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('happy');

      expect(success).toBe(false);
      expect(jellyStore.getState().currentState).toBe('eating');
    });

    it('satisfied 상태에서는 happy로 전이할 수 없어야 한다', () => {
      jellyStore.setState({ currentState: 'satisfied' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('happy');

      expect(success).toBe(false);
      expect(jellyStore.getState().currentState).toBe('satisfied');
    });

    it('anticipation 상태에서는 happy로 전이할 수 없어야 한다', () => {
      jellyStore.setState({ currentState: 'anticipation' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('happy');

      expect(success).toBe(false);
      expect(jellyStore.getState().currentState).toBe('anticipation');
    });
  });

  describe('AC-7: 기존 플로우에 영향 없음', () => {
    it('idle → anticipation 전이가 여전히 동작해야 한다', () => {
      const { transitionState } = jellyStore.getState();
      const success = transitionState('anticipation');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('anticipation');
    });

    it('happy 상태에서는 anticipation으로 전이할 수 없어야 한다', () => {
      jellyStore.setState({ currentState: 'happy' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('anticipation');

      expect(success).toBe(false);
    });

    it('happy → idle 전이가 가능해야 한다', () => {
      jellyStore.setState({ currentState: 'happy' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('idle');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('idle');
    });
  });
});
