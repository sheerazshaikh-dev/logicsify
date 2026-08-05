export const DEFAULT_BRAND_ASSETS = {
  logoLight: "/logicsify-logo-light.png",
  logoDark: "/logicsify-logo-dark.png",
  mobileLogo: "/logicsify-logo-dark.png",
  adminLogo: "/logicsify-logo-light.png",
  adminLogoDark: "/logicsify-logo-dark.png",
  favicon: "/favicon.png",
  appleTouchIcon: "/apple-touch-icon.png",
} as const;

export const DEFAULT_SITE_BRANDING = {
  logo_dark: DEFAULT_BRAND_ASSETS.logoDark,
  logo_light: DEFAULT_BRAND_ASSETS.logoLight,
  mobile_logo: DEFAULT_BRAND_ASSETS.mobileLogo,
  admin_logo: DEFAULT_BRAND_ASSETS.adminLogo,
  favicon: DEFAULT_BRAND_ASSETS.favicon,
  apple_touch_icon: DEFAULT_BRAND_ASSETS.appleTouchIcon,
  footer_logo: DEFAULT_BRAND_ASSETS.logoLight,
} as const;

/**
 * CMS branding records may point at the original full-resolution uploads.
 * The header and footer only need the optimized, visually identical copies
 * shipped with the frontend.
 */
export function optimizedBrandAsset(value: string | null | undefined, fallback: string): string {
  const source = value?.trim() || fallback;
  const path = source.split(/[?#]/, 1)[0].toLowerCase();
  if (/\/(?:light-[a-f0-9]+|logicsify-logo-light)\.png$/.test(path)) {
    return DEFAULT_BRAND_ASSETS.logoLight;
  }
  if (/\/(?:dark-[a-f0-9]+|logicsify-logo-dark)\.png$/.test(path)) {
    return DEFAULT_BRAND_ASSETS.logoDark;
  }
  if (/\/(?:icon-[a-f0-9]+|logicsify-mark)\.png$/.test(path)) {
    return "/logicsify-mark.png";
  }
  return source;
}

export function withDefaultBranding<T extends Record<string, unknown>>(
  settings: T,
): T & typeof DEFAULT_SITE_BRANDING {
  const result: Record<string, unknown> = { ...settings };
  for (const [key, value] of Object.entries(DEFAULT_SITE_BRANDING)) {
    const current = result[key];
    if (current === undefined || current === null || current === "") result[key] = value;
  }
  return result as T & typeof DEFAULT_SITE_BRANDING;
}
