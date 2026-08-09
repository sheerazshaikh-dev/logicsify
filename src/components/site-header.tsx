import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { DEFAULT_BRAND_ASSETS, optimizedBrandAsset } from "@/lib/brand-assets";
import { normalizePublicHref } from "@/lib/content-routes";
import { rememberRoadmapSource, trackAnalytics } from "@/lib/analytics";
import {
  getPublicMenu,
  getPublicSiteSettings,
  getCachedPublicSiteSettings,
  type PublicMenuItem,
  type PublicSiteSettings,
} from "@/lib/logicsify-api";

type NavItem = {
  id: number;
  parentId: number | null;
  label: string;
  to: string;
  comingSoon: boolean;
  external: boolean;
  targetBlank: boolean;
  description?: string | null;
  badgeText?: string | null;
  menuStyle: "link" | "dropdown" | "mega";
  columnNumber: number;
  isHeading: boolean;
  hideDesktop: boolean;
  hideMobile: boolean;
  megaPromoEnabled: boolean;
  megaPromoEyebrow?: string | null;
  megaPromoTitle?: string | null;
  megaPromoDescription?: string | null;
  megaPromoButtonLabel?: string | null;
  megaPromoButtonUrl?: string | null;
  megaPromoNewTab: boolean;
  children: NavItem[];
};

const fallbackNavigation = buildFallbackNavigation();

