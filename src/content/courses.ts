import type { Chapter, Course, Section, SiteTexts } from "./types.ts";
import { FULL_COURSES } from "./kurslar/index.ts";

// Yerleşik (özgün) kurslar: src/content/kurslar/. Kişisel içerik paketi aynı slug'la bir kurs
// içerirse onun yerine geçer (bkz. src/lib/courses.ts).

const ORDER = [
  "alternatif-pena", "arpej", "bend-vibrato", "legato", "sweep", "tapping",
  "economy-pena", "slide", "palm-mute", "akorlar", "ritim-tarama", "kromatik-isinma",
];
const bySlug = Object.fromEntries(FULL_COURSES.map((c) => [c.slug, c]));

/** Rehberler için: bir kursun alt bölümünü (ör. "1.0") yeni koduyla ve başlığıyla alır. */
function borrow(slug: string, code: string, newCode: string, title?: string): Chapter {
  const ch = bySlug[slug].sections.flatMap((s) => s.chapters).find((c) => c.code === code);
  if (!ch) throw new Error(`${slug} kursunda ${code} yok`);
  return { ...ch, code: newCode, title: title ?? `${bySlug[slug].title}: ${ch.title}` };
}

const beginnerGuide: Course = {
  slug: "sifirdan-baslangic-rehberi",
  title: "Sıfırdan Başlangıç Rehberi",
  description: "Gitara sıfırdan başla: ısınma, ilk akorlar, ritim ve pena temelleri.",
  kind: "guide",
  icon: "🧭",
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
  icon: "🗺",
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
    eyebrow: "Başlangıç Rehberleri",
    title: "Nereden Başlamak İstersin?",
    text: "Gitara sıfırdan başla ya da temellerini başlangıç–orta seviyede pekiştir.",
    guides: [
      { slug: "sifirdan-baslangic-rehberi", title: "Sıfırdan Başlangıç Rehberi", text: "Isınma, ilk akorlar, ritim ve pena temelleriyle adım adım ilerle.", button: "Rehberi Aç" },
      { slug: "baslangic-orta-rehberi", title: "Başlangıç-Orta Rehberi", text: "Akorlar, ritim ve temel teknikler arasında kendi hedefinle ilerle.", button: "Rehberi Aç" },
    ],
  },
  chordCard: { eyebrow: "Akor Yolu", title: "Akorları Çal", text: "Akorları, geçişleri ve ritmi çalış.", button: "Akorlara Başla", slug: "akorlar" },
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
