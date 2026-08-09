const API_BASE = (import.meta.env.VITE_API_URL || "https://backend.logicsify.com/api").replace(
  /\/$/,
  "",
);
const SITE_BASE = (import.meta.env.VITE_SITE_URL || "https://logicsify.com").replace(/\/$/, "");

/**
 * Keep public Media Library links on the website domain. Vercel forwards these
 * URLs to the matching backend record without exposing the API host.
 */
export function publicAssetUrl(value: string): string {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return value;

  try {
    const apiUrl = new URL(API_BASE);
    const assetUrl = new URL(value, SITE_BASE);
    if (assetUrl.hostname !== apiUrl.hostname || !assetUrl.pathname.startsWith("/uploads/")) {
      return value;
    }

    const relativePath = assetUrl.pathname.slice("/uploads/".length);
    if (!relativePath || relativePath.split("/").some((segment) => segment === "..")) return value;
    return `${SITE_BASE}/media/${relativePath}${assetUrl.search}`;
  } catch {
    return value;
  }
}

export function versionedPublicAssetUrl(value: string | null | undefined, version?: string | null): string {
  const normalized = publicAssetUrl(String(value || ""));
  if (!normalized || normalized.startsWith("data:") || normalized.startsWith("blob:")) return normalized;
  if (!version) return normalized;

  try {
    const url = new URL(normalized, SITE_BASE);
    url.searchParams.set("v", String(version).replace(/[^a-zA-Z0-9._:-]/g, ""));
    return url.origin === SITE_BASE ? `${url.pathname}${url.search}${url.hash}` : url.toString();
  } catch {
    const separator = normalized.includes("?") ? "&" : "?";
    return `${normalized}${separator}v=${encodeURIComponent(String(version))}`;
  }
}

export function normalizePublicAssetUrls<T>(value: T): T {
  if (typeof value === "string") return publicAssetUrl(value) as T;
  if (Array.isArray(value)) return value.map(normalizePublicAssetUrls) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizePublicAssetUrls(item)]),
    ) as T;
  }
  return value;
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string>;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = path.startsWith("public/content/") ? 4500 : 12000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();
  init.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const isPublicContentRequest = path.startsWith("public/content/");
    const headers = new Headers(init.headers || {});
    const method = String(init.method || "GET").toUpperCase();
    const hasBody = init.body !== undefined && init.body !== null;

    // Keep public GET requests CORS-simple. Sending Cache-Control as a request
    // header caused browsers to preflight the CMS request, while older backend
    // CORS rules did not allow that header. The backend response already uses
    // no-store/no-cache, and fetch cache:no-store prevents browser reuse.
    if (hasBody && method !== "GET" && method !== "HEAD" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE}/${path.replace(/^\//, "")}`, {
      ...init,
      cache: isPublicContentRequest ? "no-store" : init.cache,
      signal: controller.signal,
      headers,
    });

    let payload: ApiEnvelope<T> | null = null;
    try {
      payload = (await response.json()) as ApiEnvelope<T>;
    } catch {
      // The API should always return JSON, but provide a useful fallback.
    }

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.message || "Something went wrong. Please try again.");
    }

    return normalizePublicAssetUrls(payload.data);
  } catch (error) {
    if (controller.signal.aborted && !init.signal?.aborted) {
      throw new Error("The content API took too long to respond.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abortFromCaller);
  }
}

type PublicRequestCacheEntry = {
  expiresAt: number;
  promise: Promise<unknown>;
};

const publicRequestCache = new Map<string, PublicRequestCacheEntry>();

function cachedPublicRequest<T>(path: string, ttlMs = 30_000): Promise<T> {
  const now = Date.now();
  const cached = publicRequestCache.get(path);
  if (cached && cached.expiresAt > now) return cached.promise as Promise<T>;

  const promise = request<T>(path).catch((error) => {
    if (publicRequestCache.get(path)?.promise === promise) publicRequestCache.delete(path);
    throw error;
  });
  publicRequestCache.set(path, { expiresAt: now + ttlMs, promise });
  return promise;
}

export type ContactSubmission = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  service: string;
  budget: string;
  timeline?: string;
  description: string;
  source?: string;
  honey?: string;
  recaptcha_token?: string;
};

