"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeImg({
  value,
  size = 64,
  fgColor = "#1B2430",
  className,
}: {
  value: string;
  size?: number;
  fgColor?: string;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) return;
    QRCode.toDataURL(value, { margin: 0, color: { dark: fgColor, light: "#0000" }, width: size * 4 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => setDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [value, fgColor, size]);

  if (!value || !dataUrl) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR code" width={size} height={size} className={className} />;
}
