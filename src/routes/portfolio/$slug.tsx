import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { getCmsContentItem, getCmsContentList } from "@/lib/logicsify-api";

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => {
    const [item, all] = await Promise.all([
      getCmsContentItem("portfolio", params.slug),
      getCmsContentList("portfolio"),
    ]);
    if (!item) throw notFound();
    return { item, related: all.filter((candidate) => candidate.slug !== item.slug).slice(0, 3) };
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
  const { item, related } = Route.useLoaderData();
  const content = item.content_json || {};
  const list = (key: string) => Array.isArray(content[key]) ? (content[key] as unknown[]).map(String).filter(Boolean) : [];
  const gallery = list("gallery");
  const highlights = list("highlights");
  const services = list("services");
  const technologies = list("technology_stack");
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
            {gallery.length ? <div className="mt-12"><p className="eyebrow">Gallery</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{gallery.map((image) => <img key={image} src={image} alt={`${item.title} project view`} className="w-full rounded-2xl border border-black/10 object-cover" loading="lazy" />)}</div></div> : null}
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
            {services.length ? <div className="rounded-2xl border border-black/10 bg-white p-6"><p className="eyebrow">Services</p><div className="mt-4 flex flex-wrap gap-2">{services.map((service) => <span key={service} className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold">{service.replace(/-/g, " ")}</span>)}</div></div> : null}
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
