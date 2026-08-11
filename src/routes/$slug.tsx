import { createFileRoute, notFound, Link, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  Download,
  Globe2,
  Layers3,
  MapPin,
  Network,
  Phone,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import {
  getCmsContentItem,
  getCmsContentList,
  getPublicSiteSettings,
  type CmsContentItem,
  type PublicSiteSettings,
} from "@/lib/logicsify-api";
import { asRecord, asRecordArray, safeString } from "@/lib/content-utils";
import { legacyCollectionPath } from "@/lib/content-routes";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { coreServiceDefinitions, otherServices } from "@/lib/site-data";
import {
  getContactEmails,
  getLocationAddresses,
  getLocationPhones,
  getSiteLocations,
  telHref,
} from "@/lib/contact-directory";

export const Route = createFileRoute("/$slug")({
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    if (params.slug === "company-profile") {
      const [services, caseStudies, settings] = await Promise.all([
        getCmsContentList("service"),
        getCmsContentList("case_study"),
        getPublicSiteSettings(),
      ]);
      return { kind: "company-profile" as const, services, caseStudies, settings };
    }

    if (params.slug === "portfolio") {
      const items = await getCmsContentList("case_study");
      return { kind: "portfolio" as const, items };
    }

    const page = await getCmsContentItem("page", params.slug);
    if (!page) {
      const legacyPath = legacyCollectionPath(params.slug);
      if (legacyPath) throw redirect({ href: legacyPath, statusCode: 301 });
      throw notFound();
    }
    if (
      [
        "home",
        "about",
        "services",
        "industries",
        "work",
        "process",
        "technology",
        "insights",
        "careers",
        "contact",
        "book-a-call",
        "privacy",
        "terms",
      ].includes(params.slug)
    ) {
      throw notFound();
    }
    return { kind: "cms" as const, page };
  },
  component: DynamicTopLevelPage,
  head: ({ loaderData, params }) => {
    if (loaderData?.kind === "company-profile") {
      return {
        meta: [
          { title: "Company Profile | Logicsify" },
          {
            name: "description",
            content:
              "Explore Logicsify's company profile, service capabilities, delivery model, selected work, and locations.",
          },
          { property: "og:title", content: "Logicsify Company Profile" },
          {
            property: "og:description",
            content:
              "A practical overview of Logicsify, our connected technology services, delivery model, selected work, and locations.",
          },
          { property: "og:url", content: "https://logicsify.com/company-profile" },
        ],
        links: [{ rel: "canonical", href: "https://logicsify.com/company-profile" }],
      };
    }

    if (loaderData?.kind === "portfolio") {
      return {
        meta: [
          { title: "Portfolio | Logicsify" },
          {
            name: "description",
            content:
              "Explore selected Logicsify projects across AI automation, CRM, websites, portals, CMS platforms, and connected business systems.",
          },
          { property: "og:title", content: "Logicsify Portfolio" },
          {
            property: "og:description",
            content: "Selected digital systems and automation work delivered around real operating problems.",
          },
          { property: "og:url", content: "https://logicsify.com/portfolio" },
        ],
        links: [{ rel: "canonical", href: "https://logicsify.com/portfolio" }],
      };
    }

    const page = loaderData?.kind === "cms" ? loaderData.page : undefined;
    return {
      meta: [
        { title: page?.seo_json?.title || `${page?.title || "Page"} | Logicsify` },
        { name: "description", content: page?.seo_json?.description || page?.excerpt || "" },
        { name: "robots", content: page?.seo_json?.noindex ? "noindex,nofollow" : "index,follow" },
        { property: "og:title", content: page?.seo_json?.title || page?.title || "" },
        { property: "og:description", content: page?.seo_json?.description || page?.excerpt || "" },
        { property: "og:url", content: `https://logicsify.com/${params.slug}` },
        ...((page?.seo_json?.og_image || page?.featured_image)
          ? [
              { property: "og:image", content: page?.seo_json?.og_image || page?.featured_image },
              { name: "twitter:image", content: page?.seo_json?.og_image || page?.featured_image },
            ]
          : []),
      ],
      links: [
        { rel: "canonical", href: page?.seo_json?.canonical || `https://logicsify.com/${params.slug}` },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-40 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="fluid-h2">Page not found</h1>
        <Link to="/" className="btn-primary mt-8">
          Go to homepage
        </Link>
      </div>
    </SiteLayout>
  ),
});

function DynamicTopLevelPage() {
  const data = Route.useLoaderData();
  if (data.kind === "company-profile") return <CompanyProfilePage {...data} />;
  if (data.kind === "portfolio") return <PortfolioPage items={data.items} />;
  return <CmsPage page={data.page} />;
}

function CmsPage({ page }: { page: CmsContentItem }) {
  const content = asRecord(page.content_json);
  const sections = asRecordArray(content.sections);
  const body = safeString(content.body);

  return (
    <SiteLayout>
      <PageHero
        eyebrow={String(content.category || "Logicsify")}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: page.title }]}
        title={<>{page.title}</>}
        intro={page.excerpt || undefined}
      />

      {body && (
        <section className="py-20">
          <div className="container-page mx-auto max-w-4xl whitespace-pre-wrap text-lg leading-relaxed text-ink-soft">
            {body}
          </div>
        </section>
      )}

      {sections.map((section, index) => {
        const eyebrow = safeString(section.eyebrow);
        const title = safeString(section.title);
        const sectionBody = safeString(section.body);
        const buttonLabel = safeString(section.button_label);
        const buttonUrl = safeString(section.button_url);
        const image = safeString(section.image);

        return (
          <section key={`${title || "section"}-${index}`} className={index % 2 ? "bg-cream py-20" : "py-20"}>
            <div className="container-page grid items-center gap-10 lg:grid-cols-12">
              <div className={image ? "lg:col-span-7" : "lg:col-span-9"}>
                {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
                {title && <h2 className="fluid-h2">{title}</h2>}
                {sectionBody && (
                  <p className="mt-5 whitespace-pre-wrap text-lg leading-relaxed text-ink-soft">{sectionBody}</p>
                )}
                {buttonLabel && buttonUrl && (
                  <a href={buttonUrl} className="btn-primary mt-7">
                    {buttonLabel} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
              {image && (
                <div className="lg:col-span-5">
                  <img
                    src={image}
                    alt={title || page.title}
                    className="w-full rounded-3xl border border-black/10 shadow-[var(--shadow-card)]"
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}

      <CTASection />
    </SiteLayout>
  );
}

function CompanyProfilePage({
  services,
  caseStudies,
  settings,
}: {
  kind: "company-profile";
  services: CmsContentItem[];
  caseStudies: CmsContentItem[];
  settings: PublicSiteSettings;
}) {
  const serviceMap = new Map(services.map((service) => [service.slug, service]));
  const locations = getSiteLocations(settings);
  const emails = getContactEmails(settings);
  const core = coreServiceDefinitions.map((definition) => serviceMap.get(definition.slug)).filter(Boolean) as CmsContentItem[];
  const specialist = otherServices
    .map((definition) => serviceMap.get(definition.slug))
    .filter(Boolean) as CmsContentItem[];
  const cyber = serviceMap.get("cybersecurity");
  const totalSections = 11;

  return (
    <SiteLayout>
      <div className="bg-ink text-white">
        <ProfileSection index={1} total={totalSections} className="min-h-[78vh] grid-noise">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow !text-white/55">Company profile</p>
              <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">
                Connected technology systems, <span className="text-gradient">built for practical growth.</span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/68">
                Logicsify connects AI automation, CRM operations, websites, portals, CMS platforms, cybersecurity, and specialist digital capability around the same business journey.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/contact" className="btn-primary">Discuss your project <ArrowRight className="h-4 w-4" /></Link>
                <button type="button" onClick={() => window.print()} className="btn-ghost-light">
                  Print / save PDF <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.045] p-8">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-brand opacity-30 blur-3xl" />
                <div className="relative grid gap-4 sm:grid-cols-2">
                  <Metric value={String(services.length)} label="Published service capabilities" />
                  <Metric value={String(core.length)} label="Core service families" />
                  <Metric value={String(caseStudies.length)} label="Published project stories" />
                  <Metric value={String(locations.length)} label="Business locations" />
                </div>
              </div>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection index={2} total={totalSections} light>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Company overview</p>
              <h2 className="mt-4 fluid-h2">One delivery partner for connected business systems.</h2>
            </div>
            <div className="space-y-6 text-lg leading-8 text-ink-soft lg:col-span-7">
              <p>
                Logicsify helps businesses improve how they attract customers, respond to enquiries, manage revenue operations, deliver digital experiences, protect access, and run repeatable internal workflows.
              </p>
              <p>
                Our work starts with the operating problem rather than a predetermined tool. We map users, data, decisions, handoffs, exceptions, ownership, and success measures before choosing the implementation approach.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <MiniValue icon={Network} title="Connected" body="Systems share context instead of creating another silo." />
                <MiniValue icon={Workflow} title="Operational" body="Every workflow has visible ownership and exception handling." />
                <MiniValue icon={Sparkles} title="Practical" body="Scope is tied to measurable outcomes and maintainable delivery." />
              </div>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection index={3} total={totalSections}>
          <p className="eyebrow !text-white/55">Core service portfolio</p>
          <h2 className="mt-4 max-w-4xl fluid-h2 text-white">Three core systems, designed to work together.</h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {core.map((service, index) => (
              <ServiceProfileCard key={service.slug} service={service} index={index + 1} />
            ))}
          </div>
        </ProfileSection>

        {coreServiceDefinitions.map((family, familyIndex) => {
          const familyService = serviceMap.get(family.slug);
          const children = family.subservices
            .map((item) => serviceMap.get(item.slug))
            .filter(Boolean) as CmsContentItem[];
          return (
            <ProfileSection key={family.slug} index={4 + familyIndex} total={totalSections} light={familyIndex % 2 === 0}>
              <div className="flex flex-col gap-5 border-b border-current/10 pb-8 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                  <p className="eyebrow">Technology service family</p>
                  <h2 className="mt-4 fluid-h2">{familyService?.title || family.name}</h2>
                  <p className="mt-5 text-lg leading-8 opacity-70">{familyService?.excerpt || family.short}</p>
                </div>
                <Link to={family.route} className={familyIndex % 2 === 0 ? "btn-ghost-dark" : "btn-ghost-light"}>
                  Full service page <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {children.map((service) => (
                  <ProfileCapability key={service.slug} service={service} dark={familyIndex % 2 !== 0} />
                ))}
              </div>
            </ProfileSection>
          );
        })}

        <ProfileSection index={7} total={totalSections}>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow !text-white/55">Specialist capability</p>
              <h2 className="mt-4 fluid-h2 text-white">Support around the core systems.</h2>
              <p className="mt-5 text-lg leading-8 text-white/65">
                Specialist services are brought into the engagement when they remove a delivery risk, improve usability, strengthen security, or support growth.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {specialist.map((service) => (
                <Link
                  key={service.slug}
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="rounded-2xl border border-white/10 bg-white/[.045] p-6 transition hover:-translate-y-1 hover:bg-white/[.075]"
                >
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{service.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection index={8} total={totalSections} light>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="eyebrow">Cybersecurity</p>
              <h2 className="mt-4 fluid-h2">Security built into the system, not added after launch.</h2>
              <p className="mt-5 text-lg leading-8 text-ink-soft">
                {cyber?.excerpt || "Practical security reviews and hardening for applications, access, cloud environments, integrations, dependencies, and operational recovery."}
              </p>
              <Link to="/services/$slug" params={{ slug: "cybersecurity" }} className="btn-primary mt-7">
                Explore cybersecurity <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {serviceCapabilities(cyber).slice(0, 6).map((capability) => (
                <article key={capability.title} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold">{capability.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{capability.body}</p>
                </article>
              ))}
            </div>
          </div>
        </ProfileSection>

        <ProfileSection index={9} total={totalSections}>
          <p className="eyebrow !text-white/55">Delivery model</p>
          <h2 className="mt-4 max-w-4xl fluid-h2 text-white">From operating problem to embedded improvement.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              ["01", "Understand", "Clarify users, outcome, systems, constraints, urgency, and ownership."],
              ["02", "Map", "Document data, handoffs, states, decisions, exceptions, and dependencies."],
              ["03", "Design", "Turn the operating model into scope, architecture, workflows, interfaces, and measures."],
              ["04", "Build", "Deliver in reviewable increments with integrations, security, and documentation visible."],
              ["05", "Validate", "Test expected paths, failures, permissions, devices, data quality, and recovery."],
              ["06", "Improve", "Launch, monitor real outcomes, transfer knowledge, and prioritize evidence-led changes."],
            ].map(([n, title, body]) => (
              <article key={n} className="rounded-2xl border border-white/10 bg-white/[.045] p-5">
                <span className="text-sm font-bold text-brand-gold">{n}</span>
                <h3 className="mt-7 font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection index={10} total={totalSections} light>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Selected portfolio</p>
              <h2 className="mt-4 fluid-h2">Work connected to real operating problems.</h2>
            </div>
            <Link to="/$slug" params={{ slug: "portfolio" }} className="btn-ghost-dark">View portfolio <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {caseStudies.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {caseStudies.slice(0, 4).map((item) => <PortfolioCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8 text-ink-soft">Published case studies will appear here automatically.</div>
          )}
        </ProfileSection>

        <ProfileSection index={11} total={totalSections}>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow !text-white/55">Locations & contact</p>
              <h2 className="mt-4 fluid-h2 text-white">Work with Logicsify.</h2>
              <p className="mt-5 text-lg leading-8 text-white/65">
                Start with the operating problem. We will help map the first practical technical roadmap before expanding the scope.
              </p>
              <div className="mt-7 space-y-2 text-sm text-white/70">
                <a className="block hover:text-white" href={`mailto:${emails.general}`}>{emails.general}</a>
                {settings.phone ? <a className="block hover:text-white" href={telHref(settings.phone)}>{settings.phone}</a> : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:col-span-8 xl:grid-cols-3">
              {locations.map((location) => (
                <article key={location.id} className="rounded-2xl border border-white/10 bg-white/[.045] p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-brand-gold"><MapPin className="h-4 w-4" /></span>
                    <div>
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-xs text-white/45">{[location.city, location.country].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm leading-6 text-white/58">
                    {getLocationAddresses(location).map((address) => <p key={address}>{address}</p>)}
                    {getLocationPhones(location).map((phone) => <a key={phone} href={telHref(phone)} className="block font-semibold text-white/80 hover:text-white">{phone}</a>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </ProfileSection>
      </div>
    </SiteLayout>
  );
}

function ProfileSection({
  index,
  total,
  children,
  light = false,
  className = "",
}: {
  index: number;
  total: number;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <section className={`${light ? "bg-cream text-ink" : "bg-ink text-white"} border-b border-current/10 py-20 md:py-28 ${className}`}>
      <div className="container-page">
        <div className="mb-10 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[.2em] opacity-45">
          <span>Company profile</span>
          <span>{String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </div>
        {children}
        {index < total ? (
          <div className="mt-12 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] opacity-35">
            Continue scrolling <ChevronDown className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.045] p-5">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs leading-5 text-white/50">{label}</div>
    </div>
  );
}

function MiniValue({ icon: Icon, title, body }: { icon: typeof Network; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5">
      <Icon className="h-5 w-5 text-brand-red" />
      <h3 className="mt-5 font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
    </article>
  );
}

function ServiceProfileCard({ service, index }: { service: CmsContentItem; index: number }) {
  return (
    <Link to="/services/$slug" params={{ slug: service.slug }} className="group min-h-80 rounded-3xl border border-white/10 bg-white/[.045] p-7 transition hover:-translate-y-1 hover:bg-white/[.075]">
      <span className="text-sm font-bold text-brand-gold">0{index}</span>
      <h3 className="mt-9 text-2xl font-semibold">{service.title}</h3>
      <p className="mt-4 leading-7 text-white/60">{service.excerpt}</p>
      <span className="mt-8 inline-flex items-center gap-2 font-semibold">Explore service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
    </Link>
  );
}

function ProfileCapability({ service, dark }: { service: CmsContentItem; dark: boolean }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className={`${dark ? "border-white/10 bg-white/[.045] hover:bg-white/[.075]" : "border-black/10 bg-white hover:shadow-lg"} rounded-2xl border p-6 transition hover:-translate-y-1`}
    >
      <h3 className="font-semibold">{service.title}</h3>
      <p className={`mt-3 text-sm leading-6 ${dark ? "text-white/58" : "text-ink-soft"}`}>{service.excerpt}</p>
    </Link>
  );
}

function serviceCapabilities(service?: CmsContentItem) {
  if (!service) {
    return [
      { title: "Application security review", body: "Review authentication, authorization, input handling, exposed routes, sensitive data flows, and high-risk application behavior." },
      { title: "Access and identity hardening", body: "Strengthen account controls, privileged access, MFA coverage, secrets handling, and role-based permissions." },
      { title: "Cloud and deployment security", body: "Review hosting exposure, environments, DNS, TLS, storage, deployment access, backups, and recovery boundaries." },
      { title: "Dependency and integration risk", body: "Identify vulnerable dependencies, unsafe integrations, exposed keys, webhook risks, and third-party trust boundaries." },
    ];
  }
  const content = asRecord(service.content_json);
  return asRecordArray(content.capabilities)
    .map((item) => ({ title: safeString(item.title), body: safeString(item.body) }))
    .filter((item) => item.title || item.body);
}

function PortfolioPage({ items }: { items: CmsContentItem[] }) {
  const featured = items.filter((item) => item.featured);
  const rest = items.filter((item) => !item.featured);
  const ordered = [...featured, ...rest];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Portfolio"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Portfolio" }]}
        title={<>Digital systems built around <span className="text-gradient">real operating problems.</span></>}
        intro="A visual portfolio of selected Logicsify work across AI automation, CRM operations, websites, portals, CMS platforms, integrations, and digital products."
        primaryCta={{ label: "Discuss Your Project", to: "/contact" }}
        secondaryCta={{ label: "View Case Studies", to: "/work" }}
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            <PortfolioStat icon={BriefcaseBusiness} value={String(items.length)} label="Published projects" />
            <PortfolioStat icon={Layers3} value={String(featured.length)} label="Featured work" />
            <PortfolioStat icon={Globe2} value="Connected" label="Systems, data and customer journeys" />
          </div>

          {ordered.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {ordered.map((item) => <PortfolioCard key={item.id} item={item} large />)}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-black/10 bg-cream p-12 text-center">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-ink-soft" />
              <h2 className="mt-5 fluid-h3">Portfolio items are being prepared.</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-soft">Published Case Studies automatically appear in this portfolio, so the page stays controlled from Content Studio.</p>
            </div>
          )}
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}

function PortfolioStat({ icon: Icon, value, label }: { icon: typeof Building2; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <Icon className="h-5 w-5 text-brand-red" />
      <div className="mt-7 text-3xl font-semibold">{value}</div>
      <p className="mt-2 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

function PortfolioCard({ item, large = false }: { item: CmsContentItem; large?: boolean }) {
  const content = asRecord(item.content_json);
  const services = Array.isArray(content.services) ? content.services.map(String) : [];
  const outcome = safeString(content.outcome || content.result || content.summary);
  return (
    <Link
      to="/work/$slug"
      params={{ slug: item.slug }}
      className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl"
    >
      {item.featured_image ? (
        <img src={item.featured_image} alt="" className={`${large ? "aspect-[16/9]" : "aspect-[16/8]"} w-full object-cover`} loading="lazy" />
      ) : (
        <div className={`${large ? "aspect-[16/9]" : "aspect-[16/8]"} grid place-items-center bg-ink grid-noise`}>
          <BriefcaseBusiness className="h-12 w-12 text-white/20" />
        </div>
      )}
      <div className="p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">{safeString(content.category || content.industry || "Project")}</p>
          {item.featured ? <span className="rounded-full bg-lavender px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em]">Featured</span> : null}
        </div>
        <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
        <p className="mt-3 leading-7 text-ink-soft">{outcome || item.excerpt}</p>
        {services.length ? (
          <div className="mt-5 flex flex-wrap gap-2">{services.slice(0, 4).map((service) => <span key={service} className="rounded-full bg-cream px-3 py-1 text-xs font-semibold">{service.replace(/-/g, " ")}</span>)}</div>
        ) : null}
        <span className="mt-7 inline-flex items-center gap-2 font-semibold">View project <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
      </div>
    </Link>
  );
}
