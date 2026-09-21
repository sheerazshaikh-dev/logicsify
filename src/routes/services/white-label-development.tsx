import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  Check,
  ChevronRight,
  Code2,
  EyeOff,
  Gauge,
  Globe2,
  Handshake,
  Headphones,
  Layers3,
  LockKeyhole,
  Network,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users2,
  Workflow,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import "@/white-label.css";

export const Route = createFileRoute("/services/white-label-development")({
  component: WhiteLabelDevelopmentPage,
  head: () => ({
    meta: [
      { title: "White Label Development Services for Agencies | Logicsify" },
      {
        name: "description",
        content:
          "White-label web development, SaaS, AI automation, CRM, portals, and custom software delivery for agencies and consultants that want to scale without expanding internal delivery teams.",
      },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      },
      {
        property: "og:title",
        content: "White Label Development & Delivery Partner for Agencies | Logicsify",
      },
      {
        property: "og:description",
        content:
          "Your brand stays in front while Logicsify provides the technical delivery engine behind websites, SaaS, AI automation, CRM, portals, and custom software.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://logicsify.com/services/white-label-development" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "White Label Development Services for Agencies | Logicsify",
      },
      {
        name: "twitter:description",
        content:
          "Behind-the-scenes technical delivery for agencies and consultants across web, SaaS, AI, CRM, portals, and custom software.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://logicsify.com/services/white-label-development",
      },
    ],
  }),
});

const capabilityCards = [
  {
    icon: Globe2,
    title: "Websites & Digital Platforms",
    text: "Conversion-focused websites, portals, CMS platforms, membership systems, booking experiences, and e-commerce builds.",
  },
  {
    icon: Bot,
    title: "AI Automation & Agents",
    text: "AI calling, chat assistants, lead qualification, follow-up workflows, document processing, and custom AI integrations.",
  },
  {
    icon: Network,
    title: "CRM & Revenue Operations",
    text: "GoHighLevel, HubSpot, custom CRM, pipelines, lead routing, scheduling, follow-up automation, and reporting.",
  },
  {
    icon: Boxes,
    title: "SaaS & Product Engineering",
    text: "Multi-tenant platforms, dashboards, admin systems, role-based portals, APIs, integrations, and product features.",
  },
  {
    icon: Palette,
    title: "UI/UX & Front-End Delivery",
    text: "User flows, wireframes, responsive interfaces, design-system implementation, interaction design, and product polish.",
  },
  {
    icon: Workflow,
    title: "Integrations & Operations",
    text: "Payments, communications, calendars, third-party APIs, automation platforms, deployment, monitoring, and handover.",
  },
];

const partnershipSteps = [
  ["01", "You bring the opportunity", "You keep ownership of the client relationship, commercial model, positioning, and account strategy."],
  ["02", "We scope behind the scenes", "We help turn requirements into architecture, milestones, delivery assumptions, and a realistic implementation plan."],
  ["03", "We build under your delivery model", "Our team handles engineering, QA, integrations, documentation, and technical problem-solving behind your brand."],
  ["04", "You present the work", "You remain the visible partner while we support demos, revisions, launch preparation, and technical handoff."],
  ["05", "We stay available", "Continue project-by-project or establish recurring delivery capacity for support, improvements, and new client work."],
];

const models = [
  {
    title: "Project-by-project",
    kicker: "Flexible capacity",
    text: "Bring us in when a client opportunity needs technical delivery beyond your current team or skill set.",
  },
  {
    title: "Dedicated delivery pod",
    kicker: "Recurring capacity",
    text: "Reserve a stable delivery layer for a consistent stream of builds, revisions, QA, and technical implementation.",
  },
  {
    title: "Overflow partner",
    kicker: "Protect timelines",
    text: "Use Logicsify when your internal team is at capacity and deadlines cannot move.",
  },
  {
    title: "Specialist partner",
    kicker: "Extend capability",
    text: "Add AI, CRM, automation, SaaS, integrations, or custom engineering without hiring every specialist internally.",
  },
];

