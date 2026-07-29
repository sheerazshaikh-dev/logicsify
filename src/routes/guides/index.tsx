import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, FileText, Search } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { getCmsContentList } from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/guides/")({
  pendingComponent: PublicRouteLoading,
  loader: async () => ({ guides: await getCmsContentList("resource") }),
  component: GuidesPage,
  head: () => ({
    meta: [
      { title: "Business Technology Guides & Downloads | Logicsify" },
      { name: "description", content: "Download practical checklists, audits, and planning templates for websites, SaaS products, CRM migrations, and AI automation." },
      { property: "og:title", content: "Business Technology Guides & Downloads | Logicsify" },
      { property: "og:description", content: "Practical guides for websites, software, CRM migrations, and automation planning." },
      { property: "og:url", content: "https://logicsify.com/guides" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/guides" }],
  }),
});

function GuidesPage() {
  const { guides } = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...Array.from(new Set(guides.map((item) => String(item.content_json?.category || "General"))))], [guides]);
  const filtered = guides.filter((item) => {
    const matchesCategory = category === "All" || String(item.content_json?.category || "General") === category;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || `${item.title} ${item.excerpt || ""}`.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
  const featured = guides.find((item) => Boolean(item.featured));
  return <SiteLayout>
    <PageHero eyebrow="Guides & downloads" breadcrumbs={[{label:"Home",to:"/"},{label:"Guides"}]} title={<>Planning tools for better <span className="text-gradient">technical decisions.</span></>} intro="Published guides appear here after a file, useful description, and download flow are configured in the existing admin panel." primaryCta={{label:"Get a Free Technical Roadmap",to:"/technical-roadmap"}} />
    <section className="py-20 md:py-28"><div className="container-page">
      {featured ? <Link to="/guides/$slug" params={{slug:featured.slug}} className="mb-12 grid gap-8 rounded-3xl bg-ink p-8 text-white md:grid-cols-12 md:p-12" onClick={()=>trackEvent("resource_opened",{slug:featured.slug,placement:"featured"})}><div className="md:col-span-8"><p className="eyebrow text-white/60">Featured guide</p><h2 className="mt-4 fluid-h3">{featured.title}</h2><p className="mt-4 max-w-2xl text-white/65">{featured.excerpt}</p><span className="mt-6 inline-flex items-center gap-2 font-semibold">Open guide <ArrowRight className="h-4 w-4"/></span></div>{featured.featured_image?<img src={featured.featured_image} alt="" className="h-60 w-full rounded-2xl object-cover md:col-span-4" loading="lazy"/>:<div className="grid h-60 place-items-center rounded-2xl bg-white/5 md:col-span-4"><FileText className="h-14 w-14 text-white/30"/></div>}</Link> : null}
      <div className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between"><div className="relative max-w-md flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"/><input value={search} onChange={(e)=>setSearch(e.target.value)} className="form-input pl-11" placeholder="Search guides" aria-label="Search guides"/></div><div className="flex flex-wrap gap-2" role="group" aria-label="Guide categories">{categories.map((item)=><button key={item} aria-pressed={category===item} onClick={()=>setCategory(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${category===item?"border-ink bg-ink text-white":"border-black/10"}`}>{item}</button>)}</div></div>
      {!filtered.length ? <div className="py-20 text-center"><FileText className="mx-auto h-10 w-10 text-ink-soft"/><h2 className="mt-5 fluid-h3">No published guides yet.</h2><p className="mx-auto mt-3 max-w-xl text-ink-soft">Draft guides remain private until a real file and complete content are published through Admin → Guides.</p></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((item)=><Link key={item.id} to="/guides/$slug" params={{slug:item.slug}} onClick={()=>trackEvent("resource_opened",{slug:item.slug,placement:"grid"})} className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">{item.featured_image?<img src={item.featured_image} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy"/>:<div className="grid aspect-[16/9] place-items-center bg-cream"><FileText className="h-10 w-10 text-ink-soft"/></div>}<div className="p-6"><p className="eyebrow">{String(item.content_json?.category||"Guide")}</p><h3 className="mt-3 text-xl font-semibold text-ink">{item.title}</h3><p className="mt-3 text-sm text-ink-soft">{item.excerpt}</p><div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">View guide <ArrowRight className="h-4 w-4"/></div></div></Link>)}</div>}
    </div></section>
    <TechnicalRoadmapCTA source="guides" />
  </SiteLayout>
}
