// Kurs kataloğu: kursları gruplara ayırır ve kartlar, ana sayfa ("Devam et") ve kurs içi gezinme için
// küçük özetler üretir. Sunucuda da istemcide de çalışır (fs yok).
import type { Course, Lesson } from "@/content/types";
import { flatLessons, lessonKey } from "@/content/courses";
import { dersTuru, type DersTuru } from "./simge";

/** Katalogdaki grup (GuitarBear'deki "teknik seçici" sırasına benzer): rehberler (içerik paketinden), ısınma,
 *  akorlar, elektro teknikler, ek kurslar, müzik teorisi */
export type KursGrubu = "rehber" | "isinma" | "akor" | "elektro" | "ileri" | "ek" | "teori";
/** Kursun ait olduğu bölüm: menüdeki Elektro Gitar / Müzik Teorisi */
export type KursAilesi = "elektro" | "teori";

export const GRUP_ADI: Record<KursGrubu, string> = {
  rehber: "Rehberler",
  isinma: "Günlük Isınma",
  akor: "Akorlar · CAGED",
  elektro: "Elektro Gitar Teknikleri",
  ileri: "Orta–İleri · L3–L5",
  ek: "Müzisyenlik ve Isınma",
  teori: "Müzik Teorisi",
};

export const AILE_ADI: Record<KursAilesi, string> = { elektro: "Elektro Gitar", teori: "Müzik Teorisi" };
/** Ailenin ana sayfası (kırıntıdaki ikinci halka) */
export const AILE_ADRESI: Record<KursAilesi, string> = { elektro: "/elektro", teori: "/teori" };

const EK_KURSLAR = new Set(["gf-ekler", "gf-stiller", "kromatik-isinma"]);
/** Orta–ileri (L3–L5) ek kurslar: katalogda kendi grubunda, "Ek kurs" etiketiyle (Stiller: bölümleri L2–L5, ağırlığı L3–L5) */
const ILERI_KURSLAR = new Set(["gf-stiller"]);
const AKOR_KURSLARI = new Set(["akorlar"]);
const ISINMA_KURSLARI = new Set(["gunluk-isinma"]);

export function kursAilesi(c: Course): KursAilesi {
  if (c.kind === "theory") return "teori";
  return "elektro";
}

export function kursGrubu(c: Course): KursGrubu {
  if (c.kind === "theory") return "teori";
  if (c.slug.endsWith("-rehberi")) return "rehber";
  if (ISINMA_KURSLARI.has(c.slug)) return "isinma";
  if (AKOR_KURSLARI.has(c.slug)) return "akor";
  if (ILERI_KURSLAR.has(c.slug)) return "ileri";
  if (EK_KURSLAR.has(c.slug) || /\(Ek Kurs\)/.test(c.title)) return "ek";
  return "elektro";
}

/** Pratik kartının (teori sorusu) ilerleme anahtarı: progress.steps içinde */
export const adimAnahtari = (l: Lesson) => (l.practice ? `${l.practice.yol}/${l.practice.kod}` : null);

export const dersAdresi = (slug: string, id: string) => `/calis/${slug}/${encodeURIComponent(id)}`;

/** Katalog ve ana sayfa kartı */
export type KursKarti = {
  slug: string;
  title: string;
  description: string;
  grup: KursGrubu;
  aile: KursAilesi;
  status?: string;
  bolum: number;
  ders: number;
  /** Toplam hedef süre (dakika) */
  dakika: number;
  /** Ders ilerleme anahtarları (progress.exercises) */
  keys: string[];
  /** Pratik kartlarının adım anahtarları (progress.steps) */
  adimlar: string[];
};

export function kursKarti(c: Course): KursKarti {
  const dersler = flatLessons(c);
  return {
    slug: c.slug,
    title: c.cardTitle ?? c.title,
    description: c.description,
    grup: kursGrubu(c),
    aile: kursAilesi(c),
    status: c.status,
    bolum: c.sections.length,
    ders: dersler.length,
    dakika: Math.round(dersler.reduce((n, l) => n + (l.practice ? 0 : l.minutes), 0)),
    keys: dersler.filter((l) => !l.practice).map((l) => lessonKey(c.slug, l.id)),
    adimlar: dersler.map(adimAnahtari).filter((k): k is string => !!k),
  };
}

/** Kurs içi gezinme (çekmece) ve "Devam et" için kursun ana hatları */
export type KursAnahat = {
  slug: string;
  title: string;
  aile: KursAilesi;
  bolumler: {
    number: number;
    title: string;
    altlar: { code: string; title: string; dersler: { id: string; title: string; adim?: string; tur?: DersTuru }[] }[];
  }[];
};

export function kursAnahatti(c: Course): KursAnahat {
  return {
    slug: c.slug,
    title: c.title,
    aile: kursAilesi(c),
    bolumler: c.sections.map((s) => ({
      number: s.number,
      title: s.title,
      altlar: s.chapters.map((ch) => ({
        code: ch.code,
        title: ch.title,
        dersler: ch.lessons.map((l) => {
          const adim = adimAnahtari(l);
          const tur = dersTuru(l);
          return { id: l.id, title: l.title, ...(adim ? { adim } : {}), ...(tur ? { tur } : {}) };
        }),
      })),
    })),
  };
}
