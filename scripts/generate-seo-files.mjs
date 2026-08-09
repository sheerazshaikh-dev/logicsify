import { mkdir, writeFile } from "node:fs/promises";

const origin = "https://logicsify.com";
const apiBase = (process.env.VITE_API_URL || "https://backend.logicsify.com/api").replace(
  /\/$/,
  "",
);
const publicDir = new URL("../public/", import.meta.url);
const defaultTheme = {
  primary_start: "#04A6A1",
  primary_end: "#8BCF3C",
  dark: "#000000",
  background: "#FFFFFF",
  surface: "#FAF8FC",
  text: "#000000",
  muted_text: "#756C7E",
  border: "#E6E1EA",
  heading_font: "Sora",
  body_font: "Inter",
  base_font_size: 16,
  h1_min: 44,
  h1_max: 104,
  h2_min: 32,
  h2_max: 64,
  h3_min: 24,
  h3_max: 36,
  nav_font_size: 14,
  button_font_size: 14,
  small_font_size: 12,
  container_max_width: 1360,
  section_spacing_desktop: 128,
  section_spacing_mobile: 72,
  card_radius: 24,
  button_radius: 999,
  input_radius: 12,
  gradient_angle: 135,
  animation_speed: 1,
  shadow_strength: 1,
};

const corePaths = [
  "/",
  "/services",
  "/work",
  "/automation-lab",
  "/integrations",
  "/resources",
  "/guides",
  "/project-estimator",
  "/comparisons",
  "/engagement-models",
  "/insights",
  "/about",
  "/process",
  "/technology",
  "/careers",
  "/contact",
  "/book-a-call",
  "/technical-roadmap",
  "/privacy",
  "/terms",
];
const serviceSlugs = [
  "ai-automation-voice-agents",
  "crm-revenue-operations",
  "custom-websites-portals-cms",
  "ai-calling-agents",
  "appointment-booking-agents",
  "lead-qualification-agents",
  "ai-support-chatbots",
  "automated-lead-follow-up",
  "messaging-calendar-automation",
  "document-extraction-processing",
  "internal-workflow-automation",
  "custom-ai-integrations",
  "gohighlevel-implementation",
  "hubspot-implementation",
  "custom-crm-development",
  "sales-pipeline-lead-routing",
  "crm-follow-up-automation",
  "crm-appointment-scheduling",
  "revenue-reporting-dashboards",
  "crm-payment-api-integrations",
  "crm-migration-optimization",
  "conversion-focused-business-websites",
  "custom-cms-platforms",
  "wordpress-modernization",
  "customer-employee-portals",
  "membership-booking-platforms",
  "ecommerce-platforms",
  "custom-dashboards-admin-panels",
  "website-api-payment-integrations",
  "mobile-app-development",
  "ui-ux-design",
  "seo-digital-marketing",
  "branding",
  "ecommerce-development",
  "cloud-maintenance",
];
const comparisonSlugs = [
  "custom-cms-vs-wordpress",
  "custom-web-app-vs-saas-tools",
  "retell-ai-vs-twilio-voice",
  "gohighlevel-vs-custom-crm",
  "in-house-developer-vs-dedicated-agency",
];
const resourceSlugs = [
  "website-planning-checklist",
  "ai-automation-opportunity-audit",
  "crm-migration-checklist",
  "saas-mvp-scope-template",
];

async function list(type) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${apiBase}/public/content/${encodeURIComponent(type)}`, {
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function getThemeSnapshot() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${apiBase}/public/settings/theme`, { signal: controller.signal });
    if (!response.ok) throw new Error("Theme API unavailable");
    const payload = await response.json();
    return payload?.data && typeof payload.data === "object"
      ? { theme: { ...defaultTheme, ...payload.data }, verified: true }
      : { theme: defaultTheme, verified: false };
  } catch {
    return { theme: defaultTheme, verified: false };
  } finally {
    clearTimeout(timer);
  }
}

