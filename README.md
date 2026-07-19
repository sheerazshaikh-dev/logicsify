# Logicsify Website, React Admin, and Headless CMS

Production-ready TanStack Start/React project for `logicsify.com`, with the Brand & Brains-style admin panel under `/admin` and an API-only PHP/MySQL backend for `backend.logicsify.com`.

## Local development

```bash
bun install
bun run dev
```

Open `http://localhost:8080` and `http://localhost:8080/admin/login`.

Create `.env.local` when needed:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

## Validation

```bash
bun run qa
bun run build
```

`bun run qa` performs TypeScript, ESLint, source-link, Vercel build, public-route, admin-route, fallback, and legacy-redirect checks.

## Deployment

Read:

- `LOGICSIFY_PRODUCTION_DEPLOYMENT.md`
- `LOGICSIFY_QA_REPORT.md`
- `backend-logicsify/DEPLOYMENT.md`

The live backend secret file `backend-logicsify/private/config.php` is intentionally excluded.
