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
import { TopProgressBar } from "@/components/top-progress-bar";
import { HomeHeroLightCables } from "@/components/home-hero-light-cables";

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
        name: "robots",
        content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      },
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
      {
        property: "og:image",
        content: "https://logicsify.com/logicsify-logo-dark.png",
      },
      {
        property: "og:image:alt",
        content: "Logicsify — AI automation, CRM, software and digital delivery",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Logicsify | AI Automation, CRM & Custom Business Platforms",
      },
      {
        name: "twitter:description",
        content:
          "AI automation, CRM, websites, SaaS, portals and connected business systems built by Logicsify.",
      },
      {
        name: "twitter:image",
        content: "https://logicsify.com/logicsify-logo-dark.png",
      },
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "icon", href: "/f2048ae62fb525b2c29c3e51e755cc17.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/f2048ae62fb525b2c29c3e51e755cc17.png" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        href: "/rss.xml",
        title: "Logicsify Insights RSS",
      },
      {
        rel: "alternate",
        type: "text/plain",
        href: "/llms.txt",
        title: "Logicsify AI-readable site summary",
      },
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
              logo: {
                "@type": "ImageObject",
                url: "https://logicsify.com/logicsify-logo-dark.png",
              },
              image: "https://logicsify.com/logicsify-logo-dark.png",
              email: "hello@logicsify.com",
              telephone: "+923333718191",
              description:
                "Logicsify is a technology and digital delivery company providing AI automation, CRM, websites, SaaS products, portals, custom software, white-label development, cybersecurity, and digital growth services.",
              sameAs: [
                "https://www.linkedin.com/company/logicsify",
                "https://www.instagram.com/logicsify/",
              ],
              areaServed: [
                { "@type": "Country", name: "Pakistan" },
                { "@type": "Country", name: "Saudi Arabia" },
                { "@type": "Country", name: "Portugal" },
              ],
              knowsAbout: [
                "AI automation",
                "AI voice agents",
                "CRM and revenue operations",
                "Custom software development",
                "Website and portal development",
                "SaaS product development",
                "White-label development",
                "Mobile app development",
                "Cybersecurity",
                "SEO and digital marketing",
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "general inquiries",
                  email: "hello@logicsify.com",
                  telephone: "+923333718191",
                  availableLanguage: ["English", "Urdu"],
                },
                {
                  "@type": "ContactPoint",
                  contactType: "sales",
                  email: "sales@logicsify.com",
                  telephone: "+923333718191",
                },
                {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: "support@logicsify.com",
                },
              ],
              location: [
                {
                  "@type": "Place",
                  name: "Karachi, Pakistan",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Karachi",
                    addressCountry: "PK",
                  },
                },
                {
                  "@type": "Place",
                  name: "Jeddah, Saudi Arabia",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Jeddah",
                    addressCountry: "SA",
                  },
                },
                {
                  "@type": "Place",
                  name: "Leiria / Nazaré, Portugal",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Leiria / Nazaré",
                    addressCountry: "PT",
                  },
                },
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://logicsify.com/#website",
              name: "Logicsify",
              url: "https://logicsify.com/",
              inLanguage: "en",
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
      <TopProgressBar />
      <RuntimeSiteSettings />
      <RuntimeIntegrations />
      <Outlet />
      <HomeHeroLightCables />
      <DeferredToaster />
    </>
  );
}
