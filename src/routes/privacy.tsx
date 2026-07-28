import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Logicsify" },
      { name: "description", content: "How Logicsify collects, uses, and protects information." },
      { property: "og:url", content: "https://logicsify.com/privacy" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Privacy" }]}
        title={<>Privacy Policy</>}
        intro="This policy explains what information we collect, how we use it, and the choices you have."
      />
      <article className="py-20">
        <div className="container-page max-w-3xl mx-auto space-y-8 text-ink leading-relaxed">
          <Section title="Overview">
            Logicsify ("we", "our") operates logicsify.com. This policy explains our practices
            regarding information we collect from visitors and clients.
          </Section>
          <Section title="Information we collect">
            We collect information you provide directly (name, email, company, project details) via
            our contact and booking forms, plus standard analytics data (pages viewed, referring
            source, device type) via privacy-friendly analytics.
          </Section>
          <Section title="How we use it">
            To respond to your inquiry, deliver services, improve our website, and (with consent)
            send occasional insights. We do not sell your data.
          </Section>
          <Section title="Cookies">
            We use essential cookies to operate the site and optional analytics cookies. You can
            control cookies via your browser settings.
          </Section>
          <Section title="Third parties">
            We use reputable service providers (hosting, email, analytics, CRM). Each processes
            limited data on our behalf under contract.
          </Section>
          <Section title="Your rights">
            You may request access, correction, or deletion of your data by emailing
            privacy@logicsify.com.
          </Section>
          <Section title="Contact">Questions? Email privacy@logicsify.com.</Section>
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
