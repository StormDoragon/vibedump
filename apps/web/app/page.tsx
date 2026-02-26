"use client";

import { SignInButton, UserButton, auth } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function PlaygroundPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-white">
              ✨ Vibedump
            </div>
            <span className="text-xs font-mono text-slate-400">
              v0.1.0 — chaos-first
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <a
              href="https://github.com/sarcasticapes/vibedump"
              className="text-sm text-slate-300 hover:text-white transition"
            >
              GitHub
            </a>
            <a href="#" className="text-sm text-slate-300 hover:text-white transition">
              Docs
            </a>

            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton>
                <button className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition">
                  Sign In
                </button>
              </SignInButton>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Editor */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">
              📝 Code Editor
            </h2>
            <textarea
              placeholder="Paste your Node.js code here... \n\nconsole.log('Hello, Vibe!');"
              className="h-96 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />

            <button className="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 transition">
              🚀 Run Vibe
            </button>
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            {/* Console */}
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                ▶️ Console Output
              </h2>
              <div className="h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-slate-300">
                <p className="text-slate-500">
                  Run code to see output...
                </p>
              </div>
            </div>

            {/* Grok Roast */}
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                🔥 Grok Roast
              </h2>
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
                <p className="text-slate-500">
                  Waiting for roast...
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition">
                  📌 Commit
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition">
                  𝕏 Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-white">
            Why Vibedump Slaps
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: "🖥️",
                title: "Real Node in Browser",
                desc: "WebContainer GA — npm, pnpm, any framework. Zero remote VMs.",
              },
              {
                icon: "🤖",
                title: "Grok-4 Roasts",
                desc: "Sarcasm-native AI. Savage feedback + vibe score.",
              },
              {
                icon: "⛓️",
                title: "On-Chain Vibes",
                desc: "Solana compressed accounts. Pump.fun integration.",
              },
              {
                icon: "🚀",
                title: "GitHub Auto-Commit",
                desc: "One-click diff commits. No PAT hell.",
              },
              {
                icon: "𝕏",
                title: "X (Twitter) Posts",
                desc: "Tweet your vibe score + diff automatically.",
              },
              {
                icon: "⚡",
                title: "Edge-First",
                desc: "Vercel edge functions. <3s cold start.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-900 p-6"
              >
                <div className="text-2xl">{feature.icon}</div>
                <h3 className="font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
