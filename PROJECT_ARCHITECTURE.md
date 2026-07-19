# Logicsify Project Architecture

Logicsify now uses the same separation as the Brand & Brains project.

## 1. React application — `logicsify.com`

The TanStack Start/React project contains both:

- The public Logicsify website.
- The complete React admin panel under `/admin`.

Key admin routes:

```text
/admin/login
/admin/dashboard
/admin/pages
/admin/services
/admin/industries
/admin/case-studies
/admin/insights
/admin/careers
/admin/testimonials
/admin/team
/admin/leads
/admin/bookings
/admin/media
/admin/menus
/admin/settings
/admin/administrators
/admin/trash
/admin/audit-logs
```

The React application does not connect directly to MySQL. Public pages and admin screens both communicate with the PHP API.

## 2. PHP API — `backend.logicsify.com`

The `backend-logicsify` directory is API-only. It contains:

```text
.htaccess
index.php             API health/status response
setup.php             one-time database installer
api/index.php         API front controller
private/              configuration, bootstrap and schema
uploads/              managed public media files
```

There is intentionally no PHP admin interface and no `admin/` directory in this package.

The backend handles:

- Admin authentication and permissions.
- MySQL reads and writes.
- CMS content and revisions.
- Contact submissions and bookings.
- Availability and blocked dates.
- Media uploads.
- Menu management.
- SMTP notifications.
- Site and integration settings.
- Administrators, recycle bin and audit logs.

## 3. Request flow

```text
Visitor → logicsify.com → backend.logicsify.com/api → MySQL
Admin   → logicsify.com/admin → backend.logicsify.com/api → MySQL
```

The frontend API environment variable is:

```env
VITE_API_URL=https://backend.logicsify.com/api
```
