import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { Check } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Logicsify | Technology, AI, and Growth Partner" },
      {
        name: "description",
        content:
          "Logicsify is a multidisciplinary technology, AI, and growth partner. Learn about our mission, principles, and how we work.",
      },
      { property: "og:title", content: "About Logicsify" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const principles = [
  { t: "Think before building", b: "The best decisions get made before a single line of code." },
  { t: "Simplify complexity", b: "Complexity is the enemy of change. We reduce it as we go." },
  {
    t: "Design for real users",
    b: "Every artifact is validated with the humans who'll live with it.",
  },
  { t: "Build for scale", b: "What we ship in month one should still hold up in year three." },
  { t: "Measure meaningful outcomes", b: "Metrics that map to money — not vanity dashboards." },
  { t: "Improve continuously", b: "Launch is the beginning, not the end." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About Logicsify"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
        title={
          <>
            We make complex digital growth <span className="text-gradient">feel logical.</span>
          </>
        }
        intro="Logicsify is a multidisciplinary team of strategists, designers, engineers, and marketers building end-to-end digital systems for ambitious businesses."
        primaryCta={{ label: "See our work", to: "/work" }}
        secondaryCta={{ label: "Book a Strategy Call", to: "/book-a-call" }}
      />

      <section className="py-24">
        <div className="container-page grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">Our mission</p>
            <h2 className="fluid-h2">
              Connect the technology, marketing, and operations of modern businesses.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-6 text-lg text-ink-soft leading-relaxed">
            <p>
              Logicsify exists because most digital work still ships in silos. A product team
              designs. A marketing team promotes. An ops team automates. And in the middle, the
              customer sees the seams.
            </p>
            <p>
              We bring those disciplines into a single team, working from a single roadmap, measured
              against a single set of business outcomes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-4">Our principles</p>
            <h2 className="fluid-h2">Six ideas we return to daily.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map((p) => (
              <div key={p.t} data-reveal className="rounded-2xl bg-white border border-black/5 p-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand text-white flex items-center justify-center mb-4">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{p.t}</h3>
                <p className="text-sm text-ink-soft">{p.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-page grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">How Logicsify works</p>
            <h2 className="fluid-h2">Multidisciplinary, senior, remote-first.</h2>
          </div>
          <div className="lg:col-span-7 space-y-6 text-lg text-ink-soft leading-relaxed">
            <p>
              We're a small senior team by design. Every engagement is staffed with practitioners —
              not project managers who route work to juniors.
            </p>
            <p>
              We work remote-first with clients across time zones, in structured two-week
              iterations, with visible progress every step. Weekly demos, monthly steering, and a
              shared backlog that stays transparent.
            </p>
            <p>
              <Link
                to="/process"
                className="text-ink font-semibold underline underline-offset-4 decoration-brand-red hover:text-gradient"
              >
                See our full delivery process →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-lavender">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow mb-4">Team</p>
            <h2 className="fluid-h2">A senior team you'll actually meet.</h2>
            <p className="mt-4 text-ink-soft">
              Detailed team profiles will appear here soon. Meanwhile, everyone you meet on a
              discovery call is someone who will work on your engagement.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-dashed border-ink/15 bg-white/50 aspect-[3/4] flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-brand opacity-30 mb-4" />
                <p className="text-sm text-ink/60">[ Team member ]</p>
                <p className="text-xs text-ink-soft mt-1">[ Role ]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-page grid md:grid-cols-2 gap-6">
          <Link
            to="/careers"
            className="group rounded-3xl bg-ink text-white p-10 md:p-12 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-brand opacity-25 blur-3xl" />
            <p className="eyebrow text-white/60 mb-4 relative">Careers</p>
            <h3 className="fluid-h3 text-white relative">Work with us</h3>
            <p className="mt-4 text-white/70 max-w-md relative">
              We're always talking to senior practitioners who take craft seriously.
            </p>
          </Link>
          <Link to="/contact" className="group rounded-3xl bg-lavender text-ink p-10 md:p-12">
            <p className="eyebrow mb-4">Contact</p>
            <h3 className="fluid-h3">Have a project?</h3>
            <p className="mt-4 text-ink-soft max-w-md">
              Tell us what you're building. We'll respond within one business day.
            </p>
          </Link>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}
