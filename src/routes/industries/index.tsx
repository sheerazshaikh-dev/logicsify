import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/industries/")({
  beforeLoad: () => {
    throw redirect({ to: "/services", replace: true, statusCode: 301 });
  },
});
