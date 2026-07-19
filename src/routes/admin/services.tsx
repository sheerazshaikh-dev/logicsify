import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/services")({
  component: () => (
    <ContentManagerPage
      type="service"
      title="Services"
      singular="Service"
      description="Manage all technology, marketing and AI service pages shown across the Logicsify website."
    />
  ),
});
