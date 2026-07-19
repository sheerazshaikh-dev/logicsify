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
    slug: "startups-saas",
    name: "Startups & SaaS",
    tag: "Product-led growth",
    desc: "MVPs, platform engineering, and marketing engines for venture-backed teams.",
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    tag: "Legal, consulting, agencies",
    desc: "Client portals, intake automation, and thought-leadership sites.",
  },
  {
    slug: "home-services",
    name: "Home Services",
    tag: "HVAC, plumbing, roofing",
    desc: "Local SEO, lead qualification, and dispatch integrations.",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    tag: "Clinics, dental, wellness",
    desc: "HIPAA-aware portals, appointment AI, and patient acquisition.",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    tag: "DTC, retail, B2B",
    desc: "Shopify Plus, headless storefronts, and lifecycle automation.",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    tag: "Brokerage, PropTech",
    desc: "IDX, agent portals, and inbound lead automation.",
  },
  {
    slug: "financial-services",
    name: "Financial Services",
    tag: "Fintech, advisory",
    desc: "Compliance-minded builds, dashboards, and CRM integrations.",
  },
];

export const caseStudies = [
  {
    slug: "saas-intelligence-platform",
    name: "SaaS Intelligence Platform",
    client: "Client Placeholder — Vertical SaaS",
    category: "SaaS",
    services: ["Product Design", "Full-Stack Engineering", "AI Integration"],
    challenge:
      "Consolidate three internal tools into a single analytics workspace with role-based access.",
    outcome: "Created a scalable product foundation and unified data model.",
    tags: ["SaaS", "Web Apps", "AI Automation"],
  },
  {
    slug: "healthcare-operations-portal",
    name: "Healthcare Operations Portal",
    client: "Client Placeholder — Multi-Clinic Group",
    category: "Healthcare",
    services: ["Web Application", "Workflow Automation", "Integrations"],
    challenge:
      "Replace spreadsheet-based scheduling across 12 locations with a live operations portal.",
    outcome: "Reduced manual processing across scheduling and reporting.",
    tags: ["Web Apps", "AI Automation"],
  },
  {
    slug: "ecommerce-growth-system",
    name: "E-commerce Growth System",
    client: "Client Placeholder — DTC Brand",
    category: "E-commerce",
    services: ["Shopify Plus", "CRO", "Paid Advertising"],
    challenge:
      "Rebuild storefront and unify paid, lifecycle, and merchandising in one growth loop.",
    outcome: "Improved conversion consistency across acquisition and retention.",
    tags: ["E-commerce", "Marketing"],
  },
  {
    slug: "ai-powered-lead-qualification",
    name: "AI-Powered Lead Qualification",
    client: "Client Placeholder — B2B Services",
    category: "AI Automation",
    services: ["AI Agents", "CRM Automation", "Reporting"],
    challenge: "Qualify inbound leads 24/7 and route to the right rep with context.",
    outcome: "Improved lead quality and consistent follow-up cadence.",
    tags: ["AI Automation", "Web Apps"],
  },
  {
    slug: "multi-location-marketing-platform",
    name: "Multi-Location Marketing Platform",
    client: "Client Placeholder — Franchise Network",
    category: "Marketing",
    services: ["Websites", "Local SEO", "Reporting Automation"],
    challenge:
      "Ship consistent, locally-tuned marketing pages and dashboards across 40+ locations.",
    outcome: "Created a scalable page framework and unified reporting layer.",
    tags: ["Websites", "Marketing", "AI Automation"],
  },
];

export const insights = [
  {
    slug: "where-ai-automation-creates-value",
    category: "AI Automation",
    title: "Where AI automation creates the fastest business value",
    excerpt:
      "The highest-ROI automations are the boring ones: qualification, routing, follow-up, reporting.",
    date: "Jul 2026",
    read: "6 min read",
  },
  {
    slug: "website-vs-web-app-vs-saas",
    category: "Strategy",
    title: "Choosing between a website, web app, and SaaS product",
    excerpt: "Three very different investments. How to know which one you actually need.",
    date: "Jun 2026",
    read: "8 min read",
  },
  {
    slug: "connect-marketing-data-with-operations",
    category: "Operations",
    title: "How to connect marketing data with business operations",
    excerpt: "When your CRM, ads, and reporting speak the same language, growth compounds.",
    date: "May 2026",
    read: "7 min read",
  },
];
