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

  describe('addEmotionResult 시 emotionColor 자동 업데이트', () => {
    it('joy 분석 결과 추가 시 emotionColor가 joy 색상으로 변경된다', () => {
      const result: AnalysisResponse = {
        emotion: 'joy',
        confidence: 0.95,
        emotionKo: '기쁨',
      };

      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionColor).toBe(EMOTION_COLORS.joy);
      expect(jellyStore.getState().lastEmotion).toBe('joy');
    });

    it('sadness 분석 결과 추가 시 emotionColor가 sadness 색상으로 변경된다', () => {
      const result: AnalysisResponse = {
        emotion: 'sadness',
        confidence: 0.9,
        emotionKo: '슬픔',
      };

      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionColor).toBe(EMOTION_COLORS.sadness);
    });

    it('anger 분석 결과 추가 시 emotionColor가 anger 색상으로 변경된다', () => {
      const result: AnalysisResponse = {
        emotion: 'anger',
        confidence: 0.85,
        emotionKo: '분노',
      };

      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionColor).toBe(EMOTION_COLORS.anger);
    });

    it('fear 분석 결과 추가 시 emotionColor가 fear 색상으로 변경된다', () => {
      const result: AnalysisResponse = {
        emotion: 'fear',
        confidence: 0.8,
        emotionKo: '공포',
      };

      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionColor).toBe(EMOTION_COLORS.fear);
    });

    it('disgust 분석 결과 추가 시 emotionColor가 disgust 색상으로 변경된다', () => {
      const result: AnalysisResponse = {
        emotion: 'disgust',
        confidence: 0.75,
        emotionKo: '혐오',
      };

      jellyStore.getState().addEmotionResult(result);

      expect(jellyStore.getState().emotionColor).toBe(EMOTION_COLORS.disgust);
    });

    it('연속된 분석 결과에서 emotionColor가 마지막 감정 색상을 반영한다', () => {
      const results: AnalysisResponse[] = [
        { emotion: 'joy', confidence: 0.9, emotionKo: '기쁨' },
        { emotion: 'sadness', confidence: 0.8, emotionKo: '슬픔' },
        { emotion: 'anger', confidence: 0.7, emotionKo: '분노' },
      ];

      results.forEach((r) => jellyStore.getState().addEmotionResult(r));

      expect(jellyStore.getState().emotionColor).toBe(EMOTION_COLORS.anger);
      expect(jellyStore.getState().emotionHistory).toHaveLength(3);
    });
  });
});
