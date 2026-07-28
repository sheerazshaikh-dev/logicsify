import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { comparisons } from "@/lib/expansion-data";
import { getCmsContentItem } from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/comparisons/$slug")({
  loader: async ({params}) => {
    const fallback=comparisons.find((item)=>item.slug===params.slug); if(!fallback) throw notFound();
    const cms=await getCmsContentItem("comparison",params.slug); return {comparison:fallback,cms};
  },
  component: ComparisonPage,
  head: ({loaderData,params}) => ({
    meta: [
      { title: loaderData?.cms?.seo_json?.title || `${loaderData?.comparison.title || "Comparison"} | Logicsify` },
      { name: "description", content: loaderData?.cms?.seo_json?.description || loaderData?.cms?.excerpt || loaderData?.comparison.summary || "" },
      { property: "og:title", content: loaderData?.cms?.seo_json?.title || loaderData?.comparison.title || "" },
      { property: "og:description", content: loaderData?.cms?.seo_json?.description || loaderData?.cms?.excerpt || loaderData?.comparison.summary || "" },
      { property: "og:url", content: `https://logicsify.com/comparisons/${params.slug}` },
      ...(loaderData?.cms?.seo_json?.og_image ? [
        { property: "og:image", content: loaderData.cms.seo_json.og_image },
        { name: "twitter:image", content: loaderData.cms.seo_json.og_image },
      ] : []),
    ],
    links: [{ rel: "canonical", href: loaderData?.cms?.seo_json?.canonical || `https://logicsify.com/comparisons/${params.slug}` }],
  }),
});

type Row={label:string;a:string;b:string};
function stringList(value: unknown): string[] { return Array.isArray(value) ? value.map(String).filter(Boolean) : []; }
function rows(value: unknown, fallback: Row[]): Row[] {
  const items=stringList(value).map((line)=>line.split("|").map((part)=>part.trim())).filter((parts)=>parts.length>=3).map(([label,a,b])=>({label,a,b}));
  return items.length?items:fallback;
}
function faqs(value: unknown){return stringList(value).map((line)=>{const [question,...rest]=line.split("|");return{question:question?.trim()||"",answer:rest.join("|").trim()}}).filter((item)=>item.question&&item.answer)}

function ComparisonPage(){const {comparison,cms}=Route.useLoaderData();const c=cms?.content_json||{};const optionA=String(c.option_a||comparison.optionA);const optionB=String(c.option_b||comparison.optionB);const tableRows=rows(c.comparison_rows,comparison.rows);const risks=stringList(c.risks).length?stringList(c.risks):comparison.risks;const questions=faqs(c.faqs);const related=stringList(c.related_services);useEffect(()=>trackEvent("comparison_opened",{slug:comparison.slug}),[comparison.slug]);return <SiteLayout>
  <PageHero eyebrow="Decision framework" breadcrumbs={[{label:"Home",to:"/"},{label:"Comparisons",to:"/comparisons"},{label:comparison.title}]} title={cms?.title||comparison.title} intro={cms?.excerpt||comparison.summary} primaryCta={{label:"Get a Free Technical Roadmap",to:"/technical-roadmap"}} />
  <section className="py-20 md:py-28"><div className="container-page">
    <div className="grid gap-5 md:grid-cols-2"><div className="rounded-3xl bg-cream p-8"><p className="eyebrow">Best use case</p><h2 className="mt-3 text-2xl font-semibold">{optionA}</h2><p className="mt-4 text-ink-soft">{String(c.best_a||comparison.bestA)}</p></div><div className="rounded-3xl bg-cream p-8"><p className="eyebrow">Best use case</p><h2 className="mt-3 text-2xl font-semibold">{optionB}</h2><p className="mt-4 text-ink-soft">{String(c.best_b||comparison.bestB)}</p></div></div>
    <div className="mt-12 overflow-x-auto rounded-3xl border border-black/10"><table className="min-w-[760px] w-full border-collapse"><thead><tr className="bg-ink text-left text-white"><th className="p-5">Decision factor</th><th className="p-5">{optionA}</th><th className="p-5">{optionB}</th></tr></thead><tbody>{tableRows.map((row)=><tr key={row.label} className="border-t border-black/10 align-top"><th className="p-5 text-left font-semibold">{row.label}</th><td className="p-5 text-ink-soft">{row.a}</td><td className="p-5 text-ink-soft">{row.b}</td></tr>)}</tbody></table></div>
    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[["Cost considerations",c.cost_considerations],["Setup time",c.setup_time],["Flexibility",c.flexibility],["Maintenance",c.maintenance],["Integrations",c.integrations],["Ownership and scalability",[c.ownership,c.scalability].filter(Boolean).join(" ")]].filter(([,body])=>body).map(([title,body])=><div key={String(title)} className="rounded-2xl border border-black/10 p-5"><h3 className="font-semibold">{String(title)}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{String(body)}</p></div>)}</div>
    <div className="mt-12 grid gap-8 lg:grid-cols-12"><div className="lg:col-span-7"><h2 className="fluid-h3">Decision framework</h2>{c.decision_framework?<p className="mt-5 text-lg leading-relaxed text-ink-soft whitespace-pre-line">{String(c.decision_framework)}</p>:<ol className="mt-6 space-y-4">{["Define the workflow that must be supported before comparing tools.","Separate must-have constraints from preferences.","Confirm data export, API access, permissions, and ownership.","Model initial setup effort and ongoing operating cost.","Choose the option with the fewest unacceptable risks, not the longest feature list."].map((item,index)=><li key={item} className="flex gap-3 text-ink-soft"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white">{index+1}</span>{item}</li>)}</ol>}</div><aside className="rounded-3xl bg-amber-50 p-7 lg:col-span-5"><AlertTriangle className="h-6 w-6 text-amber-700"/><h2 className="mt-4 text-xl font-semibold">Risks to examine</h2><ul className="mt-4 space-y-3">{risks.map((risk)=><li key={risk} className="flex gap-3 text-sm text-amber-950/75"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>{risk}</li>)}</ul></aside></div>
    {c.body?<article className="public-prose mx-auto mt-14 max-w-4xl" dangerouslySetInnerHTML={{__html:String(c.body)}}/>:null}
    {questions.length?<section className="mt-16"><h2 className="fluid-h3">Frequently asked questions</h2><div className="mt-6 divide-y divide-black/10 rounded-3xl border border-black/10">{questions.map((item)=><details key={item.question} className="p-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.answer}</p></details>)}</div></section>:null}
    {related.length?<section className="mt-16"><h2 className="fluid-h3">Related services</h2><div className="mt-5 flex flex-wrap gap-3">{related.map((slug)=><Link key={slug} to="/services/$slug" params={{slug}} className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold hover:border-brand-red">{slug.replaceAll("-"," ")}</Link>)}</div></section>:null}
  </div></section>
  <TechnicalRoadmapCTA source={`comparison:${comparison.slug}`} />
</SiteLayout>}
