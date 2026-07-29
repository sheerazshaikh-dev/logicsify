# Logicsify Integrations and Related Automation Demos

This update is designed for the latest npm/Vite Resources and Subservices build.

It preserves the existing PHP API, React admin panel, authentication, permissions, database structure, service records, visual editor, forms, guides, case studies, analytics, and menu manager.

## What changed

### Integrations

- Added a public `/integrations` page.
- Added `Supported Integrations` under the Services mega menu.
- Added the same link to the footer.
- Added 14 editable integration records through the existing `Admin → Integrations` content type:
  - GoHighLevel
  - HubSpot
  - Supabase
  - WordPress
  - Shopify
  - OpenAI
  - Stripe
  - Twilio
  - Retell AI
  - Google Ads
  - Meta Ads
  - n8n
  - Make
  - Zapier
- Categories, descriptions, platform URLs, logos, publish state, order, and partnership verification remain editable in the existing admin panel.
- No formal partnership claims are enabled.

### Related automation demos

A related controlled sample demo now appears on:

- `/services/ai-automation-voice-agents`
- `/services/ai-calling-agents`
- `/services/appointment-booking-agents`
- `/services/lead-qualification-agents`
- `/services/ai-support-chatbots`
- `/services/automated-lead-follow-up`
- `/services/messaging-calendar-automation`
- `/services/document-extraction-processing`
- `/services/internal-workflow-automation`
- `/services/custom-ai-integrations`

The page selects a relevant sample automatically:

- Voice pages use a simulated conversation.
- Qualification pages use lead scoring and routing.
- Document pages use prepared extraction data.
- Support pages use a limited approved knowledge sample.
- Follow-up, messaging, internal workflow, and integration pages use a simulated automation map.

No demo places calls, writes to a live CRM, uploads documents, or changes production data.

## Backend deployment

1. Back up the production database and backend files.
2. Extract `logicsify-integrations-demos-backend-hotfix.zip`.
3. Upload its contents to the document root of `backend.logicsify.com`.
4. Preserve the existing `private/config.php`. It is not included in the package.
5. Open:

   `https://backend.logicsify.com/integrations-demos-upgrade.php`

6. Enter the existing setup key.
7. Confirm the update completes.
8. Delete `integrations-demos-upgrade.php` immediately.

The updater is idempotent. It inserts missing records, fills only blank data on existing matching integrations, and adds the navigation link only when missing.

## Frontend deployment

Use either the frontend hotfix or complete npm/Vite frontend package.

Run:

```bash
npm ci
npm run routes:generate
npm run qa:static
npm run qa:links
npm run typecheck
npm run build
npm run dev
```

Test:

- `http://localhost:8080/integrations`
- `http://localhost:8080/admin/integrations`
- `http://localhost:8080/services/ai-automation-voice-agents`
- Every AI Automation subservice route listed above
- Desktop Services mega menu
- Mobile Services accordion

## GitHub

```bash
git add -A
git commit -m "Add integrations and related AI automation demos"
git push
```

## Vercel

No new environment variable is required.

Keep:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

## Validation performed

- Route tree regenerated: 53 routes.
- Static source QA passed: 144 source files.
- Internal link audit passed.
- Canonical service URL audit passed: 39 services.
- TypeScript syntax transpilation passed: 143 files.
- PHP syntax passed for the API and updater.
- Sitemap regenerated with 60 public URLs.

A full `npm ci`, module-aware TypeScript check, ESLint run, and Vite production bundle could not run in this environment because its npm proxy returned a package 404. Run the commands above locally before deployment.
