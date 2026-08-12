import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ServicePageTemplate, type ServicePageData } from "@/components/service-page-template";
import { serviceData } from "@/lib/service-data";
import { allServices, getParentCoreService, legacyServiceRedirects } from "@/lib/site-data";
import { getCmsContentItem, getRelatedContent } from "@/lib/logicsify-api";
import { asRecord, asRecordArray } from "@/lib/content-utils";
import { PublicRouteLoading } from "@/components/public-route-loading";
import { RelatedContentSections } from "@/components/related-content-sections";

export const Route = createFileRoute("/services/$slug")({
  component: ServicePage,
  pendingMs: 150,
  pendingMinMs: 250,
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    const legacyDestination = legacyServiceRedirects[params.slug];
    if (legacyDestination) throw redirect({ href: legacyDestination, statusCode: 301 });
    const [cms, relatedContent] = await Promise.all([
      getCmsContentItem("service", params.slug),
      getRelatedContent("service", params.slug),
    ]);
    const staticService = allServices.find((item) => item.slug === params.slug);
    const fallback =
      serviceData[params.slug] ||
      (staticService
        ? genericServiceData(staticService.slug, staticService.name, staticService.short)
        : undefined);
    if (!cms && !fallback) throw notFound();
    return { data: mergeServiceData(params.slug, cms, fallback), cms, relatedContent };
  },
  head: ({ loaderData, params }) => {
    const data = loaderData?.data;
    const cms = loaderData?.cms;
    const name = data?.name ?? "Service";
    const title = cms?.seo_json?.title || data?.seoTitle || `${name} | Logicsify`;
    const description = cms?.seo_json?.description || data?.metaDescription || data?.heroIntro || "Logicsify services";
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
  const parent = getParentCoreService(slug);
  const parentContext = parent
    ? `This capability is part of ${parent.name}. It can be scoped independently or combined with adjacent capabilities under one connected implementation.`
    : "Logicsify combines senior strategy, design, engineering, automation, and operating-system expertise into one accountable delivery team.";
  return {
    slug,
    name,
    heroTitle: { prefix: name },
    heroIntro: intro,
    valueProp: `${intro} ${parentContext}`,
    problems: [
      `The current process related to ${name.toLowerCase()} depends on manual work or inconsistent ownership.`,
      "Customer, lead, content, or operational data is split across disconnected systems.",
      "The team cannot reliably measure response, completion, conversion, or failure points.",
    ],
    capabilities: [
      {
        title: "Workflow and requirements mapping",
        body: "Document users, triggers, data, ownership, exceptions, integrations, and measurable outcomes before implementation.",
      },
      {
        title: "Connected implementation",
        body: "Build the interface, automation, integration, permissions, and operational controls required for the agreed workflow.",
      },
      {
        title: "Testing, reporting, and handover",
        body: "Validate normal and failure paths, document ownership, and provide the reporting or monitoring agreed in scope.",
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
    seoTitle: String(content.seo_title || cms?.seo_json?.title || defaultData.seoTitle || ""),
    metaDescription: String(content.meta_description || cms?.seo_json?.description || defaultData.metaDescription || ""),
    primaryKeyword: String(content.primary_keyword || defaultData.primaryKeyword || ""),
    heroTitle: {
      prefix: String(content.hero_title || defaultData.heroTitle.prefix || cms?.title || defaultData.name),
      accent: content.hero_accent ? String(content.hero_accent) : defaultData.heroTitle.accent,
      suffix: content.hero_suffix ? String(content.hero_suffix) : defaultData.heroTitle.suffix,
    },
    heroIntro: String(content.hero_intro || cms?.excerpt || defaultData.heroIntro),
    valueProp: String(content.body || content.value_prop || defaultData.valueProp),
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
    useCases: stringArray(content.use_cases, defaultData.useCases || []),
    audiences: stringArray(content.audiences || content.who_this_is_for, defaultData.audiences || []),
    deliverables: stringArray(content.deliverables || content.core_deliverables, defaultData.deliverables || []),
    scenarios: objectArray(content.scenarios || content.evidence_scenarios, defaultData.scenarios || []),
    measures: stringArray(content.measures || content.what_to_measure, defaultData.measures || []),
    heroSupport: String(content.hero_support || defaultData.heroSupport || ""),
    finalCta: asRecord(content.final_cta).title || asRecord(content.final_cta).body ? { title: String(asRecord(content.final_cta).title || "Connect the workflow before adding more tools."), body: String(asRecord(content.final_cta).body || "") } : defaultData.finalCta,
  };
}

function ServicePage() {
  const { data, relatedContent } = Route.useLoaderData();
  return (
    <SiteLayout>
      <ServicePageTemplate data={data} />
      <RelatedContentSections data={relatedContent} showServices={false} title="Related work, insights, proof and resources" />
    </SiteLayout>
  );
}
