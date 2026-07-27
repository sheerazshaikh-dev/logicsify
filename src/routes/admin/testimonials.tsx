import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route = createFileRoute("/admin/testimonials")({
  component: () => (
    <ContentManagerPage
      type="testimonial"
      title="Testimonials"
      singular="Testimonial"
      description="Manage written and video client testimonials used throughout the website."
    />
  ),
});
