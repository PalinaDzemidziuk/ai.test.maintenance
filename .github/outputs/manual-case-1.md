**Manual Test Case: Navigation Buttons Visibility on Main Page**

---

**Test ID:** TC-NAV-001  
**Title:** Main page displays Docs, API, and Community navigation buttons  
**Priority:** High  
**Preconditions:** Browser is open with internet access

---

**Test Steps:**

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open a browser and navigate to `https://playwright.dev/` | The main Playwright homepage loads successfully |
| 2 | Observe the top navigation bar | A horizontal navigation bar is visible at the top of the page |
| 3 | Look for a link/button labeled **"Docs"** in the navigation bar | The **Docs** link is visible and readable |
| 4 | Look for a link/button labeled **"API"** in the navigation bar | The **API** link is visible and readable |
| 5 | Look for a link/button labeled **"Community"** in the navigation bar | The **Community** link is visible and readable |
| 6 | Click the **"Docs"** link in the navigation bar | The browser navigates to the Docs page (URL contains `/docs/`) and the page heading is visible |
| 7 | Navigate back to `https://playwright.dev/` and click the **"API"** link | The browser navigates to the API reference page (URL contains `/docs/api/`) and the page heading is visible |
| 8 | Navigate back to `https://playwright.dev/` and click the **"Community"** link | The browser navigates to the Community page (URL contains `/community/`) and the page heading is visible |

---

**Pass Criteria:** All three navigation links — Docs, API, Community — are visible in the navigation bar without scrolling, and each link navigates to the correct page.

**Fail Criteria:** Any of the three links is missing, hidden, or overlapped by other elements.

**Notes:** Test should be repeated on Chrome, Firefox, and Safari. Also verify on a mobile viewport (375px width) to ensure links remain accessible (e.g., via a hamburger menu).