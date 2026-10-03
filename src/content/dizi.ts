// Gam ve dizileri sap üzerine yerleştiren yardımcılar.
// Perdeler elle yazılmaz, notaların gerçek yüksekliklerinden hesaplanır; böylece tab ile
// "Müzik Bilgisi" metnindeki nota adları her zaman birbirini tutar.

/** Standart akort, tel 1 (ince Mi) → tel 6 (kalın Mi), MIDI numarası. */
export const OPEN = [64, 59, 55, 50, 45, 40];

const TR = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
const EN = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const pc = (midi: number) => ((midi % 12) + 12) % 12;

/** "La (A)" biçiminde nota adı */
export const noteName = (midi: number) => `${TR[pc(midi)]} (${EN[pc(midi)]})`;

/** Tekrarsız nota adları listesi: "La – Do – Re – Mi – Sol" */
export function noteList(pitches: number[]): string {
  const seen: number[] = [];
  for (const p of pitches) if (!seen.includes(pc(p))) seen.push(pc(p));
  return seen.map((c) => TR[c]).join(" – ");
}

export const SCALE = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  minorPenta: [0, 3, 5, 7, 10],
  majorPenta: [0, 2, 4, 7, 9],
} as const;

/** Kökten başlayarak yukarı doğru `count` adet gam notası (MIDI). */
export function run(root: number, intervals: readonly number[], count: number): number[] {
  return Array.from({ length: count }, (_, i) => root + 12 * Math.floor(i / intervals.length) + intervals[i % intervals.length]);
}

/** Verilen nota yüksekliğinden başlayarak aralıktaki gam notaları (alt ve üst dahil). */
export function between(root: number, intervals: readonly number[], low: number, high: number): number[] {
  const out: number[] = [];
  for (let m = low; m <= high; m++) if (intervals.includes(pc(m - root))) out.push(m);
  return out;
}

export type Pos = { s: number; f: number; m: number };

/** Notaları tel başına sabit sayıda (ör. 3 nota/tel) dağıtır; kalın telden başlar. */
export function perString(pitches: number[], counts: number | number[], startString = 6): Pos[] {
  let s = startString;
  let left = typeof counts === "number" ? counts : counts[0];
  let k = 0;
  return pitches.map((m) => {
    if (left === 0) {
      s--;
      k++;
      left = typeof counts === "number" ? counts : counts[k % counts.length];
    }
    left--;
    const f = m - OPEN[s - 1];
    if (f < 0 || f > 24) throw new Error(`${m} notası ${s}. telde çalınamaz`);
    return { s, f, m };
  });
}

/** Notaları bir pozisyona (perde aralığı) yerleştirir: her nota en kalın uygun tele düşer. */
export function inPosition(pitches: number[], low: number, high: number, startString = 6): Pos[] {
  let s = startString;
  return pitches.map((m) => {
    while (s >= 1 && m - OPEN[s - 1] > high) s--;
    // İnişte (nota bu telde çok pesse) bir kalın tele geri dön
    while (s < 6 && m - OPEN[s - 1] < low) s++;
    const f = m - OPEN[s - 1];
    if (s < 1 || f < low || f > high) throw new Error(`${m} notası ${low}-${high}. perde aralığına sığmıyor`);
    return { s, f, m };
  });
}

export const tab = (p: Pos) => `${p.f}.${p.s}`;
export const tabs = (ps: Pos[]) => ps.map(tab);

/** Çık ve aynı yoldan in (tepe nota bir kez çalınır). */
export const upDown = <T,>(xs: T[]) => [...xs, ...xs.slice(0, -1).reverse()];

/** Sekans: n'li gruplar (1-2-3, 2-3-4, …) */
export function groups<T>(xs: T[], n: number): T[] {
  const out: T[] = [];
  for (let i = 0; i + n <= xs.length; i++) out.push(...xs.slice(i, i + n));
  return out;
}

/** Üçlü aralıklar: 1-3, 2-4, 3-5 … */
export function thirds<T>(xs: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i + 2 < xs.length; i++) out.push(xs[i], xs[i + 2]);
  return out;
}

/**
 * Notaları ölçülere böler. Son ölçü eksik kalırsa sus ile tamamlar.
 * `tuplet` verilirse (ör. 3) notalar ve suslar o tuplet içinde yazılır.
 */
export function measures(duration: string, notes: string[], perBar: number, tuplet?: number): string[] {
  const t = (x: string) => (tuplet ? (x.endsWith("}") ? `${x.slice(0, -1)} tu ${tuplet}}` : `${x}{tu ${tuplet}}`) : x);
  const out: string[] = [];
  for (let i = 0; i < notes.length; i += perBar) {
    const bar = notes.slice(i, i + perBar).map(t);
    while (bar.length < perBar) bar.push(t("r"));
    out.push(`${duration} ${bar.join(" ")}`);
  }
  return out;
}

/** Bir notayı verilen sayıda tekrarlar */
export const times = (note: string, n: number) => Array<string>(n).fill(note);
