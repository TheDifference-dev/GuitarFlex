/** General MIDI gitar programları (0'dan) */
export const GITAR_PROGRAMI = { naylon: 24, celik: 25, temiz: 27, overdrive: 29, distortion: 30 } as const;

/**
 * Dersin ton ipucundan ("Ton: yüksek gain (7/10) …", "Ton ve eşlik: temiz, boyun pikabı …") oynatıcının
 * gitar sesini seçer. Ton ipucu yoksa temiz elektro gitar (uygulama elektro gitar odaklı; alphaTab'ın varsayılanı çelik telli akustiktir).
 * "Ton: Sol majör …" gibi tonalite ipuçları dikkate alınmaz.
 */
export function gitarProgrami(tips: string[] | undefined): number | undefined {
  const ipucu = tips?.find((t) => /^Ton( ve eşlik)?:/.test(t) && !/^Ton: [A-ZÇĞİÖŞÜa-zçğıöşü]+ (majör|minör)/.test(t));
  if (!ipucu) return GITAR_PROGRAMI.temiz;
  const ton = ipucu.replace(/^Ton( ve eşlik)?:\s*/, "").toLocaleLowerCase("tr");
  if (/^(temiz|clean)/.test(ton)) return GITAR_PROGRAMI.temiz;
  // "gain (6–7/10)" → 7, "gain 4/10" → 4
  const m = ton.match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*\/\s*10/);
  const gain = m ? Number(m[2] ?? m[1]) : null;
  const surus = /overdrive|crunch/.test(ton);
  if (gain !== null) {
    if (gain >= 7 || (gain >= 6 && !surus)) return GITAR_PROGRAMI.distortion;
    if (gain >= 3) return GITAR_PROGRAMI.overdrive;
    return GITAR_PROGRAMI.temiz;
  }
  if (/yüksek gain|distortion|metal/.test(ton)) return GITAR_PROGRAMI.distortion;
  if (surus || /gain/.test(ton)) return GITAR_PROGRAMI.overdrive;
  return undefined;
}
