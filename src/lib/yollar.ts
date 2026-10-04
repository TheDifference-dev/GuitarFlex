// Sadece sunucu tarafında kullanılır (node:fs).
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Yol } from "./alistirma/tipler";
import { PRIVATE_ROOTS } from "./private-roots";

/** Teori yolları: <kök>/icerik/yollar/<slug>.json (bkz. private-roots.ts). Paket yoksa undefined. */
export async function getYol(slug: string): Promise<Yol | undefined> {
  for (const root of PRIVATE_ROOTS) {
    try {
      return JSON.parse(await readFile(path.join(root, "icerik", "yollar", `${slug}.json`), "utf8")) as Yol;
    } catch {
      // Bu kökte yoksa sıradakine bak.
    }
  }
  return undefined;
}

export const YOLLAR = [
  { slug: "ritim", ad: "Ritim", etiket: "Ritim Programı" },
  { slug: "klavye", ad: "Klavye Görselleştirme", etiket: "Klavye Görselleştirme" },
  { slug: "kulak", ad: "Kulak Eğitimi", etiket: "Kulak Eğitimi Programı" },
] as const;
