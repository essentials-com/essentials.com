# AI Agent Context

## Project Overview

Domain collection landing page for the essentials.* portfolio, hosted on GitHub Pages with Cloudflare for DNS, proxy, and analytics.

## Architecture

| Component | Service | Purpose |
|-----------|---------|---------|
| Hosting | GitHub Pages | Static site hosting from `main` branch |
| DNS | Cloudflare | DNS management for all essentials.* domains |
| Proxy | Cloudflare Worker (`essentials-proxy`) | Serves content from www.essentials.com to all domain aliases, injects per-domain analytics beacon |
| Analytics | Cloudflare Web Analytics | Real user monitoring (bot-filtered) |
| Stats | Cloudflare Worker (`essentials-stats`) | Fetches analytics via GraphQL API, commits to stats.json every 5 mins |

## Domains

All domains serve the same content; JavaScript detects the hostname and updates the display:

- essentials.com (primary)
- essentials.net
- essentials.co.uk
- essentials.uk
- essentials.eu
- essentials.us
- essentials.fr
- essentials.cn
- essentials.hk
- essentials.tw
- essentials.mobi

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Single-page site with all HTML, CSS, and JavaScript |
| `stats.json` | Visitor statistics, auto-updated by Cloudflare Worker |
| `CNAME` | GitHub Pages custom domain (www.essentials.com) |

## Cloudflare Configuration

### DNS
- All domains use Cloudflare nameservers
- CNAME records point to `essentials-com.github.io` with proxy enabled (orange cloud)

### Workers
- **essentials-proxy**: Routes all domain aliases to fetch content from www.essentials.com. Uses `HTMLRewriter` to inject the correct Web Analytics beacon for each domain. Sets `Cache-Control: no-transform` to prevent Cloudflare auto-injecting the wrong beacon.
- **essentials-stats**: Cron-triggered (every 5 mins), queries Web Analytics RUM API (`rumPageloadEventsAdaptiveGroups`) for all 11 domains, commits stats.json to GitHub

### Web Analytics Site Tags

| Domain | Site Tag |
|--------|----------|
| essentials.com | `3c70b68deb4c47c0b1b20fb5b13a8ac7` |
| essentials.net | `a6b388101b694341ae5f60784ba44f77` |
| essentials.co.uk | `cd7b62213ab94108b7956bc0c91c544c` |
| essentials.uk | `f81ece8b0e404e9b9daffbf129dad11f` |
| essentials.eu | `cce0d068b21146c0b0b27a823b5642ba` |
| essentials.us | `6868d7d0633b4224a7d7e7b3bba344fc` |
| essentials.fr | `3efc92066a2e45598427ba7d6dba1ab3` |
| essentials.cn | `6699f55f63aa44979af522c2b3b99f02` |
| essentials.hk | `b50f1c2fa2e04dcc920d0944306cf101` |
| essentials.tw | `75bd8006a16f45db9be8a72006b760c1` |
| essentials.mobi | `586af3efb4ef48baa63961cd4e457279` |

### Analytics
- Uses Web Analytics (JavaScript beacon) not Zone Analytics
- RUM API filters bot traffic automatically
- Each domain has its own site tag; the proxy worker injects the correct one

## Stats Calculation

The `/day`, `/week`, `/month`, `/year` stats are calculated from **complete days only**:
- Excludes today (partial day in progress)
- Excludes the first day of data collection (partial day when analytics started)

## Important Notes

- Do NOT create redirect rules - domains must serve content directly for JS hostname detection
- Stats use `rumPageloadEventsAdaptiveGroups` (real users only), not `httpRequests1dGroups` (includes bots)
- GitHub Pages only recognizes one custom domain; the proxy worker handles the rest
- The proxy worker MUST inject per-domain analytics beacons; without this, all traffic reports to essentials.com only
- After making changes, purge Cloudflare cache for affected domains
