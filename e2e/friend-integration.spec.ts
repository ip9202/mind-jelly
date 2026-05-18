import { test, expect, type Browser, type Page, type BrowserContext } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qvtyguimflzcaxhleupb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dHlndWltZmx6Y2F4aGxldXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY1MTAsImV4cCI6MjA5NDU3MjUxMH0.RkZSKTHXRpRDQYTwIL6cpg_TJD5JcxF3Jws3wk-TzNE';
const STORAGE_KEY = 'sb-qvtyguimflzcaxhleupb-auth-token';

type TestUser = { context: BrowserContext; page: Page; inviteCode: string; supabase: SupabaseClient; userId: string };

async function signInWithRetry(supabase: SupabaseClient) {
  for (let i = 0; i < 10; i++) {
    const result = await supabase.auth.signInAnonymously();
    if (!result.error) return result.data;
    if (result.error.message.includes('rate limit') || result.error.message.includes('429')) {
      await new Promise(r => setTimeout(r, 5000 * (i + 1)));
      continue;
    }
    throw new Error(`Auth failed: ${result.error.message}`);
  }
  throw new Error('Auth failed after retries');
}

async function createTestUser(browser: Browser, label: string): Promise<TestUser> {
  const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const authData = await signInWithRetry(supabase);
  if (!authData.user) throw new Error('Auth returned no user');

  const userId = authData.user.id;
  const session = authData.session!;

  await supabase.from('users').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

  const { data: profile } = await supabase.from('users').select('invite_code').eq('id', userId).single();
  let inviteCode = profile?.invite_code;
  if (!inviteCode) {
    inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    await supabase.from('users').update({ invite_code: inviteCode }).eq('id', userId);
  }

  // nickname UNIQUE 제약 회피: 타임스탬프 기반 고유 닉네임
  const nickname = `e2e_${label}_${Date.now().toString(36)}`;
  const { error: nickErr } = await supabase.from('users').update({
    nickname,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (nickErr) throw new Error(`nickname update failed: ${nickErr.message}`);

  const context = await browser.newContext({
    viewport: { width: 393, height: 851 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  const sessionPayload = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type ?? 'bearer',
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    user: session.user,
  };

  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: STORAGE_KEY, value: sessionPayload });

  await page.goto('/friends', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('6자리 초대코드').waitFor({ state: 'visible', timeout: 30000 });

  // BridgeInitializer hydration 완료 대기
  await page.waitForTimeout(3000);

  // 리다이렉트 확인: 온보딩으로 이동했으면 실패
  const currentUrl = page.url();
  if (!currentUrl.includes('/friends')) {
    throw new Error(`Redirected away from /friends to ${currentUrl}. Profile lookup likely failed (RLS or session issue).`);
  }

  // 최종 확인
  const inputVisible = await page.getByPlaceholder('6자리 초대코드').isVisible().catch(() => false);
  if (!inputVisible) {
    throw new Error(`Search input not visible after settling. URL: ${page.url()}. Page text: ${await page.locator('body').innerText().catch(() => 'N/A')}`);
  }

  return { context, page, inviteCode: inviteCode.toUpperCase(), supabase, userId };
}

async function searchFriend(page: Page, code: string) {
  await page.getByPlaceholder('6자리 초대코드').fill(code);
  await page.getByRole('button', { name: '찾기' }).last().click();
  await page.waitForTimeout(5000);
}

async function switchTab(page: Page, tabName: string) {
  const tab = page.getByRole('button', { name: tabName, exact: true });
  await tab.waitFor({ state: 'visible', timeout: 10000 });
  await tab.click();
  await page.waitForTimeout(2000);
}

// ============================================================
// 단일 테스트: 전체 친구 플로우
// (page reload/redirect 이슈 때문에 모든 시나리오를 하나의
//  라이프사이클에서 실행)
// ============================================================
test('친구 통합 테스트 전체 플로우', async ({ browser }) => {
  test.setTimeout(300000);

  // 사용자 4명 생성 (rate limit 회피 위해 3초 간격)
  const userA = await createTestUser(browser, 'A');
  await new Promise(r => setTimeout(r, 3000));
  const userB = await createTestUser(browser, 'B');
  await new Promise(r => setTimeout(r, 3000));
  const userC = await createTestUser(browser, 'C');
  await new Promise(r => setTimeout(r, 3000));
  const userD = await createTestUser(browser, 'D');

  try {
    // ============================================================
    // 1. 기본 인증 + 온보딩 확인
    // ============================================================
    expect(userA.inviteCode).toBeTruthy();
    expect(userA.inviteCode.length).toBe(6);
    await expect(userA.page.getByPlaceholder('6자리 초대코드')).toBeVisible({ timeout: 10000 });

    // ============================================================
    // 2. 전체 친구 플로우 (검색→신청→수락→확인→삭제)
    // ============================================================
    // A가 B 검색
    await searchFriend(userA.page, userB.inviteCode);
    await expect(userA.page.locator('p').filter({ hasText: userB.inviteCode })).toBeVisible({ timeout: 10000 });

    // A가 B에게 친구 신청
    const addBtn = userA.page.getByRole('button', { name: '친구 추가' });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();
    await expect(userA.page.getByText('요청 중...')).toBeVisible({ timeout: 10000 });

    // B가 수락: B의 페이지 새로고침 후 받은 요청 확인
    await userB.page.reload({ waitUntil: 'domcontentloaded' });
    await userB.page.waitForTimeout(3000);
    await switchTab(userB.page, '목록');
    const acceptBtn = userB.page.getByRole('button', { name: '수락' });
    await expect(acceptBtn.first()).toBeVisible({ timeout: 15000 });
    await acceptBtn.first().click();
    await userB.page.waitForTimeout(3000);

    const deleteButtonsB = userB.page.locator('button[aria-label$="삭제"]');
    expect(await deleteButtonsB.count()).toBeGreaterThanOrEqual(1);

    // A가 친구 목록에서 B 확인
    await switchTab(userA.page, '목록');
    const deleteButtonsA = userA.page.locator('button[aria-label$="삭제"]');
    expect(await deleteButtonsA.count()).toBeGreaterThanOrEqual(1);

    // B가 친구 삭제
    await deleteButtonsB.first().click();
    await userB.page.waitForTimeout(500);
    const dialog = userB.page.getByText(/님과 친구를 끊을까요?/);
    await expect(dialog).toBeVisible();
    await userB.page.getByRole('button', { name: '확인' }).click();
    await userB.page.waitForTimeout(3000);
    await expect(dialog).not.toBeVisible();

    // 피드 탭 확인
    await switchTab(userA.page, '피드');
    await expect(userA.page.getByText('친구 감정 피드')).toBeVisible({ timeout: 5000 });

    // ============================================================
    // 3. 친구 요청 거절
    // ============================================================
    await searchFriend(userC.page, userD.inviteCode);
    const addBtn2 = userC.page.getByRole('button', { name: '친구 추가' });
    await expect(addBtn2).toBeVisible({ timeout: 10000 });
    await addBtn2.click();
    await expect(userC.page.getByText('요청 중...')).toBeVisible({ timeout: 10000 });

    // D가 거절: D의 페이지 새로고침 후 받은 요청 확인
    await userD.page.reload({ waitUntil: 'domcontentloaded' });
    await userD.page.waitForTimeout(3000);
    await switchTab(userD.page, '목록');
    const rejectBtn = userD.page.getByRole('button', { name: '거절' });
    await expect(rejectBtn.first()).toBeVisible({ timeout: 15000 });
    await rejectBtn.first().click();
    await userD.page.waitForTimeout(3000);

    const remainingReject = userD.page.getByRole('button', { name: '거절' });
    const rejectCount = await remainingReject.count();
    const hasEmpty = await userD.page.getByText('아직 받은 요청이 없어요').isVisible().catch(() => false);
    expect(rejectCount === 0 || hasEmpty).toBe(true);

    // ============================================================
    // 4. 자기 자신의 초대코드로 검색
    // ============================================================
    await switchTab(userA.page, '찾기');
    await userA.page.getByPlaceholder('6자리 초대코드').fill('');
    await searchFriend(userA.page, userA.inviteCode);
    await expect(userA.page.getByText('본인은 추가할 수 없어요')).toBeVisible({ timeout: 10000 });

    // ============================================================
    // 5. 존재하지 않는 코드 검색
    // ============================================================
    await userA.page.getByPlaceholder('6자리 초대코드').fill('');
    await searchFriend(userA.page, 'ZZZZZZ');
    await expect(userA.page.getByText('해당 초대코드의 친구를 찾을 수 없어요')).toBeVisible({ timeout: 10000 });

    // ============================================================
    // 6. 초대코드 복사
    // ============================================================
    const copyBtn = userA.page.getByRole('button', { name: /복사/ });
    await expect(copyBtn).toBeVisible({ timeout: 10000 });
    await copyBtn.click();
    await userA.page.waitForTimeout(500);

    await expect(userA.page.getByText('복사됨!')).toBeVisible({ timeout: 3000 });

  } finally {
    await userA.context.close().catch(() => {});
    await userB.context.close().catch(() => {});
    await userC.context.close().catch(() => {});
    await userD.context.close().catch(() => {});
  }
});
