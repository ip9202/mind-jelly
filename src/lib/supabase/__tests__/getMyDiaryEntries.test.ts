/**
 * REQ-PERF-001: getMyDiaryEntries limit 테스트
 * SPEC-PERF-001
 */

import { getMyDiaryEntries } from '../db';

// Supabase 클라이언트 모킹
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });

jest.mock('../client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
    })),
  },
}));

describe('REQ-PERF-001: getMyDiaryEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockOrder.mockReturnThis();
    mockLimit.mockResolvedValue({ data: [], error: null });

    // 체인 설정: select → eq → order → limit
    mockSelect.mockImplementation(() => ({
      eq: mockEq.mockImplementation(() => ({
        order: mockOrder.mockImplementation(() => ({
          limit: mockLimit,
        })),
      })),
    }));
  });

  it('최대 30개 항목만 로드해야 한다', async () => {
    const userId = 'test-user-id';
    await getMyDiaryEntries(userId);

    // limit(30)이 호출되었는지 확인
    expect(mockLimit).toHaveBeenCalledWith(30);
  });

  it('order가 created_at desc로 설정되어야 한다', async () => {
    const userId = 'test-user-id';
    await getMyDiaryEntries(userId);

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('에러 발생 시 예외를 던져야 한다', async () => {
    mockSelect.mockImplementation(() => ({
      eq: mockEq.mockImplementation(() => ({
        order: mockOrder.mockImplementation(() => ({
          limit: mockLimit.mockResolvedValue({
            data: null,
            error: new Error('DB error'),
          }),
        })),
      })),
    }));

    await expect(getMyDiaryEntries('test-user-id')).rejects.toThrow('DB error');
  });

  it('데이터가 null이면 빈 배열을 반환해야 한다', async () => {
    mockSelect.mockImplementation(() => ({
      eq: mockEq.mockImplementation(() => ({
        order: mockOrder.mockImplementation(() => ({
          limit: mockLimit.mockResolvedValue({ data: null, error: null }),
        })),
      })),
    }));

    const result = await getMyDiaryEntries('test-user-id');
    expect(result).toEqual([]);
  });
});
