# AI Agent Context

## Project Overview

Domain collection landing page for the essentials.* portfolio, hosted on GitHub Pages with Cloudflare for DNS, proxy, and analytics.

## Architecture

| Component | Service | Purpose |
|-----------|---------|---------|
| Hosting | GitHub Pages | Static site hosting from `main` branch |
| DNS | Cloudflare | DNS management for all essentials.* domains |
| Proxy | Cloudflare Worker (`essentials-proxy`) | Serves content from www.essentials.com to all domain aliases, injects per-domain analytics beacon |
| Analytics | Cloudflare Zone Analytics | Unique visitors from httpRequests1dGroups.uniq.uniques (filters bots) |
| Stats | Cloudflare Worker (`essentials-stats`) | Fetches Zone Analytics via GraphQL API, commits to stats.json on `stats` branch every 5 mins |

## Domains

All domains serve the same content; JavaScript detects the hostname and updates the display.
To add or remove a domain, edit `workers/domains.js` — all other files import from it.

- essentials.com (primary)
- essentials.net
- essentials.co.uk
- essentials.uk
- essentials.eu
- essentials.us
- essentials.fr
- essentials.cn (DNS unavailable, links to essentials.com, skipped in logo rotation)
- essentials.hk
- essentials.tw
- essentials.mobi

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Single-page site with all HTML, CSS, and JavaScript |
| `workers/domains.js` | **Single source of truth** for all domain config (TLDs, Zone IDs, analytics tokens, hreflang) |
| `stats.json` | Visitor statistics on `stats` branch, auto-updated by Cloudflare Worker |
| `CNAME` | GitHub Pages custom domain (www.essentials.com) |
| `workers/essentials-proxy.js` | Proxy worker source code (imports from `domains.js`) |
| `workers/essentials-stats.js` | Stats worker source code (imports from `domains.js`) |
| `workers/wrangler-*.toml` | Wrangler deployment configs |
| `workers/README.md` | Worker setup and deployment guide |

## Cloudflare Configuration

### DNS
- All domains use Cloudflare nameservers
- CNAME records point to `essentials-com.github.io` with proxy enabled (orange cloud)

### Workers
- **essentials-proxy**: Routes all domain aliases to fetch content from www.essentials.com. Uses `HTMLRewriter` to inject the correct Web Analytics beacon for each domain (tokens from `workers/domains.js`).
- **essentials-stats**: Cron-triggered (every 5 mins), queries Zone Analytics (`httpRequests1dGroups`) for all configured domains (zone IDs from `workers/domains.js`), commits stats.json to GitHub

### Zone IDs & Web Analytics Tokens

All per-domain configuration is defined in `workers/domains.js` (the `DOMAINS` array). Each entry contains:

- `tld` — bare domain (e.g. `essentials.com`)
- `zoneId` — Cloudflare Zone ID for Zone Analytics
- `siteToken` — Cloudflare Web Analytics beacon token
- `hreflang` — hreflang language code for SEO
- `dnsUnavailable` (optional) — `true` if DNS is not active (e.g. `essentials.cn`)

All fields except `dnsUnavailable` are required. Zone IDs and site tokens are public identifiers, not secrets.

### Analytics
- Stats use Zone Analytics (`httpRequests1dGroups`) with `uniq.uniques` for unique visitor counts
- This filters out bot traffic and provides more accurate human visitor metrics
- Browser stats aggregated from `sum.browserMap` for pie chart (7-day average, all domains)
- The proxy worker injects Web Analytics beacons for RUM data (optional, not used for stats)
- Stats fetched from `raw.githubusercontent.com/.../stats/stats.json`

## Stats Calculation

### Unique Visitors Chart
The `/day`, `/week`, `/month`, `/year` stats are calculated from **complete days only**:
- Excludes today (partial day in progress)
- Excludes the first day of data collection (partial day when analytics started)
- 30-day stacked bar chart showing per-domain breakdown

### Browser Pie Chart
- 7-day average daily pageviews from all configured domains
- Excludes today (partial day) - uses 7 complete days
- Filters out bots (GoogleBot, BingBot, etc.), Unknown, Curl, ChromeHeadless
- Shows top 6 browsers with hover details on legend

## UI Features

