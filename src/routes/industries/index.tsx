import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { industries as staticIndustries } from "@/lib/site-data";
import { getCmsContentList } from "@/lib/logicsify-api";
import { ArrowRight } from "lucide-react";

import { PublicRouteLoading } from "@/components/public-route-loading";
export const Route = createFileRoute("/industries/")({
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async () => {
    const cms = await getCmsContentList("industry");
    if (!cms.length) return { industries: staticIndustries };
    return {
      industries: cms.map((entry) => {
        const fallback = staticIndustries.find((item) => item.slug === entry.slug);
        return {
          slug: entry.slug,
          name: entry.title,
          tag: String(entry.content_json?.category || fallback?.tag || "Industry expertise"),
          desc:
            entry.excerpt ||
            fallback?.desc ||
            "Technology, automation, and growth systems tailored to this industry.",
        };
      }),
    };
  },
  component: IndustriesOverview,
  head: () => ({
    meta: [
      { title: "Industries | Logicsify" },
      {
        name: "description",
        content: "Sectors where Logicsify delivers senior-level technology, AI, and growth work.",
      },
      { property: "og:title", content: "Industries | Logicsify" },
      { property: "og:url", content: "/industries" },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
  }),
});

function IndustriesOverview() {
  const { industries } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Industries"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Industries" }]}
        title={
          <>
            Deep experience in the sectors <span className="text-gradient">we serve.</span>
          </>
        }
        intro="We build for teams whose products and operations have real complexity — where the details matter and the stakes are visible."
        primaryCta={{ label: "Book a Strategy Call", to: "/book-a-call" }}
      />
      <section className="py-24">
        <div className="container-page grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((industry) => (
            <Link
              to="/industries/$slug"
              params={{ slug: industry.slug }}
              key={industry.slug}
              className="group rounded-2xl border border-black/10 bg-white p-8 hover:-translate-y-1 transition-all"
            >
              <p className="eyebrow mb-3">{industry.tag}</p>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-gradient transition">
                {industry.name}
              </h3>
              <p className="text-ink-soft">{industry.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
