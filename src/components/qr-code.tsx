import { useEffect, useState } from "react";

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
  useEffect(() => {
    let active = true;
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#190A2F", light: "#FFFFFF" },
        }),
      )
      .then((url) => active && setSource(url))
      .catch(() => active && setSource(""));
    return () => {
      active = false;
    };
  }, [size, value]);
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
