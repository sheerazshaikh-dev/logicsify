import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import lightLogo from "@/assets/logicsify-light.png.asset.json";
import {
  getPublicMenu,
  getPublicSiteSettings,
  type PublicMenuItem,
  type PublicSiteSettings,
} from "@/lib/logicsify-api";

const fallbackCompanyLinks: [string, string][] = [
  ["About", "/about"],
  ["Process", "/process"],
  ["Work", "/work"],
  ["Careers", "/careers"],
  ["Insights", "/insights"],
  ["Contact", "/contact"],
];

export function SiteFooter() {
  const [companyItems, setCompanyItems] = useState<PublicMenuItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings>({});

  useEffect(() => {
    let active = true;
    getPublicMenu("footer")
      .then((menu) => {
        if (active) setCompanyItems(menu.items || []);
      })
      .catch(() => {
        // Static links remain available whenever the CMS is unreachable.
      });
    getPublicSiteSettings().then((settings) => {
      if (active) setSiteSettings(settings);
    });
    return () => {
      active = false;
    };
  }, []);

  const footerEmail =
    siteSettings.footer_email || siteSettings.contact_email || "hello@logicsify.com";
  const footerPhone = siteSettings.footer_phone || siteSettings.phone || "";
  const footerDescription =
    siteSettings.footer_description ||
    siteSettings.tagline ||
    "Logicsify designs, builds, markets, and automates digital systems for ambitious businesses.";
  const footerCtaLabel = siteSettings.footer_cta_label || "Book a strategy call";
  const footerCtaUrl = siteSettings.footer_cta_url || "/book-a-call";
  const footerCtaNewTab = boolSetting(siteSettings.footer_cta_new_tab);
  const showSocial = boolSetting(siteSettings.show_social_links, true);
  const copyright = (
    siteSettings.copyright_text || "© {year} Logicsify. All rights reserved."
  ).replace(/\{year\}/g, String(new Date().getFullYear()));
  const socialLinks = [
    { icon: Linkedin, href: siteSettings.linkedin_url, label: "LinkedIn" },
    { icon: Instagram, href: siteSettings.instagram_url, label: "Instagram" },
    { icon: Facebook, href: siteSettings.facebook_url, label: "Facebook" },
    { icon: Youtube, href: siteSettings.youtube_url, label: "YouTube" },
    { icon: ExternalLink, href: siteSettings.portfolio_url, label: "Portfolio" },
  ].filter((item) => Boolean(item.href));

  return (
    <footer data-cms-ignore="true" className="section-dark grid-noise pt-20 pb-10 mt-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-brand animate-gradient" />
      <div className="container-page relative">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-4">
            <img
              src={siteSettings.footer_logo || siteSettings.logo_light || lightLogo.url}
              alt={siteSettings.site_name || "Logicsify"}
              className="h-10 w-auto mb-6"
            />
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">{footerDescription}</p>
            {showSocial && (socialLinks.length || siteSettings.x_url) ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="h-10 w-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/10 transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
                {siteSettings.x_url ? (
                  <a
                    href={siteSettings.x_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X"
                    className="h-10 w-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-white/10 transition text-sm font-bold"
                  >
                    𝕏
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <FooterCol
            title="Services"
            links={[
              ["Web Development", "/services/web-design-development"],
              ["Web Applications", "/services/web-applications"],
              ["SaaS Development", "/services/saas-development"],
              ["Mobile Apps", "/services/mobile-apps"],
              ["AI Automations", "/services/ai-automations"],
              ["SEO", "/services/seo"],
              ["Paid Advertising", "/services/paid-advertising"],
            ]}
          />
          <DynamicFooterCol title="Company" items={companyItems} fallback={fallbackCompanyLinks} />
          <FooterCol
            title="Industries"
            links={[
              ["Startups & SaaS", "/industries/startups-saas"],
              ["Professional Services", "/industries/professional-services"],
              ["Home Services", "/industries/home-services"],
              ["Healthcare", "/industries/healthcare"],
              ["E-commerce", "/industries/ecommerce"],
              ["Real Estate", "/industries/real-estate"],
            ]}
          />
          <div className="col-span-2 md:col-span-2">
            <p className="eyebrow text-white/60 mb-4">Contact</p>
            <a
              href={`mailto:${footerEmail}`}
              className="block break-words text-white text-sm hover:text-gradient mb-3"
            >
              {footerEmail}
            </a>
            {footerPhone ? (
              <a
                href={`tel:${footerPhone}`}
                className="mb-3 block text-sm text-white/75 hover:text-white"
              >
                {footerPhone}
              </a>
            ) : null}
            {siteSettings.footer_address ? (
              <p className="mb-4 whitespace-pre-line text-sm leading-6 text-white/60">
                {siteSettings.footer_address}
              </p>
            ) : null}
            <a
              href={footerCtaUrl}
              target={footerCtaNewTab ? "_blank" : undefined}
              rel={footerCtaNewTab ? "noreferrer" : undefined}
              className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white group"
            >
              {footerCtaLabel}{" "}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </a>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/50">
          <p>{copyright}</p>
          {boolSetting(siteSettings.show_privacy_link, true) ||
          boolSetting(siteSettings.show_terms_link, true) ? (
            <div className="flex gap-6">
              {boolSetting(siteSettings.show_privacy_link, true) ? (
                <Link to="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              ) : null}
              {boolSetting(siteSettings.show_terms_link, true) ? (
                <Link to="/terms" className="hover:text-white">
                  Terms & Conditions
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="col-span-1 md:col-span-2">
      <p className="eyebrow text-white/60 mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link to={href} className="text-sm text-white/75 hover:text-white transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DynamicFooterCol({
  title,
  items,
  fallback,
}: {
  title: string;
  items: PublicMenuItem[];
  fallback: [string, string][];
}) {
  if (!items.length) return <FooterCol title={title} links={fallback} />;

  return (
    <div className="col-span-1 md:col-span-2">
      <p className="eyebrow text-white/60 mb-4">{title}</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            {item.coming_soon ? (
              <span className="text-sm text-white/45">
                {item.label} <small className="text-[9px] uppercase tracking-wider">Soon</small>
              </span>
            ) : item.is_external ? (
              <a
                href={item.url}
                target={item.target_blank ? "_blank" : undefined}
                rel={item.target_blank ? "noreferrer" : undefined}
                className="text-sm text-white/75 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                to={item.url}
                className="text-sm text-white/75 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function boolSetting(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}
