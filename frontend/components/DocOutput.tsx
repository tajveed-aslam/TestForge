"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
  isStreaming: boolean;
  docType: string;
}

export function DocOutput({ content, isStreaming, docType }: Props) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"rendered" | "raw">("rendered");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docType}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!content && !isStreaming) return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
            <button
              onClick={() => setView("rendered")}
              className={`px-3 py-1 transition-colors ${view === "rendered" ? "bg-violet-600/30 text-violet-300" : "text-gray-500 hover:text-gray-300"}`}
            >
              Preview
            </button>
            <button
              onClick={() => setView("raw")}
              className={`px-3 py-1 transition-colors ${view === "raw" ? "bg-violet-600/30 text-violet-300" : "text-gray-500 hover:text-gray-300"}`}
            >
              Markdown
            </button>
          </div>
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Generating…
            </span>
          )}
        </div>
        {content && !isStreaming && (
          <div className="flex gap-2">
            <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button onClick={handleDownload} className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              ↓ Download .md
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="overflow-auto max-h-[700px]">
        {view === "rendered" ? (
          <div className="p-6 doc-prose text-sm leading-relaxed">
            <ReactMarkdown>{content || " "}</ReactMarkdown>
          </div>
        ) : (
          <pre className="p-6 text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {content}
          </pre>
        )}
      </div>

      <style>{`
        .doc-prose h1, .doc-prose h2, .doc-prose h3, .doc-prose h4 { color: #f9fafb; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
        .doc-prose h1 { font-size: 1.25rem; }
        .doc-prose h2 { font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.4em; }
        .doc-prose h3 { font-size: 0.95rem; }
        .doc-prose p { color: #d1d5db; margin-bottom: 0.75em; }
        .doc-prose ul, .doc-prose ol { color: #d1d5db; padding-left: 1.5em; margin-bottom: 0.75em; }
        .doc-prose li { margin-bottom: 0.25em; }
        .doc-prose strong { color: #f3f4f6; font-weight: 600; }
        .doc-prose code { color: #c4b5fd; background: #1f2937; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.85em; }
        .doc-prose pre { background: #111827; border-radius: 8px; padding: 1em; overflow-x: auto; margin-bottom: 1em; }
        .doc-prose table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-size: 0.8rem; }
        .doc-prose th { background: #1f2937; color: #e5e7eb; padding: 0.5em 0.75em; text-align: left; border: 1px solid rgba(255,255,255,0.08); }
        .doc-prose td { color: #9ca3af; padding: 0.4em 0.75em; border: 1px solid rgba(255,255,255,0.05); }
        .doc-prose blockquote { border-left: 3px solid #7c3aed; padding-left: 1em; color: #9ca3af; margin: 0.75em 0; }
      `}</style>
    </div>
  );
}
