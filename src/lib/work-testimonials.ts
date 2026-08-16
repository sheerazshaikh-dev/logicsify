import type { CmsContentItem } from "@/lib/logicsify-api";

export type WorkTestimonialType = "text" | "video";
export type WorkTestimonialSource = "testimonial" | "case_study" | "portfolio";

export type WorkTestimonial = {
  id: string;
  sourceType: WorkTestimonialSource;
  sourceSlug: string;
  clientName: string;
  role: string;
  company: string;
  projectType: string;
  quote: string;
  type: WorkTestimonialType;
  videoUrl: string;
  poster: string;
  image: string;
  relatedPath: string;
  relatedTitle: string;
};

function str(value: unknown) {
  return String(value || "").trim();
}

function slugValue(value: unknown) {
  return str(value)
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .pop() || "";
}

function testimonialType(value: unknown): WorkTestimonialType {
  return str(value).toLowerCase() === "video" ? "video" : "text";
}

function embeddedWorkTestimonial(item: CmsContentItem, sourceType: "case_study" | "portfolio"): WorkTestimonial | null {
  const content = item.content_json || {};
  const quote = str(content.testimonial);
  const videoUrl = str(content.testimonial_video_url);
  if (!quote && !videoUrl) return null;

  const clientName = str(content.testimonial_name || content.client_name || content.company || item.title || "Client");
  const company = str(content.testimonial_company || content.company || content.client_name);
  const projectType = str(content.project_type || content.category || (sourceType === "case_study" ? "Case study" : "Portfolio project"));

  return {
    id: `${sourceType}:${item.id}:embedded`,
    sourceType,
    sourceSlug: item.slug,
    clientName,
    role: str(content.testimonial_role),
    company,
    projectType,
    quote,
    type: testimonialType(content.testimonial_type),
    videoUrl,
    poster: str(content.testimonial_video_poster || item.featured_image),
    image: str(content.testimonial_image || content.client_logo || item.featured_image),
    relatedPath: sourceType === "case_study" ? `/work/${item.slug}` : `/portfolio/${item.slug}`,
    relatedTitle: item.title,
  };
}

function linkedStandaloneTestimonial(
  item: CmsContentItem,
  caseStudies: CmsContentItem[],
  portfolio: CmsContentItem[],
): WorkTestimonial | null {
  const content = item.content_json || {};
  const caseSlug = slugValue(content.related_case_study || content.case_study_slug);
  const portfolioSlug = slugValue(content.related_portfolio || content.portfolio_slug);
  const caseStudy = caseSlug ? caseStudies.find((entry) => entry.slug === caseSlug) : undefined;
  const project = portfolioSlug ? portfolio.find((entry) => entry.slug === portfolioSlug) : undefined;
  const linked = caseStudy || project;
  if (!linked) return null;

  const linkedContent = linked.content_json || {};
  const quote = str(content.quote || item.excerpt || content.body);
  const videoUrl = str(content.video_url);
  if (!quote && !videoUrl) return null;

  return {
    id: `testimonial:${item.id}`,
    sourceType: "testimonial",
    sourceSlug: item.slug,
    clientName: str(content.client_name || item.title || linkedContent.client_name || "Client"),
    role: str(content.role),
    company: str(content.company || linkedContent.client_name || linkedContent.company),
    projectType: str(content.project_type || linkedContent.project_type || linkedContent.category),
    quote,
    type: testimonialType(content.testimonial_type),
    videoUrl,
    poster: str(content.video_poster || item.featured_image || linked.featured_image),
    image: str(content.client_image || item.featured_image || linkedContent.client_logo || linked.featured_image),
    relatedPath: caseStudy ? `/work/${caseStudy.slug}` : `/portfolio/${project!.slug}`,
    relatedTitle: linked.title,
  };
}

function dedupe(items: WorkTestimonial[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.clientName.toLowerCase()}|${item.quote.toLowerCase()}|${item.videoUrl.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildWorkTestimonials({
  testimonials = [],
  caseStudies = [],
  portfolio = [],
}: {
  testimonials?: CmsContentItem[];
  caseStudies?: CmsContentItem[];
  portfolio?: CmsContentItem[];
}): WorkTestimonial[] {
  const linkedStandalone = testimonials
    .map((item) => linkedStandaloneTestimonial(item, caseStudies, portfolio))
    .filter((item): item is WorkTestimonial => Boolean(item));
  const caseStudyTestimonials = caseStudies
    .map((item) => embeddedWorkTestimonial(item, "case_study"))
    .filter((item): item is WorkTestimonial => Boolean(item));
  const portfolioTestimonials = portfolio
    .map((item) => embeddedWorkTestimonial(item, "portfolio"))
    .filter((item): item is WorkTestimonial => Boolean(item));

  return dedupe([...linkedStandalone, ...caseStudyTestimonials, ...portfolioTestimonials]);
}

export function testimonialsForWork(
  testimonials: WorkTestimonial[],
  type: "case_study" | "portfolio",
  slug: string,
) {
  const path = type === "case_study" ? `/work/${slug}` : `/portfolio/${slug}`;
  return testimonials.filter(
    (item) =>
      (item.sourceType === type && item.sourceSlug === slug) ||
      item.relatedPath === path,
  );
}
