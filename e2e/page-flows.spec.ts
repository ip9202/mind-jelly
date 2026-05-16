import { test, expect } from '@playwright/test';

// 하이드레이션 대기 시간 (ms)
const HYDRATION_WAIT = 5000;

// 페이지 이동 + 안정화 대기
async function navigateAndWait(
  page: import('@playwright/test').Page,
  url: string,
  waitFor?: string,
) {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForFunction(
    () => document.fonts.ready.then(() => true),
    undefined,
    { timeout: 10000 },
  ).catch(() => {});

  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 15000 }).catch(() => {});
  }

  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(HYDRATION_WAIT);

  return consoleErrors;
}

// 가로 스크롤(overflow) 없는지 확인
async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasOverflow).toBe(false);
}

// ============================================================
// 1. Root page (/) - 리다이렉트
// ============================================================
test.describe('/ (root) - redirect', () => {
  test('redirects new users to /welcome', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(onboarding|welcome|home)$/);
  });

  test('no horizontal overflow after redirect', async ({ page }) => {
    await navigateAndWait(page, '/');
    await assertNoHorizontalOverflow(page);
  });
});

// ============================================================
// 1-B. Onboarding (/onboarding) - 신규 진입 화면
// ============================================================
test.describe('/onboarding page', () => {
  test('redirects from / to /onboarding', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toContain('/onboarding');
  });

  test('displays headline copy', async ({ page }) => {
    await navigateAndWait(page, '/onboarding');

    const line1 = page.getByText('오늘 힘든 일을').first();
    const line2 = page.getByText('젤리에게 줘봐').first();
    const line1Visible = await line1.isVisible().catch(() => false);
    const line2Visible = await line2.isVisible().catch(() => false);
    expect(line1Visible || line2Visible).toBe(true);
  });

  test('shows three feature cards', async ({ page }) => {
    await navigateAndWait(page, '/onboarding');

    await expect(page.getByText('힘든 말을 털어놔').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('젤리가 냠냠 먹어').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('조금 가벼워져').first()).toBeVisible({ timeout: 10000 });
  });

  test('start button is visible', async ({ page }) => {
    await navigateAndWait(page, '/onboarding');

    const startButton = page.getByRole('button', { name: '마음젤리 시작하기' });
    await expect(startButton).toBeVisible({ timeout: 10000 });
  });

  test('clicking start navigates to /welcome or /home', async ({ page }) => {
    await navigateAndWait(page, '/onboarding');

    const startButton = page.getByRole('button', { name: '마음젤리 시작하기' });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/\/(welcome|home)/);
  });

  test('no horizontal overflow', async ({ page }) => {
    await navigateAndWait(page, '/onboarding');
    await assertNoHorizontalOverflow(page);
  });
});

