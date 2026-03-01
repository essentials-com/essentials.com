/**
 * Shared domain configuration — single source of truth.
 *
 * All domain lists, zone IDs, analytics tokens, and hreflang mappings live here.
 * Consumed by:
 *   - workers/essentials-proxy.js  (validHosts, siteTokens)
 *   - workers/essentials-stats.js  (zones)
 *   - index.html                   (allDomains for UI rendering)
 *
 * To add or remove a domain, edit the DOMAINS array below.
 * Everything else is derived automatically.
 */

/**
 * @typedef {Object} DomainEntry
 * @property {string} tld        - The bare domain (e.g. "essentials.com")
 * @property {string} zoneId     - Cloudflare Zone ID for Zone Analytics
 * @property {string} siteToken  - Cloudflare Web Analytics beacon token
 * @property {string} hreflang   - hreflang code for SEO
 * @property {boolean} [dnsUnavailable] - true if DNS is not active (e.g. essentials.cn)
 */

/** @type {DomainEntry[]} */
export const DOMAINS = [
  { tld: "essentials.com",   zoneId: "3962b136d6e3492bdb570478899847b2", siteToken: "9c7ff93ede994719be16a87fdbbdb6d0", hreflang: "en" },
  { tld: "essentials.co.uk", zoneId: "f5df3dc2776423f4653d4f58f7bf819c", siteToken: "bd2ac6db233d4b7a80528a70e8765961", hreflang: "en-GB" },
  { tld: "essentials.uk",    zoneId: "5dd34def9f2ad086dd54afef45abc7c5", siteToken: "dafd69ae431245e59bf2658de918385d", hreflang: "en" },
  { tld: "essentials.net",   zoneId: "d2bb7fe3fdb1217b844ef3c61deaf7e0", siteToken: "af1f8e9509494fdc9296748bccfa4f67", hreflang: "en" },
  { tld: "essentials.eu",    zoneId: "75a68625aff272cfcd14be528568774e", siteToken: "ea6290a203dd479eb29129f67a63a707", hreflang: "de" },
  { tld: "essentials.us",    zoneId: "0030f0ca87bb371396df88f626f40f51", siteToken: "0cf65acf96c340bf97f088b639741fac", hreflang: "en-US" },
  { tld: "essentials.fr",    zoneId: "51bd9812a67450597344caaba49dcf0c", siteToken: "2a2a52689b9846b2b982cf22cd060758", hreflang: "fr" },
  { tld: "essentials.cn",    zoneId: "9c657d9a33c65cf08f7388bac27567fb", siteToken: "91fea634621d4b7a8603cabadaf4d669", hreflang: "zh-CN", dnsUnavailable: true },
  { tld: "essentials.hk",    zoneId: "eba3476c1545e7921a74afd94910ef7a", siteToken: "81b6f31ee014450c92c7941f3d963d9b", hreflang: "zh-HK" },
  { tld: "essentials.tw",    zoneId: "fa860897d24799154c196c1a3df49d68", siteToken: "ced9f723c52f4518928c063a63151baa", hreflang: "zh-TW" },
  { tld: "essentials.mobi",  zoneId: "dc698847dff06bf68ff8356605228d82", siteToken: "141ccb0338744ec5aa52bc614d034937", hreflang: "en" },
];

/**
 * Valid hosts for the proxy worker (root + www for each domain).
 * @returns {string[]}
 */
export function getValidHosts() {
  const hosts = [];
  for (const d of DOMAINS) {
    hosts.push(d.tld, `www.${d.tld}`);
  }
  return hosts;
}

/**
 * Site token lookup keyed by hostname (root + www both map to the same token).
 * @returns {Record<string, string>}
 */
export function getSiteTokens() {
  const tokens = {};
  for (const d of DOMAINS) {
    tokens[d.tld] = d.siteToken;
    tokens[`www.${d.tld}`] = d.siteToken;
  }
  return tokens;
}

/**
 * Zone ID lookup keyed by bare domain.
 * @returns {Record<string, string>}
 */
export function getZones() {
  const zones = {};
  for (const d of DOMAINS) {
    zones[d.tld] = d.zoneId;
  }
  return zones;
}

/**
 * Domain list for the front-end UI (name, url, canonical, hreflang).
 * Domains with dnsUnavailable link to essentials.com instead.
 * @returns {Array<{name: string, url: string, canonical: string, hreflang: string}>}
 */
export function getAllDomains() {
  return DOMAINS.map(d => {
    const name = d.tld.toUpperCase();
    const fallbackUrl = "https://www.essentials.com/";
    const url = d.dnsUnavailable ? fallbackUrl : `https://www.${d.tld}/`;
    const canonical = d.dnsUnavailable ? fallbackUrl : `https://www.${d.tld}/`;
    return { name, url, canonical, hreflang: d.hreflang };
  });
}

/**
 * Bare domain names that should be skipped in UI rotation (DNS unavailable).
 * @returns {string[]}
 */
export function getSkipDomains() {
  return DOMAINS.filter(d => d.dnsUnavailable).map(d => d.tld.toUpperCase());
}

/**
 * Bare domain list (e.g. for chart colors, legend).
 * @returns {string[]}
 */
export function getDomainList() {
  return DOMAINS.map(d => d.tld);
}
