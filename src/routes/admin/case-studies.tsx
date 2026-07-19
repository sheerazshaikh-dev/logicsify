import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/case-studies")({
  component: () => (
    <ContentManagerPage
      type="case_study"
      title="Case Studies"
      singular="Case Study"
      description="Publish selected work, client outcomes, project stories and supporting media."
    />
  ),
});
