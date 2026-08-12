import { createFileRoute } from "@tanstack/react-router";
import { Play, Quote, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/page-hero";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { SiteLayout } from "@/components/site-layout";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { getCmsContentList, type CmsContentItem } from "@/lib/logicsify-api";
import { relatedServiceItems } from "@/lib/related-content";

export const Route = createFileRoute("/testimonials")({
  pendingComponent: PublicRouteLoading,
  loader: async () => ({ testimonials: await getCmsContentList("testimonial", { fresh: true }) }),
  component: TestimonialsPage,
  head: () => ({
    meta: [
      { title: "Client Testimonials | Logicsify" },
      {
        name: "description",
        content:
          "Read written client testimonials and watch video testimonials about Logicsify software, automation, web, CRM, and digital delivery work.",
      },
      { property: "og:title", content: "Client Testimonials | Logicsify" },
      {
        property: "og:description",
        content: "Written and video feedback from Logicsify clients.",
      },
      { property: "og:url", content: "https://logicsify.com/testimonials" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/testimonials" }],
  }),
});

type TestimonialData = {
  id: number;
  slug: string;
  clientName: string;
  role: string;
  company: string;
  projectType: string;
  quote: string;
  type: "text" | "video";
  videoUrl: string;
  poster: string;
  image: string;
  services: Array<{ slug: string; label: string }>;
};

function testimonialData(item: CmsContentItem): TestimonialData {
  const content = item.content_json || {};
  return {
    id: item.id,
    slug: item.slug,
    clientName: String(content.client_name || item.title || "Client"),
    role: String(content.role || ""),
    company: String(content.company || ""),
    projectType: String(content.project_type || ""),
    quote: String(content.quote || item.excerpt || content.body || ""),
    type: String(content.testimonial_type || "text") === "video" ? "video" : "text",
    videoUrl: String(content.video_url || ""),
    poster: String(content.video_poster || item.featured_image || ""),
    image: String(content.client_image || item.featured_image || ""),
    services: relatedServiceItems(item),
  };
}

function videoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function TestimonialsPage() {
  const { testimonials: source } = Route.useLoaderData();
  const testimonials = useMemo(
    () => source.map(testimonialData).filter((item) => item.quote || item.videoUrl),
    [source],
  );
  const written = useMemo(() => testimonials.filter((item) => item.type === "text"), [testimonials]);
  const videos = useMemo(
    () => testimonials.filter((item) => item.type === "video" && item.videoUrl),
    [testimonials],
  );
  const [active, setActive] = useState<"written" | "video">(() =>
    written.length ? "written" : "video",
  );
  const visible = active === "written" ? written : videos;
  const showWritten = written.length > 0;
  const showVideo = videos.length > 0;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Client Testimonials"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Testimonials" }]}
        title={
          <>
            What clients say after the <span className="text-gradient">work ships.</span>
          </>
        }
        intro="Browse written feedback and video testimonials from clients across Logicsify projects and services."
        primaryCta={{ label: "Start a Project", to: "/contact" }}
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          {!testimonials.length ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-cream p-10 text-center">
              <Quote className="mx-auto h-9 w-9 text-ink-soft" />
              <h2 className="mt-5 fluid-h3">No testimonials published yet.</h2>
              <p className="mt-3 text-ink-soft">
                Published written and video testimonials will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Testimonials">
                {showWritten ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active === "written"}
                    onClick={() => setActive("written")}
                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                      active === "written"
                        ? "border-ink bg-ink text-white"
                        : "border-black/10 bg-white text-ink"
                    }`}
                  >
                    <Quote className="h-4 w-4" /> Written ({written.length})
                  </button>
                ) : null}
                {showVideo ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active === "video"}
                    onClick={() => setActive("video")}
                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                      active === "video"
                        ? "border-ink bg-ink text-white"
                        : "border-black/10 bg-white text-ink"
                    }`}
                  >
                    <Video className="h-4 w-4" /> Video ({videos.length})
                  </button>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <TechnicalRoadmapCTA source="testimonials" />
    </SiteLayout>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  const embedUrl = videoEmbedUrl(testimonial.videoUrl);
  const hostedVideo = testimonial.videoUrl && !embedUrl;

  return (
    <article id={testimonial.slug} className="scroll-mt-28 overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[var(--shadow-card)]">
      {testimonial.type === "video" && testimonial.videoUrl ? (
        <div className="relative aspect-video overflow-hidden bg-ink">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${testimonial.clientName} video testimonial`}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : hostedVideo ? (
            <video
              className="h-full w-full object-cover"
              controls
              preload="metadata"
              poster={testimonial.poster || undefined}
            >
              <source src={testimonial.videoUrl} />
            </video>
          ) : null}
        </div>
      ) : null}

      <div className="p-7 md:p-8">
        <Quote className="mb-5 h-7 w-7 text-brand-red" />
        {testimonial.quote ? (
          <blockquote className="text-lg leading-relaxed text-ink">“{testimonial.quote}”</blockquote>
        ) : null}
        <footer className="mt-7 flex items-center gap-3">
          {testimonial.image ? (
            <img
              src={testimonial.image}
              alt={testimonial.clientName}
              className="h-12 w-12 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-white">
              {testimonial.clientName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-semibold text-ink">{testimonial.clientName}</p>
            <p className="text-sm text-ink-soft">
              {[testimonial.role, testimonial.company, testimonial.projectType]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </footer>
        {testimonial.type === "video" ? (
          <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-red">
            <Play className="h-3.5 w-3.5" /> Video testimonial
          </div>
        ) : null}
        {testimonial.services.length ? (
          <div className="mt-5 border-t border-black/8 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Related services</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {testimonial.services.map((service) => (
                <a
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold capitalize transition hover:bg-ink hover:text-white"
                >
                  {service.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
