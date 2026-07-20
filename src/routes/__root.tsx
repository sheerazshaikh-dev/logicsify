import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { RuntimeIntegrations } from "@/components/runtime-integrations";
import { RuntimeSiteSettings } from "@/components/runtime-site-settings";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-ink text-white grid-noise relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(254,52,52,0.35),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(253,190,2,0.25),transparent_60%)]" />
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Logicsify | Web Development, AI Automation & Digital Marketing" },
      {
        name: "description",
        content:
          "Logicsify designs websites, web applications, SaaS products, AI automations, and digital marketing systems that help businesses grow.",
      },
      { name: "author", content: "Logicsify" },
      {
        property: "og:title",
        content: "Logicsify | Web Development, AI Automation & Digital Marketing",
      },
      {
        property: "og:description",
        content: "Technology, marketing, and automation—logically built for growth.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Logicsify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#190A2F" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Logicsify",
          url: "https://logicsify.com/",
          description: "Technology, marketing, and automation—logically built for growth.",
          sameAs: ["https://linkedin.com", "https://instagram.com", "https://facebook.com"],
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <RuntimeSiteSettings />
      <RuntimeIntegrations />
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
