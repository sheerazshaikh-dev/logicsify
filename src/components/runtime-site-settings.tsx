import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  getPublicSiteSettings,
  getPublicThemeSettings,
  type PublicThemeSettings,
} from "@/lib/logicsify-api";
import { DEFAULT_BRAND_ASSETS, optimizedBrandAsset, withDefaultBranding } from "@/lib/brand-assets";
import { injectRuntimeStyle } from "@/lib/runtime-code";
import { applyThemeVariables } from "@/lib/theme-runtime";

function upsertMeta(selector: string, attributes: Record<string, string>, content?: string) {
  if (!content) return;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertLink(rel: string, href?: string) {
  if (!href) return;
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function boolSetting(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}

function cacheTheme(settings: PublicThemeSettings) {
  try {
    const variables: Record<string, string> = {};
    const set = (name: string, value: string | number | undefined, suffix = "") => {
      if (value !== undefined && value !== null && value !== "") {
        variables[name] = `${value}${suffix}`;
      }
    };
    set("--theme-primary-start", settings.primary_start);
    set("--theme-primary-end", settings.primary_end);
    set("--theme-dark", settings.dark);
    set("--theme-background", settings.background);
    set("--theme-surface", settings.surface);
    set("--theme-text", settings.text);
    set("--theme-muted-text", settings.muted_text);
    set("--theme-border", settings.border);
    set(
      "--theme-heading-font",
      settings.heading_font
        ? `"${settings.heading_font}", ui-sans-serif, system-ui, sans-serif`
        : undefined,
    );
    set(
      "--theme-body-font",
      settings.body_font
        ? `"${settings.body_font}", ui-sans-serif, system-ui, sans-serif`
        : undefined,
    );
    set("--theme-base-font-size", settings.base_font_size, "px");
    set("--theme-h1-min", settings.h1_min, "px");
    set("--theme-h1-max", settings.h1_max, "px");
    set("--theme-h2-min", settings.h2_min, "px");
    set("--theme-h2-max", settings.h2_max, "px");
    set("--theme-h3-min", settings.h3_min, "px");
    set("--theme-h3-max", settings.h3_max, "px");
    set("--theme-nav-font-size", settings.nav_font_size, "px");
    set("--theme-button-font-size", settings.button_font_size, "px");
    set("--theme-small-font-size", settings.small_font_size, "px");
    set("--theme-container-max-width", settings.container_max_width, "px");
    set("--theme-section-spacing-desktop", settings.section_spacing_desktop, "px");
    set("--theme-section-spacing-mobile", settings.section_spacing_mobile, "px");
    set("--theme-card-radius", settings.card_radius, "px");
    set("--theme-button-radius", settings.button_radius, "px");
    set("--theme-input-radius", settings.input_radius, "px");
    set("--theme-gradient-angle", settings.gradient_angle, "deg");
    set("--theme-animation-speed", settings.animation_speed);
    set("--theme-shadow-strength", settings.shadow_strength);
    localStorage.setItem(
      "logicsify:theme:v2",
      JSON.stringify({
        version: 2,
        variables,
        customCss:
          settings.website_custom_css_enabled !== false
            ? String(settings.website_custom_css || "")
            : "",
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Storage can be unavailable in private browsing; theme application still succeeds.
  }
}

export function RuntimeSiteSettings() {
  const location = useLocation();

  useEffect(() => {
    let active = true;
    Promise.all([getPublicSiteSettings(), getPublicThemeSettings()]).then(
      ([loadedSettings, themeSettings]) => {
        if (!active) return;
        applyThemeVariables(themeSettings);
        cacheTheme(themeSettings);
        const safeRuntime = new URLSearchParams(window.location.search).get("safe-runtime") === "1";
        const isAdminRoute =
          location.pathname.startsWith("/admin") || location.pathname.startsWith("/control/");
        injectRuntimeStyle(
          "public-custom-css",
          !safeRuntime && !isAdminRoute && themeSettings.website_custom_css_enabled !== false
            ? themeSettings.website_custom_css
            : "",
        );
        const settings = withDefaultBranding(loadedSettings);

        const favicon = optimizedBrandAsset(settings.favicon, DEFAULT_BRAND_ASSETS.favicon);
        const appleTouchIcon = optimizedBrandAsset(
          settings.apple_touch_icon || settings.favicon,
          DEFAULT_BRAND_ASSETS.appleTouchIcon,
        );
        upsertLink("icon", favicon);
        upsertLink("shortcut icon", favicon);
        upsertLink("apple-touch-icon", appleTouchIcon);
        upsertMeta(
          'meta[name="theme-color"]',
          { name: "theme-color" },
          settings.theme_color || "#000000",
        );

        if (window.location.pathname === "/") {
          if (settings.default_seo_title) document.title = settings.default_seo_title;
          upsertMeta(
            'meta[name="description"]',
            { name: "description" },
            settings.default_seo_description,
          );
          upsertMeta(
            'meta[property="og:title"]',
            { property: "og:title" },
            settings.default_seo_title,
          );
          upsertMeta(
            'meta[property="og:description"]',
            { property: "og:description" },
            settings.default_seo_description,
          );
          upsertMeta(
            'meta[property="og:image"]',
            { property: "og:image" },
            settings.default_og_image,
          );
          upsertMeta(
            'meta[name="twitter:image"]',
            { name: "twitter:image" },
            settings.default_og_image,
          );
          upsertMeta(
            'meta[name="robots"]',
            { name: "robots" },
            `${boolSetting(settings.robots_index, true) ? "index" : "noindex"},${
              boolSetting(settings.robots_follow, true) ? "follow" : "nofollow"
            }`,
          );
        }
      },
    );

    return () => {
      active = false;
    };
  }, [location.pathname]);

  return null;
}
