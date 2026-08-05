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
      let snapshot = {
        version: 2,
        variables: {},
        customCss: "",
        generatedAt: 0,
        verified: false,
      };
      try {
        snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
      } catch {
        // Development and offline builds use the matching defaults in styles.css.
      }
      const serialized = JSON.stringify(snapshot).replace(/</g, "\\u003c");
      const bootstrap = `(()=>{try{const b=${serialized};const c=JSON.parse(localStorage.getItem("logicsify:theme:v2")||"null");const valid=c&&c.version===2&&c.variables&&typeof c.variables==="object";const s=valid&&(!b.verified||c.savedAt>b.generatedAt)?c:b;Object.entries(s.variables||{}).forEach(([k,v])=>document.documentElement.style.setProperty(k,String(v)));const p=location.pathname;const safe=new URLSearchParams(location.search).get("safe-runtime")==="1";if(!safe&&!p.startsWith("/admin")&&!p.startsWith("/control/")&&s.customCss){const e=document.createElement("style");e.setAttribute("data-logicsify-runtime","public-custom-css");e.textContent=String(s.customCss);document.head.appendChild(e);}}catch{}})();`;
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
