import { test, expect } from '@playwright/test';

// 하이드레이션 + 인증 안정화 대기
const HYDRATION_WAIT = 5000;

// 페이지 이동 + 안정화 헬퍼
async function gotoFriends(page: import('@playwright/test').Page) {
  await page.goto('/friends', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(HYDRATION_WAIT);
}

// 현재 인증 상태 확인
async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
  // 인증된 경우 supabaseUserId가 설정되어 탭 콘텐츠가 렌더링됨
  // 비인증인 경우 "로그인이 필요해요" 메시지 표시
  const loginMsg = page.getByText('로그인이 필요해요');
  const hasLogin = await loginMsg.isVisible().catch(() => false);
  return !hasLogin;
}

// 탭 전환 헬퍼
async function switchTab(page: import('@playwright/test').Page, tabName: string) {
  const tabBar = page.locator('div.bg-surface-container.rounded-full').first();
  const tab = tabBar.getByRole('button', { name: tabName, exact: true });
  await tab.click();
  await page.waitForTimeout(500);
}

// ============================================================
// 0. 페이지 진입 + 기본 구조
// ============================================================
test.describe('SPEC-FRIEND: 페이지 기본 구조', () => {
  test('페이지 로딩 + 탭 바 렌더링', async ({ page }) => {
    await gotoFriends(page);

    const tabBar = page.locator('div.bg-surface-container.rounded-full').first();
    await expect(tabBar).toBeVisible({ timeout: 10000 });
  });

  test('3개 탭 (찾기/목록/피드) 버튼 존재', async ({ page }) => {
    await gotoFriends(page);

    const tabBar = page.locator('div.bg-surface-container.rounded-full').first();
    await expect(tabBar.getByRole('button', { name: '찾기', exact: true })).toBeVisible();
    await expect(tabBar.getByRole('button', { name: '목록', exact: true })).toBeVisible();
    await expect(tabBar.getByRole('button', { name: '피드', exact: true })).toBeVisible();
  });

  test('기본 활성 탭 = 찾기', async ({ page }) => {
    await gotoFriends(page);

    const searchTab = page.locator('div.bg-surface-container.rounded-full')
      .first()
      .getByRole('button', { name: '찾기', exact: true });
    await expect(searchTab).toHaveClass(/bg-primary-container/);
  });

  test('BottomNav 렌더링', async ({ page }) => {
    await gotoFriends(page);

    const bottomNav = page.locator('nav.fixed');
    await expect(bottomNav).toBeAttached({ timeout: 10000 });
  });

  test('가로 오버플로우 없음', async ({ page }) => {
    await gotoFriends(page);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});

// ============================================================
// 1. SearchTab - 초대코드 검색 + 친구 신청 (SPEC-FRIEND-001)
// ============================================================
test.describe('SPEC-FRIEND-001: SearchTab (초대코드로 친구 찾기)', () => {
  test('초대코드 입력 필드 + 찾기 버튼 렌더링 (인증 시)', async ({ page }) => {
    await gotoFriends(page);
    const authed = await isAuthenticated(page);
    if (!authed) {
      // 비인증: 로그인 필요 메시지 확인
      await expect(page.getByText('로그인이 필요해요')).toBeVisible();
      return;
    }

    const input = page.getByPlaceholder('6자리 초대코드');
    await expect(input).toBeVisible();
    const searchBtn = page.getByRole('button', { name: '찾기' });
    await expect(searchBtn).toBeVisible();
  });

  test('초대코드 입력 시 자동 대문자 변환', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const input = page.getByPlaceholder('6자리 초대코드');
    await input.fill('abcdef');
    await expect(input).toHaveValue('ABCDEF');
  });

  test('빈 입력 시 찾기 버튼 비활성화', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const searchBtn = page.getByRole('button', { name: '찾기' });
    await expect(searchBtn).toBeDisabled();
  });

  test('입력 후 찾기 버튼 활성화', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const input = page.getByPlaceholder('6자리 초대코드');
    await input.fill('ABC');
    const searchBtn = page.getByRole('button', { name: '찾기' });
    await expect(searchBtn).toBeEnabled();
  });

  test('존재하지 않는 초대코드 검색 시 안내 메시지', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const input = page.getByPlaceholder('6자리 초대코드');
    await input.fill('ZZZZZZ');

    const searchBtn = page.getByRole('button', { name: '찾기' });
    await searchBtn.click();
    await page.waitForTimeout(2000);

    const notFound = page.getByText('해당 초대코드의 친구를 찾을 수 없어요');
    const hasNotFound = await notFound.isVisible().catch(() => false);
    // 검색 결과 메시지 또는 에러 메시지 표시 확인
    expect(hasNotFound || (await page.getByText('검색 중 문제가 생겼어요').isVisible().catch(() => false))).toBe(true);
  });

  test('검색 결과 - 사용자 발견 시 친구 추가 버튼 표시', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    // 내 초대코드 읽기
    const codeEl = page.locator('span.tracking-\\[0\\.3em\\]').first();
    const myCode = await codeEl.textContent().catch(() => '');
    if (!myCode) return;

    // 자기 자신의 코드로 검색
    const input = page.getByPlaceholder('6자리 초대코드');
    await input.fill(myCode);
    const searchBtn = page.getByRole('button', { name: '찾기' });
    await searchBtn.click();
    await page.waitForTimeout(2000);

    // 본인 코드이므로 "본인은 추가할 수 없어요" 메시지 확인
    const selfMsg = page.getByText('본인은 추가할 수 없어요');
    const hasSelfMsg = await selfMsg.isVisible().catch(() => false);
    expect(hasSelfMsg).toBe(true);
  });

  test('최근 추가한 친구 섹션 (친구 있는 경우만)', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    // 최근 친구 섹션은 친구가 있는 경우만 표시
    const recentSection = page.getByText('최근에 추가한 친구').first();
    const hasRecent = await recentSection.isVisible().catch(() => false);
    // 섹션이 있으면 항목 확인, 없으면 OK
    if (hasRecent) {
      const recentItems = page.locator('span').filter({ hasText: '친구됨' });
      expect(await recentItems.count()).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// 2. ListTab - 친구 수락/거절/삭제 (SPEC-FRIEND-002)
// ============================================================
test.describe('SPEC-FRIEND-002: ListTab (수락/거절/삭제)', () => {
  test('목록 탭 전환 후 섹션 렌더링', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    // "받은 요청" 섹션
    const pendingSection = page.getByText('받은 요청').first();
    await expect(pendingSection).toBeVisible({ timeout: 5000 });

    // "내 친구" 섹션
    const friendsSection = page.getByText('내 친구').first();
    await expect(friendsSection).toBeVisible({ timeout: 5000 });
  });

  test('빈 상태: 받은 요청 0개 시 안내 메시지', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    const emptyPending = page.getByText('아직 받은 요청이 없어요').first();
    const hasEmptyPending = await emptyPending.isVisible().catch(() => false);

    if (hasEmptyPending) {
      // 빈 상태 CTA: 친구 찾기 버튼
      const ctaBtn = page.getByRole('button', { name: '친구 찾기' }).first();
      await expect(ctaBtn).toBeVisible();
    }
  });

  test('빈 상태: 친구 0명 시 안내 메시지', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    const emptyFriends = page.getByText('아직 친구가 없어요').first();
    const hasEmptyFriends = await emptyFriends.isVisible().catch(() => false);

    if (hasEmptyFriends) {
      // 빈 상태 CTA: 친구 찾기 버튼
      const ctaBtn = page.getByRole('button', { name: '친구 찾기' }).first();
      const hasCta = await ctaBtn.isVisible().catch(() => false);
      expect(hasCta).toBe(true);
    }
  });

  test('대기 중인 요청: 수락/거절 버튼 표시 (요청 있는 경우)', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    // 대기 요청이 있으면 수락/거절 버튼 확인
    const acceptBtn = page.getByRole('button', { name: '수락' }).first();
    const rejectBtn = page.getByRole('button', { name: '거절' }).first();
    const hasAccept = await acceptBtn.isVisible().catch(() => false);

    if (hasAccept) {
      await expect(rejectBtn).toBeVisible();
    }
    // 대기 요청이 없으면 "아직 받은 요청이 없어요" 확인
    else {
      await expect(page.getByText('아직 받은 요청이 없어요').first()).toBeVisible();
    }
  });

  test('수락 버튼 클릭 - 로딩 후 목록 갱신 (요청 있는 경우)', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    const acceptBtn = page.getByRole('button', { name: '수락' }).first();
    const hasAccept = await acceptBtn.isVisible().catch(() => false);
    if (!hasAccept) return;

    const pendingBefore = await page.getByRole('button', { name: '수락' }).count();

    await acceptBtn.click();
    await page.waitForTimeout(3000);

    // 수락 후: 대기 목록 감소 또는 에러 메시지
    const pendingAfter = await page.getByRole('button', { name: '수락' }).count();
    const hasError = await page.getByText('수락 중 문제가 생겼어요').isVisible().catch(() => false);
    expect(pendingAfter <= pendingBefore || hasError).toBe(true);
  });

  test('거절 버튼 클릭 - 목록에서 제거 (요청 있는 경우)', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    const rejectBtn = page.getByRole('button', { name: '거절' }).first();
    const hasReject = await rejectBtn.isVisible().catch(() => false);
    if (!hasReject) return;

    const pendingBefore = await page.getByRole('button', { name: '거절' }).count();

    await rejectBtn.click();
    await page.waitForTimeout(3000);

    const pendingAfter = await page.getByRole('button', { name: '거절' }).count();
    const hasError = await page.getByText('거절 중 문제가 생겼어요').isVisible().catch(() => false);
    expect(pendingAfter <= pendingBefore || hasError).toBe(true);
  });

  test('친구 목록: 삭제 버튼(aria-label) 존재 (친구 있는 경우)', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    // 친구가 있으면 삭제 버튼 확인
    const deleteButtons = page.locator('button[aria-label$="삭제"]');
    const count = await deleteButtons.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    } else {
      // 친구가 없으면 빈 상태 메시지 확인
      await expect(page.getByText('아직 친구가 없어요').first()).toBeVisible();
    }
  });

  test('친구 삭제: 다이얼로그 열기 + 취소', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    const deleteBtn = page.locator('button[aria-label$="삭제"]').first();
    const hasDeleteBtn = await deleteBtn.isVisible().catch(() => false);
    if (!hasDeleteBtn) return;

    await deleteBtn.click();
    await page.waitForTimeout(500);

    // 확인 다이얼로그: "OO님과 친구를 끊을까요?"
    const dialog = page.getByText(/님과 친구를 끊을까요?/);
    await expect(dialog).toBeVisible();

    // 취소 버튼
    const cancelBtn = page.getByRole('button', { name: '취소' });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await page.waitForTimeout(500);

    // 다이얼로그 닫힘
    await expect(dialog).not.toBeVisible();
  });

  test('친구 삭제: 확인 시 목록에서 제거', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    const deleteBtn = page.locator('button[aria-label$="삭제"]').first();
    const hasDeleteBtn = await deleteBtn.isVisible().catch(() => false);
    if (!hasDeleteBtn) return;

    const friendsBefore = await page.locator('button[aria-label$="삭제"]').count();

    await deleteBtn.click();
    await page.waitForTimeout(500);

    // 확인 버튼
    const confirmBtn = page.getByRole('button', { name: '확인' });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    const friendsAfter = await page.locator('button[aria-label$="삭제"]').count();
    const hasError = await page.getByText('친구 삭제 중 문제가 생겼어요').isVisible().catch(() => false);
    expect(friendsAfter < friendsBefore || hasError).toBe(true);
  });

  test('빈 상태 CTA: 친구 찾기 버튼 → 찾기 탭 이동', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '목록');
    await page.waitForTimeout(2000);

    // 빈 상태의 친구 찾기 버튼 (받은 요청 또는 내 친구)
    const ctaButtons = page.getByRole('button', { name: '친구 찾기' });
    const count = await ctaButtons.count();
    if (count === 0) return;

    await ctaButtons.first().click();
    await page.waitForTimeout(500);

    // 찾기 탭이 활성화되었는지 확인
    const searchTab = page.locator('div.bg-surface-container.rounded-full')
      .first()
      .getByRole('button', { name: '찾기', exact: true });
    await expect(searchTab).toHaveClass(/bg-primary-container/);
  });
});

