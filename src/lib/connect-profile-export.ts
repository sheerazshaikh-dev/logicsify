import QRCode from "qrcode";
import type { ConnectProfile } from "@/lib/admin-api";
import {
  CONNECT_PROFILE_PLATFORM_LABELS,
  connectProfileLinkText,
  connectProfilePlatformMark,
  resolveConnectProfilePlatform,
} from "@/lib/connect-profile-links";

export type ConnectProfileExportFormat = "jpg" | "pdf";

const CARD_WIDTH = 1240;
const CARD_HEIGHT = 1754;
const INK = "#190A2F";
const RED = "#FE3434";
const GOLD = "#FDBE02";

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

function drawImageContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    x + (width - renderedWidth) / 2,
    y + (height - renderedHeight) / 2,
    renderedWidth,
    renderedHeight,
  );
}

async function loadImage(source?: string | null) {
  if (!source) return null;
  let objectUrl: string | undefined;
  try {
    const response = await fetch(source, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error("Image request failed.");
    objectUrl = URL.createObjectURL(await response.blob());
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    return image;
  } catch {
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
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
  context.save();
  context.strokeStyle = RED;
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
  if (kind === "email") {
    roundedRect(context, x - 16, y - 12, 32, 24, 4);
    context.stroke();
    context.beginPath();
    context.moveTo(x - 14, y - 9);
    context.lineTo(x, y + 2);
    context.lineTo(x + 14, y - 9);
    context.stroke();
  } else if (kind === "phone") {
    context.beginPath();
    context.arc(x, y, 15, 0.72, 2.42);
    context.stroke();
    context.beginPath();
    context.moveTo(x + 12, y + 10);
    context.lineTo(x + 18, y + 16);
    context.moveTo(x - 12, y - 10);
    context.lineTo(x - 18, y - 16);
    context.stroke();
  } else {
    context.beginPath();
    context.arc(x, y - 5, 13, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(x - 9, y + 4);
    context.lineTo(x, y + 20);
    context.lineTo(x + 9, y + 4);
    context.stroke();
    context.beginPath();
    context.arc(x, y - 5, 3, 0, Math.PI * 2);
    context.fillStyle = RED;
    context.fill();
  }
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
  roundedRect(context, x, y, width, kind === "address" ? 112 : 94, 24);
  context.fillStyle = "#F8F6FA";
  context.fill();
  drawContactIcon(context, kind, x + 46, y + 47);
  context.fillStyle = "#81798A";
  context.font = "700 17px Inter, Arial, sans-serif";
  context.fillText(label.toUpperCase(), x + 84, y + 32);
  context.fillStyle = INK;
  const fontSize = fitText(context, value, width - 112, kind === "address" ? 24 : 27, 18, 600);
  context.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
  context.fillText(value, x + 84, y + 68, width - 112);
}

function drawSocialLink(
  context: CanvasRenderingContext2D,
  link: ConnectProfile["links_json"][number],
  x: number,
  y: number,
  width: number,
) {
  const platform = resolveConnectProfilePlatform(link);
  context.fillStyle = "#F3EFF7";
  context.beginPath();
  context.arc(x + 28, y + 28, 28, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = INK;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const mark = connectProfilePlatformMark(platform);
  context.font = `800 ${mark.length > 1 ? 17 : 24}px Inter, Arial, sans-serif`;
  context.fillText(mark, x + 28, y + 29);
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
  context.fillStyle = "#81798A";
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

  const [cover, avatar, logo, qr] = await Promise.all([
    loadImage(profile.cover_url),
    loadImage(profile.avatar_url),
    loadImage("/logicsify-logo-dark.png"),
    QRCode.toDataURL(profileUrl, {
      width: 420,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: INK, light: "#FFFFFF" },
    }).then(loadImage),
  ]);

  context.fillStyle = "#F4F0F7";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.save();
  context.shadowColor = "rgba(25, 10, 47, 0.18)";
  context.shadowBlur = 45;
  context.shadowOffsetY = 22;
  roundedRect(context, 45, 38, 1150, 1668, 52);
  context.fillStyle = "#FFFFFF";
  context.fill();
  context.restore();

  context.save();
  roundedRect(context, 45, 38, 1150, 446, 52);
  context.clip();
  const gradient = context.createLinearGradient(45, 38, 1195, 484);
  gradient.addColorStop(0, INK);
  gradient.addColorStop(0.52, "#5B1639");
  gradient.addColorStop(1, GOLD);
  context.fillStyle = gradient;
  context.fillRect(45, 38, 1150, 446);
  if (cover) {
    drawImageCover(context, cover, 45, 38, 1150, 446);
    context.fillStyle = "rgba(25, 10, 47, 0.30)";
    context.fillRect(45, 38, 1150, 446);
  }
  context.restore();

  roundedRect(context, 82, 76, 386, 92, 27);
  context.fillStyle = "rgba(255,255,255,0.94)";
  context.fill();
  if (logo) drawImageContain(context, logo, 112, 96, 326, 52);

  context.save();
  context.beginPath();
  context.arc(226, 474, 134, 0, Math.PI * 2);
  context.fillStyle = "#FFFFFF";
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

  context.fillStyle = INK;
  const nameSize = fitText(context, profile.display_name, 690, 58, 38, 800);
  context.font = `800 ${nameSize}px Sora, Inter, Arial, sans-serif`;
  context.fillText(profile.display_name, 390, 502, 700);
  if (profile.headline) {
    context.fillStyle = "#6F6679";
    const headlineSize = fitText(context, profile.headline, 700, 29, 20, 500);
    context.font = `500 ${headlineSize}px Inter, Arial, sans-serif`;
    context.fillText(profile.headline, 390, 552, 700);
  }
  const accentGradient = context.createLinearGradient(390, 584, 650, 584);
  accentGradient.addColorStop(0, RED);
  accentGradient.addColorStop(1, GOLD);
  context.fillStyle = accentGradient;
  roundedRect(context, 390, 583, 235, 10, 5);
  context.fill();

  context.fillStyle = INK;
  context.font = "800 24px Sora, Inter, Arial, sans-serif";
  context.fillText("CONTACT", 88, 690);
  context.fillStyle = "#A39BAA";
  context.font = "600 17px Inter, Arial, sans-serif";
  context.fillText("Direct ways to reach me", 88, 724);

  let contactY = 758;
  const phone = profile.phone || profile.whatsapp;
  if (phone) {
    drawContactRow(context, "phone", "Phone", phone, 88, contactY, 1064);
    contactY += 110;
  }
  if (profile.email) {
    drawContactRow(context, "email", "Email", profile.email, 88, contactY, 1064);
    contactY += 110;
  }
  if (profile.address) {
    drawContactRow(context, "address", "Address", profile.address, 88, contactY, 1064);
    contactY += 130;
  }

  const savedSocialLinks = profile.links_json.filter((link) => link.label && link.url);
  const hasWhatsappLink = savedSocialLinks.some(
    (link) => resolveConnectProfilePlatform(link) === "whatsapp",
  );
  const socialLinks =
    profile.whatsapp && !hasWhatsappLink
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
  context.fillStyle = "#A39BAA";
  context.font = "600 17px Inter, Arial, sans-serif";
  context.fillText("Find me online", 88, contactY + 68);

  const socialStart = contactY + 98;
  const visibleLinks = socialLinks.slice(0, 8);
  visibleLinks.forEach((link, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    drawSocialLink(context, link, 88 + column * 410, socialStart + row * 76, 382);
  });
  if (socialLinks.length > visibleLinks.length) {
    context.fillStyle = "#81798A";
    context.font = "600 15px Inter, Arial, sans-serif";
    context.fillText(
      `+${socialLinks.length - visibleLinks.length} more link${socialLinks.length - visibleLinks.length === 1 ? "" : "s"} on the QR profile`,
      88,
      socialStart + 324,
    );
  }
  if (!visibleLinks.length) {
    context.fillStyle = "#81798A";
    context.font = "500 20px Inter, Arial, sans-serif";
    context.fillText("Scan the QR code to open this connect profile.", 88, socialStart + 34);
  }

  if (qr) {
    roundedRect(context, 866, 1276, 286, 340, 32);
    context.fillStyle = "#F8F6FA";
    context.fill();
    context.drawImage(qr, 891, 1301, 236, 236);
    context.fillStyle = INK;
    context.textAlign = "center";
    context.font = "800 19px Sora, Inter, Arial, sans-serif";
    context.fillText("SCAN TO CONNECT", 1009, 1574);
    context.fillStyle = "#81798A";
    context.font = "500 15px Inter, Arial, sans-serif";
    context.fillText("Open my live profile", 1009, 1601);
    context.textAlign = "left";
  }

  context.fillStyle = "#D9D3DF";
  context.fillRect(88, 1650, 1064, 2);
  context.fillStyle = INK;
  context.font = "700 18px Inter, Arial, sans-serif";
  context.fillText("LOGICSIFY", 88, 1685);
  context.fillStyle = "#81798A";
  context.textAlign = "right";
  context.font = "500 18px Inter, Arial, sans-serif";
  context.fillText("logicsify.com", 1152, 1685);
  context.textAlign = "left";

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
