import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { allServices, industries, caseStudies, insights } from "@/lib/site-data";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          "/",
          "/services",
          "/industries",
          "/work",
          "/about",
          "/process",
          "/technology",
          "/insights",
          "/careers",
          "/contact",
          "/book-a-call",
          "/privacy",
          "/terms",
          ...allServices.map((s) => s.route),
          ...industries.map((i) => `/industries/${i.slug}`),
          ...caseStudies.map((c) => `/work/${c.slug}`),
          ...insights.map((p) => `/insights/${p.slug}`),
        ];
        const urls = paths
          .map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`)
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
