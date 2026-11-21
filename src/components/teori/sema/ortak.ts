// Şema bileşenlerinin ortak yardımcıları: ekranda ♭ ve ♯ işaretli yazım, akort.

export const ACIK = [0, 64, 59, 55, 50, 45, 40];
export const TEL_HARF = ["", "E", "B", "G", "D", "A", "E"];
const HARF = ["C", "D", "E", "F", "G", "A", "B"];
const DOGAL = [0, 2, 4, 5, 7, 9, 11];
export const pc = (m: number) => ((m % 12) + 12) % 12;

/** "Bb" → "B♭", "F#" → "F♯"; aralık simgesi "b3" → "♭3" */
export function goster(s: string): string {
  return s
    .replace(/^([A-G])bb/, "$1𝄫")
    .replace(/^([A-G])b/, "$1♭")
    .replace(/^([A-G])##/, "$1𝄪")
    .replace(/^([A-G])#/, "$1♯")
    .replace(/^bb(\d)/, "𝄫$1")
    .replace(/^b(\d)/, "♭$1")
    .replace(/^#(\d)/, "♯$1");
}

/** Nota adının perde sınıfı ("Eb" → 3); geçersizse null */
export function notaSinifi(ad: string): number | null {
  const m = /^([A-G])(#{1,2}|b{1,2})?/.exec(ad);
  if (!m) return null;
  const a = m[2] ? (m[2][0] === "#" ? m[2].length : -m[2].length) : 0;
  return pc(DOGAL[HARF.indexOf(m[1])] + a);
}

/** Bilimsel ad → MIDI: "C4" = 60, "Bb3" = 58 */
export function midi(ad: string): number {
  const m = /^([A-G])(#{1,2}|b{1,2})?(-?\d)$/.exec(ad);
  if (!m) throw new Error(`nota adı: ${ad}`);
  const a = m[2] ? (m[2][0] === "#" ? m[2].length : -m[2].length) : 0;
  return 12 * (Number(m[3]) + 1) + DOGAL[HARF.indexOf(m[1])] + a;
}

/** Akor sembolü: "Bbm7b5" → "B♭m7♭5", "F#°" → "F♯°", "C/E" olduğu gibi */
export function akorAdi(ad: string): string {
  return ad
    .split("/")
    .map((p) => goster(p).replace(/b(\d)/g, "♭$1").replace(/#(\d)/g, "♯$1"))
    .join("/");
}
