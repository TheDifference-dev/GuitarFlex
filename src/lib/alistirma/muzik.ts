// Alıştırmalarda kullanılan nota adları, aralıklar, akor ve gam türleri, akor şekilleri.

/** Teller 1 (ince Mi) … 6 (kalın Mi), MIDI */
export const ACIK = [0, 64, 59, 55, 50, 45, 40];
export const pc = (m: number) => ((m % 12) + 12) % 12;
export const perdeSes = (s: number, f: number) => ACIK[s] + f;

const TR_D = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
const TR_B = ["Do", "Re♭", "Re", "Mi♭", "Mi", "Fa", "Sol♭", "Sol", "La♭", "La", "Si♭", "Si"];
const EN_D = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const EN_B = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
export const DOGAL = [0, 2, 4, 5, 7, 9, 11];
export const dogalMi = (p: number) => DOGAL.includes(pc(p));

/** Nota adı: "Mi (E)", arızalılarda yazıma göre "Fa# (F#)", "Sol♭ (G♭)" ya da ikisi birden */
export function notaAdi(p: number, yazim?: "diyez" | "bemol"): string {
  const i = pc(p);
  if (dogalMi(i) || yazim === "diyez") return `${TR_D[i]} (${EN_D[i]})`;
  if (yazim === "bemol") return `${TR_B[i]} (${EN_B[i]})`;
  return `${TR_D[i]} / ${TR_B[i]}`;
}
export const kisaAd = (p: number) => TR_D[pc(p)];

// Ton adlarında yaygın yazım: majörde La♭, Mi♭, Si♭, Re♭; minörde Do#, Sol#, Mi♭, Si♭
const MAJOR_TON = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => ([1, 3, 8, 10].includes(i) ? "bemol" : "diyez") as "diyez" | "bemol");
const MINOR_TON = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => ([3, 10].includes(i) ? "bemol" : "diyez") as "diyez" | "bemol");
/** Tonun kök adı: "La♭ (A♭)" gibi tek yazım */
export const tonKoku = (p: number, minor = false) => notaAdi(p, (minor ? MINOR_TON : MAJOR_TON)[pc(p)]);

export const TEL_ADI: Record<number, string> = { 1: "1. tel · ince Mi (E)", 2: "2. tel · Si (B)", 3: "3. tel · Sol (G)", 4: "4. tel · Re (D)", 5: "5. tel · La (A)", 6: "6. tel · kalın Mi (E)" };

export const ARALIK_ADI: Record<number, string> = {
  0: "Aynı ses (1'li)", 1: "Küçük 2'li (m2)", 2: "Büyük 2'li (M2)", 3: "Küçük 3'lü (m3)", 4: "Büyük 3'lü (M3)", 5: "Tam 4'lü (P4)",
  6: "Artık 4'lü / eksik 5'li (tritone)", 7: "Tam 5'li (P5)", 8: "Küçük 6'lı (m6)", 9: "Büyük 6'lı (M6)", 10: "Küçük 7'li (m7)",
  11: "Büyük 7'li (M7)", 12: "Oktav (P8)",
};

export const AKOR_TURU: Record<string, { ad: string; iv: number[] }> = {
  maj: { ad: "Majör", iv: [0, 4, 7] },
  min: { ad: "Minör", iv: [0, 3, 7] },
  dim: { ad: "Eksik (dim)", iv: [0, 3, 6] },
  aug: { ad: "Artık (aug)", iv: [0, 4, 8] },
  sus2: { ad: "Sus2", iv: [0, 2, 7] },
  sus4: { ad: "Sus4", iv: [0, 5, 7] },
  maj7: { ad: "Majör 7 (maj7)", iv: [0, 4, 7, 11] },
  "7": { ad: "Dominant 7 (7)", iv: [0, 4, 7, 10] },
  m7: { ad: "Minör 7 (m7)", iv: [0, 3, 7, 10] },
  m7b5: { ad: "Yarım eksik (m7♭5)", iv: [0, 3, 6, 10] },
  dim7: { ad: "Eksik 7 (dim7)", iv: [0, 3, 6, 9] },
  mMaj7: { ad: "Minör-majör 7 (mMaj7)", iv: [0, 3, 7, 11] },
  "6": { ad: "Majör 6 (6)", iv: [0, 4, 7, 9] },
  m6: { ad: "Minör 6 (m6)", iv: [0, 3, 7, 9] },
};

