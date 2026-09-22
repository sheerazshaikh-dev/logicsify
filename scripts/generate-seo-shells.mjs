import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.join(distDir, "index.html");
const ORIGIN = "https://logicsify.com";
const DEFAULT_IMAGE = `${ORIGIN}/logicsify-logo-dark.png`;

const pages = [
  {
    path: "/",
    key: "home",
    title: "Logicsify | AI Automation, CRM & Custom Business Platforms",
    description: "Logicsify builds AI-powered sales, customer service, CRM, website, portal, CMS, and business operations systems.",
    h1: "Build connected systems. Respond faster. Operate smarter.",
    intro: "Logicsify designs and develops connected digital systems for businesses that need fewer manual handoffs, faster customer response, and clearer operational visibility.",
    sections: [
      ["AI automation and voice agents", "We design AI-assisted workflows for lead qualification, customer support, appointment booking, internal operations, document handling, and approved business actions. The implementation is planned around real systems, permissions, escalation rules, and measurable outcomes rather than isolated demos."],
      ["CRM and revenue operations", "Logicsify connects lead capture, CRM records, pipelines, calendars, follow-up, reporting, and customer communication so sales and service teams can work from one operating model instead of fragmented tools."],
      ["Custom websites, portals and business platforms", "We build websites, portals, CMS platforms, SaaS products, mobile applications, dashboards, integrations, and custom software with a focus on maintainability, ownership, performance, and user experience."],
      ["White-label delivery for agencies", "Agencies and consultants can use Logicsify as a behind-the-scenes technical delivery partner for websites, Saas, AI automation, CRM, portals, mobile products, and custom engineering while keeping their own client relationship in front."],
    ],
  },
  {
    path: "/about",
    title: "About Logicsify | AI Automation & Software Development",
    description: "Learn about Logicsify, an AI automation and software development company building websites, apps, CRM systems, SaaS products, and connected business solutions.",
    h1: "A connected technology partner for modern business operations.",
    intro: "Logicsify combines software development, automation, CRM, digital product design, cybersecurity, and growth capability so clients can solve connected business problems through one accountable delivery model.",
    sections: [
      ["What Logicsify does", "Our work spans AI automation, CRM and revenue operations, custom websites and portals, SaaS products, mobile applications, UI/UX, integrations, cybersecurity, SEO, digital marketing, and white-label development."],
      ["How we work", "Projects begin with the operating problem, users, systems, constraints, risks, and desired outcome. We then define the delivery model, architecture, responsibilities, milestones, testing approach, handover requirements, and measurable success criteria."],
      ["Where we work", "Logicsify serves clients through an international operating footprint that includes Karachi, Jeddah, and Portugal, while supporting remote delivery for organizations and agency partners across markets."],
    ],
  },
  {
    path: "/services",
    title: "AI Automation, CRM & Business Platforms | Logicsify",
    description: "Logicsify builds AI-powered sales, customer service, CRM, website, portal, CMS, payment, and business operations systems.",
    h1: "Connected digital services built around the way your business actually works.",
    intro: "Explore Logicsify services across AI automation, CRM, software, websites, portals, mobile applications, cybersecurity, design, marketing, and ongoing technical delivery.",
    sections: [
      ["Core connected systems", "AI automation and voice agents, CRM and revenue operations, and custom websites, portals, and CMS platforms form the core of our connected delivery model."],
      ["Product and engineering capability", "We support mobile app development, SaaS products, custom software, API integrations, UI/UX design, cloud deployment, maintenance, cybersecurity, and technical operations."],
      ["Growth and agency delivery", "SEO, digital marketing, branding, e-commerce, staff augmentation, and white-label development allow clients and agency partners to combine technical implementation with go-to-market execution."],
    ],
  },
  {
    path: "/services/white-label-development",
    title: "White Label Development Services for Agencies | Logicsify",
    description: "White-label web, SaaS, AI automation, CRM, portal, and software development for agencies and consultants that need reliable delivery capacity.",
    h1: "Your brand. Our delivery engine.",
    intro: "Logicsify provides white-label technical delivery for agencies, consultants, studios, and service firms that want to expand what they can sell without building every capability internally.",
    image: `${ORIGIN}/white-label/client-facing-presentation.webp`,
    type: "Service",
    sections: [
      ["What white-label delivery means", "Your agency stays in front of the client relationship while Logicsify works behind the scenes on scoping, architecture, development, integrations, QA, documentation, deployment, and technical handoff under the agreed delivery model."],
      ["What we can deliver", "White-label engagements can cover websites, portals, CMS platforms, SaaS products, custom software, AI agents, automation, CRM systems, dashboards, APIs, integrations, mobile applications, UI/UX, e-commerce, deployment, and ongoing support."],
      ["Flexible partnership models", "Engagements can be structured project by project, as recurring delivery capacity, as overflow support during busy periods, or as a specialist layer for AI, CRM, software, integrations, and technical implementation."],
      ["Relationship and ownership boundaries", "Communication rules, brand presentation, client-facing participation, repository access, credentials, documentation, source-code handoff, and ownership expectations can be defined before delivery begins."],
    ],
  },
  {
    path: "/work",
    title: "Case Studies | Software, AI Automation & Digital Growth | Logicsify",
    description: "Explore Logicsify case studies across software, AI automation, CRM, websites, portals, integrations, and digital growth.",
    h1: "Case studies built around real operating problems.",
    intro: "See how Logicsify approaches practical business problems through software, automation, CRM, websites, portals, integrations, digital operations, and measurable implementation work.",
    sections: [
      ["Problem to implementation", "Each case study connects the original problem to objectives, delivery decisions, systems integrated, implementation work, testing, and the results that can be shared publicly."],
      ["Technical context", "Where appropriate, case studies document technology stacks, integrations, process changes, screenshots, project timelines, and the operating model behind the finished solution."],
      ["Related proof and services", "Case studies link back to the services, portfolio work, testimonials, insights, and resources that provide additional context for similar projects."],
    ],
  },
  {
    path: "/portfolio",
    title: "Portfolio | AI, Software, CRM & Web Projects | Logicsify",
    description: "Explore selected Logicsify projects across AI automation, CRM, websites, portals, CMS platforms, cybersecurity, and connected digital systems.",
    h1: "Selected digital systems and product work.",
    intro: "The Logicsify portfolio highlights websites, portals, applications, automation systems, CRM implementations, dashboards, integrations, and other digital products delivered across different business contexts.",
    sections: [
      ["Project detail", "Portfolio pages can include the client or brand, project type, services delivered, technologies used, challenges, implementation approach, highlights, gallery assets, and relevant links."],
      ["Connected services", "Projects are linked to the relevant Logicsify service capabilities so visitors can move from proof of work to the delivery model behind it."],
      ["Practical evaluation", "Use portfolio examples together with case studies and testimonials to understand the kinds of systems, interfaces, integrations, and operating problems Logicsify can support."],
    ],
  },
  {
    path: "/company-profile",
    title: "Company Profile | Logicsify",
    description: "Explore Logicsify's company profile, connected technology services, delivery model, selected work, team, and locations.",
    h1: "Logicsify company profile.",
    intro: "A concise overview of Logicsify, our connected technology capabilities, delivery model, selected work, team, locations, and the systems we help clients plan, build, connect, and improve.",
    sections: [
      ["Technology and automation", "Logicsify-works across custom software, web platforms, mobile products, CRM, AI automation, integrations, cybersecurity, and digital growth services."],
      ["Delivery model", "We can work as a direct technology partner, specialist implementation partner, white-label delivery partner, or extended technical team depending on project scope and ownership requirements."],
      ["International presence", "The company profile includes public location and contact information for Logicsify operations and representatives across its active markets."],
    ],
  },
  {
    path: "/automation-lab",
    title: "Automation Lab | Interactive AI & CRM Demos | Logicsify",
    description: "Explore interactive Logicsify demos for AI lead qualification, voice booking, CRM workflows, document extraction, and support automation.",
    h1: "Test the workflow before you scope the system.",
    intro: "The Automation Lab provides controlled demonstrations of AI lead qualification, voice booking, CRM workflow design, document extraction, and support automation without touching live client systems.",
    sections: [
      ["Lead qualification", "Explore how structured context can be evaluated and routed toward an appropriate next action before a production workflow is connected to CRM or communication systems."],
      ["Voice and CRM workflow examples", "Preview controlled conversational and workflow patterns for appointment booking, CRM triggers, conditions, actions, and activity tracking."],
      ["Document and support automation", "See examples of structured document extraction and support flows designed to illustrate how repetitive information handling can become a controlled business process."],
    ],
  },
  {
    path: "/integrations",
    title: "CRM, AI, Payments & Automation Integrations | Logicsify",
    description: "Explore CRM, AI, payments, communication, development, marketing, and automation platforms Logicsify can connect into business workflows.",
    h1: "Connect the systems your team already depends on.",
    intro: "Logicsify integrates CRM, AI, payments, communications, calendars, automation platforms, development tools, marketing systems, and internal applications into connected workflows.",
    sections: [
      ["Integration planning", "Every integration begins with data ownership, authentication, supported APIs, event flow, rate limits, failure handling, permissions, and the business outcome the connection must support."],
      ["Operational reliability", "Production integrations should include logging, retries, monitoring, exception handling, ownership, and a clear path for human review where automated actions can fail."],
      ["Custom integration work", "When native connectors are insufficient, Logicsify can design custom API, webhook, middleware, or workflow logic around the capabilities supported by each platform."],
    ],
  },
  {
    path: "/guides",
    title: "Business Technology Guides & Downloads | Logicsify",
    description: "Download practical checklists, audits, and planning templates for websites, SaaS products, CRM migrations, and AI automation.",
    h1: "Practical guides for planning technology and automation work.",
    intro: "Logicsify guides turn recurring project questions into reusable checklists, planning frameworks, audits, and downloadable resources for business and technical teams.",
    sections: [
      ["Planning resources", "Use guides to structure discovery, requirements, content, platform decisions, CRM migrations, automation opportunities, and implementation readiness."],
      ["Decision support", "Guides are designed to help teams identify the information, constraints, owners, risks, and dependencies that should be clear before a project moves into implementation."],
      ["Related expertise", "Each published guide can connect to relevant services, case studies, comparisons, and insights so the resource sits within a broader decision context."],
    ],
  },
  {
    path: "/project-estimator",
    title: "Website, App & Automation Project Estimator | Logicsify",
    description: "Build a rough project scope for a website, web app, SaaS product, AI automation, CRM system, or digital platform.",
    h1: "Build a practical first-pass project scope.",
    intro: "The Logicsify Project Estimator helps organize the type of product, major capabilities, integrations, business requirements, and delivery considerations before a detailed technical discovery.",
    sections: [
      ["What the estimator is for", "It provides a structured starting point rather than a binding quote. Complex software, automation, CRM, and integration projects still require discovery before scope and delivery assumptions can be confirmed."],
      ["What to include", "Useful project inputs include users, workflows, systems, integrations, content, permissions, data requirements, platform needs, timeline constraints, and the business outcome the project should improve."],
      ["Next step", "A completed estimate can be used as context for a technical roadmap or project conversation with Logicsify."],
    ],
  },
  {
    path: "/comparisons",
    title: "Technology Comparisons & Decision Guides | Logicsify",
    description: "Balanced comparisons for CMS platforms, custom software, CRM systems, voice AI workflows, and development engagement decisions.",
    h1: "Choose tools and delivery models with the tradeoffs visible.",
    intro: "Logicsify comparisons are decision frameworks designed to make constraints, costs, flexibility, risks, setup effort, and appropriate use cases easier to evaluate.",
    sections: [
      ["Balanced decision criteria", "A useful technology comparison should explain where each option works well, where it creates constraints, and what assumptions change the decision."],
      ["Business and technical context", "Comparisons cover operating model, implementation effort, ownership, integrations, maintainability, scalability, cost considerations, and the capabilities a team actually needs."],
      ["Use the framework, not a universal winner", "The right choice depends on requirements, team capability, timeline, budget, risk tolerance, and long-term ownership rather than a one-size-fits-all ranking."],
    ],
  },
  {
    path: "/engagement-models",
    title: "Engagement Models | Logicsify",
    description: "Compare fixed-scope projects, monthly development support, dedicated teams, and automation consulting with their advantages and tradeoffs.",
    h1: "Choose a delivery model that matches the work.",
    intro: "Logicsify supports multiple engagement structures so project ownership, capacity, scope, communication, and delivery expectations can match the type of work being undertaken.",
    sections: [
      ["Fixed-scope delivery", "Suitable when requirements, outputs, milestones, assumptions, and acceptance criteria can be defined before implementation."],
      ["Recurring support and delivery capacity", "Useful for ongoing improvements, maintenance, product iteration, automation support, and a steady stream of technical work."],
      ["Specialist and white-label partnerships", "Agencies, consultants, and internal teams can use Logicsify for focused capabilities or behind-the-scenes delivery without expanding permanent headcount for every skill set."],
    ],
  },
  {
    path: "/insights",
    title: "AI & Software Insights | Logicsify",
    description: "Read practical Logicsify insights about AI automation, software development, SaaS, CRM systems, digital marketing, and business technology.",
    h1: "Practical insights about connected technology and digital operations.",
    intro: "Logicsify Insights publishes explainers, implementation guidance, industry updates, and decision support across AI automation, software, SaaS, CRM, websites, cybersecurity, and digital growth.",
    sections: [
      ["Answer-first content", "Articles are designed around specific questions and implementation decisions so readers can understand the issue quickly before moving into deeper context, examples, tradeoffs, and sources."],
      ["Published and updated context", "Insight pages can identify authorship, publication date, updates, reading time, sources, related services, and other resources that support evaluation and trust."],
      ["From information to implementation", "Related links connect educational content to case studies, comparisons, guides, portfolio work, and service pages where a practical next step is appropriate."],
    ],
  },
  {
    path: "/testimonials",
    title: "Client Testimonials | Logicsify",
    description: "Read written client testimonials and watch video testimonials connected to published Logicsify case studies and portfolio projects.",
    h1: "Client feedback connected to the work behind it.",
    intro: "Logicsify testimonials are linked to published case studies or portfolio work where possible, making it easier to review feedback together with the project context.",
    sections: [
      ["Written feedback", "Published written testimonials provide client perspective on delivery, communication, implementation, and the experience of working with Logicsify."],
      ["Video testimonials", "Video feedback is presented separately when available so visitors can choose the format most useful to them."],
      ["Connected proof", "Testimonials connect back to project pages instead of existing as isolated quotes, helping visitors understand the work associated with the feedback."],
    ],
  },
  {
    path: "/process",
    title: "Our Process | Logicsify",
    description: "See how Logicsify moves from discovery and architecture through design, implementation, testing, launch, handover, and continuous improvement.",
    h1: "A transparent path from operating problem to working system.",
    intro: "Logicsify structures delivery around discovery, planning, design, implementation, testing, launch, documentation, ownership, and measurable improvement.",
    sections: [
      ["Discovery and requirements", "We identify users, workflows, current systems, constraints, data, risks, success criteria, owners, and the decisions that must be made before implementation."],
      ["Build and validation", "Work is delivered in reviewable increments with quality checks, integration testing, edge-case handling, and clear visibility into assumptions and changes."],
      ["Launch and handover", "Deployment, access, documentation, monitoring, ownership, training, and next-step recommendations are addressed so the finished system can be operated after launch."],
    ],
  },
  {
    path: "/technology",
    title: "Technology Stack | Logicsify",
    description: "Explore the frontend, backend, mobile, cloud, AI, automation, database, and marketing technologies Logicsify works with.",
    h1: "Technology selected around the product and operating model.",
    intro: "Logicsify works across modern web, backend, mobile, cloud, AI, automation, CRM, database, analytics, and marketing platforms, choosing tools according to project requirements rather than a fixed stack.",
    sections: [
      ["Frontend and product interfaces", "Modern web interfaces can be built with component-based frameworks, typed application code, accessible design systems, responsive layouts, and performance-focused delivery."],
      ["Backend, data and integrations", "Application services, databases, authentication, APIs, webhooks, background jobs, payments, CRM connections, and internal integrations are selected around reliability and maintainability."],
      ["AI and automation", "AI systems are connected to approved data, business rules, workflow tools, communication channels, and human review according to the risk and operational requirements of each use case."],
    ],
  },
  {
    path: "/team",
    title: "Our Team | Logicsify",
    description: "Meet the Logicsify team working across AI automation, software development, CRM, websites, cybersecurity, and digital growth.",
    h1: "A multidisciplinary team for connected delivery.",
    intro: "Logicsify brings together business development, technical leadership, software, automation, design, cybersecurity, marketing, and delivery capability around client and partner work.",
    sections: [
      ["Technical capability", "Team capability spans software engineering, websites, SaaS, mobile products, AI automation, CRM, APIs, cloud deployment, cybersecurity, UI/UX and technical operations."],
      ["Commercial and delivery context", "Business development, solution design, scoping, communication, project coordination, and client-facing delivery are treated as part of the implementation model rather than separate from it."],
      ["Connect profiles", "Published team profiles can include professional information and contact options intended for public business use."],
    ],
  },
  {
    path: "/careers",
    title: "Careers | Logicsify",
    description: "Explore career opportunities with Logicsify across software, AI automation, CRM, design, cybersecurity, marketing, and digital delivery.",
    h1: "Build connected systems with Logicsify.",
    intro: "Career opportunities at Logicsify can span software development, automation, product delivery, design, cybersecurity, business development, marketing, and operations.",
    sections: [
      ["How roles are published", "Open roles are published with the responsibilities, expectations, location or remote context, and application information available for that position."],
      ["What we value", "Practical problem solving, communication, ownership, technical judgment, learning, documentation, and the ability to work across disciplines are important in connected client delivery."],
      ["Applications", "Applicants should use the official careers workflow and published job information rather than relying on unofficial third-party descriptions."],
    ],
  },
  {
    path: "/contact",
    title: "Contact Logicsify | Start a Technology Project",
    description: "Contact Logicsify about AI automation, CRM, software, websites, SaaS, white-label development, cybersecurity, or digital growth projects.",
    h1: "Tell us what you want to improve, build, connect, or automate.",
    intro: "Use the Logicsify contact page to discuss a project, request a strategy call, or reach the appropriate team for general inquiries, sales, project work, and customer support.",
    sections: [
      ["Project inquiries", "Useful context includes the business problem, current systems, service required, company, desired timeline, estimated budget range, and a clear description of the outcome you need."],
      ["Strategy calls", "If a live conversation is more useful, request an available strategy-call time and include the service or project area you want to discuss."],
      ["Business contact", "Public contact channels and locations are presented on the website so visitors can choose the appropriate route for their inquiry."],
    ],
  },
  {
    path: "/book-a-call",
    title: "Book a Strategy Call | Logicsify",
    description: "Choose an available date and request a free 30-minute strategy call with Logicsify about your technology, automation, CRM, or digital project.",
    h1: "Book a strategy call with Logicsify.",
    intro: "Choose an available date and time to discuss a website, application, SaaS product, AI automation, CRM, white-label delivery, cybersecurity, or related digital project.",
    sections: [
      ["Prepare useful context", "Bring the problem you are trying to solve, the systems involved, current constraints, decision makers, timeline expectations, and any requirements already known."],
      ["What happens next", "The call is intended to clarify the situation, identify useful next steps, and determine whether a technical roadmap, discovery process, estimate, or project discussion is appropriate."],
      ["No obligation to over-scope", "The goal is to understand the operating need before recommending a delivery path."],
    ],
  },
  {
    path: "/technical-roadmap",
    title: "Free Technical Roadmap | Logicsify",
    description: "Share your systems, constraints, and project goals to start a practical technical roadmap with Logicsify.",
    h1: "Start with the systems, constraints, and outcome.",
    intro: "The Logicsify Technical Roadmap form captures the context needed to begin planning a website, application, SaaS product, CRM workflow, automation system, integration, or technical improvement.",
    sections: [
      ["Business and system context", "Describe the business type, current systems, service required, main technical problem, project summary, timeline, and budget context so the request can be evaluated realistically."],
      ["Why the roadmap starts with constraints", "Good technical planning depends on users, data, integrations, permissions, ownership, risk, operating process, and the measurable result the project should improve."],
      ["From roadmap to delivery", "The information can be used to structure a follow-up conversation, discovery process, implementation plan, or scoped proposal where appropriate."],
    ],
  },
  {
    path: "/resources",
    title: "Resources, Guides & Interactive Tools | Logicsify",
    description: "Explore Logicsify insights, downloadable guides, case studies, engagement models, automation demos, comparisons, and project planning tools.",
    h1: "Resources for better technology and delivery decisions.",
    intro: "Explore Logicsify insights, guides, comparisons, case studies, demos, engagement models, and project-planning tools in one place.",
    sections: [
      ["Learn", "Insights and guides explain implementation approaches, tradeoffs, technologies, operating models, and practical project questions."],
      ["Compare", "Decision frameworks make the advantages, limitations, requirements, and risks of common technology choices more visible."],
      ["Plan", "Interactive tools such as the Automation Lab, Project Estimator, and Technical Roadmap help turn a broad idea into structured implementation context."],
    ],
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Logicsify",
    description: "Read how Logicsify collects, uses, stores, and protects information submitted through its website and digital services.",
    h1: "Privacy Policy.",
    intro: "This page explains how Logicsify handles information submitted through website forms, business communications, analytics, and related digital interactions.",
    sections: [
      ["Information handling", "The policy describes the categories of information collected, the reasons information may be used, and the circumstances in which service providers or legal requirements may affect processing."],
      ["Security and retention", "Reasonable safeguards and retention practices are described together with the limits that apply to online systems and third-party services."],
      ["Questions", "Privacy-related questions should be directed through official Logicsify contact channels."],
    ],
  },
  {
    path: "/terms",
    title: "Terms & Conditions | Logicsify",
    description: "Read the terms and conditions governing use of the Logicsify website, content, forms, resources, and related digital services.",
    h1: "Terms & Conditions.",
    intro: "These terms describe the rules that apply when using the Logicsify website, public content, forms, resources, and related digital services.",
    sections: [
      ["Website use", "The terms explain acceptable use, intellectual-property considerations, third-party links, service availability, and limitations associated with public website content."],
      ["Project agreements", "Specific client work is governed by the relevant signed proposal, statement of work, agreement, or other commercial terms rather than by general marketing-page descriptions alone."],
      ["Questions", "Questions about these terms can be directed through official Logicsify contact channels."],
    ],
  },
];

