import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, MinusCircle } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { engagementModels } from "@/lib/expansion-data";
import { getCmsContentList } from "@/lib/logicsify-api";

export const Route = createFileRoute("/engagement-models")({
  loader: async () => ({ cms: await getCmsContentList("engagement_model") }),
  component: EngagementModelsPage,
  head: () => ({
    meta: [
      { title: "Engagement Models | Logicsify" },
      { name: "description", content: "Compare fixed-scope projects, monthly development support, dedicated teams, and automation consulting with their advantages and tradeoffs." },
      { property: "og:title", content: "Engagement Models | Logicsify" },
      { property: "og:description", content: "Choose a delivery model based on scope clarity, capacity, ownership, and change frequency." },
      { property: "og:url", content: "https://logicsify.com/engagement-models" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/engagement-models" }],
  }),
});

function list(value: unknown, fallback: readonly string[]) {
  return Array.isArray(value) && value.length ? value.map(String).filter(Boolean) : [...fallback];
}

function EngagementModelsPage(){const {cms}=Route.useLoaderData();return <SiteLayout>
  <PageHero eyebrow="Engagement models" breadcrumbs={[{label:"Home",to:"/"},{label:"Engagement Models"}]} title={<>Choose a delivery model that matches the <span className="text-gradient">shape of the work.</span></>} intro="Scope clarity, change frequency, internal ownership, and required skill coverage determine the right model. No single model is best for every project." primaryCta={{label:"Get a Free Technical Roadmap",to:"/technical-roadmap"}} />
  <section className="py-20 md:py-28"><div className="container-page space-y-6">{engagementModels.map((model,index)=>{const override=cms.find((item)=>item.slug===model.slug);const c=override?.content_json||{};const communication=[String(c.communication_format||""),String(c.delivery_cadence||"")].filter(Boolean).join(" ")||model.cadence;return <article id={model.slug} key={model.slug} className="scroll-mt-28 rounded-3xl border border-black/10 bg-white p-7 md:p-10"><div className="grid gap-8 lg:grid-cols-12"><div className="lg:col-span-4"><p className="eyebrow">Model {String(index+1).padStart(2,"0")}</p><h2 className="mt-3 fluid-h3">{override?.title||model.title}</h2><p className="mt-4 text-ink-soft"><strong className="text-ink">Best for:</strong> {String(c.best_for||override?.excerpt||model.bestFor)}</p>{c.typical_project?<p className="mt-3 text-sm text-ink-soft"><strong className="text-ink">Typical project:</strong> {String(c.typical_project)}</p>:null}{c.starting_price?<p className="mt-3 text-sm text-ink-soft"><strong className="text-ink">Admin-approved starting point:</strong> {String(c.starting_price)}</p>:null}</div><div className="grid gap-5 md:grid-cols-2 lg:col-span-8"><Info title="How work is scoped" body={String(c.scope||model.scope)}/><Info title="Communication and delivery" body={communication}/><Info title="Client responsibilities" body={String(c.client_responsibilities||model.client)}/><Info title="Logicsify responsibilities" body={String(c.logicsify_responsibilities||model.logicsify)}/></div></div><div className="mt-8 grid gap-5 border-t border-black/10 pt-8 md:grid-cols-2"><div><h3 className="font-semibold">Advantages</h3><ul className="mt-3 space-y-2">{list(c.advantages,model.advantages).map((item)=><li key={item} className="flex gap-2 text-sm text-ink-soft"><CheckCircle2 className="mt-0.5 h-4 w-4 text-green-700"/>{item}</li>)}</ul></div><div><h3 className="font-semibold">Tradeoffs</h3><ul className="mt-3 space-y-2">{list(c.tradeoffs,model.tradeoffs).map((item)=><li key={item} className="flex gap-2 text-sm text-ink-soft"><MinusCircle className="mt-0.5 h-4 w-4 text-amber-700"/>{item}</li>)}</ul></div></div>{c.body?<div className="public-prose mt-8" dangerouslySetInnerHTML={{__html:String(c.body)}}/>:null}</article>})}</div></section>
  <TechnicalRoadmapCTA source="engagement_models" />
</SiteLayout>}
function Info({title,body}:{title:string;body:string}){return <div className="rounded-2xl bg-cream p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p></div>}
