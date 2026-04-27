import { test, expect } from "@playwright/test";

test.describe("Test Generator page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/generate");
  });

  test("page heading and description are visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Test Code Generator" })).toBeVisible();
    await expect(page.getByText(/Describe your feature/i)).toBeVisible();
  });

  test("textarea placeholder is shown", async ({ page }) => {
    const textarea = page.getByPlaceholder(/e.g. User login/i);
    await expect(textarea).toBeVisible();
  });

  test("framework selector shows all groups", async ({ page }) => {
    for (const group of ["Playwright", "Cypress", "Selenium", "WebdriverIO", "pytest", "Robot Framework"]) {
      await expect(page.getByText(group, { exact: true }).first()).toBeVisible();
    }
  });

  test("Playwright TypeScript is selected by default", async ({ page }) => {
    const playwrightBtn = page.getByRole("button", { name: "Playwright (TypeScript)" });
    await expect(playwrightBtn).toHaveClass(/violet/);
  });

  test("test type buttons are all visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "UI End-to-End" })).toBeVisible();
    await expect(page.getByRole("button", { name: "API / Integration" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Unit Test" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mobile (Appium)" })).toBeVisible();
  });

  test("pattern buttons are all visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Page Object Model" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Simple / Flat" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Fixture-based" })).toBeVisible();
  });

  test("example links populate the textarea", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await page.getByRole("button", { name: /Example 1/i }).click();
    const value = await textarea.inputValue();
    expect(value.length).toBeGreaterThan(20);
  });

  test("clicking Generate without description shows error", async ({ page }) => {
    await page.getByRole("button", { name: /Generate Test Code/i }).click();
    await expect(page.getByText(/Please describe your feature/i)).toBeVisible();
  });

  test("generate button becomes disabled while streaming", async ({ page }) => {
    await page.locator("textarea").first().fill("Login page with email and password fields");
    const generateBtn = page.getByRole("button", { name: /Generate Test Code/i });
    await generateBtn.click();
    await expect(generateBtn).toBeDisabled();
    // Wait for generation to complete
    await expect(generateBtn).toBeEnabled({ timeout: 15_000 });
  });

  test("code output block appears after generation", async ({ page }) => {
    await page.locator("textarea").first().fill("Shopping cart with add and remove items");
    await page.getByRole("button", { name: /Generate Test Code/i }).click();
    // Code output div appears (contains line numbers and code)
    await expect(page.locator(".code-block, pre, code").first()).toBeVisible({ timeout: 15_000 });
  });

  test("Copy button appears after generation completes", async ({ page }) => {
    await page.locator("textarea").first().fill("User registration form validation");
    await page.getByRole("button", { name: /Generate Test Code/i }).click();
    await expect(page.getByRole("button", { name: /Generate Test Code/i })).toBeEnabled({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Copy/i })).toBeVisible();
  });

  test("Download button appears after generation completes", async ({ page }) => {
    await page.locator("textarea").first().fill("API endpoint POST /users returns 201 on valid data");
    await page.getByRole("button", { name: /Generate Test Code/i }).click();
    await expect(page.getByRole("button", { name: /Generate Test Code/i })).toBeEnabled({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Download/i })).toBeVisible();
  });

  test("switching framework updates selected state", async ({ page }) => {
    const cypressBtn = page.getByRole("button", { name: "Cypress (TypeScript)" });
    await cypressBtn.click();
    await expect(cypressBtn).toHaveClass(/violet/);
  });

  test("Add context section expands on click", async ({ page }) => {
    await page.getByRole("button", { name: /Add URLs/i }).click();
    await expect(page.locator("textarea").nth(1)).toBeVisible();
  });

  test("Doc Generator nav link navigates to /docs", async ({ page }) => {
    await page.getByRole("link", { name: "Doc Generator" }).click();
    await expect(page).toHaveURL(/\/docs/);
  });
});
