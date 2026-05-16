'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getMyProfile, setNickname, resetUserData } from '@/lib/supabase/db';
import { diaryStore } from '@/stores/diaryStore';
import { jellyStore } from '@/stores/jellyStore';
import { rewardStore } from '@/stores/rewardStore';
import { JELLY_SHAPE_CONFIGS } from '@/lib/constants/jellyShapes';
import { JELLY_COLOR } from '@/lib/constants/emotion';
import { SKIN_THEMES } from '@/lib/rewards/jellySkins';
import type { JellyShape } from '@/types/physics';
import BottomNav from '@/components/layout/BottomNav';

function ProfileSection() {
  const supabaseUserId = diaryStore((s) => s.supabaseUserId);
  const jellyName = jellyStore((s) => s.jellyName);
  const [nickname, setNicknameState] = useState('');
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
      </div>
    </section>
  );
}

function JellyShapeSection() {
  const jellyShape = jellyStore((s) => s.jellyShape);
  const setJellyShape = jellyStore((s) => s.setJellyShape);
  const supabaseUserId = diaryStore((s) => s.supabaseUserId);
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
                onClick={() => setJellyShape(supabaseUserId ?? '', shape)}
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
  const supabaseUserId = diaryStore((s) => s.supabaseUserId);

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
            onClick={() => setPersistEmotion(supabaseUserId ?? '', !persistEmotion)}
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

// 아코디언 그룹 (한 번에 하나만 열림)
function AccordionGroup({ children }: { children: React.ReactNode }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="overflow-y-auto px-[20px] pb-[20px]">
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ open: boolean; onToggle: () => void }>, {
          open: openIdx === i,
          onToggle: () => setOpenIdx(openIdx === i ? null : i),
        });
      })}
    </div>
  );
}

// 아코디언 아이템 (단일 열림)
function AccordionItem({ title, open, onToggle, children }: { title: string; open?: boolean; onToggle?: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-primary/10 last:border-b-0">
      <button
        onClick={onToggle ?? (() => {})}
        className="w-full flex items-center justify-between py-[14px] px-[4px] text-left"
      >
        <span className="font-gowun text-[15px] font-bold text-on-surface">{title}</span>
        <span className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[500px] pb-[14px]' : 'max-h-0'}`}>
        <div className="px-[4px] font-gowun text-[13px] text-on-surface-variant leading-relaxed space-y-[6px]">
          {children}
        </div>
      </div>
    </div>
  );
}

// 도움말 바텀시트 모달 (드래그 핸들로 닫기)
function HelpModal({ onClose }: { onClose: () => void }) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  // 모달 오픈 시 배경 스크롤 차단
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) setDragY(dy);
  }

  function handleTouchEnd() {
    setIsDragging(false);
    if (dragY > 80) {
      onClose();
    } else {
      setDragY(0);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
      onClick={onClose}
      onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
    >
      <div
        className="bg-white w-full max-w-[400px] max-h-[85vh] rounded-t-2xl shadow-xl border border-white/40 flex flex-col"
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : undefined, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 (여기서만 드래그 활성화) */}
        <div
          className="flex flex-col items-center pt-[12px] pb-[8px] shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => { e.stopPropagation(); handleTouchEnd(); }}
        >
          <div className="w-[36px] h-[4px] rounded-full bg-gray-300" />
          <h3 className="font-gowun text-lg font-bold text-primary mt-[8px]">도움말</h3>
        </div>

        {/* 아코디언 목록 */}
        <AccordionGroup>
          <AccordionItem title="마음젤리란?">
            <p>매일의 감정을 젤리로 표현하는 감정 일기 앱이에요.</p>
            <p>일기를 쓰면 AI가 감정을 분석하고, 젤리가 그 색으로 물들어요.</p>
          </AccordionItem>

          <AccordionItem title="감정 분석은 어떻게 되나요?">
            <p>일기를 작성하면 AI가 텍스트를 분석해 감정을 파악해요.</p>
            <p>분석된 감정은 젤리의 색상으로 나타나고, 구슬을 먹는 애니메이션과 함께 적용돼요.</p>
          </AccordionItem>

          <AccordionItem title="보상형 광고가 무엇인가요?">
            <p>일기 감정 리포트에서 광고를 볼 수 있어요. 짧은 광고를 시청하면 보상으로 젤리 스킨을 받아요.</p>
            <p>하루 최대 3회, 세션당 1회 시청할 수 있어요.</p>
          </AccordionItem>

          <AccordionItem title="젤리 스킨은 어떻게 얻나요?">
            <p>보상형 광고를 시청하면 랜덤으로 스킨이 지급돼요.</p>
            <p>지급된 스킨은 24시간 동안 적용되며, 설정에서 켜고 끌 수 있어요.</p>
          </AccordionItem>

          <AccordionItem title="스킨 등급은 어떻게 되나요?">
            <p>광고 시청 횟수에 따라 등급이 올라가요.</p>
            <div className="flex items-center gap-[8px] py-[4px]">
              <span className="text-[12px] px-[8px] py-[2px] rounded-full text-white bg-blue-400">Rare</span>
              <span>곰돌이, 고양이, 판다, 토끼, 여우</span>
            </div>
            <div className="flex items-center gap-[8px] py-[4px]">
              <span className="text-[12px] px-[8px] py-[2px] rounded-full text-white bg-purple-500">Epic</span>
              <span>유니콘, 돌고래, 나비</span>
            </div>
            <div className="flex items-center gap-[8px] py-[4px]">
              <span className="text-[12px] px-[8px] py-[2px] rounded-full text-white bg-amber-500">Legendary</span>
              <span>드래곤, 피닉스</span>
            </div>
          </AccordionItem>

          <AccordionItem title="감정 상태 유지는 무엇인가요?">
            <p>기본적으로 매일 젤리의 감정이 초기화돼요.</p>
            <p>감정 상태 유지를 켜면 어제의 감정이 오늘도 이어져요. 끄면 새로운 날에 기본 상태로 돌아가요.</p>
          </AccordionItem>
        </AccordionGroup>
      </div>
    </div>
  );
}

