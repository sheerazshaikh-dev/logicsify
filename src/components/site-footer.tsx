import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_BRAND_ASSETS, optimizedBrandAsset } from "@/lib/brand-assets";
import { rememberRoadmapSource, trackAnalytics } from "@/lib/analytics";
import {
  getContactEmails,
  getLocationAddresses,
  getLocationPhones,
  getSiteLocations,
  getSocialProfiles,
  locationMapUrl,
  telHref,
} from "@/lib/contact-directory";
import { getPublicSiteSettings, type PublicSiteSettings } from "@/lib/logicsify-api";
import { SocialProfileLinks } from "@/components/social-profile-links";

const columns: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: "Core Services",
    links: [
      ["AI Automation & Voice Agents", "/services/ai-automation-voice-agents"],
      ["CRM & Revenue Operations", "/services/crm-revenue-operations"],
      ["Custom Websites, Portals & CMS", "/services/custom-websites-portals-cms"],
      ["All Services", "/services"],
      ["Supported Integrations", "/integrations"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Resource Hub", "/resources"],
      ["Insights", "/insights"],
      ["Guides", "/guides"],
      ["Case Studies", "/work"],
      ["Automation Lab", "/automation-lab"],
      ["Project Estimator", "/project-estimator"],
      ["Engagement Models", "/engagement-models"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Home", "/"],
      ["Who We Are", "/about"],
      ["Work", "/work"],
      ["Contact", "/contact"],
      ["Technical Roadmap", "/technical-roadmap"],
    ],
  },
];

export function SiteFooter() {
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
  const locations = getSiteLocations(settings, "footer");
  const socialProfiles = getSocialProfiles(settings);
  const phone = settings.phone || "+966 54 441 5405";
  const description =
    settings.footer_description ||
    settings.tagline ||
    "We build AI-powered sales, customer service, and business operations systems.";
  const ctaLabel = settings.footer_cta_label || "Discuss Your Project";
  const ctaUrl = settings.footer_cta_url || "/contact";
  const copyright = (settings.copyright_text || "© {year} Logicsify. All rights reserved.").replace(
    /\{year\}/g,
    String(new Date().getFullYear()),
  );

  return (
    <footer data-cms-ignore="true" className="section-dark grid-noise relative mt-24 pb-10 pt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-brand" />
      <div className="container-page relative">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
          <div>
            <img
              src={optimizedBrandAsset(
                settings.footer_logo || settings.logo_light,
                DEFAULT_BRAND_ASSETS.logoLight,
              )}
              alt={settings.site_name || "Logicsify"}
              width={928}
              height={224}
              loading="lazy"
              decoding="async"
              className="mb-6 h-10 w-auto"
            />
            <p className="max-w-sm text-sm leading-relaxed text-white/70">{description}</p>
            <Link
              to={ctaUrl}
              onClick={() => {
                rememberRoadmapSource("footer");
                trackAnalytics("technical_roadmap_cta_clicked", { placement: "footer" });
              }}
              className="btn-primary mt-7 inline-flex text-sm"
            >
              {ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            {boolSetting(settings.show_social_links, true) ? (
              <SocialProfileLinks profiles={socialProfiles} tone="dark" className="mt-6" />
            ) : null}
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="eyebrow mb-4 text-white/60">{column.title}</p>
              <ul className="space-y-2.5">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-8 border-t border-white/10 pt-10 xl:grid-cols-[0.78fr_2.22fr]">
          <div>
            <p className="eyebrow mb-5 text-white/60">Contact</p>
            <div className="space-y-4 text-sm">
              <ContactLink
                icon={Mail}
                label="General"
                href={`mailto:${emails.general}`}
                value={emails.general}
              />
              <ContactLink
                icon={Mail}
                label="Sales"
                href={`mailto:${emails.sales}`}
                value={emails.sales}
              />
              <ContactLink
                icon={Mail}
                label="Support"
                href={`mailto:${emails.support}`}
                value={emails.support}
              />
              {phone ? (
                <ContactLink icon={Phone} label="Phone" href={telHref(phone)} value={phone} />
              ) : null}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-5 text-white/60">Our locations</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {locations.map((location) => {
                const mapUrl = locationMapUrl(location);
                const addresses = getLocationAddresses(location);
                const phones = getLocationPhones(location);
                return (
                  <article
                    key={location.id}
                    className="flex min-h-52 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#FDBE02]">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-white">{location.name}</h3>
                        <p className="mt-1 text-xs text-white/50">
                          {[location.city, location.country]
                            .filter(Boolean)
                            .filter((value, index, values) => values.indexOf(value) === index)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    {addresses.length ? (
                      <div className="mt-4 space-y-2 text-xs leading-5 text-white/60">
                        {addresses.map((address) => (
                          <p key={address}>{address}</p>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-auto pt-5 text-xs text-white/65">
                      {phones.map((locationPhone) => (
                        <a
                          key={locationPhone}
                          href={telHref(locationPhone)}
                          className="mt-1 block first:mt-0 hover:text-white"
                        >
                          {locationPhone}
                        </a>
                      ))}
                      {mapUrl ? (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex font-semibold text-white hover:text-[#FDBE02]"
                        >
                          Open in maps →
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>{copyright}</p>
          <div className="flex gap-6">
            {boolSetting(settings.show_privacy_link, true) ? (
              <Link to="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            ) : null}
            {boolSetting(settings.show_terms_link, true) ? (
              <Link to="/terms" className="hover:text-white">
                Terms &amp; Conditions
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactLink({
  icon: Icon,
  label,
  href,
  value,
}: {
  icon: typeof Mail;
  label: string;
  href: string;
  value: string;
}) {
  return (
    <a href={href} className="group flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/35 transition group-hover:text-[#FDBE02]" />
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</span>
        <span className="mt-0.5 block break-all text-white/70 transition group-hover:text-white">
          {value}
        </span>
      </span>
    </a>
  );
}

function boolSetting(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}
