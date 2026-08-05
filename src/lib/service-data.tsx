import type { ServicePageData } from "@/components/service-page-template";
import { serviceContentPack } from "@/lib/service-content-pack";

const defaultProcess = [
  { n: "01", title: "Discover", body: "Interviews, audits, and objective alignment." },
  { n: "02", title: "Strategize", body: "Roadmap, architecture, and success metrics." },
  { n: "03", title: "Design", body: "Journeys, wireframes, and prototypes." },
  { n: "04", title: "Build", body: "Development, integration, and QA." },
  { n: "05", title: "Scale", body: "Measurement, iteration, and optimization." },
];

const defaultFaqs = [
  {
    q: "How long does a typical engagement take?",
    a: "Discovery-to-launch timelines depend on scope, but most engagements land between 6 and 16 weeks. We share a detailed timeline after discovery.",
  },
  {
    q: "How do we scope and price the work?",
    a: "We start with a paid discovery to lock scope, architecture, and success criteria. That produces a fixed-scope proposal you can approve line-by-line.",
  },
  {
    q: "Do we own the code and assets?",
    a: "Yes. Everything we build is yours. We hand over clean repositories, documentation, and admin access.",
  },
  {
    q: "Can you work with our existing team?",
    a: "Absolutely. We embed with in-house teams, take handoff-ready pieces, or run the full engagement — whatever the situation needs.",
  },
];

