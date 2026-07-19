import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/testimonials")({
  component: () => (
    <ContentManagerPage
      type="testimonial"
      title="Testimonials"
      singular="Testimonial"
      description="Manage client quotes and featured proof used throughout the website."
    />
  ),
});
