export type ConnectProfileLinkLike = {
  label: string;
  url: string;
  icon?: string;
};

export type ConnectProfilePlatform =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "youtube"
  | "x"
  | "github"
  | "tiktok"
  | "whatsapp"
  | "website"
  | "link";

export const CONNECT_PROFILE_PLATFORM_OPTIONS: Array<{
  value: ConnectProfilePlatform | "auto";
  label: string;
}> = [
  { value: "auto", label: "Auto-detect icon" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X / Twitter" },
  { value: "github", label: "GitHub" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Website" },
  { value: "link", label: "Other link" },
];

export const CONNECT_PROFILE_PLATFORM_LABELS: Record<ConnectProfilePlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X",
  github: "GitHub",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  link: "Link",
};

const KNOWN_PLATFORMS: ConnectProfilePlatform[] = [
  "linkedin",
  "instagram",
  "facebook",
  "youtube",
  "x",
  "github",
  "tiktok",
  "whatsapp",
  "website",
  "link",
];

export function resolveConnectProfilePlatform(
  link: ConnectProfileLinkLike,
): ConnectProfilePlatform {
  const selected = link.icon?.toLowerCase() as ConnectProfilePlatform | undefined;
  if (selected && KNOWN_PLATFORMS.includes(selected)) return selected;

  const value = `${link.label} ${link.url}`.toLowerCase();
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("facebook") || value.includes("fb.com")) return "facebook";
  if (value.includes("youtube") || value.includes("youtu.be")) return "youtube";
  if (value.includes("twitter") || value.includes("x.com")) return "x";
  if (value.includes("github")) return "github";
  if (value.includes("tiktok")) return "tiktok";
  if (value.includes("whatsapp") || value.includes("wa.me")) return "whatsapp";
  if (value.includes("website") || value.includes("portfolio")) return "website";
  return "link";
}

export function connectProfileLinkText(link: ConnectProfileLinkLike) {
  try {
    const parsed = new URL(link.url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = decodeURIComponent(parsed.pathname).replace(/^\/+|\/+$/g, "");
    const compact = path ? `${host}/${path}` : host;
    return compact.length > 42 ? `${compact.slice(0, 39)}…` : compact;
  } catch {
    return link.url;
  }
}

export function connectProfilePlatformMark(platform: ConnectProfilePlatform) {
  return {
    linkedin: "in",
    instagram: "IG",
    facebook: "f",
    youtube: ">",
    x: "X",
    github: "GH",
    tiktok: "TT",
    whatsapp: "WA",
    website: "W",
    link: ">",
  }[platform];
}
