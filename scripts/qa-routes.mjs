import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";

const root = process.cwd();
const entryPath = path.join(root, ".vercel/output/functions/__server.func/index.mjs");
if (!fs.existsSync(entryPath)) {
  console.error("Missing Vercel build output. Run the production build first.");
  process.exit(1);
}
const { default: handler } = await import(
  `${new URL(`file://${entryPath}`).href}?qa=${Date.now()}`
);

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

const server = http.createServer(async (req, res) => {
  try {
    const origin = `http://${req.headers.host || "127.0.0.1"}`;
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req);
    const request = new Request(new URL(req.url || "/", origin), {
      method: req.method,
      headers: req.headers,
      body,
      duplex: body ? "half" : undefined,
    });
    const response = await handler.fetch(request, { waitUntil() {} });
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (!response.body) return res.end();
    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end(String(error?.stack || error));
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const base = `http://127.0.0.1:${address.port}`;
const failures = [];
try {
  for (const route of routes) {
    const response = await fetch(`${base}${route}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    const body = await response.text();
    if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`);
    else if (body.length < 3000)
      failures.push(`${route}: response unexpectedly small (${body.length} bytes)`);
    else if (!body.includes("</html>")) failures.push(`${route}: incomplete HTML response`);
    else if (body.includes("This page didn't load") || body.includes("<title>Error</title>"))
      failures.push(`${route}: rendered an error boundary`);
  }

  for (const { legacy, expected } of [
    { legacy: "/web-design-development", expected: "/services/web-design-development" },
    { legacy: "/ai-automations", expected: "/services/ai-automations" },
  ]) {
    const response = await fetch(`${base}${legacy}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    const location = response.headers.get("location");
    if (![301, 302, 307, 308].includes(response.status) || location !== expected) {
      failures.push(
        `${legacy}: expected redirect to ${expected}, got HTTP ${response.status} location=${location}`,
      );
    }
  }
} finally {
  server.closeIdleConnections?.();
  server.closeAllConnections?.();
  server.closeIdleConnections?.();
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length) {
  console.error(`Route QA failed (${failures.length}/${routes.length + 2} checks):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Route QA passed (${routes.length} pages plus 2 legacy redirects).`);
