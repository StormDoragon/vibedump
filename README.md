# Vibedump

> **Paste code → run in real Node browser sandbox → Grok roasts it → commit to GitHub → tweet the diff → pump.fun launch. The chaotic dev playground that actually ships.**

[![CI](https://github.com/sarcasticapes/vibedump/actions/workflows/ci.yml/badge.svg)](https://github.com/sarcasticapes/vibedump/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/sarcasticapes/vibedump?style=social)](https://github.com/sarcasticapes/vibedump)

## ✨ Features

### 🖥️ True Browser-Native Full-Stack Sandbox
- **WebContainers GA** — Real Node.js + npm/pnpm in your browser
- Zero remote VMs, 100% private execution
- Any framework works: Express, Next.js, Remix, Fastify, etc.

### 🤖 Grok-4 Native AI
- Savage code roasts with maximum sarcasm
- Auto-refactors + improvement suggestions
- Vibe scoring (0-100)

### ⛓️ Real On-Chain Vibe Commits
- Solana compressed accounts store code hashes + proof
- Verifiable, immutable records
- Pump.fun integration for token launches

### 📌 Seamless GitHub + X + Solana
- Auto-commit diffs to your repo (GitHub App OAuth)
- Tweet vibe scores + diffs to X (Twitter)
- Launch tokens on pump.fun in one click

### ⚡ Monorepo S-tier Stack
- **Turborepo** + **pnpm workspaces** — Lightning builds
- **Biome** — 100x faster than ESLint/Prettier
- **Next.js 15** (App Router, Turbopack, PRR)
- **TypeScript** strict mode

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation

```bash
git clone https://github.com/sarcasticapes/vibedump.git
cd vibedump
pnpm install
cp .env.example .env.local
```

### Configure `.env.local`

```env
# Clerk Auth (GitHub + X + Solana)
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# xAI Grok-4
XAI_API_KEY=xai-xxx

# GitHub App
GITHUB_APP_ID=xxx
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# X (Twitter) API v2
NEXT_PUBLIC_X_CLIENT_ID=xxx
X_CLIENT_SECRET=xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
vibedump/
├── apps/
│   ├── web/                     # Next.js 15 frontend
│   │   ├── app/                 # App Router
│   │   ├── components/          # React components
│   │   ├── lib/                 # WebContainer, Grok, GitHub, X utils
│   │   └── hooks/
│   └── contracts/               # Anchor Solana programs
│       └── programs/vibedump/   # Bonding curve + vibe store
├── packages/
│   ├── ui/                      # shadcn/Radix components
│   ├── sdk/                     # Vibe SDK (analyzer, patcher, pump)
│   ├── types/                   # Shared TypeScript types
│   └── eslint-config/           # Shared Biome config
├── .github/
│   ├── workflows/               # CI/CD (ci.yml, deploy.yml)
│   └── ISSUE_TEMPLATE/
├── turbo.json
├── pnpm-workspace.yaml
├── biome.json
└── LICENSE (MIT)
```

## 🏗️ Tech Stack (2026 S-tier)

| Layer              | Tech                           | Why                         |
|--------------------|---------------------------------|-----------------------------|
| **Framework**      | Next.js 15 + React 19 + Turbopack | Edge Server Actions, streaming |
| **Language**       | TypeScript (strict)            | Full type safety            |
| **Linter**         | Biome (not ESLint/Prettier)    | 100x faster                 |
| **Monorepo**       | Turborepo + pnpm workspaces    | <1s cold rebuild            |
| **UI**             | Tailwind + shadcn/ui + Radix   | Beautiful + accessible      |
| **Editor**         | Monaco Editor (VS Code)        | Real LSP + themes           |
| **Sandbox**        | @webcontainer/api (StackBlitz) | Full Node in browser        |
| **AI**             | xAI Grok-4 API                 | Native sarcasm + code gen   |
| **Auth**           | Clerk (GitHub + X + Solana)    | One-click everything        |
| **Database**       | Supabase (Postgres + Realtime) | Edge + auth included        |
| **Git**            | Octokit + GitHub App           | No PAT hell                 |
| **X Integration**  | Twitter API v2 OAuth 2.0 PKCE  | Real posts                  |
| **Blockchain**     | Solana + Anchor 0.30           | Pump.fun fork               |
| **Deploy**         | Vercel (Edge Functions)        | One-click, <3s cold start   |
| **CI/CD**          | GitHub Actions + Turbo cache   | Zero config                 |

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────┐
│  User (Browser)                                       │
│  ├─ Clerk Auth (GitHub/X/Solana)                    │
│  ├─ Monaco Editor                                    │
│  └─ WebContainers API                               │
└───────────┬─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────┐
│  Next.js 15 Edge (Vercel)                           │
│  ├─ Server Action: "Vibe Run"                       │
│  │  ├─ Mount code → WebContainer (client-side)      │
│  │  ├─ Spawn npm install + node                     │
│  │  └─ Stream logs back (SSE)                       │
│  ├─ Grok-4 Roast (async)                           │
│  ├─ GitHub App commit (Octokit)                     │
│  ├─ X post (Twitter API v2)                         │
│  └─ Solana Anchor call (pump launch)                │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Development

### Scripts

```bash
# Development
pnpm dev           # Start all apps (Next.js + Solana)

# Building
pnpm build         # Build all packages (Turbo cache)

# Quality
pnpm lint          # Lint with Biome
pnpm type-check    # TypeScript check
pnpm test          # Run tests
pnpm format        # Auto-format

# CI
pnpm ci            # Run lint + type-check + test
```

### Adding a New Package

```bash
mkdir -p packages/my-package/src
cd packages/my-package

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@vibedump/my-package",
  "version": "0.1.0",
  "private": true
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json"
}
EOF
```

## 📖 Documentation

- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [API Reference](docs/api.md) (coming soon)
- [Deployment Guide](docs/deploy.md) (coming soon)

## 📊 Status

- [x] Monorepo setup (Turborepo + pnpm)
- [x] Next.js 15 web app
- [x] WebContainer library
- [x] Grok-4 integration
- [x] GitHub API integration
- [x] Solana Anchor contracts
- [ ] X (Twitter) posting
- [ ] Pump.fun UI
- [ ] Database schema
- [ ] E2E tests
- [ ] Docs site

## 🎉 Contributing

We love PRs! See [CONTRIBUTING.md](CONTRIBUTING.md) for vibe-first guidelines.

### Top Priorities

1. WebContainer streaming improvements
2. X (Twitter) API integration
3. Pump.fun UI + token launch
4. Database schema & migrations
5. End-to-end tests

## 📜 License

MIT — See [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [WebContainers](https://webcontainers.io/) by StackBlitz
- [xAI Grok-4](https://console.x.ai/) for the sarcasm engine
- [Solana](https://solana.com/) ecosystem
- [Vercel](https://vercel.com/) for edge infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

**Built with chaos by [Sarcastic Apes](https://github.com/sarcasticapes/vibedump)** 🦧✨

⭐ **Star us on GitHub** if you vibes with this vibe dump
"Paste code → run in real Node browser sandbox → Grok roasts it → commit to GitHub → tweet the diff → pump.fun launch. The chaotic dev playground that actually ships.
