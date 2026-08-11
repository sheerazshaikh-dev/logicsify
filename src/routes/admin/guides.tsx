import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";

export const Route = createFileRoute("/admin/guides")({
  component: () => (
    <ContentManagerPage
      type="resource"
      title="Guides"
      singular="Guide"
      description="Manage guide listing cards and their lead-gated downloadable files. Guide detail pages are no longer used."
    />
  ),
});
