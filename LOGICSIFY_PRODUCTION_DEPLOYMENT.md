# Logicsify Production Deployment

This release keeps the original Logicsify public design and uses the Brand & Brains-style React admin panel with a separate PHP/MySQL API.

## Architecture

```text
logicsify.com
├── Public React website
└── React admin panel at /admin

backend.logicsify.com
└── PHP/MySQL API only
```

## 1. Back up production

Before replacing files:

- Export the current MySQL database from phpMyAdmin.
- Download the existing `backend.logicsify.com` files.
- Keep the existing `backend-logicsify/private/config.php` safe.

## 2. Deploy the backend

Upload the contents of `backend-logicsify-production-api.zip` directly to the document root for `backend.logicsify.com`.

The package intentionally does not contain `private/config.php`, so uploading it will not overwrite live database credentials.

For an existing installation, open:

```text
https://backend.logicsify.com/production-upgrade.php
```

Enter the setup key from the existing private configuration. The upgrade:

- Adds missing menu and mega-menu columns.
- Repairs old service and industry links such as `/web-design-development`.
- Preserves custom menu children.
- Seeds the original Logicsify Services mega menu only when Services has no children.
- Copies incompatible old visual-editor snapshots into revision history.
- Removes only incompatible snapshots from live rendering so the original coded page returns.

After success, delete these files from the live server:

```text
production-upgrade.php
setup.php
apply-menu-hotfix.php
apply-settings-hotfix.php
```

Verify:

```text
https://backend.logicsify.com/
https://backend.logicsify.com/api/health
https://backend.logicsify.com/api/public/menus/header
https://backend.logicsify.com/api/public/content/service/ai-automations
```

## 3. Push the React project to GitHub

Extract `logicsify-production-ready-react-admin.zip`, open that folder, then run:

```bash
bun install
bun run qa

git init
git branch -M main
git add .
git commit -m "Production-ready Logicsify website and admin"
git remote add origin https://github.com/YOUR-USERNAME/logicsify.git
git push -u origin main
```

The repository should include `bun.lock`. It should not include `.env`, `.env.local`, `node_modules`, `.vercel`, or any backend private configuration.

## 4. Deploy on Vercel

Import the GitHub repository into Vercel.

Add this environment variable for Production, Preview, and Development:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Use:

- Install command: `bun install`
- Build command: `bun run build`
- Output directory: leave empty; TanStack Start writes the Vercel Build Output API automatically.

Deploy, then verify:

```text
https://logicsify.com/
https://logicsify.com/services/ai-automations
https://logicsify.com/services/web-design-development
https://logicsify.com/industries/healthcare
https://logicsify.com/work/saas-intelligence-platform
https://logicsify.com/insights/website-vs-web-app-vs-saas
https://logicsify.com/admin/login
```

Old root service URLs now redirect to their correct collection URLs, for example:

```text
/web-design-development → /services/web-design-development
/ai-automations → /services/ai-automations
```

## 5. Local development

Create `.env.local`:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Run:

```bash
bun install
bun run dev
```

Open:

```text
http://localhost:8080/
http://localhost:8080/admin/login
```

The backend allows `http://localhost:8080` through CORS.

## 6. Post-deployment admin checks

1. Log in at `/admin/login`.
2. Open Menus, save Header and Footer once, and confirm no HTTP 500 response.
3. Confirm Coming Soon can be checked and unchecked.
4. Confirm the Services mega menu still uses the original Logicsify design.
5. Open a service in the visual editor and confirm the preview URL is `/services/{slug}`.
6. Make a small text edit, save, refresh the public page, then restore the prior revision.
7. Submit the contact form and a test booking, then confirm both appear in admin.
8. Configure SMTP before enabling customer email confirmations.
