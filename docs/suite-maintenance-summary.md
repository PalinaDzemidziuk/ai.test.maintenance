# Suite Maintenance Summary

**Scope:** `tests/*.spec.ts` (4 files)  
**Date:** 2026-03-18  
**Manual reference:** `.github/outputs/manual-case-1.md` — TC-NAV-001

---

## 1. File Inventory

| File | Tests | Status |
|------|------:|-------|
| `playwright-dev.spec.ts` | 2 | ✅ Healthy — distinct scope |
| `main.navigation.spec.ts` | 4 | 🔴 Degraded — broken selector, broken stub, duplicates |
| `main.navigation.refactored.spec.ts` | 6 | 🟡 Intermediate — duplicates `.spec.ts` visibility subset; locator called twice; sync assertion |
| `main.navigation.professional.spec.ts` | 9 | 🟢 Best version — full TC-NAV-001 coverage, edge cases, ARIA |

---

## 2. Checklist Review

### 2.1 Traceability

| File | TC Reference |
|------|-------------|
| `playwright-dev.spec.ts` | ❌ None — no manual case ID referenced |
| `main.navigation.spec.ts` | ❌ None |
| `main.navigation.refactored.spec.ts` | ❌ None |
| `main.navigation.professional.spec.ts` | ✅ `TC-NAV-001` in `describe` title + per-test annotations covering steps 2–8 and edge cases |

**Findings:**
- F-1: `playwright-dev.spec.ts`, `main.navigation.spec.ts`, and `main.navigation.refactored.spec.ts` have zero traceability to TC-NAV-001 or any other manual case.

---

### 2.2 Coverage & Overlapping Scenarios

#### Overlap matrix — navigation visibility (TC-NAV-001 steps 3–5)

| Assertion | `.spec.ts` | `.refactored` | `.professional` |
|-----------|:----------:|:-------------:|:---------------:|
| Docs visible | ✅ | ✅ | ✅ |
| API visible | ✅ | ✅ | ✅ |
| Community visible | ✅ | ✅ | ✅ |
| All three visible simultaneously | ✅ (duplicate test) | ✅ | ✅ |
| `href` not empty | ❌ | ✅ | ✅ |
| Accessible name | ❌ | ✅ (sync) | ✅ (native) |
| Routing (steps 6–8) | ❌ | ✅ | ✅ |
| Disabled link edge case | ❌ | ❌ | ✅ |
| Wrong URL edge case | ❌ | ❌ | ✅ |

**Findings:**
- F-2: Docs/API/Community visibility is tested identically in all three navigation files — **fully redundant** across `main.navigation.spec.ts` and `main.navigation.refactored.spec.ts` relative to `.professional`.
- F-3: `main.navigation.spec.ts` test 4 (`should display all navigation links simultaneously`) duplicates tests 1–3 in the same file.
- F-4: TC-NAV-001 steps 6–8 (routing) are absent from `main.navigation.spec.ts`.
- F-5: `playwright-dev.spec.ts` overlaps with the routing tests in `.professional` — `get started link navigates to installation page` triggers a navigation from the home page, similar in pattern to the routing tests, but covers a *different* link and destination (`/intro`). **Not redundant** — distinct scenario.

---

### 2.3 Broken Selectors

| File | Location | Issue |
|------|----------|-------|
| `main.navigation.spec.ts` *(original `e2e/` version)* | `PlaywrightDevPage.docsNavLink` | Was `page.locator('#docs')` — brittle CSS id (now fixed in POM to `getByRole`) |
| `main.navigation.spec.ts` | `waitForTimeout(2000)` call | Calls a stub that throws `Error('Method not implemented.')` — **crashes test 1** |
| `main.navigation.spec.ts` | `toBeEnabled()` on `<a>` | Inapplicable assertion; `toBeEnabled` targets form controls, not anchors |
| `main.navigation.refactored.spec.ts` | `locator(playwrightDev)` called twice | Second call creates a new locator instance unnecessarily |
| `main.navigation.refactored.spec.ts` | `expect(ariaLabel).toBe(name)` | Synchronous assertion — no auto-retry; skips ARIA tree fallbacks |

