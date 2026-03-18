# ai.test.maintenance

End-to-end test suite for [playwright.dev](https://playwright.dev), built with **TypeScript + Playwright** and structured around the **Page Object Model (POM)** pattern. Developed as part of an AI-assisted QA automation course to demonstrate test generation, maintenance, refactoring, and CI/CD integration.

---
## Table of Contents
- [Framework Overview](#framework-overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [CI/CD](#cicd)
- [Reporting](#reporting)
- [Contributing](#contributing)

---
## Framework Overview
| Concern     | Choice                                                          |
|-------------|---------------------------------------------------------------- |
| Language    | TypeScript                                                      |
| Test runner | [Playwright Test](https://playwright.dev/docs/intro) v1.58+    |
| Pattern     | Page Object Model                                               |
| Browser     | Chromium (Desktop Chrome)                                       |
| Parallelism | 3 workers, fully parallel                                       |
| Retries     | 0 locally · 2 on CI                                            |
| Base URL    | `https://playwright.dev`                                        |
| Traces      | Captured on first retry                                         |
| Reports     | HTML (`playwright-report/`)                                     |

### Design principles

- **Locators** — role-based (`getByRole`, `getByLabel`) exclusively; no CSS or XPath.
- **Assertions** — Playwright-native web-first assertions (`toBeVisible`, `toHaveURL`, `toHaveAccessibleName`, etc.) with automatic retry.
- **No hard timeouts** — all waits rely on Playwright's built-in auto-waiting.
- **POM actions are side-effect only** — navigation methods click and navigate; assertions live in the test file.

---
## Prerequisites

| Tool        | Version            |
|-------------|--------------------|
| Node.js     | LTS (≥ 20)         |
| npm or Yarn | any recent version |

---

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd ai.test.maintenance

# 2. Install dependencies
npm install
# or with Yarn
yarn install

# 3. Install Playwright browsers
npx playwright install chromium
# or with system dependencies (required on headless Linux/CI)
npx playwright install chromium --with-deps
```

---

## Running Tests

### Run all tests

```bash
npm test
# or
npx playwright test
```

### Run a specific spec file

```bash
npx playwright test tests/main.navigation.professional.spec.ts
```

### Run in headed mode (visible browser)

```bash
npx playwright test --headed
```

### Run with the interactive UI Mode

```bash
npx playwright test --ui
```

### Open the last HTML report

```bash
npm run test:report
# or
npx playwright show-report
```

### Debug a specific test

```bash
npx playwright test --debug tests/main.navigation.professional.spec.ts
```

---

## Project Structure

```
ai.test.maintenance/
│
├── pages/                              # Page Object Model classes
│   └── playwright-dev-page.ts          # Locators + actions for playwright.dev
│
├── tests/                              # Test specs
│   ├── playwright-dev.spec.ts          # Homepage title + Get Started navigation
│   ├── main.navigation.spec.ts         # Legacy visibility tests (reference)
│   ├── main.navigation.refactored.spec.ts  # Intermediate refactored version
│   ├── main.navigation.professional.spec.ts  # Canonical suite (TC-NAV-001)
│   └── e2e/                            # (reserved for additional e2e flows)
│
├── .github/
│   ├── outputs/
│   │   └── manual-case-1.md            # Manual test case TC-NAV-001
│   ├── prompts/                        # AI prompt files used during development
│   └── workflows/
│       └── playwright-tests.yml        # GitHub Actions CI/CD pipeline
│
├── docs/                               # Maintenance reports and summaries
│   ├── refactoring-summary.md
│   ├── suite-maintenance-summary.md
│   └── ...
│
├── playwright.config.ts                # Playwright configuration
├── tsconfig.json                       # TypeScript configuration
├── .gitignore
└── package.json
```

## CI/CD

The [GitHub Actions workflow](.github/workflows/playwright-tests.yml) triggers on **pull requests targeting `main`**.

### Jobs

| Job                 | Purpose                                                                                       |
|---------------------|-----------------------------------------------------------------------------------------------|
| `playwright-tests`  | Install → run tests → upload artifacts → publish report to GitHub Pages (main only)           |
| `security-scan`     | Run `yarn audit --level high` to block PRs with high/critical vulnerabilities                 |

### Artifacts

| Artifact                  | Contents                  | Retention |
|---------------------------|---------------------------|-----------|
| `playwright-html-report`  | Full HTML test report       | 30 days |
| `playwright-traces`       | Trace ZIPs for failed tests | 30 days |

### GitHub Pages

On merges to `main`, the HTML report is automatically published to GitHub Pages. A `history.json` file (last 100 runs) is maintained on the `gh-pages` branch.

### Notifications

A Microsoft Teams message is sent on workflow failure, including the PR title, author, branch, and a direct link to the failed run. Configure the webhook via the `TEAMS_WEBHOOK_URL` repository secret.

---

## Reporting

After a local run, open the interactive HTML report:

```bash
npx playwright show-report
```

The report includes:
- Pass/fail status per test
- Screenshots on failure
- Traces (on first retry) — open with the Playwright Trace Viewer

---

## Contributing

1. Branch from `main`: `git checkout -b feature/your-change`
2. Follow the POM pattern — locators in `pages/`, assertions in `tests/`
3. Use role-based locators and web-first assertions
4. Reference a manual test case ID in `test.info().annotations` where applicable
5. Ensure `npx playwright test` passes locally before pushing
6. Open a pull request against `main` — CI runs automatically
