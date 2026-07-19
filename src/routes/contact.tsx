import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { StrategyCallCalendar } from "@/components/strategy-call-calendar";
import { submitContact } from "@/lib/logicsify-api";
import { Check, Mail, Calendar, Shield, Loader2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Logicsify | Start a Project" },
      {
        name: "description",
        content: "Tell us about your project or book a strategy call directly from our calendar.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  service: z.string().min(1, "Select a service"),
  budget: z.string().min(1, "Select a budget"),
  timeline: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().min(20, "Tell us a little more (min 20 chars)").max(4000),
  source: z.string().trim().max(120).optional().or(z.literal("")),
  consent: z.boolean().refine((value) => value, "Consent is required"),
  honey: z.string().max(0, "Bot detected"),
});

const services = [
  "Website Design",
  "Web Development",
  "Web Application",
  "SaaS Development",
  "Mobile App",
  "E-commerce",
  "AI Automation",
  "AI Agent",
  "CRM Automation",
  "SEO",
  "Paid Advertising",
  "Social Media Marketing",
  "Branding",
  "Ongoing Support",
  "Other",
];
const budgets = [
  "Under $5,000",
  "$5,000–$10,000",
  "$10,000–$25,000",
  "$25,000–$50,000",
  "$50,000+",
  "Not sure yet",
];

function ContactPage() {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    const parsed = schema.safeParse({ ...data, consent: data.consent === "on" });
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        flat[issue.path[0] as string] = issue.message;
      });
      setErrors(flat);
      return;
    }

    setState("submitting");
    try {
      const result = await submitContact(parsed.data);
      setMessage(result.message);
      setState("success");
      formElement.reset();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
      setState("error");
    }
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
        title={
          <>
            Let's build something <span className="text-gradient">worth shipping.</span>
          </>
        }
        intro="Tell us what you're working on or book a strategy call directly. A senior team member will respond within one business day."
      />

      <section className="py-20">
        <div className="container-page grid lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-5 space-y-8">
            <div className="rounded-2xl border border-black/10 p-8 bg-white">
              <Mail className="w-5 h-5 text-brand-red mb-3" />
              <p className="eyebrow mb-2">Email</p>
              <a
                href="mailto:hello@logicsify.com"
                className="text-xl font-semibold hover:text-gradient"
              >
                hello@logicsify.com
              </a>
              <p className="mt-3 text-sm text-ink-soft">Responses within one business day.</p>
            </div>
            <a
              href="#calendar"
              className="block rounded-2xl border border-black/10 p-8 bg-white hover:-translate-y-1 transition-transform"
            >
              <Calendar className="w-5 h-5 text-brand-red mb-3" />
              <p className="eyebrow mb-2">Prefer to talk?</p>
              <p className="text-lg font-semibold">Book a 30-minute strategy call</p>
              <span className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 decoration-brand-red">
                Choose a date and time →
              </span>
            </a>
            <div className="rounded-2xl bg-lavender p-8">
              <p className="eyebrow mb-2">Where we help</p>
              <ul className="space-y-2 text-sm text-ink">
                {[
                  "Websites & Web Applications",
                  "SaaS Product Engineering",
                  "AI Automation & Agents",
                  "CRM & Systems Integration",
                  "SEO, Paid, and Content",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-red" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-start gap-3 text-xs text-ink-soft">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />
              We treat every inquiry as confidential. Your information is stored securely and used
              only to respond to your project.
            </div>
          </aside>

          <form
            onSubmit={onSubmit}
            className="lg:col-span-7 rounded-3xl bg-ink text-white p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
            <div className="relative">
              <p className="eyebrow text-white/60 mb-2">Project inquiry</p>
              <h2 className="text-3xl font-semibold mb-8">Tell us about your project</h2>

              {state === "success" ? (
                <div className="rounded-2xl border border-white/20 p-8 bg-white/5">
                  <div className="h-12 w-12 rounded-full bg-gradient-brand flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold">Thanks — got it.</h3>
                  <p className="mt-2 text-white/70">{message}</p>
                  <button
                    type="button"
                    className="btn-ghost-dark mt-6"
                    onClick={() => {
                      setState("idle");
                      setMessage("");
                    }}
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <Field name="name" label="Full name*" error={errors.name} />
                  <Field name="email" label="Work email*" type="email" error={errors.email} />
                  <Field name="phone" label="Phone" type="tel" error={errors.phone} />
                  <Field name="company" label="Company" error={errors.company} />
                  <Field
                    name="website"
                    label="Website"
                    type="url"
                    placeholder="https://"
                    error={errors.website}
                    className="md:col-span-2"
                  />
                  <SelectField
                    name="service"
                    label="Service required*"
                    options={services}
                    error={errors.service}
                  />
                  <SelectField
                    name="budget"
                    label="Estimated budget*"
                    options={budgets}
                    error={errors.budget}
                  />
                  <Field
                    name="timeline"
                    label="Desired timeline"
                    placeholder="e.g. Launch in Q1"
                    error={errors.timeline}
                    className="md:col-span-2"
                  />
                  <TextArea
                    name="description"
                    label="Project description*"
                    error={errors.description}
                    className="md:col-span-2"
                  />
                  <Field
                    name="source"
                    label="How did you hear about us?"
                    error={errors.source}
                    className="md:col-span-2"
                  />
                  <input
                    type="text"
                    name="honey"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden
                  />
                  <label className="md:col-span-2 flex items-start gap-3 text-sm text-white/80">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-1 h-4 w-4 rounded accent-[#FE3434]"
                    />
                    I agree to be contacted about my inquiry and understand the privacy policy
                    applies.*
                  </label>
                  {errors.consent && (
                    <p className="text-xs text-red-400 md:col-span-2">{errors.consent}</p>
                  )}
                  <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="md:col-span-2 btn-primary justify-center w-full mt-2 disabled:opacity-60"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      "Send inquiry"
                    )}
                  </button>
                  {state === "error" && (
                    <p className="md:col-span-2 text-sm text-red-300">{message}</p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      <section id="calendar" className="py-20 bg-cream scroll-mt-24">
        <div className="container-page">
          <div className="max-w-3xl mb-10">
            <p className="eyebrow mb-3">Live calendar</p>
            <h2 className="fluid-h2">
              Choose a time that <span className="text-gradient">works for you.</span>
            </h2>
            <p className="mt-5 text-ink-soft text-lg">
              Available times are loaded directly from our calendar settings. Your request will
              appear instantly in the Logicsify admin panel.
            </p>
          </div>
          <div className="rounded-3xl bg-ink text-white p-7 md:p-10 relative overflow-hidden">
            <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
            <div className="relative">
              <StrategyCallCalendar />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  error,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-widest text-white/60 mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SelectField({
  name,
  label,
  options,
  error,
}: {
  name: string;
  label: string;
  options: string[];
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-white/60 mb-2" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue=""
        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30"
      >
        <option value="" disabled className="text-black">
          Select…
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="text-black">
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function TextArea({
  name,
  label,
  error,
  className,
}: {
  name: string;
  label: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-widest text-white/60 mb-2" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={5}
        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