function themeVariables(theme) {
  const variables = {};
  const set = (name, value, suffix = "") => {
    if (value !== undefined && value !== null && value !== "")
      variables[name] = `${value}${suffix}`;
  };
  set("--theme-primary-start", theme.primary_start);
  set("--theme-primary-end", theme.primary_end);
  set("--theme-dark", theme.dark);
  set("--theme-background", theme.background);
  set("--theme-surface", theme.surface);
  set("--theme-text", theme.text);
  set("--theme-muted-text", theme.muted_text);
  set("--theme-border", theme.border);
  set(
    "--theme-heading-font",
    theme.heading_font
      ? `"${theme.heading_font}", ui-sans-serif, system-ui, sans-serif`
      : undefined,
  );
  set(
    "--theme-body-font",
    theme.body_font ? `"${theme.body_font}", ui-sans-serif, system-ui, sans-serif` : undefined,
  );
  set("--theme-base-font-size", theme.base_font_size, "px");
  set("--theme-h1-min", theme.h1_min, "px");
  set("--theme-h1-max", theme.h1_max, "px");
  set("--theme-h2-min", theme.h2_min, "px");
  set("--theme-h2-max", theme.h2_max, "px");
  set("--theme-h3-min", theme.h3_min, "px");
  set("--theme-h3-max", theme.h3_max, "px");
  set("--theme-nav-font-size", theme.nav_font_size, "px");
  set("--theme-button-font-size", theme.button_font_size, "px");
  set("--theme-small-font-size", theme.small_font_size, "px");
  set("--theme-container-max-width", theme.container_max_width, "px");
  set("--theme-section-spacing-desktop", theme.section_spacing_desktop, "px");
  set("--theme-section-spacing-mobile", theme.section_spacing_mobile, "px");
  set("--theme-card-radius", theme.card_radius, "px");
  set("--theme-button-radius", theme.button_radius, "px");
  set("--theme-input-radius", theme.input_radius, "px");
  set("--theme-gradient-angle", theme.gradient_angle, "deg");
  set("--theme-animation-speed", theme.animation_speed);
  set("--theme-shadow-strength", theme.shadow_strength);
  return variables;
}

const dynamicTypes = [
  ["page", (slug) => `/${slug}`],
  ["service", (slug) => `/services/${slug}`],
  ["case_study", (slug) => `/work/${slug}`],
  ["insight", (slug) => `/insights/${slug}`],
  ["resource", (slug) => `/guides/${slug}`],
  ["comparison", (slug) => `/comparisons/${slug}`],
];
const themePromise = getThemeSnapshot();

const paths = new Set([
  ...corePaths,
  ...serviceSlugs.map((slug) => `/services/${slug}`),
  ...comparisonSlugs.map((slug) => `/comparisons/${slug}`),
]);
const redirectedPaths = new Set(["/industries", "/resources", "/home"]);
const fetched = {};
for (const [type, toPath] of dynamicTypes) {
  const items = await list(type);
  fetched[type] = items;
  for (const item of items) {
    if (!item?.slug) continue;
    if (type === "service" && !serviceSlugs.includes(item.slug)) continue;
    paths.add(toPath(item.slug));
  }
}
for (const redirectedPath of redirectedPaths) paths.delete(redirectedPath);
// Resource placeholders stay out of the sitemap until the CMS publishes them.
if ((fetched.resource || []).length === 0) resourceSlugs.forEach(() => undefined);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
  ...paths,
]
  .sort()
  .map(
    (path) =>
      `  <url><loc>${origin}${path}</loc><changefreq>${path.startsWith("/insights/") ? "monthly" : "weekly"}</changefreq></url>`,
  )
  .join("\n")}\n</urlset>\n`;

const insights = fetched.insight || [];
const rssItems = insights
  .slice(0, 30)
  .map((item) => {
    const url = `${origin}/insights/${item.slug}`;
    const description = String(item.excerpt || "").replace(
      /[<>&]/g,
      (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[character],
    );
    const title = String(item.title || "").replace(
      /[<>&]/g,
      (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[character],
    );
    const date = item.published_at
      ? new Date(item.published_at.replace(" ", "T") + "Z").toUTCString()
      : new Date().toUTCString();
    return `    <item><title>${title}</title><link>${url}</link><guid>${url}</guid><pubDate>${date}</pubDate><description>${description}</description></item>`;
  })
  .join("\n");
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Logicsify Insights</title><link>${origin}/insights</link><description>Practical insights about AI automation, software, SaaS, CRM systems, and digital growth.</description>${rssItems ? `\n${rssItems}\n  ` : ""}</channel></rss>\n`;

await mkdir(publicDir, { recursive: true });
await writeFile(new URL("sitemap.xml", publicDir), xml);
await writeFile(new URL("rss.xml", publicDir), rss);
const themeSnapshot = await themePromise;
await writeFile(
  new URL("theme-snapshot.json", publicDir),
  JSON.stringify({
    version: 2,
    variables: themeVariables(themeSnapshot.theme),
    customCss:
      themeSnapshot.theme.website_custom_css_enabled !== false
        ? String(themeSnapshot.theme.website_custom_css || "")
        : "",
    generatedAt: Date.now(),
    verified: themeSnapshot.verified,
  }),
);
console.log(
  `Generated sitemap with ${paths.size} public routes and RSS with ${insights.length} published insights.`,
);