const servicePages = [
  ["ai-automation-voice-agents", "AI Automation & Voice Agents | Logicsify", "AI automation and voice agents that connect approved business data, workflows, communications, CRM actions, and human escalation.", "AI automation and voice agents built to do useful work."],
  ["crm-revenue-operations", "CRM & Revenue Operations | Logicsify", "Connect lead capture, CRM, pipelines, calendars, follow-up, reporting, and customer communication into one revenue operating system.", "CRM and revenue operations built around one connected customer journey."],
  ["custom-websites-portals-cms", "Custom Websites, Portals & CMS | Logicsify", "Custom websites, portals, CMS platforms, dashboards, and digital experiences built for ownership, performance, integrations, and long-term growth.", "Custom websites, portals and CMS platforms built around your business."],
  ["mobile-app-development", "Mobile App Development | Logicsify", "Mobile application strategy, UX, engineering, integrations, backend services, testing, deployment, and iteration for business and product teams.", "Mobile applications designed around real users and connected systems."],
  ["ui-ux-design", "UI/UX Design Services | Logicsify", "User research, flows, wireframes, product interfaces, responsive design systems, prototypes, usability thinking, and developer-ready UI/UX delivery.", "UI/UX design that makes complex products easier to use."],
  ["seo-digital-marketing", "SEO & Digital Marketing Services | Logicsify", "SEO, content, performance marketing, social, analytics, conversion improvement, and digital growth systems connected to measurable business goals.", "SEO and digital marketing connected to measurable growth."],
  ["branding", "Branding & Creative Design | Logicsify", "Brand strategy, visual identity, verbal identity, design systems, creative direction, and marketing collateral for technology and service businesses.", "Brand systems designed to stay consistent across product and marketing."],
  ["ecommerce-development", "E-commerce Development | Logicsify", "E-commerce storefronts, custom shopping experiences, payments, product data, integrations, analytics, and conversion-focused development.", "E-commerce experiences built for conversion and operational reliability."],
  ["cloud-deployment", "Cloud Deployment Services | Logicsify", "Deployment planning, hosting architecture, CI/CD, domains, environments, observability, and release workflows for modern web and software products.", "Cloud deployment and release workflows built for reliability."],
  ["website-maintenance", "Website Maintenance & Support | Logicsify", "Website maintenance, security updates, content changes, performance monitoring, incident support, and continuous technical improvement.", "Website maintenance and support for systems that need ongoing ownership."],
  ["cybersecurity", "Cybersecurity Services | Logicsify", "Practical cybersecurity support for web applications, websites, infrastructure, access controls, risk review, hardening, and technical security improvements.", "Cybersecurity support focused on practical risk reduction."],
  ["staff-augmentation", "Technical Staff Augmentation | Logicsify", "Flexible technical capacity for software, web, automation, CRM, product, design, and delivery work without permanent hiring for every project need.", "Extend your delivery capacity with technical specialists."],
  ["cloud-maintenance", "Cloud Maintenance & Operations | Logicsify", "Ongoing cloud, deployment, monitoring, reliability, incident, backup, update, and technical operations support for production systems.", "Cloud maintenance and technical operations for production systems."],
];

