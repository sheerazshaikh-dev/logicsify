# Logicsify architecture

## Vercel: `logicsify.com`

A pure Vite/React SPA contains:

- Public Logicsify website
- React admin panel under `/admin`
- TanStack Router client-side routing
- React Query API state
- Visual page editor
- Header, footer, menu and mega-menu management
- CMS content screens, submissions, media, settings and administrators

Vercel serves `dist/index.html` for deep links using the included SPA rewrite.
There is no TanStack Start server, Nitro runtime, SSR function, or PHP admin UI in
this repository.

## cPanel: `backend.logicsify.com`

The separate PHP package contains only:

- JSON API endpoints
- Authentication and permissions
- MySQL content operations
- Media uploads
- Contact submissions and bookings
- SMTP and system settings

Both local development and the production Vercel deployment communicate with:

```text
https://backend.logicsify.com/api
```
