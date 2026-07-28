# Logicsify Expansion Changelog

## New public routes

- `/technical-roadmap`
- `/automation-lab`
- `/project-estimator`
- `/resources`
- `/resources/:slug`
- `/comparisons`
- `/comparisons/:slug`
- `/engagement-models`

## Reworked public routes

- `/`
- `/work`
- `/work/:slug`
- `/industries/:slug`
- `/insights`
- `/insights/:slug`
- `/about`
- service detail pages through the existing template

## New admin routes

- `/admin/resources`
- `/admin/comparisons`
- `/admin/engagement-models`
- `/admin/integrations`

## Database migration

`expansion-upgrade.php` safely extends `content_items.content_type` with:

- `resource`
- `comparison`
- `engagement_model`
- `integration`

It also adds only missing mega-menu columns and inserts requested starter records as drafts. Existing records are not renamed or deleted.

## API changes

Extended existing content APIs to support the four new content types.

Added:

- `POST /api/public/newsletter`
- `POST /api/public/resource-download`
- `GET /api/public/resource-file?token=...`

Resource files are removed from normal public CMS responses. Successful lead capture returns a signed 15-minute download URL. Local uploaded files are streamed by the API without exposing server paths.

Existing contact submission is reused for:

- technical roadmap requests;
- project estimator summaries;
- newsletter subscriptions;
- resource download leads.

## Admin changes

The existing content manager was extended rather than replaced.

Added structured fields for:

- case-study objectives, work, screenshots, stack, integrations, results, relationships, testimonial and SEO;
- insight categories, author, article type, sources, relationships and SEO;
- resources, cover/preview/download files, audience, inclusions and SEO;
- comparisons, option labels, decision rows, risks, FAQs and related services;
- engagement-model responsibilities, cadence, advantages, tradeoffs and optional approved starting price;
- integration category, logo, alt text and URL;
- team skills, LinkedIn and ordering;
- global legal, service-area and support-policy settings.

## Reusable components

- `TechnicalRoadmapCTA`
- `StickyMobileRoadmapCTA`
- `SystemsWeIntegrate`
- expanded `PageHero`
- expanded `SiteHeader`
- expanded `SiteFooter`
- privacy-safe analytics/source tracking helpers

## Navigation

Desktop navigation:

- Services
- Industries
- Work
- Automation Lab
- Resources
- Insights
- About

Primary CTA:

- Get a Free Technical Roadmap

Services, Industries, Resources, and Insights support managed mega-menu content. Mobile uses accessible accordion groups and locks body scrolling.

## Conversion layer

- Reusable roadmap CTA across key pages.
- Dedicated roadmap form connected to the existing Leads system.
- Source-page tracking without sending personal form values to analytics.
- Sticky mobile roadmap CTA.
- Estimator output submits the planning summary to the existing backend.

## Case studies

- Dynamic listing and detail pages.
- Search, filters, featured work, load more and empty state.
- Structured sections for problem, objectives, timeline, work, solution, stack, integrations, screenshots, process, results, testimonial and related content.
- No invented clients or numerical results.

## Automation Lab

Controlled demonstrations for:

- lead qualification;
- voice booking flow;
- CRM workflow map;
- document extraction;
- support chatbot.

No anonymous outbound calls, live CRM writes, permanent demo document storage, unsupported pricing, or guarantees.

## Project estimator

- Eight-step scope builder.
- Service-specific features.
- Complexity, phases, integrations, engagement model and assumptions.
- Explicit non-binding estimate notice.
- Copy summary and lead submission.

## Industries

Unique pages for:

- SaaS and Startups
- Home Services
- Healthcare
- E-commerce
- Agencies

Healthcare copy avoids unsupported HIPAA claims.

## Resources

- Dynamic CMS listing/detail.
- Search, filters and featured resource.
- Gated form, lead source tracking and short-lived delivery.
- Draft resources remain hidden.

## Insights and news

The existing Insight content type remains the single publishing system.

Added:

- search and category filters;
- featured, popular and company-news groupings;
- newsletter capture;
- author, dates, reading time and sources;
- desktop/mobile table of contents;
- related content and social sharing;
- generated RSS.

## SEO

- Unique route metadata.
- Canonicals and Open Graph fields.
- Organization, WebSite and ProfessionalService JSON-LD.
- Dynamic Article and breadcrumb data where appropriate.
- Generated sitemap and RSS from published CMS content.
- Admin routes excluded from sitemap and marked noindex.
- robots rules for admin, API, previews and temporary files.

## Analytics events

- `navigation_item_clicked`
- `mega_menu_opened`
- `technical_roadmap_cta_clicked`
- `technical_roadmap_form_started`
- `technical_roadmap_form_submitted`
- `case_study_opened`
- `case_study_filter_used`
- `case_study_cta_clicked`
- `automation_lab_view`
- `automation_demo_selected`
- `automation_demo_started`
- `automation_demo_completed`
- `automation_demo_reset`
- `automation_demo_cta_clicked`
- `automation_demo_lead_submitted`
- `estimator_started`
- `estimator_step_completed`
- `estimator_completed`
- `estimator_submitted`
- `resource_opened`
- `resource_downloaded`
- `resource_form_submitted`
- `insight_opened`
- `insight_category_selected`
- `insight_search_used`
- `insight_share_clicked`
- `insight_cta_clicked`
- `comparison_opened`
- `comparison_cta_clicked`

The existing data-layer abstraction is reused. Personal fields and uploaded contents are filtered from analytics.

## Principal changed files

### Frontend core

- `package.json`
- `vercel.json`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/rss.xml`
- `scripts/generate-route-tree.mjs`
- `scripts/generate-seo-files.mjs`
- `scripts/static-qa.mjs`
- `scripts/qa-routes.mjs`
- `scripts/run-qa.mjs`
- `src/routeTree.gen.ts`
- `src/styles.css`

### Frontend shared

- `src/components/page-hero.tsx`
- `src/components/site-header.tsx`
- `src/components/site-footer.tsx`
- `src/components/site-layout.tsx`
- `src/components/service-page-template.tsx`
- `src/components/technical-roadmap-cta.tsx`
- `src/components/sticky-mobile-roadmap-cta.tsx`
- `src/components/systems-we-integrate.tsx`
- `src/lib/analytics.ts`
- `src/lib/admin-api.ts`
- `src/lib/content-routes.ts`
- `src/lib/expansion-data.ts`
- `src/lib/logicsify-api.ts`
- `src/lib/site-data.ts`

### Frontend public routes

- `src/routes/index.tsx`
- `src/routes/about.tsx`
- `src/routes/technical-roadmap.tsx`
- `src/routes/automation-lab.tsx`
- `src/routes/project-estimator.tsx`
- `src/routes/work/index.tsx`
- `src/routes/work/$slug.tsx`
- `src/routes/industries/$slug.tsx`
- `src/routes/resources/index.tsx`
- `src/routes/resources/$slug.tsx`
- `src/routes/comparisons/index.tsx`
- `src/routes/comparisons/$slug.tsx`
- `src/routes/engagement-models.tsx`
- `src/routes/insights/index.tsx`
- `src/routes/insights/$slug.tsx`

### Frontend admin

- `src/components/admin/admin-shell.tsx`
- `src/components/admin/content-manager.tsx`
- `src/routes/admin/resources.tsx`
- `src/routes/admin/comparisons.tsx`
- `src/routes/admin/engagement-models.tsx`
- `src/routes/admin/integrations.tsx`
- `src/routes/admin/settings.tsx`

### Backend

- `api/index.php`
- `private/schema.sql`
- `expansion-upgrade.php`
