import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { caseStudies } from "@/lib/site-data";
import { ArrowRight, Check } from "lucide-react";
import { getCmsContentItem, getCmsContentList } from "@/lib/logicsify-api";
import { asRecord, asRecordArray } from "@/lib/content-utils";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/work/$slug")({
  component: CasePage,
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    const [cms, cmsCases] = await Promise.all([
      getCmsContentItem("case_study", params.slug),
      getCmsContentList("case_study"),
    ]);
    const fallback = caseStudies.find((item) => item.slug === params.slug);
    if (!cms && !fallback) throw notFound();

    const content = asRecord(cms?.content_json);
    const services = Array.isArray(content.services)
      ? content.services.map(String)
      : Array.isArray(content.tags)
        ? content.tags.map(String)
        : fallback?.services || [];
    const sections = asRecordArray(content.sections);
    const sectionMap = Object.fromEntries(
      sections.map((section) => [
        String(section.title || "").toLowerCase(),
        String(section.body || ""),
      ]),
    );

    const study = {
      slug: params.slug,
      name: cms?.title || fallback?.name || "Case Study",
      client: String(content.client || fallback?.client || "Client"),
      category: String(content.category || fallback?.category || "Case Study"),
      services,
      challenge:
        cms?.excerpt ||
        String(content.challenge || sectionMap.challenge || fallback?.challenge || ""),
      outcome: String(content.outcome || sectionMap.outcome || fallback?.outcome || ""),
      objectives: String(
        content.objectives ||
          sectionMap.objectives ||
          "Align stakeholders on outcomes, define the shortest path to a validated release, and instrument the system to measure success from day one.",
      ),
      strategy: String(
        content.strategy ||
          sectionMap.strategy ||
          content.body ||
          "A phased engagement aligned design, engineering, automation, and growth around a single roadmap.",
      ),
      experience: String(
        content.user_experience ||
          sectionMap["user experience"] ||
          "Research-led information architecture and interaction design, validated before production development.",
      ),
      technology: String(
        content.technology ||
          sectionMap.technology ||
          "A modern, supportable stack with clean integrations to the systems the client already relied on.",
      ),
      process: String(
        content.process ||
          sectionMap.process ||
          "Visible iterations, regular demos, and a shared backlog kept progress transparent.",
      ),
    };

    const ordered = cmsCases.length
      ? cmsCases
      : caseStudies.map((item, index) => ({
          id: index,
          slug: item.slug,
          title: item.name,
          excerpt: item.challenge,
          content_type: "case_study",
          status: "published",
          featured: false,
          content_json: { category: item.category },
        }));
    const currentIndex = Math.max(
      0,
      ordered.findIndex((item) => item.slug === params.slug),
    );
    const nextItem = ordered[(currentIndex + 1) % ordered.length];
    const nextFallback = caseStudies.find((item) => item.slug === nextItem?.slug);
    const next = {
      slug: nextItem?.slug || caseStudies[0].slug,
      name: nextItem?.title || nextFallback?.name || caseStudies[0].name,
      category: String(nextItem?.content_json?.category || nextFallback?.category || "Case Study"),
    };

    return { study, next };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.study.name || "Case Study"} | Logicsify Case Study` },
      { name: "description", content: loaderData?.study.challenge ?? "" },
      { property: "og:title", content: `${loaderData?.study.name || "Case Study"} | Case Study` },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/work/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/work/${params.slug}` }],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-40 text-center">
        <h1 className="fluid-h2">Case study not found</h1>
      </div>
    </SiteLayout>
  ),
});

function CasePage() {
  const { study, next } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero
        eyebrow={`${study.category} · ${study.client}`}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Work", to: "/work" },
          { label: study.name },
        ]}
        title={<>{study.name}</>}
        intro={study.challenge}
        primaryCta={{ label: "Start a Project", to: "/contact" }}
      />

      <section className="py-20">
        <div className="container-page grid lg:grid-cols-3 gap-10 border-b border-black/10 pb-16">
          <Meta label="Client" value={study.client} />
          <Meta label="Services" value={study.services.join(", ")} />
          <Meta label="Category" value={study.category} />
        </div>

        <div className="container-page py-16 grid lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <p className="eyebrow mb-4">In this case study</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              {[
                "Challenge",
                "Objectives",
                "Strategy",
                "User Experience",
                "Technology",
                "Process",
                "Outcome",
              ].map((section) => (
                <li key={section}>· {section}</li>
              ))}
            </ul>
          </aside>
          <article className="lg:col-span-8 space-y-14 prose-lg">
            <Block title="Challenge" body={study.challenge} />
            <Block title="Objectives" body={study.objectives} />
            <Block title="Strategy" body={study.strategy} />
            <Block title="User experience" body={study.experience} />
            <Block title="Technology & integrations" body={study.technology} />
            <Block title="Process" body={study.process} />
            <Block title="Outcome" body={study.outcome} />

            <div className="grid sm:grid-cols-2 gap-4 not-prose">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="aspect-[4/3] rounded-2xl bg-ink text-white p-4 relative overflow-hidden"
                >
                  <div className="absolute inset-0 grid-noise opacity-60" />
                  <div className="relative flex gap-1.5 mb-3">
                    <div className="h-2 w-2 rounded-full bg-white/30" />
                    <div className="h-2 w-2 rounded-full bg-white/30" />
                    <div className="h-2 w-2 rounded-full bg-white/30" />
                  </div>
                  <div className="relative space-y-2">
                    <div className="h-2 rounded bg-gradient-brand w-1/3" />
                    <div className="h-2 rounded bg-white/10 w-2/3" />
                    <div className="grid grid-cols-3 gap-1.5 mt-3">
                      {[...Array(9)].map((_, cell) => (
                        <div
                          key={cell}
                          className={`h-8 rounded ${(cell + index) % 4 === 0 ? "bg-gradient-brand opacity-70" : "bg-white/10"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose">
              <p className="eyebrow mb-4">Related services</p>
              <div className="flex flex-wrap gap-2">
                {study.services.map((service) => (
                  <span
                    key={service}
                    className="px-4 py-2 rounded-full bg-lavender text-ink text-sm font-medium"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container-page">
          <p className="eyebrow mb-4">Next case study</p>
          <Link
            to="/work/$slug"
            params={{ slug: next.slug }}
            className="group flex items-center justify-between gap-6 rounded-3xl bg-ink text-white p-8 md:p-12 hover:scale-[1.005] transition"
          >
            <div>
              <p className="text-white/60 text-sm">{next.category}</p>
              <h3 className="text-3xl md:text-4xl font-semibold mt-2">{next.name}</h3>
            </div>
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition" />
          </Link>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <p className="text-lg font-semibold text-ink">{value || "—"}</p>
    </div>
  );
}
function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="fluid-h3 mb-4">{title}</h2>
      <p className="text-lg text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
