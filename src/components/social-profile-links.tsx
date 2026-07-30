import {
  Dribbble,
  Facebook,
  Github,
  Globe2,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Play,
  Twitter,
  Youtube,
} from "lucide-react";
import type { SocialProfile } from "@/lib/logicsify-api";

const iconMap: Record<string, typeof Globe2> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  github: Github,
  behance: Globe2,
  dribbble: Dribbble,
  whatsapp: MessageCircle,
  clutch: Globe2,
  portfolio: Play,
  website: Globe2,
  other: Globe2,
};

export function SocialProfileLinks({
  profiles,
  tone = "dark",
  showLabels = false,
  className = "",
}: {
  profiles: SocialProfile[];
  tone?: "dark" | "light";
  showLabels?: boolean;
  className?: string;
}) {
  if (!profiles.length) return null;

  const base =
    tone === "dark"
      ? "border-white/15 text-white/75 hover:border-white/30 hover:bg-white/10 hover:text-white"
      : "border-black/10 text-ink-soft hover:border-black/20 hover:bg-cream hover:text-ink";

  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`} aria-label="Social profiles">
      {profiles.map((profile) => {
        const Icon = iconMap[profile.platform.toLowerCase()] || Globe2;
        return (
          <a
            key={profile.id}
            href={profile.url}
            target="_blank"
            rel="noreferrer"
            aria-label={profile.label}
            title={profile.label}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-3 transition ${base} ${showLabels ? "min-w-10" : "w-10 px-0"}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {showLabels ? <span className="text-xs font-semibold">{profile.label}</span> : null}
          </a>
        );
      })}
    </div>
  );
}
