import { jellyStore } from '@/stores/jellyStore';
import { JELLY_COLOR } from '@/lib/constants/emotion';

// @MX:NOTE: hasTodayDiary 모킹 (Supabase 직접 호출 방지)
jest.mock('@/lib/supabase/db', () => ({
  hasTodayDiary: jest.fn(),
}));

import { hasTodayDiary } from '@/lib/supabase/db';

const mockedHasTodayDiary = hasTodayDiary as jest.Mock;

describe('jellyStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    jest.clearAllMocks();
    mockedHasTodayDiary.mockResolvedValue(false);
    jellyStore.setState({
      currentState: 'idle',
      jellyPosition: { x: 0, y: 0 },
      faceExpression: { eyes: '• •', mouth: 'o' },
      animationParams: {
        scale: 1,
        translateY: 0,
        wobble: 0,
      },
      lastEmotion: 'joy',
      emotionColor: JELLY_COLOR,
      emotionHistory: [],
      lastAccessDate: '',
      jellyName: '',
      jellyShape: 'ppung',
      touchCooldownAt: 0,
      persistEmotion: false,
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

  describe('SPEC-JELLY-003: 일일 상태 초기화', () => {
    describe('REQ-INIT-001: lastAccessDate 저장', () => {
      it('lastAccessDate 필드가 존재해야 한다', () => {
        expect(jellyStore.getState()).toHaveProperty('lastAccessDate');
      });

      it('lastAccessDate 기본값은 빈 문자열이어야 한다', () => {
        expect(jellyStore.getState().lastAccessDate).toBe('');
      });
    });

    describe('REQ-INIT-002: 날짜 변경 시 다이어리 없으면 상태 초기화', () => {
      it('다이어리가 없으면 감정 상태가 기본값으로 초기화되어야 한다', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        jellyStore.setState({
          lastAccessDate: yesterdayStr,
          lastEmotion: 'sadness',
          emotionColor: '#0000FF',
          currentState: 'eating',
          emotionHistory: [
            { emotion: 'sadness', confidence: 0.9, emotionKo: '슬픔' },
          ],
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        expect(jellyStore.getState().lastEmotion).toBe('joy');
        expect(jellyStore.getState().emotionColor).toBe(JELLY_COLOR);
        expect(jellyStore.getState().currentState).toBe('idle');
        expect(jellyStore.getState().emotionHistory).toEqual([]);
        expect(jellyStore.getState().lastAccessDate).toBe(new Date().toISOString().split('T')[0]);
      });
    });

    describe('REQ-INIT-003: 같은 날이라도 다이어리가 없으면 초기화', () => {
      it('같은 날짜라도 다이어리가 없으면 감정 상태가 기본값으로 초기화되어야 한다', async () => {
        // 다이어리 없음으로 모킹
        mockedHasTodayDiary.mockResolvedValue(false);

        const today = new Date().toISOString().split('T')[0];

        jellyStore.setState({
          lastAccessDate: today,
          lastEmotion: 'anger',
          emotionColor: '#FF0000',
          currentState: 'satisfied',
          emotionHistory: [
            { emotion: 'anger', confidence: 0.8, emotionKo: '분노' },
          ],
        });

        // 같은 날이라도 다이어리가 없으면 초기화됨
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        // 기본값으로 초기화되어야 함
        expect(jellyStore.getState().lastEmotion).toBe('joy');
        expect(jellyStore.getState().currentState).toBe('idle');
        expect(jellyStore.getState().emotionHistory).toHaveLength(0);
        expect(mockedHasTodayDiary).toHaveBeenCalled();
      });
    });

    describe('REQ-INIT-005: 다이어리가 있으면 감정 데이터 보존 (currentState는 idle 리셋)', () => {
      it('오늘 다이어리가 있으면 감정/색상은 보존되고 currentState는 idle로 리셋되어야 한다', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        jellyStore.setState({
          lastAccessDate: yesterdayStr,
          lastEmotion: 'sadness',
          emotionColor: '#0000FF',
          currentState: 'eating',
          emotionHistory: [
            { emotion: 'sadness', confidence: 0.9, emotionKo: '슬픔' },
          ],
        });

        mockedHasTodayDiary.mockResolvedValue(true);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        // 감정 데이터는 보존
        expect(jellyStore.getState().lastEmotion).toBe('sadness');
        expect(jellyStore.getState().emotionColor).toBe('#0000FF');
        // currentState는 항상 idle로 리셋 (일시적 애니메이션 상태는 persist하지 않음)
        expect(jellyStore.getState().currentState).toBe('idle');
        // 날짜 업데이트
        expect(jellyStore.getState().lastAccessDate).toBe(new Date().toISOString().split('T')[0]);
      });
    });

    describe('REQ-INIT-006: 사용자 설정 보존', () => {
      it('초기화 시 jellyShape은 보존되어야 한다', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        jellyStore.setState({
          lastAccessDate: yesterdayStr,
          jellyShape: 'mallang',
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        expect(jellyStore.getState().jellyShape).toBe('mallang');
      });

      it('초기화 시 jellyName은 보존되어야 한다', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        jellyStore.setState({
          lastAccessDate: yesterdayStr,
          jellyName: '내젤리',
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        expect(jellyStore.getState().jellyName).toBe('내젤리');
      });

      it('초기화 시 touchCooldownAt은 보존되어야 한다', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        jellyStore.setState({
          lastAccessDate: yesterdayStr,
          touchCooldownAt: 1234567890,
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        expect(jellyStore.getState().touchCooldownAt).toBe(1234567890);
      });
    });

    describe('Supabase 오류 처리', () => {
      it('Supabase 조회 실패 시 기존 상태를 유지하고 날짜만 업데이트해야 한다', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        jellyStore.setState({
          lastAccessDate: yesterdayStr,
          lastEmotion: 'sadness',
          emotionColor: '#0000FF',
          currentState: 'eating',
        });

        mockedHasTodayDiary.mockRejectedValue(new Error('Network error'));
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        // 상태는 유지
        expect(jellyStore.getState().lastEmotion).toBe('sadness');
        expect(jellyStore.getState().emotionColor).toBe('#0000FF');
        expect(jellyStore.getState().currentState).toBe('eating');
        // 날짜만 업데이트
        expect(jellyStore.getState().lastAccessDate).toBe(new Date().toISOString().split('T')[0]);
      });
    });

    describe('beadCount 제거', () => {
      it('beadCount 필드가 store에 존재하지 않아야 한다', () => {
        const state = jellyStore.getState();
        expect((state as unknown as Record<string, unknown>)['beadCount']).toBeUndefined();
      });

      it('setBeadCount 함수가 store에 존재하지 않아야 한다', () => {
        const state = jellyStore.getState();
        expect((state as unknown as Record<string, unknown>)['setBeadCount']).toBeUndefined();
      });

      it('incrementBeadCount 함수가 store에 존재하지 않아야 한다', () => {
        const state = jellyStore.getState();
        expect((state as unknown as Record<string, unknown>)['incrementBeadCount']).toBeUndefined();
      });

      it('decrementBeadCount 함수가 store에 존재하지 않아야 한다', () => {
        const state = jellyStore.getState();
        expect((state as unknown as Record<string, unknown>)['decrementBeadCount']).toBeUndefined();
      });
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

  // @MX:TODO: [AUTO] SPEC-SETTINGS-001: 감정 상태 지속성 설정 테스트
  // @MX:SPEC: SPEC-SETTINGS-001
  describe('SPEC-SETTINGS-001: 감정 상태 지속성 설정', () => {
    describe('REQ-PERSIST-001: persistEmotion 필드', () => {
      it('persistEmotion 필드가 존재해야 한다', () => {
        expect(jellyStore.getState()).toHaveProperty('persistEmotion');
      });

      it('persistEmotion 기본값은 false이어야 한다', () => {
        expect(jellyStore.getState().persistEmotion).toBe(false);
      });
    });

    describe('REQ-PERSIST-002: setPersistEmotion 액션', () => {
      it('setPersistEmotion으로 persistEmotion을 true로 변경할 수 있어야 한다', () => {
        const { setPersistEmotion } = jellyStore.getState();
        setPersistEmotion(true);

        expect(jellyStore.getState().persistEmotion).toBe(true);
      });

      it('setPersistEmotion으로 persistEmotion을 false로 변경할 수 있어야 한다', () => {
        jellyStore.setState({ persistEmotion: true });

        const { setPersistEmotion } = jellyStore.getState();
        setPersistEmotion(false);

        expect(jellyStore.getState().persistEmotion).toBe(false);
      });

      it('빠른 토글 전환 후 최종 상태가 반영되어야 한다 (EC-001)', () => {
        const { setPersistEmotion } = jellyStore.getState();
        setPersistEmotion(true);
        setPersistEmotion(false);
        setPersistEmotion(true);
        setPersistEmotion(false);

        expect(jellyStore.getState().persistEmotion).toBe(false);
      });
    });

    describe('REQ-PERSIST-002: persistEmotion=false일 때 다이어리 없으면 감정 초기화 (AC-002)', () => {
      it('persistEmotion=false이고 다이어리 없으면 감정이 기본값으로 초기화되어야 한다', async () => {
        jellyStore.setState({
          persistEmotion: false,
          lastEmotion: 'sadness',
          emotionColor: '#6B9BD2',
          currentState: 'eating',
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        expect(jellyStore.getState().lastEmotion).toBe('joy');
        expect(jellyStore.getState().emotionColor).toBe(JELLY_COLOR);
        expect(jellyStore.getState().currentState).toBe('idle');
      });
    });

    describe('REQ-PERSIST-002: persistEmotion=true일 때 감정 보존 (AC-003)', () => {
      it('persistEmotion=true이고 다이어리 없어도 감정이 보존되어야 한다', async () => {
        jellyStore.setState({
          persistEmotion: true,
          lastEmotion: 'sadness',
          emotionColor: '#6B9BD2',
          currentState: 'eating',
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        // 감정은 보존
        expect(jellyStore.getState().lastEmotion).toBe('sadness');
        expect(jellyStore.getState().emotionColor).toBe('#6B9BD2');
        // currentState는 항상 idle로 리셋
        expect(jellyStore.getState().currentState).toBe('idle');
      });

      it('persistEmotion=true이고 다이어리가 있어도 정상 동작해야 한다 (AC-004)', async () => {
        jellyStore.setState({
          persistEmotion: true,
          lastEmotion: 'anger',
          emotionColor: '#F28B82',
          currentState: 'satisfied',
        });

        mockedHasTodayDiary.mockResolvedValue(true);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        // 감정 보존
        expect(jellyStore.getState().lastEmotion).toBe('anger');
        expect(jellyStore.getState().emotionColor).toBe('#F28B82');
        // currentState는 idle
        expect(jellyStore.getState().currentState).toBe('idle');
      });

      it('persistEmotion=true이고 다이어리 없으면 emotionHistory도 보존되어야 한다', async () => {
        const history = [
          { emotion: 'sadness' as const, confidence: 0.9, emotionKo: '슬픔' },
        ];
        jellyStore.setState({
          persistEmotion: true,
          lastEmotion: 'sadness',
          emotionColor: '#6B9BD2',
          currentState: 'eating',
          emotionHistory: history,
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        // persistEmotion=true면 emotionHistory도 보존
        expect(jellyStore.getState().emotionHistory).toEqual(history);
      });
    });

    describe('EC-002: Supabase 오류 시 persistEmotion=true면 감정 보존', () => {
      it('persistEmotion=true일 때 Supabase 오류가 발생해도 감정 상태가 보존되어야 한다', async () => {
        jellyStore.setState({
          persistEmotion: true,
          lastEmotion: 'fear',
          emotionColor: '#B39DDB',
          currentState: 'eating',
        });

        mockedHasTodayDiary.mockRejectedValue(new Error('Network error'));
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        // 기존 fallback: 상태 유지, 날짜만 업데이트
        expect(jellyStore.getState().lastEmotion).toBe('fear');
        expect(jellyStore.getState().emotionColor).toBe('#B39DDB');
        expect(jellyStore.getState().currentState).toBe('eating');
        expect(jellyStore.getState().lastAccessDate).toBe(
          new Date().toISOString().split('T')[0],
        );
      });
    });

    describe('REQ-PERSIST-007: persistEmotion=true일 때 transient 필드는 리셋', () => {
      it('currentState와 faceExpression은 persistEmotion=true여도 항상 리셋되어야 한다', async () => {
        jellyStore.setState({
          persistEmotion: true,
          lastEmotion: 'sadness',
          emotionColor: '#6B9BD2',
          currentState: 'eating',
          faceExpression: { eyes: 'u u', mouth: 'o' },
        });

        mockedHasTodayDiary.mockResolvedValue(false);
        await jellyStore.getState().checkDiaryAndReset('test-user-id');

        expect(jellyStore.getState().currentState).toBe('idle');
        expect(jellyStore.getState().faceExpression).toEqual({
          eyes: '• •',
          mouth: 'o',
        });
      });
    });
  });
});
