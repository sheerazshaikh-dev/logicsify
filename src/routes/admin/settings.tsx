import { createFileRoute } from "@tanstack/react-router";
import { adminHref } from "@/lib/admin-path";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  ExternalLink,
  FileDown,
  Globe2,
  Handshake,
  Image as ImageIcon,
  Plus,
  Loader2,
  Mail,
  Phone,
  Save,
  SearchCheck,
  Send,
  ShieldAlert,
  Settings2,
  Share2,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { withDefaultBranding } from "@/lib/brand-assets";
import { DEFAULT_CONTACT_EMAILS } from "@/lib/contact-directory";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminPageHeader,
  FieldLabel,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import {
  getCurrentAdmin,
  getSettings,
  saveSettings,
  testSmtp,
  uploadMedia,
  type SettingsResponse,
} from "@/lib/admin-api";
import type { CodeSnippet, SocialProfile } from "@/lib/logicsify-api";
import type { CompanyProfile, Partner } from "@/lib/logicsify-api";
import { MediaPicker } from "@/components/cms/media-picker";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

type Tab =
  | "site"
  | "profiles"
  | "partners"
  | "seo"
  | "email"
  | "integrations"
  | "calendar"
  | "administrators";

type SettingGroup = "site" | "email" | "integrations" | "calendar";

