// Sadece sunucu tarafında kullanılır (node:fs).
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { BUILTIN_COURSES, DEFAULT_SITE_TEXTS } from "@/content/courses";
import type { Course, SiteTexts } from "@/content/types";

// Kişisel içerik paketi: ozel-kaynak/icerik/
//   <kurs>.json  → Course şeklinde bir kurs (aynı slug'lı yerleşik kursun yerine geçer)
//   site.json    → SiteTexts alanlarının bir kısmı ya da tamamı (ana sayfa metinleri)
// Bu klasör Git'e gönderilmez; sadece kullanıcının bilgisayarında bulunur.
export const PACK_DIR = path.join(process.cwd(), "ozel-kaynak", "icerik");

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
  let files: string[] = [];
  try {
    files = (await readdir(PACK_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    return { courses: [], site: null };
  }
  const courses: Course[] = [];
  let site: Partial<SiteTexts> | null = null;
  for (const f of files.sort()) {
    try {
      const data = JSON.parse(await readFile(path.join(PACK_DIR, f), "utf8"));
      if (f === "site.json") site = data;
      else {
        const c = normalize(data);
        if (c) courses.push(c);
      }
    } catch {
      // Bozuk bir dosya diğerlerini engellemesin.
    }
  }
  return { courses, site };
}

export async function getCourses(): Promise<Course[]> {
  const { courses: pack } = await readPack();
  const replaced = BUILTIN_COURSES.map((c) => pack.find((p) => p.slug === c.slug) ?? c);
  const extra = pack.filter((p) => !BUILTIN_COURSES.some((b) => b.slug === p.slug));
  return [...replaced, ...extra];
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
