import { useEffect, useState } from "react";
import {
  phoneRegionForCountry,
  regionalPhoneFromLocations,
  type PhoneRegion,
} from "@/lib/contact-directory";
import type { PublicSiteSettings } from "@/lib/logicsify-api";

const REGION_CACHE_KEY = "logicsify:phone-region:v1";
const REGION_CACHE_TTL = 24 * 60 * 60 * 1000;
let regionPromise: Promise<PhoneRegion> | null = null;

type CachedRegion = {
  region: PhoneRegion;
  expiresAt: number;
};

export function useRegionalPhone(settings: PublicSiteSettings) {
  const [region, setRegion] = useState<PhoneRegion>(() => initialRegion());

  useEffect(() => {
    let active = true;
    void resolveVisitorRegion().then((resolved) => {
      if (active) setRegion(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    phone: regionalPhoneFromLocations(settings, region),
    region,
  };
}

function initialRegion(): PhoneRegion {
  const cached = readCachedRegion();
  if (cached) return cached;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (timezone === "Asia/Karachi") return "pakistan";
  if (
    timezone === "Asia/Riyadh" ||
    timezone === "Asia/Dubai" ||
    timezone === "Asia/Bahrain" ||
    timezone === "Asia/Kuwait" ||
    timezone === "Asia/Muscat" ||
    timezone === "Asia/Qatar"
  ) {
    return "saudi";
  }
  if (timezone === "Europe/Lisbon" || timezone === "Atlantic/Azores") return "portugal";

  const localeRegion = navigator.language.match(/-([A-Za-z]{2})(?:-|$)/)?.[1];
  return phoneRegionForCountry(localeRegion);
}

async function resolveVisitorRegion(): Promise<PhoneRegion> {
  const cached = readCachedRegion();
  if (cached) return cached;
  if (regionPromise) return regionPromise;

  regionPromise = fetch("/api/visitor-region", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Region lookup unavailable");
      const payload = (await response.json()) as { country?: string; region?: PhoneRegion };
      const region = isPhoneRegion(payload.region)
        ? payload.region
        : phoneRegionForCountry(payload.country);
      writeCachedRegion(region);
      return region;
    })
    .catch(() => initialRegion())
    .finally(() => {
      regionPromise = null;
    });

  return regionPromise;
}

function isPhoneRegion(value: unknown): value is PhoneRegion {
  return value === "pakistan" || value === "saudi" || value === "portugal";
}

function readCachedRegion(): PhoneRegion | null {
  try {
    const cached = JSON.parse(
      localStorage.getItem(REGION_CACHE_KEY) || "null",
    ) as CachedRegion | null;
    if (!cached || cached.expiresAt <= Date.now() || !isPhoneRegion(cached.region)) return null;
    return cached.region;
  } catch {
    return null;
  }
}

function writeCachedRegion(region: PhoneRegion) {
  try {
    localStorage.setItem(
      REGION_CACHE_KEY,
      JSON.stringify({ region, expiresAt: Date.now() + REGION_CACHE_TTL } satisfies CachedRegion),
    );
  } catch {
    // Private browsing can disable storage; the current response still works.
  }
}
