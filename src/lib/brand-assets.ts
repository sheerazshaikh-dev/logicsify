export const DEFAULT_BRAND_ASSETS = {
  logoLight: "/9d583de744ef8542e0dae01c7231673a.png",
  logoDark: "/3b4a0a2a1d78df66b5bb7dac579e144c.png",
  mobileLogo: "/3b4a0a2a1d78df66b5bb7dac579e144c.png",
  adminLogo: "/9d583de744ef8542e0dae01c7231673a.png",
  adminLogoDark: "/3b4a0a2a1d78df66b5bb7dac579e144c.png",
  brandMark: "/f2048ae62fb525b2c29c3e51e755cc17.png",
  favicon: "/f2048ae62fb525b2c29c3e51e755cc17.png",
  appleTouchIcon: "/f2048ae62fb525b2c29c3e51e755cc17.png",
} as const;

export const DEFAULT_SITE_BRANDING = {
  logo_dark: DEFAULT_BRAND_ASSETS.logoDark,
  logo_light: DEFAULT_BRAND_ASSETS.logoLight,
  mobile_logo: DEFAULT_BRAND_ASSETS.mobileLogo,
  admin_logo: DEFAULT_BRAND_ASSETS.adminLogo,
  brand_mark: DEFAULT_BRAND_ASSETS.brandMark,
  favicon: DEFAULT_BRAND_ASSETS.favicon,
  apple_touch_icon: DEFAULT_BRAND_ASSETS.appleTouchIcon,
  footer_logo: DEFAULT_BRAND_ASSETS.logoLight,
} as const;

/**
 * CMS branding records may point at older full-resolution uploads. Normalize only
 * known legacy Logicsify defaults; arbitrary CMS/media URLs are preserved exactly.
 */
export function optimizedBrandAsset(value: string | null | undefined, fallback: string): string {
  const source = value?.trim() || fallback;
  const path = source.split(/[?#]/, 1)[0].toLowerCase();

  if (
    path === DEFAULT_BRAND_ASSETS.logoLight.toLowerCase() ||
    /\/(?:light-[a-f0-9]+|logicsify-logo-light|98ce23177c0ea9dc193b76779c6c8d70)\.png$/.test(path)
  ) {
    return DEFAULT_BRAND_ASSETS.logoLight;
  }
  if (
    path === DEFAULT_BRAND_ASSETS.logoDark.toLowerCase() ||
    /\/(?:dark-[a-f0-9]+|logicsify-logo-dark|b38a974ff4f16f317082928ac6f2fd32)\.png$/.test(path)
  ) {
    return DEFAULT_BRAND_ASSETS.logoDark;
  }
  if (
    path === DEFAULT_BRAND_ASSETS.brandMark.toLowerCase() ||
    /\/(?:icon-[a-f0-9]+|logicsify-mark|2860b4d2065f7f824fc9f543ef1f88a4|bed399f7381d9bc8933106e2b4b2f04c)\.png$/.test(path)
  ) {
    return DEFAULT_BRAND_ASSETS.brandMark;
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
