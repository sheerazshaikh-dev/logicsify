# Logicsify Integrations and Demos QA

## Passed

- Route generation: 53 routes
- Static source audit: 144 files
- Internal URL audit
- Service link audit: 39 canonical routes
- No public Industries links detected
- TypeScript/TSX syntax transpilation: 143 files
- PHP syntax: `api/index.php`
- PHP syntax: `integrations-demos-upgrade.php`
- PHP syntax: `resource-services-upgrade.php`
- Sitemap generation: 60 public routes

## Must be run locally

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

The execution environment could not install dependencies because its internal npm proxy returned a 404 for a package tarball.

## Manual production checks

1. Confirm 14 entries appear in Admin → Integrations.
2. Edit one integration and verify it appears on `/integrations`.
3. Confirm the Services mega menu includes Supported Integrations.
4. Test the Services accordion on mobile.
5. Run each related demo on the AI core page and all nine AI subservice pages.
6. Confirm demos do not submit forms or change production data.
7. Confirm `/automation-lab` still contains all five full demos.
