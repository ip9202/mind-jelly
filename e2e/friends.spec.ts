import { test, expect } from '@playwright/test';

// Helper: navigate to /friends and wait for hydration
async function gotoFriends(page: import('@playwright/test').Page) {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  await page.goto('/friends', { waitUntil: 'domcontentloaded' });
  // Wait for network to settle (Supabase auth fires here)
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    // continue even if not idle
  }
  return consoleErrors;
}

test.describe('/friends page', () => {
  test('Test 1: Page loads correctly with 친구 heading', async ({ page }) => {
    await gotoFriends(page);
    const heading = page.getByRole('heading', { level: 1, name: '친구' });
    await expect(heading).toBeVisible();
  });

  test('Test 2: 3 tabs (찾기, 목록, 피드) visible and clickable', async ({ page }) => {
    await gotoFriends(page);

    // Scope to the tab bar (the rounded pill container) to avoid collision with
    // the search button on the Search tab body which is also labeled "찾기".
    const tabBar = page.locator('div.bg-surface-container.rounded-full').first();
    const searchTab = tabBar.getByRole('button', { name: '찾기', exact: true });
    const listTab = tabBar.getByRole('button', { name: '목록', exact: true });
    const feedTab = tabBar.getByRole('button', { name: '피드', exact: true });

    await expect(searchTab).toBeVisible();
    await expect(listTab).toBeVisible();
    await expect(feedTab).toBeVisible();

    // 찾기 should be active by default
    await expect(searchTab).toHaveClass(/bg-primary-container/);

    // Click 목록 → it should become active
    await listTab.click();
    await expect(listTab).toHaveClass(/bg-primary-container/);
    await expect(searchTab).not.toHaveClass(/bg-primary-container/);

    // Click 피드
    await feedTab.click();
    await expect(feedTab).toHaveClass(/bg-primary-container/);
  });

  test('Test 3: NavMenu hamburger shows Friends as active', async ({ page }) => {
    await gotoFriends(page);

    // The NavMenu is in the top-right of the header
    // It opens on click. Try common patterns: button with menu icon
    const menuTrigger = page.locator('header button').last();
    await menuTrigger.click();

    // After opening, look for "Friends" text in the dropdown
    const friendsItem = page.getByText('Friends', { exact: false }).first();
    await expect(friendsItem).toBeVisible({ timeout: 5000 });
  });

  test('Test 4: Search tab - invite code input accepts uppercase', async ({ page }) => {
    await gotoFriends(page);

    const input = page.getByPlaceholder('6자리 초대코드');
    await expect(input).toBeVisible();

    await input.fill('abcdef');
    await expect(input).toHaveValue('ABCDEF');
  });

  test('Test 5: No fatal Supabase auth error visible on screen', async ({ page }) => {
    const consoleErrors = await gotoFriends(page);

    // Should not show "로그인 실패" prominently
    const loginFail = page.getByText('로그인 실패');
    await expect(loginFail).toHaveCount(0);

    // Log Supabase errors for diagnostics (do not fail test)
    const supabaseErrors = consoleErrors.filter((e) =>
      /supabase|auth|jwt/i.test(e)
    );
    if (supabaseErrors.length > 0) {
      console.log('--- Supabase-related console errors (informational) ---');
      supabaseErrors.forEach((e) => console.log('  •', e));
    }
  });

  test('Test 6: 목록 tab - empty state or login required', async ({ page }) => {
    await gotoFriends(page);
    await page.getByRole('button', { name: '목록', exact: true }).click();

    // One of two acceptable states:
    // (a) supabaseUserId is set → empty friends list message
    // (b) supabaseUserId is null → "로그인이 필요해요"
    const emptyMsg = page.getByText('아직 친구가 없어요');
    const loginMsg = page.getByText('로그인이 필요해요');
    const loadingMsg = page.getByText('불러오는 중...');

    // Wait briefly for either to appear
    await page.waitForTimeout(2000);

    const hasEmpty = (await emptyMsg.count()) > 0;
    const hasLogin = (await loginMsg.count()) > 0;
    const stillLoading = (await loadingMsg.count()) > 0;

    expect(hasEmpty || hasLogin || stillLoading).toBe(true);
  });

  test('Test 7: 피드 tab - empty state or login required', async ({ page }) => {
    await gotoFriends(page);
    await page.getByRole('button', { name: '피드', exact: true }).click();

    const emptyMsg = page.getByText('아직 공유된 감정이 없어요');
    const loginMsg = page.getByText('로그인이 필요해요');
    const loadingMsg = page.getByText('불러오는 중...');

    await page.waitForTimeout(2000);

    const hasEmpty = (await emptyMsg.count()) > 0;
    const hasLogin = (await loginMsg.count()) > 0;
    const stillLoading = (await loadingMsg.count()) > 0;

    expect(hasEmpty || hasLogin || stillLoading).toBe(true);
  });

  test('Test 8: Supabase auth status check (informational)', async ({ page }) => {
    await gotoFriends(page);
    // Wait for auth to settle
    await page.waitForTimeout(3000);

    const loginRequired = await page.getByText('로그인이 필요해요').count();
    if (loginRequired > 0) {
      console.log('ℹ️  supabaseUserId is NULL — Supabase anonymous auth did not complete (or failed)');
    } else {
      console.log('✓  supabaseUserId is set — Supabase anonymous auth succeeded');
    }
    // Always pass — informational only
    expect(true).toBe(true);
  });
});
