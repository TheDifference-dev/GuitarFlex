import type { Chapter, Course, Section, SiteTexts } from "./types.ts";
import { FULL_COURSES } from "./kurslar/index.ts";
import { akorEskiCourse } from "./kurslar/akorlar-eski.ts";
import { kromatikEskiCourse } from "./kurslar/kromatik-eski.ts";

// Yerleşik (özgün) kurslar: src/content/kurslar/. Kişisel içerik paketi aynı slug'la bir kurs
// içerirse onun yerine geçer (bkz. src/lib/courses.ts).

const ORDER = [
  "alternatif-pena", "arpej", "bend-vibrato", "legato", "sweep", "tapping",
  "economy-pena", "slide", "palm-mute", "akorlar", "ritim-tarama", "kromatik-isinma",
];
const bySlug = Object.fromEntries(FULL_COURSES.map((c) => [c.slug, c]));
// Arşivdeki rehberler eski Akorlar ve Kromatik Isınma kurslarından ödünç alır (yeni kurslarda bu alt bölümler yok)
const rehberKaynagi: Record<string, Course> = { ...bySlug, akorlar: akorEskiCourse, "kromatik-isinma": kromatikEskiCourse };

/** Rehberler için: bir kursun alt bölümünü (ör. "1.0") yeni koduyla ve başlığıyla alır. */
function borrow(slug: string, code: string, newCode: string, title?: string): Chapter {
  const ch = rehberKaynagi[slug].sections.flatMap((s) => s.chapters).find((c) => c.code === code);
  if (!ch) throw new Error(`${slug} kursunda ${code} yok`);
  return { ...ch, code: newCode, title: title ?? `${rehberKaynagi[slug].title}: ${ch.title}` };
}

const beginnerGuide: Course = {
  slug: "sifirdan-baslangic-rehberi",
  title: "Sıfırdan Başlangıç Rehberi",
  description: "Gitara sıfırdan başla: ısınma, ilk akorlar, ritim ve pena temelleri.",
  kind: "guide",
  // Başlangıç rehberi: orta–ileri odak için arşivde (W5, 24.11.2026)
  arsiv: true,
  guide: [
    "## Bu rehber kimin için?",
    "Gitara yeni başlayanlar için adım adım bir yol. Her dersi hedef süresi kadar çal, ders tamamlansın, sonra bir sonrakine geç.",
    "Rehberdeki dersler teknik kurslarının ilk bölümlerinden seçildi; bir tekniği daha derin çalışmak istersen o kursa geç.",
  ],
  sections: [
    { number: 1, title: "İlk Adımlar", exam: true, chapters: [
      borrow("kromatik-isinma", "1.0", "1.0", "Isınma"),
      borrow("akorlar", "1.0", "1.1", "İlk Akorlar: Em ve Am"),
      borrow("ritim-tarama", "1.0", "1.2", "İlk Ritimler"),
    ] },
    { number: 2, title: "Akorlar ve Ritim", exam: true, chapters: [
      borrow("akorlar", "1.1", "2.0", "E, A ve D"),
      borrow("akorlar", "1.2", "2.1", "G, C ve D"),
      borrow("ritim-tarama", "1.1", "2.2", "Sekizlik Tarama"),
    ] },
    { number: 3, title: "Pena ve Sol El", exam: true, chapters: [
      borrow("alternatif-pena", "1.0", "3.0", "Açık Tellerde Pena"),
      borrow("alternatif-pena", "1.1", "3.1", "Tek Tel Gamlar"),
      borrow("legato", "1.0", "3.2", "İlk Hammer-on'lar"),
      borrow("palm-mute", "1.0", "3.3", "Palm Mute"),
    ] },
  ],
};

const intermediateGuide: Course = {
  slug: "baslangic-orta-rehberi",
  title: "Başlangıç-Orta Rehberi",
  description: "Akorlar, ritim ve temel teknikler arasında hedefine göre ilerle.",
  kind: "guide",
  arsiv: true,
  guide: ["## Bu rehber kimin için?", "Temel akorları ve pena hareketini bilen, düzenli bir çalışma planı arayanlar için."],
  sections: [
    { number: 1, title: "Ritim ve Akorlar", exam: true, chapters: [
      borrow("akorlar", "2.0", "1.0", "Akor Geçişleri"),
      borrow("ritim-tarama", "1.2", "1.1", "Boşluklu Tarama Kalıpları"),
      borrow("akorlar", "3.0", "1.2", "F Barre Akoru"),
    ] },
    { number: 2, title: "Solo Temelleri", exam: true, chapters: [
      borrow("alternatif-pena", "2.0", "2.0", "La Minör Pentatonik"),
      borrow("bend-vibrato", "1.0", "2.1", "Vibrato"),
      borrow("bend-vibrato", "3.0", "2.2", "Tam Ses Bend"),
      borrow("slide", "1.0", "2.3", "Slide"),
    ] },
    { number: 3, title: "Arpej ve Teori", exam: true, chapters: [
      borrow("arpej", "1.2", "3.0", "Akor Dizilerinde Arpej"),
      borrow("arpej", "3.1", "3.1", "Minör Üçlü Arpejleri"),
      borrow("akorlar", "6.0", "3.2", "Bir Tonun Akorları"),
    ] },
  ],
};

export const BUILTIN_COURSES: Course[] = [beginnerGuide, intermediateGuide, ...ORDER.map((slug) => bySlug[slug])];

export const DEFAULT_SITE_TEXTS: SiteTexts = {
  navSubtitle: "Teknik Egzersizler",
  hero: {
    eyebrow: "Her Gün",
    title: "Bugün Ne Çalışmalı?",
    text: "10–15 dakika günlük ısınma, sonra 20 dakika: günün üç tekniğinden en az ikisi ve kalan sürede bir şarkı. Hepsi metronomla.",
    guides: [
      { slug: "gunluk-rutin", href: "/rutin", title: "Günlük Rutin", text: "Üç farklı 15 dakikalık ısınma (Gün A, B, C): bloklar zamanlayıcıyla sırayla açılır.", button: "Başla" },
      { slug: "kromatik-isinma", title: "Kromatik Isınma", text: "Permütasyon, örümcek, tel atlama, pena, legato, bend, gam, arpej ve akor ısınmaları.", button: "Aç" },
    ],
  },
  chordCard: { eyebrow: "Akorlar", title: "Akorları Sapın Her Yerinde Çal", text: "Akor nasıl oluşur, CAGED ile beş pozisyon, akor türleri ve pozisyon geçişleri.", button: "Akorlara Başla", slug: "akorlar" },
};

/** Bir kursun tüm derslerini sırayla, bölüm ve alt bölüm bilgisiyle döndürür. */
export function flatLessons(course: Course) {
  return course.sections.flatMap((s: Section) =>
    s.chapters.flatMap((c) => c.lessons.map((l) => ({ ...l, section: s, chapter: c }))),
  );
}

export function lessonKey(courseSlug: string, lessonId: string) {
  return `${courseSlug}/${lessonId}`;
}
