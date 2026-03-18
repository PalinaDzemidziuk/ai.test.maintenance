You are a Senior QA Automation Engineer.

Context:
- Stack: TypeScript + Playwright
- Pattern: Page Object Model
- File to refactor: tests/e2e/main.navigation.refactored.spec.ts
  
Task:
1) Add Test reference the manual case from scenario outputs/manual-case-1.md
2) Call the locator only once in the function
3) Move repeat POM instantiation to beforeEach
4) Move all expect to test, it should not be saved in POM
5) Update expect to Playwright-native one
5) Improves naming/comments clarity
6) Introduces one edge case: disabled link stat
7) Keeps Page Object usage consistent. Include only the diff


Generate a unified diff/patch for reviewed file


You are a Senior QA Automation Engineer.

Context:
- Stack: TypeScript + Playwright
- Pattern: Page Object Model
- File to refactor: tests/e2e/main.navigation.refactored.spec.ts


Task: 
Generate an  edge-case test for navigation:   wrong target URL. Provide the test function only that I can paste into the same spec. Use role/label selectors and Playwright assertions.