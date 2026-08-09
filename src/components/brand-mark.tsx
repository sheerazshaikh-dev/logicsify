import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { DEFAULT_BRAND_ASSETS, optimizedBrandAsset, withDefaultBranding } from "@/lib/brand-assets";
import {
  getCachedPublicSiteSettings,
  getPublicSiteSettings,
  type PublicSiteSettings,
} from "@/lib/logicsify-api";

export function BrandMarkImage({ alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [settings, setSettings] = useState<PublicSiteSettings>(() =>
    withDefaultBranding(getCachedPublicSiteSettings()),
  );

  useEffect(() => {
    let active = true;
    getPublicSiteSettings()
      .then((loaded) => {
        if (active) setSettings(withDefaultBranding(loaded));
      })
      .catch(() => undefined);

    const onBrandingUpdated = (event: Event) => {
      const detail = (event as CustomEvent<PublicSiteSettings>).detail;
      if (detail) setSettings(withDefaultBranding(detail));
    };
    window.addEventListener("logicsify:branding-updated", onBrandingUpdated);
    return () => {
      active = false;
      window.removeEventListener("logicsify:branding-updated", onBrandingUpdated);
    };
  }, []);

  const src = optimizedBrandAsset(
    settings.brand_mark || settings.favicon,
    DEFAULT_BRAND_ASSETS.brandMark,
  );
  return <img {...props} src={src} alt={alt} />;
}
