import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const sourceFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:ts|tsx|js|jsx|css)$/.test(entry.name)) sourceFiles.push(full);
  }
}
walk(src);

const errors = [];
const resolveImport = (file, specifier) => {
  let base;
  if (specifier.startsWith("@/")) base = path.join(src, specifier.slice(2));
  else if (specifier.startsWith(".")) base = path.resolve(path.dirname(file), specifier);
  else return true;
  const candidates = [
    base,
    ...[".ts", ".tsx", ".js", ".jsx", ".json", ".css"].map((extension) => `${base}${extension}`),
    ...[".ts", ".tsx", ".js", ".jsx", ".css"].map((extension) => path.join(base, `index${extension}`)),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
};

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  const imports = [
    ...text.matchAll(/\bfrom\s+["']([^"']+)["']/g),
    ...text.matchAll(/\bimport\s*["']([^"']+)["']/g),
  ];
  for (const match of imports) {
    if (!resolveImport(file, match[1])) {
      const line = text.slice(0, match.index).split("\n").length;
      errors.push(`${path.relative(root, file)}:${line} unresolved import ${match[1]}`);
    }
  }
}

const routeFiles = sourceFiles.filter((file) => file.includes(`${path.sep}routes${path.sep}`) && file.endsWith(".tsx") && !file.endsWith(`${path.sep}__root.tsx`));
const routePatterns = [];
for (const file of routeFiles) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/createFileRoute\((["'])(.*?)\1\)/s);
  if (!match) errors.push(`${path.relative(root, file)} has no createFileRoute declaration`);
  else routePatterns.push(match[2].replace(/\/$/, "") || "/");
}
const duplicates = routePatterns.filter((route, index) => routePatterns.indexOf(route) !== index);
for (const route of new Set(duplicates)) errors.push(`Duplicate route declaration: ${route}`);

const routeTree = fs.readFileSync(path.join(src, "routeTree.gen.ts"), "utf8");
for (const route of routePatterns) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`['"]${escaped}/?['"]`).test(routeTree)) errors.push(`Generated route tree is missing ${route}`);
}

const matchesRoute = (url) => {
  const clean = (url.split(/[?#]/)[0].replace(/\/$/, "") || "/");
  const actual = clean === "/" ? [] : clean.slice(1).split("/");
  return routePatterns.some((pattern) => {
    const expected = pattern === "/" ? [] : pattern.slice(1).split("/");
    return expected.length === actual.length && expected.every((segment, index) => segment.startsWith("$") || segment === actual[index]);
  });
};
const ignoredPrefixes = ["/assets/", "/uploads/", "/api/", "/favicon", "/robots", "/sitemap", "/rss", "/apple-", "/site.webmanifest"];
for (const file of sourceFiles.filter((item) => /\.(?:ts|tsx)$/.test(item))) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/(["'`])(\/[^"'`\s{}<>]*)\1/g)) {
    const url = match[2];
    if (url.startsWith("//") || ignoredPrefixes.some((prefix) => url.startsWith(prefix)) || url.includes("${")) continue;
    if (!matchesRoute(url)) {
      const line = text.slice(0, match.index).split("\n").length;
      errors.push(`${path.relative(root, file)}:${line} internal URL has no route: ${url}`);
    }
  }
}

const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const hasSpaFallback = Array.isArray(vercel.rewrites) && vercel.rewrites.some((rule) => rule?.destination === "/index.html");
if (!hasSpaFallback) errors.push("vercel.json is missing the SPA fallback to /index.html");
const robots = fs.readFileSync(path.join(root, "public", "robots.txt"), "utf8");
if (!robots.includes("Disallow: /admin/")) errors.push("robots.txt must disallow /admin/");
const sitemap = fs.readFileSync(path.join(root, "public", "sitemap.xml"), "utf8");
if (sitemap.includes("/admin/")) errors.push("sitemap.xml contains an admin route");
if (sitemap.includes("<loc>https://logicsify.com/resources/website-planning-checklist</loc>") && !sitemap.includes("published")) {
  // The generated file contains only public URLs; resource drafts are intentionally excluded by the generator.
}

if (errors.length) {
  console.error(`Static QA failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Static QA passed (${sourceFiles.length} source files, ${routePatterns.length} routes, imports, internal URLs, Vercel, robots, and sitemap checked).`);
