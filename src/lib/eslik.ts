// Quick Study ve kompozisyon dersleri için akor çözümü ve eşlik (Müfredat Spec v2.2 §7.3b, İP6d).
// Dersin `chords` alanından (ölçü başına akor) bas, akor (elektrik piyano sesi) ve davul track'leri kurulur; melodi
// (dersin tabı ya da öğrencinin yazdığı) birinci track'tir. Track biçimi Doğaçlama Çal eşlikleriyle aynıdır (dogaclama.ts).
import { BASS, DRUMS, song } from "../content/dogaclama.ts";

// ── Akor adı → kök ve sesler ─────────────────────────────────────────────────
const HARF: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** Akor türü → kökten yarım ses aralıkları (gerilimler 12'nin üstünde) */
const TUR: Record<string, number[]> = {
  "": [0, 4, 7], m: [0, 3, 7], "5": [0, 7], "6": [0, 4, 7, 9], m6: [0, 3, 7, 9], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10], dim: [0, 3, 6], dim7: [0, 3, 6, 9], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7], "7sus4": [0, 5, 7, 10],
  add9: [0, 4, 7, 14], "9": [0, 4, 7, 10, 14], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14], "13": [0, 4, 7, 10, 21],
};
export const pc = (m: number) => ((m % 12) + 12) % 12;

export type Akor = { ad: string; kok: number; iv: number[]; bas: number; sesler: number[] };

