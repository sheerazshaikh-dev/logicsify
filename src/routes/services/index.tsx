import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { megaMenu } from "@/lib/site-data";
import { getCmsContentList } from "@/lib/logicsify-api";
import { ArrowRight } from "lucide-react";

import { PublicRouteLoading } from "@/components/public-route-loading";
export const Route = createFileRoute("/services/")({
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async () => {
    const cms = await getCmsContentList("service");
    if (!cms.length) return { serviceGroups: megaMenu };

    const staticBySlug = new Map(
      megaMenu.flatMap((group) =>
        group.items.map((item) => [item.slug, { item, group: group.title }] as const),
      ),
    );
    const grouped = new Map<
      string,
      Array<{ slug: string; name: string; short: string; route: string }>
    >();

    cms.forEach((entry) => {
      const fallback = staticBySlug.get(entry.slug);
      const category = String(entry.content_json?.category || fallback?.group || "More Services");
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category)!.push({
        slug: entry.slug,
        name: entry.title,
        short: entry.excerpt || fallback?.item.short || "Learn more about this Logicsify service.",
        route: `/services/${entry.slug}`,
      });
    });

    return { serviceGroups: [...grouped].map(([title, items]) => ({ title, items })) };
  },
  component: ServicesOverview,
  head: () => ({
    meta: [
      { title: "Services | Logicsify — Design, Development, AI, Growth" },
      {
        name: "description",
        content:
          "Connected digital services for every stage of growth: design, engineering, AI automation, and marketing under one roof.",
      },
      { property: "og:title", content: "Services | Logicsify" },
      {
        property: "og:description",
        content: "Design, engineering, AI, and marketing under one roof.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
});

const groups = [
  { title: "Strategy & Consulting", body: "Product strategy, roadmaps, and architecture reviews." },
  { title: "Design & Experience", body: "UI/UX, brand systems, and marketing design." },
  { title: "Development & Engineering", body: "Websites, web apps, SaaS platforms, and mobile." },
  { title: "AI & Automation", body: "Agents, workflow automation, and integrations." },
  { title: "Marketing & Growth", body: "SEO, paid, content, social, and CRO." },
  { title: "Support & Optimization", body: "Maintenance, monitoring, and continuous improvement." },
];

function ServicesOverview() {
  const { serviceGroups } = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our services"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Services" }]}
        title={
          <>
            Connected digital services for{" "}
            <span className="text-gradient">every stage of growth.</span>
          </>
        }
        intro="From first strategy conversation to long-term optimization — a senior team you can bring in for one capability or the entire journey."
        primaryCta={{ label: "Book a Strategy Call", to: "/book-a-call" }}
        secondaryCta={{ label: "See our work", to: "/work" }}
      />
      <section className="py-24">
        <div className="container-page">
          <div className="grid md:grid-cols-3 gap-5 mb-20">
            {groups.map((group) => (
              <div
                key={group.title}
                data-reveal
                className="rounded-2xl border border-black/10 bg-white p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{group.title}</h3>
                <p className="text-sm text-ink-soft">{group.body}</p>
              </div>
            ))}
          </div>
          {serviceGroups.map((group) => (
            <div key={group.title} className="mb-16">
              <div className="flex items-end justify-between mb-8 border-b border-black/10 pb-4">
                <h2 className="fluid-h3">{group.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((service) => (
                  <Link
                    to={service.route}
                    key={service.slug}
                    className="group rounded-2xl border border-black/10 bg-white p-6 hover:shadow-[0_20px_50px_-20px_rgba(25,10,47,0.2)] transition-all"
                  >
                    <h3 className="text-lg font-semibold group-hover:text-gradient transition">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-sm text-ink-soft">{service.short}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
