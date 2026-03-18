Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/tests/e2e/main.navigation.professional.spec.ts#1-1), lines 1 to 160

Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/tests/e2e/main.navigation.professional.spec.ts#160-160), lines 160 to 178

---

## Review Report — main.navigation.professional.spec.ts (current state)

---

### 1. Traceability

**Finding:** All tests carry `test.info().annotations.push(...)` with `TC-NAV-001` and matching step numbers. The file-level `@see` JSDoc and the `describe` title both reference the manual case ID. All 8 manual steps are mapped.

**Status:** ✅ No modification required

---

### 2. Coverage

**Finding 2a — Positive scenarios:** Steps 2–8 of TC-NAV-001 are covered. ✅

**Finding 2b — Edge cases:** Two edge-case tests are present — disabled link state and wrong target URL. ✅

**Finding 2c — Structural defect — wrong-URL test placed outside its describe block:** The `each navigation link should resolve to its own URL…` test was pasted after the closing `}` of the `Edge cases` describe but before the closing `}` of the outer `test.describe`. This places it at the top level of `Main page navigation [TC-NAV-001]`, outside any category. It runs, but its position breaks the intended structure and will appear as an orphan test in reports.

**Finding 2d — No negative scenario for broken/absent nav:** No test covers the case where a nav link is missing from the DOM (e.g., a regression removes the element). The existing visibility test covers presence, but there is no explicit `not.toBeVisible()` / structural guard for a completely missing link.

**Finding 2e — No mobile/responsive test:** The manual case note calls out a 375 px viewport check (hamburger menu). Still absent.

**Status:** ⚠️ 1 structural defect (2c) requires fix; 2d and 2e are gaps

---

### 3. Maintainability

**Finding 3a — Routing describe uses `beforeEach` correctly:** Isolated `page` fixture per test, DRY setup. ✅

**Finding 3b — Visibility describe still repeats POM setup:** Both the outer visibility test and each per-link test individually call `new PlaywrightDevPage(page)` + `await nav.goto()`. Unlike the routing describe, there is no `beforeEach` here, creating minor duplication. Acceptable given each test needs isolation, but inconsistent with the routing pattern.

**Finding 3c — Wrong-URL test re-initialises `nav` after `beforeEach` in routing would have done it:** Since the test was pasted outside the routing describe, it doesn't benefit from the `beforeEach` and creates its own `PlaywrightDevPage` — this is correct for isolation, but reinforces the placement problem noted in 2c.

**Finding 3d — `wrong` array in URL test uses a lookahead regex for API:**
```ts
wrong: [/^https:\/\/playwright\.dev\/docs\/(?!api)/i, ...]
```
The `(?!api)` lookahead is correct but subtle and not commented. A brief inline note would aid maintainability.

**Status:** ⚠️ Structural placement (2c / 3c) is the primary concern; minor inconsistency in 3b

---

### 4. Clarity

**Finding 4a:** File-level JSDoc `[1]`–`[7]` annotations, section separators, and step-numbered test titles are clear and well-organized. ✅

**Finding 4b — Wrong-URL test has no section separator or comment:** All other describe blocks have a `// ── Section ──` header comment. The orphaned test has none, making it harder to scan the file and locate where it logically belongs.

**Finding 4c — `per-link checks (steps 3–5)` overlap note missing:** The outer visibility test covers "steps 2–5" while the inner per-link tests individually cover steps 3–5. A reader could interpret this as duplication. A clarifying comment explaining the outer test checks *simultaneous* visibility while inner tests check *per-link detail* would remove ambiguity.

**Status:** ⚠️ Minor — clarity fix needed for 4b; optional for 4c

---

### 5. Validation Quality

**Finding 5a — `toHaveAccessibleName` used correctly for all per-link checks.** ✅

**Finding 5b — `toHaveAttribute('href', /.+/)` guards against empty href.** ✅

**Finding 5c — H1 heading assertions are still generic:** All routing tests assert:
```ts
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```
This passes for any `h1`, including error pages. Adding `toContainText(...)` per test would confirm the *correct* page content loaded.

**Finding 5d — Synchronous `expect(page.url()).not.toMatch(...)` in wrong-URL test:**
```ts
expect(page.url(), ...).not.toMatch(wrongPattern);
```
This is a synchronous point-in-time assertion with no auto-retry. If called immediately after `toHaveURL(correct)` has already resolved, the URL is stable and this is safe. However it is inconsistent with the Playwright web-first assertion style (`await expect(page).not.toHaveURL(...)`).

**Status:** ⚠️ 5c and 5d recommended for improvement

---

### 6. Compliance & Accessibility

**Finding 6a — `toHaveAccessibleName` present on all nav links.** ✅

**Finding 6b — `aria-disabled` / `disabled` edge case present.** ✅

**Finding 6c — No `role="navigation"` landmark assertion:** Manual step 2 requires the navigation bar to be visible as a structure. No test verifies `page.getByRole('navigation')` exists, which is a WCAG 1.3.1 / 4.1.2 landmark requirement.

**Finding 6d — No keyboard navigation test:** WCAG 2.1 SC 2.1.1. No test activates links via `Tab` + `Enter`.

**Finding 6e — No axe-core integration.** Out of scope for Playwright alone but noted.

**Status:** ⚠️ 6c and 6d remain open from the previous review cycle

---

## Prioritized Fix Plan

| Priority | # | Finding | Recommended Fix |
|----------|---|---------|----------------|
| 🔴 P1 | 2c | Wrong-URL test placed outside `Edge cases` describe | Move the test inside the `Edge cases` describe block; add `// ── Edge cases ──` separator |
| 🔴 P1 | 5d | Synchronous `expect(page.url()).not.toMatch(...)` | Replace with `await expect(page).not.toHaveURL(wrongPattern)` for auto-retry consistency |
| 🟠 P2 | 5c | Generic `h1` heading assertions in routing tests | Add `.toContainText(...)` with expected heading text per routing destination |
| 🟠 P2 | 6c | No nav landmark assertion | Add `await expect(page.getByRole('navigation').first()).toBeVisible()` in the visibility test |
| 🟡 P3 | 4b | Missing section separator on wrong-URL test | Add `// ── Edge cases (continued) ──` or ensure placement inside the describe |
| 🟡 P3 | 3b | Visibility describe lacks `beforeEach` | Optionally consolidate `new PlaywrightDevPage(page)` + `goto()` into `beforeEach` to match routing pattern |
| 🟡 P3 | 6d | No keyboard navigation test | Add `Tab` → `Enter` test per nav link, assert URL |
| 🔵 P4 | 2e | No mobile viewport test | Add `page.setViewportSize({ width: 375, height: 812 })` test |
| 🔵 P4 | 6e | No axe-core scan | Integrate `@axe-core/playwright` for a WCAG automated sweep |