const faqItems = [
  [
    "What is white-label development?",
    "White-label development means your agency or consultancy remains the visible client-facing provider while a delivery partner works behind the scenes to build, test, document, and support the technical solution.",
  ],
  [
    "What can Logicsify deliver under a white-label arrangement?",
    "We can support websites, web applications, portals, SaaS products, AI agents, workflow automation, CRM implementation, dashboards, APIs, integrations, e-commerce, mobile applications, UI/UX, deployment, and ongoing technical support.",
  ],
  [
    "Can you work completely behind our agency brand?",
    "Yes. The engagement can be structured so your agency owns the client relationship and Logicsify operates as the delivery layer. Communication rules, brand presentation, channels, and client-facing involvement can be defined before work begins.",
  ],
  [
    "Can you join client calls if we need technical support?",
    "Yes. Depending on the engagement, we can remain fully behind the scenes or join selected discovery, technical, demo, or handoff calls using the agreed role and communication model.",
  ],
  [
    "Who owns the code and project assets?",
    "Ownership and handoff terms should be documented in the project agreement. We can structure delivery around repository access, source-code handover, documentation, credentials, deployment ownership, and client-specific requirements.",
  ],
  [
    "Do you only work with large agencies?",
    "No. The model can work for solo consultants, boutique agencies, marketing firms, design studios, software consultancies, and larger teams that need additional technical capacity.",
  ],
  [
    "Can we start with one project first?",
    "Yes. A single project is a practical way to establish workflow, communication, QA expectations, and delivery fit before moving into recurring white-label capacity.",
  ],
];

const deliveryTracks = [
  {
    label: "Web & Platforms",
    icon: Globe2,
    title: "Ship complete digital experiences under your brand.",
    result: "Website, portal, CMS, e-commerce, dashboard, or web application ready for your client-facing delivery.",
    items: ["Business websites", "Custom CMS platforms", "Portals & dashboards", "E-commerce", "API integrations"],
  },
  {
    label: "AI & Automation",
    icon: Bot,
    title: "Add AI capability without building a specialist AI team.",
    result: "Production-focused automation connected to the client's actual CRM, calendars, data, communications, and workflows.",
    items: ["AI voice agents", "Support chatbots", "Lead qualification", "Follow-up automation", "Document processing"],
  },
  {
    label: "CRM & Revenue",
    icon: Gauge,
    title: "Turn scattered sales operations into one connected system.",
    result: "A configured or custom CRM operating model with routing, follow-up, scheduling, reporting, and integrations.",
    items: ["GoHighLevel", "HubSpot", "Custom CRM", "Pipelines & routing", "Revenue dashboards"],
  },
  {
    label: "Product Engineering",
    icon: Code2,
    title: "Extend your offer into custom software and SaaS.",
    result: "A scalable product build with roles, workflows, APIs, admin tooling, deployment, documentation, and iteration support.",
    items: ["SaaS products", "Multi-tenant systems", "Admin panels", "Custom APIs", "Product feature delivery"],
  },
];

function WhiteLabelDevelopmentPage() {
  return (
    <SiteLayout>
      <main className="wl-page">
        <WhiteLabelHero />
        <CapabilityTicker />
        <PartnershipPromise />
        <PartnershipFlow />
        <DeliveryExplorer />
        <Capabilities />
        <InvisibleDeliveryLayer />
        <VisualStory />
        <ProtectionLayer />
        <DeliveryModels />
        <Process />
        <Audience />
        <FAQ />
        <FinalCTA />
      </main>
    </SiteLayout>
  );
}

