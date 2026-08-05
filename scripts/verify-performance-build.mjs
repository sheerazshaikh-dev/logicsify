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
if (!html.includes("data-logicsify-entry-css")) {
  failures.push("the entry stylesheet was not inlined");
}
if (/<link rel="stylesheet"[^>]+\/assets\/index-[^>]+>/.test(html)) {
  failures.push("the entry stylesheet is still render blocking");
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

const entryCssMatch = html.match(/<style data-logicsify-entry-css>([\s\S]*?)<\/style>/);
const entryCss = entryCssMatch?.[1] || "";
if (!entryCss.includes("page-hero-heading-wrap")) {
  failures.push("the inner-page hero measure is missing");
}
if (/\.hero-heading-wrap[^{}]*\{[^}]*width:\s*75%/.test(entryCss)) {
  failures.push("the homepage hero is still constrained to 75% width");
}

if (failures.length) {
  throw new Error(`Performance build verification failed: ${failures.join("; ")}.`);
}

console.log("Performance build verification passed (stable theme and inline entry CSS).");
