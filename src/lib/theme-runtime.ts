import type { PublicThemeSettings } from "@/lib/logicsify-api";

export function applyThemeVariables(settings: PublicThemeSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const set = (name: string, value: string | number | undefined, suffix = "") => {
    if (value !== undefined && value !== null && value !== "") {
      root.style.setProperty(name, `${value}${suffix}`);
    }
  };

  set("--theme-primary-start", settings.primary_start);
  set("--theme-primary-end", settings.primary_end);
  set("--theme-dark", settings.dark);
  set("--theme-background", settings.background);
  set("--theme-surface", settings.surface);
  set("--theme-text", settings.text);
  set("--theme-muted-text", settings.muted_text);
  set("--theme-border", settings.border);
  set(
    "--theme-heading-font",
    settings.heading_font
      ? `"${settings.heading_font}", ui-sans-serif, system-ui, sans-serif`
      : undefined,
  );
  set(
    "--theme-body-font",
    settings.body_font
      ? `"${settings.body_font}", ui-sans-serif, system-ui, sans-serif`
      : undefined,
  );
  set("--theme-base-font-size", settings.base_font_size, "px");
  set("--theme-h1-min", settings.h1_min, "px");
  set("--theme-h1-max", settings.h1_max, "px");
  set("--theme-h2-min", settings.h2_min, "px");
  set("--theme-h2-max", settings.h2_max, "px");
  set("--theme-h3-min", settings.h3_min, "px");
  set("--theme-h3-max", settings.h3_max, "px");
  set("--theme-nav-font-size", settings.nav_font_size, "px");
  set("--theme-button-font-size", settings.button_font_size, "px");
  set("--theme-small-font-size", settings.small_font_size, "px");
  set("--theme-container-max-width", settings.container_max_width, "px");
  set("--theme-section-spacing-desktop", settings.section_spacing_desktop, "px");
  set("--theme-section-spacing-mobile", settings.section_spacing_mobile, "px");
  set("--theme-card-radius", settings.card_radius, "px");
  set("--theme-button-radius", settings.button_radius, "px");
  set("--theme-input-radius", settings.input_radius, "px");
  set("--theme-gradient-angle", settings.gradient_angle, "deg");
  set("--theme-animation-speed", settings.animation_speed);
  set("--theme-shadow-strength", settings.shadow_strength);

  if (Number(settings.animation_speed) === 0) root.dataset.themeMotion = "off";
  else delete root.dataset.themeMotion;
  window.dispatchEvent(new CustomEvent("logicsify:theme-updated"));
}

export function runtimeThemeColor(variable: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}
