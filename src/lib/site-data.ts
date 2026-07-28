export type ServiceItem = {
  slug: string;
  name: string;
  short: string;
  route: string;
};

export type ServiceGroup = {
  title: string;
  items: ServiceItem[];
};

export const megaMenu: ServiceGroup[] = [
  {
    title: "Design & Development",
    items: [
      {
        slug: "web-design-development",
        name: "Web Design & Development",
        short: "Fast, editorial marketing sites.",
        route: "/services/web-design-development",
      },
      {
        slug: "web-applications",
        name: "Custom Web Applications",
        short: "Business tools built to scale.",
        route: "/services/web-applications",
      },
      {
        slug: "saas-development",
        name: "SaaS Product Development",
        short: "End-to-end platform engineering.",
        route: "/services/saas-development",
      },
      {
        slug: "mobile-apps",
        name: "Mobile App Development",
        short: "iOS, Android, React Native.",
        route: "/services/mobile-apps",
      },
      {
        slug: "ecommerce",
        name: "E-commerce Development",
        short: "Shopify, headless, custom stacks.",
        route: "/services/ecommerce",
      },
      {
        slug: "ui-ux",
        name: "UI/UX & Product Design",
        short: "Research-led interface systems.",
        route: "/services/ui-ux",
      },
    ],
  },
  {
    title: "AI & Automation",
    items: [
      {
        slug: "ai-automations",
        name: "AI Automations",
        short: "Practical automation with measurable ROI.",
        route: "/services/ai-automations",
      },
      {
        slug: "ai-agents",
        name: "AI Agents & Chatbots",
        short: "Voice, chat, and knowledge agents.",
        route: "/services/ai-agents",
      },
      {
        slug: "crm-automation",
        name: "CRM & Workflow Automation",
        short: "HubSpot, GHL, custom flows.",
        route: "/services/crm-automation",
      },
      {
        slug: "api-integrations",
        name: "API & Systems Integration",
        short: "Connect the stack you already run.",
        route: "/services/api-integrations",
      },
    ],
  },
  {
    title: "Growth & Marketing",
    items: [
      {
        slug: "seo",
        name: "Search Engine Optimization",
        short: "Technical + editorial SEO.",
        route: "/services/seo",
      },
      {
        slug: "paid-advertising",
        name: "Paid Advertising",
        short: "Google, Meta, LinkedIn.",
        route: "/services/paid-advertising",
      },
      {
        slug: "social-media",
        name: "Social Media Marketing",
        short: "Content that compounds.",
        route: "/services/social-media",
      },
      {
        slug: "content-marketing",
        name: "Content Marketing",
        short: "Editorial engines that rank.",
        route: "/services/content-marketing",
      },
      {
        slug: "branding",
        name: "Branding & Creative Design",
        short: "Identity systems for tech brands.",
        route: "/services/branding",
      },
      {
        slug: "cro",
        name: "Conversion Rate Optimization",
        short: "Experimentation with rigor.",
        route: "/services/cro",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        slug: "maintenance",
        name: "Website Maintenance",
        short: "Uptime, security, performance.",
        route: "/services/maintenance",
      },
    ],
  },
];

export const allServices: ServiceItem[] = megaMenu.flatMap((g) => g.items);

export const industries = [
  {
    slug: "saas-startups",
    name: "SaaS & Startups",
    tag: "MVP, product, and scale",
    desc: "Product design, SaaS architecture, billing, onboarding, analytics, admin systems, AI features, and scaling.",
  },
  {
    slug: "home-services",
    name: "Home Services",
    tag: "Lead capture to dispatch",
    desc: "Lead handling, appointment workflows, CRM pipelines, local growth, reviews, and technician operations.",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    tag: "Intake and operations",
    desc: "Accessible intake, appointment workflows, staff portals, reporting, and secure operational design without unsupported compliance claims.",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    tag: "Storefront to retention",
    desc: "Shopify and custom storefronts, checkout, CRM, lifecycle flows, analytics, inventory, and support automation.",
  },
  {
    slug: "agencies",
    name: "Agencies",
    tag: "White-label delivery systems",
    desc: "Overflow development, dedicated teams, custom CMS platforms, client portals, reporting, and repeatable delivery workflows.",
  },
];

export const caseStudies: Array<{ slug: string; name: string; client: string; category: string; services: string[]; challenge: string; outcome: string; tags: string[] }> = [];

export const insights: Array<{ slug: string; category: string; title: string; excerpt: string; date: string; read: string }> = [];
