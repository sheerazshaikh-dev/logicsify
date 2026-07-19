import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";

export const Route = createFileRoute("/process")({
  component: ProcessPage,
  head: () => ({
    meta: [
      { title: "Our Process | Logicsify" },
      {
        name: "description",
        content: "From discovery to scale — a transparent, senior-led delivery process.",
      },
      { property: "og:url", content: "/process" },
    ],
    links: [{ rel: "canonical", href: "/process" }],
  }),
});

const stages = [
  {
    n: "01",
    t: "Discover",
    b: "We start with a paid discovery: interviews, audits, and a written brief that aligns everyone on outcomes, constraints, and success metrics before scope is set.",
  },
  {
    n: "02",
    t: "Strategize",
    b: "Roadmap, architecture, and success criteria. We commit to what will ship, when, and what it will produce for the business.",
  },
  {
    n: "03",
    t: "Design",
    b: "Journeys, wireframes, and prototypes validated with real users. We ship a system, not just screens.",
  },
  {
    n: "04",
    t: "Build",
    b: "Two-week iterations, weekly demos, and a shared backlog. Development, integration, QA, and launch preparation.",
  },
  {
    n: "05",
    t: "Scale",
    b: "Analytics, experimentation, and continuous improvement. The engagement doesn't end at launch — that's where it gets interesting.",
  },
];

function ProcessPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="How we work"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Process" }]}
        title={
          <>
            From complexity <span className="text-gradient">to clarity.</span>
          </>
        }
        intro="Our five-stage process is designed for transparency, senior involvement, and measurable outcomes."
        primaryCta={{ label: "Start a Project", to: "/contact" }}
      />
      <section className="py-24">
        <div className="container-page">
          <div className="space-y-8">
            {stages.map((s, i) => (
              <div
                key={s.n}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
                className="grid md:grid-cols-12 gap-6 items-start border-b border-black/10 pb-8"
              >
                <div className="md:col-span-2 text-6xl font-display font-bold text-gradient">
                  {s.n}
                </div>
                <div className="md:col-span-3">
                  <h3 className="fluid-h3">{s.t}</h3>
                </div>
                <p className="md:col-span-7 text-lg text-ink-soft leading-relaxed">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
