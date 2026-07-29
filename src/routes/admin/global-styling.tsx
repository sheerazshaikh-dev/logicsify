import { createFileRoute } from "@tanstack/react-router";
import { Paintbrush, RotateCcw, Save, Type, WandSparkles } from "lucide-react";
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
} from "@/components/admin/admin-ui";
import { getSettings, saveSettings } from "@/lib/admin-api";
import type { PublicThemeSettings } from "@/lib/logicsify-api";

export const Route = createFileRoute("/admin/global-styling")({ component: GlobalStylingPage });

const defaults: Required<PublicThemeSettings> = {
  primary_start: "#FE3434", primary_end: "#FDBE02", dark: "#190A2F", background: "#FFFFFF",
  surface: "#FAF8FC", text: "#190A2F", muted_text: "#756C7E", border: "#E6E1EA",
  heading_font: "Sora", body_font: "Inter", base_font_size: 16,
  h1_min: 44, h1_max: 104, h2_min: 32, h2_max: 64, h3_min: 24, h3_max: 36,
  nav_font_size: 14, button_font_size: 14, small_font_size: 12,
  container_max_width: 1360, section_spacing_desktop: 128, section_spacing_mobile: 72,
  card_radius: 24, button_radius: 999, input_radius: 12, gradient_angle: 135,
  animation_speed: 1, shadow_strength: 1,
};

