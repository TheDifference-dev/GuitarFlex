// Beşliler çemberi: saat yönünde her adım tam beşli yukarı (bir diyez fazla ya da bir bemol eksik).
// İç halka paralel minör tonlar (aynı donanım). donanim: diyez (+) / bemol (−) sayısı; 6 ve −6 enarmoniktir.
export const BESLILER: { major: string; minor: string; donanim: number; enarmonik?: { major: string; minor: string; donanim: number } }[] = [
  { major: "C", minor: "A", donanim: 0 },
  { major: "G", minor: "E", donanim: 1 },
  { major: "D", minor: "B", donanim: 2 },
  { major: "A", minor: "F#", donanim: 3 },
  { major: "E", minor: "C#", donanim: 4 },
  { major: "B", minor: "G#", donanim: 5 },
  { major: "F#", minor: "D#", donanim: 6, enarmonik: { major: "Gb", minor: "Eb", donanim: -6 } },
  { major: "Db", minor: "Bb", donanim: -5 },
  { major: "Ab", minor: "F", donanim: -4 },
  { major: "Eb", minor: "C", donanim: -3 },
  { major: "Bb", minor: "G", donanim: -2 },
  { major: "F", minor: "D", donanim: -1 },
];
