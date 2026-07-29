import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_BRAND_ASSETS } from "@/lib/brand-assets";
import { rememberRoadmapSource, trackAnalytics } from "@/lib/analytics";
import { getPublicSiteSettings, type PublicSiteSettings } from "@/lib/logicsify-api";

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
      ["About", "/about"],
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

  const email = settings.footer_email || settings.contact_email || "hello@logicsify.com";
  const phone = settings.footer_phone || settings.phone || "";
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
  const socialLinks = [
    { icon: Linkedin, href: settings.linkedin_url, label: "LinkedIn" },
    { icon: Instagram, href: settings.instagram_url, label: "Instagram" },
    { icon: Facebook, href: settings.facebook_url, label: "Facebook" },
    { icon: Youtube, href: settings.youtube_url, label: "YouTube" },
    { icon: ExternalLink, href: settings.portfolio_url, label: "Portfolio" },
  ].filter((item) => Boolean(item.href));

  return (
    <footer data-cms-ignore="true" className="section-dark grid-noise relative mt-24 pb-10 pt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-brand" />
      <div className="container-page relative">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_repeat(3,1fr)]">
          <div>
            <img
              src={settings.footer_logo || settings.logo_light || DEFAULT_BRAND_ASSETS.logoLight}
              alt={settings.site_name || "Logicsify"}
              className="mb-6 h-10 w-auto"
            />
            <p className="max-w-sm text-sm leading-relaxed text-white/70">{description}</p>
            <Link
              to={ctaUrl}
              onClick={() => { rememberRoadmapSource("footer"); trackAnalytics("technical_roadmap_cta_clicked", { placement: "footer" }); }}
              className="btn-primary mt-7 inline-flex text-sm"
            >
              {ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-7 space-y-2 text-sm text-white/65">
              <a href={`mailto:${email}`} className="block hover:text-white">{email}</a>
              {phone ? <a href={`tel:${phone}`} className="block hover:text-white">{phone}</a> : null}
              {settings.footer_address ? <p className="whitespace-pre-line">{settings.footer_address}</p> : null}
            </div>
            {boolSetting(settings.show_social_links, true) && socialLinks.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-white/10">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="eyebrow mb-4 text-white/60">{column.title}</p>
              <ul className="space-y-2.5">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-sm text-white/75 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>{copyright}</p>
          <div className="flex gap-6">
            {boolSetting(settings.show_privacy_link, true) ? <Link to="/privacy" className="hover:text-white">Privacy Policy</Link> : null}
            {boolSetting(settings.show_terms_link, true) ? <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

function boolSetting(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}
