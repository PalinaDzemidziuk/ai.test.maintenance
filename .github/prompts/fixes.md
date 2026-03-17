You are a Senior QA Automation Engineer.

Goal:
Refactor and repair the following AI-generated code tests/main.navigation.spec.ts to align with test case requirements (Main Page Navigation Buttons: Docs, API, Community).

Inputs:
- tests/e2e/tests/main.navigation.spec.ts

Rules:
1) Avoid hard-coded timeouts; rely on built-in waits.
2) For selectors apply getByRole/getByLabel/getByTestId strategy; avoid complex CSS/XPath.
3) use expect-based assertions, and clear step naming.
3) Keep tests DRY: extract reusable logic into helpers or page/component methods.
4) Avoid duplicates


Output:
Refactored spec saved into tests/main.navigation.refactored.spec.ts.
Do not change tests/e2e/tests/main.navigation.spec.ts directly.
