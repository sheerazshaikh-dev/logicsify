import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Cpu,
  Globe2,
  Layers3,
  Loader2,
  Mail,
  MapPin,
  Network,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  getCmsContentList,
  getPublicSiteSettings,
  getPublicTeamMembers,
  type CmsContentItem,
  type PublicSiteSettings,
  type PublicTeamMember,
} from "@/lib/logicsify-api";
import { coreServiceDefinitions, otherServices } from "@/lib/site-data";
import {
  getContactEmails,
  getLocationAddresses,
  getLocationPhones,
  getSiteLocations,
  telHref,
} from "@/lib/contact-directory";
import { DEFAULT_BRAND_ASSETS, optimizedBrandAsset } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";
import { downloadCompanyProfileHtml } from "@/lib/company-profile-export";

const text = (value: unknown) =>
  typeof value === "string" ? value : value == null ? "" : String(value);
const records = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> => Boolean(item && typeof item === "object"),
      )
    : [];
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => text(item)).filter(Boolean) : [];

const PROFILE_BACKGROUND_IMAGES = [
  "/profile-backgrounds/annie-spratt-QckxruozjRg-unsplash.jpg",
  "/profile-backgrounds/tim-van-der-kuip-CPs2X8JYmS8-unsplash.jpg",
  "/profile-backgrounds/campaign-creators-gMsnXqILjp4-unsplash.jpg",
  "/profile-backgrounds/microsoft-copilot-8UnGiO4yesk-unsplash.jpg",
  "/profile-backgrounds/charlesdeluvio-Lks7vei-eAg-unsplash.jpg",
  "/profile-backgrounds/israel-andrade-YI_9SivVt_s-unsplash.jpg",
  "/profile-backgrounds/nastuh-abootalebi-eHD8Y1Znfpk-unsplash.jpg",
  "/profile-backgrounds/microsoft-copilot-Zcp8xN9DnjM-unsplash.jpg",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/company-profile")({
  loader: async () => {
    const [services, portfolio, caseStudies, team, settings] = await Promise.all([
      getCmsContentList("service"),
      getCmsContentList("portfolio"),
      getCmsContentList("case_study"),
      getPublicTeamMembers("profile"),
      getPublicSiteSettings(),
    ]);
    return { services, portfolio, caseStudies, team, settings };
  },
  head: ({ loaderData }) => {
    const settings = loaderData?.settings || {};
    const base = settings.site_url || "https://logicsify.com";
    const title = `Company Profile | ${settings.site_name || "Logicsify"}`;
    const description =
      "Explore Logicsify's company profile, connected technology services, cybersecurity capability, delivery model, portfolio, case studies, team, and locations.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `${base}/company-profile` },
        { property: "og:type", content: "website" },
        ...(settings.default_og_image
          ? [{ property: "og:image", content: settings.default_og_image }]
          : []),
      ],
      links: [{ rel: "canonical", href: `${base}/company-profile` }],
    };
  },
  component: CompanyProfile,
});

