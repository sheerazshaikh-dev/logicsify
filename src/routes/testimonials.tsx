import { createFileRoute } from "@tanstack/react-router";
import { Quote, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/page-hero";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { SiteLayout } from "@/components/site-layout";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { WorkTestimonialCard } from "@/components/work-testimonial-card";
import { getCmsContentList } from "@/lib/logicsify-api";
import { buildWorkTestimonials } from "@/lib/work-testimonials";

export const Route = createFileRoute("/testimonials")({
  pendingComponent: PublicRouteLoading,
  loader: async () => {
    const [testimonials, caseStudies, portfolio] = await Promise.all([
      getCmsContentList("testimonial", { fresh: true }),
      getCmsContentList("case_study", { fresh: true }),
      getCmsContentList("portfolio", { fresh: true }),
    ]);
    return { testimonials, caseStudies, portfolio };
  },
  component: TestimonialsPage,
  head: () => ({
    meta: [
      { title: "Client Testimonials | Logicsify" },
      {
        name: "description",
        content:
          "Read written client testimonials and watch video testimonials connected to published Logicsify case studies and portfolio projects.",
      },
      { property: "og:title", content: "Client Testimonials | Logicsify" },
      {
        property: "og:description",
        content: "Project-linked client feedback from Logicsify software, automation, web, CRM, and digital delivery work.",
      },
      { property: "og:url", content: "https://logicsify.com/testimonials" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/testimonials" }],
  }),
});

function TestimonialsPage() {
  const { testimonials: source, caseStudies, portfolio } = Route.useLoaderData();
  const testimonials = useMemo(
    () => buildWorkTestimonials({ testimonials: source, caseStudies, portfolio }),
    [source, caseStudies, portfolio],
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
            Client feedback connected to the <span className="text-gradient">work behind it.</span>
          </>
        }
        intro="Every testimonial shown here is tied to a published case study or portfolio project, so you can see the work and the feedback together."
        primaryCta={{ label: "Start a Project", to: "/contact" }}
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          {!testimonials.length ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-cream p-10 text-center">
              <Quote className="mx-auto h-9 w-9 text-ink-soft" />
              <h2 className="mt-5 fluid-h3">No project-linked testimonials published yet.</h2>
              <p className="mt-3 text-ink-soft">
                Add a testimonial to a Case Study or Portfolio project, or link a Testimonial entry to published work from Content Studio.
              </p>
            </div>
          ) : (
            <>
              {(showWritten && showVideo) ? (
                <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Testimonials">
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
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((testimonial) => (
                  <WorkTestimonialCard key={testimonial.id} testimonial={testimonial} />
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