for (const [slug, title, description, h1] of servicePages) {
  pages.push({
    path: `/services/${slug}`,
    title,
    description,
    h1,
    intro: description,
    type: "Service",
    sections: [
      ["What the service covers", `${description} Scope is aligned to the systems, users, constraints, integrations, ownership, and measurable outcome required for the engagement.`],
      ["How Logicsify approaches delivery", "Work begins with requirements and operating context, then moves through architecture, implementation, review, testing, documentation, launch, and handover according to the agreed scope."],
      ["Connected delivery", "This service can be delivered independently or combined with adjacent Logicsify capabilities when the project spans multiple systems, teams, channels, or technical disciplines."],
    ],
  });
}


const seoExpansion = {
  home: [
    ["Connected delivery instead of isolated tools", "Logicsify plans technology around complete operating workflows. A typical engagement may connect a website or campaign to lead capture, CRM, qualification, scheduling, follow-up, reporting, customer support, and internal handoff. This reduces the number of manual transfers between teams and makes ownership clearer when a lead, customer request, document, payment, or operational task moves from one system to another."],
    ["AI systems with business controls", "AI is most useful when it is connected to approved data, explicit business rules, clear escalation paths, and measurable outcomes. We design AI agents and automations with human review where needed, defined permissions, fallback behavior, logging, and integration with CRM, calendars, communications, documents, and internal systems rather than treating AI as an isolated chatbot."],
    ["Software and product engineering", "For businesses that need more than a marketing site, Logicsify delivers custom web applications, SaaS products, client portals, dashboards, admin systems, mobile applications, APIs, integrations, authentication, role-based access, payments, analytics, and deployment workflows. Architecture and handover are planned so the product can continue to evolve after the initial release."],
    ["Agency and white-label partnerships", "Agencies, consultants, design studios, marketing firms, and specialist service providers can extend their delivery capability through Logicsify without exposing a separate vendor experience to their clients. White-label work can be structured project by project, as overflow capacity, as a specialist implementation layer, or as recurring technical delivery with agreed communication, ownership, access, and handoff rules."],
    ["How projects start", "Projects usually begin with the problem, users, current systems, constraints, data, integrations, risk, ownership, timeline, and the outcome the business wants to improve. From there we can define a technical roadmap, delivery phases, architecture, responsibilities, milestones, testing approach, launch plan, documentation, and support model before implementation moves too far."],
  ],
  "/services": [
    ["AI automation and customer operations", "AI automation can support lead qualification, inbound and outbound communication, appointment booking, customer support, document handling, internal notifications, workflow routing, and approved business actions. The implementation is designed around real operating rules, CRM data, calendars, communications, permissions, escalation paths, and reporting so the automation fits the business process instead of creating another disconnected layer."],
    ["CRM and revenue systems", "CRM work can include pipeline design, lead routing, contact and opportunity structure, calendars, follow-up, sales automation, reporting, integrations, migration, permissions, and custom interfaces. The goal is to make the customer journey easier to operate from capture through qualification, follow-up, booking, sale, onboarding, and ongoing service."],
    ["Websites, portals, CMS and SaaS", "Logicsify builds custom websites, portals, CMS platforms, dashboards, SaaS products, e-commerce experiences, and custom web applications. Projects can include authentication, user roles, admin tooling, payments, APIs, integrations, analytics, structured content, performance engineering, search optimization, and deployment ownership depending on the product and business requirements."],
    ["Mobile, design and product experience", "Mobile application and UI/UX work covers user journeys, information architecture, wireframes, interfaces, responsive systems, prototypes, implementation-ready design, connected backend services, notifications, analytics, device capabilities, and release preparation. Design decisions are tied to the task the user needs to complete rather than visual novelty alone."],
    ["Cybersecurity and technical operations", "Security and operations work can cover application and website hardening, authentication and access review, secrets handling, dependency risk, API exposure, cloud configuration, deployment workflows, backups, monitoring, incident readiness, maintenance, and practical remediation. The exact controls depend on the system, data, access model, and risk profile."],
    ["Growth and ongoing support", "SEO, digital marketing, branding, e-commerce optimization, maintenance, cloud operations, and recurring development support can be combined with technical delivery when the project needs more than a one-time build. Engagements are scoped around measurable responsibilities, access, reporting, and the operating cadence required after launch."],
  ],
  "/services/white-label-development": [
    ["Why agencies use white-label development", "White-label delivery gives an agency access to additional engineering, automation, CRM, product, integration, and technical operations capability without permanently hiring every specialist required for every client opportunity. It is useful when an agency wins work outside its current stack, reaches internal capacity, needs a specialist capability quickly, or wants to offer broader solutions while preserving one consistent client relationship."],
    ["How communication can be structured", "The working model can range from fully behind-the-scenes delivery to selective technical participation in discovery, architecture, demos, implementation reviews, and handoff calls. The agency decides how Logicsify is introduced, which channels are used, who communicates with the client, how escalation works, and what information is shared at each stage."],
    ["Engineering and implementation scope", "White-label work can include websites, portals, CMS platforms, SaaS products, dashboards, mobile applications, APIs, e-commerce, AI agents, workflow automation, CRM implementation, payments, authentication, user roles, integrations, deployment, monitoring, QA, documentation, and ongoing support. Scope is defined around the client requirement rather than a fixed package."],
    ["Ownership, repositories and access", "Source-code ownership, repository access, credentials, hosting, domains, third-party accounts, documentation, deployment ownership, handover, and support responsibilities should be agreed before launch. This creates a clear boundary between the agency, Logicsify, and the end client and reduces confusion when a project moves from build into operation."],
    ["Quality assurance and handoff", "Delivery includes reviewable milestones, testing of normal and failure paths, integration validation, responsive and browser checks where relevant, release preparation, documentation, and an agreed handoff process. The agency can review work before it is presented to the end client so the final experience remains consistent with its own delivery standards."],
    ["Starting with one project", "Agencies do not need to commit to a large retained model immediately. A single project can establish how scoping, communication, review, QA, delivery, and handoff work in practice. If the partnership fits, the same operating model can then expand into recurring capacity, overflow support, or a specialist delivery pod for future opportunities."],
  ],
  "/about": [
    ["A multidisciplinary delivery model", "Connected projects often cross multiple disciplines at once. A CRM implementation may require forms, websites, automation, integrations, reporting, permissions, data migration, and user training. A SaaS product may require product strategy, interface design, engineering, billing, authentication, deployment, analytics, and ongoing iteration. Logicsify brings those disciplines together around one operating problem instead of treating each as an unrelated vendor task."],
    ["Business ownership and technical ownership", "Good delivery depends on more than writing code. We define who owns requirements, approvals, data, credentials, content, integrations, testing, launch decisions, documentation, and support. This makes project boundaries visible and helps the client understand what must be supplied internally and what Logicsify is responsible for delivering."],
    ["Designed for long-term ownership", "Where the engagement requires it, projects are structured around source-code handover, repository access, documentation, admin ownership, deployment access, maintainability, and a clear path for future changes. The objective is to avoid creating unnecessary technical dependency simply because Logicsify delivered the initial implementation."],
    ["Working with agencies and internal teams", "Logicsify can lead a full implementation, deliver a defined technical scope, work alongside an internal team, or operate as a white-label partner behind an agency or consultant. The engagement structure depends on the client's existing capability, desired ownership model, project risk, communication requirements, and the amount of recurring delivery capacity required."],
  ],
  "/insights": [
    ["Implementation-focused publishing", "Logicsify Insights is intended to answer practical questions that appear during real software, AI, CRM, website, automation, cybersecurity, and digital growth projects. Articles should explain the decision, constraints, tradeoffs, implementation considerations, and situations in which a different approach may be more appropriate instead of relying on generic trend summaries."],
    ["Sources, authorship and updates", "Where an article depends on external facts, product changes, statistics, platform documentation, or industry developments, source links can be included so readers can verify the underlying information. Published and updated dates, named authors, reading time, featured-image descriptions, and related resources provide additional context for both readers and search systems."],
    ["Answer-first structure", "For specific questions, the most useful answer should appear early, followed by the reasoning, examples, tradeoffs, risks, and implementation detail needed to make the answer actionable. This structure also makes it easier for search engines and AI retrieval systems to identify the passage that directly addresses a user's question."],
    ["Connected to proof and services", "Educational content is linked to relevant services, case studies, portfolio work, comparisons, guides, and planning tools. That allows a reader to move from an explanation to project evidence, a decision framework, or an implementation path without turning every article into a sales page."],
  ],
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}

