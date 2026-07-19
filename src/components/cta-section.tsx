import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CTASection({
  eyebrow = "Let's build",
  title = "Have a complex idea? Let's make it logical.",
  body = "Tell us what you are building, improving, or automating. We'll help you identify the clearest path forward.",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl section-dark grid-noise p-10 md:p-16">
          <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-gradient-brand opacity-30 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-brand-red/20 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden>
            <defs>
              <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0H0V60" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
          <div className="relative max-w-3xl">
            <p className="eyebrow text-white/70 mb-6">{eyebrow}</p>
            <h2 className="fluid-h2 text-white">
              Have a complex idea? <br />
              <span className="text-gradient">Let's make it logical.</span>
            </h2>
            <p className="mt-6 text-lg text-white/70 max-w-xl">{body}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/contact" className="btn-primary">
                Start a Project <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/book-a-call" className="btn-ghost-dark">
                Book a Strategy Call
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
