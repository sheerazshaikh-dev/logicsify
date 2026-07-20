# Logicsify Vite QA report

## Conversion checks

- Removed TanStack Start and Nitro runtime dependencies
- Added standard Vite `index.html` and `src/main.tsx`
- Added Vite React, Tailwind and TanStack Router plugins
- Removed server entry files and server-only sitemap route
- Added static `public/sitemap.xml`
- Added Vercel SPA rewrites and `dist` output configuration
- Confirmed direct deep links return the Vite SPA entry

## Visual editor checks

- Reveal-on-scroll elements are immediately visible in editor mode
- `.animate-reveal` cannot remain at opacity zero in the editor
- Floating, marquee, rotating, gradient and glow animations are paused in the editor
- Live-site animation CSS and behavior are unchanged
- Runtime reapplies editor visibility after DOM structure and field updates

## Automated validation

Run:

```bash
bun run qa
```

The suite validates:

- TypeScript
- ESLint
- All 17 service URL mappings
- Vite production build
- 64 public/admin deep routes
- `robots.txt`, `sitemap.xml`, and favicon availability
- Vercel SPA rewrite configuration