export type AvailabilitySlot = {
  time: string;
  label: string;
  end: string;
};

export type AvailabilityResponse = {
  date: string;
  available: boolean;
  slots: AvailabilitySlot[];
  timezone?: string;
};

export type BookingSubmission = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  meeting_date: string;
  start_time: string;
  timezone: string;
  notes?: string;
  honey?: string;
  recaptcha_token?: string;
};

export async function submitContact(data: ContactSubmission) {
  const recaptcha_token = await getRecaptchaToken("contact");
  return request<{ id: number; message: string }>("public/contact", {
    method: "POST",
    body: JSON.stringify({ ...data, recaptcha_token }),
  });
}

export async function submitNewsletter(data: {
  email: string;
  consent: boolean;
  source?: string;
  honey?: string;
}) {
  const recaptcha_token = await getRecaptchaToken("newsletter");
  return request<{ message: string }>("public/newsletter", {
    method: "POST",
    body: JSON.stringify({ ...data, recaptcha_token }),
  });
}

export type ResourceDownloadSubmission = {
  resource_slug: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  consent: boolean;
  honey?: string;
  recaptcha_token?: string;
};

export async function requestResourceDownload(data: ResourceDownloadSubmission) {
  const recaptcha_token = await getRecaptchaToken("resource_download");
  return request<{ download_url: string; message: string }>("public/resource-download", {
    method: "POST",
    body: JSON.stringify({ ...data, recaptcha_token }),
  });
}

export function getAvailability(date: string) {
  return request<AvailabilityResponse>(`public/availability?date=${encodeURIComponent(date)}`);
}

export async function submitBooking(data: BookingSubmission) {
  const recaptcha_token = await getRecaptchaToken("booking");
  return request<{ id: number; message: string }>("public/bookings", {
    method: "POST",
    body: JSON.stringify({ ...data, recaptcha_token }),
  });
}

export { API_BASE };

export type PublicConnectProfile = {
  id: number;
  slug: string;
  display_name: string;
  headline?: string | null;
  company?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  address?: string | null;
  global_cover_url?: string | null;
  links_json: Array<{ label: string; url: string; icon?: string }>;
  skills_json: string[];
  location_ids_json: string[];
  assigned_locations: SiteLocation[];
  other_locations: SiteLocation[];
  theme_json: { accent?: string };
  is_unlisted: boolean;
  noindex: boolean;
};

export function getConnectProfile(slug: string) {
  return request<PublicConnectProfile>(`public/connect/${encodeURIComponent(slug)}`);
}

export type PublicTeamMember = {
  id: number;
  slug: string;
  display_name: string;
  headline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  links_json: Array<{ label: string; url: string; icon?: string }>;
  skills_json: string[];
  location_ids_json: string[];
  locations: SiteLocation[];
  connect_enabled: boolean;
  sort_order: number;
};

export function getPublicTeamMembers(placement: "home" | "about" | "contact") {
  return request<PublicTeamMember[]>(`public/team-directory?placement=${placement}`);
}

export type PublicMenuItem = {
  id: number;
  parent_id?: number | null;
  label: string;
  url: string;
  is_external: boolean;
  target_blank: boolean;
  coming_soon: boolean;
  description?: string | null;
  badge_text?: string | null;
  icon_url?: string | null;
  image_url?: string | null;
  menu_style?: "link" | "dropdown" | "mega";
  column_number?: number;
  is_heading?: boolean;
  hide_desktop?: boolean;
  hide_mobile?: boolean;
  mega_columns?: number;
  mega_promo_enabled?: boolean;
  mega_promo_eyebrow?: string | null;
  mega_promo_title?: string | null;
  mega_promo_description?: string | null;
  mega_promo_button_label?: string | null;
  mega_promo_button_url?: string | null;
  mega_promo_image?: string | null;
  mega_promo_new_tab?: boolean;
  sort_order: number;
};

export function getPublicMenu(location: "header" | "footer") {
  return cachedPublicRequest<{ location: string; items: PublicMenuItem[] }>(
    `public/menus/${location}`,
    60_000,
  );
}

