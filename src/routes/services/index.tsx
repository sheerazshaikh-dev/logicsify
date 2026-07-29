import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { coreServices, otherServices } from "@/lib/site-data";
import { getCmsContentList, type CmsContentItem } from "@/lib/logicsify-api";

export const Route = createFileRoute("/services/")({
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async () => {
    const [services, caseStudies] = await Promise.all([
      getCmsContentList("service"),
      getCmsContentList("case_study"),
    ]);
    return { services, caseStudies: caseStudies.slice(0, 3) };
  },
  component: ServicesOverview,
  head: () => ({
    meta: [
      { title: "AI Automation, CRM & Custom Business Platforms | Logicsify" },
      {
        name: "description",
        content:
          "Logicsify builds AI-powered sales, customer service, CRM, website, portal, CMS, payment, and business operations systems.",
      },
      { property: "og:title", content: "AI-Powered Business Systems | Logicsify" },
      {
        property: "og:description",
        content: "AI automation, revenue operations, and custom digital platforms built as connected business systems.",
      },
      { property: "og:url", content: "https://logicsify.com/services" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/services" }],
  }),
});

const otherIcons: Record<string, typeof Smartphone> = {
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
  const { services, caseStudies } = Route.useLoaderData();
  const cmsBySlug = new Map(services.map((item) => [item.slug, item]));

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

      <section className="py-24 md:py-32">
        <div className="container-page">
          <div className="mb-14 max-w-3xl">
            <p className="eyebrow mb-4">Core services</p>
            <h2 className="fluid-h2">Three connected systems that improve sales, service, and operations.</h2>
            <p className="mt-5 text-lg leading-8 text-ink-soft">
              Each core engagement can stand alone, but the strongest results come when conversations, lead management, digital experiences, payments, analytics, and administration share one operating model.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {coreServices.map((service, index) => {
              const cms = cmsBySlug.get(service.slug);
              const Icon = [Bot, LayoutDashboard, Code2][index];
              return (
                <Link
                  key={service.slug}
                  to={service.route}
                  hash={service.hash}
                  data-reveal
                  className="group relative min-h-[470px] overflow-hidden rounded-3xl border border-white/10 bg-ink p-8 text-white shadow-[0_28px_80px_-38px_rgba(25,10,47,.75)] transition duration-500 hover:-translate-y-1 md:p-9"
                >
                  <div className="absolute inset-0 grid-noise opacity-60" />
                  <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl transition group-hover:bg-brand-gold/30" />
                  <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-brand-red/20 blur-3xl" />
                  <div className="relative flex h-full flex-col">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand shadow-[0_12px_35px_-12px_rgba(254,52,52,.9)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="eyebrow mt-10 text-white/55">Core service {index + 1}</p>
                    <h3 className="mt-4 text-3xl font-semibold leading-tight">{cms?.title || service.name}</h3>
                    <p className="mt-5 leading-7 text-white/72">{cms?.excerpt || service.short}</p>
                    <div className="mt-auto pt-10">
                      <span className="inline-flex items-center gap-2 font-semibold">Explore service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
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
            <p className="mt-5 text-lg text-ink-soft">These capabilities support delivery when the project requires them. They remain secondary to AI automation, revenue operations, and connected digital platforms.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((service) => {
              const Icon = otherIcons[service.slug] || Code2;
              return (
                <Link key={service.slug} to={service.route} hash={service.hash} className="group rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-lavender"><Icon className="h-4 w-4" /></div>
                  <h3 className="text-lg font-semibold">{cmsBySlug.get(service.slug)?.title || service.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{cmsBySlug.get(service.slug)?.excerpt || service.short}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">Learn more <ArrowRight className="h-3.5 w-3.5" /></span>
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
          <p className="mt-6 text-lg leading-8 text-white/70">A website captures intent. The CRM owns the lead. AI and workflow automation respond and route. Payments and calendars complete the action. Analytics and admin systems show what happened.</p>
        </div>
        <div className="relative lg:col-span-7">
          <div className="absolute left-1/2 top-1/2 hidden h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 md:block" />
          <div className="grid gap-4 sm:grid-cols-2">
            {systems.map(([Icon, label], index) => (
              <div key={label} data-reveal className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.055] p-5 backdrop-blur">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand"><Icon className="h-5 w-5 text-white" /></div>
                <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/45">System {index + 1}</p><p className="mt-1 font-semibold text-white">{label}</p></div>
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
    ["01", "Map the operation", "Document leads, conversations, handoffs, systems, ownership, and failure points."],
    ["02", "Design the connected system", "Define data, workflows, interfaces, integrations, permissions, and measurable outcomes."],
    ["03", "Build and test", "Deliver visible iterations with functional, responsive, integration, and failure-path testing."],
    ["04", "Launch and improve", "Deploy with documentation, monitoring, reporting, ownership, and an improvement backlog."],
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 max-w-3xl"><p className="eyebrow mb-4">Process</p><h2 className="fluid-h2">Start with the operating problem, then choose the technology.</h2></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, body]) => <div key={number} className="rounded-2xl border border-black/10 bg-white p-6"><span className="text-sm font-bold text-gradient">{number}</span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-ink-soft">{body}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function SelectedWork({ items }: { items: CmsContentItem[] }) {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 max-w-3xl"><p className="eyebrow mb-4">Selected work</p><h2 className="fluid-h2">Systems applied to real business problems.</h2></div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => <Link key={item.slug} to="/work/$slug" params={{ slug: item.slug }} className="group overflow-hidden rounded-2xl border border-black/10 bg-white">{item.featured_image ? <img src={item.featured_image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" /> : <div className="grid aspect-[16/9] place-items-center bg-ink"><BriefcaseBusiness className="h-10 w-10 text-white/20" /></div>}<div className="p-6"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-ink-soft">{item.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">View project <ArrowRight className="h-4 w-4" /></span></div></Link>)}
        </div>
      </div>
    </section>
  );
}
