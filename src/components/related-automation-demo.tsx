import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  FileJson2,
  Loader2,
  MessageSquareText,
  PhoneCall,
  Play,
  Workflow,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type DemoKind = "lead" | "voice" | "workflow" | "document" | "support";

type RelatedAutomationDemoProps = {
  serviceSlug: string;
  serviceName: string;
};

const demoBySlug: Record<string, DemoKind> = {
  "ai-automation-voice-agents": "lead",
  "ai-calling-agents": "voice",
  "appointment-booking-agents": "voice",
  "lead-qualification-agents": "lead",
  "ai-support-chatbots": "support",
  "automated-lead-follow-up": "workflow",
  "messaging-calendar-automation": "workflow",
  "document-extraction-processing": "document",
  "internal-workflow-automation": "workflow",
  "custom-ai-integrations": "workflow",
};

const demoLabels: Record<DemoKind, { eyebrow: string; title: string; intro: string }> = {
  lead: {
    eyebrow: "Related sample demo",
    title: "See a lead move from capture to a recommended next action.",
    intro: "This controlled example scores a sample lead and shows how an AI-assisted qualification workflow could route it without touching a live CRM.",
  },
  voice: {
    eyebrow: "Related sample demo",
    title: "Preview a controlled AI booking conversation.",
    intro: "Choose a call goal and run a short simulated exchange. No call is placed and no appointment is written to a live calendar.",
  },
  workflow: {
    eyebrow: "Related sample demo",
    title: "Watch a sample contact move through an automated workflow.",
    intro: "This simulation demonstrates triggers, decisions, CRM activity, notifications, and follow-up without changing any production system.",
  },
  document: {
    eyebrow: "Related sample demo",
    title: "Turn a sample document into structured review data.",
    intro: "Select a prepared document type and preview an extraction result. No file is uploaded or permanently stored.",
  },
  support: {
    eyebrow: "Related sample demo",
    title: "Test a limited support-assistant knowledge flow.",
    intro: "Ask one of the prepared questions to see how a controlled support assistant can answer from approved information and escalate unsupported requests.",
  },
};

