import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CheckCircle2, FileJson2, FileText, Loader2, Mic, Phone, Play, Plus, RotateCcw, Send, Workflow, X } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/automation-lab")({
  component: AutomationLabPage,
  head: () => ({
    meta: [
      { title: "Automation Lab | Interactive AI & CRM Demos | Logicsify" },
      { name: "description", content: "Explore interactive Logicsify demos for AI lead qualification, voice booking, CRM workflows, document extraction, and customer support automation." },
      { property: "og:title", content: "Automation Lab | Interactive AI & CRM Demos | Logicsify" },
      { property: "og:description", content: "Controlled demonstrations of lead qualification, voice booking, CRM automation, document extraction, and support workflows." },
      { property: "og:url", content: "https://logicsify.com/automation-lab" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/automation-lab" }],
  }),
});

type DemoKey = "lead" | "voice" | "crm" | "document" | "chat";
const demos: Array<{ key: DemoKey; title: string; desc: string; icon: typeof Bot }> = [
  { key: "lead", title: "Lead Qualification Agent", desc: "Turn form context into a routing recommendation.", icon: Bot },
  { key: "voice", title: "Voice AI Booking Flow", desc: "See a controlled booking conversation and activity log.", icon: Phone },
  { key: "crm", title: "CRM Automation Map", desc: "Configure triggers, conditions, and actions.", icon: Workflow },
  { key: "document", title: "Document Extraction Demo", desc: "Preview structured extraction using safe samples or local files.", icon: FileText },
  { key: "chat", title: "Support Chatbot Demo", desc: "Ask a limited service knowledge base.", icon: Bot },
];

function AutomationLabPage() {
  const [selected, setSelected] = useState<DemoKey>("lead");
  useEffect(() => trackEvent("automation_lab_view"), []);
  const selectedDemo = demos.find((demo) => demo.key === selected)!;
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Automation Lab"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Automation Lab" }]}
        title={<>Test the workflow before you <span className="text-gradient">scope the system.</span></>}
        intro="These are controlled demonstrations. They do not place outbound calls, update a live CRM, or permanently store uploaded documents."
        primaryCta={{ label: "Get a Free Technical Roadmap", to: "/technical-roadmap" }}
      />
      <section className="py-20 md:py-28">
        <div className="container-page grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="space-y-3 lg:sticky lg:top-28">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return <button key={demo.key} type="button" onClick={() => { setSelected(demo.key); trackEvent("automation_demo_selected", { demo: demo.key }); }} className={`w-full rounded-2xl border p-5 text-left transition ${selected === demo.key ? "border-brand-red bg-cream shadow-sm" : "border-black/10 bg-white hover:border-black/25"}`}>
                  <div className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white"><Icon className="h-5 w-5" /></span><span><span className="block font-semibold text-ink">{demo.title}</span><span className="mt-1 block text-sm text-ink-soft">{demo.desc}</span></span></div>
                </button>;
              })}
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-[var(--shadow-card)] md:p-8">
              <p className="eyebrow mb-3">Controlled demonstration</p>
              <h2 className="fluid-h3">{selectedDemo.title}</h2>
              <div className="mt-8">
                {selected === "lead" ? <LeadDemo /> : selected === "voice" ? <VoiceDemo /> : selected === "crm" ? <CrmDemo /> : selected === "document" ? <DocumentDemo /> : <ChatDemo />}
              </div>
            </div>
          </div>
        </div>
      </section>
      <TechnicalRoadmapCTA source="automation_lab" />
    </SiteLayout>
  );
}

