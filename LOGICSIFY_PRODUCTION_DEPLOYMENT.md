# Logicsify Vite deployment

## 1. Local test

Create `.env.local`:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

Run:

```bash
bun install
bun run qa
bun run dev
```

Open `http://localhost:8080` and `http://localhost:8080/admin/login`.

## 2. Push to GitHub

```bash
git init
git branch -M main
git add .
git commit -m "Initial Logicsify Vite website and admin"
git remote add origin https://github.com/YOUR-USERNAME/logicsify.git
git push -u origin main
```

Do not commit `.env.local`, `node_modules`, or `dist`.

## 3. Deploy to Vercel

Import the GitHub repository. The included `vercel.json` already sets:

```text
Install command: bun install --frozen-lockfile
Build command: bun run build
Output directory: dist
```

Add the environment variable:

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

The `vercel.json` SPA rewrite ensures all routes load through `index.html`.

## Visual editor animation behavior

The public website keeps its animations unchanged. Inside visual-editor preview
mode only, reveal animations are forced visible and moving animations are paused,
so headings, text, cards, rings, nodes and floating objects remain selectable.
