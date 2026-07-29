import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/audit-logs")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/security", replace: true });
  },
});
