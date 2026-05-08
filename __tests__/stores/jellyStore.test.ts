import { jellyStore } from '@/stores/jellyStore';

describe('jellyStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    jellyStore.setState({
      currentState: 'idle',
      jellyPosition: { x: 0, y: 0 },
      faceExpression: { eyes: '• •', mouth: 'o' },
      animationParams: {
        scale: 1,
        translateY: 0,
        wobble: 0,
      },
      beadCount: 0,
    });
  });

  describe('initial state', () => {
    it('초기 상태가 idle이어야 한다', () => {
      const state = jellyStore.getState();
      expect(state.currentState).toBe('idle');
    });

    it('초기 표정이 기본값이어야 한다', () => {
      const state = jellyStore.getState();
      expect(state.faceExpression).toEqual({
        eyes: '• •',
        mouth: 'o',
      });
    });

    it('초기 애니메이션 파라미터가 기본값이어야 한다', () => {
      const state = jellyStore.getState();
      expect(state.animationParams).toEqual({
        scale: 1,
        translateY: 0,
        wobble: 0,
      });
    });
  });

  describe('state transitions', () => {
    it('idle -> anticipation 전이가 성공해야 한다', () => {
      const { transitionState } = jellyStore.getState();
      const success = transitionState('anticipation');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('anticipation');
    });

    it('anticipation -> eating 전이가 성공해야 한다', () => {
      jellyStore.setState({ currentState: 'anticipation' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('eating');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('eating');
    });

    it('eating -> anticipation 전이가 성공해야 한다', () => {
      jellyStore.setState({ currentState: 'eating' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('anticipation');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('anticipation');
    });

    it('eating -> satisfied 전이가 성공해야 한다', () => {
      jellyStore.setState({ currentState: 'eating' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('satisfied');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('satisfied');
    });

    it('satisfied -> idle 전이가 성공해야 한다', () => {
      jellyStore.setState({ currentState: 'satisfied' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('idle');

      expect(success).toBe(true);
      expect(jellyStore.getState().currentState).toBe('idle');
    });
  });

  describe('invalid transitions', () => {
    it('무효한 전이는 거부되어야 한다', () => {
      const { transitionState } = jellyStore.getState();

      // idle -> eating (직접 전이 불가)
      const success = transitionState('eating');

      expect(success).toBe(false);
      expect(jellyStore.getState().currentState).toBe('idle');
    });

    it('anticipation -> idle 전이는 거부되어야 한다', () => {
      jellyStore.setState({ currentState: 'anticipation' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('idle');

      expect(success).toBe(false);
      expect(jellyStore.getState().currentState).toBe('anticipation');
    });

    it('satisfied -> eating 전이는 거부되어야 한다', () => {
      jellyStore.setState({ currentState: 'satisfied' });

      const { transitionState } = jellyStore.getState();
      const success = transitionState('eating');

      expect(success).toBe(false);
      expect(jellyStore.getState().currentState).toBe('satisfied');
    });
  });

  describe('face expression updates', () => {
    it('setFaceExpression이 표정을 업데이트해야 한다', () => {
      const { setFaceExpression } = jellyStore.getState();

      setFaceExpression({ eyes: '^ ^', mouth: '-' });

      expect(jellyStore.getState().faceExpression).toEqual({
        eyes: '^ ^',
        mouth: '-',
      });
    });
  });

  describe('animation parameter updates', () => {
    it('setAnimationParams이 애니메이션 파라미터를 업데이트해야 한다', () => {
      const { setAnimationParams } = jellyStore.getState();

      setAnimationParams({ scale: 1.2, translateY: -10, wobble: 5 });

      expect(jellyStore.getState().animationParams).toEqual({
        scale: 1.2,
        translateY: -10,
        wobble: 5,
      });
    });

    it('부분 업데이트가 기존 값을 유지해야 한다', () => {
      const { setAnimationParams } = jellyStore.getState();

      setAnimationParams({ scale: 1.2 });

      const state = jellyStore.getState();
      expect(state.animationParams.scale).toBe(1.2);
      expect(state.animationParams.translateY).toBe(0);
      expect(state.animationParams.wobble).toBe(0);
    });
  });

  describe('jelly position updates', () => {
    it('setJellyPosition이 위치를 업데이트해야 한다', () => {
      const { setJellyPosition } = jellyStore.getState();

      setJellyPosition({ x: 100, y: 200 });

      expect(jellyStore.getState().jellyPosition).toEqual({
        x: 100,
        y: 200,
      });
    });
  });

  describe('bead count management', () => {
    it('setBeadCount가 구슬 개수를 업데이트해야 한다', () => {
      const { setBeadCount } = jellyStore.getState();

      setBeadCount(5);

      expect(jellyStore.getState().beadCount).toBe(5);
    });

    it('incrementBeadCount가 구슬 개수를 증가시켜야 한다', () => {
      const { incrementBeadCount } = jellyStore.getState();

      incrementBeadCount();
      expect(jellyStore.getState().beadCount).toBe(1);

      incrementBeadCount(3);
      expect(jellyStore.getState().beadCount).toBe(4);
    });

    it('decrementBeadCount가 구슬 개수를 감소시켜야 한다', () => {
      jellyStore.setState({ beadCount: 5 });

      const { decrementBeadCount } = jellyStore.getState();

      decrementBeadCount();
      expect(jellyStore.getState().beadCount).toBe(4);

      decrementBeadCount(2);
      expect(jellyStore.getState().beadCount).toBe(2);
    });

    it('구슬 개수가 음수가 되지 않아야 한다', () => {
      jellyStore.setState({ beadCount: 1 });

      const { decrementBeadCount } = jellyStore.getState();

      decrementBeadCount(5);

      expect(jellyStore.getState().beadCount).toBe(0);
    });
  });

  describe('state-specific behavior', () => {
    it('idle 상태에서 setFaceExpression을 호출하면 표정이 업데이트되어야 한다', () => {
      const { setFaceExpression } = jellyStore.getState();

      setFaceExpression({ eyes: '• •', mouth: 'o' });

      expect(jellyStore.getState().faceExpression).toEqual({
        eyes: '• •',
        mouth: 'o',
      });
    });

    it('상태 전이 후 표정이 상태에 맞게 변경되어야 한다', () => {
      const { transitionState } = jellyStore.getState();

      transitionState('anticipation');

      expect(jellyStore.getState().faceExpression).toMatchObject({
        eyes: expect.any(String),
        mouth: expect.any(String),
      });
    });
  });
});
