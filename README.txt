LOGICSIFY — INCREMENTAL LAYOUT HOTFIX
Date: 2026-08-12

Apply this AFTER the previously deployed Logicsify hotfix.
This package intentionally contains ONLY the files touched by the latest layout request.

Changes:
1. Global theme container default increased from 1360px to 1600px.
2. Existing saved 1360px theme values are treated as the old default and upgraded to 1600px at runtime/admin load.
3. Inner-page hero headings now use the full width of their assigned grid column instead of being reduced to 75% on desktop.
4. Inner-page hero intro text maximum width increased from 2xl to 3xl for better balance.

Files included:
- src/styles.css
- src/components/page-hero.tsx
- src/lib/logicsify-api.ts
- src/routes/admin/global-styling.tsx

No backend files and no database migration are required for this incremental hotfix.
Upload/replace these files in the frontend project and redeploy.
