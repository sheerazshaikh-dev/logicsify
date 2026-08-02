import QRCode from "qrcode";

export async function downloadQrCode(value: string, filename: string) {
  const source = await QRCode.toDataURL(value, {
    width: 1200,
    margin: 4,
    errorCorrectionLevel: "H",
    color: { dark: "#190A2F", light: "#FFFFFF" },
  });
  const anchor = document.createElement("a");
  anchor.href = source;
  anchor.download = filename;
  anchor.click();
}