function JellySkinSection() {
  const activeSkin = rewardStore((s) => s.activeSkin);
  const skinEnabled = rewardStore((s) => s.skinEnabled);
  const toggleSkinEnabled = rewardStore((s) => s.toggleSkinEnabled);
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const skin = rewardStore.getState().activeSkin;
      if (!skin) { setRemaining(''); return; }
      const diff = new Date(skin.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        rewardStore.getState().checkSkinExpiration();
        setRemaining('');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}시간 ${m}분 남음`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [activeSkin?.id]);

  const theme = activeSkin ? SKIN_THEMES[activeSkin.id] : null;
  const TIER_LABEL: Record<string, string> = { rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

  return (
    <section className="space-y-[8px]">
      <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">젤리 스킨</h2>
      <div className="glass-card rounded-lg p-[20px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40">
        {activeSkin ? (
          <div className="flex items-center gap-[16px]">
            <span className={`text-4xl transition-opacity ${skinEnabled ? 'opacity-100' : 'opacity-40'}`}>
              {activeSkin.emoji}
            </span>
            <div className="flex-1 space-y-[4px]">
              <div className="flex items-center gap-[8px]">
                <span className="font-gowun text-[16px] font-bold text-on-surface">{activeSkin.name}</span>
                {theme && (
                  <span
                    className="text-[11px] px-[8px] py-[2px] rounded-full text-white font-bold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {TIER_LABEL[activeSkin.id] || 'Rare'}
                  </span>
                )}
              </div>
              <p className="font-gowun text-[13px] text-on-surface-variant">{remaining}</p>
            </div>
            <button
              onClick={toggleSkinEnabled}
              className={`relative w-[48px] h-[28px] rounded-full transition-colors shrink-0 ${
                skinEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}
              aria-label={skinEnabled ? '스킨 해제' : '스킨 적용'}
            >
              <span
                className={`absolute top-[2px] left-[2px] w-[24px] h-[24px] bg-white rounded-full shadow transition-transform ${
                  skinEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ) : (
          <div className="text-center py-[8px]">
            <p className="font-gowun text-[14px] text-on-surface-variant">적용된 스킨이 없습니다</p>
            <p className="font-gowun text-[12px] text-on-surface-variant mt-[4px]">
              광고를 시청하면 랜덤 스킨이 적용돼요
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  async function handleDataReset() {
    setIsResetting(true);
    try {
      // @MX:NOTE: [AUTO] SPEC-SYNC-001 REQ-SYNC-007: resetUserData RPC로 서버 데이터 삭제
      // RPC 실패 시 localStorage를 초기화하지 않아 복구 상태 보존
      const userId = diaryStore.getState().supabaseUserId;
      if (userId) {
        await resetUserData(userId);
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

      // 3. Clear localStorage (광고 빈도 키 포함)
      localStorage.removeItem('jelly-storage');
      localStorage.removeItem('reward-storage');
      localStorage.removeItem('ad_frequency_history');
      localStorage.removeItem('rewarded_ad_frequency');
      localStorage.removeItem('mind-jelly-theme');

      // 4. 세션 유지 — signOut() 시 auth.users 행이 삭제되어
      // recover-session이 실패하고 orphaned user가 생성됨.
      // 세션을 유지하면 동일 user 행을 재사용하여 toss_user_id 보존.
      // RPC가 nickname을 초기화하므로 리로드 후 자동으로 /onboarding 진입.

      // 5. Reload app
      window.location.reload();
    } catch (e) {
      setIsResetting(false);
      console.error('[DataReset] 실패:', e);
      alert('초기화 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen overflow-x-hidden pb-24">
      <main className="mt-4 px-[20px] space-y-[12px]">
        <ProfileSection />

        {/* Jelly Shape Section */}
        <JellyShapeSection />

        {/* Jelly Skin Section */}
        <JellySkinSection />

        {/* Emotion Persistence Section */}
        <EmotionPersistenceSection />

        {/* About Section */}
        <section className="space-y-[8px]">
          <h2 className="font-gowun text-xl font-bold text-primary leading-tight px-2">정보</h2>
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center">
              <span className="font-gowun text-[16px] text-on-surface">버전 정보</span>
              <span className="text-on-surface-variant font-gowun">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
            </div>
            <button
              onClick={() => setShowHelp(true)}
              className="w-full p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer"
            >
              <span className="font-gowun text-[16px] text-on-surface">도움말</span>
              <span className="material-symbols-outlined text-on-surface-variant">help</span>
            </button>
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

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Background Illustration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary-container rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-secondary-container rounded-full blur-[60px]"></div>
      </div>

      {/* 전역 BottomNav (도움말 오픈 시 숨김) */}
      {!showHelp && <BottomNav activeTab="garden" />}
    </div>
  );
}
