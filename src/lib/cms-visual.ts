export type CmsNativeField = {
  key: string;
  type: "text" | "attribute" | "icon";
  value: string;
  default_value?: string;
  attribute?: string;
  tag?: string;
  label?: string;
  section_key?: string;
  section_label?: string;
  role?: "counter";
};

export type CmsSectionClone = {
  id: string;
  source_section_key: string;
  label?: string;
  html: string;
};

export type CmsElementLink = {
  section_key: string;
  element_path: string;
  href: string;
  target?: "_self" | "_blank";
  label?: string;
};

export type CmsNativeContent = {
  /** Public route this visual snapshot was captured from. Prevents one page template from being applied to another. */
  template_path?: string;
  template_version?: number;
  fields?: Record<string, string>;
  field_meta?: Record<string, Omit<CmsNativeField, "value">>;
  section_order?: string[];
  hidden_sections?: string[];
  deleted_sections?: string[];
  section_html?: Record<string, string>;
  section_clones?: CmsSectionClone[];
  element_links?: Record<string, CmsElementLink>;
};

export type VisualAdminPage = {
  id: number;
  title: string;
  slug: string;
  full_path: string;
  status?: "draft" | "published" | "scheduled" | "archived";
  updated_at?: string;
  native_content?: CmsNativeContent;
  native_content_json?: string;
};

/**
 * Visual-editor snapshots use DOM paths, so they must be invalidated whenever
 * a route template changes structure. Keep versions scoped by public route so
 * unrelated pages retain their saved visual customizations.
 */
export function cmsTemplateVersionForPath(pathValue: string): number {
  const path = `/${String(pathValue || "")
    .trim()
    .split(/[?#]/, 1)[0]
    .replace(/^\/+|\/+$/g, "")}`;

  // Case-study gallery markup was consolidated into one navigable gallery.
  return /^\/work\/[^/]+/.test(path) ? 2 : 1;
}
