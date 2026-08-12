import { createFileRoute, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { getCmsContentItem, getRelatedContent } from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { NavigableLightbox } from "@/components/navigable-lightbox";
import { RelatedContentSections } from "@/components/related-content-sections";

export const Route = createFileRoute("/work/$slug")({
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    const [study, relatedContent] = await Promise.all([
      getCmsContentItem("case_study", params.slug),
      getRelatedContent("case_study", params.slug),
    ]);
    if (!study) throw notFound();
    return { study, relatedContent };
  },
  component: CaseStudyPage,
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title:
          loaderData?.study.seo_json?.title ||
          `${loaderData?.study.title || "Case Study"} | Logicsify`,
      },
      {
        name: "description",
        content: loaderData?.study.seo_json?.description || loaderData?.study.excerpt || "",
      },
      {
        property: "og:title",
        content: loaderData?.study.seo_json?.title || loaderData?.study.title || "",
      },
      {
        property: "og:description",
        content: loaderData?.study.seo_json?.description || loaderData?.study.excerpt || "",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `https://logicsify.com/work/${params.slug}` },
      ...(loaderData?.study.seo_json?.og_image || loaderData?.study.featured_image
        ? [
            {
              property: "og:image",
              content: loaderData?.study.seo_json?.og_image || loaderData?.study.featured_image,
            },
            {
              name: "twitter:image",
              content: loaderData?.study.seo_json?.og_image || loaderData?.study.featured_image,
            },
          ]
        : []),
    ],
    links: [
      {
        rel: "canonical",
        href: loaderData?.study.seo_json?.canonical || `https://logicsify.com/work/${params.slug}`,
      },
    ],
  }),
});

