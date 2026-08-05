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
if (!html.includes("data-logicsify-entry-css")) {
  failures.push("the entry stylesheet was not inlined");
}
if (/<link rel="stylesheet"[^>]+\/assets\/index-[^>]+>/.test(html)) {
  failures.push("the entry stylesheet is still render blocking");
}

if (failures.length) {
  throw new Error(`Performance build verification failed: ${failures.join("; ")}.`);
}

console.log("Performance build verification passed (stable theme and inline entry CSS).");
