import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  notFound,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { RuntimeIntegrations } from "@/components/runtime-integrations";
import { RuntimeSiteSettings } from "@/components/runtime-site-settings";
import { DeferredToaster } from "@/components/deferred-toaster";

function NotFoundComponent() {
  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previous = robots.content;
    robots.content = "noindex, nofollow, noarchive";
    return () => {
      if (created) robots?.remove();
      else if (robots) robots.content = previous;
    };
  }, []);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-ink text-white grid-noise relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 brand-radial-glow" />
      <div className="max-w-md text-center relative px-6">
        <p className="eyebrow text-white/60 mb-4">Error 404</p>
        <h1 className="fluid-display text-gradient">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">This page took a wrong turn</h2>
        <p className="mt-3 text-white/70">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/" className="btn-primary">
            Go home
          </Link>
          <Link to="/contact" className="btn-ghost-dark">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-ghost-light">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    if (/^\/admin(?:\/|$)/.test(location.pathname)) {
      throw notFound();
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Logicsify | Web Development, AI Automation & Digital Growth" },
      {
        name: "description",
        content:
          "Logicsify builds websites, web applications, SaaS products, AI automations, CRM workflows, and digital marketing systems for growing businesses.",
      },
      { name: "author", content: "Logicsify" },
      {
        property: "og:title",
        content: "Logicsify | Web Development, AI Automation & Digital Growth",
      },
      {
        property: "og:description",
        content: "Technology, marketing, and automation—logically built for growth.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Logicsify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "icon", href: "/f2048ae62fb525b2c29c3e51e755cc17.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/f2048ae62fb525b2c29c3e51e755cc17.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["Organization", "ProfessionalService"],
              "@id": "https://logicsify.com/#organization",
              name: "Logicsify",
              url: "https://logicsify.com/",
              logo: "https://logicsify.com/3b4a0a2a1d78df66b5bb7dac579e144c.png",
              email: "connect@logicsify.com",
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "sales",
                  email: "sales@logicsify.com",
                  telephone: "+966544415405",
                },
                {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: "support@logicsify.com",
                },
              ],
              location: [
                { "@type": "Place", name: "Karachi, Pakistan" },
                { "@type": "Place", name: "Jeddah, Saudi Arabia" },
                { "@type": "Place", name: "Leiria / Nazaré, Portugal" },
              ],
              description: "Technology, marketing, and automation—logically built for growth.",
            },
            {
              "@type": "WebSite",
              "@id": "https://logicsify.com/#website",
              name: "Logicsify",
              url: "https://logicsify.com/",
              publisher: { "@id": "https://logicsify.com/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <RuntimeSiteSettings />
      <RuntimeIntegrations />
      <Outlet />
      <DeferredToaster />
    </>
  );
}