/** "F#m7b5", "B♭maj7", "G/F" → kök, aralıklar, bas ve ses sınıfları; okunamazsa null */
export function akorCoz(ad: string): Akor | null {
  const m = ad.trim().replace(/♭/g, "b").replace(/♯/g, "#").match(/^([A-G])([#b]?)(.*?)(?:\/([A-G])([#b]?))?$/);
  if (!m || !(m[3] in TUR)) return null;
  const ariza = (x: string) => (x === "#" ? 1 : x === "b" ? -1 : 0);
  const kok = pc(HARF[m[1]] + ariza(m[2]));
  const iv = TUR[m[3]];
  return { ad, kok, iv, bas: m[4] ? pc(HARF[m[4]] + ariza(m[5])) : kok, sesler: [...new Set(iv.map((x) => pc(kok + x)))] };
}

/** Bir ölçünün akorları: "C D" → iki akor, ölçüyü yarı yarıya paylaşır */
export const olcuAkorlari = (s: string) => s.trim().split(/\s+/).map(akorCoz);

// Sesin akora göre yazımı ve derecesi (F üstünde Si♭, A7 üstünde Do#): ../lib/yazim.ts › akoraGore

// ── Ölçü birimi, güçlü vuruşlar ──────────────────────────────────────────────
export type OlcuBirimi = [number, number];
/** Ölçü içindeki gruplar (sekizlik sayısı): 4/4 → 4+4, 5/4 → 6+4 (3+2 dörtlük), 7/8 → 2+2+3, 6/8 → 3+3 */
export function gruplar([n, d]: OlcuBirimi): number[] {
  const sekiz = (n * 8) / d;
  if (n === 4 && d === 4) return [4, 4];
  if (n === 5 && d === 4) return [6, 4];
  if (n === 7 && d === 8) return [2, 2, 3];
  if (n === 6 && d === 8) return [3, 3];
  if (n === 12 && d === 8) return [3, 3, 3, 3];
  return [sekiz];
}
/** Güçlü vuruşlar (ölçü başından dörtlük cinsinden): grupların başları */
export function gucluVuruslar(ob: OlcuBirimi): number[] {
  let t = 0;
  return gruplar(ob).map((g) => {
    const x = t;
    t += g / 2;
    return x;
  });
}
/** Dersin tabından ilk ölçü birimi (\ts yoksa 4/4) */
export function texOlcuBirimi(tex: string): OlcuBirimi {
  const m = tex.match(/\\ts (\d+) (\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [4, 4];
}
/** "\tempo 80 . <gövde>" → gövde */
export const texGovde = (tex: string) => tex.replace(/^\s*\\tempo \d+\s*\.\s*/, "");

// ── Eşlik track'leri ─────────────────────────────────────────────────────────
const K = "KickHit";
const SN = "SnareHit";
const H = "HiHatClosed";
const D = (...xs: string[]) => (xs.length === 1 ? xs[0] : `(${xs.join(" ")})`);
const sure = (sekiz: number) => ({ 1: ":8 ", 2: ":4 ", 3: ":4 ", 4: ":2 ", 6: ":2 ", 8: ":1 " })[sekiz] ?? ":8 ";
const nokta = (sekiz: number) => (sekiz === 3 || sekiz === 6 ? "{d}" : "");

/** Davul: sekizlik hi-hat; grupların başında kick, ikinci ve sonraki grupların başında trampet (funk: 16'lık) */
function davul(ob: OlcuBirimi, funk: boolean): string {
  if (funk && ob[0] === 4 && ob[1] === 4)
    return `:16 ${[D(K, H), H, H, D(K, H), D(SN, H), H, D(K, H), H, H, H, D(K, H), H, D(SN, H), H, H, H].join(" ")}`;
  const gs = gruplar(ob);
  const out: string[] = [];
  // 4/4 rock: K H S H K K S H
  if (ob[0] === 4 && ob[1] === 4) return `:8 ${[D(K, H), H, D(SN, H), H, D(K, H), D(K, H), D(SN, H), H].join(" ")}`;
  gs.forEach((g, gi) => {
    for (let i = 0; i < g; i++) {
      if (i === 0) out.push(gi % 2 === 0 ? D(K, H) : D(SN, H));
      else if (g === 4 && i === 2) out.push(gi % 2 === 0 ? D(SN, H) : D(K, H));
      else out.push(H);
    }
  });
  return `:8 ${out.join(" ")}`;
}

/** 4 telli bas (tel 4 = Mi1): verilen ses sınıfı için en pes rahat konum */
const BAS_ACIK = [43, 38, 33, 28]; // tel 1 (Sol) … tel 4 (Mi)
function basKonum(p: number): string {
  for (let s = 4; s >= 1; s--) {
    const f = pc(p - BAS_ACIK[s - 1]);
    if (f <= 4 || s === 1) return `${f}.${s}`;
  }
  return `${pc(p - 28)}.4`;
}

/** Akor (comp): 4–1. tellerde, 2–10. perdeler arasında kılavuz sesleri (3 ve 7) içeren, öncekine yakın bir diziliş */
const TEL = [64, 59, 55, 50]; // tel 1…4
function dizilis(a: Akor, onceki: number[] | null): { notalar: string[]; sesler: number[] } {
  const ucuncu = a.iv.find((x) => [3, 4, 2, 5].includes(x));
  const yedi = a.iv.find((x) => [10, 11, 9].includes(x));
  const gerek = [ucuncu, yedi].filter((x): x is number => x !== undefined).map((x) => pc(a.kok + x));
  const istenen = new Set(a.sesler);
  let en: { puan: number; notalar: string[]; sesler: number[] } | null = null;
  for (let p = 2; p <= 9; p++) {
    const secenek = [1, 2, 3, 4].map((s) => {
      const fs: (number | null)[] = [null];
      for (let f = p; f <= p + 3; f++) if (istenen.has(pc(TEL[s - 1] + f))) fs.push(f);
      return fs;
    });
    const gez = (i: number, sec: (number | null)[]) => {
      if (i === 4) {
        const ns = sec.map((f, k) => (f === null ? null : { s: k + 1, m: TEL[k] + f, f })).filter((x): x is { s: number; m: number; f: number } => !!x);
        if (ns.length < 3) return;
        const pcs = ns.map((n) => pc(n.m));
        let puan = 0;
        for (const g of gerek) if (pcs.includes(g)) puan += 10;
        if (pcs.includes(a.kok)) puan += 3;
        puan -= (pcs.length - new Set(pcs).size) * 4;
        const ort = ns.reduce((t, n) => t + n.m, 0) / ns.length;
        const hedefOrt = onceki?.length ? onceki.reduce((t, m) => t + m, 0) / onceki.length : 60;
        puan -= Math.abs(ort - hedefOrt) / 2;
        if (!en || puan > en.puan) en = { puan, notalar: ns.map((n) => `${n.f}.${n.s}`), sesler: ns.map((n) => n.m) };
        return;
      }
      for (const f of secenek[i]) gez(i + 1, [...sec, f]);
    };
    gez(0, []);
  }
  return en ?? { notalar: [`${pc(a.kok - 50)}.4`], sesler: [] };
}

export type EslikSecenek = {
  title?: string;
  bpm: number;
  /** Ölçü başına akor ("Am", "C D") */
  chords: string[];
  /** Birinci track'in (melodi) gövdesi, alphaTex; verilmezse susan bir track */
  melodi?: string;
  ob?: OlcuBirimi;
  /** Swing/shuffle (\tf triplet-8th) */
  swing?: boolean;
  /** 16'lık davul (funk) */
  funk?: boolean;
};

/** Melodi + akor + bas + davul: çok track'li alphaTex. Ölçü sayısı akor sayısıdır. */
export function eslikTex({ title = "Eşlik", bpm, chords, melodi, ob = [4, 4], swing = false, funk = false }: EslikSecenek): string {
  const gs = gruplar(ob);
  const bas = `\\ts ${ob[0]} ${ob[1]} ${swing ? "\\tf triplet-8th " : ""}`;
  let onceki: number[] | null = null;
  const comp: string[] = [];
  const basOlculeri: string[] = [];
  chords.forEach((olcu) => {
    const aa = olcuAkorlari(olcu);
    const akorAt = (gi: number) => aa[Math.min(aa.length - 1, Math.floor((gi * aa.length) / gs.length))] ?? aa[0];
    const c: string[] = [];
    const b: string[] = [];
    gs.forEach((g, gi) => {
      const a = akorAt(gi);
      if (!a) {
        c.push(`${sure(g)}r${nokta(g)}`);
        b.push(`${sure(g)}r${nokta(g)}`);
        return;
      }
      const d = dizilis(a, onceki);
      onceki = d.sesler;
      c.push(`${sure(g)}(${d.notalar.join(" ")})${nokta(g)}`);
      // Bas: grubun başında kök; aynı akor sürüyorsa ikinci grupta 5'li
      const ayni = gi > 0 && akorAt(gi - 1) === a;
      b.push(`${sure(g)}${basKonum(ayni ? pc(a.kok + (a.iv.find((x) => x === 7 || x === 6 || x === 8) ?? 0)) : a.bas)}${nokta(g)}`);
    });
    comp.push(c.join(" "));
    basOlculeri.push(b.join(" "));
  });
  const ilk = (bars: string[]) => bars.map((x, i) => (i === 0 ? bas + x : x));
  const sus = chords.map(() => gs.map((g) => `${sure(g)}r${nokta(g)}`).join(" "));
  return song(title, bpm, [
    { name: "Gitar", instrument: "27", staff: "score tabs", bars: melodi ? [melodi] : ilk(sus) },
    { name: "Akor", instrument: "4", staff: "tabs", extra: "\\tuning E4 B3 G3 D3 A2 E2", bars: ilk(comp) },
    { ...BASS, bars: ilk(basOlculeri) },
    { ...DRUMS, bars: ilk(chords.map(() => davul(ob, funk))) },
  ]);
}

/** Ders tabından eşlikli parça: melodi dersin tabı, swing/funk tabdan anlaşılır */
export function dersEslik(tex: string, chords: string[], title?: string): string {
  const govde = texGovde(tex);
  const bpm = Number(tex.match(/\\tempo (\d+)/)?.[1] ?? 80);
  return eslikTex({ title, bpm, chords, melodi: govde, ob: texOlcuBirimi(tex), swing: /\\tf triplet-8th/.test(tex), funk: /:16/.test(tex) && !/\\tf/.test(tex) });
}
