import { createFileRoute, redirect } from "@tanstack/react-router";
import { industryRedirects } from "@/lib/site-data";

export const Route = createFileRoute("/industries/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ href: industryRedirects[params.slug] || "/services", replace: true, statusCode: 301 });
  },
});
