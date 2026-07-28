import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { ArrowRight } from "lucide-react";
import { getCmsContentList } from "@/lib/logicsify-api";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  loader: async () => ({ careers: await getCmsContentList("career") }),
  head: () => ({
    meta: [
      { title: "Careers | Logicsify" },
      {
        name: "description",
        content:
          "Join a senior, multidisciplinary team building end-to-end technology, AI, and growth systems.",
      },
      { property: "og:url", content: "https://logicsify.com/careers" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/careers" }],
  }),
});

const values = [
  { t: "Senior craft", b: "You take pride in your work and defend the details." },
  { t: "Direct communication", b: "Say what you mean. Ask for what you need." },
  { t: "Ownership", b: "You own outcomes end to end, not just outputs." },
  { t: "Continuous learning", b: "The stack moves. So do you." },
];

const fallbackRoles = [
  {
    slug: "senior-full-stack-engineer",
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    type: "Remote · Full-time",
    email: "careers@logicsify.com",
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    team: "Design",
    type: "Remote · Full-time",
    email: "careers@logicsify.com",
  },
  {
    slug: "ai-automation-engineer",
    title: "AI Automation Engineer",
    team: "AI",
    type: "Remote · Full-time",
    email: "careers@logicsify.com",
  },
  {
    slug: "growth-marketing-lead",
    title: "Growth Marketing Lead",
    team: "Marketing",
    type: "Remote · Full-time",
    email: "careers@logicsify.com",
  },
];

function CareersPage() {
  const { careers } = Route.useLoaderData();
  const roles = careers.length
    ? careers.map((career) => {
        const fallback = fallbackRoles.find((role) => role.slug === career.slug);
        return {
          slug: career.slug,
          title: career.title,
          team: String(career.content_json?.category || fallback?.team || "Logicsify"),
          type: career.excerpt || fallback?.type || "Remote · Full-time",
          email: String(
            career.content_json?.application_email || fallback?.email || "careers@logicsify.com",
          ),
        };
      })
    : fallbackRoles;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Careers"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Careers" }]}
        title={
          <>
            Build things that <span className="text-gradient">actually ship.</span>
          </>
        }
        intro="Logicsify is always talking to senior practitioners — engineers, designers, marketers, and AI builders — who take craft seriously."
        primaryCta={{ label: "Send an intro", to: "/contact" }}
      />
      <section className="py-24">
        <div className="container-page">
          <p className="eyebrow mb-6">How we work</p>
          <div className="grid md:grid-cols-4 gap-4 mb-24">
            {values.map((v) => (
              <div key={v.t} className="rounded-2xl border border-black/10 bg-white p-6">
                <h3 className="text-lg font-semibold mb-2">{v.t}</h3>
                <p className="text-sm text-ink-soft">{v.b}</p>
              </div>
            ))}
          </div>

          <p className="eyebrow mb-6">Open roles</p>
          <div className="space-y-3">
            {roles.length ? (
              roles.map((role) => (
                <a
                  href={`mailto:${role.email}?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                  key={role.slug}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-6 hover:border-black/30 hover:shadow-[0_10px_30px_-15px_rgba(25,10,47,0.2)] transition-all"
                >
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-gradient transition">
                      {role.title}
                    </h3>
                    <p className="text-sm text-ink-soft mt-1">
                      {role.team} · {role.type}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </a>
              ))
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-ink-soft">
                New opportunities are coming soon.
              </div>
            )}
          </div>
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
