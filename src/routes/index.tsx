import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  Play,
  Quote,
  Workflow,
  Search,
  Megaphone,
} from "lucide-react";
import { coreServices, otherServices } from "@/lib/site-data";
import {
  getCmsContentList,
  getPublicSiteSettings,
  getPublicTeamMembers,
  type CmsContentItem,
  type PublicTeamMember,
  type Partner,
} from "@/lib/logicsify-api";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { engagementModels } from "@/lib/expansion-data";
import { trackAnalytics } from "@/lib/analytics";
import { BrandMarkImage } from "@/components/brand-mark";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Logicsify | AI Automation, CRM & Custom Business Platforms" },
      {
        name: "description",
        content:
          "Logicsify builds AI-powered sales, customer service, CRM, website, portal, CMS, and business operations systems.",
      },
      {
        property: "og:title",
        content: "Logicsify | Build Smarter. Grow Faster. Automate Everything.",
      },
      {
        property: "og:description",
        content: "We build AI-powered sales, customer service, and business operations systems.",
      },
      { property: "og:url", content: "https://logicsify.com/" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/" }],
  }),
});

function HomePage() {
  return (
    <SiteLayout>
      <div className="contents" data-cms-section-id="home-hero">
        <Hero />
      </div>
      <div className="contents" data-cms-section-id="home-trust-strip">
        <TrustStrip />
      </div>
      <div className="contents" data-cms-section-id="home-partners">
        <PartnersSection />
      </div>
      <div className="contents" data-cms-section-id="home-introduction">
        <Introduction />
      </div>
      <div className="contents" data-cms-section-id="home-services">
        <HomeServices />
      </div>
      <div className="contents" data-cms-section-id="home-featured-work">
        <FeaturedWork />
      </div>
      <div className="contents" data-cms-section-id="home-automation">
        <AutomationSpotlight />
      </div>
      <div className="contents" data-cms-section-id="home-process">
        <ProcessSection />
      </div>
      <div className="contents" data-cms-section-id="home-why-logicsify">
        <WhyLogicsify />
      </div>
      <div className="contents" data-cms-section-id="home-integrations">
        <SystemsWeIntegrate />
      </div>
      <div className="contents" data-cms-section-id="home-engagement-models">
        <EngagementModelsPreview />
      </div>
      <div className="contents" data-cms-section-id="home-estimator">
        <EstimatorPreview />
      </div>
      <div className="contents" data-cms-section-id="home-team">
        <TeamCredibility />
      </div>
      <div className="contents" data-cms-section-id="home-testimonials">
        <TestimonialSection />
      </div>
      <div className="contents" data-cms-section-id="home-insights">
        <InsightsSection />
      </div>
      <div className="contents" data-cms-section-id="home-resources">
        <ResourcesPreview />
      </div>
      <div className="contents" data-cms-section-id="home-cta">
        <CTASection />
      </div>
    </SiteLayout>
  );
}

