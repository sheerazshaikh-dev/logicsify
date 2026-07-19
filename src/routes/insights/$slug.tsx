import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { insights } from "@/lib/site-data";
import { getCmsContentItem, getCmsContentList } from "@/lib/logicsify-api";
import { asRecord, asRecordArray } from "@/lib/content-utils";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/insights/$slug")({
  component: PostPage,
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    const [cms, cmsPosts] = await Promise.all([
      getCmsContentItem("insight", params.slug),
      getCmsContentList("insight"),
    ]);
    const fallback = insights.find((item) => item.slug === params.slug);
    if (!cms && !fallback) throw notFound();

    const content = asRecord(cms?.content_json);
    const sections = asRecordArray(content.sections);
    const bodyText = String(content.body || "").trim();
    const paragraphs = bodyText
      ? bodyText
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
      : sections.length
        ? sections
            .flatMap((section) => [String(section.title || ""), String(section.body || "")])
            .filter(Boolean)
        : bodies[params.slug] || [];
    const published = cms?.published_at
      ? new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
          new Date(cms.published_at),
        )
      : fallback?.date || "";
    const post = {
      slug: params.slug,
      category: String(content.category || fallback?.category || "Insights"),
      title: cms?.title || fallback?.title || "Insight",
      excerpt: cms?.excerpt || fallback?.excerpt || "",
      date: published,
      read: String(
        content.read_time ||
          fallback?.read ||
          `${Math.max(3, Math.ceil(paragraphs.join(" ").split(/\s+/).length / 200))} min read`,
      ),
      paragraphs,
    };

    const related = cmsPosts.length
      ? cmsPosts
          .filter((item) => item.slug !== params.slug)
          .slice(0, 3)
          .map((item) => ({
            slug: item.slug,
            category: String(item.content_json?.category || "Insights"),
            title: item.title,
            excerpt: item.excerpt || "",
          }))
      : insights.filter((item) => item.slug !== params.slug).slice(0, 3);

    return { post, related };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.post.title || "Insight"} | Logicsify Insights` },
      { name: "description", content: loaderData?.post.excerpt ?? "" },
      { property: "og:type", content: "article" },
      { property: "og:title", content: loaderData?.post.title ?? "" },
      { property: "og:url", content: `/insights/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/insights/${params.slug}` }],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-40 text-center">
        <h1 className="fluid-h2">Post not found</h1>
      </div>
    </SiteLayout>
  ),
});

const bodies: Record<string, string[]> = {
  "where-ai-automation-creates-value": [
    "Most companies exploring AI start with the wrong question — ‘what can this model do?’ rather than ‘where does our business bleed time?’",
    "The highest-ROI AI work isn't chat interfaces. It's the boring plumbing: lead qualification, routing, follow-up cadences, document extraction, reporting, and internal knowledge retrieval.",
    "These systems remove hours a week per person, don't require the model to be perfect, and produce data you can point at.",
  ],
  "website-vs-web-app-vs-saas": [
    "A website, a web application, and a SaaS product are three very different investments — and confusing them is one of the most expensive mistakes founders make.",
    "A website is content, positioning, and conversion. A web application is internal software. A SaaS product is a company — multi-tenant, priced, sold, and supported.",
    "The right first step depends on which of the three actually blocks your growth.",
  ],
  "connect-marketing-data-with-operations": [
    "Marketing and operations usually live in different data models. Marketing thinks in leads, sessions, and campaigns. Operations thinks in accounts, tickets, and revenue events.",
    "When those two models don't share a language, marketing optimizes for metrics that don't matter to the business.",
    "The fix is straightforward: agree on the object model, unify identity, pipe events into one warehouse, and build the reports both teams open.",
  ],
};

function PostPage() {
  const { post, related } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero
        eyebrow={`${post.category} · ${post.read}`}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Insights", to: "/insights" },
          { label: post.title },
        ]}
        title={<>{post.title}</>}
        intro={post.excerpt}
      />
      <article className="py-20">
        <div className="container-page max-w-3xl mx-auto space-y-6 text-lg text-ink leading-relaxed">
          {post.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {post.date ? <p className="text-ink-soft italic">Published {post.date}.</p> : null}
        </div>
      </article>
      <section className="py-20 bg-cream">
        <div className="container-page">
          <p className="eyebrow mb-4">Keep reading</p>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map((item) => (
              <Link
                to="/insights/$slug"
                params={{ slug: item.slug }}
                key={item.slug}
                className="group rounded-2xl bg-white p-6 border border-black/5 hover:-translate-y-1 transition-all"
              >
                <p className="eyebrow mb-3">{item.category}</p>
                <h3 className="text-lg font-semibold group-hover:text-gradient transition">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
