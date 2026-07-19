import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteDataPath = path.join(root, "src/lib/site-data.ts");
const source = fs.readFileSync(siteDataPath, "utf8");
const beforeIndustries = source.split("export const industries")[0];
const serviceEntries = [
  ...beforeIndustries.matchAll(/slug:\s*"([^"]+)"[\s\S]*?route:\s*"([^"]+)"/g),
].map((match) => ({ slug: match[1], route: match[2] }));
const errors = [];

if (serviceEntries.length !== 17) {
  errors.push(`Expected 17 coded services, found ${serviceEntries.length}.`);
}
for (const { slug, route } of serviceEntries) {
  const expected = `/services/${slug}`;
  if (route !== expected) errors.push(`Service ${slug} uses ${route}; expected ${expected}.`);
}

const contentRoutes = fs.readFileSync(path.join(root, "src/lib/content-routes.ts"), "utf8");
for (const fragment of [
  'case "service":\n      return `/services/${slug}`',
  'case "industry":\n      return `/industries/${slug}`',
  'case "case_study":\n      return `/work/${slug}`',
  'case "insight":\n      return `/insights/${slug}`',
]) {
  if (!contentRoutes.includes(fragment))
    errors.push(`Missing public content route mapping: ${fragment.split("\n")[0]}.`);
}

const sourceFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:ts|tsx)$/.test(entry.name)) sourceFiles.push(full);
  }
}
walk(path.join(root, "src"));

const serviceSlugs = new Set(serviceEntries.map((item) => item.slug));
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(
    /["'`]\/(?!services\/|industries\/|work\/|insights\/|admin\/)([a-z0-9-]+)["'`]/g,
  )) {
    if (!serviceSlugs.has(match[1])) continue;
    const line = text.slice(0, match.index).split("\n").length;
    errors.push(`${path.relative(root, file)}:${line} contains legacy service URL /${match[1]}.`);
  }
}

if (errors.length) {
  console.error("Source-link QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Source-link QA passed (${serviceEntries.length} service URLs checked).`);
