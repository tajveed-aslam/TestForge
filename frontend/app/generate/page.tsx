"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CodeOutput } from "@/components/CodeOutput";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Option { value: string; label: string; group?: string; }

const FRAMEWORK_GROUPS = [
  { group: "Playwright", options: ["playwright-typescript", "playwright-javascript"] },
  { group: "Cypress", options: ["cypress-typescript", "cypress-javascript"] },
  { group: "Selenium", options: ["selenium-python", "selenium-java", "selenium-csharp"] },
  { group: "WebdriverIO", options: ["webdriverio-typescript"] },
  { group: "pytest", options: ["pytest-python"] },
  { group: "Robot Framework", options: ["robot-framework"] },
];

const FRAMEWORK_LABELS: Record<string, string> = {
  "playwright-typescript": "Playwright (TypeScript)",
  "playwright-javascript": "Playwright (JavaScript)",
  "cypress-typescript": "Cypress (TypeScript)",
  "cypress-javascript": "Cypress (JavaScript)",
  "selenium-python": "Selenium (Python)",
  "selenium-java": "Selenium (Java)",
  "selenium-csharp": "Selenium (C#)",
  "webdriverio-typescript": "WebdriverIO (TypeScript)",
  "pytest-python": "pytest (Python)",
  "robot-framework": "Robot Framework",
};

const TEST_TYPES: Option[] = [
  { value: "ui-e2e", label: "UI End-to-End" },
  { value: "api", label: "API / Integration" },
  { value: "unit", label: "Unit Test" },
  { value: "mobile", label: "Mobile (Appium)" },
];

const PATTERNS: Option[] = [
  { value: "pom", label: "Page Object Model" },
  { value: "simple", label: "Simple / Flat" },
  { value: "fixture", label: "Fixture-based" },
];

const EXAMPLES = [
  "User login form with email and password. Valid login navigates to dashboard. Wrong password shows error. Locked account shows specific message.",
  "Shopping cart: add item, update quantity, remove item, verify subtotal recalculates correctly.",
  "REST API POST /auth/register: valid payload creates user (201), duplicate email returns 409, missing fields return 422.",
  "Password reset flow: request reset email, click link, enter new password, confirm change works.",
];

export default function GeneratePage() {
  const [description, setDescription] = useState("");
  const [framework, setFramework] = useState("playwright-typescript");
  const [testType, setTestType] = useState("ui-e2e");
  const [pattern, setPattern] = useState("pom");
  const [additionalContext, setAdditionalContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [code, setCode] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!description.trim()) { setError("Please describe your feature or test scenario."); return; }
    setError("");
    setCode("");
    setIsStreaming(true);

    try {
      const res = await fetch(`${API}/generate/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, framework, test_type: testType, pattern, additional_context: additionalContext }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Generation failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const chunk = line.slice(6);
            if (chunk === "[DONE]") { setIsStreaming(false); return; }
            setCode((prev) => prev + chunk);
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-white/5 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg gradient-text">TestForge</Link>
        <nav className="flex items-center gap-3">
          <span className="text-sm text-white font-medium">Test Generator</span>
          <Link href="/docs" className="btn-ghost text-xs py-1.5 px-3">Doc Generator</Link>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Test Code Generator</h1>
          <p className="text-gray-500 text-sm">Describe your feature, choose a framework, and get production-ready test code.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left — input */}
          <div className="space-y-5">
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Feature / Scenario Description <span className="text-red-400">*</span>
              </label>
              <textarea
                className="input-base min-h-[140px] resize-y"
                placeholder="e.g. User login with email and password. Valid credentials navigate to dashboard. Wrong password shows error message. Empty fields show validation errors."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {/* Examples */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setDescription(ex)}
                    className="text-xs text-gray-600 hover:text-violet-400 underline underline-offset-2 transition-colors text-left"
                  >
                    Example {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional context toggle */}
            <div>
              <button
                onClick={() => setShowContext(!showContext)}
                className="text-xs text-gray-500 hover:text-violet-400 transition-colors flex items-center gap-1"
              >
                {showContext ? "▾" : "▸"} Add URLs, API specs, or extra context (optional)
              </button>
              {showContext && (
                <textarea
                  className="input-base mt-2 min-h-[80px] resize-y"
                  placeholder="e.g. Base URL: http://localhost:3000. Login endpoint: POST /auth/login. Admin has role 'admin'."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                />
              )}
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={isStreaming}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming ? "Generating…" : "Generate Test Code →"}
            </button>

            <CodeOutput code={code} framework={framework} isStreaming={isStreaming} />
          </div>

          {/* Right — config */}
          <div className="space-y-5 lg:border-l lg:border-white/5 lg:pl-6">
            {/* Framework */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-3">Framework</label>
              <div className="space-y-3">
                {FRAMEWORK_GROUPS.map(({ group, options }) => (
                  <div key={group}>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">{group}</p>
                    <div className="space-y-1">
                      {options.map((fw) => (
                        <button
                          key={fw}
                          onClick={() => setFramework(fw)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                            framework === fw
                              ? "bg-violet-600/20 border border-violet-500/40 text-violet-300"
                              : "text-gray-400 hover:bg-gray-800 border border-transparent"
                          }`}
                        >
                          {FRAMEWORK_LABELS[fw]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test type */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Test Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TEST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTestType(t.value)}
                    className={`px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      testType === t.value
                        ? "bg-violet-600/20 border border-violet-500/40 text-violet-300"
                        : "text-gray-400 hover:bg-gray-800 border border-white/5"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Code Pattern</label>
              <div className="space-y-1">
                {PATTERNS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPattern(p.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      pattern === p.value
                        ? "bg-violet-600/20 border border-violet-500/40 text-violet-300"
                        : "text-gray-400 hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
