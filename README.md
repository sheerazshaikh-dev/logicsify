# Logicsify Vite Website + React Admin

Production-ready Vite/React single-page application for `logicsify.com`.
The public website and Brand & Brains-style React admin panel live in the same
project. The PHP/MySQL backend remains separately hosted at
`https://backend.logicsify.com/api`.

## Local development

```bash
bun install
bun run dev
```

Open:

- Website: `http://localhost:8080`
- Admin: `http://localhost:8080/admin/login`

Create `.env.local` from `.env.example`:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

## Quality checks

```bash
bun run qa
```

This runs TypeScript, ESLint, source-link validation, the Vite production build,
and deep-route fallback checks.

## Production build

```bash
bun run build
```

Vite outputs the deployable site to `dist/`.

## Vercel

The included `vercel.json` configures:

- Bun installation
- Vite production build
- `dist` output
- SPA rewrites for all public and admin routes

Add `VITE_API_URL=https://backend.logicsify.com/api` in Vercel Environment Variables.
