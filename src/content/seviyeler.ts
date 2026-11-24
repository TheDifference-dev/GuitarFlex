import type { Axis, Chapter, Course, Lesson, Level } from "./types.ts";

// ── Seviye Yolu (Müfredat Spec v2.2 §3, §10) ─────────────────────────────────
// Bu dosya sunucu ve tarayıcıda ortak kullanılır (node:fs yok). Sayfa verisini kuran kod
// src/lib/seviye.ts'tedir; ilerleme tarayıcıda src/components/SeviyeYolu.tsx'te sayılır.

export const LEVELS: Level[] = ["L1", "L2", "L3", "L4", "L5"];
export const AXES: Axis[] = ["technique", "fretboard", "rhythm", "theory_ear"];

export const isLevel = (v: string): v is Level => (LEVELS as string[]).includes(v);

/** Seviyelerin adı, kısa tanımı ve seviye sonu etüdü (§3, §6.2) */
export const SEVIYE: Record<Level, { ad: string; tanim: string; etut: string }> = {
  L1: {
    ad: "Başlangıç",
    tanim: "Alternatif pena, power chord ve açık akorlar; açık pozisyon; dörtlük ve sekizlik ritim; nota adları.",
    etut: "E1 “İlk Riff”",
  },
  L2: {
    ad: "Başlangıç-Orta",
    tanim: "Hammer-on, bend, vibrato, slide ve bare; pentatonik kutular; 16'lık, üçleme ve shuffle; majör gam ve pentatonik doğaçlama.",
    etut: "E2 “Kutudan Kutuya”",
  },
  L3: {
    ad: "Orta",
    tanim: "Legato, economy ve hybrid pena; 3NPS pozisyonlar ve triad çevrimleri; altılama ve funk 16'lık; modlar ve 7'li akorlar.",
    etut: "E3 “Doryen Yolculuk”",
  },
  L4: {
    ad: "Orta-İleri",
    tanim: "Sweep, tapping ve armonikler; CAGED ve drop 2/3 dizilişleri; ritim cümleleri; ii–V–I, ikincil dominant ve modal doğaçlama.",
    etut: "E4 “Neoklasik”",
  },
  L5: {
    ad: "İleri",
    tanim: "6 tel sweep ve tapping; genişletilmiş ve altered dizilişler; aksak ölçü ve poliritim; modal interchange ve değişimler üzerinde doğaçlama.",
    etut: "E5 “Ödünç Renkler”",
  },
};

export const EKSEN: Record<Axis, string> = {
  technique: "Teknik",
  fretboard: "Klavye",
  rhythm: "Ritim",
  theory_ear: "Teori ve Kulak",
};

/** Seviye Yolu'nda ayrı gösterilen, iskelet dışındaki kurslar (§6.3, §7.1, §7.3a) */
export const EK_KURS = "gf-ekler";
export const STIL_KURSU = "gf-stiller";
export const ETUTLER = "etutler";

/** Bitirme koşulu (§3): tablı drill'lerin en az bu oranı tamamlanmalı */
export const BITIRME_ORANI = 0.7;

/** Akustik içerik Seviye Yolu'na girmez (K7) */
export const isAcoustic = (c: Course) => c.kind === "acoustic" || c.slug.startsWith("akustik");

/** Dersin geçerli etiketleri: ders alanı varsa alt bölümünkünü ezer (§4) */
export function lessonTags(ch: Chapter, l: Lesson) {
  return { level: l.level ?? ch.level, axes: l.axes ?? ch.axes, skills: l.skills ?? ch.skills };
}

/** Rehber kopyası mı (Seviye Yolu'nda çift sayılmasın diye).
 *  Ölçüt: kind "guide" olan bir kurstaki ders, `tex`'i (ref çözüldükten sonra, getCourses() çıktısında)
 *  kind "guide" OLMAYAN bir elektro kurstaki bir dersin `tex`'iyle birebir aynıysa kopyadır. Akustik kurslar
 *  karşılaştırmaya girmez: Seviye Yolu'nda yer almadıkları için onlarla aynı olan ders çift sayılmaz
 *  (Akor Yolu'nun 45 dersi Akustik Başlangıç Rehberi'ndekilerle aynı tab'ı taşır ve kalmalıdır). Böyle dersler
 *  Seviye Yolu'nun listesine, sayımlarına ve %70 koşuluna girmez; bütün dersleri kopya olan alt bölüm
 *  satırı da düşer. Özgün rehber dersleri (Akor Yolu, rehberlerin kendi dersleri, tabsız okuma adımları) kalır.
 *  Kurs sayfaları bundan etkilenmez. */
export function guideCopyTest(courses: Course[]): (course: Course, l: Lesson) => boolean {
  const texts = new Set<string>();
  for (const c of courses)
    if (c.kind !== "guide" && !isAcoustic(c)) for (const s of c.sections) for (const ch of s.chapters) for (const l of ch.lessons) if (l.tex) texts.add(l.tex);
  return (course, l) => course.kind === "guide" && !!l.tex && texts.has(l.tex);
}

/** Alt bölümün derslerinde geçen seviyeler (kurs sırasıyla, tekrarsız) */
export function chapterLevels(ch: Chapter): Level[] {
  const set = new Set<Level>();
  for (const l of ch.lessons) {
    const lv = l.level ?? ch.level;
    if (lv) set.add(lv);
  }
  return LEVELS.filter((lv) => set.has(lv));
}

// ── Sayfaya giden veri (sunucuda kurulur, tarayıcıya düz nesne olarak geçer) ──

/** İlerleme anahtarı: pratik kartında teori yolu adımı, diğerlerinde ders kaydı */
export type SeviyeDers = { key: string; step?: string; tab: boolean };

export type SeviyeSatiri = {
  course: string;
  courseTitle: string;
  code: string;
  title: string;
  href: string;
  lessons: SeviyeDers[];
};

export type SeviyeGrubu = { axis: Axis; rows: SeviyeSatiri[] };

/** Bitirme koşulunun yol adımları (§3): Okuma, Kulak ve Ritim yollarında bu seviyedeki adımlar */
export const KOSUL_YOLLARI = ["okuma", "kulak", "ritim"] as const;
export type SeviyeYolAdimi = { kod: string; ad: string; bolum: string; step: string };
export type SeviyeYolu = { slug: string; ad: string; adimlar: SeviyeYolAdimi[] };

export type SeviyeVerisi = {
  level: Level;
  /** Okuma, Kulak, Ritim yolları: adımın seviyesine (adım, yoksa bölüm etiketi) göre bu seviyedeki adımlar */
  yollar: SeviyeYolu[];
  /** Dört eksen, her zaman bu sırada (boş olabilir) */
  groups: SeviyeGrubu[];
  /** Ek kurs / Stil kursu / Etüt: içerik paketinde yoksa null */
  ekler: SeviyeGrubu[] | null;
  stiller: SeviyeGrubu[] | null;
  etut: SeviyeSatiri[] | null;
};
