import fs from "node:fs";
import path from "node:path";

const htmlPath = path.resolve("dist/index.html");
if (!fs.existsSync(htmlPath)) throw new Error("dist/index.html was not generated.");

const html = fs.readFileSync(htmlPath, "utf8");
const failures = [];
if (!html.includes('data-logicsify-theme="bootstrap"')) {
  failures.push("the initial theme bootstrap is missing");
}
if (!html.includes("--theme-h1-max")) {
  failures.push("layout-critical theme values were not embedded");
}
if (!html.includes("logicsify:theme:v2")) {
  failures.push("the last-known-good API theme cache is missing");
}
if (!html.includes("data-logicsify-runtime")) {
  failures.push("the cached API custom CSS bootstrap is missing");
}

// Keep the full Tailwind bundle as a cacheable stylesheet instead of embedding it
// into every HTML response. The small theme bootstrap above still runs before the
// stylesheet, so theme variables are ready before first paint without bloating HTML.
const stylesheetMatch = html.match(/<link rel="stylesheet"[^>]+href="\/(assets\/index-[^"]+\.css)"[^>]*>/);
if (!stylesheetMatch) {
  failures.push("the cacheable entry stylesheet link is missing");
}
if (html.includes("data-logicsify-entry-css")) {
  failures.push("the full entry stylesheet is still inlined into HTML");
}

const builtAssetsDirectory = path.resolve("dist/assets");
const builtJavaScript = fs.existsSync(builtAssetsDirectory)
  ? fs
      .readdirSync(builtAssetsDirectory)
      .filter((file) => file.endsWith(".js"))
      .map((file) => fs.readFileSync(path.join(builtAssetsDirectory, file), "utf8"))
      .join("\n")
  : "";
if (!builtJavaScript.includes("Get a Free Technical Roadmap")) {
  failures.push("the stable first-render header CTA fallback is missing");
}

let entryCss = "";
if (stylesheetMatch?.[1]) {
  const cssPath = path.resolve("dist", stylesheetMatch[1]);
  if (!fs.existsSync(cssPath)) {
    failures.push("the entry stylesheet asset was not generated");
  } else {
    entryCss = fs.readFileSync(cssPath, "utf8");
  }
}
if (!entryCss.includes("page-hero-heading-wrap")) {
  failures.push("the inner-page hero measure is missing");
}
if (/\.hero-heading-wrap[^{}]*\{[^}]*width:\s*75%/.test(entryCss)) {
  failures.push("the homepage hero is still constrained to 75% width");
}

// Public HTML must not eagerly preload admin/editor-only chunks.
const adminPreloads = ["admin-api-", "admin-shell-", "visual-page-api-"];
for (const chunk of adminPreloads) {
  if (html.includes(`rel="modulepreload"`) && html.includes(chunk)) {
    failures.push(`public HTML still preloads ${chunk} code`);
  }
}

if (failures.length) {
  throw new Error(`Performance build verification failed: ${failures.join("; ")}.`);
}

console.log("Performance build verification passed (cached entry CSS and public preload hygiene).");
