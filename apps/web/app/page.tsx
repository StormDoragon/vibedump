"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { reviewCodeAction } from "../lib/actions";
import type { ReviewResult } from "../lib/grok";
import type { RunLanguage } from "../lib/webcontainer";

// Monaco touches browser-only APIs, so load it client-side only.
const MonacoCodeEditor = dynamic(
  () => import("../components/monaco-editor").then((m) => m.MonacoCodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-lg border border-slate-700 bg-[#1e1e1e] font-mono text-sm text-slate-500">
        Loading editor…
      </div>
    ),
  },
);

const STARTER_CODE = `// Paste any Node.js snippet and hit "Run vibe".
// External npm imports are auto-installed in the sandbox.
const greeting = "Hello, vibe!";
console.log(greeting.toUpperCase());

for (let i = 1; i <= 3; i++) {
  console.log(\`tick \${i}\`);
}
`;

type Tone = "serious" | "roast";

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

const severityStyles: Record<string, string> = {
  error: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-200",
};

export default function PlaygroundPage() {
  const [code, setCode] = useState(STARTER_CODE);
  const [language, setLanguage] = useState<RunLanguage>("js");
  const [tone, setTone] = useState<Tone>("serious");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consoleRef = useRef<HTMLDivElement>(null);

  // Keep the console scrolled to the latest output.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run to scroll whenever output changes
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  const busy = running || reviewing;

  async function handleRun() {
    if (busy || !code.trim()) return;
    setError(null);
    setReview(null);
    setOutput("");

    // 1. Run the code in the browser sandbox, streaming logs as they arrive.
    setRunning(true);
    try {
      const { runCode } = await import("../lib/webcontainer");
      await runCode({
        code,
        language,
        onOutput: (chunk) => setOutput((prev) => prev + chunk),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to run code in the sandbox.";
      setOutput((prev) => `${prev}\n[vibedump] error: ${message}\n`);
    } finally {
      setRunning(false);
    }

    // 2. Ask the AI to review the code.
    setReviewing(true);
    try {
      const result = await reviewCodeAction({ code, tone });
      if (result.error) {
        setError(result.error);
      } else if (result.review) {
        setReview(result.review);
      }
    } catch {
      setError("AI review failed. Check that XAI_API_KEY is configured.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-white">✨ Vibedump</div>
            <span className="font-mono text-xs text-slate-400">
              v0.1.0 — run &amp; review
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="https://github.com/sarcasticapes/vibedump"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Editor */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">📝 Code</h2>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as RunLanguage)}
                  disabled={busy}
                  className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="js">JavaScript</option>
                  <option value="ts">TypeScript</option>
                </select>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  disabled={busy}
                  className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="serious">Serious review</option>
                  <option value="roast">Roast me</option>
                </select>
              </div>
            </div>

            <MonacoCodeEditor
              value={code}
              onChange={setCode}
              language={language}
              disabled={busy}
            />

            <button
              type="button"
              onClick={handleRun}
              disabled={busy || !code.trim()}
              className="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running
                ? "⏳ Running in sandbox..."
                : reviewing
                  ? "🤖 Reviewing..."
                  : "🚀 Run vibe"}
            </button>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-lg font-bold text-white">▶️ Console</h2>
              <div
                ref={consoleRef}
                className="h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-slate-300"
              >
                {output || (
                  <span className="text-slate-500">Run code to see output...</span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {tone === "roast" ? "🔥 Roast" : "🧐 Review"}
                </h2>
                {review && (
                  <div className="text-right">
                    <span
                      className={`text-2xl font-bold ${scoreColor(review.score)}`}
                    >
                      {review.score}
                    </span>
                    <span className="text-sm text-slate-500">/100</span>
                  </div>
                )}
              </div>

              {error && (
                <p className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {error}
                </p>
              )}

              {!error && !review && (
                <p className="text-sm text-slate-500">
                  {reviewing ? "Thinking..." : "Run code to get a review..."}
                </p>
              )}

              {review && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-200">{review.summary}</p>

                  {review.issues.length > 0 && (
                    <ul className="space-y-2">
                      {review.issues.map((issue) => (
                        <li
                          key={`${issue.severity}:${issue.line ?? ""}:${issue.message}`}
                          className={`rounded-md border px-3 py-2 text-sm ${
                            severityStyles[issue.severity] ?? severityStyles.info
                          }`}
                        >
                          <span className="font-semibold uppercase">
                            {issue.severity}
                          </span>
                          {issue.line ? (
                            <span className="opacity-70"> · line {issue.line}</span>
                          ) : null}
                          <span className="block text-slate-100">
                            {issue.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {review.suggestions.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-slate-300">
                        Suggestions
                      </h3>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                        {review.suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled
                  title="GitHub commit — coming soon"
                  className="cursor-not-allowed rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-600"
                >
                  📌 Commit
                </button>
                <button
                  type="button"
                  disabled
                  title="X post — coming soon"
                  className="cursor-not-allowed rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-600"
                >
                  𝕏 Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
