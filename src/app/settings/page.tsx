'use client';

import { useState, useEffect } from 'react';
import { getMyProfile, setNickname } from '@/lib/supabase/db';
import { diaryStore } from '@/stores/diaryStore';
import { jellyStore } from '@/stores/jellyStore';
import { rewardStore } from '@/stores/rewardStore';
import { JELLY_SHAPE_CONFIGS } from '@/lib/constants/jellyShapes';
import { JELLY_COLOR } from '@/lib/constants/emotion';
import { supabase } from '@/lib/supabase/client';
import type { JellyShape } from '@/types/physics';
import BottomNav from '@/components/layout/BottomNav';

function ProfileSection() {
  const supabaseUserId = diaryStore((s) => s.supabaseUserId);
  const jellyName = jellyStore((s) => s.jellyName);
  const [nickname, setNicknameState] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabaseUserId) return;
    getMyProfile(supabaseUserId).then((profile) => {
      if (profile) {
        // Supabase nickname 우선, 없으면 jellyStore 이름 사용
        const name = profile.nickname ?? jellyName ?? '';
        setNicknameState(name);
        setInviteCode(profile.invite_code);
        setInput(name);
      }
    });
  }, [supabaseUserId, jellyName]);

  async function handleSave() {
    if (!supabaseUserId) return;
    if (!input.trim()) { setError('닉네임을 입력해주세요'); return; }
    if (input.trim().length < 2) { setError('2자 이상 입력해주세요'); return; }
    setSaving(true);
    setError('');
    try {
      await setNickname(supabaseUserId, input.trim());
      setNicknameState(input.trim());
      jellyStore.getState().setJellyName(input.trim()); // 로컬 이름도 동기화
      setEditing(false);
    } catch {
      setError('이미 사용 중인 닉네임입니다');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-[8px]">
      <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">프로필</h2>
      <div className="glass-card rounded-lg p-[24px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 space-y-[20px]">
        {/* 닉네임 */}
        <div className="space-y-[8px]">
          <p className="font-gowun text-[13px] text-on-surface-variant">닉네임</p>
          {editing ? (
            <div className="space-y-[8px]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={12}
                placeholder="2~12자 입력"
                className="w-full bg-white/60 border border-primary-container rounded-lg px-[16px] py-[10px] font-gowun text-[16px] text-on-surface outline-none focus:border-primary transition-colors"
              />
              {error && <p className="font-gowun text-[13px] text-error">{error}</p>}
              <div className="flex gap-[8px]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-on-primary font-gowun text-[15px] py-[10px] rounded-lg disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => { setEditing(false); setError(''); setInput(nickname); }}
                  className="px-[20px] bg-surface-container font-gowun text-[15px] py-[10px] rounded-lg text-on-surface-variant"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-gowun text-[16px] text-on-surface">
                {nickname || <span className="text-on-surface-variant">미설정</span>}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="font-gowun text-[14px] text-primary"
              >
                {nickname ? '변경' : '설정'}
              </button>
            </div>
          )}
        </div>

        {/* 초대코드 */}
        <div className="space-y-[8px]">
          <p className="font-gowun text-[13px] text-on-surface-variant">내 초대코드</p>
          <div className="flex items-center justify-between">
            <span className="font-gowun text-xl font-bold text-primary tracking-[0.2em]">
              {inviteCode || '------'}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(inviteCode)}
              className="flex items-center gap-1 font-gowun text-[14px] text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              복사
            </button>
          </div>
          <p className="font-gowun text-[12px] text-on-surface-variant">
            이 코드로 친구가 나를 찾을 수 있어요
          </p>
        </div>
      </div>
    </section>
  );
}

