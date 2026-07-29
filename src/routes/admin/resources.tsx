import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/resources")({
  loader: () => {
    throw redirect({ to: "/admin/guides", statusCode: 301 });
  },
  component: () => null,
});
