import { createFileRoute } from "@tanstack/react-router";
import {
  Code2,
  Paintbrush,
  RotateCcw,
  Save,
  ShieldAlert,
  Type,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
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
import { getCurrentAdmin, getSettings, saveSettings } from "@/lib/admin-api";
import type { PublicThemeSettings } from "@/lib/logicsify-api";

export const Route = createFileRoute("/admin/global-styling")({ component: GlobalStylingPage });

const defaults: Required<PublicThemeSettings> = {
  primary_start: "#FE3434",
  primary_end: "#FDBE02",
  dark: "#190A2F",
  background: "#FFFFFF",
  surface: "#FAF8FC",
  text: "#190A2F",
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    Promise.all([getSettings(), getCurrentAdmin()])
      .then(([result, admin]) => {
        setValues({ ...defaults, ...(result.theme || {}) });
        setIsSuperAdmin(admin.role === "super_admin");
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Could not load global styling."),
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
      await saveSettings("theme", values as unknown as Record<string, unknown>);
      toast.success("Global styling saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save global styling.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <AdminLoading label="Loading global styling…" />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Design system"
        title="Global Styling"
        description="Control public website tokens and maintain separate, recoverable custom CSS for the website and admin panel."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={resetDesignTokens}>
              <RotateCcw className="h-4 w-4" /> Reset design tokens
            </AdminButton>
            <AdminButton onClick={() => void save()} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save styling"}
            </AdminButton>
          </div>
        }
      />

      <div className="grid gap-7 2xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Section
            title="Brand colors and gradients"
            icon={Paintbrush}
            description="These values drive the main website tokens. Existing section-specific artwork remains intact."
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
            description="Use controlled font choices and responsive minimum/maximum heading sizes."
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
            description="Adjust the overall rhythm while keeping responsive safeguards in place."
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
            <p className="text-sm font-semibold text-[#190A2F]">Live token preview</p>
            <p className="mt-1 text-xs text-slate-500">
              The public website updates after saving and refreshing.
            </p>
          </div>
          <div
            style={previewStyle}
            className="p-6 [background:var(--preview-bg)] [color:var(--preview-text)]"
          >
            <div className="overflow-hidden border [border-color:var(--preview-border)] [border-radius:var(--preview-card-radius)] [background:var(--preview-surface)]">
              <div className="h-2 [background:linear-gradient(var(--preview-angle),var(--preview-start),var(--preview-end))]" />
              <div className="p-7 [font-family:var(--preview-body)]">
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
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#190A2F] text-white">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#190A2F]">{title}</h2>
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
        <span className="text-xs font-semibold text-[#190A2F]">
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
        className="w-full accent-[#FE3434]"
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
          <p className="font-semibold text-[#190A2F]">{label}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            disabled={disabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
            className="h-4 w-4 accent-[#FE3434]"
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
