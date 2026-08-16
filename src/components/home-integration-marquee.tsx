import { useEffect, useMemo, useState } from "react";
import { getCmsContentList, type CmsContentItem } from "@/lib/logicsify-api";
import { supportedIntegrations } from "@/lib/expansion-data";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fallbackLogo(name: string) {
  const aliases: Record<string, string> = {
    Meta: "meta-ads",
  };
  const slug = aliases[name] || slugify(name).replace(/^go-high-level$/, "gohighlevel");
  return `https://backend.logicsify.com/integration-icons/${slug}.svg`;
}

function integrationLogo(item: CmsContentItem) {
  const content = item.content_json || {};
  return String(content.logo || item.featured_image || "").trim() || fallbackLogo(item.title);
}

export function HomeIntegrationMarquee() {
  const [managed, setManaged] = useState<CmsContentItem[]>([]);

  useEffect(() => {
    let active = true;
    void getCmsContentList("integration")
      .then((items) => {
        if (active) setManaged(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const integrations = useMemo(() => {
    const source = managed.length
      ? managed.map((item) => ({
          name: item.title,
          logo: integrationLogo(item),
          href: `/integrations#${encodeURIComponent(item.slug)}`,
        }))
      : supportedIntegrations.map((item) => ({
          name: item.name,
          logo: fallbackLogo(item.name),
          href: `/integrations#${encodeURIComponent(slugify(item.name))}`,
        }));
    return [...source, ...source];
  }, [managed]);

  if (!integrations.length) return null;

  return (
    <section className="overflow-hidden border-b border-black/5 bg-white py-5" aria-label="Supported integrations">
      <div className="relative">
        <div
          className="flex w-max items-center gap-9 whitespace-nowrap animate-marquee"
          style={{ animationDirection: "reverse", animationDuration: "48s" }}
        >
          {integrations.map((item, index) => (
            <a
              key={`${item.name}-${index}`}
              href={item.href}
              title={item.name}
              aria-label={`View ${item.name} integration`}
              className="grid h-14 w-20 shrink-0 place-items-center px-2 opacity-75 transition duration-300 hover:-translate-y-0.5 hover:opacity-100"
            >
              <img
                src={item.logo}
                alt={`${item.name} logo`}
                className="h-9 max-w-[60px] object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
