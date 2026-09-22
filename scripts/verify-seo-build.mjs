import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, "../dist");
const seoRoot = path.join(dist, "_seo");

const required = [
  ["title", /<title[^>]*>[^<]{3,}<\/title>/i],
  ["meta description", /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{40,}["']/i],
  ["robots", /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*index/i],
  ["canonical", /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/logicsify\.com\//i],
  ["Open Graph title", /<meta[^>]+property=["']og:title["']/i],
  ["Open Graph image", /<meta[^>]+property=["']og:image["']/i],
  ["Twitter card", /<meta[^>]+name=["']twitter:card["']/i],
  ["H1", /<h1[^>]*>[\s\S]*?<\/h1>/i],
  ["JSON-LD", /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i],
];

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await htmlFiles(full));
    else if (entry.isFile() && entry.name === "index.html") output.push(full);
  }
  return output;
}

const files = await htmlFiles(seoRoot);
if (!files.length) throw new Error("SEO verification failed: no generated SEO shells found.");

const failures = [];
for (const file of files) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(dist, file).replaceAll(path.sep, "/");
  for (const [label, pattern] of required) {
    if (!pattern.test(html)) failures.push(`${relative}: missing ${label}`);
  }
  const jsonLd = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (jsonLd) {
    try { JSON.parse(jsonLd); }
    catch { failures.push(`${relative}: invalid JSON-LD`); }
  }
}

const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
if (!/User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i.test(robots)) {
  failures.push("robots.txt: OAI-SearchBot is not explicitly allowed");
}
if (!/Sitemap:\s*https:\/\/logicsify\.com\/sitemap\.xml/i.test(robots)) {
  failures.push("robots.txt: canonical sitemap declaration missing");
}

const llms = await readFile(path.join(dist, "llms.txt"), "utf8");
if (!/White Label Development/i.test(llms) || !/Machine-readable discovery/i.test(llms)) {
  failures.push("llms.txt: expected commercial or discovery sections missing");
}

if (failures.length) {
  throw new Error("SEO build verification failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
}

console.log(`Verified ${files.length} crawler-visible SEO shells, robots.txt, and llms.txt.`);