export const GAM: Record<string, { ad: string; iv: number[] }> = {
  major: { ad: "Majör (Ionian)", iv: [0, 2, 4, 5, 7, 9, 11] },
  minor: { ad: "Doğal minör (Aeolian)", iv: [0, 2, 3, 5, 7, 8, 10] },
  dorian: { ad: "Dorian", iv: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { ad: "Phrygian", iv: [0, 1, 3, 5, 7, 8, 10] },
  lydian: { ad: "Lydian", iv: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian: { ad: "Mixolydian", iv: [0, 2, 4, 5, 7, 9, 10] },
  locrian: { ad: "Locrian", iv: [0, 1, 3, 5, 6, 8, 10] },
  "major-penta": { ad: "Majör pentatonik", iv: [0, 2, 4, 7, 9] },
  "minor-penta": { ad: "Minör pentatonik", iv: [0, 3, 5, 7, 10] },
  blues: { ad: "Blues gamı", iv: [0, 3, 5, 6, 7, 10] },
};

export const MOD_IV: Record<string, number[]> = {
  Ionian: GAM.major.iv, Dorian: GAM.dorian.iv, Phrygian: GAM.phrygian.iv, Lydian: GAM.lydian.iv,
  Mixolydian: GAM.mixolydian.iv, Aeolian: GAM.minor.iv, Locrian: GAM.locrian.iv,
};

/** Standart açık akor şekilleri: kalın Mi'den ince Mi'ye perdeler (x = çalma) */
export const AKOR_SEKLI: Record<string, string> = {
  A: "x 0 2 2 2 0", Am: "x 0 2 2 1 0", C: "x 3 2 0 1 0", D: "x x 0 2 3 2", Dm: "x x 0 2 3 1",
  E: "0 2 2 1 0 0", Em: "0 2 2 0 0 0", G: "3 2 0 0 0 3", F: "1 3 3 2 1 1", A7: "x 0 2 0 2 0",
  E7: "0 2 0 1 0 0", D7: "x x 0 2 1 2", B7: "x 2 1 2 0 2", Cmaj7: "x 3 2 0 0 0", Am7: "x 0 2 0 1 0", Em7: "0 2 0 0 0 0",
};

/** Roma rakamı → kökün tona uzaklığı ve akor türü: "IV" majör, "vi" minör, "bVII" majör, "vii°" eksik */
export function romen(r: string): { kok: number; iv: number[] } {
  const flat = r.startsWith("b");
  const core = r.replace(/^b/, "").replace("°", "");
  const deg = ["I", "II", "III", "IV", "V", "VI", "VII"].indexOf(core.toUpperCase());
  const kok = [0, 2, 4, 5, 7, 9, 11][deg] - (flat ? 1 : 0);
  const iv = r.includes("°") ? [0, 3, 6] : core === core.toUpperCase() ? [0, 4, 7] : [0, 3, 7];
  return { kok, iv };
}

export const rnd = (n: number) => Math.floor(Math.random() * n);
export const sec = <T,>(xs: readonly T[]): T => xs[rnd(xs.length)];
export function karistir<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** Doğru cevap + havuzdan farklı `n-1` seçenek, karışık */
export function secenekler<T>(dogru: T, havuz: T[], n = 4, eq: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  const others = karistir(havuz.filter((x) => !eq(x, dogru)));
  const out: T[] = [dogru];
  for (const o of others) if (out.length < n && !out.some((x) => eq(x, o))) out.push(o);
  return karistir(out);
}

/* ---------------- Doğru yazım (harf + arıza): Fa majörde Si♭, La# değil ---------------- */

export type Ad = { h: number; a: number };
const HARF_TR = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const HARF_EN = ["C", "D", "E", "F", "G", "A", "B"];
const ARIZA: Record<number, string> = { [-2]: "♭♭", [-1]: "♭", 0: "", 1: "#", 2: "𝄪" };

export const adSes = (n: Ad) => pc(DOGAL[n.h] + n.a);
export const adTr = (n: Ad) => HARF_TR[n.h] + ARIZA[n.a];
export const adEn = (n: Ad) => HARF_EN[n.h] + ARIZA[n.a];
/** "Si♭ (B♭)" */
export const adYaz = (n: Ad) => `${adTr(n)} (${adEn(n)})`;
export const ciftArizaMi = (ns: Ad[]) => ns.some((n) => Math.abs(n.a) > 1);

/** `n`den `harf` harf ve `yarim` yarım ses yukarıdaki nota (harf adı korunur, arıza hesaplanır) */
export function yukari(n: Ad, harf: number, yarim: number): Ad {
  const h = (n.h + harf) % 7;
  let a = adSes(n) + yarim - DOGAL[h];
  a = ((a % 12) + 12) % 12;
  if (a > 6) a -= 12;
  return { h, a };
}

/** Kökten aralıklarla (yarım ses) ve harf adımlarıyla yazılmış notalar */
export const yazDizi = (kok: Ad, iv: readonly number[], harfler: readonly number[]) => iv.map((x, i) => yukari(kok, harfler[i], x));
export const GAM_HARF = [0, 1, 2, 3, 4, 5, 6];
export const UCLU_HARF = [0, 2, 4];
export const DORTLU_HARF = [0, 2, 4, 6];

/** Diyez/bemol sayısı 0–6 olan majör tonlar */
export const MAJOR_TONLAR: Ad[] = [
  { h: 0, a: 0 }, { h: 4, a: 0 }, { h: 1, a: 0 }, { h: 5, a: 0 }, { h: 2, a: 0 }, { h: 6, a: 0 }, { h: 3, a: 1 },
  { h: 3, a: 0 }, { h: 6, a: -1 }, { h: 2, a: -1 }, { h: 5, a: -1 }, { h: 1, a: -1 }, { h: 4, a: -1 },
];
