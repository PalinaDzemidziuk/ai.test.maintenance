the degraded version - lost steps and expectation, against best practice (wait) and chosen strategy(selectors)
AI-refactored version - the quickest creation, fix the issues reported in prompt, use context with the report for the degraded version
manually improved version - easy to extend by adding just one expect


Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/.github/outputs/manual-case-1.md)

---

## Review Report — main.navigation.refactored.spec.ts

---

### 1. Traceability
**Finding:** No test references the manual scenario ID `TC-NAV-001` from `outputs/manual-case-1.md`. There is no `test.info().annotations`, `test` tag, or comment linking any test to the manual case.

**Status:** ⚠️ Modification required

---

### 2. Coverage

**Finding 2a — No negative scenarios:**  
All tests assume the happy path. There is no test for:
- What happens when the page fails to load
- A link pointing to a broken/unreachable URL (e.g., verifying `href` is not `#` or empty)

**Finding 2b — No edge scenarios:**  
The manual case notes explicitly call out:
- Mobile viewport (375 px) — no test verifies the nav is reachable at small widths (hamburger menu behaviour)
- Cross-browser — config is Chromium-only which is acceptable as a constraint, but no viewport/responsive test exists

**Finding 2c — No error handling:**  
`ariaLabel` evaluation is called twice on the same locator per iteration (`locator(playwrightDev)` creates a new instance on each call). If the element is not found, it throws an unhandled evaluation error rather than a meaningful assertion failure.

**Status:** ⚠️ Modification required

---

### 3. Maintainability

**Finding 3a — Locator called twice per iteration:**
```ts
const link = locator(playwrightDev);
const ariaLabel = await locator(playwrightDev).evaluate(...)  // second call
```
`locator(playwrightDev)` is invoked twice. Although both resolve to the same underlying element, the function is called redundantly. `link.evaluate(...)` should be used for the second call.

**Finding 3b — Routing tests repeat POM instantiation boilerplate:**  
Each of the three routing tests repeats the identical 2-line setup (`new PlaywrightDevPage(page)` + `goto()`). A `test.beforeEach` or a helper would eliminate the duplication.

**Finding 3c — POM coverage:**  
The `goToDocs/goToApi/goToCommunity` methods include a `toHaveURL` assertion inside the POM. Assertions in POM action methods couple navigation logic with test expectations, making the POM harder to reuse. The URL assertion belongs in the test.

**Status:** ⚠️ Modification required

---

### 4. Clarity

**Finding:** Test names are descriptive and map well to manual steps. The nested `describe` hierarchy (`Navigation links visibility` → `each navigation link`) clearly groups related cases. Step flow is readable.

**Status:** ✅ No modification required

---

### 5. Validation Quality

**Finding 5a — `ariaLabel` assertion is synchronous (`expect` not `await expect`):**
```ts
expect(ariaLabel).toBe(name);
```
This is a synchronous value assertion on an already-resolved string, which is correct here. However it will not auto-retry if the DOM changes between evaluation and assertion — using `await expect(link).toHaveAccessibleName(name)` is the Playwright-native, auto-retrying equivalent and is more aligned with web-first assertion practice.

**Finding 5b — Heading assertion too broad:**  
```ts
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```
This asserts *any* `h1` exists, but does not validate it is the expected page heading. A wrong page could still pass this check. Adding `toContainText` (e.g., `'Docs'`, `'API'`, `'Community'`) would make it meaningful.

**Finding 5c — Nav landmark not asserted:**  
Manual step 2 requires the navigation bar itself to be present. No test checks for a `role="navigation"` landmark wrapping the links.

**Status:** ⚠️ Modification required

---

### 6. Compliance & Accessibility

**Finding 6a — Accessible name evaluated via `evaluate()` rather than Playwright's built-in:**  
`toHaveAccessibleName()` is the semantically correct Playwright assertion and consults the full ARIA accessibility tree (including `aria-label`, `aria-labelledby`, and text content fallback). The current `evaluate` approach only checks `aria-label` or `textContent`, missing other ARIA naming patterns.

**Finding 6b — No keyboard navigation test:**  
There is no test that tabs to the navigation links via keyboard and activates them, which is required by WCAG 2.1 SC 2.1.1.

**Finding 6c — No colour/contrast or focus-indicator check:**  
These are typically out of scope for Playwright alone (better covered by axe-core integration), but no `@axe-core/playwright` scan is present.

**Status:** ⚠️ Modification required

---

## Prioritized Fix Plan

| Priority | # | Finding | Recommended Fix |
|----------|---|---------|----------------|
| 🔴 P1 | 3a | Locator called twice | Replace second `locator(playwrightDev).evaluate(...)` with `link.evaluate(...)` |
| 🔴 P1 | 5a | Sync `expect` instead of web-first | Replace `expect(ariaLabel).toBe(name)` with `await expect(link).toHaveAccessibleName(name)` and remove the manual `evaluate` entirely |
| 🔴 P1 | 1 | No traceability to TC-NAV-001 | Add `test.info().annotations.push({ type: 'TC', description: 'TC-NAV-001' })` or `// @TC-NAV-001` comment on each relevant test |
| 🟠 P2 | 5b | Heading assertion too broad | Add `.toContainText(...)` with expected page heading text to routing assertions |
| 🟠 P2 | 5c | No nav landmark assertion | Add `await expect(page.getByRole('navigation').first()).toBeVisible()` to the visibility describe |
| 🟠 P2 | 3b | Setup boilerplate duplicated | Extract `new PlaywrightDevPage(page)` + `goto()` into a `test.beforeEach` in the routing describe |
| 🟠 P2 | 6a | `evaluate` instead of `toHaveAccessibleName` | Replace with `await expect(link).toHaveAccessibleName(name)` |
| 🟡 P3 | 3c | URL assertion inside POM method | Move `toHaveURL` assertions from POM action methods into the tests |
| 🟡 P3 | 2b | No mobile viewport test | Add a test using `page.setViewportSize({ width: 375, height: 812 })` verifying nav is accessible |
| 🟡 P3 | 6b | No keyboard navigation test | Add a test using `page.keyboard.press('Tab')` to reach and activate each nav link |
| 🔵 P4 | 2a | No negative scenarios | Add a test asserting nav links have non-empty, valid `href` values (not `#`) |
| 🔵 P4 | 6c | No axe accessibility scan | Integrate `@axe-core/playwright` for a full WCAG scan on the main page |