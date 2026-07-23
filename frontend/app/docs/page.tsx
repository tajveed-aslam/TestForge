"use client";
import { useState } from "react";
import Link from "next/link";
import { DocOutput } from "@/components/DocOutput";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const DOC_GROUPS = [
  {
    group: "QA Planning",
    types: [
      { value: "test-strategy", label: "Test Strategy", desc: "Testing levels, tools, coverage goals, risks" },
      { value: "test-plan", label: "Test Plan (IEEE 829)", desc: "Scope, schedule, criteria, deliverables" },
      { value: "rtm", label: "Traceability Matrix", desc: "Requirement → test case mapping table" },
    ],
  },
  {
    group: "Agile",
    types: [
      { value: "user-stories", label: "User Stories", desc: "Stories with Given/When/Then acceptance criteria" },
      { value: "sprint-planning", label: "Sprint Planning", desc: "Backlog, capacity, DoD, blockers" },
    ],
  },
  {
    group: "Execution & Delivery",
    types: [
      { value: "bug-report", label: "Bug Report Template", desc: "Template + 3 sample reports" },
      { value: "release-notes", label: "Release Notes", desc: "Features, fixes, known issues, sign-off" },
      { value: "api-docs", label: "API Documentation", desc: "Endpoints, request/response schemas, curl examples" },
    ],
  },
];

const EXAMPLES = [
  "AZMart — an e-commerce platform with user auth, product catalogue, cart, checkout, order tracking, admin dashboard, and multi-currency support. Tech: Next.js 14 + FastAPI + SQLite.",
  "TestForge — AI-powered test code and SDLC document generator. Users describe a feature, choose a framework, and receive ready-to-run test files. Tech: Next.js + FastAPI + Gemini API.",
  "Mobile banking app with biometric login, fund transfers, bill payments, and transaction history. iOS + Android. REST API backend.",
];

export default function DocsPage() {
  const [description, setDescription] = useState("");
  const [docType, setDocType] = useState("test-strategy");
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!description.trim()) { setError("Please describe your project or feature."); return; }
    setError("");
    setContent("");
    setIsStreaming(true);

    try {
      const res = await fetch(`${API}/docs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, doc_type: docType }),
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
            setContent((prev) => prev + chunk);
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsStreaming(false);
    }
  };

  const selectedLabel = DOC_GROUPS.flatMap((g) => g.types).find((t) => t.value === docType)?.label ?? docType;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-white/5 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg gradient-text">TestForge</Link>
        <nav className="flex items-center gap-3">
          <Link href="/generate" className="btn-ghost text-xs py-1.5 px-3">Test Generator</Link>
          <span className="text-sm text-white font-medium">Doc Generator</span>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">SDLC Document Generator</h1>
          <p className="text-gray-500 text-sm">Describe your project. Choose a document type. Get a professional, ready-to-use document.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Left — input + output */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Project / Feature Description <span className="text-red-400">*</span>
              </label>
              <textarea
                className="input-base min-h-[140px] resize-y"
                placeholder="Describe your project: what it does, key features, tech stack, team size, users. The more detail, the better the document."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
              {isStreaming ? `Generating ${selectedLabel}…` : `Generate ${selectedLabel} →`}
            </button>

            <DocOutput content={content} isStreaming={isStreaming} docType={docType} />
          </div>

          {/* Right — doc type selector */}
          <div className="space-y-5 lg:border-l lg:border-white/5 lg:pl-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-3">Document Type</label>
              <div className="space-y-4" role="group" aria-label="Document Type">
                {DOC_GROUPS.map(({ group, types }) => (
                  <div key={group}>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">{group}</p>
                    <div className="space-y-1">
                      {types.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setDocType(t.value)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                            docType === t.value
                              ? "bg-violet-600/20 border border-violet-500/40"
                              : "hover:bg-gray-800 border border-transparent"
                          }`}
                        >
                          <p className={`text-xs font-medium ${docType === t.value ? "text-violet-300" : "text-gray-300"}`}>
                            {t.label}
                          </p>
                          <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
