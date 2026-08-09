import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Database, PlugZap, ShieldCheck, Workflow } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";

export const Route = createFileRoute("/integrations")({
  component: IntegrationsPage,
  head: () => ({
    meta: [
      { title: "Supported Integrations | CRM, AI, Payments & Automation | Logicsify" },
      {
        name: "description",
        content:
          "Explore CRM, AI, payments, communication, development, marketing, and automation platforms Logicsify can connect into business workflows.",
      },
      { property: "og:title", content: "Supported Integrations | Logicsify" },
      {
        property: "og:description",
        content:
          "Platforms and systems Logicsify can connect across sales, customer service, payments, data, marketing, and operations.",
      },
      { property: "og:url", content: "https://logicsify.com/integrations" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/integrations" }],
  }),
});

const principles = [
  {
    icon: Workflow,
    title: "Start with the workflow",
    body: "We map the trigger, data, owner, exception paths, and required result before choosing an integration method.",
  },
  {
    icon: Database,
    title: "Protect the system of record",
    body: "Field mapping, validation, duplicate handling, permissions, and audit requirements are defined before production data moves.",
  },
  {
    icon: ShieldCheck,
    title: "Design for failure",
    body: "Retries, alerts, logs, fallback steps, and human review are considered so one unavailable API does not silently break operations.",
  },
];

function IntegrationsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Supported integrations"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Integrations" }]}
        title={<>Connect the systems your business already <span className="text-gradient">depends on.</span></>}
        intro="We connect CRM, AI, communication, payments, websites, data, marketing, and automation platforms around a defined operating workflow."
        primaryCta={{ label: "Discuss Your Project", to: "/contact" }}
        secondaryCta={{ label: "Explore Automation Demos", to: "/automation-lab" }}
        visual={<IntegrationHeroVisual />}
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Integration approach</p>
            <h2 className="fluid-h2">A connection is useful only when the complete workflow is reliable.</h2>
            <p className="mt-5 text-lg leading-8 text-ink-soft">
              API availability is only one part of the work. A production integration also needs ownership, validation, exception handling, observability, security, and a clear recovery path.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SystemsWeIntegrate />

      <section className="py-20 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">What discovery confirms</p>
            <h2 className="fluid-h2">The account, data, and operational constraints behind the integration.</h2>
          </div>
          <div className="lg:col-span-7">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "Required accounts, plans, permissions, and API access",
                "Source and destination fields, formats, and ownership",
                "Trigger timing, rate limits, retries, and duplicate rules",
                "Security, consent, retention, and audit requirements",
                "Human review, fallback, escalation, and failure alerts",
                "Testing, cutover, monitoring, documentation, and support",
              ].map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-black/10 bg-white p-5 text-sm leading-6 text-ink-soft">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/services/$slug"
              params={{ slug: "custom-ai-integrations" }}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-brand-red"
            >
              Explore Custom AI Integrations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <TechnicalRoadmapCTA source="integrations_page" />
    </SiteLayout>
  );
}

function IntegrationHeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg" aria-hidden="true">
      <div className="absolute inset-[12%] rounded-full border border-white/10" />
      <div className="absolute inset-[26%] rounded-full border border-white/15" />
      <div className="absolute inset-[39%] grid place-items-center rounded-3xl bg-gradient-brand shadow-[var(--shadow-glow)]">
        <PlugZap className="h-10 w-10 text-white" />
      </div>
      {[
        ["CRM", "left-[2%] top-[45%]"],
        ["AI", "right-[5%] top-[17%]"],
        ["Payments", "right-[1%] bottom-[22%]"],
        ["Data", "left-[20%] top-[4%]"],
        ["Messaging", "left-[12%] bottom-[12%]"],
      ].map(([label, position]) => (
        <div key={label} className={`absolute ${position} rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur`}>
          {label}
        </div>
      ))}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-35">
        <path d="M50 50 L9 50 M50 50 L77 22 M50 50 L88 72 M50 50 L31 11 M50 50 L22 82" stroke="url(#integration-gradient)" strokeWidth="0.5" strokeDasharray="2 2" />
        <defs>
          <linearGradient id="integration-gradient"><stop stopColor="var(--theme-primary-start)"/><stop offset="1" stopColor="var(--theme-primary-end)"/></linearGradient>
        </defs>
      </svg>
    </div>
  );
}
