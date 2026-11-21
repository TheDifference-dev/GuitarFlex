// Nota adlarının bağlama göre yazımı (İP6d). Aynı perde yüksekliği akora ya da tona göre başka harfle yazılır:
// F akoru üzerinde Si♭ (La# değil), A7 üzerinde Do# (Re♭ değil), Gm7 üzerinde Si♭, E7 üzerinde Sol#.
// Kompozisyon geri bildirimi akora göre (akoraGore), transkripsiyon geri bildirimi dersin notasına ve donanımına göre
// (tonaGore) yazar. Türkçe adlar uygulamanın geri kalanıyla aynı biçimde: "Do#", "Si♭"; harf adı ayrıca "C#", "B♭".

const HARFLER = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Harf = (typeof HARFLER)[number];
const HARF_PC: Record<Harf, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const HARF_TR: Record<Harf, string> = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };
const ARIZA_TR: Record<number, string> = { [-2]: "𝄫", [-1]: "♭", 0: "", 1: "#", 2: "𝄪" };
const ARIZA_EN: Record<number, string> = { [-2]: "𝄫", [-1]: "♭", 0: "", 1: "#", 2: "𝄪" };
const pc = (m: number) => ((m % 12) + 12) % 12;

export type Yazim = { harf: Harf; ariza: number; tr: string; en: string };

/** Verilen harfle yazım: arıza, harfin doğal sesinden yarım ses farkıdır (en çok iki); daha uzaksa null */
export function harfle(harf: Harf, midi: number): Yazim | null {
  let f = pc(midi - HARF_PC[harf]);
  if (f > 6) f -= 12;
  if (Math.abs(f) > 2) return null;
  return { harf, ariza: f, tr: HARF_TR[harf] + ARIZA_TR[f], en: harf + ARIZA_EN[f] };
}

/** Bağlam yokken: doğal sesler doğal, arızalılar diyezle (ya da `bemol` ile) */
export function yalinYazim(midi: number, bemol = false): Yazim {
  const p = pc(midi);
  const dogal = HARFLER.find((h) => HARF_PC[h] === p);
  if (dogal) return harfle(dogal, midi)!;
  const h = HARFLER.find((x) => HARF_PC[x] === (bemol ? pc(p + 1) : pc(p - 1)))!;
  return harfle(h, midi)!;
}

// ── Akora göre ───────────────────────────────────────────────────────────────
/** Akorun adı (kök harfi ilk harftir: "B♭maj7", "Bbmaj7", "F#m7b5"), kök ses sınıfı ve kökten aralıkları */
export type AkorBilgi = { ad: string; kok: number; iv: number[] };

/** Kökten yarım ses farkı → kök harfinden kaç harf ileride yazılır ve akora göre derece adı */
function aralik(d: number, iv: number[]): [number, string] {
  const ucluYok = !iv.includes(3) && !iv.includes(4);
  switch (d) {
    case 0:
      return [0, "1"];
    case 1:
      return [1, "♭9"];
    case 2:
      return [1, ucluYok && iv.includes(2) ? "2" : "9"];
    case 3:
      // Minör 3'lü; majör ve dominant akorda da ♭3 yazılır (blues sesi: A7 üstünde Do, Mi♭ değil Do)
      return [2, "♭3"];
    case 4:
      return [2, "3"];
    case 5:
      return [3, ucluYok && iv.includes(5) ? "4" : "11"];
    case 6:
      // Akorda ♭5 varsa 5. harf (Em7♭5'te Si♭), yoksa ♯11 (4. harf: C üstünde Fa#)
      return iv.includes(6) ? [4, "♭5"] : [3, "♯11"];
    case 7:
      return [4, "5"];
    case 8:
      // Artık akorda ♯5 (C+ üstünde Sol#), diğerlerinde ♭13 (C7 üstünde La♭)
      return iv.includes(8) ? [4, "♯5"] : [5, "♭13"];
    case 9:
      // Eksik 7'li (dim7) 𝄫7, 6'lı akorda 6, diğerlerinde 13
      if (iv.includes(9) && iv.includes(6) && iv.includes(3)) return [6, "𝄫7"];
      return [5, iv.includes(9) && !iv.includes(10) && !iv.includes(11) ? "6" : "13"];
    case 10:
      return [6, "♭7"];
    default:
      return [6, "7"];
  }
}

/** Sesin akora göre yazımı ve derecesi: harf, akorun kök harfinden derece sayılarak bulunur. */
export function akoraGore(midi: number, a: AkorBilgi): Yazim & { derece: string } {
  const [adim, derece] = aralik(pc(midi - a.kok), a.iv);
  const kokHarf = a.ad.trim()[0] as Harf;
  const i = HARFLER.indexOf(kokHarf);
  const y = i >= 0 ? harfle(HARFLER[(i + adim) % 7], midi) : null;
  return { ...(y ?? yalinYazim(midi)), derece };
}

// ── Tona göre (transkripsiyon) ───────────────────────────────────────────────
/** alphaTab NoteAccidentalMode: 3 diyez, 4 çift diyez, 5 bemol, 6 çift bemol; 0 donanıma göre */
const ZORLA: Record<number, number> = { 3: 1, 4: 2, 5: -1, 6: -2 };

/** Notadaki yazım: zorlanmış arıza varsa ona, yoksa donanımın yönüne göre (ks < 0 bemollü, aksi diyezli) */
export function tonaGore(midi: number, ks = 0, accidentalMode = 0): Yazim {
  const z = ZORLA[accidentalMode];
  if (z !== undefined) {
    const h = HARFLER.find((x) => pc(HARF_PC[x] + z) === pc(midi));
    if (h) return harfle(h, midi)!;
  }
  // Donanımdaki sesler donanımın harfiyle: Fa majörde Si♭, Re majörde Fa# ve Do#
  const diyezler = ["F", "C", "G", "D", "A", "E", "B"] as Harf[];
  const bemoller = ["B", "E", "A", "D", "G", "C", "F"] as Harf[];
  const donanim = ks > 0 ? diyezler.slice(0, ks).map((h) => [h, 1] as const) : bemoller.slice(0, -ks).map((h) => [h, -1] as const);
  for (const [h, f] of donanim) if (pc(HARF_PC[h] + f) === pc(midi)) return harfle(h, midi)!;
  return yalinYazim(midi, ks < 0);
}
