import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { caseStudies as staticCaseStudies } from "@/lib/site-data";
import { getCmsContentList } from "@/lib/logicsify-api";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { PublicRouteLoading } from "@/components/public-route-loading";
export const Route = createFileRoute("/work/")({
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async () => {
    const cms = await getCmsContentList("case_study");
    if (!cms.length) return { caseStudies: staticCaseStudies };
    return {
      caseStudies: cms.map((entry) => {
        const fallback = staticCaseStudies.find((item) => item.slug === entry.slug);
        const tags =
          Array.isArray(entry.content_json?.tags) && entry.content_json.tags.length
            ? entry.content_json.tags
            : fallback?.tags || ["Web Apps"];
        const category = String(
          entry.content_json?.category || fallback?.category || tags[0] || "Case Study",
        );
        return {
          slug: entry.slug,
          name: entry.title,
          client: String(entry.content_json?.client || fallback?.client || "Logicsify Client"),
          category,
          services: Array.isArray(entry.content_json?.services)
            ? entry.content_json.services.map(String)
            : fallback?.services || tags.slice(0, 2),
          challenge: String(
            entry.content_json?.challenge ||
              entry.content_json?.body ||
              fallback?.challenge ||
              entry.excerpt ||
              "A complex business challenge solved with a connected digital system.",
          ),
          outcome: String(
            entry.content_json?.outcome ||
              fallback?.outcome ||
              entry.excerpt ||
              "A scalable foundation designed for measurable growth.",
          ),
          tags,
        };
      }),
    };
  },
  component: WorkPage,
  head: () => ({
    meta: [
      { title: "Our Work | Logicsify Case Studies" },
      {
        name: "description",
        content:
          "Selected case studies across web, apps, SaaS, e-commerce, AI automation, and marketing.",
      },
      { property: "og:title", content: "Our Work | Logicsify" },
      { property: "og:url", content: "/work" },
    ],
    links: [{ rel: "canonical", href: "/work" }],
  }),
});

const filters = [
  "All",
  "Websites",
  "Web Apps",
  "SaaS",
  "E-commerce",
  "AI Automation",
  "Marketing",
  "Branding",
];

function WorkPage() {
  const { caseStudies } = Route.useLoaderData();
  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? caseStudies : caseStudies.filter((study) => study.tags.includes(active));
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Selected work"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Work" }]}
        title={
          <>
            Digital systems built to create{" "}
            <span className="text-gradient">measurable impact.</span>
          </>
        }
        intro="A selection of engagements across product, platform, AI automation, and growth."
        primaryCta={{ label: "Start a Project", to: "/contact" }}
      />
      <section className="py-16">
        <div className="container-page">
          <div className="flex flex-wrap gap-2 mb-10">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActive(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  active === filter
                    ? "bg-gradient-brand text-white shadow-[var(--shadow-glow)]"
                    : "bg-white border border-black/10 text-ink hover:border-black/30",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((study) => (
              <Link
                to="/work/$slug"
                params={{ slug: study.slug }}
                key={study.slug}
                className="group relative overflow-hidden rounded-3xl bg-ink text-white p-8 md:p-10 min-h-[380px] flex flex-col justify-between"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-brand-red/25 to-brand-gold/15" />
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
                <div className="relative">
                  <p className="eyebrow text-white/60">
                    {study.category} · {study.client}
                  </p>
                  <h3 className="mt-3 text-2xl md:text-3xl font-semibold">{study.name}</h3>
                  <p className="mt-3 text-white/70 text-sm max-w-md">{study.challenge}</p>
                </div>
                <div className="relative mt-8 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {study.services.slice(0, 2).map((service) => (
                      <span
                        key={service}
                        className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