function CaseStudyPage() {
  const { study, relatedContent } = Route.useLoaderData();
  const c = study.content_json || {};
  useEffect(() => trackEvent("case_study_opened", { slug: study.slug }), [study.slug]);
  const services = arr(c.services);
  const stack = arr(c.technology_stack || c.technologies);
  const integrations = arr(c.integrations);
  const desktop = arr(c.desktop_screenshots);
  const mobile = arr(c.mobile_screenshots);
  const gallery = arr(c.gallery);
  const galleryGroups = [
    { title: "Desktop screenshots", items: desktop, mobile: false },
    { title: "Mobile screenshots", items: mobile, mobile: true },
    { title: "Additional images", items: gallery, mobile: false },
  ].filter((group) => group.items.length);
  const results = arr(c.measurable_results || c.results);
  const toc = [
    ["problem", "Problem", Boolean(c.challenge)],
    ["objectives", "Objectives", Boolean(arr(c.objectives).length || c.objectives)],
    ["work-completed", "Work completed", Boolean(arr(c.work_completed).length)],
    ["solution", "Solution", Boolean(c.solution || c.body)],
    ["technology-stack", "Technology stack", Boolean(stack.length)],
    ["systems-integrated", "Systems integrated", Boolean(integrations.length)],
    ["screenshots", "Project gallery", Boolean(galleryGroups.length)],
    ["process", "Process", Boolean(arr(c.process).length || c.process)],
    ["results", "Results", Boolean(results.length)],
  ] as const;
  return (
    <SiteLayout>
      <PageHero
        eyebrow={`${String(c.industry || c.category || "Case Study")}${c.client_name ? ` · ${String(c.client_name)}` : ""}`}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Work", to: "/work" },
          { label: study.title },
        ]}
        title={study.title}
        intro={study.excerpt}
        primaryCta={{ label: "Get a Free Technical Roadmap", to: "/technical-roadmap" }}
      />
      <section className="py-16">
        <div className="container-page grid gap-4 border-b border-black/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Client" value={String(c.client_name || "Not publicly disclosed")} />
          <Meta label="Industry" value={String(c.industry || c.category || "—")} />
          <Meta label="Timeline" value={String(c.timeline || "Not publicly disclosed")} />
          <Meta label="Services" value={services.join(", ") || "—"} />
        </div>
      </section>
      <section className="pb-20">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <nav className="lg:sticky lg:top-28">
              <p className="eyebrow mb-4">Case study</p>
              <ul className="space-y-2 text-sm text-ink-soft">
                {toc
                  .filter((item) => item[2])
                  .map(([id, label]) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-cream hover:text-ink"
                      >
                        <span className="text-brand-red transition group-hover:translate-x-0.5">
                          →
                        </span>
                        {label}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>
          </aside>
          <article className="space-y-14 lg:col-span-9">
            <Block id="problem" title="Problem" body={String(c.challenge || "")} />
            {arr(c.objectives).length ? (
              <ListBlock id="objectives" title="Objectives" items={arr(c.objectives)} />
            ) : (
              <Block id="objectives" title="Objectives" body={String(c.objectives || "")} />
            )}
            <ListBlock id="work-completed" title="Work completed" items={arr(c.work_completed)} />
            <Block id="solution" title="Solution" body={String(c.solution || c.body || "")} />
            {stack.length ? (
              <TagBlock id="technology-stack" title="Technology stack" items={stack} />
            ) : null}
            {integrations.length ? (
              <TagBlock id="systems-integrated" title="Systems integrated" items={integrations} />
            ) : null}
            <CaseStudyGallery id="screenshots" groups={galleryGroups} />
            {arr(c.process).length ? (
              <ListBlock id="process" title="Process" items={arr(c.process)} />
            ) : (
              <Block id="process" title="Process" body={String(c.process || "")} />
            )}
            {results.length ? (
              <ListBlock id="results" title="Measurable or qualitative results" items={results} />
            ) : (
              <div id="results" className="scroll-mt-28 rounded-2xl bg-cream p-6">
                <p className="text-sm text-ink-soft">
                  No outcome claims are published until the client supplies verified measurable or
                  qualitative results.
                </p>
              </div>
            )}
            {c.testimonial ? (
              <blockquote className="rounded-3xl bg-ink p-8 text-white">
                <p className="text-xl leading-relaxed">“{String(c.testimonial)}”</p>
                {c.testimonial_name ? (
                  <footer className="mt-5 text-sm text-white/60">
                    {String(c.testimonial_name)}
                    {c.testimonial_role ? `, ${String(c.testimonial_role)}` : ""}
                  </footer>
                ) : null}
              </blockquote>
            ) : null}
            {c.live_url ? (
              <a
                href={String(c.live_url)}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost-light"
              >
                View live project <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </article>
        </div>
      </section>
      {integrations.length ? <SystemsWeIntegrate compact /> : null}
      <RelatedContentSections data={relatedContent} title="Related services, proof, insights and resources" />
      <TechnicalRoadmapCTA source={`case_study:${study.slug}`} />
    </SiteLayout>
  );
}
function arr(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
function Block({ id, title, body }: { id?: string; title: string; body: string }) {
  if (!body) return null;
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="fluid-h3">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft whitespace-pre-line">{body}</p>
    </section>
  );
}
function ListBlock({ id, title, items }: { id?: string; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="fluid-h3">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-ink-soft">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
function TagBlock({ id, title, items }: { id?: string; title: string; items: string[] }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="fluid-h3">{title}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-lavender px-4 py-2 text-sm font-semibold">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
function CaseStudyGallery({
  id,
  groups,
}: {
  id: string;
  groups: Array<{ title: string; items: string[]; mobile: boolean }>;
}) {
  const [active, setActive] = useState<number | null>(null);
  const change = useCallback((next: number) => setActive(next), []);
  if (!groups.length) return null;
  const images = groups.flatMap((group) => group.items);
  let imageOffset = 0;
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="fluid-h3">Project gallery</h2>
      <div className="mt-6 space-y-10">
        {groups.map((group) => {
          const offset = imageOffset;
          imageOffset += group.items.length;
          return (
            <div key={group.title}>
              {groups.length > 1 ? (
                <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
              ) : null}
              <div
                className={`grid gap-4 ${groups.length > 1 ? "mt-4" : ""} ${group.mobile ? "grid-cols-2 md:grid-cols-4" : "md:grid-cols-2"}`}
              >
                {group.items.map((src, index) => (
                  <button
                    type="button"
                    onClick={() => setActive(offset + index)}
                    key={`${group.title}-${src}-${index}`}
                    className="group overflow-hidden rounded-2xl border border-black/10 bg-cream text-left focus:outline-none focus:ring-4 focus:ring-brand-red/20"
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={`${group.title} ${index + 1}`}
                        loading="lazy"
                        className={`w-full object-cover transition duration-300 group-hover:scale-[1.02] ${group.mobile ? "aspect-[9/16]" : "aspect-[16/10]"}`}
                      />
                    ) : (
                      <div className="grid aspect-video place-items-center">
                        <ImageIcon className="h-8 w-8 text-ink-soft" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {active !== null ? (
        <NavigableLightbox
          images={images}
          index={active}
          title="Project gallery"
          onIndexChange={change}
          onClose={() => setActive(null)}
        />
      ) : null}
    </section>
  );
}
