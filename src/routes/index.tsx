import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { CTASection } from "@/components/cta-section";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Code2,
  Bot,
  TrendingUp,
  Layers,
  Zap,
  Cpu,
  Palette,
  Database,
  Cloud,
  LineChart,
  MessageSquare,
  Workflow,
  Search,
  Megaphone,
} from "lucide-react";
import { caseStudies, industries, insights, allServices } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Logicsify | Web Development, AI Automation & Digital Marketing" },
      {
        name: "description",
        content:
          "Logicsify designs websites, web applications, SaaS products, AI automations, and digital marketing systems that help businesses grow.",
      },
      {
        property: "og:title",
        content: "Logicsify | Build Smarter. Grow Faster. Automate Everything.",
      },
      {
        property: "og:description",
        content: "Technology, marketing, and automation—logically built for growth.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <TrustStrip />
      <Introduction />
      <ServicesGrid />
      <FeaturedServices />
      <FeaturedWork />
      <AutomationSpotlight />
      <ProcessSection />
      <WhyLogicsify />
      <TechStack />
      <IndustriesGrid />
      <TestimonialSection />
      <InsightsSection />
      <CTASection />
    </SiteLayout>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="section-dark grid-noise relative min-h-[92dvh] flex items-center pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-[520px] h-[520px] rounded-full bg-brand-red/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-gold/10 blur-3xl" />
      </div>

      <div className="container-page relative grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/80 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            Technology · Design · AI · Growth
          </div>
          <h1 className="fluid-display text-white">
            <span data-reveal style={{ ["--reveal-delay" as string]: "0ms" }} className="block">
              Build Smarter.
            </span>
            <span data-reveal style={{ ["--reveal-delay" as string]: "120ms" }} className="block">
              Grow Faster.
            </span>
            <span
              data-reveal
              style={{ ["--reveal-delay" as string]: "240ms" }}
              className="block text-gradient animate-gradient"
            >
              Automate Everything.
            </span>
          </h1>
          <p
            data-reveal
            style={{ ["--reveal-delay" as string]: "360ms" }}
            className="mt-8 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed"
          >
            Logicsify combines technology, marketing, and AI automation to turn complex business
            challenges into connected digital systems.
          </p>
          <div
            data-reveal
            style={{ ["--reveal-delay" as string]: "480ms" }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link to="/contact" className="btn-primary">
              Start a Project <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/work" className="btn-ghost-dark">
              Explore Our Work
            </Link>
          </div>
          <p
            data-reveal
            style={{ ["--reveal-delay" as string]: "600ms" }}
            className="mt-10 text-xs uppercase tracking-[0.2em] text-white/50"
          >
            Websites · Applications · AI Automations · Digital Growth
          </p>
        </div>

        <div className="lg:col-span-5">
          <HeroVisual />
        </div>
      </div>

      <div className="absolute bottom-6 inset-x-0 flex justify-center text-white/40 text-xs">
        <span className="animate-float">Scroll to explore ↓</span>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-square max-w-[520px] mx-auto">
      {/* Rotating rings */}
      <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
      <div
        className="absolute inset-8 rounded-full border border-white/10 animate-spin-slow"
        style={{ animationDirection: "reverse", animationDuration: "24s" }}
      />
      <div
        className="absolute inset-20 rounded-full border border-white/10 animate-spin-slow"
        style={{ animationDuration: "18s" }}
      />

      {/* Center orb */}
      <div className="absolute inset-1/3 rounded-full bg-gradient-brand animate-pulse-glow blur-xl opacity-70" />
      <div className="absolute inset-[42%] rounded-full bg-white/90" />

      {/* Nodes */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id="node-line" x1="0" x2="1">
            <stop offset="0%" stopColor="#FE3434" />
            <stop offset="100%" stopColor="#FDBE02" />
          </linearGradient>
        </defs>
        {[
          [200, 40],
          [340, 130],
          [340, 270],
          [200, 360],
          [60, 270],
          [60, 130],
        ].map(([x, y], i) => (
          <g key={i}>
            <line
              x1="200"
              y1="200"
              x2={x}
              y2={y}
              stroke="url(#node-line)"
              strokeWidth="1"
              opacity="0.4"
              strokeDasharray="4 6"
              style={{ animation: "draw-line 3s ease-out forwards", animationDelay: `${i * 0.1}s` }}
            />
            <circle cx={x} cy={y} r="6" fill="url(#node-line)" opacity="0.9" />
            <circle cx={x} cy={y} r="12" fill="none" stroke="url(#node-line)" opacity="0.3" />
          </g>
        ))}
      </svg>

      {/* Floating UI cards */}
      <div className="absolute -top-4 -right-4 glass-card rounded-2xl px-4 py-3 text-xs text-white animate-float">
        <p className="text-white/60 text-[10px] uppercase tracking-widest">Automation</p>
        <p className="mt-1 font-semibold">Lead qualified → CRM</p>
      </div>
      <div
        className="absolute -bottom-2 -left-4 glass-card rounded-2xl px-4 py-3 text-xs text-white animate-float"
        style={{ animationDelay: "1.5s" }}
      >
        <p className="text-white/60 text-[10px] uppercase tracking-widest">Growth</p>
        <p className="mt-1 font-semibold">MQL → SQL, live</p>
      </div>
    </div>
  );
}

/* ---------- TRUST STRIP ---------- */
function TrustStrip() {
  const labels = [
    "Product Strategy",
    "UI/UX",
    "Full-Stack Development",
    "AI Integration",
    "Digital Marketing",
    "Automation",
    "SaaS Engineering",
    "Systems Integration",
  ];
  const doubled = [...labels, ...labels];
  return (
    <section className="border-y border-black/5 bg-cream py-10 overflow-hidden">
      <div className="container-page">
        <p className="text-center text-ink-soft text-sm mb-8">
          Strategy, design, development, marketing, and automation —{" "}
          <span className="text-ink font-semibold">under one roof.</span>
        </p>
      </div>
      <div className="relative">
        <div className="flex gap-12 whitespace-nowrap animate-marquee">
          {doubled.map((l, i) => (
            <div key={i} className="inline-flex items-center gap-3 text-ink/70">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
              <span className="text-lg md:text-xl font-semibold tracking-tight">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- INTRODUCTION ---------- */
function Introduction() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-6">A connected growth partner</p>
          <h2 data-reveal className="fluid-h2">
            We turn disconnected ideas, tools, and processes into{" "}
            <span className="text-gradient">one intelligent growth system.</span>
          </h2>
        </div>
        <div className="lg:col-span-5 lg:pt-24 space-y-6 text-ink-soft leading-relaxed">
          <p data-reveal>
            Most companies don't have a technology problem or a marketing problem — they have a
            coordination problem. Design lives in one tool. Data in another. Marketing runs in
            parallel to the product. Automation is a wishlist.
          </p>
          <p data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
            Logicsify brings strategy, engineering, AI, and growth into the same room so every
            decision reinforces the next.
          </p>
          <Link
            to="/about"
            data-reveal
            className="inline-flex items-center gap-2 text-ink font-semibold group"
          >
            More about our approach
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- SERVICES GRID (4 categories) ---------- */
function ServicesGrid() {
  const cats = [
    {
      n: "01",
      title: "Design",
      icon: Palette,
      items: ["UI/UX & Product Design", "Branding & Creative", "Web Design"],
      link: "/services",
      desc: "Interfaces that convert and identities that last.",
    },
    {
      n: "02",
      title: "Development",
      icon: Code2,
      items: ["Web Applications", "SaaS Development", "Mobile Apps", "E-commerce"],
      link: "/services",
      desc: "Modern engineering across web, mobile, and platform.",
    },
    {
      n: "03",
      title: "AI & Automation",
      icon: Bot,
      items: ["AI Automations", "AI Agents", "CRM Automation", "API Integrations"],
      link: "/services/ai-automations",
      desc: "Automation designed around real operations.",
    },
    {
      n: "04",
      title: "Growth Marketing",
      icon: TrendingUp,
      items: ["SEO", "Paid Advertising", "Content", "CRO"],
      link: "/services/seo",
      desc: "Compounding, measurable acquisition systems.",
    },
  ];
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="container-page">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow mb-4">What we do</p>
          <h2 className="fluid-h2">Everything you need to build and scale digitally.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {cats.map(({ n, title, icon: Icon, items, link, desc }) => (
            <Link
              to={link}
              key={n}
              data-reveal
              className="group relative overflow-hidden rounded-3xl bg-white border border-black/5 p-8 md:p-10 hover:shadow-[0_30px_60px_-30px_rgba(25,10,47,0.35)] transition-all duration-500"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-brand-red/5 to-brand-gold/5" />
              <div className="relative flex items-start justify-between mb-8">
                <span className="text-6xl md:text-7xl font-display font-bold text-ink/10 group-hover:text-gradient transition-colors">
                  {n}
                </span>
                <div className="h-14 w-14 rounded-2xl bg-ink text-white flex items-center justify-center group-hover:bg-gradient-brand transition-all duration-500">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="fluid-h3 mb-3">{title}</h3>
              <p className="text-ink-soft mb-6">{desc}</p>
              <ul className="flex flex-wrap gap-2">
                {items.map((i) => (
                  <li key={i} className="text-xs px-3 py-1.5 rounded-full bg-lavender text-ink/80">
                    {i}
                  </li>
                ))}
              </ul>
              <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURED SERVICES (6 cards) ---------- */
function FeaturedServices() {
  const featured = [
    {
      icon: Code2,
      name: "Web Design & Development",
      value: "Editorial marketing sites that convert.",
      link: "/services/web-design-development",
    },
    {
      icon: Layers,
      name: "Custom Web Applications",
      value: "Internal tools and platforms, built to scale.",
      link: "/services/web-applications",
    },
    {
      icon: Cpu,
      name: "SaaS Product Development",
      value: "End-to-end product engineering.",
      link: "/services/saas-development",
    },
    {
      icon: Bot,
      name: "AI Automations",
      value: "Practical automation with measurable ROI.",
      link: "/services/ai-automations",
    },
    {
      icon: Search,
      name: "Search Engine Optimization",
      value: "Technical and editorial SEO combined.",
      link: "/services/seo",
    },
    {
      icon: Megaphone,
      name: "Paid Media & Growth",
      value: "Multi-channel acquisition that compounds.",
      link: "/services/paid-advertising",
    },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Featured services</p>
            <h2 className="fluid-h2">Six capabilities we deliver at senior level.</h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink group"
          >
            View all services{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map(({ icon: Icon, name, value, link }) => (
            <Link
              to={link}
              key={name}
              data-reveal
              className="group relative rounded-2xl border border-black/10 p-6 md:p-8 bg-white hover:-translate-y-1 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-gradient pointer-events-none" />
              <div className="h-12 w-12 rounded-xl bg-lavender group-hover:bg-gradient-brand text-ink group-hover:text-white flex items-center justify-center mb-6 transition-all duration-500">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{name}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{value}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:text-gradient">
                Explore service <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURED WORK ---------- */
function FeaturedWork() {
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="container-page">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow mb-4">Selected work</p>
          <h2 className="fluid-h2">Digital systems built to create measurable impact.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies.slice(0, 4).map((c, i) => (
            <Link
              to="/work/$slug"
              params={{ slug: c.slug }}
              key={c.slug}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
              className="group relative overflow-hidden rounded-3xl bg-ink text-white p-8 md:p-10 min-h-[420px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-500"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-brand-red/25 via-transparent to-brand-gold/20" />
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-brand opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700" />
              <MockupVisual index={i} />
              <div className="relative">
                <p className="eyebrow text-white/60">
                  {c.category} · {c.client}
                </p>
                <h3 className="mt-3 text-2xl md:text-3xl font-semibold leading-tight">{c.name}</h3>
                <p className="mt-3 text-white/70 text-sm max-w-md">{c.challenge}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {c.services.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-gradient">
                  View case study{" "}
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MockupVisual({ index }: { index: number }) {
  return (
    <div className="relative flex-1 mb-6">
      <div className="glass-card rounded-2xl p-3 max-w-[85%] transform group-hover:-translate-y-1 transition-transform duration-500">
        <div className="flex gap-1.5 mb-2">
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-2 rounded-full bg-white/30" />
        </div>
        <div className="space-y-2">
          <div className="h-2 rounded bg-gradient-brand w-1/3 opacity-80" />
          <div className="h-2 rounded bg-white/10 w-2/3" />
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded ${i === index % 6 ? "bg-gradient-brand opacity-70" : "bg-white/10"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- AUTOMATION SPOTLIGHT ---------- */
function AutomationSpotlight() {
  const steps = [
    "Lead Captured",
    "AI Qualification",
    "CRM Update",
    "Team Notification",
    "Appointment Scheduled",
    "Reporting Dashboard",
  ];
  return (
    <section className="section-dark grid-noise py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(254,52,52,0.2),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(253,190,2,0.14),transparent_60%)]" />
      <div className="container-page relative">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow text-white/60 mb-4">AI Automation</p>
          <h2 className="fluid-h2 text-white">
            Automation that works while your team{" "}
            <span className="text-gradient">focuses on growth.</span>
          </h2>
          <p className="mt-6 text-white/70 text-lg">
            We design AI agents, workflow automations, CRM syncs, appointment engines, document
            processing, reporting systems, and internal knowledge assistants — all built around how
            your business actually operates.
          </p>
        </div>

        <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
          <ol className="grid md:grid-cols-6 gap-4 relative">
            <div className="hidden md:block absolute top-6 left-8 right-8 h-px bg-gradient-brand opacity-40" />
            {steps.map((s, i) => (
              <li
                key={s}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
                className="relative"
              >
                <div className="relative z-10 h-12 w-12 mx-auto md:mx-0 rounded-full bg-ink border border-white/20 flex items-center justify-center text-white text-sm font-semibold">
                  <span
                    className="absolute inset-0 rounded-full bg-gradient-brand opacity-40 blur animate-pulse-glow"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                  <span className="relative">{i + 1}</span>
                </div>
                <p className="mt-4 text-sm text-white/90 font-semibold text-center md:text-left">
                  {s}
                </p>
                <p className="text-xs text-white/50 mt-1 text-center md:text-left">
                  {
                    [
                      "Any inbound source",
                      "AI scoring & routing",
                      "Enriched & synced",
                      "Right person, right context",
                      "Booked automatically",
                      "Live, always",
                    ][i]
                  }
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/services/$slug" params={{ slug: "ai-automations" }} className="btn-primary">
            Explore AI Automations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- PROCESS ---------- */
function ProcessSection() {
  const steps = [
    {
      n: "01",
      title: "Discover",
      body: "Understand the business, users, objectives, systems, and opportunities.",
    },
    {
      n: "02",
      title: "Strategize",
      body: "Define the roadmap, technical architecture, marketing plan, and success criteria.",
    },
    {
      n: "03",
      title: "Design",
      body: "Create user journeys, wireframes, visual systems, and interactive prototypes.",
    },
    {
      n: "04",
      title: "Build",
      body: "Develop, integrate, test, optimize, and prepare for launch.",
    },
    {
      n: "05",
      title: "Scale",
      body: "Improve through data, automation, campaigns, and continuous development.",
    },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="max-w-2xl mb-16">
          <p className="eyebrow mb-4">How we work</p>
          <h2 className="fluid-h2">From complexity to clarity.</h2>
        </div>
        <div className="grid md:grid-cols-5 gap-4 relative">
          <div className="hidden md:block absolute top-8 left-4 right-4 h-px bg-gradient-brand opacity-30" />
          {steps.map((s, i) => (
            <div
              key={s.n}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
              className="relative rounded-2xl border border-black/10 bg-white p-6 hover:border-black/30 transition-colors"
            >
              <div className="text-sm font-bold text-gradient mb-4">{s.n}</div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WHY LOGICSIFY ---------- */
function WhyLogicsify() {
  const items = [
    {
      icon: LineChart,
      title: "Business-first technology",
      body: "We start with business outcomes, not tools. Everything ladders back to a metric.",
    },
    {
      icon: Palette,
      title: "Design and development together",
      body: "One team, one system. No design-to-dev handoff friction, no lost intent.",
    },
    {
      icon: Megaphone,
      title: "Marketing built into the product",
      body: "SEO, analytics, and lifecycle hooks are architected from day one.",
    },
    {
      icon: Workflow,
      title: "Automation around real operations",
      body: "We design for how your team actually works, then automate the seams.",
    },
  ];
  return (
    <section className="py-24 md:py-32 bg-lavender">
      <div className="container-page grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-4">Why Logicsify</p>
          <h2 className="fluid-h2 mb-8">One partner. One connected strategy.</h2>
          <div className="relative aspect-square max-w-md">
            <ConnectedSystemsVisual />
          </div>
        </div>
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              data-reveal
              className="rounded-2xl bg-white border border-black/5 p-6 hover:shadow-[0_20px_40px_-20px_rgba(25,10,47,0.2)] transition"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-brand text-white flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConnectedSystemsVisual() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <linearGradient id="cs-line" x1="0" x2="1">
          <stop offset="0" stopColor="#FE3434" />
          <stop offset="1" stopColor="#FDBE02" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="42" fill="url(#cs-line)" />
      <circle
        cx="200"
        cy="200"
        r="60"
        fill="none"
        stroke="url(#cs-line)"
        strokeWidth="1"
        opacity="0.5"
      />
      {[
        [60, 80, "Design"],
        [340, 80, "Data"],
        [60, 320, "Growth"],
        [340, 320, "AI"],
        [60, 200, "Ops"],
        [340, 200, "Product"],
      ].map(([x, y, label], i) => (
        <g key={i}>
          <line
            x1="200"
            y1="200"
            x2={x as number}
            y2={y as number}
            stroke="url(#cs-line)"
            strokeWidth="1"
            opacity="0.35"
          />
          <circle cx={x as number} cy={y as number} r="26" fill="#190A2F" />
          <circle
            cx={x as number}
            cy={y as number}
            r="26"
            fill="none"
            stroke="url(#cs-line)"
            strokeWidth="1"
            opacity="0.6"
          />
          <text
            x={x as number}
            y={(y as number) + 4}
            textAnchor="middle"
            fontSize="10"
            fill="#fff"
            fontFamily="Inter"
          >
            {label as string}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- TECH STACK ---------- */
function TechStack() {
  const stacks = [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "Laravel",
    "WordPress",
    "Shopify",
    "Supabase",
    "PostgreSQL",
    "AWS",
    "Vercel",
    "OpenAI",
    "Anthropic",
    "Gemini",
    "LangChain",
    "n8n",
    "Make",
    "Zapier",
    "GoHighLevel",
    "HubSpot",
    "GA4",
    "Google Ads",
    "Meta Ads",
  ];
  const doubled = [...stacks, ...stacks];
  return (
    <section className="py-24 md:py-32">
      <div className="container-page mb-12">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Technology</p>
          <h2 className="fluid-h2">A modern stack, applied with intent.</h2>
          <p className="mt-4 text-ink-soft">
            Frontend, backend, mobile, cloud, AI, and growth tools we use every day. We pick tools
            that fit the problem — not the trend.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden py-4 border-y border-black/10 bg-cream">
        <div className="flex gap-4 whitespace-nowrap animate-marquee">
          {doubled.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 bg-white text-ink text-sm font-medium"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden py-4 border-b border-black/10 bg-cream">
        <div
          className="flex gap-4 whitespace-nowrap animate-marquee"
          style={{ animationDirection: "reverse", animationDuration: "50s" }}
        >
          {[...doubled].reverse().map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 bg-white text-ink text-sm font-medium"
            >
              <Database className="w-3.5 h-3.5 text-brand-red" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- INDUSTRIES ---------- */
function IndustriesGrid() {
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="container-page">
        <div className="max-w-2xl mb-16">
          <p className="eyebrow mb-4">Industries</p>
          <h2 className="fluid-h2">Sectors where we deliver senior-level work.</h2>
        </div>
        <div className="grid md:grid-cols-6 gap-5">
          {industries.map((ind, i) => (
            <Link
              to="/industries/$slug"
              params={{ slug: ind.slug }}
              key={ind.slug}
              data-reveal
              className={`group relative overflow-hidden rounded-2xl bg-white border border-black/5 p-6 md:p-8 hover:shadow-[0_20px_50px_-20px_rgba(25,10,47,0.25)] transition-all ${
                i === 0
                  ? "md:col-span-3 md:row-span-2 md:min-h-[380px] bg-ink text-white"
                  : i === 1
                    ? "md:col-span-3"
                    : i === 3
                      ? "md:col-span-4"
                      : "md:col-span-2"
              }`}
            >
              <div
                className={`inline-block text-[10px] uppercase tracking-widest ${i === 0 ? "text-white/60" : "text-ink-soft"} mb-3`}
              >
                {ind.tag}
              </div>
              <h3
                className={`text-2xl md:text-3xl font-semibold ${i === 0 ? "text-white" : "text-ink"} mb-3`}
              >
                {ind.name}
              </h3>
              <p className={`text-sm ${i === 0 ? "text-white/70" : "text-ink-soft"} max-w-md`}>
                {ind.desc}
              </p>
              <div
                className={`mt-6 inline-flex items-center gap-1 text-sm font-semibold ${i === 0 ? "text-white" : "text-ink"} group-hover:text-gradient`}
              >
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIAL FRAMEWORK ---------- */
function TestimonialSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow mb-4">Voices</p>
          <h2 className="fluid-h2">Client stories, coming soon.</h2>
          <p className="mt-4 text-ink-soft">
            This carousel is designed to plug into a CMS. Approved client testimonials will appear
            here.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <blockquote
              key={i}
              className="rounded-2xl border border-dashed border-ink/15 p-8 bg-white"
            >
              <MessageSquare className="w-5 h-5 text-brand-red mb-4" />
              <p className="text-lg text-ink/60 italic leading-relaxed">
                "[ Testimonial placeholder — client-approved quote will appear here. ]"
              </p>
              <footer className="mt-6 text-sm">
                <p className="font-semibold text-ink/70">[ Client Name ]</p>
                <p className="text-ink-soft">[ Position ], [ Company ] · [ Project Type ]</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- INSIGHTS ---------- */
function InsightsSection() {
  return (
    <section className="py-24 md:py-32 bg-lavender">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Insights</p>
            <h2 className="fluid-h2">Thinking on technology, AI, and growth.</h2>
          </div>
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink group"
          >
            All insights <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {insights.map((post) => (
            <Link
              to="/insights/$slug"
              params={{ slug: post.slug }}
              key={post.slug}
              data-reveal
              className="group rounded-2xl bg-white border border-black/5 overflow-hidden hover:-translate-y-1 transition-all duration-500"
            >
              <div className="aspect-[16/10] bg-ink relative overflow-hidden">
                <div className="absolute inset-0 grid-noise opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-16 h-16 text-white/20 group-hover:text-brand-gold transition-colors" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-ink-soft mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-lavender text-ink">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                  <span>· {post.read}</span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-gradient transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
