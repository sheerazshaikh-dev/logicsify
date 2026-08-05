import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

function stableFirstPaintPlugin() {
  return {
    name: "logicsify-stable-first-paint",
    transformIndexHtml() {
      const snapshotPath = path.resolve("public/theme-snapshot.json");
      let snapshot = { variables: {}, generatedAt: 0 };
      try {
        snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
      } catch {
        // Development and offline builds use the matching defaults in styles.css.
      }
      const serialized = JSON.stringify(snapshot).replace(/</g, "\\u003c");
      const bootstrap = `(()=>{try{const b=${serialized};const c=JSON.parse(localStorage.getItem("logicsify:theme:v1")||"null");const s=c&&c.savedAt>b.generatedAt?c:b;Object.entries(s.variables||{}).forEach(([k,v])=>document.documentElement.style.setProperty(k,String(v)));}catch{}})();`;
      return [
        {
          tag: "script",
          attrs: { "data-logicsify-theme": "bootstrap" },
          children: bootstrap,
          injectTo: "head-prepend",
        },
      ];
    },
    closeBundle() {
      const outputPath = path.resolve("dist/index.html");
      if (!fs.existsSync(outputPath)) return;
      let html = fs.readFileSync(outputPath, "utf8");
      html = html.replace(
        /<link rel="stylesheet" crossorigin href="\/(assets\/[^"]+\.css)">/g,
        (tag, assetPath) => {
          const cssPath = path.resolve("dist", assetPath);
          if (!fs.existsSync(cssPath)) return tag;
          const css = fs.readFileSync(cssPath, "utf8").replace(/<\/style/gi, "<\\/style");
          return `<style data-logicsify-entry-css>${css}</style>`;
        },
      );
      fs.writeFileSync(outputPath, html);
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    stableFirstPaintPlugin(),
  ],
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
  },
});
