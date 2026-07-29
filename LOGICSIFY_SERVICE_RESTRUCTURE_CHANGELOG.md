# Logicsify Service Restructure Changelog

## Positioning

Primary company positioning is now:

“We build AI-powered sales, customer service, and business operations systems.”

Services are deliberately separated into three Core Services and secondary Other Services.

## Core Services

- AI Automation & Voice Agents
- CRM & Revenue Operations
- Custom Websites, Portals & CMS Platforms

Each has a dedicated CMS-backed page with problems solved, capabilities, workflow, integrations, use cases, process, related work, FAQs, and project CTA.

## Other Services

- Mobile App Development
- UI/UX Design
- SEO & Digital Marketing
- Branding & Graphic Design
- E-commerce Development
- Cloud Deployment
- Website Maintenance
- Cybersecurity
- Staff Augmentation

Homepage and Services-page cards read titles and excerpts from the existing service CMS. Cloud Deployment, Website Maintenance, Cybersecurity, and Staff Augmentation link to anchored capability sections on the consolidated Cloud & Maintenance page.

## Industries removal

Removed from public product surfaces:

- Desktop navigation
- Mobile navigation
- Footer
- Homepage
- Services page
- Admin sidebar
- Admin menu content selector
- Sitemap
- SEO generator
- Public source-link surface

Legacy industry route files remain only as client-side fallbacks, while Vercel provides permanent edge redirects. Existing industry database records are archived, not deleted.

## Navigation

Exact root order:

- Home
- About
- Services
- Work
- Insights
- Contact

Services mega menu:

- Core Services
- Other Services

The API’s “Restore default Services mega menu” action now restores this structure.

## Homepage

- New business-systems positioning in the hero and introduction.
- Three premium Core Service cards.
- Smaller Other Service cards below.
- CMS-backed service card titles and descriptions.
- Existing case studies, insights, forms, analytics, animations, and visual identity preserved.

## Services page

New hierarchy:

1. Hero
2. Core Services
3. Connected business ecosystem
4. Other Services
5. Process
6. Supported integrations
7. Selected work when real case studies exist
8. Final CTA

## CMS and admin

- Existing service content type reused.
- Service editor supports structured problems, capabilities, workflow, technology/integration labels, use cases, FAQs, and related services.
- New service records are inserted only when missing.
- Legacy records are archived instead of deleted.
- Industries admin route removed from the React route tree.
- Existing backend authentication, permissions, leads, bookings, case studies, insights, media, menus, settings, and revisions remain intact.

## API and database

API change:

- Default Services mega-menu structure and restoration endpoint updated.

One-time updater:

- `service-structure-upgrade.php`

The updater performs record and navigation changes. It does not create a second CMS, admin, or authentication system.

## SEO and redirects

Canonical service URLs:

- `/services`
- `/services/ai-automation-voice-agents`
- `/services/crm-revenue-operations`
- `/services/custom-websites-portals-cms`
- `/services/mobile-app-development`
- `/services/ui-ux-design`
- `/services/seo-digital-marketing`
- `/services/branding`
- `/services/cloud-maintenance`

The sitemap excludes Industries and old service URLs. `vercel.json` contains permanent redirects for removed industry pages and legacy service routes.

## Environment variables

No new environment variable is required.

Existing requirement:

`VITE_API_URL=https://backend.logicsify.com/api`

## Changed frontend files

- `public/sitemap.xml`
- `public/rss.xml`
- `scripts/generate-seo-files.mjs`
- `scripts/qa-routes.mjs`
- `scripts/qa-source-links.mjs`
- `scripts/static-qa.mjs`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/content-manager.tsx`
- `src/components/cta-section.tsx`
- `src/components/service-page-template.tsx`
- `src/components/site-footer.tsx`
- `src/components/site-header.tsx`
- `src/components/technical-roadmap-cta.tsx`
- `src/lib/content-routes.ts`
- `src/lib/service-data.tsx`
- `src/lib/site-data.ts`
- `src/routeTree.gen.ts`
- `src/routes/README.md`
- `src/routes/admin/menus.tsx`
- `src/routes/index.tsx`
- `src/routes/industries/index.tsx`
- `src/routes/industries/$slug.tsx`
- `src/routes/services/index.tsx`
- `src/routes/services/$slug.tsx`
- `src/routes/work/index.tsx`
- `vercel.json`

Deleted frontend file:

- `src/routes/admin/industries.tsx`

## Changed backend files

- `api/index.php`

New one-time backend file:

- `service-structure-upgrade.php`
