import { TechnicalRoadmapCTA } from "@/components/technical-roadmap-cta";

export function CTASection({
  eyebrow = "Discuss your project",
  title = "Connect sales, service, and operations in one working system.",
  body = "Tell us where leads, conversations, customer data, payments, or internal workflows are breaking. We will identify the clearest path forward.",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return <TechnicalRoadmapCTA eyebrow={eyebrow} title={title} body={body} buttonLabel="Discuss Your Project" to="/contact" source="final_cta" />;
}
