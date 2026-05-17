/**
 * SPEC-FRIEND-004 TASK-002: BottomNav 친구 탭 추가 테스트
 * TDD Phase: RED → GREEN → REFACTOR
 *
 * 친구 탭이 3번째 위치(history와 garden 사이)에 올바르게 렌더링되는지 검증
 */

import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// next/link 모킹 - 실제 라우팅 없이 href를 href 속성으로 노출
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe('TASK-002: BottomNav 친구 탭', () => {
  it('탭이 4개 렌더링되어야 함', async () => {
    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    // 모든 탭 링크 조회 (nav 내부의 Link 요소들)
    const nav = screen.getByRole('navigation', { name: '주요 메뉴' });
    const links = nav.querySelectorAll('a[aria-label]');
    expect(links).toHaveLength(4);
  });

  it('친구 탭이 "group" 아이콘을 가져야 함', async () => {
    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    // 친구 탭의 aria-label로 링크 찾기
    const friendsLink = screen.getByLabelText('친구');
    // Material Symbols 아이콘 텍스트 확인
    const icon = friendsLink.querySelector('.material-symbols-outlined');
    expect(icon).toHaveTextContent('group');
  });

  it('친구 탭 라벨이 "친구"여야 함', async () => {
    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    expect(screen.getByLabelText('친구')).toBeInTheDocument();
  });

  it('친구 탭 href가 "/friends"여야 함', async () => {
    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav />);

    const friendsLink = screen.getByLabelText('친구');
    expect(friendsLink).toHaveAttribute('href', '/friends');
  });

  it('activeTab="friends"일 때 활성 스타일이 적용되어야 함', async () => {
    const { default: BottomNav } = await import('../BottomNav');
    render(<BottomNav activeTab="friends" />);

    const friendsLink = screen.getByLabelText('친구');
    // 활성 탭은 aria-current="page" 속성을 가짐
    expect(friendsLink).toHaveAttribute('aria-current', 'page');
    // 활성 도트 인디케이터가 렌더링됨
    const dot = friendsLink.querySelector('.bg-accent.animate-pulse');
    expect(dot).toBeInTheDocument();
  });
});