export function RelatedAutomationDemo({ serviceSlug, serviceName }: RelatedAutomationDemoProps) {
  const kind = demoBySlug[serviceSlug] || "workflow";
  const copy = demoLabels[kind];

  return (
    <section className="border-y border-white/10 bg-ink py-20 text-white md:py-28">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4 text-white/55">{copy.eyebrow}</p>
          <h2 className="fluid-h2 text-white">{copy.title}</h2>
          <p className="mt-5 text-base leading-7 text-white/65">{copy.intro}</p>
          <p className="mt-4 text-xs leading-5 text-white/45">
            Demonstration only. Results are illustrative and depend on approved data, permissions, integrations, and operating rules.
          </p>
          <Link
            to="/automation-lab"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:text-white"
          >
            Open the full Automation Lab <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">{serviceName}</p>
                <p className="mt-2 font-semibold text-white">Interactive sample</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">Simulated</span>
            </div>
            {kind === "lead" ? <CompactLeadDemo serviceSlug={serviceSlug} /> : null}
            {kind === "voice" ? <CompactVoiceDemo serviceSlug={serviceSlug} /> : null}
            {kind === "workflow" ? <CompactWorkflowDemo serviceSlug={serviceSlug} /> : null}
            {kind === "document" ? <CompactDocumentDemo serviceSlug={serviceSlug} /> : null}
            {kind === "support" ? <CompactSupportDemo serviceSlug={serviceSlug} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompactLeadDemo({ serviceSlug }: { serviceSlug: string }) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [volume, setVolume] = useState("50–200 leads");
  const steps = ["Lead captured", "Context checked", "Score calculated", "Owner assigned", "Follow-up recommended"];
  const score = volume === "500+ leads" ? 91 : volume === "200–500 leads" ? 84 : 76;

  async function run() {
    setRunning(true);
    setStep(0);
    trackEvent("automation_demo_started", { demo: "lead", placement: "service_page", service: serviceSlug });
    for (let index = 1; index <= steps.length; index += 1) {
      await wait(380);
      setStep(index);
    }
    setRunning(false);
    trackEvent("automation_demo_completed", { demo: "lead", placement: "service_page", service: serviceSlug });
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label>
          <span className="mb-2 block text-sm font-semibold text-white">Sample monthly volume</span>
          <select value={volume} onChange={(event) => setVolume(event.target.value)} className="form-input border-white/15 bg-white text-ink">
            {["Under 50 leads", "50–200 leads", "200–500 leads", "500+ leads"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <button type="button" onClick={run} disabled={running} className="btn-primary min-w-36 justify-center disabled:opacity-60">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run sample
        </button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {steps.map((label, index) => (
          <div key={label} className={`rounded-xl border p-3 text-xs font-semibold transition ${step > index ? "border-green-300/30 bg-green-300/10 text-green-100" : "border-white/10 text-white/45"}`}>
            {step > index ? "✓" : index + 1}. {label}
          </div>
        ))}
      </div>
      {step === steps.length ? (
        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-5 sm:grid-cols-3" role="status">
          <Result label="Sample score" value={`${score}/100`} />
          <Result label="Priority" value={score >= 85 ? "High" : "Qualified"} />
          <Result label="Recommended action" value="Contact within 10 minutes" />
        </div>
      ) : null}
    </div>
  );
}

function CompactVoiceDemo({ serviceSlug }: { serviceSlug: string }) {
  const [goal, setGoal] = useState("Book an appointment");
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const scripts: Record<string, string[]> = {
    "Book an appointment": [
      "Agent: What would you like to schedule?",
      "Caller: A consultation next week.",
      "Agent: I captured your request and would check approved calendar availability before confirming.",
    ],
    "Qualify a lead": [
      "Agent: What result are you trying to improve?",
      "Caller: Faster lead follow-up.",
      "Agent: I captured the problem, timeline, and current CRM for a human review.",
    ],
    "Transfer to a person": [
      "Caller: I need help with an existing project.",
      "Agent: I would verify the contact and transfer during staffed hours.",
    ],
  };

  async function run() {
    setRunning(true);
    setLines([]);
    trackEvent("automation_demo_started", { demo: "voice", placement: "service_page", service: serviceSlug, goal });
    for (const line of scripts[goal]) {
      await wait(560);
      setLines((current) => [...current, line]);
    }
    setRunning(false);
    trackEvent("automation_demo_completed", { demo: "voice", placement: "service_page", service: serviceSlug, goal });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
      <div>
        <label>
          <span className="mb-2 block text-sm font-semibold text-white">Conversation goal</span>
          <select value={goal} onChange={(event) => setGoal(event.target.value)} className="form-input border-white/15 bg-white text-ink">
            {Object.keys(scripts).map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <button type="button" onClick={run} disabled={running} className="btn-primary mt-4 w-full justify-center disabled:opacity-60">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />} Simulate conversation
        </button>
      </div>
      <div className="min-h-56 rounded-2xl border border-white/10 bg-black/15 p-5" aria-live="polite">
        <div className="mb-4 flex items-center gap-2 text-sm text-white/55"><PhoneCall className="h-4 w-4" /> Sample transcript</div>
        <div className="space-y-3">
          {lines.length ? lines.map((line, index) => <p key={`${line}-${index}`} className="rounded-xl bg-white/10 p-3 text-sm leading-6 text-white/80">{line}</p>) : <p className="text-sm text-white/40">Run the sample to display a transcript.</p>}
        </div>
      </div>
    </div>
  );
}

function CompactWorkflowDemo({ serviceSlug }: { serviceSlug: string }) {
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const steps = useMemo(() => {
    if (serviceSlug === "messaging-calendar-automation") return ["Form submitted", "CRM record updated", "Calendar checked", "Confirmation sent", "Reminder scheduled"];
    if (serviceSlug === "automated-lead-follow-up") return ["Lead status changed", "Follow-up rule checked", "Message sent", "Task created", "Response monitored"];
    if (serviceSlug === "custom-ai-integrations") return ["System event received", "Approved data prepared", "AI service called", "Result validated", "Business system updated"];
    return ["Trigger received", "Conditions evaluated", "Record updated", "Team notified", "Next action scheduled"];
  }, [serviceSlug]);

  async function run() {
    setRunning(true);
    setActive(-1);
    trackEvent("automation_demo_started", { demo: "workflow", placement: "service_page", service: serviceSlug });
    for (let index = 0; index < steps.length; index += 1) {
      await wait(460);
      setActive(index);
    }
    setRunning(false);
    trackEvent("automation_demo_completed", { demo: "workflow", placement: "service_page", service: serviceSlug });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-white/65"><Workflow className="h-5 w-5 text-brand-gold" /> Sample workflow execution</div>
        <button type="button" onClick={run} disabled={running} className="btn-primary disabled:opacity-60">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run workflow
        </button>
      </div>
      <div className="mt-7 grid gap-3 md:grid-cols-5">
        {steps.map((label, index) => (
          <div key={label} className={`relative rounded-xl border p-4 text-sm transition ${active === index ? "border-brand-gold bg-brand-gold/10 text-white" : active > index ? "border-green-300/25 bg-green-300/10 text-green-100" : "border-white/10 text-white/45"}`}>
            <span className="mb-2 block text-[10px] uppercase tracking-widest opacity-60">Step {index + 1}</span>
            {label}
            {index < steps.length - 1 ? <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-brand-gold md:block">→</span> : null}
          </div>
        ))}
      </div>
      {active === steps.length - 1 ? <p className="mt-5 flex items-center gap-2 text-sm text-green-100" role="status"><CheckCircle2 className="h-4 w-4" /> Sample workflow completed. No production record was changed.</p> : null}
    </div>
  );
}

function CompactDocumentDemo({ serviceSlug }: { serviceSlug: string }) {
  const [category, setCategory] = useState("Invoice");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const results: Record<string, Record<string, string>> = {
    Invoice: { vendor: "Sample vendor", invoice_number: "INV-EXAMPLE", total: "Review required", status: "Validation pending" },
    Proposal: { client: "Sample client", scope: "Discovery and implementation", timeline: "Review required", status: "Needs approval" },
    "Customer intake": { contact: "Sample contact", request: "Automation review", priority: "Needs qualification", status: "Incomplete" },
  };

  async function run() {
    setRunning(true);
    setResult(null);
    trackEvent("automation_demo_started", { demo: "document", placement: "service_page", service: serviceSlug, category });
    await wait(650);
    setResult(results[category]);
    setRunning(false);
    trackEvent("automation_demo_completed", { demo: "document", placement: "service_page", service: serviceSlug, category });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label>
          <span className="mb-2 block text-sm font-semibold text-white">Prepared sample type</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="form-input border-white/15 bg-white text-ink">
            {Object.keys(results).map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <button type="button" onClick={run} disabled={running} className="btn-primary mt-4 w-full justify-center disabled:opacity-60">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson2 className="h-4 w-4" />} Extract sample fields
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="text-sm font-semibold text-white">Structured preview</p>
        {result ? <pre className="mt-4 overflow-auto text-xs leading-6 text-white/70">{JSON.stringify(result, null, 2)}</pre> : <p className="mt-4 text-sm text-white/40">Run the prepared sample to preview extracted fields.</p>}
      </div>
    </div>
  );
}

function CompactSupportDemo({ serviceSlug }: { serviceSlug: string }) {
  const questions = [
    ["Can the assistant transfer to a person?", "Yes. Transfer and escalation rules can be defined around staffed hours, intent, confidence, customer status, or approved keywords."],
    ["Can answers be restricted?", "Yes. A controlled assistant should use approved knowledge, clearly defined actions, fallback responses, and human escalation for unsupported requests."],
    ["Can it update a CRM?", "It can create or update approved records when the CRM API, permissions, field mapping, validation, and audit requirements are confirmed."],
  ] as const;
  const [answer, setAnswer] = useState("Choose a prepared question.");

  function ask(question: string, response: string) {
    setAnswer(response);
    trackEvent("automation_demo_started", { demo: "support", placement: "service_page", service: serviceSlug });
    trackEvent("automation_demo_completed", { demo: "support", placement: "service_page", service: serviceSlug, question });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-2">
        {questions.map(([question, response]) => (
          <button key={question} type="button" onClick={() => ask(question, response)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/10">
            {question}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5" aria-live="polite">
        <div className="mb-4 flex items-center gap-2 text-sm text-white/55"><MessageSquareText className="h-4 w-4" /> Sample assistant response</div>
        <p className="text-sm leading-7 text-white/75">{answer}</p>
        <div className="mt-5 flex items-center gap-2 text-xs text-white/40"><Bot className="h-4 w-4" /> Limited approved knowledge base</div>
      </div>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}
