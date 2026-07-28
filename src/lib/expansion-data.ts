export const technicalRoadmapPath = "/technical-roadmap";

export const supportedIntegrations = [
  { name: "GoHighLevel", category: "CRM", text: "CRM and operations" },
  { name: "HubSpot", category: "CRM", text: "CRM and operations" },
  { name: "Supabase", category: "Development", text: "Development and data" },
  { name: "WordPress", category: "Development", text: "Development and content" },
  { name: "Shopify", category: "Development", text: "Commerce and development" },
  { name: "Stripe", category: "Payments", text: "Payments" },
  { name: "Twilio", category: "Communication", text: "Communication workflows" },
  { name: "Retell AI", category: "Communication", text: "Voice AI workflows" },
  { name: "OpenAI", category: "AI", text: "AI models and tooling" },
  { name: "Google Ads", category: "Marketing", text: "Advertising" },
  { name: "Meta", category: "Marketing", text: "Advertising" },
  { name: "n8n", category: "Automation", text: "Workflow automation" },
  { name: "Make", category: "Automation", text: "Workflow automation" },
  { name: "Zapier", category: "Automation", text: "Workflow automation" },
] as const;

export const engagementModels = [
  {
    slug: "fixed-scope-project",
    title: "Fixed-Scope Project",
    bestFor: "Clearly defined websites, applications, migrations, or automation builds.",
    scope: "A discovery phase produces a written scope, milestones, acceptance criteria, and change-control process.",
    cadence: "Milestone planning, weekly updates, staging reviews, and a launch checklist.",
    client: "Provide timely access, feedback, approvals, and one accountable point of contact.",
    logicsify: "Own delivery planning, design, engineering, QA, deployment, and handover for the approved scope.",
    advantages: ["Clear deliverables", "Defined timeline", "Controlled change process"],
    tradeoffs: ["Less flexible once build begins", "New requirements may need a change request"],
  },
  {
    slug: "monthly-development-support",
    title: "Monthly Development Support",
    bestFor: "Businesses needing ongoing improvements, maintenance, design, development, or marketing support.",
    scope: "A prioritized monthly backlog with agreed capacity and a named delivery lead.",
    cadence: "Weekly planning, continuous delivery, and monthly roadmap review.",
    client: "Maintain a prioritized backlog and make product decisions quickly.",
    logicsify: "Provide consistent delivery capacity, reporting, and technical stewardship.",
    advantages: ["Flexible priorities", "Continuous improvement", "Lower restart cost"],
    tradeoffs: ["Monthly capacity is finite", "Long-term priorities need active management"],
  },
  {
    slug: "dedicated-team",
    title: "Dedicated Team",
    bestFor: "Agencies, SaaS businesses, and companies needing consistent engineering capacity.",
    scope: "A stable cross-functional team aligned to a product area or delivery stream.",
    cadence: "Shared planning rituals, daily collaboration where needed, and milestone reviews.",
    client: "Provide product ownership, business context, and access to internal stakeholders.",
    logicsify: "Provide the agreed roles, delivery management, code quality, and continuity.",
    advantages: ["Stable capacity", "Broader skill coverage", "Deep product context"],
    tradeoffs: ["Requires active product ownership", "Best value comes from sustained use"],
  },
  {
    slug: "automation-consulting",
    title: "Automation Consulting",
    bestFor: "Businesses needing workflow discovery, process mapping, integration planning, and implementation guidance.",
    scope: "Interviews, workflow mapping, opportunity scoring, architecture, risk review, and an implementation roadmap.",
    cadence: "Focused workshops followed by a written technical roadmap and review session.",
    client: "Make process owners available and provide accurate system constraints.",
    logicsify: "Document current state, identify viable automation, and recommend phased implementation.",
    advantages: ["Reduces build risk", "Clarifies ROI assumptions", "Creates implementation order"],
    tradeoffs: ["Consulting does not replace implementation", "Recommendations depend on access to real process data"],
  },
] as const;

export type ComparisonDefinition = {
  slug: string;
  title: string;
  optionA: string;
  optionB: string;
  summary: string;
  bestA: string;
  bestB: string;
  rows: Array<{ label: string; a: string; b: string }>;
  risks: string[];
};

