import QRCode from "qrcode";
import type { ConnectProfile } from "@/lib/admin-api";
import { resolveConnectProfilePlatform } from "@/lib/connect-profile-links";
import { runtimeThemeColor } from "@/lib/theme-runtime";

function vcardEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function splitName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { given: parts[0] || displayName.trim(), family: "" };
  return { given: parts.slice(0, -1).join(" "), family: parts.at(-1) || "" };
}

function matchingLink(profile: ConnectProfile, platform: "linkedin" | "website" | "whatsapp") {
  return (profile.links_json || []).find((link) => resolveConnectProfilePlatform(link) === platform)?.url || "";
}

function whatsappNumber(profile: ConnectProfile) {
  if (profile.whatsapp?.trim()) return profile.whatsapp.trim();
  const link = matchingLink(profile, "whatsapp");
  if (!link) return "";
  try {
    const parsed = new URL(normalizeUrl(link));
    if (parsed.hostname.includes("wa.me")) return parsed.pathname.replace(/\D/g, "");
  } catch {
    // Keep the QR generator resilient if a custom WhatsApp URL is malformed.
  }
  return "";
}

export function buildOfflineContactVCard(profile: ConnectProfile) {
  const name = profile.display_name.trim();
  const { given, family } = splitName(name);
  const company = profile.company?.trim() || "Logicsify";
  const website = normalizeUrl(profile.website || matchingLink(profile, "website") || "https://logicsify.com");
  const linkedin = normalizeUrl(matchingLink(profile, "linkedin"));
  const whatsapp = whatsappNumber(profile);
  const address = String(profile.address || "").trim().replace(/\r?\n/g, ", ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${vcardEscape(family)};${vcardEscape(given)};;;`,
    `FN:${vcardEscape(name)}`,
  ];

  if (company) lines.push(`ORG:${vcardEscape(company)}`);
  if (profile.headline?.trim()) lines.push(`TITLE:${vcardEscape(profile.headline.trim())}`);
  if (profile.phone?.trim()) lines.push(`TEL;TYPE=CELL,VOICE:${vcardEscape(profile.phone.trim())}`);
  if (profile.email?.trim()) lines.push(`EMAIL;TYPE=INTERNET,WORK:${vcardEscape(profile.email.trim())}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${vcardEscape(address)};;;;`);
  if (website) lines.push(`URL;TYPE=WORK:${website}`);
  if (whatsapp) {
    lines.push(`item1.TEL:${vcardEscape(whatsapp)}`);
    lines.push("item1.X-ABLabel:WhatsApp");
  }
  if (linkedin) {
    lines.push(`item2.URL:${linkedin}`);
    lines.push("item2.X-ABLabel:LinkedIn");
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function triggerDownload(href: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadOfflineContactQrPng(profile: ConnectProfile) {
  const value = buildOfflineContactVCard(profile);
  const source = await QRCode.toDataURL(value, {
    width: 1400,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: runtimeThemeColor("--theme-dark", "#000000"), light: "#FFFFFF" },
  });
  triggerDownload(source, `${profile.slug}-offline-contact-qr.png`);
}

export async function downloadOfflineContactQrSvg(profile: ConnectProfile) {
  const value = buildOfflineContactVCard(profile);
  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: runtimeThemeColor("--theme-dark", "#000000"), light: "#FFFFFF" },
  });
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${profile.slug}-offline-contact-qr.svg`);
  URL.revokeObjectURL(url);
}
