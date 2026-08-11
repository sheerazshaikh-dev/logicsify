import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, ExternalLink } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { NavigableLightbox } from "@/components/navigable-lightbox";
import { getCmsContentItem, getCmsContentList } from "@/lib/logicsify-api";

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => {
    const [item, all, serviceItems] = await Promise.all([
      getCmsContentItem("portfolio", params.slug),
      getCmsContentList("portfolio"),
      getCmsContentList("service"),
    ]);
    if (!item) throw notFound();
    return {
      item,
      serviceItems,
      related: all.filter((candidate) => candidate.slug !== item.slug).slice(0, 3),
    };
  },
  head: ({ loaderData, params }) => {
    const item = loaderData?.item;
    return {
      meta: [
        { title: item?.seo_json?.title || `${item?.title || "Portfolio Project"} | Logicsify` },
        { name: "description", content: item?.seo_json?.description || item?.excerpt || "" },
        { property: "og:title", content: item?.seo_json?.title || item?.title || "" },
        { property: "og:description", content: item?.seo_json?.description || item?.excerpt || "" },
        { property: "og:url", content: `https://logicsify.com/portfolio/${params.slug}` },
        ...((item?.seo_json?.og_image || item?.featured_image) ? [{ property: "og:image", content: item?.seo_json?.og_image || item?.featured_image }] : []),
      ],
      links: [{ rel: "canonical", href: item?.seo_json?.canonical || `https://logicsify.com/portfolio/${params.slug}` }],
    };
  },
  component: PortfolioDetail,
});

function PortfolioDetail() {
  const { item, related, serviceItems } = Route.useLoaderData();
  const content = item.content_json || {};
  const list = (key: string) => normalizeList(content[key]);
  const gallery = list("gallery");
  const highlights = list("highlights");
  const services = list("services");
  const technologies = list("technology_stack");
  const [activeGalleryImage, setActiveGalleryImage] = useState<number | null>(null);
  const changeGalleryImage = useCallback((next: number) => setActiveGalleryImage(next), []);
  const resolvedServices = useMemo(
    () => services.map((service) => resolveService(service, serviceItems)),
    [services.join("|"), serviceItems],
  );
  const body = String(content.body || "");
  const liveUrl = String(content.live_url || "");
  const client = String(content.client_name || content.company || "");
  const category = String(content.category || content.project_type || "Portfolio project");

  return (
    <SiteLayout>
      <PageHero
        eyebrow={category}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Portfolio", to: "/portfolio" }, { label: item.title }]}
        title={item.title}
        intro={item.excerpt}
        primaryCta={liveUrl ? undefined : { label: "Discuss a Similar Project", to: "/contact" }}
      />

      <section className="pb-16">
        <div className="container-page">
          {item.featured_image ? <img src={item.featured_image} alt={item.title} className="w-full rounded-[2rem] border border-black/10 object-cover shadow-[var(--shadow-card)]" /> : <div className="brand-radial-glow grid aspect-[16/7] place-items-center rounded-[2rem] bg-ink"><BriefcaseBusiness className="h-16 w-16 text-white/25" /></div>}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            {body ? <div className="cms-rich-content" dangerouslySetInnerHTML={{ __html: body }} /> : null}
            {highlights.length ? <div className="mt-12"><p className="eyebrow">Project highlights</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{highlights.map((highlight) => <div key={highlight} className="rounded-2xl border border-black/10 bg-cream p-5 font-semibold">{highlight}</div>)}</div></div> : null}
            {gallery.length ? (
              <div className="mt-12">
                <p className="eyebrow">Gallery</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveGalleryImage(index)}
                      className="group overflow-hidden rounded-2xl border border-black/10 bg-cream text-left focus:outline-none focus:ring-4 focus:ring-brand-red/20"
                      aria-label={`Open ${item.title} gallery image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${item.title} project view ${index + 1}`}
                        className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
                {activeGalleryImage !== null ? (
                  <NavigableLightbox
                    images={gallery}
                    index={activeGalleryImage}
                    title={`${item.title} gallery`}
                    onIndexChange={changeGalleryImage}
                    onClose={() => setActiveGalleryImage(null)}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-black/10 bg-cream p-6">
              <p className="eyebrow">Project details</p>
              <dl className="mt-5 space-y-4 text-sm">
                {client ? <div><dt className="text-ink-soft">Client / brand</dt><dd className="mt-1 font-semibold">{client}</dd></div> : null}
                {String(content.project_type || "") ? <div><dt className="text-ink-soft">Project type</dt><dd className="mt-1 font-semibold">{String(content.project_type)}</dd></div> : null}
                {String(content.year || "") ? <div><dt className="text-ink-soft">Year</dt><dd className="mt-1 font-semibold">{String(content.year)}</dd></div> : null}
              </dl>
              {liveUrl ? <a href={liveUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6 w-full justify-center">Visit project <ExternalLink className="h-4 w-4" /></a> : null}
            </div>
            {resolvedServices.length ? (
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <p className="eyebrow">Services</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {resolvedServices.map((service) =>
                    service.slug ? (
                      <Link
                        key={`${service.slug}-${service.label}`}
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold transition hover:bg-gradient-brand hover:text-white"
                      >
                        {service.label}
                      </Link>
                    ) : (
                      <span key={service.label} className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold">
                        {service.label}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ) : null}
            {technologies.length ? <div className="rounded-2xl border border-black/10 bg-white p-6"><p className="eyebrow">Technology</p><div className="mt-4 flex flex-wrap gap-2">{technologies.map((technology) => <span key={technology} className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold">{technology}</span>)}</div></div> : null}
          </aside>
        </div>
      </section>

      {related.length ? <section className="bg-cream py-16"><div className="container-page"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">More portfolio</p><h2 className="mt-3 fluid-h3">Other selected projects</h2></div><Link to="/portfolio" className="btn-ghost-dark">View all <ArrowUpRight className="h-4 w-4" /></Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((project) => <Link key={project.id} to="/portfolio/$slug" params={{ slug: project.slug }} className="overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-1">{project.featured_image ? <img src={project.featured_image} alt={project.title} className="aspect-[16/10] w-full object-cover" loading="lazy" /> : null}<div className="p-5"><h3 className="font-semibold">{project.title}</h3><p className="mt-2 line-clamp-3 text-sm text-ink-soft">{project.excerpt}</p></div></Link>)}</div></div></section> : null}

      <div className="container-page py-8"><Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Back to portfolio</Link></div>
      <CTASection />
    </SiteLayout>
  );
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(/[\n,]+/))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function resolveService(
  value: string,
  serviceItems: Awaited<ReturnType<typeof getCmsContentList>>,
) {
  const key = normalizeKey(value);
  const match = serviceItems.find(
    (service) => normalizeKey(service.slug) === key || normalizeKey(service.title) === key,
  );
  if (match) return { label: match.title, slug: match.slug };
  return {
    label: value
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    slug: "",
  };
}

