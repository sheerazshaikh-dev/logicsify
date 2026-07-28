import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Scale } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { comparisons } from "@/lib/expansion-data";
import { getCmsContentList } from "@/lib/logicsify-api";

export const Route = createFileRoute("/comparisons/")({
  loader: async () => ({ cms: await getCmsContentList("comparison") }),
  component: ComparisonsPage,
  head: () => ({
    meta: [
      { title: "Technology Comparisons & Decision Guides | Logicsify" },
      { name: "description", content: "Balanced comparisons for CMS platforms, custom software, CRM systems, voice AI workflows, and development engagement decisions." },
      { property: "og:title", content: "Technology Comparisons & Decision Guides | Logicsify" },
      { property: "og:description", content: "Practical decision frameworks for choosing platforms, software approaches, and delivery models." },
      { property: "og:url", content: "https://logicsify.com/comparisons" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/comparisons" }],
  }),
});

function ComparisonsPage(){
  const {cms}=Route.useLoaderData();
  const items=comparisons.map((item)=>{const override=cms.find((entry)=>entry.slug===item.slug);return {...item,title:override?.title||item.title,summary:override?.excerpt||item.summary}});
  return <SiteLayout>
    <PageHero eyebrow="Comparisons" breadcrumbs={[{label:"Home",to:"/"},{label:"Comparisons"}]} title={<>Choose tools and delivery models with the <span className="text-gradient">tradeoffs visible.</span></>} intro="These guides do not force the same answer for every business. Each option can be correct under different constraints." primaryCta={{label:"Get a Free Technical Roadmap",to:"/technical-roadmap"}} />
    <section className="py-20 md:py-28"><div className="container-page grid gap-5 md:grid-cols-2">{items.map((item)=><Link key={item.slug} to="/comparisons/$slug" params={{slug:item.slug}} className="group rounded-3xl border border-black/10 bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg"><Scale className="h-7 w-7 text-brand-red"/><h2 className="mt-5 text-2xl font-semibold">{item.title}</h2><p className="mt-4 text-ink-soft">{item.summary}</p><span className="mt-6 inline-flex items-center gap-2 font-semibold">Open comparison <ArrowRight className="h-4 w-4"/></span></Link>)}</div></section>
    <TechnicalRoadmapCTA source="comparisons" />
  </SiteLayout>
}
