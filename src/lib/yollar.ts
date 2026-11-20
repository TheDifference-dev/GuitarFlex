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
  { slug: "okuma", ad: "Okuma", etiket: "Okuma Programı" },
  // Armoni pratik kartları (Müzik Teorisi Dersleri) ve ek armoni adımları: ikincil dominant, ii–V–I, akor-gam
  { slug: "armoni", ad: "Armoni Pratikleri", etiket: "Armoni Programı" },
] as const;

/** Sayfaya giden yol: adım listesi için soru bankaları ve alıştırma ayarları gerekmez (istemciye gitmez) */
export function yolOzeti(y: Yol): Yol {
  return { ...y, adimlar: y.adimlar.map((a) => ({ ...a, alistirma: { tur: "karma", parcalar: [] } })) };
}
