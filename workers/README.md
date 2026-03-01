# Cloudflare Workers

This directory contains Cloudflare Workers for the domain portfolio landing page.

## Shared Configuration

### domains.js

Single source of truth for all domain data: TLDs, Cloudflare Zone IDs, Web Analytics tokens, and hreflang mappings. Imported by both workers and by `index.html`.

To add or remove a domain, edit the `DOMAINS` array in `domains.js`. All consumers derive their data from this one file.

## Workers

### essentials-proxy

Serves content from the primary domain (www.essentials.com) to all domain aliases. Injects per-domain Cloudflare Web Analytics beacons. Imports `getValidHosts()` and `getSiteTokens()` from `domains.js`.

**Deploy:**
```bash
wrangler deploy -c wrangler-proxy.toml
```

**Configuration needed:**
1. Update `domains.js` with your domain TLDs, Zone IDs, and Web Analytics tokens
2. Update the `targetUrl` to your primary domain
3. Add routes in Cloudflare dashboard for each domain

### essentials-stats

Fetches Zone Analytics from Cloudflare GraphQL API for all domains and commits stats to GitHub. Runs on a cron schedule. Imports `getZones()` from `domains.js`.

**Deploy:**
```bash
wrangler deploy -c wrangler-stats.toml
```

**Secrets required:**
```bash
wrangler secret put CF_API_TOKEN -c wrangler-stats.toml
wrangler secret put GITHUB_TOKEN -c wrangler-stats.toml
```

**Configuration needed:**
1. Domain Zone IDs are read from `domains.js` (no per-worker config needed)
2. Update GitHub repo path in the commit URL

## Adapting for Your Domain Collection

### 1. Get Zone IDs

For each domain in Cloudflare:
- Go to domain Overview page
- Copy Zone ID from right sidebar

### 2. Get Web Analytics Tokens

For each domain:
- Go to Analytics & Logs > Web Analytics
- Enable Web Analytics for the domain
- Copy the Site Token from the beacon script

### 3. Create API Tokens

**For stats worker (CF_API_TOKEN):**
- Go to My Profile > API Tokens > Create Token
- Permissions: Zone Analytics:Read for all zones
- Zone Resources: Include specific zones

**For GitHub commits (GITHUB_TOKEN):**
- Go to GitHub Settings > Developer settings > Personal access tokens
- Permissions: repo (for private) or public_repo (for public)

### 4. Update Domain Configuration

**domains.js:**
- Update the `DOMAINS` array with your domain TLDs, Zone IDs, site tokens, and hreflang codes
- Set `dnsUnavailable: true` for any domains without active DNS

**essentials-stats.js:**
- Update GitHub repo path in fetch URLs

### 5. Deploy

```bash
# Login to Cloudflare
wrangler login

# Deploy proxy worker
wrangler deploy -c wrangler-proxy.toml

# Deploy stats worker
wrangler deploy -c wrangler-stats.toml

# Set secrets for stats worker
wrangler secret put CF_API_TOKEN -c wrangler-stats.toml
wrangler secret put GITHUB_TOKEN -c wrangler-stats.toml
```

### 6. Configure Routes

In Cloudflare dashboard for each domain:
- Go to Workers Routes
- Add route: `*yourdomain.com/*` → `essentials-proxy`
- Add route: `*www.yourdomain.com/*` → `essentials-proxy`
