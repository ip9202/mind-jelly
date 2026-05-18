/**
 * SPEC-FRIEND-003: RLS 프라이버시 검증 테스트
 * TDD Phase: RED
 *
 * T-005: getFriendsFeed가 is_shared=false 항목을 필터링하는지 확인
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Supabase 클라이언트 모킹
const mockSelect = jest.fn();
const mockIn = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

jest.mock('../client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
    })),
  },
}));

describe('T-005: getFriendsFeed RLS 프라이버시 검증', () => {
  let getFriendsFeed: typeof import('../db').getFriendsFeed;

  beforeEach(async () => {
    jest.clearAllMocks();

    // 체인 설정: select → in → eq → order → limit
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockOrder.mockImplementation(() => ({
      limit: mockLimit,
    }));
    mockEq.mockImplementation(() => ({
      order: mockOrder,
    }));
    mockIn.mockImplementation(() => ({
      eq: mockEq,
    }));
    mockSelect.mockImplementation(() => ({
      in: mockIn,
    }));

    // 동적 import로 모킹 적용
    const db = await import('../db');
    getFriendsFeed = db.getFriendsFeed;
  });

  it('빈 friendIds 배열이면 빈 배열을 반환해야 함', async () => {
    const result = await getFriendsFeed([]);
    expect(result).toEqual([]);
    // DB 쿼리가 호출되지 않아야 함
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it('is_shared=true 필터가 적용되어야 함', async () => {
    await getFriendsFeed(['friend-1', 'friend-2']);

    // .eq('is_shared', true) 호출 확인
    expect(mockEq).toHaveBeenCalledWith('is_shared', true);
  });

  it('friendIds가 user_id IN 필터에 전달되어야 함', async () => {
    const friendIds = ['friend-1', 'friend-2', 'friend-3'];
    await getFriendsFeed(friendIds);

    // .in('user_id', friendIds) 호출 확인
    expect(mockIn).toHaveBeenCalledWith('user_id', friendIds);
  });

  it('최대 50개로 제한되어야 함', async () => {
    await getFriendsFeed(['friend-1']);

    // .limit(50) 호출 확인
    expect(mockLimit).toHaveBeenCalledWith(50);
  });

  it('created_at 내림차순 정렬이어야 함', async () => {
    await getFriendsFeed(['friend-1']);

    // .order('created_at', { ascending: false }) 호출 확인
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('에러 발생 시 예외를 던져야 함', async () => {
    mockLimit.mockResolvedValue({
      data: null,
      error: new Error('RLS violation'),
    });

    await expect(getFriendsFeed(['friend-1'])).rejects.toThrow('RLS violation');
  });
});
