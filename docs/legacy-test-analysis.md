Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/tests/e2e/main.navigation.spec.ts)

Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/pages/playwright-dev-page.ts)

Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/.github/outputs/manual-case-1.md)

---

## Refactor & Upgrade Report — main.navigation.spec.ts + `PlaywrightDevPage`

---

### 🔴 P1 — Critical (breaks reliability or correctness)

| # | Location | Problem |
|---|----------|---------|
| 1 | playwright-dev-page.ts L4–6 | `waitForTimeout()` is a stub that **throws `Error('Method not implemented.')`** — calling it in the first test will always crash that test |
| 2 | playwright-dev-page.ts L21 | `docsNavLink` uses `page.locator('#docs')` — a **CSS id selector** that is brittle and inconsistent with the role-based strategy used for `apiNavLink` / `communityNavLink`. Breaks if the id changes |
| 3 | main.navigation.spec.ts L12 | `await playwrightDev.waitForTimeout(2000)` — **hard-coded 2 s delay**, which is exactly the anti-pattern Playwright's auto-waiting is designed to eliminate; this call also hits the broken stub above |

---

### 🟠 P2 — Missing coverage (manual scenario steps not automated)

| # | Location | Problem |
|---|----------|---------|
| 4 | spec file (all) | **Steps 6–8 from the manual case are entirely absent**: no test clicks any nav link and asserts the resulting URL (e.g., `/docs/`, `/docs/api/`, `/community/`) or page heading visibility |
| 5 | spec file | No assertion that the links are **contained within the navigation bar** (step 2 of the manual case). A link elsewhere on the page could satisfy the current `toBeVisible` checks |

---

### 🟡 P3 — Design / maintainability issues

| # | Location | Problem |
|---|----------|---------|
| 6 | playwright-dev-page.ts | **Navigation actions** (click Docs → assert URL, click API → assert URL, click Community → assert URL) are missing from the POM. Tests should call POM methods, not raw `click()` + `expect` inline |
| 7 | spec file | The 4th test (`should display all navigation links simultaneously`) **fully duplicates** assertions already present in tests 1–3. It adds no new coverage and increases maintenance cost |
| 8 | spec file | `let playwrightDev` is declared with `let` in `describe` scope and assigned in `beforeEach` — this creates a **shared mutable reference** across tests, which is not parallel-safe when workers share the describe block |

---

### 🔵 P4 — Minor / polish

| # | Location | Problem |
|---|----------|---------|
| 9 | playwright-dev-page.ts | `toBeEnabled()` is not a meaningful assertion on an `<a>` element — it applies to form controls. Should be replaced with `toHaveAttribute('href', ...)` to verify the link is actually wired up |
| 10 | playwright-dev-page.ts | Locator JSDoc comments exist for nav links but not for `getStartedLink` / `gettingStartedHeader`, making the class inconsistently documented |

---

### Recommended Fix Categories (in priority order)

1. **Remove the `waitForTimeout` stub and the hard-coded delay** — rely on Playwright auto-wait
2. **Normalize `docsNavLink` to `getByRole('link', { name: 'Docs', exact: true })`**
3. **Add click-and-verify navigation methods to the POM** (`goToDocs()`, `goToApi()`, `goToCommunity()`) and corresponding tests asserting `toHaveURL`
4. **Refactor `let playwrightDev`** — pass `page` into each test via fixture instead of shared `let`
5. **Remove the redundant 4th test** or merge it into a single meaningful "all links visible" baseline test
6. **Replace `toBeEnabled()`** with `toHaveAttribute('href')` on anchor elements