import { allServices, caseStudies, industryRedirects, insights, legacyServiceRedirects } from "@/lib/site-data";
import type { ContentItem } from "@/lib/admin-api";

export type PublicContentType = ContentItem["content_type"];

const serviceSlugs = new Set(allServices.map((item) => item.slug));
const caseStudySlugs = new Set(caseStudies.map((item) => item.slug));
const insightSlugs = new Set(insights.map((item) => item.slug));
const groupedOtherServicePaths: Record<string, string> = {
  "cloud-deployment": "/services/cloud-maintenance#cloud-deployment",
  "website-maintenance": "/services/cloud-maintenance#website-maintenance",
  "staff-augmentation": "/services/cloud-maintenance#staff-augmentation",
};


export function cleanContentSlug(value: unknown): string {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}

export function contentPublicPath(type: PublicContentType, slugValue: unknown): string | null {
  const slug = cleanContentSlug(slugValue);
  if (!slug) return null;
  switch (type) {
    case "page": return slug === "home" ? "/" : `/${slug}`;
    case "service": return legacyServiceRedirects[slug] || groupedOtherServicePaths[slug] || `/services/${slug}`;
    case "industry": return industryRedirects[slug] || "/services";
    case "case_study": return `/work/${slug}`;
    case "portfolio": return `/portfolio/${slug}`;
    case "insight": return `/insights/${slug}`;
    case "testimonial": return "/testimonials";
    case "career": return `/careers#${encodeURIComponent(slug)}`;
    case "resource": return `/guides?guide=${encodeURIComponent(slug)}`;
    case "comparison": return `/comparisons/${slug}`;
    case "engagement_model": return `/engagement-models#${encodeURIComponent(slug)}`;
    case "integration": return `/integrations#${encodeURIComponent(slug)}`;
    default: return null;
  }
}

export function visualEditorPath(type: PublicContentType, slugValue: unknown): string | null {
  if (["career", "testimonial", "team", "integration", "engagement_model", "industry"].includes(type)) return null;
  return contentPublicPath(type, slugValue);
}

export function isVisualEditableType(type: PublicContentType | undefined): boolean {
  return type === "page" || type === "service" || type === "case_study" || type === "portfolio" || type === "insight" || type === "comparison";
}

export function normalizePublicHref(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(raw)) return raw;
  const [pathWithQuery, hash = ""] = raw.split("#", 2);
  const [pathOnly, query = ""] = pathWithQuery.split("?", 2);
  const slug = cleanContentSlug(pathOnly);
  const normalizedPath = `/${slug}`;
  let repaired = normalizedPath;
  if (legacyServiceRedirects[slug]) repaired = legacyServiceRedirects[slug];
  else if (groupedOtherServicePaths[slug]) repaired = groupedOtherServicePaths[slug];
  else if (industryRedirects[slug]) repaired = industryRedirects[slug];
  else if (serviceSlugs.has(slug)) repaired = `/services/${slug}`;
  else if (caseStudySlugs.has(slug)) repaired = `/work/${slug}`;
  else if (insightSlugs.has(slug)) repaired = `/insights/${slug}`;
  else if (slug.startsWith("resources/")) repaired = `/guides?guide=${encodeURIComponent(slug.slice("resources/".length))}`;
  if (slug === "industries") repaired = "/services";
  return `${repaired}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function legacyCollectionPath(slugValue: unknown): string | null {
  const slug = cleanContentSlug(slugValue);
  if (legacyServiceRedirects[slug]) return legacyServiceRedirects[slug];
  if (groupedOtherServicePaths[slug]) return groupedOtherServicePaths[slug];
  if (industryRedirects[slug]) return industryRedirects[slug];
  if (serviceSlugs.has(slug)) return `/services/${slug}`;
  if (caseStudySlugs.has(slug)) return `/work/${slug}`;
  if (insightSlugs.has(slug)) return `/insights/${slug}`;
  return null;
}

export function resolveContentFromPath(pathnameValue: string): { type: PublicContentType; slug: string } | null {
  const pathname = `/${cleanContentSlug(pathnameValue)}`;
  if (pathname === "/") return { type: "page", slug: "home" };
  const segments = cleanContentSlug(pathname).split("/").filter(Boolean);
  if (!segments.length) return { type: "page", slug: "home" };
  if (segments[0] === "services" && segments[1]) return { type: "service", slug: segments.slice(1).join("/") };
  if (segments[0] === "work" && segments[1]) return { type: "case_study", slug: segments.slice(1).join("/") };
  if (segments[0] === "portfolio" && segments[1]) return { type: "portfolio", slug: segments.slice(1).join("/") };
  if (segments[0] === "insights" && segments[1]) return { type: "insight", slug: segments.slice(1).join("/") };
  if ((segments[0] === "guides" || segments[0] === "resources") && segments[1]) return { type: "resource", slug: segments.slice(1).join("/") };
  if (segments[0] === "comparisons" && segments[1]) return { type: "comparison", slug: segments.slice(1).join("/") };
  return { type: "page", slug: segments.join("/") };
}
