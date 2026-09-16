import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ServicePageTemplate, type ServicePageData } from "@/components/service-page-template";
import { serviceData } from "@/lib/service-data";
import { allServices, getParentCoreService, legacyServiceRedirects } from "@/lib/site-data";

export const Route = createFileRoute("/services/$slug")({
  component: ServicePage,
  loader: ({ params }) => {
    const legacyDestination = legacyServiceRedirects[params.slug];
    if (legacyDestination) throw redirect({ href: legacyDestination, statusCode: 301 });

    const staticService = allServices.find((item) => item.slug === params.slug);
    const data =
      serviceData[params.slug] ||
      (staticService
        ? genericServiceData(staticService.slug, staticService.name, staticService.short)
        : undefined);

    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData, params }) => {
    const data = loaderData?.data;
    const name = data?.name ?? "Service";
    const title = data?.seoTitle || `${name} | Logicsify`;
    const description = data?.metaDescription || data?.heroIntro || "Logicsify services";
    const canonical = `https://logicsify.com/services/${params.slug}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name,
            description,
            provider: { "@id": "https://logicsify.com/#organization" },
            url: canonical,
          }),
        },
      ],
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
      {
        n: "05",
        title: "Launch",
        body: "Release, measure, document, and continue improving.",
      },
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

function ServicePage() {
  const { data } = Route.useLoaderData();
  return (
    <SiteLayout>
      <ServicePageTemplate data={data} />
    </SiteLayout>
  );
}
