/**
 * EmotionInput 컴포넌트 테스트
 * M1-T6: textarea 기반 감정 입력 UI
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmotionInput } from '@/components/input/EmotionInput';
import { jellyStore } from '@/stores/jellyStore';

// analyzeEmotion 모킹
const mockAnalyzeEmotion = jest.fn();
jest.mock('@/lib/ai/analyzer', () => ({
  analyzeEmotion: (...args: unknown[]) => mockAnalyzeEmotion(...args),
}));

beforeEach(() => {
  mockAnalyzeEmotion.mockReset();
  // 스토어 초기화
  jellyStore.setState({
    isAnalyzing: false,
    analysisError: null,
    emotionHistory: [],
    lastEmotion: 'joy',
  });
});

describe('EmotionInput', () => {
  it('textarea를 렌더링한다', () => {
    render(<EmotionInput />);
    const textarea = screen.getByPlaceholderText(/감정을/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('글자 수 카운터를 표시한다', () => {
    render(<EmotionInput />);
    // 초기: 0/500
    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('텍스트 입력 시 글자 수가 업데이트된다', async () => {
    const user = userEvent.setup();
    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '안녕');

    expect(screen.getByText('2/500')).toBeInTheDocument();
  });

  it('500자를 초과하면 입력이 제한된다', async () => {
    const user = userEvent.setup();
    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    // 501자 입력 시도
    const longText = '가'.repeat(501);
    await user.type(textarea, longText);

    // 500자까지만 입력됨 (maxlength 속성)
    expect(textarea).toHaveValue('가'.repeat(500));
    expect(screen.getByText('500/500')).toBeInTheDocument();
  });

  it('450자 이상에서 글자 수 카운터 색상이 변경된다', async () => {
    const user = userEvent.setup();
    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '가'.repeat(450));

    const counter = screen.getByText('450/500');
    // 경고 색상 클래스가 적용되었는지 확인
    expect(counter.className).toMatch(/text-red|text-orange|warning/i);
  });

  it('빈 텍스트일 때 제출 버튼이 비활성화된다', () => {
    render(<EmotionInput />);

    const submitButton = screen.getByRole('button', { name: /분석/i });
    expect(submitButton).toBeDisabled();
  });

  it('텍스트가 있을 때 제출 버튼이 활성화된다', async () => {
    const user = userEvent.setup();
    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '기분이 좋아');

    const submitButton = screen.getByRole('button', { name: /분석/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('분석 중일 때 로딩 인디케이터를 표시한다', async () => {
    // 분석 중 상태로 설정
    jellyStore.setState({ isAnalyzing: true });
    render(<EmotionInput />);

    // 로딩 표시 확인 (스피너 또는 텍스트)
    const loadingElement = screen.getByTestId('loading-indicator');
    expect(loadingElement).toBeInTheDocument();
  });

  it('분석 중일 때 제출 버튼이 보이지 않는다 (로딩 인디케이터로 대체)', () => {
    jellyStore.setState({ isAnalyzing: true });
    render(<EmotionInput />);

    // 분석 중에는 버튼 대신 로딩 인디케이터 표시
    expect(screen.queryByRole('button', { name: /분석/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('제출 시 analyzeEmotion을 호출한다', async () => {
    const user = userEvent.setup();
    mockAnalyzeEmotion.mockResolvedValueOnce({
      emotion: 'joy',
      confidence: 0.95,
    });

    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '행복해!');
    await user.click(screen.getByRole('button', { name: /분석/i }));

    expect(mockAnalyzeEmotion).toHaveBeenCalledWith('행복해!');
  });

  it('분석 성공 시 결과를 표시한다', async () => {
    const user = userEvent.setup();
    mockAnalyzeEmotion.mockResolvedValueOnce({
      emotion: 'joy',
      confidence: 0.95,
    });

    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '행복해!');
    await user.click(screen.getByRole('button', { name: /분석/i }));

    // 결과 표시 대기
    await waitFor(() => {
      expect(screen.getByText('기쁨')).toBeInTheDocument();
    });
  });

  it('분석 성공 시 스토어에 결과를 추가한다', async () => {
    const user = userEvent.setup();
    mockAnalyzeEmotion.mockResolvedValueOnce({
      emotion: 'sadness',
      confidence: 0.85,
    });

    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '슬퍼');
    await user.click(screen.getByRole('button', { name: /분석/i }));

    await waitFor(() => {
      const state = jellyStore.getState();
      expect(state.emotionHistory).toHaveLength(1);
      expect(state.emotionHistory[0].emotion).toBe('sadness');
    });
  });

  it('분석 에러 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    mockAnalyzeEmotion.mockRejectedValueOnce(new Error('네트워크 오류'));

    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '테스트');
    await user.click(screen.getByRole('button', { name: /분석/i }));

    await waitFor(() => {
      expect(screen.getByText(/오류/i)).toBeInTheDocument();
    });
  });

  it('결과 표시 후 2초 뒤 자동 초기화된다', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockAnalyzeEmotion.mockResolvedValueOnce({
      emotion: 'joy',
      confidence: 0.95,
    });

    render(<EmotionInput />);

    const textarea = screen.getByPlaceholderText(/감정을/i);
    await user.type(textarea, '행복해!');
    await user.click(screen.getByRole('button', { name: /분석/i }));

    // 결과 표시 대기
    await waitFor(() => {
      expect(screen.getByText('기쁨')).toBeInTheDocument();
    });

    // 2초 후 자동 초기화
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.queryByText('기쁨')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
