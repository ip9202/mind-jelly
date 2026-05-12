'use client';

import { useState, useEffect, useCallback } from 'react';
import { diaryStore } from '@/stores/diaryStore';
import {
  findUserByInviteCode,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getMyFriends,
  getPendingFriendRequests,
  getFriendsFeed,
  getMyProfile,
  checkFriendshipStatus,
} from '@/lib/supabase/db';
import NavMenu from '@/components/layout/NavMenu';

type Tab = 'search' | 'list' | 'feed';

interface UserLite {
  id: string;
  nickname: string | null;
  invite_code: string;
  avatar_emotion: string | null;
}

interface PendingRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  requester: UserLite | null;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

interface FeedEntry {
  id: string;
  user_id: string;
  text: string;
  emotion: string;
  emotion_ko: string;
  confidence: number;
  is_shared: boolean;
  created_at: string;
  user: UserLite | null;
}

// @MX:NOTE: [AUTO] 닉네임 첫 글자를 초성 아바타로 표시하는 재사용 컴포넌트
function Avatar({
  nickname,
  size = 'md',
}: {
  nickname: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initial = nickname?.[0] ?? '?';
  const sizes = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-10 h-10 text-2xl',
    lg: 'w-12 h-12 text-3xl',
  };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary-container flex items-center justify-center font-dongle text-on-primary-container leading-none flex-shrink-0`}
    >
      {initial}
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

// ── 찾기 탭 ──────────────────────────────────────────
function SearchTab({ supabaseUserId }: { supabaseUserId: string }) {
  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<UserLite | null>(null);
  const [resultStatus, setResultStatus] = useState<
    'none' | 'self' | 'pending' | 'accepted' | 'notfound'
  >('none');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [recentFriends, setRecentFriends] = useState<UserLite[]>([]);

  const loadRecent = useCallback(async () => {
    try {
      const friendships = await getMyFriends(supabaseUserId);
      const friendIds = friendships
        .map((f) =>
          f.requester_id === supabaseUserId ? f.receiver_id : f.requester_id
        )
        .slice(0, 5);
      if (friendIds.length === 0) {
        setRecentFriends([]);
        return;
      }
      const profiles = await Promise.all(friendIds.map((id) => getMyProfile(id)));
      setRecentFriends(profiles.filter((p): p is UserLite => p !== null));
    } catch {
      // ignore
    }
  }, [supabaseUserId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecent();
  }, [loadRecent]);

  async function handleSearch() {
    if (!code.trim()) return;
    setSearching(true);
    setError('');
    setResult(null);
    setResultStatus('none');
    try {
      const user = await findUserByInviteCode(code.trim());
      if (!user) {
        setResultStatus('notfound');
        return;
      }
      if (user.id === supabaseUserId) {
        setResultStatus('self');
        return;
      }
      setResult(user);
      const status = await checkFriendshipStatus(supabaseUserId, user.id);
      if (status?.status === 'accepted') setResultStatus('accepted');
      else if (status?.status === 'pending') setResultStatus('pending');
      else setResultStatus('none');
    } catch {
      setError('검색 중 문제가 생겼어요');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    if (!result) return;
    setAdding(true);
    setError('');
    try {
      await sendFriendRequest(supabaseUserId, result.id);
      setResultStatus('pending');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === '23505') {
        setError('이미 친구 요청을 보냈어요');
        setResultStatus('pending');
      } else {
        setError('요청 중 문제가 생겼어요');
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-[12px]">
      <section className="space-y-[8px]">
        <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">
          초대코드로 찾기
        </h2>
        <div className="glass-card rounded-lg p-[24px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 space-y-[12px]">
          <div className="flex gap-[8px]">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="6자리 초대코드"
              className="flex-1 bg-white/60 border border-primary-container rounded-full px-[20px] py-[10px] font-gowun text-[16px] text-on-surface outline-none focus:border-primary transition-colors tracking-[0.2em] uppercase"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !code.trim()}
              className="bg-primary text-on-primary font-gowun text-[15px] px-[20px] py-[10px] rounded-full disabled:opacity-50"
            >
              {searching ? '...' : '찾기'}
            </button>
          </div>

          {error && (
            <p className="font-gowun text-[13px] text-error px-2">{error}</p>
          )}

          {resultStatus === 'self' && (
            <p className="font-gowun text-[14px] text-on-surface-variant text-center py-2">
              본인은 추가할 수 없어요
            </p>
          )}
          {resultStatus === 'notfound' && (
            <p className="font-gowun text-[14px] text-on-surface-variant text-center py-2">
              해당 초대코드의 친구를 찾을 수 없어요
            </p>
          )}

          {result && resultStatus !== 'self' && resultStatus !== 'notfound' && (
            <div className="flex items-center gap-[12px] bg-white/60 rounded-lg p-[12px]">
              <Avatar nickname={result.nickname} />
              <div className="flex-1 min-w-0">
                <p className="font-gowun text-[16px] text-on-surface truncate">
                  {result.nickname ?? '이름 없는 젤리'}
                </p>
                <p className="font-gowun text-[12px] text-on-surface-variant tracking-[0.15em]">
                  {result.invite_code}
                </p>
              </div>
              {resultStatus === 'accepted' ? (
                <span className="font-gowun text-[13px] text-primary px-3 py-1.5 bg-primary-container/40 rounded-full">
                  이미 친구예요 ✓
                </span>
              ) : resultStatus === 'pending' ? (
                <span className="font-gowun text-[13px] text-on-surface-variant px-3 py-1.5 bg-surface-container rounded-full">
                  요청 중...
                </span>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="bg-primary text-on-primary font-gowun text-[14px] px-[16px] py-[8px] rounded-full disabled:opacity-50 flex-shrink-0"
                >
                  {adding ? '...' : '친구 추가'}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {recentFriends.length > 0 && (
        <section className="space-y-[8px]">
          <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">
            최근에 추가한 친구
          </h2>
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            {recentFriends.map((f, i) => (
              <div
                key={f.id}
                className={`p-[16px] flex items-center gap-[12px] ${
                  i < recentFriends.length - 1 ? 'border-b border-white/40' : ''
                }`}
              >
                <Avatar nickname={f.nickname} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-gowun text-[15px] text-on-surface truncate">
                    {f.nickname ?? '이름 없는 젤리'}
                  </p>
                  <p className="font-gowun text-[12px] text-on-surface-variant tracking-[0.15em]">
                    {f.invite_code}
                  </p>
                </div>
                <span className="font-gowun text-[12px] text-primary px-3 py-1 bg-primary-container/40 rounded-full">
                  친구됨
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── 목록 탭 ──────────────────────────────────────────
function ListTab({ supabaseUserId }: { supabaseUserId: string }) {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [friends, setFriends] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pend, friendships] = await Promise.all([
        getPendingFriendRequests(supabaseUserId),
        getMyFriends(supabaseUserId),
      ]);
      setPending(pend as PendingRequest[]);

      const ids = (friendships as FriendshipRow[]).map((f) =>
        f.requester_id === supabaseUserId ? f.receiver_id : f.requester_id
      );
      if (ids.length === 0) {
        setFriends([]);
      } else {
        const profiles = await Promise.all(ids.map((id) => getMyProfile(id)));
        setFriends(profiles.filter((p): p is UserLite => p !== null));
      }
    } catch {
      setError('목록을 불러오지 못했어요');
    } finally {
      setLoading(false);
    }
  }, [supabaseUserId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleAccept(requesterId: string) {
    setActingId(requesterId);
    try {
      await acceptFriendRequest(requesterId, supabaseUserId);
      await load();
    } catch {
      setError('수락 중 문제가 생겼어요');
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(requesterId: string) {
    setActingId(requesterId);
    try {
      await rejectFriendRequest(requesterId, supabaseUserId);
      await load();
    } catch {
      setError('거절 중 문제가 생겼어요');
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 font-gowun text-on-surface-variant">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-[12px]">
      {error && (
        <p className="font-gowun text-[13px] text-error px-2">{error}</p>
      )}

      <section className="space-y-[8px]">
        <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">
          받은 요청
        </h2>
        {pending.length === 0 ? (
          <div className="glass-card rounded-lg p-[24px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40">
            <p className="font-gowun text-[14px] text-on-surface-variant text-center">
              아직 받은 요청이 없어요
            </p>
          </div>
        ) : (
          <div className="space-y-[8px]">
            {pending.map((req) => (
              <div
                key={req.id}
                className="glass-card rounded-lg p-[16px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 flex items-center gap-[12px]"
              >
                <Avatar nickname={req.requester?.nickname ?? null} />
                <div className="flex-1 min-w-0">
                  <p className="font-gowun text-[15px] text-on-surface truncate">
                    {req.requester?.nickname ?? '이름 없는 젤리'}
                  </p>
                  <p className="font-gowun text-[12px] text-on-surface-variant">
                    {formatRelativeTime(req.created_at)}
                  </p>
                </div>
                <div className="flex gap-[6px] flex-shrink-0">
                  <button
                    onClick={() => handleAccept(req.requester_id)}
                    disabled={actingId === req.requester_id}
                    className="bg-primary text-on-primary font-gowun text-[13px] px-[14px] py-[8px] rounded-full disabled:opacity-50"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => handleReject(req.requester_id)}
                    disabled={actingId === req.requester_id}
                    className="bg-surface-container text-on-surface-variant font-gowun text-[13px] px-[14px] py-[8px] rounded-full disabled:opacity-50"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-[8px]">
        <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">
          내 친구
        </h2>
        {friends.length === 0 ? (
          <div className="glass-card rounded-lg p-[32px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 text-center space-y-[12px]">
            <div className="text-5xl">🪼</div>
            <p className="font-gowun text-[14px] text-on-surface-variant whitespace-pre-line leading-relaxed">
              아직 친구가 없어요{'\n'}초대코드로 친구를 찾아보세요
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            {friends.map((f, i) => (
              <div
                key={f.id}
                className={`p-[16px] flex items-center gap-[12px] hover:bg-white/40 transition-colors ${
                  i < friends.length - 1 ? 'border-b border-white/40' : ''
                }`}
              >
                <Avatar nickname={f.nickname} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-gowun text-[15px] text-on-surface truncate">
                    {f.nickname ?? '이름 없는 젤리'}
                  </p>
                  <p className="font-gowun text-[12px] text-on-surface-variant tracking-[0.15em]">
                    {f.invite_code}
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── 피드 탭 ──────────────────────────────────────────
function FeedTab({ supabaseUserId }: { supabaseUserId: string }) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const friendships = await getMyFriends(supabaseUserId);
        const friendIds = (friendships as FriendshipRow[]).map((f) =>
          f.requester_id === supabaseUserId ? f.receiver_id : f.requester_id
        );
        if (friendIds.length === 0) {
          if (!cancelled) setEntries([]);
          return;
        }
        const feed = await getFriendsFeed(friendIds);
        if (!cancelled) setEntries(feed as FeedEntry[]);
      } catch {
        if (!cancelled) setError('피드를 불러오지 못했어요');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabaseUserId]);

  if (loading) {
    return (
      <div className="text-center py-12 font-gowun text-on-surface-variant">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-[12px]">
      <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">
        친구 감정 피드
      </h2>

      {error && (
        <p className="font-gowun text-[13px] text-error px-2">{error}</p>
      )}

      {entries.length === 0 ? (
        <div className="glass-card rounded-lg p-[32px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 text-center space-y-[12px]">
          <div className="text-5xl">🪼</div>
          <p className="font-gowun text-[14px] text-on-surface-variant whitespace-pre-line leading-relaxed">
            아직 공유된 감정이 없어요{'\n'}친구가 일기를 공유하면 여기에 나타나요
          </p>
        </div>
      ) : (
        <div className="space-y-[8px]">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="glass-card rounded-lg p-[20px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 space-y-[12px]"
            >
              <div className="flex items-center gap-[10px]">
                <Avatar nickname={entry.user?.nickname ?? null} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-gowun text-[14px] text-on-surface truncate">
                    {entry.user?.nickname ?? '이름 없는 젤리'}
                  </p>
                  <p className="font-gowun text-[11px] text-on-surface-variant">
                    {formatRelativeTime(entry.created_at)}
                  </p>
                </div>
                <span className="font-gowun text-[12px] text-primary px-3 py-1 bg-primary-container/40 rounded-full">
                  {entry.emotion_ko}
                </span>
              </div>
              {entry.text && (
                <p className="font-gowun text-[14px] text-on-surface leading-relaxed whitespace-pre-line">
                  {entry.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 페이지 ──────────────────────────────────────────
export default function FriendsPage() {
  const supabaseUserId = diaryStore((s) => s.supabaseUserId);
  const [tab, setTab] = useState<Tab>('search');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'search', label: '찾기' },
    { id: 'list', label: '목록' },
    { id: 'feed', label: '피드' },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen overflow-x-hidden">
      {/* 햄버거 메뉴 - 우측 상단 플로팅 */}
      <div className="fixed top-4 right-4 z-50">
        <NavMenu activeTab="friends" />
      </div>

      <main className="mt-4 px-[20px] pb-8 space-y-[12px]">
        {/* Tab bar */}
        <div className="bg-surface-container rounded-full p-1 flex gap-1">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-[8px] rounded-full font-gowun text-[14px] transition-colors ${
                  active
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {!supabaseUserId ? (
          <div className="glass-card rounded-lg p-[32px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 text-center space-y-[12px]">
            <div className="text-5xl">🪼</div>
            <p className="font-gowun text-[14px] text-on-surface-variant leading-relaxed">
              로그인이 필요해요
            </p>
          </div>
        ) : tab === 'search' ? (
          <SearchTab supabaseUserId={supabaseUserId} />
        ) : tab === 'list' ? (
          <ListTab supabaseUserId={supabaseUserId} />
        ) : (
          <FeedTab supabaseUserId={supabaseUserId} />
        )}
      </main>

      {/* Background Illustration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary-container rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-secondary-container rounded-full blur-[60px]"></div>
      </div>
    </div>
  );
}