> Note: The POM (`playwright-dev-page.ts`) has been repaired — `docsNavLink` is now `getByRole('link', { name: 'Docs', exact: true })`. The `waitForTimeout` stub and `#docs` selector issues remain only in `main.navigation.spec.ts` which uses the old POM import path.

---

### 2.4 Maintainability

| File | POM Usage | Naming | Duplication | `beforeEach` |
|------|:---------:|:------:|:-----------:|:------------:|
| `playwright-dev.spec.ts` | ✅ | ✅ | None | N/A |
| `main.navigation.spec.ts` | ⚠️ Broken stub in POM | ✅ | 1 duplicate test | ✅ (but shared `let`) |
| `main.navigation.refactored.spec.ts` | ✅ | ✅ | Routing setup repeated ×3 | ❌ Missing in routing |
| `main.navigation.professional.spec.ts` | ✅ | ✅ | None | ✅ in routing describe |

**Finding F-6:** `main.navigation.spec.ts` uses `let playwrightDev` declared in `describe` scope and mutated in `beforeEach` — shared mutable state, not parallel-safe.

**Finding F-7:** `main.navigation.professional.spec.ts` has the wrong-URL test placed **outside** the `Edge cases` describe block (after its closing `}`), at the top level of the outer describe. Structurally misplaced — appears as an orphan in reports.

---

### 2.5 Clarity

| File | Assessment |
|------|-----------|
| `playwright-dev.spec.ts` | ✅ Short, clear, purpose-obvious |
| `main.navigation.spec.ts` | ⚠️ No describe grouping for different concerns; duplicate test name misleads |
| `main.navigation.refactored.spec.ts` | ✅ Nested describes improve grouping; per-link loop self-documents |
| `main.navigation.professional.spec.ts` | ✅ Section separators, step-numbered titles, file JSDoc; minor: overlap between "steps 2–5" outer test and "steps 3–5" inner describe needs a comment |

---

### 2.6 Validation Quality

| File | Quality issues |
|------|--------------|
| `playwright-dev.spec.ts` | ✅ No issues |
| `main.navigation.spec.ts` | `toBeEnabled()` inapplicable on anchors |
| `main.navigation.refactored.spec.ts` | `expect(ariaLabel).toBe(name)` — sync, no retry; generic `h1` assertion in routing tests |
| `main.navigation.professional.spec.ts` | `expect(page.url()).not.toMatch(...)` — synchronous in wrong-URL test; generic `h1` in routing tests |

---

## 3. Findings Summary

| ID | File | Severity | Description |
|----|------|----------|-------------|
| F-1 | `.spec.ts`, `.refactored`, `playwright-dev` | 🟠 P2 | No traceability to TC-NAV-001 |
| F-2 | `.spec.ts`, `.refactored` | 🟠 P2 | Visibility assertions fully duplicated by `.professional` |
| F-3 | `.spec.ts` | 🟡 P3 | Internal duplicate test (`should display all simultaneously`) |
| F-4 | `.spec.ts` | 🟠 P2 | Routing (steps 6–8) missing entirely |
| F-5 | `playwright-dev` | ✅ — | `get started` routing is a different scenario — not redundant |
| F-6 | `.spec.ts` | 🔴 P1 | `waitForTimeout` stub crashes test 1; `toBeEnabled` on anchor; shared `let` |
| F-7 | `.professional` | 🟠 P2 | Wrong-URL edge-case test placed outside `Edge cases` describe |
| F-8 | `.refactored` | 🟡 P3 | Locator factory called twice per iteration; sync `expect().toBe()` |
| F-9 | `.refactored`, `.professional` | 🟡 P3 | Generic `h1` assertion in routing tests — does not confirm correct page |
| F-10 | `.professional` | 🟡 P3 | `expect(page.url()).not.toMatch()` is synchronous — use `await expect(page).not.toHaveURL()` |

---

## 4. Consolidation Plan

### Recommended target structure

