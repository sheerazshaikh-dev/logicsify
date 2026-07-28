import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PageHero } from "@/components/page-hero";
import { CTASection } from "@/components/cta-section";
import { getCmsContentList, getPublicSiteSettings, type CmsContentItem, type PublicSiteSettings } from "@/lib/logicsify-api";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Logicsify | Technology, AI & Growth Partner" },
      { name: "description", content: "Learn how Logicsify plans, designs, builds, tests, launches, and supports websites, software, and automation systems." },
      { property: "og:title", content: "About Logicsify" },
      { property: "og:url", content: "https://logicsify.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/about" }],
  }),
});

const process = [
  ["Discovery", "Clarify the business problem, users, current systems, constraints, and success criteria."],
  ["Scope and technical plan", "Define the delivery phases, responsibilities, architecture, integrations, and acceptance criteria."],
  ["Design", "Translate requirements into flows, interfaces, content structure, and reviewed prototypes."],
  ["Development", "Build in controlled increments with version control, review, and visible staging progress."],
  ["Quality assurance", "Test responsive behavior, browsers, forms, accessibility, performance, and critical workflows."],
  ["Launch", "Complete staging approval, deployment checks, analytics verification, redirects, and handover."],
  ["Support and iteration", "Resolve agreed post-launch issues and plan ongoing improvements under the selected engagement model."],
] as const;

const qaPractices = [
  "Code review",
  "Responsive testing",
  "Browser testing",
  "Functional and form testing",
  "Performance checks",
  "Accessibility checks",
  "Security review",
  "Staging approval",
  "Deployment checklist",
];

function AboutPage() {
  const [team, setTeam] = useState<CmsContentItem[]>([]);
  const [settings, setSettings] = useState<PublicSiteSettings>({});

  useEffect(() => {
    let active = true;
    Promise.all([getCmsContentList("team"), getPublicSiteSettings()])
      .then(([members, site]) => {
        if (!active) return;
        setTeam(members.filter((member) => member.title && member.content_json?.role));
        setSettings(site);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="About Logicsify"
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
        title={<>Technology, design, automation, and growth on <span className="text-gradient">one roadmap.</span></>}
        intro="Logicsify plans and delivers connected digital systems while keeping scope, responsibilities, progress, and decisions visible to the client."
        primaryCta={{ label: "Get a Free Technical Roadmap", to: "/technical-roadmap" }}
        secondaryCta={{ label: "View Our Work", to: "/work" }}
      />

      <section className="py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5"><p className="eyebrow mb-4">Working approach</p><h2 className="fluid-h2">A clear path from discovery to support.</h2></div>
          <div className="grid gap-4 lg:col-span-7 sm:grid-cols-2">
            {process.map(([title, body], index) => <article key={title} className="rounded-2xl border border-black/5 bg-white p-6"><span className="text-xs font-semibold text-brand-red">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-cream py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div><p className="eyebrow mb-4">Quality assurance</p><h2 className="fluid-h2">Checks built into delivery, not left for launch day.</h2><div className="mt-8 grid gap-3 sm:grid-cols-2">{qaPractices.map((item) => <div key={item} className="flex items-start gap-3 rounded-xl bg-white p-4"><span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-white"><Check className="h-3.5 w-3.5" /></span><span className="text-sm font-medium text-ink">{item}</span></div>)}</div></div>
          <div className="space-y-5">
            <CredibilityCard title="Communication cadence" body="Project communication can include a shared project board, defined point of contact, written change requests, milestone reviews, staging previews, and regular progress updates." />
            <CredibilityCard title="Support policy" body={settings.post_launch_period || "Post-launch support scope and duration are agreed in writing for each engagement. Ongoing maintenance is handled separately when required."} />
            {settings.support_hours ? <CredibilityCard title="Working hours" body={settings.support_hours} /> : null}
            {settings.support_response_expectation ? <CredibilityCard title="Response expectations" body={settings.support_response_expectation} /> : null}
            {settings.emergency_support_policy ? <CredibilityCard title="Emergency support" body={settings.emergency_support_policy} /> : null}
            {settings.maintenance_exclusions ? <CredibilityCard title="Maintenance exclusions" body={settings.maintenance_exclusions} /> : null}
          </div>
        </div>
      </section>

      {team.length ? (
        <section id="team" className="py-24">
          <div className="container-page"><div className="mb-12 max-w-3xl"><p className="eyebrow mb-4">Team</p><h2 className="fluid-h2">The people responsible for the work.</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{team.map((member) => { const skills = Array.isArray(member.content_json?.skills) ? member.content_json.skills.map(String) : []; const linkedIn = String(member.content_json?.linkedin_url || ""); return <article key={member.slug} className="rounded-2xl border border-black/5 bg-white p-5">{member.featured_image ? <img src={member.featured_image} alt={member.title} loading="lazy" className="mb-5 aspect-square w-full rounded-xl object-cover" /> : null}<h3 className="text-xl font-semibold">{member.title}</h3><p className="mt-1 text-sm text-brand-red">{String(member.content_json?.role || "")}</p>{member.content_json?.body ? <div className="public-prose mt-4 text-sm" dangerouslySetInnerHTML={{ __html: String(member.content_json.body) }} /> : null}{skills.length ? <div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full bg-lavender px-2.5 py-1 text-xs">{skill}</span>)}</div> : null}{linkedIn ? <a href={linkedIn} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">LinkedIn <ExternalLink className="h-3.5 w-3.5" /></a> : null}</article>; })}</div></div>
        </section>
      ) : null}

      <section className="py-24">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <Link to="/engagement-models" className="rounded-3xl bg-ink p-10 text-white"><p className="eyebrow mb-4 text-white/60">Engagement models</p><h3 className="fluid-h3 text-white">Choose how the work is delivered.</h3></Link>
          <Link to="/technical-roadmap" className="rounded-3xl bg-lavender p-10 text-ink"><p className="eyebrow mb-4">Next step</p><h3 className="fluid-h3">Get a Free Technical Roadmap</h3></Link>
        </div>
      </section>
      <CTASection />
    </SiteLayout>
  );
}

function CredibilityCard({ title, body }: { title: string; body: string }) {
  return <article className="rounded-2xl border border-black/5 bg-white p-6"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-soft">{body}</p></article>;
}
