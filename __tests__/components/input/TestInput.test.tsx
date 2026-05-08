// TestInput 컴포넌트 테스트
import { render, screen, fireEvent } from '@testing-library/react';
import { TestInput } from '@/components/input/TestInput';

// jellyStore 모킹
jest.mock('@/stores/jellyStore', () => ({
  jellyStore: {
    getState: jest.fn(() => ({
      beadCount: 5,
      setBeadCount: jest.fn(),
    })),
  },
}));

describe('TestInput', () => {
  it('버튼을 렌더링해야 함', () => {
    render(<TestInput />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('클릭 시 버튼이 동작해야 함', () => {
    render(<TestInput />);

    const button = screen.getByRole('button');
    expect(() => fireEvent.click(button)).not.toThrow();
  });
});
