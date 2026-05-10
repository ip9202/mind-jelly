'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavMenu from '@/components/layout/NavMenu';
import { getMyProfile, setNickname } from '@/lib/supabase/db';
import { diaryStore } from '@/stores/diaryStore';
import { jellyStore } from '@/stores/jellyStore';

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

        {/* Jelly Appearance Section */}
        <section className="space-y-[8px]">
          <h2 className="font-dongle text-5xl text-primary leading-none px-2">색상 테마</h2>
          <div className="glass-card rounded-lg p-[24px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-white/40">
            <div className="flex items-center gap-[24px]">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="w-20 h-20 bg-jelly-base rounded-full blur-[2px] jelly-float shadow-[inset_-4px_-8px_15px_rgba(255,255,255,0.6),0_8px_15px_rgba(0,0,0,0.05)] relative overflow-hidden">
                  <div className="absolute top-1/3 left-1/4 w-2 h-1.5 bg-on-primary-container rounded-full opacity-60"></div>
                  <div className="absolute top-1/3 right-1/4 w-2 h-1.5 bg-on-primary-container rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-on-primary-container/40 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-[16px] flex-1">
                <button className="w-10 h-10 rounded-full bg-jelly-base ring-4 ring-primary-container border-2 border-white shadow-sm"></button>
                <button className="w-10 h-10 rounded-full bg-jelly-tired border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-secondary-container border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-jelly-sad border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-tertiary-fixed border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
                <button className="w-10 h-10 rounded-full bg-jelly-anger border-2 border-white shadow-sm hover:scale-105 transition-transform"></button>
              </div>
            </div>
            <p className="text-on-surface-variant mt-[16px] text-center font-gamja text-lg">젤리의 기분에 맞춰 색상을 변경해보세요</p>
          </div>
        </section>

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
