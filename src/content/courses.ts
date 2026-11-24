import type { Chapter, Course, Lesson, Section, SiteTexts } from "./types.ts";
import { FULL_COURSES } from "./kurslar/index.ts";
import { tekOlcu } from "./dongu.ts";

// Yerleşik (özgün) kurslar: src/content/kurslar/. Kişisel içerik paketi aynı slug'la bir kurs
// içerirse onun yerine geçer (bkz. src/lib/courses.ts).
//
// Uygulama orta–ileri düzey ELEKTRO gitarist içindir:
//  · akustik kurslar ve sayfalar, başlangıç rehberleri ve Akor Yolu kaldırıldı (KALDIRILAN_KURSLAR);
//  · teknik kurslardaki gitara yeni başlayan bölümleri çıkarıldı (BASLANGIC_BOLUMLERI). Kalan derslerin kimlikleri
//    (ilerleme anahtarları "<kurs>/<ders-id>") değişmez: kimlik özgün bölüm/alt bölüm numarasından üretilir, yalnız
//    görünen numaralar (Bölüm 1, 1.0 …) yeniden sıralanır. Bu yüzden ilerleme göçü gerekmez;
//  · her ders en çok 4 ölçülük bir döngüdür (dongu.ts) ve her bölümün sonunda bölümün tekniklerini birleştiren bir
//    sınav dersi vardır (sinavEkle).

const ORDER = [
  "gunluk-isinma", "alternatif-pena", "arpej", "bend-vibrato", "legato", "sweep", "tapping",
  "economy-pena", "slide", "palm-mute", "akorlar", "ritim-tarama", "kromatik-isinma",
];

/** Artık yüklenmeyen kurslar (içerik paketinde bulunsalar da): başlangıç rehberleri ve Akor Yolu. Akustik kurslar
 *  (kind "acoustic" ya da "akustik-" ile başlayan slug) de yüklenmez. */
export const KALDIRILAN_KURSLAR = new Set(["sifirdan-baslangic-rehberi", "baslangic-orta-rehberi", "akor-yolu", "akustik-baslangic-rehberi"]);
export const kaldirildiMi = (c: { slug: string; kind?: string }) =>
  KALDIRILAN_KURSLAR.has(c.slug) || c.slug.startsWith("akustik") || (c.kind as string) === "acoustic";

/** Gitara yeni başlayan düzeyindeki bölümler (özgün bölüm numarası ya da alt bölüm kodu): çıkarılır */
const BASLANGIC_BOLUMLERI: Record<string, { bolum?: number[]; alt?: string[] }> = {
  "alternatif-pena": { bolum: [1] }, // açık teller, tek tel gamlar, ilk ritim değerleri, ilk kromatik
  legato: { bolum: [1] }, // ilk hammer-on / pull-off, trill, kromatik legato
  arpej: { bolum: [1, 2] }, // açık akor arpejleri ve açık akorlu desenler
  "bend-vibrato": { alt: ["1.0", "2.0"] }, // birlik notalarda ilk vibrato, referansla ilk yarım ses bend
  slide: { bolum: [1] }, // ilk legato / shift slide
  "palm-mute": { bolum: [1] }, // açık Mi'de ilk palm mute, ilk power chord
  "ritim-tarama": { bolum: [1] }, // dörtlük / sekizlik ilk tarama
  "kromatik-isinma": { alt: ["1.0", "1.1", "3.0"] }, // 1-2-3-4 ve ilk permütasyonlar; Günlük Isınma kursu yerini aldı
};

/** Sınav eklenmeyen kurslar (ısınma rutinleri sınav değil, günlük çalışmadır) */
const SINAVSIZ = new Set(["gunluk-isinma"]);

/** Sınav kademeleri (GuitarBear'deki Altın – Platin – Elmas – Usta basamakları gibi) ve tempo çarpanları */
const KADEME_ADLARI = ["Altın I", "Platin I", "Elmas I", "Usta"];
const kademeler = (bpm: number) => [1, 1.15, 1.3, 1.5].map((k) => Math.round((bpm * k) / 5) * 5);

