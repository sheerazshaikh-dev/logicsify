import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Download, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { getCmsContentItem, getCmsContentList, requestResourceDownload } from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/guides/$slug")({
  pendingComponent: PublicRouteLoading,
  loader: async ({params}) => {
    const [resource, all] = await Promise.all([getCmsContentItem("resource",params.slug),getCmsContentList("resource")]);
    if (!resource) throw notFound();
    return { resource, related: all.filter((item)=>item.slug!==params.slug).slice(0,3) };
  },
  component: GuidePage,
  head: ({loaderData,params}) => ({
    meta: [
      { title: loaderData?.resource.seo_json?.title || `${loaderData?.resource.title || "Guide"} | Logicsify` },
      { name: "description", content: loaderData?.resource.seo_json?.description || loaderData?.resource.excerpt || "" },
      { property: "og:title", content: loaderData?.resource.seo_json?.title || loaderData?.resource.title || "" },
      { property: "og:description", content: loaderData?.resource.seo_json?.description || loaderData?.resource.excerpt || "" },
      { property: "og:url", content: `https://logicsify.com/guides/${params.slug}` },
      ...((loaderData?.resource.seo_json?.og_image || loaderData?.resource.featured_image) ? [
        { property: "og:image", content: loaderData?.resource.seo_json?.og_image || loaderData?.resource.featured_image },
        { name: "twitter:image", content: loaderData?.resource.seo_json?.og_image || loaderData?.resource.featured_image },
      ] : []),
    ],
    links: [{ rel: "canonical", href: loaderData?.resource.seo_json?.canonical || `https://logicsify.com/guides/${params.slug}` }],
  }),
});

function GuidePage(){
  const {resource,related}=Route.useLoaderData(); const content=resource.content_json||{};
  const [form,setForm]=useState({name:"",email:"",company:"",phone:"",consent:false,honey:""});const [loading,setLoading]=useState(false);const [error,setError]=useState("");const [download,setDownload]=useState("");
  useEffect(()=>trackEvent("resource_opened",{slug:resource.slug}),[resource.slug]);
  async function submit(e:React.FormEvent){e.preventDefault();setError("");setLoading(true);try{const result=await requestResourceDownload({resource_slug:resource.slug,...form});setDownload(result.download_url);trackEvent("resource_form_submitted",{slug:resource.slug})}catch(err){setError(err instanceof Error?err.message:"Could not prepare the guide.")}finally{setLoading(false)}}
  function beginDownload(){trackEvent("resource_downloaded",{slug:resource.slug});window.open(download,"_blank","noopener,noreferrer")}
  return <SiteLayout>
    <PageHero eyebrow={String(content.category||"Guide")} breadcrumbs={[{label:"Home",to:"/"},{label:"Guides",to:"/guides"},{label:resource.title}]} title={resource.title} intro={resource.excerpt} primaryCta={{label:"Get a Free Technical Roadmap",to:"/technical-roadmap"}} />
    <section className="py-20 md:py-28"><div className="container-page grid gap-12 lg:grid-cols-12"><article className="lg:col-span-7"><div className="public-prose" dangerouslySetInnerHTML={{__html:String(content.body||"")}}/>{Array.isArray(content.includes)?<section className="mt-10"><h2 className="fluid-h3">What is included</h2><ul className="mt-5 space-y-3">{content.includes.map((item)=><li key={String(item)} className="flex gap-3 text-ink-soft"><CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-red"/>{String(item)}</li>)}</ul></section>:null}{content.audience?<section className="mt-10 rounded-2xl bg-cream p-6"><p className="eyebrow">Who it is for</p><p className="mt-3 text-ink-soft">{String(content.audience)}</p></section>:null}</article><aside className="lg:col-span-5"><div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-28"><h2 className="text-xl font-semibold">Request this guide</h2><p className="mt-2 text-sm text-ink-soft">The file link is returned only after a valid lead submission.</p>{download?<div className="mt-6 rounded-2xl bg-green-50 p-5"><CheckCircle2 className="h-6 w-6 text-green-700"/><p className="mt-3 text-sm text-green-800">Your guide is ready.</p><button onClick={beginDownload} className="btn-primary mt-4"><Download className="h-4 w-4"/>Download guide</button></div>:<form onSubmit={submit} className="mt-6 space-y-4"><input required className="form-input" placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/><input required type="email" className="form-input" placeholder="Work email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/><input required className="form-input" placeholder="Company" value={form.company} onChange={(e)=>setForm({...form,company:e.target.value})}/><input className="form-input" placeholder="Phone (optional)" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/><input className="hidden" tabIndex={-1} value={form.honey} onChange={(e)=>setForm({...form,honey:e.target.value})}/><label className="flex items-start gap-3 text-xs text-ink-soft"><input type="checkbox" checked={form.consent} onChange={(e)=>setForm({...form,consent:e.target.checked})} className="mt-1 accent-[#FE3434]"/><span>I agree that Logicsify may contact me about this guide and related services.</span></label>{error?<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}<button disabled={loading} className="btn-primary w-full justify-center">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Download className="h-4 w-4"/>}Get the guide</button></form>}</div></aside></div></section>
    {related.length?<section className="bg-cream py-20"><div className="container-page"><h2 className="fluid-h3">Related guides</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{related.map((item)=><Link key={item.id} to="/guides/$slug" params={{slug:item.slug}} className="rounded-2xl bg-white p-6"><p className="font-semibold">{item.title}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Open <ArrowRight className="h-4 w-4"/></span></Link>)}</div></div></section>:null}
    <TechnicalRoadmapCTA source={`resource:${resource.slug}`} />
  </SiteLayout>
}
