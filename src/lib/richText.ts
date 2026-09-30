export interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

// Supports **bold**, *italic* (and _italic_). Intentionally minimal —
// no nesting, no links, no other markdown syntax.
export function parseInline(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false, italic: false });
    }
    if (match[2] !== undefined) {
      segments.push({ text: match[2], bold: true, italic: false });
    } else {
      segments.push({ text: match[3] ?? match[4] ?? "", bold: false, italic: true });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false, italic: false });
  }
  return segments.length > 0 ? segments : [{ text, bold: false, italic: false }];
}
