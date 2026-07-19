import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { insights as staticInsights } from "@/lib/site-data";
import { getCmsContentList } from "@/lib/logicsify-api";
import { Zap } from "lucide-react";

import { PublicRouteLoading } from "@/components/public-route-loading";
export const Route = createFileRoute("/insights/")({
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async () => {
    const cms = await getCmsContentList("insight");
    if (!cms.length)
      return {
        insights: staticInsights.map((item) => ({
          ...item,
          image: undefined as string | undefined,
        })),
      };
    return {
      insights: cms.map((entry) => {
        const fallback = staticInsights.find((item) => item.slug === entry.slug);
        return {
          slug: entry.slug,
          category: String(entry.content_json?.category || fallback?.category || "Insights"),
          title: entry.title,
          excerpt: entry.excerpt || fallback?.excerpt || "An insight from the Logicsify team.",
          date: entry.published_at
            ? new Date(entry.published_at.replace(" ", "T")).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : fallback?.date || "Latest",
          read: String(entry.content_json?.read || fallback?.read || "5 min read"),
          image: entry.featured_image,
        };
      }),
    };
  },
  component: InsightsIndex,
  head: () => ({
    meta: [
      { title: "Insights | Logicsify" },
      {
        name: "description",
        content: "Thinking on technology, AI, automation, and digital growth.",
      },
      { property: "og:title", content: "Insights | Logicsify" },
      { property: "og:url", content: "/insights" },
    ],
    links: [{ rel: "canonical", href: "/insights" }],
  }),
});

function InsightsIndex() {
  const { insights } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Insights"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Insights" }]}
        title={
          <>
            Thinking on technology, AI, and <span className="text-gradient">growth.</span>
          </>
        }
        intro="Long-form and short-form writing from our team, focused on where technology, marketing, and operations meet."
      />
      <section className="py-20">
        <div className="container-page grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {insights.map((post) => (
            <Link
              to="/insights/$slug"
              params={{ slug: post.slug }}
              key={post.slug}
              className="group rounded-2xl bg-white border border-black/5 overflow-hidden hover:-translate-y-1 transition-all duration-500"
            >
              <div className="aspect-[16/10] bg-ink relative overflow-hidden">
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 grid-noise opacity-70" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-16 h-16 text-white/20 group-hover:text-brand-gold transition-colors" />
                    </div>
                  </>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-ink-soft mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-lavender text-ink">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                  <span>· {post.read}</span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-gradient transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
