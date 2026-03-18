import { test, expect } from '@playwright/test';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

test('has title', async ({ page }) => {
  test.info().annotations.push({ type: 'manual-case', description: 'TC-NAV-001 step 1' });
  const playwrightDev = new PlaywrightDevPage(page);
  await playwrightDev.goto();

  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link navigates to installation page', async ({ page }) => {
  test.info().annotations.push({ type: 'manual-case', description: 'TC-NAV-001 step 1' });
  const playwrightDev = new PlaywrightDevPage(page);
  await playwrightDev.goto();
  await playwrightDev.getStarted();

  await expect(page).toHaveURL(/.*intro/);
  await expect(playwrightDev.gettingStartedHeader).toBeVisible();
});
