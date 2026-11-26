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

// ── Dört kademe (Arda, 24.11.2026): Başlangıç, Orta, Orta-Üst, Üst Düzey ─────
// İçerikteki etiketler L1–L5 olarak kalır; uygulama onları dört kademede gösterir ve öneri yapar.
// Eşleme: L1 → Başlangıç, L2 → Orta, L3 → Orta-Üst, L4 + L5 → Üst Düzey (kademe içinde L4 önce gelir).

export type Kademe = "baslangic" | "orta" | "orta-ust" | "ust";
export const KADEMELER: Kademe[] = ["baslangic", "orta", "orta-ust", "ust"];
export const isKademe = (v: string): v is Kademe => (KADEMELER as string[]).includes(v);

export const KADEME: Record<Kademe, { ad: string; tanim: string; seviyeler: Level[]; etut: string }> = {
  baslangic: {
    ad: "Başlangıç",
    tanim: "Alternatif pena, power chord ve açık akorlar; açık pozisyon; dörtlük ve sekizlik ritim; nota adları.",
    seviyeler: ["L1"],
    etut: "E1 “İlk Riff”",
  },
  orta: {
    ad: "Orta",
    tanim: "Hammer-on, bend, vibrato, slide ve bare; pentatonik kutular; 16'lık, üçleme ve shuffle; majör gam ve pentatonik doğaçlama.",
    seviyeler: ["L2"],
    etut: "E2 “Kutudan Kutuya”",
  },
  "orta-ust": {
    ad: "Orta-Üst",
    tanim: "Legato, economy ve hybrid pena; 3NPS pozisyonlar ve triad çevrimleri; altılama ve funk 16'lık; modlar ve 7'li akorlar.",
    seviyeler: ["L3"],
    etut: "E3 “Doryen Yolculuk”",
  },
  ust: {
    ad: "Üst Düzey",
    tanim: "Sweep, tapping ve armonikler; CAGED ve drop 2/3; aksak ölçü ve poliritim; ii–V–I, modal interchange ve değişimler üzerinde doğaçlama.",
    seviyeler: ["L4", "L5"],
    etut: "E4 “Neoklasik” · E5 “Ödünç Renkler”",
  },
};

const KADEME_OF: Record<Level, Kademe> = { L1: "baslangic", L2: "orta", L3: "orta-ust", L4: "ust", L5: "ust" };
/** İçerik seviyesinin (L1–L5) kademesi */
export const kademeOf = (l: Level): Kademe => KADEME_OF[l];

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

/** İlerleme anahtarı: pratik kartında teori yolu adımı, diğerlerinde ders kaydı. href/ad: öneri kartı için */
export type SeviyeDers = { key: string; step?: string; tab: boolean; href: string; ad: string };

/** Listede bir satır: kurs alt bölümü ya da bir teori yolunun bir bölümündeki adımlar */
export type SeviyeSatiri = {
  /** Kurs slug'ı ya da "yol:<slug>" */
  course: string;
  courseTitle: string;
  code: string;
  title: string;
  href: string;
  axis: Axis;
  level: Level;
  kaynak: "kurs" | "ek" | "stil" | "etut" | "yol";
  lessons: SeviyeDers[];
};

/** Bitirme koşulunun yol adımları (§3): Okuma, Kulak ve Ritim yollarında bu kademedeki adımlar */
export const KOSUL_YOLLARI = ["okuma", "kulak", "ritim"] as const;

export type SeviyeVerisi = {
  kademe: Kademe;
  /** Önerilen sırayla: önce kolay içerik seviyesi (L4 < L5), sonra beceri önkoşul derinliği, kurs sırası, kod */
  rows: SeviyeSatiri[];
};

/** Bitirme koşuluna giren dersler: tablı drill'ler ve Okuma, Kulak, Ritim yolu adımları */
export const kosulDersleri = (v: SeviyeVerisi): SeviyeDers[] =>
  v.rows.flatMap((r) =>
    r.kaynak === "yol" ? (KOSUL_YOLLARI.some((y) => r.course === `yol:${y}`) ? r.lessons : []) : r.lessons.filter((d) => d.tab),
  );
