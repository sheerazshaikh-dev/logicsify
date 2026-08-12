import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ArrowRight, ExternalLink, Share2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";
import { getCmsContentList, optimizedPublicImageUrl } from "@/lib/logicsify-api";
import { trackEvent } from "@/lib/analytics";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/insights/$slug")({
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    // Use the same CMS list payload as the Insights listing. Besides removing an
    // unnecessary API request, this guarantees the detail page uses the exact
    // featured-image record currently visible in Admin/listing.
    const all = await getCmsContentList("insight", { fresh: true });
    const article = all.find((item) => item.slug === params.slug) || null;
    if (!article) throw notFound();
    return { article, related: all.filter((item) => item.slug !== params.slug).slice(0, 3) };
  },
  staleTime: 0,
  component: InsightPage,
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title:
          loaderData?.article.seo_json?.title ||
          `${loaderData?.article.title || "Insight"} | Logicsify`,
      },
      {
        name: "description",
        content: loaderData?.article.seo_json?.description || loaderData?.article.excerpt || "",
      },
      {
        property: "og:title",
        content: loaderData?.article.seo_json?.title || loaderData?.article.title || "",
      },
      {
        property: "og:description",
        content: loaderData?.article.seo_json?.description || loaderData?.article.excerpt || "",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `https://logicsify.com/insights/${params.slug}` },
      ...(loaderData?.article.seo_json?.og_image || loaderData?.article.featured_image
        ? [
            {
              property: "og:image",
              content: loaderData?.article.seo_json?.og_image || loaderData?.article.featured_image,
            },
            {
              name: "twitter:image",
              content: loaderData?.article.seo_json?.og_image || loaderData?.article.featured_image,
            },
          ]
        : []),
    ],
    links: [
      {
        rel: "canonical",
        href:
          loaderData?.article.seo_json?.canonical ||
          `https://logicsify.com/insights/${params.slug}`,
      },
    ],
    scripts: loaderData?.article
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type":
                String(loaderData.article.content_json?.article_type || "") === "news"
                  ? "NewsArticle"
                  : "BlogPosting",
              headline: loaderData.article.title,
              description: loaderData.article.excerpt,
              datePublished: loaderData.article.published_at,
              dateModified:
                loaderData.article.content_json?.updated_date || loaderData.article.published_at,
              author: {
                "@type": "Person",
                name: String(loaderData.article.content_json?.author || "Logicsify"),
              },
              publisher: {
                "@type": "Organization",
                name: "Logicsify",
                url: "https://logicsify.com",
              },
              mainEntityOfPage: `https://logicsify.com/insights/${params.slug}`,
            }),
          },
        ]
      : [],
  }),
});

function relatedServicePath(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/services/")) return raw;
  if (raw.startsWith("services/")) return `/${raw}`;
  return `/services/${raw.replace(/^\/+|\/+$/g, "")}`;
}