function WhiteLabelHero() {
  return (
    <section className="wl-hero relative overflow-hidden bg-black pb-20 pt-32 text-white md:pb-28 md:pt-40">
      <BackgroundBeamsWithCollision className="z-0" />
      <div className="wl-grid absolute inset-0 z-[1] opacity-45" aria-hidden="true" />
      <div className="wl-aurora wl-aurora-one" aria-hidden="true" />
      <div className="wl-aurora wl-aurora-two" aria-hidden="true" />
      <div className="container-page relative z-10 grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-white/75 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            Flagship service · White label delivery
          </div>
          <h1 className="mt-7 max-w-5xl text-[clamp(3.25rem,7vw,7.5rem)] font-semibold leading-[.9] tracking-[-.055em]">
            Your brand.
            <span className="block text-gradient">Our delivery engine.</span>
          </h1>
          <div className="mt-7">
            <LayoutTextFlip
              text="We deliver"
              words={["Websites", "AI Automation", "CRM Systems", "SaaS Products", "Client Portals"]}
              duration={2400}
              textClassName="text-white/72"
              wordClassName="border-white/12 bg-gradient-brand text-white shadow-[0_12px_36px_rgba(4,166,161,.18)]"
            />
          </div>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
            White-label development services for agencies and consultants that want to sell more
            without building a larger internal technical team. You keep the client relationship;
            we provide the technical delivery capacity behind your brand.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary">
              Discuss a White Label Partnership <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="btn-ghost-dark">
              See How It Works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/58">
            {["Your client relationship stays yours", "Flexible delivery capacity", "Multi-discipline technical team"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-brand-gold" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <WhiteLabelHeroGraphic />
        </div>
      </div>
    </section>
  );
}

function WhiteLabelHeroGraphic() {
  return (
    <div className="wl-orbit-stage relative mx-auto min-h-[480px] w-full max-w-[600px]" aria-label="White label delivery model infographic">
      <div className="wl-orbit-ring wl-orbit-ring-a" aria-hidden="true" />
      <div className="wl-orbit-ring wl-orbit-ring-b" aria-hidden="true" />
      <div className="wl-orbit-chip wl-chip-web"><Globe2 className="h-4 w-4" /> Web</div>
      <div className="wl-orbit-chip wl-chip-ai"><Bot className="h-4 w-4" /> AI</div>
      <div className="wl-orbit-chip wl-chip-crm"><Network className="h-4 w-4" /> CRM</div>
      <div className="wl-orbit-chip wl-chip-saas"><Boxes className="h-4 w-4" /> SaaS</div>
      <div className="wl-engine-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">Behind your brand</p>
            <p className="mt-1 text-lg font-semibold">Logicsify Delivery Engine</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand">
            <Zap className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {[
            ["Scoping & architecture", "Ready"],
            ["Build & integration", "Active"],
            ["QA & handoff", "Protected"],
          ].map(([label, status], index) => (
            <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[.06] text-[10px] text-white/50">0{index + 1}</span>
                <span className="text-sm text-white/78">{label}</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-brand-gold">{status}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="rounded-xl bg-white/[.06] p-3 text-center">
            <p className="text-[10px] uppercase tracking-[.14em] text-white/35">You</p>
            <p className="mt-1 text-sm font-semibold">Agency</p>
          </div>
          <div className="wl-flow-arrow"><ArrowRight className="h-4 w-4" /></div>
          <div className="rounded-xl bg-white/[.06] p-3 text-center">
            <p className="text-[10px] uppercase tracking-[.14em] text-white/35">Front stage</p>
            <p className="mt-1 text-sm font-semibold">Client</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityTicker() {
  const items = ["Web Development", "SaaS", "AI Agents", "CRM", "Automation", "Portals", "Dashboards", "Integrations", "UI/UX", "E-commerce"];
  const doubled = [...items, ...items];
  return (
    <section className="overflow-hidden border-y border-black/8 bg-white py-5" aria-label="White label capabilities">
      <div className="wl-ticker flex min-w-max items-center gap-4">
        {doubled.map((item, index) => (
          <div key={item + index} className="inline-flex items-center gap-3 rounded-full border border-black/8 bg-[#fbfbfb] px-4 py-2 text-sm font-semibold text-ink/72">
            <span className="h-2 w-2 rounded-full bg-gradient-brand" />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function PartnershipPromise() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-5">Scale delivery without changing your client experience</p>
          <h2 className="fluid-h2 max-w-5xl">
            Sell the solution your client needs. <span className="text-gradient">We help you deliver it.</span>
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-8 text-ink-soft lg:col-span-5 lg:pt-16">
          <p>
            Agencies often lose good opportunities because a project falls outside their current
            capacity, technical stack, or internal skill set. Hiring for every new capability is
            slow, expensive, and difficult to keep utilized.
          </p>
          <p>
            Logicsify acts as a white-label technology delivery partner. You keep the relationship
            and brand. We provide the engineering, automation, integration, QA, documentation, and
            implementation capacity required to get the work shipped.
          </p>
        </div>
      </div>
    </section>
  );
}

function PartnershipFlow() {
  return (
    <section id="how-it-works" className="section-dark relative overflow-hidden py-24 text-white md:py-32">
      <div className="wl-grid absolute inset-0 opacity-35" aria-hidden="true" />
      <div className="container-page relative">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4 text-white/50">How the partnership works</p>
          <h2 className="fluid-h2 text-white">A delivery model that keeps your agency in control.</h2>
          <p className="mt-5 text-lg leading-8 text-white/65">
            The workflow can stay completely behind the scenes or include selective technical
            support in discovery, demos, and handoff. The engagement model is defined before delivery starts.
          </p>
        </div>
        <div className="relative mt-14">
          <div className="wl-process-line hidden lg:block" aria-hidden="true"><span /></div>
          <div className="grid gap-4 lg:grid-cols-5">
            {partnershipSteps.map(([number, title, body]) => (
              <article key={number} className="wl-step-card relative rounded-3xl border border-white/10 bg-white/[.05] p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-gold">{number}</span>
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </div>
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeliveryExplorer() {
  const [active, setActive] = useState(0);
  const selected = deliveryTracks[active];
  const SelectedIcon = selected.icon;

  return (
    <section className="bg-[#f7f8f8] py-24 md:py-32">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">Interactive delivery explorer</p>
            <h2 className="fluid-h2">Expand what your agency can confidently sell.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-soft">
              Choose a delivery track to see how Logicsify can extend your technical capability
              without changing who owns the client relationship.
            </p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {deliveryTracks.map((track, index) => {
                const Icon = track.icon;
                const isActive = index === active;
                return (
                  <button
                    key={track.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(index)}
                    className={isActive
                      ? "flex items-center gap-3 rounded-2xl border border-black bg-black px-5 py-4 text-left text-white transition"
                      : "flex items-center gap-3 rounded-2xl border border-black/8 bg-white px-5 py-4 text-left text-ink transition hover:border-black/20"}
                  >
                    <span className={isActive ? "grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand" : "grid h-10 w-10 place-items-center rounded-xl bg-black/[.04]"}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-semibold">{track.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="wl-explorer-panel relative h-full min-h-[520px] overflow-hidden rounded-[2rem] bg-black p-7 text-white md:p-10">
              <div className="wl-grid absolute inset-0 opacity-35" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/40">Selected capability</p>
                    <h3 className="mt-3 max-w-xl text-3xl font-semibold leading-tight md:text-4xl">{selected.title}</h3>
                  </div>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-brand">
                    <SelectedIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-9 grid gap-3 sm:grid-cols-2">
                  {selected.items.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4">
                      <Check className="h-4 w-4 shrink-0 text-brand-gold" />
                      <span className="text-sm text-white/72">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border border-brand-gold/20 bg-brand-gold/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/40">White-label outcome</p>
                  <p className="mt-2 leading-7 text-white/78">{selected.result}</p>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-brand-gold/15 blur-3xl" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4">What we can deliver behind your brand</p>
          <h2 className="fluid-h2">One technical partner. Multiple service lines.</h2>
          <div className="mt-6 flex justify-center">
            <LayoutTextFlip
              text="One partner for"
              words={["Web Development", "AI & Automation", "CRM & Revenue", "Product Engineering"]}
              duration={2800}
              textClassName="text-ink/70"
              wordClassName="border-black/10 bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,.10)]"
            />
          </div>
          <p className="mt-5 text-lg leading-8 text-ink-soft">
            Instead of maintaining separate vendors for development, AI, CRM, automation, and
            integrations, you can coordinate delivery through one technical layer.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {capabilityCards.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="wl-cap-card group rounded-3xl border border-black/8 bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white transition group-hover:bg-gradient-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold tracking-[.16em] text-black/25">0{index + 1}</span>
              </div>
              <h3 className="mt-7 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InvisibleDeliveryLayer() {
  return (
    <section className="bg-black py-24 text-white md:py-32">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.05] px-3.5 py-1.5 text-xs uppercase tracking-[.16em] text-white/55">
            <EyeOff className="h-3.5 w-3.5 text-brand-gold" />
            Invisible delivery layer
          </div>
          <h2 className="mt-6 fluid-h2 text-white">
            Your client experiences <span className="text-gradient">one agency.</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/65">
            White-label delivery works when the experience feels unified. Your agency owns the
            relationship and presentation while the technical work is coordinated behind the scenes.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/68">
            {[
              "Agency-controlled communication model",
              "Project-specific roles and escalation paths",
              "Shared delivery documentation and milestone visibility",
              "Optional technical support for discovery, demos, and handoff",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <BadgeCheck className="h-4 w-4 shrink-0 text-brand-gold" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="wl-layer-diagram rounded-[2rem] border border-white/10 bg-white/[.04] p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <LayerCard label="Front stage" title="Your agency" icon={Handshake} active />
              <LayerCard label="Delivery layer" title="Logicsify" icon={Layers3} />
              <LayerCard label="Experience" title="Your client" icon={Users2} active />
            </div>
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="wl-data-line" aria-hidden="true"><span /></div>
              <div className="relative flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[.14em] text-white/48">
                <span>Requirements</span><ArrowRight className="h-4 w-4" /><span>Build</span><ArrowRight className="h-4 w-4" /><span>QA</span><ArrowRight className="h-4 w-4" /><span>Launch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LayerCard({ label, title, icon: Icon, active = false }: { label: string; title: string; icon: typeof Handshake; active?: boolean }) {
  return (
    <div className={active ? "rounded-2xl border border-brand-gold/25 bg-brand-gold/10 p-5" : "rounded-2xl border border-white/10 bg-white/[.04] p-5"}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-5 text-[10px] uppercase tracking-[.16em] text-white/35">{label}</p>
      <p className="mt-1 font-semibold">{title}</p>
    </div>
  );
}

function VisualStory() {
  return (
    <section className="bg-[#f7f8f8] py-24 md:py-32">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">White-label delivery in practice</p>
          <h2 className="fluid-h2">A delivery partnership that feels complete from every angle.</h2>
          <p className="mt-5 text-lg leading-8 text-ink-soft">
            From the internal delivery room to the client presentation and specialist engineering
            pod, the workflow is designed to stay polished, coordinated, and invisible behind your brand.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <VisualImage
            src="/white-label/agency-delivery-control-room.webp"
            alt="White-label agency delivery team monitoring project milestones, QA checks, analytics, and launch readiness"
            className="min-h-[470px] lg:col-span-7"
            eyebrow="Delivery operations"
            title="Agency delivery control room"
          />
          <div className="grid gap-5 lg:col-span-5">
            <VisualImage
              src="/white-label/client-facing-presentation.webp"
              alt="Professional client presentation showing a polished digital product experience across devices"
              className="min-h-[225px]"
              eyebrow="Client-facing experience"
              title="Your brand on the presentation"
            />
            <VisualImage
              src="/white-label/specialist-delivery-pod.webp"
              alt="Specialist engineering team collaborating across product, automation, CRM, and software workflows"
              className="min-h-[225px]"
              eyebrow="Behind the scenes"
              title="Specialist delivery pod"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function VisualImage({
  src,
  alt,
  className,
  eyebrow,
  title,
}: {
  src: string;
  alt: string;
  className?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <figure
      className={
        "group relative overflow-hidden rounded-[2rem] bg-black shadow-[0_24px_70px_rgba(0,0,0,.12)] " +
        (className || "")
      }
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/5 to-transparent"
        aria-hidden="true"
      />
      <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/55">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h3>
      </figcaption>
    </figure>
  );
}

function ProtectionLayer() {
  const protections = [
    [LockKeyhole, "Confidentiality structure", "NDA, access, credentials, repositories, and sensitive project information can be handled under agreed controls."],
    [ShieldCheck, "Relationship boundaries", "Client ownership, communication rules, introductions, and non-solicitation expectations can be documented in the engagement."],
    [Headphones, "Communication model", "Choose fully behind-the-scenes delivery or selective technical participation for discovery, demos, and handoff."],
    [Code2, "Technical handover", "Repository access, code ownership, deployment access, documentation, and maintenance responsibilities can be defined before launch."],
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-4">Protect the relationship</p>
          <h2 className="fluid-h2">Clear boundaries make white-label delivery work.</h2>
          <p className="mt-5 text-lg leading-8 text-ink-soft">
            Every agency operates differently. We define the working model before delivery so the
            client experience, access, communication, ownership, and handoff are understood on both sides.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {protections.map(([Icon, title, text]) => (
            <article key={String(title)} className="rounded-3xl border border-black/8 bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-black text-white">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{text as string}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeliveryModels() {
  return (
    <section className="bg-[#f7f8f8] py-24 md:py-32">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Flexible engagement models</p>
          <h2 className="fluid-h2">Use us where your delivery model needs support.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {models.map((model, index) => (
            <article key={model.title} className="group rounded-3xl border border-black/8 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[.16em] text-black/35">{model.kicker}</span>
                <span className="text-sm font-bold text-gradient">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold">{model.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{model.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4">From opportunity to delivery</p>
          <h2 className="fluid-h2">A simple operating rhythm for complex technical work.</h2>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          {partnershipSteps.map(([number, title, body]) => (
            <article key={number} className="rounded-3xl border border-black/8 bg-white p-6">
              <span className="text-sm font-bold text-gradient">{number}</span>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audience() {
  const audiences = [
    "Marketing agencies",
    "Design studios",
    "SEO & performance agencies",
    "Automation consultants",
    "CRM consultants",
    "Brand agencies",
    "Independent consultants",
    "Software consultancies",
  ];
  return (
    <section className="section-dark py-24 text-white md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow mb-4 text-white/50">Who this is for</p>
          <h2 className="fluid-h2 text-white">
            Keep selling your expertise. <span className="text-gradient">Add ours when you need it.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
            White-label delivery is useful when clients expect a broader solution than your current
            team can deliver internally, or when you want to protect timelines without adding permanent headcount.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6">
          {audiences.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4">
              <Check className="h-4 w-4 text-brand-gold" />
              <span className="text-sm font-semibold text-white/75">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4">White label development FAQ</p>
          <h2 className="fluid-h2">Questions agencies usually ask first.</h2>
          <p className="mt-5 text-ink-soft">
            Need a different operating model? We can define communication, delivery, access, and
            handoff rules around the way your agency already works.
          </p>
        </div>
        <div className="space-y-3 lg:col-span-8">
          {faqItems.map(([question, answer], index) => (
            <details key={question} className="group rounded-2xl border border-black/8 bg-white p-5 open:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold">
                <span>{question}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[.04] text-sm transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl border-t border-black/6 pt-4 text-sm leading-7 text-ink-soft">{answer}</p>
              <span className="sr-only">FAQ item {index + 1}</span>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="pb-8 pt-4">
      <div className="container-page">
        <div className="wl-final-cta relative overflow-hidden rounded-[2.25rem] bg-black px-7 py-14 text-white md:px-12 md:py-20">
          <div className="wl-grid absolute inset-0 opacity-35" aria-hidden="true" />
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-gold/18 blur-3xl" aria-hidden="true" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow mb-4 text-white/50">Build the partnership before the next deadline</p>
              <h2 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
                Keep the client. Expand the solution. <span className="text-gradient">Ship with confidence.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                Share the type of projects you sell, where delivery becomes difficult, and how you
                want a white-label partner to fit into your process.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/contact" className="btn-primary">
                Start a White Label Conversation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/work" className="btn-ghost-dark">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