export type CmsContentItem = {
  id: number;
  content_type: string;
  title: string;
  slug: string;
  status: string;
  featured: number | boolean;
  excerpt?: string;
  featured_image?: string;
  content_json?: {
    body?: string;
    sections?: Array<Record<string, string>>;
    category?: string;
    tags?: string[];
    quote?: string;
    role?: string;
    client_name?: string;
    company?: string;
    project_type?: string;
    testimonial_type?: "text" | "video";
    video_url?: string;
    video_poster?: string;
    client_image?: string;
    [key: string]: unknown;
  };
  seo_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    og_image?: string;
    noindex?: boolean;
  };
  published_at?: string;
  updated_at?: string;
  sort_order?: number;
};

export async function getCmsContentList(type: string): Promise<CmsContentItem[]> {
  try {
    // CMS content changes in Content Studio must be visible immediately after
    // reload/navigation. Do not reuse the generic in-memory public cache here.
    return await request<CmsContentItem[]>(
      `public/content/${encodeURIComponent(type)}?_=${Date.now()}`,
      { cache: "no-store" },
    );
  } catch {
    return [];
  }
}

export async function getCmsContentItem(
  type: string,
  slug: string,
): Promise<CmsContentItem | null> {
  try {
    return await request<CmsContentItem>(
      `public/content/${encodeURIComponent(type)}/${encodeURIComponent(slug)}?_=${Date.now()}`,
      { cache: "no-store" },
    );
  } catch {
    return null;
  }
}

export type CodeSnippet = {
  id: string;
  title: string;
  snippet_type: "integration" | "custom_code";
  placement: "head" | "body_start" | "body_end";
  target: "public" | "admin" | "both";
  code: string;
  enabled: boolean;
  sort_order?: number;
};

export type PublicIntegrations = {
  tracking_enabled?: boolean;
  gtm_id?: string;
  ga4_id?: string;
  meta_pixel_id?: string;
  linkedin_partner_id?: string;
  tiktok_pixel_id?: string;
  clarity_id?: string;
  hotjar_id?: string;
  hubspot_portal_id?: string;
  crisp_website_id?: string;
  intercom_app_id?: string;
  google_site_verification?: string;
  bing_site_verification?: string;
  head_code?: string;
  body_code?: string;
  snippets?: CodeSnippet[];
  recaptcha_enabled?: boolean;
  recaptcha_site_key?: string;
  recaptcha_min_score?: number;
};

export async function getPublicIntegrations(): Promise<PublicIntegrations> {
  try {
    return await cachedPublicRequest<PublicIntegrations>("public/settings/integrations", 60_000);
  } catch {
    return {};
  }
}

type RecaptchaRuntime = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

let recaptchaScriptPromise: Promise<void> | null = null;

async function getRecaptchaToken(action: string) {
  if (typeof window === "undefined") return "";
  const settings = await getPublicIntegrations();
  if (!settings.recaptcha_enabled || !settings.recaptcha_site_key) return "";
  const siteKey = settings.recaptcha_site_key;
  const runtimeWindow = window as Window & { grecaptcha?: RecaptchaRuntime };
  if (!runtimeWindow.grecaptcha) {
    recaptchaScriptPromise ||= new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-logicsify-recaptcha="true"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Anti-spam verification could not load.")),
          { once: true },
        );
        return;
      }
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      script.dataset.logicsifyRecaptcha = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Anti-spam verification could not load."));
      document.head.appendChild(script);
    });
    await recaptchaScriptPromise;
  }
  const grecaptcha = runtimeWindow.grecaptcha;
  if (!grecaptcha) throw new Error("Anti-spam verification is unavailable. Refresh and try again.");
  await new Promise<void>((resolve) => grecaptcha.ready(resolve));
  return grecaptcha.execute(siteKey, { action });
}

export type PublicThemeSettings = {
  primary_start?: string;
  primary_end?: string;
  dark?: string;
  background?: string;
  surface?: string;
  text?: string;
  muted_text?: string;
  border?: string;
  heading_font?: string;
  body_font?: string;
  base_font_size?: number;
  h1_min?: number;
  h1_max?: number;
  h2_min?: number;
  h2_max?: number;
  h3_min?: number;
  h3_max?: number;
  nav_font_size?: number;
  button_font_size?: number;
  small_font_size?: number;
  container_max_width?: number;
  section_spacing_desktop?: number;
  section_spacing_mobile?: number;
  card_radius?: number;
  button_radius?: number;
  input_radius?: number;
  gradient_angle?: number;
  animation_speed?: number;
  shadow_strength?: number;
  website_custom_css_enabled?: boolean;
  website_custom_css?: string;
  admin_custom_css_enabled?: boolean;
  admin_custom_css?: string;
};

