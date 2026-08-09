import { runtimeThemeColor } from "@/lib/theme-runtime";

export async function downloadQrCode(value: string, filename: string) {
  const { default: QRCode } = await import("qrcode");
  const source = await QRCode.toDataURL(value, {
    width: 1200,
    margin: 4,
    errorCorrectionLevel: "H",
    color: { dark: runtimeThemeColor("--theme-dark", "#000000"), light: "#FFFFFF" },
  });
  const anchor = document.createElement("a");
  anchor.href = source;
  anchor.download = filename;
  anchor.click();
}
