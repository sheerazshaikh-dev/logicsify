import { allServices, caseStudies, industries, insights } from "@/lib/site-data";
import type { ContentItem } from "@/lib/admin-api";

export type PublicContentType = ContentItem["content_type"];

const serviceSlugs = new Set(allServices.map((item) => item.slug));
const industrySlugs = new Set(industries.map((item) => item.slug));
const caseStudySlugs = new Set(caseStudies.map((item) => item.slug));
const insightSlugs = new Set(insights.map((item) => item.slug));

export function cleanContentSlug(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

export function contentPublicPath(type: PublicContentType, slugValue: unknown): string | null {
  const slug = cleanContentSlug(slugValue);
  if (!slug) return null;

  switch (type) {
    case "page":
      return slug === "home" ? "/" : `/${slug}`;
    case "service":
      return `/services/${slug}`;
    case "industry":
      return `/industries/${slug}`;
    case "case_study":
      return `/work/${slug}`;
    case "insight":
      return `/insights/${slug}`;
    case "career":
      return `/careers#${encodeURIComponent(slug)}`;
    case "resource":
      return `/resources/${slug}`;
    case "comparison":
      return `/comparisons/${slug}`;
    case "engagement_model":
      return `/engagement-models#${encodeURIComponent(slug)}`;
    case "integration":
      return `/services/api-integrations#${encodeURIComponent(slug)}`;
    default:
      return null;
  }
}

export function visualEditorPath(type: PublicContentType, slugValue: unknown): string | null {
  if (type === "career" || type === "testimonial" || type === "team" || type === "integration" || type === "engagement_model") return null;
  return contentPublicPath(type, slugValue);
}

export function isVisualEditableType(type: PublicContentType | undefined): boolean {
  return (
    type === "page" ||
    type === "service" ||
    type === "industry" ||
    type === "case_study" ||
    type === "insight" ||
    type === "resource" ||
    type === "comparison"
  );
}

/**
 * Repairs URLs produced by older admin builds that linked public collection
 * records as root pages (for example /ai-automations instead of
 * /services/ai-automations). Absolute URLs, anchors and protocol links are left
 * untouched.
 */
export function normalizePublicHref(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(raw)) return raw;

  const [pathWithQuery, hash = ""] = raw.split("#", 2);
  const [pathOnly, query = ""] = pathWithQuery.split("?", 2);
  const normalizedPath = `/${cleanContentSlug(pathOnly)}`;
  const slug = cleanContentSlug(pathOnly);

  let repaired = normalizedPath;
  if (serviceSlugs.has(slug)) repaired = `/services/${slug}`;
  else if (industrySlugs.has(slug)) repaired = `/industries/${slug}`;
  else if (caseStudySlugs.has(slug)) repaired = `/work/${slug}`;
  else if (insightSlugs.has(slug)) repaired = `/insights/${slug}`;

  return `${repaired}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function legacyCollectionPath(slugValue: unknown): string | null {
  const slug = cleanContentSlug(slugValue);
  if (serviceSlugs.has(slug)) return `/services/${slug}`;
  if (industrySlugs.has(slug)) return `/industries/${slug}`;
  if (caseStudySlugs.has(slug)) return `/work/${slug}`;
  if (insightSlugs.has(slug)) return `/insights/${slug}`;
  return null;
}

export function resolveContentFromPath(pathnameValue: string): {
  type: PublicContentType;
  slug: string;
} | null {
  const pathname = `/${cleanContentSlug(pathnameValue)}`;
  if (pathname === "/") return { type: "page", slug: "home" };

  const segments = cleanContentSlug(pathname).split("/").filter(Boolean);
  if (!segments.length) return { type: "page", slug: "home" };

  if (segments[0] === "services" && segments[1]) {
    return { type: "service", slug: segments.slice(1).join("/") };
  }
  if (segments[0] === "industries" && segments[1]) {
    return { type: "industry", slug: segments.slice(1).join("/") };
  }
  if (segments[0] === "work" && segments[1]) {
    return { type: "case_study", slug: segments.slice(1).join("/") };
  }
  if (segments[0] === "insights" && segments[1]) {
    return { type: "insight", slug: segments.slice(1).join("/") };
  }
  if (segments[0] === "resources" && segments[1]) {
    return { type: "resource", slug: segments.slice(1).join("/") };
  }
  if (segments[0] === "comparisons" && segments[1]) {
    return { type: "comparison", slug: segments.slice(1).join("/") };
  }

  return { type: "page", slug: segments.join("/") };
}
