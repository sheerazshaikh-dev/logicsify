import { spawnSync } from "node:child_process";
import path from "node:path";

const checks = [
  [path.resolve("node_modules/typescript/bin/tsc"), ["--noEmit"], "TypeScript"],
  [
    path.resolve("node_modules/eslint/bin/eslint.js"),
    ["src", "vite.config.ts", "eslint.config.js"],
    "ESLint",
  ],
  [path.resolve("scripts/qa-source-links.mjs"), [], "Source-link audit"],
  [path.resolve("scripts/build-qa.mjs"), [], "Vite production build"],
  [path.resolve("scripts/qa-routes.mjs"), [], "Vite SPA route audit"],
];

for (const [script, args, label] of checks) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\nAll Vite/Vercel production QA checks passed.");
