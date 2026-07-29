# Logicsify Service Restructure QA Report

## Passed in this environment

- Static import resolution: passed.
- Route declaration and generated route-tree audit: passed.
- Internal URL audit: passed.
- Public Industries reference audit: passed.
- Canonical Core Service route audit: passed.
- Sitemap generation: passed with 32 public routes.
- Sitemap Industries exclusion: passed.
- Vercel SPA rewrite audit: passed.
- Required Vercel redirect audit: passed.
- TypeScript syntax transpilation: passed across 138 TypeScript source files.
- PHP syntax: passed for `api/index.php` and `service-structure-upgrade.php`.

## Not completed in this environment

A clean npm dependency installation could not complete because the execution environment rewrote the public npm tarball request to an unavailable internal package proxy and returned 404 for `zod`.

Because dependencies were unavailable here, these commands must be run locally or in Vercel:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run qa:routes
```

Do not treat this release as deployable if TypeScript or Vite reports an error locally.

## Required manual production checks

- Existing administrator login.
- Database updater against the live MariaDB version.
- Service create/edit/save/revision flows.
- Menu save and restore-default flow.
- Contact, roadmap, and booking submissions.
- Existing analytics and third-party integrations.
- Vercel redirects on the deployed domain.
- Desktop, tablet, and mobile visual regression.
