/**
 * friendStore 테스트
 * 친구 요청 뱃지 상태 관리 (SPEC-FRIEND-004 TASK-001)
 */
import { useFriendStore } from '../friendStore';
import { getPendingFriendRequests } from '@/lib/supabase/db';

// getPendingFriendRequests 모킹
jest.mock('@/lib/supabase/db', () => ({
  getPendingFriendRequests: jest.fn(),
}));

const mockGetPending = getPendingFriendRequests as jest.MockedFunction<typeof getPendingFriendRequests>;

describe('friendStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useFriendStore.setState({ pendingCount: 0, isBadgeVisible: false });
    jest.clearAllMocks();
  });

  it('초기 상태: pendingCount=0, isBadgeVisible=false', () => {
    const state = useFriendStore.getState();
    expect(state.pendingCount).toBe(0);
    expect(state.isBadgeVisible).toBe(false);
  });

  it('fetchPendingCount: 대기 요청 수를 pendingCount에 설정한다', async () => {
    const mockRequests = [
      { id: '1', requester: { id: 'u1', nickname: '친구1' } },
      { id: '2', requester: { id: 'u2', nickname: '친구2' } },
      { id: '3', requester: { id: 'u3', nickname: '친구3' } },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetPending.mockResolvedValue(mockRequests as any);

    await useFriendStore.getState().fetchPendingCount('user-123');

    expect(mockGetPending).toHaveBeenCalledWith('user-123');
    expect(useFriendStore.getState().pendingCount).toBe(3);
  });

  it('fetchPendingCount: count > 0이면 isBadgeVisible=true', async () => {
    const mockRequests = [
      { id: '1', requester: { id: 'u1', nickname: '친구1' } },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetPending.mockResolvedValue(mockRequests as any);

    await useFriendStore.getState().fetchPendingCount('user-123');

    expect(useFriendStore.getState().isBadgeVisible).toBe(true);
  });

  it('fetchPendingCount: count === 0이면 isBadgeVisible=false', async () => {
    mockGetPending.mockResolvedValue([]);

    await useFriendStore.getState().fetchPendingCount('user-123');

    expect(useFriendStore.getState().isBadgeVisible).toBe(false);
  });

  it('resetBadge: isBadgeVisible을 false로 설정한다', () => {
    useFriendStore.setState({ pendingCount: 5, isBadgeVisible: true });

    useFriendStore.getState().resetBadge();

    expect(useFriendStore.getState().isBadgeVisible).toBe(false);
    // pendingCount는 변경하지 않음
    expect(useFriendStore.getState().pendingCount).toBe(5);
  });
});
