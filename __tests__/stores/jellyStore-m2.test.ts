/**
 * jellyStore M2 확장 테스트
 * M2-T1: emotionColor 상태 및 setEmotionColor 액션
 * M2-T1: addEmotionResult 호출 시 emotionColor 자동 업데이트
 */
import { jellyStore } from '@/stores/jellyStore';
import type { AnalysisResponse } from '@/types/emotion';
import { EMOTION_COLORS, JELLY_COLOR } from '@/lib/constants/emotion';

describe('jellyStore M2 확장 - emotionColor', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    jellyStore.setState({
      emotionColor: JELLY_COLOR,
      emotionHistory: [],
      lastEmotion: 'joy',
      isAnalyzing: false,
      analysisError: null,
    });
  });

  describe('emotionColor 초기 상태', () => {
    it('초기값은 JELLY_COLOR(#FFD1DC)이어야 한다', () => {
      expect(jellyStore.getState().emotionColor).toBe('#FFD1DC');
    });
  });

  describe('setEmotionColor 액션', () => {
    it('색상을 직접 설정할 수 있다', () => {
      jellyStore.getState().setEmotionColor('#FF6B6B');
      expect(jellyStore.getState().emotionColor).toBe('#FF6B6B');
    });

    it('모든 감정 색상을 설정할 수 있다', () => {
      const emotionEntries = Object.entries(EMOTION_COLORS);

      emotionEntries.forEach(([, color]) => {
        jellyStore.getState().setEmotionColor(color);
        expect(jellyStore.getState().emotionColor).toBe(color);
      });
    });
  });

  describe('addEmotionResult 시 emotionHistory 업데이트', () => {
    // emotionColor는 구슬 섭취 완료 후 page.tsx에서 setEmotionColor로 적용
    it('분석 결과가 emotionHistory에 추가된다', () => {
      const result: AnalysisResponse = {
        emotion: 'joy',
        confidence: 0.95,
        emotionKo: '기쁨',
      };

      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionHistory).toHaveLength(1);
      expect(jellyStore.getState().emotionHistory[0].emotion).toBe('joy');
    });

    it('연속된 분석 결과가 모두 history에 누적된다', () => {
      const results: AnalysisResponse[] = [
        { emotion: 'joy', confidence: 0.9, emotionKo: '기쁨' },
        { emotion: 'sadness', confidence: 0.8, emotionKo: '슬픔' },
        { emotion: 'anger', confidence: 0.7, emotionKo: '분노' },
      ];

      results.forEach((r) => jellyStore.getState().addEmotionResult(r));

      expect(jellyStore.getState().emotionHistory).toHaveLength(3);
      expect(jellyStore.getState().emotionHistory[2].emotion).toBe('anger');
    });

    it('addEmotionResult는 emotionColor를 변경하지 않는다', () => {
      const result: AnalysisResponse = {
        emotion: 'joy',
        confidence: 0.95,
        emotionKo: '기쁨',
      };

      const beforeColor = jellyStore.getState().emotionColor;
      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionColor).toBe(beforeColor);
    });
  });
});
