// Teori yollarının "Temeller" modülündeki sekmeler (sekme adına göre). Her sekme tek A4 sayfalık bir ders:
// içerik src/content/teori/moduller.ts'te. MODUL_METIN, dersin tanım paragraflarını düz metin olarak verir.
import { MODUL_DERS } from "./teori/moduller.ts";

/** Sekme adı değişen eski içerik paketleri için: eski ad → yeni ad */
const ESKI_AD: Record<string, Record<string, string>> = { kulak: { "Alıştırma Tüyoları": "Alıştırma Tipleri" } };

/** Sekmenin dersi (eski sekme adlarını da tanır) */
export function modulDersi(yol: string, sekme: string) {
  return MODUL_DERS[yol]?.[sekme] ?? MODUL_DERS[yol]?.[ESKI_AD[yol]?.[sekme] ?? ""];
}

export { MODUL_DERS };

export const MODUL_METIN: Record<string, Record<string, string[]>> = Object.fromEntries(
  Object.entries(MODUL_DERS).map(([yol, sekmeler]) => [yol, Object.fromEntries(Object.entries(sekmeler).map(([ad, d]) => [ad, d.tanim.map((p) => p.replace(/\*\*/g, ""))]))]),
);
