# Logicsify API-Only Backend Deployment

This folder is the headless PHP/MySQL backend for the Logicsify React website and React admin panel.

It deliberately contains **no PHP admin panel**. The admin UI is deployed with the React project at:

```text
https://logicsify.com/admin/login
```

## Server target

```text
https://backend.logicsify.com
```

API base:

```text
https://backend.logicsify.com/api
```

## Upload structure

Upload this package's contents directly to the subdomain document root:

```text
.htaccess
index.php
setup.php
api/
private/
uploads/
```

## Database

The supplied database connection is already set in `private/config.php`. Confirm in cPanel that the configured database user has **ALL PRIVILEGES** on the configured database.

## PHP requirements

- PHP 8.1+
- PDO MySQL
- JSON
- mbstring
- OpenSSL
- fileinfo

## One-time setup

Open:

```text
https://backend.logicsify.com/setup.php
```

Setup key:

```text
wGPXtMMja-UZeU%_2eHLqcp4pFbSAvV%
```

Initial React-admin login after setup:

```text
URL: https://logicsify.com/admin/login
Email: admin@logicsify.com
Temporary password: @IjtYt39D8opoW28UQ
```

Change the temporary password immediately. Delete `setup.php` from the live server after successful installation, and keep `private/setup.lock`.

## Frontend environment

The React project must use:

```env
VITE_API_URL=https://backend.logicsify.com/api
```

## Health check

Opening `https://backend.logicsify.com` should return JSON showing that the API service is online.
