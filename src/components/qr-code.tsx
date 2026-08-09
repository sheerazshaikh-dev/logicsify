import { useEffect, useState } from "react";
import { runtimeThemeColor } from "@/lib/theme-runtime";

export function QrCode({
  value,
  size = 220,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [source, setSource] = useState("");
  const [themeRevision, setThemeRevision] = useState(0);

  useEffect(() => {
    const update = () => setThemeRevision((value) => value + 1);
    window.addEventListener("logicsify:theme-updated", update);
    return () => window.removeEventListener("logicsify:theme-updated", update);
  }, []);

  useEffect(() => {
    let active = true;
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: runtimeThemeColor("--theme-dark", "#000000"), light: "#FFFFFF" },
        }),
      )
      .then((url) => active && setSource(url))
      .catch(() => active && setSource(""));
    return () => {
      active = false;
    };
  }, [size, themeRevision, value]);
  return source ? (
    <img src={source} width={size} height={size} alt="Scannable QR code" className={className} />
  ) : (
    <div
      className={className}
      style={{ width: size, height: size }}
      aria-label="Generating QR code"
    />
  );
}
