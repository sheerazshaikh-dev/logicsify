import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteData = fs.readFileSync(path.join(root, "src/lib/site-data.ts"), "utf8");
const directServiceRoutes = [...siteData.matchAll(/"(\/services\/[a-z0-9-]+)(?:#[^"]*)?"/g)]
  .map((match) => match[1]);
const declaredServiceSlugs = [
  ...[...siteData.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]),
  ...[...siteData.matchAll(/subservice\(\s*"[a-z0-9-]+"\s*,\s*"([a-z0-9-]+)"/g)].map((match) => match[1]),
];
const serviceRoutes = [...new Set([...directServiceRoutes, ...declaredServiceSlugs.map((slug) => `/services/${slug}`)])];

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|html|xml)$/.test(entry.name)) files.push(full);
  }
}
walk(path.join(root, "src"));

const allowedFiles = new Set([
  path.join(root, "src/lib/site-data.ts"),
  path.join(root, "src/lib/content-routes.ts"),
  path.join(root, "src/routes/industries/index.tsx"),
  path.join(root, "src/routes/industries/$slug.tsx"),
]);

const problems = [];
for (const file of files) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (
    relative === "src/routeTree.gen.ts" ||
    relative.startsWith("src/routes/admin/") ||
    allowedFiles.has(file)
  ) continue;

  const source = fs.readFileSync(file, "utf8");
  if (/\/industries(?:\/|["'`])/i.test(source)) {
    problems.push(`${relative} contains a public Industries URL`);
  }
  if (/Who\s+We\s+Serve/i.test(source)) {
    problems.push(`${relative} contains industry positioning copy`);
  }
}

const canonicalRoutes = new Set(serviceRoutes);
const required = [
  "/services/ai-automation-voice-agents",
  "/services/crm-revenue-operations",
  "/services/custom-websites-portals-cms",
  "/services/ai-calling-agents",
  "/services/gohighlevel-implementation",
  "/services/custom-cms-platforms",
  "/services/cybersecurity",
];
for (const route of required) {
  if (!canonicalRoutes.has(route)) problems.push(`Missing canonical core service route: ${route}`);
}

const staticSitemapPath = path.join(root, "public/sitemap.xml");
if (fs.existsSync(staticSitemapPath)) {
  problems.push("A static public/sitemap.xml exists; production sitemap must remain database-driven.");
}
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const sitemapRewrite = Array.isArray(vercel.rewrites)
  ? vercel.rewrites.find((rule) => rule?.source === "/sitemap.xml")
  : null;
if (!sitemapRewrite || !String(sitemapRewrite.destination || "").includes("public/sitemap.xml")) {
  problems.push("vercel.json is missing the live backend sitemap rewrite.");
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`Source link audit passed (${canonicalRoutes.size} canonical service routes, no public Industries references).`);