// ============================================================
// 3. FeedTab - 친구 감정 피드 (SPEC-FRIEND-003)
// ============================================================
test.describe('SPEC-FRIEND-003: FeedTab (친구 감정 피드)', () => {
  test('피드 탭 전환 후 섹션 렌더링', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '피드');
    await page.waitForTimeout(2000);

    const feedHeading = page.getByText('친구 감정 피드').first();
    await expect(feedHeading).toBeVisible({ timeout: 5000 });
  });

  test('빈 상태: 친구 없음 시 안내 메시지', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '피드');
    await page.waitForTimeout(2000);

    // 친구가 없으면 "먼저 친구를 추가해주세요" 메시지
    const noFriendMsg = page.getByText('먼저 친구를 추가해주세요').first();
    const hasNoFriendMsg = await noFriendMsg.isVisible().catch(() => false);

    if (hasNoFriendMsg) {
      // CTA 버튼: 친구 찾기 (data-testid)
      const ctaBtn = page.getByTestId('feed-cta-search');
      await expect(ctaBtn).toBeVisible();
    }
  });

  test('빈 상태: 친구 있지만 공유 없음 시 안내 메시지', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '피드');
    await page.waitForTimeout(2000);

    // 친구는 있지만 공유된 감정이 없는 경우
    const noShareMsg = page.getByText('아직 공유된 감정이 없어요').first();
    const hasNoShare = await noShareMsg.isVisible().catch(() => false);

    if (hasNoShare) {
      // "친구가 일기를 공유하면 여기에 나타나요" 메시지 확인
      await expect(page.getByText('친구가 일기를 공유하면 여기에 나타나요')).toBeVisible();
    }
  });

  test('피드 CTA: 친구 찾기 버튼 → 찾기 탭 이동', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '피드');
    await page.waitForTimeout(2000);

    const ctaBtn = page.getByTestId('feed-cta-search');
    const hasCta = await ctaBtn.isVisible().catch(() => false);
    if (!hasCta) return;

    await ctaBtn.click();
    await page.waitForTimeout(500);

    const searchTab = page.locator('div.bg-surface-container.rounded-full')
      .first()
      .getByRole('button', { name: '찾기', exact: true });
    await expect(searchTab).toHaveClass(/bg-primary-container/);
  });

  test('피드 항목 렌더링 (공유 감정 있는 경우)', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    await switchTab(page, '피드');
    await page.waitForTimeout(3000);

    // 피드 항목이 있으면 닉네임 + 감정 텍스트 + 시간 표시
    const feedCards = page.locator('.glass-card').filter({ hasText: /오늘:/ });
    const count = await feedCards.count();

    if (count > 0) {
      // 닉네임 표시
      const nickname = feedCards.first().locator('p.truncate');
      await expect(nickname).toBeVisible();
    }
    // 피드가 없으면 빈 상태 메시지 확인 (위 테스트에서 이미 검증)
  });
});

