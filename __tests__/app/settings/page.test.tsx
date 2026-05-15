/**
 * SettingsPage 컴포넌트 테스트
 * 설정 페이지 - 프로필, 젤리 모양, 정보
 * SPEC-SYNC-001 M7: 데이터 초기화 → resetUserData RPC 연동 (REQ-SYNC-007)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

// next/link 모킹
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// BottomNav 모킹
jest.mock('@/components/layout/BottomNav', () => {
  const MockBottomNav = () => <nav data-testid="bottom-nav">BottomNav</nav>;
  return { __esModule: true, default: MockBottomNav };
});

const mockResetUserData = jest.fn().mockResolvedValue(undefined);
const mockGetMyProfile = jest.fn().mockResolvedValue(null);
const mockSetNickname = jest.fn().mockResolvedValue(undefined);

// Supabase db 모킹
jest.mock('@/lib/supabase/db', () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
  setNickname: (...args: unknown[]) => mockSetNickname(...args),
  resetUserData: (...args: unknown[]) => mockResetUserData(...args),
}));

// Supabase client 모킹
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ data: null, error: null }),
        or: jest.fn().mockReturnValue({ data: null, error: null }),
      }),
    }),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// diaryStore 모킹 - jest mock factory 내에서 생성
jest.mock('@/stores/diaryStore', () => {
  const state = {
    supabaseUserId: 'test-user-id' as string | null,
    entries: [],
    isLoading: false,
    setUserId: jest.fn().mockResolvedValue(undefined),
  };
  const store = Object.assign(
    (selector: (s: typeof state) => unknown) => selector(state),
    { getState: () => state, setState: (u: unknown) => Object.assign(state, u) },
  );
  return { diaryStore: store };
});

// rewardStore 모킹
jest.mock('@/stores/rewardStore', () => {
  const state = {
    activeSkin: null,
    skinEnabled: false,
    toggleSkinEnabled: jest.fn(),
    reset: jest.fn(),
  };
  const store = Object.assign(
    (selector: (s: typeof state) => unknown) => selector(state),
    { getState: () => state, setState: (u: unknown) => Object.assign(state, u) },
  );
  return { rewardStore: store };
});

// jellyStore 모킹
jest.mock('@/stores/jellyStore', () => {
  const state = {
    jellyName: '',
    jellyShape: 'ppung' as const,
    persistEmotion: false,
    setJellyShape: jest.fn(),
    setPersistEmotion: jest.fn(),
  };
  const store = Object.assign(
    (selector: (s: typeof state) => unknown) => selector(state),
    { getState: () => state, setState: (u: unknown) => Object.assign(state, u) },
  );
  return { jellyStore: store };
});

// localStorage 모킹
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => localStorageStore[key] ?? null),
  setItem: jest.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: jest.fn((key: string) => { delete localStorageStore[key]; }),
  clear: jest.fn(() => {
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
  }),
  get length() { return Object.keys(localStorageStore).length; },
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// window.location 모킹
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { href: '', reload: mockReload },
  writable: true,
});

// process.env 모킹
process.env.NEXT_PUBLIC_APP_VERSION = '1.2.4';

import SettingsPage from '@/app/settings/page';
import { diaryStore } from '@/stores/diaryStore';

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    diaryStore.setState({ supabaseUserId: 'test-user-id' });
  });

  it('프로필 섹션을 렌더링한다', () => {
    render(<SettingsPage />);
    expect(screen.getByText('프로필')).toBeInTheDocument();
  });

  it('젤리 모양 섹션을 렌더링한다', () => {
    render(<SettingsPage />);
    expect(screen.getByText('젤리 모양')).toBeInTheDocument();
  });

  it('정보 섹션을 렌더링한다', () => {
    render(<SettingsPage />);
    expect(screen.getByText('정보')).toBeInTheDocument();
  });

  it('데이터 초기화를 렌더링한다', () => {
    render(<SettingsPage />);
    expect(screen.getByText('데이터 초기화')).toBeInTheDocument();
  });

  it('젤리 모양 설명 문구를 렌더링한다', () => {
    render(<SettingsPage />);
    expect(
      screen.getByText(/젤리의 기본 모양을 선택해보세요/),
    ).toBeInTheDocument();
  });
});

describe('SettingsPage - 데이터 초기화 (REQ-SYNC-007)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    diaryStore.setState({ supabaseUserId: 'test-user-id' });
    mockResetUserData.mockResolvedValue(undefined);
  });

  it('초기화 버튼 클릭 시 확인 다이얼로그를 표시한다', () => {
    render(<SettingsPage />);

    const resetButton = screen.getByText('데이터 초기화');
    fireEvent.click(resetButton);

    expect(screen.getByText(/다음 데이터가 서버에서 영구 삭제됩니다/)).toBeInTheDocument();
  });

  it('확인 다이얼로그에서 취소를 누르면 다이얼로그가 닫힌다', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByText('데이터 초기화'));
    fireEvent.click(screen.getByText('취소'));

    expect(screen.queryByText(/다음 데이터가 서버에서 영구 삭제됩니다/)).not.toBeInTheDocument();
  });

  it('초기화 실행 시 resetUserData RPC를 호출한다', async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByText('데이터 초기화'));
    fireEvent.click(screen.getByText('초기화'));

    await waitFor(() => {
      expect(mockResetUserData).toHaveBeenCalledWith('test-user-id');
    });
  });

  it('resetUserData 성공 시 localStorage를 클리어한다', async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByText('데이터 초기화'));
    fireEvent.click(screen.getByText('초기화'));

    await waitFor(() => {
      expect(mockResetUserData).toHaveBeenCalledWith('test-user-id');
    });

    // localStorage 키들이 삭제되었는지 확인
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('jelly-storage');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('reward-storage');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('ad_frequency_history');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('rewarded_ad_frequency');
  });

  it('resetUserData 실패 시 localStorage를 초기화하지 않는다', async () => {
    mockResetUserData.mockRejectedValue(new Error('RPC 실패'));

    // alert 모킹
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SettingsPage />);

    fireEvent.click(screen.getByText('데이터 초기화'));
    fireEvent.click(screen.getByText('초기화'));

    await waitFor(() => {
      expect(mockResetUserData).toHaveBeenCalled();
    });

    // 실패 시 localStorage는 건드리지 않음 (복구 상태 보존)
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it('userId가 없으면 resetUserData를 호출하지 않는다', async () => {
    diaryStore.setState({ supabaseUserId: null });

    render(<SettingsPage />);

    fireEvent.click(screen.getByText('데이터 초기화'));
    fireEvent.click(screen.getByText('초기화'));

    await waitFor(() => {
      expect(mockResetUserData).not.toHaveBeenCalled();
    });
  });
});
