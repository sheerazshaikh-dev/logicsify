import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { industries, allServices } from "@/lib/site-data";
import { Check, ArrowRight } from "lucide-react";
import { getCmsContentItem } from "@/lib/logicsify-api";
import { asRecord, asRecordArray } from "@/lib/content-utils";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/industries/$slug")({
  component: IndustryPage,
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    const cms = await getCmsContentItem("industry", params.slug);
    const fallback = industries.find((item) => item.slug === params.slug);
    if (!cms && !fallback) throw notFound();

    const content = asRecord(cms?.content_json);
    const sections = asRecordArray(content.sections);
    const outcomes = Array.isArray(content.outcomes)
      ? content.outcomes.map(String)
      : sections.length
        ? sections.map((section) => String(section.body || section.title || "")).filter(Boolean)
        : outcomesByIndustry[params.slug] || [];

    return {
      industry: {
        slug: params.slug,
        name: cms?.title || fallback?.name || "Industry",
        tag: String(content.category || fallback?.tag || "Industry expertise"),
        desc: cms?.excerpt || String(content.body || fallback?.desc || ""),
      },
      outcomes,
    };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.industry.name ?? "Industry"} | Logicsify` },
      { name: "description", content: loaderData?.industry.desc ?? "" },
      { property: "og:title", content: `${loaderData?.industry.name ?? ""} | Logicsify` },
      { property: "og:url", content: `/industries/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/industries/${params.slug}` }],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-40 text-center">
        <h1 className="fluid-h2">Industry not found</h1>
      </div>
    </SiteLayout>
  ),
});

const outcomesByIndustry: Record<string, string[]> = {
  "startups-saas": [
    "Ship a market-ready MVP in a defined window",
    "Instrument product analytics from day one",
    "Build acquisition and lifecycle in the same system",
    "Prepare for enterprise readiness (SSO, SOC2)",
  ],
  "professional-services": [
    "Automate lead intake and qualification",
    "Reduce admin time per client engagement",
    "Publish thought leadership at a defensible cadence",
    "Unify CRM, billing, and delivery",
  ],
  "home-services": [
    "Rank locally and consistently on Google",
    "Qualify inbound calls and forms 24/7",
    "Automate scheduling and dispatch handoffs",
    "Report on true cost-per-booked-job",
  ],
  healthcare: [
    "HIPAA-aware portals and patient-facing tools",
    "AI-assisted appointment booking and reminders",
    "Clean patient acquisition funnels",
    "Reporting the operations team actually uses",
  ],
  ecommerce: [
    "Storefronts that load fast on mobile",
    "Merchandising velocity for the marketing team",
    "Lifecycle marketing tied to product events",
    "Paid media that respects LTV",
  ],
  "real-estate": [
    "IDX and property portals done properly",
    "Agent and broker portals with clean permissions",
    "Inbound lead qualification and routing",
    "Local SEO that compounds",
  ],
  "financial-services": [
    "Compliance-minded builds and audit trails",
    "Dashboards for advisors and clients",
    "CRM and billing integrations that don't drift",
    "Content programs that build trust",
  ],
};

function IndustryPage() {
  const { industry, outcomes } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero
        eyebrow={industry.tag}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Industries", to: "/industries" },
          { label: industry.name },
        ]}
        title={<>{industry.name}</>}
        intro={industry.desc}
        primaryCta={{ label: "Start a Project", to: "/contact" }}
        secondaryCta={{ label: "See relevant work", to: "/work" }}
      />

      <section className="py-24">
        <div className="container-page grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">Outcomes we deliver</p>
            <h2 className="fluid-h2">What “done” looks like.</h2>
          </div>
          <ul className="lg:col-span-7 space-y-4">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3 text-ink leading-relaxed">
                <Check className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24 bg-cream">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-4">Services relevant to {industry.name}</p>
            <h2 className="fluid-h2">Where we typically start.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allServices.slice(0, 9).map((service) => (
              <Link
                to={service.route}
                key={service.slug}
                className="group rounded-2xl border border-black/10 bg-white p-6 hover:-translate-y-1 transition-all"
              >
                <h3 className="text-lg font-semibold group-hover:text-gradient transition">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{service.short}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
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
