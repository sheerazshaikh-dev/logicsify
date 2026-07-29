import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    throw redirect({ href: `/guides/${encodeURIComponent(params.slug)}`, statusCode: 301 });
  },
  component: () => null,
});
