/**
 * 감정 분석기 테스트
 * M1-T3: analyzeEmotion 성공/에러/타임아웃
 */
import { analyzeEmotion } from '@/lib/ai/analyzer';

// fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('analyzeEmotion', () => {
  it('성공적으로 감정을 분석한다', async () => {
    const mockResponse = {
      emotion: 'joy',
      confidence: 0.95,
      emotionKo: '기쁨',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await analyzeEmotion('오늘 정말 행복해!');

    expect(result).toEqual({
      emotion: 'joy',
      confidence: 0.95,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/analyze',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: expect.any(AbortSignal),
        body: JSON.stringify({ text: '오늘 정말 행복해!' }),
      }),
    );
  });

  it('모든 감정 타입을 올바르게 반환한다', async () => {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'disgust'];
    const emotionKoMap: Record<string, string> = {
      joy: '기쁨',
      sadness: '슬픔',
      anger: '분노',
      fear: '공포',
      disgust: '혐오',
    };

    for (const emotion of emotions) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          emotion,
          confidence: 0.8,
          emotionKo: emotionKoMap[emotion],
        }),
      });

      const result = await analyzeEmotion(`테스트 텍스트 ${emotion}`);
      expect(result.emotion).toBe(emotion);
      expect(result.confidence).toBe(0.8);
    }
  });

  it('서버 에러 시 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(analyzeEmotion('테스트')).rejects.toThrow();
  });

  it('400 에러 시 적절한 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    await expect(analyzeEmotion('테스트')).rejects.toThrow();
  });

  it('네트워크 에러 시 에러를 던진다', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(analyzeEmotion('테스트')).rejects.toThrow();
  });

  it('10초 타임아웃이 설정된다', async () => {
    // AbortController 타임아웃 확인
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ emotion: 'joy', confidence: 0.9, emotionKo: '기쁨' }),
    });

    await analyzeEmotion('테스트');

    // fetch가 AbortSignal과 함께 호출되었는지 확인
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.signal).toBeInstanceOf(AbortSignal);
  });

  it('타임아웃 발생 시 에러를 던진다', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    mockFetch.mockRejectedValueOnce(abortError);

    await expect(analyzeEmotion('테스트')).rejects.toThrow();
  });

  it('유효하지 않은 응답 데이터 시 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ emotion: 'invalid_emotion', confidence: 0.5 }),
    });

    await expect(analyzeEmotion('테스트')).rejects.toThrow();
  });

  it('confidence 범위를 벗어난 응답 시 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ emotion: 'joy', confidence: 1.5, emotionKo: '기쁨' }),
    });

    await expect(analyzeEmotion('테스트')).rejects.toThrow();
  });
});
