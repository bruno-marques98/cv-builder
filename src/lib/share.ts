import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { CVData } from "./types";
import { encryptCV } from "./shareEncrypt";

export function encodeCVForURL(cv: CVData): string {
  return compressToEncodedURIComponent(JSON.stringify(cv));
}

export function decodeCVFromURL(encoded: string): CVData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as CVData;
  } catch {
    return null;
  }
}

export function buildShareURL(cv: CVData): string {
  const encoded = encodeCVForURL(cv);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("cv", encoded);
  return url.toString();
}

// Password-protected variant: the payload is AES-encrypted before being
// put in the URL, under the `cve` param instead of `cv`. See shareEncrypt.ts
// for what this does and doesn't protect against.
export async function buildProtectedShareURL(cv: CVData, password: string): Promise<string> {
  const encrypted = await encryptCV(cv, password);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("cve", encrypted);
  return url.toString();
}
