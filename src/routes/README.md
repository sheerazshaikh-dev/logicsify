# Routes

This is a Vite single-page application using TanStack Router file-based routes.
The `@tanstack/router-plugin` Vite plugin generates `src/routeTree.gen.ts` from
this directory during development and production builds.

Vercel rewrites browser requests to `index.html`, so deep links such as
`/services/ai-automations` and `/admin/settings` load correctly on refresh.