export function SiteHeader() {
  const { location } = useRouterState();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpenId, setMegaOpenId] = useState<number | null>(null);
  const [primaryNav, setPrimaryNav] = useState<NavItem[]>(fallbackNavigation);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings>(getCachedPublicSiteSettings);

  const isHome = location.pathname === "/";
  const stickyHeader = boolSetting(siteSettings.sticky_header, true);
  const transparentHeaderHome = boolSetting(siteSettings.transparent_header_home, true);
  const showHeaderCta = boolSetting(siteSettings.show_header_cta, true);
  const headerCtaLabel = siteSettings.header_cta_label || "Get a Free Technical Roadmap";
  const headerCtaUrl = normalizePublicHref(siteSettings.header_cta_url || "/technical-roadmap");
  const headerCtaNewTab = boolSetting(siteSettings.header_cta_new_tab);
  const desktopLogoHeight = numberSetting(siteSettings.header_logo_height_desktop, 36, 20, 80);
  const mobileLogoHeight = numberSetting(siteSettings.header_logo_height_mobile, 28, 20, 64);
  const announcementEnabled =
    boolSetting(siteSettings.announcement_enabled) &&
    Boolean(siteSettings.announcement_text?.trim());
  const onDark = isHome && !scrolled && transparentHeaderHome;

  const activeMega = useMemo(
    () => primaryNav.find((item) => item.id === megaOpenId) || null,
    [megaOpenId, primaryNav],
  );

  useEffect(() => {
    let active = true;
    Promise.all([getPublicMenu("header"), getPublicSiteSettings()])
      .then(([menu, settings]) => {
        if (!active) return;
        setSiteSettings(settings);
        if (menu.items.length) {
          const tree = mergeFallbackNavigation(buildMenuTree(menu.items));
          if (tree.length) setPrimaryNav(tree);
        }
      })
      .catch(() => undefined);
    const onBrandingUpdated = (event: Event) => {
      const detail = (event as CustomEvent<PublicSiteSettings>).detail;
      if (detail) setSiteSettings(detail);
    };
    window.addEventListener("logicsify:branding-updated", onBrandingUpdated);
    return () => {
      active = false;
      window.removeEventListener("logicsify:branding-updated", onBrandingUpdated);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpenId(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const logo = optimizedBrandAsset(
    onDark ? siteSettings.logo_light : siteSettings.logo_dark,
    onDark ? DEFAULT_BRAND_ASSETS.logoLight : DEFAULT_BRAND_ASSETS.logoDark,
  );
  const logoStyle = {
    "--header-logo-mobile": `${mobileLogoHeight}px`,
    "--header-logo-desktop": `${desktopLogoHeight}px`,
  } as CSSProperties;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-ink focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>
      <header
        data-cms-ignore="true"
        onMouseLeave={() => setMegaOpenId(null)}
        className={cx(
          stickyHeader ? "fixed top-0" : "absolute top-0",
          "left-0 right-0 z-50 transition-all duration-500",
          scrolled || !isHome || !transparentHeaderHome
            ? "bg-white/85 backdrop-blur-xl border-b border-black/5"
            : "bg-transparent",
        )}
      >
        {announcementEnabled ? (
          <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-white">
            <span>{siteSettings.announcement_text}</span>
            {siteSettings.announcement_url ? (
              <a
                href={siteSettings.announcement_url}
                target={boolSetting(siteSettings.announcement_new_tab) ? "_blank" : undefined}
                rel={boolSetting(siteSettings.announcement_new_tab) ? "noreferrer" : undefined}
                className="ml-2 font-semibold text-brand-gold hover:underline"
              >
                {siteSettings.announcement_link_label || "Learn more"}
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="container-page flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Logicsify home">
            <img
              src={logo}
              alt={siteSettings.site_name || "Logicsify"}
              width={928}
              height={onDark ? 224 : 225}
              decoding="async"
              style={logoStyle}
              className="h-[var(--header-logo-mobile)] md:h-[var(--header-logo-desktop)] w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {primaryNav
              .filter((item) => !item.hideDesktop)
              .map((item) => {
                const visibleChildren = item.children.filter((child) => !child.hideDesktop);
                const hasMega = item.menuStyle === "mega" && visibleChildren.length > 0;
                const hasDropdown = item.menuStyle === "dropdown" && visibleChildren.length > 0;
                return (
                  <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => {
                      if (hasMega) {
                        setMegaOpenId(item.id);
                        trackAnalytics("mega_menu_opened", { menu: item.label });
                      }
                    }}
                  >
                    {item.comingSoon ? (
                      <span
                        className={cx(
                          "px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1 cursor-default opacity-60",
                          onDark ? "text-white/85" : "text-ink/80",
                        )}
                        title="Coming soon"
                      >
                        {item.label}
                      </span>
                    ) : item.external ? (
                      <a
                        href={item.to}
                        target={item.targetBlank ? "_blank" : undefined}
                        rel={item.targetBlank ? "noreferrer" : undefined}
                        onClick={() =>
                          trackAnalytics("navigation_item_clicked", {
                            label: item.label,
                            destination: item.to,
                          })
                        }
                        className={cx(
                          "px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1 transition-colors",
                          onDark ? "text-white/85 hover:text-white" : "text-ink/80 hover:text-ink",
                        )}
                      >
                        {item.label}
                        {(hasMega || hasDropdown) && <ChevronDown className="w-3.5 h-3.5" />}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={() =>
                          trackAnalytics("navigation_item_clicked", {
                            label: item.label,
                            destination: item.to,
                          })
                        }
                        className={cx(
                          "px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1 transition-colors",
                          onDark ? "text-white/85 hover:text-white" : "text-ink/80 hover:text-ink",
                        )}
                        activeProps={{
                          className: cx(
                            "px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1",
                            onDark ? "text-white" : "text-ink",
                          ),
                        }}
                      >
                        {item.label}
                        {(hasMega || hasDropdown) && <ChevronDown className="w-3.5 h-3.5" />}
                      </Link>
                    )}
                    {hasDropdown ? <CompactDropdown items={visibleChildren} /> : null}
                  </div>
                );
              })}
          </nav>

          <div className="flex items-center gap-2">
            {showHeaderCta ? (
              <a
                href={headerCtaUrl}
                target={headerCtaNewTab ? "_blank" : undefined}
                rel={headerCtaNewTab ? "noreferrer" : undefined}
                onClick={() => {
                  rememberRoadmapSource("header");
                  trackAnalytics("technical_roadmap_cta_clicked", { placement: "header" });
                }}
                className="hidden md:inline-flex btn-primary text-sm"
              >
                {headerCtaLabel} <ArrowRight className="w-4 h-4" />
              </a>
            ) : null}
            <button
              className={cx(
                "lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border transition-colors",
                onDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-black/10 text-ink hover:bg-black/5",
              )}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeMega ? (
          <DefaultMegaMenu
            item={activeMega}
            fallbackCta={{
              enabled: showHeaderCta,
              label: headerCtaLabel,
              url: headerCtaUrl,
              newTab: headerCtaNewTab,
            }}
            onEnter={() => setMegaOpenId(activeMega.id)}
            onLeave={() => setMegaOpenId(null)}
          />
        ) : null}
      </header>

      <div
        className={cx(
          "fixed inset-0 z-[60] lg:hidden transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cx(
            "absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between p-5 border-b border-black/5">
            <img
              src={optimizedBrandAsset(
                siteSettings.mobile_logo || siteSettings.logo_dark,
                DEFAULT_BRAND_ASSETS.logoDark,
              )}
              alt={siteSettings.site_name || "Logicsify"}
              width={928}
              height={225}
              decoding="async"
              style={logoStyle}
              className="h-[var(--header-logo-mobile)] w-auto"
            />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="h-10 w-10 rounded-full border border-black/10 inline-flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-5 space-y-1">
            {primaryNav
              .filter((item) => !item.hideMobile)
              .map((item) => (
                <MobileMenuItem key={item.id} item={item} />
              ))}
            {showHeaderCta ? (
              <a
                href={headerCtaUrl}
                target={headerCtaNewTab ? "_blank" : undefined}
                rel={headerCtaNewTab ? "noreferrer" : undefined}
                onClick={() => {
                  rememberRoadmapSource("mobile_menu");
                  trackAnalytics("technical_roadmap_cta_clicked", { placement: "mobile_menu" });
                }}
                className="btn-primary w-full justify-center mt-6"
              >
                {headerCtaLabel}
              </a>
            ) : null}
          </nav>
        </div>
      </div>
    </>
  );
}

function DefaultMegaMenu({
  item,
  fallbackCta,
  onEnter,
  onLeave,
}: {
  item: NavItem;
  fallbackCta: { enabled: boolean; label: string; url: string; newTab: boolean };
  onEnter: () => void;
  onLeave: () => void;
}) {
  const groups = normalizeMegaGroups(item);
  const promoEnabled = item.megaPromoEnabled !== false;
  const promoLabel = item.megaPromoButtonLabel || fallbackCta.label;
  const promoUrl = item.megaPromoButtonUrl || fallbackCta.url;
  const promoNewTab = item.megaPromoButtonUrl ? item.megaPromoNewTab : fallbackCta.newTab;

  return (
    <div
      className="hidden lg:block absolute inset-x-0 top-full origin-top transition-all duration-300 opacity-100 pointer-events-auto translate-y-0"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="container-page pt-2">
        <div className="rounded-3xl bg-white shadow-[var(--shadow-card)] border border-black/5 overflow-hidden">
          <div className="grid grid-cols-12">
            <div
              className={cx(
                promoEnabled ? "col-span-9" : "col-span-12",
                "grid gap-7 p-8",
                groups.length <= 2
                  ? "grid-cols-2"
                  : groups.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 xl:grid-cols-4",
              )}
            >
              {groups.slice(0, 4).map((group) => (
                <div key={group.id}>
                  <p className="eyebrow mb-4">{group.label}</p>
                  <ul className="space-y-3">
                    {group.children
                      .filter((child) => !child.hideDesktop)
                      .map((child) => (
                        <li key={child.id}>
                          {child.comingSoon ? (
                            <span
                              className="group block cursor-default opacity-50"
                              title="Coming soon"
                            >
                              <span className="text-sm font-semibold text-ink">{child.label}</span>
                              <span className="block text-xs text-ink-soft mt-0.5">
                                {child.description || "Coming soon"}
                              </span>
                            </span>
                          ) : (
                            <a
                              href={child.to}
                              target={child.targetBlank ? "_blank" : undefined}
                              rel={child.targetBlank ? "noreferrer" : undefined}
                              onClick={() =>
                                trackAnalytics("navigation_item_clicked", {
                                  label: child.label,
                                  destination: child.to,
                                })
                              }
                              className="group block"
                            >
                              <span className="text-sm font-semibold text-ink group-hover:text-gradient transition-colors">
                                {child.label}
                              </span>
                              {child.description ? (
                                <span className="block text-xs text-ink-soft mt-0.5">
                                  {child.description}
                                </span>
                              ) : null}
                            </a>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
            {promoEnabled ? (
              <div className="col-span-3 p-8 bg-ink text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-40 brand-radial-glow" />
                <div className="relative">
                  <p className="eyebrow text-white/60 mb-3">
                    {item.megaPromoEyebrow || "Technical roadmap"}
                  </p>
                  <h3 className="text-xl font-semibold leading-tight mb-2">
                    {item.megaPromoTitle || "Plan the right system before you build"}
                  </h3>
                  <p className="text-sm text-white/70 mb-6">
                    {item.megaPromoDescription ||
                      "Share your current systems and priorities. We will outline the clearest technical path forward."}
                  </p>
                  {promoUrl && (item.megaPromoButtonUrl || fallbackCta.enabled) ? (
                    <a
                      href={promoUrl}
                      target={promoNewTab ? "_blank" : undefined}
                      rel={promoNewTab ? "noreferrer" : undefined}
                      onClick={() =>
                        trackAnalytics("technical_roadmap_cta_clicked", { placement: "mega_menu" })
                      }
                      className="btn-primary text-sm"
                    >
                      {promoLabel} <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactDropdown({ items }: { items: NavItem[] }) {
  return (
    <div className="absolute left-0 top-full hidden min-w-64 pt-2 group-hover:block">
      <div className="rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
        {items.map((item) =>
          item.comingSoon || item.isHeading ? (
            <span key={item.id} className="block rounded-xl px-3 py-2.5 text-sm text-ink/45">
              {item.label}
            </span>
          ) : (
            <a
              key={item.id}
              href={item.to}
              target={item.targetBlank ? "_blank" : undefined}
              rel={item.targetBlank ? "noreferrer" : undefined}
              onClick={() =>
                trackAnalytics("navigation_item_clicked", {
                  label: item.label,
                  destination: item.to,
                })
              }
              className="block rounded-xl px-3 py-2.5 text-sm text-ink/75 hover:bg-lavender hover:text-ink"
            >
              <span className="font-medium">{item.label}</span>
              {item.description ? (
                <span className="mt-0.5 block text-xs text-ink-soft">{item.description}</span>
              ) : null}
            </a>
          ),
        )}
      </div>
    </div>
  );
}

function MobileMenuItem({ item }: { item: NavItem }) {
  const children = item.children.filter((child) => !child.hideMobile);
  if (item.comingSoon) {
    return (
      <span
        className="block px-3 py-3 rounded-xl text-lg font-semibold text-ink/45"
        title="Coming soon"
      >
        {item.label}
      </span>
    );
  }
  if (children.length) {
    return (
      <details className="group">
        <summary className="flex items-center justify-between px-3 py-3 cursor-pointer text-lg font-semibold text-ink rounded-xl hover:bg-lavender">
          {item.label}
          <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="pl-3 pb-2">
          {!item.isHeading ? (
            <a href={item.to} className="block px-3 py-2 text-sm font-semibold text-brand-red">
              View all {item.label}
            </a>
          ) : null}
          {normalizeMegaGroups(item).map((group) => (
            <div key={group.id} className="mt-2">
              <p className="px-3 py-2 text-xs uppercase tracking-widest text-ink-soft font-semibold">
                {group.label}
              </p>
              {group.children
                .filter((child) => !child.hideMobile)
                .map((child) =>
                  child.comingSoon ? (
                    <span key={child.id} className="block px-3 py-2 text-sm text-ink/40">
                      {child.label}
                    </span>
                  ) : (
                    <a
                      key={child.id}
                      href={child.to}
                      target={child.targetBlank ? "_blank" : undefined}
                      rel={child.targetBlank ? "noreferrer" : undefined}
                      onClick={() =>
                        trackAnalytics("navigation_item_clicked", {
                          label: child.label,
                          destination: child.to,
                        })
                      }
                      className="block px-3 py-2 text-sm text-ink hover:text-brand-red"
                    >
                      {child.label}
                    </a>
                  ),
                )}
            </div>
          ))}
        </div>
      </details>
    );
  }
  return (
    <a
      href={item.to}
      target={item.targetBlank ? "_blank" : undefined}
      rel={item.targetBlank ? "noreferrer" : undefined}
      onClick={() =>
        trackAnalytics("navigation_item_clicked", { label: item.label, destination: item.to })
      }
      className="block px-3 py-3 rounded-xl text-lg font-semibold text-ink hover:bg-lavender"
    >
      {item.label}
    </a>
  );
}

function normalizeMegaGroups(item: NavItem): NavItem[] {
  const visible = item.children.filter((child) => !child.hideDesktop);
  const explicitGroups = visible.filter((child) => child.isHeading || child.children.length > 0);
  if (explicitGroups.length) return explicitGroups;

  const columns = [1, 2, 3, 4, 5].map((column) =>
    visible.filter((child) => Math.min(5, Math.max(1, child.columnNumber || 1)) === column),
  );
  return columns.map((children, index) => ({
    ...fallbackGroup(-9000 - index, `Column ${index + 1}`, index + 1),
    children,
  }));
}

function mergeFallbackNavigation(items: NavItem[]): NavItem[] {
  const visibleItems = items.filter((item) => navKey(item) !== "industries");
  const byKey = new Map(visibleItems.map((item) => [navKey(item), item]));
  return fallbackNavigation.map((fallback) => {
    const existing = byKey.get(navKey(fallback));
    if (!existing) return fallback;
    return {
      ...existing,
      label: fallback.label,
      to: fallback.to,
      menuStyle: fallback.children.length ? "mega" : "link",
      children: existing.children.length ? existing.children : fallback.children,
      comingSoon: false,
      hideDesktop: false,
      hideMobile: false,
      megaPromoEnabled: existing.megaPromoEnabled,
      megaPromoEyebrow: existing.megaPromoEyebrow || fallback.megaPromoEyebrow,
      megaPromoTitle: existing.megaPromoTitle || fallback.megaPromoTitle,
      megaPromoDescription: existing.megaPromoDescription || fallback.megaPromoDescription,
      megaPromoButtonLabel: existing.megaPromoButtonLabel || fallback.megaPromoButtonLabel,
      megaPromoButtonUrl: existing.megaPromoButtonUrl || fallback.megaPromoButtonUrl,
    };
  });
}

function navKey(item: NavItem) {
  return item.label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function buildMenuTree(items: PublicMenuItem[]): NavItem[] {
  const normalized = items.map(mapPublicMenuItem);
  const byId = new Map(normalized.map((item) => [item.id, item]));
  const roots: NavItem[] = [];
  normalized.forEach((item) => {
    if (item.parentId && byId.has(item.parentId) && item.parentId !== item.id) {
      byId.get(item.parentId)?.children.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
}

function mapPublicMenuItem(item: PublicMenuItem): NavItem {
  return {
    id: Number(item.id),
    parentId: item.parent_id ? Number(item.parent_id) : null,
    label: item.label,
    to: normalizePublicHref(item.url || "#"),
    comingSoon: boolSetting(item.coming_soon),
    external: boolSetting(item.is_external),
    targetBlank: boolSetting(item.target_blank),
    description: item.description,
    badgeText: item.badge_text,
    menuStyle:
      item.menu_style === "mega" || item.menu_style === "dropdown" ? item.menu_style : "link",
    columnNumber: numberSetting(item.column_number, 1, 1, 5),
    isHeading: boolSetting(item.is_heading),
    hideDesktop: boolSetting(item.hide_desktop),
    hideMobile: boolSetting(item.hide_mobile),
    megaPromoEnabled:
      item.mega_promo_enabled === undefined ? true : boolSetting(item.mega_promo_enabled),
    megaPromoEyebrow: item.mega_promo_eyebrow,
    megaPromoTitle: item.mega_promo_title,
    megaPromoDescription: item.mega_promo_description,
    megaPromoButtonLabel: item.mega_promo_button_label,
    megaPromoButtonUrl: item.mega_promo_button_url
      ? normalizePublicHref(item.mega_promo_button_url)
      : item.mega_promo_button_url,
    megaPromoNewTab: boolSetting(item.mega_promo_new_tab),
    children: [],
  };
}

function buildFallbackNavigation(): NavItem[] {
  let nextId = -1000;
  const group = (title: string, column: number, items: Array<[string, string, string?]>) => {
    const groupId = nextId--;
    return {
      ...fallbackGroup(groupId, title, column),
      children: items.map(([label, to, description]) => ({
        ...fallbackLink(nextId--, label, to),
        parentId: groupId,
        description: description || null,
        columnNumber: column,
      })),
    };
  };
  const root = (
    label: string,
    to: string,
    children: NavItem[],
    promo: { eyebrow: string; title: string; description: string; label: string; url: string },
  ) => ({
    ...fallbackLink(nextId--, label, to),
    menuStyle: children.length ? ("mega" as const) : ("link" as const),
    megaPromoEnabled: true,
    megaPromoEyebrow: promo.eyebrow,
    megaPromoTitle: promo.title,
    megaPromoDescription: promo.description,
    megaPromoButtonLabel: promo.label,
    megaPromoButtonUrl: promo.url,
    children,
  });

  const services = root(
    "Services",
    "/services",
    [
      group("AI Automation & Voice Agents", 1, [
        ["Core service overview", "/services/ai-automation-voice-agents"],
        ["AI Calling Agents", "/services/ai-calling-agents"],
        ["Appointment-Booking Agents", "/services/appointment-booking-agents"],
        ["Lead Qualification Agents", "/services/lead-qualification-agents"],
        ["AI Support Chatbots", "/services/ai-support-chatbots"],
        ["Document Extraction", "/services/document-extraction-processing"],
      ]),
      group("CRM & Revenue Operations", 2, [
        ["Core service overview", "/services/crm-revenue-operations"],
        ["GoHighLevel Implementation", "/services/gohighlevel-implementation"],
        ["HubSpot Implementation", "/services/hubspot-implementation"],
        ["Custom CRM Development", "/services/custom-crm-development"],
        ["Pipeline & Lead Routing", "/services/sales-pipeline-lead-routing"],
        ["CRM Migration & Optimization", "/services/crm-migration-optimization"],
      ]),
      group("Websites, Portals & CMS", 3, [
        ["Core service overview", "/services/custom-websites-portals-cms"],
        ["Business Websites", "/services/conversion-focused-business-websites"],
        ["Custom CMS Platforms", "/services/custom-cms-platforms"],
        ["WordPress Modernization", "/services/wordpress-modernization"],
        ["Customer & Employee Portals", "/services/customer-employee-portals"],
        ["Dashboards & Admin Panels", "/services/custom-dashboards-admin-panels"],
      ]),
      group("Other Services", 4, [
        ["Mobile App Development", "/services/mobile-app-development"],
        ["UI/UX Design", "/services/ui-ux-design"],
        ["SEO & Digital Marketing", "/services/seo-digital-marketing"],
        ["Branding", "/services/branding"],
        ["Cloud & Maintenance", "/services/cloud-maintenance"],
        [
          "Supported Integrations",
          "/integrations",
          "CRM, AI, payments, communication, development, and automation platforms.",
        ],
      ]),
    ],
    {
      eyebrow: "Connected business systems",
      title: "Start with the operating problem",
      description:
        "Choose a core service, then review the exact subservice pages that fit the workflow.",
      label: "Explore All Services",
      url: "/services",
    },
  );

  const resources = root(
    "Resources",
    "/resources",
    [
      group("General", 1, [
        ["Insights", "/insights", "Articles, analysis, company news, and practical guides."],
        ["Guides", "/guides", "Downloadable PDFs, checklists, audits, and templates."],
        ["Case Studies", "/work", "Published work connected to real operating problems."],
        [
          "Engagement Models",
          "/engagement-models",
          "Compare project, support, team, and consulting models.",
        ],
      ]),
      group("Interactive Tools", 2, [
        [
          "Automation Lab",
          "/automation-lab",
          "Five controlled AI, voice, CRM, document, and support demos.",
        ],
        [
          "Project Estimator",
          "/project-estimator",
          "An eight-step form for scope, timeline, and complexity.",
        ],
        [
          "Comparisons",
          "/comparisons",
          "Balanced decision pages for technology and delivery choices.",
        ],
        [
          "Technical Roadmap",
          "/technical-roadmap",
          "Submit the problem, systems, budget, and timeline.",
        ],
      ]),
    ],
    {
      eyebrow: "Plan before you build",
      title: "Use the estimator and automation demos",
      description:
        "Explore the content hub, download guides, compare options, or test a controlled workflow.",
      label: "Open Resources",
      url: "/resources",
    },
  );

  return [
    fallbackLink(nextId--, "Home", "/"),
    fallbackLink(nextId--, "Who We Are", "/about"),
    services,
    fallbackLink(nextId--, "Work", "/work"),
    resources,
    fallbackLink(nextId--, "Contact", "/contact"),
  ];
}

function fallbackGroup(id: number, label: string, columnNumber: number): NavItem {
  return {
    ...fallbackLink(id, label, "#"),
    isHeading: true,
    columnNumber,
  };
}

function fallbackLink(id: number, label: string, to: string): NavItem {
  return {
    id,
    parentId: null,
    label,
    to,
    comingSoon: false,
    external: false,
    targetBlank: false,
    description: null,
    badgeText: null,
    menuStyle: "link",
    columnNumber: 1,
    isHeading: false,
    hideDesktop: false,
    hideMobile: false,
    megaPromoEnabled: true,
    megaPromoEyebrow: null,
    megaPromoTitle: null,
    megaPromoDescription: null,
    megaPromoButtonLabel: null,
    megaPromoButtonUrl: null,
    megaPromoNewTab: false,
    children: [],
  };
}

function boolSetting(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function numberSetting(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
