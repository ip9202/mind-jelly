/**
 * @MX:NOTE: [AUTO] SPEC-SESSION-RECOVER-001 M3 — setUserIdentity / linkTossUser 멱등성
 * @MX:SPEC: SPEC-SESSION-RECOVER-001 REQ-SESSION-013, REQ-SESSION-030
 */

const mockLinkTossUser = jest.fn();
const mockGetMyProfile = jest.fn();

jest.mock('@/lib/supabase/auth', () => ({
  linkTossUser: (...args: unknown[]) => mockLinkTossUser(...args),
}));

jest.mock('@/lib/supabase/db', () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
}));

// supabase client 의 update 체인 mock — linkTossUser 23505 시나리오용
const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });
const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { tossStore } from '@/stores/tossStore';
import { diaryStore } from '@/stores/diaryStore';

describe('tossStore.setUserIdentity 멱등성 (SPEC-SESSION-RECOVER-001 M3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tossStore.getState().reset();
    diaryStore.setState({ supabaseUserId: 'user-1' } as never);
  });

  it('이미 동일 hash 가 연결된 사용자에게는 linkTossUser를 호출하지 않는다', async () => {
    mockGetMyProfile.mockResolvedValue({ id: 'user-1', toss_user_id: 'hash-same' });

    tossStore.getState().setUserIdentity({ anonymousKey: 'hash-same', deviceId: 'd1' });
    // setUserIdentity 내부 비동기 처리 대기
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(mockLinkTossUser).not.toHaveBeenCalled();
  });

  it('다른 hash 가 연결되어 있으면 linkTossUser를 호출한다', async () => {
    mockGetMyProfile.mockResolvedValue({ id: 'user-1', toss_user_id: 'hash-old' });
    mockLinkTossUser.mockResolvedValue(undefined);

    tossStore.getState().setUserIdentity({ anonymousKey: 'hash-new', deviceId: 'd1' });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(mockLinkTossUser).toHaveBeenCalledWith('user-1', 'hash-new');
  });

  it('toss_user_id가 null이면 linkTossUser를 호출한다', async () => {
    mockGetMyProfile.mockResolvedValue({ id: 'user-1', toss_user_id: null });
    mockLinkTossUser.mockResolvedValue(undefined);

    tossStore.getState().setUserIdentity({ anonymousKey: 'hash-fresh', deviceId: 'd1' });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(mockLinkTossUser).toHaveBeenCalledWith('user-1', 'hash-fresh');
  });
});

describe('linkTossUser 23505 처리 (REQ-SESSION-030)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PostgreSQL 23505 unique_violation 에러 시 throw 하지 않고 종료한다', async () => {
    mockUpdateEq.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value' },
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { linkTossUser } = jest.requireActual('@/lib/supabase/auth') as typeof import('@/lib/supabase/auth');

    await expect(linkTossUser('user-1', 'hash-dup')).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('다른 에러는 console.error로 로깅되지만 throw 하지 않는다', async () => {
    mockUpdateEq.mockResolvedValue({
      error: { code: '42P01', message: 'undefined_table' },
    });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { linkTossUser } = jest.requireActual('@/lib/supabase/auth') as typeof import('@/lib/supabase/auth');

    await expect(linkTossUser('user-1', 'hash-x')).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
