# Logicsify Integrations and Demos Changelog

## Frontend

### New files

- `src/routes/integrations.tsx`
- `src/components/related-automation-demo.tsx`

### Updated files

- `src/components/service-page-template.tsx`
- `src/components/systems-we-integrate.tsx`
- `src/components/site-header.tsx`
- `src/components/site-footer.tsx`
- `src/lib/content-routes.ts`
- `src/routeTree.gen.ts`
- `scripts/generate-seo-files.mjs`
- `scripts/qa-routes.mjs`
- `public/sitemap.xml`
- `public/rss.xml`

## Backend

### New file

- `integrations-demos-upgrade.php`

### Updated files

- `api/index.php`
- `resource-services-upgrade.php`

## API behavior

No new API route was required. The existing generic CMS integration endpoints are reused.

Integration public/admin preview URLs now resolve to:

- `/integrations#<integration-slug>`

instead of the retired API-integrations service anchor.

## Database

No new table was added.

The updater creates published `content_items` records using the existing `integration` content type. Existing matching records are preserved and only blank content fields are filled.
