import { test, expect } from "@playwright/test";

test.describe("SDLC Document Generator page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs");
  });

  test("page heading and description are visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "SDLC Document Generator" })).toBeVisible();
    await expect(page.getByText(/Describe your project/i)).toBeVisible();
  });

  test("all three doc groups are shown", async ({ page }) => {
    await expect(page.getByText("QA Planning", { exact: true })).toBeVisible();
    await expect(page.getByText("Agile", { exact: true })).toBeVisible();
    await expect(page.getByText("Execution & Delivery", { exact: true })).toBeVisible();
  });

  test("all 8 document type buttons are visible", async ({ page }) => {
    // Scoped to the Document Type group — several doc type labels (e.g.
    // "Test Strategy") are also substrings of the CTA button's dynamic
    // "Generate {label} →" text, so an unscoped query is ambiguous.
    const docTypeGroup = page.getByRole("group", { name: "Document Type" });
    const docTypes = [
      "Test Strategy",
      "Test Plan (IEEE 829)",
      "Traceability Matrix",
      "User Stories",
      "Sprint Planning",
      "Bug Report Template",
      "Release Notes",
      "API Documentation",
    ];
    for (const dt of docTypes) {
      await expect(docTypeGroup.getByRole("button", { name: dt })).toBeVisible();
    }
  });

  test("Test Strategy is selected by default", async ({ page }) => {
    const btn = page.getByRole("group", { name: "Document Type" }).getByRole("button", { name: "Test Strategy" });
    await expect(btn).toHaveClass(/violet/);
  });

  test("example links populate the textarea", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await page.getByRole("button", { name: /Example 1/i }).click();
    const value = await textarea.inputValue();
    expect(value.length).toBeGreaterThan(20);
  });

  test("clicking Generate without description shows error", async ({ page }) => {
    await page.getByRole("button", { name: /Generate Test Strategy →/i }).click();
    await expect(page.getByText(/Please describe your project/i)).toBeVisible();
  });

  test("generate button label reflects selected doc type", async ({ page }) => {
    await page.getByRole("button", { name: "User Stories" }).click();
    await expect(page.getByRole("button", { name: /Generate User Stories →/i })).toBeVisible();
  });

  test("generate button becomes disabled while streaming", async ({ page }) => {
    await page.locator("textarea").first().fill("Mobile banking app with transfers and bill payments");
    // "Generat" (not "Generate") matches both the idle "Generate X →" label
    // and the streaming "Generating X…" label — the button's accessible
    // name changes the instant streaming starts.
    const generateBtn = page.getByRole("button", { name: /Generat/i }).last();
    await generateBtn.click();
    await expect(generateBtn).toBeDisabled();
    await expect(generateBtn).toBeEnabled({ timeout: 25_000 });
  });

  test("document output appears after generation", async ({ page }) => {
    await page.locator("textarea").first().fill("E-commerce platform with cart, checkout, and order tracking");
    await page.getByRole("button", { name: /Generate Test Strategy →/i }).click();
    // Wait on the actual completion signal rather than the CTA button's
    // transient text (it reads "Generating Test Strategy…" mid-stream).
    await expect(page.getByRole("button", { name: "Preview" })).toBeVisible({ timeout: 25_000 });
    await expect(page.getByRole("button", { name: "Markdown" })).toBeVisible();
  });

  test("switching to Markdown view shows raw text", async ({ page }) => {
    await page.locator("textarea").first().fill("SaaS project management tool with Kanban boards");
    await page.getByRole("button", { name: /Generate Test Strategy →/i }).click();
    await expect(page.getByRole("button", { name: "Markdown" })).toBeVisible({ timeout: 25_000 });
    await page.getByRole("button", { name: "Markdown" }).click();
    await expect(page.locator("pre")).toBeVisible();
  });

  test("Copy button appears after generation completes", async ({ page }) => {
    await page.locator("textarea").first().fill("API gateway service with rate limiting and auth");
    await page.getByRole("button", { name: /Generate Test Strategy →/i }).click();
    await expect(page.getByRole("button", { name: /Copy/i })).toBeVisible({ timeout: 25_000 });
  });

  test("Download .md button appears after generation", async ({ page }) => {
    await page.locator("textarea").first().fill("Payment processing service");
    await page.getByRole("button", { name: /Generate Test Strategy →/i }).click();
    await expect(page.getByRole("button", { name: /Download .md/i })).toBeVisible({ timeout: 25_000 });
  });

  test("Test Generator nav link navigates to /generate", async ({ page }) => {
    await page.getByRole("link", { name: "Test Generator" }).click();
    await expect(page).toHaveURL(/\/generate/);
  });
});