function LeadDemo() {
  const [form, setForm] = useState({ business: "Home services", leads: "50–200", service: "AI automation", problem: "Slow lead response", budget: "$5,000–$15,000", timeline: "1–2 months" });
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const sequence = ["Lead Captured", "AI Analysis", "Lead Scoring", "CRM Record", "Pipeline Assignment", "Follow-Up Recommendation"];
  const score = form.timeline === "As soon as practical" ? 88 : form.budget === "Under $5,000" ? 54 : 76;
  async function run() {
    setRunning(true); setStep(0); trackEvent("automation_demo_started", { demo: "lead" });
    for (let i = 1; i <= sequence.length; i++) { await new Promise((resolve) => setTimeout(resolve, 430)); setStep(i); }
    setRunning(false); trackEvent("automation_demo_completed", { demo: "lead", score_band: score >= 80 ? "high" : score >= 60 ? "medium" : "low" });
  }
  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2">
      <Select label="Business type" value={form.business} options={["SaaS","Home services","Healthcare","E-commerce","Agency","Professional services"]} onChange={(value) => setForm({ ...form, business: value })} />
      <Select label="Monthly leads" value={form.leads} options={["Under 50","50–200","200–1,000","1,000+"]} onChange={(value) => setForm({ ...form, leads: value })} />
      <Select label="Service required" value={form.service} options={["AI automation","CRM implementation","Voice AI","Web application","Marketing system"]} onChange={(value) => setForm({ ...form, service: value })} />
      <Select label="Main problem" value={form.problem} options={["Slow lead response","Manual qualification","Missed appointments","Disconnected reporting","Repetitive data entry"]} onChange={(value) => setForm({ ...form, problem: value })} />
      <Select label="Budget" value={form.budget} options={["Under $5,000","$5,000–$15,000","$15,000–$35,000","Not defined"]} onChange={(value) => setForm({ ...form, budget: value })} />
      <Select label="Timeline" value={form.timeline} options={["As soon as practical","1–2 months","3–6 months","Exploring"]} onChange={(value) => setForm({ ...form, timeline: value })} />
    </div>
    <button onClick={run} disabled={running} className="btn-primary disabled:opacity-60">{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run demo</button>
    <div className="grid gap-3 sm:grid-cols-3">
      {sequence.map((item, index) => <div key={item} className={`rounded-xl border p-3 text-xs font-semibold ${step > index ? "border-green-200 bg-green-50 text-green-800" : "border-black/10 text-ink-soft"}`}>{step > index ? "✓ " : `${index + 1}. `}{item}</div>)}
    </div>
    {step === sequence.length ? <div className="rounded-2xl bg-ink p-6 text-white" role="status"><div className="grid gap-4 sm:grid-cols-2"><Result label="Lead score" value={`${score}/100`} /><Result label="Priority" value={score >= 80 ? "High" : score >= 60 ? "Medium" : "Nurture"} /><Result label="Suggested pipeline" value={`${form.service} discovery`} /><Result label="Follow-up timing" value={score >= 80 ? "Within 10 minutes" : "Within one business day"} /></div><p className="mt-5 text-sm text-white/65">Example internal note: {form.business} lead reporting “{form.problem.toLowerCase()}”. Validate current systems and data access before committing scope.</p></div> : null}
  </div>;
}

function VoiceDemo() {
  const [intent, setIntent] = useState("Book an appointment");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);
  const scripts: Record<string,string[]> = {
    "Book an appointment": ["Agent: Thanks for calling. What would you like to schedule?", "Caller: A technical discovery call next week.", "Agent: I have captured the request and would confirm availability before booking."],
    "Qualify a lead": ["Agent: What outcome are you trying to achieve?", "Caller: Reduce manual lead follow-up.", "Agent: I have captured the problem, timeline, and systems for review."],
    "Answer a question": ["Caller: Can you build a custom CRM?", "Agent: Yes, when a configurable CRM cannot fit the workflow. Discovery is required before scope."],
    "Transfer to a human": ["Caller: I need to discuss an existing project.", "Agent: I would verify the contact and transfer during staffed hours. This demo does not place a call."],
  };
  async function run() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRunning(true); setElapsed(0); setLines([]); trackEvent("automation_demo_started", { demo: "voice", intent });
    timerRef.current = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    for (const line of scripts[intent]) { await new Promise((resolve) => setTimeout(resolve, 750)); setLines((current) => [...current, line]); }
    if (timerRef.current) window.clearInterval(timerRef.current); setRunning(false); trackEvent("automation_demo_completed", { demo: "voice", intent });
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return <div className="grid gap-6 md:grid-cols-2">
    <div><Select label="Conversation goal" value={intent} options={Object.keys(scripts)} onChange={setIntent} /><div className="mt-5 rounded-[2rem] bg-ink p-6 text-white"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-brand"><Phone className="h-7 w-7" /></div><p className="mt-5 text-center font-mono text-2xl">00:{String(elapsed).padStart(2,"0")}</p><p className="mt-2 text-center text-xs text-white/50">SIMULATED CALL · NO OUTBOUND CONNECTION</p><button onClick={run} disabled={running} className="btn-primary mt-6 w-full justify-center">{running ? <Mic className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />} {running ? "Conversation running" : "Start demo"}</button></div></div>
    <div><p className="text-sm font-semibold text-ink">Transcript and activity</p><div className="mt-3 min-h-72 rounded-2xl border border-black/10 bg-cream p-5"><div className="space-y-3">{lines.map((line,index) => <p key={index} className="rounded-xl bg-white p-3 text-sm text-ink-soft">{line}</p>)}</div>{!lines.length ? <p className="text-sm text-ink-soft">Start the demo to see a controlled transcript.</p> : null}{lines.length === scripts[intent].length ? <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800"><strong>Detected intent:</strong> {intent}<br/><strong>Result:</strong> Request captured for confirmation.</div> : null}</div></div>
  </div>;
}

const triggerOptions = ["New website lead","Missed call","Form submission","Appointment booked","Pipeline stage changed","Invoice overdue"];
const conditionOptions = ["Service","Budget","Source","Location","Score","Customer type"];
const actionOptions = ["Create opportunity","Assign owner","Send email","Send SMS","Add tag","Notify team","Move pipeline","Schedule follow-up","Create task"];
function CrmDemo() {
  const [nodes, setNodes] = useState(["New website lead","Score","Create opportunity","Assign owner","Schedule follow-up"]);
  const [active, setActive] = useState(-1);
  const pool = [...triggerOptions,...conditionOptions,...actionOptions].filter((item) => !nodes.includes(item));
  async function run() { trackEvent("automation_demo_started", { demo: "crm", nodes: nodes.length }); setActive(-1); for (let i=0;i<nodes.length;i++){await new Promise((r)=>setTimeout(r,520));setActive(i);} trackEvent("automation_demo_completed", { demo: "crm", nodes: nodes.length }); }
  return <div>
    <div className="flex flex-wrap gap-2"><select className="form-input max-w-xs" defaultValue="" onChange={(e)=>{if(e.target.value)setNodes([...nodes,e.target.value]);e.currentTarget.value=""}}><option value="">Add workflow node</option>{pool.map((item)=><option key={item}>{item}</option>)}</select><button onClick={run} className="btn-primary"><Play className="h-4 w-4"/>Run demo</button><button onClick={()=>{setNodes(["New website lead","Score","Create opportunity","Assign owner","Schedule follow-up"]);setActive(-1);trackEvent("automation_demo_reset",{demo:"crm"})}} className="btn-ghost-light"><RotateCcw className="h-4 w-4"/>Reset</button></div>
    <div className="mt-8 space-y-3">{nodes.map((node,index)=><div key={`${node}-${index}`} className="relative flex items-center gap-3"><div className={`flex-1 rounded-2xl border p-4 transition ${active===index?"border-brand-red bg-cream shadow-lg":"border-black/10 bg-white"}`}><span className="eyebrow">{index===0?"Trigger":conditionOptions.includes(node)?"Condition":"Action"}</span><p className="mt-1 font-semibold text-ink">{node}</p></div><div className="flex gap-1"><button aria-label="Move up" disabled={index===0} onClick={()=>setNodes((current)=>{const next=[...current];[next[index-1],next[index]]=[next[index],next[index-1]];return next})} className="rounded-lg border p-2 disabled:opacity-30">↑</button><button aria-label="Move down" disabled={index===nodes.length-1} onClick={()=>setNodes((current)=>{const next=[...current];[next[index+1],next[index]]=[next[index],next[index+1]];return next})} className="rounded-lg border p-2 disabled:opacity-30">↓</button><button aria-label="Remove" onClick={()=>setNodes(nodes.filter((_,i)=>i!==index))} className="rounded-lg border p-2 text-red-600"><X className="h-4 w-4"/></button></div>{index<nodes.length-1?<span className="absolute -bottom-4 left-6 text-ink-soft">↓</span>:null}</div>)}</div>
    {active===nodes.length-1&&nodes.length?<p className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800" role="status">Sample contact completed the configured workflow. No live CRM record was created.</p>:null}
  </div>;
}

function DocumentDemo() {
  const [category,setCategory]=useState("Invoice");
  const [filename,setFilename]=useState("");
  const [result,setResult]=useState<Record<string,string>|null>(null);
  const samples:Record<string,Record<string,string>>={Invoice:{vendor:"Sample vendor",invoice_number:"INV-EXAMPLE",total:"Example amount",due_date:"Example date"},Proposal:{client:"Example client",scope:"Discovery and implementation",timeline:"Example timeline",status:"Needs review"},"Application form":{applicant:"Sample applicant",request_type:"Example request",status:"Incomplete"},Contract:{parties:"Example parties",effective_date:"Example date",renewal:"Review required"},"Customer intake form":{contact:"Sample contact",service:"Example service",priority:"Needs qualification"}};
  function process(){trackEvent("automation_demo_started",{demo:"document",category});setTimeout(()=>{setResult(samples[category]);trackEvent("automation_demo_completed",{demo:"document",category})},500)}
  return <div className="grid gap-6 md:grid-cols-2"><div><Select label="Document category" value={category} options={Object.keys(samples)} onChange={(value)=>{setCategory(value);setResult(null)}}/><label className="mt-5 block"><span className="mb-2 block text-sm font-semibold">Optional local sample</span><input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="form-input" onChange={(e)=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){alert("Maximum demo file size is 5 MB.");e.currentTarget.value="";return;}setFilename(file.name);setResult(null)}}/></label><p className="mt-3 text-xs leading-relaxed text-ink-soft">Files are not uploaded or stored by this demo. The browser only validates the selected name, type, and size; the structured result uses prepared sample data.</p><button onClick={process} className="btn-primary mt-5"><FileJson2 className="h-4 w-4"/>Extract sample fields</button></div><div className="rounded-2xl border border-black/10 bg-cream p-5"><p className="text-sm font-semibold">Document preview</p><div className="mt-3 rounded-xl bg-white p-5"><p className="eyebrow">{category}</p><p className="mt-3 text-sm text-ink-soft">{filename||"Prepared safe demo file"}</p></div>{result?<><p className="mt-5 text-sm font-semibold">Structured JSON</p><pre className="mt-2 overflow-auto rounded-xl bg-ink p-4 text-xs text-white">{JSON.stringify(result,null,2)}</pre><p className="mt-3 text-xs text-ink-soft">Suggested next automation: validate required fields, create a review task, and write approved values to the system of record.</p></>:null}</div></div>;
}

