import QRCode from "qrcode";
import type { ConnectProfile } from "@/lib/admin-api";
import { API_BASE } from "@/lib/logicsify-api";
import {
  CONNECT_PROFILE_PLATFORM_LABELS,
  connectProfileLinkText,
  connectProfilePlatformMark,
  resolveConnectProfilePlatform,
} from "@/lib/connect-profile-links";
import { fieldVisible } from "@/lib/team-connect";
import { runtimeThemeColor } from "@/lib/theme-runtime";
import { buildOfflineContactVCard } from "@/lib/offline-contact-qr";

export type ConnectProfileExportFormat = "jpg" | "pdf";

const CARD_WIDTH = 1240;
const CARD_HEIGHT = 1754;
let INK = "#000000";
let RED = "#04A6A1";
let GOLD = "#8BCF3C";
let BACKGROUND = "#FFFFFF";
let SURFACE = "#FAF8FC";
let MUTED = "#756C7E";
let BORDER = "#E6E1EA";

function syncBrandPalette() {
  INK = runtimeThemeColor("--theme-dark", "#000000");
  RED = runtimeThemeColor("--theme-primary-start", "#04A6A1");
  GOLD = runtimeThemeColor("--theme-primary-end", "#8BCF3C");
  BACKGROUND = runtimeThemeColor("--theme-background", "#FFFFFF");
  SURFACE = runtimeThemeColor("--theme-surface", "#FAF8FC");
  MUTED = runtimeThemeColor("--theme-muted-text", "#756C7E");
  BORDER = runtimeThemeColor("--theme-border", "#E6E1EA");
}

function hexWithAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "").trim();
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(value)) return `rgba(0, 0, 0, ${alpha})`;
  const number = Number.parseInt(value, 16);
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

type LoadedImage = {
  image: HTMLImageElement;
  release: () => void;
};

async function loadImage(source?: string | null): Promise<LoadedImage | null> {
  if (!source) return null;
  let objectUrl: string | undefined;
  try {
    const response = await fetch(source, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error("Image request failed.");
    objectUrl = URL.createObjectURL(await response.blob());
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const loadedUrl = objectUrl;
    objectUrl = undefined;
    return {
      image,
      release: () => URL.revokeObjectURL(loadedUrl),
    };
  } catch {
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function exportMediaUrl(source?: string | null) {
  if (!source) return null;
  if (source.startsWith("data:") || source.startsWith("blob:")) return source;
  return `${API_BASE}/public/connect-image?src=${encodeURIComponent(source)}`;
}

function fitText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  startingSize: number,
  minimumSize: number,
  weight = 700,
) {
  let size = startingSize;
  do {
    context.font = `${weight} ${size}px Sora, Inter, Arial, sans-serif`;
    if (context.measureText(value).width <= maxWidth) return size;
    size -= 2;
  } while (size > minimumSize);
  return minimumSize;
}

function drawContactIcon(
  context: CanvasRenderingContext2D,
  kind: "phone" | "email" | "address",
  x: number,
  y: number,
) {
  const paths = {
    phone: [
      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z",
    ],
    email: [
      "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
      "m22 6-10 7L2 6",
    ],
    address: ["M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z", "M12 10h.01"],
  } as const;

  context.save();
  context.translate(x - 20, y - 20);
  context.scale(40 / 24, 40 / 24);
  context.strokeStyle = RED;
  context.lineWidth = 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  paths[kind].forEach((path) => context.stroke(new Path2D(path)));
  context.restore();
}

function drawContactRow(
  context: CanvasRenderingContext2D,
  kind: "phone" | "email" | "address",
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  const textX = x + 84;
  const textWidth = width - 112;
  let addressLines: string[] = [];
  if (kind === "address") {
    context.font = "600 22px Inter, Arial, sans-serif";
    const paragraphs = value
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    for (const paragraph of paragraphs) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && context.measureText(candidate).width > textWidth) {
          addressLines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) addressLines.push(line);
    }
    if (addressLines.length > 4) {
      addressLines = addressLines.slice(0, 4);
      let last = addressLines[3];
      while (last && context.measureText(`${last}…`).width > textWidth) {
        last = last.slice(0, -1).trimEnd();
      }
      addressLines[3] = `${last}…`;
    }
  }
  const height = kind === "address" ? Math.max(112, 62 + addressLines.length * 28) : 94;
  roundedRect(context, x, y, width, height, 24);
  context.fillStyle = SURFACE;
  context.fill();
  drawContactIcon(context, kind, x + 46, y + 47);
  context.fillStyle = MUTED;
  context.font = "700 17px Inter, Arial, sans-serif";
  context.fillText(label.toUpperCase(), textX, y + 32);
  context.fillStyle = INK;
  if (kind === "address") {
    context.font = "600 22px Inter, Arial, sans-serif";
    addressLines.forEach((line, index) => context.fillText(line, textX, y + 69 + index * 28));
  } else {
    const fontSize = fitText(context, value, textWidth, 27, 18, 600);
    context.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
    context.fillText(value, textX, y + 68, textWidth);
  }
  return height;
}

