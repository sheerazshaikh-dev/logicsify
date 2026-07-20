import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Code2,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  LayoutPanelTop,
  Loader2,
  Mail,
  Palette,
  Save,
  SearchCheck,
  Send,
  Settings2,
  Share2,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
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
  getSettings,
  saveSettings,
  testSmtp,
  uploadMedia,
  type SettingsResponse,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

type Tab =
  "site" | "header" | "footer" | "seo" | "email" | "integrations" | "calendar" | "administrators";

type SettingGroup = "site" | "email" | "integrations" | "calendar";

const tabConfig: Array<{
  id: Tab;
  label: string;
  icon: typeof Globe2;
  group?: SettingGroup;
}> = [
  { id: "site", label: "Site Settings", icon: Globe2, group: "site" },
  { id: "header", label: "Header & Branding", icon: LayoutPanelTop, group: "site" },
  { id: "footer", label: "Footer", icon: Palette, group: "site" },
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

  useEffect(() => {
    getSettings()
      .then(setSettings)
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
        description="Manage the website identity, header, footer, favicon, email delivery, integrations, calendar and administrators from one place."
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
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${tab === id ? "bg-[#190A2F] text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon className={`h-4 w-4 ${tab === id ? "text-[#FDBE02]" : "text-slate-400"}`} />
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
            {tab === "header" ? (
              <HeaderSettings
                values={siteValues}
                update={(key, value) => update("site", key, value)}
              />
            ) : null}
            {tab === "footer" ? (
              <FooterSettings
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
        title="Website identity"
        description="Core information used throughout the public website, admin panel and metadata."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Site name"
            value={values.site_name}
            onChange={(value) => update("site_name", value)}
            placeholder="Logicsify"
          />
          <SettingInput
            label="Tagline"
            value={values.tagline}
            onChange={(value) => update("tagline", value)}
            placeholder="Technology, marketing, and automation—logically built for growth."
          />
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
        title="Contact information"
        description="Contact details used in the footer, forms, schema and customer-facing pages."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="Primary email"
            value={values.contact_email}
            onChange={(value) => update("contact_email", value)}
            placeholder="hello@logicsify.com"
            type="email"
          />
          <SettingInput
            label="Phone number"
            value={values.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+1 000 000 0000"
          />
          <SettingInput
            label="Address line 1"
            value={values.address_line_1}
            onChange={(value) => update("address_line_1", value)}
            placeholder="Street address"
          />
          <SettingInput
            label="Address line 2"
            value={values.address_line_2}
            onChange={(value) => update("address_line_2", value)}
            placeholder="Suite, floor or unit"
          />
          <SettingInput
            label="City"
            value={values.city}
            onChange={(value) => update("city", value)}
          />
          <SettingInput
            label="State / Province"
            value={values.state}
            onChange={(value) => update("state", value)}
          />
          <SettingInput
            label="Postal code"
            value={values.postal_code}
            onChange={(value) => update("postal_code", value)}
          />
          <SettingInput
            label="Country"
            value={values.country}
            onChange={(value) => update("country", value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Social profiles"
        description="Social links displayed in the footer and included in organization schema."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SettingInput
            label="LinkedIn URL"
            value={values.linkedin_url}
            onChange={(value) => update("linkedin_url", value)}
            placeholder="https://linkedin.com/company/…"
          />
          <SettingInput
            label="Instagram URL"
            value={values.instagram_url}
            onChange={(value) => update("instagram_url", value)}
            placeholder="https://instagram.com/…"
          />
          <SettingInput
            label="Facebook URL"
            value={values.facebook_url}
            onChange={(value) => update("facebook_url", value)}
            placeholder="https://facebook.com/…"
          />
          <SettingInput
            label="X / Twitter URL"
            value={values.x_url}
            onChange={(value) => update("x_url", value)}
            placeholder="https://x.com/…"
          />
          <SettingInput
            label="YouTube URL"
            value={values.youtube_url}
            onChange={(value) => update("youtube_url", value)}
            placeholder="https://youtube.com/@…"
          />
          <SettingInput
            label="Behance / Dribbble URL"
            value={values.portfolio_url}
            onChange={(value) => update("portfolio_url", value)}
            placeholder="https://…"
          />
        </div>
      </SettingsSection>
    </div>
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
            placeholder="/book-a-call"
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
        description="Control the footer logo, company description and contact details."
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
              placeholder="Logicsify designs, builds, markets, and automates digital systems for ambitious businesses."
            />
          </div>
          <SettingInput
            label="Footer email"
            value={values.footer_email}
            onChange={(value) => update("footer_email", value)}
            placeholder="Defaults to primary email"
            type="email"
          />
          <SettingInput
            label="Footer phone"
            value={values.footer_phone}
            onChange={(value) => update("footer_phone", value)}
            placeholder="Defaults to primary phone"
          />
          <div className="md:col-span-2">
            <FieldLabel>Footer address</FieldLabel>
            <textarea
              rows={3}
              value={stringValue(values.footer_address)}
              onChange={(event) => update("footer_address", event.target.value)}
              className={adminTextareaClass}
              placeholder="Optional formatted address"
            />
          </div>
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
            placeholder="Book a strategy call"
          />
          <SettingInput
            label="Footer CTA URL"
            value={values.footer_cta_url}
            onChange={(value) => update("footer_cta_url", value)}
            placeholder="/book-a-call"
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
        title="Indexing and browser appearance"
        description="Set the global indexing defaults and browser theme color. Individual pages may still override metadata."
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
          <ColorSetting
            label="Browser theme color"
            value={values.theme_color}
            onChange={(value) => update("theme_color", value)}
            fallback="#190A2F"
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

function IntegrationSettings({ values, update }: SettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Tracking master switch"
        description="Disable all optional analytics and advertising scripts without deleting saved IDs."
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
        title="Analytics and advertising"
        description="Paste the platform identifiers only; the website runtime loads the correct scripts."
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
        title="Custom code"
        description="Advanced scripts inserted after built-in integrations. Only trusted administrators should edit these fields."
        icon={Code2}
      >
        <div className="space-y-5">
          <div>
            <FieldLabel>Head code</FieldLabel>
            <textarea
              rows={8}
              value={stringValue(values.head_code)}
              onChange={(event) => update("head_code", event.target.value)}
              className={`${adminTextareaClass} font-mono text-xs`}
              placeholder="<!-- Custom code before </head> -->"
            />
          </div>
          <div>
            <FieldLabel>Body code</FieldLabel>
            <textarea
              rows={8}
              value={stringValue(values.body_code)}
              onChange={(event) => update("body_code", event.target.value)}
              className={`${adminTextareaClass} font-mono text-xs`}
              placeholder="<!-- Custom code before </body> -->"
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
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
          <p className="font-semibold text-[#190A2F]">Administrator access and roles</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Create users, update roles, reset passwords, activate or suspend accounts, and review
            the latest login activity.
          </p>
        </div>
        <Link
          to="/admin/administrators"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#190A2F] px-5 text-sm font-semibold text-white transition hover:bg-[#2a1546]"
        >
          Manage administrators <ExternalLink className="h-4 w-4" />
        </Link>
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
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-[#190A2F]">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-semibold text-[#190A2F]">{title}</h2>
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
        <span className="block text-sm font-semibold text-[#190A2F]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[#190A2F]" : "bg-slate-200"}`}
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
