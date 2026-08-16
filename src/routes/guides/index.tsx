import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Download, FileText, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import {
  getCmsContentList,
  requestResourceDownload,
  type CmsContentItem,
} from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { relatedServiceItems } from "@/lib/related-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/guides/")({
  validateSearch: (search: Record<string, unknown>) => ({
    guide: typeof search.guide === "string" ? search.guide : undefined,
  }),
  pendingComponent: PublicRouteLoading,
  loader: async () => ({ guides: await getCmsContentList("resource") }),
  component: GuidesPage,
  head: () => ({
    meta: [
      { title: "Business Technology Guides & Downloads | Logicsify" },
      {
        name: "description",
        content:
          "Download practical checklists, audits, and planning templates for websites, SaaS products, CRM migrations, and AI automation.",
      },
      { property: "og:title", content: "Business Technology Guides & Downloads | Logicsify" },
      {
        property: "og:description",
        content: "Practical guides for websites, software, CRM migrations, and automation planning.",
      },
      { property: "og:url", content: "https://logicsify.com/guides" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/guides" }],
  }),
});

function GuidesPage() {
  const { guides } = Route.useLoaderData();
  const { guide: requestedGuide } = Route.useSearch();
  const [selected, setSelected] = useState<CmsContentItem | null>(null);

  const featured = guides.find((item) => Boolean(item.featured));

  useEffect(() => {
    if (!requestedGuide) return;
    const matched = guides.find((item) => item.slug === requestedGuide);
    if (matched) setSelected(matched);
  }, [guides, requestedGuide]);

  function openGuide(item: CmsContentItem, placement: string) {
    setSelected(item);
    trackEvent("resource_opened", { slug: item.slug, placement });
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Guides & downloads"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Guides" }]}
        title={
          <>
            Planning tools for better <span className="text-gradient">technical decisions.</span>
          </>
        }
        intro="Choose a guide, share your contact details, and the file will download immediately."
        primaryCta={{ label: "Get a Free Technical Roadmap", to: "/technical-roadmap" }}
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          {featured ? (
            <button
              type="button"
              onClick={() => openGuide(featured, "featured")}
              className="mb-12 grid w-full gap-8 rounded-3xl bg-ink p-8 text-left text-white transition hover:-translate-y-1 hover:shadow-xl md:grid-cols-12 md:p-12"
            >
              <div className="md:col-span-8">
                <p className="eyebrow text-white/60">Featured guide</p>
                <h2 className="mt-4 fluid-h3">{featured.title}</h2>
                <p className="mt-4 max-w-2xl text-white/65">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                  Get the guide <Download className="h-4 w-4" />
                </span>
              </div>
              {featured.featured_image ? (
                <img
                  src={featured.featured_image}
                  alt=""
                  className="h-60 w-full rounded-2xl object-cover md:col-span-4"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-60 place-items-center rounded-2xl bg-white/5 md:col-span-4">
                  <FileText className="h-14 w-14 text-white/30" />
                </div>
              )}
            </button>
          ) : null}

          {!guides.length ? (
            <div className="py-20 text-center">
              <FileText className="mx-auto h-10 w-10 text-ink-soft" />
              <h2 className="mt-5 fluid-h3">No published guides yet.</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-soft">
                Published guide files will appear here automatically from Content Studio.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((item) => (
                <GuideCard key={item.id} item={item} onOpen={() => openGuide(item, "grid")} />
              ))}
            </div>
          )}
        </div>
      </section>

      <GuideDownloadDialog guide={selected} onOpenChange={(open) => !open && setSelected(null)} />
      <TechnicalRoadmapCTA source="guides" />
    </SiteLayout>
  );
}

function GuideCard({ item, onOpen }: { item: CmsContentItem; onOpen: () => void }) {
  const services = relatedServiceItems(item);
  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <button type="button" onClick={onOpen} className="group block w-full text-left">
        {item.featured_image ? (
          <img src={item.featured_image} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid aspect-[16/9] place-items-center bg-cream">
            <FileText className="h-10 w-10 text-ink-soft" />
          </div>
        )}
        <div className="p-6 pb-4">
          <p className="eyebrow">{String(item.content_json?.category || "Guide")}</p>
          <h3 className="mt-3 text-xl font-semibold text-ink">{item.title}</h3>
          <p className="mt-3 text-sm text-ink-soft">{item.excerpt}</p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
            Get the guide <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </button>
      {services.length ? (
        <div className="border-t border-black/8 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Related services</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {services.map((service) => (
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
    </article>
  );
}

function GuideDownloadDialog({
  guide,
  onOpenChange,
}: {
  guide: CmsContentItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", honey: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!guide) return;
    setForm({ name: "", email: "", company: "", phone: "", honey: "" });
    setError("");
    setLoading(false);
  }, [guide?.id]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!guide || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await requestResourceDownload({ resource_slug: guide.slug, ...form });
      trackEvent("resource_form_submitted", { slug: guide.slug });
      trackEvent("resource_downloaded", { slug: guide.slug });

      const link = document.createElement("a");
      link.href = result.download_url;
      link.setAttribute("aria-hidden", "true");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the guide. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(guide)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden border-0 bg-white p-0 shadow-2xl">
        {guide?.featured_image ? (
          <img src={guide.featured_image} alt="" className="aspect-[16/7] w-full object-cover" />
        ) : null}
        <div className="p-6 sm:p-8">
          <DialogHeader>
            <p className="eyebrow">Download guide</p>
            <DialogTitle className="mt-2 text-2xl font-bold leading-tight text-ink sm:text-3xl">
              {guide?.title || "Request this guide"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-ink-soft">
              Enter your details below and the guide will download immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Name *
                </span>
                <input
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="form-input"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Email *
                </span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="form-input"
                  placeholder="you@company.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Company name *
                </span>
                <input
                  required
                  autoComplete="organization"
                  value={form.company}
                  onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                  className="form-input"
                  placeholder="Company name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  Phone number <span className="normal-case tracking-normal text-ink-soft/70">(Optional)</span>
                </span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="form-input"
                  placeholder="+1 555 000 0000"
                />
              </label>
            </div>

            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Leave empty
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.honey}
                  onChange={(event) => setForm((current) => ({ ...current, honey: event.target.value }))}
                />
              </label>
            </div>

            {error ? (
              <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {loading ? "Preparing download…" : "Download guide"}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
