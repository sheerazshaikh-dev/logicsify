import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/pages")({
  component: () => (
    <ContentManagerPage
      type="page"
      title="Pages"
      singular="Page"
      description="Manage the website's core pages, nested slugs, publication status, featured images, sections and SEO."
    />
  ),
});
