import { test, expect } from '@playwright/test';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

test.describe('Main page navigation', () => {
  test.describe('Navigation links visibility', () => {
    test('should display Docs, API, and Community links in the navigation bar', async ({ page }) => {
      const playwrightDev = new PlaywrightDevPage(page);
      await playwrightDev.goto();

      await expect(playwrightDev.docsNavLink).toBeVisible();
      await expect(playwrightDev.apiNavLink).toBeVisible();
      await expect(playwrightDev.communityNavLink).toBeVisible();
    });

    test.describe('each navigation link', () => {
      const navLinks = [
        { name: 'Docs',      locator: (p: PlaywrightDevPage) => p.docsNavLink },
        { name: 'API',       locator: (p: PlaywrightDevPage) => p.apiNavLink },
        { name: 'Community', locator: (p: PlaywrightDevPage) => p.communityNavLink },
      ] as const;

      for (const { name, locator } of navLinks) {
        test(`should have a visible and linked "${name}" navigation item`, async ({ page }) => {
          const playwrightDev = new PlaywrightDevPage(page);
          await playwrightDev.goto();

          const link = locator(playwrightDev);
          const ariaLabel = await locator(playwrightDev).evaluate((el) =>
            el.getAttribute('aria-label') ?? el.textContent?.trim() ?? ''
            );
            
          await expect(link).toBeVisible();
          await expect(link).toHaveText(name);
          await expect(link).toHaveAttribute('href', /.+/);
          expect(ariaLabel).toBe(name);
        });
      }
    });
  });

  test.describe('Navigation links routing', () => {
    test('Docs link navigates to the documentation page', async ({ page }) => {
      const playwrightDev = new PlaywrightDevPage(page);
      await playwrightDev.goto();
      await playwrightDev.goToDocs();

      await expect(page).toHaveURL(/\/docs\//i);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('API link navigates to the API reference page', async ({ page }) => {
      const playwrightDev = new PlaywrightDevPage(page);
      await playwrightDev.goto();
      await playwrightDev.goToApi();

      await expect(page).toHaveURL(/\/docs\/api\//i);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('Community link navigates to the community page', async ({ page }) => {
      const playwrightDev = new PlaywrightDevPage(page);
      await playwrightDev.goto();
      await playwrightDev.goToCommunity();

      await expect(page).toHaveURL(/\/community\//i);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });
});
