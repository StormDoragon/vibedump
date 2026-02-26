# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Vibedump, please **do not** open a public issue. Instead:

1. Email `security@vibedump.com` (or open an issue on GitHub and we'll redirect)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
3. Allow 7-10 days for us to respond and develop a fix

## Security Considerations

### WebContainer Sandbox
- Code runs in **client-side WebContainer** — we don't execute on servers
- User code is **not** sent to our servers by default
- If you opt-in to Grok roasting, only the code is sent (no execution context)

### On-Chain Data
- Solana transactions include code hashes and vibe scores
- These are **immutable and public** — don't include secrets in vibe code

### API Keys
- Never hardcode API keys in vibe code
- `.env.local` is Git-ignored — keep it local
- Rotate keys if exposed

### GitHub Integration
- We use GitHub App OAuth — **no PAT tokens**
- Permissions are minimal: read/write repo contents, webhooks only

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ (current)  |
| < 0.1   | ❌         |

## Disclosure Timeline

- **Day 0**: You report → we acknowledge
- **Day 1-3**: We investigate and develop fix
- **Day 4-7**: We release patch version
- **Day 7+**: Public disclosure with credit to you

Thank you for keeping Vibedump safe! 🔒
