import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TestForge — AI Test & SDLC Document Generator",
  description:
    "Generate production-ready test code in Playwright, Cypress, Selenium, WebdriverIO, pytest, Robot Framework and more. Plus full SDLC documentation — all powered by AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-950 text-gray-100">{children}</body>
    </html>
  );
}
