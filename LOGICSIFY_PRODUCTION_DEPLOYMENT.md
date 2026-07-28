# Logicsify npm + Vite deployment

## 1. Local test

Install Node.js 22 and npm 10 or later.

Create `.env.local`:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Run:

```bash
npm ci
npm run qa
npm run dev
```

Open `http://localhost:8080` and `http://localhost:8080/admin/login`.

## 2. Push to GitHub

For a new local Git connection to the existing repository:

```bash
git init
git branch -M main
git remote add origin https://github.com/sheerazshaikh-dev/logicsify.git
git fetch origin
git reset --mixed origin/main
git add -A
git commit -m "Convert Logicsify from Bun to npm"
git push -u origin main
```

Do not commit `.env.local`, `node_modules`, or `dist`.
Commit `package-lock.json` because Vercel uses it with `npm ci`.

## 3. Deploy to Vercel

Import `sheerazshaikh-dev/logicsify`. The included `vercel.json` sets:

```text
Framework: Vite
Install command: npm ci --no-audit --no-fund
Build command: npm run build
Output directory: dist
```

Add:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Enable it for Production, Preview, and Development, then deploy.

## 4. Domains

Attach:

- `logicsify.com`
- `www.logicsify.com`

The backend remains at `backend.logicsify.com`.

## 5. Deep-route verification

After deployment, directly open and refresh:

- `/services/ai-automations`
- `/services/web-design-development`
- `/contact`
- `/admin/login`
- `/admin/pages`
- `/admin/settings`

The `vercel.json` SPA rewrite sends these routes through `index.html`.

## Visual editor animation behavior

The public website keeps its animations unchanged. Inside visual-editor preview
mode only, reveal animations are forced visible and moving animations are paused,
so headings, text, cards, rings, nodes, and floating objects remain selectable.
