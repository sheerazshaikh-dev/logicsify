export type ServiceItem = {
  slug: string;
  name: string;
  short: string;
  route: string;
  tier: "core" | "subservice" | "other";
  parentSlug?: string;
  hash?: string;
};

export type ServiceGroup = {
  title: string;
  items: ServiceItem[];
};

export type CoreServiceDefinition = ServiceItem & {
  positioning: string;
  subservices: ServiceItem[];
};

function subservice(
  parentSlug: string,
  slug: string,
  name: string,
  short: string,
): ServiceItem {
  return {
    parentSlug,
    slug,
    name,
    short,
    route: `/services/${slug}`,
    tier: "subservice",
  };
}

export const coreServiceDefinitions: CoreServiceDefinition[] = [
  {
    slug: "ai-automation-voice-agents",
    name: "AI Automation & Voice Agents",
    short: "Automate conversations, follow-ups, and repetitive business processes with practical AI systems.",
    positioning:
      "AI systems that respond, qualify, book, follow up, process documents, and keep human teams in control.",
    route: "/services/ai-automation-voice-agents",
    tier: "core",
    subservices: [
      subservice("ai-automation-voice-agents", "ai-calling-agents", "AI Calling Agents", "Inbound and outbound voice agents with qualification, routing, logging, and human-transfer rules."),
      subservice("ai-automation-voice-agents", "appointment-booking-agents", "Appointment-Booking Agents", "Voice and chat booking flows connected to calendars, availability, reminders, and CRM records."),
      subservice("ai-automation-voice-agents", "lead-qualification-agents", "Lead Qualification Agents", "Consistent lead intake, scoring, prioritization, pipeline assignment, and next-action recommendations."),
      subservice("ai-automation-voice-agents", "ai-support-chatbots", "AI Customer Support Chatbots", "Controlled support assistants grounded in approved service, policy, and process information."),
      subservice("ai-automation-voice-agents", "automated-lead-follow-up", "Automated Lead Follow-Up", "Email, WhatsApp, SMS, and task sequences triggered by lead behavior and pipeline status."),
      subservice("ai-automation-voice-agents", "messaging-calendar-automation", "Messaging & Calendar Automation", "Connected CRM, email, WhatsApp, SMS, calendar, reminder, and escalation workflows."),
      subservice("ai-automation-voice-agents", "document-extraction-processing", "Document Extraction & Processing", "Structured extraction, validation, routing, notifications, and approval workflows for business documents."),
      subservice("ai-automation-voice-agents", "internal-workflow-automation", "Internal Workflow Automation", "Reduce repetitive handoffs, copying, status checks, alerts, approvals, and reporting work."),
      subservice("ai-automation-voice-agents", "custom-ai-integrations", "Custom AI Integrations", "Connect approved AI models and services to existing products, portals, data, and operating systems."),
    ],
  },
  {
    slug: "crm-revenue-operations",
    name: "CRM & Revenue Operations",
    short: "We build systems that capture, organize, follow up with, and convert every lead.",
    positioning:
      "Lead management and sales operations built around clear ownership, consistent follow-up, and reliable reporting.",
    route: "/services/crm-revenue-operations",
    tier: "core",
    subservices: [
      subservice("crm-revenue-operations", "gohighlevel-implementation", "GoHighLevel Implementation", "Pipelines, calendars, forms, conversations, automations, permissions, reporting, and operating standards."),
      subservice("crm-revenue-operations", "hubspot-implementation", "HubSpot Implementation", "CRM architecture, lifecycle stages, properties, pipelines, automation, reporting, and adoption planning."),
      subservice("crm-revenue-operations", "custom-crm-development", "Custom CRM Development", "Purpose-built CRM interfaces and data models for workflows that do not fit configurable platforms."),
      subservice("crm-revenue-operations", "sales-pipeline-lead-routing", "Sales Pipeline & Lead Routing", "Ownership rules, qualification stages, distribution logic, SLAs, notifications, and exception handling."),
      subservice("crm-revenue-operations", "crm-follow-up-automation", "CRM Follow-Up Automation", "Email, SMS, WhatsApp, task, reminder, and reactivation sequences tied to real pipeline conditions."),
      subservice("crm-revenue-operations", "crm-appointment-scheduling", "Appointment Scheduling", "Availability, assignment, booking, reminders, rescheduling, no-show, and post-appointment workflows."),
      subservice("crm-revenue-operations", "revenue-reporting-dashboards", "Revenue Reporting Dashboards", "Pipeline, source, response, booking, conversion, ownership, and revenue views built for action."),
      subservice("crm-revenue-operations", "crm-payment-api-integrations", "Payment & API Integrations", "Connect CRM activity with payments, invoicing, telephony, forms, data platforms, and internal APIs."),
      subservice("crm-revenue-operations", "crm-migration-optimization", "CRM Migration & Optimization", "Audit, cleanup, mapping, migration, validation, cutover, workflow repair, and team adoption."),
    ],
  },
  {
    slug: "custom-websites-portals-cms",
    name: "Custom Websites, Portals & CMS Platforms",
    short: "Websites and platforms connected directly to sales, operations, payments, and customer workflows.",
    positioning:
      "Digital platforms that do more than present information: they capture intent, support users, and connect business operations.",
    route: "/services/custom-websites-portals-cms",
    tier: "core",
    subservices: [
      subservice("custom-websites-portals-cms", "conversion-focused-business-websites", "Conversion-Focused Business Websites", "Fast, clear business websites connected to forms, CRM, analytics, booking, and measurable actions."),
      subservice("custom-websites-portals-cms", "custom-cms-platforms", "Custom CMS Platforms", "Structured content systems with tailored editing, permissions, reusable sections, media, SEO, and publishing workflows."),
      subservice("custom-websites-portals-cms", "wordpress-modernization", "WordPress Modernization", "Modernize design, performance, editing, integrations, security ownership, and content architecture."),
      subservice("custom-websites-portals-cms", "customer-employee-portals", "Customer & Employee Portals", "Secure self-service experiences for customers, employees, documents, requests, status, and communication."),
      subservice("custom-websites-portals-cms", "membership-booking-platforms", "Membership & Booking Platforms", "Accounts, access, scheduling, subscriptions, reminders, content, and operational administration."),
      subservice("custom-websites-portals-cms", "ecommerce-platforms", "E-commerce Platforms", "Storefront, catalog, checkout, payment, customer, inventory, analytics, and lifecycle integrations."),
      subservice("custom-websites-portals-cms", "custom-dashboards-admin-panels", "Custom Dashboards & Admin Panels", "Role-based internal interfaces for content, users, reporting, workflows, approvals, and operations."),
      subservice("custom-websites-portals-cms", "website-api-payment-integrations", "API & Payment Integrations", "Connect websites and portals to payment systems, CRM, communications, data, and internal platforms."),
    ],
  },
];

