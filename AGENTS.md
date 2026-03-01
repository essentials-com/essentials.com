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
- **essentials-stats**: Cron-triggered (every 5 mins), queries Zone Analytics (`httpRequests1dGroups`) for all 11 domains (zone IDs from `workers/domains.js`), commits stats.json to GitHub

### Zone IDs & Web Analytics Tokens

All per-domain Cloudflare Zone IDs and Web Analytics site tokens are defined in `workers/domains.js` (the `DOMAINS` array). Each entry contains `zoneId` and `siteToken` fields. These are public identifiers, not secrets.

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
- 7-day average daily pageviews from all 11 domains
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
