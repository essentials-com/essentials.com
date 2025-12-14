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

All domains serve the same content; JavaScript detects the hostname and updates the display:

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
| `stats.json` | Visitor statistics on `stats` branch, auto-updated by Cloudflare Worker |
| `CNAME` | GitHub Pages custom domain (www.essentials.com) |
| `workers/essentials-proxy.js` | Proxy worker source code |
| `workers/essentials-stats.js` | Stats worker source code |
| `workers/wrangler-*.toml` | Wrangler deployment configs |
| `workers/README.md` | Worker setup and deployment guide |

## Cloudflare Configuration

### DNS
- All domains use Cloudflare nameservers
- CNAME records point to `essentials-com.github.io` with proxy enabled (orange cloud)

### Workers
- **essentials-proxy**: Routes all domain aliases to fetch content from www.essentials.com. Uses `HTMLRewriter` to inject the correct Web Analytics beacon for each domain. Sets `Cache-Control: no-transform` to prevent Cloudflare auto-injecting the wrong beacon.
- **essentials-stats**: Cron-triggered (every 5 mins), queries Zone Analytics (`httpRequests1dGroups`) for all 11 domains, commits stats.json to GitHub

### Zone IDs

Zone IDs are used by the stats worker to query Zone Analytics via GraphQL API:

| Domain | Zone ID |
|--------|---------|
| essentials.com | `3962b136d6e3492bdb570478899847b2` |
| essentials.net | `d2bb7fe3fdb1217b844ef3c61deaf7e0` |
| essentials.co.uk | `f5df3dc2776423f4653d4f58f7bf819c` |
| essentials.uk | `5dd34def9f2ad086dd54afef45abc7c5` |
| essentials.eu | `75a68625aff272cfcd14be528568774e` |
| essentials.us | `0030f0ca87bb371396df88f626f40f51` |
| essentials.fr | `51bd9812a67450597344caaba49dcf0c` |
| essentials.cn | `9c657d9a33c65cf08f7388bac27567fb` |
| essentials.hk | `eba3476c1545e7921a74afd94910ef7a` |
| essentials.tw | `fa860897d24799154c196c1a3df49d68` |
| essentials.mobi | `dc698847dff06bf68ff8356605228d82` |

### Web Analytics Tokens

Cloudflare Web Analytics tokens are used by the proxy worker to inject per-domain beacons:
- **Site Token**: Used in the beacon script injected into HTML (used by `essentials-proxy` worker)

| Domain | Site Token (Beacon) |
|--------|---------------------|
| essentials.com | `9c7ff93ede994719be16a87fdbbdb6d0` |
| essentials.net | `af1f8e9509494fdc9296748bccfa4f67` |
| essentials.co.uk | `bd2ac6db233d4b7a80528a70e8765961` |
| essentials.uk | `dafd69ae431245e59bf2658de918385d` |
| essentials.eu | `ea6290a203dd479eb29129f67a63a707` |
| essentials.us | `0cf65acf96c340bf97f088b639741fac` |
| essentials.fr | `2a2a52689b9846b2b982cf22cd060758` |
| essentials.cn | `91fea634621d4b7a8603cabadaf4d669` |
| essentials.hk | `81b6f31ee014450c92c7941f3d963d9b` |
| essentials.tw | `ced9f723c52f4518928c063a63151baa` |
| essentials.mobi | `141ccb0338744ec5aa52bc614d034937` |

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

- Dark/light theme toggle (persisted in localStorage)
- Logo click cycles case (UPPER → Title → lower)
- Extension click navigates to next domain (skips essentials.cn)
- Fade-in rise animation on logo
- Mobile responsive with touch support for charts
- Minimum 16px font size throughout

## Important Notes

- Do NOT create redirect rules - domains must serve content directly for JS hostname detection
- Stats use Zone Analytics (`httpRequests1dGroups.uniq.uniques`) for unique visitors - filters bot traffic
- GitHub Pages only recognizes one custom domain; the proxy worker handles the rest
- The proxy worker MUST inject per-domain analytics beacons; without this, all traffic reports to essentials.com only
- After making changes, purge Cloudflare cache for affected domains
- Zone IDs and Web Analytics tokens are public identifiers (not secrets)
- Actual API secrets stored via `wrangler secret put` (CF_API_TOKEN, GITHUB_TOKEN)
