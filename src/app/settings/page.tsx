'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavMenu from '@/components/layout/NavMenu';
import { getMyProfile, setNickname } from '@/lib/supabase/db';
import { diaryStore } from '@/stores/diaryStore';
import { jellyStore } from '@/stores/jellyStore';
import { JELLY_SHAPE_CONFIGS } from '@/lib/constants/jellyShapes';
import type { JellyShape } from '@/types/physics';

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
      <h2 className="font-dongle text-5xl text-primary leading-none px-2">프로필</h2>
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
            <span className="font-dongle text-3xl text-primary tracking-[0.2em]">
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

  // objectBoundingBox 0~1 path를 viewBox 0~100 path로 변환
  const scalePath = (path: string) =>
    path.replace(/(\d+\.\d+)/g, (n) => String(parseFloat(n) * 100));

  const shapes = Object.keys(JELLY_SHAPE_CONFIGS) as JellyShape[];

  return (
    <section className="space-y-[8px]">
      <h2 className="font-dongle text-5xl text-primary leading-none px-2">젤리 모양</h2>
      <div className="glass-card rounded-lg p-[24px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40">
        <div className="grid grid-cols-3 gap-[12px]">
          {shapes.map((shape) => {
            const config = JELLY_SHAPE_CONFIGS[shape];
            const isSelected = jellyShape === shape;
            return (
              <button
                key={shape}
                onClick={() => setJellyShape(shape)}
                aria-label={`젤리 모양: ${config.label}`}
                aria-pressed={isSelected}
                className={`flex flex-col items-center gap-[6px] p-[12px] rounded-xl transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary-container ring-2 ring-primary'
                    : 'bg-surface-container/50 hover:bg-surface-container'
                }`}
              >
                <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden>
                  <path
                    d={scalePath(config.path)}
                    fill={isSelected ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'}
                    opacity={isSelected ? 0.85 : 0.4}
                  />
                </svg>
                <span
                  className={`font-gowun text-[13px] ${
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
          젤리의 기본 모양을 선택해보세요
        </p>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen overflow-x-hidden">
      {/* Top AppBar */}
      <header className="bg-surface/85 backdrop-blur-[8px] fixed top-0 left-0 z-40 w-full">
        <div className="flex justify-between items-center w-full px-[20px] h-16">
          <Link href="/home" className="text-primary hover:opacity-80 transition-opacity flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-dongle text-5xl text-primary tracking-tight leading-none">설정</h1>
          <NavMenu activeTab="garden" />
        </div>
      </header>

      <main className="mt-20 px-[20px] space-y-[12px]">
        <ProfileSection />

        {/* Jelly Shape Section */}
        <JellyShapeSection />

        {/* Notifications Section */}
        <section className="space-y-[8px]">
          <h2 className="font-dongle text-5xl text-primary leading-none px-2">알림</h2>
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">데일리 리마인더</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">스트레스 분석 알림</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
            <div className="p-[16px] flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">방해 금지 모드</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-[8px]">
          <h2 className="font-dongle text-5xl text-primary leading-none px-2">정보</h2>
          <div className="glass-card rounded-lg shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden">
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center">
              <span className="font-gowun text-[16px] text-on-surface">버전 정보</span>
              <span className="text-on-surface-variant font-gowun">v1.2.4</span>
            </div>
            <div className="p-[16px] border-b border-white/40 flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer">
              <span className="font-gowun text-[16px] text-on-surface">도움말</span>
              <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
            </div>
            <div className="p-[16px] flex justify-between items-center hover:bg-white/40 transition-colors cursor-pointer text-error">
              <span className="font-gowun text-[16px]">데이터 초기화</span>
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
          </div>
        </section>

        {/* Decorative Element */}
        <div className="pt-[32px] flex flex-col items-center opacity-40">
          <span className="material-symbols-outlined text-[32px] text-primary mb-2">bubble_chart</span>
          <p className="font-dongle text-2xl text-primary">Mind Jelly with Love</p>
        </div>
      </main>

      {/* Background Illustration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-primary-container rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-secondary-container rounded-full blur-[60px]"></div>
      </div>
    </div>
  );
}
