import { ArrowUpRight, Play, Quote } from "lucide-react";
import type { WorkTestimonial } from "@/lib/work-testimonials";

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

export function WorkTestimonialCard({ testimonial }: { testimonial: WorkTestimonial }) {
  const embedUrl = videoEmbedUrl(testimonial.videoUrl);
  const hostedVideo = testimonial.videoUrl && !embedUrl;

  return (
    <article className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[var(--shadow-card)]">
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
              decoding="async"
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
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {testimonial.type === "video" ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-red">
              <Play className="h-3.5 w-3.5" /> Video testimonial
            </span>
          ) : <span />}
          {testimonial.relatedPath ? (
            <a href={testimonial.relatedPath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition hover:text-brand-red">
              View related work <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
