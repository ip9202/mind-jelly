/**
 * @MX:NOTE: [AUTO] SPEC-SESSION-RECOVER-001 M2 — initSupabaseSession({ tossHash }) 동작 검증
 * @MX:SPEC: SPEC-SESSION-RECOVER-001 REQ-SESSION-010..012, REQ-SESSION-020, REQ-SESSION-021
 */

// jest.setup.js 의 supabase mock 을 이 파일에서 재정의
const mockGetSession = jest.fn();
const mockSignInAnonymously = jest.fn();
const mockSetSession = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
      setSession: (...args: unknown[]) => mockSetSession(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { initSupabaseSession } from '@/lib/supabase/auth';

// fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// 환경변수
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

function makeTableMock(profile: { invite_code?: string | null } | null = { invite_code: 'CODE12' }) {
  const single = jest.fn().mockResolvedValue({ data: profile, error: null });
  const eqProfile = jest.fn().mockReturnValue({ single });
  const selectProfile = jest.fn().mockReturnValue({ eq: eqProfile });
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const updateEq = jest.fn().mockResolvedValue({ error: null });
  const update = jest.fn().mockReturnValue({ eq: updateEq });
  return {
    upsert,
    select: selectProfile,
    update,
  };
}

describe('initSupabaseSession with tossHash (SPEC-SESSION-RECOVER-001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockFrom.mockReturnValue(makeTableMock());
  });

  it('tossHash 미제공 시 기존 익명 인증 플로우를 그대로 따른다', async () => {
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: 'anon-1' } },
      error: null,
    });

    const userId = await initSupabaseSession();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
    expect(userId).toBe('anon-1');
  });

  it('tossHash 제공 + recover-session found:true → setSession 호출, signInAnonymously 미호출', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        found: true,
        access_token: 'access-x',
        refresh_token: 'refresh-x',
      }),
    });
    mockSetSession.mockResolvedValue({
      data: { user: { id: 'recovered-user' } },
      error: null,
    });

    const userId = await initSupabaseSession({ tossHash: 'hash-A' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/recover-session',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-anon-key',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ toss_hash: 'hash-A' }),
      }),
    );
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'access-x',
      refresh_token: 'refresh-x',
    });
    expect(mockSignInAnonymously).not.toHaveBeenCalled();
    expect(userId).toBe('recovered-user');
  });

  it('tossHash 제공 + recover-session found:false → signInAnonymously fallback', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ found: false }),
    });
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: 'new-anon' } },
      error: null,
    });

    const userId = await initSupabaseSession({ tossHash: 'hash-B' });

    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
    expect(userId).toBe('new-anon');
  });

  it('recover-session 네트워크 실패 시 signInAnonymously fallback', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: 'fallback-anon' } },
      error: null,
    });

    const userId = await initSupabaseSession({ tossHash: 'hash-C' });

    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
    expect(userId).toBe('fallback-anon');
  });

  it('found:true 이지만 setSession 실패 시 signInAnonymously fallback', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ found: true, access_token: 'tok', refresh_token: 'ref' }),
    });
    mockSetSession.mockResolvedValue({
      data: { user: null },
      error: { message: 'token expired' },
    });
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: 'new-after-setfail' } },
      error: null,
    });

    const userId = await initSupabaseSession({ tossHash: 'hash-D' });

    expect(mockSetSession).toHaveBeenCalledTimes(1);
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
    expect(userId).toBe('new-after-setfail');
  });

  it('found:true + setSession 성공이지만 user null 반환 시 signInAnonymously fallback', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ found: true, access_token: 'tok2', refresh_token: 'ref2' }),
    });
    mockSetSession.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: 'anon-after-null' } },
      error: null,
    });

    const userId = await initSupabaseSession({ tossHash: 'hash-E' });

    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
    expect(userId).toBe('anon-after-null');
  });
});
