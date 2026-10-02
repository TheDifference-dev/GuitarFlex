// alphaTex yazımını kolaylaştıran küçük yardımcılar.
// Nota yazımı: `perde.tel` — tel 1 = ince Mi (e), tel 6 = kalın Mi (E).

export type Stroke = "sd" | "su";

export function tex(tempo: number, bars: string[]): string {
  return `\\tempo ${tempo} . ${bars.join(" | ")}`;
}

/** Bir notaya ya da akora efekt ekler; varsa mevcut efekt bloğunun içine yazar. */
export function fx(note: string, effect: string): string {
  if (note.startsWith("(")) {
    const close = note.lastIndexOf(")");
    const head = note.slice(0, close + 1);
    const tail = note.slice(close + 1);
    return tail ? `${head}${tail.slice(0, -1)} ${effect}}` : `${head}{${effect}}`;
  }
  return note.endsWith("}") ? `${note.slice(0, -1)} ${effect}}` : `${note}{${effect}}`;
}

/** Notalara sırayla pena yönü işareti ekler (sd = aşağı, su = yukarı). */
export function strokes(notes: string[], pattern: Stroke[] = ["sd", "su"]): string[] {
  return notes.map((n, i) => fx(n, pattern[i % pattern.length]));
}

export function triplets(notes: string[]): string[] {
  return notes.map((n) => fx(n, "tu 3"));
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Notaları eşit uzunlukta ölçülere böler, her ölçünün başına süre işaretini koyar. */
export function bars(duration: string, notes: string[], perBar: number): string[] {
  return chunk(notes, perBar).map((b) => `${duration} ${b.join(" ")}`);
}

export function repeat<T>(items: T[], times: number): T[] {
  return Array.from({ length: times }, () => items).flat();
}

export function onString(string: number, frets: number[]): string[] {
  return frets.map((f) => `${f}.${string}`);
}

/** Her tele aynı perde kalıbını uygular (teller verilen sırayla). */
export function acrossStrings(strings: number[], frets: number[] | ((i: number) => number[])): string[] {
  return strings.flatMap((s, i) => onString(s, typeof frets === "function" ? frets(i) : frets));
}

/** Notalar arasına legato bağı ekler: her nota bir sonrakine hammer-on / pull-off yapar. */
export function legato(notes: string[]): string[] {
  return notes.map((n, i) => (i < notes.length - 1 ? fx(n, "h") : n));
}

export const UP: number[] = [6, 5, 4, 3, 2, 1];
export const DOWN: number[] = [1, 2, 3, 4, 5, 6];

/** La minör pentatonik, 1. kutu (5. perde), kalın telden inceye. */
export const AM_PENTA_BOX1 = [
  "5.6", "8.6", "5.5", "7.5", "5.4", "7.4", "5.3", "7.3", "5.2", "8.2", "5.1", "8.1",
];

/** La doğal minör, tel başına 3 nota (5. pozisyon). */
export const AM_3NPS = [
  "5.6", "7.6", "8.6", "5.5", "7.5", "8.5", "5.4", "7.4", "9.4",
  "5.3", "7.3", "9.3", "6.2", "8.2", "10.2", "7.1", "8.1", "10.1",
];

export const CHORDS = {
  Em: "(0.6 2.5 2.4 0.3 0.2 0.1)",
  E: "(0.6 2.5 2.4 1.3 0.2 0.1)",
  Am: "(0.5 2.4 2.3 1.2 0.1)",
  A: "(0.5 2.4 2.3 2.2 0.1)",
  C: "(3.5 2.4 0.3 1.2 0.1)",
  G: "(3.6 2.5 0.4 0.3 0.2 3.1)",
  D: "(0.4 2.3 3.2 2.1)",
  Dm: "(0.4 2.3 3.2 1.1)",
  F: "(1.6 3.5 3.4 2.3 1.2 1.1)",
  Bm: "(2.5 4.4 4.3 3.2 2.1)",
  E9: "(7.5 6.4 7.3 7.2)",
  MUTE4: "(x.5 x.4 x.3 x.2)",
  MUTE6: "(x.6 x.5 x.4 x.3 x.2 x.1)",
} as const;

export const POWER = {
  E5: "(0.6 2.5)",
  F5: "(1.6 3.5)",
  G5: "(3.6 5.5)",
  A5: "(5.6 7.5)",
  C5: "(3.5 5.4)",
  D5: "(5.5 7.4)",
} as const;

/** Akordun her notasına palm mute ekler. */
export function pm(chord: string): string {
  return chord.replace(/(\d+\.\d)(?=[\s)])/g, "$1{pm}");
}
