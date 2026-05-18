import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// 앱인토스(AIT) 권장 스크린샷 해상도
const AIT_WIDTH = 636;
const AIT_HEIGHT = 1048;

// 스크린샷 저장 경로
const SCREENSHOT_DIR = path.resolve(__dirname, '../assets/store/screenshots');

// 폰트/애니메이션 안정화 대기 시간 (ms)
const SETTLE_TIME = 3000;

// 애니메이션 완료 대기 시간 (ms) - 물리엔진/동적 컴포넌트용
const ANIMATION_SETTLE_TIME = 5000;

// 스크린샷 디렉터리 보장
test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

// 스크린샷 촬영 헬퍼
async function takeScreenshot(
  page: import('@playwright/test').Page,
  filename: string,
) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({
    path: filePath,
    fullPage: false,
    animations: 'disabled',
  });
  console.log(`Screenshot saved: ${filePath}`);
  return filePath;
}

// 페이지 이동 + 안정화 헬퍼
async function navigateAndWait(
  page: import('@playwright/test').Page,
  url: string,
  waitFor?: string,
) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // 폰트 로딩 대기
  await page.waitForFunction(
    () => document.fonts.ready.then(() => true),
    undefined,
    { timeout: 10000 },
  ).catch(() => {
    // 폰트 로딩 타임아웃은 무시
  });

  // 특정 요소 대기 (옵션)
  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 15000 }).catch(() => {
      // 요소 대기 타임아웃은 무시
    });
  }

  // 네트워크 정리 대기
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // networkidle 타임아웃은 무시
  });
}

// ============================================================
// 1. 스플래시 화면
// ============================================================
test('Screenshot 1: Splash screen', async ({ page }) => {
  await navigateAndWait(page, '/');

  // Wait for any content to render (loading state or main content)
  await page.waitForTimeout(SETTLE_TIME);

  await takeScreenshot(
    page,
    `screenshot-01-splash-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
  );
});

// ============================================================
// 2. 홈 화면 (젤리 + 감정 리포트)
// ============================================================
test('Screenshot 2: Home screen with jelly', async ({ page }) => {
  await navigateAndWait(page, '/home');

  // 물리엔진/캔버스 로딩 대기
  await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => {
    // 캔버스가 없으면 폴백
  });

  // 젤리 렌더링 + 애니메이션 안정화 대기
  await page.waitForTimeout(ANIMATION_SETTLE_TIME);

  await page.waitForTimeout(SETTLE_TIME);

  await takeScreenshot(
    page,
    `screenshot-02-home-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
  );
});

// ============================================================
// 3. 감정 입력 화면 (바텀시트)
// ============================================================
test('Screenshot 3: Emotion input screen', async ({ page }) => {
  await navigateAndWait(page, '/home');

  // 물리엔진 로딩 대기
  await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(SETTLE_TIME);

  // "감정 표현하기" 버튼 클릭 (존재하는 경우만)
  const ctaButton = page.getByRole('button', { name: '감정 표현하기' });
  const hasCta = await ctaButton.isVisible().catch(() => false);

  if (hasCta) {
    await ctaButton.click();
    await page.waitForTimeout(1500);
  }

  await page.waitForTimeout(SETTLE_TIME);

  await takeScreenshot(
    page,
    `screenshot-03-emotion-input-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
  );
});

// ============================================================
// 4. 다이어리 타임라인 (캘린더 + 감정 기록)
// ============================================================
test('Screenshot 4: Diary timeline', async ({ page }) => {
  await navigateAndWait(page, '/diary', 'header');

  // 캘린더 렌더링 대기
  const calendar = page.locator('[aria-label="달력"]');
  await expect(calendar).toBeVisible({ timeout: 10000 });

  await page.waitForTimeout(SETTLE_TIME);

  await takeScreenshot(
    page,
    `screenshot-04-diary-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
  );
});

// ============================================================
// 5. 설정/프로필 화면
// ============================================================
test('Screenshot 5: Settings and profile', async ({ page }) => {
  await navigateAndWait(page, '/settings', 'header');

  // 프로필 섹션 렌더링 대기
  const profileSection = page.locator('text=프로필').first();
  await expect(profileSection).toBeVisible({ timeout: 10000 });

  // 젤리 모양 섹션도 보이도록 스크롤
  const jellyShapeSection = page.locator('text=젤리 모양').first();
  if (await jellyShapeSection.isVisible().catch(() => false)) {
    // 젤리 모양 섹션이 뷰포트에 들어오도록 스크롤
    await jellyShapeSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }

  await page.waitForTimeout(SETTLE_TIME);

  await takeScreenshot(
    page,
    `screenshot-05-settings-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
  );

  // 추가: 젤리 모양 선택 화면을 별도 파일로 저장
  // (설정 페이지에서 젤리 모양이 보이도록 스크롤한 상태)
  await takeScreenshot(
    page,
    `screenshot-05b-jelly-shapes-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
  );
});

// ============================================================
// 6. 친구 화면
// ============================================================
test('Screenshot 6: Friends management', async ({ page }) => {
  await navigateAndWait(page, '/friends');

  // 탭 바 렌더링 대기 (h1 대신)
  const tabBar = page.locator('div.bg-surface-container.rounded-full').first();
  await expect(tabBar).toBeVisible({ timeout: 10000 }).catch(() => {});

  await page.waitForTimeout(SETTLE_TIME);

  await takeScreenshot(
    page,
    `screenshot-06-friends-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
  );
});

// ============================================================
// 보너스: 전체 화면 스크린샷 (풀페이지)
// ============================================================
test('Bonus: Full page screenshots for all screens', async ({ page }) => {
  test.setTimeout(120000);
  const screens = [
    { url: '/', name: 'splash', wait: 'body' },
    { url: '/home', name: 'home', wait: 'body' },
    { url: '/diary', name: 'diary', wait: '[aria-label="달력"]' },
    { url: '/settings', name: 'settings', wait: 'text=프로필' },
    { url: '/friends', name: 'friends', wait: 'div.bg-surface-container' },
  ];

  for (const screen of screens) {
    await navigateAndWait(page, screen.url, screen.wait);

    // 캔버스/물리엔진이 있는 화면은 추가 대기
    if (screen.name === 'home') {
      await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(ANIMATION_SETTLE_TIME);
    }

    await page.waitForTimeout(SETTLE_TIME);

    const filePath = path.join(
      SCREENSHOT_DIR,
      `fullpage-${screen.name}-${AIT_WIDTH}x${AIT_HEIGHT}.png`,
    );
    await page.screenshot({
      path: filePath,
      fullPage: true,
      animations: 'disabled',
    });
    console.log(`Full page screenshot saved: ${filePath}`);
  }
});
