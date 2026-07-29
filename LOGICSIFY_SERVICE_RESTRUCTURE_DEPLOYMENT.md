# Logicsify Service Restructure Deployment

## Release objective

This release positions Logicsify around three Core Services and moves supporting capabilities into Other Services. Industries are removed from public navigation, pages, homepage sections, footer, sitemap, admin navigation, and managed menus. Existing industry records are archived rather than deleted.

## 1. Back up production

Before changing anything:

1. Export the current MySQL database through phpMyAdmin.
2. Download the current `backend.logicsify.com` files.
3. Confirm the existing React/Vercel deployment can be rolled back from GitHub or Vercel.

## 2. Apply the backend hotfix first

Upload the contents of `logicsify-service-restructure-backend-hotfix.zip` to the document root of:

`backend.logicsify.com`

Overwrite matching files. The package does not include `private/config.php` and does not replace database credentials.

Open:

`https://backend.logicsify.com/service-structure-upgrade.php`

Enter the existing setup key. The updater:

- Verifies or adds the existing mega-menu columns safely.
- Creates the new Core Service and Other Service CMS records when missing.
- Archives legacy service records rather than deleting them.
- Archives industry records rather than deleting them.
- Rebuilds the managed header menu without Industries.
- Removes industry links from managed menus.
- Updates default positioning and CTA settings.

After success, delete:

`service-structure-upgrade.php`

Do not leave the updater on production.

## 3. Apply the React frontend

Recommended: replace the current project with the complete npm/Vite package.

For the smaller hotfix package, extract it over the current project and overwrite matching files. Then manually delete:

`src/routes/admin/industries.tsx`

The complete package already excludes that file.

Run:

```bash
npm ci
npm run routes:generate
npm run qa:static
npm run qa:links
npm run typecheck
npm run build
```

Do not deploy if `typecheck` or `build` fails.

## 4. Test locally

Run:

```bash
npm run dev
```

Verify at `http://localhost:8080`:

- `/`
- `/services`
- `/services/ai-automation-voice-agents`
- `/services/crm-revenue-operations`
- `/services/custom-websites-portals-cms`
- `/services/mobile-app-development`
- `/services/ui-ux-design`
- `/services/seo-digital-marketing`
- `/services/branding`
- `/services/cloud-maintenance`
- `/work`
- `/insights`
- `/contact`
- `/admin/services`
- `/admin/menus`

Also confirm these old URLs redirect:

- `/industries`
- `/industries/home-services`
- `/services/ai-automations`
- `/services/crm-automation`
- `/services/web-design-development`

## 5. Push to GitHub

```bash
git add -A
git commit -m "Restructure Logicsify around core business systems"
git push
```

`git add -A` is required because it records the deleted Industries admin route.

## 6. Vercel

Keep:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Build settings:

- Install: `npm ci --no-audit --no-fund`
- Build: `npm run build`
- Output: `dist`

The included `vercel.json` contains permanent redirects for removed industry and legacy service URLs, followed by the SPA rewrite.

## 7. Production verification

After deployment:

1. Hard-refresh the homepage and Services page.
2. Open the Services mega menu on desktop and mobile.
3. Confirm Industries is absent everywhere public.
4. Edit each Core Service in Admin → Services and confirm the public page updates.
5. Edit an Other Service and confirm the homepage/Services card updates.
6. Save the header menu in Admin → Menus.
7. Test Work, Insights, contact forms, admin login, media, tracking, and existing integrations.
8. Check the browser console and network panel for errors.
9. Confirm `https://logicsify.com/sitemap.xml` contains no `/industries` URL.