export function GlobalStylingPage() {
  const [values, setValues] = useState<PublicThemeSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((result) => setValues({ ...defaults, ...(result.theme || {}) }))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load global styling."))
      .finally(() => setLoading(false));
  }, []);

  const previewStyle = useMemo(() => ({
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
  }) as CSSProperties, [values]);

  function update<K extends keyof PublicThemeSettings>(key: K, value: PublicThemeSettings[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveSettings("theme", values as unknown as Record<string, unknown>);
      toast.success("Global website styling saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save global styling.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminShell><AdminLoading label="Loading global styling…" /></AdminShell>;

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Design system"
        title="Global Styling"
        description="Control the public website’s brand colors, gradients, typography scale, spacing, radii and motion without changing the admin interface."
        actions={<div className="flex gap-2"><AdminButton variant="secondary" onClick={() => setValues(defaults)}><RotateCcw className="h-4 w-4" /> Reset defaults</AdminButton><AdminButton onClick={() => void save()} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save styling"}</AdminButton></div>}
      />

      <div className="grid gap-7 2xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Section title="Brand colors and gradients" icon={Paintbrush} description="These values drive the main website tokens. Existing section-specific artwork remains intact.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ColorField label="Gradient start" value={values.primary_start} onChange={(v) => update("primary_start", v)} />
              <ColorField label="Gradient end" value={values.primary_end} onChange={(v) => update("primary_end", v)} />
              <ColorField label="Dark brand color" value={values.dark} onChange={(v) => update("dark", v)} />
              <ColorField label="Page background" value={values.background} onChange={(v) => update("background", v)} />
              <ColorField label="Soft surface" value={values.surface} onChange={(v) => update("surface", v)} />
              <ColorField label="Primary text" value={values.text} onChange={(v) => update("text", v)} />
              <ColorField label="Muted text" value={values.muted_text} onChange={(v) => update("muted_text", v)} />
              <ColorField label="Borders" value={values.border} onChange={(v) => update("border", v)} />
            </div>
            <RangeField label="Gradient angle" value={Number(values.gradient_angle)} min={0} max={360} suffix="°" onChange={(v) => update("gradient_angle", v)} />
          </Section>

          <Section title="Typography" icon={Type} description="Use controlled font choices and responsive minimum/maximum heading sizes.">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Heading font" value={String(values.heading_font)} options={["Sora","Inter","Arial","Helvetica","Georgia","Times New Roman","Verdana","Trebuchet MS","system-ui"]} onChange={(v) => update("heading_font", v)} />
              <SelectField label="Body font" value={String(values.body_font)} options={["Inter","Sora","Arial","Helvetica","Georgia","Times New Roman","Verdana","Trebuchet MS","system-ui"]} onChange={(v) => update("body_font", v)} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <RangeField label="Body font size" value={Number(values.base_font_size)} min={14} max={20} suffix="px" onChange={(v) => update("base_font_size", v)} />
              <RangeField label="Navigation font size" value={Number(values.nav_font_size)} min={12} max={20} suffix="px" onChange={(v) => update("nav_font_size", v)} />
              <RangeField label="Button font size" value={Number(values.button_font_size)} min={12} max={20} suffix="px" onChange={(v) => update("button_font_size", v)} />
              <RangeField label="Small text size" value={Number(values.small_font_size)} min={10} max={16} suffix="px" onChange={(v) => update("small_font_size", v)} />
              <RangeField label="H1 minimum" value={Number(values.h1_min)} min={32} max={80} suffix="px" onChange={(v) => update("h1_min", v)} />
              <RangeField label="H1 maximum" value={Number(values.h1_max)} min={48} max={140} suffix="px" onChange={(v) => update("h1_max", v)} />
              <RangeField label="H2 minimum" value={Number(values.h2_min)} min={26} max={64} suffix="px" onChange={(v) => update("h2_min", v)} />
              <RangeField label="H2 maximum" value={Number(values.h2_max)} min={36} max={96} suffix="px" onChange={(v) => update("h2_max", v)} />
              <RangeField label="H3 minimum" value={Number(values.h3_min)} min={20} max={44} suffix="px" onChange={(v) => update("h3_min", v)} />
              <RangeField label="H3 maximum" value={Number(values.h3_max)} min={26} max={64} suffix="px" onChange={(v) => update("h3_max", v)} />
            </div>
          </Section>

          <Section title="Layout and component shape" icon={WandSparkles} description="Adjust the overall rhythm while keeping responsive safeguards in place.">
            <div className="grid gap-5 md:grid-cols-2">
              <RangeField label="Maximum content width" value={Number(values.container_max_width)} min={1080} max={1800} step={20} suffix="px" onChange={(v) => update("container_max_width", v)} />
              <RangeField label="Desktop section spacing" value={Number(values.section_spacing_desktop)} min={64} max={220} step={4} suffix="px" onChange={(v) => update("section_spacing_desktop", v)} />
              <RangeField label="Mobile section spacing" value={Number(values.section_spacing_mobile)} min={40} max={140} step={4} suffix="px" onChange={(v) => update("section_spacing_mobile", v)} />
              <RangeField label="Card radius" value={Number(values.card_radius)} min={0} max={48} suffix="px" onChange={(v) => update("card_radius", v)} />
              <RangeField label="Button radius" value={Number(values.button_radius)} min={0} max={999} step={8} suffix="px" onChange={(v) => update("button_radius", v)} />
              <RangeField label="Input radius" value={Number(values.input_radius)} min={0} max={32} suffix="px" onChange={(v) => update("input_radius", v)} />
              <RangeField label="Animation speed" value={Number(values.animation_speed)} min={0} max={2} step={0.1} suffix="×" onChange={(v) => update("animation_speed", v)} />
              <RangeField label="Shadow strength" value={Number(values.shadow_strength)} min={0} max={2} step={0.1} suffix="×" onChange={(v) => update("shadow_strength", v)} />
            </div>
          </Section>
        </div>

        <AdminCard className="h-fit overflow-hidden p-0 2xl:sticky 2xl:top-28">
          <div className="border-b border-slate-200 px-6 py-5"><p className="text-sm font-semibold text-[#190A2F]">Live token preview</p><p className="mt-1 text-xs text-slate-500">The public website updates after saving and refreshing.</p></div>
          <div style={previewStyle} className="p-6 [background:var(--preview-bg)] [color:var(--preview-text)]">
            <div className="overflow-hidden border [border-color:var(--preview-border)] [border-radius:var(--preview-card-radius)] [background:var(--preview-surface)]">
              <div className="h-2 [background:linear-gradient(var(--preview-angle),var(--preview-start),var(--preview-end))]" />
              <div className="p-7 [font-family:var(--preview-body)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] [color:var(--preview-muted)]">Technology systems</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight [font-family:var(--preview-heading)]">AI-powered systems built for business growth.</h2>
                <p className="mt-4 leading-7 [color:var(--preview-muted)]">Preview typography, surfaces, borders, gradients and component radii before saving.</p>
                <button className="mt-6 px-5 py-3 text-sm font-semibold text-white [border-radius:var(--preview-button-radius)] [background:linear-gradient(var(--preview-angle),var(--preview-start),var(--preview-end))]">Discuss your project</button>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Section({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof Paintbrush; children: ReactNode }) {
  return <AdminCard className="p-6"><div className="mb-6 flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#190A2F] text-white"><Icon className="h-4 w-4" /></span><div><h2 className="text-lg font-semibold text-[#190A2F]">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div><div className="space-y-6">{children}</div></AdminCard>;
}

function ColorField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <div><FieldLabel>{label}</FieldLabel><div className="flex gap-2"><input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1" /><input value={value || ""} onChange={(e) => onChange(e.target.value.toUpperCase())} className={adminInputClass} /></div></div>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div><FieldLabel>{label}</FieldLabel><select value={value} onChange={(e) => onChange(e.target.value)} className={adminInputClass}>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
}

function RangeField({ label, value, min, max, step = 1, suffix, onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (value: number) => void }) {
  return <div><div className="mb-2 flex items-center justify-between"><FieldLabel>{label}</FieldLabel><span className="text-xs font-semibold text-[#190A2F]">{value}{suffix}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#FE3434]" /></div>;
}
