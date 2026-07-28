import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ServicePageTemplate, type ServicePageData } from "@/components/service-page-template";
import { serviceData } from "@/lib/service-data";
import { allServices } from "@/lib/site-data";
import { getCmsContentItem } from "@/lib/logicsify-api";
import { asRecord, asRecordArray } from "@/lib/content-utils";
import { PublicRouteLoading } from "@/components/public-route-loading";

export const Route = createFileRoute("/services/$slug")({
  component: ServicePage,
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    const cms = await getCmsContentItem("service", params.slug);
    const staticService = allServices.find((item) => item.slug === params.slug);
    const fallback =
      serviceData[params.slug] ||
      (staticService
        ? genericServiceData(staticService.slug, staticService.name, staticService.short)
        : undefined);
    if (!cms && !fallback) throw notFound();
    return { data: mergeServiceData(params.slug, cms, fallback), cms };
  },
  head: ({ loaderData, params }) => {
    const data = loaderData?.data;
    const cms = loaderData?.cms;
    const name = data?.name ?? "Service";
    const title = cms?.seo_json?.title || `${name} | Logicsify`;
    const description = cms?.seo_json?.description || data?.heroIntro || "Logicsify services";
    const image = cms?.seo_json?.og_image || cms?.featured_image;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: cms?.seo_json?.noindex ? "noindex,nofollow" : "index,follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://logicsify.com/services/${params.slug}` },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: cms?.seo_json?.canonical || `https://logicsify.com/services/${params.slug}` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name, description, provider: { "@id": "https://logicsify.com/#organization" }, url: `https://logicsify.com/services/${params.slug}` }) }],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-40 text-center">
        <h1 className="fluid-h2">Service not found</h1>
      </div>
    </SiteLayout>
  ),
});

function genericServiceData(slug: string, name: string, intro: string): ServicePageData {
  return {
    slug,
    name,
    heroTitle: { prefix: name },
    heroIntro: intro,
    valueProp:
      "Logicsify combines senior strategy, design, engineering, automation, and growth expertise into one accountable delivery team.",
    problems: [
      "Disconnected tools and unclear ownership",
      "Manual work that slows the team down",
      "Digital experiences that are difficult to improve",
    ],
    capabilities: [
      {
        title: "Strategy and planning",
        body: "A practical roadmap tied to business goals, users, and measurable outcomes.",
      },
      {
        title: "Design and implementation",
        body: "Senior specialists deliver the experience and systems required to launch confidently.",
      },
      {
        title: "Optimization and support",
        body: "Analytics, iteration, maintenance, and growth support after launch.",
      },
    ],
    workflow: ["Discover", "Plan", "Design", "Build", "Launch", "Improve"],
    process: [
      {
        n: "01",
        title: "Discover",
        body: "Align on goals, users, constraints, and success metrics.",
      },
      {
        n: "02",
        title: "Plan",
        body: "Define scope, architecture, milestones, and responsibilities.",
      },
      {
        n: "03",
        title: "Design",
        body: "Create and validate the user experience before implementation.",
      },
      {
        n: "04",
        title: "Build",
        body: "Deliver in visible, testable iterations with quality checks throughout.",
      },
      { n: "05", title: "Launch", body: "Release, measure, document, and continue improving." },
    ],
    technologies: [
      "Modern web stack",
      "APIs and integrations",
      "Cloud infrastructure",
      "Analytics",
    ],
    faqs: [
      {
        q: "How do we get started?",
        a: "Start with a strategy call so we can understand the outcome, scope, and fastest path forward.",
      },
      {
        q: "Will we own the work?",
        a: "Yes. Your business owns the approved deliverables and project code produced for the engagement.",
      },
    ],
    related: allServices
      .filter((item) => item.slug !== slug)
      .slice(0, 3)
      .map((item) => item.slug),
  };
}

