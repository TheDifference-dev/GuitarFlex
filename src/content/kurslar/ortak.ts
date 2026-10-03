// Kurs dosyalarının ortak yardımcıları.
import type { Chapter, Lesson, Section } from "../types.ts";
import { fx, strokes, tex } from "../tex.ts";
import { measures } from "../dizi.ts";

export type LessonInput = Omit<Lesson, "id" | "minutes"> & { minutes?: number };

/** Alt bölüm: kodu (1.0, 1.1 …) ve ders kimliklerini sıradan üretir. */
export function chapter(prefix: string, section: number, index: number, title: string, theory: string[], lessons: LessonInput[]): Chapter {
  const code = `${section}.${index}`;
  return {
    code,
    title,
    theory,
    lessons: lessons.map((l, i) => ({ minutes: 1, ...l, id: `${prefix}-${section}-${index}-${i + 1}` })),
  };
}

export function section(number: number, title: string, chapters: Chapter[]): Section {
  return { number, title, exam: true, chapters };
}

/** Alternate picking: notalara sırayla aşağı/yukarı pena işareti */
export const alt = (notes: string[]) => strokes(notes);

/**
 * Ritim kalıbından ölçü: "x" nota, "-" sus. Pena yönü notanın ölçüdeki yerine göre
 * belirlenir (vuruş = aşağı, ara = yukarı); susta el boşta salınmaya devam eder.
 */
export function grid(pattern: string, note: string, duration = ":8"): string {
  const parts = [...pattern].map((c, i) => (c === "x" ? fx(note, i % 2 ? "su" : "sd") : "r"));
  return `${duration} ${parts.join(" ")}`;
}

/** Her n'inci notaya vurgu (aksan) ekler; `offset` ilk vurgunun yerini kaydırır. */
export function accent(notes: string[], every: number, offset = 0): string[] {
  return notes.map((n, i) => (i % every === offset ? fx(n, "ac") : n));
}

// ── Ritim kalıpları (pena işareti eklemeden) ─────────────────────────────────

export const e8 = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":8", notes, 8), ...end]);
export const t8 = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":8", notes, 12, 3), ...end]);
export const s16 = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":16", notes, 16), ...end]);
export const x16 = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":16", notes, 24, 3), ...end]);

/** Kısa ders tanımı */
export function ders(
  title: string,
  bpm: number,
  texStr: string,
  description: string,
  tips: string | string[] = [],
  theory: string | string[] = [],
  minutes = 1,
): LessonInput {
  const arr = (x: string | string[]) => (Array.isArray(x) ? x : [x]);
  return { title, bpm, tex: texStr, description, tips: arr(tips), theory: arr(theory), minutes };
}