```
tests/
  playwright-dev.spec.ts           ← KEEP as-is (distinct scope: title + get-started)
  navigation/
    main.navigation.professional.spec.ts  ← KEEP as canonical navigation suite
tests/e2e/                         ← ARCHIVE or DELETE (superseded versions)
  main.navigation.spec.ts          ← DELETE — degraded, fully superseded
  main.navigation.refactored.spec.ts      ← DELETE — intermediate, superseded
```

### Steps

| Step | Action | Why |
|------|--------|-----|
| 1 | Fix F-7 in `.professional`: move wrong-URL test inside `Edge cases` describe | Structural correctness; clean reports |
| 2 | Fix F-10 in `.professional`: replace `expect(page.url()).not.toMatch()` with `await expect(page).not.toHaveURL()` | Web-first assertion, auto-retry |
| 3 | Fix F-9 in `.professional`: add `toContainText(...)` to routing `h1` assertions | Validates correct page, not just any `h1` |
| 4 | Delete `tests/main.navigation.spec.ts` | Degraded version, fully superseded by `.professional`; causes 1 crash |
| 5 | Delete `tests/main.navigation.refactored.spec.ts` | Intermediate version, fully superseded; running it adds noise and CI time |
| 6 | Add TC-NAV-001 annotation to `playwright-dev.spec.ts` (or a separate TC ID for get-started) | Traceability |
| 7 | Optionally add `role="navigation"` landmark assertion and keyboard-activation test to `.professional` | Closes remaining P2 accessibility gaps |

AFTER
Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/tests/main.navigation.professional.spec.ts#1-1), lines 1 to 160

