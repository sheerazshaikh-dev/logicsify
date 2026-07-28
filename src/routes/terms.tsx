import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Logicsify" },
      {
        name: "description",
        content: "The terms that apply to your use of logicsify.com and our services.",
      },
      { property: "og:url", content: "https://logicsify.com/terms" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/terms" }],
  }),
});

function TermsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Terms" }]}
        title={<>Terms & Conditions</>}
        intro="These terms govern your use of our website and services. Please read them carefully."
      />
      <article className="py-20">
        <div className="container-page max-w-3xl mx-auto space-y-8 text-ink leading-relaxed">
          <Section title="Acceptance">
            By using logicsify.com you agree to these terms. If you don't agree, please don't use
            the site.
          </Section>
          <Section title="Services">
            Any services delivered by Logicsify are governed by a separate signed engagement letter
            or master services agreement.
          </Section>
          <Section title="Intellectual property">
            Content on this website (excluding third-party marks) is owned by Logicsify. You may not
            reproduce it without permission.
          </Section>
          <Section title="Client-owned work">
            Deliverables produced under an engagement are transferred to the client per the terms of
            the applicable agreement.
          </Section>
          <Section title="Liability">
            Our liability for use of this website is limited to the maximum extent permitted by law.
          </Section>
          <Section title="Governing law">
            These terms are governed by the applicable laws of the client's jurisdiction unless
            otherwise stated in the engagement letter.
          </Section>
          <Section title="Contact">Questions? Email legal@logicsify.com.</Section>
          <p className="text-sm text-ink-soft">Last updated: {new Date().toLocaleDateString()}.</p>
        </div>
      </article>
    </SiteLayout>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <p className="text-ink-soft">{children}</p>
    </div>
  );
}
