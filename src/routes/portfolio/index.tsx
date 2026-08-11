import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { getCmsContentList, type CmsContentItem } from "@/lib/logicsify-api";

export const Route = createFileRoute("/portfolio/")({
  loader: async () => ({ items: await getCmsContentList("portfolio") }),
  head: () => ({
    meta: [
      { title: "Portfolio | Logicsify" },
      { name: "description", content: "Explore selected Logicsify portfolio projects across AI automation, CRM, websites, portals, CMS platforms, cybersecurity, and connected digital systems." },
      { property: "og:title", content: "Logicsify Portfolio" },
      { property: "og:description", content: "A visual portfolio of selected Logicsify project work, managed independently from Case Studies." },
      { property: "og:url", content: "https://logicsify.com/portfolio" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/portfolio" }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { items } = Route.useLoaderData();
  const featured = items.filter((item) => Boolean(item.featured));
  const rest = items.filter((item) => !item.featured);
  const ordered = [...featured, ...rest];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Portfolio"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Portfolio" }]}
        title={<>Selected work built around <span className="text-gradient">real business systems.</span></>}
        intro="A visual portfolio of Logicsify projects. Portfolio is managed independently from Case Studies so concise project showcases and long-form client stories remain separate content types."
        primaryCta={{ label: "Discuss Your Project", to: "/contact" }}
        secondaryCta={{ label: "Read Case Studies", to: "/work" }}
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          {ordered.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {ordered.map((item) => <PortfolioCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-black/10 bg-cream p-12 text-center">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-ink-soft" />
              <h2 className="mt-5 fluid-h3">No published portfolio projects yet.</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-soft">Add projects from Content Studio → Portfolio. Case Studies will no longer populate this page.</p>
            </div>
          )}
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}

function PortfolioCard({ item }: { item: CmsContentItem }) {
  const content = item.content_json || {};
  const category = String(content.category || content.project_type || "Project");
  const client = String(content.client_name || content.company || "");
  const services = Array.isArray(content.services) ? content.services.map(String) : [];
  return (
    <Link to="/portfolio/$slug" params={{ slug: item.slug }} className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl">
      {item.featured_image ? (
        <img src={item.featured_image} alt={item.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
      ) : (
        <div className="brand-radial-glow grid aspect-[16/10] place-items-center bg-ink"><BriefcaseBusiness className="h-12 w-12 text-white/25" /></div>
      )}
      <div className="p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">{category}</p>
          {item.featured ? <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em]">Featured</span> : null}
        </div>
        <h2 className="mt-3 text-2xl font-semibold">{item.title}</h2>
        {client ? <p className="mt-2 text-sm font-semibold text-ink-soft">{client}</p> : null}
        <p className="mt-3 leading-7 text-ink-soft">{item.excerpt}</p>
        {services.length ? <div className="mt-5 flex flex-wrap gap-2">{services.slice(0, 4).map((service) => <span key={service} className="rounded-full bg-cream px-3 py-1 text-xs font-semibold">{service.replace(/-/g, " ")}</span>)}</div> : null}
        <span className="mt-7 inline-flex items-center gap-2 font-semibold">View project <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
      </div>
    </Link>
  );
}
