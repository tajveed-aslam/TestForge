import { test, expect } from "@playwright/test";

test.describe("GET /health", () => {
  test("returns 200 with status ok", async ({ request }) => {
    const res = await request.get("/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("TestForge API");
  });
});
