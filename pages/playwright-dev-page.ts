import { expect, type Locator, type Page } from '@playwright/test';

export class PlaywrightDevPage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly gettingStartedHeader: Locator;
  /** Top navigation "Docs" link */
  readonly docsNavLink: Locator;
  /** Top navigation "API" link */
  readonly apiNavLink: Locator;
  /** Top navigation "Community" link */
  readonly communityNavLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.gettingStartedHeader = page.getByRole('heading', { name: 'Installation', level: 1 });
    this.docsNavLink = page.getByRole('link', { name: 'Docs', exact: true });
    this.apiNavLink = page.getByRole('link', { name: 'API', exact: true });
    this.communityNavLink = page.getByRole('link', { name: 'Community', exact: true });
  }

  async goto() {
    await this.page.goto('/');
  }

  async getStarted() {
    await this.getStartedLink.first().click();
    await expect(this.gettingStartedHeader).toBeVisible();
  }

  /** Clicks the Docs nav link and waits for the docs page to load */
  async goToDocs() {
    await this.docsNavLink.click();
    await expect(this.page).toHaveURL(/\/docs\//i);
  }

  /** Clicks the API nav link and waits for the API reference page to load */
  async goToApi() {
    await this.apiNavLink.click();
    await expect(this.page).toHaveURL(/\/docs\/api\//i);
  }

  /** Clicks the Community nav link and waits for the community page to load */
  async goToCommunity() {
    await this.communityNavLink.click();
    await expect(this.page).toHaveURL(/\/community\//i);
  }
}
