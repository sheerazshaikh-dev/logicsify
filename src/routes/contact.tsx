import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Calendar,
  Check,
  ExternalLink,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import { z } from "zod";
import { PageHero } from "@/components/page-hero";
import { SiteLayout } from "@/components/site-layout";
import { SocialProfileLinks } from "@/components/social-profile-links";
import { StrategyCallCalendar } from "@/components/strategy-call-calendar";
import {
  getContactEmails,
  getSiteLocations,
  getSocialProfiles,
  locationMapUrl,
  telHref,
} from "@/lib/contact-directory";
import {
  getPublicSiteSettings,
  submitContact,
  type PublicSiteSettings,
} from "@/lib/logicsify-api";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Logicsify | Start a Project" },
      {
        name: "description",
        content: "Tell us about your project or book a strategy call directly from our calendar.",
      },
      { property: "og:url", content: "https://logicsify.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/contact" }],
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
  "AI Automation & Voice Agents",
  "CRM & Revenue Operations",
  "Custom Websites, Portals & CMS",
  "Mobile App Development",
  "UI/UX Design",
  "SEO & Digital Marketing",
  "Branding",
  "Cloud & Maintenance",
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
  const [settings, setSettings] = useState<PublicSiteSettings>({});

  useEffect(() => {
    let active = true;
    getPublicSiteSettings()
      .then((value) => active && setSettings(value))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const emails = getContactEmails(settings);
  const locations = getSiteLocations(settings);
  const socialProfiles = getSocialProfiles(settings);
  const primaryPhone = settings.phone || locations.find((location) => location.phone)?.phone || "";

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
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-black/10 bg-white p-7 md:p-8">
              <p className="eyebrow mb-5">Contact channels</p>
              <div className="divide-y divide-black/8">
                <ContactChannel
                  icon={Mail}
                  label="General inquiries"
                  value={emails.general}
                  href={`mailto:${emails.general}`}
                />
                <ContactChannel
                  icon={Mail}
                  label="Sales and projects"
                  value={emails.sales}
                  href={`mailto:${emails.sales}`}
                />
                <ContactChannel
                  icon={Headphones}
                  label="Customer support"
                  value={emails.support}
                  href={`mailto:${emails.support}`}
                />
                {primaryPhone ? (
                  <ContactChannel
                    icon={Phone}
                    label="Call us"
                    value={primaryPhone}
                    href={telHref(primaryPhone)}
                  />
                ) : null}
              </div>
              {socialProfiles.length ? (
                <div className="mt-6 border-t border-black/8 pt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Follow Logicsify
                  </p>
                  <SocialProfileLinks profiles={socialProfiles} tone="light" showLabels />
                </div>
              ) : null}
            </div>

            <a
              href="#calendar"
              className="block rounded-3xl border border-black/10 bg-white p-7 transition-transform hover:-translate-y-1 md:p-8"
            >
              <Calendar className="mb-3 h-5 w-5 text-brand-red" />
              <p className="eyebrow mb-2">Prefer to talk?</p>
              <p className="text-lg font-semibold">Book a 30-minute strategy call</p>
              <span className="mt-3 inline-block text-sm font-semibold underline decoration-brand-red underline-offset-4">
                Choose a date and time →
              </span>
            </a>

            <div className="rounded-3xl bg-lavender p-7 md:p-8">
              <p className="eyebrow mb-2">Where we help</p>
              <ul className="space-y-2 text-sm text-ink">
                {[
                  "AI automation and voice agents",
                  "CRM and revenue operations",
                  "Websites, portals and CMS platforms",
                  "Mobile products and user experience",
                  "Digital growth and ongoing support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-red" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3 text-xs text-ink-soft">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              We treat every inquiry as confidential. Your information is stored securely and used
              only to respond to your project.
            </div>
          </aside>

          <form
            onSubmit={onSubmit}
            className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white md:p-10 lg:col-span-7"
          >
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
            <div className="relative">
              <p className="eyebrow mb-2 text-white/60">Project inquiry</p>
              <h2 className="mb-8 text-3xl font-semibold">Tell us about your project</h2>

              {state === "success" ? (
                <div className="rounded-2xl border border-white/20 bg-white/5 p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand">
                    <Check className="h-6 w-6 text-white" />
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
                <div className="grid gap-4 md:grid-cols-2">
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
                  <label className="flex items-start gap-3 text-sm text-white/80 md:col-span-2">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-1 h-4 w-4 rounded accent-[#FE3434]"
                    />
                    I agree to be contacted about my inquiry and understand the privacy policy
                    applies.*
                  </label>
                  {errors.consent ? (
                    <p className="text-xs text-red-400 md:col-span-2">{errors.consent}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="btn-primary mt-2 w-full justify-center disabled:opacity-60 md:col-span-2"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      "Send inquiry"
                    )}
                  </button>
                  {state === "error" ? (
                    <p className="text-sm text-red-300 md:col-span-2">{message}</p>
                  ) : null}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="border-y border-black/5 bg-cream py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="eyebrow mb-3">Global presence</p>
            <h2 className="fluid-h2">
              Talk to the team <span className="text-gradient">closest to your market.</span>
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Logicsify currently operates across Pakistan, Saudi Arabia, and Portugal. Every
              location is managed globally from the same website settings.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {locations.map((location) => {
              const mapUrl = locationMapUrl(location);
              return (
                <article
                  key={location.id}
                  className="flex min-h-80 flex-col rounded-3xl border border-black/8 bg-white p-7 md:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lavender text-brand-red">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                      {location.country || "Location"}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-ink">{location.name}</h3>
                  {location.city && location.city !== location.name ? (
                    <p className="mt-1 text-sm text-ink-soft">{location.city}</p>
                  ) : null}
                  {location.address ? (
                    <p className="mt-5 whitespace-pre-line text-sm leading-6 text-ink-soft">
                      {location.address}
                    </p>
                  ) : null}
                  {(location.contact_name || location.contact_role) ? (
                    <div className="mt-6 border-t border-black/8 pt-5">
                      {location.contact_name ? (
                        <p className="font-semibold text-ink">{location.contact_name}</p>
                      ) : null}
                      {location.contact_role ? (
                        <p className="mt-1 text-xs text-ink-soft">{location.contact_role}</p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-sm font-semibold">
                    {location.phone ? (
                      <a
                        href={telHref(location.phone)}
                        className="inline-flex items-center gap-2 text-ink hover:text-brand-red"
                      >
                        <Phone className="h-4 w-4" /> {location.phone}
                      </a>
                    ) : null}
                    {location.email ? (
                      <a
                        href={`mailto:${location.email}`}
                        className="inline-flex items-center gap-2 text-ink hover:text-brand-red"
                      >
                        <Mail className="h-4 w-4" /> {location.email}
                      </a>
                    ) : null}
                    {mapUrl ? (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-ink hover:text-brand-red"
                      >
                        Map <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="calendar" className="scroll-mt-24 bg-cream py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <p className="eyebrow mb-3">Live calendar</p>
            <h2 className="fluid-h2">
              Choose a time that <span className="text-gradient">works for you.</span>
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Available times are loaded directly from our calendar settings. Your request will
              appear instantly in the Logicsify admin panel.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white md:p-10">
            <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
            <div className="relative">
              <StrategyCallCalendar />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ContactChannel({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a href={href} className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-brand-red transition group-hover:bg-lavender">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-soft">
          {label}
        </span>
        <span className="mt-1 block break-all font-semibold text-ink transition group-hover:text-brand-red">
          {value}
        </span>
      </span>
    </a>
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
      <label className="mb-2 block text-xs uppercase tracking-widest text-white/60" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
      />
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
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
      <label className="mb-2 block text-xs uppercase tracking-widest text-white/60" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue=""
        className="w-full rounded-xl border border-white/15 bg-[#24113e] px-4 py-3 text-white focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
      >
        <option value="" disabled>
          Select one
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
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
      <label className="mb-2 block text-xs uppercase tracking-widest text-white/60" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={6}
        className="w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
      />
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
