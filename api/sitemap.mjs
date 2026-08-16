const ORIGIN = "https://logicsify.com";
const API_BASE = (process.env.VITE_API_URL || "https://backend.logicsify.com/api").replace(/\/$/, "");
const LIVE_SITEMAP_URL =
  process.env.LOGICSIFY_SITEMAP_SOURCE_URL || `${API_BASE}/public/sitemap.xml`;

const CORE_PATHS = [
  "/",
  "/about",
  "/team",
  "/services",
  "/work",
  "/portfolio",
  "/company-profile",
  "/automation-lab",
  "/integrations",
  "/guides",
  "/project-estimator",
  "/comparisons",
  "/engagement-models",
  "/insights",
  "/testimonials",
  "/process",
  "/technology",
  "/careers",
  "/contact",
  "/book-a-call",
  "/technical-roadmap",
  "/privacy",
  "/terms",
];

const CONTENT_ROUTES = {
  page: (slug) => (slug === "home" ? "/" : `/${slug}`),
  service: (slug) => `/services/${slug}`,
  case_study: (slug) => `/work/${slug}`,
  portfolio: (slug) => `/portfolio/${slug}`,
  insight: (slug) => `/insights/${slug}`,
  comparison: (slug) => `/comparisons/${slug}`,
  guide: (slug) => `/guides/${slug}`,
};

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).end("Method Not Allowed");
  }

  // Do not cache browser/firewall challenge responses. Vercel may cache the valid
  // sitemap at the edge for five minutes and serve stale content for one hour.
  response.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600",
  );
  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");

  const liveXml = await fetchLiveSitemap();
  if (liveXml) {
    response.setHeader("X-Logicsify-Sitemap-Source", "backend-xml");
    return request.method === "HEAD"
      ? response.status(200).end()
      : response.status(200).send(liveXml);
  }

  // If the backend XML endpoint is ever intercepted by Imunify/ModSecurity or
  // another browser-verification layer, rebuild the sitemap from the public JSON
  // CMS endpoints instead of exposing the challenge redirect to visitors/crawlers.
  const { xml, cmsRecords } = await buildFallbackSitemap();
  response.setHeader(
    "X-Logicsify-Sitemap-Source",
    cmsRecords > 0 ? "cms-json-fallback" : "core-fallback",
  );

  return request.method === "HEAD"
    ? response.status(200).end()
    : response.status(200).send(xml);
}

async function fetchLiveSitemap() {
  try {
    const result = await fetchWithTimeout(
      LIVE_SITEMAP_URL,
      {
        method: "GET",
        redirect: "manual",
        headers: {
          Accept: "application/xml,text/xml;q=0.9,*/*;q=0.1",
          "User-Agent": "Logicsify-Sitemap-Bridge/1.0",
        },
      },
      8000,
    );

    // A WAF/browser check normally appears as a 3xx response. Never follow it.
    if (!result.ok || result.status < 200 || result.status >= 300) return null;

    const body = await result.text();
    const contentType = String(result.headers.get("content-type") || "").toLowerCase();

    if (!isValidSitemap(body, contentType)) return null;
    return body.trim() + "\n";
  } catch {
    return null;
  }
}

function isValidSitemap(body, contentType) {
  if (!body || body.length < 80) return false;

  const normalized = body.trim().toLowerCase();
  if (
    normalized.includes("wsidchk=") ||
    normalized.includes("<html") ||
    normalized.includes("<!doctype html") ||
    !normalized.includes("<urlset") ||
    !normalized.includes("</urlset>")
  ) {
    return false;
  }

  return (
    contentType.includes("xml") ||
    normalized.startsWith("<?xml") ||
    normalized.startsWith("<urlset")
  );
}

async function buildFallbackSitemap() {
  const paths = new Map();
  const today = new Date().toISOString().slice(0, 10);

  for (const path of CORE_PATHS) {
    paths.set(path, { lastmod: null });
  }

  let cmsRecords = 0;
  const types = Object.keys(CONTENT_ROUTES);
  const results = await Promise.all(
    types.map(async (type) => [type, await fetchPublishedContent(type)]),
  );

  for (const [type, records] of results) {
    const route = CONTENT_ROUTES[type];
    for (const item of records) {
      const slug = String(item?.slug || "").trim().replace(/^\/+|\/+$/g, "");
      if (!slug) continue;

      const path = route(slug);
      if (!path || path.includes("//")) continue;

      const rawDate = item?.updated_at || item?.published_at || item?.created_at;
      paths.set(path, { lastmod: toDate(rawDate) || today });
      cmsRecords += 1;
    }
  }

  const rows = [...paths.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, meta]) => {
      const lastmod = meta.lastmod ? `<lastmod>${escapeXml(meta.lastmod)}</lastmod>` : "";
      const frequency = path.startsWith("/insights/") ? "monthly" : "weekly";
      return `  <url><loc>${escapeXml(ORIGIN + path)}</loc>${lastmod}<changefreq>${frequency}</changefreq></url>`;
    });

  return {
    cmsRecords,
    xml:
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      rows.join("\n") +
      `\n</urlset>\n`,
  };
}

async function fetchPublishedContent(type) {
  try {
    const result = await fetchWithTimeout(
      `${API_BASE}/public/content/${encodeURIComponent(type)}`,
      {
        method: "GET",
        redirect: "manual",
        headers: {
          Accept: "application/json",
          "User-Agent": "Logicsify-Sitemap-Bridge/1.0",
        },
      },
      6000,
    );

    if (!result.ok || result.status < 200 || result.status >= 300) return [];
    const contentType = String(result.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("json")) return [];

    const payload = await result.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
