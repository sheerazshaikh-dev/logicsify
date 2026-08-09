import { createFileRoute } from "@tanstack/react-router";
import {
  Code2,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Paintbrush,
  PanelsTopLeft,
  RotateCcw,
  Save,
  ShieldAlert,
  Trash2,
  Type,
  UploadCloud,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
import { getCurrentAdmin, getSettings, saveSettings, uploadMedia } from "@/lib/admin-api";
import type { PublicSiteSettings, PublicThemeSettings } from "@/lib/logicsify-api";
import { DEFAULT_SITE_BRANDING } from "@/lib/brand-assets";
import { applyThemeVariables } from "@/lib/theme-runtime";

export const Route = createFileRoute("/admin/global-styling")({ component: GlobalStylingPage });

const defaults: Required<PublicThemeSettings> = {
  primary_start: "#04A6A1",
  primary_end: "#8BCF3C",
  dark: "#000000",
  background: "#FFFFFF",
  surface: "#FAF8FC",
  text: "#000000",
  muted_text: "#756C7E",
  border: "#E6E1EA",
  heading_font: "Sora",
  body_font: "Inter",
  base_font_size: 16,
  h1_min: 44,
  h1_max: 104,
  h2_min: 32,
  h2_max: 64,
  h3_min: 24,
  h3_max: 36,
  nav_font_size: 14,
  button_font_size: 14,
  small_font_size: 12,
  container_max_width: 1360,
  section_spacing_desktop: 128,
  section_spacing_mobile: 72,
  card_radius: 24,
  button_radius: 999,
  input_radius: 12,
  gradient_angle: 135,
  animation_speed: 1,
  shadow_strength: 1,
  website_custom_css_enabled: true,
  website_custom_css: "",
  admin_custom_css_enabled: true,
  admin_custom_css: "",
};

export function GlobalStylingPage() {
  const [values, setValues] = useState<PublicThemeSettings>(defaults);
  const [siteValues, setSiteValues] = useState<PublicSiteSettings>({ ...DEFAULT_SITE_BRANDING });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    Promise.all([getSettings(), getCurrentAdmin()])
      .then(([result, admin]) => {
        setValues({ ...defaults, ...(result.theme || {}) });
        setSiteValues({ ...DEFAULT_SITE_BRANDING, ...(result.site || {}) });
        setIsSuperAdmin(admin.role === "super_admin");
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Could not load global branding."),
      )
      .finally(() => setLoading(false));
  }, []);

  const previewStyle = useMemo(
    () =>
      ({
        "--preview-start": values.primary_start,
        "--preview-end": values.primary_end,
        "--preview-dark": values.dark,
        "--preview-bg": values.background,
        "--preview-surface": values.surface,
        "--preview-text": values.text,
        "--preview-muted": values.muted_text,
        "--preview-border": values.border,
        "--preview-heading": `"${values.heading_font}", system-ui, sans-serif`,
        "--preview-body": `"${values.body_font}", system-ui, sans-serif`,
        "--preview-card-radius": `${values.card_radius}px`,
        "--preview-button-radius": `${values.button_radius}px`,
        "--preview-angle": `${values.gradient_angle}deg`,
      }) as CSSProperties,
    [values],
  );

  function update<K extends keyof PublicThemeSettings>(key: K, value: PublicThemeSettings[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateSite<K extends keyof PublicSiteSettings>(key: K, value: PublicSiteSettings[K]) {
    setSiteValues((current) => ({ ...current, [key]: value }));
  }

  function resetDesignTokens() {
    setValues((current) => ({
      ...defaults,
      website_custom_css_enabled: current.website_custom_css_enabled,
      website_custom_css: current.website_custom_css,
      admin_custom_css_enabled: current.admin_custom_css_enabled,
      admin_custom_css: current.admin_custom_css,
    }));
  }

  async function save() {
    setSaving(true);
    try {
      await Promise.all([
        saveSettings("theme", values as unknown as Record<string, unknown>),
        saveSettings("site", siteValues as unknown as Record<string, unknown>),
      ]);
      applyThemeVariables(values);
      try {
        window.localStorage.removeItem("logicsify:site-settings:v1");
      } catch {
        // Storage can be unavailable; the saved API values still apply on reload.
      }
      window.dispatchEvent(new CustomEvent("logicsify:branding-updated", { detail: siteValues }));
      toast.success("Global branding saved across the website and admin panel.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save global branding.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <AdminLoading label="Loading global branding…" />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Brand system"
        title="Global Branding"
        description="Manage Logicsify logos, brand mark, favicon, header, footer, colors, typography and shared interface styling from one place."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={resetDesignTokens}>
              <RotateCcw className="h-4 w-4" /> Reset design tokens
            </AdminButton>
            <AdminButton onClick={() => void save()} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save branding"}
            </AdminButton>
          </div>
        }
      />

      <div className="grid gap-7 2xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Section
            title="Brand identity and assets"
            icon={ImageIcon}
            description="These are the canonical Logicsify assets used by the website, admin panel, diagrams, browser icons and other branded surfaces."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <BrandImageField
                label="Logo — light backgrounds"
                help="Colored/dark wordmark for white and light surfaces."
                value={siteValues.logo_dark}
                onChange={(value) => updateSite("logo_dark", value)}
              />
              <BrandImageField
                label="Logo — dark backgrounds"
                help="White wordmark for dark hero, footer and dark branded surfaces."
                value={siteValues.logo_light}
                onChange={(value) => updateSite("logo_light", value)}
              />
              <BrandImageField
                label="Global brand mark / icon"
                help="Square Logicsify mark used in diagrams, collapsed admin navigation and icon-only branding."
                value={siteValues.brand_mark}
                onChange={(value) => updateSite("brand_mark", value)}
              />
              <BrandImageField
                label="Mobile navigation logo"
                help="Optional. Falls back to the light-background logo."
                value={siteValues.mobile_logo}
                onChange={(value) => updateSite("mobile_logo", value)}
              />
              <BrandImageField
                label="Admin panel logo"
                help="Used in the Content Studio sidebar and admin login."
                value={siteValues.admin_logo}
                onChange={(value) => updateSite("admin_logo", value)}
              />
              <BrandImageField
                label="Favicon"
                help="Square browser/tab icon. Uploads keep randomized filenames through the Media API."
                value={siteValues.favicon}
                onChange={(value) => updateSite("favicon", value)}
                accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/webp"
              />
              <BrandImageField
                label="Apple touch icon"
                help="Square icon used by iPhone and iPad bookmarks."
                value={siteValues.apple_touch_icon}
                onChange={(value) => updateSite("apple_touch_icon", value)}
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <TextSetting label="Brand / site name" value={siteValues.site_name} onChange={(value) => updateSite("site_name", value)} placeholder="Logicsify" />
              <TextSetting label="Brand tagline" value={siteValues.tagline} onChange={(value) => updateSite("tagline", value)} placeholder="Technology, marketing, and automation—logically built for growth." />
              <ColorField label="Browser / app theme color" value={siteValues.theme_color || String(values.dark || "#000000")} onChange={(value) => updateSite("theme_color", value)} />
            </div>
          </Section>

          <Section
            title="Header branding"
            icon={PanelsTopLeft}
            description="Control header behavior, logo sizing and the global navigation call-to-action."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleSetting label="Sticky header" description="Keep the header visible while visitors scroll." checked={boolSetting(siteValues.sticky_header, true)} onChange={(value) => updateSite("sticky_header", value)} />
              <ToggleSetting label="Transparent header on home" description="Use the dark-background logo over the homepage hero before scrolling." checked={boolSetting(siteValues.transparent_header_home, true)} onChange={(value) => updateSite("transparent_header_home", value)} />
              <ToggleSetting label="Show header CTA" description="Display the primary CTA in desktop and mobile navigation." checked={boolSetting(siteValues.show_header_cta, true)} onChange={(value) => updateSite("show_header_cta", value)} />
              <ToggleSetting label="Open header CTA in a new tab" description="Use for external calendars or booking destinations." checked={boolSetting(siteValues.header_cta_new_tab)} onChange={(value) => updateSite("header_cta_new_tab", value)} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <TextSetting label="Header CTA label" value={siteValues.header_cta_label} onChange={(value) => updateSite("header_cta_label", value)} placeholder="Get a Free Technical Roadmap" />
              <TextSetting label="Header CTA URL" value={siteValues.header_cta_url} onChange={(value) => updateSite("header_cta_url", value)} placeholder="/technical-roadmap" />
              <NumberSetting label="Desktop logo height" value={siteValues.header_logo_height_desktop} fallback={36} suffix="px" onChange={(value) => updateSite("header_logo_height_desktop", value)} />
              <NumberSetting label="Mobile logo height" value={siteValues.header_logo_height_mobile} fallback={28} suffix="px" onChange={(value) => updateSite("header_logo_height_mobile", value)} />
            </div>
          </Section>

          <Section
            title="Announcement branding"
            icon={Megaphone}
            description="Manage the optional branded announcement strip above the navigation."
          >
            <ToggleSetting label="Enable announcement bar" description="Show a compact message above the header." checked={boolSetting(siteValues.announcement_enabled)} onChange={(value) => updateSite("announcement_enabled", value)} />
            <div className="grid gap-5 md:grid-cols-2">
              <TextSetting label="Announcement text" value={siteValues.announcement_text} onChange={(value) => updateSite("announcement_text", value)} placeholder="Now booking new projects." />
              <TextSetting label="Link label" value={siteValues.announcement_link_label} onChange={(value) => updateSite("announcement_link_label", value)} placeholder="Learn more" />
              <TextSetting label="Announcement URL" value={siteValues.announcement_url} onChange={(value) => updateSite("announcement_url", value)} placeholder="/contact" />
              <ToggleSetting label="Open link in a new tab" description="Enable when the announcement points to an external site." checked={boolSetting(siteValues.announcement_new_tab)} onChange={(value) => updateSite("announcement_new_tab", value)} />
            </div>
          </Section>

          <Section
            title="Footer branding"
            icon={Paintbrush}
            description="Control the footer identity, CTA and legal/social visibility from the same global brand system."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <BrandImageField label="Footer logo" help="Falls back to the dark-background logo when empty." value={siteValues.footer_logo} onChange={(value) => updateSite("footer_logo", value)} />
              <div>
                <FieldLabel>Footer description</FieldLabel>
                <textarea rows={6} value={String(siteValues.footer_description || "")} onChange={(event) => updateSite("footer_description", event.target.value)} className={adminTextareaClass} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleSetting label="Show social profiles" description="Display configured social profiles in the footer." checked={boolSetting(siteValues.show_social_links, true)} onChange={(value) => updateSite("show_social_links", value)} />
              <ToggleSetting label="Show Privacy Policy" description="Display the privacy link in the legal row." checked={boolSetting(siteValues.show_privacy_link, true)} onChange={(value) => updateSite("show_privacy_link", value)} />
              <ToggleSetting label="Show Terms & Conditions" description="Display the terms link in the legal row." checked={boolSetting(siteValues.show_terms_link, true)} onChange={(value) => updateSite("show_terms_link", value)} />
              <ToggleSetting label="Open footer CTA in a new tab" description="Enable for an external booking destination." checked={boolSetting(siteValues.footer_cta_new_tab)} onChange={(value) => updateSite("footer_cta_new_tab", value)} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <TextSetting label="Footer CTA label" value={siteValues.footer_cta_label} onChange={(value) => updateSite("footer_cta_label", value)} placeholder="Get a Free Technical Roadmap" />
              <TextSetting label="Footer CTA URL" value={siteValues.footer_cta_url} onChange={(value) => updateSite("footer_cta_url", value)} placeholder="/technical-roadmap" />
              <div className="md:col-span-2"><TextSetting label="Copyright text" value={siteValues.copyright_text} onChange={(value) => updateSite("copyright_text", value)} placeholder="© {year} Logicsify. All rights reserved." /></div>
            </div>
          </Section>

          <Section
            title="Brand colors and gradients"
            icon={Paintbrush}
            description="These tokens drive website sections, admin UI, branded icons, gradients and glow effects. No red/orange decorative glow is hardcoded."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ColorField
                label="Gradient start"
                value={values.primary_start}
                onChange={(value) => update("primary_start", value)}
              />
              <ColorField
                label="Gradient end"
                value={values.primary_end}
                onChange={(value) => update("primary_end", value)}
              />
              <ColorField
                label="Dark brand color"
                value={values.dark}
                onChange={(value) => update("dark", value)}
              />
              <ColorField
                label="Page background"
                value={values.background}
                onChange={(value) => update("background", value)}
              />
              <ColorField
                label="Soft surface"
                value={values.surface}
                onChange={(value) => update("surface", value)}
              />
              <ColorField
                label="Primary text"
                value={values.text}
                onChange={(value) => update("text", value)}
              />
              <ColorField
                label="Muted text"
                value={values.muted_text}
                onChange={(value) => update("muted_text", value)}
              />
              <ColorField
                label="Borders"
                value={values.border}
                onChange={(value) => update("border", value)}
              />
            </div>
            <RangeField
              label="Gradient angle"
              value={Number(values.gradient_angle)}
              min={0}
              max={360}
              suffix="°"
              onChange={(value) => update("gradient_angle", value)}
            />
          </Section>

          <Section
            title="Typography"
            icon={Type}
            description="Typography choices apply across the website and Content Studio while preserving responsive safeguards."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Heading font"
                value={String(values.heading_font)}
                options={[
                  "Sora",
                  "Inter",
                  "Arial",
                  "Helvetica",
                  "Georgia",
                  "Times New Roman",
                  "Verdana",
                  "Trebuchet MS",
                  "system-ui",
                ]}
                onChange={(value) => update("heading_font", value)}
              />
              <SelectField
                label="Body font"
                value={String(values.body_font)}
                options={[
                  "Inter",
                  "Sora",
                  "Arial",
                  "Helvetica",
                  "Georgia",
                  "Times New Roman",
                  "Verdana",
                  "Trebuchet MS",
                  "system-ui",
                ]}
                onChange={(value) => update("body_font", value)}
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <RangeField
                label="Body font size"
                value={Number(values.base_font_size)}
                min={14}
                max={20}
                suffix="px"
                onChange={(value) => update("base_font_size", value)}
              />
              <RangeField
                label="Navigation font size"
                value={Number(values.nav_font_size)}
                min={12}
                max={20}
                suffix="px"
                onChange={(value) => update("nav_font_size", value)}
              />
              <RangeField
                label="Button font size"
                value={Number(values.button_font_size)}
                min={12}
                max={20}
                suffix="px"
                onChange={(value) => update("button_font_size", value)}
              />
              <RangeField
                label="Small text size"
                value={Number(values.small_font_size)}
                min={10}
                max={16}
                suffix="px"
                onChange={(value) => update("small_font_size", value)}
              />
              <RangeField
                label="H1 minimum"
                value={Number(values.h1_min)}
                min={32}
                max={80}
                suffix="px"
                onChange={(value) => update("h1_min", value)}
              />
              <RangeField
                label="H1 maximum"
                value={Number(values.h1_max)}
                min={48}
                max={140}
                suffix="px"
                onChange={(value) => update("h1_max", value)}
              />
              <RangeField
                label="H2 minimum"
                value={Number(values.h2_min)}
                min={26}
                max={64}
                suffix="px"
                onChange={(value) => update("h2_min", value)}
              />
              <RangeField
                label="H2 maximum"
                value={Number(values.h2_max)}
                min={36}
                max={96}
                suffix="px"
                onChange={(value) => update("h2_max", value)}
              />
              <RangeField
                label="H3 minimum"
                value={Number(values.h3_min)}
                min={20}
                max={44}
                suffix="px"
                onChange={(value) => update("h3_min", value)}
              />
              <RangeField
                label="H3 maximum"
                value={Number(values.h3_max)}
                min={26}
                max={64}
                suffix="px"
                onChange={(value) => update("h3_max", value)}
              />
            </div>
          </Section>

          <Section
            title="Layout and component shape"
            icon={WandSparkles}
            description="Component radii, interface rhythm, motion and shadows now stay consistent across the website and admin panel."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <RangeField
                label="Maximum content width"
                value={Number(values.container_max_width)}
                min={1080}
                max={1800}
                step={20}
                suffix="px"
                onChange={(value) => update("container_max_width", value)}
              />
              <RangeField
                label="Desktop section spacing"
                value={Number(values.section_spacing_desktop)}
                min={64}
                max={220}
                step={4}
                suffix="px"
                onChange={(value) => update("section_spacing_desktop", value)}
              />
              <RangeField
                label="Mobile section spacing"
                value={Number(values.section_spacing_mobile)}
                min={40}
                max={140}
                step={4}
                suffix="px"
                onChange={(value) => update("section_spacing_mobile", value)}
              />
              <RangeField
                label="Card radius"
                value={Number(values.card_radius)}
                min={0}
                max={48}
                suffix="px"
                onChange={(value) => update("card_radius", value)}
              />
              <RangeField
                label="Button radius"
                value={Number(values.button_radius)}
                min={0}
                max={999}
                step={8}
                suffix="px"
                onChange={(value) => update("button_radius", value)}
              />
              <RangeField
                label="Input radius"
                value={Number(values.input_radius)}
                min={0}
                max={32}
                suffix="px"
                onChange={(value) => update("input_radius", value)}
              />
              <RangeField
                label="Animation speed"
                value={Number(values.animation_speed)}
                min={0}
                max={2}
                step={0.1}
                suffix="×"
                onChange={(value) => update("animation_speed", value)}
              />
              <RangeField
                label="Shadow strength"
                value={Number(values.shadow_strength)}
                min={0}
                max={2}
                step={0.1}
                suffix="×"
                onChange={(value) => update("shadow_strength", value)}
              />
            </div>
          </Section>

          <Section
            title="Custom CSS"
            icon={Code2}
            description="Maintain separate CSS for the public website and admin panel. Custom CSS is loaded after the built-in styles."
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Super Admin control</p>
                  <p className="mt-1 leading-6">
                    Custom CSS can hide controls or break layouts. Add <code>?safe-admin=1</code> to
                    an admin URL to temporarily bypass admin CSS and snippets. Add{
                    " "
                  }
                    <code>?safe-runtime=1</code> to a public URL to bypass public custom CSS and
                    snippets.
                  </p>
                </div>
              </div>
            </div>

            <CustomCssEditor
              label="Website custom CSS"
              description="Applied only to public website routes."
              enabled={values.website_custom_css_enabled !== false}
              css={String(values.website_custom_css || "")}
              disabled={!isSuperAdmin}
              onEnabledChange={(enabled) => update("website_custom_css_enabled", enabled)}
              onCssChange={(css) => update("website_custom_css", css)}
            />

            <CustomCssEditor
              label="Admin panel custom CSS"
              description="Applied only after an administrator signs in."
              enabled={values.admin_custom_css_enabled !== false}
              css={String(values.admin_custom_css || "")}
              disabled={!isSuperAdmin}
              onEnabledChange={(enabled) => update("admin_custom_css_enabled", enabled)}
              onCssChange={(css) => update("admin_custom_css", css)}
            />

            {!isSuperAdmin ? (
              <p className="text-sm font-medium text-slate-500">
                Only a Super Admin can change custom CSS. You can still manage the safe design
                tokens above.
              </p>
            ) : null}
          </Section>
        </div>

        <AdminCard className="h-fit overflow-hidden p-0 2xl:sticky 2xl:top-28">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-semibold text-ink">Live token preview</p>
            <p className="mt-1 text-xs text-slate-500">
              The website and admin panel use the same saved design tokens. The admin interface updates immediately after saving.
            </p>
          </div>
          <div
            style={previewStyle}
            className="p-6 [background:var(--preview-bg)] [color:var(--preview-text)]"
          >
            <div className="overflow-hidden border [border-color:var(--preview-border)] [border-radius:var(--preview-card-radius)] [background:var(--preview-surface)]">
              <div className="h-2 [background:linear-gradient(var(--preview-angle),var(--preview-start),var(--preview-end))]" />
              <div className="p-7 [font-family:var(--preview-body)]">
                <img src={siteValues.logo_dark || DEFAULT_SITE_BRANDING.logo_dark} alt="Brand preview" className="mb-7 h-9 w-auto max-w-[180px] object-contain object-left" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] [color:var(--preview-muted)]">
                  Technology systems
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight [font-family:var(--preview-heading)]">
                  AI-powered systems built for business growth.
                </h2>
                <p className="mt-4 leading-7 [color:var(--preview-muted)]">
                  Preview typography, surfaces, borders, gradients and component radii before
                  saving.
                </p>
                <button className="mt-6 px-5 py-3 text-sm font-semibold text-white [border-radius:var(--preview-button-radius)] [background:linear-gradient(var(--preview-angle),var(--preview-start),var(--preview-end))]">
                  Discuss your project
                </button>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Paintbrush;
  children: ReactNode;
}) {
  return (
    <AdminCard className="p-6">
      <div className="mb-6 flex gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </AdminCard>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1"
        />
        <input
          value={value || ""}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className={adminInputClass}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={adminInputClass}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-xs font-semibold text-ink">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-brand-red"
      />
    </div>
  );
}

function CustomCssEditor({
  label,
  description,
  enabled,
  css,
  disabled,
  onEnabledChange,
  onCssChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  css: string;
  disabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onCssChange: (css: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-ink">{label}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            disabled={disabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
            className="h-4 w-4 accent-brand-red"
          />
          Enabled
        </label>
      </div>
      <textarea
        rows={14}
        value={css}
        disabled={disabled}
        onChange={(event) => onCssChange(event.target.value)}
        className={`${adminTextareaClass} mt-4 font-mono text-xs disabled:cursor-not-allowed disabled:bg-slate-100`}
        placeholder={`/* ${label} */\n.your-selector {\n  property: value;\n}`}
        spellCheck={false}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Maximum 50 KB. @import and unsafe CSS protocols are blocked.</span>
        <span>{css.length.toLocaleString()} characters</span>
      </div>
    </div>
  );
}


function BrandImageField({
  label,
  help,
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
}: {
  label: string;
  help: string;
  value?: string;
  onChange: (value: string) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = String(value || "");

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file, label);
      onChange(media.url);
      toast.success("Brand asset uploaded. Its stored filename is randomized automatically.");
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
      <p className="mb-3 text-xs leading-5 text-slate-500">{help}</p>
      <div className="mb-3 grid min-h-28 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
        {url ? <img src={url} alt="" className="max-h-24 max-w-full object-contain" /> : <ImageIcon className="h-8 w-8 text-slate-300" />}
      </div>
      <input value={url} onChange={(event) => onChange(event.target.value)} className={adminInputClass} placeholder="Paste media URL or upload an image" />
      <div className="mt-3 flex flex-wrap gap-2">
        <AdminButton variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload image"}
        </AdminButton>
        {url ? <AdminButton variant="danger" onClick={() => onChange("")}><Trash2 className="h-4 w-4" /> Clear</AdminButton> : null}
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
    </div>
  );
}

function TextSetting({ label, value, onChange, placeholder = "" }: { label: string; value?: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div><FieldLabel>{label}</FieldLabel><input value={String(value || "")} onChange={(event) => onChange(event.target.value)} className={adminInputClass} placeholder={placeholder} /></div>;
}

function NumberSetting({ label, value, onChange, fallback, suffix }: { label: string; value?: number; onChange: (value: number) => void; fallback: number; suffix: string }) {
  return <div><FieldLabel>{label}</FieldLabel><div className="relative"><input type="number" value={Number(value ?? fallback)} onChange={(event) => onChange(Number(event.target.value) || fallback)} className={`${adminInputClass} pr-12`} /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span></div></div>;
}

function ToggleSetting({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 p-4"><span><span className="block text-sm font-semibold text-ink">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span><span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-gradient-brand" : "bg-slate-200"}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" /><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} /></span></label>;
}

function boolSetting(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}