const legacyServiceData: Record<string, ServicePageData> = {
  "web-design-development": {
    slug: "web-design-development",
    name: "Web Design & Development",
    heroTitle: { prefix: "Editorial websites that ", accent: "earn attention." },
    heroIntro:
      "Fast, considered marketing websites for ambitious technology brands — designed to convert, built to last, tuned for organic performance.",
    valueProp:
      "A Logicsify website is a growth asset, not a brochure. We start with the business model — what you sell, to whom, and why — and design an editorial system that communicates it with clarity. Every page is engineered for performance, SEO, and analytics from the first commit, so marketing and product teams inherit a foundation they can run on.",
    problems: [
      "Your current site looks dated and no longer reflects the brand.",
      "Load times, Core Web Vitals, and mobile experience are hurting rankings.",
      "Content is locked in a rigid CMS that non-technical teams can't edit.",
      "Design and development live in silos and shipping anything takes weeks.",
      "You can't tell which pages, campaigns, or CTAs actually convert.",
      "Your site doesn't tell the story your sales team tells in the room.",
    ],
    capabilities: [
      {
        title: "Brand-aligned design system",
        body: "Typography, color, motion, and components — codified for consistency across every page and future template.",
      },
      {
        title: "Editorial page templates",
        body: "Home, service, case study, insights, and campaign templates purpose-built for your funnel.",
      },
      {
        title: "Headless or classic CMS",
        body: "Sanity, Contentful, Payload, WordPress, or Webflow — we choose based on your editorial workflow, not our preference.",
      },
      {
        title: "Performance engineering",
        body: "Image pipelines, code-splitting, edge deployment, and Core Web Vitals monitoring built in.",
      },
      {
        title: "SEO foundations",
        body: "Semantic HTML, structured data, sitemaps, canonical strategy, and internal linking planned from the wireframe stage.",
      },
      {
        title: "Analytics & experimentation",
        body: "GA4, server-side events, conversion tracking, and A/B infrastructure so decisions are data-informed.",
      },
    ],
    workflow: ["Strategy", "Sitemap & UX", "Visual design", "Build", "QA & SEO", "Launch"],
    process: defaultProcess,
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Astro",
      "Sanity",
      "Contentful",
      "Payload CMS",
      "WordPress",
      "Webflow",
      "Tailwind CSS",
      "Framer Motion",
      "Vercel",
      "Cloudflare",
    ],
    faqs: [
      {
        q: "How is this different from a template site?",
        a: "Every page is designed and engineered from scratch against your brand and funnel. Templates optimize for anyone; a custom build optimizes for you.",
      },
      ...defaultFaqs,
    ],
    related: ["ui-ux", "seo", "cro", "branding"],
  },
  "web-applications": {
    slug: "web-applications",
    name: "Custom Web Applications",
    heroTitle: { prefix: "Internal tools and platforms, ", accent: "built to scale." },
    heroIntro:
      "Purpose-built web applications that replace spreadsheets, connect the stack, and give your team a single, dependable interface.",
    valueProp:
      "Off-the-shelf tools force your business to bend to their model. A custom application does the opposite — it encodes how you actually operate and removes the manual work between systems. We build web applications with production-grade architecture, real authentication, permissions, audit trails, and integrations, so what launches in month one can serve you for five years.",
    problems: [
      "Your operations live across a dozen spreadsheets and disconnected tools.",
      "Off-the-shelf SaaS is too generic — or too expensive at scale.",
      "New processes require weeks of manual data reconciliation.",
      "You need role-based access, audit logs, and compliance-ready workflows.",
      "Reporting is stale by the time it reaches the leadership team.",
      "Your team is doing the same manual task hundreds of times a week.",
    ],
    capabilities: [
      {
        title: "Product architecture",
        body: "Domain modeling, data schemas, and service boundaries designed for the way your business will look in two years.",
      },
      {
        title: "Authentication & permissions",
        body: "SSO, MFA, and granular role-based access — including tenant isolation for multi-org systems.",
      },
      {
        title: "Integrations",
        body: "Connect the CRMs, ERPs, payment processors, and internal APIs you already depend on.",
      },
      {
        title: "Realtime & background jobs",
        body: "Live dashboards, notifications, and reliable async work with queues and retries.",
      },
      {
        title: "Reporting & dashboards",
        body: "Purpose-built analytics views that leadership actually opens.",
      },
      {
        title: "Deployment & observability",
        body: "CI/CD, error monitoring, uptime alerting, and a clear on-call story.",
      },
    ],
    workflow: ["Domain modeling", "Prototype", "Core build", "Integrations", "Hardening", "Launch"],
    process: defaultProcess,
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "NestJS",
      "Python",
      "FastAPI",
      "Laravel",
      "PostgreSQL",
      "Supabase",
      "Prisma",
      "Redis",
      "AWS",
      "Vercel",
    ],
    faqs: defaultFaqs,
    related: ["saas-development", "api-integrations", "ui-ux", "crm-automation"],
  },
  "saas-development": {
    slug: "saas-development",
    name: "SaaS Product Development",
    heroTitle: { prefix: "End-to-end ", accent: "SaaS product", suffix: " engineering." },
    heroIntro:
      "From MVP to Series B and beyond — product strategy, design, and engineering under one roof.",
    valueProp:
      "Building SaaS is a decade-long commitment, not a project. We partner with founders and product leaders on multi-tenant architecture, billing, growth loops, and the unsexy platform work that decides whether v2 is fast or painful. Our engagements are scoped to hit real product milestones — a public beta, a paid pilot, an enterprise-ready release — not vanity deliverables.",
    problems: [
      "You have a validated idea but no clear technical roadmap.",
      "Your MVP shipped, but the codebase can't take another feature.",
      "Onboarding, billing, and permissions are held together with duct tape.",
      "You need enterprise-ready features (SSO, audit, SOC2 prep) fast.",
      "Product, marketing, and engineering are misaligned on what ships next.",
      "Your team is small and needs senior partners, not staff augmentation.",
    ],
    capabilities: [
      {
        title: "Product strategy & roadmap",
        body: "From positioning to release plan, we align product, engineering, and go-to-market.",
      },
      {
        title: "Multi-tenant architecture",
        body: "Data isolation, permissioning, and scaling patterns that survive contact with real customers.",
      },
      {
        title: "Billing & monetization",
        body: "Stripe, usage-based metering, entitlements, and trial-to-paid conversion flows.",
      },
      {
        title: "Onboarding & activation",
        body: "The first ten minutes decide retention. We design the flow, instrument it, and iterate.",
      },
      {
        title: "Enterprise readiness",
        body: "SSO, audit logs, admin tooling, and SOC2-friendly architecture from day one.",
      },
      {
        title: "Growth engineering",
        body: "Product analytics, experiment infrastructure, and in-product growth surfaces.",
      },
    ],
    workflow: ["Product discovery", "Architecture", "MVP build", "Beta", "Iteration", "Scale"],
    process: defaultProcess,
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Python",
      "PostgreSQL",
      "Supabase",
      "Stripe",
      "Auth0",
      "Clerk",
      "AWS",
      "Vercel",
      "Segment",
      "PostHog",
    ],
    faqs: defaultFaqs,
    related: ["web-applications", "ui-ux", "ai-automations", "cro"],
  },
  "mobile-apps": {
    slug: "mobile-apps",
    name: "Mobile App Development",
    heroTitle: { prefix: "Native-quality apps for ", accent: "iOS and Android." },
    heroIntro:
      "React Native and Swift/Kotlin engagements that ship real, high-performance mobile products — not wrapped websites.",
    valueProp:
      "Mobile is a different discipline. The device, the store review process, the offline reality, and the OS-level integrations all shape the product. We design and build mobile applications that respect the platform, hit App Store and Play Store quality bars, and are architected to share business logic with your web product where it makes sense.",
    problems: [
      "Your web experience doesn't translate cleanly to mobile.",
      "You need native features: push, camera, location, biometrics.",
      "Your existing app is slow, crash-prone, or stuck in an outdated stack.",
      "You're deciding between React Native, Flutter, or fully native.",
      "You need App Store and Play Store submission handled end to end.",
      "You need a mobile experience that stays in sync with a web app.",
    ],
    capabilities: [
      {
        title: "React Native engineering",
        body: "Cross-platform apps with native modules where they matter.",
      },
      {
        title: "Native iOS & Android",
        body: "Swift and Kotlin builds when platform performance is non-negotiable.",
      },
      {
        title: "Offline-first architecture",
        body: "Sync engines and local storage patterns for real-world connectivity.",
      },
      {
        title: "Push, notifications & deep links",
        body: "Complete lifecycle infrastructure with analytics attribution.",
      },
      {
        title: "Store submission & compliance",
        body: "App Store, Play Store, TestFlight, and internal distribution handled.",
      },
      {
        title: "Analytics & crash reporting",
        body: "Firebase, Sentry, and product analytics wired up on day one.",
      },
    ],
    workflow: [
      "Discovery",
      "UX & prototypes",
      "Native build",
      "QA & devices",
      "Store submission",
      "Launch",
    ],
    process: defaultProcess,
    technologies: [
      "React Native",
      "Expo",
      "Swift",
      "Kotlin",
      "TypeScript",
      "GraphQL",
      "Firebase",
      "Supabase",
      "Sentry",
      "OneSignal",
      "RevenueCat",
      "AppsFlyer",
    ],
    faqs: defaultFaqs,
    related: ["ui-ux", "web-applications", "api-integrations", "saas-development"],
  },
  ecommerce: {
    slug: "ecommerce",
    name: "E-commerce Development",
    heroTitle: {
      prefix: "Shopify, headless, and ",
      accent: "custom stacks",
      suffix: " that sell.",
    },
    heroIntro:
      "Storefronts and back-of-house systems engineered for conversion, speed, and long-term merchandising velocity.",
    valueProp:
      "E-commerce is a systems problem: storefront, PIM, ERP, OMS, ESP, subscriptions, reviews, ads. Logicsify designs the whole stack around the customer journey and the merchandising cadence of your team. Whether that's Shopify Plus with a custom theme, a headless React storefront, or a fully bespoke build, we ship stores that load fast and convert consistently.",
    problems: [
      "Your storefront is slow on mobile and hurting paid ad efficiency.",
      "Merchandising a new collection takes days instead of hours.",
      "Subscriptions, bundles, or B2B pricing don't fit your current stack.",
      "PIM, ERP, and OMS aren't talking to each other cleanly.",
      "Lifecycle marketing lives in a separate world from the storefront.",
      "You're outgrowing your current platform and unsure what's next.",
    ],
    capabilities: [
      {
        title: "Shopify Plus builds",
        body: "Custom themes, Hydrogen storefronts, and Shopify Functions.",
      },
      {
        title: "Headless commerce",
        body: "Next.js or Astro storefronts with your commerce engine of choice.",
      },
      {
        title: "Subscriptions & B2B",
        body: "Recharge, Bold, Shopify B2B, and custom pricing logic.",
      },
      {
        title: "PIM & inventory",
        body: "Clean product data pipelines across storefront, marketplace, and ERP.",
      },
      {
        title: "Lifecycle marketing",
        body: "Klaviyo, Attentive, and CDP integrations wired into every event.",
      },
      {
        title: "Merchandising velocity",
        body: "Editable sections and templates so marketing ships without engineering.",
      },
    ],
    workflow: ["Audit", "IA & UX", "Design", "Build", "Integrations", "Launch"],
    process: defaultProcess,
    technologies: [
      "Shopify Plus",
      "Hydrogen",
      "Next.js",
      "Sanity",
      "Klaviyo",
      "Attentive",
      "Recharge",
      "Segment",
      "Google Merchant",
      "Meta CAPI",
    ],
    faqs: defaultFaqs,
    related: ["cro", "paid-advertising", "seo", "branding"],
  },
  "ui-ux": {
    slug: "ui-ux",
    name: "UI/UX & Product Design",
    heroTitle: { prefix: "Research-led design for ", accent: "real users." },
    heroIntro:
      "Product design that reduces cognitive load, ships faster, and stays consistent as your team and product grow.",
    valueProp:
      "Good design is not decoration. It's how the product feels in the hands of the person doing the job. We combine research, information architecture, interaction design, and visual systems into a single practice — always shipping designs the engineering team can build without guessing.",
    problems: [
      "Users complete the wrong actions or drop off silently.",
      "Every new screen introduces a new pattern.",
      "Designs look great but block engineering with edge cases.",
      "You need a system that scales beyond the current designer.",
      "You're not sure whether the problem is UX or product-market fit.",
      "Accessibility and inclusion have been afterthoughts.",
    ],
    capabilities: [
      {
        title: "User research",
        body: "Discovery interviews, usability testing, and analytics reviews with real users.",
      },
      {
        title: "Information architecture",
        body: "Sitemaps, task flows, and content models that reduce complexity.",
      },
      {
        title: "Interaction design",
        body: "High-fidelity prototypes that behave like the real product.",
      },
      {
        title: "Design systems",
        body: "Tokens, components, and documentation shared across product, marketing, and engineering.",
      },
      {
        title: "Accessibility (WCAG 2.1 AA)",
        body: "Contrast, keyboard, screen reader, and cognitive accessibility built in.",
      },
      { title: "Motion & prototyping", body: "Micro-interactions that guide, not distract." },
    ],
    workflow: ["Research", "IA", "Wireframes", "Prototype", "Visual design", "Handoff"],
    process: defaultProcess,
    technologies: ["Figma", "FigJam", "Framer", "Storybook", "Maze", "Dovetail", "Notion"],
    faqs: defaultFaqs,
    related: ["web-design-development", "web-applications", "saas-development", "branding"],
  },
  "ai-automations": {
    slug: "ai-automations",
    name: "AI Automations",
    heroTitle: {
      prefix: "AI automation designed around ",
      accent: "how your business actually works.",
    },
    heroIntro:
      "We don't add AI for novelty. We identify repetitive work, decision bottlenecks, and disconnected software — then design practical, measurable automated systems.",
    valueProp:
      "Most AI projects fail because they start with the model instead of the workflow. We start with a map: where information enters, where humans make decisions, where systems drop the ball. Then we design automations that route the right work to the right person or agent, with fallbacks, observability, and human-in-the-loop where it matters. The result is a set of running systems your team trusts.",
    problems: [
      "Leads sit in an inbox for hours before anyone follows up.",
      "Reps re-type the same information across three systems.",
      "Reporting takes a full day every Monday morning.",
      "Customer support answers the same twenty questions all week.",
      "Bookings, reminders, and follow-ups depend on people remembering.",
      "You're using AI tools but can't measure what they're doing.",
    ],
    capabilities: [
      {
        title: "Lead capture & qualification",
        body: "Multi-channel intake, enrichment, scoring, and routing.",
      },
      {
        title: "AI customer support",
        body: "Chat and email agents grounded in your real content and product.",
      },
      {
        title: "Voice AI agents",
        body: "Inbound and outbound voice with call transfer and CRM logging.",
      },
      {
        title: "Appointment engines",
        body: "Calendar-aware booking with confirmations and reminders.",
      },
      {
        title: "CRM & workflow automation",
        body: "HubSpot, GHL, Pipedrive, custom — data flowing where it should.",
      },
      {
        title: "Reporting & dashboards",
        body: "Live views for revenue, pipeline, ops, and support.",
      },
      {
        title: "Document processing",
        body: "Extraction from invoices, contracts, forms, and PDFs.",
      },
      {
        title: "Knowledge assistants",
        body: "Internal AI grounded in your docs, wikis, and tickets.",
      },
    ],
    workflow: ["Map", "Prioritize", "Design", "Build", "Instrument", "Iterate"],
    process: defaultProcess,
    technologies: [
      "OpenAI",
      "Anthropic",
      "Gemini",
      "LangChain",
      "LangGraph",
      "n8n",
      "Make",
      "Zapier",
      "HubSpot",
      "GoHighLevel",
      "Retell AI",
      "Vapi",
      "Supabase",
      "Pinecone",
    ],
    faqs: [
      {
        q: "How do you avoid AI 'hallucinations' in production?",
        a: "By grounding models in your real data, adding verification steps, and putting humans in the loop where the cost of being wrong is high. Every workflow has an escalation path.",
      },
      {
        q: "Do we need to change tools we already use?",
        a: "Rarely. Most engagements integrate with the CRM, calendar, and communication tools you already run.",
      },
      ...defaultFaqs,
    ],
    related: ["ai-agents", "crm-automation", "api-integrations", "web-applications"],
  },
  "ai-agents": {
    slug: "ai-agents",
    name: "AI Agents & Chatbots",
    heroTitle: {
      prefix: "Agents that ",
      accent: "do the work",
      suffix: ", not just answer questions.",
    },
    heroIntro:
      "Voice, chat, and knowledge agents grounded in your data, integrated with your systems, and observable end to end.",
    valueProp:
      "An agent is only as useful as the actions it can take. We design agents around real jobs — qualifying a lead, booking a demo, resolving a ticket, updating a record — and connect them to the tools that let them finish the job. Every deployment includes evaluation, guardrails, and a clear escalation path to humans.",
    problems: [
      "Your support inbox is drowning in repeat questions.",
      "Your website chatbot can't do anything beyond FAQs.",
      "You want voice AI, but concerned about quality and handoff.",
      "You need internal AI that respects permissions and data boundaries.",
      "You've tried off-the-shelf bots and users bounced.",
      "You can't measure whether AI is actually helping.",
    ],
    capabilities: [
      {
        title: "Chat agents",
        body: "Web, WhatsApp, SMS, and in-app chat with tool use and CRM sync.",
      },
      {
        title: "Voice agents",
        body: "Inbound and outbound voice with warm transfer and call summarization.",
      },
      {
        title: "Internal knowledge agents",
        body: "Grounded on Notion, Google Drive, Confluence, and your own data.",
      },
      {
        title: "Agent evaluation",
        body: "Test suites and monitoring so quality is measurable, not vibes.",
      },
      {
        title: "Guardrails & safety",
        body: "Prompt injection defense, PII handling, and refusal policies.",
      },
      {
        title: "Human-in-the-loop",
        body: "Clean escalation to your team with full conversation context.",
      },
    ],
    workflow: ["Job map", "Data grounding", "Tools", "Build", "Evaluate", "Deploy"],
    process: defaultProcess,
    technologies: [
      "OpenAI",
      "Anthropic",
      "Gemini",
      "LangGraph",
      "LlamaIndex",
      "Pinecone",
      "Retell AI",
      "Vapi",
      "Twilio",
      "Supabase",
    ],
    faqs: defaultFaqs,
    related: ["ai-automations", "crm-automation", "api-integrations"],
  },
  "crm-automation": {
    slug: "crm-automation",
    name: "CRM & Workflow Automation",
    heroTitle: { prefix: "Clean CRM data. ", accent: "Automated workflows." },
    heroIntro:
      "HubSpot, GoHighLevel, Pipedrive, and custom CRMs — instrumented so revenue, ops, and support share one source of truth.",
    valueProp:
      "A CRM is only as strong as the data hygiene behind it. We audit your existing CRM, redesign the object model where it needs it, automate the manual data entry, and integrate the tools your team already uses. The outcome is a CRM your team actually opens.",
    problems: [
      "Deals, contacts, and companies live in inconsistent shapes.",
      "Reps enter the same data multiple times.",
      "Handoffs between marketing, sales, and CS drop context.",
      "You can't tell where deals stall or why.",
      "Automations are held together with brittle Zaps.",
      "Reporting is manual and always stale.",
    ],
    capabilities: [
      {
        title: "CRM audit & data model",
        body: "Objects, fields, pipelines, and lifecycle stages designed for how you sell.",
      },
      {
        title: "Automation flows",
        body: "Lead routing, notifications, and follow-up sequences that actually run.",
      },
      {
        title: "Integration layer",
        body: "Marketing, billing, product, and support systems all synced.",
      },
      {
        title: "Reporting & dashboards",
        body: "Executive, revenue, and ops dashboards refreshed live.",
      },
      {
        title: "Training & enablement",
        body: "SOPs and walkthroughs so the team actually adopts the system.",
      },
    ],
    workflow: ["Audit", "Redesign", "Automate", "Integrate", "Report", "Enable"],
    process: defaultProcess,
    technologies: [
      "HubSpot",
      "GoHighLevel",
      "Pipedrive",
      "Salesforce",
      "n8n",
      "Make",
      "Zapier",
      "Segment",
    ],
    faqs: defaultFaqs,
    related: ["ai-automations", "api-integrations", "seo"],
  },
  "api-integrations": {
    slug: "api-integrations",
    name: "API & Systems Integration",
    heroTitle: { prefix: "Connect the stack ", accent: "you already run." },
    heroIntro:
      "Reliable integrations between the SaaS tools, internal systems, and databases that keep your business moving.",
    valueProp:
      "Most operational pain isn't about picking new software — it's about the seams between the software you already have. We design integrations that are observable, idempotent, and resilient to failure, so data flows correctly even when a third-party API is having a bad day.",
    problems: [
      "Your team copy-pastes between tools every day.",
      "You have data in a CRM, ERP, and warehouse that don't agree.",
      "Point-to-point Zaps have quietly broken and nobody noticed.",
      "You need to expose an internal API to partners securely.",
      "You want webhooks, retries, and observability done properly.",
      "You need HIPAA, SOC2, or PCI-friendly data handling.",
    ],
    capabilities: [
      {
        title: "Integration architecture",
        body: "Event-driven, queue-backed integrations with observability built in.",
      },
      {
        title: "Custom API development",
        body: "REST, GraphQL, or gRPC APIs with docs, versioning, and auth.",
      },
      {
        title: "Data pipelines",
        body: "ETL/ELT pipelines into warehouses like BigQuery, Snowflake, or Postgres.",
      },
      {
        title: "Webhook infrastructure",
        body: "Reliable webhook delivery with retries, signing, and replay.",
      },
      {
        title: "iPaaS & low-code",
        body: "n8n, Make, Workato, or Zapier where they're the right fit.",
      },
    ],
    workflow: ["Discovery", "Design", "Build", "Instrument", "Harden", "Handoff"],
    process: defaultProcess,
    technologies: [
      "Node.js",
      "Python",
      "n8n",
      "Make",
      "Zapier",
      "AWS Lambda",
      "Cloudflare Workers",
      "PostgreSQL",
      "BigQuery",
      "Snowflake",
    ],
    faqs: defaultFaqs,
    related: ["crm-automation", "ai-automations", "web-applications"],
  },
  seo: {
    slug: "seo",
    name: "Search Engine Optimization",
    heroTitle: { prefix: "Technical and editorial SEO, ", accent: "executed together." },
    heroIntro:
      "Ranking is engineering plus editorial. We do both — with a bias toward pages that convert, not just pages that rank.",
    valueProp:
      "Modern SEO is technical (Core Web Vitals, indexation, schema), editorial (topical authority, content quality), and product (site structure, internal linking, page templates). Logicsify treats them as a single system. We build the site architecture, produce the content plan, and measure the outcomes that matter — qualified pipeline, not vanity keywords.",
    problems: [
      "Rankings are stuck despite regular content publishing.",
      "Technical debt (JS rendering, indexation) is holding organic back.",
      "You publish content but nothing internally links to it.",
      "Your topics don't map to how buyers actually search.",
      "AI overviews are eating your top-of-funnel traffic.",
      "Reporting is impression-heavy and pipeline-light.",
    ],
    capabilities: [
      {
        title: "Technical SEO audit",
        body: "Crawl, indexation, Core Web Vitals, structured data, log analysis.",
      },
      {
        title: "Content strategy",
        body: "Topic clusters, editorial calendar, and template design.",
      },
      {
        title: "On-page optimization",
        body: "Title, meta, headings, internal links, and schema at scale.",
      },
      { title: "Link acquisition", body: "Digital PR and partnership-driven links — no schemes." },
      {
        title: "AI search readiness",
        body: "Structured data, entity clarity, and content built for AI citations.",
      },
    ],
    workflow: ["Audit", "Strategy", "Fix technical", "Content", "Links", "Measure"],
    process: defaultProcess,
    technologies: [
      "Ahrefs",
      "SEMrush",
      "Screaming Frog",
      "GSC",
      "GA4",
      "Sanity",
      "WordPress",
      "Contentful",
    ],
    faqs: defaultFaqs,
    related: ["content-marketing", "web-design-development", "cro", "paid-advertising"],
  },
  "paid-advertising": {
    slug: "paid-advertising",
    name: "Paid Advertising",
    heroTitle: { prefix: "Paid media that ", accent: "compounds." },
    heroIntro:
      "Google, Meta, LinkedIn, and programmatic — architected around creative velocity, clean attribution, and lifetime value.",
    valueProp:
      "Paid media is a system, not a channel. We build the measurement, feed the account with continuous creative, and manage bids and audiences with the discipline needed to compound. Every dollar is tracked to a business outcome, not a click.",
    problems: [
      "Ad accounts are underfunded on creative and overloaded on tactics.",
      "iOS and cookie changes broke your attribution model.",
      "CAC is climbing and LTV isn't keeping up.",
      "You're launching campaigns without a landing page strategy.",
      "You need one team that connects paid to lifecycle and product.",
      "Reporting is dashboards without decisions.",
    ],
    capabilities: [
      {
        title: "Google Ads",
        body: "Search, Performance Max, Demand Gen, and YouTube with proper measurement.",
      },
      {
        title: "Meta Ads",
        body: "Facebook, Instagram, and Reels with server-side event tracking.",
      },
      { title: "LinkedIn Ads", body: "ABM, lead gen forms, and conversation ads for B2B." },
      {
        title: "Creative production",
        body: "Continuous static, motion, and UGC creative testing.",
      },
      {
        title: "Landing pages & CRO",
        body: "Purpose-built pages tied to ad concepts and audience intent.",
      },
      {
        title: "Attribution & measurement",
        body: "GA4, server-side events, and MMM-lite where it matters.",
      },
    ],
    workflow: ["Audit", "Measurement", "Creative", "Launch", "Iterate", "Scale"],
    process: defaultProcess,
    technologies: [
      "Google Ads",
      "Meta Ads",
      "LinkedIn Ads",
      "GA4",
      "GTM",
      "Segment",
      "Northbeam",
      "Triple Whale",
    ],
    faqs: defaultFaqs,
    related: ["cro", "seo", "content-marketing", "social-media"],
  },
  "social-media": {
    slug: "social-media",
    name: "Social Media Marketing",
    heroTitle: { prefix: "Social that earns ", accent: "attention and trust." },
    heroIntro:
      "Founder-led, product-led, and audience-led social — with a bias toward native content, not recycled ads.",
    valueProp:
      "Social is a distribution channel and a research channel. We build content systems that ship consistently across the platforms where your audience actually spends time — with editorial standards that make the content worth watching.",
    problems: [
      "You're posting but nothing is compounding.",
      "Content lives in a silo from product and PR.",
      "Founder content is a good idea nobody has time to execute.",
      "Video is intimidating and your team keeps deferring it.",
      "You can't tell what's working platform-by-platform.",
    ],
    capabilities: [
      { title: "Strategy & positioning", body: "What to talk about, to whom, and where." },
      {
        title: "Content production",
        body: "Static, motion, short-form video, and long-form podcasting.",
      },
      { title: "Founder content", body: "Executive presence programs for LinkedIn and X." },
      {
        title: "Community management",
        body: "DMs, comments, and community programs done with taste.",
      },
      {
        title: "Measurement",
        body: "Reach, engagement, saves, shares, and downstream conversions.",
      },
    ],
    workflow: ["Strategy", "Voice", "Production", "Publish", "Engage", "Measure"],
    process: defaultProcess,
    technologies: ["Later", "Buffer", "Metricool", "CapCut", "Descript", "Notion"],
    faqs: defaultFaqs,
    related: ["content-marketing", "branding", "paid-advertising"],
  },
  "content-marketing": {
    slug: "content-marketing",
    name: "Content Marketing",
    heroTitle: { prefix: "Editorial engines that ", accent: "rank and convert." },
    heroIntro:
      "Long-form content programs built for topical authority, pipeline, and reuse across every channel.",
    valueProp:
      "Great content is expensive and worth it. We build editorial engines that produce high-quality long-form work at a defensible cadence, then repurpose it across search, social, and email. Every piece has a job to do and a metric attached.",
    problems: [
      "Content publishing is inconsistent and quality-variable.",
      "You publish articles nobody links to.",
      "Your best content lives on LinkedIn and never gets indexed.",
      "You need writers who understand the domain, not generalists.",
      "You can't measure content's impact on pipeline.",
    ],
    capabilities: [
      { title: "Editorial strategy", body: "Topics, formats, cadence, and success metrics." },
      {
        title: "Long-form writing",
        body: "Guides, whitepapers, research, and reference articles.",
      },
      {
        title: "SEO-aligned briefs",
        body: "Every brief scoped for search intent and competitive gaps.",
      },
      { title: "Repurposing", body: "Long-form to short-form, video, and email — systematically." },
      {
        title: "Measurement",
        body: "Rankings, traffic, engaged sessions, and downstream conversions.",
      },
    ],
    workflow: ["Strategy", "Briefs", "Write", "Design", "Publish", "Repurpose"],
    process: defaultProcess,
    technologies: ["Ahrefs", "SEMrush", "Sanity", "WordPress", "Notion", "Grammarly", "Descript"],
    faqs: defaultFaqs,
    related: ["seo", "social-media", "branding"],
  },
  branding: {
    slug: "branding",
    name: "Branding & Creative Design",
    heroTitle: { prefix: "Identity systems for ", accent: "technology brands." },
    heroIntro:
      "Brand strategy, verbal identity, and visual systems designed to hold up across product, marketing, and hiring.",
    valueProp:
      "A modern brand is a system, not a logo. We build brand identities that give your team a shared language and a coherent look across every surface — from a landing page to a keynote to a career page.",
    problems: [
      "Your brand looks different on every surface.",
      "You need a rebrand but can't afford six months of downtime.",
      "Positioning and messaging don't match what your best customers say.",
      "Your visual system doesn't translate to product UI.",
      "You need an identity that works for hiring, not just marketing.",
    ],
    capabilities: [
      { title: "Brand strategy", body: "Positioning, values, and narrative." },
      { title: "Verbal identity", body: "Voice, tone, taglines, and messaging pillars." },
      {
        title: "Visual identity",
        body: "Logo, typography, color, motion, and photography direction.",
      },
      { title: "Brand systems", body: "Guidelines that codify how it all works together." },
      {
        title: "Marketing collateral",
        body: "Decks, one-pagers, case study templates, and social assets.",
      },
    ],
    workflow: ["Discovery", "Strategy", "Design", "System", "Rollout", "Governance"],
    process: defaultProcess,
    technologies: ["Figma", "Adobe CC", "After Effects", "Cavalry"],
    faqs: defaultFaqs,
    related: ["ui-ux", "web-design-development", "content-marketing"],
  },
  cro: {
    slug: "cro",
    name: "Conversion Rate Optimization",
    heroTitle: { prefix: "Experimentation with ", accent: "rigor." },
    heroIntro:
      "Research-led CRO programs that raise conversion, protect brand quality, and produce durable learning.",
    valueProp:
      "Most CRO programs run out of steam because they optimize buttons instead of hypotheses. Ours starts with research — analytics, session replay, interviews — and runs experiments that answer real questions about your customers.",
    problems: [
      "You're driving traffic that doesn't convert.",
      "Your team ships changes without measuring impact.",
      "A/B tests keep ending inconclusive.",
      "You need a program, not one-off tweaks.",
      "Growth and product argue about what to test next.",
    ],
    capabilities: [
      {
        title: "Conversion research",
        body: "Analytics, heatmaps, session replay, and user interviews.",
      },
      {
        title: "Experiment strategy",
        body: "Prioritized backlog with hypotheses and success criteria.",
      },
      { title: "Design & build", body: "Variants designed and engineered by senior teams." },
      {
        title: "Statistical analysis",
        body: "Sequential testing and Bayesian analysis where appropriate.",
      },
      { title: "Program management", body: "Weekly cadence, documentation, and shared learning." },
    ],
    workflow: ["Research", "Hypothesize", "Design", "Ship", "Analyze", "Document"],
    process: defaultProcess,
    technologies: [
      "GA4",
      "PostHog",
      "Amplitude",
      "Hotjar",
      "FullStory",
      "Optimizely",
      "GrowthBook",
    ],
    faqs: defaultFaqs,
    related: ["seo", "paid-advertising", "ui-ux", "web-design-development"],
  },
  maintenance: {
    slug: "maintenance",
    name: "Website Maintenance & Support",
    heroTitle: { prefix: "Uptime, security, and ", accent: "continuous improvement." },
    heroIntro:
      "Managed care for the sites and applications you already run — plus a roadmap for what's next.",
    valueProp:
      "A website is a living system. It needs security patching, performance monitoring, content updates, and small design and dev improvements every month. Our maintenance retainers give you a senior team on standby with a clear SLA.",
    problems: [
      "Your site hasn't had a security patch in a year.",
      "Nobody owns performance monitoring.",
      "Every small design change turns into a project.",
      "You need someone on-call for real incidents.",
      "You need a monthly roadmap for improvements.",
    ],
    capabilities: [
      {
        title: "Security patching",
        body: "OS, framework, CMS, and dependency updates on a cadence.",
      },
      { title: "Performance monitoring", body: "Core Web Vitals, uptime, and error monitoring." },
      {
        title: "Content & design updates",
        body: "Monthly retainer hours for design and dev work.",
      },
      { title: "Incident response", body: "On-call for genuine incidents with a clear SLA." },
      { title: "Quarterly roadmap", body: "Documented plan for what to improve next." },
    ],
    workflow: ["Onboard", "Audit", "Patch", "Monitor", "Improve", "Report"],
    process: defaultProcess,
    technologies: ["Sentry", "Datadog", "Cloudflare", "UptimeRobot", "New Relic", "GitHub Actions"],
    faqs: defaultFaqs,
    related: ["web-design-development", "seo", "cro"],
  },

  "ai-automation-voice-agents": {
    slug: "ai-automation-voice-agents",
    name: "AI Automation & Voice Agents",
    heroTitle: { prefix: "AI automation and voice agents ", accent: "built to do useful work" },
    heroIntro: "Move beyond isolated chat tools with AI systems that can understand an approved request, use connected business data, complete controlled actions, and bring a person in at the right moment.",
    heroSupport: "Start with the operating problem. Logicsify maps the workflow, systems, decisions, exceptions, and ownership before selecting the implementation approach.",
    valueProp: "Move beyond isolated chat tools with AI systems that can understand an approved request, use connected business data, complete controlled actions, and bring a person in at the right moment. The engagement begins with the operating reality rather than a predetermined tool. That keeps scope tied to the users, data, constraints, and measurable business result. A strong AI automation and voice agents engagement connects strategy, implementation, testing, ownership, and improvement. Logicsify documents what should happen, what can fail, which system owns each record, when a person must step in, and how the team will know the workflow is working.",
    problems: ["Teams repeat the same calls, questions, follow-ups, and data entry every day.", "AI experiments answer questions but do not connect reliably to real business actions.", "Automation risk grows when permissions, exceptions, escalation, and ownership are unclear."],
    audiences: ["Businesses losing time to repetitive communication and data handling", "Operations, sales, and support teams working across disconnected systems", "Agencies that need a dependable white-label AI implementation partner"],
    capabilities: [
      { title: "AI conversation systems", body: "Design voice and chat experiences for calling, appointment booking, qualification, support, intake, and guided self-service using approved language and boundaries." },
      { title: "Workflow and document intelligence", body: "Extract information, classify requests, validate data, create records, route work, and coordinate approvals across repeatable operational processes." },
      { title: "Business-system integration", body: "Connect suitable CRM, calendar, telephony, messaging, help-desk, storage, and internal systems through supported APIs, events, and automation layers." },
      { title: "Governance and improvement", body: "Define permissions, human review, fallback behavior, logs, quality checks, monitoring, ownership, and the evidence used to improve a live workflow safely." },
    ],
    workflow: ["Customer or staff request", "AI understanding", "Rules and approved knowledge", "Connected action", "Human review and insight"],
    process: [
      { n: "01", title: "Opportunity audit", body: "Confirm goals, users, current systems, constraints, risks, and the decision the project must improve." },
      { n: "02", title: "Workflow and risk map", body: "Document the data, rules, states, ownership, exceptions, and dependencies behind the target workflow." },
      { n: "03", title: "Prototype", body: "Turn the agreed model into an implementation plan, prototype, configuration, or technical foundation." },
      { n: "04", title: "Integration build", body: "Build in reviewable increments, connect approved systems, and keep assumptions and decisions visible." },
      { n: "05", title: "Scenario testing", body: "Test expected paths, edge cases, permissions, data, failures, devices, and operational recovery with owners." },
      { n: "06", title: "Controlled rollout", body: "Release in a controlled way, monitor real usage, transfer knowledge, and prioritize evidence-led improvement." },
    ],
    deliverables: ["Opportunity and workflow assessment", "Conversation, action, and escalation design", "Approved knowledge, rules, permissions, and integration specification", "Prototype or production implementation within agreed scope", "Scenario tests, logs, monitoring, documentation, and handover"],
    technologies: ["OpenAI", "Retell AI", "Twilio", "GoHighLevel", "HubSpot", "n8n", "Make", "Zapier", "WhatsApp", "Google Calendar"],
    scenarios: [
      { title: "Lead and appointment operations", body: "Respond, qualify, schedule, remind, route, and update the CRM through one controlled journey across voice, chat, forms, and messaging." },
      { title: "Customer and employee support", body: "Ground assistants in approved knowledge, guide common requests, create useful tickets, and preserve the complete context for human owners." },
      { title: "Document-heavy workflows", body: "Turn incoming PDFs, images, emails, and forms into validated structured data, approvals, system records, and traceable next actions." },
    ],
    measures: ["Manual handling time removed", "Workflow completion and exception rate", "Response, qualification, booking, or resolution rate", "Human escalation quality", "Data accuracy and failed-action rate"],
    faqs: [
      { q: "What is the difference between AI automation and a basic chatbot?", a: "A basic chatbot mainly returns messages. An operational AI system can also use approved knowledge, collect structured information, apply rules, call permitted tools, update systems, trigger workflows, and escalate with context." },
      { q: "Which process should we automate first?", a: "Start with a frequent, rules-based workflow that has a clear owner, usable data, measurable delay or cost, and a safe human fallback. Discovery ranks opportunities before a platform is selected." },
      { q: "Can AI agents work with our existing tools?", a: "Often, subject to API access, permissions, plan limits, data quality, and the action required. We confirm feasibility and fallback behavior before committing the integration." },
      { q: "How do you control mistakes and sensitive actions?", a: "We limit knowledge and actions, validate inputs and outputs, use role-based access, preserve logs, test failure paths, require approval for higher-risk steps, and route uncertain cases to people." },
      { q: "Can this be delivered as a standalone project?", a: "Yes. AI Automation & Voice Agents can be scoped independently or combined with adjacent capabilities where one connected engagement reduces handoffs and technical risk." },
      { q: "How is the final scope confirmed?", a: "Discovery reviews goals, users, current systems, access, data, constraints, risks, dependencies, third-party costs, and acceptance criteria. The proposal then states what is included, excluded, assumed, and owned by each party." },
    ],
    related: ["ai-calling-agents", "ai-support-chatbots", "document-extraction-processing"],
    useCases: ["Appointment booking", "Missed-call recovery", "Lead qualification", "Customer support", "Document intake", "Internal notifications"],
  },
  "crm-revenue-operations": {
    slug: "crm-revenue-operations",
    name: "CRM & Revenue Operations",
    heroTitle: { prefix: "CRM and revenue operations built around ", accent: "one reliable process" },
    heroIntro: "Connect marketing, sales, service, data, and management reporting through a CRM operating model that gives every record a purpose, owner, status, and next action.",
    heroSupport: "Start with the operating problem. Logicsify maps the workflow, systems, decisions, exceptions, and ownership before selecting the implementation approach.",
    valueProp: "Connect marketing, sales, service, data, and management reporting through a CRM operating model that gives every record a purpose, owner, status, and next action. The engagement begins with the operating reality rather than a predetermined tool. That keeps scope tied to the users, data, constraints, and measurable business result. A strong CRM and revenue operations engagement connects strategy, implementation, testing, ownership, and improvement.",
    problems: ["Leads enter the business without consistent qualification, ownership, or response expectations.", "Fields, stages, workflows, and reports mean different things to different teams.", "CRM tools have been added over time without a shared data model or accountable operating process."],
    audiences: ["Growing teams that no longer trust their CRM data or reports", "Businesses managing leads across forms, inboxes, spreadsheets, and locations", "Companies implementing, migrating, or replacing HubSpot, GoHighLevel, or a custom CRM"],
    capabilities: [
      { title: "Revenue-process design", body: "Define lifecycle stages, ownership, qualification, response expectations, handoffs, exceptions, and the management decisions reporting must support." },
      { title: "CRM architecture and implementation", body: "Design objects, properties, pipelines, permissions, views, automation, and user experiences around the approved operating model." },
      { title: "Migration and integration", body: "Inventory, clean, map, rehearse, reconcile, and connect approved forms, communication channels, calendars, payment systems, and business tools." },
      { title: "Reporting and governance", body: "Build decision-ready dashboards, data-quality controls, documentation, training, ownership, and a practical improvement cadence." },
    ],
    workflow: ["Lead captured", "Fit assessed", "Owner assigned", "Next action triggered", "Opportunity progressed", "Outcome reported"],
    process: defaultProcess,
    deliverables: ["Revenue-process blueprint and shared lifecycle definitions", "CRM object, property, pipeline, ownership, and permission model", "Lead routing, follow-up, handoff, notification, and exception workflows", "Migration, integration, reconciliation, and reporting specifications", "Testing evidence, dashboards, documentation, training, and governance plan"],
    technologies: ["HubSpot", "GoHighLevel", "Custom CRM", "Forms and lead sources", "Email and messaging APIs", "Calendar APIs", "Automation", "Revenue dashboards"],
    scenarios: [
      { title: "Lead-to-revenue operating system", body: "Unify capture, qualification, ownership, response, opportunity movement, follow-up, and management visibility from first touch to outcome." },
      { title: "Multi-team or multi-location CRM", body: "Preserve local ownership and operating differences while standardizing customer data, lifecycle definitions, permissions, and group reporting." },
      { title: "CRM rescue or migration", body: "Identify what is reliable, remove unnecessary complexity, repair workflows and reports, and move only approved data through a tested cutover." },
    ],
    measures: ["Speed to assignment and first action", "Record completeness and duplicate rate", "Stage conversion and aging", "Follow-up compliance and workflow exceptions", "Forecast and source-reporting reliability"],
    faqs: [
      { q: "Do we need a new CRM?", a: "Not necessarily. We first determine whether the main issue is platform fit, configuration, data quality, process design, integration, reporting, or adoption. Optimization may create more value than replacement." },
      { q: "Which CRM platform should we choose?", a: "The right choice depends on users, workflow depth, data relationships, permissions, communication needs, integrations, reporting, ownership, budget, and growth. The recommendation follows discovery rather than vendor preference." },
      { q: "Can you migrate our existing data and automations?", a: "Yes, within an agreed scope. Data is inventoried, cleaned, mapped, rehearsed, and reconciled. Automations are reviewed and rebuilt deliberately rather than copied without understanding their purpose." },
      { q: "How do you improve team adoption?", a: "We involve representative users, simplify the interface and required fields, align automation with real work, define ownership, test priority journeys, provide role-based guidance, and monitor usage after launch." },
      { q: "Can this be delivered as a standalone project?", a: "Yes. CRM & Revenue Operations can be scoped independently or combined with adjacent capabilities where one connected engagement reduces handoffs and technical risk." },
      { q: "How is the final scope confirmed?", a: "Discovery reviews goals, users, current systems, access, data, constraints, risks, dependencies, third-party costs, and acceptance criteria. The proposal then states what is included, excluded, assumed, and owned by each party." },
    ],
    related: ["gohighlevel-implementation", "hubspot-implementation", "sales-pipeline-lead-routing"],
    useCases: ["Central lead inbox", "Automated follow-up", "Sales pipeline", "Appointment operations", "CRM migration", "Revenue dashboards"],
  },
  "custom-websites-portals-cms": {
    slug: "custom-websites-portals-cms",
    name: "Custom Websites, Portals & CMS",
    heroTitle: { prefix: "Custom websites, portals, and CMS platforms built as ", accent: "real business systems" },
    heroIntro: "Bring public content, secure user journeys, internal administration, structured data, and connected workflows into a web platform your team can understand, manage, and extend.",
    heroSupport: "Start with the operating problem. Logicsify maps the workflow, systems, decisions, exceptions, and ownership before selecting the implementation approach.",
    valueProp: "Bring public content, secure user journeys, internal administration, structured data, and connected workflows into a web platform your team can understand, manage, and extend. The engagement begins with the operating reality rather than a predetermined tool. That keeps scope tied to the users, data, constraints, and measurable business result. A strong custom websites, portals and CMS engagement connects strategy, implementation, testing, ownership, and improvement.",
    problems: ["The public website, customer experience, and internal administration are split across disconnected tools.", "Teams depend on developers for routine content or operational updates because the CMS model is too limited.", "Generic templates cannot represent the required roles, data relationships, approvals, workflows, or integrations."],
    audiences: ["Businesses whose website must support more than brochure content", "Teams replacing spreadsheets, email handoffs, or inflexible off-the-shelf portals", "Agencies seeking structured white-label strategy, design, development, QA, and handover"],
    capabilities: [
      { title: "Public website and content experience", body: "Design conversion-focused, accessible, responsive journeys with structured content, search foundations, analytics, and reusable components." },
      { title: "Custom CMS and administration", body: "Model content, media, relationships, permissions, previews, publishing workflows, configuration, and everyday management around the team." },
      { title: "Secure portals and dashboards", body: "Give customers, employees, partners, or administrators role-based access to relevant records, documents, requests, workflows, and reporting." },
      { title: "Integration and platform ownership", body: "Connect forms, CRM, payments, communication, identity, analytics, and business APIs with testing, deployment, documentation, and maintainable ownership." },
    ],
    workflow: ["Visitor or user journey", "Structured content and data", "Roles and permissions", "Connected workflow", "Admin control", "Measurement and improvement"],
    process: defaultProcess,
    deliverables: ["Product scope, sitemap, user journeys, roles, and acceptance criteria", "Responsive design system and reusable page or application components", "Public website, portal, CMS, dashboard, or admin capabilities within scope", "Forms, APIs, integrations, analytics, search, and technical SEO foundation", "Migration, QA, deployment, documentation, training, and support plan"],
    technologies: ["React", "Modern frontend", "CMS or custom backend", "Relational database", "Identity and permissions", "APIs and integrations", "Cloud and observability"],
    scenarios: [
      { title: "Website plus custom CMS", body: "Pair a fast, persuasive public website with structured editing, media, publishing workflows, previews, permissions, and reusable content relationships." },
      { title: "Customer or employee portal", body: "Give authenticated users one place to view relevant information, submit requests, manage documents, track status, and complete approved actions." },
      { title: "Operational dashboard and admin platform", body: "Replace fragmented spreadsheets and inbox coordination with role-based records, workflows, approvals, reporting, configuration, and auditability." },
    ],
    measures: ["Qualified website conversions", "Core Web Vitals and accessibility quality", "Self-service completion rate", "Content and operational update time", "Application errors and workflow exceptions"],
    faqs: defaultFaqs,
    related: ["conversion-focused-business-websites", "customer-employee-portals", "custom-dashboards-admin-panels"],
    useCases: ["Conversion website", "Custom CMS", "Customer portal", "Employee portal", "Operational dashboard", "Admin platform"],
  },
  "mobile-app-development": {
    slug: "mobile-app-development", name: "Mobile App Development",
    heroTitle: { prefix: "Mobile products built around ", accent: "useful workflows." },
    heroIntro: "Customer and internal mobile applications designed for clear tasks, reliable data, and maintainable releases.",
    valueProp: "We design and build mobile experiences where a mobile interface improves the workflow, not simply because an app sounds more impressive than a responsive web product.",
    problems: ["Field or customer workflows are difficult on desktop", "Existing mobile experiences are slow or confusing", "The app and backend data are disconnected"],
    capabilities: [{ title: "Product and interaction design", body: "Flows, prototypes, interface systems, and mobile usability testing." }, { title: "Cross-platform development", body: "React Native and suitable platform services for maintainable iOS and Android delivery." }, { title: "Backend and integrations", body: "Authentication, APIs, notifications, payments, analytics, and admin controls." }],
    workflow: ["Scope", "Prototype", "Build", "Integrate", "Test", "Release"], process: defaultProcess,
    technologies: ["React Native", "TypeScript", "Firebase", "Supabase", "APIs", "Stripe"], faqs: defaultFaqs,
    related: ["custom-websites-portals-cms", "ui-ux-design"], useCases: ["Customer app", "Field operations", "Membership access", "Booking", "Internal workflows"],
  },
  "ui-ux-design": {
    slug: "ui-ux-design", name: "UI/UX Design",
    heroTitle: { prefix: "Interfaces that make complex systems ", accent: "easier to use." },
    heroIntro: "Research, user journeys, prototypes, and design systems for websites, applications, portals, and operational tools.",
    valueProp: "We reduce friction by understanding the task, information, and decision points before styling screens.",
    problems: ["Users cannot find the next action", "Complex workflows are compressed into generic screens", "Design and development use inconsistent components"],
    capabilities: [{ title: "Research and journey mapping", body: "Stakeholder interviews, user flows, information architecture, and task analysis." }, { title: "Wireframes and prototypes", body: "Testable flows before engineering effort is committed." }, { title: "Design systems", body: "Reusable components, interaction states, accessibility, and implementation guidance." }],
    workflow: ["Research", "Map", "Prototype", "Test", "Design", "Handoff"], process: defaultProcess,
    technologies: ["Figma", "Design systems", "Prototyping", "Accessibility testing"], faqs: defaultFaqs,
    related: ["custom-websites-portals-cms", "mobile-app-development"], useCases: ["SaaS interface", "CRM dashboard", "Portal", "Website", "Mobile workflow"],
  },
  "seo-digital-marketing": {
    slug: "seo-digital-marketing", name: "SEO & Digital Marketing",
    heroTitle: { prefix: "Acquisition systems connected to ", accent: "conversion and reporting." },
    heroIntro: "SEO, paid advertising, social media, content, and conversion programs connected to the website, CRM, and analytics.",
    valueProp: "Marketing works better when campaigns, landing pages, attribution, CRM follow-up, and reporting are designed as one system.",
    problems: ["Traffic is not connected to qualified leads", "Campaign reporting stops at clicks", "Content and paid media send users into weak landing experiences"],
    capabilities: [{ title: "SEO", body: "Technical, content, internal-linking, and conversion improvements." }, { title: "Paid advertising", body: "Google, Meta, and suitable paid acquisition with clean tracking and landing paths." }, { title: "Social and content marketing", body: "Repeatable content operations connected to audience and business objectives." }, { title: "Conversion optimization", body: "Funnel analysis, landing improvements, and measured experiments." }],
    workflow: ["Audit", "Tracking", "Plan", "Launch", "Optimize", "Report"], process: defaultProcess,
    technologies: ["Google Ads", "Meta", "GA4", "Search Console", "HubSpot", "GoHighLevel"], faqs: defaultFaqs,
    related: ["custom-websites-portals-cms", "crm-revenue-operations"], useCases: ["Lead generation", "SEO growth", "Paid acquisition", "Content operations", "Conversion improvement"],
  },
  "ecommerce-development": {
    slug: "ecommerce-development", name: "E-commerce Development",
    heroTitle: { prefix: "Commerce platforms connected from storefront to ", accent: "operations." },
    heroIntro: "Storefronts, checkout, payments, inventory, CRM, analytics, and customer support workflows.",
    valueProp: "We connect the buying experience to the systems that fulfill, communicate, measure, and retain customers.",
    problems: ["Checkout friction reduces completed orders", "Product, inventory, and customer data are disconnected", "Support and retention workflows depend on manual exports"],
    capabilities: [{ title: "Storefront development", body: "Shopify, headless, or custom commerce experiences." }, { title: "Payments and checkout", body: "Supported payment integrations, subscriptions, and checkout optimization." }, { title: "Operations integration", body: "CRM, inventory, email, analytics, support, and reporting connections." }],
    workflow: ["Catalog", "Experience", "Checkout", "Integrate", "Test", "Optimize"], process: defaultProcess,
    technologies: ["Shopify", "Stripe", "React", "APIs", "CRM", "Analytics"], faqs: defaultFaqs,
    related: ["custom-websites-portals-cms", "crm-revenue-operations"], useCases: ["Shopify store", "Custom storefront", "Subscriptions", "B2B portal"],
  },
  "cloud-maintenance": {
    slug: "cloud-maintenance", name: "Cloud, Maintenance & Delivery Support",
    heroTitle: { prefix: "Keep digital systems secure, observable, and ", accent: "ready to change." },
    heroIntro: "Cloud deployment, website maintenance, practical security review, and additional delivery capacity.",
    valueProp: "Launch is not the finish line. We support deployment, monitoring, updates, incident response, security hygiene, and planned improvements with clear ownership.",
    problems: ["Nobody owns deployment and monitoring", "Dependencies and CMS software are not updated consistently", "The internal team needs additional delivery capacity"],
    capabilities: [{ title: "Cloud deployment", body: "Environments, CI/CD, DNS, deployment controls, logging, and monitoring." }, { title: "Website maintenance", body: "Updates, fixes, performance, backups, and planned improvements." }, { title: "Cybersecurity review", body: "Access, secrets, dependencies, headers, forms, uploads, and deployment hygiene." }, { title: "Staff augmentation", body: "Additional design or engineering capacity with documented scope, handoff, and code ownership." }],
    workflow: ["Audit", "Stabilize", "Deploy", "Monitor", "Improve", "Report"], process: defaultProcess,
    technologies: ["Vercel", "Cloudflare", "AWS", "GitHub Actions", "Sentry", "Monitoring"], faqs: defaultFaqs,
    related: ["custom-websites-portals-cms", "crm-revenue-operations"], useCases: ["Production deployment", "Maintenance retainer", "Security review", "Delivery capacity"],
  },

};


export const serviceData: Record<string, ServicePageData> = {
  ...legacyServiceData,
  ...serviceContentPack,
};
