import type { Course, Exercise, Lesson, Section, SiteTexts, Technique } from "./types.ts";
import { TECHNIQUES } from "./techniques.ts";
import { FULL_COURSES as FULL_LIST } from "./kurslar/index.ts";

// Tam (6 bölümlük) olarak yazılmış kurslar; diğerleri techniques.ts seviyelerinden üretilir.
const FULL_COURSES: Record<string, Course> = Object.fromEntries(FULL_LIST.map((c) => [c.slug, c]));

// Yerleşik (özgün) kurslar. Kişisel içerik paketi aynı slug'la bir kurs içerirse onun yerine geçer.

const NAMES: Record<string, { title: string; description: string }> = {
  "alternatif-pena": { title: "Alternate Picking", description: "Aşağı-yukarı pena hareketiyle hız ve doğruluk kazan." },
  arpej: { title: "Arpejler", description: "Akorları melodik arpej kalıplarına dönüştür." },
  "bend-vibrato": { title: "Bend & Vibrato", description: "Doğru perdeye bend ve notaya can veren vibrato." },
  legato: { title: "Legato", description: "Hammer-on ve pull-off ile akıcı, bağlı cümleler." },
  sweep: { title: "Sweep Picking", description: "Tek pena hareketiyle tellerin üzerinden hızlı arpejler." },
  tapping: { title: "Tapping", description: "Sağ elle sapa vurarak geniş aralıklı hızlı cümleler." },
  "economy-pena": { title: "Economy Picking", description: "Tel geçişlerinde pena yönünü koruyarak hız." },
  slide: { title: "Slide", description: "Perdeler arasında kayarak bağlı geçişler." },
  "palm-mute": { title: "Palm Mute", description: "Avuç içiyle susturarak vurucu rock ve metal ritimleri." },
  akorlar: { title: "Akorlar", description: "Açık akorlar, barre akorlar ve hızlı geçişler." },
  "ritim-tarama": { title: "Ritim & Strumming", description: "Sağ el ritim kalıpları, susturulmuş vuruşlar, senkop." },
  "kromatik-isinma": { title: "Kromatik Isınma", description: "Parmak bağımsızlığı ve her çalışmadan önce ısınma." },
};

const ORDER = [
  "alternatif-pena", "arpej", "bend-vibrato", "legato", "sweep", "tapping",
  "economy-pena", "slide", "palm-mute", "akorlar", "ritim-tarama", "kromatik-isinma",
];

function lessonFrom(e: Exercise, level: number): Lesson {
  return {
    id: e.id,
    title: e.title,
    bpm: e.startBpm,
    minutes: level >= 3 ? 2 : 1,
    description: e.description,
    tips: e.tips,
    tex: e.tex,
  };
}

function courseFromTechnique(t: Technique): Course {
  const meta = NAMES[t.slug] ?? { title: t.name, description: t.summary };
  return {
    slug: t.slug,
    title: meta.title,
    description: meta.description,
    kind: "technique",
    icon: t.icon,
    guide: [`## ${meta.title}`, t.summary, ...t.levels.map((l) => `Bölüm ${l.level} – ${l.title}: ${l.goal}`)],
    sections: t.levels.map((l) => ({
      number: l.level,
      title: l.title,
      exam: true,
      chapters: [{ code: `${l.level}.0`, title: l.goal.replace(/\.$/, ""), lessons: l.exercises.map((e) => lessonFrom(e, l.level)) }],
    })),
  };
}

const bySlug = Object.fromEntries(TECHNIQUES.map((t) => [t.slug, t]));
const levelLessons = (slug: string, level: number) =>
  (bySlug[slug]?.levels.find((l) => l.level === level)?.exercises ?? []).map((e) => lessonFrom(e, level));

const beginnerGuide: Course = {
  slug: "sifirdan-baslangic-rehberi",
  title: "Sıfırdan Başlangıç Rehberi",
  description: "Gitara sıfırdan başla: ısınma, ilk akorlar, ritim ve pena temelleri.",
  kind: "guide",
  icon: "🧭",
  guide: [
    "## Bu rehber kimin için?",
    "Gitara yeni başlayanlar için adım adım bir yol. Her dersi hedef süresi kadar çal, ders tamamlansın, sonra bir sonrakine geç.",
  ],
  sections: [
    {
      number: 1,
      title: "İlk Adımlar",
      exam: true,
      chapters: [
        { code: "1.0", title: "Isınma", lessons: levelLessons("kromatik-isinma", 1) },
        { code: "1.1", title: "İlk Akorlar", lessons: levelLessons("akorlar", 1) },
        { code: "1.2", title: "İlk Ritimler", lessons: levelLessons("ritim-tarama", 1) },
      ],
    },
    {
      number: 2,
      title: "Pena ve Sol El",
      exam: true,
      chapters: [
        { code: "2.0", title: "Alternate Picking", lessons: levelLessons("alternatif-pena", 1) },
        { code: "2.1", title: "Palm Mute", lessons: levelLessons("palm-mute", 1) },
        { code: "2.2", title: "Legato", lessons: levelLessons("legato", 1) },
      ],
    },
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
    {
      number: 1,
      title: "Ritim ve Akorlar",
      exam: true,
      chapters: [
        { code: "1.0", title: "Akor Geçişleri", lessons: levelLessons("akorlar", 2) },
        { code: "1.1", title: "Ritim Kalıpları", lessons: levelLessons("ritim-tarama", 2) },
      ],
    },
    {
      number: 2,
      title: "Teknik",
      exam: true,
      chapters: [
        { code: "2.0", title: "Pentatonik ve Tel Geçişi", lessons: levelLessons("alternatif-pena", 2) },
        { code: "2.1", title: "Bend", lessons: levelLessons("bend-vibrato", 2) },
        { code: "2.2", title: "Slide", lessons: levelLessons("slide", 2) },
      ],
    },
  ],
};

export const BUILTIN_COURSES: Course[] = [
  beginnerGuide,
  intermediateGuide,
  ...ORDER.map((slug) => FULL_COURSES[slug] ?? courseFromTechnique(bySlug[slug])),
];

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
