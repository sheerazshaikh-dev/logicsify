import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";

export const Route = createFileRoute("/admin/guides")({
  component: () => (
    <ContentManagerPage
      type="resource"
      title="Guides"
      singular="Guide"
      description="Manage gated PDFs, checklists, audits, templates, cover images, previews, and downloadable files."
    />
  ),
});
