export type ServiceItem = {
  slug: string;
  name: string;
  short: string;
  route: string;
  tier: "core" | "other";
  hash?: string;
};

export type ServiceGroup = {
  title: string;
  items: ServiceItem[];
};

export const coreServices: ServiceItem[] = [
  {
    slug: "ai-automation-voice-agents",
    name: "AI Automation & Voice Agents",
    short: "Automate conversations, follow-ups, and repetitive business processes with practical AI systems.",
    route: "/services/ai-automation-voice-agents",
    tier: "core",
  },
  {
    slug: "crm-revenue-operations",
    name: "CRM & Revenue Operations",
    short: "We build systems that capture, organize, follow up with, and convert every lead.",
    route: "/services/crm-revenue-operations",
    tier: "core",
  },
  {
    slug: "custom-websites-portals-cms",
    name: "Custom Websites, Portals & CMS Platforms",
    short: "Websites and platforms connected directly to sales, operations, payments, and customer workflows.",
    route: "/services/custom-websites-portals-cms",
    tier: "core",
  },
];

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
  { title: "Core Services", items: coreServices },
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
  ...otherServices,
  { slug: "cloud-maintenance", name: "Cloud & Maintenance", short: "Deployment, security, maintenance, and delivery support.", route: "/services/cloud-maintenance", tier: "other" },
];

export const legacyServiceRedirects: Record<string, string> = {
  "ai-automations": "/services/ai-automation-voice-agents",
  "ai-agents": "/services/ai-automation-voice-agents",
  "crm-automation": "/services/crm-revenue-operations",
  "api-integrations": "/services/crm-revenue-operations",
  "web-design-development": "/services/custom-websites-portals-cms",
  "web-applications": "/services/custom-websites-portals-cms",
  "saas-development": "/services/custom-websites-portals-cms",
  ecommerce: "/services/custom-websites-portals-cms",
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
  ecommerce: "/services/custom-websites-portals-cms",
  agencies: "/services/custom-websites-portals-cms",
};

export const caseStudies: Array<{ slug: string; name: string; client: string; category: string; services: string[]; challenge: string; outcome: string; tags: string[] }> = [];
export const insights: Array<{ slug: string; category: string; title: string; excerpt: string; date: string; read: string }> = [];
