// Kurslarda ortak kullanılan gam pozisyonları (La minör ağırlıklı).
import { OPEN, SCALE, between, inPosition, noteList, pc, perString, run } from "../dizi.ts";

export const A2 = 45;
export const G2 = 43;
export const E2 = 40;

/** La minör pentatonik kutuları */
export const pentaBox1 = inPosition(between(A2, SCALE.minorPenta, 45, 72), 5, 8);
export const pentaBox2 = inPosition(between(A2, SCALE.minorPenta, 48, 74), 7, 10);
export const pentaBox5 = inPosition(between(A2, SCALE.minorPenta, 43, 69), 2, 5);
/** La minör pentatonik, tel başına 3 nota (çapraz) */
export const penta3 = perString(between(A2, SCALE.minorPenta, 45, 86), 3);

/** Tel başına 3 nota diziler */
export const gMajor3 = perString(run(G2, SCALE.major, 18), 3);
export const aMinor3 = perString(run(A2, SCALE.minor, 18), 3);
export const aDorian3 = perString(run(A2, SCALE.dorian, 18), 3);
export const aHarm3 = perString(run(A2, SCALE.harmonicMinor, 18), 3);
export const eMinor3 = perString(run(52, SCALE.minor, 18), 3, 6);
/** Tel başına 4 nota, pozisyon kayarak */
export const aMinor4 = perString(run(A2, SCALE.minor, 24), 4);

// ── Akor sözlüğü (pesten tize; "x" çalınmayan tel yazılmaz) ──────────────────
export const AKOR: Record<string, string> = {
  Em: "0.6 2.5 2.4 0.3 0.2 0.1", Am: "0.5 2.4 2.3 1.2 0.1", E: "0.6 2.5 2.4 1.3 0.2 0.1", A: "0.5 2.4 2.3 2.2 0.1",
  D: "0.4 2.3 3.2 2.1", Dm: "0.4 2.3 3.2 1.1", C: "3.5 2.4 0.3 1.2 0.1", G: "3.6 2.5 0.4 0.3 0.2 3.1",
  F: "1.6 3.5 3.4 2.3 1.2 1.1", Bm: "2.5 4.4 4.3 3.2 2.1",
  "G (barre)": "3.6 5.5 5.4 4.3 3.2 3.1", "A (barre)": "5.6 7.5 7.4 6.3 5.2 5.1", "Am (barre)": "5.6 7.5 7.4 5.3 5.2 5.1",
  "Gm (barre)": "3.6 5.5 5.4 3.3 3.2 3.1", "C (barre)": "3.5 5.4 5.3 5.2 3.1", "D (barre)": "5.5 7.4 7.3 7.2 5.1",
  "Cm (barre)": "3.5 5.4 5.3 4.2 3.1", "Dm (barre)": "5.5 7.4 7.3 6.2 5.1",
  E7: "0.6 2.5 0.4 1.3 0.2 0.1", A7: "0.5 2.4 0.3 2.2 0.1", D7: "0.4 2.3 1.2 2.1", G7: "3.6 2.5 0.4 0.3 0.2 1.1",
  B7: "2.5 1.4 2.3 0.2 2.1", C7: "3.5 2.4 3.3 1.2 0.1",
  Cmaj7: "3.5 2.4 0.3 0.2 0.1", Fmaj7: "3.4 2.3 1.2 0.1", Am7: "0.5 2.4 0.3 1.2 0.1", Em7: "0.6 2.5 0.4 0.3 0.2 0.1",
  Dm7: "0.4 2.3 1.2 1.1", E9: "0.6 7.5 6.4 7.3 7.2",
  Dsus2: "0.4 2.3 3.2 0.1", Dsus4: "0.4 2.3 3.2 3.1", Asus2: "0.5 2.4 2.3 0.2 0.1", Asus4: "0.5 2.4 2.3 3.2 0.1",
  Cadd9: "3.5 2.4 0.3 3.2 3.1", "G5/D": "3.6 2.5 0.4 0.3 3.2 3.1",
  "C/G": "3.6 3.5 2.4 0.3 1.2 0.1", "D/F#": "2.6 0.5 0.4 2.3 3.2 2.1", "G/B": "2.5 0.4 0.3 3.2 3.1", "Am/G": "3.6 0.5 2.4 2.3 1.2 0.1",
  "Am/F#": "2.6 0.5 2.4 2.3 1.2 0.1", "Fmaj7/E": "0.6 3.4 2.3 1.2 0.1",
  "Dm7 (funk)": "5.5 7.4 5.3 6.2", "G7 (funk)": "3.6 5.5 3.4 4.3",
};

/** Akorun kökü: adın baş harfi (ve #/b) */
const ROOT_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Akorun notaları kök – üçlü – beşli … sırasıyla ("Do – Mi – Sol") */
export function akorNotalari(name: string): string {
  const ms = AKOR[name].split(" ").map((n) => {
    const [f, s] = n.split(".").map(Number);
    return OPEN[s - 1] + f;
  });
  const r = ROOT_PC[name[0]] + (name[1] === "#" ? 1 : 0);
  return noteList([...ms].sort((a, b) => pc(a - r) - pc(b - r)));
}
