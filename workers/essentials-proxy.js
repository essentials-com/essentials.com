import { getValidHosts, getSiteTokens } from "./domains.js";

const validHosts = getValidHosts();
const siteTokens = getSiteTokens();

// Security headers applied to all responses
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://analytics.ahrefs.com https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self' https://raw.githubusercontent.com https://analytics.ahrefs.com https://cloudflareinsights.com; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'",
};

function applySecurityHeaders(headers) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    headers[key] = value;
  }
  return headers;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const originalHost = url.host;
    
    // 301 redirect unknown subdomains to www.essentials.com
    if (!validHosts.includes(originalHost)) {
      return Response.redirect("https://www.essentials.com/", 301);
    }
    
    // Generate dynamic sitemap.xml for the current domain
    if (url.pathname === "/sitemap.xml") {
      const wwwHost = originalHost.startsWith("www.") ? originalHost : `www.${originalHost}`;
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${wwwHost}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
      return new Response(sitemap, {
        headers: applySecurityHeaders({
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=86400",
        }),
      });
    }
    
    // Generate dynamic robots.txt for the current domain
    if (url.pathname === "/robots.txt") {
      const wwwHost = originalHost.startsWith("www.") ? originalHost : `www.${originalHost}`;
      const robots = `User-agent: *
Allow: /

Sitemap: https://${wwwHost}/sitemap.xml`;
      return new Response(robots, {
        headers: applySecurityHeaders({
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=86400",
        }),
      });
    }
    
    // Get the correct site token for this domain
    const siteToken = siteTokens[originalHost] || siteTokens["essentials.com"];
    
    // Fetch from www.essentials.com
    const targetUrl = `https://www.essentials.com${url.pathname}${url.search}`;
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "Cloudflare-Worker",
        "Accept": request.headers.get("Accept") || "*/*",
        "Accept-Encoding": request.headers.get("Accept-Encoding") || "gzip",
      },
      redirect: "follow",
    });

    // Clone the response and modify headers
    const newHeaders = new Headers(response.headers);
    
    // Add a header so the JavaScript can detect the original domain
    newHeaders.set("X-Original-Host", originalHost);
    
    // Allow Cloudflare to compress the response (gzip/brotli)
    // HTMLRewriter handles beacon injection, so no-transform is not needed
    newHeaders.set("Cache-Control", "public");
    
    // Security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      newHeaders.set(key, value);
    }
    
    // Check if this is HTML content that needs beacon injection
    const contentType = response.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    
    // If not HTML, return as-is
    if (!isHtml) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
    
    // Create the Cloudflare Web Analytics beacon script for this domain
    // The beacon config must include:
    // - "version": Required for proper RUM endpoint routing (versions.fl in payload)
    // - "token": The site-specific token for this domain
    // - "send.to": Explicit endpoint since worker-proxied domains don't have /cdn-cgi/rum
    // Without the version field, the beacon may not properly associate data with the site.
    const beaconConfig = {
      version: "2024.11.0",
      token: siteToken,
      r: 1,
      send: { to: "https://cloudflareinsights.com/cdn-cgi/rum" }
    };
    const beaconScript = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify(beaconConfig)}'></script>`;
    
    // Use HTMLRewriter to:
    // 1. Remove any existing Cloudflare beacon scripts (auto-injected by Cloudflare for essentials.com)
    // 2. Inject the correct beacon for this domain
    const rewriter = new HTMLRewriter()
      .on("script[src*='cloudflareinsights.com/beacon']", {
        element(element) {
          // Remove auto-injected beacon scripts
          element.remove();
        },
      })
      .on("body", {
        element(element) {
          // Inject the correct beacon for this domain
          element.append(beaconScript, { html: true });
        },
      });
    
    return rewriter.transform(
      new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      })
    );
  },
};