function cikar(c: Course): Course {
  const kural = BASLANGIC_BOLUMLERI[c.slug];
  if (!kural) return c;
  const sections = c.sections
    .filter((s) => !kural.bolum?.includes(s.number))
    .map((s) => ({ ...s, chapters: s.chapters.filter((ch) => !kural.alt?.includes(ch.code)) }))
    .filter((s) => s.chapters.length);
  return { ...c, sections };
}

/** Görünen numaraları sıralar: Bölüm 1, 2 … ve alt bölümler n.0, n.1 … (ders kimlikleri aynı kalır) */
function numarala(c: Course): Course {
  return {
    ...c,
    sections: c.sections.map((s, si) => ({
      ...s,
      number: si + 1,
      chapters: s.chapters.map((ch, ci) => ({ ...ch, code: `${si + 1}.${ci}` })),
    })),
  };
}

/**
 * Bölüm sınavı: her alt bölümün son (en zor) dersinden birer ölçü ve son alt bölümün kapanış ölçüsü; en çok 4 ölçü.
 * Yalnız aynı alt bölümdeki (ızgara: sekizlik, triole, on altılık …) ve aynı ölçü birimindeki ölçüler yan yana gelir
 * (karışık alt bölüm olmasın); en çok alt bölümün ortak olduğu grup seçilir. Tempo seçilen derslerin en yavaşıdır.
 */
function sinav(c: Course, s: Section): { chapter: Chapter; tiers: number[] } | null {
  const adaylar = s.chapters
    .map((ch) => ({ ch, l: [...ch.lessons].reverse().find((l) => l.tex && !l.exam) }))
    .filter((x): x is { ch: Chapter; l: Lesson } => !!x.l)
    .map((x) => ({ ...x, ilk: tekOlcu(x.l.tex!, 0), son: tekOlcu(x.l.tex!, -1) }));
  if (!adaylar.length) return null;
  const sayac = new Map<string, number>();
  for (const a of adaylar) sayac.set(a.ilk.grup, (sayac.get(a.ilk.grup) ?? 0) + 1);
  const grup = [...sayac].sort((a, b) => b[1] - a[1])[0][0];
  const uygun = adaylar.filter((a) => a.ilk.grup === grup);
  const bars: string[] = uygun.slice(0, 3).map((a) => a.ilk.bar);
  const sonAday = uygun.at(-1)!;
  // Kapanış: son uygun dersin son ölçüsü (aynı gruptaysa ve ilk ölçüden farklıysa)
  if (sonAday.son.grup === grup && sonAday.son.bar !== sonAday.ilk.bar && bars.length < 4) bars.push(sonAday.son.bar);
  // Tek ölçü kaldıysa o dersin ikinci ölçüsü de eklenir
  if (bars.length < 2) {
    const ikinci = tekOlcu(sonAday.l.tex!, 1);
    if (ikinci.grup === grup && ikinci.bar !== bars[0]) bars.push(ikinci.bar);
  }
  // Ölçü birimi yalnız ilk ölçüde yazılır (hepsi aynı grupta: aynı ölçü birimi)
  const temiz = bars.map((b, i) => (i ? b.replace(/^\\ts \d+ \d+ /, "") : b));
  const bpm = Math.min(...uygun.map((a) => a.l.bpm));
  const m = /^(.+)-(\d+)-\d+-\d+$/.exec(uygun[0].l.id);
  const id = m ? `${m[1]}-${m[2]}-sinav` : `${c.slug}-${s.number}-sinav`;
  const kaynak = uygun.map((a) => a.ch.title);
  const tiers = kademeler(bpm);
  const lesson: Lesson = {
    id,
    title: `Sınav: ${s.title}`,
    bpm,
    minutes: 2,
    exam: true,
    tex: `\\tempo ${bpm} . ${temiz.join(" | ")}`,
    description: `Bölümün tekniklerini birleştiren ${temiz.length} ölçülük döngü: ${kaynak.join(" → ")}.`,
    tips: [
      `Her ölçü bölümdeki bir alt bölümün son dersinden gelir (${kaynak.join(", ")}); geçişlerde el pozisyonunu önceden hazırla.`,
      `Kademeler: ${KADEME_ADLARI.map((ad, i) => `${ad} ${tiers[i]}`).join(" · ")} BPM. Bir kademeyi iki kez hatasız çalınca bir sonrakine geç.`,
    ],
    theory: [],
  };
  return { chapter: { code: `${s.number}.${s.chapters.length}`, title: "Bölüm Sınavı", lessons: [lesson] }, tiers };
}

