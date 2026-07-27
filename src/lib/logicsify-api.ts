const API_BASE = (import.meta.env.VITE_API_URL || "https://backend.logicsify.com/api").replace(
  /\/$/,
  "",
);

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
    const response = await fetch(`${API_BASE}/${path.replace(/^\//, "")}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
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

    return payload.data;
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
};

export function submitContact(data: ContactSubmission) {
  return request<{ id: number; message: string }>("public/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAvailability(date: string) {
  return request<AvailabilityResponse>(`public/availability?date=${encodeURIComponent(date)}`);
}

export function submitBooking(data: BookingSubmission) {
  return request<{ id: number; message: string }>("public/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export { API_BASE };

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
  return request<{ location: string; items: PublicMenuItem[] }>(`public/menus/${location}`);
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
  };
  published_at?: string;
  sort_order?: number;
};

export async function getCmsContentList(type: string): Promise<CmsContentItem[]> {
  try {
    return await request<CmsContentItem[]>(`public/content/${encodeURIComponent(type)}`);
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
      `public/content/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`,
    );
  } catch {
    return null;
  }
}

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
};

export async function getPublicIntegrations(): Promise<PublicIntegrations> {
  try {
    return await request<PublicIntegrations>("public/settings/integrations");
  } catch {
    return {};
  }
}

export type PublicSiteSettings = {
  site_name?: string;
  tagline?: string;
  contact_email?: string;
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
  default_seo_title?: string;
  default_seo_description?: string;
  default_og_image?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  theme_color?: string;
};
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    return await request<PublicSiteSettings>("public/settings/site");
  } catch {
    return {};
  }
}