function stripExistingStaticSeo(html) {
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta[^>]+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, "");
}

function schemaFor(page) {
  const pageUrl = `${ORIGIN}${page.path === "/" ? "/" : page.path}`;
  const graph = [
    {
      "@type": "Organization",
      "@id": `${ORIGIN}/#organization`,
      name: "Logicsify",
      url: `${ORIGIN}/`,
      logo: `${ORIGIN}/logicsify-logo-dark.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${ORIGIN}/#website`,
      name: "Logicsify",
      url: `${ORIGIN}/`,
      publisher: { "@id": `${ORIGIN}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${ORIGIN}/#website` },
      about: { "@id": `${ORIGIN}/#organization` },
      inLanguage: "en",
    },
  ];

  if (page.type === "Service") {
    graph.push({
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: page.h1,
      description: page.description,
      url: pageUrl,
      provider: { "@id": `${ORIGIN}/#organization` },
      areaServed: "Worldwide",
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
}

function fallbackMarkup(page) {
  const expansionKey = page.key || page.path;
  const visibleSections = [
    ...(Array.isArray(page.sections) ? page.sections : []),
    ...(seoExpansion[expansionKey] || []),
  ];
  const sections = visibleSections
    .map(
      ([heading, body]) =>
        `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(body)}</p></section>`,
    )
    .join("");

  return `<div data-seo-fallback="true">
    <header class="seo-fallback-header">
      <a href="/" aria-label="Logicsify home"><img src="/logicsify-logo-light.png" alt="Logicsify" width="180" height="51" /></a>
      <nav aria-label="Primary">
        <a href="/services">Services</a>
        <a href="/services/white-label-development">White Label</a>
        <a href="/work">Case Studies</a>
        <a href="/insights">Insights</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
    <main class="seo-fallback-main">
      <p class="seo-fallback-eyebrow">Logicsify</p>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="seo-fallback-intro">${escapeHtml(page.intro)}</p>
      ${sections}
      <p class="seo-fallback-links"><a href="/technical-roadmap">Get a Free Technical Roadmap</a> · <a href="/contact">Contact Logicsify</a></p>
    </main>
  </div>`;
}

function buildHtml(template, page) {
  const pageUrl = `${ORIGIN}${page.path === "/" ? "/" : page.path}`;
  const image = page.image || DEFAULT_IMAGE;
  let html = stripExistingStaticSeo(template);
  const head = `
    <title data-seo-prerender="true">${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}" data-seo-prerender="true" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" data-seo-prerender="true" />
    <link rel="canonical" href="${escapeAttr(pageUrl)}" data-seo-prerender="true" />
    <meta property="og:title" content="${escapeAttr(page.title)}" data-seo-prerender="true" />
    <meta property="og:description" content="${escapeAttr(page.description)}" data-seo-prerender="true" />
    <meta property="og:type" content="website" data-seo-prerender="true" />
    <meta property="og:url" content="${escapeAttr(pageUrl)}" data-seo-prerender="true" />
    <meta property="og:site_name" content="Logicsify" data-seo-prerender="true" />
    <meta property="og:image" content="${escapeAttr(image)}" data-seo-prerender="true" />
    <meta name="twitter:card" content="summary_large_image" data-seo-prerender="true" />
    <meta name="twitter:title" content="${escapeAttr(page.title)}" data-seo-prerender="true" />
    <meta name="twitter:description" content="${escapeAttr(page.description)}" data-seo-prerender="true" />
    <meta name="twitter:image" content="${escapeAttr(image)}" data-seo-prerender="true" />
    <script type="application/ld+json" data-seo-prerender="true">${schemaFor(page)}</script>
    <style data-seo-prerender="true">
      [data-seo-fallback]{min-height:100vh;background:#050706;color:#fff;font-family:Sora,Inter,system-ui,sans-serif}
      .seo-fallback-header{max-width:1360px;margin:auto; padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid rgba(255,255,255,.08)}
      .seo-fallback-header>a{display:inline-flex;align-items:center;color:#fff;text-decoration:none}
      .seo-fallback-header>a img{display:block;width:180px;height:auto}
      .seo-fallback-header nav{display:flex;gap:20px;flex-wrap:wrap}
      .seo-fallback-header nav a,.seo-fallback-links a{color:#9fe06d;text-decoration:none}
      .seo-fallback-main{max-width:1180px;margin:auto; padding:72px 32px 96px}
      .seo-fallback-eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8bcf3c}
      .seo-fallback-main h1{font-size:clamp(42px,7vw,88px);line-height:.98;letter-spacing:-.045em;max-width:1000px;margin:18px 0 24px}
      .seo-fallback-intro{font-size:clamp(18px,2vw,24px);line-height:1.6;max-width:900px;color:rgba(255,255,255,.75)}
      .seo-fallback-main section{max-width:900px;margin-top:48px}
      .seo-fallback-main h2{font-size:clamp(26px,4vw,42px);letter-spacing:-.025em;margin:0 0 14px}
      .seo-fallback-main section p{font-size:17px;line-height:1.8;color:rgba(255,255,255,.7)}
      .seo-fallback-links{margin-top:56px}
      @media(max-width:720px){.seo-fallback-header nav{display:none}.seo-fallback-main{padding-top:48px}.seo-fallback-main h1{font-size:48px}}
    </style>`;

  html = html.replace("</head>", `${head}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallbackMarkup(page)}</div>`);
  return html;
}

const template = await readFile(templatePath, "utf8");
if (!template.includes('<div id="root"></div>')) {
  throw new Error("The built index.html no longer contains the expected #root mount point.");
}

let count = 0;
for (const page of pages) {
  const relative = page.path === "/" ? "home" : page.path.replace(/^\/+/, "");
  const targetDir = path.join(distDir, "_seo", relative);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, "index.html"), buildHtml(template, page));
  count += 1;
}

const homePage = pages.find((page) => page.path === "/");
if (homePage) {
  await writeFile(templatePath, buildHtml(template, homePage));
}

console.log(`Generated ${count} crawler-visible SEO HTML shells plus the crawlable homepage.`);