export const coreServices: ServiceItem[] = coreServiceDefinitions.map(
  ({ subservices: _subservices, positioning: _positioning, ...service }) => service,
);

export const coreSubservices: ServiceItem[] = coreServiceDefinitions.flatMap(
  (service) => service.subservices,
);

export function getCoreServiceDefinition(slug: string) {
  return coreServiceDefinitions.find((service) => service.slug === slug);
}

export function getSubservicesForCore(slug: string) {
  return getCoreServiceDefinition(slug)?.subservices || [];
}

export function getParentCoreService(slug: string) {
  const child = coreSubservices.find((service) => service.slug === slug);
  return child?.parentSlug ? getCoreServiceDefinition(child.parentSlug) : undefined;
}

export const otherServices: ServiceItem[] = [
  { slug: "mobile-app-development", name: "Mobile App Development", short: "Customer and internal mobile applications built around clear workflows.", route: "/services/mobile-app-development", tier: "other" },
  { slug: "ui-ux-design", name: "UI/UX Design", short: "Research, user flows, prototypes, and consistent interface systems.", route: "/services/ui-ux-design", tier: "other" },
  { slug: "seo-digital-marketing", name: "SEO & Digital Marketing", short: "Search, paid media, social, content, and conversion programs tied to measurable demand.", route: "/services/seo-digital-marketing", tier: "other" },
  { slug: "branding", name: "Branding & Graphic Design", short: "Identity, campaign, presentation, and product design systems.", route: "/services/branding", tier: "other" },
  { slug: "ecommerce-development", name: "E-commerce Development", short: "Storefronts, payments, inventory, analytics, and customer lifecycle integrations.", route: "/services/ecommerce-development", tier: "other" },
  { slug: "cloud-deployment", name: "Cloud Deployment", short: "Production hosting, deployment pipelines, monitoring, and environment management.", route: "/services/cloud-maintenance", hash: "cloud-deployment", tier: "other" },
  { slug: "website-maintenance", name: "Website Maintenance", short: "Security updates, performance monitoring, fixes, and ongoing improvements.", route: "/services/cloud-maintenance", hash: "website-maintenance", tier: "other" },
  { slug: "cybersecurity", name: "Cybersecurity", short: "Practical application, access, dependency, and deployment security reviews.", route: "/services/cloud-maintenance", hash: "cybersecurity", tier: "other" },
  { slug: "staff-augmentation", name: "Staff Augmentation", short: "Additional design and engineering capacity with documented ownership and delivery controls.", route: "/services/cloud-maintenance", hash: "staff-augmentation", tier: "other" },
];

