import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/industries")({
  component: () => (
    <ContentManagerPage
      type="industry"
      title="Industries"
      singular="Industry"
      description="Manage industry landing pages, summaries, sections, featured imagery and search metadata."
    />
  ),
});
