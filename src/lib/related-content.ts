import type { CmsContentItem } from "@/lib/logicsify-api";

function normalizeServiceSlug(value: unknown): string {
  let raw = String(value || "").trim();
  if (!raw) return "";
  try {
    if (/^https?:\/\//i.test(raw)) raw = new URL(raw).pathname;
  } catch {
    // Keep the original value and normalize it below.
  }
  raw = raw.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  if (raw.startsWith("services/")) raw = raw.slice("services/".length);
  if (raw.includes("/")) raw = raw.split("/").filter(Boolean).pop() || "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function relatedServiceSlugs(content: Record<string, unknown> | null | undefined): string[] {
  if (!content) return [];
  const values: unknown[] = [];
  for (const key of ["related_services", "related_service", "services", "service_slugs", "service_slug"]) {
    const value = content[key];
    if (Array.isArray(value)) values.push(...value);
    else if (value !== undefined && value !== null) values.push(...String(value).split(/[\r\n,]+/));
  }
  return Array.from(new Set(values.map(normalizeServiceSlug).filter(Boolean)));
}

export function relatedServiceItems(item: CmsContentItem): Array<{ slug: string; label: string }> {
  return relatedServiceSlugs(item.content_json).map((slug) => ({
    slug,
    label: slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));
}
