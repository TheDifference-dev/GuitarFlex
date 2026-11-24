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

/** href: kartın açtığı sayfa. Okuma ve Armoni yollarının adımları kitap sayfalarında (Nota Okuma, Armoni) listelenir;
 *  /teori/yol/okuma ve /teori/yol/armoni oraya yönlendirir. */
export const YOLLAR = [
  { slug: "ritim", ad: "Ritim", etiket: "Ritim Programı", href: "/teori/yol/ritim" },
  { slug: "klavye", ad: "Klavye Görselleştirme", etiket: "Klavye Görselleştirme", href: "/teori/yol/klavye" },
  { slug: "kulak", ad: "Kulak Eğitimi", etiket: "Kulak Eğitimi Programı", href: "/teori/yol/kulak" },
  { slug: "okuma", ad: "Nota Okuma", etiket: "Nota Okuma Kütüphanesi", href: "/teori/nota-okuma" },
  // Armoni: GuitarBear'in 11 pratik kartı ve ek bölümler (ikincil dominant, ii–V–I, akor-gam, işlev/kadans, ödünç, gerilim, minör)
  { slug: "armoni", ad: "Armoni", etiket: "Armoni · ünite sınavları", href: "/teori/armoni" },
] as const;

/** Sayfaya giden yol: adım listesi için soru bankaları ve alıştırma ayarları gerekmez (istemciye gitmez) */
export function yolOzeti(y: Yol): Yol {
  return { ...y, adimlar: y.adimlar.map((a) => ({ ...a, alistirma: { tur: "karma", parcalar: [] } })) };
}

/** Kart notu: ana (GuitarBear) bölüm ve adım sayısı; Ek bölümler ayrı ("9 bölüm · 60 adım · 2 ek bölüm") */
export function yolSayim(y: Yol): string {
  const ek = y.bolumler.filter((b) => b.ek);
  const anaAdim = y.adimlar.filter((a) => !ek.some((b) => b.no === a.bolum)).length;
  return `${y.bolumler.length - ek.length} bölüm · ${anaAdim} adım${ek.length ? ` · ${ek.length} ek bölüm` : ""}`;
}
