import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/careers")({
  component: () => (
    <ContentManagerPage
      type="career"
      title="Careers"
      singular="Career"
      description="Manage open roles, job descriptions, locations and application information."
    />
  ),
});
