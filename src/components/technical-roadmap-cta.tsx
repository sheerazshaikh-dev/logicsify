import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { rememberRoadmapSource, trackEvent } from "@/lib/analytics";

function trackContextualCta(source: string) {
  rememberRoadmapSource(source);
  trackEvent("technical_roadmap_cta_clicked", { source });
  if (source.startsWith("case_study:") || source === "case_studies") trackEvent("case_study_cta_clicked", { source });
  if (source.startsWith("insight:") || source === "insights") trackEvent("insight_cta_clicked", { source });
  if (source.startsWith("comparison:") || source === "comparisons") trackEvent("comparison_cta_clicked", { source });
  if (source === "automation_lab" || source.startsWith("automation_demo:")) trackEvent("automation_demo_cta_clicked", { source });
}

export function TechnicalRoadmapCTA({
  compact = false,
  eyebrow = "Free technical roadmap",
  title = "Turn the next technical decision into a clear plan.",
  body = "Share the systems, constraints, timeline, and outcome. Logicsify will use that context to prepare a practical roadmap for discovery.",
  source = "global_cta",
}: {
  compact?: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  source?: string;
}) {
  return (
    <section className={compact ? "py-14" : "py-20 md:py-28"}>
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl section-dark grid-noise p-8 md:p-14">
          <div className="absolute -right-24 -top-28 h-[420px] w-[420px] rounded-full bg-gradient-brand opacity-30 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-5 text-white/70">{eyebrow}</p>
              <h2 className="fluid-h2 text-white">{title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">{body}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                {["Current-state review", "Phased recommendation", "Key assumptions and risks"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-gold" /> {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                to="/technical-roadmap"
                className="btn-primary"
                onClick={() => trackContextualCta(source)}
              >
                Get a Free Technical Roadmap <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-xs text-white/50">No binding quote is created from the form.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