function sinavEkle(c: Course): Course {
  if (SINAVSIZ.has(c.slug)) return { ...c, sections: c.sections.map((s) => ({ ...s, exam: false })) };
  return {
    ...c,
    sections: c.sections.map((s) => {
      const x = sinav(c, s);
      if (!x) return s;
      return { ...s, exam: true, examName: `Bölüm ${s.number} Sınavı`, examTiers: x.tiers, examTierNames: KADEME_ADLARI, chapters: [...s.chapters, x.chapter] };
    }),
  };
}

/** Rehberdeki "Bölüm n – …" plan satırlarını kalan bölümlerden yeniden yazar; döngü ve sınav notu ekler */
function rehber(c: Course): Course {
  if (!c.guide) return c;
  const plan = /^Bölüm \d+ – /;
  const ilk = c.guide.findIndex((p) => plan.test(p));
  const geri = c.guide.filter((p) => !plan.test(p));
  const satirlar = c.sections.map(
    (s) => `Bölüm ${s.number} – ${s.title}: ${s.chapters.filter((ch) => !ch.lessons.every((l) => l.exam)).map((ch) => ch.title).join(", ")}${s.exam ? "; bölüm sınavı" : ""}.`,
  );
  const guide = ilk >= 0 ? [...geri.slice(0, ilk), ...satirlar, ...geri.slice(ilk)] : [...geri];
  if (!SINAVSIZ.has(c.slug))
    guide.push(
      "## Döngüler ve sınavlar",
      "Her ders 2–4 ölçülük kısa bir döngüdür: oynatıcı döngüyü tekrar tekrar çalar, sen hedef süre dolana kadar temiz ve rahat çal. Her dersin tek bir alt bölümü vardır (yalnız sekizlik, yalnız triole ya da yalnız on altılık).",
      "Her bölümün sonundaki sınav, bölümdeki alt bölümlerin birer ölçüsünü tek döngüde birleştirir. Kademeler (Altın I, Platin I, Elmas I, Usta) aynı döngüyü giderek daha hızlı çalmaktır.",
    );
  return { ...c, guide };
}

const duzenle = (c: Course) => rehber(sinavEkle(numarala(cikar(c))));
const bySlug = Object.fromEntries(FULL_COURSES.map((c) => [c.slug, duzenle(c)]));

export const BUILTIN_COURSES: Course[] = ORDER.map((slug) => bySlug[slug]);

export const DEFAULT_SITE_TEXTS: SiteTexts = {
  navSubtitle: "Elektro Gitar · Orta – İleri",
  hero: {
    eyebrow: "Her Gün",
    title: "Önce Isın, Sonra Çalış",
    text: "On dakikalık üç ısınma rutini: pena, sol el ve ifade. Sonra istediğin tekniğe geç.",
    guides: [
      { slug: "gunluk-isinma", title: "Günlük Isınma", text: "Üç rutin, her biri ~10 dakika: teknik/pena, legato/sol el, solo/ifade.", button: "Isın" },
      { slug: "kromatik-isinma", title: "Kromatik Isınma", text: "Örümcek, permütasyon, tel atlama ve esneme döngüleri.", button: "Aç" },
    ],
  },
  chordCard: { eyebrow: "Akorlar · CAGED", title: "Akorları Sapta Gör", text: "Akorların yapısı, CAGED şekilleri, şekil bağlantıları ve triad çevrimleri.", button: "Akorlara Geç", slug: "akorlar" },
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
