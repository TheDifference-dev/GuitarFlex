// Müzik Teorisi dersleri: içerik src/content/teori/dersler.ts'te (tek A4 sayfalık ders kitabı düzeni).
import { DERSLER, dersBul } from "./teori/dersler.ts";
import type { Ders } from "./teori/tipler.ts";

export type TheoryLesson = { slug: string; title: string; level: number; summary: string };

/** Ders listesi (teori ana sayfası ve statik yollar için) */
export const THEORY: TheoryLesson[] = DERSLER.map((d) => ({ slug: d.slug, title: d.baslik, level: d.seviye ?? 1, summary: d.ozet }));

export function getLesson(slug: string): Ders | undefined {
  return dersBul(slug);
}
