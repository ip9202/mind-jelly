/**
 * 친구 요청 뱃지 상태 관리 Store
 * 네비게이션 바 뱃지 표시 여부 및 받은 친구 요청 수 관리
 */
// @MX:NOTE: [AUTO] 친구 요청 뱃지 상태 관리 (SPEC-FRIEND-004)
// @MX:SPEC: SPEC-FRIEND-004

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface FriendStoreState {
  pendingCount: number;
  isBadgeVisible: boolean;

  fetchPendingCount: (userId: string) => Promise<void>;
  resetBadge: () => void;
}

export const useFriendStore = create<FriendStoreState>()(
  devtools(
    (set) => ({
      pendingCount: 0,
      isBadgeVisible: false,

      fetchPendingCount: async (userId: string) => {
        const { getPendingFriendRequests } = await import('@/lib/supabase/db');
        const requests = await getPendingFriendRequests(userId);
        const count = requests.length;
        set({ pendingCount: count, isBadgeVisible: count > 0 });
      },

      resetBadge: () => {
        set({ isBadgeVisible: false });
      },
    }),
    { name: 'friendStore' },
  ),
);
