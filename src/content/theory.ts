// Müzik Teorisi dersleri: içerik src/content/teori/ (hepsi.ts: bütün dersler, mufredat.ts: başlangıçtan ileriye sıra).
import { TUM_DERSLER, dersGetir } from "./teori/hepsi.ts";
import type { Ders } from "./teori/tipler.ts";

export type TheoryLesson = { slug: string; title: string; level: number; summary: string };

/** Ders listesi (statik yollar için) */
export const THEORY: TheoryLesson[] = TUM_DERSLER.map((d) => ({ slug: d.slug, title: d.baslik, level: d.seviye ?? 1, summary: d.ozet }));

export function getLesson(slug: string): Ders | undefined {
  return dersGetir(slug);
}