function drawSocialLink(
  context: CanvasRenderingContext2D,
  link: ConnectProfile["links_json"][number],
  x: number,
  y: number,
  width: number,
) {
  const platform = resolveConnectProfilePlatform(link);
  const platformColor: Record<string, string> = {
    whatsapp: "#25D366",
    linkedin: "#0A66C2",
    instagram: "#C13584",
    facebook: "#1877F2",
    youtube: "#FF0000",
    x: "#111111",
    github: "#24292F",
    tiktok: "#111111",
    website: INK,
    link: INK,
  };
  context.fillStyle = platformColor[platform] || INK;
  context.beginPath();
  context.arc(x + 28, y + 28, 28, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#FFFFFF";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const mark = connectProfilePlatformMark(platform);
  if (platform === "instagram") {
    context.strokeStyle = "#FFFFFF";
    context.lineWidth = 3;
    roundedRect(context, x + 16, y + 16, 24, 24, 7);
    context.stroke();
    context.beginPath();
    context.arc(x + 28, y + 28, 6, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(x + 35, y + 21, 1.8, 0, Math.PI * 2);
    context.fill();
  } else if (platform === "youtube") {
    context.beginPath();
    context.moveTo(x + 24, y + 20);
    context.lineTo(x + 24, y + 36);
    context.lineTo(x + 37, y + 28);
    context.closePath();
    context.fill();
  } else if (platform === "whatsapp") {
    context.strokeStyle = "#FFFFFF";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x + 28, y + 27, 11, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(x + 20, y + 35);
    context.lineTo(x + 18, y + 41);
    context.lineTo(x + 25, y + 38);
    context.stroke();
    context.beginPath();
    context.arc(x + 28, y + 27, 6, 0.7, 2.45);
    context.stroke();
  } else {
    context.font = `800 ${mark.length > 1 ? 17 : 24}px Inter, Arial, sans-serif`;
    context.fillText(mark, x + 28, y + 29);
  }
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = INK;
  context.font = "700 20px Inter, Arial, sans-serif";
  context.fillText(
    link.label || CONNECT_PROFILE_PLATFORM_LABELS[platform],
    x + 72,
    y + 23,
    width - 72,
  );
  context.fillStyle = MUTED;
  context.font = "500 16px Inter, Arial, sans-serif";
  context.fillText(connectProfileLinkText(link), x + 72, y + 48, width - 72);
}

async function renderCard(profile: ConnectProfile, profileUrl: string) {
  if ("fonts" in document) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create the downloadable card.");

  const coverSource = profile.global_cover_url || profile.cover_url;
  const showAvatar = fieldVisible(profile, "avatar", "export");
  const avatarSource = showAvatar ? profile.avatar_url : null;
  const [coverResource, avatarResource, qrResource] = await Promise.all([
    loadImage(exportMediaUrl(coverSource)),
    loadImage(exportMediaUrl(avatarSource)),
    QRCode.toDataURL(buildOfflineContactVCard(profile, profileUrl), {
      width: 1400,
      margin: 4,
      errorCorrectionLevel: "L",
      color: { dark: INK, light: "#FFFFFF" },
    }).then(loadImage),
  ]);

  const loadedResources = [coverResource, avatarResource, qrResource].filter(
    (resource): resource is LoadedImage => Boolean(resource),
  );
  const cover = coverResource?.image || null;
  const avatar = avatarResource?.image || null;
  const qr = qrResource?.image || null;
  if (coverSource && !cover) {
    loadedResources.forEach((resource) => resource.release());
    throw new Error(
      "The global cover could not be loaded from Media Library. Deploy the backend image-export hotfix first, then try again.",
    );
  }
  if (avatarSource && !avatar) {
    loadedResources.forEach((resource) => resource.release());
    throw new Error(
      "The avatar could not be loaded from Media Library. Re-select it in the profile editor and try again.",
    );
  }

  context.fillStyle = SURFACE;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.save();
  context.shadowColor = hexWithAlpha(INK, 0.18);
  context.shadowBlur = 45;
  context.shadowOffsetY = 22;
  roundedRect(context, 45, 38, 1150, 1668, 52);
  context.fillStyle = BACKGROUND;
  context.fill();
  context.restore();

  context.save();
  roundedRect(context, 45, 38, 1150, 446, 52);
  context.clip();
  const gradient = context.createLinearGradient(45, 38, 1195, 484);
  gradient.addColorStop(0, INK);
  gradient.addColorStop(0.52, RED);
  gradient.addColorStop(1, GOLD);
  context.fillStyle = gradient;
  context.fillRect(45, 38, 1150, 446);
  if (cover) {
    drawImageCover(context, cover, 45, 38, 1150, 446);
  }
  context.restore();

  if (showAvatar) {
    context.save();
    context.beginPath();
    context.arc(226, 474, 134, 0, Math.PI * 2);
    context.fillStyle = BACKGROUND;
    context.fill();
    context.beginPath();
    context.arc(226, 474, 122, 0, Math.PI * 2);
    context.clip();
    if (avatar) {
      drawImageCover(context, avatar, 104, 352, 244, 244);
    } else {
      const avatarGradient = context.createLinearGradient(104, 352, 348, 596);
      avatarGradient.addColorStop(0, RED);
      avatarGradient.addColorStop(1, GOLD);
      context.fillStyle = avatarGradient;
      context.fillRect(104, 352, 244, 244);
      context.fillStyle = "#FFFFFF";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "800 94px Sora, Arial, sans-serif";
      context.fillText(profile.display_name.slice(0, 1).toUpperCase(), 226, 480);
    }
    context.restore();
  }

  const identityX = showAvatar ? 390 : 88;
  const identityWidth = showAvatar ? 700 : 1064;
  context.fillStyle = INK;
  const nameSize = fitText(context, profile.display_name, identityWidth, 58, 38, 800);
  context.font = `800 ${nameSize}px Sora, Inter, Arial, sans-serif`;
  context.fillText(profile.display_name, identityX, 548, identityWidth);
  if (profile.headline && fieldVisible(profile, "headline", "export")) {
    context.fillStyle = MUTED;
    const headlineSize = fitText(context, profile.headline, identityWidth, 29, 20, 500);
    context.font = `500 ${headlineSize}px Inter, Arial, sans-serif`;
    context.fillText(profile.headline, identityX, 596, identityWidth);
  }
  const accentGradient = context.createLinearGradient(identityX, 629, identityX + 260, 629);
  accentGradient.addColorStop(0, RED);
  accentGradient.addColorStop(1, GOLD);
  context.fillStyle = accentGradient;
  roundedRect(context, identityX, 628, 235, 10, 5);
  context.fill();

  context.fillStyle = INK;
  context.font = "800 24px Sora, Inter, Arial, sans-serif";
  context.fillText("CONTACT", 88, 705);
  context.fillStyle = MUTED;
  context.font = "600 17px Inter, Arial, sans-serif";
  context.fillText("Direct ways to reach me", 88, 739);

  let contactY = 772;
  const phone = fieldVisible(profile, "phone", "export")
    ? profile.phone
    : fieldVisible(profile, "whatsapp", "export")
      ? profile.whatsapp
      : null;
  if (phone) {
    contactY += drawContactRow(context, "phone", "Direct phone", phone, 88, contactY, 1064) + 16;
  }
  if (profile.email && fieldVisible(profile, "email", "export")) {
    contactY += drawContactRow(context, "email", "Email", profile.email, 88, contactY, 1064) + 16;
  }
  if (profile.address && fieldVisible(profile, "address", "export")) {
    contactY +=
      drawContactRow(
        context,
        "address",
        "Assigned office address",
        profile.address,
        88,
        contactY,
        1064,
      ) + 18;
  }

  const savedSocialLinks = fieldVisible(profile, "social_links", "export")
    ? profile.links_json.filter((link) => link.label && link.url)
    : [];
  const hasWhatsappLink = savedSocialLinks.some(
    (link) => resolveConnectProfilePlatform(link) === "whatsapp",
  );
  const socialLinks =
    profile.whatsapp && fieldVisible(profile, "whatsapp", "export") && !hasWhatsappLink
      ? [
          {
            label: "WhatsApp",
            url: `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`,
            icon: "whatsapp",
          },
          ...savedSocialLinks,
        ]
      : savedSocialLinks;
  context.fillStyle = INK;
  context.font = "800 24px Sora, Inter, Arial, sans-serif";
  context.fillText("SOCIAL LINKS", 88, contactY + 35);
  context.fillStyle = MUTED;
  context.font = "600 17px Inter, Arial, sans-serif";
  context.fillText("Find me online", 88, contactY + 68);

  const socialStart = contactY + 112;
  const socialPanelY = socialStart - 28;
  roundedRect(context, 88, socialPanelY, 1064, 458, 30);
  context.fillStyle = SURFACE;
  context.fill();
  context.strokeStyle = BORDER;
  context.lineWidth = 2;
  context.stroke();

  const visibleLinks = socialLinks.slice(0, 6);
  visibleLinks.forEach((link, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    drawSocialLink(context, link, 120 + column * 308, socialStart + row * 82, 270);
  });
  if (socialLinks.length > visibleLinks.length) {
    context.fillStyle = MUTED;
    context.font = "600 15px Inter, Arial, sans-serif";
    context.fillText(
      `+${socialLinks.length - visibleLinks.length} more link${socialLinks.length - visibleLinks.length === 1 ? "" : "s"} on the QR profile`,
      88,
      socialStart + 278,
    );
  }
  if (!visibleLinks.length) {
    context.fillStyle = MUTED;
    context.font = "500 20px Inter, Arial, sans-serif";
    context.fillText("Scan the QR code to open this connect profile.", 120, socialStart + 34);
  }

  if (qr) {
    roundedRect(context, 700, socialPanelY + 12, 424, 434, 26);
    context.fillStyle = BACKGROUND;
    context.fill();
    context.drawImage(qr, 724, socialPanelY + 26, 376, 376);
    context.fillStyle = INK;
    context.textAlign = "center";
    context.font = "800 14px Sora, Inter, Arial, sans-serif";
    context.fillText("OFFLINE CONTACT QR", 912, socialPanelY + 418);
    context.fillStyle = MUTED;
    context.font = "500 12px Inter, Arial, sans-serif";
    context.fillText("Save contact + Connect link", 912, socialPanelY + 440);
    context.textAlign = "left";
  }

  context.fillStyle = BORDER;
  context.fillRect(88, 1650, 1064, 2);
  context.fillStyle = INK;
  context.font = "700 18px Inter, Arial, sans-serif";
  context.fillText("LOGICSIFY", 88, 1685);
  context.fillStyle = MUTED;
  context.textAlign = "right";
  context.font = "500 18px Inter, Arial, sans-serif";
  context.fillText("logicsify.com", 1152, 1685);
  context.textAlign = "left";

  loadedResources.forEach((resource) => resource.release());
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The card could not be rendered."))),
      type,
      quality,
    );
  });
}

