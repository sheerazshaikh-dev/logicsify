import { mkdir, writeFile } from "node:fs/promises";

const origin = "https://logicsify.com";
const apiBase = (process.env.VITE_API_URL || "https://backend.logicsify.com/api").replace(/\/$/, "");
const publicDir = new URL("../public/", import.meta.url);

const corePaths = [
  "/", "/services", "/industries", "/work", "/automation-lab", "/resources", "/project-estimator",
  "/comparisons", "/engagement-models", "/insights", "/about", "/process", "/technology", "/careers",
  "/contact", "/book-a-call", "/technical-roadmap", "/privacy", "/terms",
];
const serviceSlugs = [
  "web-design-development", "web-applications", "saas-development", "mobile-apps", "ecommerce", "ui-ux",
  "ai-automations", "ai-agents", "crm-automation", "api-integrations", "seo", "paid-advertising",
  "social-media", "content-marketing", "branding", "cro", "maintenance",
];
const industrySlugs = ["saas-startups", "home-services", "healthcare", "ecommerce", "agencies"];
const comparisonSlugs = [
  "custom-cms-vs-wordpress", "custom-web-app-vs-saas-tools", "retell-ai-vs-twilio-voice",
  "gohighlevel-vs-custom-crm", "in-house-developer-vs-dedicated-agency",
];
const resourceSlugs = [
  "website-planning-checklist", "ai-automation-opportunity-audit", "crm-migration-checklist", "saas-mvp-scope-template",
];

async function list(type) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${apiBase}/public/content/${encodeURIComponent(type)}`, { signal: controller.signal });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

const dynamicTypes = [
  ["page", (slug) => `/${slug}`],
  ["service", (slug) => `/services/${slug}`],
  ["industry", (slug) => `/industries/${slug}`],
  ["case_study", (slug) => `/work/${slug}`],
  ["insight", (slug) => `/insights/${slug}`],
  ["resource", (slug) => `/resources/${slug}`],
  ["comparison", (slug) => `/comparisons/${slug}`],
];

const paths = new Set([
  ...corePaths,
  ...serviceSlugs.map((slug) => `/services/${slug}`),
  ...industrySlugs.map((slug) => `/industries/${slug}`),
  ...comparisonSlugs.map((slug) => `/comparisons/${slug}`),
]);
const fetched = {};
for (const [type, toPath] of dynamicTypes) {
  const items = await list(type);
  fetched[type] = items;
  for (const item of items) if (item?.slug) paths.add(toPath(item.slug));
}
// Resource placeholders stay out of the sitemap until the CMS publishes them.
if ((fetched.resource || []).length === 0) resourceSlugs.forEach(() => undefined);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths]
  .sort()
  .map((path) => `  <url><loc>${origin}${path}</loc><changefreq>${path.startsWith("/insights/") ? "monthly" : "weekly"}</changefreq></url>`)
  .join("\n")}\n</urlset>\n`;

const insights = fetched.insight || [];
const rssItems = insights.slice(0, 30).map((item) => {
  const url = `${origin}/insights/${item.slug}`;
  const description = String(item.excerpt || "").replace(/[<>&]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[character]);
  const title = String(item.title || "").replace(/[<>&]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[character]);
  const date = item.published_at ? new Date(item.published_at.replace(" ", "T") + "Z").toUTCString() : new Date().toUTCString();
  return `    <item><title>${title}</title><link>${url}</link><guid>${url}</guid><pubDate>${date}</pubDate><description>${description}</description></item>`;
}).join("\n");
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Logicsify Insights</title><link>${origin}/insights</link><description>Practical insights about AI automation, software, SaaS, CRM systems, and digital growth.</description>${rssItems ? `\n${rssItems}\n  ` : ""}</channel></rss>\n`;

await mkdir(publicDir, { recursive: true });
await writeFile(new URL("sitemap.xml", publicDir), xml);
await writeFile(new URL("rss.xml", publicDir), rss);
console.log(`Generated sitemap with ${paths.size} public routes and RSS with ${insights.length} published insights.`);
