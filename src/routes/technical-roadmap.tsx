import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { SystemsWeIntegrate } from "@/components/systems-we-integrate";
import { submitContact } from "@/lib/logicsify-api";
import { getRoadmapSource, trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/technical-roadmap")({
  component: TechnicalRoadmapPage,
  head: () => ({
    meta: [
      { title: "Free Technical Roadmap | Logicsify" },
      { name: "description", content: "Share your systems, constraints, and project goals to start a practical technical roadmap with Logicsify." },
      { property: "og:title", content: "Get a Free Technical Roadmap | Logicsify" },
      { property: "og:description", content: "A structured starting point for a website, application, SaaS product, CRM workflow, or automation project." },
      { property: "og:url", content: "https://logicsify.com/technical-roadmap" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/technical-roadmap" }],
  }),
});

type FormState = {
  name: string; email: string; phone: string; company: string; website: string;
  businessType: string; service: string; currentSystems: string; problem: string;
  budget: string; timeline: string; summary: string; consent: boolean; honey: string;
};

const initial: FormState = { name: "", email: "", phone: "", company: "", website: "", businessType: "", service: "", currentSystems: "", problem: "", budget: "", timeline: "", summary: "", consent: false, honey: "" };

function TechnicalRoadmapPage() {
  const sourcePage = getRoadmapSource();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");
  const started = useRef(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (!started.current) {
      started.current = true;
      trackEvent("technical_roadmap_form_started", { page: "/technical-roadmap" });
    }
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.consent) {
      setError("Please confirm that Logicsify may contact you about this request.");
      return;
    }
    setStatus("submitting");
    try {
      const description = [
        `Business type: ${form.businessType || "Not supplied"}`,
        `Current systems: ${form.currentSystems || "Not supplied"}`,
        `Main technical problem: ${form.problem}`,
        `Project summary: ${form.summary}`,
      ].join("\n\n");
      await submitContact({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        website: form.website,
        service: form.service,
        budget: form.budget,
        timeline: form.timeline,
        description,
        source: `technical-roadmap:${sourcePage}`,
        honey: form.honey,
      });
      setStatus("success");
      trackEvent("technical_roadmap_form_submitted", { service: form.service, source: sourcePage });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "The request could not be submitted.");
    }
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Technical roadmap"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Technical Roadmap" }]}
        title={<>Get a practical path from current systems to the <span className="text-gradient">next build.</span></>}
        intro="This form creates a discovery starting point, not a binding quote. The quality of the roadmap depends on the accuracy of the constraints you provide."
      />
      <section className="py-20 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4">What you receive</p>
            <h2 className="fluid-h3">A useful first pass, grounded in your operating reality.</h2>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-ink-soft">
              {["Recommended project type and engagement model", "Suggested delivery phases and dependencies", "Key integration and data risks", "Questions that must be answered before final scope"].map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />{item}</li>)}
            </ul>
          </div>
          <div className="lg:col-span-8">
            {status === "success" ? (
              <div className="rounded-3xl border border-black/10 bg-cream p-10" role="status">
                <CheckCircle2 className="h-10 w-10 text-brand-red" />
                <h2 className="mt-5 fluid-h3">Your roadmap request is in the system.</h2>
                <p className="mt-4 text-ink-soft">The team will review the scope, constraints, and timeline before replying.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl border border-black/10 bg-white p-6 shadow-[var(--shadow-card)] md:p-10" noValidate>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full name" required><input required value={form.name} onChange={(e) => update("name", e.target.value)} className="form-input" autoComplete="name" /></Field>
                  <Field label="Work email" required><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="form-input" autoComplete="email" /></Field>
                  <Field label="Phone"><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="form-input" autoComplete="tel" /></Field>
                  <Field label="Company"><input value={form.company} onChange={(e) => update("company", e.target.value)} className="form-input" autoComplete="organization" /></Field>
                  <Field label="Website"><input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} className="form-input" placeholder="https://" /></Field>
                  <Field label="Business type" required><input required value={form.businessType} onChange={(e) => update("businessType", e.target.value)} className="form-input" placeholder="SaaS, home services, agency…" /></Field>
                  <Field label="Service required" required><select required value={form.service} onChange={(e) => update("service", e.target.value)} className="form-input"><option value="">Select</option>{["Marketing website","E-commerce website","Custom web application","SaaS MVP","Mobile application","AI automation","Voice AI agent","CRM implementation","Custom CMS","SEO and marketing","Cybersecurity","Technical discovery"].map((item) => <option key={item}>{item}</option>)}</select></Field>
                  <Field label="Estimated budget" required><select required value={form.budget} onChange={(e) => update("budget", e.target.value)} className="form-input"><option value="">Select</option><option>Under $5,000</option><option>$5,000–$15,000</option><option>$15,000–$35,000</option><option>$35,000–$75,000</option><option>$75,000+</option><option>Not defined</option></select></Field>
                  <Field label="Desired timeline"><select value={form.timeline} onChange={(e) => update("timeline", e.target.value)} className="form-input"><option value="">Select</option><option>As soon as practical</option><option>1–2 months</option><option>3–6 months</option><option>6+ months</option><option>Exploring</option></select></Field>
                  <Field label="Current systems"><input value={form.currentSystems} onChange={(e) => update("currentSystems", e.target.value)} className="form-input" placeholder="CRM, CMS, payments, analytics…" /></Field>
                </div>
                <div className="mt-5 space-y-5">
                  <Field label="Main technical problem" required><textarea required minLength={20} rows={4} value={form.problem} onChange={(e) => update("problem", e.target.value)} className="form-input" /></Field>
                  <Field label="Project summary" required><textarea required minLength={20} rows={5} value={form.summary} onChange={(e) => update("summary", e.target.value)} className="form-input" /></Field>
                  <input tabIndex={-1} autoComplete="off" value={form.honey} onChange={(e) => update("honey", e.target.value)} className="hidden" aria-hidden />
                  <label className="flex items-start gap-3 text-sm text-ink-soft"><input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-1 h-4 w-4 accent-brand-red" /><span>I agree that Logicsify may use this information to respond to my request. No sensitive form values are sent to analytics.</span></label>
                  {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p> : null}
                  <button disabled={status === "submitting"} className="btn-primary disabled:opacity-60">{status === "submitting" ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting</> : "Submit roadmap request"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      <SystemsWeIntegrate />
    </SiteLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-ink">{label}{required ? " *" : ""}</span>{children}</label>;
}