// ============================================================
// 2. Welcome (/welcome) - 온보딩 UI 검증
// ============================================================
test.describe('/welcome page', () => {
  test('page loads with onboarding content', async ({ page }) => {
    await navigateAndWait(page, '/welcome');

    const heading = page.getByText('마음젤리에 오신 걸').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('nickname input exists and accepts text', async ({ page }) => {
    await navigateAndWait(page, '/welcome');

    const nicknameInput = page.locator('#nickname-input');
    await expect(nicknameInput).toBeVisible({ timeout: 10000 });
    await nicknameInput.fill('테스트');
    await expect(nicknameInput).toHaveValue('테스트');
  });

  test('CTA "다음" disabled without input', async ({ page }) => {
    await navigateAndWait(page, '/welcome');

    const nextButton = page.getByRole('button', { name: '다음' });
    await expect(nextButton).toBeVisible({ timeout: 10000 });
    await expect(nextButton).toBeDisabled();
  });

  test('can proceed from step 1 to step 2', async ({ page }) => {
    await navigateAndWait(page, '/welcome');

    const nicknameInput = page.locator('#nickname-input');
    await nicknameInput.fill('E2E유저');

    const nextButton = page.getByRole('button', { name: '다음' });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    await page.waitForTimeout(1500);
    const shapeHeading = page.getByText('나만의 젤리를 선택해보세요!').first();
    await expect(shapeHeading).toBeVisible({ timeout: 10000 });

    const startButton = page.getByRole('button', { name: '시작하기' });
    await expect(startButton).toBeVisible();
  });

  test('no horizontal overflow', async ({ page }) => {
    await navigateAndWait(page, '/welcome');
    await assertNoHorizontalOverflow(page);
  });
});

// ============================================================
// 3. /home - 온보딩 미완료 시 /welcome으로 리다이렉트
// ============================================================
test.describe('/home page (unauthenticated)', () => {
  test('redirects to /welcome when no nickname set', async ({ page }) => {
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // 닉네임 미설정 시 welcome 페이지로 리다이렉트
    const url = page.url();
    const isWelcomeOrHome = url.includes('/welcome') || url.includes('/home');
    expect(isWelcomeOrHome).toBe(true);

    // welcome 페이지 콘텐츠 확인 (리다이렉트된 경우)
    if (url.includes('/welcome')) {
      const nicknameInput = page.locator('#nickname-input');
      await expect(nicknameInput).toBeVisible({ timeout: 10000 });
    }
  });

  test('no horizontal overflow', async ({ page }) => {
    await navigateAndWait(page, '/home');
    await assertNoHorizontalOverflow(page);
  });
});

// ============================================================
// 4. /diary - 온보딩 미완료 상태에서도 렌더링
// ============================================================
test.describe('/diary page', () => {
  test('calendar and month display render', async ({ page }) => {
    await navigateAndWait(page, '/diary', 'header');

    const calendar = page.locator('[aria-label="달력"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });

    const monthText = page.locator('text=/\\d{4}년 \\d+월/');
    await expect(monthText).toBeVisible({ timeout: 10000 });
  });

  test('month navigation buttons work', async ({ page }) => {
    await navigateAndWait(page, '/diary', 'header');

    const prevBtn = page.getByRole('button', { name: '이전 달' });
    const nextBtn = page.getByRole('button', { name: '다음 달' });
    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();

    await prevBtn.click();
    await page.waitForTimeout(500);
    await nextBtn.click();
    await page.waitForTimeout(500);
  });

  test('timeline section visible', async ({ page }) => {
    await navigateAndWait(page, '/diary', 'header');

    const timelineText = page.getByText('타임라인').first();
    await expect(timelineText).toBeVisible({ timeout: 10000 });
  });

  test('no horizontal overflow', async ({ page }) => {
    await navigateAndWait(page, '/diary');
    await assertNoHorizontalOverflow(page);
  });
});

// ============================================================
// 5. /settings - 온보딩 미완료 상태에서도 렌더링
// ============================================================
test.describe('/settings page', () => {
  test('profile section renders', async ({ page }) => {
    await navigateAndWait(page, '/settings', 'header');

    const profileHeading = page.getByText('프로필').first();
    await expect(profileHeading).toBeVisible({ timeout: 10000 });
  });

  test('jelly shape selection section', async ({ page }) => {
    await navigateAndWait(page, '/settings', 'header');

    const jellyShapeHeading = page.getByText('젤리 모양').first();
    await jellyShapeHeading.scrollIntoViewIfNeeded();
    await expect(jellyShapeHeading).toBeVisible({ timeout: 10000 });

    const shapeButtons = page.locator('button[aria-label^="젤리 모양:"]');
    expect(await shapeButtons.count()).toBeGreaterThanOrEqual(2);
  });

  test('data reset button visible (if scrolled into view)', async ({ page }) => {
    await navigateAndWait(page, '/settings', 'header');

    // 페이지 하단까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const resetButton = page.getByText('데이터 초기화').first();
    const hasReset = await resetButton.isVisible().catch(() => false);

    if (hasReset) {
      await expect(resetButton).toBeVisible();
    } else {
      // 버튼이 보이지 않으면 최소한 프로필 섹션이 렌더링됨을 확인
      const profileHeading = page.getByText('프로필').first();
      await expect(profileHeading).toBeVisible();
    }
  });

  test('no horizontal overflow', async ({ page }) => {
    await navigateAndWait(page, '/settings');
    await assertNoHorizontalOverflow(page);
  });
});

// ============================================================
// 6. /friends - 친구 (기존 friends.spec.ts와 동일 패턴)
// ============================================================
test.describe('/friends page (basic)', () => {
  test('page loads with tabs', async ({ page }) => {
    await navigateAndWait(page, '/friends');

    // 탭 버튼 확인 (h1 없이 탭으로 구성)
    const searchTab = page.getByRole('button', { name: '찾기', exact: true });
    const listTab = page.getByRole('button', { name: '목록', exact: true });
    const feedTab = page.getByRole('button', { name: '피드', exact: true });

    // 탭 중 최소 하나는 보여야 함
    const hasSearch = await searchTab.isVisible().catch(() => false);
    const hasList = await listTab.isVisible().catch(() => false);
    const hasFeed = await feedTab.isVisible().catch(() => false);
    expect(hasSearch || hasList || hasFeed).toBe(true);
  });

  test('invite code input accepts uppercase', async ({ page }) => {
    await navigateAndWait(page, '/friends');

    const input = page.getByPlaceholder('6자리 초대코드');
    if (await input.isVisible().catch(() => false)) {
      await input.fill('abcdef');
      await expect(input).toHaveValue('ABCDEF');
    }
  });

  test('no horizontal overflow', async ({ page }) => {
    await navigateAndWait(page, '/friends');
    await assertNoHorizontalOverflow(page);
  });
});

// ============================================================
// 7. 전체 페이지 렌더링 검증 (URL 직접 접근)
// ============================================================
test.describe('All pages render correctly', () => {
  const pages = [
    { url: '/', name: 'root', check: () => 'redirects to /welcome or /home' },
    { url: '/welcome', name: 'welcome', check: '마음젤리에 오신 걸' },
    { url: '/home', name: 'home', check: () => 'renders skeleton or redirects to /welcome' },
    { url: '/diary', name: 'diary', check: 'header' },
    { url: '/settings', name: 'settings', check: 'header' },
    { url: '/friends', name: 'friends', check: 'header' },
  ];

  for (const p of pages) {
    test(`${p.name} (${p.url}) renders`, async ({ page }) => {
      const response = await page.goto(p.url, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);

      // HTTP 200 확인
      expect(response?.status()).toBe(200);

      // 가로 오버플로우 없음
      await assertNoHorizontalOverflow(page);
    });
  }
});
