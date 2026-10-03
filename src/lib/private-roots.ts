import { existsSync } from "node:fs";
import path from "node:path";

// Kişisel içeriğin okunduğu kök klasörler (sırayla aranır):
//  1. <proje>/ozel-kaynak            → Git'e gönderilmeyen yerel klasör
//  2. <proje>/../GuitarFlex-icerik   → ayrı, gizli içerik deposunun bilgisayardaki kopyası
// Her kökte aynı yapı kullanılır: icerik/*.json, gorseller/, tablar/
export const PRIVATE_ROOTS = [
  path.join(process.cwd(), "ozel-kaynak"),
  path.join(process.cwd(), "..", "GuitarFlex-icerik"),
];

/** Kök klasörlerden birine göre verilen göreli yolu bulur; kök dışına çıkan yolları reddeder. */
export function resolvePrivate(rel: string): string | null {
  for (const root of PRIVATE_ROOTS) {
    const full = path.resolve(root, rel);
    if (!full.startsWith(root + path.sep)) return null;
    if (existsSync(full)) return full;
  }
  return null;
}
