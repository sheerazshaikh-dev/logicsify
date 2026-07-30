import type { PublicSiteSettings, SiteLocation, SocialProfile } from "@/lib/logicsify-api";

export const DEFAULT_CONTACT_EMAILS = {
  general: "connect@logicsify.com",
  sales: "sales@logicsify.com",
  support: "support@logicsify.com",
};

export const DEFAULT_SITE_LOCATIONS: SiteLocation[] = [
  {
    id: "karachi-pakistan",
    name: "Karachi",
    city: "Karachi",
    country: "Pakistan",
    address:
      "Suite No. M3, Rahat Jo Dero Building, Tariq Road, Karachi\nSuite No. C3–C4, Alkram Square, Liaqatabad, Karachi, Pakistan",
    enabled: true,
    sort_order: 0,
  },
  {
    id: "jeddah-saudi-arabia",
    name: "Jeddah",
    city: "Jeddah",
    country: "Saudi Arabia",
    address: "Baladiya Street, Al Manara Tower, Jeddah, Saudi Arabia",
    phone: "+966 54 441 5405",
    contact_name: "Adil Mahmood",
    contact_role: "Business Development Manager",
    enabled: true,
    sort_order: 1,
  },
  {
    id: "portugal",
    name: "Portugal",
    city: "Leiria / Nazaré",
    country: "Portugal",
    address: "Rua Rui Rosa, No. 20, 1st Floor, 2450-210 Leiria, Nazaré, Portugal",
    phone: "+351 920 683 575",
    contact_name: "Ammar Abbas",
    enabled: true,
    sort_order: 2,
  },
];

export function getContactEmails(settings: PublicSiteSettings) {
  return {
    general: settings.contact_email || DEFAULT_CONTACT_EMAILS.general,
    sales: settings.sales_email || DEFAULT_CONTACT_EMAILS.sales,
    support: settings.support_email || DEFAULT_CONTACT_EMAILS.support,
  };
}

export function getSiteLocations(settings: PublicSiteSettings): SiteLocation[] {
  const configured = Array.isArray(settings.locations)
    ? settings.locations
        .filter((location): location is SiteLocation => Boolean(location && typeof location === "object"))
        .map((location, index) => ({
          ...location,
          id: String(location.id || `location-${index}`),
          name: String(location.name || location.city || location.country || `Location ${index + 1}`),
          enabled: location.enabled !== false,
          sort_order: Number(location.sort_order ?? index),
        }))
        .filter((location) => location.enabled !== false)
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    : [];

  if (Array.isArray(settings.locations)) return configured;

  const legacyAddress = [
    settings.address_line_1,
    settings.address_line_2,
    [settings.city, settings.state, settings.postal_code].filter(Boolean).join(", "),
    settings.country,
  ]
    .filter(Boolean)
    .join("\n");

  if (legacyAddress) {
    return [
      {
        id: "primary-location",
        name: settings.city || settings.country || "Primary office",
        city: settings.city,
        country: settings.country,
        address: legacyAddress,
        phone: settings.phone,
        email: settings.contact_email,
        enabled: true,
        sort_order: 0,
      },
    ];
  }

  return DEFAULT_SITE_LOCATIONS;
}

export function getSocialProfiles(settings: PublicSiteSettings): SocialProfile[] {
  const configured = Array.isArray(settings.social_links)
    ? settings.social_links
        .filter((profile): profile is SocialProfile => Boolean(profile && typeof profile === "object"))
        .map((profile, index) => ({
          ...profile,
          id: String(profile.id || `social-${index}`),
          platform: String(profile.platform || "website").toLowerCase(),
          label: String(profile.label || profile.platform || "External profile"),
          url: String(profile.url || ""),
          enabled: profile.enabled !== false,
          sort_order: Number(profile.sort_order ?? index),
        }))
        .filter((profile) => profile.enabled !== false && Boolean(profile.url))
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    : [];

  const legacy: SocialProfile[] = [
    legacyProfile("linkedin", "LinkedIn", settings.linkedin_url, 100),
    legacyProfile("instagram", "Instagram", settings.instagram_url, 101),
    legacyProfile("facebook", "Facebook", settings.facebook_url, 102),
    legacyProfile("x", "X / Twitter", settings.x_url, 103),
    legacyProfile("youtube", "YouTube", settings.youtube_url, 104),
    legacyProfile("portfolio", "Portfolio", settings.portfolio_url, 105),
  ].filter((profile) => Boolean(profile.url));

  const configuredUrls = new Set(configured.map((profile) => normalizeUrl(profile.url)));
  return [...configured, ...legacy.filter((profile) => !configuredUrls.has(normalizeUrl(profile.url)))];
}

export function locationMapUrl(location: SiteLocation) {
  if (location.map_url) return location.map_url;
  const query = [location.address, location.city, location.country].filter(Boolean).join(", ");
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.replace(/\n/g, ", "))}`
    : "";
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

function legacyProfile(
  platform: string,
  label: string,
  url: string | undefined,
  sortOrder: number,
): SocialProfile {
  return {
    id: `legacy-${platform}`,
    platform,
    label,
    url: url || "",
    enabled: true,
    sort_order: sortOrder,
  };
}

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "").toLowerCase();
}
