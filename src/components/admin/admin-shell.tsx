import { useLocation } from "@tanstack/react-router";
import {
  ArchiveRestore,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileText,
  FileDown,
  Scale,
  Handshake,
  PlugZap,
  Gauge,
  Globe2,
  Images,
  Layers3,
  LogOut,
  Menu as MenuIcon,
  MessageSquareText,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Users,
  UserCog,
  Workflow,
  Paintbrush,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  adminLogout,
  getSecurityConfig,
  getAdminRuntimeCustomization,
  clearAdminToken,
  getAdminToken,
  getCurrentAdmin,
  type Administrator,
} from "@/lib/admin-api";
import { AdminLoading } from "@/components/admin/admin-ui";
import { getPublicSiteSettings, type PublicSiteSettings } from "@/lib/logicsify-api";
import { DEFAULT_BRAND_ASSETS, optimizedBrandAsset, withDefaultBranding } from "@/lib/brand-assets";
import { adminHref, getAdminSection, legacyAdminPath } from "@/lib/admin-path";
import { injectCodeSnippets, injectRuntimeStyle, removeRuntimeNamespace } from "@/lib/runtime-code";

const navigation = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin/dashboard", section: "dashboard", icon: Gauge }],
  },
  {
    label: "Content",
    items: [
      { label: "Pages", to: "/admin/pages", section: "pages", icon: FileText },
      { label: "Services", to: "/admin/services", section: "services", icon: Sparkles },
      { label: "Case Studies", to: "/admin/case-studies", section: "case-studies", icon: BriefcaseBusiness },
      { label: "Portfolio", to: "/admin/portfolio", section: "portfolio", icon: Images },
      { label: "Insights", to: "/admin/insights", section: "insights", icon: Newspaper },
      { label: "Careers", to: "/admin/careers", section: "careers", icon: BookOpen },
      { label: "Testimonials", to: "/admin/testimonials", section: "testimonials", icon: MessageSquareText },
      { label: "Team / Connect", to: "/admin/team-connect", section: "team-connect", icon: Users },
      { label: "Guides", to: "/admin/guides", section: "guides", icon: FileDown },
      { label: "Comparisons", to: "/admin/comparisons", section: "comparisons", icon: Scale },
      { label: "Engagement Models", to: "/admin/engagement-models", section: "engagement-models", icon: Handshake },
      { label: "Integrations", to: "/admin/integrations", section: "integrations", icon: PlugZap },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Leads", to: "/admin/leads", section: "leads", icon: Layers3 },
      { label: "Bookings", to: "/admin/bookings", section: "bookings", icon: CalendarDays },
      { label: "Media", to: "/admin/media", section: "media", icon: Images },
      { label: "Menus", to: "/admin/menus", section: "menus", icon: Workflow },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Site Health", to: "/admin/site-health", section: "site-health", icon: SearchCheck },
      { label: "Settings", to: "/admin/settings", section: "settings", icon: Settings },
      { label: "Global Branding", to: "/admin/global-styling", section: "global-styling", icon: Paintbrush },
      { label: "Administrators", to: "/admin/administrators", section: "administrators", icon: ShieldCheck },
      { label: "Recycle Bin", to: "/admin/trash", section: "trash", icon: ArchiveRestore },
      { label: "Security", to: "/admin/security", section: "security", icon: ShieldCheck },
      { label: "My Account", to: "/admin/account", section: "account", icon: UserCog },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings>({});

  useEffect(() => {
    let alive = true;
    if (!getAdminToken()) {
      if (typeof window !== "undefined") window.location.replace(adminHref("login"));
      return;
    }
    getCurrentAdmin()
      .then((result) => {
        if (alive) setAdmin(result);
      })
      .catch(() => {
        clearAdminToken();
        if (typeof window !== "undefined") window.location.replace(adminHref("login"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const nextAdmin = (event as CustomEvent<Administrator>).detail;
      if (nextAdmin) setAdmin(nextAdmin);
    };
    window.addEventListener("logicsify:admin-profile-updated", onProfileUpdated);
    return () => window.removeEventListener("logicsify:admin-profile-updated", onProfileUpdated);
  }, []);

  useEffect(() => {
    getPublicSiteSettings().then((settings) => setSiteSettings(withDefaultBranding(settings)));
    const onBrandingUpdated = (event: Event) => {
      const detail = (event as CustomEvent<PublicSiteSettings>).detail;
      if (detail) setSiteSettings(withDefaultBranding(detail));
    };
    window.addEventListener("logicsify:branding-updated", onBrandingUpdated);
    return () => window.removeEventListener("logicsify:branding-updated", onBrandingUpdated);
  }, []);

  useEffect(() => {
    if (!admin || typeof window === "undefined") return;
    const safeAdmin = new URLSearchParams(window.location.search).get("safe-admin") === "1";
    if (safeAdmin) {
      injectRuntimeStyle("admin-custom-css", "");
      return;
    }

    injectRuntimeStyle("public-custom-css", "");
    getAdminRuntimeCustomization()
      .then((customization) => {
        injectRuntimeStyle(
          "admin-custom-css",
          customization.admin_custom_css_enabled !== false
            ? customization.admin_custom_css
            : "",
        );
        injectCodeSnippets(customization.snippets, "admin", "admin-snippet");
      })
      .catch(() => undefined);

    return () => {
      injectRuntimeStyle("admin-custom-css", "");
      removeRuntimeNamespace("admin-snippet");
    };
  }, [admin]);

  useEffect(() => {
    if (!admin || !legacyAdminPath(location.pathname)) return;
    getSecurityConfig().then((security) => {
      if (security.legacy_admin_path_enabled === false && security.admin_entry_path) {
        const section = getAdminSection(location.pathname);
        const base = security.admin_entry_path.replace(/\/login$/, "");
        window.location.replace(`${base}/${section}`);
      }
    }).catch(() => undefined);
  }, [admin, location.pathname]);

  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previous = robots.content;
    robots.content = "noindex, nofollow, noarchive";
    return () => {
      if (created) robots?.remove();
      else if (robots) robots.content = previous;
    };
  }, []);

  const currentSection = getAdminSection(location.pathname);
  const pageTitle = useMemo(() => {
    for (const group of navigation) {
      const match = group.items.find((item) => item.section === currentSection);
      if (match) return match.label;
    }
    return "Admin";
  }, [currentSection]);

  async function logout() {
    try {
      await adminLogout();
    } catch {
      // Clear locally even when the API is unreachable.
    }
    clearAdminToken();
    if (typeof window !== "undefined") window.location.replace(adminHref("login"));
  }

  if (loading || !admin) {
    return (
      <div className="logicsify-admin min-h-dvh bg-slate-50">
        <AdminLoading label={`Opening ${siteSettings.site_name || "Logicsify"} Admin…`} />
      </div>
    );
  }

  const sidebar = (
    <aside
      className={`admin-sidebar flex h-full flex-col border-r border-white/10 bg-ink text-white transition-all duration-300 ${collapsed ? "w-[88px]" : "w-[274px]"}`}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <a href={adminHref("dashboard", location.pathname)} className="flex min-w-0 items-center gap-3 overflow-hidden">
          {collapsed ? (
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl shadow-lg">
              <img
                src={optimizedBrandAsset(siteSettings.brand_mark || siteSettings.favicon, DEFAULT_BRAND_ASSETS.brandMark)}
                alt="Logicsify"
                className="h-full w-full object-contain"
              />
            </span>
          ) : (
            <div className="min-w-0">
              <img
                src={optimizedBrandAsset(siteSettings.admin_logo, DEFAULT_BRAND_ASSETS.adminLogo)}
                alt={siteSettings.site_name || "Logicsify"}
                className="h-8 w-auto max-w-[164px] object-contain object-left"
              />
              <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Content Studio
              </p>
            </div>
          )}
        </a>
        <button
          className="hidden rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white lg:block"
          onClick={() => setCollapsed((value) => !value)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
        <button
          className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = currentSection === item.section;
                const Icon = item.icon;
                const hiddenForRole =
                  (item.to === "/admin/administrators" && admin.role !== "super_admin") ||
                  ((item.section === "settings" || item.section === "global-styling") &&
                    admin.role === "editor");
                if (hiddenForRole) return null;
                return (
                  <a
                    key={item.to}
                    href={adminHref(item.section, location.pathname)}
                    title={collapsed ? item.label : undefined}
                    data-admin-active={active ? "true" : "false"}
                    className={`group flex h-11 items-center rounded-xl px-3 text-sm font-medium transition ${
                      active
                        ? "bg-white text-ink shadow-lg"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    } ${collapsed ? "justify-center" : "gap-3"}`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 ${active ? "text-brand-red" : ""}`}
                    />
                    {!collapsed ? <span>{item.label}</span> : null}
                    {!collapsed && active ? (
                      <ChevronRight className="ml-auto h-4 w-4 text-brand-red" />
                    ) : null}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <a
          href={siteSettings.site_url || "/"}
          target="_blank"
          rel="noreferrer"
          className={`flex h-11 items-center rounded-xl px-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <Globe2 className="h-[18px] w-[18px]" />
          {!collapsed ? "View website" : null}
        </a>
      </div>
    </aside>
  );

  return (
    <div className="logicsify-admin admin-shell-canvas min-h-dvh bg-cream text-slate-900">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/55"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[274px]">{sidebar}</div>
        </div>
      ) : null}

      <div
        className={`min-h-dvh transition-all duration-300 ${collapsed ? "lg:pl-[88px]" : "lg:pl-[274px]"}`}
      >
        <header className="admin-topbar sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl md:px-7">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Admin Panel
              </p>
              <p className="font-display text-lg font-semibold text-ink">{pageTitle}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-3 rounded-2xl border border-transparent px-2 py-1.5 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-sm font-bold text-white">
                {admin.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-ink">{admin.name}</span>
                <span className="block text-[11px] capitalize text-slate-400">
                  {admin.role.replaceAll("_", " ")}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-ink">{admin.email}</p>
                  <p className="mt-0.5 text-xs capitalize text-slate-400">
                    {admin.role.replaceAll("_", " ")}
                  </p>
                </div>
                <a
                  href={adminHref("account", location.pathname)}
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-slate-50"
                >
                  <UserCog className="h-4 w-4" /> My account
                </a>
                <button
                  onClick={logout}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="p-4 md:p-7 xl:p-9">{children}</main>
      </div>
    </div>
  );
}
