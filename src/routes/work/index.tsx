import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { getCmsContentList } from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/work/")({
  pendingComponent: PublicRouteLoading,
  loader: async () => ({ caseStudies: await getCmsContentList("case_study") }),
  component: WorkPage,
  head: () => ({
    meta: [
      { title: "Case Studies | Software, AI Automation & Digital Growth | Logicsify" },
      { name: "description", content: "See how Logicsify solves business problems through software development, AI automation, CRM systems, websites, and digital growth strategies." },
      { property: "og:title", content: "Case Studies | Software, AI Automation & Digital Growth | Logicsify" },
      { property: "og:description", content: "Published case studies with the problem, work completed, technology, process, and real outcomes supplied by the client." },
      { property: "og:url", content: "https://logicsify.com/work" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/work" }],
  }),
});

function WorkPage() {
  const { caseStudies } = Route.useLoaderData();
  const [visible, setVisible] = useState(6);
  const featured = caseStudies.find((item) => Boolean(item.featured));

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Real case studies"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Work" }]}
        title={<>Proof should show the work, not just <span className="text-gradient">claim expertise.</span></>}
        intro="Only published case studies with supplied client context appear here. Missing results stay qualitative rather than being invented."
        primaryCta={{ label: "Get a Free Technical Roadmap", to: "/technical-roadmap" }}
      />
      <section className="py-20 md:py-28">
        <div className="container-page">
          {featured ? (
            <Link
              to="/work/$slug"
              params={{ slug: featured.slug }}
              onClick={() => trackEvent("case_study_opened", { slug: featured.slug, placement: "featured" })}
              className="mb-12 grid overflow-hidden rounded-3xl bg-ink text-white lg:grid-cols-12"
            >
              <div className="p-8 md:p-12 lg:col-span-7">
                <p className="eyebrow text-white/60">Featured case study</p>
                <h2 className="mt-4 fluid-h3">{featured.title}</h2>
                <p className="mt-4 max-w-2xl text-white/65">{featured.excerpt}</p>
                <span className="mt-7 inline-flex items-center gap-2 font-semibold">
                  Read case study <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              {featured.featured_image ? (
                <img src={featured.featured_image} alt="" className="h-full min-h-72 w-full object-cover lg:col-span-5" />
              ) : (
                <div className="grid min-h-72 place-items-center bg-white/5 lg:col-span-5">
                  <BriefcaseBusiness className="h-14 w-14 text-white/20" />
                </div>
              )}
            </Link>
          ) : null}

          {!caseStudies.length ? (
            <div className="py-20 text-center">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-ink-soft" />
              <h2 className="mt-5 fluid-h3">No published case studies yet.</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-soft">
                Draft and incomplete work remains private. Publish real project data through Admin → Case Studies.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {caseStudies.slice(0, visible).map((study) => {
                const content = study.content_json || {};
                const servicesList = Array.isArray(content.services) ? content.services.map(String) : [];
                return (
                  <Link
                    key={study.id}
                    to="/work/$slug"
                    params={{ slug: study.slug }}
                    onClick={() => trackEvent("case_study_opened", { slug: study.slug, placement: "grid" })}
                    className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    {study.featured_image ? (
                      <img src={study.featured_image} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid aspect-[16/9] place-items-center bg-ink">
                        <BriefcaseBusiness className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                    <div className="p-7">
                      <p className="eyebrow">{String(content.category || "Case study")}</p>
                      <h2 className="mt-3 text-2xl font-semibold">{study.title}</h2>
                      <p className="mt-3 text-ink-soft">{study.excerpt}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {servicesList.slice(0, 3).map((item) => (
                          <span key={item} className="rounded-full bg-cream px-3 py-1 text-xs font-semibold">{item}</span>
                        ))}
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                        Read case study <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          {visible < caseStudies.length ? (
            <div className="mt-10 text-center">
              <button className="btn-ghost-light" onClick={() => setVisible((value) => value + 6)}>Load more</button>
            </div>
          ) : null}
        </div>
      </section>
      <TechnicalRoadmapCTA source="case_studies" />
    </SiteLayout>
  );
}
