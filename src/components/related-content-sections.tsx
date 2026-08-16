import { ArrowUpRight } from "lucide-react";
import { contentPublicPath, type PublicContentType } from "@/lib/content-routes";
import type { CmsContentItem, RelatedContentResponse } from "@/lib/logicsify-api";
import { WorkTestimonialCard } from "@/components/work-testimonial-card";
import { buildWorkTestimonials, type WorkTestimonial } from "@/lib/work-testimonials";

const groupLabels: Record<string, string> = {
  case_study: "Case Studies",
  portfolio: "Portfolio",
  insight: "Insights",
  testimonial: "Testimonials",
  resource: "Guides",
  comparison: "Comparisons",
  engagement_model: "Engagement Models",
  integration: "Integrations",
};

const groupEyebrows: Record<string, string> = {
  case_study: "Client work",
  portfolio: "Selected work",
  insight: "Learn",
  testimonial: "Client proof",
  resource: "Resources",
  comparison: "Decision support",
  engagement_model: "Ways to work",
  integration: "Connected platforms",
};


function text(value: unknown) {
  return String(value || "").trim();
}

function relationSlug(value: unknown) {
  return text(value)
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .pop() || "";
}

function standaloneRelatedTestimonial(item: CmsContentItem): WorkTestimonial | null {
  const content = item.content_json || {};
  const quote = text(content.quote || item.excerpt || content.body);
  const videoUrl = text(content.video_url);
  if (!quote && !videoUrl) return null;
  const caseSlug = relationSlug(content.related_case_study || content.case_study_slug);
  const portfolioSlug = relationSlug(content.related_portfolio || content.portfolio_slug);
  return {
    id: `testimonial:${item.id}`,
    sourceType: "testimonial",
    sourceSlug: item.slug,
    clientName: text(content.client_name || item.title || "Client"),
    role: text(content.role),
    company: text(content.company),
    projectType: text(content.project_type),
    quote,
    type: text(content.testimonial_type).toLowerCase() === "video" ? "video" : "text",
    videoUrl,
    poster: text(content.video_poster || item.featured_image),
    image: text(content.client_image || item.featured_image),
    relatedPath: caseSlug ? `/work/${caseSlug}` : portfolioSlug ? `/portfolio/${portfolioSlug}` : "",
    relatedTitle: "",
  };
}

function itemPath(item: CmsContentItem) {
  return contentPublicPath(item.content_type as PublicContentType, item.slug) || "#";
}

function RelatedCard({ item }: { item: CmsContentItem }) {
  const c = item.content_json || {};
  const meta = String(c.category || c.project_type || c.industry || "");
  return (
    <a
      href={itemPath(item)}
      className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      {item.featured_image ? (
        <img
          src={item.featured_image}
          alt=""
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div className="p-5">
        {meta ? <p className="eyebrow">{meta}</p> : null}
        <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
        {item.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{item.excerpt}</p> : null}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-brand-red">
          View <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

export function RelatedContentSections({
  data,
  showServices = true,
  title = "Related content",
}: {
  data: RelatedContentResponse | null | undefined;
  showServices?: boolean;
  title?: string;
}) {
  if (!data) return null;
  const caseStudies = (data.groups?.case_study || []) as CmsContentItem[];
  const portfolio = (data.groups?.portfolio || []) as CmsContentItem[];
  const standaloneTestimonials = ((data.groups?.testimonial || []) as CmsContentItem[])
    .map(standaloneRelatedTestimonial)
    .filter((item): item is WorkTestimonial => Boolean(item));
  const embeddedTestimonials = buildWorkTestimonials({ caseStudies, portfolio });
  const testimonialMap = new Map<string, WorkTestimonial>();
  [...standaloneTestimonials, ...embeddedTestimonials].forEach((item) => {
    const key = `${item.clientName.toLowerCase()}|${item.quote.toLowerCase()}|${item.videoUrl.toLowerCase()}`;
    if (!testimonialMap.has(key)) testimonialMap.set(key, item);
  });
  const testimonials = [...testimonialMap.values()].slice(0, 3);
  const groups = Object.entries(data.groups || {}).filter(
    ([type, items]) => type !== "testimonial" && Array.isArray(items) && items.length,
  );
  const services = showServices ? data.services || [] : [];
  if (!services.length && !groups.length && !testimonials.length) return null;

  return (
    <section className="border-t border-black/8 bg-cream py-20 md:py-24">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="eyebrow">Explore the connected topic</p>
          <h2 className="mt-3 fluid-h3">{title}</h2>
          <p className="mt-3 text-ink-soft">
            These items are connected through the same Logicsify service relationship.
          </p>
        </div>

        {services.length ? (
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">Related services</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {services.map((service) => (
                <a
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold capitalize transition hover:border-brand-red hover:text-brand-red"
                >
                  {service.title || service.slug.replaceAll("-", " ")}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {testimonials.length ? (
          <div className="mt-12">
            <div>
              <p className="eyebrow">Client proof</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">Testimonials</h3>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <WorkTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        ) : null}

        {groups.map(([type, items]) => (
          <div key={type} className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{groupEyebrows[type] || "Related"}</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink">{groupLabels[type] || "Related"}</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {(items as CmsContentItem[]).map((item) => (
                <RelatedCard key={`${item.content_type}:${item.id}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
