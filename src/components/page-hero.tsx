import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  primaryCta,
  secondaryCta,
  visual,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  visual?: ReactNode;
}) {
  return (
    <section className="section-dark grid-noise pt-32 md:pt-40 pb-20 md:pb-28 relative">
      <div className="container-page relative">
        {breadcrumbs && (
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-xs text-white/60"
          >
            {breadcrumbs.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {b.to ? (
                  <Link to={b.to} className="hover:text-white">
                    {b.label}
                  </Link>
                ) : (
                  <span>{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
              </span>
            ))}
          </nav>
        )}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className={visual ? "lg:col-span-7" : "lg:col-span-12"}>
            {eyebrow && <p className="eyebrow text-white/70 mb-6">{eyebrow}</p>}
            <div className="page-hero-heading-wrap">
              <h1 className="fluid-display text-white">{title}</h1>
            </div>
            {intro && (
              <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl leading-relaxed">
                {intro}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="mt-10 flex flex-wrap gap-4">
                {primaryCta && (
                  <Link to={primaryCta.to} className="btn-primary">
                    {primaryCta.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {secondaryCta && (
                  <Link to={secondaryCta.to} className="btn-ghost-dark">
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
          {visual && <div className="lg:col-span-5">{visual}</div>}
        </div>
      </div>
    </section>
  );
}
