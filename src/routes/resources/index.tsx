import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Calculator,
  FileText,
  Handshake,
  Newspaper,
  Scale,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { getCmsContentList } from "@/lib/logicsify-api";

export const Route = createFileRoute("/resources/")({
  pendingComponent: PublicRouteLoading,
  loader: async () => {
    const [insights, guides, work] = await Promise.all([
      getCmsContentList("insight"),
      getCmsContentList("resource"),
      getCmsContentList("case_study"),
    ]);
    return {
      counts: {
        insights: insights.length,
        guides: guides.length,
        work: work.length,
      },
    };
  },
  component: ResourcesHub,
  head: () => ({
    meta: [
      { title: "Resources, Guides & Interactive Tools | Logicsify" },
      {
        name: "description",
        content:
          "Explore Logicsify insights, downloadable guides, case studies, engagement models, automation demos, comparisons, and a multi-step project estimator.",
      },
      { property: "og:title", content: "Resources, Guides & Interactive Tools | Logicsify" },
      {
        property: "og:description",
        content:
          "Practical content and interactive planning tools for AI automation, CRM operations, websites, portals, and CMS platforms.",
      },
      { property: "og:url", content: "https://logicsify.com/resources" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/resources" }],
  }),
});

const generalResources = [
  {
    title: "Insights",
    description: "Articles, guides, technical analysis, company news, and practical operating advice.",
    to: "/insights",
    icon: Newspaper,
    countKey: "insights" as const,
  },
  {
    title: "Guides",
    description: "Downloadable checklists, audits, templates, and PDF resources managed through the CMS.",
    to: "/guides",
    icon: BookOpenCheck,
    countKey: "guides" as const,
  },
  {
    title: "Case Studies",
    description: "See how connected systems are applied to real operating, sales, service, and platform problems.",
    to: "/work",
    icon: FileText,
    countKey: "work" as const,
  },
  {
    title: "Engagement Models",
    description: "Compare fixed-scope projects, monthly support, dedicated teams, and automation consulting.",
    to: "/engagement-models",
    icon: Handshake,
  },
];

const interactiveResources = [
  {
    title: "Automation Lab",
    description: "Run controlled demos for lead qualification, voice booking, CRM workflows, document extraction, and support chatbots.",
    to: "/automation-lab",
    icon: Bot,
    badge: "5 demos",
  },
  {
    title: "Project Estimator",
    description: "Use the multi-step form to create a rough scope, timeline, complexity level, and implementation plan.",
    to: "/project-estimator",
    icon: Calculator,
    badge: "8 steps",
  },
  {
    title: "Comparisons",
    description: "Balanced decision pages for CMS, CRM, SaaS, voice AI, and delivery-model choices.",
    to: "/comparisons",
    icon: Scale,
  },
  {
    title: "Technical Roadmap",
    description: "Share the current problem, systems, budget, and timeline for a focused technical review.",
    to: "/technical-roadmap",
    icon: Workflow,
  },
];

function ResourcesHub() {
  const { counts } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Resources"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Resources" }]}
        title={
          <>
            Learn, compare, test, and plan the <span className="text-gradient">right system.</span>
          </>
        }
        intro="One place for Logicsify insights, downloadable guides, case studies, engagement models, controlled automation demos, comparisons, and project-planning tools."
        primaryCta={{ label: "Open Project Estimator", to: "/project-estimator" }}
        secondaryCta={{ label: "Try Automation Demos", to: "/automation-lab" }}
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow mb-4">General</p>
            <h2 className="fluid-h2">Research and proof before the build starts.</h2>
            <p className="mt-5 text-lg leading-8 text-ink-soft">
              Use the content below to understand delivery options, review published work, and download practical planning material.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {generalResources.map((item) => {
              const Icon = item.icon;
              const count = item.countKey ? counts[item.countKey] : undefined;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  data-reveal
                  className="group rounded-3xl border border-black/10 bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_-30px_rgba(25,10,47,.35)] md:p-8"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lavender">
                      <Icon className="h-5 w-5 text-ink" />
                    </div>
                    {typeof count === "number" ? (
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-ink-soft">
                        {count} published
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-ink-soft">{item.description}</p>
                  <span className="mt-7 inline-flex items-center gap-2 font-semibold">
                    Explore {item.title} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-dark grid-noise py-20 md:py-28">
        <div className="container-page">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow mb-4 text-white/55">Interactive tools</p>
            <h2 className="fluid-h2 text-white">Test the workflow before discussing implementation.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              These controlled tools help you understand the shape of a solution. They do not trigger unrestricted production actions.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {interactiveResources.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.055] p-7 text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/[.08] md:p-8"
                >
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/15 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                      {item.badge ? (
                        <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/65">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-8 text-2xl font-semibold">{item.title}</h3>
                    <p className="mt-3 leading-7 text-white/65">{item.description}</p>
                    <span className="mt-7 inline-flex items-center gap-2 font-semibold">
                      Open {item.title} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-24">
        <div className="container-page grid gap-8 rounded-3xl border border-black/5 bg-white p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-red">
              <Sparkles className="h-4 w-4" /> Start with a planning tool
            </div>
            <h2 className="fluid-h3">The multi-step estimator is the fastest place to begin.</h2>
            <p className="mt-4 max-w-2xl text-ink-soft">
              Select the service, features, systems, budget, and timeline. You will receive an initial planning summary before submitting it for a roadmap discussion.
            </p>
          </div>
          <Link to="/project-estimator" className="btn-primary justify-center">
            Start Project Estimator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <TechnicalRoadmapCTA source="resources_hub" />
    </SiteLayout>
  );
}
