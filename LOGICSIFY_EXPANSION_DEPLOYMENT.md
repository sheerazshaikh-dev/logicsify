# Logicsify Expansion Deployment

## Architecture preserved

- `logicsify.com`: npm + Vite + React public website and existing React admin.
- `backend.logicsify.com`: existing PHP/MySQL API and uploads.
- No second admin, authentication system, analytics library, or parallel blog system was created.

## 1. Back up production

Before uploading anything:

1. Export the current MySQL database from phpMyAdmin.
2. Download the current `backend.logicsify.com` files.
3. Confirm the current React repository is committed.

## 2. Apply the backend extension

Upload the contents of `logicsify-expansion-backend-hotfix.zip` to the document root of `backend.logicsify.com` and overwrite matching files.

The hotfix deliberately excludes:

- `private/config.php`
- live uploads
- credentials

Open:

```text
https://backend.logicsify.com/expansion-upgrade.php
```

Enter the existing setup key. The upgrade:

- extends the existing CMS content enum;
- adds missing mega-menu columns only when absent;
- fills only empty CTA/SEO settings;
- adds requested navigation roots without deleting existing content;
- adds initial resources, comparisons, and engagement models as drafts only.

Delete `expansion-upgrade.php` immediately after success.

Verify:

```text
https://backend.logicsify.com/api/health
https://backend.logicsify.com/api/public/menus/header
https://backend.logicsify.com/api/public/content/resource
https://backend.logicsify.com/api/public/content/comparison
```

## 3. Replace or update the frontend

Use `logicsify-expansion-frontend-npm-vercel.zip`.

Create `.env.local`:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Run:

```bash
npm ci
npm run qa
npm run build
npm run dev
```

Local URLs:

```text
http://localhost:8080
http://localhost:8080/admin/login
```

## 4. Push to GitHub

From the frontend project:

```bash
git add -A
git commit -m "Expand Logicsify resources, demos, case studies and SEO"
git push
```

## 5. Vercel

The included `vercel.json` uses:

```text
Framework: Vite
Install: npm ci --no-audit --no-fund
Build: npm run build
Output: dist
```

Set this environment variable for Production, Preview, and Development:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Redeploy without the previous build cache after replacing the project.

## 6. Production smoke test

Test these public routes:

```text
/technical-roadmap
/automation-lab
/project-estimator
/work
/industries/saas-startups
/resources
/comparisons/custom-cms-vs-wordpress
/engagement-models
/insights
```

Test these admin routes:

```text
/admin/case-studies
/admin/resources
/admin/comparisons
/admin/engagement-models
/admin/integrations
/admin/insights
/admin/team
/admin/settings
/admin/menus
```

Then verify:

1. Existing admin login and roles.
2. Existing pages, visual editor, forms, bookings, media, and menus.
3. Technical roadmap submission appears in Leads.
4. Project estimator submission appears in Leads.
5. Resource request records a lead and returns a short-lived download link.
6. Newsletter signup records a lead.
7. Published case studies, resources, insights, team members, integrations, and comparisons appear publicly.
8. Draft and archived content remains hidden.
9. Mobile mega menus and body-scroll lock.
10. Sitemap, RSS, canonicals, robots, and admin noindex headers.

## Hosting limits for resource files

Use cPanel MultiPHP INI Editor when large files are required:

```ini
upload_max_filesize = 100M
post_max_size = 110M
max_execution_time = 300
max_input_time = 300
```

Do not expose `private/config.php`, setup keys, database credentials, or storage paths in the frontend.