export const megaMenu: ServiceGroup[] = [
  ...coreServiceDefinitions.map((service) => ({
    title: service.name,
    items: [
      { ...service, name: `${service.name} Overview` },
      ...service.subservices,
    ],
  })),
  {
    title: "Other Services",
    items: [
      otherServices.find((item) => item.slug === "mobile-app-development")!,
      otherServices.find((item) => item.slug === "ui-ux-design")!,
      otherServices.find((item) => item.slug === "seo-digital-marketing")!,
      otherServices.find((item) => item.slug === "branding")!,
      { slug: "cloud-maintenance", name: "Cloud & Maintenance", short: "Deployment, security, maintenance, and delivery support.", route: "/services/cloud-maintenance", tier: "other" },
    ],
  },
];

export const allServices: ServiceItem[] = [
  ...coreServices,
  ...coreSubservices,
  ...otherServices,
  { slug: "cloud-maintenance", name: "Cloud & Maintenance", short: "Deployment, security, maintenance, and delivery support.", route: "/services/cloud-maintenance", tier: "other" },
];

export const legacyServiceRedirects: Record<string, string> = {
  "ai-automations": "/services/ai-automation-voice-agents",
  "ai-agents": "/services/ai-calling-agents",
  "crm-automation": "/services/crm-revenue-operations",
  "api-integrations": "/services/crm-payment-api-integrations",
  "web-design-development": "/services/conversion-focused-business-websites",
  "web-applications": "/services/custom-dashboards-admin-panels",
  "saas-development": "/services/custom-websites-portals-cms",
  ecommerce: "/services/ecommerce-platforms",
  "mobile-apps": "/services/mobile-app-development",
  "ui-ux": "/services/ui-ux-design",
  seo: "/services/seo-digital-marketing",
  "paid-advertising": "/services/seo-digital-marketing",
  "social-media": "/services/seo-digital-marketing",
  "content-marketing": "/services/seo-digital-marketing",
  cro: "/services/seo-digital-marketing",
  maintenance: "/services/cloud-maintenance",
};

export const industryRedirects: Record<string, string> = {
  "saas-startups": "/services/custom-websites-portals-cms",
  "startups-saas": "/services/custom-websites-portals-cms",
  "home-services": "/services/crm-revenue-operations",
  healthcare: "/services/custom-websites-portals-cms",
  ecommerce: "/services/ecommerce-platforms",
  agencies: "/services/custom-websites-portals-cms",
};

export const caseStudies: Array<{ slug: string; name: string; client: string; category: string; services: string[]; challenge: string; outcome: string; tags: string[] }> = [];
export const insights: Array<{ slug: string; category: string; title: string; excerpt: string; date: string; read: string }> = [];