function InsightPage() {
  const { article, related } = Route.useLoaderData();
  const c = article.content_json || {};
  const processed = useMemo(() => processBody(String(c.body || "")), [c.body]);
  const sources = sourceLinks(c.sources, c.source_name, c.source_url);
  // Version the rendered asset with the CMS record timestamp. This forces the
  // browser/CDN to request the new file immediately when an editor changes or
  // replaces an Insight featured image, even when the stored path is reused.
  const featuredImage = optimizedPublicImageUrl(
    article.featured_image,
    1600,
    article.updated_at || article.published_at || String(article.id),
  );
  useEffect(() => trackEvent("insight_opened", { slug: article.slug }), [article.slug]);
  async function share() {
    trackEvent("insight_share_clicked", { slug: article.slug });
    const url = window.location.href;
    if (navigator.share)
      await navigator.share({ title: article.title, text: article.excerpt || "", url });
    else await navigator.clipboard.writeText(url);
  }
  return (
    <SiteLayout>
      <PageHero
        eyebrow={String(c.category || "Insight")}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Insights", to: "/insights" },
          { label: article.title },
        ]}
        title={article.title}
        intro={article.excerpt}
        primaryCta={{ label: "Get a Free Technical Roadmap", to: "/technical-roadmap" }}
      />
      <section className="py-14">
        <div className="container-page">
          <div className="flex flex-wrap items-center gap-4 border-b border-black/10 pb-6 text-sm text-ink-soft">
            <span>
              <strong className="text-ink">{String(c.author || "Logicsify")}</strong>
              {c.author_role ? ` · ${String(c.author_role)}` : ""}
            </span>
            {article.published_at ? (
              <span>
                Published {new Date(article.published_at.replace(" ", "T")).toLocaleDateString()}
              </span>
            ) : null}
            {c.updated_date ? <span>Updated {String(c.updated_date)}</span> : null}
            <span>{String(c.reading_time || "Reading time not set")}</span>
            <button
              onClick={share}
              className="ml-auto inline-flex items-center gap-2 font-semibold text-ink"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </section>
      {featuredImage ? (
        <div className="container-page">
          <img
            key={featuredImage}
            src={featuredImage}
            alt={String(c.featured_image_alt || article.title)}
            className="max-h-[680px] w-full rounded-3xl object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      ) : null}
      <section className="py-16">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <details className="rounded-2xl border border-black/10 p-5 lg:hidden">
              <summary className="cursor-pointer font-semibold">Table of contents</summary>
              <Toc items={processed.toc} />
            </details>
            <div className="hidden lg:block lg:sticky lg:top-28">
              <p className="eyebrow">Table of contents</p>
              <Toc items={processed.toc} />
            </div>
          </aside>
          <article
            className="public-prose min-w-0 lg:col-span-7"
            dangerouslySetInnerHTML={{ __html: processed.html }}
          />
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 space-y-4">
              {c.related_service ? (
                <Link
                  to={relatedServicePath(c.related_service)}
                  className="block rounded-2xl bg-cream p-5"
                >
                  <p className="eyebrow">Related service</p>
                  <p className="mt-2 font-semibold">Explore the relevant service</p>
                </Link>
              ) : null}
              {sources.length ? (
                <section className="rounded-2xl border border-black/10 p-5">
                  <p className="eyebrow">Sources</p>
                  <div className="mt-3 space-y-3">
                    {sources.map((source, index) => (
                      <a
                        key={`${source.url}-${index}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start justify-between gap-2 text-sm font-semibold hover:text-brand-red"
                      >
                        <span>{source.name}</span>
                        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
      {related.length ? (
        <section className="bg-cream py-20">
          <div className="container-page">
            <h2 className="fluid-h3">Related insights</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to="/insights/$slug"
                  params={{ slug: item.slug }}
                  className="rounded-2xl bg-white p-6"
                >
                  <p className="eyebrow">{String(item.content_json?.category || "Insight")}</p>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                    Read <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <TechnicalRoadmapCTA source={`insight:${article.slug}`} />
    </SiteLayout>
  );
}
function Toc({ items }: { items: Array<{ id: string; text: string; level: number }> }) {
  return (
    <nav className="mt-4">
      <ul className="space-y-2 text-sm text-ink-soft">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
            <a href={`#${item.id}`} className="hover:text-ink">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
function processBody(html: string) {
  const toc: Array<{ id: string; text: string; level: number }> = [];
  let index = 0;
  const processed = html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (_full, level, attrs, inner) => {
    const text = String(inner)
      .replace(/<[^>]+>/g, "")
      .trim();
    const id = slugify(text) || `section-${++index}`;
    toc.push({ id, text, level: Number(level) });
    const cleanAttrs = String(attrs).replace(/\sid=["'][^"']*["']/i, "");
    return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
  });
  return { html: processed, toc };
}
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function sourceLinks(value: unknown, legacyName: unknown, legacyUrl: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => ({
        name: String(item.name || item.label || "Source"),
        url: String(item.url || ""),
      }))
      .filter((item) => /^https?:\/\//i.test(item.url));
  }
  return legacyUrl && /^https?:\/\//i.test(String(legacyUrl))
    ? [{ name: String(legacyName || "Source"), url: String(legacyUrl) }]
    : [];
}
