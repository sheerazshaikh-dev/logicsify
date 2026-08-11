import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clipboard, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { submitContact } from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";

export const Route = createFileRoute("/project-estimator")({
  component: ProjectEstimatorPage,
  head: () => ({
    meta: [
      { title: "Project Estimator | Plan Your Website, App or Automation | Logicsify" },
      { name: "description", content: "Build a rough project scope for a website, web app, SaaS product, AI automation, CRM system, or digital platform." },
      { property: "og:title", content: "Project Estimator | Plan Your Website, App or Automation | Logicsify" },
      { property: "og:description", content: "Create an initial planning guide with phases, complexity, integrations, and assumptions." },
      { property: "og:url", content: "https://logicsify.com/project-estimator" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/project-estimator" }],
  }),
});

const services = ["Marketing website","E-commerce website","Custom web application","SaaS MVP","Mobile application","AI automation","Voice AI agent","CRM implementation","Custom CMS","SEO and marketing","Cybersecurity"];
const featureMap: Record<string,string[]> = {
  "Marketing website": ["Custom design","CMS","Blog","Forms","Booking","Payments","Multi-language","Membership","Analytics"],
  "E-commerce website": ["Custom design","Product catalog","Checkout","Payments","Inventory integration","CRM","Email flows","Analytics","Customer support"],
  "Custom web application": ["Authentication","User roles","Dashboard","File uploads","Reporting","Notifications","Admin panel","API integration","AI features"],
  "SaaS MVP": ["Authentication","User roles","Dashboard","Subscription billing","File uploads","Reporting","Notifications","Admin panel","API integration","AI features"],
  "Mobile application": ["Authentication","Push notifications","Offline use","Camera or location","Subscriptions","Admin panel","API integration","Analytics"],
  "AI automation": ["CRM workflow","Email automation","SMS automation","Voice AI","Document extraction","Lead scoring","Reporting","Calendar booking","Internal notifications"],
  "Voice AI agent": ["Inbound calls","Lead qualification","Appointment booking","Knowledge base","Human transfer","CRM logging","Call analytics"],
  "CRM implementation": ["Pipeline design","Contact migration","Lead routing","Email automation","SMS automation","Reporting","Calendar booking","Permissions"],
  "Custom CMS": ["Structured content","User roles","Media library","Visual editor","Revisions","SEO fields","Forms","API integration"],
  "Cybersecurity": ["Application security review","Authentication & access","Cloud exposure review","Dependency audit","API security","Secrets handling","Backup & recovery","Security remediation plan"],
  "SEO and marketing": ["Technical SEO","Content strategy","Paid advertising","Social media","Conversion tracking","Reporting","Landing pages"],
};
const integrations = ["GoHighLevel","HubSpot","Supabase","Shopify","WordPress","Stripe","Twilio","Retell AI","OpenAI","Google Ads","Meta","n8n","Make","Zapier"];

type State = { service:string; features:string[]; stage:string; integrations:string[]; timeline:string; budget:string; name:string; email:string; company:string; consent:boolean };
const initial: State = { service:"",features:[],stage:"",integrations:[],timeline:"",budget:"",name:"",email:"",company:"",consent:false };

function ProjectEstimatorPage(){
  const [step,setStep]=useState(0); const [state,setState]=useState(initial); const [submitting,setSubmitting]=useState(false); const [submitted,setSubmitted]=useState(false); const [error,setError]=useState("");
  const complexity=useMemo(()=>{const points=state.features.length+state.integrations.length+(state.stage==="Existing system requiring migration"?3:0);return points>=12?"High":points>=6?"Medium":"Focused"},[state]);
  const phases=useMemo(()=>["Discovery and technical plan",...(state.service.includes("website")||state.service==="Custom CMS"?["Information architecture and design"]:["Workflow and product design"]),"Core implementation",...(state.integrations.length?["Integration and data validation"]:[]),"Quality assurance and launch"],[state.service,state.integrations.length]);
  const summary=useMemo(()=>[
    `Recommended project type: ${state.service||"Not selected"}`,
    `Selected features: ${state.features.join(", ")||"None selected"}`,
    `Project stage: ${state.stage||"Not selected"}`,
    `Required integrations: ${state.integrations.join(", ")||"None selected"}`,
    `Desired timeline: ${state.timeline||"Not selected"}`,
    `Budget range: ${state.budget||"Not selected"}`,
    `Complexity level: ${complexity}`,
    `Suggested delivery phases: ${phases.join(" → ")}`,
    `Recommended engagement model: ${complexity==="High"?"Discovery followed by fixed-scope phases or dedicated support":"Fixed-scope project with discovery"}`,
    "Important assumptions: API access, stakeholder availability, data quality, content readiness, and third-party account permissions are not yet verified.",
    "This estimate is an initial planning guide. Final scope, timeline, and pricing require technical discovery.",
  ].join("\n\n"),[state,complexity,phases]);
  const steps=["Service","Features","Project stage","Integrations","Timeline","Budget","Review","Submit"];
  function next(){trackEvent(step===0?"estimator_started":"estimator_step_completed",{step:steps[step]});if(step===5)trackEvent("estimator_completed",{complexity});setStep((v)=>Math.min(7,v+1))}
  function back(){setStep((v)=>Math.max(0,v-1))}
  async function copy(){await navigator.clipboard.writeText(summary);trackEvent("estimator_completed",{complexity})}
  async function submit(){setError("");if(!state.name||!state.email||!state.consent){setError("Name, work email, and consent are required.");return}setSubmitting(true);try{await submitContact({name:state.name,email:state.email,company:state.company,service:state.service,budget:state.budget,timeline:state.timeline,description:summary,source:"project-estimator:/project-estimator"});setSubmitted(true);trackEvent("estimator_submitted",{service:state.service,complexity})}catch(err){setError(err instanceof Error?err.message:"Could not submit estimate.")}finally{setSubmitting(false)}}
  return <SiteLayout>
    <PageHero eyebrow="Project estimator" breadcrumbs={[{label:"Home",to:"/"},{label:"Project Estimator"}]} title={<>Build a rough scope before the <span className="text-gradient">discovery call.</span></>} intro="The estimator creates an initial planning guide. It is not a quote, fixed timeline, or technical commitment." primaryCta={{label:"Get a Free Technical Roadmap",to:"/technical-roadmap"}} />
    <section className="py-20 md:py-28"><div className="container-page"><div className="mb-8 grid grid-cols-4 gap-2 md:grid-cols-8">{steps.map((label,index)=><div key={label} className={`rounded-xl p-3 text-center text-[11px] font-semibold ${index===step?"bg-ink text-white":index<step?"bg-brand-red/10 text-brand-red":"bg-cream text-ink-soft"}`}>{index+1}<span className="hidden md:block mt-1">{label}</span></div>)}</div><div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[var(--shadow-card)] md:p-10">
      {step===0?<ChoiceGrid title="Select a service" items={services} selected={[state.service]} single onToggle={(item)=>setState({...state,service:item,features:[]})}/>:
       step===1?<ChoiceGrid title="Select the features that matter" items={featureMap[state.service]||[]} selected={state.features} onToggle={(item)=>setState({...state,features:toggle(state.features,item)})}/>:
       step===2?<ChoiceGrid title="What stage is the project in?" items={["Idea and discovery","Existing design or requirements","Existing system requiring migration","Live product needing improvement"]} selected={[state.stage]} single onToggle={(item)=>setState({...state,stage:item})}/>:
       step===3?<ChoiceGrid title="Select known integrations" items={integrations} selected={state.integrations} onToggle={(item)=>setState({...state,integrations:toggle(state.integrations,item)})}/>:
       step===4?<ChoiceGrid title="Select a desired timeline" items={["As soon as practical","1–2 months","3–6 months","6+ months","Exploring"]} selected={[state.timeline]} single onToggle={(item)=>setState({...state,timeline:item})}/>:
       step===5?<ChoiceGrid title="Select a planning budget" items={["Under $5,000","$5,000–$15,000","$15,000–$35,000","$35,000–$75,000","$75,000+","Not defined"]} selected={[state.budget]} single onToggle={(item)=>setState({...state,budget:item})}/>:
       step===6?<Review summary={summary} phases={phases} complexity={complexity} onCopy={copy}/>:
       submitted?<div role="status"><Check className="h-10 w-10 text-brand-red"/><h2 className="mt-5 fluid-h3">Estimate submitted with the lead.</h2><p className="mt-3 text-ink-soft">A team member can now review the assumptions before discovery.</p></div>:
       <div><h2 className="fluid-h3">Send the planning summary</h2><p className="mt-3 text-ink-soft">The summary will be stored with the existing lead record and included in the email notification.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><label><span className="mb-2 block text-sm font-semibold">Full name *</span><input className="form-input" value={state.name} onChange={(e)=>setState({...state,name:e.target.value})}/></label><label><span className="mb-2 block text-sm font-semibold">Work email *</span><input type="email" className="form-input" value={state.email} onChange={(e)=>setState({...state,email:e.target.value})}/></label><label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">Company</span><input className="form-input" value={state.company} onChange={(e)=>setState({...state,company:e.target.value})}/></label></div><label className="mt-5 flex items-start gap-3 text-sm text-ink-soft"><input type="checkbox" className="mt-1 accent-brand-red" checked={state.consent} onChange={(e)=>setState({...state,consent:e.target.checked})}/><span>I agree that Logicsify may contact me about this estimate.</span></label>{error?<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}<button onClick={submit} disabled={submitting} className="btn-primary mt-6">{submitting?<Loader2 className="h-4 w-4 animate-spin"/>:null}Submit estimate</button></div>}
      {!submitted?<div className="mt-10 flex justify-between border-t border-black/10 pt-6"><button onClick={back} disabled={step===0} className="btn-ghost-light disabled:opacity-30"><ChevronLeft className="h-4 w-4"/>Back</button>{step<7?<button onClick={next} disabled={!canContinue(step,state)} className="btn-primary disabled:opacity-40">Continue<ChevronRight className="h-4 w-4"/></button>:null}</div>:null}
    </div></div></section>
    <SystemsWeIntegrate />
  </SiteLayout>
}

function ChoiceGrid({title,items,selected,onToggle,single=false}:{title:string;items:string[];selected:string[];onToggle:(item:string)=>void;single?:boolean}){return <div><p className="eyebrow mb-4">Estimator step</p><h2 className="fluid-h3">{title}</h2><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item)=>{const active=selected.includes(item);return <button type="button" key={item} aria-pressed={active} onClick={()=>onToggle(item)} className={`rounded-2xl border p-5 text-left font-semibold transition ${active?"brand-selected":"border-black/10 bg-white hover:border-brand-red/35 hover:bg-lavender"}`}>{item}{single?null:<span className={`mt-1 block text-xs font-normal ${active?"text-white/75":"text-ink-soft"}`}>Select or remove</span>}</button>})}</div></div>}
function Review({summary,phases,complexity,onCopy}:{summary:string;phases:string[];complexity:string;onCopy:()=>void}){return <div><p className="eyebrow mb-4">Planning guide</p><h2 className="fluid-h3">Review the initial scope.</h2><div className="mt-6 grid gap-5 md:grid-cols-3"><div className="rounded-2xl bg-cream p-5"><p className="eyebrow">Complexity</p><p className="mt-2 text-xl font-semibold">{complexity}</p></div><div className="rounded-2xl bg-cream p-5 md:col-span-2"><p className="eyebrow">Suggested phases</p><ol className="mt-3 space-y-2 text-sm text-ink-soft">{phases.map((phase,index)=><li key={phase}>{index+1}. {phase}</li>)}</ol></div></div><pre className="mt-6 whitespace-pre-wrap rounded-2xl bg-ink p-5 text-sm leading-relaxed text-white/75">{summary}</pre><button onClick={onCopy} className="btn-ghost-light mt-5"><Clipboard className="h-4 w-4"/>Copy summary</button><p className="mt-4 text-sm text-ink-soft">This estimate is an initial planning guide. Final scope, timeline, and pricing require technical discovery.</p></div>}
function toggle(items:string[],item:string){return items.includes(item)?items.filter((value)=>value!==item):[...items,item]}
function canContinue(step:number,state:State){if(step===0)return Boolean(state.service);if(step===1)return state.features.length>0;if(step===2)return Boolean(state.stage);if(step===3)return true;if(step===4)return Boolean(state.timeline);if(step===5)return Boolean(state.budget);return true}
