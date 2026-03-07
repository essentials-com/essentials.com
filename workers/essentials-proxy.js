import { getValidHosts, getSiteTokens, getAllDomains } from "./domains.js";

const validHosts = getValidHosts();
const siteTokens = getSiteTokens();

// Build hreflang link tags once at init from the single source of truth (domains.js).
// These are identical for every response — the full set of language-region alternates
// plus x-default. Domains with hreflang: null are skipped (no unique language-region).
const hreflangHtml = (() => {
  const domains = getAllDomains();
  let links = "";
  let defaultHref = "";
  for (const domain of domains) {
    if (domain.hreflang) {
      links += `<link rel="alternate" hreflang="${domain.hreflang}" href="${domain.url}" />\n`;
    }
    // The primary domain (ESSENTIALS.COM) is x-default
    if (domain.name === "ESSENTIALS.COM") {
      defaultHref = domain.url;
    }
  }
  if (defaultHref) {
    links += `<link rel="alternate" hreflang="x-default" href="${defaultHref}" />\n`;
  }
  return links;
})();

// Static security headers applied to all responses
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

// CSP directives shared across all responses
const cspBase = [
  "default-src 'self'",
  "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
  "img-src 'self' data:",
  "connect-src 'self' https://raw.githubusercontent.com https://analytics.ahrefs.com https://cloudflareinsights.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

/**
 * Build a Content-Security-Policy header value.
 * When a nonce is provided (HTML responses), inline scripts and styles are
 * allowed only if they carry the matching nonce attribute — 'unsafe-inline'
 * is omitted entirely. For non-HTML responses (assets, sitemap, robots.txt)
 * no nonce is needed and a restrictive static policy is used.
 */
function buildCsp(nonce) {
  const nonceToken = nonce ? `'nonce-${nonce}' ` : "";
  const scriptSrc = `script-src 'self' ${nonceToken}https://analytics.ahrefs.com https://static.cloudflareinsights.com`;
  // 'unsafe-inline' is required because chart JS sets element.style properties
  // (conic-gradient on pie chart, segment heights, tooltip positioning) which
  // cannot carry nonces. Per CSP Level 3, 'unsafe-inline' is ignored when a
  // nonce is present, so we intentionally omit the nonce from style-src.
  // The nonce on script-src still protects against XSS via inline scripts.
  // TODO: Refactor client-side JS to use nonced <style> tags with CSS classes
  // instead of element.style, allowing removal of 'unsafe-inline' from style-src.
  const styleSrc = `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`;

  return [...cspBase, scriptSrc, styleSrc].join("; ");
}

/**
 * Apply security headers to either a plain object or a Headers instance.
 * Accepts an optional nonce to build a per-request CSP.
 * Returns the same headers reference for chaining.
 */
function applySecurityHeaders(headers, nonce) {
  const csp = buildCsp(nonce);
  const allHeaders = { ...securityHeaders, "Content-Security-Policy": csp };

  for (const [key, value] of Object.entries(allHeaders)) {
    if (headers instanceof Headers) {
      headers.set(key, value);
    } else {
      headers[key] = value;
    }
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

    // Preserve upstream Cache-Control directives, ensuring 'public' is present.
    // Previous versions used 'no-transform' here to protect HTMLRewriter beacon
    // injection from Cloudflare edge transforms (Rocket Loader, auto-minify).
    // However, no-transform also disables Cloudflare's Brotli/Gzip compression,
    // causing a performance regression. Instead, the beacon script uses
    // data-cfasync="false" to opt out of Rocket Loader specifically.
    const upstreamCC = response.headers.get("Cache-Control") || "";
    const directives = upstreamCC.split(",").map((d) => d.trim()).filter(Boolean);
    if (!directives.some((d) => /^(public|private)/i.test(d))) {
      directives.push("public");
    }
    newHeaders.set("Cache-Control", directives.join(", "));

    // Check if this is HTML content that needs beacon injection + nonces
    const contentType = response.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");

    // Generate a unique nonce for HTML responses (used in CSP + HTMLRewriter)
    const nonce = isHtml ? crypto.randomUUID() : undefined;

    // Apply security headers (CSP includes nonce only for HTML responses)
    applySecurityHeaders(newHeaders, nonce);

    // If not HTML, return as-is (no nonce, no rewriting)
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
      send: { to: "https://cloudflareinsights.com/cdn-cgi/rum" },
    };
    const beaconScript = `<script nonce="${nonce}" data-cfasync="false" defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify(beaconConfig)}'></script>`;

    // Use HTMLRewriter to:
    // 1. Inject hreflang alternate links into <head> (generated from domains.js)
    // 2. Remove any existing Cloudflare beacon scripts (auto-injected by Cloudflare for essentials.com)
    // 3. Add nonce attributes to all inline <script> and <style> elements (CSP compliance)
    // 4. Inject the correct beacon for this domain (with nonce)
    const rewriter = new HTMLRewriter()
      .on("head", {
        element(element) {
          // Inject hreflang links after the opening <head> tag
          element.append(hreflangHtml, { html: true });
        },
      })
      .on("script[src*='cloudflareinsights.com/beacon']", {
        element(element) {
          // Remove auto-injected beacon scripts
          element.remove();
        },
      })
      .on("script:not([src*='cloudflareinsights.com/beacon'])", {
        element(element) {
          // Add nonce to all other script elements (inline JS, JSON-LD, modules)
          if (!element.getAttribute("nonce")) {
            element.setAttribute("nonce", nonce);
          }
        },
      })
      .on("style", {
        element(element) {
          // Add nonce to all inline style elements
          if (!element.getAttribute("nonce")) {
            element.setAttribute("nonce", nonce);
          }
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
