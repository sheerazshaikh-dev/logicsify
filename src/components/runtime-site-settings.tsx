import { useEffect } from "react";
import { getPublicSiteSettings } from "@/lib/logicsify-api";
import { DEFAULT_BRAND_ASSETS, withDefaultBranding } from "@/lib/brand-assets";

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

export function RuntimeSiteSettings() {
  useEffect(() => {
    let active = true;
    getPublicSiteSettings().then((loadedSettings) => {
      if (!active) return;
      const settings = withDefaultBranding(loadedSettings);

      upsertLink("icon", settings.favicon || DEFAULT_BRAND_ASSETS.favicon);
      upsertLink("shortcut icon", settings.favicon || DEFAULT_BRAND_ASSETS.favicon);
      upsertLink(
        "apple-touch-icon",
        settings.apple_touch_icon || settings.favicon || DEFAULT_BRAND_ASSETS.appleTouchIcon,
      );
      upsertMeta(
        'meta[name="theme-color"]',
        { name: "theme-color" },
        settings.theme_color || "#190A2F",
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
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
