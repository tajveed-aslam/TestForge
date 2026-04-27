import { test, expect } from "@playwright/test";

test.describe("GET /docs/types", () => {
  test("returns all 8 document types", async ({ request }) => {
    const res = await request.get("/docs/types");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.doc_types).toBeDefined();
    expect(body.doc_types.length).toBe(8);
  });

  test("includes all expected doc type values", async ({ request }) => {
    const res = await request.get("/docs/types");
    const { doc_types } = await res.json();
    const values: string[] = doc_types.map((d: { value: string }) => d.value);
    const expected = [
      "test-strategy", "test-plan", "rtm",
      "user-stories", "sprint-planning",
      "bug-report", "release-notes", "api-docs",
    ];
    for (const val of expected) {
      expect(values, `${val} should be in doc_types`).toContain(val);
    }
  });

  test("each doc type has value, label, and group", async ({ request }) => {
    const res = await request.get("/docs/types");
    const { doc_types } = await res.json();
    for (const dt of doc_types) {
      expect(dt.value).toBeTruthy();
      expect(dt.label).toBeTruthy();
      expect(dt.group).toBeTruthy();
    }
  });
});

test.describe("POST /docs/generate", () => {
  test("valid payload returns 200 with text/event-stream", async ({ request }) => {
    const res = await request.post("/docs/generate", {
      data: {
        description: "E-commerce web app with cart, checkout, and order tracking",
        doc_type:    "test-strategy",
      },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/event-stream");
    const text = await res.text();
    expect(text.length).toBeGreaterThan(100);
    expect(text).toContain("data:");
    expect(text).toContain("[DONE]");
  });

  test("missing description returns 422", async ({ request }) => {
    const res = await request.post("/docs/generate", {
      data: { description: "", doc_type: "test-plan" },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.detail).toBeDefined();
  });

  test("invalid doc_type returns 422 with helpful message", async ({ request }) => {
    const res = await request.post("/docs/generate", {
      data: { description: "Some project", doc_type: "invalid-type" },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.detail).toContain("Invalid doc_type");
  });

  test("all 8 doc types are accepted", async ({ request }) => {
    const docTypes = [
      "test-strategy", "test-plan", "rtm",
      "user-stories", "sprint-planning",
      "bug-report", "release-notes", "api-docs",
    ];
    for (const doc_type of docTypes) {
      const res = await request.post("/docs/generate", {
        data: { description: "Project description for testing", doc_type },
      });
      expect(res.status(), `doc_type ${doc_type} should be accepted`).toBe(200);
    }
  });

  test("streamed content for test-strategy contains markdown structure", async ({ request }) => {
    const res = await request.post("/docs/generate", {
      data: {
        description: "SaaS project management tool with user auth and task boards",
        doc_type:    "test-strategy",
      },
    });
    const raw = await res.text();
    // Strip SSE formatting to get the actual content
    const content = raw
      .split("\n")
      .filter((l) => l.startsWith("data: ") && l !== "data: [DONE]")
      .map((l) => l.slice(6))
      .join("");
    expect(content).toContain("#");   // Has markdown headings
    expect(content.length).toBeGreaterThan(200);
  });
});
