import { test, expect } from '@playwright/test';
import { PlaywrightDevPage } from '../../pages/playwright-dev-page';

test.describe('Main page navigation', () => {
  let playwrightDev: PlaywrightDevPage;

  test.beforeEach(async ({ page }) => {
    playwrightDev = new PlaywrightDevPage(page);
    await playwrightDev.goto();
  });

  test('should display the Docs navigation link', async () => {
    await expect(playwrightDev.docsNavLink).toBeVisible();
    await expect(playwrightDev.docsNavLink).toBeEnabled();
    await expect(playwrightDev.docsNavLink).toHaveText('Docs');
  });

  test('should display the API navigation link', async () => {
    await expect(playwrightDev.apiNavLink).toBeVisible();
    await expect(playwrightDev.apiNavLink).toBeEnabled();
    await expect(playwrightDev.apiNavLink).toHaveText('API');
  });

  test('should display the Community navigation link', async () => {
    await expect(playwrightDev.communityNavLink).toBeVisible();
    await expect(playwrightDev.communityNavLink).toBeEnabled();
    await expect(playwrightDev.communityNavLink).toHaveText('Community');
  });

  test('should display all navigation links simultaneously', async () => {
    await expect(playwrightDev.docsNavLink).toBeVisible();
    await expect(playwrightDev.apiNavLink).toBeVisible();
    await expect(playwrightDev.communityNavLink).toBeVisible();
  });
});
