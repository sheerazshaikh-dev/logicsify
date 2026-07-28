import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { StrategyCallCalendar } from "@/components/strategy-call-calendar";
import { Calendar, Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/book-a-call")({
  component: BookPage,
  head: () => ({
    meta: [
      { title: "Book a Strategy Call | Logicsify" },
      {
        name: "description",
        content:
          "Choose an available date and request a free 30-minute strategy call with Logicsify.",
      },
      { property: "og:url", content: "https://logicsify.com/book-a-call" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/book-a-call" }],
  }),
});

function BookPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Free strategy call"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Book a Call" }]}
        title={
          <>
            Book a <span className="text-gradient">30-minute</span> strategy call.
          </>
        }
        intro="A working session with a senior member of our team. Choose a live available time and tell us what you are building."
      />
      <section className="py-20">
        <div className="container-page grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-black/10 p-8 bg-white">
              <Calendar className="w-6 h-6 text-brand-red mb-3" />
              <h3 className="text-xl font-semibold mb-2">What to expect</h3>
              <ul className="space-y-2 text-sm text-ink">
                {[
                  "A structured 30-minute conversation",
                  "Practical recommendations you can use",
                  "A senior team member on the call — no SDRs",
                  "Follow-up notes within 24 hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-red mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-lavender p-8">
              <p className="eyebrow mb-2">Rather write?</p>
              <p className="text-lg font-semibold text-ink">Send your project details instead.</p>
              <Link
                to="/contact"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink"
              >
                Go to contact form <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-8 rounded-3xl bg-ink text-white p-7 md:p-10 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
            <div className="relative">
              <p className="eyebrow text-white/60 mb-2">Live availability</p>
              <h2 className="text-3xl font-semibold mb-8">Choose your date and time</h2>
              <StrategyCallCalendar compact />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
