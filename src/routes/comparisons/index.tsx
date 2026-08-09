import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Scale } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { getCmsContentList } from "@/lib/logicsify-api";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/comparisons/")({
  pendingComponent: PublicRouteLoading,
  loader: async () => ({ cms: await getCmsContentList("comparison") }),
  component: ComparisonsPage,
  head: () => ({
    meta: [
      { title: "Technology Comparisons & Decision Guides | Logicsify" },
      {
        name: "description",
        content:
          "Balanced comparisons for CMS platforms, custom software, CRM systems, voice AI workflows, and development engagement decisions.",
      },
      {
        property: "og:title",
        content: "Technology Comparisons & Decision Guides | Logicsify",
      },
      {
        property: "og:description",
        content:
          "Practical decision frameworks for choosing platforms, software approaches, and delivery models.",
      },
      { property: "og:url", content: "https://logicsify.com/comparisons" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/comparisons" }],
  }),
});

function ComparisonsPage() {
  const { cms } = Route.useLoaderData();

  // The CMS/database is the only source of truth for comparisons.
  // Deleted CMS posts must disappear and newly published posts must appear
  // without being merged with legacy hard-coded seed records.
  const items = cms.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary:
      item.excerpt ||
      String(item.content_json?.summary || item.content_json?.introduction || "Open the full decision guide."),
    featuredImage: item.featured_image || "",
  }));

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Comparisons"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Comparisons" }]}
        title={
          <>
            Choose tools and delivery models with the <span className="text-gradient">tradeoffs visible.</span>
          </>
        }
        intro="These guides do not force the same answer for every business. Each option can be correct under different constraints."
        primaryCta={{ label: "Get a Free Technical Roadmap", to: "/technical-roadmap" }}
      />
      <section className="py-20 md:py-28">
        <div className="container-page">
          {items.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to="/comparisons/$slug"
                  params={{ slug: item.slug }}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {item.featuredImage ? (
                    <div className="aspect-[16/8] overflow-hidden border-b border-black/10 bg-cream">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <div className="p-8">
                    <Scale className="h-7 w-7 text-brand-red" />
                    <h2 className="mt-5 text-2xl font-semibold">{item.title}</h2>
                    <p className="mt-4 text-ink-soft">{item.summary}</p>
                    <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                      Open comparison <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-black/10 bg-white px-8 py-16 text-center">
              <Scale className="mx-auto h-10 w-10 text-ink-soft" />
              <h2 className="mt-5 fluid-h3">No published comparisons yet.</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-soft">
                Published comparisons from Content Studio will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </section>
      <TechnicalRoadmapCTA source="comparisons" />
    </SiteLayout>
  );
}