function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  useEffect(() => {
    let active = true;
    getPublicSiteSettings()
      .then((settings) => {
        if (active)
          setPartners(
            (settings.partners || []).filter(
              (partner) => partner.status === "published" && partner.name && partner.logo_url,
            ),
          );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  if (!partners.length) return null;
  return (
    <section className="border-b border-black/5 bg-white py-14">
      <div className="container-page">
        <div className="text-center">
          <p className="eyebrow">Partners</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Organizations we work alongside
          </h2>
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {partners.map((partner) => {
            const logo = (
              <img
                src={partner.logo_url}
                alt={`${partner.name} logo`}
                width={170}
                height={48}
                loading="lazy"
                decoding="async"
                className="max-h-12 max-w-[170px] object-contain grayscale transition duration-300 group-hover:grayscale-0"
              />
            );
            const classes =
              "group grid h-24 min-w-[180px] place-items-center rounded-2xl border border-black/5 bg-cream px-7 transition hover:-translate-y-0.5 hover:border-brand-red/20 hover:bg-white hover:shadow-lg";
            return partner.link_enabled && partner.website_url ? (
              <a
                key={partner.id}
                href={partner.website_url}
                target="_blank"
                rel="noreferrer"
                className={classes}
                aria-label={`Visit ${partner.name}`}
              >
                {logo}
              </a>
            ) : (
              <div key={partner.id} className={classes}>
                {logo}
              </div>
            );
          })}
        </div>
      </div>
    </section>
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
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/80 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            AI · CRM · Platforms · Operations
          </div>
          <h1 className="fluid-display text-white hero-heading-wrap">
            <span className="block">Build Connected.</span>
            <span className="block">Respond Faster.</span>
            <span className="block text-gradient">Operate Smarter.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            We build AI-powered sales, customer service, and business operations systems that reduce
            manual work, improve lead response, and keep customer data connected.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/contact"
              onClick={() =>
                trackAnalytics("technical_roadmap_cta_clicked", { placement: "homepage_hero" })
              }
              className="btn-primary"
            >
              Discuss Your Project <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/services" className="btn-ghost-dark">
              Explore Our Services
            </Link>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-white/50">
            AI Agents · CRM Operations · Websites · Portals · CMS Platforms
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
  const nodes = [
    [200, 40],
    [340, 120],
    [340, 280],
    [200, 360],
    [60, 280],
    [60, 120],
  ] as const;

  return (
    <div className="relative aspect-square max-w-[520px] mx-auto">
      <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
      <div
        className="absolute inset-8 rounded-full border border-white/10 animate-spin-slow"
        style={{ animationDirection: "reverse", animationDuration: "24s" }}
      />
      <div
        className="absolute inset-20 rounded-full border border-white/10 animate-spin-slow"
        style={{ animationDuration: "18s" }}
      />

      <svg viewBox="0 0 400 400" className="absolute inset-0 z-10 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id="node-line" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--theme-primary-start)" />
            <stop offset="100%" stopColor="var(--theme-primary-end)" />
          </linearGradient>
        </defs>
        {nodes.map(([x, y], i) => (
          <g key={i}>
            <line
              x1="200"
              y1="200"
              x2={x}
              y2={y}
              stroke="url(#node-line)"
              strokeWidth="1.5"
              opacity="0.62"
              strokeDasharray="5 7"
            />
            <circle cx={x} cy={y} r="6" fill="url(#node-line)" opacity="0.95" />
            <circle cx={x} cy={y} r="12" fill="none" stroke="url(#node-line)" opacity="0.45" />
          </g>
        ))}
      </svg>

      <div className="absolute inset-1/3 z-20 rounded-full bg-gradient-brand animate-pulse-glow blur-xl opacity-70" />
      <div className="absolute left-1/2 top-1/2 z-30 grid h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[var(--shadow-glow)]">
        <BrandMarkImage
          alt=""
          width={150}
          height={150}
          decoding="async"
          className="h-12 w-12 object-contain"
        />
      </div>

      <div className="absolute -top-4 -right-4 z-40 glass-card rounded-2xl px-4 py-3 text-xs text-white animate-float">
        <p className="text-white/60 text-[10px] uppercase tracking-widest">Automation</p>
        <p className="mt-1 font-semibold">Lead qualified → CRM</p>
      </div>
      <div
        className="absolute -bottom-2 -left-4 z-40 glass-card rounded-2xl px-4 py-3 text-xs text-white animate-float"
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
          AI conversations, CRM workflows, digital platforms, payments, and reporting —{" "}
          <span className="text-ink font-semibold">
            connected around the same customer journey.
          </span>
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
          <p className="eyebrow mb-6">How we position the work</p>
          <h2 data-reveal className="fluid-h2">
            We build AI-powered sales, customer service, and{" "}
            <span className="text-gradient">business operations systems.</span>
          </h2>
        </div>
        <div className="lg:col-span-5 lg:pt-24 space-y-6 text-ink-soft leading-relaxed">
          <p data-reveal>
            Missed opportunities usually come from disconnected conversations, lead records,
            websites, calendars, payments, and internal handoffs. The software exists, but the
            operating system between the tools does not.
          </p>
          <p data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
            Logicsify maps the customer and operational workflow first, then builds the AI, CRM,
            website, portal, integration, and reporting layers required to make it work.
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

/* ---------- CORE SERVICES ---------- */
function HomeServices() {
  const [services, setServices] = useState<CmsContentItem[]>([]);
  useEffect(() => {
    let active = true;
    getCmsContentList("service")
      .then((result) => active && setServices(result))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const cmsBySlug = new Map(services.map((item) => [item.slug, item]));
  return (
    <>
      <CoreServicesSection cmsBySlug={cmsBySlug} />
      <OtherServicesSection cmsBySlug={cmsBySlug} />
    </>
  );
}

function CoreServicesSection({ cmsBySlug }: { cmsBySlug: Map<string, CmsContentItem> }) {
  const icons = [Bot, Workflow, Code2];
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="mb-16 max-w-3xl">
          <p className="eyebrow mb-4">Core services</p>
          <h2 className="fluid-h2">AI-Powered Systems Built for Business Growth</h2>
          <p className="mt-5 text-lg leading-8 text-ink-soft">
            From AI agents and CRM automation to custom websites and business platforms, we build
            connected systems that improve sales, service, and operations.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {coreServices.map((service, index) => {
            const Icon = icons[index];
            return (
              <Link
                key={service.slug}
                to={service.route}
                hash={service.hash}
                data-reveal
                className="group relative min-h-[430px] overflow-hidden rounded-3xl bg-ink p-8 text-white transition duration-500 hover:-translate-y-1 md:p-9"
              >
                <div className="absolute inset-0 grid-noise opacity-60" />
                <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-brand-red/20 blur-3xl" />
                <div className="relative flex h-full flex-col">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="eyebrow mt-10 text-white/50">Core service {index + 1}</p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight">
                    {cmsBySlug.get(service.slug)?.title || service.name}
                  </h3>
                  <p className="mt-5 leading-7 text-white/70">
                    {cmsBySlug.get(service.slug)?.excerpt || service.short}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-10 font-semibold">
                    Discuss this system{" "}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/contact" className="btn-primary">
            Discuss Your Project <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/services" className="btn-ghost-light">
            Explore Our Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- OTHER SERVICES ---------- */
function OtherServicesSection({ cmsBySlug }: { cmsBySlug: Map<string, CmsContentItem> }) {
  const display = otherServices.filter((service) =>
    [
      "mobile-app-development",
      "ui-ux-design",
      "seo-digital-marketing",
      "branding",
      "ecommerce-development",
      "cloud-deployment",
      "website-maintenance",
      "cybersecurity",
      "staff-augmentation",
    ].includes(service.slug),
  );
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-4">Other services</p>
          <h2 className="fluid-h2">Specialist support around the core systems.</h2>
          <p className="mt-5 text-lg text-ink-soft">
            These services support a wider engagement when the operating problem requires them.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((service) => (
            <Link
              key={service.slug}
              to={service.route}
              hash={service.hash}
              className="group rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold">
                {cmsBySlug.get(service.slug)?.title || service.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                {cmsBySlug.get(service.slug)?.excerpt || service.short}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PORTFOLIO ---------- */
function FeaturedWork() {
  const [items, setItems] = useState<CmsContentItem[]>([]);
  useEffect(() => {
    let active = true;
    getCmsContentList("case_study")
      .then((result) => {
        if (!active) return;
        setItems([...result.filter((item) => item.featured), ...result.filter((item) => !item.featured)]);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  if (!items.length) return null;

  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Portfolio</p>
            <h2 className="fluid-h2">Real systems built around real operating problems.</h2>
            <p className="mt-5 text-lg leading-8 text-ink-soft">Selected projects across AI automation, CRM operations, websites, portals, CMS platforms, integrations, and digital products.</p>
          </div>
          <Link to="/$slug" params={{ slug: "portfolio" }} className="btn-ghost-dark shrink-0">
            View portfolio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {items.slice(0, 4).map((item, index) => {
            const content = item.content_json || {};
            const services = Array.isArray(content.services) ? content.services.map(String) : [];
            return (
              <Link
                to="/work/$slug"
                params={{ slug: item.slug }}
                key={item.slug}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}
                className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl bg-ink p-8 text-white transition-transform duration-500 hover:scale-[1.01] md:p-10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-red/25 via-transparent to-brand-gold/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {item.featured_image ? (
                  <img
                    src={item.featured_image}
                    alt=""
                    loading="lazy"
                    className="relative mb-8 aspect-[16/9] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <MockupVisual index={index} />
                )}
                <div className="relative">
                  <p className="eyebrow text-white/60">
                    {[String(content.industry || ""), String(content.client_name || "")]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm text-white/70">{item.excerpt}</p>
                  {services.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {services.slice(0, 4).map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] uppercase tracking-wider"
                        >
                          {service.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold group-hover:text-gradient">
                    View project <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
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
      <div className="absolute inset-0 brand-radial-glow-soft" />
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
          <div className="relative">
            <div className="hidden md:block absolute top-6 left-8 right-8 h-px bg-gradient-brand opacity-40" />
            <ol className="grid md:grid-cols-6 gap-4 relative">
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
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/automation-lab" className="btn-primary">
            Try the Automation Lab <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/services/$slug" params={{ slug: "ai-automations" }} className="btn-ghost-dark">
            Explore AI Automations
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
              className="rounded-2xl bg-white border border-black/5 p-6 hover:shadow-[var(--shadow-card)] transition"
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
  const nodes = [
    { x: 200, y: 54, label: "Data" },
    { x: 326, y: 127, label: "Product" },
    { x: 326, y: 273, label: "AI" },
    { x: 200, y: 346, label: "Growth" },
    { x: 74, y: 273, label: "Ops" },
    { x: 74, y: 127, label: "Design" },
  ];

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="cs-line" x1="0" x2="1">
            <stop offset="0" stopColor="var(--theme-primary-start)" />
            <stop offset="1" stopColor="var(--theme-primary-end)" />
          </linearGradient>
        </defs>
        <polygon
          points={nodes.map((node) => `${node.x},${node.y}`).join(" ")}
          fill="none"
          stroke="url(#cs-line)"
          strokeWidth="1"
          opacity="0.18"
        />
        {nodes.map(({ x, y, label }) => (
          <g key={label}>
            <line
              x1="200"
              y1="200"
              x2={x}
              y2={y}
              stroke="url(#cs-line)"
              strokeWidth="1.4"
              opacity="0.48"
            />
            <circle cx={x} cy={y} r="27" fill="var(--theme-dark)" />
            <circle
              cx={x}
              cy={y}
              r="27"
              fill="none"
              stroke="url(#cs-line)"
              strokeWidth="1.2"
              opacity="0.7"
            />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="#fff" fontFamily="Inter">
              {label}
            </text>
          </g>
        ))}
        <circle
          cx="200"
          cy="200"
          r="61"
          fill="var(--theme-surface)"
          stroke="url(#cs-line)"
          strokeWidth="1"
          opacity="0.98"
        />
        <circle cx="200" cy="200" r="43" fill="url(#cs-line)" />
      </svg>
      <div className="absolute left-1/2 top-1/2 z-10 grid h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full">
        <BrandMarkImage
          alt=""
          width={150}
          height={150}
          loading="lazy"
          decoding="async"
          className="h-9 w-9 object-contain brightness-0 invert"
        />
      </div>
    </div>
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

/* ---------- TESTIMONIAL FRAMEWORK ---------- */
type TestimonialData = {
  clientName: string;
  role: string;
  company: string;
  projectType: string;
  quote: string;
  type: "text" | "video";
  videoUrl: string;
  poster: string;
  image: string;
};

function testimonialData(item: CmsContentItem): TestimonialData {
  const content = item.content_json || {};
  return {
    clientName: String(content.client_name || item.title || "Client"),
    role: String(content.role || ""),
    company: String(content.company || ""),
    projectType: String(content.project_type || ""),
    quote: String(content.quote || item.excerpt || content.body || ""),
    type: String(content.testimonial_type || "text") === "video" ? "video" : "text",
    videoUrl: String(content.video_url || ""),
    poster: String(content.video_poster || item.featured_image || ""),
    image: String(content.client_image || item.featured_image || ""),
  };
}

function videoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname === "youtu.be")
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
  } catch {
    return "";
  }
  return "";
}

function TestimonialSection() {
  const [items, setItems] = useState<CmsContentItem[]>([]);

  useEffect(() => {
    let active = true;
    void getCmsContentList("testimonial").then((result) => {
      if (active) setItems(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const testimonials = useMemo(
    () => items.map(testimonialData).filter((item) => item.quote || item.videoUrl),
    [items],
  );
  if (!testimonials.length) return null;

  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow mb-4">Voices</p>
          <h2 className="fluid-h2">What clients say after the work ships.</h2>
          <p className="mt-4 text-ink-soft">
            Published testimonials are managed from the Logicsify admin panel.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => {
            const embedUrl = videoEmbedUrl(testimonial.videoUrl);
            const hostedVideo = testimonial.videoUrl && !embedUrl;
            return (
              <article
                key={`${testimonial.clientName}-${index}`}
                className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[var(--shadow-card)]"
              >
                {testimonial.type === "video" && testimonial.videoUrl ? (
                  <div className="relative aspect-video overflow-hidden bg-ink">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={`${testimonial.clientName} video testimonial`}
                        className="h-full w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : hostedVideo ? (
                      <video
                        className="h-full w-full object-cover"
                        controls
                        preload="metadata"
                        poster={testimonial.poster || undefined}
                      >
                        <source src={testimonial.videoUrl} />
                      </video>
                    ) : null}
                    {!embedUrl && !hostedVideo && testimonial.poster ? (
                      <img src={testimonial.poster} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                ) : null}
                <div className="p-7 md:p-8">
                  <Quote className="mb-5 h-7 w-7 text-brand-red" />
                  {testimonial.quote ? (
                    <blockquote className="text-lg leading-relaxed text-ink">
                      “{testimonial.quote}”
                    </blockquote>
                  ) : null}
                  <footer className="mt-7 flex items-center gap-3">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.clientName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                        {testimonial.clientName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-ink">{testimonial.clientName}</p>
                      <p className="text-sm text-ink-soft">
                        {[testimonial.role, testimonial.company, testimonial.projectType]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </footer>
                  {testimonial.type === "video" && testimonial.videoUrl ? (
                    <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-red">
                      <Play className="h-3.5 w-3.5" /> Video testimonial
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- INSIGHTS ---------- */
function InsightsSection() {
  const [items, setItems] = useState<CmsContentItem[]>([]);
  useEffect(() => {
    let active = true;
    getCmsContentList("insight")
      .then((result) => active && setItems(result))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  if (!items.length) return null;
  return (
    <section className="bg-lavender py-24 md:py-32">
      <div className="container-page">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Insights</p>
            <h2 className="fluid-h2">Practical thinking on software, automation, and growth.</h2>
          </div>
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
          >
            All insights <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.slice(0, 3).map((post) => (
            <Link
              to="/insights/$slug"
              params={{ slug: post.slug }}
              key={post.slug}
              data-reveal
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white transition-all duration-500 hover:-translate-y-1"
            >
              <div className="aspect-[16/10] bg-ink">
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <Zap className="h-14 w-14 text-white/20" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center gap-3 text-xs text-ink-soft">
                  <span className="rounded-full bg-lavender px-2.5 py-1 text-ink">
                    {String(post.content_json?.category || "Insight")}
                  </span>
                  <span>{String(post.content_json?.reading_time || "")}</span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-gradient">{post.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function EngagementModelsPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-4">Engagement models</p>
          <h2 className="fluid-h2">Choose a delivery model that matches the work.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {engagementModels.map((model) => (
            <article
              id={model.slug}
              key={model.slug}
              className="rounded-2xl border border-black/5 bg-white p-6"
            >
              <h3 className="text-xl font-semibold text-ink">{model.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{model.bestFor}</p>
              <Link
                to="/engagement-models"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink"
              >
                View model <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EstimatorPreview() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="grid items-center gap-10 rounded-3xl bg-ink p-8 text-white md:grid-cols-[1.2fr_.8fr] md:p-12">
          <div>
            <p className="eyebrow mb-4 text-white/60">Project estimator</p>
            <h2 className="fluid-h2 text-white">
              Turn an idea into a rough scope before discovery.
            </h2>
            <p className="mt-5 max-w-2xl text-white/70">
              Select the service, features, integrations, timeline, and budget. The result is a
              planning guide, not a binding quote.
            </p>
          </div>
          <div className="md:text-right">
            <Link to="/project-estimator" className="btn-primary">
              Build a rough scope <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamCredibility() {
  const [team, setTeam] = useState<PublicTeamMember[]>([]);
  useEffect(() => {
    let active = true;
    getPublicTeamMembers("home")
      .then((items) => active && setTeam(items))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  if (!team.length) return null;
  return (
    <section id="team" className="py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-4">Operating credibility</p>
          <h2 className="fluid-h2">The people responsible for the work.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.slice(0, 4).map((member) => (
            <article key={member.slug} className="rounded-2xl border border-black/5 bg-white p-5">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.display_name}
                  loading="lazy"
                  className="mb-5 aspect-square w-full rounded-xl object-cover object-top"
                />
              ) : null}
              <h3 className="text-lg font-semibold">{member.display_name}</h3>
              {member.headline ? (
                <p className="mt-1 text-sm text-ink-soft">{member.headline}</p>
              ) : null}
              {member.locations.length ? (
                <p className="mt-3 text-xs text-ink-soft">
                  {member.locations.map((location) => location.name).join(" · ")}
                </p>
              ) : null}
              {member.address ? (
                <p className="mt-3 whitespace-pre-line text-xs leading-5 text-ink-soft">
                  {member.address}
                </p>
              ) : null}
              {member.connect_enabled ? (
                <Link
                  to="/connect/$slug"
                  params={{ slug: member.slug }}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                >
                  Connect <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
        <Link to="/about" hash="team" className="mt-8 inline-flex items-center gap-2 font-semibold">
          Meet the team <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ResourcesPreview() {
  const [items, setItems] = useState<CmsContentItem[]>([]);
  useEffect(() => {
    let active = true;
    getCmsContentList("resource")
      .then((value) => active && setItems(value))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  if (!items.length) return null;
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">Guides</p>
            <h2 className="fluid-h2">
              Downloadable planning tools for better technical decisions.
            </h2>
          </div>
          <Link to="/guides" className="hidden items-center gap-2 font-semibold md:inline-flex">
            View guides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((item) => (
            <Link
              to="/guides/$slug"
              params={{ slug: item.slug }}
              key={item.slug}
              className="rounded-2xl border border-black/5 bg-white p-6 hover:shadow-lg"
            >
              <span className="text-xs uppercase tracking-widest text-brand-red">
                {String(item.content_json?.file_type || "Resource")}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{item.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