export const comparisons: ComparisonDefinition[] = [
  {
    slug: "custom-cms-vs-wordpress",
    title: "Custom CMS vs WordPress",
    optionA: "Custom CMS",
    optionB: "WordPress",
    summary: "A custom CMS optimizes for a specific editorial workflow. WordPress optimizes for fast setup and a broad plugin ecosystem.",
    bestA: "Teams with unusual permissions, structured content, integration needs, or strict performance requirements.",
    bestB: "Teams that need a familiar publishing tool, common page types, and a large pool of available implementers.",
    rows: [
      { label: "Setup speed", a: "Usually slower because the workflow is designed and built", b: "Usually faster with an established theme and plugin stack" },
      { label: "Flexibility", a: "High for the exact use case", b: "High within the theme and plugin ecosystem" },
      { label: "Plugin dependency", a: "Low when capabilities are built directly", b: "Can become high on complex sites" },
      { label: "Security responsibility", a: "Owned by the engineering and hosting process", b: "Requires disciplined core, theme, and plugin maintenance" },
      { label: "Editing experience", a: "Can be tailored to the team", b: "Familiar and broadly documented" },
      { label: "Performance", a: "Can be optimized around the exact frontend", b: "Can be strong with careful implementation" },
      { label: "Ownership", a: "Full code and data ownership depends on contract and stack", b: "Open-source core with ownership of site files and database" },
      { label: "Cost over time", a: "Higher initial investment, potentially lower workflow friction", b: "Lower initial cost, with maintenance varying by plugin complexity" },
    ],
    risks: ["Overbuilding a custom system before the editorial workflow is proven", "Accumulating unsupported WordPress plugins and unclear ownership"],
  },
  {
    slug: "custom-web-app-vs-saas-tools",
    title: "Custom Web App vs SaaS Tools",
    optionA: "Custom Web App",
    optionB: "SaaS Tools",
    summary: "SaaS tools reduce time to launch. Custom applications become attractive when workflow fit, integration, ownership, or scale creates sustained friction.",
    bestA: "Core workflows that create competitive advantage or require unusual permissions, data models, and integrations.",
    bestB: "Common workflows where a proven product already solves most requirements.",
    rows: [
      { label: "Speed to launch", a: "Measured in design and build phases", b: "Often days or weeks" },
      { label: "Customization", a: "Designed around the workflow", b: "Limited to product configuration and APIs" },
      { label: "Data ownership", a: "Controlled by the chosen architecture", b: "Defined by vendor terms and export capabilities" },
      { label: "Recurring cost", a: "Hosting and maintenance plus future development", b: "Subscription and usage fees" },
      { label: "Maintenance", a: "Your team or partner owns it", b: "Vendor owns product maintenance" },
      { label: "Scaling", a: "Requires deliberate architecture and operations", b: "Vendor handles infrastructure within plan limits" },
    ],
    risks: ["Building a custom version of a commodity tool", "Locking critical operations into a SaaS product with weak exports or APIs"],
  },
  {
    slug: "retell-ai-vs-twilio-voice",
    title: "Retell AI vs Twilio Voice Workflows",
    optionA: "Retell AI",
    optionB: "Twilio Voice",
    summary: "Retell AI provides an opinionated voice-agent platform. Twilio provides lower-level telephony primitives that support more custom engineering.",
    bestA: "Teams prioritizing a faster path to a managed conversational voice experience.",
    bestB: "Teams needing deep telephony control, custom call routing, or a broader communications platform.",
    rows: [
      { label: "Out-of-the-box voice AI", a: "Core product capability", b: "Requires additional conversational AI components" },
      { label: "Telephony control", a: "Managed within platform capabilities", b: "Granular APIs and infrastructure primitives" },
      { label: "Engineering requirement", a: "Lower for standard agent flows", b: "Higher for custom conversational systems" },
      { label: "Workflow flexibility", a: "Strong for supported agent patterns", b: "High, with more implementation responsibility" },
      { label: "Maintenance", a: "More platform-managed", b: "More application-managed" },
    ],
    risks: ["Choosing a managed agent platform before validating edge cases", "Underestimating the engineering and monitoring required for custom telephony"],
  },
  {
    slug: "gohighlevel-vs-custom-crm",
    title: "GoHighLevel vs Custom CRM",
    optionA: "GoHighLevel",
    optionB: "Custom CRM",
    summary: "GoHighLevel is designed for fast deployment of sales and marketing workflows. A custom CRM is justified when the operating model cannot fit a configurable platform without persistent workarounds.",
    bestA: "Agencies and service businesses that can use established pipelines, communications, forms, and automation.",
    bestB: "Businesses with proprietary workflows, unusual data relationships, or product-level CRM requirements.",
    rows: [
      { label: "Speed", a: "Fast configuration", b: "Requires discovery and development" },
      { label: "Marketing automation", a: "Broad built-in capability", b: "Must be built or integrated" },
      { label: "Custom workflows", a: "Configuration and integrations", b: "Can match the operating model exactly" },
      { label: "Ownership", a: "Vendor platform and data exports", b: "Defined by the application architecture and contract" },
      { label: "Reporting", a: "Built-in reports plus configuration", b: "Purpose-built reporting" },
      { label: "Maintenance", a: "Platform-managed", b: "Owner-managed" },
    ],
    risks: ["Customizing a platform beyond a maintainable point", "Building a CRM before the workflow is stable"],
  },
  {
    slug: "in-house-developer-vs-dedicated-agency",
    title: "In-House Developer vs Dedicated Agency",
    optionA: "In-House Developer",
    optionB: "Dedicated Agency",
    summary: "An in-house hire builds deep company context. A dedicated agency provides broader coverage and faster access to multiple disciplines.",
    bestA: "Companies with sustained engineering demand, strong technical management, and a role that remains full-time.",
    bestB: "Companies needing a cross-functional team, variable capacity, or faster delivery without building a department first.",
    rows: [
      { label: "Hiring time", a: "Recruiting and onboarding required", b: "Can begin after commercial and delivery alignment" },
      { label: "Coverage", a: "Depends on one person's strengths", b: "Can combine design, engineering, QA, and delivery" },
      { label: "Management", a: "Requires internal technical leadership", b: "Delivery management can be included" },
      { label: "Continuity", a: "Strong while the employee remains", b: "Depends on agency staffing and documentation practices" },
      { label: "Scalability", a: "Additional hiring required", b: "Capacity can expand within commercial constraints" },
      { label: "Cost structure", a: "Salary, benefits, tools, and management", b: "Contracted monthly or project cost" },
    ],
    risks: ["Hiring a generalist for a role requiring several specialties", "Using an agency without clear ownership, documentation, or continuity commitments"],
  },
];

export const resourceSeed = [
  { slug: "website-planning-checklist", title: "Website Planning Checklist", category: "Website planning" },
  { slug: "ai-automation-opportunity-audit", title: "AI Automation Opportunity Audit", category: "AI and automation" },
  { slug: "crm-migration-checklist", title: "CRM Migration Checklist", category: "CRM and operations" },
  { slug: "saas-mvp-scope-template", title: "SaaS MVP Scope Template", category: "Software and SaaS" },
] as const;
