import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Linkedin, Mail, Phone, Users } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteLayout } from "@/components/site-layout";
import { getPublicTeamMembers } from "@/lib/logicsify-api";

export const Route = createFileRoute("/team")({
  loader: async () => ({ team: await getPublicTeamMembers("profile") }),
  head: () => ({
    meta: [
      { title: "Our Team | Logicsify" },
      {
        name: "description",
        content:
          "Meet the Logicsify team working across AI automation, software development, CRM, websites, cybersecurity, and digital growth.",
      },
      { property: "og:title", content: "Our Team | Logicsify" },
      {
        property: "og:description",
        content:
          "Meet the people behind Logicsify's connected technology, automation, development, and digital growth work.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://logicsify.com/team" },
    ],
    links: [{ rel: "canonical", href: "https://logicsify.com/team" }],
  }),
  component: TeamPage,
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function linkedinUrl(links: Array<{ label: string; url: string; icon?: string }>) {
  return links.find((link) => /linkedin/i.test(`${link.label} ${link.icon || ""} ${link.url}`))?.url;
}

function TeamPage() {
  const { team } = Route.useLoaderData();

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our team"
        title={
          <>
            Senior people. Clear ownership. <span className="text-gradient">Connected delivery.</span>
          </>
        }
        intro="Meet the people working across strategy, automation, software, CRM, websites, cybersecurity, and growth at Logicsify. Team members appear here in the same order maintained in the Admin Panel."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Who We Are", to: "/about" }, { label: "Team" }]}
      />

      <section className="bg-background py-20 md:py-28">
        <div className="container-page">
          {team.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {team.map((member) => {
                const linkedin = linkedinUrl(member.links_json || []);
                return (
                  <article
                    key={member.id}
                    className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden bg-ink">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.display_name}
                          className="aspect-[4/3.7] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="brand-radial-glow grid aspect-[4/3.7] place-items-center">
                          <span className="text-7xl font-extrabold tracking-tight text-white/90">
                            {initials(member.display_name)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-6 pt-20 text-white">
                        <h2 className="text-2xl font-extrabold leading-tight">{member.display_name}</h2>
                        {member.headline ? (
                          <p className="mt-1.5 text-sm font-semibold text-white/68">{member.headline}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-6">
                      {member.bio ? (
                        <p className="line-clamp-4 text-sm leading-7 text-ink-soft">{member.bio}</p>
                      ) : (
                        <p className="text-sm leading-7 text-ink-soft">
                          Part of the Logicsify team, focused on dependable delivery and clear ownership.
                        </p>
                      )}

                      {member.skills_json?.length ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {member.skills_json.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-black/10 bg-cream px-3 py-1.5 text-xs font-semibold text-ink/70"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-black/8 pt-5">
                        {member.connect_enabled ? (
                          <Link
                            to="/connect/$slug"
                            params={{ slug: member.slug }}
                            className="btn-primary"
                          >
                            Connect <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                        {member.email ? (
                          <a
                            href={`mailto:${member.email}`}
                            aria-label={`Email ${member.display_name}`}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-ink transition hover:border-black/20 hover:bg-cream"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        ) : null}
                        {member.phone ? (
                          <a
                            href={`tel:${member.phone.replace(/[^+\d]/g, "")}`}
                            aria-label={`Call ${member.display_name}`}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-ink transition hover:border-black/20 hover:bg-cream"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        ) : null}
                        {linkedin ? (
                          <a
                            href={linkedin}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${member.display_name} on LinkedIn`}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-ink transition hover:border-black/20 hover:bg-cream"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center shadow-[var(--shadow-card)]">
              <Users className="mx-auto h-10 w-10 text-ink/30" />
              <h2 className="mt-4 text-2xl font-extrabold text-ink">Team profiles are being updated.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft">
                Published Team profiles will appear here automatically in the order maintained in the Admin Panel.
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-ink p-6 text-white sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Company overview</p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">See the complete Logicsify company profile.</h2>
            </div>
            <Link to="/company-profile" className="btn-ghost-dark">
              Open company profile <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
