import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CloudCog,
  Code2,
  CreditCard,
  Database,
  LayoutDashboard,
  Megaphone,
  Palette,
  PanelsTopLeft,
  PhoneCall,
  Search,
  ShieldCheck,
  Smartphone,
  Workflow,
  Handshake,
  ShieldCheck as WhiteLabelShield,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { coreServiceDefinitions, coreServices, otherServices } from "@/lib/site-data";
import { getCmsContentList, type CmsContentItem } from "@/lib/logicsify-api";

export const Route = createFileRoute("/services/")({
  component: ServicesOverview,
  head: () => ({
    meta: [
      { title: "AI Automation, CRM & Business Platforms | Logicsify" },
      {
        name: "description",
        content:
          "Logicsify builds AI-powered sales, customer service, CRM, website, portal, CMS, payment, and business operations systems.",
      },
      { property: "og:title", content: "AI-Powered Business Systems | Logicsify" },
      {
        property: "og:description",
        content:
          "AI automation, revenue operations, and custom digital platforms built as connected business systems.",
      },
      { property: "og:url", content: "https://logicsify.com/services" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/services" }],
  }),
});

const otherIcons: Record<string, typeof Smartphone> = {
  "white-label-development": Handshake,
  "mobile-app-development": Smartphone,
  "ui-ux-design": Palette,
  "seo-digital-marketing": Megaphone,
  branding: PanelsTopLeft,
  "ecommerce-development": CreditCard,
  "cloud-deployment": CloudCog,
  "website-maintenance": Workflow,
  cybersecurity: ShieldCheck,
  "staff-augmentation": Code2,
};

function ServicesOverview() {
  const [caseStudies, setCaseStudies] = useState<CmsContentItem[]>([]);

  useEffect(() => {
    let active = true;
    getCmsContentList("case_study")
      .then((items) => {
        if (active) setCaseStudies(items.slice(0, 3));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Services"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Services" }]}
        title={
          <>
            AI-powered systems built for <span className="text-gradient">business growth.</span>
          </>
        }
        intro="We build AI-powered sales, customer service, and business operations systems. The three core services below receive our deepest strategic and technical focus."
        primaryCta={{ label: "Discuss Your Project", to: "/contact" }}
        secondaryCta={{ label: "View Our Work", to: "/work" }}
      />

      <WhiteLabelSpotlight />

      <section className="py-24 md:py-32">
        <div className="container-page">
          <div className="mb-14 max-w-3xl">
            <p className="eyebrow mb-4">Core services</p>
            <h2 className="fluid-h2">
              Three connected systems that improve sales, service, and operations.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink-soft">
              Each core engagement can stand alone, but the strongest results come when
              conversations, lead management, digital experiences, payments, analytics, and
              administration share one operating model.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {coreServices.map((service, index) => {
              const Icon = [Bot, LayoutDashboard, Code2][index];
              return (
                <Link
                  key={service.slug}
                  to={service.route}
                  hash={service.hash}
                  data-reveal
                  className="group relative min-h-[470px] overflow-hidden rounded-3xl border border-white/10 bg-ink p-8 text-white shadow-[var(--shadow-card)] transition duration-500 hover:-translate-y-1 md:p-9"
                >
                  <div className="absolute inset-0 grid-noise opacity-60" />
                  <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl transition group-hover:bg-brand-gold/30" />
                  <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-brand-red/20 blur-3xl" />
                  <div className="relative flex h-full flex-col">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand shadow-[var(--shadow-glow)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="eyebrow mt-10 text-white/55">Core service {index + 1}</p>
                    <h3 className="mt-4 text-3xl font-semibold leading-tight">{service.name}</h3>
                    <p className="mt-5 leading-7 text-white/72">{service.short}</p>
                    <ul className="mt-7 space-y-2 border-t border-white/10 pt-6 text-sm text-white/65">
                      {(coreServiceDefinitions[index]?.subservices || [])
                        .slice(0, 4)
                        .map((subservice) => (
                          <li key={subservice.slug} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                            {subservice.name}
                          </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-10">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        Explore service
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <ConnectedEcosystem />

      <section className="bg-cream py-24 md:py-32">
        <div className="container-page">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow mb-4">Other services</p>
            <h2 className="fluid-h2">Specialist support around the core systems.</h2>
            <p className="mt-5 text-lg text-ink-soft">
              These capabilities support delivery when the project requires them. They remain
              secondary to AI automation, revenue operations, and connected digital platforms.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.filter((service) => service.slug !== "white-label-development").map((service) => {
              const Icon = otherIcons[service.slug] || Code2;
              return (
                <Link
                  key={service.slug}
                  to={service.route}
                  hash={service.hash}
                  className="group rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-lavender">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{service.short}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Process />
      <SystemsWeIntegrate />
      {caseStudies.length ? <SelectedWork items={caseStudies} /> : null}
      <CTASection />
    </SiteLayout>
  );
}


function WhiteLabelSpotlight() {
  return (
    <section className="relative overflow-hidden border-b border-black/5 bg-white py-16 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(139,207,60,.16),transparent_34%),radial-gradient(circle_at_12%_85%,rgba(4,166,161,.12),transparent_30%)]" />
      <div className="container-page relative">
        <Link
          to="/services/white-label-development"
          className="group grid overflow-hidden rounded-[2rem] border border-black/10 bg-ink text-white shadow-[var(--shadow-card)] lg:grid-cols-[1.1fr_.9fr]"
        >
          <div className="relative p-8 md:p-12 lg:p-14">
            <div className="absolute inset-0 grid-noise opacity-40" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.18em] text-white/70">
                <Handshake className="h-3.5 w-3.5 text-brand-gold" />
                Flagship service
              </div>
              <h2 className="mt-7 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                Your brand in front. <span className="text-gradient">Our delivery engine behind it.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                White-label development for agencies and consultants that need reliable delivery capacity across websites, SaaS, AI automation, CRM, portals, and custom software.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 font-semibold">
                Explore white-label delivery
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </div>
          <div className="relative min-h-[280px] border-t border-white/10 bg-white/[.035] p-8 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative grid h-full place-items-center">
              <div className="w-full max-w-sm rounded-3xl border border-white/12 bg-black/35 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[.18em] text-white/45">White-label delivery</span>
                  <WhiteLabelShield className="h-4 w-4 text-brand-gold" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                  {["Your agency", "Logicsify", "Your client"].map((label, index) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[.05] p-3">
                      <span className="block text-[10px] text-white/35">0{index + 1}</span>
                      <span className="mt-1 block font-semibold text-white/80">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-gradient-brand transition-all duration-700 group-hover:w-full" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function ConnectedEcosystem() {
  const systems = [
    [PanelsTopLeft, "Website or portal"],
    [Database, "CRM and customer data"],
    [PhoneCall, "AI conversations"],
    [CreditCard, "Payments and booking"],
    [Search, "Analytics and attribution"],
    [LayoutDashboard, "Admin and reporting"],
  ] as const;

  return (
    <section className="section-dark grid-noise py-24 md:py-32">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-4 text-white/55">How our systems work together</p>
          <h2 className="fluid-h2 text-white">One connected business ecosystem.</h2>
          <p className="mt-6 text-lg leading-8 text-white/70">
            A website captures intent. The CRM owns the lead. AI and workflow automation respond
            and route. Payments and calendars complete the action. Analytics and admin systems show
            what happened.
          </p>
        </div>
        <div className="relative lg:col-span-7">
          <div className="absolute left-1/2 top-1/2 hidden h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 md:block" />
          <div className="grid gap-4 sm:grid-cols-2">
            {systems.map(([Icon, label], index) => (
              <div
                key={label}
                data-reveal
                className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.055] p-5 backdrop-blur"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/45">
                    System {index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-white">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    [
      "01",
      "Map the operation",
      "Document leads, conversations, handoffs, systems, ownership, and failure points.",
    ],
    [
      "02",
      "Design the connected system",
      "Define data, workflows, interfaces, integrations, permissions, and measurable outcomes.",
    ],
    [
      "03",
      "Build and test",
      "Deliver visible iterations with functional, responsive, integration, and failure-path testing.",
    ],
    [
      "04",
      "Launch and improve",
      "Deploy with documentation, monitoring, reporting, ownership, and an improvement backlog.",
    ],
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-4">Process</p>
          <h2 className="fluid-h2">
            Start with the operating problem, then choose the technology.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, body]) => (
            <div key={number} className="rounded-2xl border border-black/10 bg-white p-6">
              <span className="text-sm font-bold text-gradient">{number}</span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectedWork({ items }: { items: CmsContentItem[] }) {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-4">Selected work</p>
          <h2 className="fluid-h2">Systems applied to real business problems.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.slug}
              to="/work/$slug"
              params={{ slug: item.slug }}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white"
            >
              {item.featured_image ? (
                <img
                  src={item.featured_image}
                  alt=""
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="grid aspect-[16/9] place-items-center bg-ink">
                  <BriefcaseBusiness className="h-10 w-10 text-white/20" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{item.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                  View project <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
