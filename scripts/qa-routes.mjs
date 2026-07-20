import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const distIndex = path.join(root, "dist/index.html");
const vercelPath = path.join(root, "vercel.json");
const routeTreePath = path.join(root, "src/routeTree.gen.ts");

for (const required of [distIndex, vercelPath, routeTreePath]) {
  if (!fs.existsSync(required)) {
    console.error(`Missing required production file: ${path.relative(root, required)}`);
    process.exit(1);
  }
}

const source = fs.readFileSync(path.join(root, "src/lib/site-data.ts"), "utf8");
const serviceBlock = source.split("export const industries")[0];
const serviceRoutes = [...serviceBlock.matchAll(/route:\s*"([^"]+)"/g)].map((match) => match[1]);
function slugsBetween(start, end) {
  const block = source.split(start)[1]?.split(end)[0] || "";
  return [...block.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
}
const industryRoutes = slugsBetween("export const industries = [", "];").map(
  (slug) => `/industries/${slug}`,
);
const workRoutes = slugsBetween("export const caseStudies = [", "];").map(
  (slug) => `/work/${slug}`,
);
const insightRoutes = slugsBetween("export const insights = [", "];").map(
  (slug) => `/insights/${slug}`,
);
const staticRoutes = [
  "/",
  "/services",
  "/industries",
  "/work",
  "/insights",
  "/about",
  "/process",
  "/technology",
  "/careers",
  "/contact",
  "/book-a-call",
  "/privacy",
  "/terms",
  "/admin/login",
  "/admin/dashboard",
  "/admin/pages",
  "/admin/services",
  "/admin/industries",
  "/admin/case-studies",
  "/admin/insights",
  "/admin/careers",
  "/admin/testimonials",
  "/admin/team",
  "/admin/leads",
  "/admin/bookings",
  "/admin/media",
  "/admin/menus",
  "/admin/settings",
  "/admin/administrators",
  "/admin/trash",
  "/admin/audit-logs",
  "/admin/account",
];
const routes = [
  ...new Set([
    ...staticRoutes,
    ...serviceRoutes,
    ...industryRoutes,
    ...workRoutes,
    ...insightRoutes,
  ]),
];

const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
const hasSpaRewrite =
  Array.isArray(vercel.rewrites) &&
  vercel.rewrites.some((rule) => rule?.source === "/(.*)" && rule?.destination === "/index.html");
if (!hasSpaRewrite) {
  console.error("vercel.json is missing the SPA fallback rewrite to /index.html.");
  process.exit(1);
}

const indexHtml = fs.readFileSync(distIndex, "utf8");
if (!indexHtml.includes('<div id="root"></div>') || !indexHtml.includes("/assets/")) {
  console.error("dist/index.html is not a valid Vite SPA entry.");
  process.exit(1);
}

const port = await new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    const value = typeof address === "object" && address ? address.port : 4173;
    server.close(() => resolve(value));
  });
});

const viteBin = path.resolve("node_modules/vite/bin/vite.js");
const preview = spawn(
  process.execPath,
  [viteBin, "preview", "--host", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let previewOutput = "";
preview.stdout.on("data", (chunk) => {
  previewOutput += chunk;
});
preview.stderr.on("data", (chunk) => {
  previewOutput += chunk;
});

const base = `http://127.0.0.1:${port}`;
let ready = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  try {
    const response = await fetch(base, { signal: AbortSignal.timeout(1000) });
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {
    // Keep waiting for Vite preview.
  }
}
if (!ready) {
  preview.kill("SIGTERM");
  console.error(`Vite preview did not start.\n${previewOutput}`);
  process.exit(1);
}

const failures = [];
try {
  for (const route of routes) {
    const response = await fetch(`${base}${route}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.text();
    if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`);
    else if (!body.includes('<div id="root"></div>')) failures.push(`${route}: SPA entry missing`);
  }

  for (const asset of ["/robots.txt", "/sitemap.xml", "/favicon.ico"]) {
    const response = await fetch(`${base}${asset}`, { signal: AbortSignal.timeout(10_000) });
    if (response.status !== 200) failures.push(`${asset}: HTTP ${response.status}`);
  }
} finally {
  preview.kill("SIGTERM");
}

if (failures.length) {
  console.error(`SPA route QA failed (${failures.length}/${routes.length + 3} checks):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`SPA route QA passed (${routes.length} client routes and 3 public assets).`);
