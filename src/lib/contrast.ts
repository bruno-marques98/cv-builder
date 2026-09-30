function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// WCAG contrast ratio between a color and a background, both as hex strings.
export function contrastRatio(colorHex: string, backgroundHex: string): number {
  const l1 = relativeLuminance(hexToRgb(colorHex));
  const l2 = relativeLuminance(hexToRgb(backgroundHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastResult {
  ratio: number;
  passesAA: boolean; // 4.5:1 for normal text
  passesAALarge: boolean; // 3:1 for large/bold text (headings)
}

export function checkContrast(colorHex: string, backgroundHex: string): ContrastResult {
  const ratio = contrastRatio(colorHex, backgroundHex);
  return { ratio, passesAA: ratio >= 4.5, passesAALarge: ratio >= 3 };
}
