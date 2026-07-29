import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Check, HelpCircle } from "lucide-react";
import { PageHero } from "./page-hero";
import { CTASection } from "./cta-section";
import { allServices, getParentCoreService, getSubservicesForCore } from "@/lib/site-data";
import { useEffect, useState, type ComponentType } from "react";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { engagementModels } from "@/lib/expansion-data";
import { getCmsContentList, type CmsContentItem } from "@/lib/logicsify-api";
import { RelatedAutomationDemo } from "@/components/related-automation-demo";

export type ServicePageData = {
  slug: string;
  name: string;
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
        visual={<ServiceHeroVisual name={data.name} />}
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
                  className="group flex min-h-[220px] flex-col rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_-26px_rgba(25,10,47,.35)]"
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
                className="group rounded-2xl border border-black/10 p-6 md:p-8 bg-white hover:shadow-[0_20px_50px_-20px_rgba(25,10,47,0.2)] transition-all"
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

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="mb-10 max-w-2xl"><p className="eyebrow mb-4">Engagement models</p><h2 className="fluid-h2">A delivery model that fits the scope.</h2></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {engagementModels.map((model) => <Link key={model.slug} to="/engagement-models" hash={model.slug} className="rounded-2xl border border-black/10 bg-white p-5"><h3 className="font-semibold">{model.title}</h3><p className="mt-2 text-sm leading-6 text-ink-soft">{model.bestFor}</p></Link>)}
          </div>
        </div>
      </section>

      <RelatedWork serviceSlug={data.slug} />

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
                className="group rounded-2xl bg-white border border-black/10 p-5 open:shadow-[0_10px_30px_-15px_rgba(25,10,47,0.2)]"
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

      <CTASection />
    </>
  );
}

function ServiceHeroVisual({ name }: { name: string }) {
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
        <div className="relative space-y-2">
          <div className="h-1.5 rounded bg-white/10 overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-brand" />
          </div>
          <div className="h-1.5 rounded bg-white/10 overflow-hidden">
            <div className="h-full w-3/5 bg-gradient-brand opacity-70" />
          </div>
          <div className="h-1.5 rounded bg-white/10 overflow-hidden">
            <div className="h-full w-11/12 bg-gradient-brand opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedWork({ serviceSlug }: { serviceSlug: string }) {
  const [items, setItems] = useState<CmsContentItem[]>([]);
  useEffect(() => {
    let active = true;
    getCmsContentList("case_study")
      .then((result) => {
        if (!active) return;
        const matched = result.filter((item) => {
          const services = Array.isArray(item.content_json?.services) ? item.content_json.services.map(String) : [];
          return services.includes(serviceSlug) || item.featured;
        }).slice(0, 3);
        setItems(matched);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [serviceSlug]);
  if (!items.length) return null;
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-page">
        <div className="mb-10 max-w-2xl"><p className="eyebrow mb-4">Related work</p><h2 className="fluid-h2">Systems delivered around real operating problems.</h2></div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <Link key={item.slug} to="/work/$slug" params={{ slug: item.slug }} className="group overflow-hidden rounded-2xl border border-black/10 bg-white">
              {item.featured_image ? <img src={item.featured_image} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" /> : <div className="grid aspect-[16/9] place-items-center bg-ink"><BriefcaseBusiness className="h-10 w-10 text-white/20" /></div>}
              <div className="p-6"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-ink-soft">{item.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Read case study <ArrowUpRight className="h-4 w-4" /></span></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
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

