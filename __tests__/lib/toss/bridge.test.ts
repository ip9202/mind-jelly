/**
 * Toss Bridge 유틸리티 테스트
 * SDK(@apps-in-toss/web-framework) 기반: detectWebView, getUserIdentity, signInWithToss, checkTossLoginLinked
 */

jest.mock('@apps-in-toss/web-framework', () => ({
  getDeviceId: jest.fn(),
  getAnonymousKey: jest.fn(),
  appLogin: jest.fn(),
  getIsTossLoginIntegratedService: jest.fn(),
}));

import {
  getDeviceId,
  getAnonymousKey,
  appLogin,
  getIsTossLoginIntegratedService,
} from '@apps-in-toss/web-framework';

const mockGetDeviceId = getDeviceId as jest.Mock;
const mockGetAnonymousKey = getAnonymousKey as jest.Mock;
const mockAppLogin = appLogin as jest.Mock;
const mockGetIsTossLoginIntegratedService = getIsTossLoginIntegratedService as jest.Mock;

import { detectWebView, getUserIdentity, signInWithToss, checkTossLoginLinked } from '@/lib/toss/bridge';

const OLD_ENV = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...OLD_ENV, NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co' };
});

afterAll(() => {
  process.env = OLD_ENV;
});

// --- detectWebView ---

describe('detectWebView', () => {
  it('getDeviceId가 유효한 문자열을 반환하면 true', () => {
    mockGetDeviceId.mockReturnValue('device-abc-123');
    expect(detectWebView()).toBe(true);
  });

  it('getDeviceId가 빈 문자열을 반환하면 false', () => {
    mockGetDeviceId.mockReturnValue('');
    expect(detectWebView()).toBe(false);
  });

  it('getDeviceId가 예외를 던지면 false', () => {
    mockGetDeviceId.mockImplementation(() => { throw new Error('not in WebView'); });
    expect(detectWebView()).toBe(false);
  });
});

// --- getUserIdentity ---

describe('getUserIdentity', () => {
  it('WebView 환경에서 anonymousKey와 deviceId를 반환한다', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockGetAnonymousKey.mockResolvedValue({ type: 'HASH', hash: 'anon-hash-xyz' });

    const result = await getUserIdentity();

    expect(result).toEqual({ anonymousKey: 'anon-hash-xyz', deviceId: 'device-abc' });
  });

  it('WebView가 아니면 null을 반환한다', async () => {
    mockGetDeviceId.mockImplementation(() => { throw new Error('not in WebView'); });

    const result = await getUserIdentity();
    expect(result).toBeNull();
  });

  it("getAnonymousKey 결과가 'ERROR'이면 null 반환", async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockGetAnonymousKey.mockResolvedValue('ERROR');

    const result = await getUserIdentity();
    expect(result).toBeNull();
  });

  it('getAnonymousKey 결과 type이 HASH가 아니면 null 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockGetAnonymousKey.mockResolvedValue({ type: 'OTHER', value: 'something' });

    const result = await getUserIdentity();
    expect(result).toBeNull();
  });

  it('getAnonymousKey 예외 발생 시 null 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockGetAnonymousKey.mockRejectedValue(new Error('SDK error'));

    const result = await getUserIdentity();
    expect(result).toBeNull();
  });
});

// --- signInWithToss ---

describe('signInWithToss', () => {
  global.fetch = jest.fn();
  const mockFetch = global.fetch as jest.Mock;

  it('WebView 환경에서 authorizationCode를 Edge Function으로 전달 후 TossLoginUser 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockAppLogin.mockResolvedValue({ authorizationCode: 'code-123', referrer: 'DEFAULT' });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, name: '홍길동', email: 'hong@example.com' }),
    });

    const result = await signInWithToss('supabase-user-id');

    expect(mockAppLogin).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/toss-login',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual({ name: '홍길동', email: 'hong@example.com' });
  });

  it('WebView가 아니면 null 반환', async () => {
    mockGetDeviceId.mockImplementation(() => { throw new Error('not in WebView'); });

    const result = await signInWithToss('supabase-user-id');
    expect(result).toBeNull();
  });

  it('Edge Function이 실패하면 null 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockAppLogin.mockResolvedValue({ authorizationCode: 'code-123', referrer: 'DEFAULT' });
    mockFetch.mockResolvedValue({ ok: false });

    const result = await signInWithToss('supabase-user-id');
    expect(result).toBeNull();
  });

  it('appLogin 예외 발생 시 null 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockAppLogin.mockRejectedValue(new Error('login cancelled'));

    const result = await signInWithToss('supabase-user-id');
    expect(result).toBeNull();
  });
});

// --- checkTossLoginLinked ---

describe('checkTossLoginLinked', () => {
  it('토스 로그인 연동된 유저이면 true 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockGetIsTossLoginIntegratedService.mockResolvedValue(true);

    expect(await checkTossLoginLinked()).toBe(true);
  });

  it('토스 로그인 미연동 유저이면 false 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockGetIsTossLoginIntegratedService.mockResolvedValue(false);

    expect(await checkTossLoginLinked()).toBe(false);
  });

  it('WebView가 아니면 false 반환', async () => {
    mockGetDeviceId.mockImplementation(() => { throw new Error('not in WebView'); });

    expect(await checkTossLoginLinked()).toBe(false);
  });

  it('getIsTossLoginIntegratedService 예외 발생 시 false 반환', async () => {
    mockGetDeviceId.mockReturnValue('device-abc');
    mockGetIsTossLoginIntegratedService.mockRejectedValue(new Error('SDK error'));

    expect(await checkTossLoginLinked()).toBe(false);
  });
});
