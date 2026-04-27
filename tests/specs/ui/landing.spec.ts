import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page title is correct", async ({ page }) => {
    await expect(page).toHaveTitle(/TestForge/i);
  });

  test("nav shows brand name and both CTA links", async ({ page }) => {
    await expect(page.getByText("TestForge").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Test Generator" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Doc Generator" })).toBeVisible();
  });

  test("hero heading is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Generate test code/i)).toBeVisible();
  });

  test("hero has Generate Tests and Generate Docs CTA buttons", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Generate Tests/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Generate Docs/i }).first()).toBeVisible();
  });

  test("framework pills render all 6 frameworks", async ({ page }) => {
    for (const fw of ["Playwright", "Cypress", "Selenium", "WebdriverIO", "pytest", "Robot Framework"]) {
      await expect(page.getByText(fw, { exact: true })).toBeVisible();
    }
  });

  test("features section shows 6 cards", async ({ page }) => {
    await expect(page.getByText("10+ Test Frameworks")).toBeVisible();
    await expect(page.getByText("Full SDLC Docs")).toBeVisible();
    await expect(page.getByText("Pattern Aware")).toBeVisible();
    await expect(page.getByText("Copy & Download")).toBeVisible();
  });

  test("SDLC doc type pills are visible", async ({ page }) => {
    for (const doc of ["Test Strategy", "Test Plan", "User Stories", "Release Notes"]) {
      await expect(page.getByText(doc, { exact: true })).toBeVisible();
    }
  });

  test("Generate Tests CTA navigates to /generate", async ({ page }) => {
    await page.getByRole("link", { name: /Generate Tests →/i }).first().click();
    await expect(page).toHaveURL(/\/generate/);
  });

  test("Generate Docs CTA navigates to /docs", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Generate Docs →/i }).first().click();
    await expect(page).toHaveURL(/\/docs/);
  });

  test("footer shows author credit with GitHub link", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Tajveed Aslam" })).toBeVisible();
  });
});