function JellyShapeSection() {
  const jellyShape = jellyStore((s) => s.jellyShape);
  const setJellyShape = jellyStore((s) => s.setJellyShape);
  const shapes = Object.keys(JELLY_SHAPE_CONFIGS) as JellyShape[];

  return (
    <section className="space-y-[8px]">
      <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">젤리 모양</h2>
      <div className="glass-card rounded-lg p-[20px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40">
        <div className="grid grid-cols-2 gap-[16px]">
          {shapes.map((shape) => {
            const config = JELLY_SHAPE_CONFIGS[shape];
            const isSelected = jellyShape === shape;
            const gradStart = isSelected ? '#fff0f4' : '#f0f0f0';
            const gradMid = isSelected ? '#FFD1DC' : '#d0d0d0';
            const gradEnd = isSelected ? '#FFB3A7' : '#a0a0a0';
            const gradId = `sg-${shape}`;
            const maskId = `sm-${shape}`;
            const filterId = `sf-${shape}`;

            return (
              <button
                key={shape}
                onClick={() => setJellyShape(shape)}
                aria-label={`젤리 모양: ${config.label}`}
                aria-pressed={isSelected}
                className={`flex flex-col items-center gap-[10px] p-[16px] rounded-2xl transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary-container border-2 border-[#FFB3A7]'
                    : 'bg-surface-container/50 border-2 border-transparent hover:bg-surface-container'
                }`}
              >
                {/* 3D 글로시 젤리 미니 프리뷰 */}
                <svg width="72" height="72" viewBox="0 0 1 1" aria-hidden>
                  <defs>
                    <radialGradient id={gradId} cx="0.35" cy="0.28" r="0.70" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="white" stopOpacity="0.85" />
                      <stop offset="20%" stopColor={gradStart} />
                      <stop offset="60%" stopColor={gradMid} />
                      <stop offset="100%" stopColor={gradEnd} />
                    </radialGradient>
                    <mask id={maskId}>
                      <path d={config.path} fill="white" />
                    </mask>
                    <filter id={filterId} x="-20%" y="-15%" width="140%" height="145%">
                      <feDropShadow
                        dx="0"
                        dy="0.03"
                        stdDeviation="0.035"
                        floodColor={isSelected ? '#FFB3A7' : '#999'}
                        floodOpacity="0.35"
                      />
                    </filter>
                  </defs>
                  {/* 젤리 바디 */}
                  <path
                    d={config.path}
                    fill={`url(#${gradId})`}
                    filter={`url(#${filterId})`}
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="0.018"
                  />
                  {/* 하이라이트 (마스크 적용) */}
                  <g mask={`url(#${maskId})`}>
                    <ellipse cx="0.32" cy="0.25" rx="0.16" ry="0.09" fill="white" opacity="0.55" style={{ filter: 'blur(1.5px)' }} />
                    <circle cx="0.26" cy="0.20" r="0.042" fill="white" opacity="0.88" />
                  </g>
                  {/* 미니 표정 (눈 + 미소) */}
                  <g mask={`url(#${maskId})`}>
                    <circle cx="0.40" cy="0.52" r="0.040" fill="#7a5761" />
                    <circle cx="0.60" cy="0.52" r="0.040" fill="#7a5761" />
                    <path
                      d="M 0.36 0.62 Q 0.50 0.72 0.64 0.62"
                      stroke="#7a5761"
                      strokeWidth="0.030"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>

                <span
                  className={`font-gowun text-[14px] ${
                    isSelected
                      ? 'text-on-primary-container font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="font-gowun text-[12px] text-on-surface-variant mt-[16px] text-center">
          젤리의 기본 모양을 선택해보세요 💕
        </p>
      </div>
    </section>
  );
}

function EmotionPersistenceSection() {
  const persistEmotion = jellyStore((s) => s.persistEmotion);
  const setPersistEmotion = jellyStore((s) => s.setPersistEmotion);

  return (
    <section className="space-y-[8px]">
      <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">젤리 정보</h2>
      <div className="glass-card rounded-lg p-[20px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40">
        <div className="flex items-center justify-between">
          <div className="space-y-[4px]">
            <p className="font-gowun text-[16px] text-on-surface">감정 상태 유지</p>
            <p className="font-gowun text-[12px] text-on-surface-variant">
              켜면 매일 초기화되지 않고 이전 감정이 유지돼요
            </p>
          </div>
          <button
            onClick={() => setPersistEmotion(!persistEmotion)}
            role="switch"
            aria-checked={persistEmotion}
            aria-label="감정 상태 유지 토글"
            className={`relative w-[52px] h-[28px] rounded-full transition-colors duration-200 ${
              persistEmotion
                ? 'bg-primary'
                : 'bg-surface-container'
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                persistEmotion
                  ? 'translate-x-[24px]'
                  : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleDataReset() {
    setIsResetting(true);
    try {
      // 1. Supabase 전체 개인정보 삭제 (정보통신망법 제16조 준수)
      const userId = diaryStore.getState().supabaseUserId;
      if (userId) {
        try {
          await Promise.allSettled([
            supabase.from('diary_entries').delete().eq('user_id', userId),
            supabase.from('friendships').delete().or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
            supabase.from('users').delete().eq('id', userId),
          ]);
        } catch {
          // Supabase 실패해도 로컬 초기화는 진행
        }
      }

      // 2. Reset Zustand stores
      rewardStore.getState().reset?.();
      diaryStore.setState({ entries: [], supabaseUserId: null, isLoading: false });
      jellyStore.setState({
        currentState: 'idle',
        faceExpression: { eyes: '• •', mouth: 'o' },
        jellyPosition: { x: 0, y: 0 },
        animationParams: { scale: 1, translateY: 0, wobble: 0 },
        lastEmotion: 'joy',
        isAnalyzing: false,
        analysisError: null,
        emotionHistory: [],
        lastInputText: '',
        emotionColor: JELLY_COLOR,
        jellyName: '',
        jellyShape: 'ppung',
        lastAccessDate: '',
        touchCooldownAt: 0,
        persistEmotion: false,
        isInitialized: false,
      });

      // 3. Clear localStorage
      localStorage.removeItem('jelly-storage');
      localStorage.removeItem('reward-storage');
      localStorage.removeItem('ad_frequency_history');
      localStorage.removeItem('mind-jelly-theme');

      // 4. Supabase 인증 세션 폐기 → 재시작 시 새 익명 ID 발급
      await supabase.auth.signOut();

      // 5. Reload app
      window.location.reload();
    } catch {
      setIsResetting(false);
      alert('초기화 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen overflow-x-hidden pb-24">
      <main className="mt-4 px-[20px] space-y-[12px]">
        <ProfileSection />

        {/* Jelly Shape Section */}
        <JellyShapeSection />

        {/* Emotion Persistence Section */}
        <EmotionPersistenceSection />

        {/* About Section */}
        <section className="space-y-[8px]">
          <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">정보</h2>
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center">
              <span className="font-gowun text-[16px] text-on-surface">버전 정보</span>
              <span className="text-on-surface-variant font-gowun">v1.2.4</span>
            </div>
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">도움말</span>
              <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
            </div>
            <button
              onClick={() => setShowResetDialog(true)}
              className="w-full p-[16px] flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer text-error"
            >
              <span className="font-gowun text-[16px]">데이터 초기화</span>
              <span className="material-symbols-outlined">delete_forever</span>
            </button>
          </div>
        </section>

        {/* Decorative Element */}
        <div className="pt-[32px] flex flex-col items-center opacity-40">
          <span className="material-symbols-outlined text-[32px] text-primary mb-2">bubble_chart</span>
          <p className="font-gamja text-lg text-primary">Mind Jelly with Love</p>
        </div>
      </main>

      {/* Data Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-[20px]">
          <div className="bg-white w-full max-w-[340px] rounded-2xl p-[24px] shadow-xl border border-white/40 space-y-[20px]">
            <h3 className="font-gowun text-xl font-bold text-error text-center">데이터 초기화</h3>
            <div className="space-y-[8px]">
              <p className="font-gowun text-[14px] text-on-surface text-center">
                다음 데이터가 서버에서 영구 삭제됩니다.
              </p>
              <ul className="font-gowun text-[13px] text-on-surface-variant space-y-[4px] pl-[16px] list-disc">
                <li>모든 일기 및 감정 기록</li>
                <li>친구 관계</li>
                <li>프로필 (닉네임, 초대코드)</li>
                <li>젤리 상태, 보상, 설정</li>
              </ul>
              <p className="font-gowun text-[12px] text-error text-center mt-[8px]">
                삭제된 데이터는 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex gap-[12px]">
              <button
                onClick={() => setShowResetDialog(false)}
                disabled={isResetting}
                className="flex-1 bg-surface-container font-gowun text-[15px] py-[12px] rounded-xl text-on-surface-variant disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDataReset}
                disabled={isResetting}
                className="flex-1 bg-error font-gowun text-[15px] py-[12px] rounded-xl text-white disabled:opacity-50"
              >
                {isResetting ? '초기화 중...' : '초기화'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Illustration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary-container rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-secondary-container rounded-full blur-[60px]"></div>
      </div>

      {/* 전역 BottomNav (햄버거 메뉴 대체) */}
      <BottomNav activeTab="garden" />
    </div>
  );
}
