# Domain Collection Landing Page

A clean, modern landing page designed for showcasing premium domain portfolios. Built because no one else seems to offer anything nice for domain collections.

Feel free to fork and use for your own similar needs.

## Features

- Responsive single-page design with dark/light mode (persisted in localStorage)
- Interactive domain showcase with styled typography
- Real-time visitor statistics powered by Cloudflare Zone Analytics
- Bot-filtered unique visitor counts (real users only)
- 30-day stacked bar chart with per-domain breakdown and tooltips
- Browser breakdown pie chart (7-day average daily pageviews, bots excluded)
- Stats auto-update every 5 minutes via Cloudflare Workers
- Modal with portfolio details, prospectus, valuation references, and contact info
- Obfuscated contact email to prevent scraping
- Logo click cycles case (UPPER → Title → lower)
- Extension click navigates to next domain (skips unavailable TLDs)
- Dot color randomizes on click with WCAG AA contrast enforcement
- Fade-in rise animation on logo (initial load only)
- Page prefetching on hover over domain links
- Font prefetching on hover over navigation
- Size-adjusted font fallbacks to minimize layout shift
- Dynamic SEO meta tags updated per domain (title, description, canonical, Open Graph, Twitter)
- hreflang tags for international SEO across all TLDs
- Structured data (JSON-LD: WebSite, WebPage/Offer, Organization)
- Ahrefs analytics integration with per-domain keys
- Mobile-optimized with non-sticky header and touch support for charts
- Minimum 16px font size throughout
- Local testing mode with `?domain=` URL parameter

## Live Demo

- [essentials.com](https://essentials.com)
- [essentials.net](https://essentials.net)
- [essentials.co.uk](https://essentials.co.uk)
- [essentials.uk](https://essentials.uk)
- [essentials.eu](https://essentials.eu)
- [essentials.us](https://essentials.us)
- [essentials.fr](https://essentials.fr)
- [essentials.cn](https://essentials.cn)
- [essentials.hk](https://essentials.hk)
- [essentials.tw](https://essentials.tw)
- [essentials.mobi](https://essentials.mobi)

## Setup Your Own

### 1. Fork and Configure GitHub Pages

1. Fork this repository
2. Go to **Settings > Pages**
3. Set source to **Deploy from a branch** > `main` / `root`
4. Add your custom domain under **Custom domain**

### 2. Set Up Cloudflare Web Analytics

For each domain you want to track:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Analytics & Logs > Web Analytics**
3. Click **Add a site** and enter your domain
4. Copy the **Site Tag** for each domain (you'll need these later)

### 3. Create Required API Tokens

**Cloudflare API Token:**
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Custom Token** with:
   - Permissions: `Analytics:Read`
   - Account Resources: Your account
4. Copy the token

**Cloudflare Account ID:**
- Found in your Cloudflare dashboard URL or on the Overview page of any zone

**GitHub Personal Access Token:**
1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scope: `repo` (full control)
4. Copy the token

### 4. Deploy the Workers

See [workers/README.md](workers/README.md) for detailed setup instructions.

**Quick start:**

```bash
cd workers

# Login to Cloudflare
wrangler login

# Deploy proxy worker (serves content to all domain aliases)
wrangler deploy -c wrangler-proxy.toml

# Deploy stats worker (fetches analytics, commits to GitHub)
wrangler deploy -c wrangler-stats.toml

# Set secrets for stats worker
wrangler secret put CF_API_TOKEN -c wrangler-stats.toml
wrangler secret put GITHUB_TOKEN -c wrangler-stats.toml
```

**Note:** Stats are committed to a separate `stats` branch to avoid triggering GitHub Pages rebuilds.

### 5. Customize

Edit `index.html` to update:

- **Domains** — the `allDomains` array with your domain names and URLs
- **Modal content** — portfolio details, prospectus, and contact email
- **Meta tags** — title, description, Open Graph, Twitter, and structured data
- **hreflang tags** — match each domain to its language/region
- **Primary color** — the `--dot-color` CSS variable (default: `#DAA520` light / `#FFD700` dark)
- **Font** — the Google Fonts import and `font-family` declarations
- **Ahrefs keys** — the per-domain analytics keys, or remove the Ahrefs script block

## More Projects

If you like projects like this, you can browse more of my community work here: [github.com/marcusquinn](https://github.com/marcusquinn)

If you want to learn more about vibe-coding and operations management with AI assistants, please check out: [aidevops.sh](https://aidevops.sh)

## License

MIT License. See [LICENSE](LICENSE) for details.

---

© 2026 Marcus Quinn