Read [](file:///c%3A/Users/p.dzemidziuk/ai-project-course/ai.test.maintenance/tests/main.navigation.professional.spec.ts#160-160), lines 160 to 180

---

## Review Report — main.navigation.professional.spec.ts (current state)

---

### 1. Traceability

**Finding:** Every test carries `test.info().annotations.push(...)` with `TC-NAV-001` and the matching manual step number. The file-level `@see` JSDoc and the outer `describe` title both reference the manual case. All 8 manual steps (2–8) plus both edge cases are explicitly mapped.

**Status:** ✅ No modification required

---

### 2. Coverage

**Finding 2a — Positive scenarios:** All TC-NAV-001 steps 2–8 covered across visibility, per-link detail, and routing. ✅

**Finding 2b — Edge cases:** Two edge cases present — disabled link state and wrong target URL, both inside `Edge cases` describe. ✅

**Finding 2c — Wrong-URL test uses a single `nav` instance across the loop:** The `nav` object is created once outside the loop. After each `action()` navigates away, subsequent calls to `nav.goto()` return correctly. This is safe, but noteworthy as the POM's locators re-resolve lazily via Playwright — not a bug but worth acknowledging.

**Finding 2d — No `role="navigation"` landmark assertion:** Manual scenario step 2 states *"a horizontal navigation bar is visible at the top of the page"*. No test asserts that the links are contained within a `<nav>` / `role="navigation"` landmark element, which is both a UX and WCAG 1.3.6 requirement.

**Finding 2e — No mobile/responsive edge case:** The manual case notes call out a 375 px viewport / hamburger menu check. Still absent from all tests.

**Status:** ⚠️ Minor gaps remain (2d, 2e)

---

### 3. Maintainability

**Finding 3a — Routing describe uses `beforeEach` correctly:** Fresh `PlaywrightDevPage(page)` per isolated fixture — parallel-safe. ✅

**Finding 3b — Visibility describe lacks `beforeEach`:** Both the outer visibility test and the three per-link tests independently instantiate `new PlaywrightDevPage(page)` + `goto()`. This is safe but inconsistent with the routing describe pattern and creates minor boilerplate repetition.

**Finding 3c — `locator(nav)` called once per test:** No duplicate factory calls in the per-link loop. ✅

**Finding 3d — No duplication across tests:** Each assertion group is unique. ✅

**Finding 3e — Wrong-URL test creates its own `nav` outside `beforeEach`:** Consistent with other edge-case tests that don't use the routing `beforeEach`. Acceptable given isolation requirements.

**Status:** ⚠️ Minor — visibility describe could benefit from `beforeEach` for consistency (3b)

---

### 4. Clarity

**Finding 4a:** File-level JSDoc `[1]`–`[7]` improvement list, section separator comments (`// ── Section ──`), and step-numbered test titles are clear and well-organized. ✅

**Finding 4b — Overlap between outer visibility test and per-link describe not explained:** The outer test covers *"steps 2–5"* (simultaneous visibility) while the inner `per-link checks (steps 3–5)` describe covers individual link detail. A brief comment clarifying the distinction (simultaneous check vs. per-link check) would prevent confusion for future maintainers.

**Finding 4c — Wrong-URL loop `wrong` array entry for API uses a regex lookahead without inline explanation:**
```ts
/^https:\/\/playwright\.dev\/docs\/(?!api)/i
```
A comment exists (`// (?!api) lookahead excludes /docs/api/ from the negative check`) — this is adequate. ✅

**Status:** ⚠️ Trivial — one clarifying comment missing (4b)

---

### 5. Validation Quality

**Finding 5a — `toHaveAccessibleName` used on all per-link checks.** Auto-retrying, ARIA-tree-aware. ✅

**Finding 5b — `toHaveAttribute('href', /.+/)` present per link.** Guards against empty `href`. ✅

**Finding 5c — Routing heading assertions use `toContainText` with real content:**
- Docs → `'Installation'` ✅
- API → `'Playwright Library'` ✅
- Community → `'Welcome'` ✅

**Finding 5d — Wrong-URL loop heading assertion still generic:**
```ts
await expect(page.getByRole('heading', { level: 1 }), ...).toBeVisible();
```
Inside the wrong-URL loop the `h1` check falls back to `.toBeVisible()` without `.toContainText(...)`. This is a minor inconsistency with the explicit routing tests, and could pass on an error page.

**Finding 5e — `await expect(page).not.toHaveURL(wrongPattern)` is now web-first.** ✅ (Previously sync — fixed.)

**Status:** ⚠️ Minor — 5d is a small inconsistency

---

### 6. Compliance & Accessibility

**Finding 6a — `toHaveAccessibleName` on each nav link.** ✅

**Finding 6b — Disabled link state covered** (`aria-disabled`, `disabled` attribute). ✅

**Finding 6c — No `role="navigation"` landmark assertion** (same as 2d): WCAG 1.3.1 / 4.1.2 landmark requirement not tested.

**Finding 6d — No keyboard navigation test:** WCAG 2.1 SC 2.1.1. No test verifies `Tab` / `Enter` can activate nav links.

**Finding 6e — No axe-core integration:** Full WCAG automated scan absent.

**Status:** ⚠️ 6c and 6d remain open; 6e is optional tooling

---

## Prioritized Fix Plan

| Priority | # | Finding | Recommended Fix |
|----------|---|---------|----------------|
| 🟠 P2 | 2d / 6c | No nav landmark assertion | Add `await expect(page.getByRole('navigation').first()).toBeVisible()` to the visibility test |
| 🟠 P2 | 5d | Generic `h1` in wrong-URL loop | Add per-`label` `toContainText(...)` inside the loop (Docs→`'Installation'`, API→`'Playwright Library'`, Community→`'Welcome'`) |
| 🟡 P3 | 3b | Visibility describe lacks `beforeEach` | Extract `new PlaywrightDevPage(page)` + `goto()` into `beforeEach` to match routing describe pattern |
| 🟡 P3 | 4b | Missing clarifying comment on overlap | Add a one-line comment distinguishing simultaneous visibility check from per-link detail check |
| 🟡 P3 | 6d | No keyboard navigation test | Add a test: `Tab` to each nav link, press `Enter`, assert resulting URL |
| 🔵 P4 | 2e | No mobile viewport test | Add `page.setViewportSize({ width: 375, height: 812 })` test to Edge cases |
| 🔵 P4 | 6e | No axe-core scan | Integrate `@axe-core/playwright` for a WCAG automated sweep |