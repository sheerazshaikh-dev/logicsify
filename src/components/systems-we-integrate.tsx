import { useEffect, useMemo, useState } from "react";
import { supportedIntegrations } from "@/lib/expansion-data";
import { getCmsContentList, type CmsContentItem } from "@/lib/logicsify-api";

const categories = ["All", "CRM", "Development", "AI", "Marketing", "Automation", "Payments", "Communication"] as const;
type Category = (typeof categories)[number];
type IntegrationItem = { slug: string; name: string; category: Exclude<Category, "All">; text: string; logo?: string; platformUrl?: string };

function normalizeCategory(value: unknown): Exclude<Category, "All"> {
  const label = String(value || "Development");
  return (categories.includes(label as Category) && label !== "All" ? label : "Development") as Exclude<Category, "All">;
}

function fromCms(item: CmsContentItem): IntegrationItem {
  const content = item.content_json || {};
  return {
    slug: item.slug,
    name: item.title,
    category: normalizeCategory(content.category),
    text: item.excerpt || String(content.category || "Supported integration"),
    logo: String(content.logo || item.featured_image || "") || undefined,
    platformUrl: String(content.platform_url || "") || undefined,
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function SystemsWeIntegrate({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState<Category>("All");
  const [managed, setManaged] = useState<IntegrationItem[]>([]);

  useEffect(() => {
    let active = true;
    void getCmsContentList("integration").then((items) => {
      if (active && items.length) setManaged(items.map(fromCms));
    });
    return () => { active = false; };
  }, []);

  const source: IntegrationItem[] = managed.length
    ? managed
    : supportedIntegrations.map((item) => ({ ...item, slug: slugify(item.name), category: normalizeCategory(item.category) }));
  const items = useMemo(
    () => source.filter((item) => category === "All" || item.category === category),
    [category, source],
  );

  return (
    <section className={compact ? "py-16" : "py-24 bg-cream"}>
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Supported integrations</p>
          <h2 className="fluid-h2">Platforms and systems we work with.</h2>
          <p className="mt-5 text-ink-soft">
            Integration choice depends on API access, account permissions, data quality, and the operating workflow.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter integrations">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-ink hover:border-black/25"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {items.map((item) => {
            const card = <>
              {item.logo ? (
                <img src={item.logo} alt={`${item.name} logo`} loading="lazy" className="mx-auto h-11 w-11 object-contain" />
              ) : (
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-lavender font-display text-sm font-bold text-ink" aria-hidden>
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <p className="mt-3 text-sm font-semibold text-ink">{item.name}</p>
              <p className="mt-1 text-[11px] text-ink-soft">{item.text}</p>
            </>;
            return item.platformUrl ? (
              <a id={item.slug} key={item.name} href={item.platformUrl} target="_blank" rel="noreferrer" className="scroll-mt-28 rounded-2xl border border-black/10 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                {card}
              </a>
            ) : (
              <div id={item.slug} key={item.name} className="scroll-mt-28 rounded-2xl border border-black/10 bg-white p-5 text-center shadow-sm">{card}</div>
            );
          })}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-ink-soft">
          Logos identify platforms Logicsify can work with and do not imply a formal partnership unless specifically stated.
        </p>
      </div>
    </section>
  );
}
