import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";
import "./admin-login-fix.css";
import "./home-hero-layout.css";

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root application mount element.");

// Production SEO responses include a visible, crawler-readable HTML fallback.
// Clear it immediately before React mounts so the SPA owns the live UI without
// hydration warnings or duplicate interactive markup.
if (rootElement.hasChildNodes()) rootElement.replaceChildren();

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// Once the client router has installed its own route metadata, remove the
// server/prerender metadata copies. Non-JavaScript crawlers still receive those
// tags in the original HTML response, while rendered browsers keep one clean
// canonical metadata set.
window.requestAnimationFrame(() => {
  document
    .querySelectorAll('[data-seo-prerender="true"], [data-seo-server="true"]')
    .forEach((node) => node.remove());
});
