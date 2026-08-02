import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Facebook,
  Github,
  Globe2,
  Instagram,
  Link,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Sparkles,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { PublicRouteLoading } from "@/components/public-route-loading";
import {
  getLocationAddresses,
  getLocationPhones,
  locationMapUrl,
  telHref,
} from "@/lib/contact-directory";
import {
  CONNECT_PROFILE_PLATFORM_LABELS,
  resolveConnectProfilePlatform,
  type ConnectProfilePlatform,
} from "@/lib/connect-profile-links";
import { getConnectProfile } from "@/lib/logicsify-api";

export const Route = createFileRoute("/connect/$slug")({
  pendingComponent: PublicRouteLoading,
  loader: async ({ params }) => {
    try {
      return await getConnectProfile(params.slug);
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: loaderData ? `${loaderData.display_name} | Connect` : "Connect | Logicsify" },
      {
        name: "description",
        content:
          loaderData?.bio ||
          loaderData?.headline ||
          `Connect with ${loaderData?.display_name || "Logicsify"}.`,
      },
      ...(loaderData?.noindex || loaderData?.is_unlisted
        ? [{ name: "robots", content: "noindex, nofollow, noarchive" }]
        : [{ name: "robots", content: "index, follow" }]),
      { property: "og:title", content: loaderData?.display_name || "Connect" },
      { property: "og:description", content: loaderData?.headline || loaderData?.bio || "" },
      ...(loaderData?.avatar_url ? [{ property: "og:image", content: loaderData.avatar_url }] : []),
    ],
    links: [{ rel: "canonical", href: `https://logicsify.com/connect/${params.slug}` }],
  }),
  component: ConnectProfilePage,
});

const SOCIAL_ICONS: Record<ConnectProfilePlatform, LucideIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  x: Twitter,
  github: Github,
  tiktok: Music2,
  whatsapp: MessageCircle,
  website: Globe2,
  link: Link,
};

