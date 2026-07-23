MOCK_TEST_CODE = '''// === PageObject: LoginPage.ts ===

import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput    = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton  = page.getByRole("button", { name: /sign in/i });
    this.errorMessage  = page.getByRole("alert");
    this.emailError    = page.getByText(/valid email/i);
    this.passwordError = page.getByText(/password is required/i);
  }

  async goto() {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await this.errorMessage.waitFor({ state: "visible" });
    await this.errorMessage.filter({ hasText: message }).waitFor();
  }
}

// === TestFile: login.spec.ts ===

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

const VALID_EMAIL    = "admin@example.com";
const VALID_PASSWORD = "Admin@123";

test.describe("Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("valid credentials navigate to dashboard", async ({ page }) => {
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("wrong password shows error message", async () => {
    await loginPage.login(VALID_EMAIL, "wrong-password");

    await loginPage.expectError("Invalid email or password");
    await expect(loginPage.emailInput).toBeFocused();
  });

  test("empty fields show inline validation errors", async () => {
    await loginPage.submitButton.click();

    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test("SQL injection payload is rejected safely", async () => {
    await loginPage.login("admin' OR 1=1 --", "anything");

    await loginPage.expectError("Invalid email or password");
    // Assert we are NOT on the dashboard — injection did not succeed
    await expect(loginPage.page).not.toHaveURL(/dashboard/);
  });

  test("locked account shows specific lockout message", async () => {
    // Attempt login 5 times to trigger lockout
    for (let i = 0; i < 5; i++) {
      await loginPage.login(VALID_EMAIL, "wrong-password");
    }

    await loginPage.expectError("Account temporarily locked");
  });
});'''


MOCK_DOC = '''# Test Strategy — TestForge Platform

## 1. Introduction & Objectives

This document defines the testing strategy for **TestForge**, an AI-powered web application that generates test automation code and SDLC documentation. The primary objective is to ensure correctness of AI prompt construction, reliability of the streaming API, and usability of the frontend across all supported framework/language combinations.

**Goals:**
- Validate all 10 framework code generation paths produce syntactically correct output
- Ensure SDLC document generation covers all 8 document types with professional quality
- Verify streaming SSE endpoints handle load, timeouts, and partial responses gracefully
- Confirm the frontend renders streamed output, copy, and download features correctly

---

## 2. Scope

### In-Scope
- Backend API: `POST /generate/tests`, `POST /docs/generate`, `GET /generate/options`, `GET /docs/types`
- Frontend: landing page, test generator page, SDLC document generator page
- Streaming SSE behaviour: chunk delivery, `[DONE]` termination, error handling
- Framework selector UI and code pattern switching
- Copy to clipboard and file download functionality
- Mock mode (`MOCK_MODE=true`) — verifying it bypasses the real API

### Out-of-Scope
- Gemini AI model accuracy and hallucination testing (third-party responsibility)
- Authentication / authorisation (not yet implemented)
- Load testing at scale (portfolio project — single-user usage)
- Browser compatibility beyond Chromium

---

## 3. Testing Levels

| Level | Type | Tools | Coverage Target |
|---|---|---|---|
| Unit | Prompt builder logic | pytest | 100% of `prompt_builder.py` functions |
| Integration | API endpoints | pytest + httpx | All routes, positive + negative cases |
| E2E | Full user journey | Playwright | Happy path per framework (smoke) |
| Manual | Visual output quality | Browser | Spot-check generated code compiles |

---

## 4. Test Approach

### Backend (pytest)
- Test `build_test_generation_prompt()` with each framework key — assert required strings appear
- Test `build_doc_generation_prompt()` for each doc type — assert section headers present
- Test `/generate/tests` with valid payload → expect `200` + `text/event-stream` content type
- Test `/generate/tests` with missing `description` → expect `422`
- Test `/generate/tests` with invalid `framework` → expect `422` with clear message
- Test mock mode: set `MOCK_MODE=true` in env → assert no real HTTP calls made, response streams

### Frontend (Playwright)
- Navigate to `/generate` → fill description → select Playwright TypeScript → click Generate → assert code block appears and contains `import`
- Navigate to `/docs` → fill description → select Test Strategy → click Generate → assert markdown content renders with `##` headings
- Copy button → assert clipboard content matches streamed output
- Download button → assert file download triggered with `.ts` extension

---

## 5. Tools & Technologies

| Tool | Purpose |
|---|---|
| **pytest** | Backend unit + integration tests |
| **httpx** | Async HTTP client for API tests |
| **Playwright (TypeScript)** | Frontend E2E automation |
| **pytest-asyncio** | Async test support |

---

## 6. Entry & Exit Criteria

**Entry:** Backend starts without errors; frontend compiles; mock mode returns streamed content.

**Exit:** All automated tests pass; no `422`/`500` responses on valid inputs; streaming output visible in browser within 2 seconds of clicking Generate.

---

## 7. Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Gemini API rate limiting | High | Mock mode for dev; retry logic for prod |
| SSE stream drops mid-response | Medium | Frontend accumulates partial chunks; shows what was received |
| Generated code has syntax errors | Medium | User-visible — clearly in scope for manual spot-checking |
| Streaming timeout on slow connections | Low | `max_output_tokens: 8192` cap keeps responses bounded |
'''