function concatBytes(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function jpegToPdf(jpeg: Uint8Array) {
  const encode = (value: string) => new TextEncoder().encode(value);
  const header = concatBytes([
    encode("%PDF-1.4\n%"),
    new Uint8Array([255, 255, 255, 255]),
    encode("\n"),
  ]);
  const content = encode("q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n");
  const objects = [
    encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"),
    encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"),
    encode(
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    ),
    concatBytes([
      encode(
        `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${CARD_WIDTH} /Height ${CARD_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      ),
      jpeg,
      encode("\nendstream\nendobj\n"),
    ]),
    concatBytes([
      encode(`5 0 obj\n<< /Length ${content.length} >>\nstream\n`),
      content,
      encode("endstream\nendobj\n"),
    ]),
  ];
  const offsets: number[] = [];
  let runningOffset = header.length;
  objects.forEach((object) => {
    offsets.push(runningOffset);
    runningOffset += object.length;
  });
  const xrefOffset = runningOffset;
  const xref = encode(
    `xref\n0 6\n0000000000 65535 f \n${offsets
      .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
      .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );
  return new Blob([concatBytes([header, ...objects, xref])], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, filename: string) {
  const source = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = source;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(source), 1000);
}

export async function downloadConnectProfileCard(
  profile: ConnectProfile,
  format: ConnectProfileExportFormat,
  profileUrl: string,
) {
  syncBrandPalette();
  const canvas = await renderCard(profile, profileUrl);
  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", 0.94);
  const safeName = profile.slug || "logicsify-connect-profile";
  if (format === "jpg") {
    downloadBlob(jpegBlob, `${safeName}-portrait.jpg`);
    return;
  }
  const jpeg = new Uint8Array(await jpegBlob.arrayBuffer());
  downloadBlob(jpegToPdf(jpeg), `${safeName}-portrait.pdf`);
}