- Dark/light theme toggle in footer (persisted in localStorage)
- GitHub link in footer
- Logo click cycles case (UPPER → Title → lower)
- Extension click navigates to next domain (skips essentials.cn)
- Fade-in rise animation on logo (initial load only)
- Mobile responsive with touch support for charts
- Mobile header scrolls with content (non-sticky)
- Minimum 16px font size throughout
- Page prefetching on hover over domain links
- Font prefetching on hover over navigation

## Important Notes

- Do NOT create redirect rules - domains must serve content directly for JS hostname detection
- Stats use Zone Analytics (`httpRequests1dGroups.uniq.uniques`) for unique visitors - filters bot traffic
- GitHub Pages only recognizes one custom domain; the proxy worker handles the rest
- The proxy worker MUST inject per-domain analytics beacons; without this, all traffic reports to essentials.com only
- After making changes, purge Cloudflare cache for affected domains
- Zone IDs and Web Analytics tokens are public identifiers (not secrets)
- Actual API secrets stored via `wrangler secret put` (CF_API_TOKEN, GITHUB_TOKEN)

## Worker Guidance

Recurring error patterns observed in this repo (from contributor-insight tracking). Address these before starting any edit session.

### File Discovery (prevents `read:file_not_found`)

Always verify file paths before reading. Use `git ls-files` — do not guess paths.

Confirmed tracked files for common tasks:

```
index.html                  — UI, CSS, JS (single file, ~80KB)
workers/domains.js          — domain config (single source of truth)
workers/essentials-proxy.js — proxy Worker source
workers/essentials-stats.js — stats Worker source
workers/wrangler-proxy.toml — proxy wrangler config
workers/wrangler-stats.toml — stats wrangler config
workers/README.md           — Worker deployment guide
AGENTS.md                   — this file
TODO.md                     — task tracking
```

`stats.json` lives on the `stats` branch, not `main`. Do not attempt to read it from the working tree unless on that branch.

### Read Before Edit (prevents `edit:not_read_first` and `edit:edit_stale_read`)

1. **Always read a file before editing it** — even if you believe you know its contents.
2. **Re-read after any other tool modifies the same file** — another bash command or edit invalidates your prior read.
3. **`index.html` is large (~80KB).** Read only the section you need using offset/limit. Provide at least 5 lines of surrounding context in `oldString` for edits.
4. **`workers/domains.js` is the single source of truth.** Any domain-related change starts here; downstream files import from it and should not be modified directly for domain config.

### Git Workflow (prevents direct-main edits)

All code changes go through a worktree and PR — never directly on `main`, except for the planning files noted below.

- Interactive sessions: `wt switch -c feature/<name>` from the canonical repo on `main` creates a linked worktree at `~/Git/essentials.com-<branch-name>/`.
- Headless workers: the dispatcher pre-creates the worktree; `$WORKER_WORKTREE_PATH` is set in the environment. If not set, create one via `worktree-helper.sh add` (external aidevops framework tool — not tracked in this repo; available at `~/.aidevops/agents/scripts/worktree-helper.sh`).
- The canonical directory (`~/Git/essentials.com/`) stays on `main` always.
- `TODO.md`, `AGENTS.md`, and `README.md` edits from headless sessions may be pushed to `main` directly (planning exception), but code and worker edits always need a PR.

### Common Bash Pitfalls (reduces `bash:other`)

- Worker files use ES module syntax (`import`/`export`). Do not run them with Node.js directly; use `wrangler dev` for local testing.
- `wrangler` commands require `CF_API_TOKEN` set in the environment or via `wrangler secret`. Never hardcode tokens.
- GitHub Pages serves from `main` branch root. Changes to `index.html` are live after push (within ~30s CDN propagation).
- Cloudflare cache purge after edits: requires `CF_API_TOKEN` and the Zone ID from `workers/domains.js`.
- **`workers/domains.js` is JavaScript, not JSON** — do not pipe it to `jq` or parse it with shell JSON tools; they will fail. Use the Read tool to inspect domain configuration directly.
- **No `package.json` at the repo root** — do not run `npm install` at the project root. This repository does not use a local npm dependency tree for its Cloudflare Workers; they are designed to run without external npm packages.
- **`stats.json` on `main` is a historical snapshot** — it is not updated in real time. Live stats are served from the `stats` branch. Do not try to update or process `stats.json` from `main`.
- **`index.html` is ~80KB** — avoid shell text-processing tools (`grep`, `sed`, `awk`, `echo`) on it; they are unreliable at this size. Use the Read tool with `offset`/`limit` to find the section you need, and the Edit tool with `oldString`/`newString` for precise changes.
