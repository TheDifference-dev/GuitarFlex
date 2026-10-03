// Kurslarda ortak kullanılan gam pozisyonları (La minör ağırlıklı).
import { SCALE, between, inPosition, perString, run } from "../dizi.ts";

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
