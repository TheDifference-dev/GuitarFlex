// Sadece sunucu tarafında kullanılır (node:fs).
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { BUILTIN_COURSES, DEFAULT_SITE_TEXTS } from "@/content/courses";
import type { Course, Lesson, SiteTexts } from "@/content/types";
import { PRIVATE_ROOTS } from "./private-roots";

// Kişisel içerik paketi: <kök>/icerik/ (kökler için bkz. private-roots.ts)
//   <kurs>.json  → Course şeklinde bir kurs (aynı slug'lı yerleşik kursun yerine geçer)
//   site.json    → SiteTexts alanlarının bir kısmı ya da tamamı (ana sayfa metinleri)
// Bu klasör Git'e gönderilmez; sadece kullanıcının bilgisayarında bulunur.

function normalize(raw: Course): Course | null {
  if (!raw?.slug || !raw.title || !Array.isArray(raw.sections)) return null;
  return {
    ...raw,
    kind: raw.kind ?? "technique",
    description: raw.description ?? "",
    sections: raw.sections.map((s, si) => ({
      ...s,
      number: s.number ?? si + 1,
      chapters: (s.chapters ?? []).map((c, ci) => ({
        ...c,
        code: c.code ?? `${s.number ?? si + 1}.${ci}`,
        lessons: (c.lessons ?? []).map((l, li) => ({
          ...l,
          id: l.id ?? `${c.code ?? `${si + 1}.${ci}`}-${li + 1}`,
          bpm: l.bpm ?? 60,
          minutes: l.minutes ?? 1,
        })),
      })),
    })),
  };
}

async function readPack(): Promise<{ courses: Course[]; site: Partial<SiteTexts> | null }> {
  const courses: Course[] = [];
  let site: Partial<SiteTexts> | null = null;
  for (const root of PRIVATE_ROOTS) {
    const dir = path.join(root, "icerik");
    let files: string[] = [];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    } catch {
      continue;
    }
    for (const f of files.sort()) {
      try {
        const data = JSON.parse(await readFile(path.join(dir, f), "utf8"));
        if (f === "site.json") site = { ...(data as Partial<SiteTexts>), ...(site ?? {}) };
        else {
          const c = normalize(data);
          // Aynı slug iki kökte varsa ilk kökteki (ozel-kaynak) geçerlidir.
          if (c && !courses.some((x) => x.slug === c.slug)) courses.push(c);
        }
      } catch {
        // Bozuk bir dosya diğerlerini engellemesin.
      }
    }
  }
  return { courses, site };
}

// Ders `ref` alanı ("<kurs-slug>#<ders-id>"): rehberlerde dersin kopyası yerine kaynak derse bağlantı.
// Dersin kendi alanı yoksa bu alanlar kaynak dersten alınır; title, id, bpm, minutes vb. dersin kendisinde kalır.
const REF_FIELDS = ["tex", "tabFile", "body", "theory"] as const;

/** Bütün kurslardaki `ref`'leri çözer. Tek seviye: kaynak dersin kendi `ref`'i izlenmez (döngü olmaz).
 *  Bulunamayan ref'li ders olduğu gibi kalır. Girdi nesneleri değiştirilmez. */
function resolveRefs(courses: Course[]): Course[] {
  const index = new Map<string, Lesson>();
  for (const c of courses)
    for (const s of c.sections)
      for (const ch of s.chapters)
        for (const l of ch.lessons) {
          const key = `${c.slug}#${l.id}`;
          if (!index.has(key)) index.set(key, l);
        }
  const resolve = (l: Lesson): Lesson => {
    if (!l.ref) return l;
    const target = index.get(l.ref);
    if (!target || target === l) return l;
    const filled: Partial<Lesson> = {};
    for (const f of REF_FIELDS) if (l[f] === undefined && target[f] !== undefined) Object.assign(filled, { [f]: target[f] });
    return Object.keys(filled).length ? { ...l, ...filled } : l;
  };
  return courses.map((c) => {
    if (!c.sections.some((s) => s.chapters.some((ch) => ch.lessons.some((l) => l.ref)))) return c;
    return {
      ...c,
      sections: c.sections.map((s) => ({
        ...s,
        chapters: s.chapters.map((ch) => ({ ...ch, lessons: ch.lessons.map(resolve) })),
      })),
    };
  });
}

export async function getCourses(): Promise<Course[]> {
  const { courses: pack, site } = await readPack();
  const replaced = BUILTIN_COURSES.map((c) => pack.find((p) => p.slug === c.slug) ?? c);
  const extra = pack.filter((p) => !BUILTIN_COURSES.some((b) => b.slug === p.slug));
  const all = resolveRefs([...replaced, ...extra]);
  const order = site?.courseOrder ?? [];
  const rank = new Map(all.map((c, i) => [c.slug, order.includes(c.slug) ? order.indexOf(c.slug) : order.length + i]));
  return all.sort((a, b) => rank.get(a.slug)! - rank.get(b.slug)!);
}

export async function getCourse(slug: string): Promise<Course | undefined> {
  return (await getCourses()).find((c) => c.slug === slug);
}

export async function getSiteTexts(): Promise<SiteTexts> {
  const { site } = await readPack();
  if (!site) return DEFAULT_SITE_TEXTS;
  return {
    navSubtitle: site.navSubtitle ?? DEFAULT_SITE_TEXTS.navSubtitle,
    hero: { ...DEFAULT_SITE_TEXTS.hero, ...site.hero },
    chordCard: { ...DEFAULT_SITE_TEXTS.chordCard, ...site.chordCard },
  };
}

/** Kurs görseli yolunu tarayıcıda kullanılabilir adrese çevirir. */
export function assetUrl(p: string | undefined): string | undefined {
  if (!p) return undefined;
  if (p.startsWith("/") || p.startsWith("http")) return p;
  return `/api/ozel?yol=${encodeURIComponent(p)}`;
}
