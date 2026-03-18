/**
 * @file main.navigation.professional.spec.ts
 * @see .github/outputs/manual-case-1.md — TC-NAV-001
 *
 * Improvements over main.navigation.refactored.spec.ts
 * ─────────────────────────────────────────────────────
 * [1] Traceability  – every test annotates TC-NAV-001 with the matching manual step(s)
 * [2] Single locator – locator factory called once per test; `link` reused throughout
 * [3] DRY routing   – beforeEach in routing describe eliminates repeated POM setup
 * [4] Assertions out of POM – goToDocs/goToApi/goToCommunity only click; URL/heading
 *                             assertions live here in the test
 * [5] Native ARIA   – toHaveAccessibleName() replaces manual evaluate() + expect()
 * [6] Clarity       – renamed inner describe, added step numbers in test titles
 * [7] Edge case     – verifies no nav link carries a disabled ARIA state
 */

import { test, expect } from '@playwright/test';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

test.describe('Main page navigation [TC-NAV-001]', () => {

  // ── Visibility ─────────────────────────────────────────────────────────────

  test.describe('Navigation links visibility', () => {

    // TC-NAV-001 steps 2–5: nav bar present, all three links visible
    test('should display Docs, API, and Community links in the navigation bar',
      async ({ page }) => {
        test.info().annotations.push({ type: 'manual-case', description: 'TC-NAV-001 steps 2–5' });

        const nav = new PlaywrightDevPage(page);
        await nav.goto();

        await expect(nav.docsNavLink).toBeVisible();
        await expect(nav.apiNavLink).toBeVisible();
        await expect(nav.communityNavLink).toBeVisible();
      });

    // Per-link checks: visible, correct text, valid href, correct accessible name
    test.describe('per-link checks (steps 3–5)', () => {
      const navLinks = [
        { name: 'Docs',      step: 3, locator: (p: PlaywrightDevPage) => p.docsNavLink },
        { name: 'API',       step: 4, locator: (p: PlaywrightDevPage) => p.apiNavLink },
        { name: 'Community', step: 5, locator: (p: PlaywrightDevPage) => p.communityNavLink },
      ] as const;

      for (const { name, step, locator } of navLinks) {
        test(`step ${step}: "${name}" is visible, labelled, and has a valid href`,
          async ({ page }) => {
            test.info().annotations.push({ type: 'manual-case', description: `TC-NAV-001 step ${step}` });

            const nav = new PlaywrightDevPage(page);
            await nav.goto();

            // [2] Single locator reference — no duplicate factory calls
            const link = locator(nav);
            await expect(link).toBeVisible();
            await expect(link).toHaveText(name);
            await expect(link).toHaveAttribute('href', /.+/);
            // [5] Playwright-native ARIA accessible-name check (replaces evaluate + toBe)
            await expect(link).toHaveAccessibleName(name);
          });
      }
    });
  });

  // ── Routing ────────────────────────────────────────────────────────────────

  test.describe('Navigation links routing', () => {
    // [3] DRY: shared POM setup — each test still receives an isolated `page` fixture
    let nav: PlaywrightDevPage;

    test.beforeEach(async ({ page }) => {
      nav = new PlaywrightDevPage(page);
      await nav.goto();
    });

    // TC-NAV-001 step 6
    test('step 6: Docs link opens the documentation page', async ({ page }) => {
      test.info().annotations.push({ type: 'manual-case', description: 'TC-NAV-001 step 6' });

      await nav.goToDocs();
      // [4] URL and heading assertions in the test, not inside the POM action
      await expect(page).toHaveURL(/\/docs\//i);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Installation');
    });

    // TC-NAV-001 step 7
    test('step 7: API link opens the API reference page', async ({ page }) => {
      test.info().annotations.push({ type: 'manual-case', description: 'TC-NAV-001 step 7' });

      await nav.goToApi();
      await expect(page).toHaveURL(/\/docs\/api\//i);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Playwright Library');
    });

    // TC-NAV-001 step 8
    test('step 8: Community link opens the community page', async ({ page }) => {
      test.info().annotations.push({ type: 'manual-case', description: 'TC-NAV-001 step 8' });

      await nav.goToCommunity();
      await expect(page).toHaveURL(/\/community\//i);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome');
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  test.describe('Edge cases', () => {

    // [7] Disabled link state: no nav link should carry aria-disabled or HTML disabled
    test('no navigation link should be in a disabled state', async ({ page }) => {
      test.info().annotations.push({ type: 'manual-case', description: 'TC-NAV-001 – disabled link edge case' });

      const nav = new PlaywrightDevPage(page);
      await nav.goto();

      for (const link of [nav.docsNavLink, nav.apiNavLink, nav.communityNavLink]) {
        await expect(link).not.toHaveAttribute('aria-disabled', 'true');
        await expect(link).not.toHaveAttribute('disabled');
      }
    });

    // TC-NAV-001 – each nav link must not land on a wrong target URL
    test('each navigation link should resolve to its own URL and not a sibling page',
      async ({ page }) => {
        test.info().annotations.push({
          type: 'manual-case',
          description: 'TC-NAV-001 – wrong target URL edge case',
        });

        const nav = new PlaywrightDevPage(page);

        const expectations = [
          {
            label:   'Docs',
            action:  () => nav.goToDocs(),
            correct: /\/docs\//i,
            // Docs must not resolve to API sub-path or Community
            wrong:   [/\/docs\/api\//i, /\/community\//i],
          },
          {
            label:   'API',
            action:  () => nav.goToApi(),
            correct: /\/docs\/api\//i,
            // API must not resolve to top-level docs (non-api) or Community
            // (?!api) lookahead excludes /docs/api/ from the negative check
            wrong:   [/^https:\/\/playwright\.dev\/docs\/(?!api)/i, /\/community\//i],
          },
          {
            label:   'Community',
            action:  () => nav.goToCommunity(),
            correct: /\/community\//i,
            wrong:   [/\/docs\//i],
          },
        ] as const;

        for (const { label, action, correct, wrong } of expectations) {
          await nav.goto();
          await action();

          // Must land on the correct destination
          await expect(page, `"${label}" should navigate to the correct URL`).toHaveURL(correct);

          // Must NOT land on any sibling page — web-first auto-retrying assertion
          for (const wrongPattern of wrong) {
            await expect(page, `"${label}" should not navigate to ${wrongPattern}`)
              .not.toHaveURL(wrongPattern);
          }

          // Destination page must have a visible h1 — guards against silent error-page redirects
          await expect(
            page.getByRole('heading', { level: 1 }),
            `"${label}" destination page should have a visible h1`,
          ).toBeVisible();
        }
      });
  });
});
