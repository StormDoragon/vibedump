# Contributing to Vibedump

Thanks for your interest in contributing to Vibedump! We're building the most sarcastic code sandbox in crypto. 🚀

## Vibe-First Guidelines

1. **Code First, Comments Later** — Your code should be self-explanatory. Sarcasm in comments is applauded.
2. **Type Everything** — We use strict TypeScript. No `any` unless it's for comedy purposes.
3. **Test Your Vibes** — New features need tests. Roasts are optional but encouraged.
4. **Monorepo Respect** — Changes across packages? Run `pnpm build` to ensure nothing breaks.

## Setup

```bash
git clone https://github.com/sarcasticapes/vibedump.git
cd vibedump
pnpm install
cp .env.example .env.local
# Fill in your API keys
pnpm dev
```

## Development Workflow

1. **Create a feature branch**: `git checkout -b feat/my-vibe`
2. **Make your changes** in the relevant package (apps/web, packages/sdk, etc.)
3. **Run linter & type-check**: `pnpm lint && pnpm type-check`
4. **Commit**: `git commit -m "feat: add my-vibe feature"`
5. **Push & open PR**: `git push origin feat/my-vibe`

## What We're Building

- **WebContainer Integration** — Real Node.js in the browser
- **Grok-4 Roasting** — AI-powered code feedback with maximum sarcasm
- **GitHub Integration** — Auto-commit diffs
- **X (Twitter) Integration** — Post your vibes
- **Solana On-Chain** — Pump.fun integration + vibe proof

## Code Style

We use **Biome** for linting and formatting. No configuration wars:

```bash
pnpm format  # Auto-fix everything
pnpm lint    # Check for issues
```

## Package Structure

```
apps/web/           # Next.js 15 frontend
apps/contracts/     # Anchor Solana programs
packages/ui/        # shadcn components
packages/sdk/       # Vibe SDK
packages/types/     # Shared types
```

## Need Help?

- Open an issue with the `question` label
- Join our Discord (coming soon)
- Check existing issues/PRs

## License

By contributing, you agree your code is licensed under MIT.

---

**Most Important**: Have fun. We ship memes, not panic.
