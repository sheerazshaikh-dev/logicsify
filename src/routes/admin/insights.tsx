import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/insights")({
  component: () => (
    <ContentManagerPage
      type="insight"
      title="Insights"
      singular="Insight"
      description="Manage articles, agency news, practical guides and thought leadership."
    />
  ),
});