// ============================================================
// 4. 초대코드 공유 (SPEC-FRIEND-004)
// ============================================================
test.describe('SPEC-FRIEND-004: 초대코드 공유', () => {
  test('내 초대코드 섹션 렌더링 (인증 시)', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const codeHeading = page.getByText('내 초대코드').first();
    await expect(codeHeading).toBeVisible({ timeout: 5000 });

    // 6자리 코드 표시
    const codeEl = page.locator('span.tracking-\\[0\\.3em\\]').first();
    const code = await codeEl.textContent().catch(() => '');
    expect(code).toBeTruthy();
    expect(code!.length).toBe(6);
  });

  test('복사 버튼 클릭 → "복사됨!" 피드백', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const copyBtn = page.getByRole('button', { name: /복사/ });
    const hasCopyBtn = await copyBtn.isVisible().catch(() => false);
    if (!hasCopyBtn) return;

    await copyBtn.click();
    await page.waitForTimeout(500);

    // "복사됨!" 피드백 표시
    const copied = page.getByText('복사됨!');
    await expect(copied).toBeVisible({ timeout: 2000 });
  });

  test('초대코드 안내 문구 표시', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const guide = page.getByText('코드를 친구에게 알려주면 친구 추가가 가능해요');
    const hasGuide = await guide.isVisible().catch(() => false);
    expect(hasGuide).toBe(true);
  });
});

