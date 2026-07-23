import Link from "next/link";

const FRAMEWORKS = [
  "Playwright", "Cypress", "Selenium", "WebdriverIO", "pytest", "Robot Framework",
];

const DOCS = [
  "Test Strategy", "Test Plan", "User Stories", "RTM", "Bug Reports", "Release Notes", "Sprint Planning", "API Docs",
];

const FEATURES = [
  {
    icon: "⚡",
    title: "10+ Test Frameworks",
    desc: "Playwright, Cypress, Selenium (Java/Python/C#), WebdriverIO, pytest, Robot Framework — pick your stack.",
  },
  {
    icon: "📄",
    title: "Full SDLC Docs",
    desc: "Test Strategy, Test Plan, RTM, User Stories, Bug Reports, Release Notes, Sprint Planning, API Docs.",
  },
  {
    icon: "🎯",
    title: "Pattern Aware",
    desc: "Choose Page Object Model, fixture-based, or simple flat tests. The output matches your team's conventions.",
  },
  {
    icon: "⬇️",
    title: "Copy & Download",
    desc: "Generated code and documents are instantly copyable or downloadable — ready to drop into your project.",
  },
  {
    icon: "📡",
    title: "Live Streaming Output",
    desc: "Code and documents stream in token-by-token over SSE, so output appears as it's generated instead of a blank screen and a spinner.",
  },
  {
    icon: "🤖",
    title: "Powered by Gemini",
    desc: "Built on Google's Gemini API, with a zero-cost mock mode for demos that need no API key at all.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-white/5 px-6 h-14 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-bold text-lg gradient-text">TestForge</span>
        <div className="flex items-center gap-3">
          <Link href="/generate" className="btn-ghost text-xs py-2 px-4">Test Generator</Link>
          <Link href="/docs" className="btn-primary text-xs py-2 px-4">Doc Generator</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Powered by Gemini · 10+ frameworks · 8 document types
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Generate test code &<br />
            <span className="gradient-text">SDLC docs in seconds</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your feature. Choose your framework. Get production-ready test automation code
            and complete project documentation — instantly.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/generate" className="btn-primary px-7 py-3 text-base">
              Generate Tests →
            </Link>
            <Link href="/docs" className="btn-ghost px-7 py-3 text-base">
              Generate Docs →
            </Link>
          </div>
        </div>
      </section>

      {/* Framework pills */}
      <section className="px-6 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-5">Supported frameworks</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {FRAMEWORKS.map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-gray-900 border border-white/5 text-gray-400 text-xs">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Everything in one place
            </h2>
            <p className="text-gray-500 mt-2 text-sm">No more hunting for boilerplate or rewriting docs from scratch.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glow-card bg-gray-900/60 rounded-2xl border border-white/5 p-6">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doc types strip */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-5">SDLC document types</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {DOCS.map((d) => (
              <span key={d} className="px-3 py-1.5 rounded-full bg-gray-900 border border-white/5 text-gray-400 text-xs">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 border-t border-white/5 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Stop writing boilerplate.<br />
          <span className="gradient-text">Start shipping quality.</span>
        </h2>
        <p className="text-gray-500 text-sm mb-8">Free to use. No sign-up required.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/generate" className="btn-primary px-7 py-3">Generate Tests</Link>
          <Link href="/docs" className="btn-ghost px-7 py-3">Generate Docs</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-gray-700">
        © {new Date().getFullYear()} TestForge · Built by{" "}
        <a href="https://github.com/tajveed-aslam" className="hover:text-gray-500 transition-colors">
          Tajveed Aslam
        </a>
      </footer>
    </div>
  );
}
