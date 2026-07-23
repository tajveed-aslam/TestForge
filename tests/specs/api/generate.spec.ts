import { test, expect } from "@playwright/test";

test.describe("GET /generate/options", () => {
  test("returns all framework groups", async ({ request }) => {
    const res = await request.get("/generate/options");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.frameworks).toBeDefined();
    expect(body.frameworks.length).toBeGreaterThanOrEqual(10);
    expect(body.test_types).toBeDefined();
    expect(body.patterns).toBeDefined();
  });

  test("includes Playwright, Cypress, Selenium in frameworks", async ({ request }) => {
    const res = await request.get("/generate/options");
    const { frameworks } = await res.json();
    const values: string[] = frameworks.map((f: { value: string }) => f.value);
    expect(values).toContain("playwright-typescript");
    expect(values).toContain("cypress-typescript");
    expect(values).toContain("selenium-python");
    expect(values).toContain("pytest-python");
    expect(values).toContain("robot-framework");
  });
});

test.describe("POST /generate/tests", () => {
  test("valid payload returns 200 with text/event-stream", async ({ request }) => {
    const res = await request.post("/generate/tests", {
      data: {
        description: "Login page with email and password",
        framework:   "playwright-typescript",
        test_type:   "ui-e2e",
        pattern:     "pom",
      },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/event-stream");
    const text = await res.text();
    expect(text.length).toBeGreaterThan(50);
    expect(text).toContain("data:");
  });

  test("streams [DONE] termination marker", async ({ request }) => {
    const res = await request.post("/generate/tests", {
      data: {
        description: "User registration form",
        framework:   "cypress-typescript",
        test_type:   "ui-e2e",
        pattern:     "simple",
      },
    });
    const text = await res.text();
    expect(text).toContain("[DONE]");
  });

  test("missing description returns 422", async ({ request }) => {
    const res = await request.post("/generate/tests", {
      data: {
        description: "   ",
        framework:   "playwright-typescript",
        test_type:   "ui-e2e",
        pattern:     "pom",
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.detail).toBeDefined();
  });

  test("invalid framework returns 422 with helpful message", async ({ request }) => {
    const res = await request.post("/generate/tests", {
      data: {
        description: "Some feature",
        framework:   "nonexistent-framework",
        test_type:   "ui-e2e",
        pattern:     "pom",
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.detail).toContain("Invalid framework");
  });

  test("invalid test_type returns 422", async ({ request }) => {
    const res = await request.post("/generate/tests", {
      data: {
        description: "Some feature",
        framework:   "playwright-typescript",
        test_type:   "invalid-type",
        pattern:     "pom",
      },
    });
    expect(res.status()).toBe(422);
  });

  test("invalid pattern returns 422", async ({ request }) => {
    const res = await request.post("/generate/tests", {
      data: {
        description: "Some feature",
        framework:   "playwright-typescript",
        test_type:   "ui-e2e",
        pattern:     "bad-pattern",
      },
    });
    expect(res.status()).toBe(422);
  });

  test("all 10 frameworks are accepted", async ({ request }) => {
    // Each request waits for the full mock stream to finish (~8s/word-delay
    // apiece) since request.post() collects the whole body — 10 sequential
    // calls comfortably exceed the default per-test timeout.
    test.setTimeout(240_000);
    const frameworks = [
      "playwright-typescript", "playwright-javascript",
      "cypress-typescript",    "cypress-javascript",
      "selenium-python",       "selenium-java",       "selenium-csharp",
      "webdriverio-typescript", "pytest-python",       "robot-framework",
    ];
    for (const framework of frameworks) {
      const res = await request.post("/generate/tests", {
        data: { description: "Simple login test", framework, test_type: "ui-e2e", pattern: "simple" },
      });
      expect(res.status(), `Framework ${framework} should be accepted`).toBe(200);
    }
  });

  test("all test types are accepted", async ({ request }) => {
    test.setTimeout(60_000);
    const testTypes = ["ui-e2e", "api", "unit", "mobile"];
    for (const test_type of testTypes) {
      const res = await request.post("/generate/tests", {
        data: { description: "Some feature", framework: "playwright-typescript", test_type, pattern: "simple" },
      });
      expect(res.status(), `Test type ${test_type} should be accepted`).toBe(200);
    }
  });

  test("additional_context is optional", async ({ request }) => {
    const res = await request.post("/generate/tests", {
      data: {
        description:        "Cart page with add/remove items",
        framework:          "pytest-python",
        test_type:          "api",
        pattern:            "fixture",
        additional_context: "Base URL: http://localhost:8000. Auth required via Bearer token.",
      },
    });
    expect(res.status()).toBe(200);
  });
});