function useMandatorySlideNavigation(sectionIds: string[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const lockRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const moveTo = (nextIndex: number) => {
      if (mobileQuery.matches) return;
      const index = Math.max(0, Math.min(sectionIds.length - 1, nextIndex));
      if (
        index === activeIndexRef.current &&
        Math.abs(container.scrollTop - index * container.clientHeight) < 4
      )
        return;

      activeIndexRef.current = index;
      lockRef.current = true;
      container.scrollTo({
        top: index * container.clientHeight,
        behavior: reducedMotion ? "auto" : "smooth",
      });
      window.setTimeout(() => {
        lockRef.current = false;
      }, reducedMotion ? 80 : 760);
    };

    const updateActiveIndex = () => {
      activeIndexRef.current = Math.max(
        0,
        Math.min(
          sectionIds.length - 1,
          Math.round(container.scrollTop / Math.max(container.clientHeight, 1)),
        ),
      );
    };

    const onWheel = (event: WheelEvent) => {
      if (mobileQuery.matches || Math.abs(event.deltaY) < 8) return;
      event.preventDefault();
      if (lockRef.current) return;
      moveTo(activeIndexRef.current + (event.deltaY > 0 ? 1 : -1));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (mobileQuery.matches) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        if (!lockRef.current) moveTo(activeIndexRef.current + 1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        if (!lockRef.current) moveTo(activeIndexRef.current - 1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        moveTo(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        moveTo(sectionIds.length - 1);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (mobileQuery.matches) return;
      touchStartRef.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (mobileQuery.matches || touchStartRef.current === null || lockRef.current) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartRef.current;
      const distance = touchStartRef.current - endY;
      touchStartRef.current = null;
      if (Math.abs(distance) < 48) return;
      moveTo(activeIndexRef.current + (distance > 0 ? 1 : -1));
    };

    const onResize = () => {
      if (!mobileQuery.matches) moveTo(activeIndexRef.current);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("scroll", updateActiveIndex, { passive: true });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("scroll", updateActiveIndex);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [sectionIds]);

  return containerRef;
}

function ProfileSection({
  id,
  number,
  total,
  chapter,
  dark = false,
  className,
  backgroundImage,
  settings,
  children,
}: {
  id: string;
  number: number;
  total: number;
  chapter: string;
  dark?: boolean;
  className?: string;
  backgroundImage?: string;
  settings: PublicSiteSettings;
  children: ReactNode;
}) {
  const siteName = settings.site_name || "Logicsify";
  const siteUrl = settings.site_url || "https://logicsify.com";
  const logo = dark
    ? optimizedBrandAsset(settings.logo_light || settings.footer_logo, DEFAULT_BRAND_ASSETS.logoLight)
    : optimizedBrandAsset(settings.logo_dark, DEFAULT_BRAND_ASSETS.logoDark);

  return (
    <section
      id={id}
      className={cn(
        "profile-slide relative isolate h-auto min-h-0 overflow-visible md:h-[100svh] md:min-h-[100svh] md:overflow-hidden",
        dark ? "bg-ink text-white" : "bg-background text-ink",
        className,
      )}
    >
      {backgroundImage ? (
        <div className="absolute inset-0 -z-20">
          <img src={backgroundImage} alt="" className="size-full object-cover" />
          <div
            className={cn(
              "absolute inset-0",
              dark
                ? "bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.90)_52%,rgba(0,0,0,.60)_100%)]"
                : "bg-[linear-gradient(90deg,rgba(255,255,255,.985)_0%,rgba(255,255,255,.95)_55%,rgba(255,255,255,.78)_100%)]",
            )}
          />
          <div className="brand-radial-glow absolute inset-0 opacity-30" />
        </div>
      ) : null}

      <div
        data-profile-slide-frame="true"
        className="relative mx-auto grid h-auto min-h-0 w-full max-w-[96rem] grid-rows-[auto_auto_auto] px-5 py-5 sm:px-8 sm:py-6 md:h-full md:grid-rows-[auto_1fr_auto] lg:px-12"
      >
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/"
            aria-label={`Open ${siteName} homepage`}
            className="inline-flex items-center p-1"
          >
            <img
              src={logo}
              alt={`${siteName} logo`}
              className="h-8 w-auto object-contain sm:h-9 lg:h-10"
            />
          </Link>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-xs">
            <span className={dark ? "text-white/48" : "text-ink-soft"}>{chapter}</span>
            <span className={cn("h-px w-7", dark ? "bg-white/18" : "bg-black/10")} />
            <span className="text-gradient">
              {String(number).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
        </header>

        <div
          data-profile-slide-content="true"
          className="py-7 sm:py-8 md:flex md:min-h-0 md:items-center md:py-7 lg:py-8"
        >
          {children}
        </div>

        <footer
          className={cn(
            "flex items-center justify-between gap-4 border-t pt-3 text-[10px] sm:text-xs",
            dark ? "border-white/10 text-white/42" : "border-black/10 text-ink-soft",
          )}
        >
          <span>{siteUrl.replace(/^https?:\/\//, "")}</span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowDown className="size-3" aria-hidden="true" />
            <span className="md:hidden">Continue scrolling</span>
            <span className="hidden md:inline">Scroll, swipe or use arrow keys</span>
          </span>
        </footer>
      </div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  lead,
  dark = false,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", dark ? "text-white/58" : "text-ink-soft")}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 max-w-5xl font-extrabold leading-[1.02] tracking-tight",
          compact ? "text-3xl sm:text-4xl lg:text-[3.2rem]" : "text-4xl sm:text-5xl lg:text-[4rem]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p className={cn("mt-4 max-w-3xl text-sm leading-relaxed sm:text-base", dark ? "text-white/64" : "text-ink-soft")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

function capabilityRows(service?: CmsContentItem) {
  if (!service) return [];
  const content = service.content_json || {};
  return records(content.capabilities)
    .map((row) => ({ title: text(row.title), body: text(row.body) }))
    .filter((row) => row.title || row.body);
}

function CoreServiceSlide({
  item,
  id,
  number,
  total,
  settings,
  backgroundImage,
}: {
  item: CmsContentItem;
  id: string;
  number: number;
  total: number;
  settings: PublicSiteSettings;
  backgroundImage?: string;
}) {
  const capabilities = capabilityRows(item).slice(0, 8);
  return (
    <ProfileSection
      id={id}
      number={number}
      total={total}
      chapter="Core service portfolio"
      backgroundImage={backgroundImage || item.featured_image}
      settings={settings}
    >
      <div className="grid w-full items-center gap-7 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12">
        <div>
          <SectionTitle eyebrow="Core service" title={item.title} lead={item.excerpt} compact />
          <Link
            to="/services/$slug"
            params={{ slug: item.slug }}
            className="btn-primary mt-6"
          >
            Explore full service <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(capabilities.length
            ? capabilities
            : [{ title: "Connected implementation", body: item.excerpt || "Designed around real operating workflows and measurable outcomes." }]
          ).map((capability) => (
            <div key={capability.title} className="rounded-2xl border border-black/10 bg-white p-4 shadow-[var(--shadow-card)]">
              <h3 className="text-sm font-bold text-ink">{capability.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{capability.body}</p>
            </div>
          ))}
        </div>
      </div>
    </ProfileSection>
  );
}

function TeamMemberSlide({
  member,
  id,
  number,
  total,
  settings,
  backgroundImage,
}: {
  member: PublicTeamMember;
  id: string;
  number: number;
  total: number;
  settings: PublicSiteSettings;
  backgroundImage?: string;
}) {
  const initials = member.display_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <ProfileSection
      id={id}
      number={number}
      total={total}
      chapter="Our team"
      backgroundImage={backgroundImage}
      settings={settings}
    >
      <div className="grid w-full items-center gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-ink shadow-[var(--shadow-card)]">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.display_name} className="aspect-[4/4.65] w-full object-cover object-top" />
            ) : (
              <div className="brand-radial-glow grid aspect-[4/4.65] place-items-center bg-ink">
                <span className="text-7xl font-extrabold tracking-tight text-white/92 sm:text-8xl">{initials}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-5 pt-20 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">{settings.site_name || "Logicsify"}</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{member.display_name}</h2>
              <p className="mt-1.5 text-xs font-semibold text-white/68 sm:text-sm">{member.headline}</p>
            </div>
          </div>
        </div>
        <div className="min-h-0">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-soft">Professional profile</p>
          <h3 className="mt-3 text-3xl font-extrabold leading-[1.05] text-ink sm:text-4xl lg:text-[3.4rem]">
            Experience aligned with practical delivery.
          </h3>
          <p className="mt-5 max-w-4xl text-sm leading-[1.75] text-ink-soft sm:text-base lg:text-[1.02rem]">
            {member.bio || "Part of the Logicsify delivery team, focused on dependable implementation and clear ownership."}
          </p>
          {member.skills_json?.length ? (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">Core areas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.skills_json.map((skill) => (
                  <span key={skill} className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink/75 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ProfileSection>
  );
}

function TeamOverviewSlide({
  team,
  id,
  number,
  total,
  settings,
  backgroundImage,
}: {
  team: PublicTeamMember[];
  id: string;
  number: number;
  total: number;
  settings: PublicSiteSettings;
  backgroundImage?: string;
}) {
  return (
    <ProfileSection
      id={id}
      number={number}
      total={total}
      chapter="Our team"
      backgroundImage={backgroundImage}
      settings={settings}
    >
      <div className="w-full">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Our team"
            title="The people behind connected delivery."
            lead="Team members appear in the same order maintained in Admin → Team, with individual professional profiles following this overview."
            compact
          />
          <Link to="/team" className="btn-primary shrink-0">
            Meet the team <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {team.slice(0, 8).map((member) => (
            <a
              key={member.id}
              href={member.connect_enabled ? `/connect/${member.slug}` : "/team"}
              className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5"
            >
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.display_name}
                  className="size-16 shrink-0 rounded-xl object-cover object-top"
                />
              ) : (
                <span className="brand-radial-glow grid size-16 shrink-0 place-items-center rounded-xl bg-ink text-lg font-extrabold text-white">
                  {member.display_name
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-ink">{member.display_name}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-soft">
                  {member.headline || "Logicsify team"}
                </span>
              </span>
            </a>
          ))}
        </div>
        {team.length > 8 ? (
          <p className="mt-4 text-xs font-semibold text-ink-soft">
            +{team.length - 8} more team member{team.length - 8 === 1 ? "" : "s"} included in the following profile slides.
          </p>
        ) : null}
      </div>
    </ProfileSection>
  );
}

function CompanyProfile() {
  const { services, portfolio, caseStudies, team, settings } = Route.useLoaderData();
  const serviceMap = new Map(services.map((service) => [service.slug, service]));
  const core = coreServiceDefinitions
    .map((definition) => serviceMap.get(definition.slug))
    .filter(Boolean) as CmsContentItem[];
  const specialist = otherServices
    .map((definition) => serviceMap.get(definition.slug))
    .filter(Boolean) as CmsContentItem[];
  const cyber = serviceMap.get("cybersecurity");
  const locations = getSiteLocations(settings);
  const emails = getContactEmails(settings);

  const backgroundPool = useMemo(
    () =>
      PROFILE_BACKGROUND_IMAGES.filter((value): value is string => Boolean(value)),
    [],
  );
  const backgroundFor = (index: number) =>
    backgroundPool.length ? backgroundPool[index % backgroundPool.length] : undefined;

  const ids = [
    "profile-cover",
    "profile-overview",
    "profile-principles",
    ...(core.length ? ["profile-core-services"] : []),
    ...core.map((item) => `profile-core-${item.slug}`),
    ...(cyber ? ["profile-cybersecurity"] : []),
    ...(specialist.length ? ["profile-specialist"] : []),
    "profile-delivery",
    ...(portfolio.length ? ["profile-portfolio"] : []),
    ...(caseStudies.length ? ["profile-case-studies"] : []),
    ...(team.length ? ["profile-team"] : []),
    ...team.map((member) => `profile-team-${slugify(member.display_name)}`),
    "profile-contact",
  ];
  const sectionIds = useMemo(() => ids, [ids.join("|")]);
  const containerRef = useMandatorySlideNavigation(sectionIds);
  const sectionNumber = (id: string) => Math.max(1, sectionIds.indexOf(id) + 1);
  const total = sectionIds.length;
  const [exportingProfile, setExportingProfile] = useState(false);

  async function downloadProfile() {
    if (!containerRef.current || exportingProfile) return;
    setExportingProfile(true);
    try {
      await downloadCompanyProfileHtml(containerRef.current, settings.site_name || "Logicsify");
    } catch (error) {
      console.error("Company profile HTML export failed", error);
      window.alert(error instanceof Error ? error.message : "The company profile could not be downloaded.");
    } finally {
      setExportingProfile(false);
    }
  }

  return (
    <>
      <button
        type="button"
        data-profile-export-ignore="true"
        onClick={() => void downloadProfile()}
        disabled={exportingProfile}
        className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
        title="Download the exact company-profile design as fixed 1920 × 1080 HTML slides"
      >
        {exportingProfile ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {exportingProfile ? "Preparing profile…" : "Download 1920×1080 HTML"}
      </button>
      <div
        ref={containerRef}
      className="profile-scroll h-auto overflow-visible bg-background md:h-[100svh] md:overflow-y-auto"
      tabIndex={0}
    >
      <ProfileSection
        id="profile-cover"
        number={sectionNumber("profile-cover")}
        total={total}
        chapter="Company profile"
        dark
        backgroundImage={backgroundFor(0)}
        settings={settings}
      >
        <div className="grid w-full items-end gap-8 lg:grid-cols-[1.16fr_0.84fr] lg:gap-14">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/58">
              <Sparkles className="size-3.5" /> Interactive company profile
            </div>
            <h1 className="mt-5 max-w-6xl text-5xl font-extrabold leading-[0.92] text-white sm:text-6xl lg:text-[5.8rem] xl:text-[6.7rem]">
              Connected technology. Practical delivery.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/68 sm:text-lg lg:text-xl">
              Logicsify builds AI automation, CRM and revenue operations, custom websites, portals, CMS platforms, cybersecurity, and specialist digital systems around real business workflows.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            {[
              [services.length, "Published service capabilities"],
              [core.length, "Core service families"],
              [portfolio.length, "Portfolio projects"],
              [caseStudies.length, "Case studies"],
              [team.length, "Team profiles"],
            ]
              .filter(([value]) => Number(value) > 0)
              .map(([value, label]) => (
              <div key={label} className="rounded-[1.35rem] border border-white/13 bg-white/[0.065] p-4 backdrop-blur-xl sm:p-5">
                <p className="text-xl font-extrabold text-white sm:text-2xl">{String(value)}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/52">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </ProfileSection>

      <ProfileSection
        id="profile-overview"
        number={sectionNumber("profile-overview")}
        total={total}
        chapter="Company overview"
        backgroundImage={backgroundFor(1)}
        settings={settings}
      >
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="brand-radial-glow grid aspect-[4/4.6] place-items-center overflow-hidden rounded-[2rem] bg-ink shadow-[var(--shadow-card)]">
              <img
                src={optimizedBrandAsset(settings.brand_mark || settings.favicon, DEFAULT_BRAND_ASSETS.brandMark)}
                alt={`${settings.site_name || "Logicsify"} mark`}
                className="h-32 w-32 object-contain sm:h-40 sm:w-40"
              />
            </div>
          </div>
          <div>
            <SectionTitle
              eyebrow="Who we are"
              title="One delivery partner for connected business systems."
              lead="We start with the operating problem, map the users, data, decisions, handoffs and ownership, then build the technology around a clear outcome instead of forcing the business into a tool."
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {core.map((service) => (
                <Link key={service.id} to="/services/$slug" params={{ slug: service.slug }} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Core practice</p>
                  <h3 className="mt-2 font-bold text-ink">{service.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">{service.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ProfileSection>

      <ProfileSection id="profile-principles" number={sectionNumber("profile-principles")} total={total} chapter="Purpose and principles" backgroundImage={backgroundFor(2)} settings={settings}>
        <div className="w-full">
          <SectionTitle eyebrow="What guides us" title="Clear ownership. Connected data. Practical outcomes." lead="We design systems that teams can understand, operate, measure, and improve after launch." />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              [Network, "Connected by design", "Websites, CRM, automation, payments, communications and reporting share context instead of creating another silo."],
              [Workflow, "Operationally clear", "Every workflow has defined states, owners, exceptions, next actions and visible handoffs."],
              [ShieldCheck, "Secure by default", "Access, dependencies, integrations, infrastructure and recovery are treated as part of delivery."],
              [Globe2, "Built to transfer", "Documentation, ownership and maintainability are part of the work so the client is not locked into hidden knowledge."],
            ].map(([Icon, title, body]) => {
              const Component = Icon as typeof Network;
              return (
                <article key={String(title)} className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-brand text-white"><Component className="size-4.5" /></span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{String(title)}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">{String(body)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </ProfileSection>

      {core.length ? (
      <ProfileSection id="profile-core-services" number={sectionNumber("profile-core-services")} total={total} chapter="Core service portfolio" dark backgroundImage={backgroundFor(3)} settings={settings}>
        <div className="w-full">
          <SectionTitle eyebrow="Integrated core practices" title="Three core systems designed to work together." lead="AI conversations, revenue operations and digital platforms connected around the same customer and operating journey." dark />
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {core.map((service, index) => (
              <Link key={service.id} to="/services/$slug" params={{ slug: service.slug }} className="group relative isolate min-h-[17rem] overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/[0.055] p-5 transition-all hover:-translate-y-1 hover:bg-white/[0.08]">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">0{index + 1}</span>
                    <span className="grid size-11 place-items-center rounded-2xl border border-white/12 bg-white/[0.07] text-white"><Layers3 className="size-5" /></span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{service.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/66">{service.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-white/60">Explore practice <ArrowUpRight className="size-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ProfileSection>
      ) : null}

      {core.map((item, index) => {
        const id = `profile-core-${item.slug}`;
        return <CoreServiceSlide key={id} item={item} id={id} number={sectionNumber(id)} total={total} settings={settings} backgroundImage={backgroundFor(4 + index)} />;
      })}

      {cyber ? (
      <ProfileSection id="profile-cybersecurity" number={sectionNumber("profile-cybersecurity")} total={total} chapter="Cybersecurity" backgroundImage={cyber.featured_image || backgroundFor(8)} settings={settings}>
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <div>
            <SectionTitle eyebrow="Dedicated security capability" title="Security built into the system, not added after launch." lead={cyber?.excerpt || "Application, cloud, identity, dependency, integration, monitoring and recovery security tied to practical business risk."} compact />
            <Link to="/services/$slug" params={{ slug: "cybersecurity" }} className="btn-primary mt-6">Explore cybersecurity <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {capabilityRows(cyber).slice(0, 8).map((capability) => (
              <div key={capability.title} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                <ShieldCheck className="size-4 text-ink-soft" />
                <h3 className="mt-3 text-sm font-bold text-ink">{capability.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{capability.body}</p>
              </div>
            ))}
          </div>
        </div>
      </ProfileSection>
      ) : null}

      {specialist.length ? (
      <ProfileSection id="profile-specialist" number={sectionNumber("profile-specialist")} total={total} chapter="Specialist services" dark backgroundImage={backgroundFor(9)} settings={settings}>
        <div className="w-full">
          <SectionTitle eyebrow="Specialist capability" title="Additional expertise around the core operating system." lead="Specialist services are introduced when they remove delivery risk, improve usability, strengthen security, or support growth." dark compact />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specialist.slice(0, 9).map((service) => (
              <Link key={service.id} to="/services/$slug" params={{ slug: service.slug }} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:-translate-y-1 hover:bg-white/[0.08]">
                <h3 className="text-sm font-bold text-white">{service.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/56">{service.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </ProfileSection>
      ) : null}

      <ProfileSection id="profile-delivery" number={sectionNumber("profile-delivery")} total={total} chapter="Delivery model" dark backgroundImage={backgroundFor(10)} settings={settings}>
        <div className="w-full">
          <SectionTitle eyebrow="How we work" title="From operating problem to embedded improvement." lead="Scope, architecture, build, validation and transfer are kept visible throughout delivery." dark compact />
          <div className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-6">
            {[
              ["01", "Understand", "Clarify users, outcome, systems, constraints and ownership."],
              ["02", "Map", "Document data, handoffs, states, decisions, exceptions and dependencies."],
              ["03", "Design", "Turn the operating model into architecture, workflows, interfaces and measures."],
              ["04", "Build", "Deliver in reviewable increments with integrations and security visible."],
              ["05", "Validate", "Test expected paths, failures, permissions, devices, data quality and recovery."],
              ["06", "Improve", "Launch, monitor outcomes, transfer knowledge and prioritize evidence-led changes."],
            ].map(([step, title, body]) => (
              <article key={step} className="rounded-xl border border-white/10 bg-white/[0.055] p-3.5">
                <p className="text-xs font-bold tracking-[0.16em] text-white/55">{step}</p>
                <h3 className="mt-2 text-sm font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/54">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </ProfileSection>

      {portfolio.length ? (
        <ProfileSection id="profile-portfolio" number={sectionNumber("profile-portfolio")} total={total} chapter="Selected portfolio" backgroundImage={backgroundFor(11)} settings={settings}>
          <div className="w-full">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <SectionTitle eyebrow="Selected portfolio" title="Visual work from real Logicsify projects." lead="Portfolio projects are managed separately from Case Studies in Content Studio." compact />
              <Link to="/portfolio" className="btn-ghost-dark">View portfolio <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {portfolio.slice(0, 4).map((item) => (
                <Link key={item.id} to="/portfolio/$slug" params={{ slug: item.slug }} className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1">
                  {item.featured_image ? <img src={item.featured_image} alt={item.title} className="aspect-[4/3] w-full object-cover" /> : <div className="brand-radial-glow grid aspect-[4/3] place-items-center bg-ink"><BriefcaseBusiness className="size-10 text-white/30" /></div>}
                  <div className="p-4"><h3 className="text-sm font-bold text-ink">{item.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">{item.excerpt}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </ProfileSection>
      ) : null}

      {caseStudies.length ? (
        <ProfileSection id="profile-case-studies" number={sectionNumber("profile-case-studies")} total={total} chapter="Case studies" dark backgroundImage={backgroundFor(12)} settings={settings}>
          <div className="w-full">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <SectionTitle eyebrow="Case studies" title="The operating problem, implementation, and measurable outcome." lead="Published Case Studies are pulled directly from Content Studio and remain separate from Portfolio." dark compact />
              <Link to="/work" className="inline-flex items-center gap-2 text-sm font-bold text-white">View all case studies <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {caseStudies.slice(0, 4).map((item) => (
                <Link key={item.id} to="/work/$slug" params={{ slug: item.slug }} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] transition hover:-translate-y-1 hover:bg-white/[0.08]">
                  {item.featured_image ? <img src={item.featured_image} alt={item.title} className="aspect-[4/3] w-full object-cover" /> : <div className="brand-radial-glow grid aspect-[4/3] place-items-center bg-black/25"><BriefcaseBusiness className="size-10 text-white/30" /></div>}
                  <div className="p-4"><h3 className="text-sm font-bold text-white">{item.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/58">{item.excerpt}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </ProfileSection>
      ) : null}

      {team.length ? (
        <TeamOverviewSlide
          team={team}
          id="profile-team"
          number={sectionNumber("profile-team")}
          total={total}
          settings={settings}
          backgroundImage={backgroundFor(13)}
        />
      ) : null}

      {team.map((member, index) => {
        const id = `profile-team-${slugify(member.display_name)}`;
        return <TeamMemberSlide key={id} member={member} id={id} number={sectionNumber(id)} total={total} settings={settings} backgroundImage={backgroundFor(13 + index)} />;
      })}

      <ProfileSection id="profile-contact" number={sectionNumber("profile-contact")} total={total} chapter="Contact" dark backgroundImage={backgroundFor(30)} settings={settings}>
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">{settings.site_name || "Logicsify"}</p>
            <h2 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[0.96] text-white sm:text-6xl lg:text-[5.5rem]">Start with the operating problem.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base">We will help map the first practical technical roadmap before expanding the scope.</p>
          </div>
          <div className="grid gap-3">
            <a href={`mailto:${emails.general}`} className="rounded-[1.35rem] border border-white/11 bg-white/[0.055] p-4 transition hover:bg-white/[0.08]"><span className="flex items-start gap-3"><Mail className="mt-0.5 size-4 text-white/60"/><span><span className="block text-xs font-bold uppercase tracking-[0.18em] text-white/42">Email</span><span className="mt-1 block text-sm font-semibold text-white">{emails.general}</span></span></span></a>
            {settings.phone ? <a href={telHref(settings.phone)} className="rounded-[1.35rem] border border-white/11 bg-white/[0.055] p-4 transition hover:bg-white/[0.08]"><span className="flex items-start gap-3"><Phone className="mt-0.5 size-4 text-white/60"/><span><span className="block text-xs font-bold uppercase tracking-[0.18em] text-white/42">Phone</span><span className="mt-1 block text-sm font-semibold text-white">{settings.phone}</span></span></span></a> : null}
            {locations.map((location) => (
              <div key={location.id} className="rounded-[1.35rem] border border-white/11 bg-white/[0.055] p-4">
                <span className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 text-white/60"/><span><span className="block text-xs font-bold uppercase tracking-[0.18em] text-white/42">{location.name}</span>{getLocationAddresses(location).map((address) => <span key={address} className="mt-1 block text-xs font-semibold leading-relaxed text-white/82">{address}</span>)}{getLocationPhones(location).map((phone) => <a key={phone} href={telHref(phone)} className="mt-1 block text-xs font-semibold text-white/82">{phone}</a>)}</span></span>
              </div>
            ))}
          </div>
        </div>
      </ProfileSection>
      </div>
    </>
  );
}
