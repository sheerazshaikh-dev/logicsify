import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/team")({
  component: () => (
    <ContentManagerPage
      type="team"
      title="Team"
      singular="Team Member"
      description="Manage team profiles, roles, biographies, images and social links."
    />
  ),
});
