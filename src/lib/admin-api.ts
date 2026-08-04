import { API_BASE, type CodeSnippet, type SiteLocation } from "@/lib/logicsify-api";

export const ADMIN_TOKEN_KEY = "logicsify_admin_token";

export type Administrator = {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  status?: "active" | "inactive";
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
  two_factor_enabled?: boolean | number;
  two_factor_authenticator_enabled?: boolean | number;
  two_factor_email_enabled?: boolean | number;
  two_factor_email_verified_at?: string | null;
  failed_login_count?: number;
  locked_until?: string | null;
  password_changed_at?: string | null;
};

export type ApiMeta = {
  page?: number;
  per_page?: number;
  total?: number;
  pages?: number;
  counters?: Record<string, number>;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string>;
  meta?: ApiMeta;
};

export class AdminApiError extends Error {
  status: number;
  errors: Record<string, string>;

  constructor(message: string, status: number, errors: Record<string, string> = {}) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function adminRequest<T>(
  path: string,
  init: RequestInit = {},
  includeMeta = false,
): Promise<T | { data: T; meta: ApiMeta }> {
  const token = getAdminToken();
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  const abortFromCaller = () => controller.abort();
  init.signal?.addEventListener("abort", abortFromCaller, { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/${path.replace(/^\//, "")}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
  } catch (error) {
    if (controller.signal.aborted && !init.signal?.aborted) {
      throw new AdminApiError("The backend took too long to respond. Please try again.", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abortFromCaller);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Normalized below.
  }

  if (!response.ok || !payload?.success) {
    if (response.status === 401) clearAdminToken();
    throw new AdminApiError(
      payload?.message || "The request could not be completed.",
      response.status,
      payload?.errors || {},
    );
  }

  return includeMeta ? { data: payload.data, meta: payload.meta || {} } : payload.data;
}

export type DashboardResponse = {
  summary: {
    content: Record<
      string,
      { total: number; published: number; draft: number; scheduled: number; archived: number }
    >;
    new_leads: number;
    upcoming_bookings: number;
    media: number;
    trash: number;
  };
  recent_leads: Lead[];
  recent_bookings: Booking[];
};

export type ContentItem = {
  id: number;
  content_type:
    | "page"
    | "service"
    | "industry"
    | "case_study"
    | "insight"
    | "career"
    | "testimonial"
    | "team"
    | "resource"
    | "comparison"
    | "engagement_model"
    | "integration";
  title: string;
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  featured: number | boolean;
  excerpt?: string | null;
  featured_image?: string | null;
  content_json?: {
    body?: string;
    sections?: ContentSection[];
    category?: string;
    tags?: string[];
    location?: string;
    employment_type?: string;
    quote?: string;
    role?: string;
    client_name?: string;
    company?: string;
    project_type?: string;
    testimonial_type?: "text" | "video";
    video_url?: string;
    video_poster?: string;
    client_image?: string;
    social_links?: Record<string, string>;
    [key: string]: unknown;
  };
  seo_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    noindex?: boolean;
    og_image?: string;
  };
  published_at?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type ContentSection = {
  id?: string;
  type?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  image?: string;
  button_label?: string;
  button_url?: string;
  alignment?: "left" | "center" | "right";
};

export type Lead = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  service?: string | null;
  budget?: string | null;
  timeline?: string | null;
  description?: string | null;
  source?: string | null;
  status: "new" | "contacted" | "qualified" | "won" | "lost" | "spam";
  notes?: string | null;
  created_at?: string;
};

export type Booking = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  meeting_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  notes?: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  admin_notes?: string | null;
  created_at?: string;
};

export type MediaItem = {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  alt_text?: string | null;
  created_at?: string;
};

export type AvailabilityRule = {
  id?: number;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  buffer_minutes: number;
  enabled: number | boolean;
};

export type BlockedDate = {
  id: number;
  blocked_date: string;
  reason?: string | null;
};

export type MenuItem = {
  id?: number;
  label: string;
  page_id?: number | null;
  page_title?: string | null;
  page_slug?: string | null;
  page_content_type?: string | null;
  external_url?: string | null;
  is_external?: number | boolean;
  target_blank?: number | boolean;
  coming_soon?: number | boolean;
  description?: string | null;
  badge_text?: string | null;
  icon_url?: string | null;
  image_url?: string | null;
  menu_style?: "link" | "dropdown" | "mega";
  column_number?: number;
  is_heading?: number | boolean;
  hide_desktop?: number | boolean;
  hide_mobile?: number | boolean;
  mega_columns?: number;
  mega_promo_enabled?: number | boolean;
  mega_promo_eyebrow?: string | null;
  mega_promo_title?: string | null;
  mega_promo_description?: string | null;
  mega_promo_button_label?: string | null;
  mega_promo_button_url?: string | null;
  mega_promo_image?: string | null;
  mega_promo_new_tab?: number | boolean;
  sort_order?: number;
  parent_index?: number | "";
  parent_id?: number | null;
};

export type Menu = {
  id: number;
  name: string;
  location: string;
  items: MenuItem[];
};

export type SettingsResponse = Record<string, Record<string, unknown>>;

export type TrashItem = {
  entity_type: "content" | "connect_profile" | "lead" | "booking" | "media";
  id: number;
  title: string;
  subtitle?: string;
  deleted_at: string;
};

export type ConnectProfileLink = { label: string; url: string; icon?: string };
export type ConnectProfileDestination = "team" | "contact" | "connect" | "export";
export type ConnectProfileField =
  | "avatar"
  | "headline"
  | "bio"
  | "email"
  | "phone"
  | "whatsapp"
  | "address"
  | "social_links"
  | "locations"
  | "skills";
export type ConnectProfileVisibility = {
  placements: { home: boolean; about: boolean; contact: boolean; connect: boolean };
  fields: Record<ConnectProfileField, Record<ConnectProfileDestination, boolean>>;
};
export type ConnectProfile = {
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
  /** Derived from enabled locations in location_ids_json; it is not edited on the person. */
  address?: string | null;
  assigned_locations?: SiteLocation[];
  global_cover_url?: string | null;
  links_json: ConnectProfileLink[];
  theme_json: { accent?: string };
  skills_json: string[];
  location_ids_json: string[];
  visibility_json: ConnectProfileVisibility;
  sort_order: number;
  status: "draft" | "published" | "archived";
  is_unlisted: boolean;
  noindex: boolean;
  created_at?: string;
  updated_at?: string;
};

export function listConnectProfiles(
  params: { status?: string; search?: string; page?: number } = {},
) {
  const search = new URLSearchParams({
    status: params.status || "all",
    search: params.search || "",
    page: String(params.page || 1),
    per_page: "50",
  });
  return adminRequest<ConnectProfile[]>(`connect-profiles?${search}`, {}, true) as Promise<{
    data: ConnectProfile[];
    meta: ApiMeta;
  }>;
}
export function createConnectProfile(payload: Partial<ConnectProfile>) {
  return adminRequest<ConnectProfile>("connect-profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<ConnectProfile>;
}
export function updateConnectProfile(id: number, payload: Partial<ConnectProfile>) {
  return adminRequest<ConnectProfile>(`connect-profiles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }) as Promise<ConnectProfile>;
}
export function deleteConnectProfile(id: number) {
  return adminRequest<{ deleted: boolean }>(`connect-profiles/${id}`, {
    method: "DELETE",
  }) as Promise<{ deleted: boolean }>;
}

export type ConnectProfileSettings = { global_cover_url: string };

export function getConnectProfileSettings() {
  return adminRequest<ConnectProfileSettings>(
    "connect-profiles/settings",
  ) as Promise<ConnectProfileSettings>;
}

export function saveConnectProfileSettings(values: ConnectProfileSettings) {
  return adminRequest<{ saved: boolean; global_cover_url: string }>("connect-profiles/settings", {
    method: "PUT",
    body: JSON.stringify(values),
  }) as Promise<{ saved: boolean; global_cover_url: string }>;
}

export function getTeamConnectLocations() {
  return adminRequest<SiteLocation[]>("connect-profiles/locations") as Promise<SiteLocation[]>;
}

export function saveTeamConnectLocations(locations: SiteLocation[]) {
  return adminRequest<{ saved: boolean; locations: SiteLocation[] }>("connect-profiles/locations", {
    method: "PUT",
    body: JSON.stringify({ locations }),
  }) as Promise<{ saved: boolean; locations: SiteLocation[] }>;
}

export type AuditLog = {
  id: number;
  administrator_id?: number | null;
  administrator_name?: string | null;
  administrator_email?: string | null;
  action: string;
  category?: string;
  severity?: "info" | "warning" | "important" | "critical" | string;
  status?: "success" | "failed" | "blocked" | "pending" | string;
  message?: string | null;
  entity_type: string;
  entity_id?: number | null;
  details_json?: Record<string, unknown> | string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_method?: string | null;
  request_path?: string | null;
  request_id?: string | null;
  created_at: string;
};

export type TwoFactorMethod = "authenticator" | "email";

export type AdminLoginResult =
  | { token: string; expires_at: string; administrator: Administrator; requires_2fa?: false }
  | {
      requires_2fa: true;
      challenge_token: string;
      expires_at: string;
      methods: TwoFactorMethod[];
      masked_email?: string;
      email_sent?: boolean;
      resend_after_seconds?: number;
    };

export function adminLogin(email: string, password: string, rememberLogin = false) {
  return adminRequest<AdminLoginResult>("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember_login: rememberLogin }),
  }) as Promise<AdminLoginResult>;
}

export function sendAdminEmailTwoFactor(challenge_token: string) {
  return adminRequest<{
    sent: boolean;
    masked_email: string;
    expires_at: string;
    resend_after_seconds: number;
  }>("auth/send-email-2fa", {
    method: "POST",
    body: JSON.stringify({ challenge_token }),
  }) as Promise<{
    sent: boolean;
    masked_email: string;
    expires_at: string;
    resend_after_seconds: number;
  }>;
}

export function verifyAdminTwoFactor(
  challenge_token: string,
  code: string,
  method: TwoFactorMethod,
  rememberLogin = false,
) {
  return adminRequest<{ token: string; expires_at: string; administrator: Administrator }>(
    "auth/verify-2fa",
    {
      method: "POST",
      body: JSON.stringify({ challenge_token, code, method, remember_login: rememberLogin }),
    },
  ) as Promise<{ token: string; expires_at: string; administrator: Administrator }>;
}

export function getCurrentAdmin() {
  return adminRequest<Administrator>("auth/me") as Promise<Administrator>;
}

export function updateCurrentAdminProfile(payload: { name: string; email: string }) {
  return adminRequest<{ user: Administrator }>("auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }) as Promise<{ user: Administrator }>;
}

export function changeCurrentAdminPassword(payload: {
  current_password: string;
  new_password: string;
}) {
  return adminRequest<{ saved: boolean }>("auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{ saved: boolean }>;
}

export function adminLogout() {
  return adminRequest<{ logged_out: boolean }>("auth/logout", { method: "POST" }) as Promise<{
    logged_out: boolean;
  }>;
}

export function getDashboard() {
  return adminRequest<DashboardResponse>("dashboard") as Promise<DashboardResponse>;
}

export function listContent(params: {
  type: ContentItem["content_type"];
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const search = new URLSearchParams({
    type: params.type,
    status: params.status || "all",
    search: params.search || "",
    page: String(params.page || 1),
    per_page: String(params.perPage || 25),
  });
  return adminRequest<ContentItem[]>(`content?${search.toString()}`, {}, true) as Promise<{
    data: ContentItem[];
    meta: ApiMeta;
  }>;
}

export type ContentImportItemReport = {
  index: number;
  id: number | null;
  title: string;
  slug: string;
  status: "draft";
  imported: boolean;
  filled_fields: string[];
  missing_fields: string[];
  error?: string;
};

export type ContentImportReport = {
  content_type: ContentItem["content_type"];
  imported: number;
  total: number;
  items: ContentImportItemReport[];
};

export type ContentExportPackage = {
  format: "logicsify-content-json";
  version: number;
  content_type: ContentItem["content_type"];
  exported_at: string;
  items: ContentItem[];
};

export function exportContent(type: ContentItem["content_type"]) {
  return adminRequest<ContentExportPackage>(
    `content/export?type=${encodeURIComponent(type)}`,
  ) as Promise<ContentExportPackage>;
}

export function importContent(
  type: ContentItem["content_type"],
  contentPackage: { items: unknown[] },
) {
  return adminRequest<ContentImportReport>("content/import", {
    method: "POST",
    body: JSON.stringify({ content_type: type, items: contentPackage.items }),
  }) as Promise<ContentImportReport>;
}

export function getContent(id: number) {
  return adminRequest<ContentItem>(`content/${id}`) as Promise<ContentItem>;
}

export function createContent(payload: Partial<ContentItem>) {
  return adminRequest<ContentItem>("content", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<ContentItem>;
}

export function updateContent(id: number, payload: Partial<ContentItem>) {
  return adminRequest<ContentItem>(`content/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }) as Promise<ContentItem>;
}

export function deleteContent(id: number) {
  return adminRequest<{ deleted: boolean }>(`content/${id}`, { method: "DELETE" }) as Promise<{
    deleted: boolean;
  }>;
}

export function duplicateContent(id: number) {
  return adminRequest<ContentItem>(`content/${id}/duplicate`, {
    method: "POST",
  }) as Promise<ContentItem>;
}

export function bulkContent(ids: number[], action: string) {
  return adminRequest<{ updated: number }>("content/bulk", {
    method: "POST",
    body: JSON.stringify({ ids, action }),
  }) as Promise<{ updated: number }>;
}

export function getContentRevisions(id: number) {
  return adminRequest<
    Array<{ id: number; snapshot: ContentItem; created_by?: number; created_at: string }>
  >(`content/${id}/revisions`) as Promise<
    Array<{ id: number; snapshot: ContentItem; created_by?: number; created_at: string }>
  >;
}

export function restoreContentRevision(id: number, revisionId: number) {
  return adminRequest<ContentItem>(`content/${id}/restore-revision/${revisionId}`, {
    method: "POST",
  }) as Promise<ContentItem>;
}

export function listLeads(params: { status?: string; search?: string; page?: number }) {
  const search = new URLSearchParams({
    status: params.status || "all",
    search: params.search || "",
    page: String(params.page || 1),
    per_page: "50",
  });
  return adminRequest<Lead[]>(`leads?${search.toString()}`, {}, true) as Promise<{
    data: Lead[];
    meta: ApiMeta;
  }>;
}

export function updateLead(id: number, payload: Pick<Lead, "status"> & { notes?: string }) {
  return adminRequest<Lead>(`leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }) as Promise<Lead>;
}

export function deleteLead(id: number) {
  return adminRequest<{ deleted: boolean }>(`leads/${id}`, { method: "DELETE" }) as Promise<{
    deleted: boolean;
  }>;
}

export function listBookings(params: {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  const search = new URLSearchParams({
    status: params.status || "all",
    from: params.from || "",
    to: params.to || "",
    page: String(params.page || 1),
    per_page: "50",
  });
  return adminRequest<Booking[]>(`bookings?${search.toString()}`, {}, true) as Promise<{
    data: Booking[];
    meta: ApiMeta;
  }>;
}

export function updateBooking(
  id: number,
  payload: Pick<Booking, "status"> & { admin_notes?: string },
) {
  return adminRequest<Booking>(`bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }) as Promise<Booking>;
}

export function deleteBooking(id: number) {
  return adminRequest<{ deleted: boolean }>(`bookings/${id}`, { method: "DELETE" }) as Promise<{
    deleted: boolean;
  }>;
}

export function getAvailabilityRules() {
  return adminRequest<{ rules: AvailabilityRule[]; blocked_dates: BlockedDate[] }>(
    "availability-rules",
  ) as Promise<{ rules: AvailabilityRule[]; blocked_dates: BlockedDate[] }>;
}

export function saveAvailabilityRules(rules: AvailabilityRule[]) {
  return adminRequest<{ saved: boolean }>("availability-rules", {
    method: "PUT",
    body: JSON.stringify({ rules }),
  }) as Promise<{ saved: boolean }>;
}

export function addBlockedDate(blocked_date: string, reason: string) {
  return adminRequest<{ saved: boolean }>("blocked-dates", {
    method: "POST",
    body: JSON.stringify({ blocked_date, reason }),
  }) as Promise<{ saved: boolean }>;
}

export function removeBlockedDate(id: number) {
  return adminRequest<{ deleted: boolean }>(`blocked-dates/${id}`, {
    method: "DELETE",
  }) as Promise<{ deleted: boolean }>;
}

export function listMedia() {
  return adminRequest<MediaItem[]>("media") as Promise<MediaItem[]>;
}

export function uploadMedia(file: File, altText = "") {
  const body = new FormData();
  body.append("file", file);
  body.append("alt_text", altText);
  return adminRequest<MediaItem>("media", { method: "POST", body }) as Promise<MediaItem>;
}

export function deleteMedia(id: number) {
  return adminRequest<{ deleted: boolean }>(`media/${id}`, { method: "DELETE" }) as Promise<{
    deleted: boolean;
  }>;
}

export function listMenus() {
  return adminRequest<Menu[]>("menus") as Promise<Menu[]>;
}

export function saveMenu(id: number, items: MenuItem[]) {
  return adminRequest<{ saved: boolean }>(`menus/${id}`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  }) as Promise<{ saved: boolean }>;
}

export function restoreDefaultServicesMenu(id: number) {
  return adminRequest<{ restored: boolean }>(`menus/${id}/restore-default-services`, {
    method: "POST",
  }) as Promise<{ restored: boolean }>;
}

export function getSettings() {
  return adminRequest<SettingsResponse>("settings") as Promise<SettingsResponse>;
}

export function saveSettings(group: string, values: Record<string, unknown>) {
  return adminRequest<{ saved: boolean }>(`settings/${group}`, {
    method: "PUT",
    body: JSON.stringify(values),
  }) as Promise<{ saved: boolean }>;
}

export function testSmtp() {
  return adminRequest<{ sent: boolean; message: string }>("settings/email/test", {
    method: "POST",
  }) as Promise<{ sent: boolean; message: string }>;
}

export function listAdministrators() {
  return adminRequest<Administrator[]>("administrators") as Promise<Administrator[]>;
}

export function createAdministrator(payload: {
  name: string;
  email: string;
  password: string;
  role: Administrator["role"];
}) {
  return adminRequest<{ id: number }>("administrators", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{ id: number }>;
}

export function updateAdministrator(
  id: number,
  payload: Partial<Administrator> & { password?: string },
) {
  return adminRequest<{ saved: boolean }>(`administrators/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }) as Promise<{ saved: boolean }>;
}

export function deleteAdministrator(id: number) {
  return adminRequest<{ deleted: boolean }>(`administrators/${id}`, {
    method: "DELETE",
  }) as Promise<{ deleted: boolean }>;
}

export function listTrash() {
  return adminRequest<TrashItem[]>("trash") as Promise<TrashItem[]>;
}

export function restoreTrashItem(item: Pick<TrashItem, "entity_type" | "id">) {
  return adminRequest<{ restored: boolean }>("trash/restore", {
    method: "POST",
    body: JSON.stringify(item),
  }) as Promise<{ restored: boolean }>;
}

export function permanentlyDeleteTrashItem(item: Pick<TrashItem, "entity_type" | "id">) {
  return adminRequest<{ deleted: boolean }>("trash/permanent", {
    method: "DELETE",
    body: JSON.stringify(item),
  }) as Promise<{ deleted: boolean }>;
}

export type SecurityOverview = {
  summary: {
    events_24h: number;
    failed_logins_7d: number;
    blocked_events_7d: number;
    active_sessions: number;
    locked_administrators: number;
    two_factor_enabled: number;
    authenticator_two_factor_enabled?: number;
    email_two_factor_enabled?: number;
  };
  recent_events: AuditLog[];
  locked_administrators: Administrator[];
};

export type SecuritySession = {
  id: number;
  administrator_id: number;
  administrator_name: string;
  administrator_email: string;
  expires_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  last_used_at?: string | null;
  label?: string | null;
  created_at: string;
  current: boolean;
};

export type SecuritySettings = {
  admin_slug?: string;
  admin_entry_path?: string;
  legacy_admin_path_enabled?: boolean;
  session_timeout_minutes?: number;
  max_login_attempts?: number;
  lockout_minutes?: number;
  minimum_password_length?: number;
  password_require_uppercase?: boolean;
  password_require_lowercase?: boolean;
  password_require_number?: boolean;
  password_require_symbol?: boolean;
  allowed_admin_ips?: string;
  blocked_admin_ips?: string;
  notify_new_login?: boolean;
  notify_failed_logins?: boolean;
  security_alert_email?: string;
  audit_retention_days?: number;
  force_https?: boolean;
  hsts_enabled?: boolean;
  hsts_max_age?: number;
  backend_csp_mode?: "strict" | "report-only" | "off";
  frame_policy?: "deny" | "sameorigin";
  is_super_admin?: boolean;
  two_factor_enabled?: boolean;
  two_factor_authenticator_enabled?: boolean;
  two_factor_email_enabled?: boolean;
  two_factor_email_address?: string;
};

export function getSecurityOverview() {
  return adminRequest<SecurityOverview>("security/overview") as Promise<SecurityOverview>;
}

export function listSecurityEvents(
  params: {
    search?: string;
    category?: string;
    severity?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    perPage?: number;
  } = {},
) {
  const search = new URLSearchParams({
    search: params.search || "",
    category: params.category || "",
    severity: params.severity || "",
    status: params.status || "",
    date_from: params.dateFrom || "",
    date_to: params.dateTo || "",
    page: String(params.page || 1),
    per_page: String(params.perPage || 100),
  });
  return adminRequest<AuditLog[]>(`security/events?${search.toString()}`, {}, true) as Promise<{
    data: AuditLog[];
    meta: ApiMeta;
  }>;
}

export function getSecurityConfig() {
  return adminRequest<SecuritySettings>("security/config") as Promise<SecuritySettings>;
}

export function saveSecuritySettings(values: SecuritySettings) {
  return adminRequest<{ saved: boolean; settings: SecuritySettings }>("security/settings", {
    method: "PUT",
    body: JSON.stringify(values),
  }) as Promise<{ saved: boolean; settings: SecuritySettings }>;
}

export function listSecuritySessions() {
  return adminRequest<SecuritySession[]>("security/sessions") as Promise<SecuritySession[]>;
}

export function revokeSecuritySession(id: number) {
  return adminRequest<{ revoked: boolean; current: boolean }>(`security/sessions/${id}`, {
    method: "DELETE",
  }) as Promise<{ revoked: boolean; current: boolean }>;
}

export function revokeOtherSecuritySessions() {
  return adminRequest<{ revoked: number }>("security/sessions/revoke-others", {
    method: "POST",
  }) as Promise<{ revoked: number }>;
}

export function startTwoFactorSetup(current_password: string) {
  return adminRequest<{ secret: string; otpauth_uri: string }>("security/2fa/setup", {
    method: "POST",
    body: JSON.stringify({ current_password }),
  }) as Promise<{ secret: string; otpauth_uri: string }>;
}

export function enableTwoFactor(code: string) {
  return adminRequest<{ enabled: boolean; recovery_codes: string[] }>("security/2fa/enable", {
    method: "POST",
    body: JSON.stringify({ code }),
  }) as Promise<{ enabled: boolean; recovery_codes: string[] }>;
}

export function disableTwoFactor(current_password: string, code: string) {
  return adminRequest<{ disabled: boolean }>("security/2fa/disable", {
    method: "POST",
    body: JSON.stringify({ current_password, code }),
  }) as Promise<{ disabled: boolean }>;
}

export function startEmailTwoFactorAction(action: "enable" | "disable", current_password: string) {
  return adminRequest<{
    sent: boolean;
    action_token: string;
    masked_email: string;
    expires_at: string;
    resend_after_seconds: number;
  }>(`security/2fa/email/start-${action}`, {
    method: "POST",
    body: JSON.stringify({ current_password }),
  }) as Promise<{
    sent: boolean;
    action_token: string;
    masked_email: string;
    expires_at: string;
    resend_after_seconds: number;
  }>;
}

export function completeEmailTwoFactorAction(
  action: "enable" | "disable",
  action_token: string,
  code: string,
) {
  return adminRequest<{ enabled?: boolean; disabled?: boolean }>(`security/2fa/email/${action}`, {
    method: "POST",
    body: JSON.stringify({ action_token, code }),
  }) as Promise<{ enabled?: boolean; disabled?: boolean }>;
}

export function testSecurityAlert() {
  return adminRequest<{ sent: boolean }>("security/test-alert", { method: "POST" }) as Promise<{
    sent: boolean;
  }>;
}

export function purgeSecurityLogs() {
  return adminRequest<{ deleted: number }>("security/purge-logs", { method: "POST" }) as Promise<{
    deleted: number;
  }>;
}

export function unlockAdministrator(id: number) {
  return adminRequest<{ unlocked: boolean }>(`security/unlock-administrator/${id}`, {
    method: "POST",
  }) as Promise<{ unlocked: boolean }>;
}

export async function getPublicAdminAccessPolicy() {
  const response = await fetch(`${API_BASE}/public/security/access-policy`);
  const payload = (await response.json()) as ApiEnvelope<{ legacy_admin_path_enabled: boolean }>;
  if (!response.ok || !payload.success)
    throw new Error(payload.message || "Could not check admin access policy.");
  return payload.data;
}

export async function validateAdminPath(slug: string) {
  const response = await fetch(`${API_BASE}/public/security/validate-admin-path`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  const payload = (await response.json()) as ApiEnvelope<{ valid: boolean }>;
  if (!response.ok || !payload.success) return false;
  return payload.data.valid;
}

export function listAuditLogs(params: { search?: string; page?: number } = {}) {
  const search = new URLSearchParams({
    search: params.search || "",
    page: String(params.page || 1),
    per_page: "100",
  });
  return adminRequest<AuditLog[]>(`audit-logs?${search.toString()}`, {}, true) as Promise<{
    data: AuditLog[];
    meta: ApiMeta;
  }>;
}

export type AdminRuntimeCustomization = {
  admin_custom_css_enabled?: boolean;
  admin_custom_css?: string;
  snippets?: CodeSnippet[];
};

export function getAdminRuntimeCustomization() {
  return adminRequest<AdminRuntimeCustomization>(
    "settings/runtime-admin",
  ) as Promise<AdminRuntimeCustomization>;
}
