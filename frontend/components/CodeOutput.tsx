"use client";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const LANG_MAP: Record<string, string> = {
  "playwright-typescript": "typescript",
  "playwright-javascript": "javascript",
  "cypress-typescript": "typescript",
  "cypress-javascript": "javascript",
  "selenium-python": "python",
  "selenium-java": "java",
  "selenium-csharp": "csharp",
  "webdriverio-typescript": "typescript",
  "pytest-python": "python",
  "robot-framework": "robot",
};

interface Props {
  code: string;
  framework: string;
  isStreaming: boolean;
}

export function CodeOutput({ code, framework, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);
  const lang = LANG_MAP[framework] ?? "typescript";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext: Record<string, string> = {
      typescript: "ts", javascript: "js", python: "py",
      java: "java", csharp: "cs", robot: "robot",
    };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-test.${ext[lang] ?? "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!code && !isStreaming) return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/80 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-gray-500">{lang}</span>
          {isStreaming && (
            <span className="ml-2 flex items-center gap-1 text-xs text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Generating…
            </span>
          )}
        </div>
        {code && !isStreaming && (
          <div className="flex gap-2">
            <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button onClick={handleDownload} className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              ↓ Download
            </button>
          </div>
        )}
      </div>

      {/* Code */}
      <div className="overflow-auto max-h-[600px] text-xs leading-relaxed">
        <SyntaxHighlighter
          language={lang}
          style={atomOneDark}
          customStyle={{ background: "transparent", padding: "1.25rem", margin: 0, fontSize: "0.78rem" }}
          showLineNumbers
          lineNumberStyle={{ color: "#374151", userSelect: "none", paddingRight: "1rem" }}
        >
          {code || " "}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
