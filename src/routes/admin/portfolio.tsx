import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";

export const Route = createFileRoute("/admin/portfolio")({
  component: () => (
    <ContentManagerPage
      type="portfolio"
      title="Portfolio"
      singular="Portfolio Project"
      description="Manage concise visual project showcases independently from long-form Case Studies."
    />
  ),
});
