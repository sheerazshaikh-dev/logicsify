const CUSTOM_ADMIN_RE = /^\/control\/([^/]+)(?:\/(.*))?$/;

export function getAdminBasePath(pathname = typeof window !== "undefined" ? window.location.pathname : "/admin") {
  const match = pathname.match(CUSTOM_ADMIN_RE);
  if (match?.[1]) return `/control/${match[1]}`;
  return "/admin";
}

export function getAdminSection(pathname = typeof window !== "undefined" ? window.location.pathname : "/admin/dashboard") {
  const custom = pathname.match(CUSTOM_ADMIN_RE);
  if (custom) return (custom[2] || "dashboard").replace(/^\//, "");
  return pathname.replace(/^\/admin\/?/, "") || "dashboard";
}

export function adminHref(section = "dashboard", pathname?: string) {
  const base = getAdminBasePath(pathname);
  return `${base}/${section.replace(/^\//, "")}`;
}

export function legacyAdminPath(pathname = typeof window !== "undefined" ? window.location.pathname : "") {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