function ConnectProfilePage() {
  const profile = Route.useLoaderData();
  const accent = profile.theme_json?.accent || "#FE3434";
  const coverUrl = profile.global_cover_url || profile.cover_url;
  const whatsapp = profile.whatsapp?.replace(/\D/g, "");
  const actions = [
    profile.email && { label: "Email me", href: `mailto:${profile.email}`, Icon: Mail },
    profile.phone && { label: "Direct call", href: `tel:${profile.phone}`, Icon: Phone },
    whatsapp && {
      label: "Direct WhatsApp",
      href: `https://wa.me/${whatsapp}`,
      Icon: MessageCircle,
    },
    { label: "Visit Logicsify", href: "https://logicsify.com", Icon: Globe2 },
  ].filter(Boolean) as Array<{ label: string; href: string; Icon: LucideIcon }>;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f7f4fa] px-4 py-6 text-[#190A2F] sm:px-6 md:py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#FE3434]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-[#FDBE02]/12 blur-3xl" />
      <article className="relative mx-auto max-w-2xl overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-[0_38px_120px_-52px_rgba(25,10,47,.52)]">
        <div
          className="relative h-52 overflow-hidden bg-[#190A2F] bg-cover bg-center sm:h-64"
          style={
            coverUrl
              ? { backgroundImage: `url(${coverUrl})` }
              : {
                  backgroundImage: `radial-gradient(circle at 15% 20%, ${accent}cc, transparent 43%), radial-gradient(circle at 82% 70%, #FDBE0299, transparent 42%), linear-gradient(135deg, #190A2F, #361141)`,
                }
          }
        >
          {coverUrl ? (
            <div className="absolute inset-0 bg-gradient-to-t from-[#190A2F]/55 via-transparent to-[#190A2F]/15" />
          ) : null}
          <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#190A2F]/55 px-4 py-2 text-xs font-bold text-white backdrop-blur-md sm:bottom-7 sm:right-7">
            <Sparkles className="h-3.5 w-3.5 text-[#FDBE02]" />
            Logicsify team
          </span>
        </div>

        <div className="px-6 pb-8 sm:px-10 sm:pb-10">
          <div className="relative z-10 -mt-12 flex items-end justify-between sm:-mt-16">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-32 w-32 rounded-[2rem] border-[5px] border-white bg-white object-cover object-[center_18%] shadow-xl sm:h-40 sm:w-40 sm:rounded-[2.4rem]"
              />
            ) : (
              <span
                className="grid h-32 w-32 place-items-center rounded-[2rem] border-[5px] border-white text-5xl font-bold text-white shadow-xl sm:h-40 sm:w-40 sm:rounded-[2.4rem]"
                style={{ background: `linear-gradient(135deg, ${accent}, #FDBE02)` }}
              >
                {profile.display_name.slice(0, 1)}
              </span>
            )}
            <a
              href="https://logicsify.com"
              target="_blank"
              rel="noreferrer"
              className="mb-2 hidden items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-slate-400 transition hover:text-[#190A2F] sm:inline-flex"
            >
              logicsify.com
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {profile.display_name}
            </h1>
            {profile.headline ? (
              <p className="mt-2 text-base font-medium text-slate-600 sm:text-lg">
                {profile.headline}
              </p>
            ) : null}
            <div
              className="mt-5 h-1.5 w-20 rounded-full"
              style={{ background: `linear-gradient(90deg, ${accent}, #FDBE02)` }}
            />
          </div>

          {profile.bio ? (
            <div className="mt-7 rounded-3xl border border-slate-100 bg-[#faf8fc] p-5 sm:p-6">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{profile.bio}</p>
            </div>
          ) : null}

          {profile.assigned_locations?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.assigned_locations.map((location) => (
                <div
                  key={location.id}
                  className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-sm"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#FE3434]" />
                  <span className="font-semibold text-[#190A2F]">{location.name} office</span>
                  {getLocationPhones(location).map((phone) => (
                    <a
                      key={phone}
                      href={telHref(phone)}
                      className="border-l border-slate-200 pl-2 font-medium hover:text-[#FE3434]"
                    >
                      Office: {phone}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {actions.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-[0_14px_35px_-20px_rgba(25,10,47,.8)] transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: `linear-gradient(115deg, ${accent}, #ff5941)` }}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-60 transition group-hover:opacity-100" />
              </a>
            ))}
          </div>

          {profile.address ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600 shadow-[0_12px_34px_-28px_rgba(25,10,47,.55)]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f5eff8] text-[#190A2F]">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="pt-1">
                <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
                  Assigned office address
                </span>
                <span className="mt-1 block whitespace-pre-line">{profile.address}</span>
              </span>
            </div>
          ) : null}

          {profile.links_json.length ? (
            <section className="mt-8 border-t border-slate-100 pt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
                    Social links
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">Find me online</h2>
                </div>
                <p className="text-xs text-slate-400">Tap an icon to open</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {profile.links_json.map((social) => {
                  const platform = resolveConnectProfilePlatform(social);
                  const Icon = SOCIAL_ICONS[platform];
                  return (
                    <a
                      key={`${social.label}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#190A2F] text-white shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {social.label || CONNECT_PROFILE_PLATFORM_LABELS[platform]}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {CONNECT_PROFILE_PLATFORM_LABELS[platform]}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#190A2F]" />
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}

          {profile.other_locations?.length ? (
            <section className="mt-8 border-t border-slate-100 pt-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">
                  Other locations
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  Connect with another Logicsify office
                </h2>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {profile.other_locations.map((location) => {
                  const mapUrl = locationMapUrl(location);
                  const addresses = getLocationAddresses(location);
                  const phones = getLocationPhones(location);
                  return (
                    <article
                      key={location.id}
                      className="rounded-2xl border border-slate-200 bg-[#faf8fc] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#190A2F] shadow-sm">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#190A2F]">{location.name}</h3>
                          {[location.city, location.country].filter(Boolean).length ? (
                            <p className="mt-1 text-xs text-slate-400">
                              {[location.city, location.country].filter(Boolean).join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {phones.map((phone) => (
                        <a
                          key={phone}
                          href={telHref(phone)}
                          className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#190A2F]"
                        >
                          <Phone className="h-4 w-4 text-[#FE3434]" />
                          Office: {phone}
                        </a>
                      ))}
                      {addresses.length ? (
                        <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                          {addresses.map((address) => (
                            <p key={address}>{address}</p>
                          ))}
                        </div>
                      ) : null}
                      {addresses.length || location.map_url ? (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#FE3434]"
                        >
                          Open map <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <div className="mt-9 flex items-center justify-center gap-3 border-t border-slate-100 pt-7">
            <img src="/logicsify-mark.png" alt="" className="h-6 w-auto" />
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-300">
              Powered by Logicsify
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
