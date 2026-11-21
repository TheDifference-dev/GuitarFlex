// Gömülü içerik paketi (betikler/icerik-paketle.mts üretir; Git'e girmez). Yol ekranları için hafif özet;
// ders gövdeleri (tab, metin) ve teori soru bankaları ilgili ekranda yüklenir.
import ozetVeri from "../icerik-paket/ozet.json";
import rehberVeri from "../icerik-paket/sarki-rehberi.json";
import metaVeri from "../icerik-paket/meta.json";
import gliflerVeri from "../icerik-paket/glifler.json";

export type Simge = { glif: string; renk: string };
export type DersOzet = { id: string; baslik: string; tur: string; dk: number; bpm: number; pratik?: { yol: string; kod: string }; kisim?: string[] };
export type KursOzet = {
  slug: string;
  baslik: string;
  kisa: string;
  aciklama: string;
  tur: "technique" | "guide" | "acoustic" | "theory";
  simge: Simge;
  bolumler: { no: number; baslik: string; seviye?: string; alt: { kod: string; baslik: string; dersler: DersOzet[] }[] }[];
};
export type RehberAdim = {
  adim: number;
  seviye: string;
  bolumler: { kurs: string; bolum: number; ad: string }[];
  baslik: string;
  sanatci: string;
  tur: string;
  madalya?: string;
  bpm?: number;
  url: string;
};

export const KURSLAR = ozetVeri as unknown as KursOzet[];
export const REHBER = rehberVeri as RehberAdim[];
export const META = metaVeri as {
  uretildi: string;
  icerikKaynak: string;
  kurslar: Record<string, number>;
  yollar: Record<string, { ana: number; ek: number }>;
  yolAdlari: Record<string, string>;
  yolSimgeleri: Record<string, Simge>;
  rehber: number;
  dersGlifleri: Record<string, string>;
  dersTuruAdi: Record<string, string>;
};
export const GLIFLER = gliflerVeri as Record<string, string>;

export const kurs = (slug: string) => KURSLAR.find((k) => k.slug === slug);

/** Kurs seçicideki gruplar (masaüstündeki sıra korunur) */
export const KURS_GRUPLARI: { ad: string; kurslar: KursOzet[] }[] = [
  { ad: "Rehberler", kurslar: KURSLAR.filter((k) => k.tur === "guide") },
  { ad: "Teknik kursları", kurslar: KURSLAR.filter((k) => k.tur === "technique" && !k.slug.startsWith("gf-")) },
  { ad: "Ek kurslar", kurslar: KURSLAR.filter((k) => k.slug.startsWith("gf-")) },
  { ad: "Akustik", kurslar: KURSLAR.filter((k) => k.tur === "acoustic") },
].filter((g) => g.kurslar.length);

export const YOL_SIRASI = ["ritim", "klavye", "kulak", "armoni", "okuma"].filter((s) => META.yollar[s]);

/** Dersin düğüm glifi: drill'de kursun glifi, diğer türlerde türün glifi */
export const dersGlifi = (k: KursOzet, tur: string) => (tur === "drill" ? k.simge.glif : META.dersGlifleri[tur] ?? k.simge.glif);
