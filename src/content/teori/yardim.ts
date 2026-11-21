// Ders verisini üretmek için küçük yardımcılar: harf + arıza yazımı, sap kesitine gam/akor noktaları.
// Göreli içe aktarmalar kullanılır: scripts/teori-dogrula.mjs bu dosyaları Node ile doğrudan okur.
import type { Nokta } from "./tipler.ts";

const HARF = ["C", "D", "E", "F", "G", "A", "B"];
const DOGAL = [0, 2, 4, 5, 7, 9, 11];
/** Standart akort, tel 1 (ince Mi) … tel 6 (kalın Mi), MIDI */
export const ACIK_TEL = [0, 64, 59, 55, 50, 45, 40];
export const ses = (t: number, p: number) => ACIK_TEL[t] + p;
const pc = (m: number) => ((m % 12) + 12) % 12;

export const SIMGE_YARIM: Record<string, number> = {
  "1": 0, b2: 1, "2": 2, "#2": 3, b3: 3, "3": 4, "4": 5, "#4": 6, b5: 6, "5": 7, "#5": 8, b6: 8, "6": 9, bb7: 9, b7: 10, "7": 11,
};

/** "F#" → { h: 3, a: 1 } */
export function ayir(ad: string): { h: number; a: number } {
  const h = HARF.indexOf(ad[0]);
  const ek = ad.slice(1);
  const a = ek === "#" ? 1 : ek === "##" ? 2 : ek === "b" ? -1 : ek === "bb" ? -2 : 0;
  return { h, a };
}
export const sinif = (ad: string) => {
  const { h, a } = ayir(ad);
  return pc(DOGAL[h] + a);
};
const yaz = (h: number, a: number) => HARF[h] + (a === 1 ? "#" : a === 2 ? "##" : a === -1 ? "b" : a === -2 ? "bb" : "");

/** Kökten aralık simgesiyle yazılmış nota: hecele("A", "b3") → "C" */
export function hecele(kok: string, simge: string): string {
  const { h } = ayir(kok);
  const no = Number(simge.replace(/[b#]/g, ""));
  const hh = (h + no - 1) % 7;
  let a = pc(sinif(kok) + SIMGE_YARIM[simge]) - DOGAL[hh];
  if (a > 6) a -= 12;
  if (a < -6) a += 12;
  return yaz(hh, a);
}

/**
 * Perde aralığında (ve verilen tellerde) formüle uyan bütün noktalar.
 * etiket "nota": yazılmış nota adı; "aralik": formüldeki simge. `vurgu`: ayrı renkle gösterilecek simgeler.
 */
export function gamNoktalari(o: { kok: string; formul: string; perde: [number, number]; teller?: number[]; etiket: "nota" | "aralik"; vurgu?: string[] }): Nokta[] {
  const simgeler = o.formul.split(" ");
  const kokPc = sinif(o.kok);
  const harita = new Map(simgeler.map((s) => [pc(kokPc + SIMGE_YARIM[s]), s]));
  const out: Nokta[] = [];
  for (const t of o.teller ?? [6, 5, 4, 3, 2, 1]) {
    for (let p = o.perde[0]; p <= o.perde[1]; p++) {
      const s = harita.get(pc(ses(t, p)));
      if (!s) continue;
      out.push({ t, p, e: o.etiket === "nota" ? hecele(o.kok, s) : s, k: s === "1" ? "kok" : o.vurgu?.includes(s) ? "vurgu" : undefined });
    }
  }
  return out;
}

/** Formülün yarım ton kalıbı: "1 b3 5" → [0, 3, 7] */
export const kalip = (formul: string) => formul.split(" ").map((s) => SIMGE_YARIM[s]);

/** Bir teldeki bütün kromatik notalar (diyezli yazım) */
export function telNotalari(t: number, perde: [number, number], yazim: "diyez" | "bemol" = "diyez"): Nokta[] {
  const D = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const B = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const out: Nokta[] = [];
  for (let p = perde[0]; p <= perde[1]; p++) out.push({ t, p, e: (yazim === "diyez" ? D : B)[pc(ses(t, p))] });
  return out;
}

/** Porte notası (yazılı perde): "C4", "Eb4", "Fn4" (natürel işaretli); d süre (vuruş) */
export function pn(ad: string, d?: number): { h: number; o: number; a?: number; d?: number } {
  const m = /^([A-G])(#|b|n)?(\d)$/.exec(ad);
  if (!m) throw new Error(`porte notası: ${ad}`);
  const n: { h: number; o: number; a?: number; d?: number } = { h: HARF.indexOf(m[1]), o: Number(m[3]) };
  if (m[2]) n.a = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  if (d !== undefined) n.d = d;
  return n;
}

/** Bilimsel adlı notalar: "A2" … "A3" kromatik */
export function kromatik(bas: string, adet: number): string[] {
  const D = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const m = /^([A-G]#?)(\d)$/.exec(bas)!;
  const ilk = 12 * (Number(m[2]) + 1) + D.indexOf(m[1]);
  return Array.from({ length: adet }, (_, i) => `${D[pc(ilk + i)]}${Math.floor((ilk + i) / 12) - 1}`);
}
