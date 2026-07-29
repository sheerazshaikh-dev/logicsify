import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Bot,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Code2,
  Construction,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MessageSquareText,
  Network,
  PanelsTopLeft,
  PhoneCall,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/page-hero";
import { SiteLayout } from "@/components/site-layout";
import {
  getCmsContentList,
  getPublicSiteSettings,
  type CmsContentItem,
  type PublicSiteSettings,
} from "@/lib/logicsify-api";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        title: "About Logicsify | AI Automation, Software & Web Development Company",
      },
      {
        name: "description",
        content:
          "Learn about Logicsify, a software development and AI automation company providing custom websites, mobile apps, CRM systems, digital marketing, and connected business solutions.",
      },
      { property: "og:title", content: "Who We Are | Logicsify" },
      {
        property: "og:description",
        content:
          "Logicsify builds connected software, AI automation, CRM, website, mobile, and digital growth systems for growing businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://logicsify.com/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://logicsify.com/#organization",
              name: "Logicsify",
              url: "https://logicsify.com",
              logo: "https://logicsify.com/logicsify-logo-dark.png",
              description:
                "A software development and AI automation company building connected digital systems for growing businesses.",
            },
            {
              "@type": "WebPage",
              "@id": "https://logicsify.com/about#webpage",
              url: "https://logicsify.com/about",
              name: "Who We Are | Logicsify",
              description:
                "Learn how Logicsify combines software development, AI automation, CRM systems, websites, mobile applications, and digital growth into connected business systems.",
              isPartOf: { "@id": "https://logicsify.com/#website" },
              about: { "@id": "https://logicsify.com/#organization" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://logicsify.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Who We Are",
                  item: "https://logicsify.com/about",
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

const services: Array<{
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
}> = [
  {
    title: "Website Design and Development",
    description:
      "High-performance websites connected to lead capture, CRM, analytics, booking, and measurable actions.",
    to: "/services/conversion-focused-business-websites",
    icon: PanelsTopLeft,
  },
  {
    title: "Custom Software Development",
    description:
      "Purpose-built portals, dashboards, admin systems, and applications shaped around real operations.",
    to: "/services/custom-websites-portals-cms",
    icon: Code2,
  },
  {
    title: "AI Automation and Voice Agents",
    description:
      "Practical AI systems for calls, qualification, booking, support, follow-up, and internal workflows.",
    to: "/services/ai-automation-voice-agents",
    icon: Bot,
  },
  {
    title: "Mobile App Development",
    description:
      "Customer and internal applications built around clear journeys, secure data, and useful integrations.",
    to: "/services/mobile-app-development",
    icon: Smartphone,
  },
  {
    title: "CRM and Business Automation",
    description:
      "Lead management, routing, follow-up, scheduling, reporting, payments, and connected revenue operations.",
    to: "/services/crm-revenue-operations",
    icon: Workflow,
  },
  {
    title: "SEO and Digital Marketing",
    description:
      "Search, paid media, content, tracking, and conversion programs connected to the wider customer journey.",
    to: "/services/seo-digital-marketing",
    icon: Search,
  },
];

const processSteps = [
  {
    title: "Discovery",
    body: "We clarify the business problem, users, current systems, constraints, and the outcomes that will define success.",
  },
  {
    title: "Strategy and Planning",
    body: "We turn discovery into a phased roadmap covering scope, architecture, responsibilities, integrations, and measurable priorities.",
  },
  {
    title: "UX and Interface Design",
    body: "We map journeys, information structure, interfaces, and prototypes before expensive development decisions are locked in.",
  },
  {
    title: "Development and Integration",
    body: "We build in controlled increments and connect the website, software, CRM, automation, payments, and data sources involved.",
  },
  {
    title: "Testing and Security",
    body: "Responsive behavior, browsers, forms, permissions, workflows, accessibility, performance, and security-sensitive paths are checked before launch.",
  },
  {
    title: "Deployment and Optimization",
    body: "We complete staging approval, deployment checks, analytics validation, redirects, monitoring, and the first optimization priorities.",
  },
  {
    title: "Ongoing Support",
    body: "Post-launch support, maintenance, iteration, and new phases are handled under a clearly defined engagement model.",
  },
] as const;

const connectedSystems = [
  { label: "Website", icon: PanelsTopLeft, position: "left-[7%] top-[17%]" },
  { label: "CRM", icon: LayoutDashboard, position: "left-[39%] top-[3%]" },
  { label: "AI Automation", icon: Bot, position: "right-[5%] top-[18%]" },
  { label: "Mobile App", icon: Smartphone, position: "right-[1%] top-[57%]" },
  { label: "Marketing", icon: Megaphone, position: "right-[22%] bottom-[2%]" },
  { label: "Analytics", icon: BarChart3, position: "left-[36%] bottom-[-1%]" },
  { label: "Payments", icon: CircleDollarSign, position: "left-[5%] bottom-[14%]" },
  { label: "Customer Support", icon: MessageSquareText, position: "left-[-1%] top-[51%]" },
] as const;

const whyCards: Array<{
  title: string;
  body: string;
  icon: LucideIcon;
  outcome: string;
}> = [
  {
    title: "Clear business outcomes",
    body: "Every scope starts with the operating problem and the result the system must improve.",
    icon: Target,
    outcome: "Less activity without impact",
  },
  {
    title: "Reliable and scalable development",
    body: "Architecture, code quality, deployment, monitoring, and documentation are planned for continued use.",
    icon: Blocks,
    outcome: "A stronger base for growth",
  },
  {
    title: "Strong user experience",
    body: "Customer and team workflows are designed to be clear, efficient, responsive, and accessible.",
    icon: Sparkles,
    outcome: "Fewer points of friction",
  },
  {
    title: "Secure system architecture",
    body: "Access, permissions, integrations, data handling, dependencies, and deployment controls are reviewed deliberately.",
    icon: ShieldCheck,
    outcome: "Reduced avoidable risk",
  },
  {
    title: "Transparent communication",
    body: "Scope, milestones, decisions, staging progress, responsibilities, and change requests stay visible.",
    icon: Users,
    outcome: "Fewer delivery surprises",
  },
];

const industries: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Professional Services", icon: BriefcaseBusiness },
  { label: "Healthcare", icon: HeartPulse },
  { label: "Finance", icon: Landmark },
  { label: "Construction", icon: Construction },
  { label: "Home Services", icon: Home },
  { label: "eCommerce", icon: ShoppingCart },
  { label: "Education", icon: GraduationCap },
  { label: "Real Estate", icon: Building2 },
  { label: "Publishing", icon: PanelsTopLeft },
  { label: "Technology", icon: Rocket },
];

const qaPractices = [
  "Code review",
  "Responsive testing",
  "Browser testing",
  "Functional and form testing",
  "Performance checks",
  "Accessibility checks",
  "Security review",
  "Staging approval",
  "Deployment checklist",
];

function AboutPage() {
  const [team, setTeam] = useState<CmsContentItem[]>([]);
  const [settings, setSettings] = useState<PublicSiteSettings>({});
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getCmsContentList("team"), getPublicSiteSettings()])
      .then(([members, site]) => {
        if (!active) return;
        setTeam(members.filter((member) => member.title && member.content_json?.role));
        setSettings(site);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Who We Are"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Who We Are" }]}
        title={
          <>
            Building Smarter Digital Systems for <span className="text-gradient">Growing Businesses</span>
          </>
        }
        intro="Logicsify helps businesses improve how they attract customers, manage operations, and scale through modern software, AI automation, high-performance websites, and connected digital systems."
        primaryCta={{ label: "Start a Project", to: "/contact" }}
        secondaryCta={{ label: "Explore Our Services", to: "/services" }}
        visual={<HeroTechnologyEcosystem />}
      />

      <section className="py-20 md:py-28">
        <div className="container-page grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <p className="eyebrow mb-4">Technology built around the business</p>
            <h2 className="fluid-h2">A technology and digital solutions company focused on connected operations.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Logicsify helps businesses improve how they attract customers, manage operations, and scale through modern software, AI automation, and high-performance digital platforms.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
              We design and develop websites, mobile applications, custom software, CRM systems, AI-powered workflows, and digital marketing solutions built around real business goals.
            </p>
          </div>
          <div className="lg:col-span-6" data-reveal>
            <div className="border-gradient relative overflow-hidden rounded-3xl bg-ink p-8 text-white md:p-10">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-red/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-gold/20 blur-3xl" />
              <Network className="relative h-10 w-10 text-brand-gold" />
              <p className="relative mt-8 text-2xl font-semibold leading-snug md:text-3xl">
                We do not build disconnected digital products. We create systems where websites, CRM platforms, automation, software, and marketing work together.
              </p>
              <div className="relative mt-8 flex flex-wrap gap-2">
                {["Web", "CRM", "AI", "Payments", "Marketing", "Analytics"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-3xl" data-reveal>
            <p className="eyebrow mb-4">What we do</p>
            <h2 className="fluid-h2">Specialist capabilities connected around one operating system.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Each capability can solve a focused problem. The strongest results happen when the relevant parts share data, workflows, and clear ownership.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map(({ title, description, to, icon: Icon }, index) => (
              <article
                key={title}
                data-reveal
                className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-red/20 hover:shadow-[0_24px_70px_-42px_rgba(25,10,47,0.55)]"
              >
                <span className="absolute right-5 top-5 text-xs font-semibold text-ink/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-lavender text-ink transition group-hover:bg-gradient-brand group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-7 text-xl font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{description}</p>
                <Link
                  to={to}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink transition group-hover:text-brand-red"
                >
                  Learn More <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-3xl" data-reveal>
            <p className="eyebrow mb-4">Our approach</p>
            <h2 className="fluid-h2">A clear path from business problem to working system.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Select a stage to see how strategy, design, engineering, quality assurance, and support fit together.
            </p>
          </div>

          <div className="relative mt-12 hidden lg:block" data-reveal>
            <div className="absolute left-[6%] right-[6%] top-6 h-px bg-black/10" />
            <div className="grid grid-cols-7 gap-3">
              {processSteps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  aria-pressed={activeStep === index}
                  onClick={() => setActiveStep(index)}
                  className="group relative text-left"
                >
                  <span
                    className={`relative z-10 grid h-12 w-12 place-items-center rounded-full border text-sm font-semibold transition ${
                      activeStep === index
                        ? "border-transparent bg-gradient-brand text-white shadow-lg"
                        : "border-black/10 bg-white text-ink group-hover:border-brand-red/30"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-4 block max-w-[150px] text-sm font-semibold leading-5 text-ink">
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
            <div
              className="mt-10 grid items-center gap-8 rounded-3xl bg-ink p-8 text-white md:grid-cols-[auto_1fr] md:p-10"
              aria-live="polite"
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-xl font-semibold text-brand-gold">
                {String(activeStep + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-2xl font-semibold">{processSteps[activeStep].title}</h3>
                <p className="mt-3 max-w-3xl leading-relaxed text-white/70">
                  {processSteps[activeStep].body}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-3 lg:hidden">
            {processSteps.map((step, index) => (
              <details key={step.title} className="group rounded-2xl border border-black/10 bg-white p-5">
                <summary className="flex cursor-pointer list-none items-center gap-4 font-semibold text-ink">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lavender text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{step.title}</span>
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 pl-13 text-sm leading-6 text-ink-soft">{step.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark grid-noise py-20 md:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <p className="eyebrow mb-4 text-white/60">Connected systems</p>
            <h2 className="fluid-h2 text-white">One Partner. One Connected Digital System.</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/65">
              Instead of coordinating multiple vendors, businesses can work with one team that understands design, development, automation, CRM, and digital growth.
            </p>
            <p className="mt-4 leading-relaxed text-white/55">
              A website should generate leads. A CRM should organize and follow up with those leads. Automation should reduce repetitive work. Marketing should produce measurable growth. Our role is to connect these parts into one reliable system.
            </p>
          </div>
          <div className="lg:col-span-7" data-reveal>
            <ConnectedSystemsVisual />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-3xl" data-reveal>
            <p className="eyebrow mb-4">Why Logicsify</p>
            <h2 className="fluid-h2">Built for useful outcomes, dependable delivery, and long-term operation.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {whyCards.map(({ title, body, icon: Icon, outcome }) => (
              <article
                key={title}
                data-reveal
                className="rounded-2xl border border-black/5 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-cream text-ink">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{body}</p>
                <p className="mt-6 border-t border-black/8 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand-red">
                  {outcome}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28">
        <div className="container-page">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7" data-reveal>
              <p className="eyebrow mb-4">Industries and business contexts</p>
              <h2 className="fluid-h2">The workflow matters more than a generic industry template.</h2>
            </div>
            <p className="text-lg leading-relaxed text-ink-soft lg:col-span-5" data-reveal>
              Every solution is planned around the client’s workflow, customers, team structure, and growth goals.
            </p>
          </div>
          <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
            {industries.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="group min-w-[190px] snap-start rounded-2xl border border-black/5 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-red/20 md:min-w-0"
              >
                <Icon className="h-5 w-5 text-ink-soft transition group-hover:text-brand-red" />
                <p className="mt-5 text-sm font-semibold text-ink">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {team.length ? (
        <section id="team" className="py-20 md:py-28">
          <div className="container-page">
            <div className="mb-12 max-w-3xl" data-reveal>
              <p className="eyebrow mb-4">Our team</p>
              <h2 className="fluid-h2">The people responsible for the work.</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => {
                const skills = Array.isArray(member.content_json?.skills)
                  ? member.content_json.skills.map(String)
                  : [];
                const linkedIn = String(member.content_json?.linkedin_url || "");
                return (
                  <article
                    key={member.slug}
                    data-reveal
                    className="rounded-2xl border border-black/5 bg-white p-5"
                  >
                    {member.featured_image ? (
                      <img
                        src={member.featured_image}
                        alt={member.title}
                        loading="lazy"
                        className="mb-5 aspect-square w-full rounded-xl object-cover"
                      />
                    ) : null}
                    <h3 className="text-xl font-semibold">{member.title}</h3>
                    <p className="mt-1 text-sm text-brand-red">
                      {String(member.content_json?.role || "")}
                    </p>
                    {member.content_json?.body ? (
                      <div
                        className="public-prose mt-4 text-sm"
                        dangerouslySetInnerHTML={{ __html: String(member.content_json.body) }}
                      />
                    ) : null}
                    {skills.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-lavender px-2.5 py-1 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {linkedIn ? (
                      <a
                        href={linkedIn}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
                      >
                        LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-20 md:py-28">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <article
            className="border-gradient relative overflow-hidden rounded-3xl bg-ink p-8 text-white md:p-10"
            data-reveal
          >
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-red/15 blur-3xl" />
            <p className="eyebrow relative mb-5 text-white/60">Our Mission</p>
            <h2 className="relative text-2xl font-semibold leading-snug md:text-3xl">
              Make advanced technology practical for growing businesses.
            </h2>
            <p className="relative mt-5 leading-relaxed text-white/65">
              We replace disconnected tools and manual processes with efficient digital systems that teams can understand, operate, and improve.
            </p>
          </article>
          <article
            className="border-gradient relative overflow-hidden rounded-3xl bg-lavender p-8 text-ink md:p-10"
            data-reveal
          >
            <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-brand-gold/25 blur-3xl" />
            <p className="eyebrow relative mb-5">Our Vision</p>
            <h2 className="relative text-2xl font-semibold leading-snug md:text-3xl">
              Become a trusted global technology partner for smarter business operations.
            </h2>
            <p className="relative mt-5 leading-relaxed text-ink-soft">
              We want growing businesses to have clearer systems for serving customers, managing work, making decisions, and scaling responsibly.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28">
        <div className="container-page max-w-5xl">
          <details className="group rounded-3xl border border-black/5 bg-white p-6 md:p-9" data-reveal>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
              <div>
                <p className="eyebrow mb-3">Company profile and technology approach</p>
                <h2 className="fluid-h3">More About Logicsify</h2>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream">
                <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
              </span>
            </summary>

            <div className="mt-8 border-t border-black/8 pt-8">
              <div className="grid gap-8 md:grid-cols-2">
                <SeoContentBlock title="The company">
                  Logicsify is a technology and digital solutions company helping startups, small businesses, agencies, and established companies improve how they attract customers, manage operations, and scale. From strategy and user experience to development, integration, deployment, and ongoing improvement, we manage the complete digital delivery process.
                </SeoContentBlock>
                <SeoContentBlock title="Services and connected delivery">
                  Our work includes custom software development, website development, mobile app development, CRM automation, AI automation, business automation solutions, digital marketing, portals, dashboards, admin systems, integrations, and ongoing technical support. These capabilities are planned as parts of one operating system rather than isolated deliverables.
                </SeoContentBlock>
                <SeoContentBlock title="Technology approach">
                  We select architecture, platforms, integrations, and deployment patterns according to the workflow, data, users, constraints, ownership requirements, and expected growth of each project. The goal is not to add more software. It is to create a reliable system that reduces friction and supports the business over time.
                </SeoContentBlock>
                <SeoContentBlock title="Business automation">
                  AI automation and CRM automation can improve lead response, appointment booking, customer communication, document processing, internal handoffs, reporting, and follow-up. We design these workflows with clear rules, human escalation, data validation, permissions, and visibility into what the automation is doing.
                </SeoContentBlock>
                <SeoContentBlock title="Software development">
                  As a software development company, Logicsify builds custom websites, portals, mobile applications, dashboards, CMS platforms, CRM systems, and integrations around defined business requirements. Work is delivered through discovery, planning, interface design, development, testing, security review, deployment, and support.
                </SeoContentBlock>
                <SeoContentBlock title="Digital transformation without vague promises">
                  Digital transformation should produce practical improvements: faster lead response, fewer missed opportunities, reduced manual work, better customer communication, centralized business data, improved booking rates, automated follow-up, and connected business operations. We focus on those outcomes instead of adding tools without a clear operating purpose.
                </SeoContentBlock>
              </div>

              <div className="mt-10 rounded-2xl bg-cream p-6">
                <h3 className="text-lg font-semibold">Quality assurance and support</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {qaPractices.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl bg-white p-4">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-brand text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium text-ink">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <OperatingNote
                    title="Communication cadence"
                    body="Project communication can include a shared project board, a defined point of contact, written change requests, milestone reviews, staging previews, and regular progress updates."
                  />
                  <OperatingNote
                    title="Support policy"
                    body={
                      settings.post_launch_period ||
                      "Post-launch support scope and duration are agreed in writing for each engagement. Ongoing maintenance is handled separately when required."
                    }
                  />
                  {settings.support_hours ? (
                    <OperatingNote title="Working hours" body={settings.support_hours} />
                  ) : null}
                  {settings.support_response_expectation ? (
                    <OperatingNote
                      title="Response expectations"
                      body={settings.support_response_expectation}
                    />
                  ) : null}
                  {settings.emergency_support_policy ? (
                    <OperatingNote title="Emergency support" body={settings.emergency_support_policy} />
                  ) : null}
                  {settings.maintenance_exclusions ? (
                    <OperatingNote
                      title="Maintenance exclusions"
                      body={settings.maintenance_exclusions}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="section-dark grid-noise relative overflow-hidden rounded-3xl px-7 py-14 text-center md:px-12 md:py-20">
            <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-brand-red/15 blur-3xl" />
            <div className="relative mx-auto max-w-3xl">
              <p className="eyebrow mb-5 text-white/60">Start with the operating problem</p>
              <h2 className="fluid-h2 text-white">Let’s Build a Smarter System for Your Business</h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
                Tell us where your current system is failing, what you want to improve, and what success should look like.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-primary">
                  Start Your Project <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/book-a-call" className="btn-ghost-dark">
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function HeroTechnologyEcosystem() {
  const nodes = [
    { label: "Website", icon: PanelsTopLeft, x: 82, y: 104 },
    { label: "CRM", icon: LayoutDashboard, x: 250, y: 54 },
    { label: "AI Agents", icon: PhoneCall, x: 420, y: 116 },
    { label: "Payments", icon: CircleDollarSign, x: 410, y: 344 },
    { label: "Analytics", icon: BarChart3, x: 250, y: 414 },
    { label: "Automation", icon: Workflow, x: 78, y: 338 },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-label="Connected Logicsify technology ecosystem">
      <svg
        aria-hidden="true"
        viewBox="0 0 500 500"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="about-hero-line" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FE3434" />
            <stop offset="1" stopColor="#FDBE02" />
          </linearGradient>
        </defs>
        {nodes.map((node, index) => (
          <line
            key={node.label}
            x1="250"
            y1="250"
            x2={node.x}
            y2={node.y}
            stroke="url(#about-hero-line)"
            strokeWidth="1.5"
            strokeDasharray="7 8"
            opacity="0.55"
            style={{
              strokeDashoffset: 1000,
              animation: "draw-line 2s ease-out forwards",
              animationDelay: `${index * 0.08}s`,
            }}
          />
        ))}
        <circle cx="250" cy="250" r="112" fill="none" stroke="white" strokeOpacity="0.08" />
        <circle cx="250" cy="250" r="165" fill="none" stroke="white" strokeOpacity="0.05" />
      </svg>

      {nodes.map(({ label, icon: Icon, x, y }) => (
        <div
          key={label}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-white/8 px-3 py-3 text-center text-white backdrop-blur transition duration-300 hover:-translate-y-[58%] hover:bg-white/14"
          style={{ left: `${(x / 500) * 100}%`, top: `${(y / 500) * 100}%` }}
        >
          <Icon className="mx-auto h-4 w-4 text-brand-gold" />
          <span className="mt-1.5 block text-[10px] font-semibold sm:text-xs">{label}</span>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-10 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white shadow-[0_0_80px_rgba(253,190,2,0.18)] sm:h-40 sm:w-40">
        <div className="absolute inset-3 rounded-full border border-dashed border-black/10 animate-spin-slow" />
        <img src="/logicsify-mark.png" alt="Logicsify" className="relative h-14 w-14 sm:h-16 sm:w-16" />
      </div>

      <div className="absolute bottom-[18%] left-[25%] hidden rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-[10px] text-white/60 backdrop-blur sm:block">
        Live data flow
      </div>
      <div className="absolute right-[18%] top-[31%] hidden rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-[10px] text-white/60 backdrop-blur sm:block">
        Connected actions
      </div>
    </div>
  );
}

function ConnectedSystemsVisual() {
  return (
    <div className="relative mx-auto aspect-[1/0.88] w-full max-w-[690px] rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
      <svg aria-hidden="true" viewBox="0 0 700 610" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="about-connected-line" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FE3434" />
            <stop offset="1" stopColor="#FDBE02" />
          </linearGradient>
        </defs>
        {[
          [350, 305, 105, 125],
          [350, 305, 330, 68],
          [350, 305, 590, 135],
          [350, 305, 625, 350],
          [350, 305, 505, 545],
          [350, 305, 275, 555],
          [350, 305, 80, 465],
          [350, 305, 55, 275],
        ].map(([x1, y1, x2, y2], index) => (
          <line
            key={`${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#about-connected-line)"
            strokeWidth="1.5"
            strokeDasharray="8 9"
            opacity="0.48"
            style={{
              strokeDashoffset: 1000,
              animation: "draw-line 2.3s ease-out forwards",
              animationDelay: `${index * 0.08}s`,
            }}
          />
        ))}
        <circle cx="350" cy="305" r="148" fill="none" stroke="white" strokeOpacity="0.06" />
      </svg>

      {connectedSystems.map(({ label, icon: Icon, position }) => (
        <div
          key={label}
          className={`group absolute ${position} z-10 w-[118px] rounded-2xl border border-white/12 bg-[#221335]/95 p-3 text-center text-white transition duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:bg-[#2b1842] sm:w-[132px] sm:p-4`}
        >
          <Icon className="mx-auto h-4 w-4 text-brand-gold sm:h-5 sm:w-5" />
          <span className="mt-2 block text-[10px] font-semibold sm:text-xs">{label}</span>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 z-20 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white sm:h-40 sm:w-40">
        <div className="absolute inset-3 rounded-full border border-dashed border-black/10 animate-spin-slow" />
        <img src="/logicsify-mark.png" alt="Logicsify" className="relative h-14 w-14 sm:h-16 sm:w-16" />
      </div>
    </div>
  );
}

function SeoContentBlock({ title, children }: { title: string; children: string }) {
  return (
    <article>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-3 leading-7 text-ink-soft">{children}</p>
    </article>
  );
}

function OperatingNote({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-xl bg-white p-5">
      <h4 className="font-semibold text-ink">{title}</h4>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-soft">{body}</p>
    </article>
  );
}
