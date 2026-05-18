/**
 * SPEC-FRIEND-004 TASK-003: NavMenu 친구 항목 활성화 테스트
 * TDD Phase: RED → GREEN → REFACTOR
 *
 * Friends 메뉴 항목이 주석 해제되어 올바르게 렌더링되는지 검증
 */

import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// next/link 모킹
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

describe('TASK-003: NavMenu 친구 항목 활성화', () => {
  // 메뉴를 열어야 항목이 렌더링됨
  async function openMenu() {
    const { default: NavMenu } = await import('../NavMenu');
    const result = render(<NavMenu />);
    const menuButton = screen.getByLabelText('메뉴 열기');
    fireEvent.click(menuButton);
    return result;
  }

  it('Friends 메뉴 항목이 렌더링되어야 함 (주석 해제)', async () => {
    await openMenu();

    // 메뉴 내에 Friends 텍스트가 포함된 항목이 있어야 함
    const menu = screen.getByRole('menu', { name: '내비게이션 메뉴' });
    expect(menu).toBeInTheDocument();

    // Friends 항목 찾기 (라벨 텍스트로)
    const friendsItem = screen.getByRole('menuitem', { name: /Friends/i });
    expect(friendsItem).toBeInTheDocument();
  });

  it('Friends 항목이 "group" 아이콘을 가져야 함', async () => {
    await openMenu();

    const friendsItem = screen.getByRole('menuitem', { name: /Friends/i });
    const icon = friendsItem.querySelector('.material-symbols-outlined');
    expect(icon).toHaveTextContent('group');
  });

  it('Friends 항목 라벨이 "Friends"여야 함', async () => {
    await openMenu();

    const friendsItem = screen.getByRole('menuitem', { name: /Friends/i });
    expect(friendsItem).toBeInTheDocument();
    // 라벨 텍스트에 "Friends" 포함 확인
    expect(friendsItem).toHaveTextContent('Friends');
  });

  it('Friends 항목 href가 "/friends"여야 함', async () => {
    await openMenu();

    const friendsItem = screen.getByRole('menuitem', { name: /Friends/i });
    expect(friendsItem).toHaveAttribute('href', '/friends');
  });

  it('activeTab="friends"일 때 활성 스타일이 적용되어야 함', async () => {
    const { default: NavMenu } = await import('../NavMenu');
    render(<NavMenu activeTab="friends" />);

    // 메뉴 열기
    const menuButton = screen.getByLabelText('메뉴 열기');
    fireEvent.click(menuButton);

    const friendsItem = screen.getByRole('menuitem', { name: /Friends/i });
    // 활성 항목은 aria-current="page" 속성을 가짐
    expect(friendsItem).toHaveAttribute('aria-current', 'page');
  });
});