export async function getPublicThemeSettings(): Promise<PublicThemeSettings> {
  try {
    return await cachedPublicRequest<PublicThemeSettings>("public/settings/theme", 60_000);
  } catch {
    return {};
  }
}

export type SiteLocation = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  addresses?: string[];
  phone?: string;
  phones?: string[];
  email?: string;
  contact_name?: string;
  contact_role?: string;
  map_url?: string;
  enabled?: boolean;
  show_on_contact?: boolean;
  show_in_footer?: boolean;
  show_on_connect?: boolean;
  sort_order?: number;
};

export type SocialProfile = {
  id: string;
  platform: string;
  label: string;
  url: string;
  enabled?: boolean;
  sort_order?: number;
};

export type PublicSiteSettings = {
  site_name?: string;
  tagline?: string;
  contact_email?: string;
  sales_email?: string;
  support_email?: string;
  phone?: string;
  site_url?: string;
  timezone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  logo_dark?: string;
  logo_light?: string;
  mobile_logo?: string;
  admin_logo?: string;
  brand_mark?: string;
  favicon?: string;
  apple_touch_icon?: string;
  sticky_header?: boolean;
  transparent_header_home?: boolean;
  show_header_cta?: boolean;
  header_cta_label?: string;
  header_cta_url?: string;
  header_cta_new_tab?: boolean;
  header_logo_height_desktop?: number;
  header_logo_height_mobile?: number;
  announcement_enabled?: boolean;
  announcement_text?: string;
  announcement_link_label?: string;
  announcement_url?: string;
  announcement_new_tab?: boolean;
  footer_logo?: string;
  footer_description?: string;
  footer_email?: string;
  footer_phone?: string;
  footer_address?: string;
  footer_cta_label?: string;
  footer_cta_url?: string;
  footer_cta_new_tab?: boolean;
  show_social_links?: boolean;
  show_privacy_link?: boolean;
  show_terms_link?: boolean;
  copyright_text?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  x_url?: string;
  youtube_url?: string;
  portfolio_url?: string;
  locations?: SiteLocation[];
  social_links?: SocialProfile[];
  company_profiles?: CompanyProfile[];
  partners?: Partner[];
  default_seo_title?: string;
  default_seo_description?: string;
  default_og_image?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  theme_color?: string;
  legal_name?: string;
  service_areas?: string;
  support_hours?: string;
  support_response_expectation?: string;
  emergency_support_policy?: string;
  maintenance_exclusions?: string;
  post_launch_period?: string;
};

export type CompanyProfile = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  sort_order?: number;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  link_enabled: boolean;
  status: "draft" | "published";
  sort_order?: number;
};

const PUBLIC_SITE_SETTINGS_STORAGE_KEY = "logicsify:site-settings:v1";

export function getCachedPublicSiteSettings(): PublicSiteSettings {
  if (typeof window === "undefined") return {};
  try {
    const cached = JSON.parse(
      window.localStorage.getItem(PUBLIC_SITE_SETTINGS_STORAGE_KEY) || "null",
    );
    return cached?.version === 1 && cached.data && typeof cached.data === "object"
      ? (cached.data as PublicSiteSettings)
      : {};
  } catch {
    return {};
  }
}

function cachePublicSiteSettings(settings: PublicSiteSettings) {
  if (typeof window === "undefined" || Object.keys(settings).length === 0) return;
  try {
    window.localStorage.setItem(
      PUBLIC_SITE_SETTINGS_STORAGE_KEY,
      JSON.stringify({ version: 1, data: settings, savedAt: Date.now() }),
    );
  } catch {
    // Storage can be unavailable; the current API response is still returned.
  }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const settings = await cachedPublicRequest<PublicSiteSettings>("public/settings/site", 60_000);
    cachePublicSiteSettings(settings);
    return settings;
  } catch {
    return getCachedPublicSiteSettings();
  }
}