const kb = [
  { match:["service","provide"], answer:"Logicsify provides web and application development, SaaS and mobile product work, AI automation, CRM workflows, integrations, SEO, paid advertising, and digital growth services." },
  { match:["custom crm","crm"], answer:"Logicsify can configure existing CRM platforms or build custom CRM workflows when the operating model cannot fit a standard tool. Discovery is needed before recommending either path." },
  { match:["saas"], answer:"Logicsify supports SaaS product discovery, product design, application engineering, billing, onboarding, admin systems, analytics, and scaling work." },
  { match:["appointment","booking"], answer:"Logicsify can design appointment workflows using forms, calendars, CRM automations, SMS, email, and controlled voice AI where the required accounts and consent process are available." },
  { match:["process","project"], answer:"A typical process covers discovery, technical scope, design, development, quality assurance, launch, and support or iteration." },
  { match:["integrate","system"], answer:"Supported systems include GoHighLevel, HubSpot, Supabase, Shopify, WordPress, Stripe, Twilio, Retell AI, OpenAI, Google Ads, Meta, n8n, Make, and Zapier. These are supported integrations, not partnership claims." },
];
function ChatDemo(){const suggested=["What services do you provide?","Can you build a custom CRM?","Do you develop SaaS products?","Can you automate appointment booking?","How does the project process work?","What systems can you integrate?"];const [messages,setMessages]=useState<Array<{role:"user"|"assistant";text:string}>>([{role:"assistant",text:"Ask a question about Logicsify services. This demo uses a limited predefined knowledge base."}]);const [input,setInput]=useState("");const [typing,setTyping]=useState(false);async function send(text=input){const q=text.trim();if(!q)return;setMessages((m)=>[...m,{role:"user",text:q}]);setInput("");setTyping(true);trackEvent("automation_demo_started",{demo:"chat"});await new Promise((r)=>setTimeout(r,450));const lower=q.toLowerCase();const answer=kb.find((item)=>item.match.some((term)=>lower.includes(term)))?.answer||"This limited demo does not have a supported answer for that question. Use the technical roadmap form for project-specific guidance.";setMessages((m)=>[...m,{role:"assistant",text:answer}]);setTyping(false);trackEvent("automation_demo_completed",{demo:"chat",answered:answer.startsWith("This limited")?false:true})}return <div><div className="flex flex-wrap gap-2">{suggested.slice(0,4).map((q)=><button key={q} onClick={()=>send(q)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold hover:bg-cream">{q}</button>)}</div><div className="mt-5 h-80 overflow-y-auto rounded-2xl border border-black/10 bg-cream p-4" aria-live="polite"><div className="space-y-3">{messages.map((message,index)=><div key={index} className={`max-w-[88%] rounded-2xl p-3 text-sm ${message.role==="user"?"ml-auto bg-ink text-white":"bg-white text-ink-soft"}`}>{message.text}</div>)}{typing?<div className="rounded-2xl bg-white p-3 text-sm text-ink-soft">Typing…</div>:null}</div></div><div className="mt-4 flex gap-2"><input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")void send()}} className="form-input" aria-label="Question" placeholder="Ask about services or process"/><button onClick={()=>send()} className="btn-primary" aria-label="Send"><Send className="h-4 w-4"/></button></div><p className="mt-4 text-xs text-ink-soft">The demo does not provide guarantees, pricing, legal advice, or project-specific commitments. <Link to="/technical-roadmap" className="font-semibold text-brand-red">Escalate to a roadmap request.</Link></p></div>}

function Select({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(value:string)=>void}){return <label className="block"><span className="mb-2 block text-sm font-semibold text-ink">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className="form-input">{options.map((option)=><option key={option}>{option}</option>)}</select></label>}
function Result({label,value}:{label:string;value:string}){return <div><p className="text-[10px] uppercase tracking-widest text-white/45">{label}</p><p className="mt-1 font-semibold">{value}</p></div>}
