import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import { PageHero } from "./page-hero";
import { CTASection } from "./cta-section";
import { allServices, getParentCoreService, getSubservicesForCore } from "@/lib/site-data";
import { type ComponentType } from "react";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { RelatedAutomationDemo } from "@/components/related-automation-demo";

export type ServicePageData = {
  slug: string;
  name: string;
  seoTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  heroTitle: { prefix: string; accent?: string; suffix?: string };
  heroIntro: string;
  valueProp: string;
  problems: string[];
  capabilities: { title: string; body: string }[];
  workflow: string[];
  process: { n: string; title: string; body: string }[];
  technologies: string[];
  faqs: { q: string; a: string }[];
  related: string[];
  useCases?: string[];
  audiences?: string[];
  deliverables?: string[];
  scenarios?: { title: string; body: string }[];
  measures?: string[];
  heroSupport?: string;
  finalCta?: { title: string; body: string };
  icon?: ComponentType<{ className?: string }>;
};

export function ServicePageTemplate({ data }: { data: ServicePageData }) {
  const subservices = getSubservicesForCore(data.slug);
  const parentCore = getParentCoreService(data.slug);
  const isAiAutomationFamily = data.slug === "ai-automation-voice-agents" || parentCore?.slug === "ai-automation-voice-agents";
  return (
    <>
      <PageHero
        eyebrow="Service"
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Services", to: "/services" },
          ...(parentCore ? [{ label: parentCore.name, to: parentCore.route }] : []),
          { label: data.name },
        ]}
        title={
          <>
            {data.heroTitle.prefix}
            {data.heroTitle.accent ? (
              <span className="text-gradient">{data.heroTitle.accent}</span>
            ) : null}
            {data.heroTitle.suffix}
          </>
        }
        intro={data.heroIntro}
        primaryCta={{ label: "Discuss Your Project", to: "/contact" }}
        secondaryCta={{ label: "View Our Work", to: "/work" }}
        visual={<ServiceHeroVisual name={data.name} workflow={data.workflow} />}
      />

      {/* Value prop */}
      <section className="py-20 md:py-28">
        <div className="container-page grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">What you get</p>
            <h2 className="fluid-h2">Clear value, delivered end to end.</h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg text-ink-soft leading-relaxed">{data.valueProp}</p>
          </div>
        </div>
      </section>

      {subservices.length ? (
        <section className="border-y border-black/5 bg-cream py-20 md:py-28">
          <div className="container-page">
            <div className="mb-12 max-w-3xl">
              <p className="eyebrow mb-4">Subservices</p>
              <h2 className="fluid-h2">Choose the capability your operation needs.</h2>
              <p className="mt-5 text-lg leading-8 text-ink-soft">
                Each capability has its own page, scope, workflow, and CMS record. They can be delivered independently or combined under this core service.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subservices.map((service, index) => (
                <Link
                  key={service.slug}
                  to={service.route}
                  data-reveal
                  className="group flex min-h-[220px] flex-col rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="text-sm font-bold text-gradient">{String(index + 1).padStart(2, "0")}</div>
                  <h3 className="mt-5 text-xl font-semibold text-ink">{service.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{service.short}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold">
                    Explore subservice <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : parentCore ? (
        <section className="border-y border-black/5 bg-cream py-12">
          <div className="container-page flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow mb-2">Part of a core service</p>
              <h2 className="text-2xl font-semibold">{parentCore.name}</h2>
            </div>
            <Link to={parentCore.route} className="btn-secondary">
              View all {parentCore.name} capabilities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {data.heroSupport || data.audiences?.length ? (
        <section className="border-y border-white/10 bg-ink py-16 text-white md:py-20">
          <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="eyebrow !text-brand-gold">Start with the operating problem</p>
              <p className="mt-4 max-w-3xl text-xl leading-9 text-white/80">
                {data.heroSupport || "Logicsify maps the workflow, systems, decisions, exceptions, and ownership before selecting the implementation approach."}
              </p>
            </div>
            {data.audiences?.length ? <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/5 p-7">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-white/50">Who this is for</p>
              <ul className="mt-5 space-y-3">{data.audiences.map((item)=><li key={item} className="flex gap-3 text-white/80"><Check className="mt-1 h-4 w-4 shrink-0 text-brand-gold"/>{item}</li>)}</ul>
            </div> : null}
          </div>
        </section>
      ) : null}

      {/* Problems solved */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-4">Problems we solve</p>
            <h2 className="fluid-h2">If any of this sounds familiar…</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.problems.map((p) => (
              <div key={p} data-reveal className="rounded-2xl bg-white border border-black/5 p-6">
                <div className="h-8 w-8 rounded-full bg-gradient-brand text-white flex items-center justify-center text-sm font-bold mb-3">
                  !
                </div>
                <p className="text-ink leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-4">Capabilities included</p>
            <h2 className="fluid-h2">Everything covered under one engagement.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {data.capabilities.map((c) => (
              <div
                key={c.title}
                id={capabilityAnchor(data.slug, c.title)}
                data-reveal
                className="group rounded-2xl border border-black/10 p-6 md:p-8 bg-white hover:shadow-[var(--shadow-card)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <Check className="w-5 h-5 text-brand-red mt-1 shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                    <p className="text-ink-soft text-sm leading-relaxed">{c.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceSystemMap data={data} />

      {data.deliverables?.length ? (
        <section className="py-20 md:py-28">
          <div className="container-page grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4"><p className="eyebrow mb-4">Core deliverables</p><h2 className="fluid-h2">What the engagement leaves behind.</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">{data.deliverables.map((item,index)=><div key={item} className="rounded-2xl border border-black/10 bg-white p-6"><span className="text-sm font-bold text-gradient">{String(index+1).padStart(2,'0')}</span><p className="mt-3 leading-7 text-ink">{item}</p></div>)}</div>
          </div>
        </section>
      ) : null}

      {isAiAutomationFamily ? <RelatedAutomationDemo serviceSlug={data.slug} serviceName={data.name} /> : null}

      {data.useCases?.length ? (
        <section className="bg-cream py-20 md:py-28">
          <div className="container-page">
            <div className="mb-12 max-w-2xl">
              <p className="eyebrow mb-4">Use cases</p>
              <h2 className="fluid-h2">Where this system creates practical value.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.useCases.map((item, index) => (
                <div key={item} data-reveal className="rounded-2xl border border-black/10 bg-white p-6">
                  <div className="mb-4 text-sm font-bold text-gradient">{String(index + 1).padStart(2, "0")}</div>
                  <p className="font-semibold text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Visual workflow */}
      <section className="py-20 md:py-28 section-dark grid-noise">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow text-white/60 mb-4">How it flows</p>
            <h2 className="fluid-h2 text-white">A clear, connected workflow.</h2>
          </div>
          <div className="grid md:grid-cols-6 gap-4 relative">
            <div className="hidden md:block absolute top-6 left-6 right-6 h-px bg-gradient-brand opacity-40" />
            {data.workflow.map((step, i) => (
              <div
                key={i}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
                className="relative"
              >
                <div className="h-12 w-12 rounded-full bg-ink border border-white/20 text-white flex items-center justify-center font-semibold relative z-10 mx-auto md:mx-0">
                  <span
                    className="absolute inset-0 rounded-full bg-gradient-brand opacity-40 blur animate-pulse-glow"
                    style={{ animationDelay: `${i * 0.25}s` }}
                  />
                  <span className="relative">{i + 1}</span>
                </div>
                <p className="mt-4 text-sm text-white/85 font-semibold text-center md:text-left">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-4">Delivery process</p>
            <h2 className="fluid-h2">How we deliver, step by step.</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {data.process.map((s) => (
              <div key={s.n} className="rounded-2xl bg-white border border-black/10 p-6">
                <div className="text-sm font-bold text-gradient mb-3">{s.n}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 md:py-28 bg-lavender">
        <div className="container-page">
          <div className="max-w-2xl mb-10">
            <p className="eyebrow mb-4">Technologies</p>
            <h2 className="fluid-h2">Tools we reach for.</h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {data.technologies.map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full bg-white border border-black/10 text-sm font-medium text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Logicsify */}
      <section className="py-20 md:py-28">
        <div className="container-page grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">Why Logicsify</p>
            <h2 className="fluid-h2">Connected delivery. Clear ownership.</h2>
          </div>
          <ul className="lg:col-span-7 space-y-4">
            {[
              "Strategy, design, engineering, and growth in one team.",
              "A defined technical plan so responsibilities and next steps stay visible.",
              "Documented implementation and ownership terms agreed in the project scope.",
              "Measurement and reporting included where they are part of the agreed deliverable.",
            ].map((r) => (
              <li key={r} className="flex items-start gap-3 text-ink leading-relaxed">
                <Check className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>


      {(["ai-automation-voice-agents", "crm-revenue-operations", "custom-websites-portals-cms"].includes(data.slug)) ? <SystemsWeIntegrate /> : null}



      {data.scenarios?.length ? (
        <section className="bg-ink py-20 text-white md:py-28">
          <div className="container-page"><div className="mb-12 max-w-3xl"><p className="eyebrow !text-brand-gold mb-4">Evidence structure</p><h2 className="fluid-h2">Systems designed around real operating problems.</h2></div><div className="grid gap-5 md:grid-cols-3">{data.scenarios.map((item)=><article key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-7"><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-4 leading-7 text-white/65">{item.body}</p></article>)}</div>{data.measures?.length?<div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-7"><p className="text-sm font-bold uppercase tracking-[.18em] text-white/50">What to measure</p><div className="mt-5 flex flex-wrap gap-3">{data.measures.map((item)=><span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">{item}</span>)}</div></div>:null}</div>
        </section>
      ) : null}

      {/* FAQs */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container-page grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4">FAQs</p>
            <h2 className="fluid-h2">Answers, upfront.</h2>
          </div>
          <div className="lg:col-span-8 space-y-3">
            {data.faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white border border-black/10 p-5 open:shadow-[var(--shadow-card)]"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-lg font-semibold text-ink">{f.q}</span>
                  <span className="h-8 w-8 rounded-full bg-lavender flex items-center justify-center shrink-0 group-open:bg-gradient-brand group-open:text-white transition">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-4 text-ink-soft leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related services */}
      {data.related.length ? (
        <section className="py-20 md:py-28">
          <div className="container-page">
            <div className="max-w-2xl mb-10">
              <p className="eyebrow mb-4">Related services</p>
              <h2 className="fluid-h2">Often paired with…</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.related.map((slug) => {
                const s = allServices.find((x) => x.slug === slug);
                if (!s) return null;
                return (
                  <Link
                    to={s.route}
                    key={slug}
                    className="group rounded-2xl border border-black/10 p-6 bg-white hover:-translate-y-1 transition-all"
                  >
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-gradient transition">
                      {s.name}
                    </h3>
                    <p className="text-sm text-ink-soft">{s.short}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm text-ink font-semibold">
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection />
    </>
  );
}

function ServiceSystemMap({ data }: { data: ServicePageData }) {
  const nodes = data.workflow.slice(0, 6);
  if (!nodes.length) return null;
  return <section className="bg-ink py-20 text-white md:py-28"><div className="container-page"><div className="mb-12 max-w-3xl"><p className="eyebrow !text-brand-gold mb-4">Connected system map</p><h2 className="fluid-h2">One controlled journey from request to outcome.</h2><p className="mt-5 text-lg leading-8 text-white/65">The visual stays service-specific by using the actual workflow defined for this page, with fixed-height cards to prevent layout shift.</p></div><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{nodes.map((node,index)=><div key={`${node}-${index}`} className="relative min-h-40 rounded-2xl border border-white/10 bg-white/5 p-5"><span className="text-sm font-bold text-brand-gold">{String(index+1).padStart(2,'0')}</span><p className="mt-8 font-semibold leading-6">{node}</p>{index<nodes.length-1?<ArrowRight className="absolute -right-5 top-1/2 hidden h-5 w-5 text-brand-gold xl:block"/>:null}</div>)}</div></div></section>;
}

function ServiceHeroVisual({ name, workflow }: { name: string; workflow: string[] }) {
  return (
    <div className="relative aspect-square max-w-[440px] mx-auto">
      <div className="absolute inset-0 rounded-3xl border border-white/10 rotate-6" />
      <div className="absolute inset-0 rounded-3xl border border-white/10 -rotate-3" />
      <div className="absolute inset-0 rounded-3xl glass-card p-6 flex flex-col justify-between overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-brand opacity-25 blur-3xl animate-pulse-glow" />
        <div className="relative">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-white/30" />
            <div className="h-2 w-2 rounded-full bg-white/30" />
            <div className="h-2 w-2 rounded-full bg-white/30" />
          </div>
          <p className="mt-6 text-xs text-white/60 uppercase tracking-widest">
            Currently deploying
          </p>
          <p className="text-white text-2xl font-semibold mt-2 leading-tight">{name}</p>
        </div>
        <div className="relative grid grid-cols-2 gap-2">
          {workflow.slice(0,6).map((step,index)=><div key={step} className="rounded-xl border border-white/10 bg-white/5 p-3"><span className="text-[10px] font-bold text-brand-gold">{String(index+1).padStart(2,'0')}</span><p className="mt-1 text-xs leading-4 text-white/70">{step}</p></div>)}
        </div>
      </div>
    </div>
  );
}

function capabilityAnchor(serviceSlug: string, title: string) {
  if (serviceSlug === "cloud-maintenance") {
    const normalized = title.toLowerCase();
    if (normalized.includes("cloud")) return "cloud-deployment";
    if (normalized.includes("maintenance")) return "website-maintenance";
    if (normalized.includes("security")) return "cybersecurity";
    if (normalized.includes("augmentation") || normalized.includes("capacity")) return "staff-augmentation";
  }
  return title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