const tabConfig: Array<{
  id: Tab;
  label: string;
  icon: typeof Globe2;
  group?: SettingGroup;
}> = [
  { id: "site", label: "Site Settings", icon: Globe2, group: "site" },
  { id: "profiles", label: "Company Profiles", icon: FileDown, group: "site" },
  { id: "partners", label: "Partners", icon: Handshake, group: "site" },
  { id: "seo", label: "SEO & Sharing", icon: SearchCheck, group: "site" },
  { id: "email", label: "Email / SMTP", icon: Mail, group: "email" },
  { id: "integrations", label: "Integrations", icon: Share2, group: "integrations" },
  { id: "calendar", label: "Calendar", icon: CalendarDays, group: "calendar" },
  { id: "administrators", label: "Administrators", icon: ShieldCheck },
];

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("site");
  const [settings, setSettings] = useState<SettingsResponse>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    Promise.all([getSettings(), getCurrentAdmin()])
      .then(([loaded, admin]) => {
        setSettings({
          ...loaded,
          site: withDefaultBranding((loaded.site || {}) as Record<string, unknown>),
        });
        setIsSuperAdmin(admin.role === "super_admin");
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Could not load settings."),
      )
      .finally(() => setLoading(false));
  }, []);

  const currentTab = tabConfig.find((item) => item.id === tab);
  const currentGroup = currentTab?.group;

  function update(group: SettingGroup, key: string, value: unknown) {
    setSettings((current) => ({
      ...current,
      [group]: { ...(current[group] || {}), [key]: value },
    }));
  }

  async function save() {
    if (!currentGroup) return;
    setSaving(true);
    try {
      await saveSettings(currentGroup, settings[currentGroup] || {});
      toast.success(`${currentTab?.label || "Settings"} saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  const siteValues = settings.site || {};

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage operational site settings, company profiles, partners, SEO, email, integrations, calendar and administrators. Brand assets, header/footer presentation and design tokens now live under Global Branding."
        actions={
          currentGroup ? (
            <AdminButton onClick={() => void save()} disabled={loading || saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
            </AdminButton>
          ) : undefined
        }
      />

      {loading ? (
        <AdminLoading label="Loading settings…" />
      ) : (
        <div className="grid gap-7 xl:grid-cols-[270px_1fr]">
          <AdminCard className="h-fit p-3 xl:sticky xl:top-28">
            {tabConfig.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${tab === id ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon className={`h-4 w-4 ${tab === id ? "text-brand-gold" : "text-slate-400"}`} />
                {label}
              </button>
            ))}
          </AdminCard>
          <div>
            {tab === "site" ? (
              <SiteSettings
                values={siteValues}
                update={(key, value) => update("site", key, value)}
              />
            ) : null}
            {tab === "profiles" ? (
              <CompanyProfilesSettings
                values={siteValues}
                update={(key, value) => update("site", key, value)}
              />
            ) : null}
            {tab === "partners" ? (
              <PartnersSettings
                values={siteValues}
                update={(key, value) => update("site", key, value)}
              />
            ) : null}
            {tab === "seo" ? (
              <SeoSettings
                values={siteValues}
                update={(key, value) => update("site", key, value)}
              />
            ) : null}
            {tab === "email" ? (
              <EmailSettings
                values={settings.email || {}}
                update={(key, value) => update("email", key, value)}
              />
            ) : null}
            {tab === "integrations" ? (
              <IntegrationSettings
                values={settings.integrations || {}}
                update={(key, value) => update("integrations", key, value)}
                canManageCustomCode={isSuperAdmin}
              />
            ) : null}
            {tab === "calendar" ? (
              <CalendarSettings
                values={settings.calendar || {}}
                update={(key, value) => update("calendar", key, value)}
              />
            ) : null}
            {tab === "administrators" ? <AdministratorsSettings /> : null}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function SiteSettings({ values, update }: SettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Website operations"
        description="Operational website values. Brand name, tagline, logos, favicon, header/footer presentation and visual tokens are managed only under Global Branding."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Website URL"
            value={values.site_url}
            onChange={(value) => update("site_url", value)}
            placeholder="https://logicsify.com"
          />
          <SettingInput
            label="Default timezone"
            value={values.timezone}
            onChange={(value) => update("timezone", value)}
            placeholder="Asia/Karachi"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Business and trust settings"
        description="Verified organization details and editable support expectations used across About, schema, and customer-facing pages."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Legal business name"
            value={values.legal_name}
            onChange={(value) => update("legal_name", value)}
            placeholder="Leave empty until verified"
          />
          <SettingInput
            label="Service areas"
            value={values.service_areas}
            onChange={(value) => update("service_areas", value)}
            placeholder="Only add verified service areas"
          />
          <SettingInput
            label="Support working hours"
            value={values.support_hours}
            onChange={(value) => update("support_hours", value)}
            placeholder="For example: Monday–Friday, 9am–5pm"
          />
          <SettingInput
            label="Response expectations"
            value={values.support_response_expectation}
            onChange={(value) => update("support_response_expectation", value)}
            placeholder="Use the expectation your team can consistently meet"
          />
          <div className="md:col-span-2">
            <FieldLabel>Emergency support policy</FieldLabel>
            <textarea
              rows={3}
              value={stringValue(values.emergency_support_policy)}
              onChange={(event) => update("emergency_support_policy", event.target.value)}
              className={adminTextareaClass}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Maintenance exclusions</FieldLabel>
            <textarea
              rows={3}
              value={stringValue(values.maintenance_exclusions)}
              onChange={(event) => update("maintenance_exclusions", event.target.value)}
              className={adminTextareaClass}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Post-launch support or warranty period</FieldLabel>
            <textarea
              rows={3}
              value={stringValue(values.post_launch_period)}
              onChange={(event) => update("post_launch_period", event.target.value)}
              className={adminTextareaClass}
              placeholder="Leave empty until the policy is approved."
            />
          </div>
        </div>
      </SettingsSection>

      <ContactDirectoryEditor values={values} update={update} />
    </div>
  );
}

function ContactDirectoryEditor({ values, update }: SettingsProps) {
  const socialLinks = normalizeSocialProfiles(values.social_links);

  function patchSocial(index: number, patch: Partial<SocialProfile>) {
    update(
      "social_links",
      socialLinks.map((profile, itemIndex) =>
        itemIndex === index ? { ...profile, ...patch } : profile,
      ),
    );
  }

  function addSocial() {
    update("social_links", [
      ...socialLinks,
      {
        id: `social-${Date.now()}`,
        platform: "linkedin",
        label: "LinkedIn",
        url: "",
        enabled: true,
        sort_order: socialLinks.length,
      },
    ] satisfies SocialProfile[]);
  }

  function removeSocial(index: number) {
    update(
      "social_links",
      socialLinks
        .filter((_, itemIndex) => itemIndex !== index)
        .map((profile, itemIndex) => ({ ...profile, sort_order: itemIndex })),
    );
  }

  function moveSocial(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= socialLinks.length) return;
    const next = [...socialLinks];
    [next[index], next[target]] = [next[target], next[index]];
    update(
      "social_links",
      next.map((profile, itemIndex) => ({ ...profile, sort_order: itemIndex })),
    );
  }

  return (
    <>
      <SettingsSection
        title="Global contact details"
        description="These email addresses and the primary phone number are reused on the Contact page, footer and organization details."
        icon={Mail}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="General inquiries email"
            value={values.contact_email}
            onChange={(value) => update("contact_email", value)}
            placeholder={DEFAULT_CONTACT_EMAILS.general}
            type="email"
          />
          <SettingInput
            label="Sales email"
            value={values.sales_email}
            onChange={(value) => update("sales_email", value)}
            placeholder={DEFAULT_CONTACT_EMAILS.sales}
            type="email"
          />
          <SettingInput
            label="Support email"
            value={values.support_email}
            onChange={(value) => update("support_email", value)}
            placeholder={DEFAULT_CONTACT_EMAILS.support}
            type="email"
          />
          <SettingInput
            label="Primary phone number"
            value={values.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+966 54 441 5405"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Global social and platform links"
        description="Add any social network, portfolio, directory, review platform or community profile. Enabled links appear as icons in the footer and Contact page."
        icon={Share2}
        actions={
          <AdminButton variant="secondary" onClick={addSocial}>
            <Plus className="h-4 w-4" /> Add social link
          </AdminButton>
        }
      >
        {socialLinks.length ? (
          <div className="space-y-4">
            {socialLinks.map((profile, index) => (
              <div key={profile.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid gap-4 lg:grid-cols-[180px_1fr_1.5fr_auto] lg:items-end">
                  <div>
                    <FieldLabel>Platform</FieldLabel>
                    <select
                      value={profile.platform}
                      onChange={(event) =>
                        patchSocial(index, {
                          platform: event.target.value,
                          label: profile.label || socialPlatformLabel(event.target.value),
                        })
                      }
                      className={adminInputClass}
                    >
                      {socialPlatforms.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SettingInput
                    label="Display title"
                    value={profile.label}
                    onChange={(value) => patchSocial(index, { label: value })}
                    placeholder="LinkedIn"
                  />
                  <SettingInput
                    label="Profile URL"
                    value={profile.url}
                    onChange={(value) => patchSocial(index, { url: value })}
                    placeholder="https://…"
                    type="url"
                  />
                  <div className="flex flex-wrap gap-2">
                    <AdminButton
                      variant="secondary"
                      onClick={() => moveSocial(index, -1)}
                      disabled={index === 0}
                      ariaLabel="Move social link up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      onClick={() => moveSocial(index, 1)}
                      disabled={index === socialLinks.length - 1}
                      ariaLabel="Move social link down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      onClick={() => removeSocial(index)}
                      ariaLabel="Remove social link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </AdminButton>
                  </div>
                </div>
                <div className="mt-4">
                  <ToggleSetting
                    label="Show this profile"
                    description="Keep the link saved while temporarily hiding it from the public website."
                    checked={profile.enabled !== false}
                    onChange={(value) => patchSocial(index, { enabled: value })}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <Share2 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-4 font-semibold text-ink">No social links added yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Add only official Logicsify profiles. Empty or disabled links are never shown
              publicly.
            </p>
          </div>
        )}

        <details className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            Legacy fixed social fields
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SettingInput
              label="LinkedIn URL"
              value={values.linkedin_url}
              onChange={(value) => update("linkedin_url", value)}
            />
            <SettingInput
              label="Instagram URL"
              value={values.instagram_url}
              onChange={(value) => update("instagram_url", value)}
            />
            <SettingInput
              label="Facebook URL"
              value={values.facebook_url}
              onChange={(value) => update("facebook_url", value)}
            />
            <SettingInput
              label="X / Twitter URL"
              value={values.x_url}
              onChange={(value) => update("x_url", value)}
            />
            <SettingInput
              label="YouTube URL"
              value={values.youtube_url}
              onChange={(value) => update("youtube_url", value)}
            />
            <SettingInput
              label="Portfolio URL"
              value={values.portfolio_url}
              onChange={(value) => update("portfolio_url", value)}
            />
          </div>
        </details>
      </SettingsSection>
    </>
  );
}

const socialPlatforms: Array<[string, string]> = [
  ["linkedin", "LinkedIn"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["x", "X / Twitter"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
  ["github", "GitHub"],
  ["behance", "Behance"],
  ["dribbble", "Dribbble"],
  ["whatsapp", "WhatsApp"],
  ["clutch", "Clutch"],
  ["portfolio", "Portfolio"],
  ["website", "Website"],
  ["other", "Other platform"],
];

function socialPlatformLabel(value: string) {
  return socialPlatforms.find(([platform]) => platform === value)?.[1] || "External profile";
}

function normalizeSocialProfiles(value: unknown): SocialProfile[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item, index): SocialProfile => ({
      id: String(item.id || `social-${index}`),
      platform: String(item.platform || "website"),
      label: String(item.label || socialPlatformLabel(String(item.platform || "website"))),
      url: String(item.url || ""),
      enabled: item.enabled === undefined ? true : boolValue(item.enabled),
      sort_order: Number(item.sort_order ?? index),
    }))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function CompanyProfilesSettings({ values, update }: SettingsProps) {
  const profiles = Array.isArray(values.company_profiles)
    ? (values.company_profiles as CompanyProfile[])
    : [];
  const [pickerOpen, setPickerOpen] = useState(false);

  function replace(next: CompanyProfile[]) {
    update(
      "company_profiles",
      next.map((item, index) => ({ ...item, sort_order: index })),
    );
  }

  return (
    <>
      <SettingsSection
        title="PDF company profiles"
        description="Upload and retain multiple company-profile PDFs, then choose exactly one active version for the About page."
        icon={FileDown}
        actions={
          <AdminButton variant="secondary" onClick={() => setPickerOpen(true)}>
            <UploadCloud className="h-4 w-4" /> Add PDFs
          </AdminButton>
        }
      >
        {profiles.length ? (
          <div className="space-y-3">
            {profiles.map((profile, index) => (
              <article
                key={profile.id}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-ink">
                  <input
                    type="radio"
                    name="active-company-profile"
                    checked={profile.active}
                    onChange={() =>
                      replace(
                        profiles.map((item, itemIndex) => ({
                          ...item,
                          active: itemIndex === index,
                        })),
                      )
                    }
                    className="accent-brand-red"
                  />{" "}
                  Active
                </label>
                <div>
                  <FieldLabel>Profile title</FieldLabel>
                  <input
                    value={profile.name}
                    onChange={(event) =>
                      replace(
                        profiles.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                    className={adminInputClass}
                  />
                </div>
                <div className="flex gap-2">
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-ink"
                  >
                    <ExternalLink className="h-4 w-4" /> View
                  </a>
                  <AdminButton
                    variant="danger"
                    ariaLabel="Remove company profile"
                    onClick={() =>
                      replace(
                        profiles
                          .filter((_, itemIndex) => itemIndex !== index)
                          .map((item, itemIndex) => ({
                            ...item,
                            active: item.active || (profile.active && itemIndex === 0),
                          })),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <FileDown className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-semibold text-ink">No company profiles uploaded</p>
            <p className="mt-1 text-sm text-slate-500">
              Add one or more PDF files from Media Library.
            </p>
          </div>
        )}
      </SettingsSection>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        kind="documents"
        multiple
        selectedUrls={profiles.map((item) => item.url)}
        onSelect={() => undefined}
        onSelectMany={(urls, items) => {
          const existing = new Set(profiles.map((item) => item.url));
          const additions = urls
            .filter((url) => !existing.has(url))
            .map((url, offset) => {
              const media = items.find((item) => item.url === url);
              return {
                id: `company-profile-${Date.now()}-${offset}`,
                name:
                  media?.original_name?.replace(/\.pdf$/i, "") ||
                  `Company Profile ${profiles.length + offset + 1}`,
                url,
                active: profiles.length === 0 && offset === 0,
                sort_order: profiles.length + offset,
              } satisfies CompanyProfile;
            });
          replace([...profiles, ...additions]);
        }}
        title="Choose company profile PDFs"
      />
    </>
  );
}

function PartnersSettings({ values, update }: SettingsProps) {
  const partners = Array.isArray(values.partners) ? (values.partners as Partner[]) : [];
  const [logoTarget, setLogoTarget] = useState<number | null>(null);
  const replace = (next: Partner[]) =>
    update(
      "partners",
      next.map((item, index) => ({ ...item, sort_order: index })),
    );
  const patch = (index: number, value: Partial<Partner>) =>
    replace(
      partners.map((item, itemIndex) => (itemIndex === index ? { ...item, ...value } : item)),
    );
  function addPartner() {
    replace([
      ...partners,
      {
        id: `partner-${Date.now()}`,
        name: "",
        logo_url: "",
        website_url: "",
        link_enabled: false,
        status: "draft",
        sort_order: partners.length,
      },
    ]);
  }

  return (
    <>
      <SettingsSection
        title="Homepage partners"
        description="Manage partner names, logos, website links, link behavior and publication status."
        icon={Handshake}
        actions={
          <AdminButton variant="secondary" onClick={addPartner}>
            <Plus className="h-4 w-4" /> Add partner
          </AdminButton>
        }
      >
        {partners.length ? (
          <div className="space-y-4">
            {partners.map((partner, index) => (
              <article
                key={partner.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[120px_1fr_1.4fr_150px_auto] lg:items-end">
                  <button
                    type="button"
                    onClick={() => setLogoTarget(index)}
                    className="grid h-[86px] place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white p-3"
                  >
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                        <span className="text-[10px] text-slate-400">Choose logo</span>
                      </>
                    )}
                  </button>
                  <SettingInput
                    label="Partner name"
                    value={partner.name}
                    onChange={(value) => patch(index, { name: value })}
                  />
                  <SettingInput
                    label="Website URL"
                    value={partner.website_url}
                    onChange={(value) => patch(index, { website_url: value })}
                    placeholder="https://…"
                    type="url"
                  />
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <select
                      value={partner.status}
                      onChange={(event) =>
                        patch(index, { status: event.target.value as Partner["status"] })
                      }
                      className={adminInputClass}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <AdminButton
                    variant="danger"
                    ariaLabel="Remove partner"
                    onClick={() => replace(partners.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>
                <div className="mt-4">
                  <ToggleSetting
                    label="Link logo to partner website"
                    description="When off, the logo is displayed without a clickable link."
                    checked={partner.link_enabled}
                    onChange={(value) => patch(index, { link_enabled: value })}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <Handshake className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-semibold text-ink">No partners added</p>
          </div>
        )}
      </SettingsSection>
      <MediaPicker
        open={logoTarget !== null}
        onClose={() => setLogoTarget(null)}
        kind="images"
        onSelect={(url) => {
          if (logoTarget !== null) patch(logoTarget, { logo_url: url });
          setLogoTarget(null);
        }}
        title="Choose partner logo"
      />
    </>
  );
}

function HeaderSettings({ values, update }: SettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Brand assets"
        description="Upload the logos and browser icons used by the website and admin panel. You can also paste an existing media URL."
        icon={ImageIcon}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <ImageSettingField
            label="Header logo — light background"
            help="Use the dark/colored logo shown on white headers."
            value={values.logo_dark}
            onChange={(value) => update("logo_dark", value)}
          />
          <ImageSettingField
            label="Header logo — dark background"
            help="Use the white/light logo shown over the home hero."
            value={values.logo_light}
            onChange={(value) => update("logo_light", value)}
          />
          <ImageSettingField
            label="Mobile menu logo"
            help="Optional. Falls back to the light-background header logo."
            value={values.mobile_logo}
            onChange={(value) => update("mobile_logo", value)}
          />
          <ImageSettingField
            label="Admin panel logo"
            help="Optional logo displayed in the admin sidebar and login screen."
            value={values.admin_logo}
            onChange={(value) => update("admin_logo", value)}
          />
          <ImageSettingField
            label="Favicon"
            help="Recommended square PNG or ICO, at least 48×48px."
            value={values.favicon}
            onChange={(value) => update("favicon", value)}
            accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/webp"
          />
          <ImageSettingField
            label="Apple touch icon"
            help="Recommended 180×180px PNG for iPhone and iPad bookmarks."
            value={values.apple_touch_icon}
            onChange={(value) => update("apple_touch_icon", value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Header behavior"
        description="Control header positioning, transparency, logo sizing and the primary call-to-action."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleSetting
            label="Sticky header"
            description="Keep the header visible while visitors scroll."
            checked={boolValue(values.sticky_header, true)}
            onChange={(value) => update("sticky_header", value)}
          />
          <ToggleSetting
            label="Transparent header on home"
            description="Use the light logo over the homepage hero before scrolling."
            checked={boolValue(values.transparent_header_home, true)}
            onChange={(value) => update("transparent_header_home", value)}
          />
          <ToggleSetting
            label="Show header CTA"
            description="Display the primary button in desktop and mobile navigation."
            checked={boolValue(values.show_header_cta, true)}
            onChange={(value) => update("show_header_cta", value)}
          />
          <ToggleSetting
            label="Open CTA in a new tab"
            description="Useful when the CTA points to an external calendar or application."
            checked={boolValue(values.header_cta_new_tab)}
            onChange={(value) => update("header_cta_new_tab", value)}
          />
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Header CTA label"
            value={values.header_cta_label}
            onChange={(value) => update("header_cta_label", value)}
            placeholder="Book a Strategy Call"
          />
          <SettingInput
            label="Header CTA URL"
            value={values.header_cta_url}
            onChange={(value) => update("header_cta_url", value)}
            placeholder="/technical-roadmap"
          />
          <SettingInput
            label="Desktop logo height (px)"
            value={values.header_logo_height_desktop}
            onChange={(value) => update("header_logo_height_desktop", numberValue(value, 36))}
            type="number"
          />
          <SettingInput
            label="Mobile logo height (px)"
            value={values.header_logo_height_mobile}
            onChange={(value) => update("header_logo_height_mobile", numberValue(value, 28))}
            type="number"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Announcement bar"
        description="Add an optional message above the main navigation for launches, offers or important updates."
      >
        <ToggleSetting
          label="Enable announcement bar"
          description="Show a compact announcement above the header navigation."
          checked={boolValue(values.announcement_enabled)}
          onChange={(value) => update("announcement_enabled", value)}
        />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Announcement text"
            value={values.announcement_text}
            onChange={(value) => update("announcement_text", value)}
            placeholder="Now booking new projects for Q4."
          />
          <SettingInput
            label="Link label"
            value={values.announcement_link_label}
            onChange={(value) => update("announcement_link_label", value)}
            placeholder="Learn more"
          />
          <SettingInput
            label="Announcement URL"
            value={values.announcement_url}
            onChange={(value) => update("announcement_url", value)}
            placeholder="/contact"
          />
          <ToggleSetting
            label="Open announcement link in a new tab"
            description="Enable when the link points to another website."
            checked={boolValue(values.announcement_new_tab)}
            onChange={(value) => update("announcement_new_tab", value)}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

function FooterSettings({ values, update }: SettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Footer branding"
        description="Control the footer logo and company description. Contact channels, locations and social profiles are managed globally under Site Settings."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <ImageSettingField
            label="Footer logo"
            help="Falls back to the light header logo when left empty."
            value={values.footer_logo}
            onChange={(value) => update("footer_logo", value)}
          />
          <div>
            <FieldLabel>Footer description</FieldLabel>
            <textarea
              rows={6}
              value={stringValue(values.footer_description)}
              onChange={(event) => update("footer_description", event.target.value)}
              className={adminTextareaClass}
              placeholder="We build AI-powered sales, customer service, and business operations systems."
            />
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          The footer now uses the global contact emails, phone, business locations and social links
          configured in the Site Settings tab. This keeps the Contact page and footer synchronized.
        </div>
      </SettingsSection>

      <SettingsSection
        title="Footer actions and visibility"
        description="Manage the call-to-action, social icons and legal links displayed in the footer."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleSetting
            label="Show social profiles"
            description="Display configured social links under the footer description."
            checked={boolValue(values.show_social_links, true)}
            onChange={(value) => update("show_social_links", value)}
          />
          <ToggleSetting
            label="Show Privacy Policy link"
            description="Display the Privacy Policy link in the footer legal row."
            checked={boolValue(values.show_privacy_link, true)}
            onChange={(value) => update("show_privacy_link", value)}
          />
          <ToggleSetting
            label="Show Terms & Conditions link"
            description="Display the Terms & Conditions link in the footer legal row."
            checked={boolValue(values.show_terms_link, true)}
            onChange={(value) => update("show_terms_link", value)}
          />
          <ToggleSetting
            label="Open footer CTA in a new tab"
            description="Enable for an external booking or contact URL."
            checked={boolValue(values.footer_cta_new_tab)}
            onChange={(value) => update("footer_cta_new_tab", value)}
          />
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Footer CTA label"
            value={values.footer_cta_label}
            onChange={(value) => update("footer_cta_label", value)}
            placeholder="Get a Free Technical Roadmap"
          />
          <SettingInput
            label="Footer CTA URL"
            value={values.footer_cta_url}
            onChange={(value) => update("footer_cta_url", value)}
            placeholder="/technical-roadmap"
          />
          <div className="md:col-span-2">
            <SettingInput
              label="Copyright text"
              value={values.copyright_text}
              onChange={(value) => update("copyright_text", value)}
              placeholder="© {year} Logicsify. All rights reserved."
            />
            <p className="mt-2 text-xs text-slate-400">
              Use <code>{"{year}"}</code> to insert the current year automatically.
            </p>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

function SeoSettings({ values, update }: SettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Default metadata"
        description="Fallback metadata used whenever an individual page or content item does not provide its own values."
      >
        <div className="space-y-5">
          <SettingInput
            label="Default SEO title"
            value={values.default_seo_title}
            onChange={(value) => update("default_seo_title", value)}
            placeholder="Logicsify | Technology, Marketing & AI Automation"
          />
          <div>
            <FieldLabel>Default meta description</FieldLabel>
            <textarea
              rows={4}
              value={stringValue(values.default_seo_description)}
              onChange={(event) => update("default_seo_description", event.target.value)}
              className={adminTextareaClass}
            />
          </div>
          <ImageSettingField
            label="Default social sharing image"
            help="Recommended 1200×630px. Used for Open Graph and social previews."
            value={values.default_og_image}
            onChange={(value) => update("default_og_image", value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Indexing defaults"
        description="Set the global indexing defaults. Browser/app theme color is managed under Global Branding."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleSetting
            label="Allow search engine indexing"
            description="Use index by default for public pages."
            checked={boolValue(values.robots_index, true)}
            onChange={(value) => update("robots_index", value)}
          />
          <ToggleSetting
            label="Allow search engines to follow links"
            description="Use follow by default for public pages."
            checked={boolValue(values.robots_follow, true)}
            onChange={(value) => update("robots_follow", value)}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

function EmailSettings({ values, update }: SettingsProps) {
  const [testing, setTesting] = useState(false);
  async function runTest() {
    setTesting(true);
    try {
      const result = await testSmtp();
      toast.success(result.message || "Test email sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "SMTP test failed.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Email delivery"
        description="Configure sender identity and the inbox that receives lead and booking notifications."
        actions={
          <AdminButton variant="secondary" onClick={() => void runTest()} disabled={testing}>
            <Send className="h-4 w-4" /> {testing ? "Sending…" : "Send test email"}
          </AdminButton>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <ToggleSetting
            label="Enable SMTP"
            description="Use the SMTP server below instead of PHP mail()."
            checked={boolValue(values.smtp_enabled)}
            onChange={(value) => update("smtp_enabled", value)}
          />
          <SettingInput
            label="Notification email"
            value={values.notification_email}
            onChange={(value) => update("notification_email", value)}
            placeholder="hello@logicsify.com"
            type="email"
          />
          <SettingInput
            label="From name"
            value={values.from_name}
            onChange={(value) => update("from_name", value)}
            placeholder="Logicsify"
          />
          <SettingInput
            label="From email"
            value={values.from_email}
            onChange={(value) => update("from_email", value)}
            placeholder="hello@logicsify.com"
            type="email"
          />
          <SettingInput
            label="Reply-to email"
            value={values.reply_to_email}
            onChange={(value) => update("reply_to_email", value)}
            placeholder="Optional"
            type="email"
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="SMTP server"
        description="Use the credentials supplied by your email provider or hosting account."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="SMTP host"
            value={values.smtp_host}
            onChange={(value) => update("smtp_host", value)}
            placeholder="smtp.example.com"
          />
          <SettingInput
            label="SMTP port"
            value={values.smtp_port}
            onChange={(value) => update("smtp_port", numberValue(value, 587))}
            placeholder="587"
            type="number"
          />
          <SettingInput
            label="SMTP username"
            value={values.smtp_username}
            onChange={(value) => update("smtp_username", value)}
          />
          <SettingInput
            label="SMTP password"
            value={values.smtp_password}
            onChange={(value) => update("smtp_password", value)}
            type="password"
          />
          <div>
            <FieldLabel>Encryption</FieldLabel>
            <select
              value={stringValue(values.smtp_encryption) || "tls"}
              onChange={(event) => update("smtp_encryption", event.target.value)}
              className={adminInputClass}
            >
              <option value="tls">TLS / STARTTLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </SettingsSection>
      <SettingsSection
        title="Notification behavior"
        description="Choose which events should generate administrative and customer email alerts."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleSetting
            label="Contact form notifications"
            description="Email the team whenever a new project inquiry arrives."
            checked={boolValue(values.notify_contact, true)}
            onChange={(value) => update("notify_contact", value)}
          />
          <ToggleSetting
            label="Booking notifications"
            description="Email the team whenever a strategy call is requested."
            checked={boolValue(values.notify_booking, true)}
            onChange={(value) => update("notify_booking", value)}
          />
          <ToggleSetting
            label="Contact confirmation email"
            description="Send a confirmation email to visitors who submit the contact form."
            checked={boolValue(values.confirm_contact_sender, true)}
            onChange={(value) => update("confirm_contact_sender", value)}
          />
          <ToggleSetting
            label="Booking confirmation email"
            description="Send booking details to the visitor after submission."
            checked={boolValue(values.confirm_booking_sender, true)}
            onChange={(value) => update("confirm_booking_sender", value)}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

function IntegrationSettings({
  values,
  update,
  canManageCustomCode,
}: SettingsProps & { canManageCustomCode: boolean }) {
  const snippets = normalizeSnippets(values.snippets);

  function setSnippets(next: CodeSnippet[]) {
    update(
      "snippets",
      next.map((snippet, index) => ({ ...snippet, sort_order: index })),
    );
  }

  function addSnippet(snippetType: CodeSnippet["snippet_type"]) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `snippet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setSnippets([
      ...snippets,
      {
        id,
        title: snippetType === "integration" ? "New integration" : "New code block",
        snippet_type: snippetType,
        placement: "body_end",
        target: "public",
        code: "",
        enabled: false,
        sort_order: snippets.length,
      },
    ]);
  }

  function patchSnippet(index: number, patch: Partial<CodeSnippet>) {
    setSnippets(
      snippets.map((snippet, itemIndex) =>
        itemIndex === index ? { ...snippet, ...patch } : snippet,
      ),
    );
  }

  function moveSnippet(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= snippets.length) return;
    const next = [...snippets];
    [next[index], next[destination]] = [next[destination], next[index]];
    setSnippets(next);
  }

  function duplicateSnippet(index: number) {
    const source = snippets[index];
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `snippet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next = [...snippets];
    next.splice(index + 1, 0, {
      ...source,
      id,
      title: `${source.title} copy`,
      enabled: false,
    });
    setSnippets(next);
  }

  function removeSnippet(index: number) {
    if (!window.confirm("Delete this code snippet?")) return;
    setSnippets(snippets.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Tracking master switch"
        description="Disable built-in analytics and advertising scripts without deleting saved IDs. Custom snippets have their own enable switches."
      >
        <ToggleSetting
          label="Enable website tracking"
          description="Load configured tracking and analytics integrations on the public website."
          checked={
            values.tracking_enabled === undefined ? true : boolValue(values.tracking_enabled)
          }
          onChange={(value) => update("tracking_enabled", value)}
        />
      </SettingsSection>

      <SettingsSection
        title="Google reCAPTCHA v3"
        description="Protect every public form—contact, estimator, technical roadmap, newsletter, guide downloads, and bookings. When disabled, all forms continue working normally."
      >
        <ToggleSetting
          label="Enable reCAPTCHA on all forms"
          description="Enable only after both keys are saved. Visitors are verified invisibly when they submit a form."
          checked={boolValue(values.recaptcha_enabled)}
          onChange={(value) => update("recaptcha_enabled", value)}
        />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingInput
            label="reCAPTCHA site key"
            value={values.recaptcha_site_key}
            onChange={(value) => update("recaptcha_site_key", value)}
            placeholder="Public site key"
          />
          <SettingInput
            label="reCAPTCHA secret key"
            value={values.recaptcha_secret_key}
            onChange={(value) => update("recaptcha_secret_key", value)}
            placeholder="Server secret key"
            type="password"
          />
          <SettingInput
            label="Minimum score (0.1–1.0)"
            value={values.recaptcha_min_score ?? 0.5}
            onChange={(value) =>
              update("recaptcha_min_score", Math.max(0.1, Math.min(1, Number(value) || 0.5)))
            }
            type="number"
          />
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Recommended starting score: 0.5. The secret key is used only by the backend and is never
          exposed to website visitors.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Analytics and advertising"
        description="Paste platform identifiers only. The website runtime loads the standard scripts."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Google Tag Manager ID"
            value={values.gtm_id}
            onChange={(value) => update("gtm_id", value)}
            placeholder="GTM-XXXXXXX"
          />
          <SettingInput
            label="Google Analytics 4 ID"
            value={values.ga4_id}
            onChange={(value) => update("ga4_id", value)}
            placeholder="G-XXXXXXXXXX"
          />
          <SettingInput
            label="Meta Pixel ID"
            value={values.meta_pixel_id}
            onChange={(value) => update("meta_pixel_id", value)}
          />
          <SettingInput
            label="LinkedIn Partner ID"
            value={values.linkedin_partner_id}
            onChange={(value) => update("linkedin_partner_id", value)}
          />
          <SettingInput
            label="TikTok Pixel ID"
            value={values.tiktok_pixel_id}
            onChange={(value) => update("tiktok_pixel_id", value)}
          />
          <SettingInput
            label="Microsoft Clarity ID"
            value={values.clarity_id}
            onChange={(value) => update("clarity_id", value)}
          />
          <SettingInput
            label="Hotjar Site ID"
            value={values.hotjar_id}
            onChange={(value) => update("hotjar_id", value)}
          />
          <SettingInput
            label="HubSpot Portal ID"
            value={values.hubspot_portal_id}
            onChange={(value) => update("hubspot_portal_id", value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Chat and customer tools"
        description="Enable customer messaging and support widgets."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Crisp Website ID"
            value={values.crisp_website_id}
            onChange={(value) => update("crisp_website_id", value)}
          />
          <SettingInput
            label="Intercom App ID"
            value={values.intercom_app_id}
            onChange={(value) => update("intercom_app_id", value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Search verification"
        description="Verification tokens used by webmaster and search tools."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Google site verification"
            value={values.google_site_verification}
            onChange={(value) => update("google_site_verification", value)}
          />
          <SettingInput
            label="Bing site verification"
            value={values.bing_site_verification}
            onChange={(value) => update("bing_site_verification", value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Custom snippets"
        description="Create separate, titled integration or code blocks and control exactly where each one is inserted."
        icon={Code2}
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Frontend code only</p>
              <p className="mt-1 leading-6">
                Never place API secrets, database credentials, private tokens, or server keys here.
                Snippets run in the visitor’s browser. Use <code>?safe-runtime=1</code> on the
                public site or <code>?safe-admin=1</code> in the admin panel to temporarily bypass
                custom code during recovery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-ink">{snippets.length} code blocks</p>
            <p className="mt-1 text-sm text-slate-500">
              Disabled snippets remain saved but are not executed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="secondary"
              disabled={!canManageCustomCode}
              onClick={() => addSnippet("integration")}
            >
              <Plus className="h-4 w-4" /> Add integration
            </AdminButton>
            <AdminButton
              type="button"
              disabled={!canManageCustomCode}
              onClick={() => addSnippet("custom_code")}
            >
              <Plus className="h-4 w-4" /> Add code block
            </AdminButton>
          </div>
        </div>

        {!canManageCustomCode ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
            Only a Super Admin can add, edit, enable, reorder, or delete snippets.
          </p>
        ) : null}

        {snippets.length ? (
          <div className="space-y-4">
            {snippets.map((snippet, index) => (
              <div key={snippet.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        {snippet.snippet_type === "integration" ? "Integration" : "Code"}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {placementLabel(snippet.placement)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {targetLabel(snippet.target)}
                      </span>
                    </div>
                    <p className="mt-3 truncate font-semibold text-ink">
                      {snippet.title || "Untitled snippet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Move up"
                      disabled={!canManageCustomCode || index === 0}
                      onClick={() => moveSnippet(index, -1)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-ink disabled:opacity-35"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={!canManageCustomCode || index === snippets.length - 1}
                      onClick={() => moveSnippet(index, 1)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-ink disabled:opacity-35"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Duplicate"
                      disabled={!canManageCustomCode}
                      onClick={() => duplicateSnippet(index)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-ink disabled:opacity-35"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      disabled={!canManageCustomCode}
                      onClick={() => removeSnippet(index)}
                      className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50 disabled:opacity-35"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="xl:col-span-2">
                    <FieldLabel>Title</FieldLabel>
                    <input
                      value={snippet.title}
                      disabled={!canManageCustomCode}
                      onChange={(event) => patchSnippet(index, { title: event.target.value })}
                      className={adminInputClass}
                      placeholder="For example: CallRail tracking"
                    />
                  </div>
                  <div>
                    <FieldLabel>Type</FieldLabel>
                    <select
                      value={snippet.snippet_type}
                      disabled={!canManageCustomCode}
                      onChange={(event) =>
                        patchSnippet(index, {
                          snippet_type: event.target.value as CodeSnippet["snippet_type"],
                        })
                      }
                      className={adminInputClass}
                    >
                      <option value="integration">Integration</option>
                      <option value="custom_code">Custom code</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={snippet.enabled}
                        disabled={!canManageCustomCode}
                        onChange={(event) => patchSnippet(index, { enabled: event.target.checked })}
                        className="h-4 w-4 accent-brand-red"
                      />
                      Enabled
                    </label>
                  </div>
                  <div>
                    <FieldLabel>Insert location</FieldLabel>
                    <select
                      value={snippet.placement}
                      disabled={!canManageCustomCode}
                      onChange={(event) =>
                        patchSnippet(index, {
                          placement: event.target.value as CodeSnippet["placement"],
                        })
                      }
                      className={adminInputClass}
                    >
                      <option value="head">Head</option>
                      <option value="body_start">Start of body</option>
                      <option value="body_end">End of body</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Run on</FieldLabel>
                    <select
                      value={snippet.target}
                      disabled={!canManageCustomCode}
                      onChange={(event) =>
                        patchSnippet(index, {
                          target: event.target.value as CodeSnippet["target"],
                        })
                      }
                      className={adminInputClass}
                    >
                      <option value="public">Public website</option>
                      <option value="admin">Admin panel</option>
                      <option value="both">Website and admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel>Code</FieldLabel>
                    <span className="text-xs text-slate-500">
                      {snippet.code.length.toLocaleString()} characters
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={snippet.code}
                    disabled={!canManageCustomCode}
                    onChange={(event) => patchSnippet(index, { code: event.target.value })}
                    className={`${adminTextareaClass} font-mono text-xs disabled:cursor-not-allowed disabled:bg-slate-100`}
                    placeholder={"<script>\n  // Your browser-side integration code\n</script>"}
                    spellCheck={false}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <Code2 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-4 font-semibold text-ink">No custom snippets yet</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
              Built-in analytics IDs above do not require snippets. Add a block only for a trusted
              service that is not already supported.
            </p>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}

function normalizeSnippets(value: unknown): CodeSnippet[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item, index): CodeSnippet => ({
      id: String(item.id || `snippet-${index}`),
      title: String(item.title || "Untitled snippet"),
      snippet_type: item.snippet_type === "integration" ? "integration" : "custom_code",
      placement:
        item.placement === "head" || item.placement === "body_start" ? item.placement : "body_end",
      target: item.target === "admin" || item.target === "both" ? item.target : "public",
      code: String(item.code || ""),
      enabled: boolValue(item.enabled),
      sort_order: Number(item.sort_order || index),
    }))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function placementLabel(value: CodeSnippet["placement"]) {
  if (value === "head") return "Head";
  if (value === "body_start") return "Body start";
  return "Body end";
}

function targetLabel(value: CodeSnippet["target"]) {
  if (value === "admin") return "Admin";
  if (value === "both") return "Website + admin";
  return "Website";
}

function CalendarSettings({ values, update }: SettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Meeting defaults"
        description="Control the strategy-call experience used on Contact and Book a Call pages."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Meeting title"
            value={values.meeting_title}
            onChange={(value) => update("meeting_title", value)}
            placeholder="30-Minute Strategy Call"
          />
          <SettingInput
            label="Meeting duration (minutes)"
            value={values.meeting_duration}
            onChange={(value) => update("meeting_duration", numberValue(value, 30))}
            type="number"
          />
          <SettingInput
            label="Minimum notice (hours)"
            value={values.booking_notice_hours}
            onChange={(value) => update("booking_notice_hours", numberValue(value, 0))}
            type="number"
          />
          <SettingInput
            label="Booking window (days)"
            value={values.booking_window_days}
            onChange={(value) => update("booking_window_days", numberValue(value, 60))}
            type="number"
          />
          <SettingInput
            label="Calendar timezone"
            value={values.timezone}
            onChange={(value) => update("timezone", value)}
            placeholder="Asia/Karachi"
          />
          <SettingInput
            label="Video meeting URL"
            value={values.meeting_url}
            onChange={(value) => update("meeting_url", value)}
            placeholder="https://meet.google.com/…"
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="Confirmation copy"
        description="Message shown after a visitor successfully requests a time."
      >
        <div>
          <FieldLabel>Confirmation message</FieldLabel>
          <textarea
            rows={5}
            value={stringValue(values.confirmation_message)}
            onChange={(event) => update("confirmation_message", event.target.value)}
            className={adminTextareaClass}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

function AdministratorsSettings() {
  return (
    <SettingsSection
      title="Administrators"
      description="Manage Super Admin, Admin and Editor accounts from the protected administrators screen."
      icon={ShieldCheck}
    >
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">Administrator access and roles</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Create users, update roles, reset passwords, activate or suspend accounts, and review
            the latest login activity.
          </p>
        </div>
        <a
          href={adminHref("administrators")}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          Manage administrators <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </SettingsSection>
  );
}

type SettingsProps = {
  values: Record<string, unknown>;
  update: (key: string, value: unknown) => void;
};

function SettingsSection({
  title,
  description,
  children,
  actions,
  icon: Icon = Settings2,
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  icon?: typeof Settings2;
}) {
  return (
    <AdminCard>
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-ink">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
          </div>
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </AdminCard>
  );
}

function SettingInput({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={stringValue(value)}
        onChange={(event) => onChange(event.target.value)}
        className={adminInputClass}
        placeholder={placeholder}
      />
    </div>
  );
}

function ImageSettingField({
  label,
  help,
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
}: {
  label: string;
  help: string;
  value: unknown;
  onChange: (value: string) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = stringValue(value);

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file, label);
      onChange(media.url);
      toast.success("Image uploaded. Save settings to apply it to the website.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <FieldLabel>{label}</FieldLabel>
      <p className="mb-3 text-xs leading-5 text-slate-400">{help}</p>
      <div className="mb-3 grid min-h-28 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
        {url ? (
          <img src={url} alt="" className="max-h-24 max-w-full object-contain" />
        ) : (
          <div className="text-center text-slate-300">
            <ImageIcon className="mx-auto h-7 w-7" />
            <span className="mt-2 block text-xs">No image selected</span>
          </div>
        )}
      </div>
      <input
        value={url}
        onChange={(event) => onChange(event.target.value)}
        className={adminInputClass}
        placeholder="Paste media URL or upload an image"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <AdminButton
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Upload image"}
        </AdminButton>
        {url ? (
          <AdminButton variant="danger" onClick={() => onChange("")}>
            <Trash2 className="h-4 w-4" /> Clear
          </AdminButton>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => void upload(event.target.files?.[0])}
      />
    </div>
  );
}

function ColorSetting({
  label,
  value,
  onChange,
  fallback,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  fallback: string;
}) {
  const current = /^#[0-9a-fA-F]{6}$/.test(stringValue(value)) ? stringValue(value) : fallback;
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={current}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
        <input
          value={stringValue(value) || fallback}
          onChange={(event) => onChange(event.target.value)}
          className={adminInputClass}
          placeholder={fallback}
        />
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 p-4">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-ink" : "bg-slate-200"}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`}
        />
      </span>
    </label>
  );
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function boolValue(value: unknown, fallback = false) {
  if (value === null || value === undefined || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
