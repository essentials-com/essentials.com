# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in essentials.com, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@essentials.com**

Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgement**: within 48 hours
- **Initial assessment**: within 5 business days
- **Fix or mitigation**: depends on severity, targeting 30 days for critical issues

## Scope

This policy covers the essentials.com website, its Cloudflare Workers (proxy and stats), any scripts distributed in this repository, and vulnerabilities in dependency versions used by those components. Vulnerabilities in third-party services we do not operate are out of scope, though we may report them upstream where appropriate.

## Security Practices

- Branch protection is enabled on `main` (requires PR review)
- Automated dependency updates via Dependabot
- Secret patterns excluded via `.gitignore`
- No credentials are stored in the repository
- Worker secrets (API tokens) managed via `wrangler secret put`, not committed
