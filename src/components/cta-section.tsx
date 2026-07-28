import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";

export function CTASection({
  eyebrow = "Free technical roadmap",
  title = "Turn the next technical decision into a clear plan.",
  body = "Tell us what you are building, improving, or automating. We will use the context to prepare a practical discovery roadmap.",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return <TechnicalRoadmapCTA eyebrow={eyebrow} title={title} body={body} />;
}