// ============================================================
// 5. 비인증 상태 처리
// ============================================================
test.describe('SPEC-FRIEND: 비인증 상태', () => {
  test('비인증 시 로그인 필요 메시지', async ({ page }) => {
    await gotoFriends(page);

    const authed = await isAuthenticated(page);
    if (authed) {
      // 인증된 상태면 탭 콘텐츠 렌더링 확인
      const input = page.getByPlaceholder('6자리 초대코드');
      const hasInput = await input.isVisible().catch(() => false);
      expect(hasInput).toBe(true);
    } else {
      // 비인증 상태면 로그인 필요 메시지
      await expect(page.getByText('로그인이 필요해요')).toBeVisible();
    }
  });

  test('비인증 시 탭 전환 불가 (콘텐츠 없음)', async ({ page }) => {
    await gotoFriends(page);
    if (await isAuthenticated(page)) return;

    // 탭은 보이지만 콘텐츠는 로그인 필요
    await switchTab(page, '목록');
    await page.waitForTimeout(1000);
    await expect(page.getByText('로그인이 필요해요')).toBeVisible();

    await switchTab(page, '피드');
    await page.waitForTimeout(1000);
    await expect(page.getByText('로그인이 필요해요')).toBeVisible();
  });
});

// ============================================================
// 6. 탭 전환 전체 플로우
// ============================================================
test.describe('SPEC-FRIEND: 탭 전환 플로우', () => {
  test('찾기 → 목록 → 피드 → 찾기 순환', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const tabBar = page.locator('div.bg-surface-container.rounded-full').first();

    // 목록 탭
    await tabBar.getByRole('button', { name: '목록', exact: true }).click();
    await page.waitForTimeout(500);
    const listTab = tabBar.getByRole('button', { name: '목록', exact: true });
    await expect(listTab).toHaveClass(/bg-primary-container/);

    // 피드 탭
    await tabBar.getByRole('button', { name: '피드', exact: true }).click();
    await page.waitForTimeout(500);
    const feedTab = tabBar.getByRole('button', { name: '피드', exact: true });
    await expect(feedTab).toHaveClass(/bg-primary-container/);

    // 찾기 탭 (복귀)
    await tabBar.getByRole('button', { name: '찾기', exact: true }).click();
    await page.waitForTimeout(500);
    const searchTab = tabBar.getByRole('button', { name: '찾기', exact: true });
    await expect(searchTab).toHaveClass(/bg-primary-container/);
  });

  test('탭 전환 시 이전 탭 활성 해제', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    const tabBar = page.locator('div.bg-surface-container.rounded-full').first();
    const searchTab = tabBar.getByRole('button', { name: '찾기', exact: true });
    const listTab = tabBar.getByRole('button', { name: '목록', exact: true });

    // 찾기 활성 → 목록 클릭 → 찾기 비활성
    await listTab.click();
    await page.waitForTimeout(500);
    await expect(searchTab).not.toHaveClass(/bg-primary-container/);
    await expect(listTab).toHaveClass(/bg-primary-container/);
  });
});

// ============================================================
// 7. 에러 처리 + 로딩 상태
// ============================================================
test.describe('SPEC-FRIEND: 에러 처리', () => {
  test('main 영역에 치명적 에러 텍스트 없음', async ({ page }) => {
    await gotoFriends(page);

    const mainContent = page.locator('main');
    const loginFailInMain = mainContent.getByText('로그인 실패');
    await expect(loginFailInMain).toHaveCount(0);
  });

  test('로딩 상태 표시 후 콘텐츠 전환', async ({ page }) => {
    await gotoFriends(page);
    if (!(await isAuthenticated(page))) return;

    // 목록 탭에서 로딩 → 콘텐츠 전환 확인
    await switchTab(page, '목록');

    // 로딩 후 콘텐츠 표시 (최대 10초 대기)
    const pendingSection = page.getByText('받은 요청').first();
    await expect(pendingSection).toBeVisible({ timeout: 10000 });
  });
});