function mergeServiceData(
  slug: string,
  cms: Awaited<ReturnType<typeof getCmsContentItem>>,
  fallback?: ServicePageData,
): ServicePageData {
  const content = asRecord(cms?.content_json);
  const sections = asRecordArray(content.sections);
  const stringArray = (value: unknown, defaultValue: string[]) =>
    Array.isArray(value) ? value.map(String).filter(Boolean) : defaultValue;
  const objectArray = (value: unknown, defaultValue: { title: string; body: string }[]) => {
    if (!Array.isArray(value)) return defaultValue;
    const mapped = value
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const item = entry as Record<string, unknown>;
        return { title: String(item.title || ""), body: String(item.body || "") };
      })
      .filter((entry): entry is { title: string; body: string } =>
        Boolean(entry?.title || entry?.body),
      );
    return mapped.length ? mapped : defaultValue;
  };

  const defaultData: ServicePageData = fallback || {
    slug,
    name: cms?.title || "Service",
    heroTitle: { prefix: cms?.title || "Service" },
    heroIntro:
      cms?.excerpt || "A connected Logicsify service designed around measurable business outcomes.",
    valueProp:
      "We combine strategy, design, engineering, automation, and growth expertise in one accountable delivery team.",
    problems: ["Disconnected systems", "Manual processes", "Slow delivery"],
    capabilities: [
      {
        title: "End-to-end delivery",
        body: "Planning, implementation, launch, and ongoing improvement.",
      },
    ],
    workflow: ["Discover", "Plan", "Design", "Build", "Launch", "Improve"],
    process: [
      { n: "01", title: "Discover", body: "Align on goals and constraints." },
      { n: "02", title: "Plan", body: "Define scope and milestones." },
      { n: "03", title: "Build", body: "Deliver in visible iterations." },
      { n: "04", title: "Launch", body: "Release with confidence." },
      { n: "05", title: "Scale", body: "Measure and improve." },
    ],
    technologies: ["Modern web stack", "APIs", "Cloud infrastructure"],
    faqs: [
      {
        q: "How do we get started?",
        a: "Start with a strategy call so we can understand the outcome, scope, and fastest path forward.",
      },
    ],
    related: [],
  };

  const processRaw = asRecordArray(content.process);
  const process = processRaw.length
    ? processRaw.map((item, index) => {
        return {
          n: String(item.n || String(index + 1).padStart(2, "0")),
          title: String(item.title || `Step ${index + 1}`),
          body: String(item.body || ""),
        };
      })
    : defaultData.process;

  const faqsRaw = asRecordArray(content.faqs);
  const faqs = faqsRaw.length
    ? faqsRaw.map((item) => {
        return {
          q: String(item.q || item.question || "Question"),
          a: String(item.a || item.answer || ""),
        };
      })
    : defaultData.faqs;

  const cmsCapabilities = objectArray(content.capabilities, []);
  const sectionCapabilities = sections
    .map((section) => ({ title: String(section.title || ""), body: String(section.body || "") }))
    .filter((section) => section.title || section.body);

  return {
    ...defaultData,
    slug,
    name: cms?.title || defaultData.name,
    heroTitle: { prefix: cms?.title || defaultData.name },
    heroIntro: cms?.excerpt || defaultData.heroIntro,
    valueProp: String(content.body || defaultData.valueProp),
    problems: stringArray(content.problems, defaultData.problems),
    capabilities: cmsCapabilities.length
      ? cmsCapabilities
      : sectionCapabilities.length
        ? sectionCapabilities
        : defaultData.capabilities,
    workflow: stringArray(content.workflow, defaultData.workflow),
    process,
    technologies: stringArray(content.technologies, defaultData.technologies),
    faqs,
    related: stringArray(content.related, defaultData.related),
  };
}

function ServicePage() {
  const { data } = Route.useLoaderData();
  return (
    <SiteLayout>
      <ServicePageTemplate data={data} />
    </SiteLayout>
  );
}
