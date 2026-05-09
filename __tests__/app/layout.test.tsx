/**
 * RootLayout 컴포넌트 테스트
 * 루트 레이아웃 - 폰트 로딩, 메타데이터, 초기화 컴포넌트
 */
import { render, screen } from '@testing-library/react';

// next/font/google 모킹 - 실제 폰트 로딩 방지
jest.mock('next/font/google', () => ({
  Dongle: () => ({ variable: '--font-dongle', className: 'font-dongle' }),
  Gowun_Dodum: () => ({ variable: '--font-gowun', className: 'font-gowun' }),
  Gamja_Flower: () => ({ variable: '--font-gamja', className: 'font-gamja' }),
  Plus_Jakarta_Sans: () => ({ variable: '--font-jakarta', className: 'font-jakarta' }),
}));

// 초기화 컴포넌트 모킹
jest.mock('@/components/bridge/BridgeInitializer', () => {
  const MockBridge = () => <div data-testid="bridge-initializer" />;
  return { __esModule: true, default: MockBridge };
});

jest.mock('@/components/ui/ThemeInitializer', () => {
  const MockTheme = () => <div data-testid="theme-initializer" />;
  return { ThemeInitializer: MockTheme };
});

// globals.css 모킹
jest.mock('../../src/app/globals.css', () => ({}));

import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('children을 렌더링한다', () => {
    render(
      <RootLayout>
        <div data-testid="child">Test Child</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('BridgeInitializer를 렌더링한다', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('bridge-initializer')).toBeInTheDocument();
  });

  it('ThemeInitializer를 렌더링한다', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('theme-initializer')).toBeInTheDocument();
  });

  it('html 엘리먼트에 ko lang 속성이 있다', () => {
    const { container } = render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>,
    );

    const html = container.closest('html');
    expect(html?.getAttribute('lang')).toBe('ko');
  });

  it('body에 flex 레이아웃이 적용된다', () => {
    const { container } = render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>,
    );

    const body = container.closest('body');
    expect(body?.className).toContain('flex');
  });
});
