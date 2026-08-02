import { createFileRoute, notFound } from "@tanstack/react-router";
import { Building2, Globe2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicRouteLoading } from "@/components/public-route-loading";
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

function ConnectProfilePage() {
  const p = Route.useLoaderData();
  const accent = p.theme_json?.accent || "#FE3434";
  const whatsapp = p.whatsapp?.replace(/\D/g, "");
  const actions = [
    p.email && { label: "Email", href: `mailto:${p.email}`, Icon: Mail },
    p.phone && { label: "Call", href: `tel:${p.phone}`, Icon: Phone },
    whatsapp && { label: "WhatsApp", href: `https://wa.me/${whatsapp}`, Icon: MessageCircle },
    p.website && { label: "Website", href: p.website, Icon: Globe2 },
  ].filter(Boolean) as Array<{ label: string; href: string; Icon: typeof Mail }>;
  return (
    <main className="min-h-dvh bg-[#f7f4fa] px-4 py-8 text-[#190A2F] md:py-14">
      <article className="mx-auto max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_-45px_rgba(25,10,47,.55)]">
        <div
          className="h-40 bg-[#190A2F] bg-cover bg-center"
          style={
            p.cover_url
              ? { backgroundImage: `url(${p.cover_url})` }
              : {
                  backgroundImage: `radial-gradient(circle at 15% 20%, ${accent}99, transparent 45%), radial-gradient(circle at 85% 70%, #FDBE0277, transparent 40%)`,
                }
          }
        />
        <div className="px-6 pb-8 md:px-9">
          <div className="-mt-16">
            {p.avatar_url ? (
              <img
                src={p.avatar_url}
                alt={p.display_name}
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <span className="grid h-32 w-32 place-items-center rounded-full border-4 border-white bg-[#190A2F] text-4xl font-bold text-white shadow-lg">
                {p.display_name.slice(0, 1)}
              </span>
            )}
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">{p.display_name}</h1>
          {p.headline ? <p className="mt-2 text-lg text-slate-600">{p.headline}</p> : null}
          {p.company ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4" />
              {p.company}
            </p>
          ) : null}
          {p.bio ? (
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">{p.bio}</p>
          ) : null}
          <div className="mt-7 grid grid-cols-2 gap-3">
            {actions.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                style={{ backgroundColor: accent }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </div>
          {p.address ? (
            <p className="mt-6 flex items-start gap-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <MapPin className="mt-1 h-4 w-4 shrink-0" />
              {p.address}
            </p>
          ) : null}
          {p.links_json.length ? (
            <div className="mt-6 space-y-3">
              {p.links_json.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span>{link.label}</span>
                  <Globe2 className="h-4 w-4 text-slate-400" />
                </a>
              ))}
            </div>
          ) : null}
          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[.2em] text-slate-300">
            Powered by Logicsify
          </p>
        </div>
      </article>
    </main>
  );
}
