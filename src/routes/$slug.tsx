import { createFileRoute, notFound, Link, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { getCmsContentItem } from "@/lib/logicsify-api";
import { ArrowRight } from "lucide-react";
import { asRecord, asRecordArray, safeString } from "@/lib/content-utils";
import { legacyCollectionPath } from "@/lib/content-routes";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/$slug")({
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    const page = await getCmsContentItem("page", params.slug);
    if (!page) {
      const legacyPath = legacyCollectionPath(params.slug);
      if (legacyPath) throw redirect({ href: legacyPath, statusCode: 301 });
      throw notFound();
    }
    if (
      [
        "home",
        "about",
        "services",
        "industries",
        "work",
        "process",
        "technology",
        "insights",
        "careers",
        "contact",
        "book-a-call",
        "privacy",
        "terms",
      ].includes(params.slug)
    ) {
      throw notFound();
    }
    return { page };
  },
  component: CmsPage,
  head: ({ loaderData, params }) => {
    const page = loaderData?.page;
    return {
      meta: [
        { title: page?.seo_json?.title || `${page?.title || "Page"} | Logicsify` },
        { name: "description", content: page?.seo_json?.description || page?.excerpt || "" },
        { property: "og:url", content: `/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: page?.seo_json?.canonical || `/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-40 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="fluid-h2">Page not found</h1>
        <Link to="/" className="btn-primary mt-8">
          Go to homepage
        </Link>
      </div>
    </SiteLayout>
  ),
});

function CmsPage() {
  const { page } = Route.useLoaderData();
  const content = asRecord(page.content_json);
  const sections = asRecordArray(content.sections);
  const body = safeString(content.body);

  return (
    <SiteLayout>
      <PageHero
        eyebrow={String(content.category || "Logicsify")}
        breadcrumbs={[{ label: "Home", to: "/" }, { label: page.title }]}
        title={<>{page.title}</>}
        intro={page.excerpt || undefined}
      />

      {body && (
        <section className="py-20">
          <div className="container-page max-w-4xl mx-auto whitespace-pre-wrap text-lg text-ink-soft leading-relaxed">
            {body}
          </div>
        </section>
      )}

      {sections.map((section, index) => {
        const eyebrow = safeString(section.eyebrow);
        const title = safeString(section.title);
        const sectionBody = safeString(section.body);
        const buttonLabel = safeString(section.button_label);
        const buttonUrl = safeString(section.button_url);
        const image = safeString(section.image);

        return (
          <section
            key={`${title || "section"}-${index}`}
            className={index % 2 ? "py-20 bg-cream" : "py-20"}
          >
            <div className="container-page grid lg:grid-cols-12 gap-10 items-center">
              <div className={image ? "lg:col-span-7" : "lg:col-span-9"}>
                {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
                {title && <h2 className="fluid-h2">{title}</h2>}
                {sectionBody && (
                  <p className="mt-5 text-lg text-ink-soft leading-relaxed whitespace-pre-wrap">
                    {sectionBody}
                  </p>
                )}
                {buttonLabel && buttonUrl && (
                  <a href={buttonUrl} className="btn-primary mt-7">
                    {buttonLabel} <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
              {image && (
                <div className="lg:col-span-5">
                  <img
                    src={image}
                    alt={title || page.title}
                    className="w-full rounded-3xl border border-black/10 shadow-[0_30px_80px_-30px_rgba(25,10,47,0.3)]"
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}

      <CTASection />
    </SiteLayout>
  );
}
