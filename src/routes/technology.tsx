import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";

export const Route = createFileRoute("/technology")({
  component: TechPage,
  head: () => ({
    meta: [
      { title: "Technology Stack | Logicsify" },
      {
        name: "description",
        content:
          "The frontend, backend, mobile, cloud, AI, and marketing tools Logicsify works with every day.",
      },
      { property: "og:url", content: "https://logicsify.com/technology" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/technology" }],
  }),
});

const groups = [
  {
    title: "Frontend",
    tools: ["React", "Next.js", "TypeScript", "Astro", "Tailwind CSS", "Framer Motion"],
  },
  { title: "Backend", tools: ["Node.js", "NestJS", "Python", "FastAPI", "Laravel", "Go"] },
  { title: "Mobile", tools: ["React Native", "Expo", "Swift", "Kotlin"] },
  { title: "Databases", tools: ["PostgreSQL", "Supabase", "MySQL", "Redis", "MongoDB"] },
  { title: "Cloud", tools: ["AWS", "Vercel", "Cloudflare", "GCP", "Fly.io"] },
  {
    title: "AI",
    tools: ["OpenAI", "Anthropic", "Gemini", "LangChain", "LangGraph", "LlamaIndex", "Pinecone"],
  },
  { title: "Automation", tools: ["n8n", "Make", "Zapier", "Retell AI", "Vapi"] },
  {
    title: "Marketing",
    tools: ["HubSpot", "GoHighLevel", "Klaviyo", "Attentive", "Google Ads", "Meta Ads"],
  },
  { title: "Analytics", tools: ["GA4", "PostHog", "Amplitude", "Segment", "Mixpanel"] },
];

function TechPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Technology stack"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Technology" }]}
        title={
          <>
            A modern stack, <span className="text-gradient">applied with intent.</span>
          </>
        }
        intro="We pick tools that fit the problem — not the trend. Here's what we reach for most often."
      />
      <section className="py-20">
        <div className="container-page grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div
              key={g.title}
              data-reveal
              className="rounded-2xl border border-black/10 bg-white p-6"
            >
              <p className="eyebrow mb-4">{g.title}</p>
              <div className="flex flex-wrap gap-2">
                {g.tools.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-full bg-lavender text-ink text-sm font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}
