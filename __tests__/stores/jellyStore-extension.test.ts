/**
 * jellyStore 확장 테스트
 * M1-T5: isAnalyzing, analysisError, lastEmotion 타입, emotionHistory
 */
import { jellyStore } from '@/stores/jellyStore';
import type { AnalysisResponse, EmotionType } from '@/types/emotion';

describe('jellyStore M1 확장', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    const store = jellyStore.getState();
    store.setAnalyzing(false);
    store.setAnalysisError(null);
    store.setLastEmotion('joy');
    // emotionHistory 초기화
    jellyStore.setState({ emotionHistory: [] });
  });

  describe('isAnalyzing 상태', () => {
    it('초기값은 false이다', () => {
      expect(jellyStore.getState().isAnalyzing).toBe(false);
    });

    it('setAnalyzing(true)로 분석 중 상태를 설정한다', () => {
      jellyStore.getState().setAnalyzing(true);
      expect(jellyStore.getState().isAnalyzing).toBe(true);
    });

    it('setAnalyzing(false)로 분석 중 상태를 해제한다', () => {
      jellyStore.getState().setAnalyzing(true);
      jellyStore.getState().setAnalyzing(false);
      expect(jellyStore.getState().isAnalyzing).toBe(false);
    });
  });

  describe('analysisError 상태', () => {
    it('초기값은 null이다', () => {
      expect(jellyStore.getState().analysisError).toBeNull();
    });

    it('setAnalysisError로 에러 메시지를 설정한다', () => {
      jellyStore.getState().setAnalysisError('네트워크 오류');
      expect(jellyStore.getState().analysisError).toBe('네트워크 오류');
    });

    it('setAnalysisError(null)로 에러를 초기화한다', () => {
      jellyStore.getState().setAnalysisError('에러');
      jellyStore.getState().setAnalysisError(null);
      expect(jellyStore.getState().analysisError).toBeNull();
    });
  });

  describe('lastEmotion 타입', () => {
    it('유효한 EmotionType 값을 설정할 수 있다', () => {
      const emotions: EmotionType[] = ['joy', 'sadness', 'anger', 'fear', 'disgust'];

      emotions.forEach((emotion) => {
        jellyStore.getState().setLastEmotion(emotion);
        expect(jellyStore.getState().lastEmotion).toBe(emotion);
      });
    });
  });

  describe('emotionHistory 상태', () => {
    it('초기값은 빈 배열이다', () => {
      expect(jellyStore.getState().emotionHistory).toEqual([]);
    });

    it('addEmotionResult로 분석 결과를 추가한다', () => {
      const result: AnalysisResponse = {
        emotion: 'joy',
        confidence: 0.95,
        emotionKo: '기쁨',
      };

      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionHistory).toHaveLength(1);
      expect(jellyStore.getState().emotionHistory[0]).toEqual(result);
    });

    it('여러 결과를 순서대로 추가한다', () => {
      const results: AnalysisResponse[] = [
        { emotion: 'joy', confidence: 0.9, emotionKo: '기쁨' },
        { emotion: 'sadness', confidence: 0.8, emotionKo: '슬픔' },
        { emotion: 'anger', confidence: 0.7, emotionKo: '분노' },
      ];

      results.forEach((r) => jellyStore.getState().addEmotionResult(r));

      const history = jellyStore.getState().emotionHistory;
      expect(history).toHaveLength(3);
      expect(history[0].emotion).toBe('joy');
      expect(history[1].emotion).toBe('sadness');
      expect(history[2].emotion).toBe('anger');
    });
  });

  describe('기존 기능 보존', () => {
    it('기존 상태 전이가 정상 동작한다', () => {
      const result = jellyStore.getState().transitionState('anticipation');
      expect(result).toBe(true);
      expect(jellyStore.getState().currentState).toBe('anticipation');
    });

    it('SPEC-JELLY-003: beadCount 제거 후에도 상태 전이가 정상 동작한다', () => {
      // beadCount 제거 확인: store에 beadCount 관련 함수가 없어야 함
      const state = jellyStore.getState() as unknown as Record<string, unknown>;
      expect(state['beadCount']).toBeUndefined();
      expect(state['setBeadCount']).toBeUndefined();
      expect(state['incrementBeadCount']).toBeUndefined();
      expect(state['decrementBeadCount']).toBeUndefined();
      // 상태 전이는 여전히 정상 동작
      expect(state.transitionState).toBeDefined();
    });
  });
});
