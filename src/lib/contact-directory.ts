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
    phone: "+92 333 3718191",
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

export function getSiteLocations(
  settings: PublicSiteSettings,
  placement?: "contact" | "footer" | "connect",
): SiteLocation[] {
  const configured = Array.isArray(settings.locations)
    ? settings.locations
        .filter((location): location is SiteLocation =>
          Boolean(location && typeof location === "object"),
        )
        .map((location, index) => ({
          ...location,
          id: String(location.id || `location-${index}`),
          name: String(
            location.name || location.city || location.country || `Location ${index + 1}`,
          ),
          addresses: normalizeLocationValues(location.addresses, location.address),
          phones: normalizeLocationValues(location.phones, location.phone),
          address: normalizeLocationValues(location.addresses, location.address).join("\n"),
          phone: normalizeLocationValues(location.phones, location.phone)[0] || "",
          enabled: location.enabled !== false,
          sort_order: Number(location.sort_order ?? index),
        }))
        .filter((location) => {
          if (location.enabled === false) return false;
          if (placement === "contact") return location.show_on_contact !== false;
          if (placement === "footer") return location.show_in_footer !== false;
          if (placement === "connect") return location.show_on_connect !== false;
          return true;
        })
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
        .filter((profile): profile is SocialProfile =>
          Boolean(profile && typeof profile === "object"),
        )
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
  return [
    ...configured,
    ...legacy.filter((profile) => !configuredUrls.has(normalizeUrl(profile.url))),
  ];
}

export function locationMapUrl(location: SiteLocation) {
  if (location.map_url) return location.map_url;
  const query = [getLocationAddresses(location)[0], location.city, location.country]
    .filter(Boolean)
    .join(", ");
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.replace(/\n/g, ", "))}`
    : "";
}

export function getLocationAddresses(location: SiteLocation) {
  return normalizeLocationValues(location.addresses, location.address);
}

export function getLocationPhones(location: SiteLocation) {
  return normalizeLocationValues(location.phones, location.phone);
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export type PhoneRegion = "pakistan" | "saudi" | "portugal";

const COUNTRY_REGION: Record<string, PhoneRegion> = {
  PK: "pakistan",
  SA: "saudi",
  AE: "saudi",
  BH: "saudi",
  KW: "saudi",
  OM: "saudi",
  QA: "saudi",
};

export function phoneRegionForCountry(countryCode?: string | null): PhoneRegion {
  const normalized = String(countryCode || "")
    .trim()
    .toUpperCase();
  return COUNTRY_REGION[normalized] || "portugal";
}

export function regionalPhoneFromLocations(
  settings: PublicSiteSettings,
  region: PhoneRegion,
): string {
  const locations = getSiteLocations(settings);
  const target =
    region === "pakistan" ? "pakistan" : region === "saudi" ? "saudi arabia" : "portugal";
  const matchingLocation = locations.find((location) => {
    const searchable = `${location.country || ""} ${location.city || ""} ${location.name || ""}`
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
    return searchable.includes(target);
  });

  return (
    (matchingLocation ? getLocationPhones(matchingLocation)[0] : "") ||
    settings.phone ||
    locations.flatMap(getLocationPhones).find(Boolean) ||
    ""
  );
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

function normalizeLocationValues(values?: string[], legacyValue?: string) {
  const source =
    Array.isArray(values) && values.length ? values : String(legacyValue || "").split(/\r?\n/);
  return Array.from(new Set(source.map((value) => String(value).trim()).filter(Boolean)));
}
